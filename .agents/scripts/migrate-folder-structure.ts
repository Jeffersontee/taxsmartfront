import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_DIR = path.join(__dirname, '../../src/app');
const PAGES_DIR = path.join(APP_DIR, 'pages');

const PUBLIC_DIR = path.join(PAGES_DIR, 'public');
const CLIENT_DIR = path.join(PAGES_DIR, 'client');
const ADMIN_DIR = path.join(PAGES_DIR, 'admin');

interface MoveMapping {
  from: string;
  to: string;
  isPublic: boolean;
}

const MOVES: MoveMapping[] = [
  // 1. Institucional / Landing Page -> pages/public
  { from: path.join(PAGES_DIR, 'home'), to: path.join(PUBLIC_DIR, 'home'), isPublic: true },
  { from: path.join(PAGES_DIR, 'quem-somos'), to: path.join(PUBLIC_DIR, 'about-us'), isPublic: true },
  { from: path.join(PAGES_DIR, 'nossos-valores'), to: path.join(PUBLIC_DIR, 'values'), isPublic: true },
  { from: path.join(PAGES_DIR, 'servicos'), to: path.join(PUBLIC_DIR, 'services'), isPublic: true },
  { from: path.join(PAGES_DIR, 'fiscal'), to: path.join(PUBLIC_DIR, 'services-fiscal'), isPublic: true },
  { from: path.join(PAGES_DIR, 'contabilidade'), to: path.join(PUBLIC_DIR, 'services-accounting'), isPublic: true },
  { from: path.join(PAGES_DIR, 'departamento-pessoal'), to: path.join(PUBLIC_DIR, 'services-payroll'), isPublic: true },
  { from: path.join(PAGES_DIR, 'legalizacao'), to: path.join(PUBLIC_DIR, 'services-legal'), isPublic: true },
  { from: path.join(PAGES_DIR, 'consultoria'), to: path.join(PUBLIC_DIR, 'services-consulting'), isPublic: true },
  { from: path.join(PAGES_DIR, 'servicos-tributario'), to: path.join(PUBLIC_DIR, 'services-tax'), isPublic: true },
  { from: path.join(PAGES_DIR, 'consultoria-trabalhista'), to: path.join(PUBLIC_DIR, 'services-labor'), isPublic: true },
  { from: path.join(PAGES_DIR, 'planejamento-financeiro'), to: path.join(PUBLIC_DIR, 'financial-planning'), isPublic: true },
  { from: path.join(PAGES_DIR, 'ramos-de-atividades'), to: path.join(PUBLIC_DIR, 'segments'), isPublic: true },
  { from: path.join(PAGES_DIR, 'contato'), to: path.join(PUBLIC_DIR, 'contact'), isPublic: true },
  { from: path.join(PAGES_DIR, 'depoimentos'), to: path.join(PUBLIC_DIR, 'testimonials'), isPublic: true },
  { from: path.join(PAGES_DIR, 'tributario'), to: path.join(PUBLIC_DIR, 'tax'), isPublic: true },

  // 2. Timeline -> pages/admin/timeline
  { from: path.join(PAGES_DIR, 'tasks', 'timeline'), to: path.join(ADMIN_DIR, 'timeline'), isPublic: false },

  // 3. Cliente -> pages/client
  { from: path.join(PAGES_DIR, 'cliente'), to: CLIENT_DIR, isPublic: false },
];

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function adjustImportsInDir(dir: string, depthIncrease: boolean) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      adjustImportsInDir(fullPath, depthIncrease);
    } else if (entry.name.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');

      if (depthIncrease) {
        // Ajusta caminhos que subiam 2 níveis (../../components -> ../../../components)
        content = content
          .replace(/from '\.\.\/\.\.\/components\//g, "from '../../../components/")
          .replace(/from '\.\.\/\.\.\/services\//g, "from '../../../services/")
          .replace(/from '\.\.\/\.\.\/models\//g, "from '../../../models/")
          .replace(/from '\.\.\/\.\.\/enum\//g, "from '../../../enum/")
          .replace(/from '\.\.\/\.\.\/guards\//g, "from '../../../guards/")
          .replace(/from '\.\.\/\.\.\/interceptors\//g, "from '../../../interceptors/")
          .replace(/from '\.\.\/\.\.\/\.\.\/environments\//g, "from '../../../../environments/")
          .replace(/from '\.\.\/\.\.\/environments\//g, "from '../../../environments/");
      }

      // Se for o home.component.ts, ajusta os imports dos componentes irmãos renomeados
      if (entry.name === 'home.component.ts') {
        content = content
          .replace(/'\.\.\/quem-somos\//g, "'../about-us/")
          .replace(/'\.\.\/nossos-valores\//g, "'../values/")
          .replace(/'\.\.\/servicos\//g, "'../services/")
          .replace(/'\.\.\/fiscal\//g, "'../services-fiscal/")
          .replace(/'\.\.\/contabilidade\//g, "'../services-accounting/")
          .replace(/'\.\.\/departamento-pessoal\//g, "'../services-payroll/")
          .replace(/'\.\.\/legalizacao\//g, "'../services-legal/")
          .replace(/'\.\.\/consultoria\//g, "'../services-consulting/")
          .replace(/'\.\.\/planejamento-financeiro\//g, "'../financial-planning/")
          .replace(/'\.\.\/ramos-de-atividades\//g, "'../segments/")
          .replace(/'\.\.\/contato\//g, "'../contact/");
      }

      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

function run() {
  console.log('🚀 Iniciando migração e padronização da árvore de pastas do Frontend...\n');

  ensureDir(PUBLIC_DIR);
  ensureDir(ADMIN_DIR);

  for (const move of MOVES) {
    if (fs.existsSync(move.from)) {
      console.log(`📦 Movendo: ${path.relative(APP_DIR, move.from)} -> ${path.relative(APP_DIR, move.to)}`);
      ensureDir(path.dirname(move.to));
      fs.cpSync(move.from, move.to, { recursive: true });

      // Ajusta imports internos
      adjustImportsInDir(move.to, move.isPublic);

      // Remove pasta original
      fs.rmSync(move.from, { recursive: true, force: true });
    } else {
      console.log(`⚠️ Origem não encontrada: ${path.relative(APP_DIR, move.from)}`);
    }
  }

  // Remove pasta tasks se estiver vazia
  const tasksDir = path.join(PAGES_DIR, 'tasks');
  if (fs.existsSync(tasksDir)) {
    fs.rmSync(tasksDir, { recursive: true, force: true });
    console.log('🧹 Pasta pages/tasks removida.');
  }

  console.log('\n✅ Arquivos movidos e imports internos atualizados com sucesso!');
}

run();
