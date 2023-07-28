export interface Choices {
  projectType: {
    Frontend: ["React", "Vue", "Vanilla"];
    Backend: ["Node", "Express", "Vanilla"];
    FullStack: ["MERN"];
    Others: ["React Native"];
  };
  jsVariant: ["Javascript", "Typescript"];
}

export interface Answers {
  projectName: string;
  projectDescription: string;
  projectType: "Frontend" | "Backend" | "FullStack" | "Others";
  projectFramework: "React" | "Vue" | "Vanilla";
  jsVariant: "Javascript" | "Typescript";
}

export const promptChoices: Choices = {
  projectType: {
    Frontend: ["React", "Vue", "Vanilla"],
    Backend: ["Node", "Express", "Vanilla"],
    FullStack: ["MERN"],
    Others: ["React Native"],
  },
  jsVariant: ["Javascript", "Typescript"],
};

// Questions Array
export const promptQuestions = [
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
  {
    name: "projectDescription",
    type: "input",
    message: "Enter the project's description:",
  },
  {
    name: "projectType",
    type: "list",
    message: "Select a type of project:",
    choices: Object.keys(promptChoices.projectType),
  },
  {
    name: "projectFramework",
    type: "list",
    message: "Select a framework for the project:",
    choices: (answers: Answers) => {
      return promptChoices.projectType[answers.projectType];
    },
  },
  {
    name: "jsVariant",
    type: "list",
    message: "Select a variant:",
    when: (answers: Answers) => answers.projectFramework != "Vanilla",
    choices: promptChoices.jsVariant,
  },
];

export interface TemplateConfig {
  files?: string[];
  postMessage?: string;
}

export interface CliOptions {
  userConfig: Answers;
  templateConfig: TemplateConfig;
  templatePath: string;
  targetPath: string;
}
