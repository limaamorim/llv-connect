import type { Produto } from '../types/produto';

// Conexão com o Supabase sem bibliotecas adicionais.
// Configure as duas variáveis no .env.local (veja o README).
const url = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const chave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
export const configurado = Boolean(url && chave);

export type CategoriaLoja = { id: number; nome: string };
export type Venda = { id: number; produto_id: number; produto_nome: string; quantidade: number; preco_unitario: number; custo_unitario: number; criada_em: string };
type Sessao = { access_token: string; expires_at?: number };

function lerSessao(): Sessao | null {
  try { return JSON.parse(sessionStorage.getItem('llv_sessao') || 'null'); } catch { return null; }
}
export function temSessao() { return Boolean(lerSessao()?.access_token); }
export function sair() { sessionStorage.removeItem('llv_sessao'); }

async function requisicao(caminho: string, opcoes: RequestInit = {}, privado = false) {
  if (!configurado) throw new Error('Configure o Supabase no arquivo .env.local.');
  const sessao = lerSessao();
  if (privado && !sessao) throw new Error('Faça login no painel administrativo.');
  const resposta = await fetch(url + caminho, {
    ...opcoes,
    headers: {
      apikey: chave,
      ...(privado ? { Authorization: 'Bearer ' + sessao?.access_token } : {}),
      'Content-Type': 'application/json',
      ...opcoes.headers,
    },
  });
  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    throw new Error(erro.message || erro.msg || erro.error_description || erro.hint || 'Erro de comunicação com o banco (' + resposta.status + ').');
  }
  if (resposta.status === 204) return null;
  return resposta.json();
}

export async function entrar(email: string, senha: string) {
  const dados = await requisicao('/auth/v1/token?grant_type=password', {
    method: 'POST', body: JSON.stringify({ email, password: senha }),
  });
  // Verifica a permissão antes de liberar as telas administrativas.
  const teste = await fetch(url + '/rest/v1/administradores?select=user_id&limit=1', {
    headers: { apikey: chave, Authorization: 'Bearer ' + dados.access_token },
  });
  if (!teste.ok || !(await teste.json()).length) throw new Error('Esta conta não possui permissão de administrador.');
  sessionStorage.setItem('llv_sessao', JSON.stringify({ access_token: dados.access_token }));
}

export async function listarProdutos(admin = false): Promise<Produto[]> {
  const colunas = admin ? '*' : 'id,nome,descricao,categoria,preco,estoque,imagem,modelos,destaque,novidade,ativo';
  const filtro = admin ? '' : '&ativo=eq.true';
  return requisicao('/rest/v1/produtos?select=' + colunas + '&order=id.desc' + filtro, {}, admin);
}
export async function listarCategorias(): Promise<CategoriaLoja[]> {
  return requisicao('/rest/v1/categorias?select=*&order=nome.asc');
}
export async function salvarCategoria(nome: string) {
  return requisicao('/rest/v1/categorias', { method: 'POST', body: JSON.stringify({ nome: nome.trim() }) }, true);
}
export async function editarCategoria(id: number, nome: string) {
  return requisicao('/rest/v1/categorias?id=eq.' + id, {
    method: 'PATCH', body: JSON.stringify({ nome: nome.trim() }),
  }, true);
}
export async function excluirCategoria(id: number) {
  return requisicao('/rest/v1/categorias?id=eq.' + id, { method: 'DELETE' }, true);
}
export async function salvarProduto(produto: Omit<Produto, 'id'>, id?: number) {
  const caminho = '/rest/v1/produtos' + (id ? '?id=eq.' + id : '');
  return requisicao(caminho, {
    method: id ? 'PATCH' : 'POST',
    body: JSON.stringify(produto),
  }, true);
}
export async function excluirProduto(id: number) {
  return requisicao('/rest/v1/produtos?id=eq.' + id, { method: 'DELETE' }, true);
}
export async function listarVendas(): Promise<Venda[]> {
  return requisicao('/rest/v1/vendas?select=*&order=criada_em.desc', {}, true);
}
export async function registrarVenda(produtoId: number, quantidade: number, precoUnitario: number) {
  // Função SQL registra a venda e baixa o estoque numa mesma transação.
  return requisicao('/rest/v1/rpc/registrar_venda', {
    method: 'POST',
    body: JSON.stringify({ p_produto_id: produtoId, p_quantidade: quantidade, p_preco_unitario: precoUnitario }),
  }, true);
}
