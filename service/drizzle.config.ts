import { defineConfig } from "drizzle-kit"

const isTurso = !!process.env.TURSO_DATABASE_URL && !process.env.TURSO_DATABASE_URL.startsWith("file:")

export default defineConfig({
    schema: "./lib/db/schema.ts",
    out: "./drizzle",
    dialect: isTurso ? "turso" : "sqlite",
    dbCredentials: isTurso
        ? {
              url: process.env.TURSO_DATABASE_URL!,
              authToken: process.env.TURSO_AUTH_TOKEN!,
          }
        : {
              url: "file:local.db",
          },
})
