# Info Banner Component Standard Pattern

Este padrão de design define a estrutura do componente `.info-banner`, que é um banner informativo compacto, visualmente elegante e interativo, integrado ao `HelpService`.

## 📌 Regra de Ouro de UX/UI: Minimalismo e Expansão sob Demanda
Para manter os formulários limpos e sem poluição visual:
1. **Por padrão, a ajuda fica recolhida:** O `<ion-item-divider>` exibe o título da seção e, à direita (`slot="end"`), apenas o botão discreto com o ícone `help-circle-outline` `(?)`.
2. **Ao clicar no ícone `(?)`:** O `.info-banner` expande suavemente logo abaixo do divisor, exibindo os parágrafos explicativos de `HelpService.getTopic(...)`.
3. **Ao clicar novamente:** O banner se fecha e o ícone alterna para fechar/abrir (`close-circle-outline` / `help-circle-outline`).

---

## 1. Estrutura HTML Padrão (Template)
```html
<!-- Divisor com botão de ajuda discreto no canto direito -->
<ion-item-divider color="light" class="divider-with-help">
  <ion-label>Unidade e Estoque</ion-label>
  <ion-button fill="clear" size="small" slot="end" class="help-trigger-btn" (click)="stockHelpVisible.set(!stockHelpVisible())" title="Ajuda sobre Unidades e Estoque">
    <ion-icon [name]="stockHelpVisible() ? 'close-circle-outline' : 'help-circle-outline'" slot="icon-only" color="primary"></ion-icon>
  </ion-button>
</ion-item-divider>

<!-- Banner informativo que expande abaixo do divisor -->
@if (stockHelpVisible()) {
  <div class="info-banner ion-margin-horizontal ion-margin-bottom">
    <div class="info-banner-body">
      @for (paragraph of helpService.getTopic('item_units_and_stock')?.content; track $index) {
        <p [innerHTML]="paragraph"></p>
      }
    </div>
  </div>
}
```

---

## 2. Estrutura TypeScript (Componente Angular 18+)
```typescript
import { Component, signal, inject } from '@angular/core';
import { HelpService } from 'src/app/services/help/help.service';
import { addIcons } from 'ionicons';
import { helpCircleOutline, closeCircleOutline } from 'ionicons/icons';

@Component({
  // ...
})
export class SeuComponent {
  public helpService = inject(HelpService);
  public stockHelpVisible = signal<boolean>(false);

  constructor() {
    addIcons({ helpCircleOutline, closeCircleOutline });
  }
}
```

---

## 3. Estrutura SCSS Padronizada
```scss
/* Divisor com Botão de Ajuda alinhado à direita */
.divider-with-help {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .help-trigger-btn {
    margin: 0;
    --padding-start: 4px;
    --padding-end: 4px;
    height: 32px;

    ion-icon {
      font-size: 1.25rem;
    }
  }
}

/* Banner Informativo Expandido */
.info-banner {
  margin: 8px 16px 14px;
  border-left: 4px solid var(--ion-color-primary, #3880ff);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(var(--ion-color-primary-rgb, 56, 128, 255), 0.08);
  animation: fadeIn 0.25s ease-in-out;

  .info-banner-body {
    padding: 12px 14px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--ion-color-dark);

    p {
      margin: 6px 0;
      &:first-child { margin-top: 0; }
      &:last-child { margin-bottom: 0; }
    }

    ::ng-deep strong {
      color: var(--ion-color-primary);
      font-weight: 700;
    }

    ::ng-deep em {
      font-style: italic;
      color: var(--ion-color-medium);
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

