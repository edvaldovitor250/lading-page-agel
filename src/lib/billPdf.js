let pdfjsPromise;

function loadPdfJs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist/build/pdf.mjs').then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString();
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

function normalizeText(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseBrazilianNumber(value) {
  if (!value) return null;
  const normalized = value.replace(/\./g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function firstMatch(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

const MONTH_NAMES = 'JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ';
const HISTORY_START = /(?:Consumo\s*\/\s*kWh|Historico\s+(?:de\s+)?Consumo)/i;
const HISTORY_END = /(?:Bandeiras?\s+Tarifarias?|Indicadores?\s+de\s+Continuidade|Reservado\s+ao\s+Fisco)/i;

/**
 * Extrai somente as linhas do quadro de historico de consumo. Limitar a busca
 * a esse quadro evita confundir meses presentes na descricao das tarifas com
 * os meses usados no calculo da media.
 */
export function parseConsumptionHistory(rawText) {
  const lines = String(rawText ?? '')
    .split(/\r?\n/)
    .map((line) => normalizeText(line))
    .filter(Boolean);
  const startIndex = lines.findIndex((line) => HISTORY_START.test(line));

  if (startIndex === -1) return [];

  const sectionLines = [];
  for (let index = startIndex; index < lines.length && sectionLines.length < 24; index += 1) {
    const line = lines[index];
    if (index > startIndex && HISTORY_END.test(line)) break;
    sectionLines.push(line);
  }

  const section = sectionLines.join('\n');
  const monthPattern = new RegExp(`\\b(${MONTH_NAMES})\\s*[\\/.-]?\\s*(\\d{2}|\\d{4})\\b`, 'gi');
  const matches = Array.from(section.matchAll(monthPattern));
  const history = [];
  const seenMonths = new Set();

  matches.forEach((match, index) => {
    const segmentStart = match.index + match[0].length;
    const segmentEnd = matches[index + 1]?.index ?? section.length;
    const segment = section.slice(segmentStart, segmentEnd);
    const numberMatch = segment.match(/\b(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d+)?\b/);
    const value = parseBrazilianNumber(numberMatch?.[0]);
    const monthKey = `${match[1].toUpperCase()}-${match[2]}`;

    if (Number.isFinite(value) && value > 0 && !seenMonths.has(monthKey)) {
      seenMonths.add(monthKey);
      history.push({ month: match[1].toUpperCase(), year: match[2], value });
    }
  });

  return history;
}

function calculateAverage(values) {
  if (!values.length) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function parseRgeBillText(rawText) {
  const text = normalizeText(rawText);

  const valorFatura = parseBrazilianNumber(firstMatch(text, [
    /\b\d{2}\/\d{2}\/\d{4}\s+R\$\s*([\d.]+,\d{2})\b/i,
    /\bR\$\s*([\d.]+,\d{2})\b/i,
  ]));

  const consumoAtual = parseBrazilianNumber(firstMatch(text, [
    /Consumo Uso Sistema\s*\[?KWh\]?[^]*?\bkWh\s+([\d.]+,\d{4})\b/i,
    /Energia Ativa-kWh[^]*?\b([\d.]+(?:,\d+)?)\s*$/i,
  ]));

  const historicoConsumo = parseConsumptionHistory(rawText);
  const consumoMedio = calculateAverage(historicoConsumo.map(({ value }) => value));
  const consumo = consumoMedio ?? consumoAtual;

  const tipoRaw = firstMatch(text, [
    /Tipo de Fornecimento\s*:?\s*(Monofasico|Bifasico|Trifasico)\b/i,
  ]);
  const supplyTypes = {
    monofasico: 'Monofásico',
    bifasico: 'Bifásico',
    trifasico: 'Trifásico',
  };
  const tipoFornecimento = tipoRaw ? supplyTypes[tipoRaw.toLowerCase()] : null;

  const tensaoNominal = parseBrazilianNumber(firstMatch(text, [
    /TENSAO NOMINAL EM VOLTS\s+Disp\.?\s*:\s*([\d.,]+)/i,
    /Tensao Nominal[^]*?([\d.,]+)\s*V\b/i,
  ]));

  const adicionalBandeira = parseBrazilianNumber(firstMatch(text, [
    /Adicional de Bandeira[^]*?\bkWh\s+([\d.]+,\d{2})\b/i,
  ])) ?? 0;

  const rural = /Classificacao\s*:[^]*?\bRural\b/i.test(text.slice(0, 1400));
  const hasInjectedEnergy = /Energ(?:ia)?\s+Atv\s+Inj|Energia\s+Injetada/i.test(text);

  return {
    valorFatura,
    consumo,
    consumoMedio,
    mesesConsumo: historicoConsumo.length,
    historicoConsumo,
    tipoFornecimento,
    tensaoNominal,
    adicionalBandeira,
    rural,
    hasInjectedEnergy,
  };
}

export async function readRgeBillPdf(file) {
  const isPdf = file && (file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf'));
  if (!isPdf) {
    throw new Error('Selecione um arquivo PDF válido.');
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error('O PDF deve ter no máximo 12 MB.');
  }

  const data = new Uint8Array(await file.arrayBuffer());
  const pdfjs = await loadPdfJs();
  const document = await pdfjs.getDocument({ data }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const rows = new Map();

    content.items.forEach((item) => {
      const y = Math.round((item.transform?.[5] ?? 0) / 2) * 2;
      if (!rows.has(y)) rows.set(y, []);
      rows.get(y).push({ x: item.transform?.[4] ?? 0, text: item.str });
    });

    const pageText = Array.from(rows.entries())
      .sort(([firstY], [secondY]) => secondY - firstY)
      .map(([, items]) => items
        .sort((first, second) => first.x - second.x)
        .map(({ text }) => text)
        .join(' '))
      .join('\n');
    pages.push(pageText);
  }

  const text = pages.join('\n');
  if (text.replace(/\s/g, '').length < 80) {
    throw new Error('Este PDF parece ser uma imagem e não contém texto legível. Preencha os dados manualmente.');
  }

  const fields = parseRgeBillText(text);
  const found = [
    fields.valorFatura,
    fields.consumo,
    fields.tipoFornecimento,
    fields.tensaoNominal,
  ].filter((value) => value !== null).length;
  if (found < 3) {
    throw new Error('Não consegui identificar os dados principais desta conta. Preencha os campos manualmente.');
  }

  return fields;
}
