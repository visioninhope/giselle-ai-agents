import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHttpHandler } from "./next-giselle-engine";

// Mock the module dependencies
vi.mock("../http", () => {
  const mockJsonHandler = vi.fn().mockResolvedValue({ success: true });
  
  return {
    isJsonRouterPath: (path: string) => path === "testRoute",
    isFormDataRouterPath: () => false,
    createJsonRouters: {
      testRoute: () => mockJsonHandler,
    },
    createFormDataRouters: {},
  };
});

describe("createHttpHandler", () => {
  const mockGiselleEngine = {} as any;
  const basePath = "/api/giselle";
  let httpHandler: (request: Request) => Promise<any>;

  beforeEach(() => {
    vi.clearAllMocks();
    httpHandler = createHttpHandler({
      giselleEngine: mockGiselleEngine,
      basePath,
    });
  });

  it("should correctly parse URL segments", async () => {
    // Test valid URL
    const validRequest = new Request(`https://example.com${basePath}/testRoute`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ test: "data" }),
    });

    const result = await httpHandler(validRequest);
    expect(result).toEqual({ success: true });
  });

  it("should throw error for invalid base path", async () => {
    // Test URL with invalid base path
    const invalidBasePathRequest = new Request("https://example.com/invalid/testRoute", {
      method: "POST",
    });

    await expect(httpHandler(invalidBasePathRequest)).rejects.toThrow(
      /Cannot parse action at/
    );
  });

  it("should throw error for multiple segments", async () => {
    // Test URL with multiple segments
    const multiSegmentRequest = new Request(`https://example.com${basePath}/testRoute/extra`, {
      method: "POST",
    });

    await expect(httpHandler(multiSegmentRequest)).rejects.toThrow(
      /Invalid action at/
    );
  });

  it("should throw error for invalid router path", async () => {
    // Test URL with invalid router path
    const invalidRouterRequest = new Request(`https://example.com${basePath}/invalidRoute`, {
      method: "POST",
    });

    await expect(httpHandler(invalidRouterRequest)).rejects.toThrow(
      /Invalid router path at/
    );
  });
});