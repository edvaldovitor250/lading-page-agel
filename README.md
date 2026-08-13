# AGEL Landing Page + Simulador de Economia

Projeto front-end em React/Vite inspirado na identidade visual fornecida da AGEL, reorganizado para uma abordagem de conversão: economia primeiro, prova de autoridade, explicação visual, simulador, transparência da cobrança, impacto social, área para geradores, FAQ e CTA final.

## Como rodar

```bash
npm install
npm run dev
```

Para gerar o build de produção:

```bash
npm run build
```

## Estrutura principal

- `src/App.jsx`: estrutura completa da landing page.
- `src/components/Simulator.jsx`: interface e validações do simulador.
- `src/lib/simulator.js`: regras matemáticas separadas da camada visual.
- `src/components/BillGuideModal.jsx`: modal ilustrativo de onde encontrar os dados na fatura.
- `src/styles.css`: design system e responsividade.
- `public/assets/`: logo e recortes visuais derivados das imagens de referência enviadas.

## Fórmulas implementadas

A lógica segue exatamente a regra fornecida:

- Monofásico: fator 30
- Bifásico: fator 50
- Trifásico: fator 100
- `percentualBandeira = fatorFornecimento / consumo`
- `restituicaoBandeira = adicionalBandeira * (1 - percentualBandeira)`
- Unidade urbana: `tarifaEnergia = 0.92`
- Unidade rural: `tarifaEnergia = 0.81`
- `abatimentoEnergia = (consumo - fatorFornecimento) * tarifaEnergia`
- `valorResidualRGE = valorFatura - restituicaoBandeira - abatimentoEnergia`
- `valorFaturaAgel = abatimentoEnergia * 0.80`
- `descontoTotal = restituicaoBandeira + (abatimentoEnergia * 0.20)`
- `economiaPercentual = (descontoTotal / (valorFaturaAgel + descontoTotal)) * 100`

## Unidade rural

Quando a opção de unidade rural está ativa, o abatimento utiliza a tarifa de energia de R$ 0,81 por kWh. Nas demais unidades, utiliza R$ 0,92 por kWh.

## Cenário de validação

Para:

- Fatura: R$ 165,90
- Consumo: 141 kWh
- Tipo: Monofásico
- Bandeira: R$ 3,36

O cálculo retorna aproximadamente:

- Fator: 30
- Percentual da bandeira: 21,28%
- Restituição: R$ 2,65
- Abatimento: R$ 102,12
- Residual RGE: R$ 61,13
- Fatura AGEL: R$ 81,70
- Desconto total: R$ 23,07
- Economia: 13,91%

## Responsividade

O CSS inclui breakpoints específicos para desktop, tablet e mobile, com atenção a 320px, 375px, 390px e 430px. O simulador usa uma única coluna abaixo de 768px, sem largura fixa que provoque scroll horizontal.

## Próximas integrações sugeridas

1. Conectar formulário final ao WhatsApp/CRM.
2. Substituir os placeholders de depoimentos por vídeos reais.
3. Conectar estatísticas a uma API/painel administrativo.
4. Adicionar autenticação para a futura área do associado.
5. Adicionar páginas específicas de geradores, social, blog e SEO programático.
