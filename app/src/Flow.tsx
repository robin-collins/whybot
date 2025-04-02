import React, { useCallback, useEffect, useState } from "react";

import ReactFlow, {
  Controls,
  MiniMap,
  Background,
  Edge,
  Node,
  Position,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "reactflow";
import dagre from "dagre";

import "reactflow/dist/style.css";
import { FadeoutTextNode } from "./FadeoutTextNode";
import { DeletableEdge } from "./DeletableEdge";
import { NodeDims } from "./GraphPage";
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

const nodeTypes = { fadeText: FadeoutTextNode };
const edgeTypes = { deleteEdge: DeletableEdge };

// Layout the nodes automatically
const layoutElements = (
  nodes: Node[],
  edges: Edge[],
  nodeDims: NodeDims,
  direction = "LR"
) => {
  const isHorizontal = direction === "LR";
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 250;
  const nodeHeight = 170;
  dagreGraph.setGraph({ rankdir: direction, nodesep: 100 });

  nodes.forEach((node) => {
    if (node.id in nodeDims) {
      dagreGraph.setNode(node.id, {
        width: nodeDims[node.id]["width"],
        height: nodeDims[node.id]["height"],
      });
    } else {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    }
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    // Use the actual node dimensions from dagre for the offset calculation
    node.position = {
      x: nodeWithPosition.x - nodeWithPosition.width / 2 + 60,
      y: nodeWithPosition.y - nodeWithPosition.height / 2 + 60,
    };

    return node;
  });

  return { nodes, edges };
};

export const openai_browser = async (
  prompt: string,
  opts: {
    apiKey: string;
    model: string;
    temperature: number;
    onChunk: (chunk: string) => void;
  }
) => {
  return new Promise(async (resolve, reject) => {
    if (opts.temperature < 0 || opts.temperature > 1) {
      console.error(
        `Temperature is set to an invalid value: ${opts.temperature}`
      );
      return;
    }
    const params = {
      model: opts.model,
      stream: true,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant who always responds in English. Respond without any preamble, explanation, confirmation or commentary, just the final answer. Respond in markdown format if requested and make use of ## Headers, *italics*, **bold**, and lists as well as emoticons to make the answer more engaging. If requested to respond in JSON, only respond in JSON format, do not enclose it in ```json tags.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 200,
      temperature: opts.temperature,
      n: 1,
    };
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
    };
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "post",
      body: JSON.stringify(params),
      headers,
    });
    if (!response.body) {
      reject("Response body is null");
      return;
    }
    const reader = response.body
      .pipeThrough(new TextDecoderStream())
      .getReader();
    StreamLoop: while (true) {
      const { value } = await reader.read();
      if (value === undefined) {
        console.warn("Reader returned undefined value.");
        continue;
      }
      try {
        const maybeError = JSON.parse(value);
        if ("error" in maybeError) {
          reject(maybeError.error.message);
          break StreamLoop;
        }
      } catch (error) {}
      const lines = value.split("\n").filter((l) => l.trim() !== "");
      for (const line of lines) {
        const maybeJsonString = line.replace(/^data: /, "");
        console.log("maybeJsonString", maybeJsonString);
        if (maybeJsonString == "[DONE]") {
          resolve("stream is done");
          break StreamLoop;
        }
        try {
          const payload = JSON.parse(maybeJsonString);
          const completion = payload.choices[0].delta.content;
          if (completion != null) {
            opts.onChunk(completion);
          }
        } catch (error) {
          console.error(error);
          reject(error);
        }
      }
    }
  });
};

export const openai_server = async (
  prompt: string,
  opts: {
    model: string;
    temperature: number;
    onChunk: (chunk: string) => void;
  }
) => {
  const fingerprint = await getFingerprint();
  return new Promise((resolve, reject) => {
    if (opts.temperature < 0 || opts.temperature > 1) {
      console.error(
        `Temperature is set to an invalid value: ${opts.temperature}`
      );
      return;
    }
    // Establish a WebSocket connection to the server
    const ws = new WebSocket(`${SERVER_HOST_WS}/ws?fp=${fingerprint}`);
    // Send a message to the server to start streaming
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          prompt,
          model: opts.model,
          temperature: opts.temperature,
        })
      );
    };
    // Listen for streaming data from the server
    ws.onmessage = (event) => {
      const message = event.data;
      // Check if the stream has ended
      if (message === "[DONE]") {
        console.log("Stream has ended");
        resolve(message);
        ws.close();
      } else {
        // Handle streaming data
        // console.log("Received data:", message);
        // Send data to be displayed
        opts.onChunk(message);
      }
    };

    // Handle the WebSocket "error" event
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      reject(error);
    };

    // Handle the WebSocket "close" event
    ws.onclose = (event) => {
      console.log("WebSocket connection closed:", event);
    };
  });
};

// Function to get streaming openai completion
export const openai = async (
  prompt: string,
  opts: {
    apiKey?: string;
    model: string;
    temperature: number;
    onChunk: (chunk: string) => void;
  }
) => {
  if (opts.apiKey) {
    console.log("you are using the browser api key");
    return openai_browser(prompt, {
      apiKey: opts.apiKey,
      model: opts.model,
      temperature: opts.temperature,
      onChunk: opts.onChunk,
    });
  }
  return openai_server(prompt, {
    model: opts.model,
    temperature: opts.temperature,
    onChunk: opts.onChunk,
  });
};

type FlowProps = {
  flowNodes: Node[];
  flowEdges: Edge[];
  nodeDims: NodeDims;
  deleteBranch: (id: string) => void;
};
export const Flow: React.FC<FlowProps> = (props) => {
  const [nodes, setNodes, onNodesChangeDefault] = useNodesState<Node[]>(
    props.flowNodes
  );
  const [edges, setEdges, onEdgesChangeDefault] = useEdgesState<Edge[]>(
    props.flowEdges
  );
  const { fitView, zoomIn, zoomOut, setCenter, getNodes, getViewport, setViewport, zoomTo } = useReactFlow();
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

  const laid = React.useMemo(
    () => {
      // No filtering: Pass all nodes to layoutElements.
      // It will use defaults if dims aren't ready.
      // The useMemo dependency on props.nodeDims will trigger re-layout when dimensions update.
      return layoutElements(nodes, edges, props.nodeDims);
    },
    [nodes, edges, props.nodeDims]
  );

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

  const handleCenterNode = useCallback((nodeId: string | null) => {
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
  }, [getNodes, setCenter]);


  const handleCenterFirst = useCallback(() => {
    // Assuming the first question node ID follows the pattern 'q-...' and starts from 'q-0' or similar lowest number.
    // A more robust way might involve sorting nodes or checking for a specific 'isInitial' flag if available.
    const allNodes = getNodes();
    const firstQNode = allNodes.find(n => n.id.startsWith('q-') && !n.data?.parent); // Simple check for a root question node
    handleCenterNode(firstQNode?.id ?? null);
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

  const handleZoomSliderChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      const newZoom = parseFloat(event.target.value);
      zoomTo(newZoom, { duration: 50 }); // Use zoomTo for smoother slider interaction
      setCurrentZoom(newZoom); // Update slider state immediately
  }, [zoomTo]);
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
        minZoom={minZoomSlider}
        maxZoom={maxZoomSlider}
        onViewportChange={(_viewport) => setCurrentZoom(_viewport.zoom)}
      >
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
      {/* Custom Controls Overlay - Horizontal, Improved Styling, Icons, Slider */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center p-2 bg-gray-800 bg-opacity-70 rounded-lg shadow-lg space-y-2">
        {/* Icon Buttons Row */}
        <div className="flex flex-row space-x-2">
           <button title="Center First Node" onClick={handleCenterFirst} className="p-2 text-white bg-gray-600 hover:bg-gray-500 rounded-md transition-colors duration-150">
               <HomeIcon className="w-4 h-4" />
           </button>
           <button title="Zoom In" onClick={handleZoomIn} className="p-2 text-white bg-gray-600 hover:bg-gray-500 rounded-md transition-colors duration-150">
               <MagnifyingGlassPlusIcon className="w-4 h-4" />
           </button>
           <button title="Reset Zoom" onClick={handleFitView} className="p-2 text-white bg-gray-600 hover:bg-gray-500 rounded-md transition-colors duration-150">
               <ArrowsPointingOutIcon className="w-4 h-4" />
           </button>
           <button title="Zoom Out" onClick={handleZoomOut} className="p-2 text-white bg-gray-600 hover:bg-gray-500 rounded-md transition-colors duration-150">
               <MagnifyingGlassMinusIcon className="w-4 h-4" />
           </button>
           <button title="Center Last Node" onClick={handleCenterLast} className="p-2 text-white bg-gray-600 hover:bg-gray-500 rounded-md transition-colors duration-150">
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
};

type FlowProviderProps = {
  flowNodes: Node[];
  flowEdges: Edge[];
  nodeDims: NodeDims;
  deleteBranch: (id: string) => void;
};
export const FlowProvider: React.FC<FlowProviderProps> = (props) => {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
};
