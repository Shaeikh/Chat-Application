import { Database } from "bun:sqlite";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const dbPath = path.join(process.cwd(), "database.sqlite");

const db = new Database(dbPath);

db.run("PRAGMA journal_mode = WAL");

db.run(
  `
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    room TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('normal', 'system')),
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) 
);
CREATE INDEX IF NOT EXISTS messages_room_id_idx
    ON messages(room, id)
`,
);

export default db;
