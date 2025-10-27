import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Building project for production...');

try {
  // Сборка клиента
  console.log('📦 Building client...');
  execSync('cd client && npm run build', { stdio: 'inherit' });

  // Создаем папку для продакшена
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }

  // Копируем собранный клиент
  console.log('📁 Copying client build...');
  if (fs.existsSync('client/build')) {
    // Создаем функцию для копирования папок
    const copyFolderRecursive = function(source, target) {
      if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
      }
      
      const files = fs.readdirSync(source);
      
      files.forEach(file => {
        const sourcePath = path.join(source, file);
        const targetPath = path.join(target, file);
        
        if (fs.lstatSync(sourcePath).isDirectory()) {
          copyFolderRecursive(sourcePath, targetPath);
        } else {
          fs.copyFileSync(sourcePath, targetPath);
        }
      });
    };
    
    copyFolderRecursive('client/build', 'dist');
  }

  // Копируем серверные файлы
  console.log('📁 Copying server files...');
  const serverFiles = [
    'server/src',
    'server/data',
    'server/prisma',
    'server/.env',
    'server/package.json',
    'server/package-lock.json'
  ];

  serverFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const dest = `dist/${path.basename(file)}`;
      if (fs.lstatSync(file).isDirectory()) {
        // Используем нашу функцию для копирования папок
        copyFolderRecursive(file, dest);
      } else {
        fs.copyFileSync(file, dest);
      }
    }
  });

  // Копируем основной index.js сервера
  if (fs.existsSync('server/index.js')) {
    fs.copyFileSync('server/index.js', 'dist/server/index.js');
  }

  // Создаем основной package.json для продакшена
  const packageJson = {
    name: "teacher-job-portal-production",
    version: "1.0.0",
    type: "module",
    scripts: {
      start: "node server/index.js",
      "install-deps": "cd server && npm install"
    },
    dependencies: {
      "express": "^4.18.2",
      "cors": "^2.8.5",
      "apollo-server-express": "^3.12.1",
      "xlsx": "^0.18.5"
    }
  };

  fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));

  // Создаем .env файл для продакшена если его нет
  if (!fs.existsSync('dist/.env')) {
    const envContent = `NODE_ENV=production
PORT=5000
DATABASE_URL="file:./dev.db"
CORS_ORIGIN=https://your-domain.ru
`;
    fs.writeFileSync('dist/.env', envContent);
  }

  console.log('✅ Build completed!');
  console.log('📁 Production files are in ./dist/');
  
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}