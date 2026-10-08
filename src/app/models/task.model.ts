export enum TaskStatus {
  ABERTA = 'ABERTA',
  CONCLUIDO = 'CONCLUIDO',
  IMPEDIMENTO = 'IMPEDIMENTO',
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

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  companyId: {
    _id: string;
    corporateName: string;
    tradeName: string;
    cnpj: string;
  };
  category: TaskCategory;
  competence: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  taxAmount?: number;
  pixCode?: string;
  barcode?: string;
  impedimentReason?: string;
  attachments?: ITaskAttachment[];
  comments?: ITaskComment[];
  statusHistory?: ITaskHistory[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITimelineSummary {
  total: number;
  abertas?: number;
  aberta?: number;
  concluidas?: number;
  concluido?: number;
  impedimentos?: number;
  impedimento?: number;
  desconsideradas?: number;
  desconsiderado?: number;
  percentualConclusao?: number;
}
