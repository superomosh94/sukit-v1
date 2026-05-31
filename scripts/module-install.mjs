#!/usr/bin/env node

import { execSync } from "child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join, resolve } from "path";

const MODULES_DIR = resolve(process.cwd(), "modules");
const WEB_MODULES_DIR = resolve(process.cwd(), "apps/web/modules");

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function loadModulesConfig() {
  const configPath = resolve(process.cwd(), "apps/web/config/modules.json");
  if (!existsSync(configPath)) {
    const defaultConfig = { enabled: [], disabled: [], devModules: [] };
    writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }
  return JSON.parse(readFileSync(configPath, "utf-8"));
}

async function installModule(moduleId, version = "latest") {
  console.log(`Installing ${moduleId}@${version}...`);

  const targetDir = join(MODULES_DIR, moduleId.replace("@", "").replace("/", "-"));
  ensureDir(targetDir);

  try {
    execSync(`npm pack ${moduleId}@${version} --pack-destination ${targetDir}`, {
      stdio: "inherit",
      cwd: MODULES_DIR,
    });
    console.log(`✓ ${moduleId} installed`);
  } catch (error) {
    console.error(`✗ Failed to install ${moduleId}:`, error.message);
    process.exit(1);
  }
}

async function linkDevModules() {
  const config = loadModulesConfig();
  ensureDir(WEB_MODULES_DIR);

  for (const devMod of config.devModules) {
    const sourcePath = resolve(process.cwd(), devMod.path);
    const linkPath = join(WEB_MODULES_DIR, devMod.id);

    if (!existsSync(sourcePath)) {
      console.warn(`⚠ Dev module path not found: ${sourcePath}`);
      continue;
    }

    try {
      execSync(`ln -sf "${sourcePath}" "${linkPath}"`);
      console.log(`✓ Linked ${devMod.id} → ${linkPath}`);
    } catch (error) {
      console.error(`✗ Failed to link ${devMod.id}:`, error.message);
    }
  }
}

const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case "install":
    installModule(args[0], args[1]);
    break;
  case "link":
    linkDevModules();
    break;
  default:
    console.log(`
Usage:
  node scripts/module-install.mjs install <module-id> [version]
  node scripts/module-install.mjs link
`);
}
