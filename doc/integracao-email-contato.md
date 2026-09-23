# ✉️ Documentação Técnica: Integração e Envio de E-mails via AJAX (TaxSmart)

Este documento descreve detalhadamente a arquitetura, funcionamento e os motivos técnicos para a utilização do envio assíncrono via **AJAX (`fetch`)** no formulário de contato da Landing Page da **TaxSmart Contabilidade**.

---

## 🎯 1. Visão Geral da Solução

O formulário de contato localizado no rodapé da página permite que potenciais clientes enviem solicitações de atendimento contábil diretamente para a caixa postal **`contato@taxsmartcontabilidade.com.br`**.

A comunicação ocorre em segundo plano via **AJAX (`fetch`)** consumindo o endpoint nativo **`/send-mail.php`** hospedado diretamente no servidor da **Locaweb**, que realiza o envio autenticado via **SMTP Seguro (STARTTLS)** lendo as credenciais de forma protegida a partir do arquivo **`.env`** (bloqueado contra acessos externos via `.htaccess`).

```
[ Visitante preenche o formulário ]
                 │
                 ▼
[ Requisição AJAX (Fetch POST em Background) ]
                 │
                 ▼
[ Backend Nativo: /send-mail.php (Lê .env protegido) ]
                 │
                 ▼
[ Servidor SMTP Locaweb (email-ssl.com.br:587 STARTTLS) ]
                 │
                 ▼
[ Caixa Postal: contato@taxsmartcontabilidade.com.br (Locaweb) ]
```

---

## 💡 2. Por que usar AJAX (`fetch`) em vez de métodos tradicionais?

Existem três maneiras clássicas de implementar formulários de contato na web. A escolha pelo **AJAX** foi feita após a seguinte análise comparativa:

### Comparativo de Métodos:

| Característica | ❌ Link `mailto:` | ❌ Formulário HTML Padrão (`POST`) | ✅ **AJAX (`fetch`) com Endpoint API** |
| :--- | :--- | :--- | :--- |
| **Experiência do Usuário (UX)** | Péssima (tenta abrir Outlook / app local) | Ruim (redireciona para outra página externa) | **Excelente (100% fluido e na mesma página)** |
| **Funciona no Mobile e Desktop?** | Falha se o usuário não tiver cliente de e-mail configurado | Sim, mas perde a navegação do site | **Sim, funciona em qualquer navegador/dispositivo** |
| **Recarregamento da Página** | Não | Recarrega toda a página | **Zero recarregamento (SPA nativa)** |
| **Feedback Visual** | Nenhum | Página em branco ou página externa de terceiros | **Spinners, banners de sucesso e validações em tempo real** |
| **Bloqueio de Múltiplos Envios** | Não | Não | **Sim (desabilita botões e inputs durante o envio)** |
| **Segurança contra Spam** | Expõe o e-mail em texto puro | Depende de Captcha externo | **Mascaramento via Token Hash (`a2f99...`)** |

---

### Principais Vantagens do AJAX no Projeto TaxSmart:

1. **Sem Dependência de Aplicativos Instalados:**
   - Métodos antigos como `mailto:contato@taxsmartcontabilidade.com.br` dependem de o visitante ter um gerenciador local configurado (como Microsoft Outlook, Apple Mail ou Thunderbird). Se o usuário estiver em um computador corporativo ou celular usando apenas navegador, o envio simplesmente não acontece.
   - Com o **AJAX**, o envio é feito **diretamente pela rede HTTP/HTTPS** do navegador para o servidor de e-mail.

2. **Preservação do Contexto da SPA (Single Page Application):**
   - O Angular é construído como uma aplicação de página única (SPA). Formulários tradicionais de formulário HTML (`<form method="POST" action="...">`) forçam um redirecionamento que tira o cliente do site da TaxSmart.
   - Com o **AJAX**, a requisição ocorre nos bastidores: o visitante continua exatamente na seção de contato da página, sem que a tela pisque ou recarregue.

3. **Feedback Imediato com Angular Signals:**
   - Enquanto a mensagem é transmitida:
     - O botão exibe um spinner animado e o texto *"Enviando mensagem..."*.
     - Os campos de texto ficam temporariamente bloqueados para evitar cliques repetidos.
   - Ao concluir com sucesso:
     - Um banner verde com mensagem amigável de confirmação é renderizado.
     - O formulário é limpo automaticamente para o próximo uso.

4. **Proteção de Privacidade (Token Hash):**
   - Em vez de expor o endereço `contato@taxsmartcontabilidade.com.br` no código do formulário HTML, o AJAX consome o hash criptográfico seguro:
     ```
     https://formsubmit.co/ajax/a2f9931156dc0e90ee9a1ae4a0567d94
     ```
   - Isso impede que robôs de raspagem de dados (*web scrapers*) capturem o e-mail da TaxSmart para listas de spam.

---

## ⚙️ 3. Estrutura Técnica da Implementação

### 3.1. Código TypeScript (`contato.component.ts`)

O componente utiliza **Angular Signals** e a API nativa `fetch` para envio assíncrono:

```typescript
// Payload estruturado enviado via POST
const payload = {
  name: nomeVal,
  email: emailVal || 'Não informado',
  phone: telefoneVal || 'Não informado',
  message: mensagemVal || 'Solicitação de contato via site TaxSmart',
  _subject: `Novo Contato do Site - ${nomeVal}`,
  _template: 'table', // Formata o e-mail recebido em tabela limpa e organizada
  _captcha: 'false',  // Desativa captcha visual invasivo após ativação do endpoint
};

// Requisição AJAX
const response = await fetch(
  'https://formsubmit.co/ajax/a2f9931156dc0e90ee9a1ae4a0567d94',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  }
);
```

---

## 📬 4. Parâmetros Especiais Utilizados

- **`_subject`**: Define o assunto do e-mail recebido na caixa postal (ex: `Novo Contato do Site - João Silva`).
- **`_template: 'table'`**: Formata os dados recebidos dentro de uma tabela profissional com cabeçalho limpo.
- **`_captcha: 'false'`**: Remove verificações de robôs no fluxo do usuário após o e-mail ter sido autorizado pelo proprietário.
- **`_replyto` / `email`**: Permite que ao clicar em "Responder" no seu cliente de e-mail (Webmail Locaweb ou Outlook), a resposta vá diretamente para o e-mail que o visitante preencheu.

---

## 🔐 5. Processo de Ativação do Endpoint (Segurança)

O serviço exige uma autorização única para garantir que apenas o proprietário da caixa postal autorize o recebimento de mensagens vindas daquele formulário:

1. No primeiro disparo, o serviço envia um e-mail com o assunto *"Action Required: Confirm your FormSubmit endpoint"*.
2. O proprietário da conta (`contato@taxsmartcontabilidade.com.br`) clica no botão **`ACTIVATE FORM`**.
3. O endpoint gera um **Token Hash** exclusivo (`a2f9931156dc0e90ee9a1ae4a0567d94`).
4. Todas as mensagens subsequentes são entregues diretamente na caixa postal em tempo real.

---

## 📋 6. Manutenção Futura

Se no futuro for necessário alterar o e-mail de destino das mensagens (por exemplo, para um novo departamento ou sócio):

1. Altere o endpoint no arquivo `src/app/pages/contato/contato.component.ts` para o novo e-mail:
   ```typescript
   'https://formsubmit.co/ajax/novoemail@taxsmartcontabilidade.com.br'
   ```
2. Realize um envio de teste no site.
3. Abra a caixa do `novoemail@...` e clique no link de ativação recebido.
4. Substitua pelo novo hash gerado (opcional, para maior segurança contra spam).
