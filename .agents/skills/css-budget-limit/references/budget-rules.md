# Diretrizes de Limites de Budget de Estilos (CSS/SCSS)

Este documento dita as regras obrigatórias e verificações necessárias durante o desenvolvimento de novos componentes para evitar que o compilador do Angular falhe ao estourar o limite de bytes do Webpack (`exceeded maximum budget`).

---

## ⚠️ Limite Máximo de Performance

No arquivo `angular.json`, os limites de tamanho (budgets) para arquivos de estilo associados a componentes individuais são extremamente baixos (normalmente em torno de **2.00 kB** a **8.00 kB**). 

Como o Sass transpila regras aninhadas gerando seletores longos e o Autoprefixer adiciona prefixos de fornecedores (como `-webkit-`, `-moz-`, etc.) em produção, um arquivo SCSS cru com **7 kB** facilmente extrapola a barreira máxima compilada de **8 kB**.

---

## 🛡️ Lista de Verificação Obrigatória (Desenvolvimento)

Ao criar ou editar qualquer arquivo `.scss`, o assistente **DEVE** realizar as seguintes etapas preventivas:

1. **Evitar `@keyframes` de Animação Locais:**
   - Declarações de `@keyframes` inflam o CSS final compilado com dezenas de propriedades adicionais redundantes para cada navegador. Use transições simples de opacidade ou mova animações complexas para o arquivo global `src/global.scss`.
2. **Eliminar Nesting Profundo (Aninhamento Máximo):**
   - Mantenha o aninhamento do SCSS no máximo em **3 níveis**. Nesting profundo gera caminhos CSS imensos e repetitivos (ex: `div.wrapper div.container ul.list li.item span.text`).
3. **Consolidar e Compartilhar Classes:**
   - Se vários seletores utilizam as mesmas propriedades (ex: flexbox com alinhamento centralizado), junte as regras em uma única linha (ex: `.flex-center, .card-header, .sidebar-row { display: flex; align-items: center; }`).
4. **Mover Estilos Complexos e Comuns para o Global:**
   - Estilos utilitários de tabelas, botões genéricos, sombras customizadas e layouts de modais devem ser migrados para o `src/global.scss` em vez de declarados no arquivo `.scss` local do componente.
5. **Verificação Pré-commit:**
   - Sempre execute `npx tsc --noEmit --skipLibCheck` ou `ionic build --prod` localmente para garantir que o compilador do Angular não reporte avisos de budget antes de commitar ou finalizar a tarefa.
