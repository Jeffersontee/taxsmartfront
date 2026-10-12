# Regras de Git Workflow & Ciclo de Vida do Código (Dia a Dia)

Este documento descreve o fluxo de trabalho diário no Git/GitHub para todas as alterações no ecossistema TaxSmart Contabilidade (Backend e Frontend).

---

## 🚫 Regra #1 (INVIOLÁVEL)
**NUNCA dar `git push` direto na branch `main`.**
A branch `main` engatilha o deploy de produção automático. Todas as alterações devem passar obrigatoriamente pela `staging` via Pull Request no GitHub.

---

## 🔄 Fluxo de Desenvolvimento Diário (Passo a Passo)

### 1. Início de Nova Tarefa / Feature
Antes de iniciar qualquer código ou modificar arquivos, certifique-se de estar com a branch `staging` atualizada e crie a branch da nova feature:
```bash
# 1. Trocar para staging e puxar últimas alterações do repositório remoto
git checkout staging
git pull origin staging

# 2. Criar e trocar para a nova branch no formato feat-nome-da-feature
git checkout -b feat-nome-da-feature
```

### 2. Desenvolvimento e Validação
- Realizar as alterações de código necessárias.
- Validar a compilação via `npx tsc --noEmit`.

### 3. Commit e Push da Feature Branch
```bash
# Salvar e enviar a nova branch para o GitHub
git add .
git commit -m "feat(modulo): descricao clara da alteracao"
git push origin feat-nome-da-feature
```

### 4. Geração Automática de Links de Pull Request (PR)
O assistente de IA deve fornecer imediatamente os links formatados para o usuário clicar e abrir o PR no GitHub:
1. **PR de Feature para Staging:**
   `https://github.com/Jeffersontee/<repo>/compare/staging...feat-nome-da-feature?expand=1`

2. **PR de Staging para Main (Após aprovação e deploy em Staging):**
   `https://github.com/Jeffersontee/<repo>/compare/main...staging?expand=1`

---

## 🛠️ Comandos de Atalho no `package.json`
- `npm run feature <nome-da-branch>`: Atalho para criação de branch.
- `npm run sync:staging`: Sincroniza a branch `staging` com a `main`.
- `npm run git:clean`: Limpa branches locais desatualizadas mantendo apenas `main` e `staging`.
