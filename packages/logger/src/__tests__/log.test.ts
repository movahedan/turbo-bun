import { describe, expect, it, jest } from "@jest/globals";
import { log } from "..";

describe("@repo/logger", () => {
	it("prints a message", () => {
		const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

		try {
			log("hello");
			expect(consoleSpy).toHaveBeenCalledWith("LOGGER: ", "hello");
		} finally {
			consoleSpy.mockRestore();
		}
	});
});
