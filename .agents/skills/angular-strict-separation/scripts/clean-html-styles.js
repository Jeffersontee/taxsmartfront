const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function processHtmlFile(filePath) {
    if (!filePath.endsWith('.html')) return;
    
    let content = fs.readFileSync(filePath, 'utf-8');
    if (!content.includes('style=')) return; // Fast exit se não houver styles

    let modified = false;
    let cssRules = new Map();

    // Regex para encontrar tags HTML inteiras (suporta `>` dentro de aspas duplas/simples, muito comum em Angular *ngIf="a > b")
    const tagRegex = /<[a-zA-Z0-9\-]+(?:[^>"']|"[^"]*"|'[^']*')*>/g;
    
    content = content.replace(tagRegex, (tag) => {
        if (!/\bstyle\s*=\s*(["']).*?\1/.test(tag)) return tag;

        let stylesToAdd = [];
        
        // Remove style="..." e extrai o conteudo
        let newTag = tag.replace(/\bstyle\s*=\s*(["'])(.*?)\1/g, (match, quote, styleContent) => {
            styleContent = styleContent.trim();
            if (!styleContent) return ''; // style vazio

            let hash = crypto.createHash('md5').update(styleContent).digest('hex').substring(0, 6);
            let className = `ds-style-${hash}`;
            
            cssRules.set(className, styleContent);
            stylesToAdd.push(className);
            return ''; // Remove o atributo style
        });

        if (stylesToAdd.length > 0) {
            // Se já tem um atributo class
            if (/\bclass\s*=\s*["']/.test(newTag)) {
                newTag = newTag.replace(/\bclass\s*=\s*(["'])(.*?)\1/, (match, quote, classContent) => {
                    return `class=${quote}${classContent ? classContent + ' ' : ''}${stylesToAdd.join(' ')}${quote}`;
                });
            } else {
                // Insere antes do fechamento da tag > ou />
                // Garante um espaço antes do class
                newTag = newTag.replace(/(\s*\/?>)$/, ` class="${stylesToAdd.join(' ')}"$1`);
            }
        }
        
        // Limpa espaços duplos criados pela remoção
        newTag = newTag.replace(/\s{2,}/g, ' ');
        modified = true;
        return newTag;
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`[HTML Limpo] ${path.basename(filePath)}`);

        // Descobre o arquivo SCSS correspondente
        const dirName = path.dirname(filePath);
        const baseName = path.basename(filePath, '.html');
        const scssFile = path.join(dirName, `${baseName}.scss`);
        
        let scssAppend = `\n\n/* Estilos extraídos automaticamente do HTML */\n`;
        cssRules.forEach((styleContent, className) => {
            // garante que tem o ponto e vírgula no final da regra
            if (!styleContent.endsWith(';')) styleContent += ';';
            scssAppend += `.${className} { ${styleContent} }\n`;
        });

        if (fs.existsSync(scssFile)) {
            fs.appendFileSync(scssFile, scssAppend, 'utf-8');
        } else {
            fs.writeFileSync(scssFile, scssAppend, 'utf-8');
        }
        console.log(`[SCSS Atualizado] ${path.basename(scssFile)} recebendo ${cssRules.size} nova(s) classe(s).`);
    }
}

const targetDir = path.join(__dirname, '../../../../src/app/pages');
console.log('Iniciando varredura e extração de styles em:', path.resolve(targetDir));

let filesProcessed = 0;
walkDir(targetDir, (filePath) => {
    if (filePath.endsWith('.html')) {
        processHtmlFile(filePath);
        filesProcessed++;
    }
});

console.log(`\nLimpeza concluída. ${filesProcessed} arquivos HTML analisados.`);
