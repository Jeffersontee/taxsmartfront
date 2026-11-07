# Arquitetura de Tarefas Contábeis, Linha do Tempo e Esteira de Documentos (Storage Vault)

**Ecossistema TaxSmart Contabilidade**  
*Documento de Especificação Arquitetural e Funcional — Versão 1.0 (Outubro/2026)*

---

## 1. Visão Geral: O Coração do Ecossistema Contábil

No ecossistema **TaxSmart**, a **Linha do Tempo de Obrigações (Tarefas)** representa o núcleo operacional do escritório e a principal ponte de interação com os clientes empresariais.

Inspirado nas principais referências do mercado contábil corporativo (como **Gestta**, **Tareffa** e **Acessórias**), o sistema opera sob a premissa de que **toda obrigação fiscal, contábil ou trabalhista é uma Tarefa rastreável**, com prazos, responsáveis, entregáveis em arquivos e trilha de auditoria formal.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TAREFA CONTÁBIL / OBRIGAÇÃO                     │
│  - Competência: 10/2026                                               │
│  - Módulo: FISCAL | CONTABIL | DP | RH                                │
│  - Responsável Técnico: Juliana (Analista Fiscal)                     │
│  - Empresa Cliente: TechInova Software Ltda                           │
│  - Status: ABERTA | CONCLUIDA | IMPEDIMENTO | DESCONSIDERADA          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ gera / exige
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    DOCUMENTO / ARQUIVO DIGITAL                         │
│  - NF-e XML / Extrato OFX / Guia DAS / Holerite PDF                   │
│  - Storage Provider: CLOUDINARY (Estrutura de Pastas Hierárquica)     │
│  - Hash SHA-256 de Autenticidade perante a Receita Federal             │
│  - Indexado automaticamente no Document Vault (Esteira de Documentos) │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Linha do Tempo vs. Esteira de Documentos: Qual é a Diferença?

| Característica | ⏱️ Linha do Tempo (`/timeline`) | 📁 Esteira de Documentos (`/documentos`) |
| :--- | :--- | :--- |
| **Objetivo Primário** | Gestão de **processos e prazos** operacionais. | **Custódia, trâmite e auditoria** de arquivos. |
| **Pergunta que Responde** | *"O que precisa ser feito este mês e até quando?"* | *"Onde está o arquivo original e qual o seu hash?"* |
| **Unidade de Trabalho** | **Card de Tarefa** (status, vencimento, responsável). | **Arquivo Binário** (XML, OFX, PDF, PNG, etc.). |
| **Público-Alvo** | Cliente acompanhando pendências e contador operando rotinas. | Auditor fiscal, contador conferindo XMLs e cliente baixando guias. |
| **Ações Principais** | Alterar status, anexar guias/comprovantes, ver pendência. | Upload drag & drop, pré-visualização inline, download, fechar competência. |

> **Conclusão:** O módulo de **Documentos** é o repositório centralizador e unificado de todos os tipos de arquivos e módulos (uma forma mais ágil de ver e auditar a massa de arquivos), enquanto a **Linha do Tempo** é o guia passo a passo das entregas do mês.

---

## 3. Lógica UX do Clique no Card da Tarefa

Ao visualizar um card na Linha do Tempo, como:
- `[ ACESSAR PASTA / ENVIAR ARQUIVO ]` na tarefa *Escrituração de Notas Fiscais*;
- `[ RESOLVER IMPEDIMENTO / ANEXAR ARQUIVO ]` na tarefa *Importação de Extratos OFX*.

### Qual é a melhor experiência para o usuário?

#### ❌ O que NÃO deve acontecer:
O usuário clicar no card e ser jogado/redirecionado bruscamente para a página de Documentos (`/company/documentos`), perdendo o contexto da tarefa que estava tentando resolver.

#### ✅ Padrão Recomendado (Modal / Drawer Direto na Tarefa):
1. **Abertura Contextual sem Sair da Linha do Tempo:**
   Ao clicar em `[ ACESSAR PASTA / ENVIAR ARQUIVO ]` ou `[ RESOLVER IMPEDIMENTO ]`, o sistema abre um **Modal / Drawer Lateral de Detalhes da Tarefa** (inspirado na tela do Gestta):
   - Exibe os dados da tarefa (Prazo, Responsável, Módulo, Instruções da Contabilidade);
   - Exibe a área de **"Atividades com Anexo"** com drag & drop simplificado;
   - Se a tarefa estiver em `IMPEDIMENTO`, exibe a justificativa do contador em destaque (ex: *"Extrato bancário incompleto"*).

2. **Upload Inteligente com Duplo Vínculo:**
   Ao soltar o arquivo no modal da tarefa:
   - O arquivo é enviado diretamente para a pasta correspondente no **Cloudinary**:
     `taxsmart/{empresa}/{ano_mes}/{modulo}/{tipo_documento}/{arquivo}`
   - O documento é salvo na coleção `document_storages` com o ID da tarefa vinculado;
   - A tarefa transiciona automaticamente de `IMPEDIMENTO` ou `ABERTA` para **`EM ANÁLISE`** ou **`CONCLUÍDO`**;
   - Uma notificação é disparada para o analista responsável no escritório;
   - O arquivo **já aparece instantaneamente** na esteira central de `/documentos` sem que o usuário precise fazer nada duas vezes.

---

## 4. Regra de Isolamento por Perfil: Portal da Empresa (`/company`)

### Por que no portal Company não deve existir "Todas as Empresas"?

- **Staff do Escritório (`/admin`):**
  O contador, analista fiscal e administrador gerenciam **múltiplas empresas clientes**. Para eles, a opção *"Todas as Empresas (Carteira Geral)"* é fundamental para monitorar a operação de ponta a ponta.

- **Empresário / Cliente (`/company`):**
  O usuário da empresa acessa a plataforma para cuidar **exclusivamente do seu próprio CNPJ**.
  - Não faz sentido exibir opções de "Carteira Geral";
  - Se o usuário pertence a uma única empresa (cenário padrão), o campo de empresa é **automático e estático**, exibindo o nome fantasia da empresa dele em uma badge elegante;
  - Se for um sócio de grupo econômico (2 a 3 empresas da mesma família/holding), o seletor exibe apenas as empresas pertencentes a ele, sem a opção de carteira geral do escritório.

---

## 5. Estrutura Lógica da Tarefa Contábil e Recorrência

No TaxSmart, uma tarefa contábil segue o seguinte schema estendido:

```typescript
interface ITaskContabil {
  _id: string;
  title: string;                         // Ex: "Apuração do Simples Nacional (Guia DAS)"
  description: string;                   // Detalhes da rotina operacional
  companyId: ObjectId;                   // Vínculo com a PJ cliente
  companyName: string;                   // Denominação social
  category: 'FISCAL' | 'CONTABIL' | 'FOLHA' | 'LEGALIZACAO';
  competence: string;                    // "10/2026"
  dueDate: Date;                         // Data limite legal / meta de entrega
  status: 'ABERTA' | 'CONCLUIDO' | 'IMPEDIMENTO' | 'DESCONSIDERADO';
  priority: 'ALTA' | 'MEDIA' | 'BAIXA';
  
  // Responsáveis e Equipe
  assignedTo?: {
    userId: ObjectId;
    userName: string;
    role: string;                        // "Analista Fiscal"
  };

  // Anexos e Entregáveis
  requiredAttachments: {
    documentType: string;                // "EXTRATO_BANCARIO_OFX", "NFE_XML"
    description: string;
    isMandatory: boolean;
  }[];
  attachments: {
    documentStorageId: ObjectId;
    originalFilename: string;
    fileUrl: string;
    uploadedAt: Date;
    uploadedBy: string;
  }[];

  // Informações para o Cliente (Guias e Pagamentos)
  paymentInfo?: {
    pixCode?: string;
    barcode?: string;
    amount?: number;
    guideUrl?: string;
  };

  // Recorrência
  recurrence: {
    isRecurring: boolean;                // true
    frequency: 'MENSAL' | 'TRIMESTRAL' | 'ANUAL';
    dayOfMonth: number;                  // Ex: dia 20 de cada mês
  };
}
```

### Automação de Recorrência e Seed Mensal:
Todo início de mês (ou via comando de sementeira/cron job):
1. O agendador do backend avalia o **Regime Tributário** de cada empresa (Simples Nacional, Lucro Presumido, MEI);
2. Clona o modelo mestre de obrigações daquele regime para a nova competência (`11/2026`);
3. Atribui os analistas conforme a carteira do Staff (`assignedCompanies`);
4. Cria antecipadamente as pastas estruturadas no **Cloudinary** para recepcionar os XMLs e extratos do novo mês.

---

## 6. Organização Lógica de Pastas no Cloudinary

Todos os arquivos gerados ou anexados pelas tarefas são particionados segundo a regra:

$$\text{taxsmart} \;/ \; \{\text{empresa}\} \;/ \; \{\text{ano\_mes}\} \;/ \; \{\text{modulo}\} \;/ \; \{\text{tipo\_documento}\} \;/ \; \{\text{arquivo}\}$$

### Exemplo Prático de Árvore no Cloud Name `dzi7nta6k`:
```
taxsmart/
├── techinova_software/
│   ├── 2026_10/
│   │   ├── FISCAL/
│   │   │   ├── NFE_XML/NFE_Entrada_Servidor_Cloud_1024.xml
│   │   │   └── GUIA_DAS/Guia_DAS_Simples_Nacional_10_2026.pdf
│   │   ├── CONTABIL/
│   │   │   └── OFX/Extrato_Bancario_Itau_ContaCorrente_102026.ofx
│   │   ├── DP/
│   │   │   └── HOLERITE/Holerite_Adiantamento_Outubro_2026_TechInova.pdf
│   │   └── LEGALIZACAO/
│   │       └── CONTRATO_SOCIAL/Contrato_Social_Consolidado_TechInova.pdf
└── vanguarda_express/
    └── 2026_10/
        └── FISCAL/
            └── NFE_XML/...
```

---

## 7. Próximos Passos de Implementação

1. **Modal de Detalhes e Ação da Tarefa na Linha do Tempo (`TaskDetailDrawer`):**
   - Permitir ao cliente anexar arquivos direto pelo card na timeline;
   - Exibir a lista de arquivos já anexados àquela tarefa com botão de pré-visualização rápida.
2. **Automação de Transição de Status:**
   - Ao anexar o documento exigido, atualizar a tarefa de `IMPEDIMENTO` para `CONCLUIDO` ou `EM ANÁLISE` automaticamente.
3. **Gerador Periódico de Competências:**
   - Interface no Super Admin para disparar o "Virar Mês / Nova Competência" gerando todas as tarefas automaticamente para as empresas cadastradas.

