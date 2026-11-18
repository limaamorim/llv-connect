-- LLV CONNECT — habilitar administrador, vendas e upload de fotos.
-- 1. Execute este arquivo inteiro no SQL Editor do seu projeto Supabase.
-- 2. Depois execute (em outra consulta):
-- INSERT INTO public.administradores (user_id)
-- VALUES ('COLE-AQUI-O-UID-DO-AUTHENTICATION-USERS')
-- ON CONFLICT (user_id) DO NOTHING;
-- NÃO substitua por e-mail e NÃO publique o UID ou a senha em código frontend.

create table if not exists public.administradores (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists public.vendas (
  id bigint generated always as identity primary key,
  produto_id bigint not null references public.produtos(id) on delete restrict,
  produto_nome text not null,
  quantidade integer not null check (quantidade > 0),
  preco_unitario numeric(12,2) not null check (preco_unitario >= 0),
  custo_unitario numeric(12,2) not null check (custo_unitario >= 0),
  criada_em timestamptz not null default now()
);

alter table public.administradores enable row level security;
alter table public.categorias enable row level security;
alter table public.produtos enable row level security;
alter table public.vendas enable row level security;

-- Cada usuário autenticado pode ver apenas a própria permissão admin.
drop policy if exists "llv_admin_ver_proprio_acesso" on public.administradores;
create policy "llv_admin_ver_proprio_acesso"
on public.administradores for select to authenticated
using (user_id = (select auth.uid()));

-- As políticas abaixo só permitem escrita para UID cadastrado na tabela.
drop policy if exists "llv_admin_criar_categoria" on public.categorias;
create policy "llv_admin_criar_categoria" on public.categorias
for insert to authenticated
with check (exists(select 1 from public.administradores
                   where user_id = (select auth.uid())));

drop policy if exists "llv_admin_editar_categoria" on public.categorias;
create policy "llv_admin_editar_categoria" on public.categorias
for update to authenticated
using (exists(select 1 from public.administradores
              where user_id = (select auth.uid())))
with check (exists(select 1 from public.administradores
                   where user_id = (select auth.uid())));

drop policy if exists "llv_admin_excluir_categoria" on public.categorias;
create policy "llv_admin_excluir_categoria" on public.categorias
for delete to authenticated
using (exists(select 1 from public.administradores
              where user_id = (select auth.uid())));

drop policy if exists "llv_admin_ler_produtos" on public.produtos;
create policy "llv_admin_ler_produtos" on public.produtos
for select to authenticated
using (exists(select 1 from public.administradores
              where user_id = (select auth.uid())));

drop policy if exists "llv_admin_criar_produto" on public.produtos;
create policy "llv_admin_criar_produto" on public.produtos
for insert to authenticated
with check (exists(select 1 from public.administradores
                   where user_id = (select auth.uid())));

drop policy if exists "llv_admin_editar_produto" on public.produtos;
create policy "llv_admin_editar_produto" on public.produtos
for update to authenticated
using (exists(select 1 from public.administradores
              where user_id = (select auth.uid())))
with check (exists(select 1 from public.administradores
                   where user_id = (select auth.uid())));

drop policy if exists "llv_admin_excluir_produto" on public.produtos;
create policy "llv_admin_excluir_produto" on public.produtos
for delete to authenticated
using (exists(select 1 from public.administradores
              where user_id = (select auth.uid())));

drop policy if exists "llv_admin_ver_vendas" on public.vendas;
create policy "llv_admin_ver_vendas" on public.vendas
for select to authenticated
using (exists(select 1 from public.administradores
              where user_id = (select auth.uid())));

-- O cadastro de vendas só ocorre via função registrar_venda,
-- que confere permissões e atualiza estoque em uma transação.
create or replace function public.registrar_venda(
  p_produto_id bigint, p_quantidade integer, p_preco_unitario numeric
) returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  p public.produtos%rowtype;
begin
  if not exists (
    select 1 from public.administradores
    where user_id = auth.uid()
  ) then
    raise exception 'Acesso não autorizado';
  end if;

  if p_quantidade is null or p_quantidade <= 0
     or p_preco_unitario is null or p_preco_unitario < 0 then
    raise exception 'Quantidade ou valor inválido';
  end if;

  select * into p
  from public.produtos
  where id = p_produto_id
  for update;

  if not found or p.estoque < p_quantidade then
    raise exception 'Produto inexistente ou estoque insuficiente';
  end if;

  update public.produtos
    set estoque = estoque - p_quantidade
    where id = p_produto_id;

  insert into public.vendas
    (produto_id, produto_nome, quantidade, preco_unitario, custo_unitario)
  values
    (p.id, p.nome, p_quantidade, p_preco_unitario, p.custo);
end;
$$;

-- Limita os privilégios de API conforme a finalidade de cada papel.
grant usage on schema public to authenticated;
grant select on public.administradores to authenticated;
grant select, insert, update, delete on public.categorias to authenticated;
grant select, insert, update, delete on public.produtos to authenticated;
grant select, insert on public.vendas to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- Bloqueia escrita anônima e acesso público ao financeiro.
revoke insert, update, delete on public.categorias from anon;
revoke insert, update, delete on public.produtos from anon;
revoke all on public.vendas from anon;
revoke all on public.administradores from anon;

revoke all on function public.registrar_venda(bigint,integer,numeric)
from public, anon;
grant execute on function public.registrar_venda(bigint,integer,numeric)
to authenticated;

-- Bucket público para exibir apenas fotos comerciais.
insert into storage.buckets
  (id, name, public, file_size_limit, allowed_mime_types)
values
  ('produtos', 'produtos', true, 5242880,
   array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg','image/png','image/webp'];

-- Apenas administradores autenticados podem fazer upload das fotos.
drop policy if exists "llv_admin_upload_fotos" on storage.objects;
create policy "llv_admin_upload_fotos"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'produtos'
  and exists(
    select 1 from public.administradores
    where user_id = (select auth.uid())
  )
);

-- Não damos permissão de update/delete no Storage ao navegador.
-- Fotos antigas podem ser removidas manualmente no painel Supabase.
