import {
  ArrowRight,
  Smartphone,
  ShieldCheck,
  Headphones,
  PlugZap,
  Cable,
  LayoutGrid,
  Truck,
  MessageCircle,
  LockKeyhole,
} from 'lucide-react';

import { CardProduto } from '../components/CardProduto';
import { FiltroAparelho } from '../components/FiltroAparelho';
import type { Produto } from '../types/produto';

type Props = {
  produtos: Produto[];
  onCatalogo: (categoria?: string, modelo?: string, busca?: string) => void;
  onAbrir: (produto: Produto) => void;
  favoritos: number[];
  onFavorito: (id: number) => void;
};

const categorias = [
  { nome: 'Capinhas', Icone: Smartphone },
  { nome: 'Películas', Icone: ShieldCheck },
  { nome: 'Carregadores', Icone: PlugZap },
  { nome: 'Fones', Icone: Headphones },
  { nome: 'Cabos', Icone: Cable },
  { nome: 'Acessórios', Icone: LayoutGrid },
];

export function Inicio({
  produtos,
  onCatalogo,
  onAbrir,
  favoritos,
  onFavorito,
}: Props) {
  return (
    <main>
      {/* Banner principal da loja */}
      <section className="hero hero-vitrine">
        <div className="container hero-vitrine-inner">
          <div className="hero-copy">
            <span className="etiqueta-hero">
              CONEXÃO, ESTILO E PROTEÇÃO
            </span>

            <h1>
              Tecnologia que <span>te conecta.</span>
            </h1>

            <p>
              Acessórios para deixar o seu dia a dia mais prático,
              moderno e conectado.
            </p>

            <div className="hero-botoes">
              <button
                className="btn btn-primary"
                onClick={() => onCatalogo()}
              >
                Ver produtos <ArrowRight size={18} />
              </button>

              <button
                className="btn hero-outline"
                onClick={() => onCatalogo('Capinhas')}
              >
                Conhecer capinhas
              </button>
            </div>
          </div>

          {/* Desenho decorativo feito com CSS */}
          <div className="hero-produtos" aria-hidden="true">
            <div className="hero-halo" />

            <div className="hero-phone hero-phone-back">
              <div className="hero-cameras">
                <i />
                <i />
                <i />
              </div>
            </div>

            <div className="hero-phone hero-phone-front">
              <div className="hero-cameras">
                <i />
                <i />
                <i />
              </div>
              <div className="hero-emblema">LLV</div>
            </div>

            <div className="hero-earbuds">
              <span />
              <span />
            </div>
          </div>
        </div>
      </section>

      {/* Informações rápidas sobre o atendimento */}
      <section className="container faixa-beneficios">
        <span>
          <Truck size={22} /> Entrega e atendimento
        </span>
        <span>
          <MessageCircle size={22} /> Pedido pelo WhatsApp
        </span>
        <span>
          <ShieldCheck size={22} /> Acessórios para proteger
        </span>
        <span>
          <LockKeyhole size={22} /> Compra sem cadastro
        </span>
      </section>

      {/* Busca por marca e modelo de celular */}
      <section className="container busca-destaque">
        <FiltroAparelho
          produtos={produtos}
          onSelecionar={(modelo) => onCatalogo('', modelo)}
        />
      </section>

      {/* Categorias que o cliente pode escolher */}
      <section className="container secao-vitrine">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ENCONTRE SEU FAVORITO</p>
            <h2>Categorias em destaque</h2>
          </div>

          <button className="link-button" onClick={() => onCatalogo()}>
            Ver todas <ArrowRight size={16} />
          </button>
        </div>

        <div className="categorias-vitrine">
          {categorias.map(({ nome, Icone }) => (
            <button
              key={nome}
              className="categoria-vitrine"
              onClick={() =>
                onCatalogo(nome === 'Cabos' ? 'Carregadores' : nome)
              }
            >
              <span>
                <Icone size={34} strokeWidth={1.5} />
              </span>
              <strong>{nome}</strong>
            </button>
          ))}
        </div>
      </section>

      {/* Produtos que foram marcados como destaque */}
      <section className="container secao-vitrine">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SELEÇÃO LLV CONNECT</p>
            <h2>Produtos em destaque</h2>
          </div>

          <button className="link-button" onClick={() => onCatalogo()}>
            Ver catálogo <ArrowRight size={16} />
          </button>
        </div>

        <div className="products-grid vitrine-grid">
          {produtos
            .filter((produto) => produto.destaque)
            .slice(0, 8)
            .map((produto) => (
              <CardProduto
                key={produto.id}
                produto={produto}
                onAbrir={onAbrir}
                favorito={favoritos.includes(produto.id)}
                onFavorito={onFavorito}
              />
            ))}
        </div>

        {!produtos.some((produto) => produto.destaque) && (
          <p>Nenhum produto em destaque ainda.</p>
        )}
      </section>

      {/* Chamada para o catálogo completo */}
      <section className="container banner-vitrine">
        <div>
          <span className="eyebrow">MAIS QUE ACESSÓRIOS</span>
          <h2>O acessório certo faz a diferença.</h2>
          <p>Encontre proteção, praticidade e estilo em um só lugar.</p>

          <button
            className="btn btn-primary"
            onClick={() => onCatalogo()}
          >
            Explorar agora <ArrowRight size={17} />
          </button>
        </div>

        <div className="banner-phone" aria-hidden="true">
          <Smartphone size={160} strokeWidth={0.85} />
        </div>
      </section>
    </main>
  );
}
