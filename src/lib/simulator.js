export const SUPPLY_FACTORS = Object.freeze({
  Monofásico: 30,
  Bifásico: 50,
  Trifásico: 100,
});

export function getSupplyFactor(tipoFornecimento) {
  return SUPPLY_FACTORS[tipoFornecimento] ?? null;
}

export function parseMoneyInput(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  if (!value) return 0;

  const raw = String(value)
    .replace(/R\$/gi, '')
    .replace(/\s/g, '')
    .replace(/[^0-9,.-]/g, '');

  if (!raw) return 0;

  const lastComma = raw.lastIndexOf(',');
  const lastDot = raw.lastIndexOf('.');
  let normalized = raw;

  if (lastComma !== -1 && lastDot !== -1) {
    const decimalIsComma = lastComma > lastDot;
    normalized = decimalIsComma
      ? raw.replace(/\./g, '').replace(',', '.')
      : raw.replace(/,/g, '');
  } else if (lastComma !== -1) {
    normalized = raw.replace(/\./g, '').replace(',', '.');
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function formatBRL(value) {
  if (!Number.isFinite(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value) {
  if (!Number.isFinite(value)) return '0,00%';
  return `${value.toFixed(2).replace('.', ',')}%`;
}

export function simulateSavings({
  valorFatura,
  consumo,
  tipoFornecimento,
  tensaoNominal,
  adicionalBandeira,
  rural = false,
}) {
  const fatorFornecimento = getSupplyFactor(tipoFornecimento);

  if (!fatorFornecimento) {
    return { ok: false, code: 'INVALID_SUPPLY_TYPE', message: 'Selecione um tipo de fornecimento válido.' };
  }

  if (!Number.isFinite(valorFatura) || valorFatura <= 0) {
    return { ok: false, code: 'INVALID_BILL', message: 'O valor da fatura precisa ser maior que zero.' };
  }

  if (!Number.isFinite(consumo) || consumo <= 0) {
    return { ok: false, code: 'INVALID_CONSUMPTION', message: 'O consumo precisa ser maior que zero.' };
  }

  if (!Number.isFinite(tensaoNominal) || tensaoNominal <= 0) {
    return { ok: false, code: 'INVALID_VOLTAGE', message: 'Informe uma tensão nominal válida.' };
  }

  if (tensaoNominal > 500) {
    return {
      ok: false,
      code: 'HIGH_VOLTAGE',
      message: 'Não é possível associar esta conta à AGEL, pois o fornecimento é em alta tensão (acima de 500 V).',
    };
  }

  if (!Number.isFinite(adicionalBandeira) || adicionalBandeira < 0) {
    return { ok: false, code: 'INVALID_FLAG', message: 'O adicional de bandeira não pode ser negativo.' };
  }

  if (consumo <= fatorFornecimento) {
    return {
      ok: false,
      code: 'RULE_NOT_DEFINED',
      message:
        'O consumo informado é igual ou inferior ao fator mínimo do tipo de fornecimento. A regra de negócio para esse cenário ainda precisa ser definida.',
    };
  }

  const percentualBandeira = fatorFornecimento / consumo;
  const restituicaoBandeira = adicionalBandeira * (1 - percentualBandeira);
  const abatimentoEnergia = (consumo - fatorFornecimento) * 0.92;
  const valorResidualRGE = valorFatura - restituicaoBandeira - abatimentoEnergia;
  const valorFaturaAgel = abatimentoEnergia * 0.8;
  const descontoTotal = restituicaoBandeira + abatimentoEnergia * 0.2;
  const economiaPercentual = (descontoTotal / valorFatura) * 100;

  const values = [
    percentualBandeira,
    restituicaoBandeira,
    abatimentoEnergia,
    valorResidualRGE,
    valorFaturaAgel,
    descontoTotal,
    economiaPercentual,
  ];

  if (values.some((value) => !Number.isFinite(value))) {
    return {
      ok: false,
      code: 'NON_FINITE_RESULT',
      message: 'Não foi possível gerar uma estimativa consistente com os dados informados.',
    };
  }

  if ([valorResidualRGE, valorFaturaAgel, descontoTotal].some((value) => value < 0)) {
    return {
      ok: false,
      code: 'NEGATIVE_RESULT',
      message:
        'Os dados informados produziram um resultado incompatível com a regra disponível. Revise a fatura ou solicite uma análise da AGEL.',
    };
  }

  return {
    ok: true,
    fatorFornecimento,
    percentualBandeira,
    restituicaoBandeira,
    abatimentoEnergia,
    valorResidualRGE,
    valorFaturaAgel,
    descontoTotal,
    economiaPercentual,
    rural,
  };
}
