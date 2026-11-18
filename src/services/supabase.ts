import { demo } from './demo';
import type { Produto } from '../types/produto';

// Somente a URL e a chave PUBLICÁVEL devem ir para o frontend.
const url = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const chave =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

export const configurado = Boolean(url && chave);

export type CategoriaLoja = { id: number; nome: string };
export type Venda = {
  id: number;
  produto_id: number;
  produto_nome: string;
  quantidade: number;
  preco_unitario: number;
  custo_unitario: number;
  criada_em: string;
};

type Sessao = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

function lerSessao(): Sessao | null {
  try {
    return JSON.parse(sessionStorage.getItem('llv_sessao') || 'null');
  } catch {
    return null;
  }
}

function salvarSessao(dados: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}) {
  const sessao: Sessao = {
    access_token: dados.access_token,
    refresh_token: dados.refresh_token,
    expires_at: Date.now() + dados.expires_in * 1000,
  };
  sessionStorage.setItem('llv_sessao', JSON.stringify(sessao));
}

export function temSessao() {
  const sessao = lerSessao();
  return Boolean(sessao?.access_token && (sessao.expires_at > Date.now() || sessao.refresh_token));
}

export function sair() {
  sessionStorage.removeItem('llv_sessao');
}

// Renova a sessão quando o token expira. O RLS continua validando a permissão
// de admin em CADA operação no Supabase.
export async function obterTokenAdministrador(): Promise<string> {
  const sessao = lerSessao();
  if (!sessao?.access_token) {
    throw new Error('Sua sessão terminou. Faça login novamente.');
  }

  if (sessao.expires_at > Date.now() + 60_000) {
    return sessao.access_token;
  }

  if (!sessao.refresh_token) {
    sair();
    throw new Error('Sua sessão terminou. Faça login novamente.');
  }

  const resposta = await fetch(
    url + '/auth/v1/token?grant_type=refresh_token',
    {
      method: 'POST',
      headers: {
        apikey: chave,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: sessao.refresh_token }),
    },
  );

  if (!resposta.ok) {
    sair();
    throw new Error('Sessão expirada. Entre novamente no administrador.');
  }

  const renovada = await resposta.json();
  salvarSessao(renovada);
  return renovada.access_token;
}

async function requisicao(
  caminho: string,
  opcoes: RequestInit = {},
  privado = false,
) {
  if (!configurado) {
    throw new Error('Configure o Supabase no arquivo .env.local.');
  }

  const token = privado ? await obterTokenAdministrador() : '';
  const resposta = await fetch(url + caminho, {
    ...opcoes,
    headers: {
      apikey: chave,
      ...(privado ? { Authorization: 'Bearer ' + token } : {}),
      'Content-Type': 'application/json',
      ...opcoes.headers,
    },
  });

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    throw new Error(
      erro.message ||
        erro.msg ||
        erro.error_description ||
        erro.hint ||
        'Erro de comunicação com o banco (' + resposta.status + ').',
    );
  }

  if (resposta.status === 204) return null;
  return resposta.json();
}

// Login no Supabase Auth e conferência da tabela de administradores.
export async function entrar(email: string, senha: string) {
  const dados = await requisicao('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password: senha }),
  });

  const permissoes = await fetch(
    url + '/rest/v1/administradores?select=user_id&limit=1',
    {
      headers: {
        apikey: chave,
        Authorization: 'Bearer ' + dados.access_token,
      },
    },
  );

  if (!permissoes.ok || !(await permissoes.json()).length) {
    throw new Error('Este usuário não possui permissão de administrador.');
  }

  salvarSessao(dados);
}

export async function listarProdutos(admin = false): Promise<Produto[]> {
  if (!configurado) return demo.produtos(admin);

  const colunas = admin
    ? '*'
    : 'id,nome,descricao,categoria,preco,estoque,imagem,modelos,destaque,novidade,ativo';

  const filtro = admin ? '' : '&ativo=eq.true';

  return requisicao(
    '/rest/v1/produtos?select=' + colunas + '&order=id.desc' + filtro,
    {},
    admin,
  );
}

export async function listarCategorias(): Promise<CategoriaLoja[]> {
  if (!configurado) return demo.categorias();

  return requisicao('/rest/v1/categorias?select=id,nome&order=nome.asc');
}

export async function salvarCategoria(nome: string) {
  if (!configurado) return demo.salvarCategoria(nome);

  return requisicao(
    '/rest/v1/categorias',
    {
      method: 'POST',
      body: JSON.stringify({ nome: nome.trim() }),
    },
    true,
  );
}

export async function editarCategoria(id: number, nome: string) {
  if (!configurado) return demo.editarCategoria(id, nome);

  return requisicao(
    '/rest/v1/categorias?id=eq.' + id,
    {
      method: 'PATCH',
      body: JSON.stringify({ nome: nome.trim() }),
    },
    true,
  );
}

export async function excluirCategoria(id: number) {
  if (!configurado) return demo.excluirCategoria(id);

  return requisicao(
    '/rest/v1/categorias?id=eq.' + id,
    { method: 'DELETE' },
    true,
  );
}

export async function salvarProduto(
  produto: Omit<Produto, 'id'>,
  id?: number,
) {
  if (!configurado) return demo.salvarProduto(produto, id);

  return requisicao(
    '/rest/v1/produtos' + (id ? '?id=eq.' + id : ''),
    {
      method: id ? 'PATCH' : 'POST',
      body: JSON.stringify(produto),
    },
    true,
  );
}

export async function excluirProduto(id: number) {
  if (!configurado) return demo.excluirProduto(id);

  return requisicao(
    '/rest/v1/produtos?id=eq.' + id,
    { method: 'DELETE' },
    true,
  );
}

export async function listarVendas(): Promise<Venda[]> {
  if (!configurado) return demo.vendas();

  return requisicao(
    '/rest/v1/vendas?select=*&order=criada_em.desc',
    {},
    true,
  );
}

export async function registrarVenda(
  produtoId: number,
  quantidade: number,
  precoUnitario: number,
) {
  if (!configurado) {
    return demo.registrarVenda(produtoId, quantidade, precoUnitario);
  }

  // Função SQL registra venda e baixa estoque numa única transação.
  return requisicao(
    '/rest/v1/rpc/registrar_venda',
    {
      method: 'POST',
      body: JSON.stringify({
        p_produto_id: produtoId,
        p_quantidade: quantidade,
        p_preco_unitario: precoUnitario,
      }),
    },
    true,
  );
}
