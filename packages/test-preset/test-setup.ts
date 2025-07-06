// Test setup for Bun
// This file is preloaded before running tests

// Set up global test environment
if (typeof global !== "undefined") {
	// Make test functions globally available for convenience
	(global as any).describe = (global as any).describe || (() => {});
	(global as any).it = (global as any).it || (() => {});
	(global as any).test = (global as any).test || (() => {});
	(global as any).expect = (global as any).expect || (() => {});
	(global as any).beforeEach = (global as any).beforeEach || (() => {});
	(global as any).afterEach = (global as any).afterEach || (() => {});
	(global as any).beforeAll = (global as any).beforeAll || (() => {});
	(global as any).afterAll = (global as any).afterAll || (() => {});
}

// Set up DOM environment for React tests
if (typeof (globalThis as any).document === "undefined") {
	// This will be handled by Bun's built-in DOM support
	console.log("DOM environment will be provided by Bun");
}

// Global test utilities
export const testUtils = {
	// Helper to create a mock function
	createMock: <T extends (...args: any[]) => any>(fn?: T) => {
		return fn || (() => {});
	},

	// Helper to wait for async operations
	wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

	// Helper to create a test element
	createTestElement: () => {
		if (typeof (globalThis as any).document !== "undefined") {
			return (globalThis as any).document.createElement("div");
		}
		return null;
	},
};

// Export for use in tests
export { testUtils as utils };
