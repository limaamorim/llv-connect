import type { Produto } from '../types/produto';

// Serviço da VITRINE PÚBLICA: somente leitura.
// Não utiliza login nem carrega informações internas (como custo e vendas).
const url = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const chave =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

export const catalogoConfigurado = Boolean(url && chave);

export type CategoriaPublica = {
  id: number;
  nome: string;
};

// As chaves antigas (anon) eram JWT. As novas chaves publicáveis não são.
// Nunca coloque service_role ou secret key no código do navegador.
const cabecalhos: Record<string, string> = {
  apikey: chave,
  ...(chave.startsWith('eyJ') ? { Authorization: `Bearer ${chave}` } : {}),
};

async function consultar<T>(caminho: string, signal?: AbortSignal): Promise<T> {
  const resposta = await fetch(`${url}/rest/v1/${caminho}`, {
    headers: cabecalhos,
    signal,
  });

  if (!resposta.ok) {
    const detalhes = await resposta.json().catch(() => ({}));
    throw new Error(
      detalhes.message ||
        detalhes.hint ||
        `Falha ao carregar os dados do Supabase (${resposta.status}).`,
    );
  }

  return resposta.json();
}

// O PostgREST geralmente limita cada resposta a 1.000 registros.
// Por isso buscamos em páginas de 500, sem cortar produtos da vitrine.
export async function buscarProdutosPublicos(signal?: AbortSignal): Promise<Produto[]> {
  if (!catalogoConfigurado) return [];

  const produtos: Produto[] = [];
  const tamanhoPagina = 500;
  let pagina = 0;

  while (true) {
    const campos =
      'id,nome,descricao,categoria,preco,estoque,imagem,modelos,destaque,novidade,ativo';
    const caminho =
      `produtos?select=${campos}&ativo=eq.true&order=id.desc` +
      `&limit=${tamanhoPagina}&offset=${pagina * tamanhoPagina}`;

    const resultado = await consultar<Produto[]>(caminho, signal);

    produtos.push(
      ...resultado.map((produto) => ({
        ...produto,
        preco: Number(produto.preco),
        estoque: Number(produto.estoque ?? 0),
        imagem: produto.imagem || '',
        modelos: Array.isArray(produto.modelos) ? produto.modelos : [],
      })),
    );

    if (resultado.length < tamanhoPagina) break;
    pagina += 1;
  }

  return produtos;
}

export async function buscarCategoriasPublicas(
  signal?: AbortSignal,
): Promise<CategoriaPublica[]> {
  if (!catalogoConfigurado) return [];

  return consultar<CategoriaPublica[]>(
    'categorias?select=id,nome&order=nome.asc',
    signal,
  );
}
