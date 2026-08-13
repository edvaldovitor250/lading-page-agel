import React, { useEffect, useRef, useState } from 'react';
import Simulator from './components/Simulator';
import Icon from './components/Icon';

function useCountUp(end, suffix = '') {
  const ref = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    let frame;
    let started = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      const startedAt = performance.now();
      const duration = 1000;
      const animate = (now) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(end * eased));
        if (progress < 1) frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
      observer.disconnect();
    }, { threshold: 0.35 });

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [end]);

  return [ref, `${value.toLocaleString('pt-BR')}${suffix}`];
}

function Stat({ value, suffix, label, note, icon, delay = 0 }) {
  const [ref, display] = useCountUp(value, suffix);
  return (
    <div className="stat-card" ref={ref} data-reveal="scale" style={{ transitionDelay: `${delay}ms` }}>
      <span className="stat-icon"><Icon name={icon} size={22} /></span>
      <strong>{display}</strong>
      <span>{label}</span>
      {note && <small>{note}</small>}
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min((window.scrollY / total) * 100, 100) : 0);
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <header className={`site-header ${progress > 2 ? 'is-scrolled' : ''}`}>
      <div className="container header-inner">
        <a className="brand" href="#inicio" aria-label="AGEL - início">
          <span className="brand-symbol" aria-hidden="true"><img src="/assets/agel-logo-vertical.png" alt="" /></span>
          <span className="brand-name"><strong>AGEL</strong><small>Associação Gaúcha de Energia Limpa</small></span>
        </a>
        <button className="mobile-menu-button" type="button" aria-label="Abrir menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          <Icon name={open ? 'close' : 'menu'} size={26} />
        </button>
        <nav className={`main-nav ${open ? 'is-open' : ''}`} aria-label="Navegação principal">
          <a href="#como-funciona" onClick={() => setOpen(false)}>Como funciona</a>
          <a href="#simulador" onClick={() => setOpen(false)}>Simulador</a>
          <a href="#impacto" onClick={() => setOpen(false)}>Impacto</a>
          <a href="#localizacao" onClick={() => setOpen(false)}>Localização</a>
          <a href="#faq" onClick={() => setOpen(false)}>Dúvidas</a>
          <a href="#associe-se" onClick={() => setOpen(false)}>Associe-se agora</a>
          <a className="nav-cta" href="#contato" onClick={() => setOpen(false)}>Quero economizar</a>
        </nav>
      </div>
      <span className="scroll-progress" style={{ width: `${progress}%` }} aria-hidden="true" />
    </header>
  );
}

function ScrollCompanion() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 620);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <aside className={`scroll-companion ${visible ? 'is-visible' : ''}`} aria-label="Atalhos AGEL">
      <div className="companion-brand" aria-label="AGEL — Associação Gaúcha de Energia Limpa">
        <span className="companion-brand-symbol" aria-hidden="true"><img src="/assets/agel-symbol.png" alt="" /></span>
        <span className="companion-brand-copy"><strong>AGEL</strong><small>Associação Gaúcha de<br />Energia Limpa</small></span>
      </div>
      <div className="companion-copy"><strong>Quer descobrir sua economia?</strong><span>Envie a conta ou preencha os dados.</span></div>
      <div className="companion-actions">
        <a className="companion-whatsapp" href="https://wa.me/555421214007?text=Ol%C3%A1%2C%20quero%20saber%20mais%20sobre%20a%20AGEL." target="_blank" rel="noopener noreferrer">
          <Icon name="whatsapp" size={17} /> WhatsApp
        </a>
        <a className="companion-simulator" href="#simulador">Simule agora <Icon name="arrow" size={16} /></a>
      </div>
    </aside>
  );
}

const steps = [
  ['sun', '1', 'Usinas da AGEL geram energia', 'A geração solar acontece nas unidades geradoras vinculadas ao modelo.'],
  ['bolt', '2', 'A energia entra na rede', 'A energia produzida é injetada na rede da concessionária.'],
  ['document', '3', 'Créditos são compensados', 'Os créditos são direcionados para os associados cadastrados, conforme a operação e a unidade consumidora.'],
  ['coins', '4', 'Você visualiza a economia', 'No mínimo 20% da economia gerada fica para o associado. Nos períodos com bandeira tarifária, essa economia pode alcançar até 35%.'],
];

const faq = [
  ['Precisa instalar placas na minha casa ou empresa?', 'O modelo apresentado pela AGEL é de energia compartilhada, portanto a proposta não depende da instalação de placas no imóvel do associado.'],
  ['Existe mensalidade ou taxa de adesão?', 'Não. A AGEL não cobra nenhum tipo de mensalidade ou taxa de adesão.'],
  ['Por que continuo pagando a concessionária?', 'A concessionária continua responsável pelo transporte e pela entrega da energia até a sua unidade consumidora. Por isso, a taxa mínima de consumo e os impostos permanecem na fatura da concessionária. Já a cobrança da AGEL corresponde à energia compensada, conforme as condições da associação.'],
  ['Funciona para unidade rural?', 'Sim. Para unidades rurais, o simulador utiliza a tarifa de energia de R$ 0,81 por kWh. A elegibilidade e as condições finais são confirmadas pela equipe AGEL.'],
  ['Por que a economia varia?', 'Os associados da AGEL recebem integralmente a restituição da bandeira tarifária. Por isso, nos períodos em que a tarifa de energia está mais alta, o percentual de economia também aumenta, podendo chegar a 35%.'],
  ['Quem pode se associar à AGEL?', 'Todos os clientes com fornecimento de energia em baixa tensão podem se associar à AGEL.'],
  ['Como faço para me associar?', 'Na seção “Associe-se agora”, escolha Pessoa Física ou Pessoa Jurídica. O botão abre o documento correspondente para assinatura eletrônica segura pela ZapSign.'],
];

const audienceProfiles = [
  {
    id: 'residencias', icon: 'home', tab: 'Residências', title: 'Economia para sua casa',
    copy: 'Transforme o consumo mensal da sua residência em uma oportunidade de economizar com energia renovável compartilhada.',
    points: ['Sem obra ou placa no telhado', 'Simulação rápida pela conta RGE', 'Acompanhamento claro das cobranças'],
    link: '#simulador', cta: 'Simular minha residência',
  },
  {
    id: 'empresas', icon: 'building', tab: 'Empresas', title: 'Mais previsibilidade para sua empresa',
    copy: 'Reduza custos operacionais e associe sua marca a uma escolha ambientalmente responsável, sem investimento em estrutura própria.',
    points: ['Análise da unidade consumidora', 'Economia recorrente estimada', 'Energia limpa para o negócio'],
    link: '#contato', cta: 'Falar sobre minha empresa',
  },
  {
    id: 'condominios', icon: 'people', tab: 'Condomínios', title: 'Uma solução para consumo compartilhado',
    copy: 'A AGEL orienta síndicos e administradores na avaliação das unidades e na organização de uma jornada simples para o condomínio.',
    points: ['Atendimento consultivo', 'Clareza para múltiplas unidades', 'Sem intervenção na estrutura'],
    link: '#contato', cta: 'Avaliar meu condomínio',
  },
  {
    id: 'rural', icon: 'leaf', tab: 'Área rural', title: 'Energia limpa também no campo',
    copy: 'Faça uma estimativa inicial e envie a conta para a equipe confirmar as condições específicas da unidade rural.',
    points: ['Simulação pela fórmula-base', 'Identificação automática pelo PDF', 'Confirmação individual da elegibilidade'],
    link: '#simulador', cta: 'Simular conta rural',
  },
];

const associateLogos = [
  ['associado-01.jpg', 'DESC Soluções e Energia Solar'],
  ['associado-02.png', 'Associado AGEL'],
  ['associado-03.jpg', 'Bombeiros Voluntários de Nova Prata'],
  ['associado-04.jpg', 'APAE'],
  ['associado-05.png', 'Instituto Madre Gentila Olivotti'],
  ['associado-06.png', 'Confiança'],
  ['associado-07.png', 'Kanpai'],
  ['associado-08.png', 'Açougue Fanton'],
  ['associado-09.jpeg', 'Imobiliária Carnevalli'],
  ['associado-10.png', 'Zucchetti'],
  ['associado-11.png', 'DUM'],
  ['associado-12.jpg', 'RB Saúde'],
  ['associado-13.png', 'Corretolive'],
  ['associado-14.png', 'Tanaroda Pneus'],
  ['associado-15.jpg', 'Flytour Serviços de Viagens'],
  ['associado-16.jpeg', 'Restaurante São Sebastião'],
  ['associado-17.png', 'Quíron Cursos e Idiomas'],
  ['associado-18.png', 'Centro de Trabalho Clínico e Ortopédico'],
  ['associado-19.png', 'Koroa Dental'],
  ['associado-20.png', 'CIC'],
  ['associado-21.png', 'Bar e Pesqueiro'],
  ['associado-22.jpeg', 'Antonelli'],
  ['associado-23.jpg', 'CIC Idiomas'],
  ['associado-24.jpeg', 'Paradiso Restaurante e Cafeteria'],
].map(([file, name]) => ({ src: `/assets/associados/${file}`, name }));

function LogoMarquee({ logos, reverse = false }) {
  const repeated = [...logos, ...logos];
  return (
    <div className="logo-marquee" aria-label="Logos de associados da AGEL">
      <div className={`logo-track ${reverse ? 'reverse' : ''}`}>
        {repeated.map((logo, index) => {
          const duplicate = index >= logos.length;
          return (
            <div className="associate-logo-card" key={`${logo.src}-${index}`} aria-hidden={duplicate || undefined}>
              <img src={logo.src} alt={duplicate ? '' : `Logo ${logo.name}`} loading="lazy" decoding="async" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AssociatesShowcase() {
  const topRow = associateLogos.filter((_, index) => index % 2 === 0);
  const bottomRow = associateLogos.filter((_, index) => index % 2 === 1);
  return (
    <section className="section associates-section" id="associados">
      <div className="container section-heading centered" data-reveal>
        <span className="eyebrow"><Icon name="people" size={18} /> Rede AGEL</span>
        <h2>Alguns de nossos associados</h2>
        <p>Estabelecimentos que economizam, demonstram responsabilidade ambiental e contribuem para um futuro mais sustentável.</p>
      </div>
      <div className="associate-marquees" data-reveal="scale">
        <LogoMarquee logos={topRow} />
        <LogoMarquee logos={bottomRow} reverse />
      </div>
      <div className="container associate-note"><Icon name="leaf" size={17} /> <span>24 marcas e instituições conectadas à energia limpa.</span></div>
    </section>
  );
}

function EcoVideoCard({ src, type, tag, title, copy, large = false }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !reducedMotion) {
        video.play().catch(() => setPlaying(false));
      } else {
        video.pause();
      }
    }, { threshold: 0.35 });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => setPlaying(false));
    else video.pause();
  }

  return (
    <article className={`eco-video-card ${large ? 'large' : ''}`} data-reveal={large ? 'left' : 'right'}>
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={togglePlayback}
        aria-label={title}
      >
        <source src={src} type={type} />
        Seu navegador não consegue reproduzir este vídeo.
      </video>
      <div className="eco-video-shade" />
      <span className="video-tag"><Icon name={tag === 'Agrovoltaica' ? 'sun' : 'leaf'} size={16} /> {tag}</span>
      <button className="video-play-button" type="button" onClick={togglePlayback} aria-label={playing ? `Pausar: ${title}` : `Reproduzir: ${title}`}>
        {playing ? '❚❚' : '▶'}
      </button>
      <div className="eco-video-copy"><h3>{title}</h3><p>{copy}</p></div>
    </article>
  );
}

function EcoImageCard({ images, tag, title, copy }) {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (images.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = window.setInterval(() => setActiveImage((current) => (current + 1) % images.length), 4500);
    return () => window.clearInterval(timer);
  }, [images.length]);

  return (
    <article className="eco-video-card eco-image-card" data-reveal="right">
      <div className="eco-image-slides">
        {images.map((image, index) => (
          <img
            className={index === activeImage ? 'is-active' : ''}
            src={image.src}
            alt={image.alt}
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            key={image.src}
          />
        ))}
      </div>
      <div className="eco-video-shade" />
      <span className="video-tag"><Icon name="people" size={16} /> {tag}</span>
      <div className="eco-image-dots" aria-label="Selecionar imagem">
        {images.map((image, index) => (
          <button
            type="button"
            className={index === activeImage ? 'is-active' : ''}
            onClick={() => setActiveImage(index)}
            aria-label={`Mostrar imagem ${index + 1}: ${image.alt}`}
            aria-current={index === activeImage ? 'true' : undefined}
            key={image.src}
          />
        ))}
      </div>
      <div className="eco-video-copy"><h3>{title}</h3><p>{copy}</p></div>
    </article>
  );
}

function EcoValueCard() {
  return (
    <article className="eco-value-card" data-reveal="right">
      <div className="value-icon-orbit" aria-hidden="true"><Icon name="growth" size={58} /></div>
      <div className="value-card-copy">
        <span><Icon name="coins" size={17} /> Economia</span>
        <h3>Valorização do seu dinheiro</h3>
        <p>Energia limpa também significa economia mensal e melhor aproveitamento dos seus recursos.</p>
      </div>
    </article>
  );
}

function EcoVideoGallery() {
  return (
    <section className="section eco-videos-section" id="videos">
      <div className="container">
        <div className="video-section-head">
          <div className="section-heading" data-reveal="left">
            <span className="eyebrow"><Icon name="sun" size={18} /> Energia em movimento</span>
            <h2>Veja a transformação acontecer</h2>
            <p>Painéis solares, áreas produtivas e florestas mostram como energia e natureza podem avançar lado a lado.</p>
            <div className="eco-benefits">
              <span><Icon name="leaf" size={17} /> Reduza sua pegada de carbono com energia 100% renovável</span>
              <span><Icon name="coins" size={17} /> Economize seu dinheiro</span>
              <span><Icon name="people" size={17} /> Ajude instituições sociais e pessoas com comorbidades</span>
            </div>
          </div>
          <div className="video-head-brand" data-reveal="right"><img src="/assets/agel-logo-vertical.png" alt="AGEL" /><span>Geração limpa • futuro sustentável</span></div>
        </div>
        <div className="eco-video-grid">
          <EcoVideoCard
            src="/assets/videos/floresta-sol.mp4"
            type="video/mp4"
            tag="Natureza"
            title="Floresta viva"
            copy="O consumo de energia limpa contribui diretamente para a sustentabilidade do planeta e a preservação dos ambientes naturais."
            large
          />
          <EcoImageCard
            images={[
              { src: '/assets/impact-social/crianca-inclusao.jpg', alt: 'Criança sorrindo em um ambiente colorido' },
              { src: '/assets/impact-social/crianca-tratamento.jpg', alt: 'Criança sorrindo durante tratamento hospitalar' },
              { src: '/assets/impact-social/crianca-acessibilidade.jpg', alt: 'Criança sorrindo em assento adaptado' },
              { src: '/assets/impact-social/bombeiros-voluntarios.jpg', alt: 'Capacete de bombeiros voluntários' },
              { src: '/assets/impact-social/cuidado-idosos.jpg', alt: 'Profissional de saúde acompanhando uma pessoa idosa' },
            ]}
            tag="Impacto social"
            title="Energia que cuida da vida"
            copy="Parte da receita da AGEL é destinada a ajudar quem mais precisa. Um impacto que só é possível graças a cada associado que faz parte dessa transformação."
          />
          <EcoValueCard />
        </div>
        <div className="video-credits">
          <span>Vídeo sem áudio, reproduzido somente quando visível.</span>
          <span>Vídeo: <a href="https://mixkit.co/free-stock-video/" target="_blank" rel="noreferrer">Mixkit Free License</a>.</span>
        </div>
      </div>
    </section>
  );
}

function AudienceTabs() {
  const [activeId, setActiveId] = useState(audienceProfiles[0].id);
  const active = audienceProfiles.find((profile) => profile.id === activeId);

  return (
    <div className="audience-tabs" data-reveal>
      <div className="profile-tablist" role="tablist" aria-label="Perfis atendidos pela AGEL">
        {audienceProfiles.map((profile) => (
          <button
            type="button"
            role="tab"
            aria-selected={activeId === profile.id}
            aria-controls={`profile-panel-${profile.id}`}
            className={activeId === profile.id ? 'active' : ''}
            onClick={() => setActiveId(profile.id)}
            key={profile.id}
          >
            <Icon name={profile.icon} size={21} /> {profile.tab}
          </button>
        ))}
      </div>
      <div className="profile-panel" id={`profile-panel-${active.id}`} role="tabpanel" key={active.id}>
        <div className="profile-panel-copy">
          <span className="profile-icon"><Icon name={active.icon} size={28} /></span>
          <h3>{active.title}</h3>
          <p>{active.copy}</p>
          <ul className="check-list profile-checks">
            {active.points.map((point) => <li key={point}><Icon name="check" size={18} /> {point}</li>)}
          </ul>
          <a className="primary-button" href={active.link}>{active.cta} <Icon name="arrow" size={18} /></a>
        </div>
        <div className="profile-brand-visual" aria-hidden="true">
          <span className="orbit orbit-one" /><span className="orbit orbit-two" />
          <div className="profile-logo-card"><img src="/assets/agel-logo-vertical.png" alt="" /><strong>Energia limpa</strong><span>que gera economia</span></div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  function handleContactSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent('Quero conhecer a AGEL');
    const body = encodeURIComponent(
      `Nome: ${data.get('nome')}\nTelefone: ${data.get('telefone')}\n\nMensagem:\n${data.get('mensagem')}`,
    );
    window.location.href = `mailto:contato@agel.eco.br?subject=${subject}&body=${body}`;
  }

  return (
    <div className="app-shell">
      <Header />
      <ScrollCompanion />

      <main>
        <section className="hero" id="inicio">
          <div className="hero-overlay" />
          <span className="energy-particle particle-one" aria-hidden="true" />
          <span className="energy-particle particle-two" aria-hidden="true" />
          <span className="energy-particle particle-three" aria-hidden="true" />
          <div className="container hero-content">
            <div className="hero-copy" data-reveal>
              <span className="hero-pill"><Icon name="leaf" size={18} /> Energia limpa sem complicação</span>
              <h1>Economize até <span>35%</span> na sua conta de energia.</h1>
              <p>Sem instalar placas. Sem investimento. Uma forma simples de transformar geração solar compartilhada em economia mensal.</p>
              <div className="hero-checks">
                <span><Icon name="check" size={18} /> Sem instalação no imóvel</span>
                <span><Icon name="check" size={18} /> Simulação em menos de 1 minuto</span>
                <span><Icon name="check" size={18} /> Resultado claro e detalhado</span>
              </div>
              <div className="hero-actions">
                <a className="primary-button hero-button" href="#simulador">Quero simular minha economia <Icon name="arrow" size={20} /></a>
                <a className="secondary-button" href="#como-funciona">Entender como funciona</a>
              </div>
              <p className="hero-note"><Icon name="shield" size={17} /> Simulação sem cadastro e sem compromisso.</p>
            </div>

            <div className="hero-panel" aria-label="Resumo da proposta AGEL" data-reveal>
              <div className="panel-brand"><img src="/assets/agel-logo-vertical.png" alt="AGEL" /><span>Energia compartilhada</span></div>
              <div className="hero-savings-number"><small>economia de até</small><strong>35%</strong><span>na conta de energia</span></div>
              <div className="hero-panel-grid">
                <div><Icon name="sun" size={20} /><span>Energia solar</span></div>
                <div><Icon name="building" size={20} /><span>Sem obras</span></div>
                <div><Icon name="chart" size={20} /><span>Economia visível</span></div>
                <div><Icon name="leaf" size={20} /><span>Impacto positivo</span></div>
              </div>
            </div>
          </div>
          <div className="hero-wave" />
        </section>

        <section className="brand-signature" aria-label="Assinatura AGEL">
          <div className="container brand-signature-inner">
            <span className="signature-label">ENERGIA QUE CONECTA</span>
            <img src="/assets/agel-logo-vertical.png" alt="AGEL — Associação Gaúcha de Energia Limpa" />
            <div className="signature-points"><span>Economia</span><i /><span>Sustentabilidade</span><i /><span>Comunidade</span></div>
          </div>
        </section>

        <section className="trust-strip" aria-label="Indicadores AGEL">
          <div className="container stats-grid">
            <Stat value={900} suffix="+" label="associados" note="rede em crescimento" icon="people" />
            <Stat value={45} suffix="+" label="usinas solares" note="geração compartilhada" icon="sun" delay={90} />
            <div className="stat-card text-stat" data-reveal="scale" style={{ transitionDelay: '180ms' }}>
              <span className="stat-icon"><Icon name="bolt" size={22} /></span>
              <strong>+R$ 350 mil</strong><span>em descontos distribuídos</span><small>economia para os associados</small>
            </div>
            <div className="stat-card text-stat environmental-equivalence" data-reveal="scale" style={{ transitionDelay: '270ms' }}>
              <span className="stat-icon"><Icon name="leaf" size={22} /></span>
              <strong>+315 t</strong>
              <span>de CO₂ evitadas</span>
              <small><Icon name="leaf" size={13} /> equivalente a 31.500 árvores cultivadas</small>
            </div>
          </div>
        </section>

        <AssociatesShowcase />

        <section className="section how-section" id="como-funciona">
          <div className="container">
            <div className="section-heading centered" data-reveal>
              <span className="eyebrow">Como funciona</span>
              <h2>Entenda em 30 segundos</h2>
              <p>Uma jornada visual, direta e sem excesso de termos técnicos.</p>
            </div>
            <div className="steps-grid">
              {steps.map(([icon, number, title, copy], index) => (
                <div className="step-card" key={title} data-reveal={index % 2 ? 'right' : 'left'} style={{ transitionDelay: `${index * 75}ms` }}>
                  <div className="step-topline"><span className="step-icon"><Icon name={icon} size={26} /></span><b>{number}</b></div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                  {index < steps.length - 1 && <span className="step-arrow" aria-hidden="true">→</span>}
                </div>
              ))}
            </div>
            <div className="simple-promise" data-reveal="scale">
              <Icon name="check" size={21} />
              <strong>Sem placas no telhado.</strong>
              <span>A proposta é conectar você à geração compartilhada e transformar créditos em economia.</span>
            </div>
          </div>
        </section>

        <EcoVideoGallery />

        <Simulator />

        <section className="section bill-explainer" id="faturas">
          <div className="container split-heading">
            <div className="section-heading" data-reveal="left">
              <span className="eyebrow">Transparência na cobrança</span>
              <h2>Antes e depois, sem mistério</h2>
              <p>Veja como a cobrança pode se organizar após a associação: uma parcela residual da concessionária e a fatura da AGEL.</p>
            </div>
            <div className="bill-flow-card" data-reveal="right">
              <div className="bill-flow-step current">
                <span>ANTES</span><strong>Conta da concessionária</strong><small>Uma única cobrança</small>
              </div>
              <div className="bill-flow-arrow">→</div>
              <div className="bill-flow-after">
                <div><span>DEPOIS</span><strong>Residual concessionária</strong><small>Parcela estimada</small></div>
                <b>+</b>
                <div><span>AGEL</span><strong>Fatura da associação</strong><small>Energia compensada</small></div>
              </div>
              <div className="saving-chip"><Icon name="coins" size={18} /> Economia destacada no simulador</div>
            </div>
          </div>
        </section>

        <section className="section audiences-section" id="perfis">
          <div className="container">
            <div className="section-heading centered" data-reveal>
              <span className="eyebrow">Para diferentes perfis</span>
              <h2>Uma experiência pensada para cada tipo de associado</h2>
              <p>A energia compartilhada pode atender diferentes perfis de consumo, sempre mediante análise da unidade.</p>
            </div>
            <AudienceTabs />
          </div>
        </section>

        <section className="impact-section" id="impacto">
          <div className="impact-image" />
          <div className="impact-overlay" />
          <div className="container impact-content">
            <div className="impact-copy" data-reveal="left">
              <span className="eyebrow light">Energia que gera impacto</span>
              <h2>Economia para o associado. Valor para a comunidade.</h2>
              <p>Ao escolher energia renovável, o associado reduz sua pegada ambiental e fortalece um modelo de desenvolvimento mais sustentável para a comunidade.</p>
              <div className="impact-points">
                <span><Icon name="shield" size={20} /> Transparência</span>
                <span><Icon name="people" size={20} /> Responsabilidade social</span>
                <span><Icon name="leaf" size={20} /> Energia renovável</span>
              </div>
            </div>
            <div className="impact-dashboard" data-reveal="right">
              <div className="impact-brand"><img src="/assets/agel-logo-vertical.png" alt="AGEL" /></div>
              <div className="dashboard-head"><span>Impacto AGEL</span><i>Energia que transforma</i></div>
              <div className="dashboard-grid">
                <div><strong>+900</strong><span>associados</span></div>
                <div><strong>+45</strong><span>usinas</span></div>
                <div><strong>+315 t</strong><span>de CO₂ evitadas<br />equivalente a 31.500 árvores cultivadas</span></div>
                <div><strong>+R$ 350 mil</strong><span>em descontos distribuídos</span></div>
              </div>
              <p>Geração renovável, economia compartilhada e compromisso com um futuro de menor impacto ambiental.</p>
            </div>
          </div>
        </section>

        <section className="section generator-section">
          <div className="container generator-grid">
            <div className="generator-card dark-card" data-reveal="left">
              <span className="eyebrow light">Para geradores</span>
              <h2>Tem uma usina solar?</h2>
              <p>A AGEL loca sua usina e amplia o alcance da geração renovável.</p>
              <ul className="check-list light-list">
                <li><Icon name="check" size={18} /> Pagamento pela performance da usina</li>
                <li><Icon name="check" size={18} /> Transparência de documentos e faturas</li>
                <li><Icon name="check" size={18} /> Canal dedicado para análise da usina</li>
              </ul>
              <a className="ghost-light-button" href="#contato">Quero falar sobre minha usina <Icon name="arrow" size={18} /></a>
            </div>
            <div className="generator-card soft-card" data-reveal="right">
              <span className="eyebrow">Área do associado</span>
              <h2>A AGEL cuida da sua conta</h2>
              <p>Nós nos mantemos atentos a erros da concessionária ou cobranças indevidas, além de orientar sobre documentos, faturas e comunicados.</p>
              <div className="portal-preview">
                <div><span>Comunicados</span><b>Atualizados</b></div>
                <div><span>Materiais</span><b>Centralizados</b></div>
                <div><span>Transparência</span><b>Organizada</b></div>
              </div>
            </div>
          </div>
        </section>

        <section className="section testimonial-section">
          <div className="container">
            <div className="section-heading centered" data-reveal>
              <span className="eyebrow">Uma escolha simples</span>
              <h2>Por que conhecer a AGEL?</h2>
              <p>Economia, praticidade e energia limpa reunidas em uma experiência transparente.</p>
            </div>
            <div className="testimonial-grid">
              <article className="assurance-card" data-reveal="scale"><span><Icon name="coins" size={25} /></span><h3>Economia estimada</h3><p>Simule gratuitamente com os dados reais da sua conta.</p></article>
              <article className="assurance-card" data-reveal="scale" style={{ transitionDelay: '100ms' }}><span><Icon name="sun" size={25} /></span><h3>Sem placas no imóvel</h3><p>Participe do modelo de geração compartilhada sem obra no telhado.</p></article>
              <article className="assurance-card" data-reveal="scale" style={{ transitionDelay: '200ms' }}><span><Icon name="shield" size={25} /></span><h3>Análise transparente</h3><p>Entenda cada etapa antes de confirmar sua associação.</p></article>
            </div>
          </div>
        </section>

        <section className="section faq-section" id="faq">
          <div className="container faq-layout">
            <div className="section-heading faq-heading" data-reveal="left">
              <span className="eyebrow">Perguntas frequentes</span>
              <h2>Respostas para as dúvidas que travam a decisão</h2>
              <a className="secondary-button inline-secondary" href="#simulador">Voltar ao simulador</a>
            </div>
            <div className="faq-list">
              {faq.map(([question, answer], index) => (
                <details key={question} data-reveal="right" style={{ transitionDelay: `${Math.min(index * 65, 260)}ms` }}>
                  <summary>{question}<span>+</span></summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="section join-section" id="associe-se">
          <div className="container join-layout">
            <div className="join-copy" data-reveal="left">
              <span className="eyebrow"><Icon name="document" size={18} /> Associe-se agora</span>
              <h2>Escolha o seu tipo de associação</h2>
              <p>Selecione uma das opções para abrir o documento correspondente na ZapSign e iniciar sua associação à AGEL.</p>
              <div className="join-security-note">
                <Icon name="shield" size={20} />
                <span>Assinatura eletrônica segura pela ZapSign.</span>
              </div>
              <div className="join-brand-mark" aria-label="AGEL — Associação Gaúcha de Energia Limpa">
                <img src="/assets/agel-logo-vertical.png" alt="AGEL — Associação Gaúcha de Energia Limpa" />
                <span><small>DOCUMENTO OFICIAL</small><strong>Associação AGEL</strong></span>
              </div>
            </div>
            <div className="join-options" data-reveal="right">
              <a
                className="join-card"
                href="https://app.zapsign.com.br/verificar/doc/9fb30ffc-5347-4a0c-b0b9-e36ed7627255"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Associar uma Pessoa Física pela ZapSign (abre em nova aba)"
              >
                <span className="join-card-icon"><Icon name="people" size={28} /></span>
                <span className="join-card-copy">
                  <small>PARA VOCÊ</small>
                  <strong>Associe uma Pessoa Física</strong>
                  <span>Abrir documento de associação</span>
                </span>
                <span className="join-card-arrow"><Icon name="arrow" size={22} /></span>
              </a>
              <a
                className="join-card"
                href="https://app.zapsign.com.br/verificar/doc/79a63261-5079-4fd1-ba20-b4754d89acaa"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Associar uma Pessoa Jurídica pela ZapSign (abre em nova aba)"
              >
                <span className="join-card-icon"><Icon name="building" size={28} /></span>
                <span className="join-card-copy">
                  <small>PARA SUA EMPRESA</small>
                  <strong>Associe uma Pessoa Jurídica</strong>
                  <span>Abrir documento de associação</span>
                </span>
                <span className="join-card-arrow"><Icon name="arrow" size={22} /></span>
              </a>
            </div>
          </div>
        </section>

        <section className="section location-section" id="localizacao">
          <div className="container location-layout">
            <div className="location-copy" data-reveal="left">
              <span className="eyebrow"><Icon name="building" size={18} /> Onde estamos</span>
              <h2>Visite a AGEL em Nova Prata</h2>
              <p>Estamos no Centro de Nova Prata, com acesso fácil para atendimento e orientação sobre sua conta de energia.</p>
              <div className="address-card">
                <span className="address-icon"><Icon name="building" size={24} /></span>
                <div>
                  <small>ENDEREÇO</small>
                  <strong>Rua Ernesto Pandolfo, 664</strong>
                  <span>Centro • Nova Prata – RS • CEP 95320-000</span>
                </div>
              </div>
              <div className="location-contacts">
                <a href="tel:+555421214007"><span>Telefone</span><strong>(54) 2121-4007</strong></a>
                <a href="mailto:contato@agel.eco.br"><span>E-mail</span><strong>contato@agel.eco.br</strong></a>
              </div>
              <div className="social-shortcuts" aria-label="Canais digitais da AGEL">
                <a className="whatsapp-shortcut" href="https://wa.me/555421214007?text=Ol%C3%A1%2C%20quero%20saber%20mais%20sobre%20a%20AGEL." target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={20} /><span><small>WhatsApp</small><strong>(54) 2121-4007</strong></span></a>
                <a href="https://www.instagram.com/agelenergialimpa/" target="_blank" rel="noopener noreferrer" aria-label="Instagram da AGEL"><Icon name="instagram" size={20} /><span><small>Instagram</small><strong>@agelenergialimpa</strong></span></a>
                <a href="https://www.facebook.com/agelenergialimpa/" target="_blank" rel="noopener noreferrer" aria-label="Facebook da AGEL"><Icon name="facebook" size={20} /><span><small>Facebook</small><strong>@agelenergialimpa</strong></span></a>
              </div>
              <a className="primary-button map-button" href="https://www.google.com/maps/search/?api=1&query=AGEL%20Rua%20Ernesto%20Pandolfo%20664%20Nova%20Prata%20RS" target="_blank" rel="noreferrer">
                Abrir rota no Google Maps <Icon name="arrow" size={19} />
              </a>
            </div>
            <div className="map-card" data-reveal="right">
              <iframe
                title="Mapa da AGEL em Nova Prata"
                src="https://www.google.com/maps?q=AGEL%20Rua%20Ernesto%20Pandolfo%20664%20Nova%20Prata%20RS&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div className="map-caption"><Icon name="leaf" size={18} /><span>AGEL — Associação Gaúcha de Energia Limpa</span></div>
            </div>
          </div>
        </section>

        <section className="contact-section" id="contato">
          <img className="contact-watermark" src="/assets/agel-logo-vertical.png" alt="" aria-hidden="true" />
          <div className="container contact-grid">
            <div data-reveal="left">
              <span className="eyebrow light">Próximo passo</span>
              <h2>Transforme a simulação em uma conversa.</h2>
              <p>Envie seus dados ou fale diretamente com a equipe pelo telefone ou WhatsApp (54) 2121-4007.</p>
            </div>
            <form className="contact-card" onSubmit={handleContactSubmit} data-reveal="right">
              <div className="contact-field"><label htmlFor="contact-name">Nome</label><input id="contact-name" name="nome" placeholder="Seu nome" required /></div>
              <div className="contact-field"><label htmlFor="contact-phone">Telefone</label><input id="contact-phone" name="telefone" inputMode="tel" placeholder="(00) 00000-0000" required /></div>
              <div className="contact-field full"><label htmlFor="contact-message">Mensagem</label><textarea id="contact-message" name="mensagem" rows="3" placeholder="Quero entender como funciona para minha unidade." required /></div>
              <button className="primary-button full-button" type="submit">Enviar mensagem para a AGEL <Icon name="arrow" size={18} /></button>
              <small>O envio abre seu aplicativo de e-mail com a mensagem pronta.</small>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <img src="/assets/agel-logo-vertical.png" alt="AGEL" />
          <p>Associação Gaúcha de Energia Limpa • Rua Ernesto Pandolfo, 664 • Nova Prata – RS.</p>
          <div className="footer-links"><a href="#inicio">Início</a><a href="#simulador">Simulador</a><a href="#associe-se">Associe-se</a><a href="#localizacao">Localização</a><a href="#contato">Contato</a></div>
        </div>
      </footer>
    </div>
  );
}
