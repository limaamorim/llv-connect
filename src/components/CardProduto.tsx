import { Heart, ArrowUpRight } from 'lucide-react';
import type { Produto } from '../types/produto';
import { moeda } from '../utils/whatsapp';
import { ImagemProduto } from './ImagemProduto';

type Props = {
  produto: Produto;
  onAbrir: (produto: Produto) => void;
  favorito?: boolean;
  onFavorito?: (id:number) => void;
};
export function CardProduto({ produto, onAbrir, favorito=false, onFavorito }: Props) {
  const disponivel = produto.estoque === undefined || produto.estoque > 0;
  return <article className="product-card novo-card">
    <button className="produto-clicavel" onClick={()=>onAbrir(produto)} aria-label={'Ver '+produto.nome}>
      <div className="product-picture"><ImagemProduto produto={produto}/>{produto.novidade&&<span className="product-badge">Novidade</span>}</div>
      <div className="product-info">
        <span className="product-category">{produto.categoria}</span>
        <strong>{produto.nome}</strong>
        <span className="product-price">{moeda(produto.preco)}</span>
        <span className={'estoque-selo '+(!disponivel?'sem-estoque':'')}>{disponivel?'● Disponível':'Indisponível'}</span>
        <span className="product-view">Ver detalhes <ArrowUpRight size={15}/></span>
      </div>
    </button>
    <button className={'favorito-btn '+(favorito?'ativo':'')} aria-label={favorito?'Remover dos favoritos':'Adicionar aos favoritos'} aria-pressed={favorito} onClick={()=>onFavorito?.(produto.id)}><Heart size={19} fill={favorito?'currentColor':'none'}/></button>
  </article>;
}
