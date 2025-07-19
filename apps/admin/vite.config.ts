import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	server: {
		host: "0.0.0.0",
		allowedHosts: ["localhost", "127.0.0.1", "0.0.0.0", "admin"],
		port: Number.isNaN(Number(process.env.PORT))
			? 3001
			: Number(process.env.PORT),
		watch: {
			usePolling: true,
			interval: 1000,
		},
	},
});
