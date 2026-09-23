# 🚀 Guia de Publicação e Deploy do Frontend (TaxSmart)

Este documento descreve detalhadamente o passo a passo para gerar o build de produção e realizar a publicação/deploy do frontend da **TaxSmart Contabilidade**.

---

## 📋 Pré-requisitos

Antes de iniciar o processo de publicação, certifique-se de ter instalado no ambiente:

1. **Node.js**: Versão 18.x ou 20.x LTS.
2. **NPM**: Gerenciador de pacotes incluso no Node.js.
3. **Dependências Instaladas**:
   ```bash
   npm install
   ```
4. **Arquivo `.env` Configurado** (necessário para deploy automático via FTP na Locaweb):
   Na raiz do projeto (`taxsmartfront/`), configure o arquivo `.env` com os dados do seu FTP da **Locaweb**:
   ```env
   FTP_HOST=ftp.taxsmartcontabilidade.com.br
   FTP_USER=seu_usuario_locaweb
   FTP_PASS=sua_senha_locaweb
   ```
   > 💡 **Onde encontrar na Locaweb:** No painel da Locaweb > **Hospedagem de Sites** > **FTP / Usuários de FTP**. O host geralmente é `ftp.seudominio.com.br` ou o IP/Hostname fornecido no painel.

---

## 🛠️ Métodos de Publicação

Você pode publicar o frontend na Locaweb de duas formas:
- **Método 1 (Recomendado):** Deploy Automático via Script FTP (`npm run deploy`).
- **Método 2:** Build Manual e Upload (via Gerenciador de Arquivos da Locaweb ou FileZilla).

---

### 1️⃣ Método 1: Deploy Automático na Locaweb (Recomendado)

O projeto conta com um script de automação (`scripts/deploy.ts`) que realiza todo o processo em um único comando:
1. Executa o build de produção (`npm run build`).
2. Conecta ao servidor FTP da Locaweb.
3. Cria um backup automático da pasta `public_html` atual no servidor.
4. Cria uma nova pasta `public_html`.
5. Envia todos os arquivos compilados (incluindo o `.htaccess` para roteamento SPA).

#### Como executar:
```bash
npm run deploy
```

#### Saída esperada:
```
🚀 Iniciando o Build do Angular...
✅ Build concluído com sucesso!
🔌 Conectando ao FTP: ftp.seudominio.com.br...
✅ Conectado com sucesso!
📦 Criando backup da versão atual para: public_html_bkp_YYYYMMDD_HHMMSS...
✅ Backup criado com sucesso: public_html_bkp_YYYYMMDD_HHMMSS
📁 Criando nova pasta public_html...
📤 Fazendo upload dos arquivos novos de .../dist/taxsmartfront/browser para public_html...
🎉 Deploy concluído com sucesso!
```

---

### 2️⃣ Método 2: Build Manual e Upload

Caso prefira gerar os arquivos e fazer o envio manualmente via FTP (FileZilla) ou gerenciador de arquivos da hospedagem (cPanel / Plesk):

#### Passo 1: Validação de Tipos (Opcional, mas recomendado)
```bash
npx tsc --noEmit
```

#### Passo 2: Gerar os Arquivos de Produção
```bash
npm run build
```

#### Passo 3: Localização dos Arquivos Gerados
Os arquivos prontos para publicação estarão no diretório:
```
dist/taxsmartfront/browser/
```

Estrutura típica dos arquivos gerados:
```
dist/taxsmartfront/browser/
├── index.html
├── favicon.ico
├── logo.png
├── taxsmart-text.png
├── taxsmart-text-dark.png
├── main-[hash].js
├── polyfills-[hash].js
├── styles-[hash].css
└── chunk-[hash].js
```

#### Passo 4: Envio para o Servidor
1. Abra seu cliente FTP (ex: FileZilla) ou o Gerenciador de Arquivos do cPanel.
2. Acesse a pasta raiz do site (normalmente `public_html` ou `www`).
3. Copie todo o conteúdo de `dist/taxsmartfront/browser/` para dentro da pasta `public_html`.

---

## ⚙️ Configuração de Redirecionamento SPA (.htaccess)

Como o Angular é uma SPA (Single Page Application), para que rotas diretas funcionem sem retornar erro 404 ao recarregar a página, certifique-se de que exista o arquivo `.htaccess` na raiz do `public_html` (servidores Apache / LiteSpeed):

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 🔍 Checklist Pós-Publicação

Após a publicação, valide os seguintes pontos no navegador:

- [ ] Acessar o domínio principal (ex: `https://taxsmartcontabilidade.com.br`).
- [ ] Testar os links de navegação do menu superior e lateral.
- [ ] Testar os botões de **Falar com um Especialista** e **WhatsApp** (`https://wa.me/5511989321207`).
- [ ] Testar a responsividade e o carrossel na versão Desktop e Mobile.
- [ ] Verificar se os formulários e e-mails de contato apontam para `contato@taxsmartcontabilidade.com.br`.
