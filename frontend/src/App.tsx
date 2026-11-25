import { lazy, Suspense, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Brain, FlaskConical, MoveUp } from 'lucide-react';
import { MotionConfig } from 'motion/react';
import { ChallengeSections } from './components/ChallengeSections';
import { Hero } from './components/Hero';
import { useReducedMotionPreference } from './hooks/useReducedMotionPreference';

const MemoryGame = lazy(() => import('./components/MemoryGame'));
const MemoryChallenge = lazy(() => import('./features/memory/MemoryChallenge'));
const AdminPanel = lazy(() => import('./features/admin/AdminPanel'));
gsap.registerPlugin(useGSAP);

function GameApp() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotionPreference();
  const canAnimate = motionEnabled && !reducedMotion;

  useGSAP(() => {
    if (!canAnimate) return;
    const arrival = gsap.timeline({ defaults: { ease: 'power3.out' } });
    arrival.from('.welcome-paper', { y: -32, rotation: -3, duration: 0.85 })
      .from('.hanging-ribbon', { y: -45, rotation: 8, duration: 0.65, stagger: 0.12 }, '<0.15')
      .from('.wax-seal', { scale: 1.5, rotation: -25, duration: 0.4 }, '-=0.15');
  }, { scope: containerRef, dependencies: [canAnimate], revertOnUpdate: true });

  return (
    <MotionConfig reducedMotion={canAnimate ? 'never' : 'always'} skipAnimations={!canAnimate}
      transition={{ duration: canAnimate ? 0.28 : 0, ease: [0.16, 1, 0.3, 1] }}>
    <div ref={containerRef} className="quest-app" data-motion={motionEnabled ? 'on' : 'off'}>
      <a className="skip-link" href="#desafios">Pular para os desafios</a>
      <Hero motionEnabled={motionEnabled} onToggleMotion={() => setMotionEnabled(!motionEnabled)} />
      <main>
        <ChallengeSections canAnimate={canAnimate} onPlayMemory={() => {
          returnFocusRef.current = document.activeElement as HTMLElement;
          setMemoryOpen(true);
          if (memoryOpen) document.getElementById('memoria')?.scrollIntoView({ behavior: canAnimate ? 'smooth' : 'instant' });
        }} />
        {memoryOpen && <Suspense fallback={<div className="memory-message" role="status">Preparando o tabuleiro…</div>}>
          <MemoryChallenge canAnimate={canAnimate} onClose={() => { setMemoryOpen(false); returnFocusRef.current?.focus(); }} />
        </Suspense>}
        <section id="demo" className="demo-section page-width" aria-labelledby="demo-title">
          <div className="section-heading">
            <span className="heading-emblem" aria-hidden="true"><FlaskConical size={25} /></span>
            <h2 id="demo-title">Mesa de experimentos</h2>
            <span className="section-rule" />
            <span className="cloth-label">Demo Phaser</span>
          </div>
          <p className="section-intro">Uma pequena demonstração interativa do nosso universo em construção.</p>
          <Suspense fallback={<div className="game-loading" role="status">Preparando a mesa…</div>}>
            <MemoryGame motionEnabled={motionEnabled} />
          </Suspense>
        </section>
      </main>
      <footer className="site-footer page-width">
        <a className="brand-mark" href="#inicio"><Brain size={24} />MindChallenge</a>
        <p>Feito para mentes curiosas. © 2026 MindChallenge.</p>
        <a className="back-top" href="#inicio">Voltar ao topo <MoveUp size={16} /></a>
      </footer>
    </div>
    </MotionConfig>
  );
}

export default function App() {
  if (window.location.pathname.replace(/\/$/, '') === '/admin') {
    return <Suspense fallback={<p role="status">Carregando administração…</p>}><AdminPanel /></Suspense>;
  }
  return <GameApp />;
}
