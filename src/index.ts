#!/usr/bin/env node
import { confirm, outro, select, text } from "@clack/prompts";
import { exit, exitOnCancel, isValidDirectoryName, overrideIfArgumentTrue, skipIfArgumentPassed, trimInput } from "./utils.js";
import { fileURLToPath } from "url";
import pc from "picocolors";
import mri from "mri";
import fs from "fs";
import path from "path";

const args = mri(process.argv.slice(2), {
    boolean: ["help", "force"],
    string: ["dir", "type"],
    alias: { "help": "help", "force": "force", "dir": "dir", "type": "type" },
    unknown(flag) {
        console.log(`Unknown argument: ${flag}.`);
        process.exit(1);
    }
});

if ("help" in args) {
    console.log(
        `Usage: create-lyder [ARGUMENTS...]

--dir <dir>     The name of the directory to use (use '.' for the current directory)
--force         Ignore the selected directory already containing files.
--type {ts|js}  The project type to create.`
    );
    process.exit(0);
}

const directory = await skipIfArgumentPassed(args, "dir", () => text({
    message: "Where do you want to create the project?",
    placeholder: "(current directory)",
    defaultValue: ".",
    validate(value) {
        if (!isValidDirectoryName(value)) {
            return "Invalid directory name.";
        }
    },
})).then(exitOnCancel).then(trimInput);

const dirExists = fs.existsSync(directory);

if (dirExists) {
    const entries = fs.readdirSync(directory);
    const isDirectoryEmpty = entries.length === 0 || (entries.length === 1 && entries[0] === ".git");

    if (!isDirectoryEmpty) {
        const ignore = await overrideIfArgumentTrue(args, "force", () => confirm({ message: "Chosen directory is not empty. Continue anyways?" }));
        if (!ignore) {
            exit();
        }
    }
}

const projectType = await skipIfArgumentPassed(args, "type", () => select({
    message: 'Pick a project type.',
    options: [
        { value: 'ts', label: pc.blue('TypeScript') },
        { value: 'js', label: pc.yellow('JavaScript') }
    ],
})).then(exitOnCancel);

if (!dirExists) {
    fs.mkdirSync(directory);
}

let packageName = directory;

if (directory === ".") {
    packageName = path.basename(path.resolve());
}

function copyEntry(entry: fs.Dirent, dir: string = "") {
    const entryPath = path.join(entry.parentPath, entry.name);

    if (entry.isFile()) {
        let content = fs.readFileSync(entryPath, { encoding: "utf-8" });
        content = content.replaceAll("$<PACKAGE-NAME>", packageName);
        if (!fs.existsSync(path.join(directory, dir))) {
            fs.mkdirSync(path.join(directory, dir), { recursive: true });
        }
        fs.writeFileSync(path.join(directory, dir, entry.name), content, { encoding: "utf-8" });
    }
    else if (entry.isDirectory()) {
        const entries = fs.readdirSync(path.join(templatePath, entry.name), { withFileTypes: true });
        const newDir = path.join(dir, entry.name);
        entries.forEach(entry => copyEntry(entry, newDir));
    }
}

const templatePath = path.join(fileURLToPath(new URL("../templates", import.meta.url)), projectType);
const entries = fs.readdirSync(templatePath, { withFileTypes: true });
entries.forEach(entry => copyEntry(entry));

const outroText = (directory === "." ? "" : `   cd ${directory}\n`) + "   npm install\n   npm run dev";

outro(pc.green("Project created. ") + pc.white("Now run:\n\n") + pc.bold(pc.white(outroText)));