import { useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { ArrowRight, BookOpen, Brain, Clock3, Compass, Crown, Flame, Gamepad2, Layers, Palette, Puzzle, Shapes, Sparkles, Trophy, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Challenge, ChallengeGroup, ExtraMode } from '../api/gameCatalog';
import { useGameCatalog } from '../hooks/useGameCatalog';
import { ChallengeDetails } from './ChallengeDetails';

const icons: Record<string, LucideIcon> = {
  cards: Layers, shapes: Shapes, palette: Palette, letters: BookOpen, numbers: Brain,
  puzzle: Puzzle, chart: Sparkles, division: Zap, joystick: Gamepad2, bolt: Zap,
  fire: Flame, trophy: Trophy, toy: Shapes, brain: Brain,
};
type Filter = 'all' | 'kids' | 'adults';

function GameIcon({ name, size = 24 }: { name: string; size?: number }) {
  const Icon = icons[name] ?? Compass;
  return <Icon size={size} aria-hidden="true" />;
}

function ChallengeGroupSheet({ group, onSelect }: { group: ChallengeGroup; onSelect: (game: Challenge) => void }) {
  return (
    <article className={`quest-sheet sheet-${group.slug}`} aria-labelledby={`title-${group.slug}`}>
      <span className="paper-pin" aria-hidden="true" />
      <div className="sheet-title">
        <div className="sheet-symbol"><GameIcon name={group.icon} size={30} /></div>
        <h3 id={`title-${group.slug}`}>{group.title}</h3>
        <span className="sheet-count">{group.games.length} desafios</span>
      </div>
      <p className="sheet-description">{group.description}</p>
      <ul className="quest-list">
        {group.games.map((game) => (
          <li key={game.slug}>
            <button className="quest-row" onClick={() => onSelect(game)}>
              <span className="quest-icon"><GameIcon name={game.icon} /></span>
              <span className="quest-name"><strong>{game.name}</strong><span>{game.skill}</span></span>
              <span className="quest-time"><Clock3 size={12} />{game.estimatedMinutes} min</span>
              <ArrowRight className="quest-arrow" size={17} />
            </button>
          </li>
        ))}
      </ul>
      <div className="sheet-bottom"><span>Escolha um desafio para conhecer</span><Sparkles size={18} /></div>
    </article>
  );
}

function ExtraModeTicket({ mode, canAnimate }: { mode: ExtraMode; canAnimate: boolean }) {
  return (
    <motion.article className={`mode-ticket ticket-${mode.slug}`}
      whileHover={canAnimate ? { y: -7, rotate: -1 } : undefined}
      whileTap={canAnimate ? { y: -2, rotate: 0, scale: 0.985 } : undefined}>
      <span className="ticket-icon"><GameIcon name={mode.icon} size={29} /></span>
      <span className="ticket-tag">{mode.tag}</span>
      <h3>{mode.title}</h3>
      <p>{mode.description}</p>
      <div className="ticket-footer"><span>Em desenvolvimento</span><span aria-hidden="true">• • •</span></div>
    </motion.article>
  );
}

export function ChallengeSections({ canAnimate }: { canAnimate: boolean }) {
  const { data, error, loading, retry } = useGameCatalog();
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<Challenge>();

  function selectGame(game: Challenge) {
    setSelected(game);
  }

  return (
    <section id="desafios" className="catalog-section page-width" aria-labelledby="catalog-title">
      <div className="section-heading">
        <span className="heading-emblem" aria-hidden="true"><Compass size={27} /></span>
        <h2 id="catalog-title">Mural de desafios</h2>
        <span className="section-rule" />
        <span className="small-annotation">Qual será a sua aventura?</span>
      </div>
      <div className="catalog-toolbar">
        <LayoutGroup id="catalog-filters">
        <div className="category-tabs" role="group" aria-label="Filtrar desafios">
          {([['all', 'Todos', Compass], ['kids', 'Modo Kids', Shapes], ['adults', 'Modo Adultos', Crown]] as const).map(([value, label, Icon]) => (
            <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>
              {filter === value && <motion.span className="category-highlight" layoutId="active-category"
                transition={{ duration: canAnimate ? 0.25 : 0 }} aria-hidden="true" />}
              <Icon size={16} />{label}
            </button>
          ))}
        </div>
        </LayoutGroup>
        <span className="catalog-note"><BookOpen size={16} />Um desafio de cada vez.</span>
      </div>
      <LayoutGroup id="catalog-sheets">
      <AnimatePresence initial={false} mode="wait">
      {loading ? <motion.div key="loading" className="catalog-message" role="status"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <Compass className="loading-compass" size={28} />Buscando os pergaminhos…
      </motion.div> : error ? <motion.div key="error" className="catalog-message" role="alert"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <p>O mural não conseguiu carregar os desafios. Confira se a API está ligada.</p><button className="ribbon-button" onClick={retry}>Tentar novamente <ArrowRight size={18} /></button>
      </motion.div> : data ? <motion.div key="catalog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="quest-sheets" layout={canAnimate ? 'position' : false}>
          <AnimatePresence initial={false} mode="popLayout">
          {data.groups.filter((group) => filter === 'all' || group.slug === filter).map((group) => (
            <motion.div key={group.slug} className="quest-sheet-slot" layout={canAnimate ? 'position' : false}
              initial={{ opacity: 0, y: canAnimate ? 20 : 0 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: canAnimate ? -12 : 0 }}
              transition={{ duration: canAnimate ? 0.28 : 0 }}>
              <ChallengeGroupSheet group={group} onSelect={selectGame} />
            </motion.div>
          ))}
          </AnimatePresence>
        </motion.div>
        <motion.div id="extras" className="extras-section" layout={canAnimate ? 'position' : false}>
          <div className="section-heading"><span className="heading-emblem" aria-hidden="true"><Gamepad2 size={25} /></span><h2>Outras aventuras</h2><span className="section-rule" /><span className="small-annotation">Novos caminhos a explorar</span></div>
          <div className="mode-tickets">{data.extras.map((mode) => <ExtraModeTicket key={mode.slug} mode={mode} canAnimate={canAnimate} />)}</div>
        </motion.div>
      </motion.div> : null}
      </AnimatePresence>
      </LayoutGroup>
      <AnimatePresence>
        {selected && <ChallengeDetails key={selected.slug} game={selected} icon={<GameIcon name={selected.icon} size={36} />} canAnimate={canAnimate}
          onRequestClose={() => setSelected(undefined)} />}
      </AnimatePresence>
    </section>
  );
}
