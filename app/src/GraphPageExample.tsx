import {
  useEffect,
  useMemo,
  useState,
  Dispatch,
  SetStateAction,
  useCallback,
} from "react";
import { FlowProvider, Flow } from "./Flow";
import { convertTreeToFlow } from "./GraphPage";
import { QATree, NodeDims, QATreeNode, NodeType } from "./types";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { Example } from "./StartPage";
import "./GraphPageExample.css";
import { OnConnectStart, OnConnectStartParams } from "@xyflow/react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { downloadDataAsJson } from "./util/json";
import { SERVER_HOST } from "./constants";
import { MODELS } from "./models";
import { PERSONAS } from "./personas";

export const streamQuestion = async (
  id: string,
  growingTree: QATree,
  exampleTree: QATree,
  setResultTree: Dispatch<SetStateAction<QATree>>
) => {
  // console.log("function streamQuestion started");
  return new Promise((resolve) => {
    const node = exampleTree[id];

    let i = 0;
    const intervalQuestion = setInterval(() => {
      i += 2;
      growingTree[id].question = node.question.slice(0, i);
      setResultTree((prevState) => {
        return { ...prevState, ...growingTree };
      });
      if (i >= node.question.length) {
        clearInterval(intervalQuestion);
        // console.log("function streamQuestion finished");
        resolve("done streaming question");
      }
    }, 50);
  });
};

export const streamAnswer = async (
  id: string,
  growingTree: QATree,
  exampleTree: QATree,
  setResultTree: Dispatch<SetStateAction<QATree>>
) => {
  // console.log("function streamAnswer started");
  return new Promise((resolve) => {
    const node = exampleTree[id];
    let i = 0;
    const intervalAnswer = setInterval(() => {
      i += 2;
      growingTree[id].answer = node.answer.slice(0, i);
      setResultTree((prevState) => {
        return { ...prevState, ...growingTree };
      });
      if (i >= node.answer.length) {
        clearInterval(intervalAnswer);
        // console.log("function streamAnswer finished");
        resolve("done streaming answer");
      }
    }, 50);
  });
};

export const streamQANode = async (
  id: string,
  growingTree: QATree,
  exampleTree: QATree,
  setResultTree: Dispatch<SetStateAction<QATree>>
): Promise<string> => {
  // console.log("function streamQANode started");
  return new Promise(async (resolve) => {
    const node = exampleTree[id];

    if (!(id in growingTree)) {
      growingTree[id] = {
        nodeID: id,
        nodeType: node.nodeType,
        question: "",
        answer: "",
        parent: node.parent,
        children: node.children,
      };
    }

    await streamQuestion(id, growingTree, exampleTree, setResultTree);
    await streamAnswer(id, growingTree, exampleTree, setResultTree);
    // console.log("function streamQANode finished");
    resolve("done streaming node");
  });
};

export const streamExample = async (
  example: Example,
  setResultTree: Dispatch<SetStateAction<QATree>>
) => {
  // console.log("function streamExample started");
  const growingTree: QATree = {};
  const exampleTree = example.tree;
  let layer: string[] = ["0"];
  await streamQANode("0", growingTree, exampleTree, setResultTree);
  while (true) {
    if (layer.length === 0) {
      break;
    }
    let nextLayer: string[] = [];
    for (const id of layer) {
      if (id in exampleTree && exampleTree[id].children != null) {
        const children: string[] = exampleTree[id].children!;
        nextLayer = [...nextLayer, ...children];
      }
    }
    const promises: Promise<string>[] = [];
    for (const id of nextLayer) {
      promises.push(streamQANode(id, growingTree, exampleTree, setResultTree));
    }
    await Promise.all(promises);
    layer = nextLayer;
  }
  // console.log("function streamExample finished");
};

type GraphPageExampleProps = {
  example: Example;
  onExit(): void;
};

export function GraphPageExample({ example, onExit }: GraphPageExampleProps) {
  // console.log("function GraphPageExample started");
  const [resultTree, setResultTree] = useState<QATree>({});
  const [nodeDims, setNodeDims] = useState<NodeDims>({});
  const { nodes, edges } = useMemo(() => {
    return convertTreeToFlow(
      resultTree,
      setNodeDims,
      () => {
        console.log("Delete branch requested (Example Mode - No-op)");
      },
      async (nodeId: string) => {
        console.log(
          `Generate answer requested for ${nodeId} (Example Mode - No-op)`
        );
      },
      new Set<string>(),
      false,
      nodeDims
    );
  }, [resultTree, setNodeDims]);

  useEffect(() => {
    setResultTree({});
    streamExample(example, setResultTree);
  }, [example]);

  const dummyDeleteBranch = useCallback((id: string) => {
    console.log(`Dummy deleteBranch called for: ${id}`);
  }, []);
  // Dummy handler for connection start; use OnConnectStart type for proper signature
  const dummyOnConnectStart = useCallback<OnConnectStart>(
    (event, params) => {
      console.log("Dummy onConnectStart called", params);
    },
    []
  );
  const dummyOnConnectEnd = useCallback((event: MouseEvent | TouchEvent) => {
    console.log("Dummy onConnectEnd called");
  }, []);

  const currentModelInfo = MODELS[example.model];
  const currentPersonaInfo = PERSONAS[example.persona];
  const seedQuery =
    resultTree["q-0"]?.question ?? resultTree["0"]?.question ?? "Example";

  return (
    <div className="text-sm h-screen w-screen relative overflow-hidden">
      <FlowProvider
        flowNodes={nodes}
        flowEdges={edges}
        nodeDims={nodeDims}
        deleteBranch={dummyDeleteBranch}
        onConnectStart={dummyOnConnectStart}
        onConnectEnd={dummyOnConnectEnd}
      />
      <div className="fixed right-4 bottom-4 flex items-center space-x-2 z-20">
        {SERVER_HOST.includes("localhost") && (
          <div
            className="bg-black/40 p-2 flex items-center justify-center rounded cursor-pointer hover:text-green-400 backdrop-blur"
            onClick={() => {
              if (!resultTree) return;
              const filename = (seedQuery || "graph-export")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .substring(0, 50);
              const dict: any = {
                version: "1.0.0",
                persona: example.persona,
                model: example.model,
                seedQuery: seedQuery,
                tree: resultTree,
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
            {currentPersonaInfo?.name ?? example.persona} •{" "}
            {currentModelInfo?.name ?? example.model}
          </div>
        </div>
      </div>
      <div
        onClick={onExit}
        className="fixed top-4 left-4 bg-black/40 rounded p-2 cursor-pointer hover:bg-black/60 backdrop-blur touch-none z-20"
        title="Exit Example"
      >
        <ArrowLeftIcon className="w-5 h-5" />
      </div>
    </div>
  );
  // console.log("function GraphPageExample finished");
}
