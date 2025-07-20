import { log } from "@repo/logger";
import { createServer } from "./server";

const port = Number(process.env.PORT) || 3004;
const server = createServer();

server.listen(port, "0.0.0.0", () => {
	log(`api running on ${port}`);
});
