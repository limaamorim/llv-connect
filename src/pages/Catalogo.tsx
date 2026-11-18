import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CardProduto } from '../components/CardProduto';
import { aparelhos } from '../data/produtos';
import type { Categoria, Produto } from '../types/produto';

type Props = { produtos: Produto[]; categoriaInicial: Categoria; modeloInicial: string; onAbrir: (produto: Produto) => void };

export function Catalogo({ produtos, categoriaInicial, modeloInicial, onAbrir }: Props) {
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState<string>(categoriaInicial || 'Todas');
  const [modelo, setModelo] = useState(modeloInicial);
  const categorias = ['Todas', ...new Set([...produtos.map(p=>p.categoria), 'Capinhas','Películas','Carregadores','Fones','Acessórios'])];
  const todosModelos = [...new Set([...Object.values(aparelhos).flatMap(linhas => Object.values(linhas).flat()), ...produtos.flatMap(p=>p.modelos||[])])];

  // useMemo evita refazer os filtros quando nada mudou.
  const encontrados = useMemo(() => produtos.filter(produto => {
    const bateBusca = produto.nome.toLowerCase().includes(busca.toLowerCase());
    const bateCategoria = categoria === 'Todas' || produto.categoria === categoria;
    const bateModelo = !modelo || produto.modelos.length === 0 || produto.modelos.includes(modelo);
    return bateBusca && bateCategoria && bateModelo;
  }), [produtos, busca, categoria, modelo]);

  return <main className="catalog-page container"><p className="breadcrumbs">Início / Produtos</p><div className="catalog-heading"><div><p className="eyebrow">CATÁLOGO LLV CONNECT</p><h1>Encontre seu próximo acessório</h1><p>Explore nossos produtos e escolha o que combina com seu celular.</p></div><div className="catalog-counter">{encontrados.length} produtos</div></div>
    <div className="search-field"><Search size={20}/><input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar capinhas, películas, carregadores..." aria-label="Buscar produtos"/>{busca && <button onClick={() => setBusca('')} aria-label="Limpar pesquisa"><X size={18}/></button>}</div>
    <div className="catalog-layout"><aside className="filters"><h3><SlidersHorizontal size={18}/> Filtros</h3><label>Categoria<select value={categoria} onChange={e => setCategoria(e.target.value)}>{categorias.map(c => <option key={c} value={c}>{c}</option>)}</select></label><label>Meu aparelho<select value={modelo} onChange={e => setModelo(e.target.value)}><option value="">Todos os modelos</option>{todosModelos.map(m => <option key={m} value={m}>{m}</option>)}</select></label><button className="clear-filters" onClick={() => {setCategoria('Todas');setModelo('');setBusca('');}}>Limpar filtros</button><p className="filter-info">Acessórios universais aparecem em todos os modelos quando compatíveis.</p></aside><section><div className="results-caption">{modelo ? 'Acessórios para '+modelo+' e produtos universais' : 'Todos os acessórios'}</div>{encontrados.length ? <div className="products-grid catalog-products">{encontrados.map(p => <CardProduto key={p.id} produto={p} onAbrir={onAbrir}/>)}</div> : <div className="empty"><Search size={30}/><h3>Nenhum produto encontrado</h3><p>Tente outra busca ou limpe os filtros.</p></div>}</section></div>
  </main>;
}
