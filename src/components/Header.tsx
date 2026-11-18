import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

type Props = {
  onInicio: () => void;
  onCatalogo: () => void;
  onCategoria: (categoria: string) => void;
  onBuscar: (busca: string) => void;
  onSacola: () => void;
  quantidade: number;
};

export function Header({
  onInicio,
  onCatalogo,
  onCategoria,
  onBuscar,
  onSacola,
  quantidade,
}: Props) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');

  function pesquisar(evento: FormEvent) {
    evento.preventDefault();
    onBuscar(busca);
    setAberto(false);
  }

  return (
    <header className="site-header">
      <div className="container header-novo">
        {/* Abre o menu somente na versão para celular */}
        <button
          className="menu-mobile"
          aria-label="Abrir menu"
          onClick={() => setAberto(!aberto)}
        >
          {aberto ? <X /> : <Menu />}
        </button>

        {/* Logo da LLV Connect */}
        <button
          className="brand-nova"
          onClick={onInicio}
          aria-label="LLV Connect - início"
        >
          <b>
            <span>L</span>LV
          </b>
          <small>CONNECT</small>
        </button>

        {/* Menu de categorias e páginas */}
        <nav className={`nav-nova ${aberto ? 'menu-aberto' : ''}`}>
          <button onClick={() => { onInicio(); setAberto(false); }}>
            Início
          </button>
          <button onClick={() => { onCatalogo(); setAberto(false); }}>
            Produtos
          </button>
          <button onClick={() => { onCategoria('Capinhas'); setAberto(false); }}>
            Capinhas
          </button>
          <button onClick={() => { onCategoria('Películas'); setAberto(false); }}>
            Películas
          </button>
          <button onClick={() => { onCategoria('Fones'); setAberto(false); }}>
            Fones
          </button>
        </nav>

        <div className="header-lateral">
          {/* Formulário de busca para computadores */}
          <form className="busca-header" onSubmit={pesquisar}>
            <Search size={17} />
            <input
              aria-label="Buscar produto"
              placeholder="Buscar acessórios..."
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
            />
          </form>

          <button
            className="icone-header"
            onClick={() => onBuscar('')}
            aria-label="Buscar"
          >
            <Search size={21} />
          </button>

          {/* Sacola com o número de produtos selecionados */}
          <button
            className="icone-header sacola-topo"
            aria-label={`Sacola, ${quantidade} itens`}
            onClick={onSacola}
          >
            <ShoppingBag size={22} />
            {quantidade > 0 && <span>{quantidade}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
