import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonButton,
  IonBadge,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonToast,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  documentTextOutline,
  calculatorOutline,
  receiptOutline,
  copyOutline,
  checkmarkCircleOutline,
  timeOutline,
  alertCircleOutline,
  refreshOutline,
  cloudUploadOutline,
  cashOutline,
  trendingUpOutline,
  businessOutline,
  downloadOutline,
  qrCodeOutline,
  folderOpenOutline,
  eyeOutline,
} from 'ionicons/icons';
import { FiscalService } from '../../../services/fiscal/fiscal.service';
import { CompanyService } from '../../../services/company/company.service';
import { DocumentService, IDocumentItem } from '../../../services/document/document.service';
import { environment } from '../../../../environments/environment';
import { Strings } from '../../../enum/strings';
import { IInvoice, ITaxSimulation, ITaxGuide, TaxGuideStatus } from '../../../models/fiscal.model';

import { RouterLink } from '@angular/router';
import { DocumentVaultComponent } from '../../../components/document-vault/document-vault.component';

@Component({
  selector: 'app-admin-fiscal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonButton,
    IonBadge,
    IonSpinner,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonItem,
    IonToast,
    DocumentVaultComponent,
  ],
  templateUrl: './admin-fiscal.component.html',
  styleUrl: './admin-fiscal.component.scss',
})
export class AdminFiscalComponent implements OnInit {
  fiscalService = inject(FiscalService);
  companyService = inject(CompanyService);
  documentService = inject(DocumentService);
  private readonly baseUrl = environment.apiBaseUrl || Strings.API_BASE_URL;

  activeTab = signal<'invoices' | 'documents' | 'calculation' | 'guides'>('invoices');
  selectedCompetence = signal<string>('10/2026');
  selectedCompanyId = signal<string>('');
  fiscalDocuments = signal<IDocumentItem[]>([]);
  toastMessage = signal<string>('');
  showToast = signal<boolean>(false);

  constructor() {
    addIcons({
      documentTextOutline,
      calculatorOutline,
      receiptOutline,
      copyOutline,
      checkmarkCircleOutline,
      timeOutline,
      alertCircleOutline,
      refreshOutline,
      cloudUploadOutline,
      cashOutline,
      trendingUpOutline,
      businessOutline,
      downloadOutline,
      qrCodeOutline,
      folderOpenOutline,
      eyeOutline,
    });
  }

  ngOnInit(): void {
    this.companyService.loadCompanies().subscribe((res) => {
      if (res.data && res.data.length > 0) {
        this.selectedCompanyId.set(res.data[0]._id);
        this.loadAllData();
      }
    });
  }

  onTabChange(tab: any): void {
    this.activeTab.set(tab);
    if (tab === 'calculation' && !this.fiscalService.simulation()) {
      this.runSimulation();
    }
  }

  onCompanyChange(companyId: string): void {
    this.selectedCompanyId.set(companyId);
    this.fiscalService.selectedCompanyId.set(companyId);
    this.loadAllData();
  }

  loadAllData(): void {
    const compId = this.selectedCompanyId();
    const comp = this.selectedCompetence();

    this.fiscalService.loadInvoices({ companyId: compId, competence: comp }).subscribe();
    this.fiscalService.loadGuides({ companyId: compId, competence: comp }).subscribe();
    this.runSimulation();

    if (compId) {
      this.documentService
        .loadDocuments({ companyId: compId, competence: comp, module: 'FISCAL' })
        .subscribe({
          next: (res) => {
            if (res.data) {
              this.fiscalDocuments.set(res.data.documents);
            }
          },
        });
    }
  }

  getFileUrl(url: string): string {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const cleanBase = this.baseUrl.replace(/\/api\/v1\/?$/, '');
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${cleanBase}${cleanPath}`;
  }

  runSimulation(): void {
    const compId = this.selectedCompanyId();
    const comp = this.selectedCompetence();
    if (compId) {
      this.fiscalService.simulateCalculation(compId, comp).subscribe();
    }
  }

  generateGuideFromCalculation(): void {
    const sim = this.fiscalService.simulation();
    if (!sim) return;

    const newGuide: Partial<ITaxGuide> = {
      companyId: sim.companyId,
      title: sim.taxRegime === 'SIMPLES_NACIONAL' ? `Guia DAS - Simples Nacional ${sim.competence}` : `DARF Impostos Federais ${sim.competence}`,
      type: sim.taxRegime === 'SIMPLES_NACIONAL' ? 'DAS' : 'DARF_UNIFICADA',
      competence: sim.competence,
      dueDate: new Date(2026, 9, 20),
      amount: sim.netTaxPayable,
      totalAmount: sim.netTaxPayable,
      barcode: '85890000025-8 80000287202-4 61020260000-1 00000000000-0',
      pixCopiaECola: `00020101021226870014br.gov.bcb.pix2565taxsmart.gov.br/qr/v2/cobv/guia${Date.now()}5204000053039865407${sim.netTaxPayable.toFixed(2)}5802BR5925RECEITA FEDERAL DO BRASIL6009SAO PAULO62070503***6304E7A2`,
      status: 'PENDENTE',
    };

    this.fiscalService.createGuide(newGuide).subscribe({
      next: () => {
        this.displayToast('Guia gerada com sucesso e sincronizada com a Linha do Tempo!');
        this.activeTab.set('guides');
      },
    });
  }

  copyToClipboard(text?: string): void {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this.displayToast('Código PIX Copia e Cola copiado para a área de transferência!');
    });
  }

  markGuideAsPaid(guide: ITaxGuide): void {
    if (!guide._id) return;
    this.fiscalService.updateGuideStatus(guide._id, 'PAGO', guide.totalAmount).subscribe({
      next: () => {
        this.displayToast('Guia marcada como PAGA com sucesso!');
      },
    });
  }

  displayToast(msg: string): void {
    this.toastMessage.set(msg);
    this.showToast.set(true);
  }
}
