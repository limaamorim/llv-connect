import { catalogoConfigurado } from '../services/catalogoService';

// No banco, a coluna "imagem" aceita:
// 1. URL pública completa: https://...
// 2. Foto no bucket "produtos": storage:nome-da-foto.jpg
export function obterUrlImagem(imagem: string): string | null {
  if (/^https?:\/\//i.test(imagem)) return imagem;

  if (catalogoConfigurado && imagem.startsWith('storage:')) {
    const caminho = imagem.slice('storage:'.length).trim();
    if (!caminho) return null;

    const base = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
    const caminhoSeguro = caminho.split('/').map(encodeURIComponent).join('/');

    return `${base}/storage/v1/object/public/produtos/${caminhoSeguro}`;
  }

  return null;
}
