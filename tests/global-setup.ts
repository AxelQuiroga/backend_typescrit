import { execSync } from 'child_process';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Cargar .env del proyecto
config({ path: join(__dirname, '..', '.env') });

// Derivar URL de test desde DATABASE_URL si no hay DATABASE_TEST_URL
const baseUrl = process.env.DATABASE_TEST_URL || process.env.DATABASE_URL;
if (!baseUrl) {
  throw new Error('DATABASE_URL no definida. Creá un .env con tu conexión PostgreSQL.');
}

// Reemplazar nombre de base de datos por redsocial_test
const testUrl = baseUrl.replace(/\/[^/]*$/, '/redsocial_test');
process.env.DATABASE_URL = testUrl;
process.env.DATABASE_TEST_URL = testUrl;

console.log(`[Global Setup] DATABASE_URL=${testUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')}`);

// Ejecutar migraciones en la DB de test
export default function setup() {
  execSync('npx prisma migrate reset --force', {
    env: process.env,
    stdio: 'inherit',
    cwd: join(__dirname, '..'),
  });
}
