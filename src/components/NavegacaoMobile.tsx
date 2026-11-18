import { Home, LayoutGrid, Search, MessageCircle } from 'lucide-react';
import { loja } from '../data/loja';
export function NavegacaoMobile({onInicio,onCatalogo,onBusca}: {onInicio:()=>void;onCatalogo:()=>void;onBusca:()=>void}) {
  return <nav className="navegacao-mobile" aria-label="Navegação do celular">
    <button onClick={onInicio}><Home size={20}/>Início</button>
    <button onClick={onCatalogo}><LayoutGrid size={20}/>Produtos</button>
    <button onClick={onBusca}><Search size={20}/>Buscar</button>
    {loja.whatsapp ? <a href={'https://wa.me/'+loja.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={20}/>Contato</a> : <a href={loja.instagram} target="_blank" rel="noreferrer"><MessageCircle size={20}/>Contato</a>}
  </nav>;
}
