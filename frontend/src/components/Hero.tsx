const sparks = [
  'top-[18%] left-[12%] bg-[#d9e074]',
  'top-[28%] right-[18%] bg-[#f2b84b]',
  'bottom-[28%] left-[18%] bg-[#76d68a]',
  'bottom-[34%] right-[12%] bg-[#ef7d4f]',
  'top-[48%] left-[6%] bg-[#eeecd0]',
  'top-[56%] right-[7%] bg-[#d9e074]',
];

const previewTiles = [
  'from-[#d9e074] to-[#76d68a]',
  'from-[#f2b84b] to-[#ef7d4f]',
  'from-[#7aa77c] to-[#303b2d]',
  'from-[#eeecd0] to-[#9fa88f]',
];

export function Hero() {
  return (
    <section className="relative w-screen min-h-screen arcade-shell scanlines overflow-hidden px-4 py-5">
      <div className="absolute inset-x-6 top-4 z-20 hidden md:flex items-center justify-between rounded-sm border border-[#eeecd0]/25 bg-[#1b1d1b]/80 px-6 py-2 text-[0.65rem] text-[#eeecd0]/70 pixel-font">
        <span>mind</span>
        <span>kids</span>
        <span className="text-[#d9e074]">challenge</span>
        <span>adultos</span>
        <span>ranking</span>
      </div>

      {sparks.map((className) => (
        <span key={className} className={`spark absolute h-2 w-2 rounded-full blur-[1px] ${className}`} />
      ))}

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-7xl flex-col items-center justify-center gap-8 pt-10 text-center">
        <div className="hero-element flex w-full justify-center overflow-hidden rounded-sm border border-[#eeecd0]/15 bg-[#151715]/70 py-2 text-[#d9e074] pixel-font text-xs">
          <div className="marquee-track flex min-w-[200%] justify-around gap-10 whitespace-nowrap">
            <span>memoria</span>
            <span>puzzle</span>
            <span>reflexos</span>
            <span>logica</span>
            <span>ranking</span>
            <span>memoria</span>
            <span>puzzle</span>
            <span>reflexos</span>
            <span>logica</span>
            <span>ranking</span>
          </div>
        </div>

        <div className="hero-element">
          <p className="mb-5 text-xs md:text-sm text-[#d9e074] pixel-font">insert coin to train</p>
          <h1 className="pixel-title pixel-font mx-auto max-w-5xl text-[3.4rem] font-black leading-[0.88] md:text-[6.7rem] lg:text-[8rem]">
            MIND
            <span className="block text-[#d9e074]">CHALLENGE</span>
          </h1>
        </div>

        <div className="hero-element grid w-full max-w-6xl grid-cols-1 gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="arcade-panel rounded-sm p-5 text-left">
            <p className="pixel-font text-xs text-[#d9e074]">new game</p>
            <h2 className="mt-3 text-3xl font-black text-[#eeecd0] md:text-5xl">
              Jogos que treinam o cérebro
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#c6c8ad] md:text-lg">
              Escolha uma fase, teste memória, lógica e reflexos, e tente bater sua melhor pontuação.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button className="coin-button pixel-font rounded-sm px-8 py-4 text-sm font-black transition-all">
                Jogar Agora
              </button>
              <div className="flex items-center gap-2 text-[#eeecd0]/80 pixel-font text-xs">
                <span className="pulse-light h-3 w-3 rounded-full bg-[#76d68a]" />
                online
              </div>
            </div>
          </div>

          <div className="arcade-frame relative min-h-[300px] overflow-hidden rounded-sm bg-[#151715] p-3 text-left md:min-h-[390px]">
            <div className="absolute inset-3 bg-[linear-gradient(130deg,rgba(217,224,116,0.16),transparent_30%),linear-gradient(180deg,#34402f,#151715)]" />
            <div className="absolute left-10 top-10 h-1 w-20 bg-[#eeecd0]/20" />
            <div className="absolute left-10 top-10 h-24 w-1 bg-[#eeecd0]/20" />
            <div className="absolute bottom-16 right-10 h-1 w-28 bg-[#eeecd0]/20" />
            <div className="absolute bottom-16 right-10 h-20 w-1 bg-[#eeecd0]/20" />
            <div className="arcade-glow absolute left-[17%] top-[38%] h-5 w-24 rounded-full bg-[#d9e074]/80 blur-md" />
            <div className="arcade-glow absolute right-[16%] top-[48%] h-5 w-20 rounded-full bg-[#ef7d4f]/70 blur-md" />

            <div className="relative z-10 grid h-full min-h-[274px] grid-cols-2 grid-rows-2 gap-3 md:min-h-[364px]">
              {previewTiles.map((tile, index) => (
                <div key={tile} className={`pixel-tile rounded-sm border border-[#eeecd0]/20 bg-gradient-to-br ${tile} p-3 shadow-[inset_0_0_30px_rgba(0,0,0,0.35)]`}>
                  <span className="pixel-font text-xs text-[#1f2120]/75">stage 0{index + 1}</span>
                </div>
              ))}
            </div>

            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between rounded-sm bg-[#eeecd0] px-4 py-2 text-[#1f2120] pixel-font text-xs">
              <span>score 12800</span>
              <span>press start</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
