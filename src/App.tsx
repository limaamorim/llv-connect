import { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Inicio } from './pages/Inicio';
import { Catalogo } from './pages/Catalogo';
import { DetalheProduto } from './pages/DetalheProduto';
import type { Categoria, Produto } from './types/produto';

type Pagina = 'inicio' | 'catalogo' | 'detalhe';

export default function App() {
  // Página atual e filtros ficam aqui para que os componentes compartilhem os valores.
  const [pagina, setPagina] = useState<Pagina>('inicio');
  const [categoria, setCategoria] = useState<Categoria | ''>('');
  const [modelo, setModelo] = useState('');
  const [produto, setProduto] = useState<Produto | null>(null);

  function abrirCatalogo(novaCategoria?: Categoria, novoModelo?: string) {
    setCategoria(novaCategoria || ''); setModelo(novoModelo || ''); setPagina('catalogo');
    window.scrollTo({top: 0, behavior: 'smooth'});
  }
  function abrirProduto(item: Produto) { setProduto(item); setPagina('detalhe'); window.scrollTo(0, 0); }
  function abrirInicio() { setPagina('inicio'); window.scrollTo(0, 0); }

  return <><Header onInicio={abrirInicio} onCatalogo={() => abrirCatalogo()}/>
    {pagina === 'inicio' && <Inicio onCatalogo={abrirCatalogo} onAbrir={abrirProduto}/>}
    {pagina === 'catalogo' && <Catalogo key={`${categoria}-${modelo}`} categoriaInicial={categoria} modeloInicial={modelo} onAbrir={abrirProduto}/>}
    {pagina === 'detalhe' && produto && <DetalheProduto key={produto.id} produto={produto} onVoltar={() => abrirCatalogo(categoria, modelo)}/>}
    <Footer/>
  </>;
}
