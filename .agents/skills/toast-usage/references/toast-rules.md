# Regras de Feedback Visual (GlobalService)

Este guia documenta o uso de Toasts, Loaders e Alertas no ecossistema TaxSmart Frontendend.

## 🚀 Como Exibir Mensagens (Toasts)

Sempre use o `GlobalService` (injetado via `inject(GlobalService)`) para disparar mensagens no sistema. Nunca utilize o `ToastController` diretamente nos componentes.

### Métodos Disponíveis no `GlobalService`:

1. **Mensagem de Sucesso (`successToast`):**
   - Utilizado para ações concluídas com êxito (ex: salvar, deletar, atualizar).
   ```typescript
   this.global.successToast('Venda finalizada com sucesso!');
   ```

2. **Mensagem de Erro (`errorToast`):**
   - Utilizado para tratar falhas e expor erros.
   ```typescript
   this.global.errorToast('Não foi possível conectar ao caixa.');
   ```

3. **Mensagem Informativa (`infoToast`):**
   - Utilizado para notificações neutras e avisos secundários.
   ```typescript
   this.global.infoToast('Aviso: Função em desenvolvimento.');
   ```

### 🚫 Métodos Inválidos (Evitar erros de compilação):
- **NÃO EXISTE** `warningToast` no `GlobalService`. Sempre use `errorToast` com o prefixo `"Aviso: ..."` ou `infoToast`.
