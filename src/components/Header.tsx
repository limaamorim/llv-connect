import { Instagram, Menu, Search, Smartphone } from 'lucide-react';
import { loja } from '../data/loja';

type Props = { onInicio: () => void; onCatalogo: () => void };

export function Header({ onInicio, onCatalogo }: Props) {
  return <>
    <div className="topbar">Tudo para seu celular em um só lugar ✨</div>
    <header className="header container">
      <button className="brand" onClick={onInicio} aria-label="Voltar ao início"><span className="brand-icon"><Smartphone size={23}/></span><span><strong>LLV<span className="blue">CONNECT</span></strong><small>ACESSÓRIOS PARA CELULAR</small></span></button>
      <nav className="desktop-nav"><button onClick={onInicio}>Início</button><button onClick={onCatalogo}>Todos os produtos</button><a href={loja.instagram} target="_blank" rel="noreferrer">Instagram</a></nav>
      <div className="header-actions"><button onClick={onCatalogo} aria-label="Buscar produtos"><Search size={21}/></button><a href={loja.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={21}/></a><button className="mobile-menu" onClick={onCatalogo} aria-label="Abrir catálogo"><Menu size={22}/></button></div>
    </header>
  </>;
}
