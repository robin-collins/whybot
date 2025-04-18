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
  MarkerType,
  Node,
  Position,
  OnConnectStart,
} from "@xyflow/react";
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  PauseIcon,
  PlayIcon,
} from "@heroicons/react/24/solid";
import { closePartialJson, downloadDataAsJson } from "./util/json";
import { SERVER_HOST } from "./constants";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import {
  QATree,
  QATreeNode,
  NodeDims,
  NodeType,
  ScoredQuestion,
} from "./types";
import { InteractiveNodeData, InteractiveNode } from "./InteractiveNode";
import { AddNodeModal } from "./AddNodeModal";
import { useAppStore } from "./store/appStore";
import { useShallow } from "zustand/react/shallow";
import { Persona } from "./personas";
import { Model, MODELS } from "./models";
import dagre from "dagre";

interface GraphPageProps {
  seedQuery: string;
  onExit: () => void;
  shouldAutoAnswerSeed?: boolean;
  clearAutoAnswerSeed?: () => void;
}

// Type for the promise returned by window.openai, including the cleanup method
type OpenAIPromise = Promise<void> & { cleanup?: () => void };

type ConvertTreeToFlowProps = (
  tree: QATree,
  setNodeDimsStateSetter: React.Dispatch<React.SetStateAction<NodeDims>>,
  requestDeleteBranch: (edgeId: string) => void,
  generateAnswerForNode: (nodeId: string) => Promise<void>,
  answeringNodes: Set<string>,
  isGenerating: boolean,
  currentNodeDims: NodeDims
) => { nodes: Node<InteractiveNodeData>[]; edges: Edge[] };

// --- Define layoutElements function separately ---
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

  const defaultNodeWidth = 250;
  const defaultNodeHeight = 170;
  dagreGraph.setGraph({ rankdir: direction, nodesep: 125, ranksep: 200 }); // Halved spacing

  if (!nodes || nodes.length === 0) {
      console.warn("layoutElements called with no nodes.");
      return { nodes: [], edges: [] };
  }

  nodes.forEach((node) => {
    // Re-enable dynamic dims, using v12's node.measured
    const width = node.measured?.width ?? defaultNodeWidth;
    const height = node.measured?.height ?? defaultNodeHeight;
    dagreGraph.setNode(node.id, {
        width: width, // Use calculated width
        height: height, // Use calculated height
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

    // --- DEBUG LOGGING START ---
    if (node.id === 'q-0' || node.id === 'a-q-0') {
      console.log(`Dagre calculated position for ${node.id}:`, nodeWithPosition);
    }
    // --- DEBUG LOGGING END ---

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
  console.log("function layoutElements finished");
};
// --- End layoutElements ---

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
  console.log("function convertTreeToFlow started");
  const nodes: Node<InteractiveNodeData>[] = [];
  const edges: Edge[] = [];
  console.log(
    `convertTreeToFlow: Processing tree with ${Object.keys(tree).length} nodes.`
  );

  // Pass 1: Create nodes for non-answer types
  Object.values(tree).forEach((nodeData) => {
    if (!nodeData || !nodeData.nodeID) return;
    if (nodeData.nodeType !== 'llm-answer') {
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
      });
    }
  });

  // Pass 2: Create nodes for answer types
  Object.values(tree).forEach((nodeData) => {
    if (!nodeData || nodeData.nodeType !== 'llm-answer' || !nodeData.nodeID) return;
    if (nodes.some(n => n.id === nodeData.nodeID)) return;
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
    });
  });

  // Pass 3: Create Edges
  Object.values(tree).forEach((nodeData) => {
      if (!nodeData || !nodeData.nodeID) return;

      const parentId = nodeData.parent;
      const targetId = nodeData.nodeID;

      if (parentId && tree[parentId]) {
          const parentNodeData = tree[parentId];
          let sourceId = parentId;
          if ((parentNodeData.nodeType === "llm-question" || parentNodeData.nodeType === "user-question") && tree[`a-${parentId}`]) {
             sourceId = `a-${parentId}`;
          }
          if (nodes.some((n) => n.id === sourceId) && nodes.some((n) => n.id === targetId)) {
             edges.push({
                id: `${sourceId}-${targetId}`,
                type: "bezier",
                source: sourceId,
                target: targetId,
                data: { requestDeleteBranch, targetNodeId: targetId },
                animated: isGenerating,
                markerEnd: { type: MarkerType.Arrow }
             });
          }
      }

      if ((nodeData.nodeType === "llm-question" || nodeData.nodeType === "user-question")) {
          const questionNodeId = nodeData.nodeID;
          const answerNodeId = `a-${questionNodeId}`;
          if (tree[answerNodeId]) {
              if (nodes.some((n) => n.id === questionNodeId) && nodes.some((n) => n.id === answerNodeId)) {
                  edges.push({
                    id: `${questionNodeId}-${answerNodeId}`,
                    type: "bezier",
                    source: questionNodeId,
                    target: answerNodeId,
                    animated: isGenerating,
                    markerEnd: { type: MarkerType.Arrow },
                    data: { requestDeleteBranch, targetNodeId: answerNodeId }
                  });
              }
          }
      }
  });

  console.log(
    `convertTreeToFlow: Finished generating raw elements. Nodes: ${nodes.length}, Edges: ${edges.length}`
  );
  return { nodes, edges }; // Return nodes with default positions
  console.log("function convertTreeToFlow finished");
  return { nodes, edges }; // Return nodes with default positions
};
// --- End convertTreeToFlow modification ---

async function getQuestions(
  nodeId: string,
  activePromisesRef: React.MutableRefObject<Map<string, OpenAIPromise>> // Pass ref
): Promise<void> {
  console.log("function getQuestions started");
  const { qaTree: treeSnapshot, model: modelStoreKey, persona, addNode, updateNode, setError } = useAppStore.getState();
  const node = treeSnapshot?.[nodeId];

  if (!node) {
    console.error(`getQuestions: Node ${nodeId} not found in store.`);
    setError(`Node ${nodeId} disappeared before generating questions.`);
    return;
  }

  if (node.nodeType !== 'llm-answer') {
    console.warn(`getQuestions: Called on non-answer node type ${node.nodeType} for node ${nodeId}. Skipping.`);
    return;
  }

  console.log(`Refactored getQuestions: Processing node ${node.nodeID}`);

  if (!persona) {
    console.error("getQuestions: Missing persona in store.");
    setError(
      `Missing persona for question generation (node ${node.nodeID})`
    );
    return;
  }

  const person = persona;

  const modelInfo = MODELS[modelStoreKey];
  const actualModelKey = modelInfo ? modelInfo.key : modelStoreKey;
  if (!modelInfo) {
    console.warn(`Model key "${modelStoreKey}" not found in MODELS dictionary. Sending raw key.`);
  }

  const syncChildrenWithStore = (
    parentNodeId: string,
    generatedQuestions: { question: string }[]
  ) => {
    const questionNodeId = parentNodeId.startsWith('a-') ? parentNodeId.substring(2) : null;
    if (!questionNodeId) {
      console.error(`syncChildrenWithStore: Could not derive question node ID from answer node ${parentNodeId}`);
      return;
    }
    const latestQuestionNode = useAppStore.getState().qaTree?.[questionNodeId];
    if (!latestQuestionNode) {
      console.warn(
        `syncChildrenWithStore: Question node ${questionNodeId} (derived from ${parentNodeId}) not found in store.`
      );
      return;
    }

    const currentChildrenIds = latestQuestionNode.children || [];
    const existingChildren = currentChildrenIds
      .map((id) => useAppStore.getState().qaTree?.[id])
      .filter(Boolean) as QATreeNode[];

    generatedQuestions.forEach((qData, index) => {
      const newQuestionText = qData.question;
      if (!newQuestionText) return;

      const newId = `${questionNodeId}-q-${index}`;

      const existingChildWithId = useAppStore.getState().qaTree?.[newId];

      if (existingChildWithId) {
        if (existingChildWithId.question !== newQuestionText) {
          console.log(
            `getQuestions: Updating existing child ${newId} question for parent ${questionNodeId}`
          );
          updateNode(newId, { question: newQuestionText });
        }
      } else {
        console.log(
          `getQuestions: Adding new child ${newId} for parent ${questionNodeId}`
        );
        const newNode: QATreeNode = {
          nodeID: newId,
          parent: parentNodeId,
          question: newQuestionText,
          answer: "",
          nodeType: "llm-question",
          children: [],
        };
        addNode(newNode);
      }
    });
  };

  const streamNodeId = `qgen-${node.nodeID}`;
  let questionsPromise: OpenAIPromise = Promise.resolve() as OpenAIPromise;

  if ("getQuestions" in person && person.getQuestions) {
    const questions = person.getQuestions(node, treeSnapshot || {});
    console.log(
      `getQuestions: Synchronously generated ${questions.length} questions for ${node.nodeID}`
    );
    syncChildrenWithStore(node.nodeID, questions);
  } else if ("getPromptForQuestions" in person && person.getPromptForQuestions) {
    const promptForQuestions = person.getPromptForQuestions(node, treeSnapshot || {});
    let questionsJson = "";
    let finalError: string | null = null;

    questionsPromise = window.openai(promptForQuestions, {
      temperature: 1,
      model: actualModelKey,
      nodeId: streamNodeId,
      onChunk: (content) => {
        try {
          const message = JSON.stringify({ type: 'chunk', nodeId: streamNodeId, content });
          const parsed = JSON.parse(message);

          if (parsed.nodeId !== streamNodeId) return;

          if (parsed.type === "chunk" && parsed.content) {
            questionsJson += parsed.content;
            const closedJson = closePartialJson(questionsJson);
            try {
              const parsedQuestions = JSON.parse(closedJson);
              if (Array.isArray(parsedQuestions)) {
                syncChildrenWithStore(node.nodeID, parsedQuestions);
              }
            } catch (e) { /* Ignore intermediate parse errors */ }
          }
        } catch (e: any) {
          console.error(
            `Error processing WebSocket message content in getQuestions (node ${node.nodeID}):`,
            content,
            e
          );
        }
      },
    }) as OpenAIPromise;

    // Store the promise reference
    activePromisesRef.current.set(streamNodeId, questionsPromise);

    questionsPromise.catch((error: any) => {
      console.error(
        `Error during openai call for getQuestions (node ${node.nodeID}):`,
        error
      );
      finalError = error?.message || `OpenAI call failed for node ${node.nodeID}`;
      setError(finalError);
      throw error;
    }).finally(() => {
      // Remove the promise reference on completion/failure
      activePromisesRef.current.delete(streamNodeId);
      if (!finalError) {
        try {
          const finalQuestions = JSON.parse(questionsJson);
          if (Array.isArray(finalQuestions)) {
            console.log(
              `getQuestions: Final processing of ${finalQuestions.length} questions for ${node.nodeID}`
            );
            syncChildrenWithStore(node.nodeID, finalQuestions);
          } else {
            console.error(
              `Final question JSON is not an array for node ${node.nodeID}:`,
              questionsJson
            );
            setError(`Invalid format received for questions (node ${node.nodeID})`);
          }
        } catch (e: any) {
          console.error(
            `Error parsing final question JSON for node ${node.nodeID}:`,
            e
          );
          setError(
            `Failed to parse final questions JSON (node ${node.nodeID}): ${e.message}`
          );
        }
      }
    });
  } else {
    console.error(`Persona ${persona?.name} is missing question generation method.`);
    setError(`Persona ${persona?.name} cannot generate questions.`);
    questionsPromise = Promise.reject(new Error("Persona cannot generate questions")) as OpenAIPromise;
  }

  return questionsPromise;
  console.log("function getQuestions finished");
}

function GraphPage(props: GraphPageProps) {
  console.log("function GraphPage started");
  const {
    qaTree,
    focusedId,
    model: modelStoreKey,
    persona,
    isGenerating,
    error,
  } = useAppStore(
    useShallow((state) => ({
      qaTree: state.qaTree,
      focusedId: state.focusedId,
      model: state.model,
      persona: state.persona,
      isGenerating: state.isGenerating,
      error: state.error,
    }))
  );

  const [nodeDims, setNodeDims] = useState<NodeDims>({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);
  const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState(false);
  const [addNodeSourceId, setAddNodeSourceId] = useState<string | null>(null);
  const [answeringNodes, setAnsweringNodes] = useState<Set<string>>(new Set());

  const connectingNodeId = useRef<string | null>(null);
  const activePromises = useRef<Map<string, OpenAIPromise>>(new Map());

  const isTreeInitialized = qaTree !== null && qaTree['q-0'] !== undefined;

  useEffect(() => {
    if (!isTreeInitialized && props.seedQuery) {
      console.log("GraphPage: Initializing tree in Zustand store.");
      useAppStore.getState().initializeTree(props.seedQuery);
    }
  }, [isTreeInitialized, props.seedQuery]);

  // Auto-answer seed question if requested by prop (from StartPage action)
  useEffect(() => {
    if (
      props.shouldAutoAnswerSeed &&
      isTreeInitialized &&
      qaTree &&
      qaTree['q-0'] &&
      !qaTree['q-0'].answer &&
      !answeringNodes.has('q-0') &&
      !isGenerating
    ) {
      generateAnswerForNode('q-0');
      props.clearAutoAnswerSeed && props.clearAutoAnswerSeed();
    }
  }, [props.shouldAutoAnswerSeed, isTreeInitialized, qaTree, answeringNodes, isGenerating]);

  // --- Cleanup Effect ---
  useEffect(() => {
    // Return a cleanup function
    return () => {
        console.log("GraphPage unmounting: Cleaning up active promises...");
        activePromises.current.forEach((promise, nodeId) => {
            console.log(` - Cleaning up promise for nodeId: ${nodeId}`);
            promise.cleanup?.(); // Call the cleanup method if it exists
        });
        activePromises.current.clear(); // Clear the map
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount
  // --- End Cleanup Effect ---

  const generateAnswerForNode = useCallback(
    async (nodeId: string) => {
      console.log("function generateAnswerForNode started");
      console.log(`Manual trigger: generateAnswerForNode(${nodeId})`);
      setAnsweringNodes((prev) => new Set(prev).add(nodeId));
      useAppStore.getState().setIsGenerating(true);
      useAppStore.getState().setError(null);
      let questionGenerationPromise: OpenAIPromise = Promise.resolve() as OpenAIPromise;
      let answerGenerationPromise: OpenAIPromise | null = null; // Define variable for answer promise

      const {
        model: modelStoreKey,
        persona,
        qaTree: currentTree,
        addNode,
        updateNode,
        updateNodeAnswerChunk,
      } = useAppStore.getState();

      if (!currentTree) {
        console.error("generateAnswerForNode: qaTree is null!");
        useAppStore.getState().setError("Cannot generate answer: graph not initialized.");
        setAnsweringNodes((prev) => { const next = new Set(prev); next.delete(nodeId); return next; });
        useAppStore.getState().setIsGenerating(false);
        return;
      }

      const questionNode = currentTree[nodeId];
      if (!questionNode || (questionNode.nodeType !== 'llm-question' && questionNode.nodeType !== 'user-question')) {
        console.warn(`generateAnswerForNode: Invalid or non-question node ID provided: ${nodeId}`);
        useAppStore.getState().setError(`Cannot generate answer for node type: ${questionNode?.nodeType}`);
        setAnsweringNodes((prev) => { const next = new Set(prev); next.delete(nodeId); return next; });
        useAppStore.getState().setIsGenerating(false);
        return;
      }

      if (!persona) {
        console.error("generateAnswerForNode: No persona selected");
        useAppStore.getState().setError("No persona selected. Please choose one.");
        setAnsweringNodes((prev) => { const next = new Set(prev); next.delete(nodeId); return next; });
        useAppStore.getState().setIsGenerating(false);
        return;
      }

      const answerNodeId = `a-${nodeId}`;
      console.log(`generateAnswerForNode: Checking/Creating answer node ${answerNodeId}`);
      if (!currentTree[answerNodeId]) {
        const answerNode: QATreeNode = {
          nodeID: answerNodeId,
          question: "",
          answer: "",
          nodeType: "llm-answer",
          parent: nodeId,
          children: [],
          isLoading: true,
          errorMessage: undefined,
        };
        console.log(`generateAnswerForNode: Creating placeholder answer node ${answerNodeId} via addNode`);
        addNode(answerNode);
      } else {
        console.log(`generateAnswerForNode: Resetting existing answer node ${answerNodeId}`);
        updateNode(answerNodeId, { isLoading: true, errorMessage: undefined, answer: "" });
      }

      console.log(
        `generateAnswerForNode: Proceeding to fetch answer for ${nodeId} using model ${modelStoreKey}`
      );

      const modelInfo = MODELS[modelStoreKey];
      const actualModelKey = modelInfo ? modelInfo.key : modelStoreKey;
      if (!modelInfo) {
        console.warn(`Model key "${modelStoreKey}" not found in MODELS dictionary. Sending raw key.`);
      }

      const contextNodes: QATreeNode[] = [];
      let currentAncestorId = questionNode.parent;
      while (currentAncestorId && currentTree[currentAncestorId]) {
        const ancestor = currentTree[currentAncestorId];
        if (
          ancestor.nodeType === "user-file" ||
          ancestor.nodeType === "user-webpage"
        ) {
          contextNodes.unshift(ancestor);
        }
        currentAncestorId = ancestor.parent;
      }
      const context = contextNodes
        .map((n) => {
          if (n.nodeType === "user-file")
            return `Context from file ${n.fileInfo?.name || "untitled"}:\n${
              n.answer
            }`;
          if (n.nodeType === "user-webpage")
            return `Context from webpage ${n.url || "unknown"}:\n${n.answer}`;
          return "";
        })
        .join("\n\n---\n\n");

      let prompt = "";
      try {
        prompt = persona.getPromptForAnswer(questionNode, currentTree);
        if (context) {
          prompt = `Background Context:\n${context}\n\n---\n\n${prompt}`;
        }
      } catch (e: any) {
        console.error(`Error getting prompt from persona ${persona.name} for node ${nodeId}:`, e);
        useAppStore.getState().setError(`Error getting prompt: ${e.message}`);
        updateNode(answerNodeId, { isLoading: false, errorMessage: `Persona prompt error: ${e.message}` });
        setAnsweringNodes((prev) => { const next = new Set(prev); next.delete(nodeId); return next; });
        useAppStore.getState().setIsGenerating(false);
        return;
      }

      try {
        // Assign the promise for answer generation
        answerGenerationPromise = window.openai(prompt, {
          temperature: 1,
          model: actualModelKey,
          nodeId: answerNodeId,
          onChunk: (content) => {
            try {
              const message = JSON.stringify({ type: 'chunk', nodeId: answerNodeId, content });
              const parsedMessage = JSON.parse(message);

              if (parsedMessage.nodeId !== answerNodeId) return;

              if (parsedMessage.type === "chunk" && parsedMessage.content) {
                useAppStore.getState().updateNodeAnswerChunk(answerNodeId, parsedMessage.content);
              }
            } catch (e) {
              console.error(
                `generateAnswerForNode: Error processing stream chunk for ${answerNodeId}:`,
                content,
                e
              );
            }
          }
        }) as OpenAIPromise;

        // Store the answer promise reference
        activePromises.current.set(answerNodeId, answerGenerationPromise);

        // Await the answer generation
        await answerGenerationPromise;

        // Answer succeeded, remove its promise ref
        activePromises.current.delete(answerNodeId);

        console.log(`generateAnswerForNode: Answer stream done for ${answerNodeId}. Triggering questions.`);
        useAppStore.getState().updateNode(answerNodeId, { isLoading: false });

        const nodeExists = useAppStore.getState().qaTree?.[answerNodeId];
        if (nodeExists) {
            // Pass the ref to getQuestions
            questionGenerationPromise = getQuestions(answerNodeId, activePromises);
            await questionGenerationPromise; // Wait for questions (promise already stored/deleted inside getQuestions)
            console.log(`generateAnswerForNode: Question generation finished (or failed) for ${answerNodeId}.`);
        } else {
            console.error(`Node ${answerNodeId} not found in store after answer completion.`);
            useAppStore.getState().setError(`Node ${answerNodeId} disappeared unexpectedly after generation.`);
        }

      } catch (error: any) {
        console.error(`Error during generation process for question node ${nodeId}:`, error);
        useAppStore.getState().setError(`Generation failed: ${error.message}`);
        const currentAnswerNode = useAppStore.getState().qaTree?.[answerNodeId];
        if (currentAnswerNode) {
            useAppStore.getState().updateNode(answerNodeId, { isLoading: false, errorMessage: error.message });
        }
        // Ensure promise refs are cleaned up on error too
        if (answerNodeId && activePromises.current.has(answerNodeId)) {
            activePromises.current.delete(answerNodeId);
        }
      } finally {
        setAnsweringNodes((prev) => {
          const next = new Set(prev);
          next.delete(nodeId);
          return next;
        });
        useAppStore.getState().setIsGenerating(false);
        console.log(`generateAnswerForNode: FINISHED generation process for question node ${nodeId}`);
      }
      console.log("function generateAnswerForNode finished");
    },
    []
  );

  const onConnectStart = useCallback<OnConnectStart>(
    (event, { nodeId }) => {
      connectingNodeId.current = nodeId;
    },
    []
  );

  const requestDeleteBranch = useCallback((targetNodeId: string) => {
    console.log("Requesting confirmation to delete branch starting at node:", targetNodeId);
    setNodeToDelete(targetNodeId);
    setIsConfirmModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!nodeToDelete) return;
    const targetNodeId = nodeToDelete;
    console.log("Confirmed deletion for branch starting at node:", targetNodeId);

    if (!useAppStore.getState().qaTree?.[targetNodeId]) {
        console.error(`Node to delete (${targetNodeId}) not found in current tree state.`);
        useAppStore.getState().setError(`Node to delete (${targetNodeId}) was not found.`);
        setIsConfirmModalOpen(false);
        setNodeToDelete(null);
        return;
    }

    console.log(
      `Calling deleteNodeAndDescendants action for root: ${targetNodeId}`
    );
    useAppStore.getState().deleteNodeAndDescendants(targetNodeId);

    setIsConfirmModalOpen(false);
    setNodeToDelete(null);
  }, [nodeToDelete]);

  const onConnectEnd = useCallback((event: MouseEvent | TouchEvent) => {
    // const target = event.target as Element;
    // const targetIsPane = target.classList.contains("react-flow__pane");
    // const sourceNodeId = connectingNodeId.current;
    // const currentTree = useAppStore.getState().qaTree;

    // if (targetIsPane && sourceNodeId && currentTree) {
    //   const sourceNode = currentTree[sourceNodeId];
    //   const isValidSource = sourceNode && (
    //     sourceNode.nodeType === "llm-answer" ||
    //     sourceNode.nodeType === "user-file" ||
    //     sourceNode.nodeType === "user-webpage"
    //   );

    //   if (isValidSource) {
    //     console.log(`Connection ended on pane from valid source: ${sourceNodeId}`);
    //     setAddNodeSourceId(sourceNodeId);
    //     setIsAddNodeModalOpen(true);
    //   } else {
    //     console.log(
    //       `Connection end from invalid source node type/state: ${sourceNodeId} (Type: ${sourceNode?.nodeType})`
    //     );
    //   }
    // } else {
    //   console.log(`Connection ended. Target is pane: ${targetIsPane}, Source Node ID: ${sourceNodeId}`);
    // }
    // connectingNodeId.current = null;
  }, []);

  // --- Memoize Raw Nodes/Edges (Pass nodeDims to converter) ---
  const memoizedNodesAndEdges = useMemo(() => {
    if (!qaTree) {
      return { nodes: [], edges: [] };
    }
    console.log(
      `useMemo (Nodes/Edges): Recalculating raw elements... isGenerating=${isGenerating}, answeringNodes=${JSON.stringify(Array.from(answeringNodes))}, treeKeys=${JSON.stringify(Object.keys(qaTree))}`
    );
    const result = convertTreeToFlow(
        qaTree,
        setNodeDims,
        requestDeleteBranch,
        generateAnswerForNode,
        answeringNodes,
        isGenerating,
        nodeDims
    );
    console.log(`useMemo (Nodes/Edges): Finished. Nodes: ${result.nodes.length}, Edges: ${result.edges.length}`);
    return result;
  }, [
    qaTree,
    requestDeleteBranch,
    generateAnswerForNode,
    answeringNodes,
    isGenerating,
    nodeDims
  ]);
  // --- End Memoize Raw Nodes/Edges ---

  // --- Memoize Layout Calculation ---
  const laidOutElements = useMemo(() => {
      console.log(`useMemo (Layout): Recalculating layout... nodeDimsKeys=${JSON.stringify(Object.keys(nodeDims))}, nodeCount=${memoizedNodesAndEdges.nodes.length}`);
      const result = layoutElements(
          memoizedNodesAndEdges.nodes,
          memoizedNodesAndEdges.edges,
          nodeDims
      );
      console.log(`useMemo (Layout): Finished. Nodes: ${result.nodes.length}, Edges: ${result.edges.length}`);
      return result;
  }, [memoizedNodesAndEdges.nodes, memoizedNodesAndEdges.edges, nodeDims]); // Depend on raw elements and dims
  // --- End Memoize Layout Calculation ---

  const handleAddNodeFromModal = (type: NodeType) => {
    if (addNodeSourceId) {
      let prefix = "u";
      if (type === "user-question") prefix = "uq";
      else if (type === "user-file") prefix = "uf";
      else if (type === "user-webpage") prefix = "uw";

      const newIdSuffix = Math.random().toString(36).substring(2, 9);
      const cleanSourceId = addNodeSourceId.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 20);
      const newNodeId = `${prefix}-${cleanSourceId}-${newIdSuffix}`;

      const newNode: QATreeNode = {
        nodeID: newNodeId,
        nodeType: type,
        question: "",
        answer: "",
        parent: addNodeSourceId,
        children: [],
        isLoading: false,
      };
      useAppStore.getState().addNode(newNode);
      console.log(`Added new node ${newNodeId} from modal, parent: ${addNodeSourceId}`);
    } else {
      console.warn("handleAddNodeFromModal called without addNodeSourceId");
    }
    setIsAddNodeModalOpen(false);
    setAddNodeSourceId(null);
  };

  if (!isTreeInitialized) {
    console.log("GraphPage: Rendering Loading state because tree is not initialized.");
    return <div>Loading...</div>;
  }

  const currentModelInfo = modelStoreKey ? MODELS[modelStoreKey] : null;
  const currentPersonaInfo = persona;

  return (
    <div className="text-sm h-screen w-screen relative overflow-hidden">
      {error && (
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 mt-2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-md max-w-md text-center">
          <strong>Error:</strong> {error}
          <button
            onClick={() => useAppStore.getState().setError(null)}
            className="ml-4 text-red-500 hover:text-red-700 font-bold"
          >
            X
          </button>
        </div>
      )}

      <FlowProvider
        flowNodes={laidOutElements.nodes}
        flowEdges={laidOutElements.edges}
        nodeDims={nodeDims}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        deleteBranch={requestDeleteBranch}
      />

      <AddNodeModal
        isOpen={isAddNodeModalOpen}
        onClose={() => {
          setIsAddNodeModalOpen(false);
          setAddNodeSourceId(null);
        }}
        onAddNode={handleAddNodeFromModal}
        sourceNodeId={addNodeSourceId}
      />

      <div className="fixed right-4 bottom-4 flex items-center space-x-2 z-20">
        {SERVER_HOST.includes("localhost") && (
          <div
            className="bg-black/40 p-2 flex items-center justify-center rounded cursor-pointer hover:text-green-400 backdrop-blur"
            onClick={() => {
              const currentTree = useAppStore.getState().qaTree;
              if (!currentTree) return;
              const filename = (props.seedQuery || "graph-export")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .substring(0, 50);
              const dict: any = {
                version: "1.0.0",
                persona: useAppStore.getState().persona?.name,
                model: useAppStore.getState().model,
                seedQuery: props.seedQuery,
                tree: currentTree,
              };
              downloadDataAsJson(dict, filename);
            }}
            title="Download Graph Data (JSON)"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
          </div>
        )}
        <div className="bg-black/40 p-2 pl-3 rounded flex items-center space-x-3 backdrop-blur touch-none">
          <div className="text-white/60 select-none">
            {currentPersonaInfo?.name ?? "Default Persona"} •{" "}
            {currentModelInfo?.name ?? "Default Model"}
          </div>
          {isGenerating && (
            <div title="Generating..." className="flex items-center justify-center text-green-400">
              <svg className="animate-spin h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Generating...</span>
            </div>
          )}
        </div>
      </div>
      <div
        onClick={props.onExit}
        className="fixed top-4 left-4 bg-black/40 rounded p-2 cursor-pointer hover:bg-black/60 backdrop-blur touch-none z-20"
        title="Exit to Start Page"
      >
        <ArrowLeftIcon className="w-5 h-5" />
      </div>

      <ConfirmDeleteModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setNodeToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
  console.log("function GraphPage finished");
}

export default GraphPage;