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

export interface QATreeNode {
  question: string;
  parent?: string;
  answer: string;
  children?: string[];
  startedProcessing?: boolean;
}

export interface QATree {
  [key: string]: QATreeNode;
}

export type NodeDims = {
  [key: string]: {
    width: number;
    height: number;
  };
};

type TreeNode = Node & {
  parentNodeID: string;
};

type ConvertTreeToFlowProps = (
  tree: QATree,
  setNodeDims: any,
  requestDeleteBranch: (edgeId: string) => void,
  playing: boolean,
  generateAnswerForNode: (nodeId: string) => Promise<void>,
  answeringNodes: Set<string>
) => any;

export const convertTreeToFlow: ConvertTreeToFlowProps = (
  tree,
  setNodeDims,
  requestDeleteBranch,
  playing,
  generateAnswerForNode,
  answeringNodes
) => {
  const nodes: TreeNode[] = [];
  Object.keys(tree).forEach((key) => {
    const isQuestion = true;
    nodes.push({
      id: `q-${key}`,
      type: "fadeText",
      data: {
        text: tree[key].question,
        nodeID: `q-${key}`,
        setNodeDims,
        question: isQuestion,
        hasAnswer: !!tree[key].answer,
        onGenerateAnswer: generateAnswerForNode,
        isAnswering: answeringNodes.has(key),
      },
      position: { x: 0, y: 0 },
      parentNodeID: tree[key].parent != null ? `a-${tree[key].parent}` : "",
    });
    if (tree[key].answer) {
      const isAnswer = false;
      nodes.push({
        id: `a-${key}`,
        type: "fadeText",
        data: {
          text: tree[key].answer,
          nodeID: `a-${key}`,
          setNodeDims,
          question: isAnswer,
        },
        position: { x: 0, y: 0 },
        parentNodeID: `q-${key}`,
      });
    }
  });
  const edges: Edge[] = [];
  nodes.forEach((n) => {
    if (n.parentNodeID != "") {
      edges.push({
        id: `${n.parentNodeID}-${n.id}`,
        type: "deleteEdge",
        source: n.parentNodeID,
        target: n.id,
        data: {
          requestDeleteBranch,
        },
        animated: playing,
        markerEnd: { type: MarkerType.Arrow },
      });
    }
  });

  return { nodes, edges };
};

export interface ScoredQuestion {
  question: string;
  score: number;
}

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
  await openai(promptForQuestions, {
    apiKey: apiKey.key,
    temperature: 1,
    model: MODELS[model].key,
    onChunk: (chunk) => {
      questionsJson += chunk;
      const closedJson = closePartialJson(questionsJson);
      try {
        const parsed = JSON.parse(closedJson);
        onIntermediate(parsed);
      } catch (e) {
        // Ignore these, it will often be invalid
      }
    },
  });

  try {
    // Don't need to actually use the output
    JSON.parse(questionsJson);
  } catch (e) {
    // This is a real error if the final result is not parseable
    console.error(
      "Error parsing JSON:",
      e,
      "The malformed JSON was:",
      questionsJson
    );
  }
}

interface NodeGeneratorOpts {
  apiKey: ApiKey;
  model: string;
  persona: string;
  questionQueue: string[];
  qaTree: QATree;
  focusedId: string | null;
  onChangeQATree: () => void;
  onNodeGenerated: (completedNodeId: string) => void;
}

async function* nodeGenerator(
  opts: NodeGeneratorOpts
): AsyncIterableIterator<void> {
  while (true) {
    while (opts.questionQueue.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      yield;
    }

    console.log("Popped from queue", opts.questionQueue);

    const nodeId = opts.questionQueue.shift();
    if (nodeId == null) {
      throw new Error("Impossible");
    }

    const node = opts.qaTree[nodeId];
    if (node == null) {
      console.log(`Node ${nodeId} not found in generator, likely deleted.`);
      yield;
      continue;
    }
    node.startedProcessing = true;

    const promptForAnswer = PERSONAS[opts.persona].getPromptForAnswer(
      node,
      opts.qaTree
    );

    await openai(promptForAnswer, {
      apiKey: opts.apiKey.key,
      temperature: 1,
      model: MODELS[opts.model].key,
      onChunk: (chunk) => {
        const node = opts.qaTree[nodeId];
        if (node == null) {
          console.log(`Node ${nodeId} disappeared during answer generation.`);
          return;
        }
        node.answer += chunk;
        opts.onChangeQATree();
      },
    });

    if (!opts.qaTree[nodeId]) {
      console.log(`Node ${nodeId} was deleted after answer generation completed.`);
      yield;
      continue;
    }

    console.log(`Complete answer for node ${nodeId}:`, node.answer);
    console.log(`Length of answer for node ${nodeId}:`, node.answer.length);

    opts.onChangeQATree();
    yield;

    const ids: string[] = [];
    await getQuestions(
      opts.apiKey,
      opts.model,
      opts.persona,
      node,
      opts.qaTree,
      (partial) => {
        if (!opts.qaTree[nodeId]) {
          console.log(`Parent node ${nodeId} deleted before questions could be attached.`);
          return;
        }

        if (partial.length > ids.length) {
          for (let i = ids.length; i < partial.length; i++) {
            const newId = Math.random().toString(36).substring(2, 9);
            ids.push(newId);
            opts.qaTree[newId] = {
              question: "",
              parent: nodeId,
              answer: "",
            };

            if (opts.qaTree[nodeId].children == null) {
              opts.qaTree[nodeId].children = [newId];
            } else {
              opts.qaTree[nodeId].children?.push(newId);
            }
          }
        }
        for (let i = 0; i < partial.length; i++) {
          if(opts.qaTree[ids[i]]) {
            opts.qaTree[ids[i]].question = partial[i].question;
          }
        }
        opts.onChangeQATree();
      }
    );

    opts.onNodeGenerated(nodeId);
    yield;

    ids.forEach((id) => {
      if (opts.qaTree[id] &&
          !opts.qaTree[id].startedProcessing &&
          (!opts.focusedId || isChild(opts.qaTree, opts.focusedId, id)))
       {
        opts.questionQueue.push(id);
      }
    });
  }
}

class NodeGenerator {
  generator: AsyncIterableIterator<void>;
  playing: boolean;
  ran: boolean;
  destroyed: boolean;
  opts: NodeGeneratorOpts;
  fullyPaused: boolean;
  onFullyPausedChange: (fullyPaused: boolean) => void;

  constructor(
    opts: NodeGeneratorOpts,
    onFullyPausedChange: (fullyPaused: boolean) => void
  ) {
    this.opts = opts;
    this.generator = nodeGenerator(opts);
    this.playing = true;
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
      throw new Error("Already ran");
    }
    this.ran = true;
    while (true) {
      while (!this.playing) {
        this.setFullyPaused(true);
        if (this.destroyed) {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      this.setFullyPaused(false);
      try {
        const { done } = await this.generator.next();
        if (done || this.destroyed) {
           break;
        }
      } catch (error) {
          console.error("Error in node generator iteration:", error);
          break;
      }
    }
  }

  resume() {
    this.playing = true;
  }

  pause() {
    this.playing = false;
  }

  destroy() {
    this.destroyed = true;
    this.opts.onChangeQATree = () => {};
    this.opts.onNodeGenerated = () => {};
  }
}

class MultiNodeGenerator {
  opts: NodeGeneratorOpts;
  generators: NodeGenerator[];
  onFullyPausedChange: (fullyPaused: boolean) => void;

  constructor(
    n: number,
    opts: NodeGeneratorOpts,
    onFullyPausedChange: (fullyPaused: boolean) => void
  ) {
    this.opts = opts;
    this.generators = [];
    for (let i = 0; i < n; i++) {
      const generatorOpts = { ...opts };
      this.generators.push(
        new NodeGenerator(generatorOpts, () => {
          this.onFullyPausedChange(
            this.generators.every((gen) => gen.fullyPaused)
          );
        })
      );
    }
    this.onFullyPausedChange = onFullyPausedChange;
  }

  run() {
    for (const gen of this.generators) {
      gen.run();
    }
  }

  resume() {
    for (const gen of this.generators) {
      gen.resume();
    }
  }

  pause() {
    for (const gen of this.generators) {
      gen.pause();
    }
  }

  destroy() {
    for (const gen of this.generators) {
      gen.destroy();
    }
  }

  setFocusedId(id: string | null) {
    this.opts.focusedId = id;
    for (const gen of this.generators) {
        gen.opts.focusedId = id;
    }
  }
}

function GraphPage(props: {
  seedQuery: string;
  model: string;
  persona: string;
  apiKey: ApiKey;
  onExit(): void;
}) {
  const [resultTree, setResultTree] = useState<QATree>({});
  const questionQueueRef = useRef<string[]>([]);
  const qaTreeRef = useRef<QATree>({});
  const generatorRef = useRef<MultiNodeGenerator>();
  const [playing, setPlaying] = useState(true);
  const [fullyPaused, setFullyPaused] = useState(false);
  const initialGenerationPaused = useRef(false);
  const [answeringNodes, setAnsweringNodes] = useState<Set<string>>(new Set());

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [edgeToDelete, setEdgeToDelete] = useState<string | null>(null);

  const generateAnswerForNode = useCallback(
    async (nodeId: string) => {
      console.log("Manual trigger for node:", nodeId);
      setAnsweringNodes(prev => new Set(prev).add(nodeId));
      try {
        const node = qaTreeRef.current[nodeId];
        if (!node || node.answer) {
          console.warn(`Node ${nodeId} not found or already has answer.`);
          setAnsweringNodes(prev => {
             const next = new Set(prev);
             next.delete(nodeId);
             return next;
          });
          return;
        }

        node.startedProcessing = true;
        setResultTree(JSON.parse(JSON.stringify(qaTreeRef.current)));

        const commonOpts = {
          apiKey: props.apiKey,
          model: props.model,
          persona: props.persona,
          qaTree: qaTreeRef.current,
        };

        const promptForAnswer = PERSONAS[commonOpts.persona].getPromptForAnswer(
          node,
          commonOpts.qaTree
        );
        await openai(promptForAnswer, {
          apiKey: commonOpts.apiKey.key,
          temperature: 1,
          model: MODELS[commonOpts.model].key,
          onChunk: (chunk) => {
            const currentNode = commonOpts.qaTree[nodeId];
            if (currentNode) {
              currentNode.answer += chunk;
              setResultTree(JSON.parse(JSON.stringify(commonOpts.qaTree)));
            }
          },
        });

        if (!qaTreeRef.current[nodeId]) {
          console.log(`Node ${nodeId} was deleted after answer generation completed.`);
          return;
        }
        setResultTree(JSON.parse(JSON.stringify(commonOpts.qaTree)));

        await new Promise(resolve => setTimeout(resolve, 100));
        console.log("Delayed for 100ms");

        if (!qaTreeRef.current[nodeId]) {
          console.log(`Node ${nodeId} was deleted during the 100ms delay.`);
          return;
        }

        const questionIds: string[] = [];
        await getQuestions(
          commonOpts.apiKey,
          commonOpts.model,
          commonOpts.persona,
          qaTreeRef.current[nodeId],
          commonOpts.qaTree,
          (partial) => {
              if (!qaTreeRef.current[nodeId]) {
                  console.log(`Parent node ${nodeId} deleted while processing partial questions.`);
                  return;
              }
            if (partial.length > questionIds.length) {
              for (let i = questionIds.length; i < partial.length; i++) {
                const newId = Math.random().toString(36).substring(2, 9);
                questionIds.push(newId);
                commonOpts.qaTree[newId] = {
                  question: "",
                  parent: nodeId,
                  answer: "",
                };
                const parentNode = commonOpts.qaTree[nodeId];
                if (parentNode) {
                  if (!parentNode.children) parentNode.children = [];
                  parentNode.children.push(newId);
                }
              }
            }
            for (let i = 0; i < partial.length; i++) {
              if(commonOpts.qaTree[questionIds[i]]) {
                commonOpts.qaTree[questionIds[i]].question = partial[i].question;
              }
            }
            setResultTree(JSON.parse(JSON.stringify(commonOpts.qaTree)));
          }
        );
        setResultTree(JSON.parse(JSON.stringify(commonOpts.qaTree)));

      } catch (error) {
        console.error(`Error generating answer/questions for node ${nodeId}:`, error);
        if(qaTreeRef.current[nodeId]) {
          qaTreeRef.current[nodeId].startedProcessing = false;
          qaTreeRef.current[nodeId].answer += "\n\nError occurred.";
          setResultTree(JSON.parse(JSON.stringify(qaTreeRef.current)));
        }
      } finally {
         setAnsweringNodes(prev => {
           const next = new Set(prev);
           next.delete(nodeId);
           return next;
         });
      }
    },
    [props.apiKey, props.model, props.persona]
  );

  useEffect(() => {
    initialGenerationPaused.current = false;
    questionQueueRef.current = ["0"];
    qaTreeRef.current = {
      "0": {
        question: props.seedQuery,
        answer: "",
      },
    };
    setResultTree(qaTreeRef.current);

    generatorRef.current = new MultiNodeGenerator(
      2,
      {
        apiKey: props.apiKey,
        model: props.model,
        persona: props.persona,
        questionQueue: questionQueueRef.current,
        qaTree: qaTreeRef.current,
        focusedId: null,
        onChangeQATree: () => {
          setResultTree(JSON.parse(JSON.stringify(qaTreeRef.current)));
        },
        onNodeGenerated: (completedNodeId: string) => {
          if (qaTreeRef.current[completedNodeId] && completedNodeId === '0' && !initialGenerationPaused.current) {
             console.log("Initial questions generated, pausing generator.");
             generatorRef.current?.pause();
             setPlaying(false);
             initialGenerationPaused.current = true;
          }
        },
      },
      (fp) => {
        setFullyPaused(fp);
      }
    );
    generatorRef.current.run();
    return () => {
      generatorRef.current?.destroy();
    };
  }, [props.apiKey, props.model, props.persona, props.seedQuery]);

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
    let targetNodeId: string | null = null;

    if (edgeParts.length === 4) {
        targetNodeId = edgeParts[3];
    } else if (edgeParts.length === 3) {
        targetNodeId = edgeParts[2];
    } else {
        console.error("Could not parse edge ID format:", edgeToDelete);
        setEdgeToDelete(null);
        return;
    }

    if (!targetNodeId || !(targetNodeId in qaTreeRef.current)) {
        console.error(`Target node ${targetNodeId} not found in tree for deletion.`);
        setEdgeToDelete(null);
        return;
    }

    const nodesToDelete = new Set<string>();
    const deletionStack = [targetNodeId];

    while (deletionStack.length > 0) {
      const currentId = deletionStack.pop();
      if (!currentId || !qaTreeRef.current[currentId] || nodesToDelete.has(currentId)) {
        continue;
      }
      nodesToDelete.add(currentId);
      const children = qaTreeRef.current[currentId].children;
      if (children) {
        children.forEach(childId => {
          if (qaTreeRef.current[childId]) {
             deletionStack.push(childId);
          }
        });
      }
    }

    console.log("Nodes identified for deletion:", Array.from(nodesToDelete));

    const newTree = { ...qaTreeRef.current };
    let changesMade = false;
    nodesToDelete.forEach(idToDelete => {
      if (idToDelete in newTree) {
        delete newTree[idToDelete];

        const parentId = qaTreeRef.current[idToDelete]?.parent;
        if (parentId && newTree[parentId]?.children) {
            newTree[parentId].children = newTree[parentId].children?.filter(child => child !== idToDelete);
        }
        changesMade = true;
      } else {
          console.warn(`Node ${idToDelete} was already removed or never existed.`);
      }
    });

    if (changesMade) {
      qaTreeRef.current = newTree;
      setResultTree(JSON.parse(JSON.stringify(qaTreeRef.current)));
       console.log("Deletion complete. Updated tree:", qaTreeRef.current);
    } else {
        console.log("No changes made during deletion process.");
    }

    setEdgeToDelete(null);
  }, [edgeToDelete]);

  const { nodes, edges } = useMemo(() => {
    return convertTreeToFlow(resultTree, setNodeDims, requestDeleteBranch, playing, generateAnswerForNode, answeringNodes);
  }, [resultTree, playing, requestDeleteBranch, answeringNodes, generateAnswerForNode]);

  function resume() {
    if (!playing) {
       console.log("Resume clicked, but generation is now manual via 'Answer' buttons.");
    }
  }

  function pause() {
    generatorRef.current?.pause();
    setPlaying(false);
  }

  return (
    <FocusedContextProvider
      qaTree={resultTree}
      onSetFocusedId={(id) => {
        generatorRef.current?.setFocusedId(id);
      }}
    >
      <div className="text-sm">
        <FlowProvider
          flowNodes={nodes}
          flowEdges={edges}
          nodeDims={nodeDims}
          deleteBranch={requestDeleteBranch}
        />
        <div className="fixed right-4 bottom-4 flex items-center space-x-2 z-20">
          {SERVER_HOST.includes("localhost") && (
            <div
              className="bg-black/40 p-2 flex items-center justify-center rounded cursor-pointer hover:text-green-400 backdrop-blur"
              onClick={() => {
                const filename = props.seedQuery
                  .toLowerCase()
                  .replace(/\s+/g, "-");
                const dict: any = {
                  persona: props.persona,
                  model: props.model,
                  tree: { ...resultTree },
                };
                downloadDataAsJson(dict, filename);
              }}
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
              onClick={() => {
                if (playing) {
                  pause();
                } else {
                  console.log("Play button clicked, but generation is manual.");
                }
              }}
            >
              {initialGenerationPaused.current ? (
                 <PlayIcon className="w-5 h-5" />
              ) : playing ? (
                 <PauseIcon className="w-5 h-5" />
              ) : fullyPaused ? (
                 <PlayIcon className="w-5 h-5" />
              ) : (
                 <PlayIcon className="w-5 h-5 animate-pulse" />
              )}
            </div>
          </div>
        </div>
        <div
          onClick={() => {
            props.onExit();
          }}
          className="fixed top-4 left-4 bg-black/40 rounded p-2 cursor-pointer hover:bg-black/60 backdrop-blur touch-none z-20"
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
    </FocusedContextProvider>
  );
}

export default GraphPage;
