#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, resolve, relative } from "path";
import { execSync } from "child_process";

const ROOT = resolve(process.cwd());
const MODULES_DIR = join(ROOT, "modules");
const WEB_MODULES_DIR = join(ROOT, "apps/web/modules");

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function loadConfig() {
  const configPath = join(ROOT, "apps/web/config/modules.json");
  if (!existsSync(configPath)) {
    const config = { enabled: [], disabled: [], devModules: [] };
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    return config;
  }
  return JSON.parse(readFileSync(configPath, "utf-8"));
}

function getAllModuleDirs() {
  if (!existsSync(MODULES_DIR)) return [];
  const { readdirSync, statSync } = await import("fs");
  return readdirSync(MODULES_DIR).filter((name) => {
    const full = join(MODULES_DIR, name);
    return statSync(full).isDirectory() && existsSync(join(full, "package.json"));
  });
}

async function main() {
  const config = loadConfig();
  ensureDir(WEB_MODULES_DIR);

  const moduleDirs = getAllModuleDirs();

  for (const dir of moduleDirs) {
    const pkgPath = join(MODULES_DIR, dir, "package.json");
    if (!existsSync(pkgPath)) continue;

    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    const moduleName = pkg.name || dir;
    const linkTarget = join(WEB_MODULES_DIR, moduleName);
    const source = join(MODULES_DIR, dir);

    try {
      execSync(`ln -sf "${source}" "${linkTarget}"`, { stdio: "pipe" });
      console.log(`✓ Linked ${moduleName}`);
    } catch (error) {
      console.warn(`⚠ Could not link ${moduleName}: ${error.message}`);
    }
  }

  const linkCount = config.devModules?.length || moduleDirs.length;
  console.log(`\nLinked ${linkCount} module(s) to ${relative(ROOT, WEB_MODULES_DIR)}/`);
}

main().catch(console.error);
