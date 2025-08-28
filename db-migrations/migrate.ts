import fs from 'fs';
import path from 'path';
import { db } from '../lib/db';

/**
 * Database migration system
 * 
 * This system manages database migrations in the db-migrations directory.
 * It's designed to be simple and maintainable:
 * 1. Creates a migrations table if it doesn't exist
 * 2. Finds all migration files with the format NNN-name.ts
 * 3. Applies any migrations that haven't been applied yet
 * 4. Records applied migrations in the database
 */

// Table name for tracking migrations
const MIGRATIONS_TABLE = 'db_migrations';

// Ensure migrations table exists
function ensureMigrationsTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `).run();
}

// Get all migration files from the db-migrations/migrations directory
function getMigrationFiles(): string[] {
  const migrationsDir = path.join(__dirname, 'migrations');
  return fs.readdirSync(migrationsDir)
    .filter(file => 
      // Only include files matching the pattern "NNN-name.ts"
      /^\d+(-|[a-z]-)/.test(file) && 
      file.endsWith('.ts') && 
      !file.endsWith('.d.ts')
    )
    .sort();
}

// Main migration function
async function runMigrations() {
  console.log('Starting migrations...');
  ensureMigrationsTable();

  // Get all applied migrations
  const appliedMigrations = db.prepare(`SELECT id FROM ${MIGRATIONS_TABLE}`).all() as { id: string }[];
  const appliedIds = new Set(appliedMigrations.map(m => m.id));
  
  // Get all migration files
  const migrationFiles = getMigrationFiles();
  
  // Find migrations that haven't been applied yet
  const pendingMigrations = migrationFiles.filter(file => !appliedIds.has(file));
  
  if (pendingMigrations.length === 0) {
    console.log('No pending migrations to apply.');
    return;
  }
  
  console.log(`Applying ${pendingMigrations.length} migrations: ${pendingMigrations.join(', ')}`);
  
  // Apply each pending migration
  for (const file of pendingMigrations) {
    console.log(`Applying migration: ${file}`);
    
    try {
      const migrationPath = path.join('migrations', file);
      const migrationModule = await import(`./${migrationPath}`);
      
      // Look for migrate() function
      if (typeof migrationModule.migrate !== 'function') {
        console.warn(`Migration ${file} does not export a migrate function. Skipping.`);
        continue;
      }
      
      // Run the migration
      await migrationModule.migrate();
      
      // Record migration as applied
      db.prepare(
        `INSERT INTO ${MIGRATIONS_TABLE} (id, applied_at) VALUES (?, datetime('now'))`
      ).run(file);
      
      console.log(`Successfully applied migration: ${file}`);
    } catch (error) {
      console.error(`Error applying migration ${file}:`, error);
      process.exit(1);
    }
  }
  
  console.log('All migrations applied successfully!');
}

// Run the migrations
runMigrations().catch(error => {
  console.error('Migration process failed:', error);
  process.exit(1);
});
