import { loja } from '../data/loja';
import type { Produto } from '../types/produto';

// Converte um número para o formato de moeda usado no Brasil.
export const moeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Monta uma mensagem para o cliente enviar. Nenhuma compra é cobrada pelo site.
export function linkWhatsapp(produto: Produto, modelo: string): string | null {
  if (!loja.whatsapp) return null;
  const mensagem = `Olá! Vi no site da LLV Connect o produto ${produto.nome}${modelo ? ` para ${modelo}` : ''}, por ${moeda(produto.preco)}. Gostaria de saber como comprar.`;
  return `https://wa.me/${loja.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}
