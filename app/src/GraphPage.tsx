import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlowProvider, openai } from "./Flow";
import { Edge, MarkerType, Node } from "reactflow";
import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";

export interface QATreeNode {
  question: string;
  parent?: string;
  answer: string;
  children?: string[];
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
  deleteBranch: any
): any => {
  const nodes: TreeNode[] = [];
  Object.keys(tree).forEach((key) => {
    nodes.push({
      id: `q-${key}`,
      type: "fadeText",
      data: {
        text: tree[key].question,
        nodeID: `q-${key}`,
        setNodeDims,
        question: true,
      },
      position: { x: 0, y: 0 },
      parentNodeID: tree[key].parent != null ? `a-${tree[key].parent}` : "",
    });
    nodes.push({
      id: `a-${key}`,
      type: "fadeText",
      data: {
        text: tree[key].answer,
        nodeID: `a-${key}`,
        setNodeDims,
        question: false,
      },
      position: { x: 0, y: 0 },
      parentNodeID: `q-${key}`,
    });
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
          deleteBranch,
        },
        animated: true,
        markerEnd: { type: MarkerType.Arrow },
      });
    }
  });

  return { nodes, edges };
};

function GraphPage(props: {
  seedQuery: string;
  model: string;
  persona: string;
}) {
  const [resultTree, setResultTree] = useState<QATree>({});
  const questionQueueRef = useRef<string[]>(["0"]);
  const qaTreeRef = useRef<QATree>({
    "0": {
      question: props.seedQuery,
      answer: "",
    },
  });
  const [generator] = useState(() =>
    nodeGenerator({
      model: props.model,
      persona: props.persona,
      questionQueue: questionQueueRef.current,
      qaTree: qaTreeRef.current,
      onChangeQATree: () => {
        setResultTree(JSON.parse(JSON.stringify(qaTreeRef.current)));
      },
    })
  );
  const [playing, setPlaying] = useState(true);

  const playingRef = useRef(playing);
  useEffect(() => {
    playingRef.current = playing;

    if (playing) {
      let unmounted = false;

      (async () => {
        while (true) {
          const { done } = await generator.next();
          if (done || !playingRef.current || unmounted) {
            break;
          }
        }
      })();

      return () => {
        unmounted = true;
      };
    }
  }, [playing]);

  const [nodeDims, setNodeDims] = useState<NodeDims>({});

  const deleteBranch = useCallback(
    (id: string) => {
      const qaNode = resultTree[id];
      console.log("deleting qaNode, question", qaNode.question);

      if (id in qaTreeRef.current) {
        delete qaTreeRef.current[id];
        setResultTree(JSON.parse(JSON.stringify(qaTreeRef.current)));
      }

      const children = "children" in qaNode ? qaNode.children ?? [] : [];
      for (var child of children) {
        deleteBranch(child);
      }
    },
    [resultTree, setResultTree]
  );

  const { nodes, edges } = useMemo(() => {
    return convertTreeToFlow(resultTree, setNodeDims, deleteBranch);
  }, [resultTree]);

  return (
    <div className="text-sm">
      <FlowProvider
        flowNodes={nodes}
        flowEdges={edges}
        nodeDims={nodeDims}
        deleteBranch={deleteBranch}
      />
      <div className="bg-zinc-800 absolute right-4 bottom-4 px-4 py-2 rounded">
        <div
          className="rounded-full bg-white/20 p-1 cursor-pointer hover:bg-white/30"
          onClick={() => {
            setPlaying(!playing);
          }}
        >
          {playing ? (
            <PauseIcon className="w-4 h-4" />
          ) : (
            <PlayIcon className="w-4 h-4" />
          )}
        </div>
      </div>
    </div>
  );
}

export default GraphPage;

function getPromptForAnswer(persona: string, node: QATreeNode, qaTree: QATree) {
  if (node.parent) {
    const parentNode = qaTree[node.parent];
    if (parentNode == null) {
      throw new Error(`Parent node ${node.parent} not found`);
    }

    return `You were previously asked this question: ${parentNode.question}
    You responded with this answer: ${parentNode.answer}
    Given that context, ${
      persona === "researcher" || persona === "auto"
        ? `please provide an answer to this follow up question: ${node.question}`
        : persona === "toddler"
        ? `please provide a casual answer to this follow up question, like you're chatting. 
        Include emojis that are relevant to your answer: ${node.question}`
        : persona === "nihilistic-toddler"
        ? `please answer this question in a nihilistic, pessimistic way but keep it relevant 
        to the subject matter. Act as if you're chatting. Include emojis if they are relevant 
        to your answer: ${node.question}`
        : `please answer this follow up question in 2 sentences or less, like the wise old man 
        from movies: ${node.question}`
    }`;
  }

  return `${
    persona === "toddler"
      ? "Please provide a casual and short answer to this question: "
      : persona === "wise"
      ? "Please answer this question in 2 sentences or less: "
      : ""
  }${node.question}`;
}

function getPromptForQuestions(persona: string, node: QATreeNode) {
  if (persona === "researcher") {
    return `You are a curious researcher that tries to uncover fundamental truths about a given "why" by repeatedly asking follow-up "why" questions. Here is the question you seek to answer: ${node.question}?
      You've already done some research on the topic, and have surfaced the following information:
      ---
      ${node.answer}
      ---
      Write 1-2 interesting "why" follow-up questions on that information. For each follow-up question, provide a numeric score from 1 to 10 rating how interesting the question may be to the asker of the original question. Format your answer as a JSON array like this: [{"question": "...", "score": 1}, {"question": "...", "score": 2}, ...]
      For example, if you think the question "Why is the sky blue?" is interesting, you would write: [{"question": "Why is the sky blue?", "score": 10}]
      Your answer: `;
  }

  if (persona === "auto") {
    return `Given a question/answer pair, generate a likely persona who asked 
    that question. And then pretend you are that persona and write the most interesting 1-2 follow-up questions that this persona would enjoy learning about the most.  For each follow-up question, provide the persona summary & a numeric score from 1 to 10 rating how interesting the question may be to your persona. Format your answer as a JSON array like this: [{"question": "...", "score": 1, "persona_summary": "..."}, {"question": "...", "score": 2, "persona_summary": "..."}, ...]
    
    Your number 1 priority is to generate the most interesting questions that help your generated persona the most.
    
    Question: ${node.question}
    Information/Answer to the question: ${node.answer}
    
    For example, if you think the question "Why is the sky blue?" is interesting, you would write: [{"question": "Why is the sky blue?", "score": 10, "persona_summary": "Young man thinking about the scientific nature of the universe and our planet"}]
    Your answer: `;
  }

  if (
    persona === "toddler" ||
    persona === "nihilistic-toddler" ||
    persona === "wise"
  ) {
    return null;
  }
}

async function getQuestions(persona: string, node: QATreeNode) {
  const promptForQuestions = getPromptForQuestions(persona, node);
  let questions: { question: string; score: number }[];

  if (promptForQuestions == null) {
    if (persona === "wise") {
      questions = [{ question: "Tell me why; go deeper.", score: 10 }];
    } else {
      questions = [{ question: "Why?", score: 10 }];
    }
  } else {
    let questionsJson = "";
    await openai(promptForQuestions, 1, (chunk) => {
      questionsJson += chunk;
    });

    try {
      questions = JSON.parse(questionsJson);
    } catch (e) {
      console.error(
        "Error parsing JSON:",
        e,
        "The malformed JSON was:",
        questionsJson
      );
      return [];
    }
  }

  return questions;
}

async function* nodeGenerator(opts: {
  model: string;
  persona: string;
  questionQueue: string[];
  qaTree: QATree;
  onChangeQATree: () => void;
}): AsyncIterableIterator<void> {
  while (opts.questionQueue.length > 0) {
    const nodeId = opts.questionQueue.shift();
    if (nodeId == null) {
      throw new Error("Impossible");
    }

    const node = opts.qaTree[nodeId];
    if (node == null) {
      throw new Error(`Node ${nodeId} not found`);
    }

    const promptForAnswer = getPromptForAnswer(opts.persona, node, opts.qaTree);

    await openai(promptForAnswer, 1, (chunk) => {
      const node = opts.qaTree[nodeId];
      if (node == null) {
        throw new Error(`Node ${nodeId} not found`);
      }
      node.answer += chunk;
      opts.onChangeQATree();
    });

    yield;

    const questions = await getQuestions(opts.persona, node);

    yield;

    questions.forEach((question: { question: string; score: number }) => {
      const id = Math.random().toString(36).substring(2, 9);
      opts.qaTree[id] = {
        question: question.question,
        parent: nodeId,
        answer: "",
      };

      // Here is where we're setting the parent (backwards edge)
      // which means we can set the children (forward edge)
      if (opts.qaTree[nodeId].children == null) {
        opts.qaTree[nodeId].children = [id];
      } else {
        opts.qaTree[nodeId].children?.push(id);
      }

      opts.onChangeQATree();
      opts.questionQueue.push(id);
    });
  }
}
