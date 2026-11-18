import type { Produto } from '../types/produto';

// Produtos de demonstração: valores, fotos e disponibilidade NÃO são reais.
// Depois eles serão substituídos pelos produtos cadastrados no Supabase.
export const produtos: Produto[] = [
  {
    id: 1,
    nome: 'Capinha Transparente Premium',
    preco: 29.9,
    categoria: 'Capinhas',
    descricao: 'Proteção e estilo no dia a dia.',
    imagem: '📱',
    destaque: true,
    modelos: [
      'iPhone 11',
      'iPhone 12',
      'iPhone 12 Pro',
      'iPhone 12 Pro Max',
      'iPhone 13',
      'Galaxy A55',
    ],
  },
  {
    id: 2,
    nome: 'Película de Vidro 3D',
    preco: 19.9,
    categoria: 'Películas',
    descricao: 'Proteção para a tela do seu aparelho.',
    imagem: '🛡️',
    destaque: true,
    modelos: ['iPhone 12', 'iPhone 12 Pro', 'iPhone 13', 'Galaxy A55', 'Galaxy S24'],
  },
  {
    id: 3,
    nome: 'Carregador Rápido USB-C',
    preco: 49.9,
    categoria: 'Carregadores',
    descricao: 'Carregamento prático para aparelhos compatíveis com USB-C.',
    imagem: '🔌',
    destaque: true,
    modelos: [],
  },
  {
    id: 4,
    nome: 'Fone Bluetooth',
    preco: 79.9,
    categoria: 'Fones',
    descricao: 'Ouça músicas sem fios em aparelhos Bluetooth compatíveis.',
    imagem: '🎧',
    novidade: true,
    modelos: [],
  },
  {
    id: 5,
    nome: 'Carregador Portátil',
    preco: 99.9,
    categoria: 'Acessórios',
    descricao: 'Energia extra para levar onde quiser.',
    imagem: '🔋',
    destaque: true,
    modelos: [],
  },
  {
    id: 6,
    nome: 'Capinha Silicone Colorida',
    preco: 34.9,
    categoria: 'Capinhas',
    descricao: 'Acabamento macio e várias opções de cor.',
    imagem: '📲',
    novidade: true,
    modelos: ['iPhone 12 Pro', 'iPhone 12 Pro Max', 'Galaxy A55'],
  },
  {
    id: 7,
    nome: 'Cabo USB-C',
    preco: 24.9,
    categoria: 'Carregadores',
    descricao: 'Cabo para aparelhos com entrada USB-C.',
    imagem: '🔗',
    modelos: [],
  },
  {
    id: 8,
    nome: 'Película de Privacidade',
    preco: 39.9,
    categoria: 'Películas',
    descricao: 'Mais privacidade para a sua tela.',
    imagem: '🔒',
    novidade: true,
    modelos: ['iPhone 12 Pro', 'Galaxy S24'],
  },
];

// Organizar marcas em um só lugar facilita adicionar novos modelos depois.
export const aparelhos: Record<string, Record<string, string[]>> = {
  Apple: {
    'iPhone 11': ['iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max'],
    'iPhone 12': ['iPhone 12', 'iPhone 12 Mini', 'iPhone 12 Pro', 'iPhone 12 Pro Max'],
    'iPhone 13': ['iPhone 13', 'iPhone 13 Mini', 'iPhone 13 Pro', 'iPhone 13 Pro Max'],
  },
  Samsung: {
    'Galaxy A': ['Galaxy A15', 'Galaxy A35', 'Galaxy A55'],
    'Galaxy S': ['Galaxy S23', 'Galaxy S24'],
  },
  Motorola: { 'Moto G': ['Moto G54', 'Moto G84', 'Moto G85'] },
};
