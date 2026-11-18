import { Home, LayoutGrid, Search, MessageCircle } from 'lucide-react';
import { loja } from '../data/loja';

type Props = {
  onInicio: () => void;
  onCatalogo: () => void;
  onBusca: () => void;
};

export function NavegacaoMobile({ onInicio, onCatalogo, onBusca }: Props) {
  const contato = loja.whatsapp ? `https://wa.me/${loja.whatsapp}` : loja.instagram;

  return (
    <nav className="navegacao-mobile" aria-label="Navegação do celular">
      <button onClick={onInicio}>
        <Home size={20} />
        Início
      </button>

      <button onClick={onCatalogo}>
        <LayoutGrid size={20} />
        Produtos
      </button>

      <button onClick={onBusca}>
        <Search size={20} />
        Buscar
      </button>

      <a href={contato} target="_blank" rel="noreferrer">
        <MessageCircle size={20} />
        Contato
      </a>
    </nav>
  );
}
