import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useMachine } from '@xstate/react';
import { motion } from 'motion/react';
import Phaser from 'phaser';
import { ArrowLeft, Brain, Check, Clock3, Layers, LoaderCircle, Pause, Play, RotateCcw, Trophy, X, Sparkles, Medal, Heart } from 'lucide-react';
import { getMemoryCharacters } from '../../api/pokemon';
import { getCatalogCharacters, getMemoryThemes } from '../../api/memoryCatalog';
import type { MemoryCharacter, MemoryTheme } from '../../api/memoryCatalog';
import { memoryMachine, memoryScore } from './memoryMachine';
import type { MemoryCard } from './memoryMachine';
import { rankingApi, saveLocalScore } from '../../api/ranking';
import type { RankingEntry } from '../../api/ranking';

function makeCards(characters: MemoryCharacter[]): MemoryCard[] {
  return Phaser.Utils.Array.Shuffle(characters.flatMap((character) => [
    { key: `${character.id}-a`, character }, { key: `${character.id}-b`, character },
  ]));
}

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

function victoryMessage(attempts: number, pairs: number) {
  if (attempts <= pairs) return { title: 'PERFEITO!', message: 'Uma partida impecável! Você encontrou todos os pares de primeira.', icon: Sparkles, style: 'perfect' };
  if (attempts <= Math.ceil(pairs * 1.5)) return { title: 'EXCELENTE!', message: 'Sua memória está afiada. Mandou muito bem nessa aventura!', icon: Medal, style: 'excellent' };
  return { title: 'UFA, PARABÉNS!', message: 'O importante é não desistir. Você venceu e reuniu todos os pares!', icon: Heart, style: 'phew' };
}

function getSavedPlayerName() {
  try { return localStorage.getItem('mindchallenge:player-name') ?? ''; } catch { return ''; }
}

function MemoryBoard({ characters, canAnimate }: { characters: MemoryCharacter[]; canAnimate: boolean }) {
  const [initialCards] = useState(() => makeCards(characters));
  const [state, send] = useMachine(memoryMachine, { input: { cards: initialCards } });
  const { cards, revealed, matched, attempts, seconds } = state.context;
  const paused = state.matches('paused');
  const playing = state.matches('playing');
  const won = state.matches('won');
  const locked = paused || won || state.matches({ playing: 'mismatch' });
  const pairs = characters.length;
  const score = memoryScore(attempts, seconds, pairs);
  const [playerName, setPlayerName] = useState(getSavedPlayerName);
  const [password, setPassword] = useState('');
  const [saveMode, setSaveMode] = useState<'choose' | 'local' | 'account' | 'register'>('choose');
  const [account, setAccount] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);
  const scoreStoredRef = useRef(false);
  const winner = victoryMessage(attempts, pairs);
  const WinnerIcon = winner.icon;

  useEffect(() => {
    if (!playing || !state.context.started) return;
    const timer = window.setInterval(() => send({ type: 'TICK' }), 1000);
    return () => window.clearInterval(timer);
  }, [playing, state.context.started, send]);

  useEffect(() => {
    const onVisibility = () => { if (document.hidden) send({ type: 'PAUSE' }); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [send]);

  useEffect(() => {
    if (!won) {
      scoreStoredRef.current = false;
      return;
    }
    setRankingLoading(true);
    rankingApi.top().then(setRanking).catch(() => setRanking([])).finally(() => setRankingLoading(false));
    rankingApi.me().then((user) => { setAuthenticated(true); setAccount(user.username); }).catch(() => setAuthenticated(false));
  }, [won, score]);

  async function submitScore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = account.trim();
    if (!cleanName || !password || submitting || submitted) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const user = saveMode === 'register' ? await rankingApi.register(cleanName, password) : await rankingApi.login(cleanName, password);
      setAuthenticated(true);
      setAccount(user.username);
      setPassword('');
      await rankingApi.submit(user.username, score);
      setSubmitted(true);
      setRanking(await rankingApi.top());
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Falha ao enviar sua pontuação.');
    } finally { setSubmitting(false); }
  }

  function saveScoreLocally() {
    const cleanName = playerName.trim() || 'Jogador';
    try { localStorage.setItem('mindchallenge:player-name', cleanName); } catch { /* O placar atual ainda fica visível até fechar o jogo. */ }
    saveLocalScore({ playerName: cleanName, gameSlug: 'memory-kids', score });
    scoreStoredRef.current = true;
    setSubmitError('');
    setSubmitted(true);
  }

  function restart() {
    setSubmitted(false);
    setSubmitError('');
    send({ type: 'RESTART', cards: makeCards(characters) });
  }

  return (
    <>
      <div className="memory-scoreboard">
        <span><Layers size={18} /><strong>{matched.length / 2}/{pairs}</strong> pares</span>
        <span><Brain size={18} /><strong>{attempts}</strong> tentativas</span>
        <span><Clock3 size={18} /><strong>{formatTime(seconds)}</strong></span>
        <div className="memory-actions">
          <button className="icon-button" title={paused ? 'Continuar partida' : 'Pausar partida'}
            aria-label={paused ? 'Continuar partida' : 'Pausar partida'} disabled={won}
            onClick={() => send({ type: paused ? 'RESUME' : 'PAUSE' })}>{paused ? <Play size={18} /> : <Pause size={18} />}</button>
          <button className="icon-button" title="Reiniciar partida" aria-label="Reiniciar partida"
            onClick={() => send({ type: 'RESTART', cards: makeCards(characters) })}><RotateCcw size={18} /></button>
        </div>
      </div>
      <p className="memory-announcement" role="status" aria-live="polite">
        {won ? 'Todos os pares encontrados!' : paused ? 'Partida pausada.' : state.matches({ playing: 'mismatch' }) ? 'Não foi desta vez. Tente outro par.' : matched.length > 0 ? `${matched.length / 2} pares encontrados. Continue explorando!` : 'Encontre os pares de personagens iguais.'}
      </p>
      <div className="memory-table">
        <div className={`memory-grid memory-grid-${pairs}`} inert={paused} aria-label="Cartas do jogo da memória">
          {cards.map((card, index) => {
            const isMatched = matched.includes(card.key);
            const isFaceUp = isMatched || revealed.includes(card.key);
            return <button key={card.key} className={`memory-card ${isMatched ? 'is-matched' : ''}`}
              aria-label={`Carta ${index + 1}: ${isFaceUp ? card.character.name : 'virada para baixo'}${isMatched ? ', par encontrado' : ''}`}
              aria-pressed={isFaceUp} aria-disabled={locked || isFaceUp}
              onClick={() => { if (!locked) send({ type: 'FLIP', key: card.key }); }}>
              <motion.span className="memory-card-inner" initial={false}
                animate={{ rotateY: isFaceUp ? 180 : 0 }} transition={{ duration: canAnimate ? .36 : 0 }}>
                <span className="memory-card-back" aria-hidden="true"><span className="card-back-border"><Brain size={32} /><span>MC</span></span></span>
                <span className="memory-card-front" aria-hidden="true">
                  <img src={card.character.image} alt="" draggable={false} />
                  <span className="pokemon-name">{card.character.name}</span>
                  {isMatched && <Check className="memory-match-check" size={18} />}
                </span>
              </motion.span>
            </button>;
          })}
        </div>
        {paused && <div className="memory-pause"><Pause size={30} /><h3>Uma pausa na aventura</h3><button className="ribbon-button" onClick={() => send({ type: 'RESUME' })}><Play size={17} />Continuar</button></div>}
      </div>
      {won && <motion.div className={`victory-backdrop victory-${winner.style}`} role="dialog" aria-modal="true" aria-labelledby="victory-title"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.section className="victory-modal" initial={{ opacity: 0, scale: canAnimate ? .72 : 1, y: canAnimate ? 35 : 0, rotate: canAnimate ? -2 : 0 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 18 }}>
          <button className="victory-close icon-button" aria-label="Fechar resultado" onClick={restart}><X size={19} /></button>
          <div className="victory-burst" aria-hidden="true"><span /><span /><span /><span /><span /><span /></div>
          <div className="victory-emblem"><WinnerIcon size={35} /></div>
          <span className="victory-kicker">AVENTURA CONCLUÍDA</span>
          <h3 id="victory-title">{winner.title}</h3>
          <p className="victory-copy">{winner.message}</p>
          <div className="victory-stats"><span><Trophy size={17} />{score} pontos</span><span><Brain size={17} />{attempts} tentativas</span><span><Clock3 size={17} />{formatTime(seconds)}</span></div>
          {!submitted && saveMode === 'choose' && <div className="victory-save-options"><p>Onde quer guardar esta pontuação?</p>
            <button type="button" className="ribbon-button" onClick={() => setSaveMode('local')}>Salvar só neste aparelho</button>
            <button type="button" className="victory-account-choice" onClick={() => { setSaveMode('account'); setSubmitError(''); }}>Entrar ou criar conta para o placar online</button>
          </div>}
          {!submitted && saveMode === 'local' && <div className="victory-score-form"><label htmlFor="ranking-player-name">Seu nome no histórico deste aparelho</label>
            <div><input id="ranking-player-name" value={playerName} onChange={(event) => setPlayerName(event.target.value)} maxLength={40} placeholder="Como quer aparecer?" />
              <button className="ribbon-button" type="button" onClick={saveScoreLocally}>Salvar resultado</button></div>
            <button type="button" className="victory-account-choice local-back" onClick={() => setSaveMode('choose')}>Voltar às opções de salvamento</button>
            {submitError && <p className="ranking-error" role="alert">{submitError}</p>}
          </div>}
          {!submitted && (saveMode === 'account' || saveMode === 'register') && <form className="victory-score-form" onSubmit={submitScore}>
            <label htmlFor="ranking-account">Nome da conta</label><input id="ranking-account" value={account} onChange={(event) => setAccount(event.target.value)} minLength={3} maxLength={30} pattern="[A-Za-z0-9_.-]+" required placeholder="3 a 30 letras ou números" />
            {!authenticated && <><label htmlFor="ranking-password">Senha</label><input id="ranking-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={12} maxLength={72} required autoComplete={saveMode === 'register' ? 'new-password' : 'current-password'} placeholder="Pelo menos 12 caracteres" /> </>}
            <div className="account-form-actions"><button className="ribbon-button" type="submit" disabled={submitting || authenticated}>{submitting ? 'Enviando…' : authenticated ? `Conectado como ${account}` : 'Entrar e salvar'}</button>
              <button type="button" className="victory-account-choice" onClick={() => { setSaveMode(saveMode === 'register' ? 'account' : 'register'); setSubmitError(''); }}>{saveMode === 'register' ? 'Já tenho conta' : 'Criar conta'}</button></div>
            {submitError && <><p className="ranking-error" role="alert">{submitError} Você ainda pode salvar localmente.</p><button type="button" className="victory-account-choice local-back" onClick={() => { setPlayerName(account); setSaveMode('local'); }}>Salvar esta partida só neste aparelho</button></>}
            {authenticated && !submitted && <button type="button" className="ribbon-button account-save-score" disabled={submitting} onClick={async () => { setSubmitting(true); try { await rankingApi.submit(account, score); setSubmitted(true); setRanking(await rankingApi.top()); } catch (error) { setSubmitError(error instanceof Error ? error.message : 'Não foi possível salvar.'); } finally { setSubmitting(false); } }}>Salvar no placar online</button>}
          </form>}
          {submitted && <p className="ranking-success" role="status">{saveMode === 'local' ? 'Resultado salvo neste aparelho.' : 'Seu resultado entrou no ranking online!'}</p>}
          <div className="victory-leaderboard"><h4>Melhores aventureiros</h4>{rankingLoading ? <p role="status">Carregando placar…</p> : ranking.length ? <ol>{ranking.slice(0, 5).map((entry, index) => <li key={entry.id}><span>{index + 1}. {entry.playerName}</span><strong>{entry.score}</strong></li>)}</ol> : <p>O placar online aparecerá aqui quando estiver disponível.</p>}</div>
          <button className="victory-replay" onClick={restart}><RotateCcw size={16} />Jogar novamente</button>
        </motion.section>
      </motion.div>}
    </>
  );
}

export default function MemoryChallenge({ canAnimate, onClose }: { canAnimate: boolean; onClose: () => void }) {
  const [pairs, setPairs] = useState(8);
  const [request, setRequest] = useState(0);
  const [theme, setTheme] = useState('pokemon');
  const [themes, setThemes] = useState<MemoryTheme[]>([]);
  const [result, setResult] = useState<{ characters?: MemoryCharacter[]; error?: string }>({});
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); headingRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' }); }, []);
  useEffect(() => {
    const controller = new AbortController();
    getMemoryThemes(controller.signal).then(setThemes).catch(() => { /* Pokemon remains available if the catalog is offline. */ });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const load = theme === 'pokemon' ? getMemoryCharacters(pairs, controller.signal) : getCatalogCharacters(theme, pairs, controller.signal);
    load.then((characters) => {
      if (!controller.signal.aborted) setResult({ characters });
    }).catch(() => {
      if (!controller.signal.aborted) setResult({ error: 'Não foi possível carregar os personagens. Confira sua conexão e tente novamente.' });
    });
    return () => controller.abort();
  }, [pairs, request, theme]);

  function newGame(count = pairs) { setResult({}); setPairs(count); setRequest((value) => value + 1); }

  return <section id="memoria" className="memory-section page-width" aria-labelledby="memory-title">
    <div className="section-heading"><span className="heading-emblem"><Layers size={27} /></span><h2 id="memory-title" tabIndex={-1} ref={headingRef}>Jogo da memória</h2><span className="section-rule" /><button className="back-top" onClick={onClose}><ArrowLeft size={16} />Voltar ao mural</button></div>
    <div className="memory-toolbar"><p>Uma expedição entre pares de personagens.</p>
      <label>Coleção <select value={theme} aria-label="Coleção de personagens" onChange={event => {
        const selected = themes.find(item => item.id === event.target.value);
        const count = selected && selected.characterCount < pairs ? 6 : pairs;
        setTheme(event.target.value); newGame(count);
      }}><option value="pokemon">Pokémon · PokéAPI</option>{themes.map(item => <option key={item.id} value={item.id} disabled={item.characterCount < 6}>{item.name} · {item.characterCount} personagens{item.characterCount < 6 ? ' (mínimo 6)' : ''}</option>)}</select></label>
      <label>Dificuldade <select value={pairs} onChange={(event) => newGame(Number(event.target.value))} aria-label="Dificuldade do jogo">
        <option value={6}>Fácil · 6 pares</option><option value={8} disabled={theme !== 'pokemon' && (themes.find(item => item.id === theme)?.characterCount ?? 0) < 8}>Médio · 8 pares</option><option value={12} disabled={theme !== 'pokemon' && (themes.find(item => item.id === theme)?.characterCount ?? 0) < 12}>Difícil · 12 pares</option>
      </select></label>
      <button className="ribbon-button" onClick={() => newGame()} disabled={!result.characters && !result.error}><RotateCcw size={16} />Novos personagens</button>
    </div>
    <div className="memory-workbench">
      {result.characters ? <MemoryBoard key={`${pairs}-${request}`} characters={result.characters} canAnimate={canAnimate} /> : result.error ?
        <div className="memory-message" role="alert"><p>{result.error}</p><button className="ribbon-button" onClick={() => newGame()}>Tentar novamente</button></div> :
        <div className="memory-message" role="status"><LoaderCircle className="loading-compass" size={30} /><p>Reunindo os personagens…</p></div>}
    </div>
    <p className="memory-credits">{theme === 'pokemon' ? <>Personagens e imagens via <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">PokéAPI</a>. Pokémon pertence aos seus respectivos titulares. </> : <>Coleção {themes.find(item => item.id === theme)?.name}, cadastrada no MindChallenge. </>}Ao vencer, salve seu resultado no placar online.</p>
  </section>;
}
