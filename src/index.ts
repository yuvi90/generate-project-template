#!/usr/bin/env node

const inquirer = require("inquirer");
const shell = require("shelljs");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");

import { render } from "./utils/template";

// types
interface TemplateConfig {
  files?: string[];
  postMessage?: string;
}

interface CliOptions {
  projectName: string;
  templateName: string;
  templatePath: string;
  targetPath: string;
  config: TemplateConfig;
}
const ROOT_DIR = path.resolve(path.join(__dirname, ".."));
const CURR_DIR = process.cwd();

main();

// Main Function
function main() {
  // Templates dir folder names as choices array
  const CHOICES: string[] = fs.readdirSync(path.join(ROOT_DIR, "templates"));

  // Questions Array
  const QUESTIONS = [
    {
      name: "projectChoice",
      type: "list",
      message: "What project template would you like to generate?",
      choices: CHOICES,
    },
    {
      name: "projectName",
      type: "input",
      message: "Enter the project's name:",
      validate: (input: string) => {
        if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
        else
          return "Project name may only include letters, numbers, underscores and hashes.";
      },
      default: "new-project",
    },
  ];

  inquirer
    .prompt(QUESTIONS)
    .then(
      ({
        projectChoice,
        projectName,
      }: {
        projectChoice: string;
        projectName: string;
      }) => {
        const templatePath = path.join(ROOT_DIR, "templates", projectChoice);
        const targetPath = path.join(CURR_DIR, projectName);
        const templateConfig = getTemplateConfig(templatePath);

        // Type of cli options
        const options: CliOptions = {
          projectName,
          templateName: projectChoice,
          templatePath,
          targetPath,
          config: templateConfig,
        };

        // Checks if project dir is created or not
        if (!createProject(targetPath)) {
          return;
        }

        // Writes files from template directory to target directory
        createDirectoryContents(templatePath, projectName, templateConfig);

        if (!postProcess(options)) {
          return;
        }

        showMessage(options);
      }
    );
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

// Create project dir
function createProject(projectPath: string) {
  if (fs.existsSync(projectPath)) {
    console.log(
      chalk.red(`Folder ${projectPath} exists. Delete or use another name.`)
    );
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

      // Dynamically add data to file via ejs
      contents = render(contents, { projectName });

      // Writing new file to target dir
      const writePath = path.join(CURR_DIR, projectName, file);
      fs.writeFileSync(writePath, contents, "utf8");
    } else if (stats.isDirectory()) {
      // if its dir than make dir recursively reads and writes
      fs.mkdirSync(path.join(CURR_DIR, projectName, file));

      // recursive call
      createDirectoryContents(
        path.join(templatePath, file),
        path.join(projectName, file),
        config
      );
    }
  });
}

// Checks and run if there is any post process
function postProcess(options: CliOptions) {
  if (isNode(options)) {
    return postProcessNode(options);
  }
  return true;
}

// Checks if there is package json file to run process
function isNode(options: CliOptions) {
  return fs.existsSync(path.join(options.templatePath, "package.json"));
}

// Run Process
function postProcessNode(options: CliOptions) {
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
      return false;
    }
  } else {
    console.log(chalk.red("No yarn or npm found. Cannot run installation."));
  }

  return true;
}

// Show post message if there is any
function showMessage(options: CliOptions) {
  console.log("");
  console.log(chalk.green("Done."));
  console.log(chalk.green(`Go into the project: cd ${options.projectName}`));

  const message = options.config.postMessage;

  if (message) {
    console.log("");
    console.log(chalk.yellow(message));
    console.log("");
  }
}
