const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function readArgument(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const profile = readArgument("profile");
const region = readArgument("region");
const appId = readArgument("app-id");
const branch = readArgument("branch", "master");
const output = path.resolve(readArgument("output", ".env.local"));

if (!profile || !region || !appId) {
  console.error("Required: --profile, --region, and --app-id");
  process.exit(1);
}

if (fs.existsSync(output)) {
  console.error(`Refusing to overwrite existing file: ${output}`);
  process.exit(1);
}

function runAws(args) {
  const raw = execFileSync(
    "aws",
    [...args, "--profile", profile, "--region", region, "--output", "json"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], windowsHide: true }
  );
  return JSON.parse(raw);
}

const app = runAws(["amplify", "get-app", "--app-id", appId]);
const branchResult = runAws([
  "amplify",
  "get-branch",
  "--app-id",
  appId,
  "--branch-name",
  branch,
]);

const variables = {
  ...(app.app?.environmentVariables || {}),
  ...(branchResult.branch?.environmentVariables || {}),
};

const entries = Object.entries(variables)
  .filter(([key]) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(key))
  .sort(([left], [right]) => left.localeCompare(right));

const contents = [
  "# Generated from AWS Amplify. Do not commit this file.",
  `# App: ${app.app?.name || appId}; branch: ${branch}`,
  ...entries.map(([key, value]) => `${key}=${JSON.stringify(String(value))}`),
  "",
].join("\n");

fs.writeFileSync(output, contents, { encoding: "utf8", flag: "wx", mode: 0o600 });
console.log(`Exported ${entries.length} variables to ${path.basename(output)}.`);
