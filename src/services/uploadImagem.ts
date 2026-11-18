import { configurado, obterTokenAdministrador } from './supabase';

// Fotos são enviadas ao bucket "produtos" do Supabase Storage.
// O navegador só recebe permissão de upload quando o usuário é administrador.
const url = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const chave =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

const tiposPermitidos: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function enviarImagem(file: File): Promise<string> {
  if (!configurado) {
    throw new Error('Configure o Supabase para enviar fotos dos produtos.');
  }

  const extensao = tiposPermitidos[file.type];
  if (!extensao) {
    throw new Error('Selecione uma imagem JPG, PNG ou WebP.');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('A imagem deve ter até 5 MB.');
  }

  const token = await obterTokenAdministrador();

  // Gera um nome único para evitar substituir fotos antigas.
  const nome = `${crypto.randomUUID()}.${extensao}`;

  const resposta = await fetch(
    `${url}/storage/v1/object/produtos/${nome}`,
    {
      method: 'POST',
      headers: {
        apikey: chave,
        Authorization: `Bearer ${token}`,
        'Content-Type': file.type,
        'x-upsert': 'false',
      },
      body: file,
    },
  );

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    throw new Error(
      erro.message ||
        erro.error ||
        `Não foi possível enviar a imagem (${resposta.status}).`,
    );
  }

  // O catálogo transforma "storage:nome.jpg" numa URL pública.
  return `storage:${nome}`;
}
