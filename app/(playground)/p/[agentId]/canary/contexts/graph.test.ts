import { describe, expect, test } from "bun:test";
import type { Graph } from "../types";
import { deriveSubGraphs } from "./graph";

const graph: Graph = {
	id: "grph_ef00f8t2ojt65vl2a769vkmq",
	nodes: [
		{
			id: "nd_i85invgzw0pgxzmjathkwhrr",
			name: "Untitle node - 1",
			position: { x: 137, y: 185 },
			selected: false,
			type: "variable",
			content: {
				type: "file",
				data: {
					id: "fl_j4riw5k1p5jqe3tbugtaj5oc",
					status: "completed",
					name: "i1042-5055-29-1-1.pdf",
					contentType: "application/pdf",
					size: 689064,
					uploadedAt: 1733318593333,
					fileBlobUrl:
						"https://aj9qps90wwygtg5h.public.blob.vercel-storage.com/canary/files/fl_j4riw5k1p5jqe3tbugtaj5oc/i1042-5055-29-1-1-zZizzVpxjulkzHskqUJ068Qu4jQHHv.pdf",
					processedAt: 1733318601585,
					textDataUrl:
						"https://aj9qps90wwygtg5h.public.blob.vercel-storage.com/canary/files/fl_j4riw5k1p5jqe3tbugtaj5oc/markdown-iYTpEtxjznsh86cN8UWqXMxAPhF8SY.md",
				},
			},
		},
		{
			id: "nd_vwczcdxw0f27r7lifmi8jnk3",
			name: "Untitle node - 2",
			position: { x: 420, y: 180 },
			selected: false,
			type: "action",
			content: {
				type: "textGeneration",
				llm: "anthropic:claude-3-5-sonnet-latest",
				temperature: 0.7,
				topP: 1,
				instruction: "Please let me know key takeaway about ",
				sources: [{ id: "ndh_rfpzu51jfnl1k2ccq31exevk", label: "Source1" }],
			},
		},
		{
			id: "nd_ffz8hv1isj4w3r4s23a6klkz",
			name: "Untitle node - 3",
			position: { x: 480, y: 345 },
			selected: false,
			type: "action",
			content: {
				type: "textGeneration",
				llm: "anthropic:claude-3-5-sonnet-latest",
				temperature: 0.7,
				topP: 1,
				instruction: "",
				sources: [{ id: "ndh_n3xuz7ao5dyfusfukagbi3l7", label: "Source1" }],
			},
		},
		{
			id: "nd_h8h4uhp7kov9v7pj1yyofen8",
			name: "Untitle node - 4",
			position: { x: 135, y: 360 },
			selected: false,
			type: "variable",
			content: { type: "text", text: "Today is very good day" },
		},
		{
			id: "nd_guzyxfacpt5db2n9lkjify3z",
			name: "Untitle node - 5",
			position: { x: 802, y: 403 },
			selected: true,
			type: "action",
			content: {
				type: "textGeneration",
				llm: "anthropic:claude-3-5-sonnet-latest",
				temperature: 0.7,
				topP: 1,
				instruction: "Translate in Japanese",
				sources: [{ id: "ndh_xjlzyp1yq7vd1ih43rxuo8l9", label: "Source1" }],
			},
		},
	],
	connections: [
		{
			id: "cnnc_j5gr5slzzb96unyaddc3fik6",
			sourceNodeId: "nd_i85invgzw0pgxzmjathkwhrr",
			sourceNodeType: "variable",
			targetNodeId: "nd_vwczcdxw0f27r7lifmi8jnk3",
			targetNodeType: "action",
			targetNodeHandleId: "ndh_rfpzu51jfnl1k2ccq31exevk",
		},
		{
			id: "cnnc_x8dy20365eqk9h033a800a5a",
			sourceNodeId: "nd_h8h4uhp7kov9v7pj1yyofen8",
			sourceNodeType: "variable",
			targetNodeId: "nd_ffz8hv1isj4w3r4s23a6klkz",
			targetNodeType: "action",
			targetNodeHandleId: "ndh_n3xuz7ao5dyfusfukagbi3l7",
		},
		{
			id: "cnnc_lxqmqyb50b0qnuvrxcpavvax",
			sourceNodeId: "nd_ffz8hv1isj4w3r4s23a6klkz",
			sourceNodeType: "action",
			targetNodeId: "nd_guzyxfacpt5db2n9lkjify3z",
			targetNodeHandleId: "ndh_xjlzyp1yq7vd1ih43rxuo8l9",
			targetNodeType: "action",
		},
	],
	artifacts: [],
	version: "2024-12-09",
	subGraphs: [],
};

describe("deriveSubGraphs", () => {
	test("two sub graphs", () => {
		expect(deriveSubGraphs(graph)).toBeArray();
	});
});
