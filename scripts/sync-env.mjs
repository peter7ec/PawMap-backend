import fs from 'fs/promises';
import path from 'path';

const rootDir = process.cwd();
const rootEnvPath = path.join(rootDir, '.env');

const packages = [
  {
    name: 'database',
    prefix: 'DATABASE_',
    path: path.join(rootDir, 'packages', 'database'),
  },
  {
    name: 'rest-api',
    prefix: 'REST_API_',
    path: path.join(rootDir, 'services', 'rest-api'),
  },
  {
    name: 'ws-api',
    prefix: 'WS_API_',
    path: path.join(rootDir, 'services', 'ws-api'),
  }
];

async function syncEnvFiles() {
  try {
    const rootEnvContent = await fs.readFile(rootEnvPath, 'utf-8');
    const lines = rootEnvContent.split('\n');

    for (const pkg of packages) {
      const pkgVars = lines
        .filter(line => line.trim() !== '' && !line.startsWith('#') && line.startsWith(pkg.prefix))
        .map(line => line.replace(pkg.prefix, '')) 
        .join('\n');

      if (!pkgVars) {
        console.warn(`⚠️  Can't find '${pkg.name}' package name for ('${pkg.prefix}' prefix).`);
        continue;
      }
      
      const targetEnvPath = path.join(pkg.path, '.env');
      
      await fs.mkdir(pkg.path, { recursive: true });

      await fs.writeFile(targetEnvPath, pkgVars.trim());
      console.log(`✅ Successfully created: ${path.relative(rootDir, targetEnvPath)}`);
    }

  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('❌ Error: Can not find main .env file!');
    } else {
      console.error('Error while sync .env files:', error);
    }
    process.exit(1);
  }
}

syncEnvFiles();
