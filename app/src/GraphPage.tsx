import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Flow } from "./Flow";
import { Edge, MarkerType, Node } from "reactflow";
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
import { InteractiveNodeData } from "./InteractiveNode";
import { AddNodeModal } from "./AddNodeModal";
import { useAppStore } from "./store/appStore";
import { useShallow } from "zustand/react/shallow";
import { Persona } from "./personas";
import { Model, MODELS } from "./models";
import { ReactFlowProvider } from "reactflow";

interface GraphPageProps {
  seedQuery: string;
  onExit: () => void;
}

type ConvertTreeToFlowProps = (
  tree: QATree,
  setNodeDimsStateSetter: React.Dispatch<React.SetStateAction<NodeDims>>,
  requestDeleteBranch: (edgeId: string) => void,
  generateAnswerForNode: (nodeId: string) => Promise<void>,
  answeringNodes: Set<string>,
  isGenerating: boolean
) => { nodes: Node<InteractiveNodeData>[]; edges: Edge[] };

export const convertTreeToFlow: ConvertTreeToFlowProps = (
  tree,
  setNodeDimsStateSetter,
  requestDeleteBranch,
  generateAnswerForNode,
  answeringNodes,
  isGenerating
) => {
  const nodes: Node<InteractiveNodeData>[] = [];
  console.log(
    `convertTreeToFlow: Processing tree with ${
      Object.keys(tree).length
    } nodes. Node 0 Answer:`,
    tree["0"]?.answer?.substring(0, 50)
  );

  Object.keys(tree).forEach((key) => {
    const nodeData = tree[key];
    if (!nodeData) {
      console.warn(`Node data not found for key ${key} during conversion.`);
      return;
    }

    if (!nodeData.nodeID) {
      console.warn(
        `Node data for key ${key} missing nodeID, assigning fallback: ${key}`
      );
      nodeData.nodeID = key;
    }

    if (nodeData.nodeType !== 'llm-answer') {
      const primaryNode: Node<InteractiveNodeData> = {
        id: nodeData.nodeID,
        type: "interactiveNode",
        data: {
          ...nodeData,
          nodeID: nodeData.nodeID,
          setNodeDims: setNodeDimsStateSetter,
          onGenerateAnswer:
            nodeData.nodeType === "llm-question" ||
            nodeData.nodeType === "user-question"
              ? generateAnswerForNode
              : undefined,
          isAnswering:
            (nodeData.nodeType === "llm-question" ||
              nodeData.nodeType === "user-question") &&
            answeringNodes.has(nodeData.nodeID),
        },
        position: { x: 0, y: 0 },
      };
      nodes.push(primaryNode);
    }

    const potentialQuestionId = key.startsWith('a-') ? key.substring(2) : null;
    const questionNodeForAnswer = potentialQuestionId ? tree[potentialQuestionId] : null;

    const isQuestionWithAnswer = (nodeData.nodeType === 'llm-question' || nodeData.nodeType === 'user-question') && nodeData.answer;

    if (questionNodeForAnswer || isQuestionWithAnswer) {
      const questionId = potentialQuestionId ?? nodeData.nodeID;
      const questionNode = questionNodeForAnswer ?? nodeData;
      const answerNodeId = `a-${questionId}`;

      if (!nodes.some(n => n.id === answerNodeId) && questionNode.answer) {
        console.log(
          `convertTreeToFlow: Found answer for question ${questionId}, creating answer node ${answerNodeId}`
        );
        const answerNodeData: InteractiveNodeData = {
          nodeID: answerNodeId,
          nodeType: "llm-answer",
          question: "",
          answer: questionNode.answer,
          parent: questionId,
          children: questionNode.children || [],
          setNodeDims: setNodeDimsStateSetter,
          isLoading: questionNode.isLoading,
          errorMessage: questionNode.errorMessage,
          fileInfo: undefined,
          url: undefined,
          onGenerateAnswer: undefined,
          isAnswering: false,
        };
        const answerGraphNode: Node<InteractiveNodeData> = {
          id: answerNodeId,
          type: "interactiveNode",
          data: answerNodeData,
          position: { x: 0, y: 0 },
        };
        nodes.push(answerGraphNode);
      }
    }
  });

  const edges: Edge[] = [];
  Object.values(tree).forEach((nodeData) => {
    if (!nodeData) return;
    console.log(
      `convertTreeToFlow: Checking edges for node ${nodeData.nodeID}`
    );

    const parentId = nodeData.parent;
    if (parentId && tree[parentId]) {
      const parentNodeData = tree[parentId];
      const sourceId =
        (parentNodeData.nodeType === "llm-question" ||
          parentNodeData.nodeType === "user-question") &&
        parentNodeData.answer
          ? `a-${parentId}`
          : parentId;
      const targetId = nodeData.nodeID;
      if (
        nodes.some((n) => n.id === sourceId) &&
        nodes.some((n) => n.id === targetId)
      ) {
        console.log(
          `convertTreeToFlow: Creating edge ${sourceId} -> ${targetId}`
        );
        edges.push({
          id: `${sourceId}-${targetId}`,
          type: "deleteEdge",
          source: sourceId,
          target: targetId,
          data: { requestDeleteBranch },
          animated: isGenerating,
          markerEnd: { type: MarkerType.Arrow },
        });
      } else {
        console.warn(
          `convertTreeToFlow: Source ${sourceId} or Target ${targetId} for edge not found.`
        );
      }
    }

    if (
      (nodeData.nodeType === "llm-question" ||
        nodeData.nodeType === "user-question") &&
      nodeData.answer
    ) {
      const questionNodeId = nodeData.nodeID;
      const answerNodeId = `a-${questionNodeId}`;
      if (
        nodes.some((n) => n.id === questionNodeId) &&
        nodes.some((n) => n.id === answerNodeId)
      ) {
        console.log(
          `convertTreeToFlow: Creating edge ${questionNodeId} -> ${answerNodeId}`
        );
        edges.push({
          id: `${questionNodeId}-${answerNodeId}`,
          type: "deleteEdge",
          source: questionNodeId,
          target: answerNodeId,
          animated: isGenerating,
          markerEnd: { type: MarkerType.Arrow },
          data: { requestDeleteBranch },
        });
      } else {
        console.warn(
          `convertTreeToFlow: QNode ${questionNodeId} or ANode ${answerNodeId} not found for internal edge.`
        );
      }
    }
  });
  console.log(
    `convertTreeToFlow: Finished. Nodes created: ${nodes.length}, Edges created: ${edges.length}`
  );

  return { nodes, edges };
};

async function getQuestions(
  nodeId: string
): Promise<void> {
  const { qaTree: treeSnapshot, model: modelKey, persona, addNode, updateNode, setError } = useAppStore.getState();
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

  if ("getQuestions" in person && person.getQuestions) {
    const questions = person.getQuestions(node, treeSnapshot || {});
    console.log(
      `getQuestions: Synchronously generated ${questions.length} questions for ${node.nodeID}`
    );
    syncChildrenWithStore(node.nodeID, questions);
    return;
  }

  if (!("getPromptForQuestions" in person && person.getPromptForQuestions)) {
    console.error(
      `Persona ${persona.name} is missing question generation method.`
    );
    setError(`Persona ${persona.name} cannot generate questions.`);
    return;
  }

  const promptForQuestions = person.getPromptForQuestions(node, treeSnapshot || {});
  let questionsJson = "";
  let finalError: string | null = null;
  const streamNodeId = `qgen-${node.nodeID}`;

  try {
    await window.openai(promptForQuestions, {
      temperature: 1,
      model: modelKey,
      nodeId: streamNodeId,
      onChunk: (message) => {
        try {
          const parsed = JSON.parse(message);
          const {
            type,
            nodeId: messageNodeId,
            content,
            message: errorMessage,
          } = parsed;

          if (messageNodeId !== streamNodeId) return;

          if (type === "chunk" && content) {
            questionsJson += content;
            const closedJson = closePartialJson(questionsJson);
            try {
              const parsedQuestions = JSON.parse(closedJson);
              if (Array.isArray(parsedQuestions)) {
                syncChildrenWithStore(node.nodeID, parsedQuestions);
              }
            } catch (e) {
              /* Ignore intermediate parse errors, wait for more chunks */
            }
          } else if (type === "error") {
            console.error(
              `getQuestions stream error for node ${node.nodeID}:`,
              errorMessage
            );
            finalError =
              errorMessage || `Unknown stream error generating questions for node ${node.nodeID}.`;
            setError(finalError);
          }
        } catch (e: any) {
          console.error(
            `Error parsing WebSocket message in getQuestions (node ${node.nodeID}):`,
            message,
            e
          );
          setError(
            `Failed to parse message during question generation: ${e.message}`
          );
        }
      },
    });
  } catch (error: any) {
    console.error(
      `Error during openai call for getQuestions (node ${node.nodeID}):`,
      error
    );
    finalError = error?.message || `OpenAI call failed for node ${node.nodeID}`;
    setError(finalError);
  }

  if (finalError) {
    console.error(
      `Final error during question generation for node ${node.nodeID}: ${finalError}`
    );
    setError(finalError);
    return;
  }

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

function GraphPage(props: GraphPageProps) {
  const {
    qaTree,
    focusedId,
    model,
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

  const {
    initializeTree,
    setFocusedId,
    addNode,
    updateNode,
    deleteNodeAndDescendants,
    setError,
    setIsGenerating,
    updateNodeAnswerChunk,
  } = useAppStore(
    useShallow((state) => ({
      initializeTree: state.initializeTree,
      setFocusedId: state.setFocusedId,
      addNode: state.addNode,
      updateNode: state.updateNode,
      deleteNodeAndDescendants: state.deleteNodeAndDescendants,
      setError: state.setError,
      setIsGenerating: state.setIsGenerating,
      updateNodeAnswerChunk: state.updateNodeAnswerChunk,
    }))
  );

  const [nodeDims, setNodeDims] = useState<NodeDims>({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [edgeToDelete, setEdgeToDelete] = useState<string | null>(null);
  const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState(false);
  const [addNodeSourceId, setAddNodeSourceId] = useState<string | null>(null);
  const [answeringNodes, setAnsweringNodes] = useState<Set<string>>(new Set());

  const connectingNodeId = useRef<string | null>(null);

  const isTreeInitialized = qaTree !== null && qaTree['q-0'] !== undefined;

  useEffect(() => {
    if (!isTreeInitialized && props.seedQuery) {
      console.log("GraphPage: Initializing tree in Zustand store.");
      initializeTree(props.seedQuery);
    }
  }, [isTreeInitialized, initializeTree, props.seedQuery]);

  useEffect(() => {
    const currentTree = useAppStore.getState().qaTree;
    if (currentTree && currentTree['q-0'] && !currentTree['q-0'].answer && !answeringNodes.has('q-0') && !useAppStore.getState().isGenerating) {
      if (!currentTree['a-0']) {
        console.log("GraphPage: Triggering initial answer generation for q-0.");
        generateAnswerForNode('q-0');
      } else {
        console.log("GraphPage: Initial answer node a-0 already exists, skipping initial trigger.");
      }
    }
  }, [isTreeInitialized, answeringNodes, isGenerating]);

  const generateAnswerForNode = useCallback(
    async (nodeId: string) => {
      console.log(`Manual trigger: generateAnswerForNode(${nodeId})`);
      setAnsweringNodes((prev) => new Set(prev).add(nodeId));
      setIsGenerating(true);
      setError(null);

      const {
        model: modelKey,
        persona,
        qaTree: currentTree,
        addNode,
        updateNode,
        updateNodeAnswerChunk,
      } = useAppStore.getState();

      if (!currentTree) {
        console.error("generateAnswerForNode: qaTree is null!");
        setError("Cannot generate answer: graph not initialized.");
        setAnsweringNodes((prev) => { const next = new Set(prev); next.delete(nodeId); return next; });
        setIsGenerating(false);
        return;
      }

      const questionNode = currentTree[nodeId];
      if (!questionNode || (questionNode.nodeType !== 'llm-question' && questionNode.nodeType !== 'user-question')) {
        console.warn(`generateAnswerForNode: Invalid or non-question node ID provided: ${nodeId}`);
        setError(`Cannot generate answer for node type: ${questionNode?.nodeType}`);
        setAnsweringNodes((prev) => { const next = new Set(prev); next.delete(nodeId); return next; });
        setIsGenerating(false);
        return;
      }

      if (!persona) {
        console.error("generateAnswerForNode: No persona selected");
        setError("No persona selected. Please choose one.");
        setAnsweringNodes((prev) => { const next = new Set(prev); next.delete(nodeId); return next; });
        setIsGenerating(false);
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
        `generateAnswerForNode: Proceeding to fetch answer for ${nodeId} using model ${modelKey}`
      );

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
        setError(`Error getting prompt: ${e.message}`);
        updateNode(answerNodeId, { isLoading: false, errorMessage: `Persona prompt error: ${e.message}` });
        setAnsweringNodes((prev) => { const next = new Set(prev); next.delete(nodeId); return next; });
        setIsGenerating(false);
        return;
      }

      try {
        await window.openai(prompt, {
          temperature: 1,
          model: modelKey,
          nodeId: answerNodeId,
          onChunk: (message) => {
            try {
              const parsedMessage = JSON.parse(message);
              const {
                type,
                nodeId: messageNodeId,
                content,
                message: errorMessage,
              } = parsedMessage;

              if (messageNodeId !== answerNodeId) return;

              if (type === "chunk" && content) {
                useAppStore.getState().updateNodeAnswerChunk(answerNodeId, content);
              } else if (type === "error") {
                console.error(
                  `generateAnswerForNode: Stream error for node ${answerNodeId}:`,
                  errorMessage
                );
                useAppStore.getState().updateNode(answerNodeId, {
                  isLoading: false,
                  errorMessage: errorMessage || `Stream error for ${answerNodeId}`
                });
              } else if (type === "done") {
                console.log(`generateAnswerForNode: Stream finished for ${answerNodeId}.`);
                useAppStore.getState().updateNode(answerNodeId, { isLoading: false });
                console.log(`generateAnswerForNode: Triggering getQuestions for answer node ${answerNodeId}`);
                getQuestions(answerNodeId);
              }
            } catch (e) {
              console.error(
                `generateAnswerForNode: Error parsing stream message for ${answerNodeId}:`,
                message,
                e
              );
              useAppStore.getState().updateNode(answerNodeId, {
                isLoading: false,
                errorMessage: "Failed to parse stream message."
              });
            }
          }
        });
      } catch (error: any) {
        console.error("Error calling window.openai or processing stream:", error);
        setError(`Failed to get answer: ${error.message}`);
        useAppStore.getState().updateNode(answerNodeId, { isLoading: false, errorMessage: error.message });
      } finally {
        setAnsweringNodes((prev) => {
          const next = new Set(prev);
          next.delete(nodeId);
          return next;
        });
        setIsGenerating(false);
        console.log(`generateAnswerForNode: Finished processing for question node ${nodeId}`);
      }
    },
    [setError, setIsGenerating, addNode, updateNode, updateNodeAnswerChunk]
  );

  const requestDeleteBranch = useCallback((edgeId: string) => {
    console.log("Requesting confirmation to delete edge:", edgeId);
    setEdgeToDelete(edgeId);
    setIsConfirmModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!edgeToDelete) return;
    console.log("Confirmed deletion for edge:", edgeToDelete);

    const edgeParts = edgeToDelete.split("-");
    let targetNodeId: string | null = null;

    if (edgeParts.length >= 2) {
      let potentialTarget = edgeParts[edgeParts.length - 1];
      if ((potentialTarget === '0' || potentialTarget === '1') && edgeParts.length >= 3) {
        potentialTarget = edgeParts.slice(edgeParts.length - 2).join('-');
      }

      if (useAppStore.getState().qaTree?.[potentialTarget]) {
        targetNodeId = potentialTarget;
      } else if (useAppStore.getState().qaTree?.[edgeParts.slice(1).join('-')]) {
        targetNodeId = edgeParts.slice(1).join('-');
      } else {
        console.error(`Could not reliably parse target node ID from edge: ${edgeToDelete}`);
      }

      console.log(`Parsed edge ${edgeToDelete}: Determined Target=${targetNodeId}`);
    } else {
      console.error(`Could not parse edge ID: ${edgeToDelete}`);
    }

    if (!targetNodeId) {
      console.error(
        `Could not determine deletion target from edge ${edgeToDelete}`
      );
      setError(
        `Failed to determine deletion target from edge ${edgeToDelete}.`
      );
      setIsConfirmModalOpen(false);
      setEdgeToDelete(null);
      return;
    }

    console.log(
      `Calling deleteNodeAndDescendants action for root: ${targetNodeId}`
    );
    deleteNodeAndDescendants(targetNodeId);

    setIsConfirmModalOpen(false);
    setEdgeToDelete(null);
  }, [edgeToDelete, deleteNodeAndDescendants, setError]);

  const onConnectStart = useCallback(
    (
      _event: React.MouseEvent | React.TouchEvent,
      { nodeId }: { nodeId: string | null }
    ) => {
      connectingNodeId.current = nodeId;
    },
    []
  );

  const onConnectEnd = useCallback((event: MouseEvent | TouchEvent) => {
    const target = event.target as Element;
    const targetIsPane = target.classList.contains("react-flow__pane");
    const sourceNodeId = connectingNodeId.current;
    const currentTree = useAppStore.getState().qaTree;

    if (targetIsPane && sourceNodeId && currentTree) {
      const sourceNode = currentTree[sourceNodeId];
      const isValidSource = sourceNode && (
        sourceNode.nodeType === "llm-answer" ||
        sourceNode.nodeType === "user-file" ||
        sourceNode.nodeType === "user-webpage"
      );

      if (isValidSource) {
        console.log(`Connection ended on pane from valid source: ${sourceNodeId}`);
        setAddNodeSourceId(sourceNodeId);
        setIsAddNodeModalOpen(true);
      } else {
        console.log(
          `Connection end from invalid source node type/state: ${sourceNodeId} (Type: ${sourceNode?.nodeType})`
        );
      }
    } else {
      console.log(`Connection ended. Target is pane: ${targetIsPane}, Source Node ID: ${sourceNodeId}`);
    }
    connectingNodeId.current = null;
  }, []);

  const { nodes, edges } = useMemo(() => {
    if (!qaTree) {
      return { nodes: [], edges: [] };
    }
    console.log("useMemo: Recalculating nodes/edges for React Flow.");
    return convertTreeToFlow(
      qaTree,
      setNodeDims,
      requestDeleteBranch,
      generateAnswerForNode,
      answeringNodes,
      isGenerating
    );
  }, [
    qaTree,
    setNodeDims,
    requestDeleteBranch,
    generateAnswerForNode,
    answeringNodes,
    isGenerating,
  ]);

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
      addNode(newNode);
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

  const currentModelInfo = model ? MODELS[model] : null;
  const currentPersonaInfo = persona;

  return (
    <div className="text-sm h-screen w-screen relative overflow-hidden">
      {error && (
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 mt-2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-md max-w-md text-center">
          <strong>Error:</strong> {error}
          <button
            onClick={() => setError(null)}
            className="ml-4 text-red-500 hover:text-red-700 font-bold"
          >
            X
          </button>
        </div>
      )}

      <ReactFlowProvider>
        <Flow
          flowNodes={nodes}
          flowEdges={edges}
          nodeDims={nodeDims}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          deleteBranch={requestDeleteBranch}
        />
      </ReactFlowProvider>

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
          setEdgeToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default GraphPage;