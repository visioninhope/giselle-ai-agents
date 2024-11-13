import { expect, test } from "bun:test";
import { parseCommand } from "./command";

test("parseCommand", () => {
	expect(
		parseCommand(`
/giselle hello

Please write a blog.
Theme is free.
`),
	).toStrictEqual({
		callSign: "hello",
		content: "Please write a blog.\nTheme is free.",
	});
});

test("parseCommand2", () => {
	expect(
		parseCommand(`
/giselle hello
Please write a blog.
Theme is free.
`),
	).toStrictEqual({
		callSign: "hello",
		content: "Please write a blog.\nTheme is free.",
	});
});

test("parseCommand3", () => {
	expect(
		parseCommand(`
/giselle hello
Please write a blog.
Theme is free.

Text mood is ....
`),
	).toStrictEqual({
		callSign: "hello",
		content: "Please write a blog.\nTheme is free.\n\nText mood is ....",
	});
});
