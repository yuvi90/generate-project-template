#!/usr/bin/env node

import inquirer from "inquirer";
import shell from "shelljs";
import ora from "ora";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import {
  promptQuestions,
  Answers,
  CliOptions,
  TemplateConfig,
} from "./utils/cliQuestions.js";
import { TemplateData, render } from "./utils/template.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const spinner = ora("Loading files");
const rootDir = path.resolve(path.join(__dirname, ".."));
const currentDir = process.cwd();

main();

/*
  Functions Declarations
*/

// Entry Point
function main() {
  // Initiate Prompt
  inquirer.prompt(promptQuestions).then((answers: Answers) => {
    spinner.start();
    const { projectName, projectType, projectFramework, jsVariant } = answers;
    const templatePath: string = path.join(
      rootDir,
      "templates",
      projectType.toLowerCase(),
      projectFramework.toLowerCase(),
      jsVariant.toLowerCase()
    );

    // Getting custom template config if exited
    const templateConfig = getTemplateConfig(templatePath);

    // Check if project dir is created or not
    const targetPath = path.join(currentDir, projectName);
    if (!createProject(targetPath)) {
      spinner.fail(`Folder already exists. Delete or use another name.`);
      return;
    }

    // CLI Options
    const cliOptions: CliOptions = {
      userConfig: answers,
      templateConfig: templateConfig,
      templatePath,
      targetPath,
    };
    // Writes files from template directory to target directory
    createDirectoryContents(
      templatePath,
      projectName,
      cliOptions.userConfig.projectDescription,
      templateConfig
    );

    //TODO: Install npm packages on receiving argv

    spinner.succeed(
      `Done installing files.\n\nNow Run:\n\ncd ${cliOptions.userConfig.projectName}\nnpm install`
    );
  });
}

// Get custom config details
function getTemplateConfig(templatePath: string): TemplateConfig {
  const configPath = path.join(templatePath, ".template.json");

  if (!fs.existsSync(configPath)) return {};

  const templateConfigContent = fs.readFileSync(configPath);
  if (templateConfigContent) {
    return JSON.parse(templateConfigContent.toString());
  }

  return {};
}

// Checks and create project dir
function createProject(projectPath: string) {
  if (fs.existsSync(projectPath)) {
    return false;
  }
  fs.mkdirSync(projectPath);
  return true;
}

// Files to skip if existed while writing to target dir
const SKIP_FILES = ["node_modules", ".template.json"];

// Write template files to target path
function createDirectoryContents(
  templatePath: string,
  projectName: string,
  projectDescription: string,
  config: TemplateConfig
) {
  const filesToCreate: string[] = fs.readdirSync(templatePath);
  filesToCreate.forEach((file) => {
    const origFilePath = path.join(templatePath, file);

    // get stats about the current file
    const stats = fs.statSync(origFilePath);

    // Skip file if its in one of the skipped files array
    if (SKIP_FILES.indexOf(file) > -1) return;

    if (stats.isFile()) {
      // Read buffer
      let contents = fs.readFileSync(origFilePath, "utf8");

      const data: TemplateData = {
        projectName,
        projectDescription,
      };
      // Dynamically add data to file via ejs
      contents = render(contents, data);

      // Writing new file to target dir
      const writePath = path.join(currentDir, projectName, file);
      fs.writeFileSync(writePath, contents, "utf8");
    } else if (stats.isDirectory()) {
      // if its dir than make dir recursively reads and writes
      fs.mkdirSync(path.join(currentDir, projectName, file));

      // recursive call
      createDirectoryContents(
        path.join(templatePath, file),
        path.join(projectName, file),
        projectName,
        config
      );
    }
  });
}

// Checks if package.json file exists to install packages
function isNode(options: CliOptions) {
  return fs.existsSync(path.join(options.templatePath, "package.json"));
}

// Run npm or yarn to install packages
function installNpmPkgs(options: CliOptions) {
  if (!isNode(options)) {
    spinner.fail("Missing package.json file.");
    return false;
  }

  shell.cd(options.targetPath);
  let cmd = "";

  if (shell.which("yarn")) {
    cmd = "yarn";
  } else if (shell.which("npm")) {
    cmd = "npm install";
  }

  if (cmd) {
    const result = shell.exec(cmd);
    if (result.code !== 0) {
      spinner.fail("No yarn or npm found. Cannot run installation.");
      return false;
    }
  }
  return true;
}
