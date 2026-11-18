-- LLV Connect: preparação da VITRINE pública (somente leitura).
-- Execute no Supabase > SQL Editor como proprietário do projeto.
-- Não cria usuários administradores, vendas nem funções de pagamento.
-- Se as tabelas já existem, preserva os registros cadastrados.

create table if not exists public.categorias (
  id bigint generated always as identity primary key,
  nome text not null unique check (length(trim(nome)) > 0)
);

create table if not exists public.produtos (
  id bigint generated always as identity primary key,
  nome text not null,
  descricao text not null default '',
  categoria text not null references public.categorias(nome) on update cascade,
  preco numeric(12,2) not null check (preco >= 0),
  custo numeric(12,2) not null default 0 check (custo >= 0),
  estoque integer not null default 0 check (estoque >= 0),
  imagem text not null default '',
  modelos jsonb not null default '[]'::jsonb check (jsonb_typeof(modelos) = 'array'),
  destaque boolean not null default false,
  novidade boolean not null default false,
  ativo boolean not null default true
);

-- As tabelas precisam estar protegidas por Row Level Security (RLS).
alter table public.categorias enable row level security;
alter table public.produtos enable row level security;

-- Evita repetir as políticas ao executar este arquivo novamente.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'categorias'
      and policyname = 'llv_publico_ler_categorias'
  ) then
    create policy "llv_publico_ler_categorias"
    on public.categorias
    for select to anon
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'produtos'
      and policyname = 'llv_publico_ler_produtos_ativos'
  ) then
    create policy "llv_publico_ler_produtos_ativos"
    on public.produtos
    for select to anon
    using (ativo = true);
  end if;
end $$;

-- O site público não precisa acessar preço de custo, histórico de vendas
-- ou dados de administradores. Autorize SOMENTE as colunas da vitrine.
grant usage on schema public to anon;
revoke all privileges on public.produtos from anon;
grant select (
  id, nome, descricao, categoria, preco, estoque, imagem,
  modelos, destaque, novidade, ativo
) on public.produtos to anon;
grant select (id, nome) on public.categorias to anon;

-- Cria as categorias principais sem duplicar as que já existem.
insert into public.categorias (nome)
values
  ('Capinhas'),
  ('Películas'),
  ('Carregadores'),
  ('Fones'),
  ('Acessórios')
on conflict (nome) do nothing;

-- Bucket público para fotos de produtos (somente imagens públicas).
-- Faça upload pelo painel Storage do Supabase.
insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do update set public = true;

-- O navegador pode visualizar fotos, mas não enviar nem excluir arquivos.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'llv_publico_ler_imagens_produtos'
  ) then
    create policy "llv_publico_ler_imagens_produtos"
    on storage.objects
    for select to anon
    using (bucket_id = 'produtos');
  end if;
end $$;

-- EXEMPLO de cadastro (opcional, execute manualmente substituindo dados):
-- insert into public.produtos
--   (nome, descricao, categoria, preco, estoque, imagem, modelos, destaque)
-- values
--   ('Capinha Transparente', 'Capa para celular', 'Capinhas', 29.90, 8,
--    'storage:capinha-transparente.jpg',
--    '["iPhone 12 Pro", "iPhone 13"]'::jsonb, true);
--
-- Produto universal? Use modelos = '[]'::jsonb.
-- Para ocultar um produto, use ativo = false.
