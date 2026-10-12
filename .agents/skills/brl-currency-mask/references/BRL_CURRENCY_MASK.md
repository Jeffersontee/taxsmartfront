# Guia de Máscara Monetária Real BRL (pt-BR)

Este guia documenta o padrão arquitetural obrigatório para capturar, formatar e persistir valores monetários no ecossistema TaxSmart Contabilidade.

---

## 1. Problema de Usabilidade e Persistência
- **Frontend:** Inputs do tipo `type="number"` forçam a remoção de zeros após a vírgula pelo navegador (ex: `150.00` é renderizado como `150`), quebrando a estética monetária esperada. Além disso, causam incompatibilidades visuais com o símbolo `R$`.
- **Backend:** O banco de dados (MongoDB) e o schema (Mongoose) esperam valores numéricos puros (tipo `Number` / floats) para realizar somas matemáticas, cálculos de caixa e relatórios. Se enviarmos strings contendo formatações monetárias como `"R$ 1.234,56"`, o banco rejeitará o dado ou gerará erros catastróficos.

---

## 2. Padrão de Implementação Frontend

Para obter o comportamento correto de máscara Real BRL em tempo real mantendo o campo limpo quando vazio:

### A. Declaração do Estado (Componente TS)
Os sinais locais devem ser inicializados como strings vazias (`''`) para permitir que o input exiba seu respectivo placeholder de início:
```typescript
public transactionAmount = signal<string>('');
```

### B. Configuração do Campo (Template HTML)
- O input deve ser de tipo `type="text"` ou `type="tel"` (para acionar teclado numérico no mobile).
- O placeholder padrão deve ser `"00,00"`.
- O valor deve escutar o evento `(ionInput)` disparando o formatador.
```html
<ion-input 
  label="Valor da Movimentação (R$)" 
  labelPlacement="stacked"
  type="text" 
  placeholder="00,00" 
  [value]="transactionAmount()"
  (ionInput)="onTransactionAmountInput($event)"
  required>
</ion-input>
```

### C. Métodos Auxiliares de Formatação e Máscara (TS)
Adicione estes helpers reativos no componente:
```typescript
// Transforma números digitados em formato brasileiro Real (ex: 1234 -> R$ 12,34)
formatCurrency(value: string): string {
  let clean = value.replace(/\D/g, '');
  if (!clean) return '';
  const cents = parseInt(clean, 10);
  const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  return 'R$ ' + (cents / 100).toLocaleString('pt-BR', options);
}

// Converte a string formatada em número float puro para envio ao backend
parseCurrency(value: string): number {
  const clean = value.replace(/\D/g, '');
  if (!clean) return 0;
  return parseInt(clean, 10) / 100;
}

// Atualiza o sinal reativo com a máscara em tempo real
onTransactionAmountInput(event: any) {
  const val = event.target.value;
  this.transactionAmount.set(this.formatCurrency(val));
}
```

---

## 3. Fluxo de Integração e Envio ao Backend

Ao submeter o formulário para o backend (ex: abrindo, movimentando ou fechando caixa), utilize a função `parseCurrency()` para extrair o float limpo:
```typescript
async onSubmit() {
  const cleanAmount = this.parseCurrency(this.transactionAmount());
  // Envia cleanAmount (número puro) para a API
  await this.apiService.post('/route', { amount: cleanAmount });
}
```

Desta forma, o banco de dados recebe `12.34` (float puro) e o frontend exibe `R$ 12,34` em tempo real.
