export enum TaskStatus {
  ABERTA = 'ABERTA',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDO = 'CONCLUIDO',
  IMPEDIMENTO = 'IMPEDIMENTO',
  DESCONSIDERADO = 'DESCONSIDERADO',
}

export enum TaskDocumentStatus {
  PENDENTE = 'PENDENTE',
  ENVIADO = 'ENVIADO',
  VALIDADO = 'VALIDADO',
  DESCONSIDERADO = 'DESCONSIDERADO',
}

export enum TaskCategory {
  FISCAL = 'FISCAL',
  CONTABIL = 'CONTABIL',
  FOLHA = 'FOLHA',
  LEGALIZACAO = 'LEGALIZACAO',
  FINANCEIRO = 'FINANCEIRO',
}

export enum TaskPriority {
  BAIXA = 'BAIXA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE',
}

export interface ITaskHistory {
  fromStatus: TaskStatus;
  toStatus: TaskStatus;
  changedBy: {
    _id: string;
    name: string;
    role: string;
  };
  reason?: string;
  timestamp: string;
}

export interface ITaskAttachment {
  name: string;
  url: string;
  uploadedAt: string;
}

export interface ITaskComment {
  author: {
    _id: string;
    name: string;
    role: string;
  };
  message: string;
  createdAt: string;
}

export interface ITaskChecklist {
  _id?: string;
  title: string;
  completed: boolean;
  completedBy?: {
    _id: string;
    name: string;
  };
  completedAt?: string;
}

export interface ITaskRequiredDocument {
  _id?: string;
  title: string;
  description?: string;
  isRequired: boolean;
  documentId?: string;
  fileUrl?: string;
  originalFilename?: string;
  status: TaskDocumentStatus;
  uploadedAt?: string;
  uploadedBy?: {
    _id: string;
    name: string;
  };
  disregardReason?: string;
}

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  templateId?: string;
  companyId: {
    _id: string;
    corporateName: string;
    tradeName: string;
    cnpj: string;
  };
  category: TaskCategory;
  competence: string;
  dueDate: string;
  legalDueDate?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: {
    _id: string;
    name: string;
    role: string;
  };
  createdBy?: {
    _id: string;
    name: string;
  };
  isClientVisible?: boolean;
  notifyClientEmail?: boolean;
  notifyClientWhatsapp?: boolean;
  taskValue?: number;
  additionalEmails?: string[];
  taxAmount?: number;
  pixCode?: string;
  barcode?: string;
  pdfUrl?: string;
  guideId?: string;
  checklist?: ITaskChecklist[];
  requiredDocuments?: ITaskRequiredDocument[];
  timeSpentSeconds?: number;
  impedimentReason?: string;
  attachments?: ITaskAttachment[];
  comments?: ITaskComment[];
  statusHistory?: ITaskHistory[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITaskTemplate {
  _id: string;
  name: string;
  description?: string;
  category: TaskCategory;
  recurrence: string;
  targetRegimes?: string[];
  defaultDueDay: number;
  defaultLegalDueDay?: number;
  isClientVisible: boolean;
  checklist: { _id?: string; title: string; order?: number }[];
  requiredDocuments: {
    _id?: string;
    title: string;
    description?: string;
    isRequired: boolean;
    acceptedFormats: string[];
  }[];
  notifyClientEmail: boolean;
  notifyClientWhatsapp: boolean;
  active: boolean;
}

export interface ITimelineSummary {
  total: number;
  abertas?: number;
  aberta?: number;
  emAndamento?: number;
  concluidas?: number;
  concluido?: number;
  impedimentos?: number;
  impedimento?: number;
  desconsideradas?: number;
  desconsiderado?: number;
  percentualConclusao?: number;
}
