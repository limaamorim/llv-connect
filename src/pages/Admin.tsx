import { useCallback, useEffect, useState } from 'react';
import { BarChart3, Boxes, FolderPlus, LogOut, PackagePlus, ShoppingBag } from 'lucide-react';
import type { Produto } from '../types/produto';
import { moeda } from '../utils/whatsapp';
import { configurado, entrar, sair, temSessao, listarCategorias, listarProdutos, listarVendas, salvarProduto, excluirProduto, salvarCategoria, editarCategoria, excluirCategoria, registrarVenda } from '../services/supabase';
import type { CategoriaLoja, Venda } from '../services/supabase';

type Aba = 'resumo' | 'produtos' | 'categorias' | 'vendas';
const vazio = { nome: '', descricao: '', categoria: '', preco: 0, custo: 0, estoque: 0, imagem: '', modelos: [] as string[], destaque: false, novidade: false, ativo: true };

// Os campos do formulário usam o mesmo formato de Produto, sem o ID.
export function Admin({ onInicio }: { onInicio: () => void }) {
  const [autenticado, setAutenticado] = useState(temSessao());
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [aba, setAba] = useState<Aba>('resumo');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaLoja[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [edicao, setEdicao] = useState<number | null>(null);
  const [formulario, setFormulario] = useState(vazio);
  const [nomeCategoria, setNomeCategoria] = useState('');
  const [vendaProduto, setVendaProduto] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [precoVenda, setPrecoVenda] = useState(0);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  const recarregar = useCallback(async () => {
    const [p, c, v] = await Promise.all([listarProdutos(true), listarCategorias(), listarVendas()]);
    setProdutos(p); setCategorias(c); setVendas(v);
  }, []);

  useEffect(() => {
    if (autenticado) recarregar().catch(e => setErro(e.message));
  }, [autenticado, recarregar]);

  async function executar(acao: () => Promise<unknown>, sucesso: string) {
    setErro(''); setMensagem(''); setCarregando(true);
    try { await acao(); await recarregar(); setMensagem(sucesso); }
    catch (e) { setErro(e instanceof Error ? e.message : 'Não foi possível salvar.'); }
    finally { setCarregando(false); }
  }

  function editar(item: Produto) {
    setEdicao(item.id);
    setFormulario({ nome: item.nome, descricao: item.descricao, categoria: item.categoria, preco: item.preco, custo: item.custo || 0, estoque: item.estoque || 0, imagem: item.imagem, modelos: item.modelos || [], destaque: !!item.destaque, novidade: !!item.novidade, ativo: item.ativo !== false });
  }

  if (!configurado) return <main className="container admin-wrap"><h1>Configuração do administrador</h1><p>Para proteger os produtos e as vendas, o painel só funciona depois que o Supabase estiver configurado.</p><p>Consulte o <code>README.md</code> e execute o arquivo <code>supabase/schema.sql</code>.</p><button className="btn btn-primary" onClick={onInicio}>Voltar à loja</button></main>;

  if (!autenticado) return <main className="container admin-wrap"><form className="admin-login" onSubmit={async e => { e.preventDefault(); setErro(''); setCarregando(true); try { await entrar(email, senha); setAutenticado(true); } catch (e) { setErro(e instanceof Error ? e.message : 'Falha no login'); } finally { setCarregando(false); } }}><h1>Área administrativa</h1><p>Acesso exclusivo da equipe LLV Connect.</p><label>E-mail<input type="email" required value={email} onChange={e => setEmail(e.target.value)}/></label><label>Senha<input type="password" required value={senha} onChange={e => setSenha(e.target.value)}/></label>{erro && <p className="admin-erro">{erro}</p>}<button className="btn btn-primary" disabled={carregando}>Entrar</button><button type="button" className="link-button" onClick={onInicio}>Voltar à loja</button></form></main>;

  const faturamento = vendas.reduce((s, v) => s + v.quantidade * v.preco_unitario, 0);
  const lucro = vendas.reduce((s, v) => s + v.quantidade * (v.preco_unitario - v.custo_unitario), 0);
  const itemVenda = produtos.find(p => String(p.id) === vendaProduto);

  return <main className="container admin-wrap">
    <div className="admin-top"><div><p className="eyebrow">LLV CONNECT</p><h1>Painel administrativo</h1><p>Controle os produtos e as vendas em um só lugar.</p></div><button className="btn btn-outline" onClick={() => { sair(); setAutenticado(false); }}><LogOut size={17}/> Sair</button></div>
    <nav className="admin-tabs" aria-label="Menu administrativo">
      {([{id:'resumo',texto:'Dashboard',icone:BarChart3},{id:'produtos',texto:'Produtos',icone:Boxes},{id:'categorias',texto:'Categorias',icone:FolderPlus},{id:'vendas',texto:'Vendas',icone:ShoppingBag}] as const).map(({id,texto,icone:Icone}) => <button key={id} className={aba===id?'selected':''} onClick={()=>{setAba(id);setErro('');setMensagem('')}}><Icone size={17}/>{texto}</button>)}
    </nav>
    {erro && <p role="alert" className="admin-erro">{erro}</p>}{mensagem && <p role="status" className="admin-sucesso">{mensagem}</p>}
    {aba==='resumo' && <><div className="admin-stats"><article><span>Faturamento registrado</span><strong>{moeda(faturamento)}</strong></article><article><span>Lucro bruto estimado</span><strong>{moeda(lucro)}</strong></article><article><span>Vendas registradas</span><strong>{vendas.length}</strong></article><article><span>Unidades em estoque</span><strong>{produtos.reduce((s,p)=>s+(p.estoque||0),0)}</strong></article></div><section className="admin-panel"><h2>Visão geral</h2><p>O lucro bruto considera valor vendido menos custo dos produtos. Não inclui frete, impostos, taxas ou outras despesas.</p><p>Produtos cadastrados: <b>{produtos.length}</b> · Categorias: <b>{categorias.length}</b> · Itens com estoque zerado: <b>{produtos.filter(p=>p.estoque===0).length}</b></p></section></>}
    {aba==='produtos' && <div className="admin-columns"><section className="admin-panel"><h2><PackagePlus size={20}/> {edicao ? 'Editar produto' : 'Novo produto'}</h2><form className="admin-form" onSubmit={e=>{e.preventDefault();executar(()=>salvarProduto(formulario,edicao||undefined),'Produto salvo com sucesso.').then(()=>{setEdicao(null);setFormulario(vazio);});}}>
      <label>Nome<input required value={formulario.nome} onChange={e=>setFormulario({...formulario,nome:e.target.value})}/></label>
      <label>Categoria<select required value={formulario.categoria} onChange={e=>setFormulario({...formulario,categoria:e.target.value})}><option value="">Selecione</option>{categorias.map(c=><option key={c.id} value={c.nome}>{c.nome}</option>)}</select></label>
      <label>Descrição<textarea value={formulario.descricao} onChange={e=>setFormulario({...formulario,descricao:e.target.value})}/></label>
      <div className="admin-grid2"><label>Preço (R$)<input type="number" min="0" step="0.01" required value={formulario.preco} onChange={e=>setFormulario({...formulario,preco:Number(e.target.value)})}/></label><label>Custo (R$)<input type="number" min="0" step="0.01" required value={formulario.custo} onChange={e=>setFormulario({...formulario,custo:Number(e.target.value)})}/></label></div>
      <label>Estoque (unidades)<input type="number" min="0" step="1" required value={formulario.estoque} onChange={e=>setFormulario({...formulario,estoque:Number(e.target.value)})}/></label>
      <label>Imagem (URL pública)<input placeholder="https://..." value={formulario.imagem} onChange={e=>setFormulario({...formulario,imagem:e.target.value})}/></label>
      <label>Modelos compatíveis (separados por vírgula)<textarea placeholder="iPhone 12 Pro, Galaxy A55" value={formulario.modelos.join(', ')} onChange={e=>setFormulario({...formulario,modelos:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}/><small>Deixe vazio para acessórios universais. Use o nome exato do aparelho.</small></label>
      <div className="admin-checks"><label><input type="checkbox" checked={formulario.ativo} onChange={e=>setFormulario({...formulario,ativo:e.target.checked})}/> Ativo</label><label><input type="checkbox" checked={formulario.destaque} onChange={e=>setFormulario({...formulario,destaque:e.target.checked})}/> Destaque</label><label><input type="checkbox" checked={formulario.novidade} onChange={e=>setFormulario({...formulario,novidade:e.target.checked})}/> Novidade</label></div>
      <button className="btn btn-primary" disabled={carregando}>{edicao?'Salvar alterações':'Cadastrar produto'}</button>{edicao&&<button type="button" className="btn btn-outline" onClick={()=>{setEdicao(null);setFormulario(vazio);}}>Cancelar edição</button>}
    </form></section><section className="admin-panel"><h2>Produtos cadastrados</h2>{produtos.map(p=><div className="admin-item" key={p.id}><div><strong>{p.nome}</strong><small>{p.categoria} · {moeda(p.preco)} · Estoque: {p.estoque}</small></div><div className="admin-actions"><button onClick={()=>editar(p)}>Editar</button><button className="danger" disabled={carregando} onClick={()=>{if(window.confirm('Excluir este produto? Vendas existentes poderão impedir a exclusão.')) executar(()=>excluirProduto(p.id),'Produto excluído.');}}>Excluir</button></div></div>)}</section></div>}
    {aba==='categorias' && <section className="admin-panel"><h2>Categorias</h2><form className="admin-inline" onSubmit={e=>{e.preventDefault();if(!nomeCategoria.trim())return;executar(()=>salvarCategoria(nomeCategoria),'Categoria cadastrada.').then(()=>setNomeCategoria(''));}}><input placeholder="Nome da categoria" required value={nomeCategoria} onChange={e=>setNomeCategoria(e.target.value)}/><button disabled={carregando} className="btn btn-primary">Adicionar</button></form>{categorias.map(c=><div key={c.id} className="admin-item"><strong>{c.nome}</strong><div className="admin-actions"><button onClick={()=>{const novo=window.prompt('Novo nome da categoria:', c.nome);if(novo?.trim()&&novo.trim()!==c.nome) executar(()=>editarCategoria(c.id,novo),'Categoria atualizada.');}}>Editar</button><button className="danger" disabled={carregando} onClick={()=>{if(window.confirm('Excluir categoria? Ela não pode estar em uso por produtos.'))executar(()=>excluirCategoria(c.id),'Categoria excluída.');}}>Excluir</button></div></div>)}</section>}
    {aba==='vendas' && <div className="admin-columns"><section className="admin-panel"><h2>Registrar venda</h2><p>Registre aqui a venda confirmada no WhatsApp ou no balcão.</p><form className="admin-form" onSubmit={e=>{e.preventDefault();if(!itemVenda)return;executar(()=>registrarVenda(itemVenda.id,quantidade,precoVenda),'Venda registrada e estoque atualizado.').then(()=>{setVendaProduto('');setQuantidade(1);setPrecoVenda(0);});}}><label>Produto<select required value={vendaProduto} onChange={e=>{setVendaProduto(e.target.value);setPrecoVenda(produtos.find(p=>String(p.id)===e.target.value)?.preco||0);}}><option value="">Escolha um produto</option>{produtos.map(p=><option key={p.id} value={p.id}>{p.nome} ({p.estoque} em estoque)</option>)}</select></label><label>Quantidade<input type="number" min="1" step="1" required value={quantidade} onChange={e=>setQuantidade(Number(e.target.value))}/></label><label>Preço por unidade (R$)<input type="number" min="0" step="0.01" required value={precoVenda} onChange={e=>setPrecoVenda(Number(e.target.value))}/></label>{itemVenda&&<p>Lucro bruto estimado: <b>{moeda(quantidade*(precoVenda-(itemVenda.custo||0)))}</b></p>}<button className="btn btn-primary" disabled={carregando||!itemVenda}>Registrar venda</button></form></section><section className="admin-panel"><h2>Histórico de vendas</h2>{vendas.length===0&&<p>Nenhuma venda registrada.</p>}{vendas.map(v=><div key={v.id} className="admin-item"><div><strong>{v.produto_nome}</strong><small>{new Date(v.criada_em).toLocaleDateString('pt-BR')} · {v.quantidade} unidade(s)</small></div><div><strong>{moeda(v.quantidade*v.preco_unitario)}</strong><small>Lucro: {moeda(v.quantidade*(v.preco_unitario-v.custo_unitario))}</small></div></div>)}</section></div>}
  </main>;
}
