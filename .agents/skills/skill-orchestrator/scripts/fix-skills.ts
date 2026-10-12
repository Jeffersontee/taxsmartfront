import * as fs from 'fs';
import * as path from 'path';

const projectRoot = process.cwd();
const skillsDir = path.join(projectRoot, '.agents', 'skills');

if (!fs.existsSync(skillsDir)) {
  console.error("❌ Diretório de skills não encontrado.");
  process.exit(1);
}

const skills = fs.readdirSync(skillsDir);
console.log("🛠️ Iniciando Auto-Correção em Lote das Agent Skills...\n");

skills.forEach(skill => {
  const skillPath = path.join(skillsDir, skill);
  if (!fs.statSync(skillPath).isDirectory()) return;

  console.log(`Corrigindo estrutura de: [${skill}]`);

  // 1. Garante a criação das subpastas obrigatórias
  const requiredFolders = ['agents', 'references', 'scripts'];
  requiredFolders.forEach(folder => {
    const folderPath = path.join(skillPath, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`  + Pasta criada: ${folder}/`);
    }
  });

  // 2. Garante a existência do SKILL.md
  const skillMdPath = path.join(skillPath, 'SKILL.md');
  if (!fs.existsSync(skillMdPath)) {
    const defaultContent = `---\nname: ${skill}\description: Diretrizes automáticas para ${skill}.\n---\n\n# ${skill.toUpperCase()}\n`;
    fs.writeFileSync(skillMdPath, defaultContent);
    console.log(`  + Arquivo SKILL.md criado com YAML válido.`);
  } else {
    // 3. Corrige o arquivo SKILL.md se ele não tiver o YAML Frontmatter
    let content = fs.readFileSync(skillMdPath, 'utf-8');
    if (!content.startsWith('---')) {
      const header = `---\nname: ${skill}\ndescription: Diretrizes atualizadas para ${skill}.\n---\n\n`;
      fs.writeFileSync(skillMdPath, header + content);
      console.log(`  + Injetado cabeçalho YAML Frontmatter no SKILL.md existente.`);
    }
  }
});

console.log("\n🎉 Estrutura de todas as skills corrigida com sucesso!");
