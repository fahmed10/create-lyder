import { isCancel, outro } from "@clack/prompts";
import mri from "mri";
import pc from "picocolors";

export function isValidDirectoryName(name: string): boolean {
    return !['\\', '/', ':', '*', '?', '"', '<', '>', '|'].some(c => name.includes(c));
}

export function exitOnCancel<T>(value: T): Exclude<T, symbol> {
    if (isCancel(value)) {
        exit();
    }

    return value as any;
}

export function exit(): never {
    outro(pc.red("Operation cancelled"));
    process.exit(0);
}

export function trimInput(input: string): string {
    return input.trim();
}

export async function skipIfArgumentPassed<T>(args: mri.Argv, argument: string, prompt: () => Promise<T>): Promise<T> {
    if (argument in args) {
        return args[argument];
    }

    return await prompt();
}

export async function overrideIfArgumentTrue<T>(args: mri.Argv, argument: string, prompt: () => Promise<T>): Promise<T | boolean> {
    if (args[argument] === true) {
        return true;
    }

    return await prompt();
}