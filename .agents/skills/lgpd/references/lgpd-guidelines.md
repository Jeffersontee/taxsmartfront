# Guia e Diretrizes da Skill LGPD (Lei Geral de Proteção de Dados)

Este documento estabelece as regras mandatórias para conformidade com a LGPD no ecossistema TaxSmart Contabilidade (Frontend e Backend).

---

## 1. Princípios Fundamentais da LGPD no Sistema
1. **Consentimento Explícito (Opt-in):** Nenhum dado pessoal (nome, email, telefone, CPF, biometria) pode ser coletado sem que o usuário aceite explicitamente os Termos de Uso e Política de Privacidade.
2. **Ativação Opcional de Biometria:** A autenticação por biometria (FaceID, Fingerprint/Passkeys) deve ser desativada por padrão e só ativada mediante solicitação consciente do usuário nas configurações do perfil (`AccountForm`), gravando a data de consentimento (`lgpd_consents.biometric_consent_at`).
3. **Minimização de Dados:** Na Aba Estabelecimento, a identificação fiscal (CNPJ/CPF) é opcional no cadastro inicial para reduzir fricção e evitar coleta desnecessária antes da contratação formal.
4. **Validação e Segurança via OTP:** A verificação de e-mail e telefone é feita obrigatoriamente através de códigos OTP temporários de 6 dígitos gerados no backend (`MailService` / `SmsService`).

---

## 2. Direitos do Titular dos Dados (Data Subject Rights)
* **Direito de Acesso e Transparência:** O usuário pode consultar todos os seus dados cadastrais através da rota `/account/profile` ou `/terms`.
* **Direito à Anonimização e Exclusão:** Em caso de cancelamento ou solicitação de exclusão de conta, dados sensíveis devem ser mascarados e a conta convertida em `is_shadow: true` ou anonimizada para preservar a integridade dos relatórios fiscais sem violar a privacidade.
* **Reivindicação de Conta Sombra (Shadow Account):** Pedidos feitos no PDV como cliente presencial criam registros temporários que podem ser reivindicados posteriormente via OTP pelo app.

---

## 3. Registros de Auditoria (Audit Trail)
Todas as alterações no consentimento de dados (aceite de termos, ativação/desativação de biometria, alteração de dados sensíveis) devem obrigatoriamente disparar chamadas ao `AuditService.logAction` no backend:

```typescript
await AuditService.logAction({
  userId: user._id.toString(),
  userName: user.name,
  establishmentId: user.establishment_id ? user.establishment_id.toString() : null,
  action: 'BIOMETRIC_AUTH_ENABLED', // ou 'BIOMETRIC_AUTH_DISABLED', 'LGPD_TERMS_ACCEPTED'
  entity: 'User',
  entityId: user._id.toString(),
  details: { timestamp: new Date() }
});
```

---

## 4. Apresentação Visual e UX (Frontend)
* **Checkbox com Link Direto:** Todos os formulários de cadastro (`signup.page.html`) devem conter o texto legal com link clicável para a página `/terms`:
  > *"Ao se cadastrar, você concorda com nossos Termos de Uso e Política de Privacidade."*
* **Link no Rodapé:** A tela de login (`login.page.html`) e o menu de ajuda (`help-system`) devem manter links permanentes para os Termos LGPD.

---

## 5. Proteção à Criança e ao Adolescente (ECA - Lei nº 8.069/1990)
* **Restrição de Bebidas Alcoólicas:** A venda, oferta ou entrega de bebidas alcoólicas para menores de 18 anos é terminantemente proibida (Art. 243 do ECA).
* **Declaração de Maioridade no Cadastro:** Todos os usuários cadastrados declaram ser maiores de 18 anos ao aceitarem os Termos de Uso.
* **Validação na Entrega:** O estabelecimento/entregador tem a prerrogativa legal de solicitar documento oficial com foto (RG/CNH) no momento da entrega do pedido de produtos alcoólicos.

