import { useState } from 'react';
import { ArrowRight, Search, Smartphone } from 'lucide-react';
import { aparelhos as modelosExemplo } from '../data/produtos';
import type { Produto } from '../types/produto';

type Props = { onSelecionar: (modelo: string) => void; produtos?: Produto[] };

export function FiltroAparelho({ onSelecionar, produtos = [] }: Props) {
  const [busca, setBusca] = useState('');
  const [marca, setMarca] = useState('Apple');
  const [modelo, setModelo] = useState('');

  // Acrescenta modelos cadastrados no admin à lista inicial de aparelhos.
  const todosModelos = [
    ...new Set([
      ...Object.values(modelosExemplo).flatMap((linhas) => Object.values(linhas).flat()),
      ...produtos.flatMap((p) => p.modelos || []),
    ]),
  ];
  const marcas = ['Apple', 'Samsung', 'Motorola', 'Xiaomi', 'Outros'];
  function marcaDoModelo(nome: string) {
    if (/iphone/i.test(nome)) return 'Apple';
    if (/galaxy/i.test(nome)) return 'Samsung';
    if (/moto|edge/i.test(nome)) return 'Motorola';
    if (/redmi|poco|xiaomi/i.test(nome)) return 'Xiaomi';
    return 'Outros';
  }
  const modelosDaMarca = todosModelos.filter((nome) => marcaDoModelo(nome) === marca);
  const sugestoes =
    busca.trim().length > 0
      ? todosModelos
          .filter((nome) => nome.toLowerCase().includes(busca.toLowerCase()))
          .slice(0, 6)
      : [];

  return (
    <section className="finder finder-new" id="buscar-aparelho">
      <p className="eyebrow">ACESSÓRIOS POR APARELHO</p>
      <h2>Qual é o seu celular?</h2>
      <p className="finder-subtitle">
        Escolha o modelo e veja acessórios compatíveis com seu aparelho.
      </p>
      <div className="finder-search">
        <Search size={21} />
        <input
          aria-label="Buscar modelo do celular"
          placeholder="Ex.: iPhone 15, Galaxy S24, Redmi Note 13"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>
      {sugestoes.length > 0 && (
        <div className="finder-suggestions" role="listbox">
          {sugestoes.map((nome) => (
            <button key={nome} onClick={() => onSelecionar(nome)}>
              <Smartphone size={16} />
              {nome}
              <ArrowRight size={15} />
            </button>
          ))}
        </div>
      )}
      {busca && sugestoes.length === 0 && (
        <p className="finder-help">
          Nenhum modelo encontrado. Tente selecionar pela marca.
        </p>
      )}
      <div className="finder-separator">
        <span>ou escolha pela marca</span>
      </div>
      <div className="finder-new-fields">
        <select
          aria-label="Marca do celular"
          value={marca}
          onChange={(e) => {
            setMarca(e.target.value);
            setModelo('');
          }}
        >
          {marcas.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <select
          aria-label="Modelo do celular"
          value={modelo}
          onChange={(e) => setModelo(e.target.value)}
        >
          <option value="">Modelo</option>
          {modelosDaMarca.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <button
          className="btn btn-primary"
          disabled={!modelo}
          onClick={() => onSelecionar(modelo)}
        >
          Ver produtos <ArrowRight size={17} />
        </button>
      </div>
      <p className="finder-help">
        <Smartphone size={15} /> Não sabe o modelo? Consulte em Configurações → Sobre o
        telefone.
      </p>
    </section>
  );
}
