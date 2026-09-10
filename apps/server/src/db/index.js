import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import * as schema from "./schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/task_management_db";

console.log("🔌 Connecting to DB:", connectionString.replace(/:[^:@]+@/, ":****@"));

export const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("neon.tech") || connectionString.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : false,
});

export const db = drizzle(pool, { schema });

