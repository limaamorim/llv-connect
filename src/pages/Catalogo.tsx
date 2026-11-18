import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X, Check, ChevronDown } from 'lucide-react';
import { CardProduto } from '../components/CardProduto';
import { aparelhos } from '../data/produtos';
import type { Produto } from '../types/produto';

type Props={produtos:Produto[];categoriaInicial:string;modeloInicial:string;pesquisaInicial:string;onAbrir:(p:Produto)=>void;favoritos:number[];onFavorito:(id:number)=>void};
function identificarMarca(modelo:string){if(/iphone/i.test(modelo))return 'Apple';if(/galaxy/i.test(modelo))return 'Samsung';if(/moto|edge/i.test(modelo))return 'Motorola';if(/redmi|poco|xiaomi/i.test(modelo))return 'Xiaomi';return 'Outros';}

export function Catalogo({produtos,categoriaInicial,modeloInicial,pesquisaInicial,onAbrir,favoritos,onFavorito}:Props){
 const [busca,setBusca]=useState(pesquisaInicial);
 const [categorias,setCategorias]=useState<string[]>(categoriaInicial?[categoriaInicial]:[]);
 const [marcas,setMarcas]=useState<string[]>([]);
 const [modelo,setModelo]=useState(modeloInicial);
 const [filtrosAbertos,setFiltrosAbertos]=useState(false);
 const [ordem,setOrdem]=useState('relevancia');
 const categoriasDisponiveis=[...new Set([...produtos.map(p=>p.categoria),'Capinhas','Películas','Carregadores','Fones','Acessórios'])];
 const todosModelos=[...new Set([...Object.values(aparelhos).flatMap(l=>Object.values(l).flat()),...produtos.flatMap(p=>p.modelos||[])])];
 const marcasDisponiveis=['Apple','Samsung','Motorola','Xiaomi','Outros'];
 const encontrados=useMemo(()=>{
   const termo=busca.trim().toLocaleLowerCase('pt-BR');
   const lista=produtos.filter(p=>{
     const descricao=(p.nome+' '+p.categoria+' '+p.descricao+' '+p.modelos.join(' ')).toLocaleLowerCase('pt-BR');
     const bateBusca=!termo||descricao.includes(termo);
     const bateCategoria=!categorias.length||categorias.includes(p.categoria);
     const bateModelo=!modelo||p.modelos.length===0||p.modelos.includes(modelo);
     const bateMarca=!marcas.length||p.modelos.length===0||p.modelos.some(m=>marcas.includes(identificarMarca(m)));
     return bateBusca&&bateCategoria&&bateModelo&&bateMarca;
   });
   if(ordem==='menor')lista.sort((a,b)=>a.preco-b.preco);
   if(ordem==='maior')lista.sort((a,b)=>b.preco-a.preco);
   if(ordem==='nome')lista.sort((a,b)=>a.nome.localeCompare(b.nome));
   return lista;
 },[produtos,busca,categorias,marcas,modelo,ordem]);
 function alternar(valor:string,lista:string[],atualizar:(l:string[])=>void){atualizar(lista.includes(valor)?lista.filter(i=>i!==valor):[...lista,valor]);}
 function limpar(){setBusca('');setCategorias([]);setMarcas([]);setModelo('');setOrdem('relevancia');}
 const filtrosAtivos=categorias.length+marcas.length+(modelo?1:0);
 // Sugestões úteis enquanto o cliente digita, como na referência.
 const sugestoes=busca.trim().length>=2
   ? produtos.filter(p=>(p.nome+' '+p.modelos.join(' ')).toLowerCase().includes(busca.trim().toLowerCase())).slice(0,4)
   : [];
 return <main className="container catalog-page catalogo-novo">
  <p className="breadcrumbs">Início <span>/</span> Produtos</p>
  <div className="titulo-catalogo"><div><span className="eyebrow">CATÁLOGO LLV CONNECT</span><h1>Encontre seu acessório ideal.</h1><p>Capinhas, películas, fones e tudo para o seu celular.</p></div><span className="total-encontrados">{encontrados.length} produtos</span></div>
  <div className="catalogo-barra"><div className="pesquisa-grupo"><div className="search-field pesquisa-catalogo"><Search size={20}/><input type="search" value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Busque produtos, marcas ou modelos..." aria-label="Buscar produtos"/>{busca&&<button onClick={()=>setBusca('')} aria-label="Apagar busca"><X size={18}/></button>}</div>{sugestoes.length>0&&<div className="sugestoes-produto"><small>PRODUTOS ENCONTRADOS</small>{sugestoes.map(p=><button key={p.id} onClick={()=>onAbrir(p)}><Search size={14}/><span>{p.nome}</span><strong>Ver produto</strong></button>)}</div>}</div><button className="abrir-filtros" onClick={()=>setFiltrosAbertos(true)}><SlidersHorizontal size={17}/> Filtrar {filtrosAtivos>0&&<b>{filtrosAtivos}</b>}</button></div>
  <div className="catalog-layout">
    {filtrosAbertos&&<button className="filtro-fundo" aria-label="Fechar filtros" onClick={()=>setFiltrosAbertos(false)}/>}
    <aside className={'filters filtros-novos '+(filtrosAbertos?'filtros-visiveis':'')}>
      <div className="filtro-cabecalho"><h3><SlidersHorizontal size={18}/> Filtros</h3><button onClick={limpar}>Limpar tudo</button><button className="fechar-filtros" aria-label="Fechar filtros" onClick={()=>setFiltrosAbertos(false)}><X/></button></div>
      <div className="grupo-filtro"><h4>Categoria <ChevronDown size={15}/></h4>{categoriasDisponiveis.map(c=><label key={c} className="opcao-filtro"><input type="checkbox" checked={categorias.includes(c)} onChange={()=>alternar(c,categorias,setCategorias)}/><span>{c} <small>({produtos.filter(p=>p.categoria===c).length})</small></span></label>)}</div>
      <div className="grupo-filtro"><h4>Marca <ChevronDown size={15}/></h4>{marcasDisponiveis.map(m=><label key={m} className="opcao-filtro"><input type="checkbox" checked={marcas.includes(m)} onChange={()=>alternar(m,marcas,setMarcas)}/><span>{m}</span></label>)}</div>
      <div className="grupo-filtro"><h4>Modelo <ChevronDown size={15}/></h4><select value={modelo} onChange={e=>setModelo(e.target.value)} aria-label="Filtrar por modelo"><option value="">Todos os modelos</option>{todosModelos.filter(m=>!marcas.length||marcas.includes(identificarMarca(m))).map(m=><option key={m} value={m}>{m}</option>)}</select><p className="ajuda-filtro">Produtos gerais também aparecem quando você escolhe um aparelho.</p></div>
      <button className="btn btn-primary aplicar-filtros" onClick={()=>setFiltrosAbertos(false)}>Ver resultados ({encontrados.length}) <Check size={17}/></button>
    </aside>
    <section className="resultado-catalogo">
      <div className="resultado-topo"><span>{busca?'Resultados para “'+busca+'”':'Todos os produtos'} · {encontrados.length} encontrados</span><label>Ordenar <select value={ordem} onChange={e=>setOrdem(e.target.value)}><option value="relevancia">Mais relevantes</option><option value="menor">Menor preço</option><option value="maior">Maior preço</option><option value="nome">Nome A-Z</option></select></label></div>
      {(filtrosAtivos>0||busca)&&<div className="filtros-ativos">{[...categorias,...marcas,...(modelo?[modelo]:[])].map(f=><span key={f}>{f}</span>)}<button onClick={limpar}>Limpar filtros <X size={13}/></button></div>}
      {encontrados.length?<div className="products-grid catalog-products">{encontrados.map(p=><CardProduto key={p.id} produto={p} onAbrir={onAbrir} favorito={favoritos.includes(p.id)} onFavorito={onFavorito}/>)}</div>:<div className="empty"><Search size={30}/><h3>Nenhum produto encontrado</h3><p>Experimente mudar o modelo ou limpar os filtros.</p><button className="btn btn-primary" onClick={limpar}>Ver todos os produtos</button></div>}
      <div className="chamada-catalogo"><div><h3>Acessórios para todas as conexões.</h3><p>Explore nossa seleção e encontre o que combina com você.</p></div><span aria-hidden="true">LLV</span></div>
    </section>
  </div>
 </main>;
}
