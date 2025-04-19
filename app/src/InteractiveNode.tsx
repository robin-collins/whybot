import React, { useState, useEffect, useCallback, ChangeEvent, useRef, useMemo } from "react";
import { Handle, Position, NodeProps, useStore, useReactFlow, Node } from "@xyflow/react";
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
import { motion, usePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/solid";

import { QATreeNode, NodeDims, NodeType, UserFileInfo } from "./types";
import { useAppStore } from "./store/appStore"; // Import Zustand store
import { useShallow } from 'zustand/react/shallow'; // Import useShallow
import "./InteractiveNode.css"; // Create this CSS file for styling

// --- Debounce Utility ---
function debounce<F extends (...args: any[]) => any>(func: F, wait: number): F {
  // console.log("function debounce started");
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = ((...args: Parameters<F>): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  }) as F;
  // console.log("function debounce finished");
  return debounced;
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
  // console.log("function handleFileUploadLogic started");
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
    // console.log("function handleFileUploadLogic finished");
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    updateNode(nodeId, {
      isLoading: false,
      errorMessage: `File size exceeds limit (${
        MAX_FILE_SIZE / 1024 / 1024
      }MB).`,
    });
    // console.log("function handleFileUploadLogic finished");
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
  // console.log("function handleFileUploadLogic finished");
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
  // console.log("function fetchWebpageContentLogic started");
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
      `http://localhost:6823/api/fetch-webpage?url=${encodeURIComponent(url)}`
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
      answer: data.markdownContent || "# Content\n\nNo readable content extracted.",
      screenshot: data.screenshot || undefined,
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
  // console.log("function fetchWebpageContentLogic finished");
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
  // Re-add index signature to satisfy Record<string, unknown>
  [key: string]: any;
}

// --- Define a specific Node type using the v12 pattern ---
type AppInteractiveNode = Node<InteractiveNodeData, 'interactiveNode'>;

// --- Modal for node type selection ---
const NodeTypeModal = ({ open, onSelect, onClose }) => {
  // console.log("function NodeTypeModal started");
  if (!open) {
    // console.log("function NodeTypeModal finished");
    return null;
  }
  const modal = (
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
  // console.log("function NodeTypeModal finished");
  return modal;
};

// Use the specific AppInteractiveNode type for NodeProps
export const InteractiveNode: React.FC<NodeProps<AppInteractiveNode>> = ({
  id,
  data, // Keep data prop
  selected,
}) => {
  // console.log("function InteractiveNode started");
  // Destructure needed props ONCE
  const {
    nodeType,
    nodeID,
    question,
    answer,
    fileInfo,
    url,
    isLoading,
    errorMessage,
    setNodeDims, // Original prop
    currentDims, // Original prop
    onGenerateAnswer,
    isAnswering,
  } = data as InteractiveNodeData;

  const { focusedId, isGenerating, updateNode, addNode, setFocusedId } =
    useAppStore(useShallow((state) => ({
      focusedId: state.focusedId,
      isGenerating: state.isGenerating,
      updateNode: state.updateNode,
      addNode: state.addNode,
      setFocusedId: state.setFocusedId,
    })));

  // Selector to get the answer content from the corresponding answer node
  const answerNodeAnswer = useAppStore(state => state.qaTree?.[`a-${nodeID}`]?.answer);

  const { setNodes, setEdges } = useReactFlow();
  const [ref, bounds] = useMeasure({ scroll: true, debounce: 50 }); // Ref for outer motion.div
  const contentRef = useRef<HTMLDivElement>(null); // Ref for inner content div
  const [maxNodeHeightPx, setMaxNodeHeightPx] = useState(window.innerHeight * 0.9); // Declared ONCE

  // ... other state declarations (localQuestion, localUrl, etc.) ...
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
  // nodeRef might be unused now, can remove if confirmed
  // const nodeRef = useRef<HTMLDivElement>(null);

  // ... stable refs and debounced setters ...
  const setNodeDimsRef = useRef(setNodeDims);
  useEffect(() => {
    setNodeDimsRef.current = setNodeDims;
  }, [setNodeDims]);

  const debouncedSetNodeDims = useMemo(
    () =>
      debounce(
        (
          dimsUpdater: React.SetStateAction<NodeDims> | ((prev: NodeDims) => NodeDims)
        ) => {
          if (setNodeDimsRef.current) {
            if (typeof dimsUpdater === 'function') {
              setNodeDimsRef.current(dimsUpdater as (prev: NodeDims) => NodeDims);
            } else {
              setNodeDimsRef.current(dimsUpdater);
            }
          }
        },
        50
      ),
    []
  );

  // Sync local state with props
  useEffect(() => {
    setLocalQuestion(question);
  }, [question]);

  useEffect(() => {
    setLocalUrl(url || "");
  }, [url]);

  // Max height effect
  useEffect(() => {
    const handleResize = () => setMaxNodeHeightPx(window.innerHeight * 0.9);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  // --- Dimension reporting logic ---
  // Helper function to update dimensions (non-debounced)
  const updateDimensions = useCallback((width: number, height: number) => {
    const scale = getScaleFactor();
    // Use scrollWidth/Height if available (from contentRef), otherwise use measured bounds
    const finalWidth = width > 0 ? width : bounds.width;
    const finalHeight = height > 0 ? height: bounds.height;

    const scaledWidth = finalWidth / scale;
    const scaledHeight = finalHeight / scale;

    // Only update if dimensions actually changed significantly
    if (
      finalWidth > 0 && finalHeight > 0 &&
      (Math.abs(scaledWidth - (currentDims?.width || 0)) > 1 ||
       Math.abs(scaledHeight - (currentDims?.height || 0)) > 1)
    ) {
      // Batch dimension updates to reduce rapid renders
      debouncedSetNodeDims((dims) => ({
        ...dims,
        [nodeID]: { width: scaledWidth, height: scaledHeight },
      }));
    }
  }, [nodeID, debouncedSetNodeDims, currentDims?.width, currentDims?.height, bounds.width, bounds.height]); // Include bounds as fallback

  // Debounced version for general resize/content changes (non-expansion)
  const debouncedUpdateDimensions = useCallback(
    debounce(() => {
        // Pass measured bounds dimensions to the core update function
        if (bounds.width > 0 && bounds.height > 0) {
            updateDimensions(bounds.width, bounds.height);
        }
    }, 150),
    [updateDimensions, bounds.width, bounds.height] // Depends on the stable updateDimensions and bounds
  );

  // Expansion state
  const CHAR_LIMIT_FOR_EXPANSION = 1500;
  const isExpanded = nodeType === "llm-answer" && answer && answer.length > CHAR_LIMIT_FOR_EXPANSION;

  // Report dimensions on general resize/content changes, BUT NOT if it's currently expanded
  useEffect(() => {
    if (!isExpanded && bounds.width > 0 && bounds.height > 0) {
        debouncedUpdateDimensions(); // Call the debounced function
    }
    // Only depends on bounds change and expansion state
  }, [bounds.width, bounds.height, isExpanded, debouncedUpdateDimensions]);

  // --- End Dimension Reporting ---

  // --- Node Content Rendering & Handlers ---
  const [isPresent, safeToRemove] = usePresence(); // For exit animation

  // ... other handlers (handleLocalQuestionChange, handleUrlChange, etc.) ...
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
  function getNearestEdgeAndPoint(e: React.MouseEvent, element: HTMLElement): { edge: 'top' | 'right' | 'bottom' | 'left', x: number, y: number } | null {
      const rect = element.getBoundingClientRect();
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
    // Use the outer ref (motion.div) for detecting hover edge
    const outerDiv = (e.target as HTMLElement).closest('.interactive-node');
    if (!outerDiv) return;
    const pt = getNearestEdgeAndPoint(e, outerDiv as HTMLElement);
    setConnectionPoint(pt);
  };

  const handleNodeMouseLeave = () => setConnectionPoint(null);

  // --- Connection drag logic with hold ---
  const handleConnectionMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!connectionPoint) return;
    const outerDiv = (e.target as HTMLElement).closest('.interactive-node');
    if (!outerDiv) return;

    isMouseDown.current = true;
    const rect = outerDiv.getBoundingClientRect();
    const startX = rect.left + connectionPoint.x;
    const startY = rect.top + connectionPoint.y;
    dragTimer.current = setTimeout(() => {
      if (isMouseDown.current) {
        setIsDraggingConnection(true);
        setDragPos({ x: e.clientX, y: e.clientY });
        setPendingConnection({ from: { x: startX, y: startY }, to: { x: e.clientX, y: e.clientY } });

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

  // Render content based on node type
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
            {!answerNodeAnswer && onGenerateAnswer && (
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
                      !(nodeType === "user-question" && localQuestion.length < 20),
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
      case "user-webpage": {
        const hasScreenshot = !!data.screenshot;
        const [expanded, setExpanded] = useState(false);
        const [shrinkTimeout, setShrinkTimeout] = useState<NodeJS.Timeout | null>(null);
        const [thumbHeight, setThumbHeight] = useState<number>(120);
        useEffect(() => {
          if (selected) {
            setExpanded(true);
            if (shrinkTimeout) {
              clearTimeout(shrinkTimeout);
              setShrinkTimeout(null);
            }
          } else if (expanded) {
            const timeout = setTimeout(() => setExpanded(false), 3000);
            setShrinkTimeout(timeout);
            return () => clearTimeout(timeout);
          }
        }, [selected]);
        useEffect(() => () => { if (shrinkTimeout) clearTimeout(shrinkTimeout); }, []);
        useEffect(() => {
          if (hasScreenshot && !expanded) {
            const img = new window.Image();
            img.onload = () => {
              const aspect = img.naturalHeight / img.naturalWidth;
              setThumbHeight(Math.round(200 * aspect));
            };
            img.src = `data:image/png;base64,${data.screenshot}`;
          }
        }, [data.screenshot, hasScreenshot, expanded]);

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
            {hasScreenshot && !expanded ? (
              <img
                src={`data:image/png;base64,${data.screenshot}`}
                alt="Webpage thumbnail"
                className="rounded border border-gray-300 shadow-sm transition-all duration-300"
                style={{ width: 200, height: thumbHeight, objectFit: 'cover', cursor: 'pointer', display: 'block' }}
                onClick={() => setExpanded(true)}
              />
            ) : answer ? (
              <div
                className="transition-all duration-300 bg-gray-50 border rounded p-1 overflow-y-auto"
                style={{
                  width: answer.length > 1500 ? 375 : 250,
                  maxHeight: '99vh',
                  minHeight: 80,
                  cursor: 'pointer',
                }}
                onClick={() => setExpanded(false)}
              >
                <ReactMarkdown
                  className="text-xs prose prose-sm max-w-none prose-p:my-1 prose-li:my-0.5"
                  {...commonMarkdownProps}
                >
                  {String(answer)}
                </ReactMarkdown>
              </div>
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
      }
      default:
        return <div>Unknown Node Type: {nodeType}</div>;
    }
  };

  // Animation complete handler
  const handleAnimationComplete = () => {
    if (contentRef.current) {
      // Measure the *inner content div* after animation
      const finalWidth = contentRef.current.scrollWidth;
      // Use outer bounds for height initially, then refine if contentRef is taller
      let finalHeight = bounds.height;
      if (contentRef.current.scrollHeight > finalHeight) {
          finalHeight = contentRef.current.scrollHeight;
      }

      console.log(`Node ${nodeID} animation complete. Content scroll dims: ${finalWidth}x${contentRef.current.scrollHeight}. Outer bounds: ${bounds.width}x${bounds.height}. Final: ${finalWidth}x${finalHeight}`);
      updateDimensions(finalWidth, finalHeight); // Use the non-debounced version
    } else {
      console.warn(`Node ${nodeID} animation complete, but contentRef is null. Using bounds.`);
      // Fallback to bounds if ref is somehow null
      if (bounds.width > 0 && bounds.height > 0) {
           updateDimensions(bounds.width, bounds.height);
      }
    }
  };

  // Adjust base and expanded widths based on node type
  let contentWidth = 300; // Default base width
  let expandedWidth = 500; // Default expanded width

  if (nodeType === 'llm-answer') {
      contentWidth = 450;  // Start 50% wider
      expandedWidth = 600; // Expand further
  } else if (nodeType === 'user-webpage') {
      // Keep specific webpage logic if needed, otherwise defaults apply
      contentWidth = 300; // Or keep existing logic: const contentWidth = nodeType === 'user-webpage' ? 300 : 300;
      expandedWidth = 375; // Or keep existing logic: const expandedWidth = nodeType === 'user-webpage' ? 375 : 500;
  }

  const nodeBorderColor = classNames({
      "border-sky-400": nodeType === "llm-question" || nodeType === "user-question",
      "border-green-400": nodeType === "llm-answer",
      "border-purple-400": nodeType === "user-file",
      "border-orange-400": nodeType === "user-webpage",
  });

  return (
    <motion.div
      ref={ref} // Attach measure ref to the outer motion div
      layout="position"
      className={classNames(
        "interactive-node border-[3px] bg-white text-black rounded p-2 shadow-sm group", // Added group for hover effects
        {
          "opacity-100": isFocused,
          "opacity-60": !isFocused,
          "ring-2 ring-blue-500 ring-offset-1": selected, // Changed ring color
        },
        nodeBorderColor // Apply dynamic border color class
      )}
      style={{
        // Let motion handle width animation based on isExpanded
        minHeight: 50,
        position: "relative",
        height: 'auto', // Allow natural height adjustment
        borderColor: isFocused ? "blue" : undefined, // Override border if focused
        zIndex: isFocused ? 10 : 1,
      }}
      onClick={handleNodeClick}
      onMouseMove={handleNodeMouseMove}
      onMouseLeave={handleNodeMouseLeave}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
          opacity: 1,
          scale: 1,
          width: isExpanded ? expandedWidth : contentWidth, // Explicitly animate width
          // Height is implicitly handled by style: 'auto'
      }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.15 } }} // Faster exit
      transition={{ type: "spring", stiffness: 150, damping: 20, duration: 0.3 }}
      onAnimationComplete={handleAnimationComplete} // Call when animation finishes
    >
      {/* Handles need to be direct children or use portals if nested deeper */}
      <Handle type="target" position={Position.Left} className="!bg-gray-400 handle-custom handle-target" />
      <Handle type="source" position={Position.Right} className="!bg-gray-400 handle-custom handle-source" onMouseDown={handleConnectionMouseDown} />

      {/* Inner Content Wrapper - Apply ref here */}
      <div
        ref={contentRef}
        className="node-content-wrapper"
        style={{ maxHeight: `${maxNodeHeightPx}px`, overflowY: "auto" }}
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
        {/* Prose container for consistent markdown styling */}
        <div className="prose prose-sm max-w-none prose-p:my-1 prose-li:my-0.5 [&>*:first-child]:mt-0">
          {renderContent()}
        </div>
      </div>

      {/* Connection Point Visualization - Needs correct positioning relative to motion.div */}
      {connectionPoint && !isDraggingConnection && (
        <div
          style={{
            position: "absolute",
            // Adjust based on where connectionPoint x/y are relative to
            left: connectionPoint.x - 8, // Center the dot
            top: connectionPoint.y - 8,
            zIndex: 15, // Above content
            width: 16,
            height: 16,
            pointerEvents: "auto",
          }}
        >
          <div
            className="bg-green-400 animate-pulse rounded-full shadow-lg border-2 border-white cursor-pointer w-full h-full"
            title="Drag to connect"
            onMouseDown={handleConnectionMouseDown}
          />
        </div>
      )}

      {/* Pending Connection Line (SVG) - Needs to be outside, possibly in Flow component */}
      {/* This SVG should likely be rendered at the Flow level, not inside each node */}
      {/* {pendingConnection && isDraggingConnection && pendingConnection.from && pendingConnection.to && ( ... SVG code ... )} */}

    </motion.div>
    /* NodeTypeModal likely needs to be rendered outside the motion.div, perhaps sibling or at Flow level */
    /* <NodeTypeModal open={showTypeModal} onSelect={handleTypeSelect} onClose={() => setShowTypeModal(false)} /> */
  );
  // console.log("function InteractiveNode finished");
};

// Default export or named export
// export default InteractiveNode; // If you prefer default
