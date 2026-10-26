# English Methods Only

## 1. Regra Fundamental
Obrigatoriamente **todos os métodos, funções, variáveis e propriedades** recém-criados ou refatorados no código do projeto (Backend e Frontend) devem ser nomeados exclusivamente no idioma **Inglês (English)**. 

## 2. Padrões de Nomenclatura (Naming Conventions)
- **Métodos de Ação:** Usar verbos em inglês no padrão camelCase.
  - ❌ `enviarParaCozinha()`
  - ✅ `sendToKitchen()`
  - ❌ `processarPagamento()`
  - ✅ `processPayment()`
- **Classes e Componentes:** PascalCase em inglês.
  - ❌ `class ModalCarrinho` / `class ClienteLayoutComponent`
  - ✅ `class CartModalComponent` / `class CompanyLayoutComponent`
- **Rotas e Links (`routerLink`):** kebab-case em inglês.
  - ❌ `/empresa/usuarios` ou `/admin/documentos`
  - ✅ `/company/users` ou `/admin/documents`
- **Variáveis de Estado (Signal / Booleano):** Prefixar com verbos de estado em inglês (`is`, `has`, `should`).
  - ❌ `public foiEnviado = signal(false);`
  - ✅ `public isSent = signal(false);`
- **Entradas e Saídas (Inputs/Outputs):** camelCase em inglês.
  - ❌ `empresaId = input<string>()`
  - ✅ `companyId = input<string>()`

## 3. Motivação e Qualidade de Código
Misturar inglês com português ("Spanglish" ou "Portinglês") no código-fonte gera confusão mental, dificulta buscas e torna o código legado difícil de manter. Uma vez que o Angular, Node, Express, Mongoose e todas as APIs do ecossistema já são em inglês, a adesão ao idioma universal mantém a base de código previsível e padronizada.

> [!WARNING]
> Nunca crie um método em português. Se você identificar métodos em português durante uma refatoração no mesmo arquivo, sugira proativamente a alteração para a versão em inglês, desde que não quebre integrações legadas estritas.

## 4. Comunicação do Assistente
Lembre-se: **O código (estruturas) é escrito em inglês, mas as explicações textuais, interfaces (UI), alertas para o usuário final e mensagens de commit devem continuar sendo escritas em Português do Brasil (pt-BR)** conforme a Regra Global do projeto.
