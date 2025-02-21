import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlowProvider, openai } from './Flow';
import { Edge, MarkerType, Node } from 'reactflow';
import { ArrowDownTrayIcon, ArrowLeftIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/solid';
import { closePartialJson, downloadDataAsJson } from './util/json';
import { PERSONAS } from './personas';
import { ApiKey } from './APIKeyModal';
import { SERVER_HOST } from './constants';
import { MODELS } from './models';
import { FocusedContextProvider, isChild } from './FocusedContext';
import { collection, addDoc } from 'firebase/firestore';
import { getFingerprint } from './main';
import { db } from './firebase';
import { autoSaveMindMap } from './util/storage';
import { FadeoutTextNode, UserInputNode } from './FadeoutTextNode';
// import { NodeProps, ReactFlowInstance } from 'reactflow';
import { FadeoutTextNodeProps } from './FadeoutTextNode';

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

export const convertTreeToFlow = (
  tree: QATree,
  setNodeDims: any,
  deleteBranch: any,
  playing: boolean,
  focusedId: string | null
): any => {
  const nodes: TreeNode[] = [];
  Object.keys(tree).forEach(key => {
    const isFocused = focusedId ? key === focusedId || isChild(tree, focusedId, key) : false;

    nodes.push({
      id: `q-${key}`,
      type: 'fadeText',
      data: {
        text: tree[key].question,
        nodeID: `q-${key}`,
        setNodeDims,
        question: true,
        hasAnswer: !!tree[key].answer,
        isFocused,
      },
      position: { x: 0, y: 0 },
      parentNodeID: tree[key].parent != null ? `a-${tree[key].parent}` : '',
    });
    if (tree[key].answer) {
      nodes.push({
        id: `a-${key}`,
        type: 'fadeText',
        data: {
          text: tree[key].answer,
          nodeID: `a-${key}`,
          setNodeDims,
          question: false,
        },
        position: { x: 0, y: 0 },
        parentNodeID: `q-${key}`,
      });
    }
  });
  const edges: Edge[] = [];
  nodes.forEach(n => {
    if (n.parentNodeID != '') {
      edges.push({
        id: `${n.parentNodeID}-${n.id}`,
        type: 'deleteEdge',
        source: n.parentNodeID,
        target: n.id,
        data: {
          deleteBranch,
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
  if ('getQuestions' in person) {
    onIntermediate(person.getQuestions(node, tree));
    return;
  }
  const promptForQuestions = person.getPromptForQuestions(node, tree);

  let questionsJson = '';
  await openai(promptForQuestions, {
    apiKey: apiKey.key,
    temperature: 1,
    model: MODELS[model].key,
    onChunk: chunk => {
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
    console.error('Error parsing JSON:', e, 'The malformed JSON was:', questionsJson);
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
  onNodeGenerated: () => void;
}

async function* nodeGenerator(opts: NodeGeneratorOpts): AsyncIterableIterator<void> {
  while (true) {
    while (opts.questionQueue.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
      yield;
    }

    console.log('Popped from queue', opts.questionQueue);

    const nodeId = opts.questionQueue.shift();
    if (nodeId == null) {
      throw new Error('Impossible');
    }

    const node = opts.qaTree[nodeId];
    if (node == null) {
      throw new Error(`Node ${nodeId} not found`);
    }
    node.startedProcessing = true;

    const promptForAnswer = PERSONAS[opts.persona].getPromptForAnswer(node, opts.qaTree);

    await openai(promptForAnswer, {
      apiKey: opts.apiKey.key,
      temperature: 1,
      model: MODELS[opts.model].key,
      onChunk: chunk => {
        const node = opts.qaTree[nodeId];
        if (node == null) {
          throw new Error(`Node ${nodeId} not found`);
        }
        node.answer += chunk;
        opts.onChangeQATree();
      },
    });

    yield;

    const ids: string[] = [];
    await getQuestions(opts.apiKey, opts.model, opts.persona, node, opts.qaTree, partial => {
      if (partial.length > ids.length) {
        for (let i = ids.length; i < partial.length; i++) {
          const newId = Math.random().toString(36).substring(2, 9);
          ids.push(newId);
          opts.qaTree[newId] = {
            question: '',
            parent: nodeId,
            answer: '',
          };

          // Here is where we're setting the parent (backwards edge)
          // which means we can set the children (forward edge)
          if (opts.qaTree[nodeId].children == null) {
            opts.qaTree[nodeId].children = [newId];
          } else {
            opts.qaTree[nodeId].children?.push(newId);
          }
        }
      }
      for (let i = 0; i < partial.length; i++) {
        opts.qaTree[ids[i]].question = partial[i].question;
      }
      opts.onChangeQATree();
    });

    opts.onNodeGenerated();
    yield;

    ids.forEach(id => {
      if (
        !opts.qaTree[id].startedProcessing &&
        (!opts.focusedId || isChild(opts.qaTree, opts.focusedId, id))
      ) {
        opts.questionQueue.push(id);
      }
    });
  }
}

class NodeGenerator {
  opts: NodeGeneratorOpts;
  running: boolean = false;
  fullyPaused: boolean = false;
  onFullyPausedChange: () => void;
  generator: AsyncIterator<void>;

  constructor(opts: NodeGeneratorOpts, onFullyPausedChange: () => void) {
    this.opts = opts;
    this.onFullyPausedChange = onFullyPausedChange;
    // Create the generator instance
    this.generator = nodeGenerator(this.opts);
  }

  async run() {
    if (this.running) return;
    this.running = true;

    while (this.running && this.opts.questionQueue.length > 0) {
      const questionId = this.opts.questionQueue[0];

      // Only process if the node hasn't started processing
      if (!this.opts.qaTree[questionId].startedProcessing) {
        // Use the generator to process the question
        await this.generator.next();
      } else {
        this.opts.questionQueue.shift();
      }
    }

    this.fullyPaused = true;
    this.onFullyPausedChange();
  }

  pause() {
    this.running = false;
  }

  resume() {
    this.run();
  }

  setFocusedId(id: string | null) {
    this.opts.focusedId = id;
  }
}

class MultiNodeGenerator {
  opts: NodeGeneratorOpts;
  generators: NodeGenerator[];
  onFullyPausedChange: (fullyPaused: boolean) => void;

  constructor(
    _n: number,
    opts: NodeGeneratorOpts,
    onFullyPausedChange: (fullyPaused: boolean) => void
  ) {
    this.opts = opts;
    this.generators = [];
    if (this.opts.questionQueue.length === 1 && this.opts.questionQueue[0] === '0') {
      this.generators.push(
        new NodeGenerator(opts, () => {
          this.onFullyPausedChange(true);
        })
      );
    }
    this.onFullyPausedChange = onFullyPausedChange;
  }

  run() {
    if (this.generators.length > 0) {
      this.generators[0].run();
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
    // Just stop the generators
    this.generators.forEach(gen => gen.pause());
    this.generators = [];
  }

  setFocusedId(id: string | null) {
    this.opts.focusedId = id;
  }
}

const NODE_LIMIT_PER_PLAY = 8;

function calculateNewNodePosition(parentNode?: Node, index: number = 0): { x: number; y: number } {
  if (!parentNode) {
    return { x: 0, y: 0 };
  }

  const radius = 200;
  const angle = (index * Math.PI) / 4; // Divides circle into 8 segments
  return {
    x: parentNode.position.x + radius * Math.cos(angle),
    y: parentNode.position.y + radius * Math.sin(angle),
  };
}

async function getAnswerFromAI(
  questionId: string,
  qaTree: QATree,
  persona: string,
  model: string,
  apiKey: string
) {
  const node = qaTree[questionId];
  const prompt = PERSONAS[persona].getPromptForAnswer(node, qaTree);

  let answer = '';
  await openai(prompt, {
    model,
    apiKey,
    temperature: 0.7,
    onChunk: chunk => {
      answer += chunk;
    },
  });
  return answer;
}

async function getSuggestedQuestions(
  questionId: string,
  qaTree: QATree,
  persona: string,
  model: string,
  apiKey: string
) {
  const node = qaTree[questionId];
  const persona_obj = PERSONAS[persona];
  let questions: string[] = [];

  if ('getPromptForQuestions' in persona_obj) {
    const prompt = persona_obj.getPromptForQuestions(node, qaTree);
    let response = '';
    await openai(prompt, {
      model,
      apiKey,
      temperature: 0.7,
      onChunk: chunk => {
        response += chunk;
      },
    });

    try {
      const parsed = JSON.parse(response);
      questions = parsed.map((q: any) => q.question);
    } catch (e) {
      console.error('Failed to parse questions:', e);
    }
  } else if ('getQuestions' in persona_obj) {
    const result = persona_obj.getQuestions(node, qaTree);
    questions = result.map(q => q.question);
  }

  return questions;
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
  const nodeCountRef = useRef(0);
  const pauseAtNodeCountRef = useRef(NODE_LIMIT_PER_PLAY);
  const focusedId = useRef<string | null>(null);
  const [activeUserQuestion, setActiveUserQuestion] = useState<{
    text: string;
    attachedTo: string;
  } | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    questionQueueRef.current = ['0'];
    qaTreeRef.current = {
      '0': {
        question: props.seedQuery,
        answer: '',
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
        onNodeGenerated: () => {
          nodeCountRef.current += 1;
          if (nodeCountRef.current >= pauseAtNodeCountRef.current) {
            pause();
          }
        },
      },
      fp => {
        setFullyPaused(fp);
      }
    );
    generatorRef.current.run();
    submitPrompt();
    return () => {
      generatorRef.current?.destroy();
    };
  }, [props.model, props.persona, props.seedQuery]);

  const [nodeDims, setNodeDims] = useState<NodeDims>({});

  const deleteBranch = useCallback(
    (id: string) => {
      const qaNode = resultTree[id];
      console.log('deleting qaNode, question', qaNode.question);

      if (id in qaTreeRef.current) {
        delete qaTreeRef.current[id];
        setResultTree(JSON.parse(JSON.stringify(qaTreeRef.current)));
      }

      const children = 'children' in qaNode ? qaNode.children ?? [] : [];
      for (var child of children) {
        deleteBranch(child);
      }
    },
    [resultTree, setResultTree]
  );

  const { nodes: flowNodes, edges } = useMemo(() => {
    return convertTreeToFlow(resultTree, setNodeDims, deleteBranch, playing, focusedId.current);
  }, [resultTree, nodeDims, playing, focusedId]);

  // Combine main flow nodes with user input nodes
  const allNodes = useMemo(() => [...flowNodes, ...nodes], [flowNodes, nodes]);

  function resume() {
    pauseAtNodeCountRef.current = nodeCountRef.current + NODE_LIMIT_PER_PLAY;
    generatorRef.current?.resume();
    setPlaying(true);
  }

  function pause() {
    generatorRef.current?.pause();
    setPlaying(false);
  }

  async function submitPrompt() {
    try {
      const docRef = await addDoc(collection(db, 'prompts'), {
        userId: await getFingerprint(),
        model: props.model,
        persona: props.persona,
        prompt: props.seedQuery,
        createdAt: new Date(),
        href: window.location.href,
        usingPersonalApiKey: props.apiKey.valid,
      });
      console.log('Document written with ID: ', docRef.id);
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  }

  const addUserQuestion = useCallback(
    (answerNodeId: string) => {
      const parentNode = flowNodes.find((n: Node) => n.id === `a-${answerNodeId}`);
      const existingUserNodes = flowNodes.filter((n: Node) => n.type === 'userInput').length;

      setActiveUserQuestion(prev => ({
        text: prev?.text || '',
        attachedTo: answerNodeId,
      }));

      const newId = Math.random().toString(36).substring(2, 9);
      const newNode = {
        id: newId,
        type: 'userInput',
        data: {
          initialQuestion: activeUserQuestion?.text || '',
          onSave: (question: string) => {
            qaTreeRef.current[newId] = {
              question,
              answer: '',
              parent: answerNodeId,
            };
            setResultTree({ ...qaTreeRef.current });
            addUserQuestion(answerNodeId);
          },
          onAsk: (question: string) => {
            qaTreeRef.current[newId] = {
              question,
              answer: '',
              parent: answerNodeId,
            };
            questionQueueRef.current.push(newId);
            setResultTree({ ...qaTreeRef.current });
            addUserQuestion(answerNodeId);
          },
        },
        position: calculateNewNodePosition(parentNode, existingUserNodes),
      };
      setNodes(prev => [...prev, newNode]);
    },
    [activeUserQuestion, flowNodes]
  );

  const handleAddUserQuestion = useCallback(
    (answerNodeId: string) => {
      const parentNode = flowNodes.find((n: Node) => n.id === `a-${answerNodeId}`);
      const existingUserNodes = flowNodes.filter((n: Node) => n.type === 'userInput').length;

      setActiveUserQuestion(prev => ({
        text: prev?.text || '',
        attachedTo: answerNodeId,
      }));

      const newId = Math.random().toString(36).substring(2, 9);
      const newNode = {
        id: newId,
        type: 'userInput',
        data: {
          initialQuestion: activeUserQuestion?.text || '',
          onSave: (question: string) => {
            qaTreeRef.current[newId] = {
              question,
              answer: '',
              parent: answerNodeId,
            };
            setResultTree({ ...qaTreeRef.current });
            addUserQuestion(answerNodeId);
          },
          onAsk: (question: string) => {
            qaTreeRef.current[newId] = {
              question,
              answer: '',
              parent: answerNodeId,
            };
            questionQueueRef.current.push(newId);
            setResultTree({ ...qaTreeRef.current });
            addUserQuestion(answerNodeId);
          },
        },
        position: calculateNewNodePosition(parentNode, existingUserNodes),
      };
      setNodes(prev => [...prev, newNode]);
    },
    [activeUserQuestion, flowNodes]
  );

  // Auto-save whenever the tree changes
  useEffect(() => {
    if (Object.keys(resultTree).length > 0) {
      autoSaveMindMap(resultTree, props.persona, props.model, props.seedQuery);
    }
  }, [resultTree]);

  const handleAnswer = useCallback(
    async (questionId: string) => {
      const answer = await getAnswerFromAI(
        questionId,
        qaTreeRef.current,
        props.persona,
        props.model,
        props.apiKey.key
      );

      // Update tree with answer
      qaTreeRef.current[questionId] = {
        ...qaTreeRef.current[questionId],
        answer,
        startedProcessing: true,
      };
      setResultTree({ ...qaTreeRef.current });

      // Generate suggested questions
      const suggestedQuestions = await getSuggestedQuestions(
        questionId,
        qaTreeRef.current,
        props.persona,
        props.model,
        props.apiKey.key
      );

      // Create new question nodes
      const newQuestionIds = suggestedQuestions.map(() => Math.random().toString(36).substring(2));
      qaTreeRef.current[questionId].children = newQuestionIds;

      newQuestionIds.forEach((id, index) => {
        qaTreeRef.current[id] = {
          question: suggestedQuestions[index],
          answer: '',
          parent: questionId,
          startedProcessing: false,
        };
      });

      setResultTree({ ...qaTreeRef.current });
    },
    [props.persona, props.model, props.apiKey]
  );

  // Update node types to include our new functionality
  const nodeTypes = useMemo(
    () => ({
      fadeText: (props: FadeoutTextNodeProps) => (
        <FadeoutTextNode
          {...props}
          data={{
            ...props.data,
            onAnswer: handleAnswer,
            onAddUserQuestion: handleAddUserQuestion,
          }}
        />
      ),
      userInput: UserInputNode,
    }),
    [handleAnswer, handleAddUserQuestion]
  );

  // Update flow elements when focus changes
  useEffect(() => {
    if (generatorRef.current) {
      generatorRef.current.setFocusedId(focusedId.current);

      // Update question queue to only include focused branch questions
      const newQueue: string[] = [];
      for (const [id, node] of Object.entries(resultTree)) {
        if (
          !node.startedProcessing &&
          (!focusedId.current || isChild(resultTree, focusedId.current, id))
        ) {
          newQueue.push(id);
        }
      }
      questionQueueRef.current.splice(0, questionQueueRef.current.length, ...newQueue);
    }
  }, [focusedId, resultTree]);

  return (
    <FocusedContextProvider
      qaTree={resultTree}
      onSetFocusedId={id => {
        focusedId.current = id;
      }}
    >
      <div className="text-sm">
        <FlowProvider
          flowNodes={allNodes}
          flowEdges={edges}
          nodeDims={nodeDims}
          deleteBranch={deleteBranch}
          nodeTypes={nodeTypes}
        />
        <div className="fixed right-4 bottom-4 flex items-center space-x-2">
          {SERVER_HOST.includes('localhost') && (
            <div
              className="bg-black/40 p-2 flex items-center justify-center rounded cursor-pointer hover:text-green-400 backdrop-blur"
              onClick={() => {
                // we want to save the current resultTree as JSON
                const filename = props.seedQuery.toLowerCase().replace(/\s+/g, '-');
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
                  resume();
                }
              }}
            >
              {playing ? (
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
          className="fixed top-4 left-4 bg-black/40 rounded p-2 cursor-pointer hover:bg-black/60 backdrop-blur touch-none"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </div>
      </div>
    </FocusedContextProvider>
  );
}

export default GraphPage;
