import { loja } from '../data/loja';
import type { Produto } from '../types/produto';
export const moeda = (valor: number) => valor.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
// Quantidade é incluída na mensagem, não é uma cobrança online.
export function linkWhatsapp(produto: Produto, modelo: string, quantidade=1): string | null {
  if (!loja.whatsapp) return null;
  const mensagem = 'Olá! Vi no site da LLV Connect o produto '+produto.nome+(modelo?' para '+modelo:'')+'. Quantidade: '+quantidade+'. Valor unitário: '+moeda(produto.preco)+'. Total: '+moeda(produto.preco*quantidade)+'. Gostaria de saber como comprar!';
  return 'https://wa.me/'+loja.whatsapp+'?text='+encodeURIComponent(mensagem);
}
