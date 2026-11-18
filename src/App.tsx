import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { NavegacaoMobile } from './components/NavegacaoMobile';
import { Inicio } from './pages/Inicio';
import { Catalogo } from './pages/Catalogo';
import { DetalheProduto } from './pages/DetalheProduto';
import { Admin } from './pages/Admin';
import { produtos as exemplos } from './data/produtos';
import { configurado, listarProdutos } from './services/supabase';
import { loja } from './data/loja';
import { moeda } from './utils/whatsapp';
import type { Produto } from './types/produto';
import { X, ShoppingBag, Trash2, MessageCircle } from 'lucide-react';

type Pagina = 'inicio' | 'catalogo' | 'detalhe' | 'admin';
type ItemSacola = { produto: Produto; modelo: string; quantidade: number };
function iniciarFavoritos(): number[] {
  try {
    return JSON.parse(localStorage.getItem('llv-favoritos') || '[]');
  } catch {
    return [];
  }
}

export default function App() {
  const [pagina, setPagina] = useState<Pagina>(
    location.pathname.startsWith('/admin') ? 'admin' : 'inicio',
  );
  const [produtos, setProdutos] = useState<Produto[]>(configurado ? [] : exemplos);
  const [produto, setProduto] = useState<Produto | null>(null);
  const [categoria, setCategoria] = useState('');
  const [modelo, setModelo] = useState('');
  const [pesquisa, setPesquisa] = useState('');
  const [favoritos, setFavoritos] = useState<number[]>(iniciarFavoritos);
  const [sacola, setSacola] = useState<ItemSacola[]>([]);
  const [sacolaAberta, setSacolaAberta] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (pagina === 'admin') return;
    listarProdutos()
      .then(setProdutos)
      .catch((e) => setErro(e.message));
  }, [pagina]);
  useEffect(() => {
    const voltar = () =>
      setPagina(location.pathname.startsWith('/admin') ? 'admin' : 'inicio');
    addEventListener('popstate', voltar);
    return () => removeEventListener('popstate', voltar);
  }, []);

  function navegar(p: Pagina) {
    setPagina(p);
    history.pushState({}, '', p === 'admin' ? '/admin' : '/');
    window.scrollTo(0, 0);
  }
  function abrirCatalogo(categoriaNova = '', modeloNovo = '', buscaNova = '') {
    setCategoria(categoriaNova);
    setModelo(modeloNovo);
    setPesquisa(buscaNova);
    navegar('catalogo');
  }
  function abrirProduto(p: Produto) {
    setProduto(p);
    navegar('detalhe');
  }
  function alternarFavorito(id: number) {
    setFavoritos((anteriores) => {
      const atualizados = anteriores.includes(id)
        ? anteriores.filter((n) => n !== id)
        : [...anteriores, id];
      localStorage.setItem('llv-favoritos', JSON.stringify(atualizados));
      return atualizados;
    });
  }
  function adicionarSacola(p: Produto, modeloSelecionado: string, quantidade: number) {
    setSacola((lista) => {
      const indice = lista.findIndex(
        (i) => i.produto.id === p.id && i.modelo === modeloSelecionado,
      );
      if (indice < 0)
        return [...lista, { produto: p, modelo: modeloSelecionado, quantidade }];
      return lista.map((item, n) =>
        n === indice ? { ...item, quantidade: item.quantidade + quantidade } : item,
      );
    });
    setSacolaAberta(true);
  }
  const quantidadeSacola = sacola.reduce((total, item) => total + item.quantidade, 0);
  const textoSacola = sacola
    .map(
      (item) =>
        '• ' +
        item.produto.nome +
        (item.modelo ? ' (' + item.modelo + ')' : '') +
        ' — ' +
        item.quantidade +
        'x ' +
        moeda(item.produto.preco),
    )
    .join('\n');
  const totalSacola = sacola.reduce(
    (total, item) => total + item.produto.preco * item.quantidade,
    0,
  );
  const linkSacola = loja.whatsapp
    ? 'https://wa.me/' +
      loja.whatsapp +
      '?text=' +
      encodeURIComponent(
        'Olá! Gostaria de consultar estes produtos da LLV Connect:\n' +
          textoSacola +
          '\nTotal: ' +
          moeda(totalSacola),
      )
    : null;

  if (pagina === 'admin') return <Admin onInicio={() => navegar('inicio')} />;

  return (
    <>
      <Header
        onInicio={() => navegar('inicio')}
        onCatalogo={() => abrirCatalogo()}
        onCategoria={(c) => abrirCatalogo(c)}
        onBuscar={(b) => abrirCatalogo('', '', b)}
        onSacola={() => setSacolaAberta(true)}
        quantidade={quantidadeSacola}
      />
      {erro && (
        <p className="container admin-erro">
          Não foi possível carregar o catálogo: {erro}
        </p>
      )}
      {!configurado && (
        <div className="demo-notice">
          Vitrine demonstrativa: produtos e preços fictícios.
        </div>
      )}
      {pagina === 'inicio' && (
        <Inicio
          produtos={produtos}
          onCatalogo={abrirCatalogo}
          onAbrir={abrirProduto}
          favoritos={favoritos}
          onFavorito={alternarFavorito}
        />
      )}
      {pagina === 'catalogo' && (
        <Catalogo
          key={[categoria, modelo, pesquisa].join('|')}
          produtos={produtos}
          categoriaInicial={categoria}
          modeloInicial={modelo}
          pesquisaInicial={pesquisa}
          onAbrir={abrirProduto}
          favoritos={favoritos}
          onFavorito={alternarFavorito}
        />
      )}
      {pagina === 'detalhe' && produto && (
        <DetalheProduto
          key={produto.id}
          produto={produto}
          onVoltar={() => abrirCatalogo(categoria, modelo, pesquisa)}
          onSacola={adicionarSacola}
          favorito={favoritos.includes(produto.id)}
          onFavorito={() => alternarFavorito(produto.id)}
        />
      )}
      <Footer />
      <NavegacaoMobile
        onInicio={() => navegar('inicio')}
        onCatalogo={() => abrirCatalogo()}
        onBusca={() => abrirCatalogo()}
      />
      {sacolaAberta && (
        <div className="overlay-sacola" onClick={() => setSacolaAberta(false)}>
          <aside
            className="painel-sacola"
            onClick={(e) => e.stopPropagation()}
            aria-label="Sacola de produtos"
          >
            <div className="painel-topo">
              <h2>
                <ShoppingBag size={22} /> Minha sacola ({quantidadeSacola})
              </h2>
              <button onClick={() => setSacolaAberta(false)} aria-label="Fechar">
                <X />
              </button>
            </div>
            <p className="aviso-sacola">
              Monte sua lista e envie os produtos pelo WhatsApp. Não há pagamento neste
              site.
            </p>
            {sacola.length === 0 ? (
              <div className="sacola-vazia">
                <ShoppingBag size={45} />
                <p>Sua sacola está vazia.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setSacolaAberta(false);
                    abrirCatalogo();
                  }}
                >
                  Explorar produtos
                </button>
              </div>
            ) : (
              <>
                <div className="itens-sacola">
                  {sacola.map((item, i) => (
                    <div
                      className="item-sacola"
                      key={item.produto.id + '-' + item.modelo}
                    >
                      <div>
                        <strong>{item.produto.nome}</strong>
                        <small>
                          {item.modelo || 'Acessório geral'} · {item.quantidade}{' '}
                          unidade(s)
                        </small>
                        <b>{moeda(item.produto.preco * item.quantidade)}</b>
                      </div>
                      <button
                        aria-label="Remover produto"
                        onClick={() =>
                          setSacola((atual) => atual.filter((_, indice) => indice !== i))
                        }
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="sacola-rodape">
                  <strong>Total: {moeda(totalSacola)}</strong>
                  {linkSacola ? (
                    <a
                      className="btn btn-whatsapp"
                      href={linkSacola}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle /> Enviar lista no WhatsApp
                    </a>
                  ) : (
                    <button className="btn btn-whatsapp" disabled>
                      WhatsApp da loja não configurado
                    </button>
                  )}
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
