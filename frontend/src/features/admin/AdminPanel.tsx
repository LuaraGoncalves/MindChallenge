import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Brain, FolderOpen, ImageIcon, LogOut, Pencil, Plus, Save, Search, ShieldCheck, Trash2, X } from 'lucide-react';
import { AdminApiError, adminApi } from '../../api/admin';
import { imageUrl } from '../../api/config';
import type { AdminCharacter, AdminTheme } from '../../api/admin';
import './admin.css';

const emptyTheme = { id: '', name: '', active: true };
const emptyCharacter = { id: '', name: '', themeId: '', imageUrl: '', active: true };

function Thumbnail({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  const valid = url.startsWith('https://') || url.startsWith('/api/media/') || url.startsWith('blob:');
  return valid && !failed ? <img src={imageUrl(url)} alt="" onError={() => setFailed(true)} /> : <ImageIcon size={24} aria-hidden="true" />;
}

export default function AdminPanel() {
  const [admin, setAdmin] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [page, setPage] = useState<'characters' | 'themes'>('characters');
  const [themes, setThemes] = useState<AdminTheme[]>([]);
  const [characters, setCharacters] = useState<AdminCharacter[]>([]);
  const [catalogReady, setCatalogReady] = useState(false);
  const [query, setQuery] = useState('');
  const [themeForm, setThemeForm] = useState(emptyTheme);
  const [characterForm, setCharacterForm] = useState(emptyCharacter);
  const [source, setSource] = useState<'url' | 'upload'>('upload');
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState('');
  const [fileVersion, setFileVersion] = useState(0);
  const editorRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.title = 'Administração | MindChallenge';
    let active = true;
    adminApi.me().then(user => { if (active) setAdmin(user.username); }).catch(exception => {
      if (active && !(exception instanceof AdminApiError && exception.status === 401)) setError('Não foi possível acessar a API. Confira se o backend está ligado.');
    }).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!admin) return;
    let active = true;
    Promise.all([adminApi.themes(), adminApi.characters()]).then(([themeList, characterList]) => {
      if (active) { setThemes(themeList); setCharacters(characterList); setCatalogReady(true); }
    }).catch(exception => { if (active) {
      setCatalogReady(true);
      if (exception instanceof AdminApiError && [401, 403].includes(exception.status)) setAdmin(null);
      setError(exception instanceof Error ? exception.message : 'Erro ao carregar cadastros.');
    } });
    return () => { active = false; };
  }, [admin]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function resetCharacter() { setCharacterForm(emptyCharacter); setFile(undefined); setPreview(''); setSource('upload'); setFileVersion(value => value + 1); }
  async function refresh() {
    const [themeList, characterList] = await Promise.all([adminApi.themes(), adminApi.characters()]);
    setThemes(themeList); setCharacters(characterList);
  }
  async function run(task: () => Promise<void>) {
    setBusy(true); setError(''); setNotice('');
    try { await task(); }
    catch (exception) {
      if (exception instanceof AdminApiError && [401, 403].includes(exception.status)) { setAdmin(null); setThemes([]); setCharacters([]); }
      setError(exception instanceof Error ? exception.message : 'Não foi possível concluir a operação.');
    } finally { setBusy(false); }
  }

  if (checking) return <div className="admin-app admin-login"><p role="status">Verificando sessão…</p></div>;
  if (!admin) return <div className="admin-app admin-login">
    <a className="admin-back" href="/"><ArrowLeft size={17} />Voltar ao jogo</a>
    <form className="admin-login-form" onSubmit={event => { event.preventDefault(); void run(async () => {
      try { const user = await adminApi.login(loginName, password); setCatalogReady(false); setAdmin(user.username); }
      finally { setPassword(''); }
    }); }}>
      <ShieldCheck size={34} /><h1>Administração</h1><p>MindChallenge</p>
      {error && <p className="admin-error" role="alert">{error}</p>}
      <label>Usuário<input value={loginName} onChange={event => setLoginName(event.target.value)} autoComplete="username" required maxLength={100} /></label>
      <label>Senha<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required /></label>
      <button className="admin-primary" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
    </form>
  </div>;

  const filteredCharacters = characters.filter(character => `${character.name} ${themes.find(theme => theme.id === character.themeId)?.name ?? ''}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const filteredThemes = themes.filter(theme => theme.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  return <div className="admin-app">
    <header className="admin-header"><a href="/" className="admin-brand"><Brain size={24} />MindChallenge <span>Admin</span></a><div><span>{admin}</span><button disabled={busy} onClick={() => void run(async () => { await adminApi.logout(); setAdmin(null); setCharacters([]); setThemes([]); resetCharacter(); })}><LogOut size={17} />Sair</button></div></header>
    <div className="admin-shell">
      <nav className="admin-nav" aria-label="Administração"><button aria-pressed={page === 'characters'} onClick={() => { setPage('characters'); setQuery(''); setError(''); setNotice(''); }}><ImageIcon size={19} />Personagens<span>{characters.length}</span></button><button aria-pressed={page === 'themes'} onClick={() => { setPage('themes'); setQuery(''); setError(''); setNotice(''); }}><FolderOpen size={19} />Temas<span>{themes.length}</span></button><a href="/"><ArrowLeft size={17} />Abrir jogo</a></nav>
      <main className="admin-main">
        <div className="admin-page-title"><h1>{page === 'characters' ? 'Personagens' : 'Temas'}</h1><button className="admin-primary" disabled={busy} onClick={() => { if (page === 'characters') resetCharacter(); else setThemeForm(emptyTheme); editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}><Plus size={17} />{page === 'characters' ? 'Novo personagem' : 'Novo tema'}</button></div>
        {error && <p className="admin-error" role="alert">{error}</p>}{notice && <p className="admin-success" role="status">{notice}</p>}
        <div className="admin-workspace">
          <section className="admin-list" aria-label="Cadastros" aria-busy={!catalogReady || busy}>
            <label className="admin-search"><Search size={17} /><input aria-label="Buscar cadastros" placeholder="Buscar por nome…" value={query} onChange={event => setQuery(event.target.value)} /></label>
            <div className="admin-table-scroll"><table><thead><tr><th>Nome</th>{page === 'characters' && <th>Tema</th>}<th>Status</th><th><span className="sr-only">Ações</span></th></tr></thead>
              <tbody>{page === 'characters' ? filteredCharacters.map(character => <tr key={character.id}>
                <td><div className="admin-character-name"><span className="admin-thumb"><Thumbnail key={character.imageUrl} url={character.imageUrl} /></span><strong>{character.name}</strong></div></td>
                <td>{themes.find(theme => theme.id === character.themeId)?.name ?? '—'}</td><td><span className={`admin-status ${character.active ? 'active' : ''}`}>{character.active ? 'Ativo' : 'Inativo'}</span></td>
                <td><div className="admin-row-actions"><button className="icon-button" disabled={busy} title={`Editar ${character.name}`} aria-label={`Editar ${character.name}`} onClick={() => { setCharacterForm(character); setSource('url'); setFile(undefined); setPreview(''); setFileVersion(value => value + 1); editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}><Pencil size={16} /></button><button className="icon-button admin-delete" disabled={busy} title={`Excluir ${character.name}`} aria-label={`Excluir ${character.name}`} onClick={() => { if (window.confirm(`Excluir o personagem ${character.name}?`)) void run(async () => { await adminApi.deleteCharacter(character.id); await refresh(); if (characterForm.id === character.id) resetCharacter(); setNotice('Personagem excluído.'); }); }}><Trash2 size={16} /></button></div></td>
              </tr>) : filteredThemes.map(theme => <tr key={theme.id}><td><strong>{theme.name}</strong><small>{characters.filter(character => character.themeId === theme.id && character.active).length} personagens ativos</small></td><td><span className={`admin-status ${theme.active ? 'active' : ''}`}>{theme.active ? 'Ativo' : 'Inativo'}</span></td><td><div className="admin-row-actions"><button className="icon-button" disabled={busy} title={`Editar ${theme.name}`} aria-label={`Editar ${theme.name}`} onClick={() => { setThemeForm(theme); editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}><Pencil size={16} /></button><button className="icon-button admin-delete" disabled={busy} title={`Excluir ${theme.name}`} aria-label={`Excluir ${theme.name}`} onClick={() => { if (window.confirm(`Excluir o tema ${theme.name}?`)) void run(async () => { await adminApi.deleteTheme(theme.id); await refresh(); setThemeForm(emptyTheme); setNotice('Tema excluído.'); }); }}><Trash2 size={16} /></button></div></td></tr>)}
              {(page === 'characters' ? filteredCharacters : filteredThemes).length === 0 && <tr><td colSpan={4} className="admin-empty">{!catalogReady ? 'Carregando cadastros…' : query ? 'Nenhum resultado para esta busca.' : page === 'characters' ? 'Nenhum personagem cadastrado.' : 'Nenhum tema cadastrado.'}</td></tr>}
              </tbody></table></div>
          </section>
          <aside ref={editorRef} className="admin-editor" aria-label="Editor de cadastro" inert={busy}>
            {page === 'themes' ? <form onSubmit={event => { event.preventDefault(); void run(async () => { await adminApi.saveTheme({ name: themeForm.name, active: themeForm.active }, themeForm.id || undefined); await refresh(); setThemeForm(emptyTheme); setNotice('Tema salvo.'); }); }}>
              <h2>{themeForm.id ? 'Editar tema' : 'Novo tema'}</h2><label>Nome do tema<input value={themeForm.name} maxLength={100} required onChange={event => setThemeForm({ ...themeForm, name: event.target.value })} /></label>
              <label className="admin-checkbox"><input type="checkbox" checked={themeForm.active} onChange={event => setThemeForm({ ...themeForm, active: event.target.checked })} />Tema ativo</label>
              <div className="admin-form-actions"><button className="admin-primary" disabled={busy}><Save size={17} />{busy ? 'Salvando…' : 'Salvar tema'}</button><button type="button" disabled={busy} onClick={() => setThemeForm(emptyTheme)}><X size={17} />Limpar</button></div>
            </form> : <form onSubmit={event => { event.preventDefault(); void run(async () => {
              let url = characterForm.imageUrl;
              if (source === 'upload' && file) url = (await adminApi.upload(file)).url;
              if (!url) throw new Error('Envie uma imagem ou informe seu endereço HTTPS.');
              await adminApi.saveCharacter({ themeId: characterForm.themeId, name: characterForm.name, imageUrl: url, active: characterForm.active }, characterForm.id || undefined);
              await refresh(); resetCharacter(); setNotice('Personagem salvo.');
            }); }}>
              <h2>{characterForm.id ? 'Editar personagem' : 'Novo personagem'}</h2>
              <label>Nome<input value={characterForm.name} maxLength={100} required onChange={event => setCharacterForm({ ...characterForm, name: event.target.value })} /></label>
              <label>Tema<select aria-label="Tema" value={characterForm.themeId} required onChange={event => setCharacterForm({ ...characterForm, themeId: event.target.value })}><option value="">Selecione um tema</option>{themes.map(theme => <option key={theme.id} value={theme.id}>{theme.name}{!theme.active ? ' (inativo)' : ''}</option>)}</select></label>
              {themes.length === 0 && <button className="admin-inline" type="button" onClick={() => setPage('themes')}><Plus size={15} />Cadastrar tema</button>}
              <fieldset className="admin-image-source"><legend>Imagem</legend><label><input type="radio" name="image-source" checked={source === 'upload'} onChange={() => setSource('upload')} />Enviar arquivo</label><label><input type="radio" name="image-source" checked={source === 'url'} onChange={() => setSource('url')} />Usar URL</label></fieldset>
              {source === 'upload' ? <label>PNG ou JPEG · até 2 MB<input key={fileVersion} type="file" accept="image/png,image/jpeg" required={!characterForm.imageUrl} onChange={event => { const selected = event.target.files?.[0]; if (selected && (selected.size > 2 * 1024 * 1024 || !['image/png', 'image/jpeg'].includes(selected.type))) { setError('Envie PNG ou JPEG de até 2 MB.'); event.target.value = ''; setFile(undefined); setPreview(''); return; } setError(''); setFile(selected); setPreview(selected ? URL.createObjectURL(selected) : ''); }} /></label> : <label>Endereço da imagem<input type="text" inputMode="url" placeholder="https://…" required maxLength={2048} value={characterForm.imageUrl} onChange={event => setCharacterForm({ ...characterForm, imageUrl: event.target.value })} /></label>}
              <div className="admin-image-preview"><Thumbnail key={source === 'upload' ? preview || characterForm.imageUrl : characterForm.imageUrl} url={source === 'upload' ? preview || characterForm.imageUrl : characterForm.imageUrl} /></div>
              <label className="admin-checkbox"><input type="checkbox" checked={characterForm.active} onChange={event => setCharacterForm({ ...characterForm, active: event.target.checked })} />Personagem ativo</label>
              <div className="admin-form-actions"><button className="admin-primary" disabled={busy || themes.length === 0}><Save size={17} />{busy ? 'Salvando…' : 'Salvar personagem'}</button><button type="button" disabled={busy} onClick={resetCharacter}><X size={17} />Limpar</button></div>
            </form>}
          </aside>
        </div>
      </main>
    </div>
  </div>;
}
