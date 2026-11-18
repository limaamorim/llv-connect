import { useState } from 'react';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react';

import type { Produto } from '../types/produto';
import { ImagemProduto } from '../components/ImagemProduto';
import { linkWhatsapp, moeda } from '../utils/whatsapp';

type Props = {
  produto: Produto;
  onVoltar: () => void;
  onSacola: (produto: Produto, modelo: string, quantidade: number) => void;
  favorito: boolean;
  onFavorito: () => void;
};

export function DetalheProduto({
  produto,
  onVoltar,
  onSacola,
  favorito,
  onFavorito,
}: Props) {
  const [modelo, setModelo] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [fotoAtiva, setFotoAtiva] = useState(0);

  const precisaModelo = produto.modelos.length > 0;
  const disponivel = produto.estoque === undefined || produto.estoque > 0;
  const habilitado = disponivel && (!precisaModelo || Boolean(modelo));
  const whatsapp = linkWhatsapp(produto, modelo, quantidade);

  // No futuro, a galeria poderá receber várias imagens do Supabase.
  const fotos = [produto.imagem];

  return (
    <main className="container detail-page detalhe-novo">
      <div className="breadcrumbs">
        Início <span>/</span> Produtos <span>/</span>
        {produto.categoria} <span>/</span> {produto.nome}
      </div>

      <button className="back" onClick={onVoltar}>
        <ArrowLeft size={16} /> Voltar aos produtos
      </button>

      <div className="detail-layout">
        {/* Foto principal e miniaturas */}
        <div className="galeria-produto">
          <div className="detail-picture">
            <ImagemProduto
              produto={{ ...produto, imagem: fotos[fotoAtiva] }}
              grande
            />
          </div>

          <div className="miniaturas">
            <button
              className="selecionada"
              onClick={() => setFotoAtiva(0)}
              aria-label="Ver foto principal"
            >
              <ImagemProduto produto={produto} />
            </button>
          </div>
        </div>

        {/* Informações e ações de compra */}
        <div className="detail-info">
          <div className="titulo-detalhe">
            <div>
              <span className="product-category">
                {produto.categoria.toUpperCase()}
              </span>
              <h1>{produto.nome}</h1>
              <p className="codigo-produto">
                Código: LLV-{String(produto.id).padStart(3, '0')}
              </p>
            </div>

            <button
              className={`favorito-detalhe ${favorito ? 'ativo' : ''}`}
              aria-label={favorito ? 'Remover favorito' : 'Favoritar'}
              onClick={onFavorito}
            >
              <Heart
                size={20}
                fill={favorito ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          <strong className="detail-price">{moeda(produto.preco)}</strong>

          <span
            className={`estoque-selo ${!disponivel ? 'sem-estoque' : ''}`}
          >
            {disponivel ? '● Em estoque' : 'Indisponível'}
          </span>

          <p className="detail-description">{produto.descricao}</p>

          <ul className="vantagens-produto">
            <li>
              <ShieldCheck size={17} />
              Produto selecionado para seu dia a dia
            </li>
            <li>
              <CheckCircle2 size={17} />
              Atendimento direto com a loja
            </li>
            <li>
              <Truck size={17} />
              Entrega a combinar no WhatsApp
            </li>
          </ul>

          {/* Produtos específicos exigem que o cliente escolha o celular */}
          {precisaModelo ? (
            <div className="model-selector">
              <label htmlFor="modelo-produto">
                Escolha o modelo compatível
              </label>
              <select
                id="modelo-produto"
                value={modelo}
                onChange={(evento) => setModelo(evento.target.value)}
              >
                <option value="">Selecione seu celular</option>
                {produto.modelos.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <small>Escolha exatamente o modelo do seu aparelho.</small>

              <div className="chips-modelos">
                {produto.modelos.slice(0, 5).map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          ) : (
            <p className="universal">
              <CheckCircle2 size={17} />
              Acessório geral. Consulte a compatibilidade antes de finalizar.
            </p>
          )}

          {/* Quantidade que o cliente deseja comprar */}
          <div className="quantidade-produto">
            <span>Quantidade</span>

            <div>
              <button
                disabled={quantidade === 1}
                aria-label="Diminuir"
                onClick={() => setQuantidade((atual) => Math.max(1, atual - 1))}
              >
                <Minus size={16} />
              </button>

              <strong>{quantidade}</strong>

              <button
                disabled={
                  produto.estoque !== undefined &&
                  quantidade >= produto.estoque
                }
                aria-label="Aumentar"
                onClick={() => setQuantidade((atual) => atual + 1)}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Compra direta pelo WhatsApp ou inclusão na sacola */}
          <div className="acoes-detalhe">
            {whatsapp && habilitado ? (
              <a
                className="btn btn-whatsapp"
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={20} />
                Comprar pelo WhatsApp
              </a>
            ) : (
              <button className="btn btn-whatsapp" disabled>
                <MessageCircle size={20} />
                {!disponivel
                  ? 'Indisponível'
                  : !habilitado
                    ? 'Selecione o modelo'
                    : 'WhatsApp não configurado'}
              </button>
            )}

            <button
              className="btn btn-add-sacola"
              disabled={!habilitado}
              onClick={() => onSacola(produto, modelo, quantidade)}
            >
              <ShoppingBag size={19} />
              Adicionar à sacola
            </button>
          </div>

          {!whatsapp && (
            <p className="setup-note">
              O número oficial do WhatsApp será configurado pela loja
              em src/data/loja.ts.
            </p>
          )}

          <div className="seguranca-produto">
            <ShieldCheck size={17} />
            O pedido será confirmado com a LLV Connect,
            sem pagamento pelo site.
          </div>
        </div>
      </div>
    </main>
  );
}
