// %% Notebook for Giselle SDK
import { initWorkflow } from "../src/index.ts";

const workflow = initWorkflow({
  storage: {
    type: "localfilesystem",
    directory: "./.test-storage",
  },
});

workflow;

// %% Create a text generation node
const textGenerationNode1 = workflow.addTextGenerationNode(
  {
    name: "Untitled node",
    llm: "openai:gpt-4o",
    temperature: 0.7,
    topP: 1,
    instruction: "Write a short story about a cat",
    sources: [],
  },
  {
    ui: {
      position: { x: 100, y: 100 },
      selected: false,
    },
  },
);
textGenerationNode1;

// %% save the workflow
await workflow.save();

// %% Create another text generation node
const textGenerationNode2 = workflow.addTextGenerationNode(
  {
    name: "Untitled node",
    llm: "openai:gpt-4o",
    temperature: 0.7,
    topP: 1,
    instruction: "Write a short story about a cat",
    sources: [],
  },
  {
    ui: {
      position: { x: 200, y: 200 },
      selected: false,
    },
  },
);
// %% Add a source to the second node
textGenerationNode2.addSources([textGenerationNode1]);

// %% Create a text node
const textNode1 = workflow.addTextNode({
  name: "Untitled node",
  text: "Hello, world!",
});

// %% Add a text node as a source to the second text generation node
textGenerationNode2.addSources([textNode1]);
// %% Save the workflow
await workflow.save();
// %% Run the workflow
await workflow.run();
