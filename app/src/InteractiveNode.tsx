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
  currentDims: { width: number; height: number }; // Add currentDims prop
  onGenerateAnswer?: (nodeId: string) => void;
  isAnswering?: boolean;
}

// --- Modal for node type selection ---
const NodeTypeModal = ({ open, onSelect, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-lg p-6 min-w-[220px] flex flex-col items-center">
        <div className="mb-4 font-semibold">What type of node do you want to add?</div>
        <button className="mb-2 w-full bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded" onClick={() => onSelect("user-question")}>Question</button>
        <button className="mb-2 w-full bg-purple-100 hover:bg-purple-200 text-purple-800 px-4 py-2 rounded" onClick={() => onSelect("user-file")}>File</button>
        <button className="w-full bg-orange-100 hover:bg-orange-200 text-orange-800 px-4 py-2 rounded" onClick={() => onSelect("user-webpage")}>URL</button>
        <button className="mt-4 text-xs text-gray-500 hover:text-gray-700 underline" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

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
    currentDims, // Destructure currentDims
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
  const [connectionPoint, setConnectionPoint] = useState<null | { edge: 'top' | 'right' | 'bottom' | 'left', x: number, y: number }>(null);
  const [isDraggingConnection, setIsDraggingConnection] = useState(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [modalAt, setModalAt] = useState<{ x: number; y: number } | null>(null);
  const [pendingConnection, setPendingConnection] = useState<null | { from: { x: number; y: number }, to: { x: number; y: number } }>(null);
  const dragTimer = useRef<NodeJS.Timeout | null>(null);
  const isMouseDown = useRef(false);
  const nodeRef = useRef<HTMLDivElement>(null);

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

      // --- Check against currentDims before updating ---
      const widthChanged = Math.abs((currentDims?.width ?? 0) - reportedWidth) >= 1;
      const heightChanged = Math.abs((currentDims?.height ?? 0) - reportedHeight) >= 1;

      if (widthChanged || heightChanged) {
          console.log(`InteractiveNode ${nodeID}: Dims changed. New: w=${reportedWidth.toFixed(1)}, h=${reportedHeight.toFixed(1)}. Old: w=${currentDims?.width?.toFixed(1)}, h=${currentDims?.height?.toFixed(1)}`);
          // Call the DEBOUNCED state setter only if dimensions changed
          debouncedSetNodeDims((prev) => {
             // We still need to check prev state inside the updater
             // in case multiple rapid measurements occur before debounce fires.
             const oldDimsInUpdater = prev[nodeID];
             if (
                oldDimsInUpdater &&
                Math.abs(oldDimsInUpdater.width - reportedWidth) < 1 &&
                Math.abs(oldDimsInUpdater.height - reportedHeight) < 1
             ) {
                return prev; // Return previous state if no change since last update WITHIN debounce period
             }
             // Otherwise, return the new state object
             return {
                ...prev,
                [nodeID]: { width: reportedWidth, height: reportedHeight },
             };
          });
      }
      // --- End check ---
    }
  }, [
    bounds.width,
    bounds.height,
    debouncedSetNodeDims,
    nodeID,
    nodeType,
    answer,
    isLoading,
    errorMessage,
    maxNodeHeightPx,
    onGenerateAnswer,
    currentDims, // Add currentDims as dependency
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

  // Helper to find nearest edge and point
  function getNearestEdgeAndPoint(e: React.MouseEvent, rect: DOMRect): { edge: 'top' | 'right' | 'bottom' | 'left', x: number, y: number } | null {
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const distTop = y;
    const distBottom = rect.height - y;
    const distLeft = x;
    const distRight = rect.width - x;
    const minDist = Math.min(distTop, distBottom, distLeft, distRight);
    if (minDist > 24) return null;
    if (minDist === distTop) return { edge: 'top', x, y: 0 };
    if (minDist === distBottom) return { edge: 'bottom', x, y: rect.height };
    if (minDist === distLeft) return { edge: 'left', x: 0, y };
    return { edge: 'right' as const, x: rect.width, y };
  }

  const handleNodeMouseMove = (e: React.MouseEvent) => {
    if (!nodeRef.current) return;
    const rect = nodeRef.current.getBoundingClientRect();
    const pt = getNearestEdgeAndPoint(e, rect);
    setConnectionPoint(pt);
  };

  const handleNodeMouseLeave = () => setConnectionPoint(null);

  // --- Connection drag logic with hold ---
  const handleConnectionMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!connectionPoint) return;
    isMouseDown.current = true;
    // Compute absolute start point
    if (!nodeRef.current) return;
    const rect = nodeRef.current.getBoundingClientRect();
    const startX = rect.left + connectionPoint.x;
    const startY = rect.top + connectionPoint.y;
    dragTimer.current = setTimeout(() => {
      if (isMouseDown.current) {
        setIsDraggingConnection(true);
        setDragPos({ x: e.clientX, y: e.clientY });
        setPendingConnection({ from: { x: startX, y: startY }, to: { x: e.clientX, y: e.clientY } });
        // Listen for mousemove/mouseup on window
        const handleMove = (moveEvent: MouseEvent) => {
          setDragPos({ x: moveEvent.clientX, y: moveEvent.clientY });
          setPendingConnection(prev => prev ? { ...prev, to: { x: moveEvent.clientX, y: moveEvent.clientY } } : null);
        };
        const handleUp = (upEvent: MouseEvent) => {
          setIsDraggingConnection(false);
          setShowTypeModal(true);
          setModalAt({ x: upEvent.clientX, y: upEvent.clientY });
          setPendingConnection(prev => prev ? { ...prev, to: { x: upEvent.clientX, y: upEvent.clientY } } : null);
          window.removeEventListener("mousemove", handleMove);
          window.removeEventListener("mouseup", handleUp);
          isMouseDown.current = false;
        };
        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);
      }
    }, 100);
    // If mouse is released before 100ms, cancel
    const handleEarlyUp = () => {
      isMouseDown.current = false;
      if (dragTimer.current) clearTimeout(dragTimer.current);
      window.removeEventListener("mouseup", handleEarlyUp);
    };
    window.addEventListener("mouseup", handleEarlyUp);
  };

  // --- Add node after modal selection ---
  const handleTypeSelect = (type: NodeType) => {
    setShowTypeModal(false);
    setModalAt(null);
    if (pendingConnection && modalAt) {
      // Place the new node at the modal location (canvas coordinates)
      // For now, just use the screen coordinates; in a real app, convert to graph/canvas coords
      // Add the node and connect it
      handleAddNodeAt(type, modalAt.x, modalAt.y, pendingConnection.from);
    }
    setPendingConnection(null);
  };

  // --- Add node at a specific position and connect ---
  const handleAddNodeAt = (type: NodeType, x: number, y: number, from: { x: number; y: number }) => {
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
      `InteractiveNode: Added new node ${newNodeId} of type ${type} as child of ${parentForAdd} at (${x},${y})`
    );
  };

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
          </>
        );
      default:
        return <div>Unknown Node Type: {nodeType}</div>;
    }
  };

  return (
    <>
      <div
        ref={nodeRef}
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
          position: "relative",
        }}
        onClick={handleNodeClick}
        onMouseMove={handleNodeMouseMove}
        onMouseLeave={handleNodeMouseLeave}
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
        {connectionPoint && !isDraggingConnection && (
          <div
            style={{
              position: "absolute",
              left: connectionPoint.x - 12,
              top: connectionPoint.y - 12,
              zIndex: 10,
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "auto",
            }}
          >
            <div
              className="bg-green-400 animate-pulse rounded-full shadow-lg border-2 border-white cursor-pointer"
              style={{ width: 16, height: 16 }}
              title="Add connection"
              onMouseDown={handleConnectionMouseDown}
            />
          </div>
        )}
        {pendingConnection && isDraggingConnection && pendingConnection.from && pendingConnection.to && (
          <svg
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              pointerEvents: "none",
              zIndex: 1000,
            }}
            width={window.innerWidth}
            height={window.innerHeight}
          >
            <line
              x1={pendingConnection.from.x}
              y1={pendingConnection.from.y}
              x2={pendingConnection.to.x}
              y2={pendingConnection.to.y}
              stroke="#22c55e"
              strokeWidth={3}
              strokeDasharray="6 3"
              markerEnd="url(#arrowhead)"
            />
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="8"
                refX="8"
                refY="4"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L8,4 L0,8" fill="#22c55e" />
              </marker>
            </defs>
          </svg>
        )}
      </div>
      <NodeTypeModal
        open={showTypeModal}
        onSelect={handleTypeSelect}
        onClose={() => setShowTypeModal(false)}
      />
    </>
  );
};

// Default export or named export
// export default InteractiveNode; // If you prefer default
