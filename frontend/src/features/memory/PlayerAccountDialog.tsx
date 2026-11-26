import { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, UserPlus, X } from 'lucide-react';
import { rankingApi } from '../../api/ranking';

export function PlayerAccountDialog({ onClose, onLogin }: { onClose: () => void; onLogin: (username: string) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const account = mode === 'register'
        ? await rankingApi.register(username.trim(), password)
        : await rankingApi.login(username.trim(), password);
      onLogin(account.username);
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível entrar agora.');
    } finally { setBusy(false); }
  }

  return <motion.div className="account-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.section className="account-dialog" role="dialog" aria-modal="true" aria-labelledby="account-title"
      initial={{ opacity: 0, scale: .92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}>
      <button className="account-close icon-button" aria-label="Fechar login" onClick={onClose}><X size={19} /></button>
      <span className="account-dialog-icon">{mode === 'login' ? <LogIn size={28} /> : <UserPlus size={28} />}</span>
      <h2 id="account-title">{mode === 'login' ? 'Entrar na aventura' : 'Criar conta de jogador'}</h2>
      <p>Use sua conta para salvar pontuações no ranking online.</p>
      <form onSubmit={submit}>
        <label htmlFor="player-account-name">Nome da conta</label>
        <input id="player-account-name" value={username} onChange={(event) => setUsername(event.target.value)} minLength={3} maxLength={30} pattern="[A-Za-z0-9_.-]+" required autoComplete="username" />
        <label htmlFor="player-account-password">Senha</label>
        <input id="player-account-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={12} maxLength={72} required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
        {error && <p className="account-error" role="alert">{error}</p>}
        <button className="ribbon-button" type="submit" disabled={busy}>{busy ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}</button>
      </form>
      <button className="account-switch" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
        {mode === 'login' ? 'Ainda não tem conta? Criar agora' : 'Já tem conta? Entrar'}
      </button>
    </motion.section>
  </motion.div>;
}
