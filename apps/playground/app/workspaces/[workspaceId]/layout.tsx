import {
  WorkspaceProvider,
  ZustandBridgeProvider,
} from "@giselle-sdk/giselle/react";
import { Workspace, WorkspaceId } from "@giselle-sdk/data-type";
import type { ReactNode } from "react";

// Create a mock workspace for playground
const mockWorkspace = Workspace.parse({
  id: WorkspaceId.generate(),
  name: "Playground Workspace",
  nodes: [],
  connections: [],
  ui: {
    viewport: { x: 0, y: 0, zoom: 1 },
  },
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <WorkspaceProvider
      featureFlag={{
        runV3: true,
        webSearchAction: false,
        layoutV3: true,
        experimental_storage: true,
        stage: true,
        aiGateway: false,
        resumableGeneration: false,
      }}
    >
      <ZustandBridgeProvider data={mockWorkspace}>
        {children}
      </ZustandBridgeProvider>
    </WorkspaceProvider>
  );
}
