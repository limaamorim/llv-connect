// Tipos definem o formato dos dados. Assim o TypeScript ajuda a evitar erros.
export type Categoria = 'Capinhas' | 'Películas' | 'Carregadores' | 'Fones' | 'Acessórios';

export type Produto = {
  id: number;
  nome: string;
  preco: number;
  categoria: Categoria;
  descricao: string;
  imagem: string; // Imagem ilustrativa por enquanto: emoji.
  destaque?: boolean;
  novidade?: boolean;
  // Array vazio significa produto universal, que não precisa de seleção de modelo.
  modelos: string[];
};
