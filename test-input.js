import { execSync } from "child_process";

// Show Windows native input dialog
function promptWindows(message) {
  const command =
    `powershell -Command "Add-Type -AssemblyName Microsoft.VisualBasic; ` +
    `[Microsoft.VisualBasic.Interaction]::InputBox('${message}', 'Create Post')"`;

  return execSync(command).toString().trim();
}

// Collect user input
const title = promptWindows("Enter post title:");
console.log(`✅ You entered: "${title}"`);
