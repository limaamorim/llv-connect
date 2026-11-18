import { produtos as exemplos } from '../data/produtos';
import type { Produto } from '../types/produto';

// Modo demonstração: dados persistem somente neste navegador (localStorage).
export type CategoriaDemo = { id: number; nome: string };
export type VendaDemo = {
  id: number;
  produto_id: number;
  produto_nome: string;
  quantidade: number;
  preco_unitario: number;
  custo_unitario: number;
  criada_em: string;
};
type Dados = { produtos: Produto[]; categorias: CategoriaDemo[]; vendas: VendaDemo[] };
const chave = 'llv-demo-v1';
function ler(): Dados {
  try {
    const salvo = localStorage.getItem(chave);
    if (salvo) {
      const dados = JSON.parse(salvo) as Dados;
      if (
        Array.isArray(dados.produtos) &&
        Array.isArray(dados.categorias) &&
        Array.isArray(dados.vendas)
      )
        return dados;
    }
  } catch {
    /* Inicia novamente se os dados estiverem inválidos. */
  }
  return {
    produtos: exemplos.map((p) => ({
      ...p,
      modelos: [...p.modelos],
      custo: 0,
      estoque: 10,
      ativo: true,
    })),
    categorias: ['Capinhas', 'Películas', 'Carregadores', 'Fones', 'Acessórios'].map(
      (nome, i) => ({ id: i + 1, nome }),
    ),
    vendas: [],
  };
}
function gravar(dados: Dados) {
  localStorage.setItem(chave, JSON.stringify(dados));
}
export const demo = {
  produtos: (admin = false) => ler().produtos.filter((p) => admin || p.ativo !== false),
  categorias: () => ler().categorias,
  vendas: () => [...ler().vendas].reverse(),
  salvarProduto: (produto: Omit<Produto, 'id'>, id?: number) => {
    const d = ler();
    if (!d.categorias.some((c) => c.nome === produto.categoria))
      throw Error('Categoria inválida.');
    if (id !== undefined) {
      const i = d.produtos.findIndex((p) => p.id === id);
      if (i < 0) throw Error('Produto não encontrado.');
      d.produtos[i] = { ...produto, id };
    } else
      d.produtos.push({
        ...produto,
        id: Math.max(0, ...d.produtos.map((p) => p.id)) + 1,
      });
    gravar(d);
  },
  excluirProduto: (id: number) => {
    const d = ler();
    if (d.vendas.some((v) => v.produto_id === id))
      throw Error('Este produto possui vendas. Desative-o para preservar o histórico.');
    d.produtos = d.produtos.filter((p) => p.id !== id);
    gravar(d);
  },
  salvarCategoria: (nome: string) => {
    const d = ler();
    nome = nome.trim();
    if (!nome || d.categorias.some((c) => c.nome.toLowerCase() === nome.toLowerCase()))
      throw Error('Categoria vazia ou duplicada.');
    d.categorias.push({ id: Math.max(0, ...d.categorias.map((c) => c.id)) + 1, nome });
    gravar(d);
  },
  editarCategoria: (id: number, nome: string) => {
    const d = ler();
    nome = nome.trim();
    const c = d.categorias.find((c) => c.id === id);
    if (
      !c ||
      !nome ||
      d.categorias.some((c) => c.id !== id && c.nome.toLowerCase() === nome.toLowerCase())
    )
      throw Error('Nome inválido ou duplicado.');
    d.produtos = d.produtos.map((p) =>
      p.categoria === c.nome ? { ...p, categoria: nome } : p,
    );
    c.nome = nome;
    gravar(d);
  },
  excluirCategoria: (id: number) => {
    const d = ler(),
      c = d.categorias.find((c) => c.id === id);
    if (!c) throw Error('Categoria não encontrada.');
    if (d.produtos.some((p) => p.categoria === c.nome))
      throw Error('Remova ou mova os produtos antes de excluir esta categoria.');
    d.categorias = d.categorias.filter((c) => c.id !== id);
    gravar(d);
  },
  registrarVenda: (id: number, qtd: number, preco: number) => {
    const d = ler(),
      p = d.produtos.find((p) => p.id === id);
    if (!p) throw Error('Produto não encontrado.');
    if (!Number.isInteger(qtd) || qtd <= 0 || !Number.isFinite(preco) || preco < 0)
      throw Error('Quantidade ou preço inválido.');
    if ((p.estoque || 0) < qtd) throw Error('Estoque insuficiente.');
    p.estoque = (p.estoque || 0) - qtd;
    d.vendas.push({
      id: Math.max(0, ...d.vendas.map((v) => v.id)) + 1,
      produto_id: id,
      produto_nome: p.nome,
      quantidade: qtd,
      preco_unitario: preco,
      custo_unitario: p.custo || 0,
      criada_em: new Date().toISOString(),
    });
    gravar(d);
  },
};
