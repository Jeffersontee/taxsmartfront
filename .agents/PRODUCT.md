# PRODUCT.md — Padrões Visuais da Landing Page TaxSmart

Este documento define os padrões de layout, tipografia e componentes que **devem** ser seguidos ao criar novas seções na Landing Page.

---

## 1. Arquitetura da Página

A Landing Page é composta por uma sequência vertical de **seções** renderizadas dentro do `HomeComponent` (`home.component.html`). Cada seção é um componente standalone Angular carregado com `@defer (on viewport)` para performance.

```html
<!-- home.component.html -->
<div id="nome-da-secao">
  @defer (on viewport) {
    <app-nome-da-secao></app-nome-da-secao>
  } @placeholder { <div style="height: 400px;"></div> }
</div>
```

---

## 2. Variantes de Seção

### Variante A — Seção Clara (`.bg-light`)
- **Background:** `#f8f9fa`
- **Texto principal:** `#111` (títulos), `#555` (parágrafos)
- **Cards:** brancos (`#fff`) com `box-shadow` suave
- **Card destaque:** gradiente laranja (`.highlight-card`)
- **Usar em:** seções alternadas (ex: Fiscal, Dept. Pessoal, Plan. Financeiro)

### Variante B — Seção Escura (`.dark-impact`)
- **Background:** `#000` ou `#050505`
- **Texto principal:** `#fff` (títulos), `#d1d1d1` (parágrafos com `.text-light`)
- **Cards:** fundo `#111` com borda `#333` (`.dark-card`) ou vidro (`.glass-card`)
- **Usar em:** seções alternadas (ex: Contabilidade, Legalização)

> **Regra de alternância:** Alternar entre clara e escura para criar ritmo visual.

---

## 3. Estrutura HTML Padrão

Todas as seções de serviço seguem esta estrutura:

```html
<div class="modern-section [bg-light | dark-impact] section-padding">
  <ion-grid fixed>
    <ion-row class="ion-align-items-center">
      <!-- COLUNA TEXTO (sempre primeiro = mobile-first) -->
      <ion-col size="12" size-lg="6">
        <div class="context-content slide-up-fade-1">
          <h4 class="kicker">SUBTÍTULO CURTO</h4>
          <h2 class="display-title">
            Título Principal<br>
            <span class="highlight">Destaque Laranja</span>
          </h2>
          <p class="lead-text [text-light]">
            Parágrafo descritivo do serviço.
          </p>
        </div>
      </ion-col>

      <!-- COLUNA CARDS (direita no desktop, abaixo no mobile) -->
      <ion-col size="12" size-lg="5" offset-lg="1">
        <div class="bento-grid slide-up-fade-2">
           <div class="bento-item [highlight-card | dark-card | glass-card]">
              <ion-icon name="icon-outline"></ion-icon>
              <h3>Título do Card</h3>
              <p>Descrição curta.</p>
           </div>
           <!-- mais cards... -->
        </div>
      </ion-col>
    </ion-row>
  </ion-grid>
</div>
```

### Regras de layout
- **Texto SEMPRE à esquerda** (primeira coluna no código)
- **Cards SEMPRE à direita** (segunda coluna)
- No **mobile**, o texto aparece primeiro e os cards empilham abaixo
- Usar `ion-grid fixed` para limitar a largura máxima (~1100px) e centralizar

---

## 4. Variantes de Cards (Coluna Direita)

### Variante "Lista Horizontal" — para 2-3 itens
Cards empilhados verticalmente, cada um ocupando toda a largura da coluna. Visual mais respirado e com melhor legibilidade.

```html
<!-- Coluna direita -->
<ion-col size="12" size-lg="6" offset-lg="1" class="features-col">
  <div class="feature-item slide-up-fade-2">
    <div class="icon-wrapper">
      <ion-icon name="icon-outline"></ion-icon>
    </div>
    <div class="feature-text">
      <h3>Título</h3>
      <p>Descrição.</p>
    </div>
  </div>
  <!-- mais items... -->
</ion-col>
```

**Usar em:** Consultoria, seções com poucos destaques (2-3 itens).

### Variante "Bento Grid 2×2" — para 4+ itens
Cards em grid quadrado, mais compacto e visual moderno.

```html
<!-- Coluna direita -->
<ion-col size="12" size-lg="5" offset-lg="1">
  <div class="bento-grid slide-up-fade-2">
     <div class="bento-item highlight-card">
        <ion-icon name="icon-outline"></ion-icon>
        <h3>Título</h3>
        <p>Descrição.</p>
     </div>
     <!-- mais items (mín. 4)... -->
  </div>
</ion-col>
```

**Usar em:** Planejamento Financeiro, seções com muitos destaques (4+ itens).

> **Regra:** Usar Lista Horizontal para 2-3 itens. Usar Bento Grid 2×2 para 4+ itens.

---

## 4. Tokens CSS Obrigatórios

Cada novo componente de seção deve incluir estes tokens no seu SCSS:

```scss
// ===== LAYOUT =====
.section-padding { padding: 80px 20px; }
.bg-light { background-color: #f8f9fa; }
.dark-impact { background-color: #000; color: #fff; }
.text-light { color: #d1d1d1 !important; }

// ===== TIPOGRAFIA =====
.kicker {
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--ion-color-primary);
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.display-title {
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 24px;
  line-height: 1.1;
  letter-spacing: -1px;

  .highlight { color: var(--ion-color-primary); }
}

.dark-impact .display-title { color: #fff; }

.lead-text {
  font-size: 1.1rem;
  color: #555;
  line-height: 1.6;
  margin-bottom: 16px;
}

// ===== BENTO GRID =====
.bento-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
}

.bento-item {
  background: #fff;
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(0,0,0,0.02);

  ion-icon { font-size: 36px; color: var(--ion-color-primary); margin-bottom: 16px; }
  h3 { font-size: 1.25rem; font-weight: 700; color: #111; }
  p { font-size: 0.95rem; color: #666; line-height: 1.5; }

  &:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
}

// Card com gradiente laranja
.highlight-card {
  background: linear-gradient(135deg, var(--ion-color-primary) 0%, #ff6a00 100%);
  h3, p, ion-icon { color: #fff !important; }
}

// Card escuro (para seções dark)
.dark-card {
  background: #111;
  border: 1px solid #333;
  h3 { color: #fff; }
  p { color: #aaa; }
}

// Card vidro (para seções dark)
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  h3 { color: #fff; }
  p { color: #ccc; }
}

// ===== ANIMAÇÕES =====
@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(32px); }
  to { opacity: 1; transform: translateY(0); }
}

.slide-up-fade-1 {
  animation: slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: 100ms;
  opacity: 0;
}

.slide-up-fade-2 {
  animation: slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: 200ms;
  opacity: 0;
}
```

---

## 5. TypeScript Padrão

```typescript
import { Component } from '@angular/core';
import { IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { iconName1, iconName2 } from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-nome-da-secao',
  templateUrl: './nome-da-secao.component.html',
  styleUrls: ['./nome-da-secao.component.scss'],
  imports: [IonGrid, IonRow, IonCol, IonIcon],
})
export class NomeDaSecaoComponent {
  constructor() {
    addIcons({ iconName1, iconName2 });
  }
}
```

### Regras do TypeScript
- Usar `standalone: true` (obrigatório Angular 18+)
- Importar apenas componentes Ionic usados no template
- Registrar ícones via `addIcons()` no constructor
- Não usar `OnInit` vazio — só implementar se necessário
- Usar `inject()` para injeção de dependências

---

## 6. Checklist de Nova Seção

Ao criar uma nova seção para a Landing Page:

- [ ] Escolher variante (clara ou escura) respeitando alternância
- [ ] Criar componente standalone em `src/app/pages/<nome>/`
- [ ] Seguir estrutura HTML padrão (texto esquerda, cards direita)
- [ ] Copiar tokens CSS obrigatórios para o SCSS do componente
- [ ] Registrar ícones no TypeScript via `addIcons()`
- [ ] Importar o componente no `home.component.ts`
- [ ] Adicionar `<div id="nome">` + `@defer` no `home.component.html`
- [ ] Adicionar `scrollTo('nome')` nos menus (desktop e mobile) do `app.component.html`
- [ ] Testar responsividade: desktop (1920px), tablet (768px), mobile (375px)
