"use server";

import { db, tasks } from "@/drizzle";

export const getTasks = async () => db.select().from(tasks);
