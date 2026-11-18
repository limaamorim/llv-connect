import { ArrowRight, Headphones, Layers, ShieldCheck, Smartphone, Truck, Zap } from 'lucide-react';
import { CardProduto } from '../components/CardProduto';
import { FiltroAparelho } from '../components/FiltroAparelho';
import { produtos } from '../data/produtos';
import type { Categoria, Produto } from '../types/produto';

type Props = { onCatalogo: (categoria?: Categoria, modelo?: string) => void; onAbrir: (produto: Produto) => void };
const categorias: { nome: Categoria; icone: typeof Smartphone; subtitulo: string }[] = [
  { nome: 'Capinhas', icone: Smartphone, subtitulo: 'Proteção com estilo' },
  { nome: 'Películas', icone: ShieldCheck, subtitulo: 'Proteja sua tela' },
  { nome: 'Carregadores', icone: Zap, subtitulo: 'Mais energia' },
  { nome: 'Fones', icone: Headphones, subtitulo: 'Seu som favorito' },
  { nome: 'Acessórios', icone: Layers, subtitulo: 'Para seu dia a dia' },
];

export function Inicio({ onCatalogo, onAbrir }: Props) {
  return <main>
    <section className="hero"><div className="container hero-inner"><div className="hero-copy"><span className="hero-tag">⚡ SEU UNIVERSO MOBILE</span><h1>Tudo que seu celular precisa. <em>Em um só lugar.</em></h1><p>Capinhas, películas, carregadores e acessórios para acompanhar você em todos os momentos.</p><button className="btn btn-primary" onClick={() => onCatalogo()}>Explorar produtos <ArrowRight size={18}/></button><span className="hero-note"><Truck size={17}/> Atendimento fácil e rápido pelo WhatsApp</span></div><div className="hero-art" aria-hidden="true"><div className="glow"/><span className="floating f1">🎧</span><span className="phone-art"><span>LLV</span><b>CONNECT</b></span><span className="floating f2">🔋</span><span className="floating f3">🔌</span></div></div></section>
    <div className="container"><FiltroAparelho onSelecionar={modelo => onCatalogo(undefined, modelo)}/></div>
    <section className="container section"><div className="section-heading"><div><p className="eyebrow">ENCONTRE O QUE PROCURA</p><h2>Compre por categoria</h2></div><button className="link-button" onClick={() => onCatalogo()}>Ver tudo <ArrowRight size={17}/></button></div><div className="category-grid">{categorias.map(({nome,icone: Icone,subtitulo}) => <button className="category-card" key={nome} onClick={() => onCatalogo(nome)}><span className="category-symbol"><Icone size={30}/></span><strong>{nome}</strong><small>{subtitulo}</small><ArrowRight size={17} className="category-arrow"/></button>)}</div></section>
    <section className="container section"><div className="section-heading"><div><p className="eyebrow">ESCOLHAS DA LOJA</p><h2>Produtos em destaque</h2></div><button className="link-button" onClick={() => onCatalogo()}>Ver catálogo <ArrowRight size={17}/></button></div><div className="products-grid">{produtos.filter(p => p.destaque).map(p => <CardProduto key={p.id} produto={p} onAbrir={onAbrir}/>)}</div></section>
    <section className="container"><div className="banner"><div><p className="eyebrow">ATENDIMENTO PERSONALIZADO</p><h2>Gostou de algum produto?</h2><p>Veja os valores no site e converse com a LLV Connect pelo WhatsApp para combinar sua compra.</p><button className="btn btn-white" onClick={() => onCatalogo()}>Escolher meu acessório <ArrowRight size={18}/></button></div><span className="banner-art" aria-hidden="true">💬</span></div></section>
  </main>;
}
