import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X, Check, ChevronDown } from 'lucide-react';

import { CardProduto } from '../components/CardProduto';
import { aparelhos } from '../data/produtos';
import type { Produto } from '../types/produto';

type Props = {
  produtos: Produto[];
  categoriaInicial: string;
  modeloInicial: string;
  pesquisaInicial: string;
  onAbrir: (produto: Produto) => void;
  favoritos: number[];
  onFavorito: (id: number) => void;
};

// Identifica a marca a partir do nome do aparelho.
function identificarMarca(modelo: string) {
  if (/iphone/i.test(modelo)) return 'Apple';
  if (/galaxy/i.test(modelo)) return 'Samsung';
  if (/moto|edge/i.test(modelo)) return 'Motorola';
  if (/redmi|poco|xiaomi/i.test(modelo)) return 'Xiaomi';
  return 'Outros';
}

export function Catalogo({
  produtos,
  categoriaInicial,
  modeloInicial,
  pesquisaInicial,
  onAbrir,
  favoritos,
  onFavorito,
}: Props) {
  const [busca, setBusca] = useState(pesquisaInicial);
  const [categorias, setCategorias] = useState<string[]>(
    categoriaInicial ? [categoriaInicial] : [],
  );
  const [marcas, setMarcas] = useState<string[]>([]);
  const [modelo, setModelo] = useState(modeloInicial);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [ordem, setOrdem] = useState('relevancia');

  // Listas usadas para montar os filtros.
  const categoriasDisponiveis = [
    ...new Set([
      ...produtos.map((produto) => produto.categoria),
      'Capinhas',
      'Películas',
      'Carregadores',
      'Fones',
      'Acessórios',
    ]),
  ];

  const todosModelos = [
    ...new Set([
      ...Object.values(aparelhos).flatMap((linhas) => Object.values(linhas).flat()),
      ...produtos.flatMap((produto) => produto.modelos || []),
    ]),
  ];

  const marcasDisponiveis = ['Apple', 'Samsung', 'Motorola', 'Xiaomi', 'Outros'];

  // Filtra e ordena apenas quando os valores relevantes mudarem.
  const encontrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');

    const lista = produtos.filter((produto) => {
      const descricao = [
        produto.nome,
        produto.categoria,
        produto.descricao,
        ...produto.modelos,
      ]
        .join(' ')
        .toLocaleLowerCase('pt-BR');

      const bateBusca = !termo || descricao.includes(termo);
      const bateCategoria =
        categorias.length === 0 || categorias.includes(produto.categoria);
      const bateModelo =
        !modelo || produto.modelos.length === 0 || produto.modelos.includes(modelo);
      const bateMarca =
        marcas.length === 0 ||
        produto.modelos.length === 0 ||
        produto.modelos.some((item) => marcas.includes(identificarMarca(item)));

      return bateBusca && bateCategoria && bateModelo && bateMarca;
    });

    if (ordem === 'menor') {
      lista.sort((a, b) => a.preco - b.preco);
    } else if (ordem === 'maior') {
      lista.sort((a, b) => b.preco - a.preco);
    } else if (ordem === 'nome') {
      lista.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    return lista;
  }, [produtos, busca, categorias, marcas, modelo, ordem]);

  function alternar(
    valor: string,
    lista: string[],
    atualizar: (valores: string[]) => void,
  ) {
    atualizar(
      lista.includes(valor) ? lista.filter((item) => item !== valor) : [...lista, valor],
    );
  }

  function limpar() {
    setBusca('');
    setCategorias([]);
    setMarcas([]);
    setModelo('');
    setOrdem('relevancia');
  }

  const filtrosAtivos = categorias.length + marcas.length + (modelo ? 1 : 0);

  // Mostra sugestões de produtos enquanto o cliente digita.
  const sugestoes =
    busca.trim().length >= 2
      ? produtos
          .filter((produto) =>
            (produto.nome + ' ' + produto.modelos.join(' '))
              .toLowerCase()
              .includes(busca.trim().toLowerCase()),
          )
          .slice(0, 4)
      : [];

  return (
    <main className="container catalog-page catalogo-novo">
      <p className="breadcrumbs">
        Início <span>/</span> Produtos
      </p>

      {/* Título e quantidade de resultados */}
      <div className="titulo-catalogo">
        <div>
          <span className="eyebrow">CATÁLOGO LLV CONNECT</span>
          <h1>Encontre seu acessório ideal.</h1>
          <p>Capinhas, películas, fones e tudo para o seu celular.</p>
        </div>

        <span className="total-encontrados">{encontrados.length} produtos</span>
      </div>

      {/* Campo de pesquisa e botão de filtros para celular */}
      <div className="catalogo-barra">
        <div className="pesquisa-grupo">
          <div className="search-field pesquisa-catalogo">
            <Search size={20} />
            <input
              type="search"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Busque produtos, marcas ou modelos..."
              aria-label="Buscar produtos"
            />

            {busca && (
              <button onClick={() => setBusca('')} aria-label="Apagar busca">
                <X size={18} />
              </button>
            )}
          </div>

          {sugestoes.length > 0 && (
            <div className="sugestoes-produto">
              <small>PRODUTOS ENCONTRADOS</small>

              {sugestoes.map((produto) => (
                <button key={produto.id} onClick={() => onAbrir(produto)}>
                  <Search size={14} />
                  <span>{produto.nome}</span>
                  <strong>Ver produto</strong>
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="abrir-filtros" onClick={() => setFiltrosAbertos(true)}>
          <SlidersHorizontal size={17} />
          Filtrar
          {filtrosAtivos > 0 && <b>{filtrosAtivos}</b>}
        </button>
      </div>

      <div className="catalog-layout">
        {/* Fundo escuro que fecha os filtros no celular */}
        {filtrosAbertos && (
          <button
            className="filtro-fundo"
            aria-label="Fechar filtros"
            onClick={() => setFiltrosAbertos(false)}
          />
        )}

        {/* Barra de filtros: lateral no computador e painel no celular */}
        <aside
          className={`filters filtros-novos ${filtrosAbertos ? 'filtros-visiveis' : ''}`}
        >
          <div className="filtro-cabecalho">
            <h3>
              <SlidersHorizontal size={18} /> Filtros
            </h3>
            <button onClick={limpar}>Limpar tudo</button>
            <button
              className="fechar-filtros"
              aria-label="Fechar filtros"
              onClick={() => setFiltrosAbertos(false)}
            >
              <X />
            </button>
          </div>

          <div className="grupo-filtro">
            <h4>
              Categoria <ChevronDown size={15} />
            </h4>

            {categoriasDisponiveis.map((categoria) => (
              <label key={categoria} className="opcao-filtro">
                <input
                  type="checkbox"
                  checked={categorias.includes(categoria)}
                  onChange={() => alternar(categoria, categorias, setCategorias)}
                />
                <span>
                  {categoria}{' '}
                  <small>
                    ({produtos.filter((p) => p.categoria === categoria).length})
                  </small>
                </span>
              </label>
            ))}
          </div>

          <div className="grupo-filtro">
            <h4>
              Marca <ChevronDown size={15} />
            </h4>

            {marcasDisponiveis.map((marca) => (
              <label key={marca} className="opcao-filtro">
                <input
                  type="checkbox"
                  checked={marcas.includes(marca)}
                  onChange={() => alternar(marca, marcas, setMarcas)}
                />
                <span>{marca}</span>
              </label>
            ))}
          </div>

          <div className="grupo-filtro">
            <h4>
              Modelo <ChevronDown size={15} />
            </h4>

            <select
              value={modelo}
              onChange={(evento) => setModelo(evento.target.value)}
              aria-label="Filtrar por modelo"
            >
              <option value="">Todos os modelos</option>

              {todosModelos
                .filter(
                  (item) =>
                    marcas.length === 0 || marcas.includes(identificarMarca(item)),
                )
                .map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
            </select>

            <p className="ajuda-filtro">
              Produtos gerais também aparecem quando você escolhe um aparelho.
            </p>
          </div>

          <button
            className="btn btn-primary aplicar-filtros"
            onClick={() => setFiltrosAbertos(false)}
          >
            Ver resultados ({encontrados.length}) <Check size={17} />
          </button>
        </aside>

        {/* Lista dos produtos encontrados */}
        <section className="resultado-catalogo">
          <div className="resultado-topo">
            <span>
              {busca ? `Resultados para “${busca}”` : 'Todos os produtos'}
              {' · '}
              {encontrados.length} encontrados
            </span>

            <label>
              Ordenar
              <select value={ordem} onChange={(evento) => setOrdem(evento.target.value)}>
                <option value="relevancia">Mais relevantes</option>
                <option value="menor">Menor preço</option>
                <option value="maior">Maior preço</option>
                <option value="nome">Nome A-Z</option>
              </select>
            </label>
          </div>

          {(filtrosAtivos > 0 || busca) && (
            <div className="filtros-ativos">
              {[...categorias, ...marcas, ...(modelo ? [modelo] : [])].map((filtro) => (
                <span key={filtro}>{filtro}</span>
              ))}

              <button onClick={limpar}>
                Limpar filtros <X size={13} />
              </button>
            </div>
          )}

          {encontrados.length > 0 ? (
            <div className="products-grid catalog-products">
              {encontrados.map((produto) => (
                <CardProduto
                  key={produto.id}
                  produto={produto}
                  onAbrir={onAbrir}
                  favorito={favoritos.includes(produto.id)}
                  onFavorito={onFavorito}
                />
              ))}
            </div>
          ) : (
            <div className="empty">
              <Search size={30} />
              <h3>Nenhum produto encontrado</h3>
              <p>Experimente mudar o modelo ou limpar os filtros.</p>
              <button className="btn btn-primary" onClick={limpar}>
                Ver todos os produtos
              </button>
            </div>
          )}

          <div className="chamada-catalogo">
            <div>
              <h3>Acessórios para todas as conexões.</h3>
              <p>Explore nossa seleção e encontre o que combina com você.</p>
            </div>
            <span aria-hidden="true">LLV</span>
          </div>
        </section>
      </div>
    </main>
  );
}
