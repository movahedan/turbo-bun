import { $ } from "bun";
import chalk from "chalk";

async function cleanup() {
	await $`docker-compose down -v`;
	console.log(chalk.green("👋 Services stopped successfully"));

	await $`docker-compose ps`;
	console.log(chalk.green("👋 Services stopped successfully"));

	await $`docker-compose rm -f -v`;
	console.log(chalk.green("👋 Services removed successfully"));

	await $`rm -rf node_modules`;
	await $`rm -rf ./**/node_modules`;
	console.log(chalk.green("👋 node_modules removed successfully"));

	await $`rm -rf .turbo`;
	await $`rm -rf ./packages/**/.turbo`;
	await $`rm -rf ./apps/**/.turbo`;
	await $`rm -rf .cache`;
	await $`rm -rf ./packages/**/.cache`;
	await $`rm -rf ./apps/**/.cache`;
	await $`rm -rf .vercel`;
	await $`rm -rf ./packages/**/.vercel`;
	await $`rm -rf ./apps/**/.vercel`;
	await $`rm -rf .next`;
	await $`rm -rf ./packages/**/.next`;
	await $`rm -rf ./apps/**/.next`;
	console.log(chalk.green("👋 cache related files removed successfully"));

	await $`rm -rf ./**/build`;
	await $`rm -rf ./packages/**/build`;
	await $`rm -rf ./apps/**/build`;
	await $`rm -rf ./**/dist`;
	await $`rm -rf ./packages/**/dist`;
	await $`rm -rf ./apps/**/dist`;
	await $`rm -rf ./**/out`;
	await $`rm -rf ./packages/**/out`;
	await $`rm -rf ./apps/**/out`;
	await $`rm -rf ./out`;
	console.log(chalk.green("👋 dist related files removed successfully"));
}

cleanup();
