import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonButton,
  IonInput,
  IonTextarea,
  IonItem,
  IonLabel,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  logoWhatsapp,
  callOutline,
  locationOutline,
  mailOutline,
  sendOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  syncOutline,
} from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-contato',
  templateUrl: './contato.component.html',
  styleUrls: ['./contato.component.scss'],
  imports: [
    FormsModule,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonButton,
    IonInput,
    IonTextarea,
    IonItem,
    IonLabel,
    IonSpinner,
  ],
})
export class ContatoComponent {
  nome = signal('');
  email = signal('');
  telefone = signal('');
  mensagem = signal('');
  
  isLoading = signal(false);
  statusMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  constructor() {
    addIcons({
      logoWhatsapp,
      callOutline,
      locationOutline,
      mailOutline,
      sendOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      syncOutline,
    });
  }

  onTelefoneInput(event: any): void {
    const input = event.target as HTMLInputElement;
    let rawValue = (input?.value || event.detail?.value || '').replace(/\D/g, '');
    
    // Limita a 11 dígitos (DDD + 9 dígitos)
    if (rawValue.length > 11) {
      rawValue = rawValue.substring(0, 11);
    }

    let formatted = '';
    if (rawValue.length > 0) {
      if (rawValue.length <= 2) {
        formatted = `(${rawValue}`;
      } else if (rawValue.length <= 6) {
        formatted = `(${rawValue.substring(0, 2)}) ${rawValue.substring(2)}`;
      } else if (rawValue.length <= 10) {
        // Formato fixo: (11) 1234-5678
        formatted = `(${rawValue.substring(0, 2)}) ${rawValue.substring(2, 6)}-${rawValue.substring(6)}`;
      } else {
        // Formato celular: (11) 91234-5678
        formatted = `(${rawValue.substring(0, 2)}) ${rawValue.substring(2, 7)}-${rawValue.substring(7)}`;
      }
    }

    this.telefone.set(formatted);
    if (input) {
      input.value = formatted;
    }
  }

  async sendMessage(event?: Event): Promise<void> {
    if (event) {
      event.preventDefault();
    }

    if (this.isLoading()) {
      return;
    }

    const nomeVal = this.nome().trim();
    const emailVal = this.email().trim();
    const telefoneVal = this.telefone().trim();
    const mensagemVal = this.mensagem().trim();

    if (!nomeVal) {
      this.statusMessage.set({
        type: 'error',
        text: 'Por favor, informe o seu nome completo.',
      });
      return;
    }

    if (!emailVal && !telefoneVal) {
      this.statusMessage.set({
        type: 'error',
        text: 'Por favor, informe ao menos um meio de contato (E-mail ou Telefone).',
      });
      return;
    }

    this.isLoading.set(true);
    this.statusMessage.set(null);

    const payload = {
      name: nomeVal,
      email: emailVal || 'Não informado',
      phone: telefoneVal || 'Não informado',
      message: mensagemVal || 'Solicitação de contato via site TaxSmart',
      _subject: `Novo Contato do Site - ${nomeVal}`,
      _template: 'table',
      _captcha: 'false',
    };

    try {
      let isSuccess = false;
      let errorDetail = '';

      // 1. Tenta envio direto pelo servidor Locaweb (send-mail.php)
      try {
        const phpResponse = await fetch('/send-mail.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (phpResponse.ok) {
          const phpResult = await phpResponse.json().catch(() => ({}));
          if (phpResult.success) {
            isSuccess = true;
          }
        }
      } catch (e: any) {
        console.warn('Tentativa via PHP falhou, tentando fallback externo...', e);
      }

      // 2. Se não estiver em produção ou o PHP não responder, usa o fallback FormSubmit
      if (!isSuccess) {
        const fsResponse = await fetch(
          'https://formsubmit.co/ajax/contato@taxsmartcontabilidade.com.br',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify(payload),
          }
        );

        const fsResult = await fsResponse.json().catch(() => ({}));
        console.log('Resposta FormSubmit:', fsResponse.status, fsResult);

        if (fsResponse.ok && fsResult.success !== 'false' && fsResult.success !== false) {
          isSuccess = true;
        } else {
          errorDetail = fsResult.message || '';
        }
      }

      if (isSuccess) {
        this.statusMessage.set({
          type: 'success',
          text: 'Mensagem enviada com sucesso! Nossa equipe entrará em contato em breve.',
        });
        this.nome.set('');
        this.email.set('');
        this.telefone.set('');
        this.mensagem.set('');
      } else {
        throw new Error(errorDetail || 'Falha ao processar envio.');
      }
    } catch (err: any) {
      console.error('Erro na requisição de contato:', err);
      this.statusMessage.set({
        type: 'error',
        text: 'Não foi possível enviar a mensagem no momento. Por favor, entre em contato diretamente pelo WhatsApp ou pelo e-mail contato@taxsmartcontabilidade.com.br.',
      });
    } finally {
      this.isLoading.set(false);
    }
  }
}


