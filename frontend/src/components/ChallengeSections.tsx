import type { ChallengeGroup, ExtraMode } from '../api/gameCatalog';
import { useGameCatalog } from '../hooks/useGameCatalog';

const groupStyles = {
  green: {
    border: 'border-[#76d68a]/45',
    title: 'text-[#d9e074]',
    glow: 'bg-[#76d68a]/20',
    chip: 'bg-[#d9e074] text-[#1f2120]',
    cta: 'bg-[#76d68a] text-[#1f2120] shadow-[0_6px_0_#2f6f3b]',
  },
  blue: {
    border: 'border-[#eeecd0]/35',
    title: 'text-[#eeecd0]',
    glow: 'bg-[#f2b84b]/18',
    chip: 'bg-[#f2b84b] text-[#1f2120]',
    cta: 'bg-[#f2b84b] text-[#1f2120] shadow-[0_6px_0_#8a6330]',
  },
};

const extraStyles = [
  'border-[#d9e074]/30 text-[#d9e074]',
  'border-[#76d68a]/35 text-[#76d68a]',
  'border-[#ef7d4f]/35 text-[#ef7d4f]',
  'border-[#f2b84b]/35 text-[#f2b84b]',
];

function iconCode(icon: string) {
  return icon.slice(0, 2).toUpperCase();
}

function ChallengeGroupCard({ group, index }: { group: ChallengeGroup; index: number }) {
  const styles = groupStyles[index % 2 === 0 ? 'green' : 'blue'];

  return (
    <article className={`game-card arcade-panel relative overflow-hidden rounded-sm border-2 p-5 md:p-7 ${styles.border}`}>
      <div className={`absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl ${styles.glow}`} />

      <div className="relative z-10 flex items-start justify-between gap-4 border-b border-[#eeecd0]/15 pb-5">
        <div>
          <p className="pixel-font text-xs text-[#9fa88f]">player {index + 1}</p>
          <h3 className={`pixel-font mt-2 text-3xl font-black md:text-4xl ${styles.title}`}>
            {group.title}
          </h3>
        </div>
        <span className={`grid h-16 w-16 place-items-center rounded-sm text-xl font-black ${styles.chip}`}>
          {iconCode(group.icon)}
        </span>
      </div>

      <p className="relative z-10 mt-5 text-base leading-7 text-[#c6c8ad]">
        {group.description}
      </p>

      <div className="relative z-10 mt-7 grid gap-3">
        {group.games.map((game, gameIndex) => (
          <button key={game.slug} className="group/item grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-sm border border-[#eeecd0]/16 bg-[#151715]/80 p-4 text-left transition-all hover:-translate-y-1 hover:border-[#d9e074]/60 hover:bg-[#22271f]">
            <span className="grid h-11 w-11 place-items-center rounded-sm border border-[#eeecd0]/20 bg-[#2d342a] text-sm font-black transition-transform group-hover/item:scale-110">
              {iconCode(game.icon)}
            </span>
            <span>
              <span className="block text-lg font-black text-[#eeecd0]">{game.name}</span>
              <span className="block text-sm text-[#9fa88f]">{game.skill}</span>
            </span>
            <span className="pixel-font text-xs text-[#d9e074]">0{gameIndex + 1}</span>
          </button>
        ))}
      </div>

      <button className={`relative z-10 mt-8 w-full rounded-sm px-5 py-4 pixel-font text-sm font-black transition-all hover:-translate-y-1 ${styles.cta}`}>
        {index === 0 ? 'Explorar Todos' : 'Desbloquear Niveis Dificeis'}
      </button>
    </article>
  );
}

function ExtraModeCard({ mode, index }: { mode: ExtraMode; index: number }) {
  const colorClasses = extraStyles[index % extraStyles.length];

  return (
    <article className={`extra-card rounded-sm border bg-[#151715] p-5 transition-all hover:-translate-y-2 hover:bg-[#242922] ${colorClasses}`}>
      <div className="flex items-center justify-between gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-sm bg-[#eeecd0] text-sm font-black text-[#1f2120]">
          {iconCode(mode.icon)}
        </span>
        <span className="pixel-font text-xs opacity-75">{mode.tag}</span>
      </div>

      <h4 className="pixel-font mt-5 text-2xl font-black text-[#eeecd0]">{mode.title}</h4>

      {mode.features.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm text-[#9fa88f]">
          {mode.features.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-2 w-2 bg-current" />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-6 text-[#9fa88f]">{mode.description}</p>
      )}

      <div className="mt-6 border-t border-[#eeecd0]/12 pt-4 pixel-font text-xs">
        {mode.description}
      </div>
    </article>
  );
}

export function ChallengeSections() {
  const { data, error, loading } = useGameCatalog();

  return (
    <section className="relative w-full bg-[#1f2120] px-6 py-24 md:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col gap-4 border-y border-[#eeecd0]/15 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="pixel-font text-xs text-[#d9e074]">select mode</p>
            <h2 className="pixel-font mt-3 text-4xl font-black text-[#eeecd0] md:text-6xl">
              Nossos Desafios
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="h-5 w-5 bg-[#d9e074]" />
            <span className="h-5 w-5 bg-[#76d68a]" />
            <span className="h-5 w-5 bg-[#ef7d4f]" />
          </div>
        </div>

        {loading && (
          <div className="arcade-panel rounded-sm p-6 pixel-font text-sm text-[#d9e074]">
            Carregando catalogo...
          </div>
        )}

        {error && (
          <div className="rounded-sm border border-[#ef7d4f]/45 bg-[#151715] p-6 text-[#eeecd0]">
            {error}
          </div>
        )}

        {data && (
          <>
            <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
              {data.groups.map((group, index) => (
                <ChallengeGroupCard key={group.slug} group={group} index={index} />
              ))}
            </div>

            <div className="mt-16">
              <div className="mb-7 flex items-center gap-3">
                <span className="h-4 w-4 bg-[#f2b84b]" />
                <h3 className="pixel-font text-2xl font-black text-[#eeecd0] md:text-3xl">
                  Modos Extras
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                {data.extras.map((mode, index) => (
                  <ExtraModeCard key={mode.slug} mode={mode} index={index} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
