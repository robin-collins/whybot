import React, { useCallback, useEffect, useState } from "react";

import ReactFlow, {
  Controls,
  MiniMap,
  Background,
  Edge,
  Node,
  Position,
  ReactFlowProvider,
  Viewport,
  useEdgesState,
  useNodesState,
  useReactFlow,
  OnConnectStartParams,
} from "reactflow";
import dagre from "dagre";

import "reactflow/dist/style.css";
import { InteractiveNode } from "./InteractiveNode";
import { DeletableEdge } from "./DeletableEdge";
import { NodeDims } from "./types";
import { getFingerprint } from "./main";
import { SERVER_HOST_WS } from "./constants";

// --- Import Icons ---
import {
  HomeIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  CursorArrowRaysIcon,
} from "@heroicons/react/24/solid";
// --- End Import Icons ---

const nodeTypes = { interactiveNode: InteractiveNode };
const edgeTypes = { deleteEdge: DeletableEdge };

// Layout the nodes automatically
const layoutElements = (
  nodes: Node[],
  edges: Edge[],
  nodeDims: NodeDims,
  direction = "LR"
) => {
  console.log("function layoutElements started");
  const isHorizontal = direction === "LR";
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Filter nodes: Only include q-0 initially, or nodes with dimensions
  // const nodesToLayout = nodes.filter(node =>
  //   node.id === 'q-0' || node.id in nodeDims
  // );
  // Filter edges: Only include edges connecting nodes that are being laid out
  // const nodeIdsToLayout = new Set(nodesToLayout.map(n => n.id));
  // const edgesToLayout = edges.filter(edge =>
  //     nodeIdsToLayout.has(edge.source) && nodeIdsToLayout.has(edge.target)
  // );

  const nodeWidth = 250;
  const nodeHeight = 170;
  dagreGraph.setGraph({ rankdir: direction, nodesep: 100 });

  // Use all nodes passed in
  nodes.forEach((node) => {
    if (node.id in nodeDims) {
      dagreGraph.setNode(node.id, {
        width: nodeDims[node.id]["width"],
        height: nodeDims[node.id]["height"],
      });
    } else {
      // Use defaults if dims not available
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    }
  });

  // Use all edges passed in
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  // Map positions back to the original nodes array
  nodes.forEach((node) => {
    // Check if the node was actually processed by Dagre (it might not be if disconnected)
    const nodeWithPosition = dagreGraph.node(node.id);
    if (nodeWithPosition) {
      node.targetPosition = isHorizontal ? Position.Left : Position.Top;
      node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

      node.position = {
        x: nodeWithPosition.x - nodeWithPosition.width / 2 + 60,
        y: nodeWithPosition.y - nodeWithPosition.height / 2 + 60,
      };
    } else {
      // Assign a default position if Dagre didn't handle it? Or leave as is?
      // console.warn(`Node ${node.id} was not laid out by Dagre.`);
    }
  });

  // Return original nodes/edges with updated positions
  return { nodes, edges };
  console.log("function layoutElements finished");
  return { nodes, edges };
};

export const openai_server = async (
  prompt: string,
  opts: {
    model: string;
    temperature: number;
    onChunk: (chunk: string) => void;
    nodeId: string;
  }
) => {
  console.log("function openai_server started");
  const fingerprint = await getFingerprint();
  let ws: WebSocket | null = null;
  let isAborted = false;

  const promise = new Promise<void>((resolve, reject) => {
    if (opts.temperature < 0 || opts.temperature > 1) {
      const errorMsg = `Temperature is set to an invalid value: ${opts.temperature}`;
      console.error(errorMsg);
      reject(new Error(errorMsg));
      return;
    }

    try {
      ws = new WebSocket(`${SERVER_HOST_WS}/ws?fp=${fingerprint}`);
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      reject(error);
      return;
    }

    // Create an abort controller for cleanup
    const cleanup = () => {
      if (ws && ws.readyState < 2) {
        isAborted = true;
        console.log(
          `Manually closing WebSocket for node ${opts.nodeId} during cleanup`
        );
        ws.close(1000, "Client cleanup");
      }
    };

    ws.onopen = () => {
      console.log(`WebSocket opened for node ${opts.nodeId}`);
      if (isAborted) {
        console.log(
          `Connection opened but marked as aborted for node ${opts.nodeId}, closing immediately`
        );
        ws?.close(1000, "Aborted after open");
        reject(new Error("Connection aborted after open")); // Reject if aborted on open
        return;
      }

      ws?.send(
        JSON.stringify({
          prompt,
          model: opts.model,
          temperature: opts.temperature,
          nodeId: opts.nodeId,
        })
      );
    };

    ws.onmessage = (event) => {
      if (isAborted) return; // Skip processing if aborted

      try {
        const message = JSON.parse(event.data);
        // Ensure message has nodeId and type
        if (message.nodeId !== opts.nodeId) {
            // Ignore messages not for this specific stream request
            return;
        }

        if (message.type === 'chunk') {
            opts.onChunk(message.content); // Pass only content for chunks
        } else if (message.type === 'done') {
            console.log(`Stream completed via 'done' message for node ${opts.nodeId}`);
            resolve(); // Resolve promise on 'done'
            ws?.close(1000, "Stream completed"); // Close WS cleanly
        } else if (message.type === 'error') {
            const errorMsg = message.message || `Unknown stream error for node ${opts.nodeId}`;
            console.error(`Stream error via 'error' message for node ${opts.nodeId}:`, errorMsg);
            reject(new Error(errorMsg)); // Reject promise on 'error'
            ws?.close(1001, "Stream error"); // Close WS indicating error
        } else {
             // Handle unexpected message types if necessary
            console.warn(`Received unexpected message type: ${message.type} for node ${opts.nodeId}`);
        }
      } catch (e) {
        console.error(`Error parsing WebSocket message for node ${opts.nodeId}:`, event.data, e);
        // Don't reject here, wait for server error or timeout? Or reject?
        // Let's reject for now if parsing fails during active stream
        reject(new Error(`Failed to parse message: ${e}`));
        ws?.close(1003, "Invalid message format");
      }
    };

    ws.onerror = (event) => {
      if (isAborted) {
        console.log(
          `Ignoring WebSocket error for aborted connection (node ${opts.nodeId})`
        );
        return; // Don't reject if already aborted
      }
      // This usually fires for connection issues *before* messages are handled
      const error = event instanceof Event ? "WebSocket connection error" : String(event);
      console.error(`WebSocket onerror for node ${opts.nodeId}:`, event); // Log the raw event
      reject(new Error(error || "WebSocket connection error"));
      // WS state might already be CLOSING or CLOSED here
    };

    ws.onclose = (event) => {
      console.log(
        `WebSocket closed event for node ${opts.nodeId}. Code: ${event.code}, Reason: ${event.reason}, Clean: ${event.wasClean}`
      );
      // If the promise hasn't already been resolved/rejected by onmessage ('done'/'error')
      // then the closure was unexpected or due to an earlier onerror.
      // We might reject here if it wasn't clean and wasn't aborted.
      if (!isAborted && !event.wasClean) {
          // Avoid rejecting if already resolved/rejected by 'done'/'error' message handling
          // This requires tracking promise state, which is complex.
          // Let's rely on 'done'/'error' messages for explicit completion/failure.
          console.warn(`WebSocket for node ${opts.nodeId} closed uncleanly without explicit done/error message.`);
          // Optionally reject here as a fallback if needed, e.g.:
          // reject(new Error(`WebSocket closed unexpectedly. Code: ${event.code}`));
      }
    };

  });

  // Add cleanup method to promise
  (promise as any).cleanup = () => {
    if (ws && ws.readyState < 2) {
      isAborted = true;
      console.log(
        `Cleanup called externally for WebSocket (node ${opts.nodeId})`
      );
      ws.close(1000, "External cleanup");
    }
  };

  return promise;
  console.log("function openai_server finished");
  return promise;
};

type FlowProps = {
  flowNodes: Node[];
  flowEdges: Edge[];
  nodeDims: NodeDims;
  deleteBranch: (id: string) => void;
  onConnectStart: (
    event: React.MouseEvent | React.TouchEvent,
    params: OnConnectStartParams
  ) => void;
  onConnectEnd: (event: MouseEvent | TouchEvent) => void;
};
export const Flow: React.FC<FlowProps> = (props) => {
  console.log("function Flow started");
  const [nodes, setNodes, onNodesChangeDefault] = useNodesState<Node[]>(
    props.flowNodes
  );
  const [edges, setEdges, onEdgesChangeDefault] = useEdgesState<Edge[]>(
    props.flowEdges
  );
  const {
    fitView,
    zoomIn,
    zoomOut,
    setCenter,
    getNodes,
    getViewport,
    setViewport,
    zoomTo,
  } = useReactFlow();
  const [currentZoom, setCurrentZoom] = useState(getViewport().zoom);

  // when props.flowNodes changes, then I need to call setNodes
  useEffect(() => {
    setNodes(() => {
      return props.flowNodes;
    });
  }, [props.flowNodes]);

  useEffect(() => {
    setEdges(() => {
      return props.flowEdges;
    });
  }, [props.flowEdges]);

  // console.log("props.flowNodes", props.flowNodes)
  // console.log("nodes", nodes)

  const laid = React.useMemo(() => {
    // No filtering: Pass all nodes to layoutElements.
    // It will use defaults if dims aren't ready.
    // The useMemo dependency on props.nodeDims will trigger re-layout when dimensions update.
    return layoutElements(nodes, edges, props.nodeDims);
  }, [nodes, edges, props.nodeDims]);

  // --- Custom Control Handlers ---
  const handleZoomIn = useCallback(() => {
    zoomIn({ duration: 300 });
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut({ duration: 300 });
  }, [zoomOut]);

  const handleFitView = useCallback(() => {
    fitView({ duration: 300, padding: 0.1 });
  }, [fitView]);

  const handleCenterNode = useCallback(
    (nodeId: string | null) => {
      if (!nodeId) return;
      const allNodes = getNodes();
      const node = allNodes.find((n) => n.id === nodeId);
      if (node) {
        const x = node.position.x + (node.width ?? 0) / 2;
        const y = node.position.y + (node.height ?? 0) / 2;
        setCenter(x, y, { zoom: 1, duration: 500 });
      } else {
        console.warn(`Node with ID ${nodeId} not found for centering.`);
      }
    },
    [getNodes, setCenter]
  );

  const handleCenterFirst = useCallback(() => {
    // The initial seed question node consistently has the ID 'q-0'
    handleCenterNode("q-0");
  }, [getNodes, handleCenterNode]);

  const handleCenterLast = useCallback(() => {
    const allNodes = getNodes();
    if (allNodes.length === 0) return;
    // Find the node with the highest numeric part in its ID or simply the last one added
    // This is heuristic; a better approach depends on how node IDs are guaranteed to be ordered or structured.
    const lastNode = allNodes[allNodes.length - 1]; // Or sort by creation time/ID logic if available
    handleCenterNode(lastNode.id);
  }, [getNodes, handleCenterNode]);

  // Update slider when viewport changes
  useEffect(() => {
    const updateZoomState = () => {
      setCurrentZoom(getViewport().zoom);
    };
    // Hook into viewport changes if possible, otherwise poll (less ideal)
    // React Flow doesn't have a direct onViewportChange prop on the main component,
    // but useReactFlow hook updates frequently. We can use an effect dependency or a slight delay.
    // For simplicity here, let's update based on node/edge changes or manual triggers.
    // A more robust solution might involve wrapper contexts or observing viewport state.
    setCurrentZoom(getViewport().zoom);
  }, [nodes, edges, getViewport]); // Update zoom state based on graph changes or viewport getter ref

  const handleZoomSliderChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newZoom = parseFloat(event.target.value);
      zoomTo(newZoom, { duration: 50 }); // Use zoomTo for smoother slider interaction
      setCurrentZoom(newZoom); // Update slider state immediately
    },
    [zoomTo]
  );
  // --- End Custom Control Handlers ---

  // --- Define Min/Max Zoom for Slider ---
  const minZoomSlider = 0.1; // Match ReactFlow's minZoom
  const maxZoomSlider = 2.5; // Define a reasonable max for the slider
  // --- End Define Min/Max Zoom for Slider ---

  return (
    <div className="w-full h-full fixed top-0 left-0">
      <ReactFlow
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodes={laid.nodes}
        edges={laid.edges}
        onNodesChange={onNodesChangeDefault}
        onEdgesChange={onEdgesChangeDefault}
        panOnScroll
        onConnectStart={props.onConnectStart}
        onConnectEnd={props.onConnectEnd}
        minZoom={minZoomSlider}
        maxZoom={maxZoomSlider}
        onMoveEnd={(_event, viewport) => setCurrentZoom(viewport.zoom)}
      >
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
      {/* Custom Controls Overlay - Horizontal, Improved Styling, Icons, Slider */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center p-2 bg-gray-800 bg-opacity-70 rounded-lg shadow-lg space-y-2">
        {/* Icon Buttons Row */}
        <div className="flex flex-row space-x-2">
          <button
            title="Center First Node"
            onClick={handleCenterFirst}
            className="p-2 text-white bg-gray-600 hover:bg-gray-500 rounded-md transition-colors duration-150"
          >
            <HomeIcon className="w-4 h-4" />
          </button>
          <button
            title="Zoom In"
            onClick={handleZoomIn}
            className="p-2 text-white bg-gray-600 hover:bg-gray-500 rounded-md transition-colors duration-150"
          >
            <MagnifyingGlassPlusIcon className="w-4 h-4" />
          </button>
          <button
            title="Reset Zoom"
            onClick={handleFitView}
            className="p-2 text-white bg-gray-600 hover:bg-gray-500 rounded-md transition-colors duration-150"
          >
            <ArrowsPointingOutIcon className="w-4 h-4" />
          </button>
          <button
            title="Zoom Out"
            onClick={handleZoomOut}
            className="p-2 text-white bg-gray-600 hover:bg-gray-500 rounded-md transition-colors duration-150"
          >
            <MagnifyingGlassMinusIcon className="w-4 h-4" />
          </button>
          <button
            title="Center Last Node"
            onClick={handleCenterLast}
            className="p-2 text-white bg-gray-600 hover:bg-gray-500 rounded-md transition-colors duration-150"
          >
            <CursorArrowRaysIcon className="w-4 h-4" />
          </button>
        </div>
        {/* Zoom Slider Row */}
        <div className="w-full px-2">
          <input
            type="range"
            min={minZoomSlider}
            max={maxZoomSlider}
            step="0.05"
            value={currentZoom}
            onChange={handleZoomSliderChange}
            className="w-full h-1 bg-gray-500 rounded-lg appearance-none cursor-pointer range-sm dark:bg-gray-700 accent-blue-500" // Basic styling, can be customized further
            title={`Zoom: ${currentZoom.toFixed(2)}`}
          />
        </div>
      </div>
    </div>
  );
  console.log("function Flow finished");
};

interface FlowProviderProps extends FlowProps {
  // Inherit all props from FlowProps including the handlers
  // No additional props needed for FlowProvider itself currently
}

export const FlowProvider: React.FC<FlowProviderProps> = (props) => {
  console.log("function FlowProvider started");
  return (
    <ReactFlowProvider>
      {/* Pass all received props, including handlers, down to Flow */}
      <Flow
        flowNodes={props.flowNodes}
        flowEdges={props.flowEdges}
        nodeDims={props.nodeDims}
        deleteBranch={props.deleteBranch}
        onConnectStart={props.onConnectStart}
        onConnectEnd={props.onConnectEnd}
      />
    </ReactFlowProvider>
  );
  console.log("function FlowProvider finished");
};

// Global declaration (should be correct)
declare global {
  interface Window {
    openai: (
      prompt: string,
      opts: {
        model: string;
        temperature: number;
        nodeId: string;
        onChunk: (chunk: string) => void;
      }
    ) => Promise<void>;
  }
}

// Directly assign openai_server to window.openai
if (typeof window !== "undefined") {
  window.openai = openai_server;
}
