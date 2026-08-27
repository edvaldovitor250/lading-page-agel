import test from 'node:test';
import assert from 'node:assert/strict';
import { parseConsumptionHistory, parseRgeBillText } from './billPdf.js';

const billHeader = `
Tipo de Fornecimento: Trifásico
TENSÃO NOMINAL EM VOLTS Disp.: 220 Lim. mín.: 202
`;

test('calcula a média usando todos os meses encontrados no PDF', () => {
  const text = `${billHeader}
Consumo / kWh
Consumo faturado Nº dias
AGO 26 2.121 32
JUL 26 1540 30
JUN 26 1.694 30
Bandeiras Tarifárias`;

  const parsed = parseRgeBillText(text);

  assert.equal(parsed.mesesConsumo, 3);
  assert.equal(parsed.consumoMedio, (2121 + 1540 + 1694) / 3);
  assert.equal(parsed.consumo, parsed.consumoMedio);
});

test('divide somente pela quantidade variável de meses disponíveis', () => {
  const text = `${billHeader}
Histórico de Consumo
MAI/2026 200,0000 31
ABR/2026 100,0000 30
Indicadores de Continuidade`;

  assert.deepEqual(parseConsumptionHistory(text).map(({ value }) => value), [200, 100]);
  assert.equal(parseRgeBillText(text).consumo, 150);
});

test('ignora referências mensais fora do quadro de histórico', () => {
  const text = `Consumo - TE AGO/26 kWh 999,0000
Consumo / kWh
JUL 26 120 31
JUN 26 180 30
Bandeiras Tarifárias`;

  assert.deepEqual(parseConsumptionHistory(text).map(({ value }) => value), [120, 180]);
});
