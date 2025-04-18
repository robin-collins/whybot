import React, { useCallback, useEffect, useRef, useState, memo } from "react";

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
import dagre from "dagre";

import {
  Controls,
  MiniMap,
  Background,
  Position,
  ReactFlowProvider,
  Viewport,
  useReactFlow,
  OnConnectStartParams,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  type Edge,
  type OnConnect,
  type Node,
  NodeTypes,
  EdgeTypes,
  NodeProps,
  OnConnectStart,
  useNodes,
  ViewportPortal,
  Panel,
  BackgroundVariant,
  XYPosition,
  useStore,
  type ReactFlowState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
// DevTools components
import NodeInspector from './NodeInspector';
import ChangeLogger from './ChangeLogger';
import ViewportLogger from './ViewPortLogger';

import { InteractiveNode, InteractiveNodeData } from "./InteractiveNode";
import { DeletableEdge } from "./DeletableEdge";
import { NodeDims } from "./types";
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
  QueueListIcon,
  CodeBracketSquareIcon,
  MapIcon,
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
          // Avoid rejecting if already resolved/rejected by 'done'/'error' messages handling
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
  onConnectStart: OnConnectStart;
  onConnectEnd: (event: MouseEvent | TouchEvent) => void;
};
export const Flow: React.FC<FlowProps> = (props) => {
  console.log("function Flow started");
  const [nodes, setNodes, onNodesChangeDefault] = useNodesState(
    props.flowNodes
  );
  const [edges, setEdges, onEdgesChangeDefault] = useEdgesState(
    props.flowEdges
  );
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
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
  const [currentZoom, setCurrentZoom] = useState(1);

  // State for Dev Tools Visibility
  const [showNodeInspector, setShowNodeInspector] = useState(false);
  const [showChangeLogger, setShowChangeLogger] = useState(false);
  const [showViewportLogger, setShowViewportLogger] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);

  useEffect(() => {
    setNodes(props.flowNodes);
  }, [props.flowNodes]);

  useEffect(() => {
    setEdges(props.flowEdges);
  }, [props.flowEdges]);

  const laid = React.useMemo(() => {
    return { nodes: props.flowNodes, edges: props.flowEdges };
  }, [props.flowNodes, props.flowEdges]);

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

  const nodeColorFunc = useCallback((node: Node) => {
    // Basic color logic, refine as needed based on node type or data
    switch (node.type) {
      case 'input': return '#6ede87';
      case 'output': return '#6865A5';
      default: return '#ff0072';
    }
  }, []);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full fixed top-0 left-0">
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
        onMoveEnd={(_event, viewport) => {
          console.log("Viewport changed:", viewport); // Log viewport
          setCurrentZoom(viewport.zoom)
        }}
        onNodeClick={(_event, node) => {
          console.log("Node clicked:", node); // Log clicked node data
        }}
        defaultMarkerColor='#b1b1b7'
        elevateEdgesOnSelect={true}
        ref={reactFlowWrapper}
        data-testid="flow-canvas"
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls
          position="top-left"
          style={{ marginTop: '4rem' }}
        />

        {showMiniMap && (
          <MiniMap
              nodeColor={nodeColorFunc}
              nodeStrokeWidth={3}
              zoomable
              pannable
              position="bottom-left"
              maskColor="rgba(0,0,0,0.6)"
              style={{ backgroundColor: "rgba(40, 40, 40, 0.85)" }}
          />
        )}

        {showNodeInspector && <DevNodeInspector />}
        {showChangeLogger && <ChangeLogger />}
        {showViewportLogger && <ViewportLogger />}

        <Panel position="top-right" className="z-10">
        </Panel>
      </ReactFlow>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center p-2 bg-gray-800 bg-opacity-70 rounded-lg shadow-lg space-y-2">
         {/* Buttons Row (Nav + Toggles) */}
         <div className="flex flex-row space-x-2">
            {/* Nav Buttons */}
            <button title="Center First Node" onClick={handleCenterFirst} className="p-2 text-white bg-gray-600 hover:bg-gray-500 rounded-md transition-colors duration-150"><HomeIcon className="w-4 h-4" /></button>
            <button title="Zoom In" onClick={handleZoomIn} className="p-2 text-white bg-gray-600 hover:bg-gray-500 rounded-md transition-colors duration-150"><MagnifyingGlassPlusIcon className="w-4 h-4" /></button>
            <button title="Reset Zoom" onClick={handleFitView} className="p-2 text-white bg-gray-600 hover:bg-gray-500 rounded-md transition-colors duration-150"><ArrowsPointingOutIcon className="w-4 h-4" /></button>
            <button title="Zoom Out" onClick={handleZoomOut} className="p-2 text-white bg-gray-600 hover:bg-gray-500 rounded-md transition-colors duration-150"><MagnifyingGlassMinusIcon className="w-4 h-4" /></button>
            <button title="Center Last Node" onClick={handleCenterLast} className="p-2 text-white bg-gray-600 hover:bg-gray-500 rounded-md transition-colors duration-150"><CursorArrowRaysIcon className="w-4 h-4" /></button>

            {/* Separator */}
            <div className="border-l border-gray-500 h-6 self-center mx-1"></div>

            {/* Dev Tool Toggles */}
            <button title="Toggle Node Inspector" onClick={() => setShowNodeInspector(s => !s)} className={`p-2 text-white rounded-md transition-colors duration-150 ${showNodeInspector ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 hover:bg-gray-500'}`}><CodeBracketSquareIcon className="w-4 h-4" /></button>
            <button title="Toggle Change Logger" onClick={() => setShowChangeLogger(s => !s)} className={`p-2 text-white rounded-md transition-colors duration-150 ${showChangeLogger ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 hover:bg-gray-500'}`}><QueueListIcon className="w-4 h-4" /></button>
            <button title="Toggle Viewport Logger" onClick={() => setShowViewportLogger(s => !s)} className={`p-2 text-white rounded-md transition-colors duration-150 ${showViewportLogger ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 hover:bg-gray-500'}`}><ViewfinderCircleIcon className="w-4 h-4" /></button>
            <button title="Toggle MiniMap" onClick={() => setShowMiniMap(s => !s)} className={`p-2 text-white rounded-md transition-colors duration-150 ${showMiniMap ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 hover:bg-gray-500'}`}><MapIcon className="w-4 h-4" /></button>
         </div>

         {/* Slider Row */}
         <div className="w-full px-2">
           <input
             type="range"
             min={minZoomSlider}
             max={maxZoomSlider}
             step="0.05"
             value={currentZoom}
             onChange={handleZoomSliderChange}
             className="w-full h-1 bg-gray-500 rounded-lg appearance-none cursor-pointer range-sm dark:bg-gray-700 accent-blue-500"
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
      <Flow {...props} />
      {/* ViewportLogger and ChangeLogger moved inside Flow */}
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

// --- START DevNodeInspector Components ---

// Helper component to display individual node info
interface DevNodeInfoProps {
  id: string;
  position: XYPosition;
  data?: any;
  width?: number | null;
  height?: number | null;
  selected?: boolean;
  dragging?: boolean;
  measured?: { width?: number | null; height?: number | null };
  parentId?: string;
}

function DevNodeInfo({ id, position, data, width, height, selected, dragging, measured, parentId }: DevNodeInfoProps) {
  // Use measured dimensions if available, otherwise fallback
  const nodeWidth = measured?.width ?? width ?? 0;
  const nodeHeight = measured?.height ?? height ?? 0;

  // Position the info to the LEFT of the node
  const style: React.CSSProperties = {
    position: 'absolute',
    left: position.x,
    top: position.y, // Align top edge with node's top edge
    transform: 'translateX(-100%)', // Shift left by its own width
    marginRight: '10px', // Add gap between inspector and node
    background: 'rgba(30, 30, 30, 0.85)',
    color: '#f0f0f0',
    padding: '4px 8px',
    fontSize: '11px',
    border: '1px solid #555',
    borderRadius: '4px',
    zIndex: 1000,
    whiteSpace: 'pre-wrap',
    maxWidth: '250px',
    fontFamily: 'monospace',
    pointerEvents: 'none',
    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
  };

  // Process data.answer for display (only if it exists and is a string)
  let answerPreview = "";
  let answerLength = 0;
  const isQuestionNode = data?.nodeType === 'llm-question'; // Check node type

  if (!isQuestionNode && data && typeof data.answer === 'string') {
    const lines = data.answer.split('\n');
    answerPreview = lines[0];
    if (lines.length > 1 || data.answer.length > 100) {
        answerPreview = answerPreview.substring(0, 100) + (lines.length > 1 || data.answer.length > 100 ? '...' : '');
    }
    answerLength = data.answer.length;
  }

  return (
    <div style={style}>
      <div>ID: {id}</div>
      {parentId && <div style={{ color: '#cbd5e0' }}>Parent: {parentId}</div>}
      {nodeWidth > 0 && nodeHeight > 0 ? (
          <div>Dim: {`${nodeWidth.toFixed(0)}x${nodeHeight.toFixed(0)}`}</div>
      ) : (
          <div style={{ color: '#a0aec0' }}>Dim: N/A</div>
      )}
      <div>Pos: {`x:${position.x.toFixed(0)},y:${position.y.toFixed(0)}`}</div>

      {/* Conditionally display answer info only for non-question nodes */}
      {!isQuestionNode && (
          <>
            <div>Answer: {answerPreview || (data?.answer ? '[non-string answer]' : 'N/A')}</div>
            {answerLength > 0 && <div style={{ color: '#a0aec0' }}>Length: {answerLength} chars</div>}
          </>
      )}
      {/* If it IS a question node, maybe show the question text? */}
      {isQuestionNode && data && typeof data.question === 'string' && (
           <div style={{ color: '#e2e8f0' }}>Q: {data.question.substring(0, 100)}{data.question.length > 100 ? '...' : ''}</div>
      )}

      {selected && <div style={{ color: '#63B3ED' }}>Selected</div>}
      {dragging && <div style={{ color: '#F6E05E' }}>Dragging</div>}
    </div>
  );
}

// The main NodeInspector component
function DevNodeInspector() {
  const nodes = useNodes();
  // Access nodeLookup from the store, which likely contains the internal node data
  const nodeLookup = useStore((state: ReactFlowState) => state.nodeLookup);

  return (
    <ViewportPortal>
      {nodes.map((node) => {
        // Get the potentially more detailed data from the lookup map
        const lookupNode = nodeLookup.get(node.id);

        // Prefer lookup node data if available, otherwise use the basic node object
        const nodeProps = lookupNode ? { ...lookupNode } : { ...node };

        return (
          <DevNodeInfo
            key={node.id}
            {...nodeProps} // Spread the potentially more complete lookup node data
          />
        )
      })}
    </ViewportPortal>
  );
}

// --- END DevNodeInspector Components ---
