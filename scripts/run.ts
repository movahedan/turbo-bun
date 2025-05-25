import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function run(command: string): Promise<void> {
	try {
		const { stdout, stderr } = await execAsync(command);
		if (stderr) console.error(stderr);
		if (stdout) console.log(stdout);
	} catch (error) {
		console.error(`Error executing command: ${command}`);
		console.error(error);
		process.exit(1);
	}
}
