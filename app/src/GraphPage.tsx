import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlowProvider, openai } from "./Flow";
import { Edge, MarkerType, Node } from "reactflow";
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  PauseIcon,
  PlayIcon,
} from "@heroicons/react/24/solid";
import { closePartialJson, downloadDataAsJson } from "./util/json";
import { PERSONAS } from "./personas";
import type { ApiKey } from "./APIKeyModal";
import { SERVER_HOST } from "./constants";
import { MODELS } from "./models";
import { FocusedContextProvider, isChild } from "./FocusedContext";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { QATree, QATreeNode, NodeDims, ScoredQuestion, NodeType } from "./types";
import { InteractiveNodeData } from "./InteractiveNode";
import { Connection, OnConnectStartParams } from "reactflow";
import { AddNodeModal } from "./AddNodeModal";
import React from "react";

type TreeNode = Node & {
  parentNodeID: string;
};

type ConvertTreeToFlowProps = (
  tree: QATree,
  setNodeDims: any,
  requestDeleteBranch: (edgeId: string) => void,
  playing: boolean,
  generateAnswerForNode: (nodeId: string) => Promise<void>,
  answeringNodes: Set<string>,
  setNodeData: (nodeId: string, dataChanges: Partial<QATreeNode>) => void,
  requestAddUserNode: (parentId: string, newNodeType: NodeType) => void
) => { nodes: Node<InteractiveNodeData>[]; edges: Edge[] };

export const convertTreeToFlow: ConvertTreeToFlowProps = (
  tree,
  setNodeDims,
  requestDeleteBranch,
  playing,
  generateAnswerForNode,
  answeringNodes,
  setNodeData,
  requestAddUserNode
) => {
  const nodes: Node<InteractiveNodeData>[] = [];
  console.log(`convertTreeToFlow: Processing tree with ${Object.keys(tree).length} nodes. Node 0 Answer:`, tree['0']?.answer?.substring(0, 50)); // Log entry and answer status

  Object.keys(tree).forEach((key) => {
    const nodeData = tree[key];
    if (!nodeData) {
      console.warn(`Node data not found for key ${key} during conversion.`);
      return; // Skip this node if data is missing
    }

    // Ensure nodeData has nodeID, if migrating old data, assign one.
    if (!nodeData.nodeID) {
      console.warn(`Node data for key ${key} missing nodeID, assigning fallback.`);
      nodeData.nodeID = key; // Or potentially infer based on type/parent
    }

    // Create the primary node (Question, File Input, Webpage Input)
    const primaryNode: Node<InteractiveNodeData> = {
      id: nodeData.nodeID, // Use the nodeID from the data directly
      type: "interactiveNode", // Use the universal node type
      data: {
        ...nodeData,
        nodeID: nodeData.nodeID,
        setNodeDims: setNodeDims,
        setNodeData: setNodeData,
        requestAddUserNode: requestAddUserNode,
        onGenerateAnswer: (nodeData.nodeType === 'llm-question' || nodeData.nodeType === 'user-question') ? generateAnswerForNode : undefined,
        isAnswering: (nodeData.nodeType === 'llm-question' || nodeData.nodeType === 'user-question') ? answeringNodes.has(key) : false,
      },
      position: { x: 0, y: 0 },
    };
    nodes.push(primaryNode);

    // If it's a question node AND has an answer, create a separate LLM_Answer node
    if ((nodeData.nodeType === 'llm-question' || nodeData.nodeType === 'user-question') && nodeData.answer) {
      const answerNodeId = `a-${nodeData.nodeID}`;
      console.log(`convertTreeToFlow: Creating answer node ${answerNodeId} for question ${nodeData.nodeID}`); // Log answer node creation
      const answerNode: Node<InteractiveNodeData> = {
        id: answerNodeId,
        type: 'interactiveNode',
        data: {
          ...nodeData, // Pass relevant data, override type and text
          nodeID: answerNodeId,
          setNodeDims: setNodeDims,
          setNodeData: setNodeData,
          requestAddUserNode: requestAddUserNode,
          nodeType: 'llm-answer',
          question: '', // Answer nodes don't have a question title
          answer: nodeData.answer, // The actual answer content
        },
        position: { x: 0, y: 0 },
      };
      nodes.push(answerNode);
    }
  });

  const edges: Edge[] = [];
  Object.values(tree).forEach((nodeData) => { // Iterate over original tree data for edge creation
    if (!nodeData) return; // Skip if nodeData is null/undefined
    console.log(`convertTreeToFlow: Checking edges for node ${nodeData.nodeID}`); // Log edge processing start

    // Ensure parentNodeID exists and corresponds to a node in the tree
    const parentId = nodeData.parent;
    if (parentId && tree[parentId]) { // Check if parent node exists in the tree by its ID
      const parentNodeData = tree[parentId];
      // Link from parent's ANSWER node (if exists and it's a question type) or parent node itself to the current QUESTION node
      const sourceId = (parentNodeData.nodeType === 'llm-question' || parentNodeData.nodeType === 'user-question') && parentNodeData.answer ? `a-${parentId}` : parentId;

      // Ensure the source and target nodes actually exist in our generated nodes list before creating edge
      const targetId = nodeData.nodeID; // Target is always the current node
      if (nodes.some(n => n.id === sourceId) && nodes.some(n => n.id === targetId)) {
        console.log(`convertTreeToFlow: Creating edge ${sourceId} -> ${targetId}`); // Log edge creation
        edges.push({
          id: `${sourceId}-${targetId}`, // Use actual source/target for ID
          type: 'deleteEdge',
          source: sourceId,
          target: targetId,
          data: {
            requestDeleteBranch,
          },
          animated: playing,
          markerEnd: { type: MarkerType.Arrow },
        });
      } else {
        console.warn(`convertTreeToFlow: Source ${sourceId} or Target ${targetId} for edge not found.`); // Log missing nodes for edge
      }
    }

    // Add edge from Question node to its corresponding Answer node
    if ((nodeData.nodeType === 'llm-question' || nodeData.nodeType === 'user-question') && nodeData.answer) {
      const questionNodeId = nodeData.nodeID;
      const answerNodeId = `a-${questionNodeId}`;
       // Ensure both nodes exist before adding edge
       if (nodes.some(n => n.id === questionNodeId) && nodes.some(n => n.id === answerNodeId)) {
          console.log(`convertTreeToFlow: Creating edge ${questionNodeId} -> ${answerNodeId}`); // Log internal edge creation
          edges.push({
            id: `${questionNodeId}-${answerNodeId}`,
            type: 'deleteEdge', // Use a distinct type or data if different behavior needed
            source: questionNodeId,
            target: answerNodeId,
            animated: playing, // Maybe don't animate this internal edge?
            markerEnd: { type: MarkerType.Arrow },
            // style: { stroke: '#ccc' }, // Optional: style differently
             data: {
               requestDeleteBranch, // Allow deleting the answer node via this edge too?
             },
          });
       } else {
           console.warn(`convertTreeToFlow: QNode ${questionNodeId} or ANode ${answerNodeId} not found for internal edge.`); // Log missing nodes for internal edge
       }
    }
  });
  console.log(`convertTreeToFlow: Finished. Nodes created: ${nodes.length}, Edges created: ${edges.length}`); // Log completion


  return { nodes, edges };
};


async function getQuestions(
  apiKey: ApiKey,
  model: string,
  persona: string,
  node: QATreeNode,
  tree: QATree,
  onIntermediate: (partial: ScoredQuestion[]) => void
) {
  const person = PERSONAS[persona];
  if ("getQuestions" in person) {
    onIntermediate(person.getQuestions(node, tree));
    return;
  }
  const promptForQuestions = person.getPromptForQuestions(node, tree);

  let questionsJson = "";
  let finalError: string | null = null;

  try {
    await openai(promptForQuestions, {
      apiKey: apiKey.key, // Corrected: Pass apiKey directly
      temperature: 1,
      model: MODELS[model].key,
      nodeId: `qgen-${node.nodeID}`, // Unique ID for question generation request
      onChunk: (message) => {
        // console.log("Chunk received for qgen:", message);
        try {
            const parsed = JSON.parse(message);
            const { type, nodeId: messageNodeId, content, message: errorMessage } = parsed;

            // Ignore messages not for this specific question generation request
            if (messageNodeId !== `qgen-${node.nodeID}`) {
              // console.warn(`Ignoring message for different node: ${messageNodeId}`);
              return;
            }

            if (type === 'chunk' && content) {
                questionsJson += content;
                const closedJson = closePartialJson(questionsJson);
                try {
                  const parsedQuestions = JSON.parse(closedJson);
                  // Add basic validation if needed (e.g., check if it's an array)
                  if (Array.isArray(parsedQuestions)) {
                     onIntermediate(parsedQuestions);
                  } else {
                      // console.warn("Intermediate question JSON is not an array:", closedJson);
                  }
                } catch (e) {
                  // Ignore intermediate parsing errors, wait for complete JSON
                }
            } else if (type === 'error') {
                console.error(`[ERROR] during question generation stream (node ${node.nodeID}):`, errorMessage);
                finalError = errorMessage || "Unknown error during question generation.";
            } else if (type === 'done') {
                // console.log(`[DONE] received for question generation (node ${node.nodeID})`);
                // The promise resolves/rejects on websocket close now, so 'done' is just informational here
            }
        } catch(e) {
            console.error(`Error parsing WebSocket message in getQuestions (node ${node.nodeID}):`, message, e);
            // Accumulate non-JSON potentially? Or log and ignore.
        }
      },
    });
    // Promise resolved, meaning WebSocket closed cleanly
     console.log(`Question generation WebSocket closed cleanly for node ${node.nodeID}`);
  } catch (error: any) {
     // Promise rejected, meaning WebSocket errored or closed uncleanly
     console.error(`Error during openai call for getQuestions (node ${node.nodeID}):`, error);
     finalError = error?.message || String(error);
  }


  if (finalError) {
    console.error(`Final error occurred during question generation for node ${node.nodeID}: ${finalError}`);
    // Optionally, update the UI to show an error state for the parent node
    // onIntermediate([]); // Call with empty array or specific error signal?
    return; // Stop processing if there was a final error
  }


  try {
    // Final parse attempt after stream completion
    const finalQuestions = JSON.parse(questionsJson);
     if (Array.isArray(finalQuestions)) {
        onIntermediate(finalQuestions); // Ensure the final complete list is processed
     } else {
         console.error("Final question JSON is not an array:", questionsJson);
     }
  } catch (e) {
    // This is a real error if the final accumulated result is not parseable
    console.error(
      `Error parsing final accumulated question JSON for node ${node.nodeID}:`,
      e,
      "The malformed JSON was:",
      questionsJson
    );
     // onIntermediate([]); // Signal error with empty array?
  }
}


interface NodeGeneratorOpts {
  apiKey: ApiKey;
  model: string;
  persona: string;
  questionQueue: string[];
  qaTreeRef: React.MutableRefObject<QATree>;
  processingNodes: React.MutableRefObject<Set<string>>;
  focusedId: string | null;
  onChangeQATree: () => void;
  onNodeGenerated: (completedNodeId: string) => void;
  initialGenerationCompletedAndPausedRef: React.MutableRefObject<boolean>;
}

async function* nodeGenerator(
  opts: NodeGeneratorOpts
): AsyncIterableIterator<void> {
  while (true) {
    let nodeId: string | undefined;

    // --- Dequeue Logic ---
    while (nodeId === undefined) {
      // Check queue only if not focused or if focused and queue has children of focus
      let canProcessQueue = !opts.focusedId || opts.questionQueue.some(id => isChild(opts.qaTreeRef.current, opts.focusedId!, id));
      // Always allow processing '0' if it's the only thing in the queue, even if focused elsewhere
      if (opts.questionQueue.length === 1 && opts.questionQueue[0] === '0') {
          canProcessQueue = true;
      }


      if (canProcessQueue && opts.questionQueue.length > 0) {
        // Find the first item in the queue that isn't currently processing *and* meets focus criteria
        let foundIndex = -1;
        for (let i = 0; i < opts.questionQueue.length; i++) {
            const potentialNodeId = opts.questionQueue[i];
            const meetsFocus = !opts.focusedId || potentialNodeId === '0' || isChild(opts.qaTreeRef.current, opts.focusedId, potentialNodeId);
            if (!opts.processingNodes.current.has(potentialNodeId) && meetsFocus) {
                foundIndex = i;
                break;
            }
        }

        if (foundIndex !== -1) {
            const potentialNodeId = opts.questionQueue[foundIndex];
             // Attempt to claim by adding to the processing set FIRST
            opts.processingNodes.current.add(potentialNodeId);

            // Now, try to remove it from the queue at the found index
            const claimedNodeId = opts.questionQueue.splice(foundIndex, 1)[0];

            if (claimedNodeId === potentialNodeId) {
                 nodeId = claimedNodeId;
                 console.log(`Generator claimed node ${nodeId} (Focus: ${opts.focusedId ?? 'None'}). Queue:`, opts.questionQueue);
            } else {
                // This should not happen with splice, but as a safeguard:
                opts.processingNodes.current.delete(potentialNodeId);
                console.error(`Claim mismatch: expected ${potentialNodeId}, got ${claimedNodeId}. Released claim.`);
                 // Add back the potential node if it wasn't the one removed? Highly unlikely.
                 if(claimedNodeId) opts.questionQueue.splice(foundIndex, 0, claimedNodeId); // Put it back
            }

        } else {
            // No suitable node found in queue (all processing or don't meet focus)
             await new Promise((resolve) => setTimeout(resolve, 100)); // Wait before checking queue again
             yield;
        }

      } else {
        // Queue is empty or focus prevents processing
        await new Promise((resolve) => setTimeout(resolve, 100));
        yield;
      }
    }
    // --- End Dequeue Logic ---


    if (!nodeId) {
      console.error("Generator loop: nodeId is undefined after dequeue!");
      continue;
    }

    const currentProcessingNodeId = nodeId;
    console.log(`Generator processing node: ${currentProcessingNodeId}`);
    let nodeErrorOccurred = false;

    try {
      const currentTree = opts.qaTreeRef.current;
      const node = currentTree[currentProcessingNodeId];
      if (node == null) {
        console.log(`Node ${currentProcessingNodeId} not found in generator (likely deleted).`);
        yield; // Yield control before finally block
        continue;
      }
       // Skip if node already has an answer (e.g., generated manually before generator picked it up)
      if (node.answer) {
          console.log(`Node ${currentProcessingNodeId} already has an answer. Generator skipping main processing.`);

          // **FIX: Signal initial node completion even if skipped**
          // If this is node '0' and the initial generation pause hasn't been triggered yet, trigger it now.
          const initialGenRef = (opts as any).initialGenerationCompletedAndPausedRef; // Need to pass this ref
          if (currentProcessingNodeId === '0' && initialGenRef && !initialGenRef.current) {
              console.log(`Generator (skipped): Signaling completion for initial node '0'.`);
              opts.onNodeGenerated('0'); // Trigger the pause/completion logic
          }

          yield; // Yield control
          continue; // Skip the rest of the processing for this node
      }

      node.startedProcessing = true;
      opts.onChangeQATree(); // Update UI to show processing started

      const promptForAnswer = PERSONAS[opts.persona].getPromptForAnswer(node, currentTree);

      // --- Call OpenAI ---
      await openai(promptForAnswer, {
        apiKey: opts.apiKey.key,
        temperature: 1,
        model: MODELS[opts.model].key,
        nodeId: currentProcessingNodeId,
        onChunk: (message) => {
          // **FIX: Check currentProcessingNodeId is defined before use**
          if (!currentProcessingNodeId) return;

          const currentNode = opts.qaTreeRef.current[currentProcessingNodeId]; // Safe now
          if (!currentNode) return;

          try {
            const parsedMessage = JSON.parse(message);
            const { type, nodeId: messageNodeId, content, message: errorMessage } = parsedMessage;

            // **FIX: Use currentProcessingNodeId for comparison**
            if (messageNodeId !== currentProcessingNodeId) return;

            if (type === 'chunk' && content) {
              currentNode.answer += content;
            } else if (type === 'done') {
              // console.log(`[DONE] received by generator for node ${currentProcessingNodeId}`);
            } else if (type === 'error') {
              console.error(`[ERROR] received by generator for node ${currentProcessingNodeId}:`, errorMessage);
              currentNode.answer += `\n\nError: ${errorMessage}`;
               nodeErrorOccurred = true;
            }
            opts.onChangeQATree();
          } catch (e) {
            console.error(`Generator: Error parsing WebSocket message for node ${currentProcessingNodeId}:`, message, e);
          }
        },
      });
       // --- OpenAI Call Finished ---
       console.log(`Generator: openai call promise resolved for node ${currentProcessingNodeId}. Error occurred: ${nodeErrorOccurred}`);


      // Check node still exists after await
      const updatedNode = opts.qaTreeRef.current[currentProcessingNodeId];
      if (!updatedNode) {
        console.log(`Node ${currentProcessingNodeId} was deleted after answer generation completed.`);
        yield;
        continue;
      }

      updatedNode.startedProcessing = false; // Mark processing finished

      // console.log(`Generator: Complete answer for node ${currentProcessingNodeId}:`, updatedNode.answer?.substring(0, 50),"...");

      opts.onChangeQATree(); // Final update with processing=false and full answer
      yield; // Yield after answer processing

      // --- Generate Questions (if applicable and no error) ---
      if (!nodeErrorOccurred && (updatedNode.nodeType === 'llm-question' || updatedNode.nodeType === 'user-question')) {
        console.log(`Generator: Getting questions for node ${currentProcessingNodeId}`);
        const childIds: string[] = []; // To keep track of added children
        await getQuestions(
          opts.apiKey,
          opts.model,
          opts.persona,
          updatedNode,
          opts.qaTreeRef.current,
          (partialQuestions) => {
            const parentNode = opts.qaTreeRef.current[currentProcessingNodeId];
            if (!parentNode) return;

            parentNode.children = parentNode.children || [];

            // Add new questions based on length difference
            if (partialQuestions.length > childIds.length) {
                for (let i = childIds.length; i < partialQuestions.length; i++) {
                    const newId = `q-${Math.random().toString(36).substring(2, 9)}`;
                    childIds.push(newId);
                    opts.qaTreeRef.current[newId] = {
                        nodeID: newId,
                        parent: currentProcessingNodeId,
                        question: partialQuestions[i].question,
                        answer: "",
                        nodeType: 'llm-question',
                        startedProcessing: false,
                        children: [],
                    };
                    if (!parentNode.children.includes(newId)) {
                        parentNode.children.push(newId);
                    }
                }
            }
            // Update existing questions
             for (let i = 0; i < partialQuestions.length && i < childIds.length; i++) {
                if(opts.qaTreeRef.current[childIds[i]]) {
                   opts.qaTreeRef.current[childIds[i]].question = partialQuestions[i].question;
                }
             }
            opts.onChangeQATree(); // Update UI with questions
          }
        );
         console.log(`Generator: Finished getting questions for node ${currentProcessingNodeId}`);

        yield; // Yield after question processing

        // --- Enqueue New Questions ---
        childIds.forEach((id) => {
          const childNode = opts.qaTreeRef.current[id];
          // Check exists, not started, meets focus criteria, and not already in queue
          if (childNode && !childNode.startedProcessing &&
              (!opts.focusedId || isChild(opts.qaTreeRef.current, opts.focusedId, id)) &&
              !opts.questionQueue.includes(id) && !opts.processingNodes.current.has(id)
             )
          {
            console.log(`Generator: Enqueuing child ${id} of node ${currentProcessingNodeId}. Focus: ${opts.focusedId ?? 'None'}`)
            opts.questionQueue.push(id);
          }
        });
        // --- End Enqueue ---
      }
      // --- End Generate Questions ---

      // Signal completion *after* all processing (answer + questions)
      // This will be skipped if the answer already existed initially.
      opts.onNodeGenerated(currentProcessingNodeId);
      yield;

    } catch(error) {
        // **FIX: Use captured ID**
        console.error(`Generator: Uncaught error processing node ${currentProcessingNodeId}:`, error);
         nodeErrorOccurred = true;
         // Update node state to reflect error if possible
         const node = opts.qaTreeRef.current[currentProcessingNodeId]; // Safe now
         if (node) {
            node.startedProcessing = false;
            node.answer += `\n\n[Generator Error: ${error}]`;
            opts.onChangeQATree();
         }
    } finally {
      // --- Release Node Claim ---
       // **FIX: Use captured ID**
      if (currentProcessingNodeId) {
        opts.processingNodes.current.delete(currentProcessingNodeId);
      }
       // --- End Release Node Claim ---
    }
    // --- End Process Node ---
  }
}


class NodeGenerator {
  generator: AsyncIterableIterator<void>;
  playing: boolean;
  ran: boolean;
  destroyed: boolean;
  opts: NodeGeneratorOpts;
  fullyPaused: boolean; // Reflects if the async iterator is currently paused (awaiting resume)
  onFullyPausedChange: (fullyPaused: boolean) => void;

  constructor(
    opts: NodeGeneratorOpts,
    onFullyPausedChange: (fullyPaused: boolean) => void
  ) {
    this.opts = opts;
    this.generator = nodeGenerator(opts);
    this.playing = true; // User intent to play/pause
    this.ran = false;
    this.destroyed = false;
    this.fullyPaused = false;
    this.onFullyPausedChange = onFullyPausedChange;
  }

  setFullyPaused(fullyPaused: boolean) {
    if (this.fullyPaused !== fullyPaused) {
      this.fullyPaused = fullyPaused;
      this.onFullyPausedChange(fullyPaused);
    }
  }

  async run() {
    if (this.ran) {
      // console.warn("Generator attempted to run multiple times.");
      return; // Prevent multiple runs
    }
    this.ran = true;
    // console.log("Generator run() started.");
    while (!this.destroyed) { // Check destroyed flag first
      while (!this.playing && !this.destroyed) { // Also check destroyed flag in inner loop
        if (!this.fullyPaused) { // Only set fullyPaused once per pause cycle
            this.setFullyPaused(true);
            // console.log("Generator entering paused state.");
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (this.destroyed) break; // Exit outer loop if destroyed

      if (this.fullyPaused) { // Unset fullyPaused if we were paused and are now resuming
          this.setFullyPaused(false);
          // console.log("Generator leaving paused state.");
      }

      try {
        // console.log("Generator calling next()");
        const { done } = await this.generator.next();
        if (done || this.destroyed) {
           // console.log("Generator loop finished or generator destroyed.");
           break;
        }
      } catch (error) {
          console.error("Error in node generator iteration:", error);
          // Keep running but pause on error?
          this.playing = false; // Pause on error
      }
    }
     // console.log(`Generator run() ended. Destroyed: ${this.destroyed}`);
     // Ensure fullyPaused is true if destroyed while paused
     if (this.destroyed && !this.playing) {
         this.setFullyPaused(true);
     }
  }


  resume() {
    if (!this.playing) {
       // console.log("Generator resume()");
       this.playing = true;
       // setFullyPaused(false) will be handled by the run loop when it resumes
    }
  }

  pause() {
     if (this.playing) {
       // console.log("Generator pause()");
       this.playing = false;
        // setFullyPaused(true) will be handled by the run loop when it pauses
     }
  }

  destroy() {
    if (!this.destroyed) {
       // console.log("Generator destroy()");
       this.destroyed = true;
       this.playing = false; // Stop processing immediately
       // Clear callbacks to prevent updates after destruction
       this.opts.onChangeQATree = () => {};
       this.opts.onNodeGenerated = () => {};
       this.onFullyPausedChange = () => {}; // Clear internal callback too
    }
  }
}


class MultiNodeGenerator {
  opts: NodeGeneratorOpts;
  generators: NodeGenerator[];
  // Callback passed from GraphPage to update its fullyPaused state
  onAllGeneratorsPausedChange: (fullyPaused: boolean) => void;

  constructor(
    n: number,
    opts: NodeGeneratorOpts,
    // This callback is crucial for GraphPage to know the overall state
    onAllGeneratorsPausedChange: (fullyPaused: boolean) => void
  ) {
    this.opts = opts;
    this.generators = [];
    this.onAllGeneratorsPausedChange = onAllGeneratorsPausedChange;

    // Create generators, passing a *local* callback to each
    for (let i = 0; i < n; i++) {
      const generatorOpts: NodeGeneratorOpts = { ...this.opts };
      this.generators.push(
        new NodeGenerator(generatorOpts, () => {
          // This internal callback is triggered when *any* individual NodeGenerator's
          // fullyPaused state changes. We then check the state of *all* generators.
          const allPaused = this.generators.every((gen) => gen.fullyPaused);
          // console.log(`Multi: Generator ${i} pause state changed. All paused: ${allPaused}`);
          // Call the main callback passed from GraphPage
          this.onAllGeneratorsPausedChange(allPaused);
        })
      );
    }
  }


  run() {
    // console.log(`MultiNodeGenerator: Running ${this.generators.length} generators.`);
    for (const gen of this.generators) {
      gen.run();
    }
  }

  resume() {
    // console.log("MultiNodeGenerator: Resuming all generators.");
    for (const gen of this.generators) {
      gen.resume();
    }
    // Explicitly signal that generators are no longer paused, even if the internal
    // callbacks haven't fired yet (e.g., if run loop hasn't iterated)
    this.onAllGeneratorsPausedChange(false);
  }

  pause() {
    // console.log("MultiNodeGenerator: Pausing all generators.");
    for (const gen of this.generators) {
      gen.pause();
    }
     // Explicitly signal that generators are paused now.
    this.onAllGeneratorsPausedChange(true);
  }

  destroy() {
    // console.log("MultiNodeGenerator: Destroying all generators.");
    for (const gen of this.generators) {
      gen.destroy();
    }
    this.generators = []; // Clear the array
    // Ensure final state is paused after destruction
    this.onAllGeneratorsPausedChange(true);
  }

  setFocusedId(id: string | null) {
     console.log(`MultiNodeGenerator: Setting focused ID to ${id}`);
    this.opts.focusedId = id; // Update shared opts object
    // The generators read from the shared opts object, so no need to update each one individually
    // unless they were making copies (which they shouldn't be for the main opts).

    // If focusing, we might want to interrupt/pause generators working on non-child nodes.
    // However, the current nodeGenerator loop already checks focus before processing.
    // We might need to nudge the generators to re-evaluate their current task if focus changes.
    // This is complex. For now, rely on the dequeue check.
    // A potential improvement: generator.interruptIfFocusMismatch(newFocusId);
  }
}

function GraphPage(props: {
  seedQuery: string;
  model: string;
  persona: string;
  apiKey: ApiKey;
  onExit(): void;
}) {
  const isInitializedRef = useRef(false);
  const [resultTree, setResultTree] = useState<QATree>({});
  const questionQueueRef = useRef<string[]>([]);
  const qaTreeRef = useRef<QATree>({});
  const generatorRef = useRef<MultiNodeGenerator>();
  const [playing, setPlaying] = useState(true);
  const [fullyPaused, setFullyPaused] = useState(false);
  const initialNode0Completed = useRef(false);
  const [answeringNodes, setAnsweringNodes] = useState<Set<string>>(new Set());
  const processingNodesRef = useRef<Set<string>>(new Set());

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [edgeToDelete, setEdgeToDelete] = useState<string | null>(null);

  const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState(false);
  const [addNodeSourceId, setAddNodeSourceId] = useState<string | null>(null);

  const setNodeData = useCallback((nodeId: string, dataChanges: Partial<QATreeNode>) => {
      if (!qaTreeRef.current[nodeId]) {
          console.warn(`Attempted to set data for non-existent node ${nodeId}`);
          return;
      }
      // Prevent overwriting if dataChanges is empty or null
      if (!dataChanges || Object.keys(dataChanges).length === 0) {
          return;
      }
      qaTreeRef.current = {
          ...qaTreeRef.current,
          [nodeId]: {
              ...qaTreeRef.current[nodeId],
              ...dataChanges,
          },
      };
      setResultTree(structuredClone(qaTreeRef.current));
  }, []);

  const requestAddUserNode = useCallback((parentId: string, newNodeType: NodeType) => {
      const parentNode = qaTreeRef.current[parentId];
      if (!parentNode) {
          console.error(`Parent node ${parentId} not found for adding new user node.`);
          return;
      }

      let prefix = 'u'; // Default prefix
      if (newNodeType === 'user-question') prefix = 'uq';
      else if (newNodeType === 'user-file') prefix = 'uf';
      else if (newNodeType === 'user-webpage') prefix = 'uw';

      const newIdSuffix = Math.random().toString(36).substring(2, 9); // Longer suffix
      const newNodeId = `${prefix}-${parentId}-${newIdSuffix}`; // Include parent ID for context

      const newNode: QATreeNode = {
          nodeID: newNodeId,
          nodeType: newNodeType,
          question: '',
          answer: '',
          parent: parentId,
          children: [],
          isLoading: false,
          startedProcessing: false,
      };

      qaTreeRef.current = {
          ...qaTreeRef.current,
          [newNodeId]: newNode,
      };
      parentNode.children = [...(parentNode.children || []), newNodeId];

      setResultTree(structuredClone(qaTreeRef.current));
      console.log(`Added new node ${newNodeId} of type ${newNodeType} as child of ${parentId}`);
  }, []);

  const generateAnswerForNode = useCallback(
    async (nodeId: string) => {
      console.log(`Manual trigger: generateAnswerForNode(${nodeId})`);

      const node = qaTreeRef.current[nodeId];
      if (!node) {
        console.warn(`Manual trigger: Node ${nodeId} not found.`);
        return;
      }
      if (node.answer) {
          console.warn(`Manual trigger: Node ${nodeId} already has an answer.`);
          return;
      }
      if (processingNodesRef.current.has(nodeId)) {
          console.warn(`Manual trigger: Node ${nodeId} is already being processed by the generator.`);
          return;
      }
      if (answeringNodes.has(nodeId)) {
          console.warn(`Manual trigger: Node ${nodeId} is already being answered manually.`);
          return;
      }

      // **FIXED: Define commonOpts outside the try block**
      const commonOpts = {
        apiKey: props.apiKey,
        model: props.model,
        persona: props.persona,
        qaTreeRef: qaTreeRef, // Pass the ref
      };

      setAnsweringNodes(prev => new Set(prev).add(nodeId)); // Track manual answering start
      node.startedProcessing = true; // Mark as processing
      setResultTree(structuredClone(qaTreeRef.current)); // <<< ENSURE THIS UPDATE TRIGGERS RENDER

      let nodeErrorOccurred = false;

      try {
        // No need to define commonOpts again here

        const promptForAnswer = PERSONAS[commonOpts.persona].getPromptForAnswer(
          node,
          commonOpts.qaTreeRef.current // Access .current when needed
        );

        // --- Call OpenAI ---
        await openai(promptForAnswer, {
          apiKey: commonOpts.apiKey.key,
          temperature: 1,
          model: MODELS[commonOpts.model].key,
          nodeId: nodeId, // Pass node ID for server-side tracking
          onChunk: (message) => {
            // Safely update ref, then trigger state update
            const currentNode = commonOpts.qaTreeRef.current[nodeId]; // commonOpts is accessible
            if (!currentNode) return; // Node might have been deleted

            try {
              const parsedMessage = JSON.parse(message);
              const { type, nodeId: messageNodeId, content, message: errorMessage } = parsedMessage;

              if (messageNodeId !== nodeId) return; // Ignore messages for other nodes

              if (type === 'chunk' && content) {
                currentNode.answer += content;
              } else if (type === 'done') {
                // console.log(`[DONE] received by manual trigger for node ${nodeId}`);
              } else if (type === 'error') {
                console.error(`[ERROR] received by manual trigger for node ${nodeId}:`, errorMessage);
                currentNode.answer += `\n\nError: ${errorMessage}`;
                 nodeErrorOccurred = true;
              }
              setResultTree(structuredClone(commonOpts.qaTreeRef.current)); // commonOpts is accessible
            } catch (e) {
              console.error(`Manual trigger: Error parsing WebSocket message for node ${nodeId}:`, message, e);
            }
          },
        });
         // --- OpenAI Call Finished ---
         console.log(`Manual trigger: openai call promise resolved for node ${nodeId}. Error occurred: ${nodeErrorOccurred}`);

        // Check node still exists after await
        const updatedNodeCheck = commonOpts.qaTreeRef.current[nodeId];
        if (!updatedNodeCheck) {
          console.log(`Manual trigger: Node ${nodeId} was deleted after answer generation completed.`);
          return;
        }

        // Add a small delay to allow dimension updates to propagate before adding children
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay

        // --- Generate Questions After Manual Answer (if applicable) ---
        if (!nodeErrorOccurred && (updatedNodeCheck.nodeType === 'llm-question' || updatedNodeCheck.nodeType === 'user-question')) {
            console.log(`Manual trigger: Getting questions for node ${nodeId}`);
            const childIds: string[] = [];
             await getQuestions(
                commonOpts.apiKey,
                commonOpts.model,
                commonOpts.persona,
                updatedNodeCheck, // Pass the latest node data
                commonOpts.qaTreeRef.current,
                (partialQuestions) => {
                    const parentNode = commonOpts.qaTreeRef.current[nodeId];
                    if (!parentNode) return;

                    parentNode.children = parentNode.children || [];

                    // Add new questions based on length difference
                    if (partialQuestions.length > childIds.length) {
                        for (let i = childIds.length; i < partialQuestions.length; i++) {
                            const newId = `q-${Math.random().toString(36).substring(2, 9)}`;
                            childIds.push(newId);
                            commonOpts.qaTreeRef.current[newId] = {
                                nodeID: newId,
                                parent: nodeId,
                                question: partialQuestions[i].question,
                                answer: "",
                                nodeType: 'llm-question',
                                startedProcessing: false,
                                children: [],
                            };
                            if (!parentNode.children.includes(newId)) {
                                parentNode.children.push(newId);
                            }
                        }
                    }
                    // Update existing questions
                     for (let i = 0; i < partialQuestions.length && i < childIds.length; i++) {
                        if(commonOpts.qaTreeRef.current[childIds[i]]) {
                           commonOpts.qaTreeRef.current[childIds[i]].question = partialQuestions[i].question;
                        }
                     }
                    setResultTree(structuredClone(commonOpts.qaTreeRef.current)); // Update UI with questions
                }
            );
             console.log(`Manual trigger: Finished getting questions for node ${nodeId}`);
             // Force one final update after questions might have been added
             setResultTree(structuredClone(qaTreeRef.current));
        }
        // --- End Generate Questions ---

      } catch (error: any) {
        console.error(`Manual trigger: Error generating answer/questions for node ${nodeId}:`, error);
        nodeErrorOccurred = true; // Mark error
        // Update node state to reflect error if possible
        // **FIXED: commonOpts is now accessible here**
        const nodeWithError = commonOpts.qaTreeRef.current[nodeId];
        if (nodeWithError) {
          nodeWithError.answer += `\n\n[Manual Trigger Error: ${error?.message || error}]`;
        }
      } finally {
         // --- Final State Update & Cleanup ---
         // **FIXED: commonOpts is now accessible here**
         const finalNode = commonOpts.qaTreeRef.current[nodeId];
         if (finalNode) {
             finalNode.startedProcessing = false; // Ensure processing is marked finished
         }
         // Remove from manual answering set
         setAnsweringNodes(prev => {
           const next = new Set(prev);
           next.delete(nodeId);
           return next;
         });
         // Final state update to ensure UI reflects completion/error
         // **FIXED: commonOpts is now accessible here**
         setResultTree(structuredClone(commonOpts.qaTreeRef.current));
         console.log(`Manual trigger: Finished processing node ${nodeId}`);
         // --- End Final State Update & Cleanup ---
      }
    },
    [props.apiKey, props.model, props.persona, answeringNodes] // Include answeringNodes
  );


  const connectingNodeId = useRef<string | null>(null);

  const onConnectStart = useCallback((_event: React.MouseEvent | React.TouchEvent, { nodeId }: OnConnectStartParams) => {
      connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd = useCallback((event: MouseEvent | TouchEvent) => {
    const targetIsPane = (event.target as Element).classList.contains('react-flow__pane');
    const sourceNodeId = connectingNodeId.current;

    if (targetIsPane && sourceNodeId) {
      const sourceNode = qaTreeRef.current[sourceNodeId];
      const sourceIsAnswer = sourceNodeId.startsWith('a-');
      const sourceIsUserNode = sourceNode?.nodeType === 'user-file' || sourceNode?.nodeType === 'user-webpage';

      // Allow connection only from answer nodes or user-file/webpage nodes
      if (sourceIsAnswer || sourceIsUserNode) {
          setAddNodeSourceId(sourceNodeId);
          setIsAddNodeModalOpen(true);
      } else {
          console.log(`Connection end from invalid source node type/state: ${sourceNodeId} (Type: ${sourceNode?.nodeType})`);
      }
    }
    connectingNodeId.current = null; // Reset ref
  }, [requestAddUserNode]); // Add dependency


  // THE MAIN useEffect FOR INITIALIZATION AND GENERATOR MANAGEMENT
  useEffect(() => {
    const effectInstanceId = Math.random().toString(36).substring(2, 7);
    let isMounted = true;
    console.log(`GraphPage Mount/Effect Execution (${effectInstanceId})`);

    // Track active WebSocket promises for cleanup
    const activeWSPromises: any[] = [];

    // Override the openai function to track promises with cleanup handlers
    const originalOpenai = window.openai;
    window.openai = async function(
      prompt: string,
      opts: {
        apiKey: string;
        model: string;
        temperature: number;
        nodeId?: string;
        onChunk: (chunk: string) => void;
      }
    ) {
      const promise = originalOpenai(prompt, opts);
      activeWSPromises.push(promise);
      return promise;
    };

    let needsInitialization = false;

    // --- One-Time Initialization ---
    if (!isInitializedRef.current) {
        console.log(`(${effectInstanceId}) Performing ONE-TIME initialization.`);
        isInitializedRef.current = true;
        initialNode0Completed.current = false; // Ensure reset on full init
        questionQueueRef.current = ["0"];
        processingNodesRef.current = new Set<string>();
        qaTreeRef.current = {
            "0": { nodeID: '0', question: props.seedQuery, answer: "", nodeType: 'llm-question', startedProcessing: false, children: [], },
        };
        // Force an immediate update to the UI
        setResultTree(structuredClone(qaTreeRef.current));
        needsInitialization = true;
    } else {
        console.log(`(${effectInstanceId}) Skipping initialization (already done).`);
        // ** Ensure state sync even when skipping full init **
        setResultTree(structuredClone(qaTreeRef.current));
    }
    // --- End One-Time Initialization ---


    // --- State Sync & Initial Pause Check (Runs Every Time) ---
    const node0 = qaTreeRef.current['0'];

    // Determine if the generator should start in a playing state
    // Use the potentially updated node0 from the ref
    const shouldBePlaying = !(node0 && node0.answer);
    setPlaying(shouldBePlaying);
    // Initial fullyPaused state depends on whether it should be playing
    setFullyPaused(!shouldBePlaying);
    // --- End State Sync ---


    // --- Generator Setup (Runs Every Time) ---
    if(generatorRef.current) {
        console.warn(`(${effectInstanceId}) Generator ref was not undefined at start of useEffect. Forcing destroy.`);
        generatorRef.current.destroy();
    }

    console.log(`(${effectInstanceId}) Creating new MultiNodeGenerator instance.`);
    const newGenerator = new MultiNodeGenerator(
      1,
      { // Pass refs and props
        apiKey: props.apiKey,
        model: props.model,
        persona: props.persona,
        questionQueue: questionQueueRef.current,
        qaTreeRef: qaTreeRef,
        processingNodes: processingNodesRef,
        focusedId: null,
        // **Pass the completion ref to the generator options**
        initialGenerationCompletedAndPausedRef: initialNode0Completed,
        onChangeQATree: () => {
          if (isMounted) setResultTree(structuredClone(qaTreeRef.current));
        },
        onNodeGenerated: (completedNodeId: string) => {
          if (isMounted && qaTreeRef.current[completedNodeId]) {
            if (completedNodeId === '0' && !initialNode0Completed.current) {
              console.log(`(${effectInstanceId}) onNodeGenerated('0') called. Setting completion flag and pause state.`);
              initialNode0Completed.current = true;
              setPlaying(false); // Update user intent state
            }
          }
        },
      },
      (allPaused) => { // Callback for fullyPaused state
        if (isMounted) setFullyPaused(allPaused);
      }
    );
    generatorRef.current = newGenerator;
    // --- End Generator Setup ---


    // --- Run Generator ---
    console.log(`(${effectInstanceId}) Running generator. Should be playing: ${shouldBePlaying}`);
    newGenerator.run();
    if (!shouldBePlaying) {
        console.log(`(${effectInstanceId}) Applying initial pause to generator immediately after run().`);
        newGenerator.pause(); // Apply pause if needed
    }
    // --- End Run Generator ---


    // --- Effect Cleanup ---
    return () => {
      isMounted = false;
      console.log(`Cleanup for effect instance (${effectInstanceId}).`);

      // First, restore the original openai function
      window.openai = originalOpenai;

      // Clean up WebSocket connections properly
      console.log(`Cleaning up ${activeWSPromises.length} active WebSocket connections`);
      activeWSPromises.forEach(promise => {
        if (promise.cleanup && typeof promise.cleanup === 'function') {
          try {
            promise.cleanup();
          } catch (err) {
            console.error("Error during WebSocket cleanup:", err);
          }
        }
      });

      // Now safely destroy the generator
      if (generatorRef.current) {
        console.log(`(${effectInstanceId}) Destroying generator during cleanup`);
        generatorRef.current.destroy();
        generatorRef.current = undefined;
      }
    };
    // Dependencies: Re-run effect if these props change.
  }, [props.apiKey, props.model, props.persona, props.seedQuery]); // Keep dependencies


  const [nodeDims, setNodeDims] = useState<NodeDims>({});

  const requestDeleteBranch = useCallback((edgeId: string) => {
    console.log("Requesting confirmation to delete edge:", edgeId);
    setEdgeToDelete(edgeId);
    setIsConfirmModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!edgeToDelete) return;
    console.log("Confirmed deletion for edge:", edgeToDelete);

    const edgeParts = edgeToDelete.split('-');
    let sourceNodeId: string | null = null;
    let targetNodeId: string | null = null;

     // Basic parsing logic (adjust based on actual edge ID format)
     // Example "a-parent-q-child", "q-parent-q-child", "q-parent-a-answer"
     if (edgeParts.length >= 3) {
         sourceNodeId = edgeParts[0] + '-' + edgeParts[1]; // e.g., "a-parent" or "q-parent"
         targetNodeId = edgeParts[edgeParts.length - 2] + '-' + edgeParts[edgeParts.length - 1]; //e.g., "q-child" or "a-answer"
     }

     // If the target is an answer node (a-...), we want to start deletion from the corresponding question node (q-...)
     let deletionRootId = targetNodeId;
     if (targetNodeId?.startsWith('a-')) {
         deletionRootId = 'q-' + targetNodeId.substring(2);
     }


    if (!deletionRootId || !(deletionRootId in qaTreeRef.current)) {
        console.error(`Deletion root node ${deletionRootId} (derived from edge ${edgeToDelete}, target ${targetNodeId}) not found.`);
        setEdgeToDelete(null);
        setIsConfirmModalOpen(false);
        return;
    }

     console.log(`Identified deletion root node: ${deletionRootId}`);

    const nodesToDelete = new Set<string>();
    const deletionStack: string[] = [deletionRootId]; // Start cascade from the root

    while (deletionStack.length > 0) {
      const currentId = deletionStack.pop()!; // Non-null assertion ok due to loop condition
      if (!qaTreeRef.current[currentId] || nodesToDelete.has(currentId)) continue;

      nodesToDelete.add(currentId);
      // Also delete associated answer node if it exists
      const answerNodeId = `a-${currentId}`;
      if (qaTreeRef.current[answerNodeId]) {
          nodesToDelete.add(answerNodeId);
      }

      const children = qaTreeRef.current[currentId]?.children;
      if (children) {
        children.forEach(childId => {
          if (qaTreeRef.current[childId]) deletionStack.push(childId);
        });
      }
    }

    console.log("Nodes identified for deletion:", Array.from(nodesToDelete));

    const newTree = structuredClone(qaTreeRef.current);
    let changesMade = false;
    nodesToDelete.forEach(idToDelete => {
      if (idToDelete in newTree) {
        const parentId = newTree[idToDelete]?.parent;
        delete newTree[idToDelete];
        // Clean up parent's children array
        if (parentId && newTree[parentId]?.children) {
            newTree[parentId].children = newTree[parentId].children?.filter(child => child !== idToDelete);
        }
        changesMade = true;
      }
    });

    if (changesMade) {
      qaTreeRef.current = newTree;
      setResultTree(newTree);
      console.log("Deletion complete. New tree size:", Object.keys(qaTreeRef.current).length);
    } else {
        console.log("No changes made during deletion.");
    }

    setIsConfirmModalOpen(false);
    setEdgeToDelete(null);
  }, [edgeToDelete]); // Dependency


  const { nodes, edges } = useMemo(() => {
      return convertTreeToFlow(
          resultTree,
          setNodeDims,
          requestDeleteBranch,
          true, // Temporarily set animated to true, will be overridden
          generateAnswerForNode,
          answeringNodes,
          setNodeData,
          requestAddUserNode
      );
  // Remove playing and fullyPaused from dependencies
  }, [resultTree, requestDeleteBranch, generateAnswerForNode, answeringNodes, setNodeData, requestAddUserNode, setNodeDims]);

  // Dynamically update edges for animation
  const animatedEdges = useMemo(() => {
    const shouldAnimate = playing && !fullyPaused;
    return edges.map(edge => ({ ...edge, animated: shouldAnimate }));
  }, [edges, playing, fullyPaused]);


  function handlePlayPauseClick() {
      const newPlayingState = !playing;
      setPlaying(newPlayingState); // Update user intent immediately

      if (newPlayingState) {
          console.log("User clicked Play -> Resuming generator");
          generatorRef.current?.resume();
      } else {
          console.log("User clicked Pause -> Pausing generator");
          generatorRef.current?.pause();
      }
  }


  // --- Debugging Logs ---
  // useEffect(() => { console.log("Result Tree State Updated:", Object.keys(resultTree).length); }, [resultTree]);
  // useEffect(() => { console.log("Playing State Changed:", playing); }, [playing]);
  // useEffect(() => { console.log("Fully Paused State Changed:", fullyPaused); }, [fullyPaused]);
  // --- End Debugging Logs ---

  return (
    <FocusedContextProvider
      qaTree={resultTree}
      onSetFocusedId={(id) => {
        // Set focus in the shared options object for the generator
         if (generatorRef.current) {
            generatorRef.current.setFocusedId(id);
         }
      }}
    >
      <div className="text-sm">
        <FlowProvider
          flowNodes={nodes}
          flowEdges={animatedEdges}
          nodeDims={nodeDims}
          deleteBranch={requestDeleteBranch}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
        />
        <AddNodeModal
          isOpen={isAddNodeModalOpen}
          onClose={() => {
              setIsAddNodeModalOpen(false);
              setAddNodeSourceId(null);
          }}
          onAddNode={(type: NodeType) => {
              if (addNodeSourceId) {
                requestAddUserNode(addNodeSourceId, type);
              }
              setIsAddNodeModalOpen(false); // Close after adding
              setAddNodeSourceId(null);
          }}
          sourceNodeId={addNodeSourceId}
        />
        <div className="fixed right-4 bottom-4 flex items-center space-x-2 z-20">
          {SERVER_HOST.includes("localhost") && (
            <div
              className="bg-black/40 p-2 flex items-center justify-center rounded cursor-pointer hover:text-green-400 backdrop-blur"
              onClick={() => {
                const filename = (props.seedQuery || 'graph-export')
                  .toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 50);
                const dict: any = {
                  version: "1.0.0", persona: props.persona, model: props.model,
                  seedQuery: props.seedQuery, tree: structuredClone(qaTreeRef.current), // Export ref
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
              {PERSONAS[props.persona].name} • {MODELS[props.model].name}
            </div>
            <div
              className="rounded-full bg-white/20 w-7 h-7 flex items-center justify-center cursor-pointer hover:bg-white/30"
              onClick={handlePlayPauseClick}
              title={playing ? "Pause Auto-Generation" : "Resume Auto-Generation"}
            >
              {/* Icon reflects user intent state 'playing' */}
              {playing ?
                 (fullyPaused ? <PauseIcon className="w-5 h-5 text-yellow-400" title="Playing (Idle)" /> : <PauseIcon className="w-5 h-5" title="Playing (Active)" />)
                 : <PlayIcon className="w-5 h-5" title="Paused" />
              }
            </div>
          </div>
        </div>
        <div
          onClick={() => { props.onExit(); }}
          className="fixed top-4 left-4 bg-black/40 rounded p-2 cursor-pointer hover:bg-black/60 backdrop-blur touch-none z-20"
           title="Exit to Start Page"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </div>

        <ConfirmDeleteModal
          isOpen={isConfirmModalOpen}
          onClose={() => { setIsConfirmModalOpen(false); setEdgeToDelete(null); }}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </FocusedContextProvider>
  );
}

export default GraphPage;
