-- Execute este arquivo no SQL Editor do Supabase.
-- IMPORTANTE: crie o usuário no Authentication > Users antes de dar permissão.
create table if not exists public.administradores (
  user_id uuid primary key references auth.users(id) on delete cascade
);
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

-- Os administradores só conseguem consultar seu próprio registro.
create policy "ver meu acesso" on public.administradores for select to authenticated using (user_id = (select auth.uid()));
create policy "categorias publicas" on public.categorias for select to anon, authenticated using (true);
create policy "admin cria categoria" on public.categorias for insert to authenticated with check (exists (select 1 from public.administradores a where a.user_id = (select auth.uid())));
create policy "admin edita categoria" on public.categorias for update to authenticated using (exists (select 1 from public.administradores a where a.user_id = (select auth.uid())));
create policy "admin exclui categoria" on public.categorias for delete to authenticated using (exists (select 1 from public.administradores a where a.user_id = (select auth.uid())));

create policy "catalogo publico e admin" on public.produtos for select to anon, authenticated using (ativo = true or exists (select 1 from public.administradores a where a.user_id = (select auth.uid())));
create policy "admin cria produto" on public.produtos for insert to authenticated with check (exists (select 1 from public.administradores a where a.user_id = (select auth.uid())));
create policy "admin edita produto" on public.produtos for update to authenticated using (exists (select 1 from public.administradores a where a.user_id = (select auth.uid()))) with check (exists (select 1 from public.administradores a where a.user_id = (select auth.uid())));
create policy "admin exclui produto" on public.produtos for delete to authenticated using (exists (select 1 from public.administradores a where a.user_id = (select auth.uid())));
create policy "admin lista vendas" on public.vendas for select to authenticated using (exists (select 1 from public.administradores a where a.user_id = (select auth.uid())));
create policy "admin cria vendas" on public.vendas for insert to authenticated with check (exists (select 1 from public.administradores a where a.user_id = (select auth.uid())));

-- A função faz a baixa do estoque e o registro da venda juntos.
create or replace function public.registrar_venda(p_produto_id bigint, p_quantidade integer, p_preco_unitario numeric)
returns void language plpgsql security invoker set search_path = public as $$
declare p public.produtos%rowtype;
begin
  if not exists (select 1 from public.administradores where user_id = auth.uid()) then
    raise exception 'Acesso não autorizado';
  end if;
  if p_quantidade is null or p_quantidade <= 0 or p_preco_unitario is null or p_preco_unitario < 0 then
    raise exception 'Verifique quantidade e valor';
  end if;
  select * into p from public.produtos where id = p_produto_id for update;
  if not found or p.estoque < p_quantidade then raise exception 'Produto inexistente ou estoque insuficiente'; end if;
  update public.produtos set estoque = estoque - p_quantidade where id = p_produto_id;
  insert into public.vendas(produto_id,produto_nome,quantidade,preco_unitario,custo_unitario)
  values (p.id,p.nome,p_quantidade,p_preco_unitario,p.custo);
end;
$$;
revoke all on function public.registrar_venda(bigint,integer,numeric) from public, anon;
grant execute on function public.registrar_venda(bigint,integer,numeric) to authenticated;

insert into public.categorias(nome) values ('Capinhas'),('Películas'),('Carregadores'),('Fones'),('Acessórios') on conflict (nome) do nothing;

-- Após criar o usuário no Authentication > Users, substitua pelo UUID real:
-- insert into public.administradores(user_id) values ('UUID-DO-USUARIO');

-- O catálogo público não deve expor o custo de compra (informação interna).
-- Os admins autenticados podem consultar as colunas completas.
revoke select on public.produtos from anon;
grant select (id,nome,descricao,categoria,preco,estoque,imagem,modelos,destaque,novidade,ativo) on public.produtos to anon;
