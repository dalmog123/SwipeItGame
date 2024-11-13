const fs = require("fs");
const path = require("path");

const versionFile = path.join(__dirname, "../src/config/version.js");

// Read current version from JS file
const fileContent = fs.readFileSync(versionFile, "utf8");
const currentVersion = fileContent.match(/["'](.+)["']/)[1];
const [major, minor, patch] = currentVersion.split(".").map(Number);

// Get update type from command line argument
const updateType = process.argv[2] || "patch";

let newVersion;
switch (updateType) {
  case "major":
    newVersion = `${major + 1}.0.0`;
    break;
  case "minor":
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case "patch":
  default:
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

// Update version file
const newContent = `export const version = "${newVersion}";\n`;
fs.writeFileSync(versionFile, newContent);

console.log(`Version updated from ${currentVersion} to ${newVersion}`);
