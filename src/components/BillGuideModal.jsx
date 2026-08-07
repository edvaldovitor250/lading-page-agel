import React, { useEffect, useRef } from 'react';
import Icon from './Icon';

export default function BillGuideModal({ open, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bill-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">Guia visual</span>
            <h3 id="bill-modal-title">Onde encontrar os dados na sua conta</h3>
          </div>
          <button ref={closeRef} className="icon-button" type="button" aria-label="Fechar" onClick={onClose}>
            <Icon name="close" size={24} />
          </button>
        </div>

        <p className="modal-copy">
          Exemplo ilustrativo. Dados pessoais foram propositalmente ocultados. Confira a nomenclatura da sua concessionária.
        </p>

        <div className="invoice-demo" aria-label="Exemplo ilustrativo de fatura de energia">
          <div className="invoice-topline">
            <div className="invoice-brand">CONCESSIONÁRIA</div>
            <div className="invoice-code blur-line">000000000000000</div>
          </div>
          <div className="invoice-grid">
            <div className="invoice-panel">
              <span className="invoice-label">Cliente</span>
              <div className="blur-line wide" />
              <div className="blur-line medium" />
            </div>
            <div className="invoice-panel callout c1">
              <span>1</span>
              <div><strong>Valor da fatura</strong><b>R$ 165,90</b></div>
            </div>
            <div className="invoice-panel callout c2">
              <span>2</span>
              <div><strong>Consumo em kWh</strong><b>141 kWh</b></div>
            </div>
            <div className="invoice-panel callout c3">
              <span>3</span>
              <div><strong>Tipo de fornecimento</strong><b>Monofásico</b></div>
            </div>
            <div className="invoice-panel details-panel">
              <span className="invoice-label">Detalhamento</span>
              <div className="fake-row"><i /> <em /></div>
              <div className="fake-row"><i /> <em /></div>
              <div className="fake-row"><i /> <em /></div>
              <div className="fake-row"><i /> <em /></div>
            </div>
            <div className="invoice-panel callout c4">
              <span>4</span>
              <div><strong>Adicional de bandeira</strong><b>R$ 3,36</b></div>
            </div>
          </div>
          <div className="invoice-footer blur-line" />
        </div>
      </div>
    </div>
  );
}
