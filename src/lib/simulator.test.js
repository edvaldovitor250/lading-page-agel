import test from 'node:test';
import assert from 'node:assert/strict';
import { simulateSavings } from './simulator.js';

const base = {
  valorFatura: 2500,
  consumo: 1000,
  tensaoNominal: 220,
  adicionalBandeira: 0,
};

for (const [tipoFornecimento, fator] of [
  ['Monofásico', 30],
  ['Bifásico', 50],
  ['Trifásico', 100],
]) {
  test(`desconta uma vez o fator ${fator} para fornecimento ${tipoFornecimento}`, () => {
    const result = simulateSavings({ ...base, tipoFornecimento });

    assert.equal(result.ok, true);
    assert.equal(result.abatimentoEnergia, (base.consumo - fator) * 0.92);
  });
}

test('usa a tarifa rural exata de R$ 0,80196 por kWh', () => {
  const result = simulateSavings({ ...base, tipoFornecimento: 'Trifásico', rural: true });

  assert.equal(result.ok, true);
  assert.equal(result.tarifaEnergia, 0.80196);
  assert.equal(result.abatimentoEnergia, (base.consumo - 100) * 0.80196);
});
