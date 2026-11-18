import { ArrowUpRight } from 'lucide-react';
import type { Produto } from '../types/produto';
import { moeda } from '../utils/whatsapp';

type Props = { produto: Produto; onAbrir: (produto: Produto) => void };
export function CardProduto({ produto, onAbrir }: Props) {
  const foto = /^https?:\/\//i.test(produto.imagem);
  return <button className="product-card" onClick={() => onAbrir(produto)}>
    <span className="product-picture">{foto ? <img className="product-photo" src={produto.imagem} alt={produto.nome}/> : <span className="product-emoji" role="img" aria-label={produto.nome}>{produto.imagem || '📱'}</span>}{produto.novidade && <span className="product-badge">Novidade</span>}</span>
    <span className="product-info"><span className="product-category">{produto.categoria}</span><strong>{produto.nome}</strong><span className="product-price">{moeda(produto.preco)}</span><span className="product-view">Ver detalhes <ArrowUpRight size={16}/></span></span>
  </button>;
}
