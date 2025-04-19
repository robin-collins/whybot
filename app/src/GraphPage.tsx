import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FlowProvider } from "./Flow";
import {
  Edge,
  Node,
  Position,
  OnConnectStart,
  OnConnectStartParams,
} from "@xyflow/react";
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/solid";
import { closePartialJson, downloadDataAsJson } from "./util/json";
import { SERVER_HOST } from "./constants";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import {
  QATree,
  QATreeNode,
  NodeDims,
  NodeType,
} from "./types";
import { InteractiveNodeData, InteractiveNode } from "./InteractiveNode";
import { AddNodeModal } from "./AddNodeModal";
import { useAppStore } from "./store/appStore";
import { useShallow } from "zustand/react/shallow";
import { MODELS } from "./models";
import dagre from "dagre";

interface GraphPageProps {
  seedQuery: string;
  onExit: () => void;
  shouldAutoAnswerSeed?: boolean;
  clearAutoAnswerSeed?: () => void;
}

// Type for the promise returned by window.openai, including the cleanup method
type OpenAIPromise = Promise<void> & { cleanup?: () => void };

// --- Define layoutElements function separately ---
const layoutElements = (
  nodes: Node[],
  edges: Edge[],
  nodeDims: NodeDims,
  direction = "LR"
) => {
  // Removed debug logging
  const isHorizontal = direction === "LR";
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const defaultNodeWidth = 250;
  const defaultNodeHeight = 170;
  dagreGraph.setGraph({ rankdir: direction, nodesep: 125, ranksep: 200 }); // Halved spacing

  if (!nodes || nodes.length === 0) {
      console.warn("layoutElements called with no nodes.");
      return { nodes: [], edges: [] };
  }

  nodes.forEach((node) => {
    const nodeSpecificDims = nodeDims[node.id];
    const width = nodeSpecificDims?.width ?? defaultNodeWidth;
    const height = nodeSpecificDims?.height ?? defaultNodeHeight;

    // Removed debug log for missing dimensions

    // Removed debug log for expanded parent dimensions

    dagreGraph.setNode(node.id, {
        width: width,
        height: height,
    });
  });

  edges.forEach((edge) => {
    // Ensure source and target exist before setting edge
    if (dagreGraph.hasNode(edge.source) && dagreGraph.hasNode(edge.target)) {
        dagreGraph.setEdge(edge.source, edge.target);
    } else {
        console.warn(`layoutElements: Skipping edge ${edge.id} because source or target node not found in graph.`);
    }
  });

  try {
      dagre.layout(dagreGraph);
  } catch (e) {
      console.error("Dagre layout failed:", e);
      // Return original nodes/edges or throw?
      // For now, return nodes with potentially incorrect positions
      return { nodes, edges };
  }

  // Create a *new* array for laid out nodes to ensure immutability
  const laidOutNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    // Removed specific node position debug log

    if (nodeWithPosition) {
      return {
        ...node,
        targetPosition: isHorizontal ? Position.Left : Position.Top,
        sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
        position: {
          x: nodeWithPosition.x - (nodeWithPosition.width / 2),
          y: nodeWithPosition.y - (nodeWithPosition.height / 2),
        },
      };
    } else {
      // Return the original node if Dagre didn't process it
      // console.warn(`Node ${node.id} was not laid out by Dagre.`);
      return node;
    }
  });

  return { nodes: laidOutNodes, edges };
  // console.log("function layoutElements finished");
};
// --- End layoutElements ---

const DEFAULT_NODE_WIDTH = 250;
const DEFAULT_NODE_HEIGHT = 170;

// --- Modify convertTreeToFlow to NOT call layout ---
export const convertTreeToFlow = (
  tree: QATree,
  setNodeDimsStateSetter: React.Dispatch<React.SetStateAction<NodeDims>>,
  requestDeleteBranch: (targetNodeId: string) => void,
  generateAnswerForNode: (nodeId: string) => Promise<void>,
  answeringNodes: Set<string>,
  isGenerating: boolean,
  currentNodeDims: NodeDims
): { nodes: Node[]; edges: Edge[] } => {
  // Removed debug log
  const nodes: Node<InteractiveNodeData>[] = [];
  const edges: Edge[] = [];

  // Pass 1: Create nodes for non-answer types
  Object.values(tree).forEach((nodeData) => {
    if (!nodeData || !nodeData.nodeID) return;
    if (nodeData.nodeType !== 'llm-answer') {
      const dims = currentNodeDims[nodeData.nodeID] ?? { width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT };
      nodes.push({
        id: nodeData.nodeID,
        type: 'interactiveNode',
        data: {
          ...nodeData,
          nodeID: nodeData.nodeID,
          setNodeDims: setNodeDimsStateSetter,
          currentDims: currentNodeDims[nodeData.nodeID] ?? { width: 0, height: 0 },
          onGenerateAnswer:
            (nodeData.nodeType === 'llm-question' || nodeData.nodeType === 'user-question')
              ? generateAnswerForNode
              : undefined,
          isAnswering:
            (nodeData.nodeType === 'llm-question' || nodeData.nodeType === 'user-question') &&
            answeringNodes.has(nodeData.nodeID),
        },
        position: { x: 0, y: 0 }, // Default position, layout happens later
        width: dims.width,
        height: dims.height,
      });
    }
  });

  // Pass 2: Create nodes for answer types
  Object.values(tree).forEach((nodeData) => {
    if (!nodeData || nodeData.nodeType !== 'llm-answer' || !nodeData.nodeID) return;
    if (nodes.some((n) => n.id === nodeData.nodeID)) return;
    const dims = currentNodeDims[nodeData.nodeID] ?? { width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT };
    nodes.push({
      id: nodeData.nodeID,
      type: 'interactiveNode',
      data: {
        ...nodeData,
        nodeID: nodeData.nodeID,
        setNodeDims: setNodeDimsStateSetter,
        currentDims: currentNodeDims[nodeData.nodeID] ?? { width: 0, height: 0 },
        onGenerateAnswer: undefined,
        isAnswering: false,
      },
      position: { x: 0, y: 0 }, // Default position
      width: dims.width,
      height: dims.height,
    });
  });

  // Pass 3: Create edges from parent/child relationships
  Object.values(tree).forEach((nodeData) => {
    if (nodeData && nodeData.nodeID && nodeData.children) {
      nodeData.children.forEach((childId) => {
        // Check if both source and target nodes exist before creating edge
        if (tree[nodeData.nodeID] && tree[childId]) {
          const edgeId = `e-${nodeData.nodeID}-${childId}`;
          // Add the edge type explicitly
          edges.push({
            id: edgeId,
            source: nodeData.nodeID,
            target: childId,
            type: 'deleteEdge',
            data: {
              // Pass necessary data for the custom edge here
              requestDeleteBranch: requestDeleteBranch,
              targetNodeId: childId, // Pass target ID for deletion logic
            },
          });
        } else {
          console.warn(
            `convertTreeToFlow: Skipping edge creation for missing node. Source: ${nodeData.nodeID}, Child: ${childId}`
          );
        }
      });
    }
  });

  return { nodes, edges }; // Return nodes with default positions
  // console.log("function convertTreeToFlow finished");
};
// --- End convertTreeToFlow modification ---

async function getQuestions(
  nodeId: string,
  activePromisesRef: React.MutableRefObject<Map<string, OpenAIPromise>>
): Promise<void> {
  const { qaTree: treeSnapshot, model: modelStoreKey, persona, addNode, updateNode, setError } = useAppStore.getState();
  const node = treeSnapshot?.[nodeId];

  if (!node) {
    console.error(`Node ${nodeId} not found in tree for getQuestions`);
    setError(`Node ${nodeId} not found.`);
    return;
  }

  // Add null check for persona
  if (!persona) {
    setError("Persona not selected for generating questions.");
    return;
  }

  const getAncestorContext = (currentId: string): string => {
    let context = "";
    let current = treeSnapshot?.[currentId];
    while (current?.parent && treeSnapshot?.[current.parent]) {
      const parent = treeSnapshot[current.parent];
      if (parent.nodeType === "user-file" || parent.nodeType === "user-webpage") {
        context = `\n\nContext from ${parent.nodeType} (${parent.nodeID}):\n${parent.answer}\n\n` + context;
      }
      current = parent;
    }
    return context;
  };
  const ancestorContext = getAncestorContext(nodeId);

  // Use persona.name or default for system prompt, DO NOT use persona.prompt directly
  const systemPrompt = `You are a helpful AI assistant named ${persona.name}.`;

  const requestBody = {
    model: modelStoreKey,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `${ancestorContext}Question: ${node.question}\nAnswer: ${node.answer}\n\nGenerate 3 follow-up questions based ONLY on the Answer provided above. Output only a valid JSON array of strings, like ["Question 1?", "Question 2?", "Question 3?"]`,
      },
    ],
    temperature: 0.5,
    response_format: { type: "json_object" },
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText} - ${errorData?.error?.message}`
      );
    }

    const result = await response.json();
    const messageContent = result.choices[0]?.message?.content;

    if (!messageContent) {
      throw new Error("No content received from OpenAI API");
    }

    let parsedQuestions: { question: string }[] = [];
    try {
      const rawQuestions = JSON.parse(closePartialJson(messageContent));
      if (Array.isArray(rawQuestions) && rawQuestions.every(q => typeof q === 'string')) {
        parsedQuestions = rawQuestions.map((q: string) => ({ question: q }));
      } else {
        throw new Error("Parsed content is not an array of strings");
      }
    } catch (jsonError) {
      console.error("Failed to parse OpenAI JSON response:", jsonError, "\nContent:", messageContent);
      setError(`Failed to parse follow-up questions from AI: ${String(jsonError)}`);
      return;
    }

    syncChildrenWithStore(nodeId, parsedQuestions);

  } catch (err: any) {
    console.error("Error fetching questions from OpenAI:", err);
    setError(`Error generating questions: ${err.message}`);
  }
}

// Refactored logic to sync generated questions with Zustand store
const syncChildrenWithStore = (
  parentNodeId: string,
  generatedQuestions: { question: string }[]
) => {
  const { qaTree: currentTree, addNode } = useAppStore.getState();
  if (!currentTree) {
      console.error("syncChildrenWithStore: qaTree is null.");
      return;
  }
  const parentNode = currentTree[parentNodeId];

  if (!parentNode) {
    console.error(`Parent node ${parentNodeId} not found for syncing children.`);
    return;
  }

  const newChildrenIds: string[] = [];

  generatedQuestions.forEach((q, index) => {
    const childNodeId = `${parentNodeId}-q${index}`;
    const newNode: QATreeNode = {
      nodeID: childNodeId,
      nodeType: "llm-question",
      question: q.question,
      answer: "",
      parent: parentNodeId,
      children: [],
    };
    addNode(newNode);
    newChildrenIds.push(childNodeId);
  });
};

const generateAnswerForNode = async (
  nodeId: string,
  activePromisesRef: React.MutableRefObject<Map<string, OpenAIPromise>>
) => {
  const {
    qaTree: treeSnapshot,
    model: modelStoreKey,
    persona,
    updateNode,
    addNode,
    setError,
  } = useAppStore.getState();

  const node = treeSnapshot?.[nodeId];

  if (!node || !persona || !treeSnapshot) { // Add null checks
    setError(`Cannot generate answer: Missing node, persona, or tree state for ${nodeId}.`);
    return;
  }

  updateNode(nodeId, { startedProcessing: true, answer: "" });

  const getAncestorContext = (currentId: string): string => {
    let context = "";
    let current = treeSnapshot?.[currentId]; // treeSnapshot is guaranteed non-null here
    while (current?.parent && treeSnapshot?.[current.parent]) {
      const parent = treeSnapshot[current.parent];
      if (parent.nodeType === "user-file" || parent.nodeType === "user-webpage") {
        context = `\n\nContext from ${parent.nodeType} (${parent.nodeID}):\n${parent.answer}\n\n` + context;
      }
      current = parent;
    }
    return context;
  };
  const ancestorContext = getAncestorContext(nodeId);

  let prompt = "";
  if (typeof persona.getPromptForAnswer === 'function') {
      try {
        // Pass treeSnapshot which is confirmed non-null
        prompt = persona.getPromptForAnswer(node, treeSnapshot);
        if (ancestorContext) {
            prompt = `Background Context:\n${ancestorContext}\n\n---\n\n${prompt}`;
        }
      } catch (e: any) {
        console.error(`Error getting prompt from persona ${persona.name} for node ${nodeId}:`, e);
        setError(`Error getting prompt: ${e.message}`);
        updateNode(`a-${nodeId}`, { errorMessage: `Persona prompt error: ${e.message}` });
        updateNode(nodeId, { startedProcessing: false });
        return;
      }
  } else {
      // Fallback if getPromptForAnswer doesn't exist
      console.warn("Using fallback prompt generation as getPromptForAnswer not found on persona.");
      prompt = `Answer the following question, considering the preceding context if any.\n\n${ancestorContext}Question: ${node.question}\nAnswer:`;
  }

  const answerNodeId = `a-${nodeId}`;

  // Create the answer node structure BEFORE starting the stream
  const answerNode: QATreeNode = {
    nodeID: answerNodeId,
    nodeType: "llm-answer",
    question: "Answer",
    answer: "",
    parent: nodeId,
    children: [],
    startedProcessing: false,
  };
  addNode(answerNode); // Add the initial answer node to the store

  let accumulatedAnswer = "";

  try {
    const promise = window.openai(prompt, {
      model: modelStoreKey,
      temperature: 0.7,
      nodeId: nodeId,
      onChunk: (chunk) => {
        if (typeof chunk === 'string') {
          accumulatedAnswer += chunk;
          updateNode(answerNodeId, { answer: accumulatedAnswer });
        }
      },
    });

    activePromisesRef.current.set(nodeId, promise);
    await promise;
    await getQuestions(answerNodeId, activePromisesRef);

  } catch (err: any) {
    console.error("Error streaming answer from OpenAI:", err);
    setError(`Error generating answer: ${err.message}`);
    updateNode(answerNodeId, {
      answer: `Error generating answer: ${err.message}`,
      nodeType: "llm-answer",
    });
  } finally {
    updateNode(nodeId, { startedProcessing: false });
    if (activePromisesRef.current.has(nodeId)) {
        activePromisesRef.current.delete(nodeId);
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
};

function GraphPage(props: GraphPageProps) {
  const { seedQuery, onExit, shouldAutoAnswerSeed, clearAutoAnswerSeed } = props;
  const {
    qaTree,
    addNode,
    updateNode,
    setModel,
    setPersona,
    setFocusedId: setZustandFocusedId,
    setError,
  } = useAppStore(
    useShallow((state) => ({
      qaTree: state.qaTree,
      addNode: state.addNode,
      updateNode: state.updateNode,
      setModel: state.setModel,
      setPersona: state.setPersona,
      setFocusedId: state.setFocusedId,
      setError: state.setError,
    }))
  );
  const [nodeDims, setNodeDims] = useState<NodeDims>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [addNodePosition, setAddNodePosition] = useState<{ x: number; y: number } | null>(null);
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
  const [answeringNodes, setAnsweringNodes] = useState<Set<string>>(new Set());
  const activePromises = useRef<Map<string, OpenAIPromise>>(new Map());

  // Initialize tree with seed query
  useEffect(() => {
    const initialNodeId = "0";
    // Add explicit null check for qaTree
    if (qaTree && !qaTree[initialNodeId]) {
      const seedNode: QATreeNode = {
        nodeID: initialNodeId,
        nodeType: "user-question",
        question: seedQuery,
        answer: "",
        children: [],
      };
      addNode(seedNode);
      if (shouldAutoAnswerSeed) {
        setTimeout(() => {
          void generateAnswerForNode(initialNodeId, activePromises);
          clearAutoAnswerSeed?.();
        }, 100);
      }
    }
  }, [seedQuery, addNode, qaTree, shouldAutoAnswerSeed, clearAutoAnswerSeed]);

  // Cleanup active promises on unmount
  useEffect(() => {
    const currentActivePromises = activePromises.current;
    return () => {
      console.log("GraphPage unmounting, cleaning up active promises...");
      currentActivePromises.forEach((promise) => {
        promise.cleanup?.();
      });
      currentActivePromises.clear();
    };
  }, []);

  const requestDeleteBranch = useCallback((targetNodeId: string) => {
    setNodeToDelete(targetNodeId);
    setShowDeleteModal(true);
  }, []);

  const confirmDeleteBranch = useCallback(() => {
    if (nodeToDelete) {
      // deleteNodes(nodeToDelete); // Still commented out
      console.warn("Delete functionality commented out as deleteNodes action is missing from Zustand store.");
      setError("Delete functionality is currently disabled.");
    }
    setShowDeleteModal(false);
    setNodeToDelete(null);
  }, [nodeToDelete, setError]);

  const cancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setNodeToDelete(null);
  }, []);

  const { nodes: flowNodes, edges: flowEdges } = useMemo(() => {
    if (!qaTree) return { nodes: [], edges: [] };
    const { nodes, edges } = convertTreeToFlow(
      qaTree,
      setNodeDims,
      requestDeleteBranch,
      (id) => generateAnswerForNode(id, activePromises),
      answeringNodes,
      false,
      nodeDims
    );
    return layoutElements(nodes, edges, nodeDims);
  }, [qaTree, nodeDims, requestDeleteBranch, answeringNodes]);

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setZustandFocusedId(node.id);
    },
    [setZustandFocusedId]
  );

  const openAddNodeModal = (position: { x: number; y: number }) => {
    setAddNodePosition(position);
    setShowAddNodeModal(true);
  };

  const handleAddNodeFromModal = (type: NodeType) => {
    if (!addNodePosition || !connectingNodeId || !qaTree) {
         console.error("Cannot add node: Missing position, connecting node ID, or tree state.");
         return;
    }
    if (!connectingNodeId) {
        console.error("Cannot add node: connectingNodeId is null unexpectedly.");
        return;
    }
    const parentNode = qaTree[connectingNodeId];
    if (!parentNode) {
      console.error("Parent node not found for adding new node");
      return;
    }

    const newNodeId = `${parentNode.nodeID}-${type.substring(0,2)}-${Date.now()}`;
    let newNodeData: Partial<QATreeNode> = {};
    let userInput: string | null = null; // Use specific var for prompt result

    switch (type) {
      case 'user-question':
        userInput = prompt("Enter your question:", "New Question");
        // Check if prompt returned non-null and non-empty string
        if (userInput !== null && userInput.trim() !== "") {
          newNodeData = { question: userInput, answer: "" };
        }
        break;
      case 'user-file':
        alert("File upload node not implemented yet.");
        break;
      case 'user-webpage':
        userInput = prompt("Enter URL:", "https://");
        // Check if prompt returned non-null and non-empty string
        if (userInput !== null && userInput.trim() !== "") {
          newNodeData = { url: userInput, question: `Content from ${userInput}`, answer: "Loading..." };
        }
        break;
      default:
        console.warn("Unsupported node type for manual add:", type);
        return;
    }

    if (!connectingNodeId) { // Re-check just before creating node
        console.error("Cannot create node: connectingNodeId became null unexpectedly.");
        return;
    }

    if (Object.keys(newNodeData).length > 0) {
      const newNode: QATreeNode = {
        nodeID: newNodeId,
        nodeType: type,
        parent: connectingNodeId, // Now guaranteed non-null by check above
        children: [],
        ...newNodeData,
      } as QATreeNode;
      addNode(newNode);
    }

    setShowAddNodeModal(false);
    setAddNodePosition(null);
    setConnectingNodeId(null);
  };

  const onConnectStart = useCallback((_: React.MouseEvent | React.TouchEvent, { nodeId }: OnConnectStartParams) => {
      setConnectingNodeId(nodeId);
  }, []);

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const targetIsPane = event.target instanceof Element && event.target.classList.contains("react-flow__pane");
      if (targetIsPane && connectingNodeId) {
        const position = addNodePosition ?? { x: (event as MouseEvent).clientX, y: (event as MouseEvent).clientY };
        openAddNodeModal(position);
      } else {
        setConnectingNodeId(null);
        setAddNodePosition(null);
      }
    },
    [connectingNodeId, addNodePosition]
  );

  return (
    <div className="flex h-screen flex-col relative">
      {/* Header Bar */}
      <div className="bg-gray-800 text-white p-2 flex items-center justify-between z-20">
        <button onClick={onExit} className="p-1 hover:bg-gray-700 rounded">
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">WhyBot Graph</h1>
        <div>
          <button onClick={() => downloadDataAsJson(qaTree, 'whybot-graph.json')} className="p-1 hover:bg-gray-700 rounded" title="Download Graph Data (JSON)">
            <ArrowDownTrayIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Global Error Display - Commented out */}

      <div className="flex-grow relative">
        <FlowProvider
          flowNodes={flowNodes}
          flowEdges={flowEdges}
          nodeDims={nodeDims}
          deleteBranch={requestDeleteBranch}
          onConnectStart={onConnectStart as any} // Keep cast
          onConnectEnd={onConnectEnd as any}     // Keep cast
        />
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDeleteBranch}
        // Removed nodeId prop
      />
      <AddNodeModal
        isOpen={showAddNodeModal}
        onClose={() => {
            setShowAddNodeModal(false);
            setAddNodePosition(null);
            setConnectingNodeId(null);
        }}
        onAddNode={handleAddNodeFromModal}
        // Add required sourceNodeId prop
        sourceNodeId={connectingNodeId ?? ""} // Pass connectingNodeId, fallback to empty string
      />

    </div>
  );
}

export default GraphPage;