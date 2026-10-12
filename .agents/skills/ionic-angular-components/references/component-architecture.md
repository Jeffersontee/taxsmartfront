# Arquitetura de Componentes e Páginas (Standalone + Signals)

Sempre crie novos componentes e páginas seguindo estritamente as diretrizes de arquitetura reativa, performance e experiência visual descritas abaixo.

## Regras de Estrutura do Arquivo TypeScript (.ts)

1. **Componentes Standalone**: Todos os novos componentes e páginas devem ser declarados como `standalone: true`. Mapeie explicitamente em `imports: [...]` apenas os componentes visuais individuais do Ionic que forem utilizados (ex: `IonGrid`, `IonRow`), evitando pacotes globais para otimizar o bundle final.
2. **Injeção de Dependências Moderna**: Utilize a função `inject()` do Angular em vez de injetar dependências diretamente pelo método `constructor`.
3. **Gerenciamento de Estado Reativo (Signals)**: Utilize obrigatoriamente a API de **Signals** (`signal()`, `computed()`) para controlar o estado da tela.
4. **Proibido Mutação Direta**: Nunca altere o valor de um sinal por mutação direta. Utilize obrigatoriamente `.set()` para novos valores ou `.update()` para computar estados baseados no valor anterior.

## Regras de Estrutura do Template HTML (.html)

1. **Novo Fluxo de Controle Nátivo**: Proibido usar `*ngIf` ou `*ngFor`. Use a sintaxe moderna de blocos do Angular (`@if`, `@for`).
2. **Estado de Carregamento Obrigatório**: Toda tela ou bloco que dependa de requisições HTTP deve possuir uma cópia exata do seu esqueleto visual utilizando `<ion-skeleton-text animated>` orientado pelo signal dentro de um bloco `@if (isLoading())`.
3. **Padrão de Layout Grid**: Use a estrutura de `<ion-grid>`, `<ion-row>` e `<ion-col>` para controle de alinhamento e espaçamento interno.
4. **Classes Utilitárias Visuais**: Utilize as classes de borda customizadas do ecossistema do projeto para separação visual de sessões:
   - `class="borderBottom"` para divisões principais de blocos.
   - `class="dashedBorderBottom"` para separadores internos suaves ou itens de listas.

---

## Exemplo de Referência Completo Modernizado

### TypeScript (.ts)

```typescript
import { Component, OnInit, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonGrid, IonRow, IonCol, IonItem, IonLabel, IonSkeletonText } from "@ionic/angular/standalone";
import { AlgumServico } from "../../services/algum.service";

@Component({
  selector: "app-exemplo-funcionalidade",
  templateUrl: "./exemplo-funcionalidade.component.html",
  styleUrls: ["./exemplo-funcionalidade.component.scss"],
  standalone: true,
  imports: [CommonModule, IonGrid, IonRow, IonCol, IonItem, IonLabel, IonSkeletonText],
})
export class ExemploFuncionalidadeComponent implements OnInit {
  private meuServico = inject(AlgumServico);

  public data = signal<any>(null);
  public isLoading = signal<boolean>(true);

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    this.isLoading.set(true);
    this.meuServico.getDados().subscribe({
      next: (res) => {
        this.data.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}
```

### Template HTML (.html)

```html
<!-- Bloco de Carregamento (Skeleton) -->
@if (isLoading()) {
<ion-grid class="borderBottom">
  <ion-row>
    <ion-col>
      <ion-item lines="none" class="ion-padding-horizontal dashedBorderBottom">
        <ion-label>
          <h1><ion-skeleton-text style="width: 50%" animated></ion-skeleton-text></h1>
          <p><ion-skeleton-text style="width: 80%" animated></ion-skeleton-text></p>
        </ion-label>
      </ion-item>
    </ion-col>
  </ion-row>
</ion-grid>
}

<!-- Bloco de Conteúdo Real -->
@if (data() && !isLoading()) {
<ion-grid class="borderBottom">
  <ion-row>
    <ion-col>
      <ion-row class="ion-padding-horizontal dashedBorderBottom">
        <ion-label>
          <h1 class="ion-no-margin">{{ data()?.name }}</h1>
        </ion-label>
      </ion-row>
    </ion-col>
  </ion-row>
</ion-grid>
}
```
