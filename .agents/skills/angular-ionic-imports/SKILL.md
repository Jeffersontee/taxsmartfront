---
name: angular-ionic-imports
description: Regras e instruções para garantir que componentes visuais do Ionic sejam corretamente importados em componentes Standalone do Angular 18+.
---

# Importação de Componentes Ionic em Angular Standalone

Em projetos Angular 18+ baseados em Standalone Components, a CLI nativa (`ng generate component`) cria componentes vazios sem acesso global a módulos de UI. Isso significa que toda vez que você usar componentes do Ionic no HTML, eles causarão um erro fatal (`NG8001: 'ion-xxx' is not a known element`) se não forem explicitamente declarados.

## Comportamento Esperado do Assistente

Sempre que você (Agent) for responsável por **criar** ou **modificar** um componente Angular Standalone que faça uso de tags da interface do Ionic (como `<ion-grid>`, `<ion-row>`, `<ion-col>`, `<ion-card>`, `<ion-button>`, etc.), você **DEVE**:

1. **Analisar o Template:** Verificar quais tags do Ionic estão presentes no arquivo `.html`.
2. **Importar do pacote Standalone:** Adicionar o `import` correspondente no topo do arquivo `.ts` a partir de `@ionic/angular/standalone`. O nome exportado será a tag em CamelCase (ex: `<ion-card-content>` -> `IonCardContent`).
   ```typescript
   import { IonGrid, IonRow, IonCol, IonCard, IonCardContent } from '@ionic/angular/standalone';
   ```
3. **Injetar no Decorator:** Declarar essas classes no array `imports: [...]` dentro de `@Component({})`.

## Script de Correção em Massa (Auto-Fix)

Esta skill acompanha um utilitário em TypeScript extremamente poderoso que:
1. Varre todos os arquivos `.html` buscando por tags exclusivas do Ionic (`<ion-*>`).
2. Converte as tags encontradas para CamelCase (ex: `<ion-card-content>` vira `IonCardContent`).
3. Lê o arquivo `.ts` correspondente e injeta dinamicamente o `import` correto do `@ionic/angular/standalone` e preenche o array `imports: []` do componente.

Sempre que a compilação falhar com o erro **NG8001** ou você (Agente) gerar muitos componentes via CLI, execute este corretor:
```bash
npx ts-node .agents/skills/angular-ionic-imports/scripts/fix-imports.ts
```
Ele lerá a pasta `src/app` automaticamente e fará o binding visual de todos os arquivos.
