import {
  Cable,
  Headphones,
  BatteryCharging,
  Shield,
  Smartphone,
  PlugZap,
} from 'lucide-react';

import type { Produto } from '../types/produto';

type Props = {
  produto: Produto;
  grande?: boolean;
};

// Fotos reais cadastradas no admin têm prioridade.
// Produtos fictícios recebem uma ilustração para o catálogo não ficar vazio.
export function ImagemProduto({ produto, grande = false }: Props) {
  if (/^https?:\/\//.test(produto.imagem)) {
    return (
      <img
        className="produto-foto"
        src={produto.imagem}
        alt={produto.nome}
        loading={grande ? 'eager' : 'lazy'}
      />
    );
  }

  const nome = (produto.nome + produto.categoria).toLowerCase();

  // Desenho de capinha feito com CSS.
  if (/capinha|case/.test(nome)) {
    return (
      <div className={`produto-ilustracao case-illustration ${grande ? 'grande' : ''}`}>
        <div className="case-body">
          <div className="camera-plate">
            <i />
            <i />
            <i />
          </div>
          <div className="case-mark" />
        </div>
      </div>
    );
  }

  // Desenho de película protetora.
  if (/película|pelicula/.test(nome)) {
    return (
      <div className="produto-ilustracao pelicula-illustration">
        <div className="glass-phone">
          <Smartphone size={grande ? 125 : 82} strokeWidth={1.1} />
          <span />
        </div>

        <Shield size={grande ? 47 : 31} strokeWidth={1.3} />
      </div>
    );
  }

  // Escolhe o ícone mais adequado para os demais acessórios.
  const Icone = /fone|bluetooth/.test(nome)
    ? Headphones
    : /cabo/.test(nome)
      ? Cable
      : /portátil|portatil|power bank/.test(nome)
        ? BatteryCharging
        : /carregador/.test(nome)
          ? PlugZap
          : Smartphone;

  return (
    <div className="produto-ilustracao accessory-illustration">
      <div className="accessory-circle">
        <Icone size={grande ? 135 : 81} strokeWidth={1.25} />
      </div>
    </div>
  );
}
