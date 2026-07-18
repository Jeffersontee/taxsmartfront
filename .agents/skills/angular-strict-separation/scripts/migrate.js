const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function migrateComponent(filePath) {
    if (!filePath.endsWith('.ts') || filePath.endsWith('.spec.ts')) return;
    
    let content = fs.readFileSync(filePath, 'utf-8');
    if (!content.includes('@Component')) return;

    let modified = false;
    let baseName = path.basename(filePath, '.ts'); // e.g. foo.component
    let dirName = path.dirname(filePath);

    // Replace template: `...`
    const templateRegex = /template\s*:\s*(`[\s\S]*?`|'[\s\S]*?'|"[\s\S]*?")/g;
    content = content.replace(templateRegex, (match, templateContent) => {
        let htmlContent = templateContent.substring(1, templateContent.length - 1);
        let htmlFile = `${baseName}.html`;
        fs.writeFileSync(path.join(dirName, htmlFile), htmlContent.trim() + '\n');
        modified = true;
        console.log(`[Extracted] Template for ${baseName} -> ${htmlFile}`);
        return `templateUrl: './${htmlFile}'`;
    });

    // Replace styles: [`...`]
    const stylesArrayRegex = /styles\s*:\s*\[\s*(`[\s\S]*?`|'[\s\S]*?'|"[\s\S]*?")\s*\]/g;
    content = content.replace(stylesArrayRegex, (match, styleContent) => {
        let scssContent = styleContent.substring(1, styleContent.length - 1);
        let scssFile = `${baseName}.scss`;
        fs.writeFileSync(path.join(dirName, scssFile), scssContent.trim() + '\n');
        modified = true;
        console.log(`[Extracted] Styles for ${baseName} -> ${scssFile}`);
        return `styleUrls: ['./${scssFile}']`;
    });

    // Replace styles: `...` (se alguém usou sem array)
    const stylesSingleRegex = /styles\s*:\s*(`[\s\S]*?`|'[\s\S]*?'|"[\s\S]*?")/g;
    content = content.replace(stylesSingleRegex, (match, styleContent) => {
        let scssContent = styleContent.substring(1, styleContent.length - 1);
        let scssFile = `${baseName}.scss`;
        fs.writeFileSync(path.join(dirName, scssFile), scssContent.trim() + '\n');
        modified = true;
        console.log(`[Extracted] Styles for ${baseName} -> ${scssFile}`);
        return `styleUrls: ['./${scssFile}']`;
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
    }
}

const targetDir = path.join(__dirname, '../../../../src/app');
console.log('Iniciando varredura em:', path.resolve(targetDir));

let filesProcessed = 0;
walkDir(targetDir, (filePath) => {
    if (filePath.endsWith('.ts')) {
        migrateComponent(filePath);
        filesProcessed++;
    }
});

console.log(`Migração concluída. ${filesProcessed} componentes TypeScript analisados.`);
