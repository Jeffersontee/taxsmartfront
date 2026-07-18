import * as fs from 'fs';
import * as path from 'path';

function toPascalCase(str: string): string {
  return str.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function extractIonicTags(htmlContent: string): Set<string> {
  const tags = new Set<string>();
  const regex = /<ion-([a-zA-Z0-9-]+)/g;
  let match;
  while ((match = regex.exec(htmlContent)) !== null) {
    tags.add('Ion' + toPascalCase(match[1]));
  }
  return tags;
}

function fixImports(dir: string) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      fixImports(fullPath);
    } else if (file.name.endsWith('.component.ts')) {
      const htmlPath = fullPath.replace('.ts', '.html');
      
      if (fs.existsSync(htmlPath)) {
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        const ionicTags = Array.from(extractIonicTags(htmlContent));

        let tsContent = fs.readFileSync(fullPath, 'utf8');
        let needsUpdate = false;

        // 1. FORÇAR MODO STANDALONE
        if (!tsContent.includes('standalone: true')) {
          tsContent = tsContent.replace(/(@Component\(\s*\{)/, '$1\n  standalone: true,');
          needsUpdate = true;
        }

        // 2. FORÇAR EXISTÊNCIA DO ARRAY DE IMPORTS
        if (!tsContent.match(/imports\s*:/)) {
          tsContent = tsContent.replace(/(@Component\(\s*\{[\s\S]*?)(?=\})/, '$1  imports: [],\n');
          needsUpdate = true;
        }

        if (ionicTags.length > 0) {
          // 3. Atualizar Import no Topo do Arquivo
          const importRegex = /import\s+{([^}]+)}\s+from\s+['"]@ionic\/angular\/standalone['"]/;
          const match = tsContent.match(importRegex);
          
          let currentImports = new Set<string>();
          if (match) {
            match[1].split(',').forEach(item => currentImports.add(item.trim()));
          }

          const missingImports = ionicTags.filter(tag => !currentImports.has(tag));

          if (missingImports.length > 0) {
            needsUpdate = true;
            if (match) {
              missingImports.forEach(tag => currentImports.add(tag));
              const newImportStr = `import { ${Array.from(currentImports).join(', ')} } from '@ionic/angular/standalone'`;
              tsContent = tsContent.replace(importRegex, newImportStr);
            } else {
              const newImportStr = `import { ${missingImports.join(', ')} } from '@ionic/angular/standalone';\n`;
              tsContent = newImportStr + tsContent;
            }
          }

          // 4. Injetar no array imports: [] do @Component
          // Iterar sobre TODOS os ionicTags detectados (não apenas os recém-importados)
          ionicTags.forEach(tag => {
            const componentDecoratorMatch = tsContent.match(/imports\s*:\s*\[([\s\S]*?)\]/);
            if (componentDecoratorMatch) {
              const currentArray = componentDecoratorMatch[1];
              if (!currentArray.includes(tag)) {
                const updatedArray = currentArray.trim().length > 0 ? `${currentArray}, ${tag}` : tag;
                tsContent = tsContent.replace(/imports\s*:\s*\[([\s\S]*?)\]/, `imports: [${updatedArray}]`);
                needsUpdate = true;
              }
            }
          });
        }

        if (needsUpdate) {
          fs.writeFileSync(fullPath, tsContent, 'utf8');
          console.log(`[CORRIGIDO] Estrutura/Imports adicionados em: ${file.name}`);
        }
      }
    }
  }
}

const targetDir = process.argv[2] || path.join(process.cwd(), 'src', 'app');
console.log(`Varrendo e corrigindo diretório: ${targetDir}`);
fixImports(targetDir);
console.log('✅ Verificação Standalone finalizada!');
