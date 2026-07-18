import * as fs from 'fs';
import * as path from 'path';

const args: string[] = process.argv.slice(2);
const skillName: string = args[0];
const skillDesc: string = args[1] || 'Descrição pendente.';

if (!skillName) {
  console.error("ERRO: Forneça o nome da skill. Exemplo: npx ts-node create-skill.ts minha-skill 'Minha descrição'");
  process.exit(1);
}

// O script assume que está sendo rodado a partir da raiz do projeto
const projectRoot: string = process.cwd();
const agentsDir: string = path.join(projectRoot, '.agents', 'skills', skillName);

if (fs.existsSync(agentsDir)) {
  console.error(`ERRO: A skill '${skillName}' já existe em ${agentsDir}.`);
  process.exit(1);
}

// Criar pastas
const dirsToCreate: string[] = [
  agentsDir,
  path.join(agentsDir, 'references'),
  path.join(agentsDir, 'scripts')
];

dirsToCreate.forEach(dir => {
  fs.mkdirSync(dir, { recursive: true });
  console.log(`Pasta criada: ${dir}`);
});

// Template do SKILL.md
const skillMdContent: string = `---
name: ${skillName}
description: ${skillDesc}
---

# ${skillName.replace(/-/g, ' ').toUpperCase()}

Instruções base para esta skill. Consulte a pasta \`references\` para mais detalhes técnicos.

## Regras
1. (Defina aqui o passo a passo que o agente deve seguir)
`;

fs.writeFileSync(path.join(agentsDir, 'SKILL.md'), skillMdContent);
console.log(`Arquivo SKILL.md gerado com sucesso.`);

// Arquivo de referência base
const refContent: string = `# Documentação de Referência: ${skillName}

Este arquivo deve ser usado para armazenar toda a documentação longa, explicações arquiteturais ou detalhes de implementação maiores que 500 linhas.
Lembre-se de manter o \`SKILL.md\` curto e referenciar este arquivo quando necessário.
`;

fs.writeFileSync(path.join(agentsDir, 'references', 'docs.md'), refContent);
console.log(`Arquivo references/docs.md gerado com sucesso.`);

console.log(`\n🎉 Skill '${skillName}' orquestrada e criada com sucesso!`);
