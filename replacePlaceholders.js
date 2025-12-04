#!/usr/bin/env node

/**
 * ZURI - Script de Substituição de Placeholders
 * 
 * Este script substitui todos os placeholders no projeto pelos valores reais.
 * Execute após clonar o repositório e antes de iniciar o desenvolvimento.
 * 
 * Uso: node replacePlaceholders.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Placeholders e seus valores
const placeholders = {
  'SUPPORT_EMAIL_PLACEHOLDER': '',
  'APP_URL_PLACEHOLDER': '',
  'SUPABASE_URL_PLACEHOLDER': '',
  'SUPABASE_ANON_KEY_PLACEHOLDER': '',
  'SUPABASE_SERVICE_ROLE_KEY_PLACEHOLDER': '',
  'OPENAI_KEY_PLACEHOLDER': '',
  'STRIPE_SECRET_KEY_PLACEHOLDER': '',
  'STRIPE_WEBHOOK_SECRET_PLACEHOLDER': '',
  'FIREBASE_SERVICE_ACCOUNT_JSON_PLACEHOLDER': '',
  'APNS_KEY_BASE64_PLACEHOLDER': '',
  'TWILIO_PLACEHOLDER': ''
};

// Perguntas para o usuário
const questions = {
  'SUPPORT_EMAIL_PLACEHOLDER': 'Email de suporte (ex: suporte@seuapp.com): ',
  'APP_URL_PLACEHOLDER': 'URL do app (ex: https://seuapp.com): ',
  'SUPABASE_URL_PLACEHOLDER': 'Supabase URL (ex: https://xxx.supabase.co): ',
  'SUPABASE_ANON_KEY_PLACEHOLDER': 'Supabase Anon Key: ',
  'SUPABASE_SERVICE_ROLE_KEY_PLACEHOLDER': 'Supabase Service Role Key (CUIDADO - server-side only!): ',
  'OPENAI_KEY_PLACEHOLDER': 'OpenAI API Key: ',
  'STRIPE_SECRET_KEY_PLACEHOLDER': 'Stripe Secret Key: ',
  'STRIPE_WEBHOOK_SECRET_PLACEHOLDER': 'Stripe Webhook Secret: ',
  'FIREBASE_SERVICE_ACCOUNT_JSON_PLACEHOLDER': 'Firebase Service Account JSON (caminho do arquivo ou deixe vazio): ',
  'APNS_KEY_BASE64_PLACEHOLDER': 'APNs Key Base64 (ou deixe vazio): ',
  'TWILIO_PLACEHOLDER': 'Twilio SID:TOKEN (ou deixe vazio): '
};

// Arquivos e pastas a ignorar
const ignorePaths = [
  'node_modules',
  '.git',
  'build',
  'dist',
  '.next',
  'android/app/build',
  'ios/Pods',
  '.dart_tool'
];

// Extensões de arquivo para processar
const validExtensions = [
  '.ts', '.tsx', '.js', '.jsx', '.json', '.yaml', '.yml',
  '.dart', '.md', '.html', '.env', '.example', '.sh',
  '.gradle', '.xml', '.plist', '.swift', '.kt'
];

function shouldProcessFile(filePath) {
  // Ignora pastas específicas
  if (ignorePaths.some(ignore => filePath.includes(ignore))) {
    return false;
  }
  
  // Verifica extensão
  const ext = path.extname(filePath);
  return validExtensions.includes(ext) || path.basename(filePath).startsWith('.env');
}

function replaceInFile(filePath, replacements) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    for (const [placeholder, value] of Object.entries(replacements)) {
      if (content.includes(placeholder)) {
        content = content.replace(new RegExp(placeholder, 'g'), value);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Atualizado: ${filePath}`);
    }
  } catch (err) {
    console.error(`❌ Erro ao processar ${filePath}:`, err.message);
  }
}

function walkDirectory(dir, callback) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDirectory(filePath, callback);
    } else if (stat.isFile() && shouldProcessFile(filePath)) {
      callback(filePath);
    }
  });
}

async function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('🚀 ZURI - Configuração de Placeholders\n');
  console.log('Este script irá substituir todos os placeholders no projeto.');
  console.log('Pressione ENTER para pular campos opcionais.\n');
  
  // Coleta valores do usuário
  for (const [placeholder, question] of Object.entries(questions)) {
    const answer = await askQuestion(question);
    placeholders[placeholder] = answer || placeholder; // Mantém placeholder se vazio
  }
  
  rl.close();
  
  console.log('\n📝 Processando arquivos...\n');
  
  // Processa todos os arquivos
  const rootDir = process.cwd();
  let filesProcessed = 0;
  
  walkDirectory(rootDir, (filePath) => {
    replaceInFile(filePath, placeholders);
    filesProcessed++;
  });
  
  console.log(`\n✅ Concluído! ${filesProcessed} arquivos processados.`);
  console.log('\n⚠️  IMPORTANTE:');
  console.log('1. Revise os arquivos .env gerados');
  console.log('2. NUNCA commite chaves privadas no Git');
  console.log('3. Configure .gitignore para proteger credenciais');
  console.log('\n🎉 Próximos passos:');
  console.log('   npm install');
  console.log('   cd web && npm run dev');
  console.log('   cd mobile && flutter run\n');
}

main().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
