import { ArrowDown, Brain, Compass, Pause, Play, Sparkles } from 'lucide-react';

type HeroProps = { motionEnabled: boolean; onToggleMotion: () => void; accountName?: string; onAccount: () => void };

export function Hero({ motionEnabled, onToggleMotion, accountName, onAccount }: HeroProps) {
  return (
    <header className="board-header" id="inicio">
      <nav className="topbar" aria-label="Navegação principal">
        <a className="brand-mark" href="#inicio"><Brain size={24} /><span>MindChallenge</span></a>
        <div className="nav-links">
          <a href="#desafios">O mural</a>
          <a href="#extras">Modos extras</a>
          <a href="#demo">Mesa de experimentos</a>
        </div>
        <button className="icon-button motion-toggle" onClick={onToggleMotion}
          aria-label={motionEnabled ? 'Pausar animações' : 'Ativar animações'}
          title={motionEnabled ? 'Pausar animações' : 'Ativar animações'} aria-pressed={!motionEnabled}>
          {motionEnabled ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button className="account-nav" onClick={onAccount}>{accountName ? `Sair · ${accountName}` : 'Entrar'}</button>
      </nav>
      <div className="welcome-board">
        <span className="hanging-ribbon ribbon-left" aria-hidden="true"><Sparkles size={27} /></span>
        <span className="hanging-ribbon ribbon-right" aria-hidden="true"><Compass size={27} /></span>
        <div className="welcome-paper paper-arrival">
          <span className="paper-pin pin-left" aria-hidden="true" />
          <span className="paper-pin pin-right" aria-hidden="true" />
          <div className="title-ornament" aria-hidden="true"><span /><Brain size={32} /><span /></div>
          <h1>MindChallenge</h1>
          <p className="welcome-subtitle">Um mural. Muitos desafios. Sua próxima aventura.</p>
          <p className="welcome-description">Explore jogos de memória, lógica e reflexos.<br />{' '}Escolha um desafio e coloque a mente em movimento.</p>
          <a className="ribbon-button" href="#desafios">Explorar desafios <ArrowDown size={19} /></a>
          <span className="wax-seal" aria-hidden="true"><Brain size={28} /></span>
        </div>
        <div className="board-caption"><span /> Memória <span /> Lógica <span /> Reflexos <span /></div>
      </div>
    </header>
  );
}
