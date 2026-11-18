import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Inicio } from './pages/Inicio';
import { Catalogo } from './pages/Catalogo';
import { DetalheProduto } from './pages/DetalheProduto';
import { Admin } from './pages/Admin';
import { produtos as exemplos } from './data/produtos';
import { configurado, listarProdutos } from './services/supabase';
import type { Categoria, Produto } from './types/produto';

type Pagina = 'inicio' | 'catalogo' | 'detalhe' | 'admin';

export default function App() {
  // O mesmo catálogo alimenta a página inicial, a busca e os detalhes.
  const [pagina, setPagina] = useState<Pagina>(window.location.pathname.startsWith('/admin') ? 'admin' : 'inicio');
  const [categoria, setCategoria] = useState<Categoria>('');
  const [modelo, setModelo] = useState('');
  const [produto, setProduto] = useState<Produto | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>(configurado ? [] : exemplos);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (pagina === 'admin' || !configurado) return;
    listarProdutos().then(setProdutos).catch(e => setErro(e.message));
  }, [pagina]);

  function navegar(novaPagina: Pagina) {
    setPagina(novaPagina);
    window.history.pushState({}, '', novaPagina === 'admin' ? '/admin' : '/');
    window.scrollTo(0,0);
  }
  function abrirCatalogo(novaCategoria?: Categoria, novoModelo?: string) {
    setCategoria(novaCategoria || '');
    setModelo(novoModelo || '');
    navegar('catalogo');
  }
  function abrirProduto(item: Produto) { setProduto(item); navegar('detalhe'); }
  useEffect(() => {
    const voltar = () => setPagina(window.location.pathname.startsWith('/admin') ? 'admin' : 'inicio');
    window.addEventListener('popstate', voltar);
    return () => window.removeEventListener('popstate', voltar);
  }, []);

  if (pagina === 'admin') return <Admin onInicio={() => navegar('inicio')}/>;

  return <><Header onInicio={() => navegar('inicio')} onCatalogo={() => abrirCatalogo()}/>
    {erro && <p className="container admin-erro">Não foi possível carregar o catálogo: {erro}</p>}
    {!configurado && <p className="demo-notice">Catálogo demonstrativo — valores e produtos são exemplos.</p>}
    {pagina === 'inicio' && <Inicio produtos={produtos} onCatalogo={abrirCatalogo} onAbrir={abrirProduto}/>}
    {pagina === 'catalogo' && <Catalogo key={categoria+'-'+modelo} produtos={produtos} categoriaInicial={categoria} modeloInicial={modelo} onAbrir={abrirProduto}/>}
    {pagina === 'detalhe' && produto && <DetalheProduto key={produto.id} produto={produto} onVoltar={() => abrirCatalogo(categoria, modelo)}/>}
    <Footer/>
  </>;
}
