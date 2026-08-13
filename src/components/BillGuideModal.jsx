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
          Use a fatura original da concessionária. Os dados pessoais do exemplo abaixo foram ocultados por segurança.
        </p>

        <a
          className="original-invoice-guide"
          href="/assets/fatura-original-anonimizada.png"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir a fatura original em tamanho maior"
        >
          <img
            src="/assets/fatura-original-anonimizada.png"
            alt="Fatura original da CPFL com marcações no valor total, consumo em kWh, tipo de fornecimento e adicional de bandeira"
          />
          <span><Icon name="document" size={17} /> Toque ou clique para ampliar a fatura</span>
        </a>

        <div className="bill-guide-legend" aria-label="Legenda dos dados da fatura">
          <div><b>1</b><span>Valor total da fatura</span></div>
          <div><b>2</b><span>Consumo em kWh</span></div>
          <div><b>3</b><span>Tipo de fornecimento</span></div>
          <div><b>4</b><span>Adicional de bandeira</span></div>
        </div>

        <p className="bill-guide-note">
          A posição dos campos pode variar conforme a concessionária, mas a nomenclatura costuma ser semelhante.
        </p>
      </div>
    </div>
  );
}
