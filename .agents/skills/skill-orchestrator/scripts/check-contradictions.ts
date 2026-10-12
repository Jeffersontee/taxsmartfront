import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

// Carrega as variáveis do .env se existir
dotenv.config();

const projectRoot = process.cwd();
const envPath = path.join(projectRoot, 'src', 'environments', 'environment.ts');

const geminiKeys: string[] = [];
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
  geminiKeys.push(process.env.GEMINI_API_KEY.trim());
}
if (process.env.GEMINI_KEY && process.env.GEMINI_KEY.trim() && !geminiKeys.includes(process.env.GEMINI_KEY.trim())) {
  geminiKeys.push(process.env.GEMINI_KEY.trim());
}

let openaiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;

// Tenta carregar as chaves do environment.ts (mesmo que já exista chave no .env, para testar todas como candidatos)
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/gemini_api_key:\s*['"`](.*?)['"`]/);
    if (match && match[1] && match[1].trim()) {
      const keyFromEnvTs = match[1].trim();
      if (!geminiKeys.includes(keyFromEnvTs)) {
        geminiKeys.push(keyFromEnvTs);
      }
    }
  } catch (e) {
    console.warn("⚠️ Não foi possível ler o arquivo environment.ts automaticamente.");
  }
}

const skillsDir = path.join(projectRoot, '.agents', 'skills');

interface SkillContent {
  name: string;
  content: string;
}

function runLocalOfflineAudit(loadedSkills: SkillContent[]) {
  console.log("\n================ REPORT DE CONFORMIDADE SEMÂNTICA (AUDITORIA LOCAL HEURÍSTICA) ================\n");
  console.log("ℹ️ Executando varredura estática de conformidade offline nas skills...\n");

  const issues: string[] = [];

  const checks = [
    { pattern: /\*ngIf|\*ngFor/i, label: "Uso de diretivas legadas (*ngIf / *ngFor) detectado. Padrão exigido: Sintaxe nativa do Angular 18 (@if / @for)." },
    { pattern: /NgModule/i, label: "Referência a NgModule detectada. Padrão exigido: Standalone Components exclusivamente." },
    { pattern: /\[disabled\]/i, label: "Uso de atributo [disabled] detectado. Padrão exigido: Controle exclusivo via FormControl.enable() / .disable()." },
    { pattern: /Subscription/i, label: "Uso direto de Subscription reativa. Padrão exigido: Angular Signals (signal, computed, effect)." },
    { pattern: /constructor\s*\(/i, label: "Injeção de dependência via construtor. Padrão recomendado: inject(Service)." },
  ];

  loadedSkills.forEach(skill => {
    checks.forEach(check => {
      if (check.pattern.test(skill.content)) {
        issues.push(`• [${skill.name}]: ${check.label}`);
      }
    });
  });

  if (issues.length === 0) {
    console.log("✅ Nenhuma inconsistência estática primária foi encontrada no compilado de skills.");
  } else {
    console.log("⚠️ Possíveis desalinhamentos estáticos encontrados:");
    issues.forEach(issue => console.log(issue));
  }

  console.log("\n💡 Dica: Configure uma chave GEMINI_API_KEY ou OPENAI_API_KEY com saldo no .env para auditoria semântica por IA.");
  console.log("\n========================================================================================\n");
}

async function runCrossAudit() {
  console.log("🔍 Carregando bases de conhecimento para auditoria cruzada semântica...\n");

  if (!fs.existsSync(skillsDir)) {
    console.error("❌ Diretório de skills não encontrado.");
    process.exit(1);
  }

  const skillFolders = fs.readdirSync(skillsDir);
  const loadedSkills: SkillContent[] = [];

  skillFolders.forEach(folder => {
    const skillPath = path.join(skillsDir, folder);
    if (!fs.statSync(skillPath).isDirectory()) return;

    const skillMdPath = path.join(skillPath, 'SKILL.md');
    if (fs.existsSync(skillMdPath)) {
      const content = fs.readFileSync(skillMdPath, 'utf-8');
      loadedSkills.push({ name: folder, content });
    }
  });

  if (loadedSkills.length < 2) {
    console.log("⚠️ Poucas skills encontradas para realizar um cruzamento analítico.");
    process.exit(0);
  }

  const formattedPrompt = loadedSkills.map(s => `=== SKILL: ${s.name} ===\n${s.content}\n`).join('\n');
  const systemInstruction = `Você é um Engenheiro de Software Principal e Auditor de PromptOps da arquitetura do projeto.
Sua missão é analisar o compilado de diretivas Markdown fornecidas (Agent Skills) e buscar INCONSISTÊNCIAS, CONFLITOS DE REGRAS, REDUNDÂNCIAS ou brechas que causem alucinação cognitiva na IA do repositório.

Analise friamente e aponte em português:
1. Contradições Diretas: Onde a Skill A dita um padrão e a Skill B exige o oposto (Ex: Uma pede para usar *ngIf e outra exige @if).
2. Redundâncias Críticas: Regras idênticas duplicadas em arquivos diferentes que sobrecarregam os tokens de contexto.
3. Sugestão de Correção: Como unificar ou mesclar para blindar o framework.`;

  let aiSuccess = false;

  // 1. Tentar com Google Gemini (Testando todas as chaves encontradas e modelos em sequência)
  if (geminiKeys.length > 0) {
    const geminiModels = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'];

    for (const gKey of geminiKeys) {
      if (aiSuccess) break;
      const keySuffix = gKey.slice(-4);

      for (const model of geminiModels) {
        try {
          console.log(`🧠 [Gemini] Tentando auditoria com chave (...${keySuffix}) no modelo ${model}...`);
          const ai = new GoogleGenAI({ apiKey: gKey });
          const response = await ai.models.generateContent({
            model,
            config: { systemInstruction, temperature: 0.1 },
            contents: `Aqui estão as regras atuais da minha workspace:\n\n${formattedPrompt}`,
          });

          console.log(`\n================ REPORT DE CONFORMIDADE SEMÂNTICA (GEMINI - ${model}) ================\n`);
          console.log(response.text || "Nenhum conflito semântico aparente encontrado.");
          console.log("\n======================================================================================\n");
          aiSuccess = true;
          break;
        } catch (error: any) {
          const errorMsg = error?.message || String(error);
          console.warn(`⚠️ [Gemini ${model} | ...${keySuffix}] Falhou: ${errorMsg.slice(0, 150)}...`);
        }
      }
    }
  } else {
    console.log("ℹ️ Nenhuma GEMINI_API_KEY válida configurada no .env ou environment.ts. Pulando Gemini...");
  }

  // 2. Fallback para OpenAI caso a Gemini não tenha funcionado
  if (!aiSuccess && openaiKey && openaiKey.trim() !== '') {
    const openaiModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'];

    for (const model of openaiModels) {
      try {
        console.log(`🧠 [OpenAI] Tentando auditoria com o modelo ${model}...`);
        const openai = new OpenAI({ apiKey: openaiKey.trim() });

        const completion = await openai.chat.completions.create({
          model,
          temperature: 0.1,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: `Aqui estão as regras atuais da minha workspace:\n\n${formattedPrompt}` }
          ]
        });

        console.log(`\n================ REPORT DE CONFORMIDADE SEMÂNTICA (OPENAI - ${model}) ================\n`);
        console.log(completion.choices[0]?.message?.content || "Nenhum conflito semântico aparente encontrado.");
        console.log("\n======================================================================================\n");
        aiSuccess = true;
        break;
      } catch (error: any) {
        const errorMsg = error?.message || String(error);
        if (errorMsg.includes('insufficient_quota') || errorMsg.includes('credit_balance_exhausted')) {
          console.warn(`⚠️ [OpenAI ${model}] Saldo de cota esgotado na conta OpenAI.`);
        } else {
          console.warn(`⚠️ [OpenAI ${model}] Falhou: ${errorMsg.slice(0, 150)}...`);
        }
      }
    }
  }

  // 3. Fallback final: Auditoria Heurística Local (Offline) caso nenhuma IA responda
  if (!aiSuccess) {
    runLocalOfflineAudit(loadedSkills);
  }

  process.exit(0);
}

runCrossAudit();