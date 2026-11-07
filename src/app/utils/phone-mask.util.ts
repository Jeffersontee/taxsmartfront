/**
 * Utilitário centralizado para formatação de telefone e celular brasileiro (Conceito DRY)
 * Suporta telefones fixos: (11) 3456-7890 (10 dígitos)
 * Suporta celulares: (11) 98765-4321 (11 dígitos)
 */
export function formatPhone(value: string | null | undefined): string {
  if (!value) return '';
  const digits = String(value).replace(/\D/g, '').slice(0, 11);
  
  if (digits.length === 0) {
    return '';
  }
  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Handler genérico para eventos (input) ou (ionInput) em formulários reativos
 */
export function handlePhoneInput(event: any, control: any): void {
  const rawValue = event?.detail?.value ?? event?.target?.value ?? '';
  const formatted = formatPhone(rawValue);
  if (control && typeof control.setValue === 'function') {
    control.setValue(formatted, { emitEvent: false });
  }
  if (event?.target && 'value' in event.target) {
    event.target.value = formatted;
  }
}
