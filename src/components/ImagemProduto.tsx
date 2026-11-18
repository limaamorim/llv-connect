import {
  Cable,
  Headphones,
  BatteryCharging,
  Shield,
  Smartphone,
  PlugZap,
} from 'lucide-react';
import type { Produto } from '../types/produto';

// Imagens reais cadastradas no admin têm prioridade.
// Para os exemplos, mostramos ilustrações consistentes em vez de emojis.
export function ImagemProduto({
  produto,
  grande = false,
}: {
  produto: Produto;
  grande?: boolean;
}) {
  if (/^https?:\/\//.test(produto.imagem))
    return (
      <img
        className="produto-foto"
        src={produto.imagem}
        alt={produto.nome}
        loading={grande ? 'eager' : 'lazy'}
      />
    );
  const nome = (produto.nome + produto.categoria).toLowerCase();
  if (/capinha|case/.test(nome))
    return (
      <div className={'produto-ilustracao case-illustration ' + (grande ? 'grande' : '')}>
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
  if (/película|pelicula/.test(nome))
    return (
      <div className="produto-ilustracao pelicula-illustration">
        <div className="glass-phone">
          <Smartphone size={grande ? 125 : 82} strokeWidth={1.1} />
          <span />
        </div>
        <Shield size={grande ? 47 : 31} strokeWidth={1.3} />
      </div>
    );
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
