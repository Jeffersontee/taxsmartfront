import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_SKILLS_DIR = 'C:\\workspace\\adegaspinguinsV2\\adegapinguinsfront\\.agents\\skills';
const TARGET_SKILLS_DIR = path.join(__dirname, '../skills');

// Skills irrelevantes ou de nicho exclusivo de e-commerce de bebidas que não fazem sentido para um ERP contábil
const IGNORED_SKILLS = new Set([
  'product-type-size',
  'loyalty-promotions-seeder',
]);

// Skills críticas já customizadas no TaxSmart que não devem ser sobrescritas
const PRESERVED_SKILLS = new Set([
  'angular-ionic-imports',
  'angular-strict-separation',
  'impeccable',
]);

function copyDirRecursive(src: string, dest: string) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function processSkill(skillName: string) {
  if (IGNORED_SKILLS.has(skillName)) {
    console.log(`[SKIP] Ignorando skill '${skillName}' (específica de adega/bebidas).`);
    return;
  }

  const srcSkillDir = path.join(SOURCE_SKILLS_DIR, skillName);
  const targetSkillDir = path.join(TARGET_SKILLS_DIR, skillName);

  if (!fs.existsSync(srcSkillDir)) return;

  if (!fs.existsSync(targetSkillDir)) {
    fs.mkdirSync(targetSkillDir, { recursive: true });
  }

  const srcReferencesDir = path.join(srcSkillDir, 'references');
  const targetReferencesDir = path.join(targetSkillDir, 'references');
  if (!fs.existsSync(targetReferencesDir)) {
    fs.mkdirSync(targetReferencesDir, { recursive: true });
  }

  // Copia subdiretórios extras como scripts se houver
  const srcScriptsDir = path.join(srcSkillDir, 'scripts');
  if (fs.existsSync(srcScriptsDir)) {
    const targetScriptsDir = path.join(targetSkillDir, 'scripts');
    copyDirRecursive(srcScriptsDir, targetScriptsDir);
  }

  const srcSkillMdPath = path.join(srcSkillDir, 'SKILL.md');
  const targetSkillMdPath = path.join(targetSkillDir, 'SKILL.md');

  if (PRESERVED_SKILLS.has(skillName) && fs.existsSync(targetSkillMdPath)) {
    console.log(`[PRESERVE] Mantendo skill nativa customizada '${skillName}'.`);
    return;
  }

  let skillMdContent = '';
  if (fs.existsSync(srcSkillMdPath)) {
    skillMdContent = fs.readFileSync(srcSkillMdPath, 'utf8');
  }

  // Extrai frontmatter
  let frontmatter = `---
name: ${skillName}
description: Diretrizes de padronização para a skill ${skillName}.
---`;

  let body = skillMdContent;
  const match = skillMdContent.match(/^---\n([\s\S]*?)\n---([\s\S]*)$/);
  if (match) {
    frontmatter = `---
${match[1].trim()}
---`;
    body = match[2].trim();
  }

  // Contextualiza termos do projeto antigo para TaxSmart Contabilidade
  body = body
    .replace(/Adega Pinguins Front/gi, 'TaxSmart Frontend')
    .replace(/Adega Pinguins/gi, 'TaxSmart Contabilidade')
    .replace(/adegapinguinsfront/gi, 'taxsmartfront')
    .replace(/adegapinguins/gi, 'taxsmart')
    .replace(/estabelecimento/gi, 'empresa / cliente')
    .replace(/estabelecimentos/gi, 'empresas / clientes');

  // Identifica ou cria referência em references/
  let refFiles = fs.existsSync(srcReferencesDir)
    ? fs.readdirSync(srcReferencesDir).filter((f) => f.endsWith('.md'))
    : [];

  let mainRefFileName = `${skillName.toUpperCase().replace(/-/g, '_')}.md`;

  if (refFiles.length > 0) {
    // Se a fonte já tinha arquivos em references, copiar e contextualizar
    for (const refFile of refFiles) {
      let refContent = fs.readFileSync(path.join(srcReferencesDir, refFile), 'utf8');
      refContent = refContent
        .replace(/Adega Pinguins Front/gi, 'TaxSmart Frontend')
        .replace(/Adega Pinguins/gi, 'TaxSmart Contabilidade')
        .replace(/adegapinguinsfront/gi, 'taxsmartfront')
        .replace(/adegapinguins/gi, 'taxsmart');
      fs.writeFileSync(path.join(targetReferencesDir, refFile), refContent, 'utf8');
    }
    mainRefFileName = refFiles[0];
  } else {
    // Se references estava vazia, salvar o corpo do SKILL.md original em references
    const refContent = body.length > 0 ? body : `# ${skillName}\n\nDiretrizes de ${skillName} para o frontend TaxSmart.`;
    fs.writeFileSync(path.join(targetReferencesDir, mainRefFileName), refContent, 'utf8');
  }

  // Escreve o SKILL.md conciso conforme a arquitetura padrão
  const targetRefUrl = `file:///c:/workspace/workspace_taxsmartcontabilidade/taxsmartfront/.agents/skills/${skillName}/references/${mainRefFileName}`;
  const newSkillMdContent = `${frontmatter}

Esta skill fornece diretrizes sobre **${skillName}** no ecossistema TaxSmart Front.

Por favor, leia a documentação completa no arquivo de referência:
[${mainRefFileName}](${targetRefUrl})
`;

  fs.writeFileSync(targetSkillMdPath, newSkillMdContent, 'utf8');
  console.log(`[✓] Skill '${skillName}' exportada e padronizada -> references/${mainRefFileName}`);
}

function run() {
  console.log('🚀 Iniciando exportação e padronização das skills para o Frontend TaxSmart...\n');

  if (!fs.existsSync(SOURCE_SKILLS_DIR)) {
    console.error('❌ Diretório de origem não encontrado:', SOURCE_SKILLS_DIR);
    return;
  }

  const skillDirs = fs.readdirSync(SOURCE_SKILLS_DIR).filter((f) => {
    return fs.statSync(path.join(SOURCE_SKILLS_DIR, f)).isDirectory();
  });

  console.log(`Encontradas ${skillDirs.length} skills no projeto anterior.\n`);

  for (const skillName of skillDirs) {
    processSkill(skillName);
  }

  console.log('\n🎉 Todas as skills foram processadas e padronizadas com sucesso!');
}

run();
