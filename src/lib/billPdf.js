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

export function parseRgeBillText(rawText) {
  const text = normalizeText(rawText);

  const valorFatura = parseBrazilianNumber(firstMatch(text, [
    /\b\d{2}\/\d{2}\/\d{4}\s+R\$\s*([\d.]+,\d{2})\b/i,
    /\bR\$\s*([\d.]+,\d{2})\b/i,
  ]));

  const consumo = parseBrazilianNumber(firstMatch(text, [
    /Consumo Uso Sistema\s*\[?KWh\]?[^]*?\bkWh\s+([\d.]+,\d{4})\b/i,
    /Energia Ativa-kWh[^]*?\b([\d.]+(?:,\d+)?)\s*$/i,
  ]));

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
    pages.push(content.items.map((item) => item.str).join(' '));
  }

  const text = pages.join('\n');
  if (text.replace(/\s/g, '').length < 80) {
    throw new Error('Este PDF parece ser uma imagem e não contém texto legível. Preencha os dados manualmente.');
  }

  const fields = parseRgeBillText(text);
  const found = Object.values(fields).filter((value) => value !== null && value !== false).length;
  if (found < 3) {
    throw new Error('Não consegui identificar os dados principais desta conta. Preencha os campos manualmente.');
  }

  return fields;
}
