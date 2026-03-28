import { execSync } from "node:child_process";
import { readdirSync, renameSync } from "node:fs";
import path from "node:path";

function getMigrationDirs(migrationsDir) {
  return new Set(
    readdirSync(migrationsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  );
}

const migrationName = process.argv[2];

if (!migrationName) {
  console.error("Usage: npm run prisma:migrate:new -- <migration-name>");
  process.exit(1);
}

const projectRoot = process.cwd();
const migrationsDir = path.join(projectRoot, "prisma", "migrations");
const before = getMigrationDirs(migrationsDir);

execSync(`npx prisma migrate dev --create-only --name ${migrationName}`, {
  stdio: "inherit",
});

const after = getMigrationDirs(migrationsDir);
const created = [...after].filter((dir) => !before.has(dir));

if (created.length !== 1) {
  console.warn("Could not detect exactly one newly created migration folder.");
  console.warn("Please rename the new folder manually to start with 'zzzz_'.");
  process.exit(0);
}

const createdDir = created[0];

if (!/^\d{14}_/.test(createdDir)) {
  console.log(`New migration '${createdDir}' is already non-timestamped.`);
  process.exit(0);
}

const renamedDir = `zzzz_${createdDir}`;
const fromPath = path.join(migrationsDir, createdDir);
const toPath = path.join(migrationsDir, renamedDir);

renameSync(fromPath, toPath);
console.log(`Renamed migration folder to '${renamedDir}'.`);
console.log("Next step: run 'npx prisma migrate dev' to apply it.");
