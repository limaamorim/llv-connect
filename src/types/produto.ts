// Tipos compartilhados pelo catálogo e pelo painel administrativo.
export type Categoria = string;
export type Produto = {
  id: number;
  nome: string;
  preco: number;
  custo?: number;
  estoque?: number;
  ativo?: boolean;
  categoria: Categoria;
  descricao: string;
  imagem: string; // Pode ser uma URL de foto ou emoji nos exemplos.
  destaque?: boolean;
  novidade?: boolean;
  modelos: string[]; // Vazio = produto universal.
};
