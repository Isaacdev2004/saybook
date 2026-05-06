/**
 * Cross-platform preinstall: remove competitor lockfiles and enforce pnpm.
 * Replaces Unix-only `sh -c '...'` which fails on Windows CMD/PowerShell.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname);

for (const name of ["package-lock.json", "yarn.lock"]) {
  const fp = path.join(root, name);
  try {
    fs.unlinkSync(fp);
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
}

const ua = process.env.npm_config_user_agent || "";
if (!ua.includes("pnpm")) {
  console.error("Use pnpm instead of npm/yarn for this workspace.");
  process.exit(1);
}
