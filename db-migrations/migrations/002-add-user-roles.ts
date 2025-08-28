import { db } from "../../lib/db";

export async function migrate() {
  // Check if the role column already exists
  const tableInfo = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
  const hasRoleColumn = tableInfo.some(column => column.name === "role");
  
  if (!hasRoleColumn) {
    // Add role column to users table with default 'untrusted' role
    db.prepare("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'untrusted'").run();
    
    // Update the admin user to have admin role
    if (process.env.ADMIN_ID) {
      db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(process.env.ADMIN_ID);
    }
    
    console.log("Added role column to users table");
  } else {
    console.log("Role column already exists in users table");
  }
}

export async function rollback() {
  // Since SQLite doesn't support dropping columns directly,
  // we would need to recreate the table without the column.
  // For safety, we'll make this a no-op
  console.log("Rollback not implemented for this migration (SQLite limitations)");
}

// Execute migration when run directly
if (require.main === module) {
  migrate().catch(console.error);
}
