# LLV Connect — catálogo de acessórios para celular

Site inicial em **React + TypeScript + Vite**. Criado para ser simples de entender e modificar.

## O que já funciona

- Página inicial responsiva com identidade azul e preto.
- Navegação por **categoria** e por **marca → linha → modelo**.
- Catálogo com busca e filtros; acessórios universais não dependem de aparelho.
- Página de detalhes com seleção de modelo e valor.
- Link de WhatsApp com mensagem de compra preenchida (após configuração do número).

## Começar no computador

Instale Node.js (versão LTS). No terminal, dentro da pasta do projeto:

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (geralmente `http://localhost:5173`). Para gerar a versão de produção: `npm run build`.

## Onde editar

| Arquivo | O que faz |
| --- | --- |
| `src/App.tsx` | Controla a página exibida: início, catálogo ou detalhe. |
| `src/data/loja.ts` | WhatsApp, Instagram e localização da loja. |
| `src/data/produtos.ts` | Produtos e modelos **de exemplo**. |
| `src/pages/Inicio.tsx` | Banner, categorias e destaques. |
| `src/pages/Catalogo.tsx` | Lista produtos e aplica filtros. |
| `src/pages/DetalheProduto.tsx` | Detalhe, preço e comprar pelo WhatsApp. |
| `src/components/` | Partes reaproveitáveis do site. |
| `src/utils/whatsapp.ts` | Formatação de preço e link para WhatsApp. |
| `src/styles.css` | Cores e estilos do site. |

## Configurar o WhatsApp da loja

Edite `src/data/loja.ts` e preencha `whatsapp` com **o telefone oficial da loja**, apenas números e com DDI. Ex.: `5581999999999`. Enquanto estiver vazio, o botão de compra fica desativado: não direciona o cliente ao número errado.

## Importante antes de publicar

**Todos os produtos e preços são fictícios.** Substitua-os pelos dados e fotos autorizadas da loja. Confirme compatibilidade de capinhas e películas modelo a modelo. Use a logo oficial em arquivo de boa qualidade.

Este é um **MVP frontend**, sem painel administrativo, banco de dados, pagamentos ou controle de estoque real. Essas funções podem ser acrescentadas depois usando Supabase. A mensagem do WhatsApp não confirma pedido nem disponibilidade.

## Publicar no Netlify

Crie um site importando o repositório GitHub. Comando de build: `npm run build`. Pasta de publicação: `dist`. O arquivo `netlify.toml` já inclui essas configurações.

## Próxima etapa

1. Inserir logo e fotos reais.
2. Confirmar número, endereço e Instagram.
3. Criar cadastro de produtos e autenticação de administrador no Supabase.
4. Salvar modelos, variações e compatibilidades no banco.

> O projeto propositalmente usa navegação simples com `useState` em vez de adicionar bibliotecas de rotas antes de serem necessárias.
