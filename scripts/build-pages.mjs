import { spawnSync } from "node:child_process";
import { cpSync, rmSync, writeFileSync } from "node:fs";

process.env.GITHUB_PAGES = "true";

const build = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  env: process.env,
  shell: true,
});

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

rmSync("docs", { recursive: true, force: true });
cpSync("out", "docs", { recursive: true });
writeFileSync("docs/.nojekyll", "");
console.log("copied out/ -> docs/ for GitHub Pages");
