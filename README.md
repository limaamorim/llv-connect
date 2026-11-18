# LLV Connect — Catálogo e painel administrativo

## Conectar a vitrine pública ao Supabase (sem administrador)

A primeira integração é **somente leitura**: o site mostra os produtos do banco para qualquer cliente, sem login. O painel `/admin` não precisa ser configurado agora.

### 1. Criar as tabelas e o armazenamento

1. Crie um projeto no [Supabase](https://supabase.com).
2. Entre em **SQL Editor > New query**.
3. Cole e execute o arquivo `supabase/catalogo_publico.sql` deste repositório.
4. Ele prepara as tabelas públicas `categorias` e `produtos`, as permissões de leitura e um bucket público de imagens chamado `produtos`.
5. Se você já executou `supabase/schema.sql` anteriormente, os dados existentes são preservados.

**Segurança:** o cliente só consulta produtos ativos e seus campos públicos. Preço de custo, usuários e histórico de vendas não são consultados nem liberados ao público.

### 2. Configurar o arquivo .env.local

Na raiz do projeto, crie `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICAVEL
```

Use **Project URL** e **Publishable key** nas configurações de API do seu projeto Supabase. A chave pública pode aparecer no frontend; **nunca** coloque `service_role`, `sb_secret_...` ou senhas no projeto.

Reinicie o Vite depois de criar/alterar o arquivo:

```bash
npm install
npm run dev
```

### 3. Cadastrar produtos diretamente no Supabase

Por enquanto, acesse **Table Editor > produtos > Insert row** e preencha:

| Coluna | Exemplo | Observação |
| --- | --- | --- |
| `nome` | Capinha Transparente | Nome do produto |
| `categoria` | Capinhas | Deve existir em `categorias` |
| `preco` | 29.90 | Use ponto no valor numérico |
| `estoque` | 10 | Quantidade disponível |
| `descricao` | Proteção para seu celular | Texto exibido nos detalhes |
| `imagem` | storage:capinha.jpg | Veja o passo seguinte |
| `modelos` | ["iPhone 12 Pro","iPhone 13"] | JSON array de modelos compatíveis |
| `destaque` | true | Exibe na página inicial |
| `novidade` | false | Mostra selo de novidade |
| `ativo` | true | Aparece no catálogo público |
| `custo` | 0 | Campo interno, nunca mostrado ao cliente |

**Produto universal:** informe `[]` em `modelos` (por exemplo, um fone Bluetooth genérico). O catálogo mostra esses itens mesmo quando o cliente seleciona um modelo de celular.

**Categorias novas:** crie primeiro a categoria na tabela `categorias`, depois use o nome exato na coluna `categoria` do produto.

### 4. Adicionar fotos

No Supabase, abra **Storage > produtos** e envie uma foto chamada, por exemplo, `capinha.jpg`. Na coluna `imagem` da tabela `produtos`, escreva `storage:capinha.jpg`.

Também é possível colocar a URL pública completa da imagem na coluna `imagem`. Para fotos em pastas, use `storage:pasta/foto.jpg`.

O bucket é público: não coloque nele documentos privados ou imagens sensíveis.

### 5. Publicar no Netlify

No site do Netlify, configure as duas variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` em **Environment variables** e faça um novo deploy. As variáveis do Vite são lidas durante a compilação; criar apenas o `.env.local` no seu computador não configura o Netlify.

### O que já funciona

- A página inicial lê categorias e produtos com `destaque = true`.
- O catálogo lê produtos ativos, preços, descrição, estoque e imagens.
- Os filtros por categoria e modelo usam os dados reais do Supabase.
- Busca, favoritos, sacola e WhatsApp continuam no frontend.
- Se o banco estiver configurado e sem produtos, a vitrine fica vazia: os exemplos locais **não** serão misturados.
- Se não houver credenciais, continua o modo de demonstração com dados locais.

**Atenção:** o número oficial de WhatsApp continua em `src/data/loja.ts` e ainda precisa ser informado. Não há pagamento nem registro automático de vendas no site.

### Arquivos principais da integração

- `src/services/catalogoService.ts`: consulta somente os produtos e categorias públicos.
- `src/utils/imagemProduto.ts`: transforma `storage:foto.jpg` em URL de foto pública.
- `src/App.tsx`: carrega os dados e os envia para as páginas.
- `src/pages/Inicio.tsx` e `src/pages/Catalogo.tsx`: usam categorias, preços e produtos reais.
- `supabase/catalogo_publico.sql`: prepara as tabelas e permissões necessárias.

---

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


## Formatação e organização do código

O projeto usa **Prettier** para manter os arquivos simples de estudar. Padrão: 2 espaços de indentação, até 90 caracteres por linha quando possível, aspas simples e JSX com tags separadas.

Depois de baixar o projeto com `git pull origin main`, execute:

```bash
npm run format
```

O comando organiza todos os arquivos `.ts`, `.tsx`, `.css` e `index.html` **sem alterar a lógica**. Para verificar a formatação sem modificar arquivos: `npm run format:check`.

No VS Code, instale a extensão **Prettier - Code formatter** (esbenp.prettier-vscode). A pasta `.vscode` já contém a configuração para formatar ao salvar (`Ctrl+S`). Se não puder instalar a extensão, use `npm run format` pelo terminal.

O arquivo `.prettierrc.json` guarda o padrão. A rotina do GitHub Actions em `.github/workflows/padronizar-codigo.yml` também tenta formatar e registrar as alterações ao receber um push na branch `main`, se as Actions e permissões de escrita estiverem habilitadas no repositório.
