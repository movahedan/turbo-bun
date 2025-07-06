// Test setup for Bun
// This file is preloaded before running tests

// Set up DOM environment for React tests
if (typeof globalThis.document === "undefined") {
	// This will be handled by Bun's built-in DOM support
	console.log("DOM environment will be provided by Bun");
}

// Global test utilities
export const testUtils = {
	// Helper to create a mock function
	createMock: <T extends (...args: unknown[]) => unknown>(fn?: T) => {
		return fn || (() => {});
	},

	// Helper to wait for async operations
	wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

	// Helper to create a test element
	createTestElement: () => {
		if (typeof globalThis.document !== "undefined") {
			return globalThis.document.createElement("div");
		}
		return null;
	},
};

// Export for use in tests
export { testUtils as utils };
