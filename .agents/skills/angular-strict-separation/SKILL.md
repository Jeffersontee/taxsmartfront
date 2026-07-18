---
name: angular-strict-separation
description: Enforces strict separation of HTML, SCSS, and TypeScript in Angular components. Triggers when creating or migrating components.
---

# Regras de Separação de Arquivos (Angular)

Toda vez que você for **criar um novo componente** Angular ou **migrar/ajustar** um componente colado no projeto, siga estas regras irrevogáveis:

1. **Separação Obrigatória:** NUNCA utilize as propriedades `template` ou `styles` (inline) no decorator `@Component`.
2. **Template Externalizado:** Utilize sempre `templateUrl: './nome-do-componente.component.html'` e coloque o HTML no arquivo `.html`.
3. **Estilos Externalizados (SCSS):** Utilize sempre `styleUrls: ['./nome-do-componente.component.scss']` (ou `styleUrl` no Angular 17+) e coloque os estilos no arquivo `.scss`.
4. **Script de Migração:** Se durante o desenvolvimento você encontrar qualquer componente no projeto que ainda utilize templates/estilos inline, rode o script utilitário abaixo para forçar a extração automática.

### Como rodar a migração em massa (Tipos de Componentes Inline)

Você tem permissão para rodar este script diretamente via terminal sempre que houver suspeita de componentes com `@Component({ template: ... })` ou `styles: ...` inline:

```bash
node .agents/skills/angular-strict-separation/scripts/migrate.js
```

### Limpeza de Atributos Style no HTML (HTML para SCSS)

Muitas vezes ao importar texto de editores Rich Text, o HTML fica poluído com atributos `style="..."`. Você deve usar o script abaixo para extrair automaticamente todos esses atributos gerando classes baseadas em hashes nas folhas `.scss` dos respectivos componentes:

```bash
node .agents/skills/angular-strict-separation/scripts/clean-html-styles.js
```
