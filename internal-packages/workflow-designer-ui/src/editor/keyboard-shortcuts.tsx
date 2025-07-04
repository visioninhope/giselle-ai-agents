import type { Node } from "@giselle-sdk/data-type";
import { useWorkflowDesigner } from "@giselle-sdk/giselle-engine/react";
import { useEffect, useState } from "react";
import { useDuplicateNode } from "./node";

const ignoredTags = ["INPUT", "TEXTAREA", "SELECT"];

export function KeyboardShortcuts() {
  const { data, copyNode } = useWorkflowDesigner();
  const duplicateNode = useDuplicateNode();
  const [copiedNode, setCopiedNode] = useState<Node | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement | null;

      if (
        activeElement &&
        (ignoredTags.includes(activeElement.tagName) ||
          activeElement.isContentEditable)
      ) {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "d") {
        event.preventDefault();
        duplicateNode();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "c") {
        event.preventDefault();
        const selectedNode = data.nodes.find(
          (node) => data.ui.nodeState[node.id]?.selected,
        );
        if (selectedNode) {
          setCopiedNode(selectedNode);
        }
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "v") {
        event.preventDefault();
        if (copiedNode) {
          const nodeState = data.ui.nodeState[copiedNode.id];
          if (nodeState) {
            const position = {
              x: nodeState.position.x + 200,
              y: nodeState.position.y + 100,
            };
            copyNode(copiedNode, { ui: { position } });
          }
        }
        return;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [duplicateNode, data, copyNode, copiedNode]);

  return null;
}
