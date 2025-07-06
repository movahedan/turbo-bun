// Zero-config approach - bunchee automatically discovers components
// based on package.json exports and src/ file structure
export default {
	dts: true,
	sourcemap: true,
	format: ["cjs", "esm"],
	clean: true,
	external: ["react", "react-dom"],
};
