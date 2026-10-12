# 📖 Guia de Integração Mercado Pago Point Smart & OAuth (HUB V2)

Documento de referência para o ecossistema **TaxSmart Contabilidade / HUB V2**.

---

## 1. Arquitetura da Integração
- **SaaS OAuth App (`hubsystem`):** Criado no Mercado Pago Developers com o produto **`API Pagamentos`** e a `redirect_uri` do backend. Usado para a **Conexão Automática (1-Clique)**.
- **Chaves Manuais por Adega:** Se o lojista optar por criar Chaves API Manuais no seu próprio estabelecimento, a aplicação no Mercado Pago Developers **DEVE ser do tipo `Point (Maquininha Point)`**. Se criada como *Checkout Transparente*, a Point API rejeitará com erro `UNAUTHORIZED`.

---

## 2. Requisitos da Maquininha Point Smart 2
- **Conta:** A maquininha física deve estar vinculada à mesma conta do Mercado Pago onde os tokens foram gerados (*Painel MP > Maquininhas Point > Ativo*).
- **Modo de Operação:** Na Point Smart 2, abra **Menu > Modo de Operação** e selecione **Modo PDV (Modo Integrado)**. No modo Autônomo (STANDALONE), chamadas remotas de API são bloqueadas com `UNAUTHORIZED`.
- **Tela de Repouso Oficial:** Em Modo PDV, a máquina exibe: *"Inicie a operação pelo sistema de frente de caixa. Sua Point Smart processará as informações automaticamente."* ao aguardar vendas ou após um cancelamento.

---

## 3. Especificação da API (`POST /point/integration-api/devices/{device_id}/payment-intents`)
- **`amount`:** Inteiro representando **CENTAVOS**. Limite mínimo de **100 centavos** (R$ 1,00). Valores menores que R$ 1,00 são convertidos para 100 centavos.
- **`payment_mode`:** `"card"` para cartão crédito/débito ou **`"qr-pix"`** para exibir o QR Code do PIX no visor da maquininha.
- **Cancelamento:** `DELETE /point/integration-api/devices/{device_id}/payment-intents` limpa a cobrança e retorna a Point Smart para a tela de repouso do PDV.
