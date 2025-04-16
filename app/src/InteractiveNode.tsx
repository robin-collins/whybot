import React, { useState, useEffect, useCallback, ChangeEvent, useRef, useMemo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import useMeasure from "react-use-measure";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import classNames from "classnames";
import TextareaAutosize from "react-textarea-autosize";
import {
  PaperClipIcon,
  LinkIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CogIcon,
} from "@heroicons/react/24/outline"; // Example icons

import { QATreeNode, NodeDims, NodeType, UserFileInfo } from "./types";
import { useAppStore } from "./store/appStore"; // Import Zustand store
import { useShallow } from 'zustand/react/shallow'; // Import useShallow
import "./InteractiveNode.css"; // Create this CSS file for styling

// --- Debounce Utility ---
function debounce<F extends (...args: any[]) => any>(func: F, wait: number): F {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return ((...args: Parameters<F>): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  }) as F;
}
// --- End Debounce Utility ---

// --- File and URL Handling Logic ---
/**
 * Reads a text-based file and updates the node state via store action.
 */
async function handleFileUploadLogic(
  file: File,
  nodeId: string,
  // Receive updateNode action from the store
  updateNode: (nodeId: string, dataChanges: Partial<QATreeNode>) => void
): Promise<void> {
  console.log(`Processing file ${file.name} for node ${nodeId}`);
  // Update node state via store action
  updateNode(nodeId, {
    isLoading: true,
    errorMessage: undefined,
    fileInfo: undefined,
    answer: "",
  });

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
  const isTextBased =
    file.type.startsWith("text/") ||
    [
      "application/json",
      "application/xml",
      "application/x-yaml",
      "text/yaml",
    ].includes(file.type) ||
    /\.(md|txt|csv|log|json|yaml|yml|xml)$/i.test(file.name);

  if (!isTextBased) {
    updateNode(nodeId, {
      isLoading: false,
      errorMessage: `File type (${
        file.type || "unknown"
      }) not supported. Please upload text-based files.`,
    });
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    updateNode(nodeId, {
      isLoading: false,
      errorMessage: `File size exceeds limit (${
        MAX_FILE_SIZE / 1024 / 1024
      }MB).`,
    });
    return;
  }

  try {
    const fileContent = await file.text();
    const fileInfo: UserFileInfo = {
      name: file.name,
      type: file.type,
      size: file.size,
    };
    // Update node state via store action
    updateNode(nodeId, { isLoading: false, fileInfo, answer: fileContent });
    console.log(`File ${file.name} processed successfully.`);
  } catch (error: any) {
    console.error(`Error reading file ${file.name}:`, error);
    // Update node state via store action
    updateNode(nodeId, {
      isLoading: false,
      errorMessage: `Error reading file: ${error.message}`,
    });
  }
}

/**
 * Fetches webpage content using the backend API and updates node state via store action.
 */
async function fetchWebpageContentLogic(
  url: string,
  nodeId: string,
  // Receive updateNode action from the store
  updateNode: (nodeId: string, dataChanges: Partial<QATreeNode>) => void
): Promise<void> {
  console.log(`Fetching URL ${url} for node ${nodeId}`);
  // Update node state via store action
  updateNode(nodeId, { isLoading: true, errorMessage: undefined, answer: "" });

  if (!url || (!url.startsWith("http://") && !url.startsWith("https://"))) {
    // Update node state via store action
    updateNode(nodeId, {
      isLoading: false,
      errorMessage: "Invalid URL format.",
    });
    return;
  }

  try {
    const response = await fetch(
      `/api/fetch-webpage?url=${encodeURIComponent(url)}`
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }
    const data = await response.json();
    // Update node state via store action
    updateNode(nodeId, {
      isLoading: false,
      url: url,
      answer:
        data.markdownContent || "# Content\n\nNo readable content extracted.",
    });
    console.log(`URL ${url} processed successfully.`);
  } catch (error: any) {
    console.error("Error fetching webpage:", error);
    // Update node state via store action
    updateNode(nodeId, {
      isLoading: false,
      url: url,
      errorMessage: error.message || "Failed to fetch URL.",
    });
  }
}
// --- End File and URL Handling Logic ---

// Helper to get the scale factor for dimension calculations
const getScaleFactor = (): number => {
  const viewportElement = document.querySelector(
    ".react-flow__viewport"
  ) as HTMLElement;
  if (!viewportElement) return 1;
  const style = getComputedStyle(viewportElement);
  const transformValue = style.transform;
  const match = /matrix\((.+?),/.exec(transformValue);
  return match ? parseFloat(match[1]) : 1;
};

// Props expected by the InteractiveNode
export interface InteractiveNodeData extends QATreeNode {
  nodeID: string; // Ensure nodeID is always present in data
  setNodeDims: React.Dispatch<React.SetStateAction<NodeDims>>;
  onGenerateAnswer?: (nodeId: string) => void;
  isAnswering?: boolean;
}

export const InteractiveNode: React.FC<NodeProps<InteractiveNodeData>> = ({
  data,
  id,
  selected,
}) => {
  const {
    nodeType,
    nodeID,
    question,
    answer,
    fileInfo,
    url,
    isLoading,
    errorMessage,
    setNodeDims: originalSetNodeDims, // Rename original prop
    onGenerateAnswer,
    isAnswering,
  } = data;

  const { focusedId, isGenerating, updateNode, addNode, setFocusedId } =
    useAppStore(useShallow((state) => ({
      focusedId: state.focusedId,
      isGenerating: state.isGenerating,
      updateNode: state.updateNode,
      addNode: state.addNode,
      setFocusedId: state.setFocusedId,
    })));

  const [ref, bounds] = useMeasure();
  const [maxNodeHeightPx, setMaxNodeHeightPx] = useState(
    window.innerHeight * 0.9
  );
  const [localQuestion, setLocalQuestion] = useState(question);
  const [localUrl, setLocalUrl] = useState(url || "");

  // Create a stable reference to the original setNodeDims prop
  const setNodeDimsRef = useRef(originalSetNodeDims);
  useEffect(() => {
    setNodeDimsRef.current = originalSetNodeDims;
  }, [originalSetNodeDims]);

  // Create the debounced version of setNodeDims
  const debouncedSetNodeDims = useMemo(
    () =>
      debounce(
        (
          dimsUpdater: React.SetStateAction<NodeDims> | ((prev: NodeDims) => NodeDims)
        ) => {
          // Call the latest setNodeDims function from the ref
          if (setNodeDimsRef.current) {
            if (typeof dimsUpdater === 'function') {
              // If it's an updater function, pass the previous state (though this specific usage doesn't)
              setNodeDimsRef.current(dimsUpdater as (prev: NodeDims) => NodeDims);
            } else {
              // Handle direct state object (not used here but good practice)
              setNodeDimsRef.current(dimsUpdater);
            }
          }
        },
        50 // Debounce time in milliseconds (adjust as needed)
      ),
    [] // No dependencies, creates the debounced function once
  );

  useEffect(() => {
    setLocalQuestion(question);
  }, [question]);

  useEffect(() => {
    setLocalUrl(url || "");
  }, [url]);

  useEffect(() => {
    const handleResize = () => setMaxNodeHeightPx(window.innerHeight * 0.9);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Effect to update dimensions - uses the debounced function
  useEffect(() => {
    if (bounds.width > 0 && bounds.height > 0) {
      const scaleFactor = getScaleFactor();
      const currentActualHeight = bounds.height / scaleFactor;
      const currentWidth = bounds.width / scaleFactor;
      const targetWidth =
        nodeType === "llm-answer" && answer && answer.length > 800 ? 500 : 300;

      const verticalPaddingAndBorder = 16 + 6;
      let additionalHeight = 0;
      if (
        (nodeType === "llm-question" || nodeType === "user-question") &&
        !answer &&
        onGenerateAnswer
      )
        additionalHeight += 30;
      if (nodeType === "user-file") additionalHeight += 40;
      if (nodeType === "user-webpage") additionalHeight += 40;
      if (errorMessage) additionalHeight += 20;
      if (isLoading) additionalHeight += 20;

      const baseCalculatedHeight =
        currentActualHeight + verticalPaddingAndBorder + additionalHeight;
      const reportedHeight = Math.min(baseCalculatedHeight, maxNodeHeightPx);
      const reportedWidth = Math.max(currentWidth, targetWidth);

      // Call the DEBOUNCED state setter
      debouncedSetNodeDims((prev) => {
        const oldDims = prev[nodeID];
        if (
          oldDims &&
          Math.abs(oldDims.width - reportedWidth) < 1 &&
          Math.abs(oldDims.height - reportedHeight) < 1
        ) {
          // If dimensions haven't changed meaningfully, return previous state to avoid update
          return prev;
        }
        // Otherwise, return the new state object
        return {
          ...prev,
          [nodeID]: { width: reportedWidth, height: reportedHeight },
        };
      });
    }
  }, [
    bounds.width,
    bounds.height,
    debouncedSetNodeDims, // Depend on the stable debounced function
    nodeID,
    nodeType,
    answer, // Keep answer dependency so it recalculates when content changes size
    isLoading,
    errorMessage,
    maxNodeHeightPx,
    onGenerateAnswer,
  ]);

  const handleLocalQuestionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalQuestion(newValue);
    updateNode(nodeID, { question: newValue });
  };

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalUrl(newValue);
    updateNode(nodeID, { url: newValue });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUploadLogic(file, nodeID, updateNode);
    }
  };

  const handleFetchUrl = () => {
    if (localUrl) {
      fetchWebpageContentLogic(localUrl, nodeID, updateNode);
    }
  };

  const handleGenerateAnswer = () => {
    if (onGenerateAnswer) {
      const baseId = nodeID.startsWith("q-")
        ? nodeID
        : nodeID.startsWith("a-")
        ? "q-" + nodeID.substring(2)
        : nodeID;
      console.log(
        `InteractiveNode: Triggering onGenerateAnswer for base ID: ${baseId}`
      );
      onGenerateAnswer(baseId);
    } else {
      console.warn(
        `InteractiveNode: onGenerateAnswer callback not provided for node ${nodeID}`
      );
    }
  };

  const handleAddNode = (type: NodeType) => {
    let parentForAdd = nodeID;
    if (
      (nodeType === "llm-question" || nodeType === "user-question") &&
      answer
    ) {
      parentForAdd = `a-${nodeID}`;
    }

    let prefix = "u";
    if (type === "user-question") prefix = "uq";
    else if (type === "user-file") prefix = "uf";
    else if (type === "user-webpage") prefix = "uw";

    const newIdSuffix = Math.random().toString(36).substring(2, 9);
    const newNodeId = `${prefix}-${parentForAdd}-${newIdSuffix}`;

    const newNode: QATreeNode = {
      nodeID: newNodeId,
      nodeType: type,
      question: "",
      answer: "",
      parent: parentForAdd,
      children: [],
      isLoading: false,
    };
    addNode(newNode);
    console.log(
      `InteractiveNode: Added new node ${newNodeId} of type ${type} as child of ${parentForAdd}`
    );
  };

  const handleNodeClick = () => {
    const baseId = nodeID.startsWith("a-")
      ? "q-" + nodeID.substring(2)
      : nodeID;
    setFocusedId(baseId);
  };

  const isFocused =
    focusedId === nodeID || focusedId === nodeID.replace(/^a-/, "q-");

  const renderContent = () => {
    const commonMarkdownProps = { remarkPlugins: [remarkGfm] };
    const showAnsweringButton = isAnswering ?? false;

    switch (nodeType) {
      case "llm-question":
      case "user-question":
        return (
          <>
            {nodeType === "user-question" ? (
              <TextareaAutosize
                value={localQuestion}
                onChange={handleLocalQuestionChange}
                className="w-full p-1 border rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                minRows={1}
                placeholder="Enter your question..."
              />
            ) : (
              <ReactMarkdown {...commonMarkdownProps}>
                {String(question || "")}
              </ReactMarkdown>
            )}
            {!answer && onGenerateAnswer && (
              <button
                disabled={
                  showAnsweringButton ||
                  (nodeType === "user-question" && localQuestion.length < 20)
                }
                onClick={handleGenerateAnswer}
                className={classNames(
                  "absolute bottom-1 right-1 text-white px-2 py-0.5 rounded text-xs z-10 transition-colors",
                  {
                    "bg-green-600 cursor-wait": showAnsweringButton,
                    "bg-sky-600 hover:bg-sky-700 cursor-pointer":
                      !showAnsweringButton &&
                      !(
                        nodeType === "user-question" &&
                        localQuestion.length < 20
                      ),
                    "bg-gray-400 cursor-not-allowed":
                      !showAnsweringButton &&
                      nodeType === "user-question" &&
                      localQuestion.length < 20,
                  }
                )}
                style={{
                  fontSize: "0.7rem",
                  lineHeight: "1rem",
                  padding: "2px 6px",
                }}
              >
                {showAnsweringButton ? "Answering..." : "Answer"}
              </button>
            )}
            <div className="mt-2 flex space-x-1">
              <button
                onClick={() => handleAddNode("user-question")}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded"
              >
                + Q
              </button>
              <button
                onClick={() => handleAddNode("user-file")}
                className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded"
              >
                + File
              </button>
              <button
                onClick={() => handleAddNode("user-webpage")}
                className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded"
              >
                + URL
              </button>
            </div>
          </>
        );
      case "llm-answer":
        return (
          <ReactMarkdown {...commonMarkdownProps}>
            {String(answer || "")}
          </ReactMarkdown>
        );
      case "user-file":
        return (
          <>
            <div className="flex items-center mb-1">
              <PaperClipIcon className="w-4 h-4 mr-1 inline-block flex-shrink-0" />
              <span
                className="font-medium text-sm truncate flex-grow"
                title={fileInfo?.name}
              >
                {fileInfo?.name || "File Node"}
              </span>
            </div>
            {answer ? (
              <ReactMarkdown
                className="text-xs bg-gray-50 p-1 max-h-40 overflow-y-auto border rounded"
                {...commonMarkdownProps}
              >
                {String(answer)}
              </ReactMarkdown>
            ) : (
              <div className="text-xs text-gray-500">
                <label
                  htmlFor={`file-upload-${nodeID}`}
                  className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 rounded p-2 hover:border-blue-400"
                >
                  <CloudArrowUpIcon className="w-5 h-5 mr-1" /> Click or Drag
                </label>
                <input
                  id={`file-upload-${nodeID}`}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}
            <div className="mt-2 flex space-x-1">
              <button
                onClick={() => handleAddNode("user-question")}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded"
              >
                + Q
              </button>
              <button
                onClick={() => handleAddNode("user-file")}
                className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded"
              >
                + File
              </button>
              <button
                onClick={() => handleAddNode("user-webpage")}
                className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded"
              >
                + URL
              </button>
            </div>
          </>
        );
      case "user-webpage":
        return (
          <>
            <div className="flex items-center mb-1">
              <LinkIcon className="w-4 h-4 mr-1 inline-block flex-shrink-0" />
              <span
                className="font-medium text-sm truncate flex-grow"
                title={url}
              >
                {url || "Web Page Node"}
              </span>
            </div>
            {answer ? (
              <ReactMarkdown
                className="text-xs bg-gray-50 p-1 max-h-40 overflow-y-auto border rounded"
                {...commonMarkdownProps}
              >
                {String(answer)}
              </ReactMarkdown>
            ) : (
              <div className="flex items-center space-x-1">
                <input
                  type="url"
                  value={localUrl}
                  onChange={handleUrlChange}
                  placeholder="Enter URL (https://...)"
                  className="flex-grow p-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <button
                  onClick={handleFetchUrl}
                  disabled={isLoading || !localUrl.startsWith("http")}
                  className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded disabled:bg-gray-400"
                >
                  {isLoading ? "Fetching..." : "Get"}
                </button>
              </div>
            )}
            <div className="mt-2 flex space-x-1">
              <button
                onClick={() => handleAddNode("user-question")}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded"
              >
                + Q
              </button>
              <button
                onClick={() => handleAddNode("user-file")}
                className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded"
              >
                + File
              </button>
              <button
                onClick={() => handleAddNode("user-webpage")}
                className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded"
              >
                + URL
              </button>
            </div>
          </>
        );
      default:
        return <div>Unknown Node Type: {nodeType}</div>;
    }
  };

  return (
    <div
      ref={ref}
      className={classNames(
        "interactive-node border-[3px] bg-white text-black rounded p-2 shadow-sm",
        {
          "border-sky-400":
            nodeType === "llm-question" || nodeType === "user-question",
          "border-green-400": nodeType === "llm-answer",
          "border-purple-400": nodeType === "user-file",
          "border-orange-400": nodeType === "user-webpage",
          "opacity-100": isFocused,
          "opacity-60": !isFocused,
          "ring-2 ring-yellow-400 ring-offset-1": selected,
        }
      )}
      style={{
        maxWidth: nodeType === "llm-answer" && answer.length > 800 ? 500 : 300,
        minHeight: 50,
      }}
      onClick={handleNodeClick}
    >
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-gray-400"
      />

      <div
        className="node-content-wrapper"
        style={{ maxHeight: maxNodeHeightPx, overflowY: "auto" }}
      >
        {isLoading && (
          <div className="absolute top-1 right-1 text-xs text-gray-500 flex items-center">
            <CogIcon className="w-3 h-3 mr-1 animate-spin" /> Processing...
          </div>
        )}

        {errorMessage && (
          <div className="text-xs text-red-600 bg-red-100 p-1 rounded mt-1 flex items-center">
            <ExclamationTriangleIcon className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
        )}

        <div className="prose prose-sm max-w-none prose-p:my-1 prose-li:my-0.5 [&>*:first-child]:mt-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// Default export or named export
// export default InteractiveNode; // If you prefer default
