import { Graph, type Node, type WorkflowData } from "./graph"; // Assuming we have the previous Graph implementation in a separate file

// Define a type for node execution functions
type NodeExecutor = (node: Node, input: unknown) => Promise<unknown>;

class WorkflowExecutionEngine {
	private graph: Graph;
	private nodeExecutors: Map<string, NodeExecutor>;

	constructor(workflowData: WorkflowData) {
		this.graph = new Graph(workflowData);
		this.nodeExecutors = new Map();
	}

	registerNodeExecutor(nodeType: string, executor: NodeExecutor) {
		this.nodeExecutors.set(nodeType, executor);
	}

	async executeWorkflow(startNodeId: number): Promise<unknown> {
		const visited = new Set<number>();
		const executionOrder: number[] = [];

		// Perform topological sort
		const dfs = (nodeId: number) => {
			if (visited.has(nodeId)) return;
			visited.add(nodeId);

			const neighbors = this.graph.getNeighbors(nodeId);
			for (const neighbor of neighbors) {
				dfs(neighbor);
			}

			executionOrder.unshift(nodeId);
		};

		dfs(startNodeId);

		// Execute nodes in topological order
		let result: unknown = null;
		for (const nodeId of executionOrder) {
			const node = this.graph.getNode(nodeId);
			if (!node) {
				throw new Error(`Node ${nodeId} not found in the graph`);
			}

			const executor = this.nodeExecutors.get(node.type);
			if (!executor) {
				throw new Error(`No executor registered for node type: ${node.type}`);
			}

			try {
				result = await executor(node, result);
				console.log(`Executed node ${nodeId} (${node.type})`);
			} catch (error) {
				console.error(`Error executing node ${nodeId} (${node.type}):`, error);
				throw error;
			}
		}

		return result;
	}
}

// Example node executors
const findUserExecutor: NodeExecutor = async (node, input) => {
	console.log(`Finding user for node ${node.id}`);
	// Simulate finding a user
	return { userId: 123, email: "user@example.com" };
};

const sendMailExecutor: NodeExecutor = async (node, input) => {
	console.log(`Sending email for node ${node.id}`);
	// Simulate sending an email
	console.log("Sent email");
	return { success: true };
};

export async function runWorkflow(workflowData: WorkflowData) {
	const engine = new WorkflowExecutionEngine(workflowData);

	engine.registerNodeExecutor("FindUser", findUserExecutor);
	engine.registerNodeExecutor("SendMail", sendMailExecutor);

	try {
		const result = await engine.executeWorkflow(1);
		console.log("Workflow execution completed:", result);
	} catch (error) {
		console.error("Workflow execution failed:", error);
	}
}
