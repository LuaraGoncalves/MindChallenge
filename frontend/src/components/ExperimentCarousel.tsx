import { lazy, Suspense, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, FlaskConical, Layers, Palette, Puzzle, Shapes } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';
const MemoryGame = lazy(() => import('./MemoryGame'));

type Demo = { title: string; description: string; icon: LucideIcon; scene: 'memory' | 'shapes' | 'puzzle' | 'colors' };
const demos: Demo[] = [
  { title: 'Jogo da memória', description: 'Vire as cartas e encontre os pares.', icon: Layers, scene: 'memory' },
  { title: 'Encaixar formas', description: 'Formas que dançam até encontrar seu lugar.', icon: Shapes, scene: 'shapes' },
  { title: 'Quebra-cabeça', description: 'Peças flutuantes esperando para se juntar.', icon: Puzzle, scene: 'puzzle' },
  { title: 'Sequência de cores', description: 'Uma sequência brilhante para observar.', icon: Palette, scene: 'colors' },
];

function AnimatedScene({ scene, animate }: { scene: Demo['scene']; animate: boolean }) {
  const transition = animate ? { duration: 1.8, repeat: Infinity, repeatType: 'mirror' as const, ease: 'easeInOut' as const } : { duration: 0 };
  if (scene === 'memory') return <div className="experiment-memory" aria-hidden="true">{[0, 1, 2, 3].map((item) =>
    <motion.span key={item} animate={animate ? { rotateY: item % 2 ? 180 : 0, y: [0, -5, 0] } : { rotateY: 0, y: 0 }} transition={{ ...transition, delay: item * .2 }}>
      <Layers size={25} />
    </motion.span>)}</div>;
  if (scene === 'shapes') return <div className="experiment-shapes" aria-hidden="true">{[Shapes, Puzzle, Layers].map((Icon, i) =>
    <motion.span key={i} animate={animate ? { y: [0, -17 - i * 3, 0], rotate: [0, i % 2 ? 12 : -12, 0] } : { y: 0, rotate: 0 }} transition={{ ...transition, delay: i * .22 }}><Icon size={38} /></motion.span>)}</div>;
  if (scene === 'puzzle') return <div className="experiment-puzzle" aria-hidden="true">{[0, 1, 2, 3].map((item) =>
    <motion.span key={item} animate={animate ? { x: [item % 2 ? 12 : -12, 0], y: [item < 2 ? -10 : 10, 0], rotate: [item * 7, 0] } : { x: 0, y: 0, rotate: 0 }} transition={{ ...transition, delay: item * .16 }}><Puzzle size={37} /></motion.span>)}</div>;
  return <div className="experiment-colors" aria-hidden="true">{['#d3ab57', '#a54137', '#246d68', '#f3dfba'].map((color, i) =>
    <motion.span key={color} style={{ backgroundColor: color }} animate={animate ? { scale: [1, 1.18, 1], y: [0, -9, 0] } : { scale: 1, y: 0 }} transition={{ ...transition, delay: i * .17 }} />)}</div>;
}

export function ExperimentCarousel({ motionEnabled }: { motionEnabled: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reducedMotion = useReducedMotionPreference();
  const animate = motionEnabled && !reducedMotion;
  const move = (direction: number) => {
    const next = Math.max(0, Math.min(demos.length - 1, active + direction));
    setActive(next);
    trackRef.current?.children[next]?.scrollIntoView({ behavior: animate ? 'smooth' : 'instant', block: 'nearest', inline: 'center' });
  };
  return <section id="demo" className="demo-section page-width" aria-labelledby="demo-title">
    <div className="section-heading"><span className="heading-emblem" aria-hidden="true"><FlaskConical size={25} /></span>
      <h2 id="demo-title">Mesa de experimentos</h2><span className="section-rule" /><span className="cloth-label">Demonstrações</span></div>
    <p className="section-intro">Arraste a vitrine para explorar as animações dos jogos. Use as setas para navegar também.</p>
    <div className="experiment-controls"><span>Arraste para explorar</span><div>
      <button type="button" className="icon-button" aria-label="Demonstração anterior" onClick={() => move(-1)} disabled={active === 0}><ArrowLeft size={19} /></button>
      <button type="button" className="icon-button" aria-label="Próxima demonstração" onClick={() => move(1)} disabled={active === demos.length - 1}><ArrowRight size={19} /></button>
    </div></div>
    <motion.div ref={trackRef} className="experiment-track" drag="x" dragConstraints={{ left: -900, right: 0 }} dragElastic={.12}
      onDragEnd={(_, info) => { if (info.offset.x < -55) move(1); else if (info.offset.x > 55) move(-1); }}>
      {demos.map((demo, index) => { const Icon = demo.icon; return <article className={`experiment-card${index === active ? ' is-current' : ''}`} key={demo.scene} onClick={() => { setActive(index); }}>
        <div className="experiment-card-heading"><span><Icon size={18} /></span><small>EXPERIMENTO 0{index + 1}</small></div>
        {demo.scene === 'memory' ? <div className="experiment-real-demo"><Suspense fallback={<div className="game-loading" role="status">Preparando a demonstração…</div>}><MemoryGame motionEnabled={animate} /></Suspense></div> : <AnimatedScene scene={demo.scene} animate={animate} />}
        <h3>{demo.title}</h3><p>{demo.description}</p>
      </article>; })}
    </motion.div>
    <div className="experiment-dots" aria-label={`Demonstração ${active + 1} de ${demos.length}`}>{demos.map((demo, i) =>
      <button key={demo.scene} className={i === active ? 'active' : ''} aria-label={`Mostrar ${demo.title}`} aria-pressed={i === active} onClick={() => move(i - active)} />)}</div>
  </section>;
}
