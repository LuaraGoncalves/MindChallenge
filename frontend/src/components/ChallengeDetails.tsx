import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useAnimate, usePresence } from 'motion/react';
import { ArrowRight, Clock3, X } from 'lucide-react';
import type { Challenge } from '../api/gameCatalog';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';

const difficulties = { EASY: 'Fácil', MEDIUM: 'Médio', HARD: 'Difícil' };

type Props = { game: Challenge; icon: ReactNode; canAnimate: boolean; onRequestClose: () => void };

export function ChallengeDetails({ game, icon, canAnimate, onRequestClose }: Props) {
  const [scope, animate] = useAnimate<HTMLDialogElement>();
  const [isPresent, safeToRemove] = usePresence();
  const reducedMotion = useReducedMotionPreference();
  const spatialMotion = canAnimate && !reducedMotion;
  const goToDemo = useRef(false);

  useEffect(() => {
    const dialog = scope.current;
    if (!dialog) return;
    if (isPresent && !dialog.open) dialog.showModal();

    // Keep the native dialog's focus trap until its exit animation finishes.
    const controls = animate(dialog, {
      opacity: isPresent ? 1 : 0,
      y: isPresent || !spatialMotion ? 0 : 12,
      rotate: isPresent || !spatialMotion ? 0 : 2,
      scale: isPresent || !spatialMotion ? 1 : 0.97,
    }, { duration: spatialMotion ? (isPresent ? 0.28 : 0.17) : 0, ease: [0.16, 1, 0.3, 1] });

    let cancelled = false;
    if (!isPresent) void controls.then(() => {
      if (cancelled) return;
      dialog.close();
      safeToRemove?.();
      if (goToDemo.current) window.location.hash = 'demo';
    });
    return () => { cancelled = true; controls.stop(); };
  }, [isPresent, spatialMotion, animate, scope, safeToRemove]);

  return (
    <dialog ref={scope} className="quest-dialog" aria-labelledby="quest-detail-title"
      style={{ opacity: 0, transform: spatialMotion ? 'translateY(14px) rotate(-2deg) scale(.96)' : undefined }}
      onCancel={(event) => { event.preventDefault(); onRequestClose(); }}
      onClose={onRequestClose}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onRequestClose();
      }}>
      <button className="icon-button dialog-close" onClick={onRequestClose} aria-label="Fechar detalhes" title="Fechar detalhes"><X size={21} /></button>
      <span className="detail-symbol">{icon}</span>
      <h2 id="quest-detail-title">{game.name}</h2>
      <p>{game.description}</p>
      <div className="detail-meta"><span><Clock3 size={16} />{game.estimatedMinutes} min</span><span>{difficulties[game.difficulty]}</span></div>
      <p className="development-note">Este jogo está em desenvolvimento. Enquanto isso, conheça nossa demonstração interativa.</p>
      <a href="#demo" className="ribbon-button" onClick={(event) => {
        event.preventDefault();
        goToDemo.current = true;
        onRequestClose();
      }}>Abrir demonstração <ArrowRight size={17} /></a>
    </dialog>
  );
}
