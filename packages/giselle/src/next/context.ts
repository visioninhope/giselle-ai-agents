import { AsyncLocalStorage } from "node:async_hooks";
import type { NextRequest } from "next/server";

export const requestStore = new AsyncLocalStorage<{ request: NextRequest }>();
