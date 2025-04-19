import React, { useCallback, useEffect, useState, useRef } from "react";

// import ReactFlow, {
//   Controls,
//   MiniMap,
//   Background,
//   Edge,
//   Node,
//   Position,
//   ReactFlowProvider,
//   Viewport,
//   useEdgesState,
//   useNodesState,
//   useReactFlow,
//   OnConnectStartParams,
// } from "reactflow";

import {
  Controls,
  MiniMap,
  Background,
  ReactFlowProvider,
  useReactFlow,
  OnConnectStartParams,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useNodes,
  type Edge,
  type Node,
  type OnConnect,
  NodeTypes,
  EdgeTypes,
  OnConnectStart,
  ViewportPortal,
  BackgroundVariant,
  XYPosition,
  useStore,
  type ReactFlowState,
  ConnectionLineType,
  type DefaultEdgeOptions,
  MarkerType,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
// DevTools components
import ChangeLogger from './ChangeLogger';
import ViewportLogger from './ViewPortLogger';

import { InteractiveNode } from "./InteractiveNode";
import { DeletableEdge } from "./DeletableEdge";
import { NodeDims, ServerWebSocketMessage, QATreeNode } from "./types";
import { getFingerprint } from "./main";
import { SERVER_HOST_WS } from "./constants";
// import { getNodeColor } from './nodeTypes'; // Commenting out, assuming it's defined elsewhere or not needed for MiniMap base color

// --- Import Icons ---
import {
  HomeIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  CursorArrowRaysIcon,
  ViewfinderCircleIcon,
} from "@heroicons/react/24/solid";
// --- End Import Icons ---

const nodeTypes: NodeTypes = { interactiveNode: InteractiveNode };
const edgeTypes: EdgeTypes = { deleteEdge: DeletableEdge };

export const openai_server = async (
  prompt: string,
  opts: {
    model: string;
    temperature: number;
    onChunk: (chunk: string) => void;
    nodeId: string;
  }
) => {
  // console.log("function openai_server started");
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

    ws.onopen = () => {
      if (!ws) return;
      console.log(`WebSocket opened for node ${opts.nodeId}`);
      if (isAborted) {
        console.log(
          `Connection opened but marked as aborted for node ${opts.nodeId}, closing immediately`
        );
        ws?.close(1000, "Aborted after open");
        reject(new Error("Connection aborted after open"));
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
      if (isAborted || !ws) return;

      try {
        const message: ServerWebSocketMessage = JSON.parse(event.data as string);
        if (message.nodeId !== opts.nodeId) {
            return;
        }

        if (message.type === 'chunk') {
            opts.onChunk(message.content ?? "");
        } else if (message.type === 'done') {
            console.log(`Stream completed via 'done' message for node ${opts.nodeId}`);
            resolve();
            ws?.close(1000, "Stream completed");
        } else if (message.type === 'error') {
            const errorMsg = message.message || `Unknown stream error for node ${opts.nodeId}`;
            console.error(`Stream error via 'error' message for node ${opts.nodeId}:`, errorMsg);
            reject(new Error(errorMsg));
            ws?.close(1001, "Stream error");
        } else {
            console.warn(`Received unexpected message type: ${(message as any).type} for node ${opts.nodeId}`);
        }
      } catch (e) {
        console.error(`Error parsing WebSocket message for node ${opts.nodeId}:`, event.data as string, e);
        reject(new Error(`Failed to parse message: ${String(e)}`));
        ws?.close(1003, "Invalid message format");
      }
    };

    ws.onerror = (event) => {
      if (isAborted || !ws) return;
      const error = event instanceof Event ? "WebSocket connection error" : String(event);
      console.error(`WebSocket onerror for node ${opts.nodeId}:`, event);
      reject(new Error(error || "WebSocket connection error"));
    };

    ws.onclose = (event) => {
      console.log(
        `WebSocket closed event for node ${opts.nodeId}. Code: ${event.code}, Reason: ${event.reason}, Clean: ${event.wasClean}`
      );
      ws = null;
      if (!isAborted && !event.wasClean) {
          console.warn(`WebSocket for node ${opts.nodeId} closed uncleanly without explicit done/error message.`);
      }
    };

  });

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
};

type FlowProps = {
  flowNodes: Node[];
  flowEdges: Edge[];
  nodeDims: NodeDims;
  deleteBranch: (id: string) => void;
  onConnectStart: OnConnectStart;
  onConnectEnd: OnConnect;
};
export const Flow: React.FC<FlowProps> = (props) => {
  // console.log("function Flow started");
  const [nodes, setNodes, onNodesChangeDefault] = useNodesState(
    props.flowNodes
  );
  const [edges, setEdges, onEdgesChangeDefault] = useEdgesState(
    props.flowEdges
  );
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  const { getNodes, getViewport } = useReactFlow();

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChangeDefault(changes);
    },
    [onNodesChangeDefault]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChangeDefault(changes);
    },
    [onEdgesChangeDefault]
  );

  useEffect(() => {
    setNodes(props.flowNodes);
  }, [props.flowNodes, setNodes]);

  useEffect(() => {
    setEdges(props.flowEdges);
  }, [props.flowEdges, setEdges]);

  // --- Controls Callbacks ---
  const handleCenterGraph = useCallback(() => {
    void reactFlowInstance.fitView();
  }, [reactFlowInstance]);

  const handleZoomIn = useCallback(() => {
    void reactFlowInstance.zoomIn();
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    void reactFlowInstance.zoomOut();
  }, [reactFlowInstance]);

  const handleResetZoom = useCallback(() => {
    void reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
  }, [reactFlowInstance]);

  const handleCenterOnFirstNode = useCallback(() => {
    const firstNode = getNodes().find((n) => n.id === "0");
    if (firstNode && firstNode.width && firstNode.height) {
      const x = firstNode.position.x + firstNode.width / 2;
      const y = firstNode.position.y + firstNode.height / 2;
      const zoom = 1.8;
      void reactFlowInstance.setCenter(x, y, { zoom, duration: 800 });
    }
  }, [getNodes, reactFlowInstance]);

  const handleCenterOnLastNode = useCallback(() => {
    const nodes = getNodes();
    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      if (lastNode && lastNode.width && lastNode.height) {
        const x = lastNode.position.x + lastNode.width / 2;
        const y = lastNode.position.y + lastNode.height / 2;
        const zoom = 1.8;
        void reactFlowInstance.setCenter(x, y, { zoom, duration: 800 });
      }
    }
  }, [getNodes, reactFlowInstance]);

  // --- Zoom State for Debugging ---
  const [zoomLevel, setZoomLevel] = useState(1);

  const onMove = useCallback(() => {
    const { zoom } = getViewport();
    setZoomLevel(zoom);
  }, [getViewport]);
  // --- End Controls Callbacks ---

  const onConnectStart = useCallback(
    (event: MouseEvent | TouchEvent, params: OnConnectStartParams) => {
      console.log("onConnectStart", params);
      props.onConnectStart(event as any, params as any);
    },
    [props]
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      props.onConnectEnd(event as any);
    },
    [props]
  );

  const defaultEdgeOptions: DefaultEdgeOptions = {
    type: "deleteEdge",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 10,
      height: 10,
      color: "#FF0072",
    },
    style: {
      strokeWidth: 2,
      stroke: "#FF0072",
    },
    data: {
      deleteBranch: props.deleteBranch,
    },
  };

  // console.log("Flow rendering with nodes:", nodes.length, "edges:", edges.length);

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 60px)",
        position: "relative",
      }}
      ref={reactFlowWrapper}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineType={ConnectionLineType.Bezier}
        connectionLineStyle={{ stroke: "#FF0072", strokeWidth: 2 }}
        attributionPosition="bottom-right"
        onMove={onMove}
      >
        <Controls showInteractive={false} position="bottom-center">
          <button onClick={handleCenterOnFirstNode} title="Center on First Node">
            <HomeIcon className="h-5 w-5" />
          </button>
          <button onClick={handleZoomIn} title="Zoom In">
            <MagnifyingGlassPlusIcon className="h-5 w-5" />
          </button>
          <button onClick={handleZoomOut} title="Zoom Out">
            <MagnifyingGlassMinusIcon className="h-5 w-5" />
          </button>
          <button onClick={handleCenterGraph} title="Center Graph">
            <ArrowsPointingOutIcon className="h-5 w-5" />
          </button>
          <button onClick={handleResetZoom} title="Reset Zoom">
            <CursorArrowRaysIcon className="h-5 w-5" />
          </button>
          <button onClick={handleCenterOnLastNode} title="Center on Last Node">
            <ViewfinderCircleIcon className="h-5 w-5" />
          </button>
          <span className="react-flow__controls-button react-flow__controls-zoomlevel">
            Zoom: {zoomLevel.toFixed(2)}
          </span>
        </Controls>
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          position="bottom-left"
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />

        <ViewportPortal>
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              background: "rgba(255, 255, 255, 0.8)",
              padding: "5px",
              borderRadius: "3px",
              fontSize: "10px",
              zIndex: 10,
            }}
          >
            <ChangeLogger />
          </div>
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "rgba(255, 255, 255, 0.8)",
              padding: "5px",
              borderRadius: "3px",
              fontSize: "10px",
              zIndex: 10,
            }}
          >
            <ViewportLogger />
          </div>
        </ViewportPortal>
      </ReactFlow>
    </div>
  );
};

interface FlowProviderProps extends FlowProps {
  // Inherit all props from FlowProps including the handlers
  // No additional props needed for FlowProvider itself currently
}

export const FlowProvider: React.FC<FlowProviderProps> = (props) => {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
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
