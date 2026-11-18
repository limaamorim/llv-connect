import { ArrowLeft, CheckCircle2, MessageCircle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import type { Produto } from '../types/produto';
import { linkWhatsapp, moeda } from '../utils/whatsapp';

type Props = { produto: Produto; onVoltar: () => void };
export function DetalheProduto({ produto, onVoltar }: Props) {
  const [modelo, setModelo] = useState('');
  const precisaModelo = produto.modelos.length > 0;
  const link = linkWhatsapp(produto, modelo);
  const podeComprar = (!precisaModelo || !!modelo) && !!link && produto.estoque !== 0;
  const foto = /^https?:\/\//i.test(produto.imagem);

  return <main className="container detail-page"><button className="back" onClick={onVoltar}><ArrowLeft size={18}/> Voltar ao catálogo</button><div className="detail-layout"><div className="detail-picture">{foto ? <img className="detail-photo" src={produto.imagem} alt={produto.nome}/> : <span role="img" aria-label={produto.nome}>{produto.imagem || '📱'}</span>}</div><div className="detail-info"><p className="eyebrow">{produto.categoria.toUpperCase()}</p><h1>{produto.nome}</h1><p className="detail-description">{produto.descricao}</p><strong className="detail-price">{moeda(produto.preco)}</strong>
    {precisaModelo ? <label className="model-selector">Selecione seu modelo<select value={modelo} onChange={e => setModelo(e.target.value)}><option value="">Escolha o celular</option>{produto.modelos.map(m => <option key={m}>{m}</option>)}</select><small>Selecione o modelo exato antes de solicitar a compra.</small></label> : <p className="universal"><CheckCircle2 size={18}/> Confirme a compatibilidade e a conexão com a loja antes de comprar.</p>}
    {podeComprar ? <a className="btn btn-primary buy-button" href={link!} target="_blank" rel="noreferrer"><MessageCircle size={20}/> Comprar pelo WhatsApp</a> : <button className="btn btn-primary buy-button" disabled><MessageCircle size={20}/> {produto.estoque===0 ? 'Produto indisponível' : !link ? 'WhatsApp ainda não configurado' : 'Selecione o modelo'}</button>}
    {!link && <p className="setup-note">Configure o WhatsApp oficial em <code>src/data/loja.ts</code>.</p>}
    <p className="safe-note"><ShieldCheck size={17}/> O atendimento e a confirmação do pedido acontecem no WhatsApp.</p>
  </div></div></main>;
}
