import { useEffect, useState } from 'react';
import { X, ShoppingBag, Trash2, MessageCircle } from 'lucide-react';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { NavegacaoMobile } from './components/NavegacaoMobile';
import { Inicio } from './pages/Inicio';
import { Catalogo } from './pages/Catalogo';
import { DetalheProduto } from './pages/DetalheProduto';
import { Admin } from './pages/Admin';

import {
  buscarProdutosPublicos,
  buscarCategoriasPublicas,
} from './services/catalogoService';
import type { CategoriaPublica } from './services/catalogoService';
import { loja } from './data/loja';

import { moeda } from './utils/whatsapp';
import type { Produto } from './types/produto';

type Pagina = 'inicio' | 'catalogo' | 'detalhe' | 'admin';

type ItemSacola = {
  produto: Produto;
  modelo: string;
  quantidade: number;
};

// Recupera os favoritos que o cliente salvou no navegador.
function iniciarFavoritos(): number[] {
  try {
    return JSON.parse(localStorage.getItem('llv-favoritos') || '[]');
  } catch {
    return [];
  }
}

export default function App() {
  // Estados compartilhados entre a página inicial, catálogo e detalhes.
  const [pagina, setPagina] = useState<Pagina>(
    location.pathname.startsWith('/admin') ? 'admin' : 'inicio',
  );
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categoriasLoja, setCategoriasLoja] = useState<CategoriaPublica[]>([]);
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(true);
  const [produto, setProduto] = useState<Produto | null>(null);
  const [categoria, setCategoria] = useState('');
  const [modelo, setModelo] = useState('');
  const [pesquisa, setPesquisa] = useState('');
  const [favoritos, setFavoritos] = useState<number[]>(iniciarFavoritos);
  const [sacola, setSacola] = useState<ItemSacola[]>([]);
  const [sacolaAberta, setSacolaAberta] = useState(false);
  const [erro, setErro] = useState('');

  // Consulta apenas os dados públicos; o painel admin não participa.
  useEffect(() => {
    if (pagina === 'admin') return;

    const controlador = new AbortController();
    setCarregandoCatalogo(true);
    setErro('');

    Promise.all([
      buscarProdutosPublicos(controlador.signal),
      buscarCategoriasPublicas(controlador.signal),
    ])
      .then(([listaProdutos, listaCategorias]) => {
        if (controlador.signal.aborted) return;
        setProdutos(listaProdutos);
        setCategoriasLoja(listaCategorias);
      })
      .catch((falha: unknown) => {
        if (controlador.signal.aborted) return;
        setErro(
          falha instanceof Error
            ? falha.message
            : 'Não foi possível consultar o catálogo.',
        );
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCarregandoCatalogo(false);
      });

    return () => controlador.abort();
  }, [pagina]);

  // Permite usar o botão Voltar do navegador.
  useEffect(() => {
    const voltar = () => {
      setPagina(location.pathname.startsWith('/admin') ? 'admin' : 'inicio');
    };

    addEventListener('popstate', voltar);

    return () => removeEventListener('popstate', voltar);
  }, []);

  function navegar(novaPagina: Pagina) {
    setPagina(novaPagina);
    history.pushState({}, '', novaPagina === 'admin' ? '/admin' : '/');
    window.scrollTo(0, 0);
  }

  function abrirCatalogo(categoriaNova = '', modeloNovo = '', buscaNova = '') {
    setCategoria(categoriaNova);
    setModelo(modeloNovo);
    setPesquisa(buscaNova);
    navegar('catalogo');
  }

  function abrirProduto(item: Produto) {
    setProduto(item);
    navegar('detalhe');
  }

  function alternarFavorito(id: number) {
    setFavoritos((anteriores) => {
      const atualizados = anteriores.includes(id)
        ? anteriores.filter((item) => item !== id)
        : [...anteriores, id];

      localStorage.setItem('llv-favoritos', JSON.stringify(atualizados));

      return atualizados;
    });
  }

  function adicionarSacola(item: Produto, modeloSelecionado: string, quantidade: number) {
    setSacola((lista) => {
      const indice = lista.findIndex(
        (selecionado) =>
          selecionado.produto.id === item.id && selecionado.modelo === modeloSelecionado,
      );

      if (indice < 0) {
        return [...lista, { produto: item, modelo: modeloSelecionado, quantidade }];
      }

      return lista.map((selecionado, posicao) =>
        posicao === indice
          ? {
              ...selecionado,
              quantidade: selecionado.quantidade + quantidade,
            }
          : selecionado,
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

  // A página administrativa mantém seu próprio layout.
  if (pagina === 'admin') {
    return <Admin onInicio={() => navegar('inicio')} />;
  }

  return (
    <>
      <Header
        onInicio={() => navegar('inicio')}
        onCatalogo={() => abrirCatalogo()}
        onCategoria={(novaCategoria) => abrirCatalogo(novaCategoria)}
        onBuscar={(busca) => abrirCatalogo('', '', busca)}
        onSacola={() => setSacolaAberta(true)}
        quantidade={quantidadeSacola}
        categorias={categoriasLoja.map((item) => item.nome)}
      />

      {erro && (
        <p className="container admin-erro">
          Não foi possível carregar o catálogo: {erro}
        </p>
      )}


      {carregandoCatalogo && (
        <p className="container estado-catalogo" role="status">
          Carregando produtos e categorias...
        </p>
      )}

      {/* Exibe apenas a página selecionada */}
      {pagina === 'inicio' && (
        <Inicio
          produtos={produtos}
          categorias={categoriasLoja}
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
          categoriasLoja={categoriasLoja}
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

      {/* Painel lateral da sacola, com os itens do cliente */}
      {sacolaAberta && (
        <div className="overlay-sacola" onClick={() => setSacolaAberta(false)}>
          <aside
            className="painel-sacola"
            onClick={(evento) => evento.stopPropagation()}
            aria-label="Sacola de produtos"
          >
            <div className="painel-topo">
              <h2>
                <ShoppingBag size={22} />
                Minha sacola ({quantidadeSacola})
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
                  {sacola.map((item, indice) => (
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
                          setSacola((atual) =>
                            atual.filter((_, posicao) => posicao !== indice),
                          )
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
                      <MessageCircle />
                      Enviar lista no WhatsApp
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
