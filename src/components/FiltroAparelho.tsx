import { useState } from 'react';
import { ArrowRight, Smartphone } from 'lucide-react';
import { aparelhos } from '../data/produtos';

type Props = { onSelecionar: (modelo: string) => void };

export function FiltroAparelho({ onSelecionar }: Props) {
  // useState guarda a opção selecionada pelo cliente.
  const [marca, setMarca] = useState('');
  const [linha, setLinha] = useState('');
  const [modelo, setModelo] = useState('');
  const linhas = marca ? Object.keys(aparelhos[marca]) : [];
  const modelos = marca && linha ? aparelhos[marca][linha] : [];

  return <section className="finder" id="buscar-aparelho"><div className="finder-intro"><div className="finder-icon"><Smartphone size={23}/></div><div><p className="eyebrow">ACHE O QUE COMBINA COM VOCÊ</p><h2>Encontre acessórios para seu celular</h2><p>Escolha a marca e o modelo. A gente mostra o que combina.</p></div></div>
    <div className="finder-fields">
      <label>Marca<select value={marca} onChange={e => { setMarca(e.target.value); setLinha(''); setModelo(''); }}><option value="">Selecione a marca</option>{Object.keys(aparelhos).map(item => <option key={item}>{item}</option>)}</select></label>
      <label>Linha<select value={linha} disabled={!marca} onChange={e => { setLinha(e.target.value); setModelo(''); }}><option value="">Selecione a linha</option>{linhas.map(item => <option key={item}>{item}</option>)}</select></label>
      <label>Modelo<select value={modelo} disabled={!linha} onChange={e => setModelo(e.target.value)}><option value="">Selecione o modelo</option>{modelos.map(item => <option key={item}>{item}</option>)}</select></label>
      <button className="btn btn-primary" disabled={!modelo} onClick={() => onSelecionar(modelo)}>Ver acessórios <ArrowRight size={17}/></button>
    </div>
  </section>;
}
