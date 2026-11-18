# LLV Connect — Catálogo e painel administrativo

Projeto didático em **React + TypeScript**, com CSS organizado e Supabase. Os arquivos e nomes das funções foram escritos em português sempre que possível.

## Como executar

1. Instale o Node.js.
2. Abra a pasta e execute `npm install`.
3. Execute `npm run dev`.
4. Para conferir a versão de produção: `npm run build`.

## Testar o painel sem Supabase

1. Execute `npm install` e `npm run dev`.
2. Abra `http://localhost:5173/admin`.
3. O painel abre automaticamente em **modo demonstração**, sem usuário ou senha.
4. Teste produtos, categorias, dashboard e registro de vendas.
5. Os dados ficam no `localStorage` deste navegador. Outros aparelhos não verão suas alterações; limpar os dados do navegador apaga as mudanças.

**IMPORTANTE:** o modo demonstração é aberto a qualquer visitante e **não deve ser usado em produção com dados reais**. Para colocar a loja no ar, configure o Supabase e o login seguro conforme abaixo. As informações do modo demonstração não são migradas automaticamente para o Supabase.

## Configurar Supabase (para uso real e login seguro)

1. Crie um projeto em https://supabase.com.
2. No SQL Editor, execute o conteúdo de `supabase/schema.sql`.
3. Copie `.env.example` para `.env.local`.
4. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` com a URL e a chave **publicável/anon**. **Nunca coloque service_role no frontend**.
5. Em Authentication > Users crie um usuário para o administrador (com senha forte).
6. Copie o UUID desse usuário e execute no SQL Editor:
   `insert into public.administradores(user_id) values ('UUID-AQUI');`
7. Reinicie o servidor `npm run dev` e acesse **/admin**.

**Atenção:** sem Supabase, o catálogo e o painel funcionam apenas como demonstração local. O login seguro só é exigido quando o Supabase está configurado.

## O que cada pasta faz

- `src/components`: peças reutilizáveis do visual, como a busca e os cards.
- `src/pages`: as páginas Início, Catálogo, Detalhe e Admin.
- `src/services/supabase.ts`: acesso ao banco e login.
- `src/types`: formato dos dados no TypeScript.
- `src/data`: aparelhos de referência e dados demonstrativos.
- `src/utils`: funções auxiliares, como moeda e WhatsApp.
- `supabase/schema.sql`: tabelas, segurança e função de registrar venda.

## Uso da loja

- Em /admin, cadastre categorias e produtos (nome, preço, custo, estoque e foto por URL).
- Informe modelos compatíveis separados por vírgula. Deixe vazio para itens universais.
- Vendas feitas pelo WhatsApp precisam ser **registradas manualmente** em Vendas.
- Ao registrar a venda, o Supabase reduz o estoque de forma atômica.
- O dashboard calcula faturamento e lucro **bruto** (vendas menos custo dos produtos). Não desconta impostos ou despesas.
- Produtos com vendas registradas não podem ser apagados; desative-os em vez disso.

## Observações

- Configure o WhatsApp oficial em `src/data/loja.ts`; não use telefone pessoal.
- **Detectar aparelho automaticamente** não foi adicionado: navegadores modernos não oferecem identificação confiável de modelo. Há uma dica para encontrar o modelo nas configurações do celular.
- Estoque é por produto, não por cor/modelo. Para controlar variações individualmente, será necessária uma próxima melhoria.
- As imagens podem ser URLs públicas; upload para Storage não foi incluído nesta versão inicial.
- O filtro de aparelhos exibe modelos de referência e modelos dos produtos cadastrados; só mostra como compatíveis aqueles vinculados ao produto.
- No Netlify, cadastre as mesmas variáveis `VITE_...` em Environment Variables. O arquivo `netlify.toml` já contém o redirecionamento SPA.
- Nunca publique `.env.local` ou senhas no GitHub.


## Visual novo do site público (desktop e celular)

O projeto agora segue uma vitrine com azul escuro, azul vibrante, fundo claro e botões de WhatsApp:

- **Início** (`src/pages/Inicio.tsx`): banner, benefícios, busca por aparelho, categorias e produtos em destaque.
- **Catálogo** (`src/pages/Catalogo.tsx`): pesquisa com sugestões, filtros por categoria/marca/modelo, ordenação e painel de filtros no celular.
- **Detalhes** (`src/pages/DetalheProduto.tsx`): foto/ilustração, preço, quantidade, compatibilidade, favoritar, adicionar à sacola e comprar no WhatsApp.
- **Cabeçalho e navegação inferior** (`src/components/Header.tsx`, `NavegacaoMobile.tsx`): menus adequados para computador e celular.
- **Cartões e imagens** (`src/components/CardProduto.tsx`, `ImagemProduto.tsx`): mostram fotos cadastradas por URL ou ilustrações para os exemplos.

**Para testar:** `npm install`, `npm run dev`, abrir `http://localhost:5173` e testar o modo responsivo (F12 no navegador).

O telefone oficial fica em `src/data/loja.ts`. Até ele ser informado, o botão de comprar pelo WhatsApp fica indisponível; a sacola continua podendo ser testada.

Favoritos ficam neste navegador. A sacola é temporária (perde os itens quando a página é recarregada). Isso é intencional nesta versão inicial.

**Fotografias:** as imagens de referência serviram como inspiração de layout, e não foram copiadas. Os produtos demonstrativos usam ilustrações CSS até que a loja cadastre fotos reais. A página de detalhes exibe uma miniatura enquanto o cadastro tiver somente uma imagem.

Não foram alterados o painel administrativo, o banco de dados nem os registros existentes.
