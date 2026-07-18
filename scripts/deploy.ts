import * as dotenv from 'dotenv';
import * as ftp from 'basic-ftp';
import { exec } from 'child_process';
import * as path from 'path';

dotenv.config();

async function buildProject(): Promise<void> {
  console.log('🚀 Iniciando o Build do Angular...');
  return new Promise((resolve, reject) => {
    exec('npm run build', (err, stdout, stderr) => {
      if (err) {
        console.error('❌ Erro no Build:', err);
        return reject(err);
      }
      console.log(stdout);
      console.log('✅ Build concluído com sucesso!');
      resolve();
    });
  });
}

async function deploy(): Promise<void> {
  const host = process.env['FTP_HOST'];
  const user = process.env['FTP_USER'];
  const password = process.env['FTP_PASS'];
  
  if (!host || !user || !password) {
    console.error('❌ Erro: Credenciais de FTP não encontradas no arquivo .env.');
    process.exit(1);
  }

  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    await buildProject();

    console.log(`🔌 Conectando ao FTP: ${host}...`);
    await client.access({
      host: host,
      user: user,
      password: password,
      secure: false
    });
    
    console.log('✅ Conectado com sucesso!');

    const date = new Date();
    const timestamp = date.getFullYear().toString() + 
                      (date.getMonth() + 1).toString().padStart(2, '0') + 
                      date.getDate().toString().padStart(2, '0') + '_' + 
                      date.getHours().toString().padStart(2, '0') + 
                      date.getMinutes().toString().padStart(2, '0') + 
                      date.getSeconds().toString().padStart(2, '0');
                      
    const backupFolderName = `public_html_bkp_${timestamp}`;

    console.log(`📦 Criando backup da versão atual para: ${backupFolderName}...`);
    
    try {
      await client.rename('public_html', backupFolderName);
      console.log(`✅ Backup criado com sucesso: ${backupFolderName}`);
    } catch (err) {
      console.log('⚠️ Aviso: Pasta public_html original não encontrada ou não pôde ser renomeada. Ignorando backup.');
    }

    console.log('📁 Criando nova pasta public_html...');
    await client.ensureDir('public_html');
    
    // Agora estamos DENTRO da pasta public_html
    const localDistPath = path.join(process.cwd(), 'dist/taxsmartfront/browser');
    
    console.log(`📤 Fazendo upload dos arquivos novos de ${localDistPath} para public_html...`);
    await client.uploadFromDir(localDistPath, '.');

    console.log('🎉 Deploy concluído com sucesso!');
  } catch (err) {
    console.error('❌ Erro fatal durante o deploy:', err);
  } finally {
    client.close();
  }
}

deploy();
