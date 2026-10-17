import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {hashPassword} from './passwords.mjs';

export function openStore(dbPath, users) {
  const db = new DatabaseSync(dbPath, {timeout: 2000});
  try {
    db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY) STRICT;');
    for (const [version, name] of [[1, '001-core.sql'], [2, '002-sessions.sql']]) {
      if (db.prepare('SELECT version FROM schema_migrations WHERE version=?').get(version)) continue;
      db.exec('BEGIN IMMEDIATE');
      try {
        db.exec(readFileSync(new URL('../migrations/' + name, import.meta.url), 'utf8'));
        db.prepare('INSERT INTO schema_migrations(version) VALUES (?)').run(version);
        db.exec('COMMIT');
      } catch (error) { db.exec('ROLLBACK'); throw error; }
    }
    for (const [id, password] of Object.entries(users)) {
      if (!db.prepare('SELECT id FROM users WHERE id=?').get(id)) db.prepare('INSERT INTO users VALUES (?,?)').run(id, hashPassword(password));
    }
  } catch (error) { db.close(); throw error; }
  let closed = false;
  return {
    db,
    // One operation, one real SQLite transaction; an insert failure undoes earlier writes.
    transaction(work) { db.exec('BEGIN IMMEDIATE'); try { const result = work(); db.exec('COMMIT'); return result; } catch (error) { db.exec('ROLLBACK'); throw error; } },
    close() { if (!closed) { db.close(); closed = true; } },
  };
}
