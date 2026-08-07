import React, { useMemo, useState } from 'react';
import BillGuideModal from './BillGuideModal';
import Icon from './Icon';
import {
  formatBRL,
  formatPercent,
  parseMoneyInput,
  simulateSavings,
} from '../lib/simulator';
import { readRgeBillPdf } from '../lib/billPdf';

const initialForm = {
  valorFatura: '',
  consumo: '',
  tipoFornecimento: '',
  tensaoNominal: '',
  rural: false,
  adicionalBandeira: '',
};

function formatInputNumber(value, decimals = 2) {
  if (!Number.isFinite(value)) return '';
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: decimals !== 0,
  });
}

function parseMetricInput(value) {
  const raw = String(value ?? '').trim().replace(/[^0-9,.-]/g, '');
  if (!raw) return 0;
  if (raw.includes(',')) return Number(raw.replace(/\./g, '').replace(',', '.'));
  if (/^-?\d{1,3}(\.\d{3})+$/.test(raw)) return Number(raw.replace(/\./g, ''));
  return Number(raw);
}

function FieldError({ id, children }) {
  if (!children) return null;
  return <p className="field-error" id={id}>{children}</p>;
}

export default function Simulator() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showBillGuide, setShowBillGuide] = useState(false);
  const [pdfState, setPdfState] = useState({ status: 'idle', message: '', fileName: '', hasInjectedEnergy: false });

  const parsed = useMemo(() => ({
    valorFatura: parseMoneyInput(form.valorFatura),
    consumo: parseMetricInput(form.consumo),
    tensaoNominal: parseMetricInput(form.tensaoNominal),
    adicionalBandeira: parseMoneyInput(form.adicionalBandeira),
  }), [form]);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined, general: undefined }));
    setResult(null);
  }

  async function handlePdfUpload(event) {
    const [file] = event.target.files;
    if (!file) return;

    setPdfState({ status: 'reading', message: 'Lendo sua conta com segurança…', fileName: file.name, hasInjectedEnergy: false });
    setErrors({});
    setResult(null);

    try {
      const fields = await readRgeBillPdf(file);
      setForm((current) => ({
        ...current,
        valorFatura: fields.valorFatura === null ? current.valorFatura : formatInputNumber(fields.valorFatura),
        consumo: fields.consumo === null ? current.consumo : formatInputNumber(fields.consumo, 0),
        tipoFornecimento: fields.tipoFornecimento ?? current.tipoFornecimento,
        tensaoNominal: fields.tensaoNominal === null ? current.tensaoNominal : formatInputNumber(fields.tensaoNominal, 0),
        adicionalBandeira: formatInputNumber(fields.adicionalBandeira ?? 0),
        rural: fields.rural,
      }));

      const isHighVoltage = Number(fields.tensaoNominal) > 500;
      setPdfState({
        status: isHighVoltage ? 'ineligible' : fields.hasInjectedEnergy ? 'warning' : 'success',
        message: isHighVoltage
          ? 'Conta identificada como alta tensão. Esta unidade não pode ser associada à AGEL.'
          : fields.hasInjectedEnergy
            ? 'Esta conta já apresenta créditos de energia injetada. Os dados foram preenchidos, mas o resultado pode exigir análise da AGEL.'
          : 'Dados encontrados! Confira os campos antes de calcular.',
        fileName: file.name,
        hasInjectedEnergy: fields.hasInjectedEnergy,
      });
    } catch (error) {
      setPdfState({ status: 'error', message: error.message, fileName: file.name, hasInjectedEnergy: false });
    } finally {
      event.target.value = '';
    }
  }

  function validate() {
    const next = {};
    if (!Number.isFinite(parsed.valorFatura) || parsed.valorFatura <= 0) {
      next.valorFatura = 'Informe um valor de fatura maior que zero.';
    }
    if (!Number.isFinite(parsed.consumo) || parsed.consumo <= 0) {
      next.consumo = 'Informe um consumo maior que zero.';
    }
    if (!form.tipoFornecimento) {
      next.tipoFornecimento = 'Selecione o tipo de fornecimento.';
    }
    if (!Number.isFinite(parsed.tensaoNominal) || parsed.tensaoNominal <= 0) {
      next.tensaoNominal = 'Informe a tensão nominal da conta.';
    } else if (parsed.tensaoNominal > 500) {
      next.general = 'Não é possível associar esta conta à AGEL, pois o fornecimento é em alta tensão (acima de 500 V).';
    }
    if (!Number.isFinite(parsed.adicionalBandeira) || parsed.adicionalBandeira < 0) {
      next.adicionalBandeira = 'O adicional de bandeira não pode ser negativo.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setShowDetails(false);
    if (!validate()) return;

    const calculation = simulateSavings({
      valorFatura: parsed.valorFatura,
      consumo: parsed.consumo,
      tipoFornecimento: form.tipoFornecimento,
      tensaoNominal: parsed.tensaoNominal,
      adicionalBandeira: parsed.adicionalBandeira,
      rural: form.rural,
    });

    if (!calculation.ok) {
      const message = calculation.code === 'NEGATIVE_RESULT' && pdfState.hasInjectedEnergy
        ? 'Esta conta já contém compensação de energia injetada e não pode ser recalculada pela fórmula inicial. Solicite uma análise da AGEL.'
        : calculation.message;
      setErrors({ general: message });
      setResult(null);
      return;
    }

    setErrors({});
    setResult(calculation);

    requestAnimationFrame(() => {
      document.getElementById('resultado-simulacao')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  const isFormVisuallyComplete =
    form.valorFatura.trim() &&
    form.consumo.trim() &&
    form.tipoFornecimento &&
    form.tensaoNominal.trim() &&
    form.adicionalBandeira.trim() &&
    !(parsed.tensaoNominal > 500);

  return (
    <section className="section simulator-section" id="simulador">
      <div className="container">
        <div className="section-heading simulator-heading" data-reveal>
          <span className="eyebrow"><Icon name="coins" size={18} /> Simulador de Economia AGEL</span>
          <h2>Simule sua economia</h2>
          <p>Preencha os dados da sua conta de energia e veja uma estimativa de quanto você pode economizar com a AGEL.</p>
        </div>

        <div className="simulator-shell">
          <form className="simulator-form" onSubmit={handleSubmit} noValidate data-reveal="left">
            <div className="form-topline">
              <div>
                <h3>Dados da sua conta</h3>
                <p>Leva menos de um minuto.</p>
              </div>
              <button className="text-link" type="button" onClick={() => setShowBillGuide(true)}>
                <Icon name="info" size={18} /> Onde encontro esses dados?
              </button>
            </div>

            <div className="pdf-upload-block">
              <div className="pdf-upload-copy">
                <span className="pdf-icon"><Icon name="document" size={24} /></span>
                <div>
                  <strong>Preencher com a conta em PDF</strong>
                  <span>Valor, consumo, fornecimento, tensão e bandeira são buscados automaticamente.</span>
                </div>
              </div>
              <label className="upload-button">
                <input type="file" accept="application/pdf,.pdf" onChange={handlePdfUpload} disabled={pdfState.status === 'reading'} />
                {pdfState.status === 'reading' ? 'Lendo PDF…' : 'Escolher PDF'}
              </label>
            </div>
            {pdfState.status !== 'idle' && (
              <div className={`pdf-status ${pdfState.status}`} role="status">
                <Icon name={pdfState.status === 'success' ? 'check' : 'info'} size={19} />
                <div><strong>{pdfState.fileName}</strong><span>{pdfState.message}</span></div>
              </div>
            )}
            <p className="privacy-note"><Icon name="shield" size={15} /> O PDF é processado somente no seu navegador e não é enviado para nenhum servidor.</p>

            <div className="manual-divider"><span>ou preencha manualmente</span></div>

            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="valor-fatura">Valor da fatura</label>
                <div className={`input-shell ${errors.valorFatura ? 'has-error' : ''}`}>
                  <span className="prefix">R$</span>
                  <input
                    id="valor-fatura"
                    value={form.valorFatura}
                    onChange={(e) => updateField('valorFatura', e.target.value)}
                    inputMode="decimal"
                    placeholder="0,00"
                    aria-describedby={errors.valorFatura ? 'valor-fatura-error' : undefined}
                    aria-invalid={Boolean(errors.valorFatura)}
                  />
                </div>
                <FieldError id="valor-fatura-error">{errors.valorFatura}</FieldError>
              </div>

              <div className="field-group">
                <label htmlFor="consumo">Consumo</label>
                <div className={`input-shell ${errors.consumo ? 'has-error' : ''}`}>
                  <input
                    id="consumo"
                    value={form.consumo}
                    onChange={(e) => updateField('consumo', e.target.value)}
                    inputMode="decimal"
                    placeholder="Ex.: 141"
                    aria-describedby={errors.consumo ? 'consumo-error' : undefined}
                    aria-invalid={Boolean(errors.consumo)}
                  />
                  <span className="suffix">kWh</span>
                </div>
                <FieldError id="consumo-error">{errors.consumo}</FieldError>
              </div>

              <div className="field-group">
                <label htmlFor="tipo-fornecimento">Tipo de fornecimento</label>
                <div className={`input-shell select-shell ${errors.tipoFornecimento ? 'has-error' : ''}`}>
                  <select
                    id="tipo-fornecimento"
                    value={form.tipoFornecimento}
                    onChange={(e) => updateField('tipoFornecimento', e.target.value)}
                    aria-describedby={errors.tipoFornecimento ? 'tipo-fornecimento-error' : undefined}
                    aria-invalid={Boolean(errors.tipoFornecimento)}
                  >
                    <option value="">Selecione</option>
                    <option>Monofásico</option>
                    <option>Bifásico</option>
                    <option>Trifásico</option>
                  </select>
                </div>
                <FieldError id="tipo-fornecimento-error">{errors.tipoFornecimento}</FieldError>
              </div>

              <div className="field-group">
                <label htmlFor="adicional-bandeira">Adicional de bandeira</label>
                <div className={`input-shell ${errors.adicionalBandeira ? 'has-error' : ''}`}>
                  <span className="prefix">R$</span>
                  <input
                    id="adicional-bandeira"
                    value={form.adicionalBandeira}
                    onChange={(e) => updateField('adicionalBandeira', e.target.value)}
                    inputMode="decimal"
                    placeholder="0,00"
                    aria-describedby={errors.adicionalBandeira ? 'adicional-bandeira-error' : undefined}
                    aria-invalid={Boolean(errors.adicionalBandeira)}
                  />
                </div>
                <FieldError id="adicional-bandeira-error">{errors.adicionalBandeira}</FieldError>
              </div>

              <div className="field-group full-field">
                <label htmlFor="tensao-nominal">Tensão nominal disponível</label>
                <div className={`input-shell ${errors.tensaoNominal ? 'has-error' : ''}`}>
                  <input
                    id="tensao-nominal"
                    value={form.tensaoNominal}
                    onChange={(e) => updateField('tensaoNominal', e.target.value)}
                    inputMode="decimal"
                    placeholder="Ex.: 220"
                    aria-describedby={errors.tensaoNominal ? 'tensao-nominal-error' : 'tensao-help'}
                    aria-invalid={Boolean(errors.tensaoNominal)}
                  />
                  <span className="suffix">V</span>
                </div>
                <span className="field-help" id="tensao-help">Na conta RGE, procure por “Tensão nominal em volts — Disp.”</span>
                <FieldError id="tensao-nominal-error">{errors.tensaoNominal}</FieldError>
              </div>
            </div>

            {parsed.tensaoNominal > 500 && (
              <div className="eligibility-alert" role="alert">
                <Icon name="info" size={22} />
                <div><strong>Esta conta não pode ser associada à AGEL</strong><span>O fornecimento informado é em alta tensão, acima do limite de 500 V.</span></div>
              </div>
            )}

            <div className="rural-row">
              <div>
                <strong>Unidade rural?</strong>
                <span>Ative apenas se esta conta for de uma unidade rural.</span>
              </div>
              <label className="switch" aria-label="Unidade rural">
                <input
                  type="checkbox"
                  checked={form.rural}
                  onChange={(e) => updateField('rural', e.target.checked)}
                />
                <span className="switch-track"><span className="switch-thumb" /></span>
              </label>
            </div>
            {form.rural && (
              <div className="inline-notice" role="status">
                <Icon name="info" size={19} />
                <span>A estimativa usa a mesma fórmula-base. A elegibilidade rural será confirmada pela equipe AGEL.</span>
              </div>
            )}

            {errors.general && <div className="form-alert" role="alert">{errors.general}</div>}

            <button className="primary-button calculator-button" type="submit" disabled={!isFormVisuallyComplete}>
              <Icon name="chart" size={20} /> Calcular minha economia
            </button>

            <p className="form-footnote">Sem cadastro. A simulação é exibida imediatamente nesta página.</p>
          </form>

          <aside className="simulator-sidecard" data-reveal="right">
            <div className="sidecard-brand"><img src="/assets/agel-logo.png" alt="AGEL" /></div>
            <span className="sidecard-icon"><Icon name="leaf" size={25} /></span>
            <h3>Energia limpa, economia prática</h3>
            <p>Use os dados da sua fatura para estimar o impacto mensal antes de conversar com a equipe.</p>
            <ul className="check-list compact">
              <li><Icon name="check" size={18} /> Sem instalação de placas no imóvel</li>
              <li><Icon name="check" size={18} /> Visualização clara do residual e da AGEL</li>
              <li><Icon name="check" size={18} /> Cálculo sem recarregar a página</li>
              <li><Icon name="check" size={18} /> Leitura automática da conta RGE em PDF</li>
            </ul>
            <div className="mini-equation">
              <span>Conta atual</span><b>→</b><span>RGE + AGEL</span><b>→</b><strong>Economia</strong>
            </div>
          </aside>
        </div>

        {result && (
          <div className="results-area" id="resultado-simulacao" aria-live="polite">
            <div className="result-hero-card">
              <div>
                <span className="result-kicker">Sua economia estimada</span>
                <strong>{formatBRL(result.descontoTotal)} <small>por mês</small></strong>
                <p>{formatPercent(result.economiaPercentual)} de economia estimada</p>
              </div>
              <div className="result-badge"><Icon name="leaf" size={28} /> Estimativa AGEL</div>
            </div>

            <div className="result-grid">
              <div className="result-card">
                <span>Valor estimado para a RGE</span>
                <strong>{formatBRL(result.valorResidualRGE)}</strong>
                <small>Parcela residual estimada</small>
              </div>
              <div className="result-card">
                <span>Fatura estimada AGEL</span>
                <strong>{formatBRL(result.valorFaturaAgel)}</strong>
                <small>Parcela estimada da associação</small>
              </div>
              <div className="result-card accent-result">
                <span>Economia estimada</span>
                <strong>{formatBRL(result.descontoTotal)}</strong>
                <small>Redução estimada no mês</small>
              </div>
            </div>

            {result.rural && (
              <div className="result-rural-note"><Icon name="info" size={18} /> Esta é uma estimativa rural pela fórmula-base. A equipe AGEL fará a confirmação final da unidade.</div>
            )}

            <button className="details-toggle" type="button" onClick={() => setShowDetails((value) => !value)} aria-expanded={showDetails}>
              {showDetails ? 'Ocultar detalhes do cálculo' : 'Ver detalhes do cálculo'}
              <span aria-hidden="true">{showDetails ? '−' : '+'}</span>
            </button>

            {showDetails && (
              <div className="calculation-details">
                <div><span>Fator utilizado</span><strong>{result.fatorFornecimento}</strong></div>
                <div><span>Percentual da bandeira</span><strong>{formatPercent(result.percentualBandeira * 100)}</strong></div>
                <div><span>Restituição da bandeira</span><strong>{formatBRL(result.restituicaoBandeira)}</strong></div>
                <div><span>Abatimento da energia injetada</span><strong>{formatBRL(result.abatimentoEnergia)}</strong></div>
              </div>
            )}

            <div className="result-cta-row">
              <div>
                <strong>Gostou da estimativa?</strong>
                <span>Converse com a AGEL para avaliar sua unidade consumidora.</span>
              </div>
              <a className="primary-button" href="#contato">Quero me associar <Icon name="arrow" size={19} /></a>
            </div>

            <p className="disclaimer">
              Esta simulação é apenas uma estimativa. Os valores finais podem variar conforme as características da unidade consumidora, tarifas, impostos e condições aplicáveis.
            </p>
          </div>
        )}
      </div>
      <BillGuideModal open={showBillGuide} onClose={() => setShowBillGuide(false)} />
    </section>
  );
}
