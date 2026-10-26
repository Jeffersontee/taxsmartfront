import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon,
  IonBadge,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  folderOpenOutline,
  documentTextOutline,
  receiptOutline,
  cashOutline,
  peopleOutline,
  businessOutline,
  timeOutline,
  cloudUploadOutline,
  shieldCheckmarkOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../services/auth/auth.service';
import { CompanyService } from '../../../services/company/company.service';
import { DocumentVaultComponent } from '../../../components/document-vault/document-vault.component';
import { UserCompany } from '../../../models/user.model';

@Component({
  selector: 'app-company-documents',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonIcon,
    IonBadge,
    IonSelect,
    IonSelectOption,
    DocumentVaultComponent,
  ],
  templateUrl: './company-documents.component.html',
  styleUrl: './company-documents.component.scss',
})
export class CompanyDocumentsComponent implements OnInit {
  authService = inject(AuthService);
  companyService = inject(CompanyService);
  route = inject(ActivatedRoute);

  // Signals de Estado
  selectedCompetence = signal<string>('10/2026');
  activeModule = signal<'GERAL' | 'FISCAL' | 'CONTABIL' | 'DP'>('FISCAL');

  // Permissões de Acesso aos Módulos (empresa ou staff)
  canAccessFiscal = computed(() => this.authService.canAccessFiscal());
  canAccessAccounting = computed(() => this.authService.canAccessAccounting());
  canAccessPayroll = computed(() => this.authService.canAccessPayroll());
  canAccessGeneral = computed(
    () => this.canAccessFiscal() && this.canAccessAccounting() && this.canAccessPayroll()
  );

  // Competências disponíveis
  competences = signal<string[]>([
    '10/2026',
    '09/2026',
    '08/2026',
    '07/2026',
    '06/2026',
    '05/2026',
    '04/2026',
    '03/2026',
    '02/2026',
    '01/2026',
  ]);

  // ID da empresa logada
  currentCompanyId = computed(() => {
    const sel = this.companyService.selectedCompany();
    if (sel?._id) return sel._id;
    const user = this.authService.currentUser();
    if (!user?.companyId) return null;
    return typeof user.companyId === 'object' ? (user.companyId as UserCompany)._id : user.companyId;
  });

  // Nome da Empresa
  companyName = computed(() => {
    const sel = this.companyService.selectedCompany();
    if (sel) return sel.tradeName || sel.corporateName;
    const user = this.authService.currentUser();
    const comp = typeof user?.companyId === 'object' ? (user.companyId as UserCompany) : null;
    return comp?.tradeName || comp?.corporateName || 'Sua Empresa';
  });

  // Título Dinâmico do Cofre
  vaultTitle = computed(() => {
    switch (this.activeModule()) {
      case 'FISCAL':
        return 'Documentos Fiscais & XMLs';
      case 'CONTABIL':
        return 'Extratos Bancários & Contábil';
      case 'DP':
        return 'Departamento Pessoal & Holerites';
      default:
        return 'Todos os Documentos da Empresa';
    }
  });

  // Subtítulo Dinâmico do Cofre
  vaultSubtitle = computed(() => {
    switch (this.activeModule()) {
      case 'FISCAL':
        return 'Envie notas fiscais (NF-e, NFS-e, CT-e) e acesse as guias de tributos apuradas pelo escritório (DAS, DARF).';
      case 'CONTABIL':
        return 'Envie seus extratos bancários mensais em formato OFX e consulte balancetes e relatórios contábeis.';
      case 'DP':
        return 'Envie folhas de ponto e visualize os holerites de pagamento e recibos de pró-labore disponibilizados.';
      default:
        return 'Visualize todos os arquivos recebidos e compartilhados com o escritório contábil nesta competência.';
    }
  });

  constructor() {
    addIcons({
      folderOpenOutline,
      documentTextOutline,
      receiptOutline,
      cashOutline,
      peopleOutline,
      businessOutline,
      timeOutline,
      cloudUploadOutline,
      shieldCheckmarkOutline,
      informationCircleOutline,
    });
  }

  ngOnInit(): void {
    // Inicialização da aba ativa respeitando os privilégios do usuário
    if (this.canAccessFiscal()) {
      this.activeModule.set('FISCAL');
    } else if (this.canAccessPayroll()) {
      this.activeModule.set('DP');
    } else if (this.canAccessAccounting()) {
      this.activeModule.set('CONTABIL');
    } else {
      this.activeModule.set('GERAL');
    }

    this.route.queryParams.subscribe((params) => {
      if (params['module']) {
        const rawMod = (params['module'] as string).toUpperCase();
        if ((rawMod === 'FOLHA' || rawMod === 'DP') && this.canAccessPayroll()) {
          this.activeModule.set('DP');
        } else if (rawMod === 'CONTABIL' && this.canAccessAccounting()) {
          this.activeModule.set('CONTABIL');
        } else if (rawMod === 'FISCAL' && this.canAccessFiscal()) {
          this.activeModule.set('FISCAL');
        } else if (this.canAccessGeneral()) {
          this.activeModule.set('GERAL');
        }
      }

      if (params['competence']) {
        this.selectedCompetence.set(params['competence']);
      }
    });

    if (!this.companyService.selectedCompany()) {
      this.companyService.loadCompanies().subscribe();
    }
  }

  onModuleChange(mod: any): void {
    this.activeModule.set(mod);
  }

  onCompetenceChange(comp: string): void {
    this.selectedCompetence.set(comp);
  }
}
