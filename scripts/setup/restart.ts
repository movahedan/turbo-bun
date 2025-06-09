import { start } from "./start";
import { stop } from "./stop";

async function restart() {
	await stop();
	await start();
}

restart();
