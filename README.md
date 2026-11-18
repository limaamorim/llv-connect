# LLV Connect

Site de acessórios para celular feito em **React + TypeScript + Vite**, integrado ao **Supabase**. O catálogo é público e as compras são combinadas pelo WhatsApp. O painel `/admin` exige login e permissão.

## Rodar no computador

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`. Para acessar o painel: `http://localhost:5173/admin`.

## 1. Conectar ao Supabase

Você já deve ter um projeto no Supabase. Na pasta principal do projeto, crie `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_SUA_CHAVE_PUBLICA
```

Pegue os valores em **Supabase > Project Settings > API Keys** ou na opção **Connect**.

**Nunca coloque senha, service_role ou sb_secret_... no frontend.** O arquivo `.env.local` é ignorado pelo Git.

Reinicie `npm run dev` depois de modificar as variáveis.

## 2. Preparar o catálogo

No **Supabase > SQL Editor**, execute o arquivo:

- `supabase/catalogo_publico.sql` — tabelas `produtos` e `categorias`, acesso público somente de leitura e bucket público `produtos`.

Se você já executou esse SQL e os produtos estão aparecendo no site, não precisa executar novamente.

## 3. Ativar o administrador (NOVO)

No mesmo SQL Editor, execute **todo o arquivo**:

- `supabase/admin_configuracao.sql`

Ele configura a tabela `administradores`, tabela `vendas`, permissões de cadastrar/editar/excluir, a função de registrar vendas e o upload de fotos no Storage.

Depois, em **Authentication > Users**, copie o **UID** do usuário que você criou e execute uma nova consulta SQL:

```sql
insert into public.administradores (user_id)
values ('COLE-AQUI-O-UID-DO-USUARIO')
on conflict (user_id) do nothing;
```

Substitua o texto entre aspas pelo UID verdadeiro, sem adicionar novas aspas. **Não coloque esse comando dentro do código React.**

Abra `/admin` e faça login com o **e-mail e senha** do usuário criado no Authentication. O UID é somente para registrar a permissão, e **não é a senha**.

Caso o login não funcione, confira se o usuário está com o e-mail confirmado e se o UID foi inserido em `public.administradores`.

## 4. Cadastrar produtos com foto do dispositivo

Em `/admin > Produtos`:

1. Clique em **Novo produto** (formulário).
2. Escolha nome, categoria, preço, custo, estoque e descrição.
3. Em **Foto do produto**, escolha uma imagem JPG, PNG ou WebP do computador/celular (**até 5 MB**).
4. Confira a prévia e clique em **Cadastrar produto**.
5. A imagem será enviada para **Supabase Storage > produtos**. A coluna `imagem` recebe `storage:nome-unico.jpg` automaticamente.

O botão **Editar** carrega os campos e a foto anterior; selecionar uma nova foto a substitui na ficha do produto. Remover a foto no formulário limpa o campo da ficha. **Arquivos antigos permanecem no Storage**, podendo ser removidos manualmente depois.

Se o upload retornar **403 / row-level security**, verifique se executou `admin_configuracao.sql`, se está logado com o usuário certo e se inseriu o UID na tabela `administradores`.

## 5. Categorias, estoque e vendas

- **Categorias**: cadastrar, renomear e excluir quando não há produtos vinculados.
- **Produtos**: cadastrar, editar, ocultar (`ativo = false`) e excluir. Produtos com vendas registradas não podem ser excluídos, para manter o histórico.
- **Vendas**: registre manualmente após confirmação no WhatsApp ou no balcão; o banco baixa o estoque.
- **Dashboard**: faturamento, lucro bruto estimado, total de vendas e estoque. Lucro bruto não desconta impostos, frete ou outras despesas.

Não há pagamento online nem lançamento automático das conversas do WhatsApp.

## 6. Enviar ao cliente

O catálogo público mostra produtos ativos cadastrados no Supabase. O WhatsApp temporário configurado está em `src/data/loja.ts` e **deve ser substituído pelo WhatsApp oficial da loja após a aprovação do cliente**.

Para publicar na Netlify, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` em **Site configuration > Environment variables** e faça um novo deploy. As variáveis do Vite são incorporadas no build, então o `.env.local` local não configura o site publicado.

Antes de compartilhar, teste: início, categorias, busca, detalhes, WhatsApp, login admin, cadastro com foto, edição, estoque e venda. Em produção, evite divulgar `/admin`; porém **esconder a rota não substitui a proteção**, que é feita pelas políticas RLS no banco.

## Organização do projeto

| Pasta/arquivo | Responsabilidade |
| --- | --- |
| `src/pages/Inicio.tsx` | Página inicial da loja |
| `src/pages/Catalogo.tsx` | Pesquisa e filtros públicos |
| `src/pages/DetalheProduto.tsx` | Informações e compra via WhatsApp |
| `src/pages/Admin.tsx` | Painel administrativo |
| `src/services/catalogoService.ts` | Consultas públicas ao Supabase |
| `src/services/supabase.ts` | Login e alterações protegidas no banco |
| `src/services/uploadImagem.ts` | Envio de foto selecionada no dispositivo |
| `src/utils/imagemProduto.ts` | URL de imagem do Supabase Storage |
| `src/data/loja.ts` | Instagram, WhatsApp e dados de contato |
| `supabase/*.sql` | Preparação do banco e políticas de segurança |

## Formatar o código

```bash
npm run format
npm run build
```

O Prettier organiza JSX/TS/CSS. A configuração está em `.prettierrc.json`; no VS Code, instale **Prettier - Code formatter** para formatar ao salvar.
