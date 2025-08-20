import type { Generation } from "@giselle-sdk/giselle";
import { StepLayout } from "./[stepId]/ui/step-layout";

// Define a dummy generation object for the loading state to satisfy StepLayout's props
const dummyGeneration: Generation = {
  id: "gnr-loading-placeholder" as `gnr-${string}`,
  status: "queued", // Or "running"
  context: {
    operationNode: {
      id: "node-loading-placeholder",
      name: "Loading Node",
      type: "operation",
      content: {
        type: "text-generation",
        llm: { provider: "loading", id: "loading" },
      },
    },
    inputs: [],
    sourceNodes: [],
  },
  outputs: [],
  messages: [
    {
      id: "msg-loading-placeholder",
      role: "assistant",
      parts: [{ type: "text", text: "Loading content..." }],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  metadata: {},
};

export default function Loading() {
  return (
    <StepLayout
      generation={dummyGeneration}
      header={
        <div className="flex items-center gap-[6px]">
          <div className="p-[8px] bg-element-active rounded-[4px]">
            <div className="size-[16px] bg-gray-600 rounded animate-pulse" />
          </div>
          <div className="flex flex-col gap-[4px]">
            <div className="w-32 h-[14px] bg-gray-600 rounded animate-pulse" />
            <div className="flex items-center gap-[4px]">
              <div className="w-12 h-[10px] bg-gray-600 rounded animate-pulse" />
              <div className="size-[2px] rounded-full bg-gray-600 animate-pulse" />
              <div className="w-24 h-[10px] bg-gray-600 rounded animate-pulse" />
            </div>
          </div>
        </div>
      }
    >
      {/* Skeleton for GenerationView content */}
      <div className="space-y-[16px]">
        {/* Main content blocks */}
        <div className="space-y-[8px]">
          <div className="w-full h-[20px] bg-gray-600 rounded animate-pulse" />
          <div className="w-full h-[20px] bg-gray-600 rounded animate-pulse" />
          <div className="w-4/5 h-[20px] bg-gray-600 rounded animate-pulse" />
        </div>

        {/* Accordion-style skeleton for reasoning sections */}
        <div className="space-y-[8px]">
          <div className="flex items-center gap-[4px]">
            <div className="w-full h-[20px] bg-gray-600 rounded animate-pulse" />
            <div className="w-4/5 h-[20px] bg-gray-600 rounded animate-pulse" />
          </div>
          <div className="ml-[20px] pl-[12px] border-l border-l-gray-600/20 space-y-[4px]">
            <div className="w-full h-[14px] bg-gray-600 rounded animate-pulse" />
            <div className="w-3/4 h-[14px] bg-gray-600 rounded animate-pulse" />
            <div className="w-20 h-[12px] bg-gray-600 rounded animate-pulse" />
          </div>
        </div>

        {/* More content blocks */}
        <div className="space-y-[8px]">
          <div className="w-3/4 h-[14px] bg-gray-600 rounded animate-pulse" />
          <div className="w-3/4 h-[20px] bg-gray-600 rounded animate-pulse" />
        </div>
      </div>
    </StepLayout>
  );
}
