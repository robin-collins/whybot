import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import useMeasure from 'react-use-measure';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import classNames from 'classnames';
import TextareaAutosize from 'react-textarea-autosize';
import { PaperClipIcon, LinkIcon, CloudArrowUpIcon, ExclamationTriangleIcon, CheckCircleIcon, CogIcon } from '@heroicons/react/24/outline'; // Example icons

import { QATreeNode, NodeDims, NodeType, UserFileInfo } from './types';
import { useFocused } from './FocusedContext';
import './InteractiveNode.css'; // Create this CSS file for styling

// --- File and URL Handling Logic ---
/**
 * Reads a text-based file and updates the node state.
 */
async function handleFileUploadLogic(file: File, nodeId: string, setNodeData: (nodeId: string, dataChanges: Partial<QATreeNode>) => void): Promise<void> {
    console.log(`Processing file ${file.name} for node ${nodeId}`);
    setNodeData(nodeId, { isLoading: true, errorMessage: undefined, fileInfo: undefined, answer: '' });

    // Basic validation (type and size)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
    if (!file.type.startsWith('text/') && file.type !== 'application/json' && file.type !== 'application/xml') {
        // Allow common text-based types even if not strictly text/*
        // You might want a more robust check or allowlist
         if (!file.name.endsWith('.md') && !file.name.endsWith('.txt') && !file.name.endsWith('.csv') && !file.name.endsWith('.log')) {
             setNodeData(nodeId, { isLoading: false, errorMessage: `File type (${file.type || 'unknown'}) not supported. Please upload text-based files.` });
            return;
        }
    }
    if (file.size > MAX_FILE_SIZE) {
        setNodeData(nodeId, { isLoading: false, errorMessage: `File size exceeds limit (${MAX_FILE_SIZE / 1024 / 1024}MB).` });
        return;
    }

    try {
        const fileContent = await file.text();
        const fileInfo: UserFileInfo = { name: file.name, type: file.type, size: file.size };

        // Store content in the 'answer' field for consistency
        setNodeData(nodeId, { isLoading: false, fileInfo, answer: fileContent });
        console.log(`File ${file.name} processed successfully.`);
    } catch (error: any) {
        console.error(`Error reading file ${file.name}:`, error);
        setNodeData(nodeId, { isLoading: false, errorMessage: `Error reading file: ${error.message}` });
    }
}

/**
 * Fetches webpage content using the backend API and updates node state.
 */
async function fetchWebpageContentLogic(url: string, nodeId: string, setNodeData: (nodeId: string, dataChanges: Partial<QATreeNode>) => void): Promise<void> {
    console.log(`Fetching URL ${url} for node ${nodeId}`);
    setNodeData(nodeId, { isLoading: true, errorMessage: undefined, answer: '' }); // Clear previous answer/error

    // Basic client-side URL validation
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
        setNodeData(nodeId, { isLoading: false, errorMessage: 'Invalid URL format.' });
        return;
    }

    try {
        const response = await fetch(`/api/fetch-webpage?url=${encodeURIComponent(url)}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Store content in the 'answer' field
        setNodeData(nodeId, {
            isLoading: false,
            url: url, // Ensure URL is saved in the node data
            answer: data.markdownContent || '# Content\n\nNo readable content extracted.'
        });
        console.log(`URL ${url} processed successfully.`);
    } catch (error: any) {
        console.error('Error fetching webpage:', error);
        setNodeData(nodeId, { isLoading: false, url: url, errorMessage: error.message || 'Failed to fetch URL.' });
    }
}
// --- End File and URL Handling Logic ---

// Helper to get the scale factor for dimension calculations
const getScaleFactor = (): number => {
    const viewportElement = document.querySelector('.react-flow__viewport') as HTMLElement;
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
    setNodeData: (nodeId: string, dataChanges: Partial<QATreeNode>) => void;
    requestAddUserNode: (parentId: string, newNodeType: NodeType) => void;
    onGenerateAnswer?: (nodeId: string) => void;
    isAnswering?: boolean;
}

export const InteractiveNode: React.FC<NodeProps<InteractiveNodeData>> = ({ data, id, selected }) => {
    const { nodeType, nodeID, question, answer, fileInfo, url, isLoading, errorMessage, isAnswering } = data;
    const { setNodeDims, setNodeData, requestAddUserNode, onGenerateAnswer } = data;

    const [ref, bounds] = useMeasure();
    const [maxNodeHeightPx, setMaxNodeHeightPx] = useState(window.innerHeight * 0.9);
    const [isEditing, setIsEditing] = useState(false);
    const [localQuestion, setLocalQuestion] = useState(question);
    const [localUrl, setLocalUrl] = useState(url || '');

    const { focusedId, setFocusedId, isInFocusedBranch } = useFocused();

    // --- Dimension Calculation Logic (similar to FadeoutTextNode) ---
    useEffect(() => {
        const handleResize = () => setMaxNodeHeightPx(window.innerHeight * 0.9);
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (bounds.width > 0 && bounds.height > 0) {
            const scaleFactor = getScaleFactor();
            const currentActualHeight = bounds.height / scaleFactor;
            const currentWidth = bounds.width / scaleFactor;
            // Base width, specific types might override
            const targetWidth = nodeType === 'llm-answer' && answer.length > 800 ? 500 : 300;

            const verticalPaddingAndBorder = 16 + 6; // Rough estimate
            // Add height for specific UI elements if present (buttons, inputs etc.)
            let additionalHeight = 0;
            if (nodeType === 'user-question' && !answer) additionalHeight += 30; // Answer button
            if (nodeType === 'user-file') additionalHeight += 40; // File input area
            if (nodeType === 'user-webpage') additionalHeight += 40; // URL input area
            if (errorMessage) additionalHeight += 20;
            if (isLoading) additionalHeight += 20;

            const baseCalculatedHeight = currentActualHeight + verticalPaddingAndBorder + additionalHeight;
            const reportedHeight = Math.min(baseCalculatedHeight, maxNodeHeightPx);

            setNodeDims((prev) => ({
                ...prev,
                [nodeID]: { width: Math.max(currentWidth, targetWidth), height: reportedHeight },
            }));
        }
    }, [bounds.width, bounds.height, setNodeDims, nodeID, nodeType, answer, isLoading, errorMessage, maxNodeHeightPx]);

    // --- Event Handlers ---
    const handleLocalQuestionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setLocalQuestion(e.target.value);
        // Optionally trigger save on blur or with a button
        setNodeData(nodeID, { question: e.target.value });
    };

    const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLocalUrl(e.target.value);
        // Optionally trigger save on blur or with a button
        setNodeData(nodeID, { url: e.target.value });
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUploadLogic(file, nodeID, setNodeData);
        }
    };

    const handleFetchUrl = () => {
        if (localUrl) {
            fetchWebpageContentLogic(localUrl, nodeID, setNodeData);
        }
    };

    const handleGenerateAnswer = () => {
        if (onGenerateAnswer) {
            onGenerateAnswer(nodeID.replace(/^[qa]-/, '')); // Pass base ID
        }
    };

    const handleAddNode = (type: NodeType) => {
        requestAddUserNode(nodeID, type);
    };

    // --- Content Rendering --- //
    const renderContent = () => {
        const commonMarkdownProps = { remarkPlugins: [remarkGfm] };

        switch (nodeType) {
            case 'llm-question':
            case 'user-question':
                return (
                    <>
                        {nodeType === 'user-question' ? (
                            <TextareaAutosize
                                value={localQuestion}
                                onChange={handleLocalQuestionChange}
                                className="w-full p-1 border rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                                minRows={1}
                            />
                        ) : (
                            <ReactMarkdown {...commonMarkdownProps}>{question}</ReactMarkdown>
                        )}
                        {!answer && onGenerateAnswer && (
                            <button
                                disabled={isAnswering || (nodeType === 'user-question' && localQuestion.length < 20)}
                                onClick={handleGenerateAnswer}
                                className={classNames(
                                    "absolute bottom-1 right-1 text-white px-2 py-0.5 rounded text-xs z-10 transition-colors",
                                    {
                                        "bg-green-600 cursor-wait": isAnswering,
                                        "bg-sky-600 hover:bg-sky-700 cursor-pointer": !isAnswering,
                                        "bg-gray-400 cursor-not-allowed": nodeType === 'user-question' && localQuestion.length < 20 && !isAnswering
                                    }
                                )}
                                style={{ fontSize: '0.7rem', lineHeight: '1rem', padding: '2px 6px' }}
                            >
                                {isAnswering ? "Answering..." : "Answer"}
                            </button>
                        )}
                        {/* TODO: Button to add downstream user node? */}
                    </>
                );
            case 'llm-answer':
                return <ReactMarkdown {...commonMarkdownProps}>{answer}</ReactMarkdown>;
            case 'user-file':
                return (
                    <>
                        <div className="flex items-center mb-1">
                            <PaperClipIcon className="w-4 h-4 mr-1 inline-block" />
                            <span className="font-medium text-sm truncate" title={fileInfo?.name}>{fileInfo?.name || 'File Node'}</span>
                        </div>
                        {answer ? (
                            <ReactMarkdown className="text-xs bg-gray-50 p-1 max-h-40 overflow-y-auto border rounded" {...commonMarkdownProps}>{answer}</ReactMarkdown>
                        ) : (
                            <div className="text-xs text-gray-500">
                                <label htmlFor={`file-upload-${nodeID}`} className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 rounded p-2 hover:border-blue-400">
                                    <CloudArrowUpIcon className="w-5 h-5 mr-1"/>
                                    Click or Drag to Upload File
                                </label>
                                <input id={`file-upload-${nodeID}`} type="file" className="hidden" onChange={handleFileChange} />
                            </div>
                        )}
                        {/* Add Follow-up Buttons */}
                        <div className="mt-2 flex space-x-1">
                           <button onClick={() => handleAddNode('user-question')} className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded">+ Question</button>
                           {/* Add other allowed downstream node buttons */}
                        </div>
                    </>
                );
            case 'user-webpage':
                return (
                    <>
                         <div className="flex items-center mb-1">
                            <LinkIcon className="w-4 h-4 mr-1 inline-block" />
                            <span className="font-medium text-sm truncate" title={url}>{url || 'Web Page Node'}</span>
                        </div>
                        {answer ? (
                            <ReactMarkdown className="text-xs bg-gray-50 p-1 max-h-40 overflow-y-auto border rounded" {...commonMarkdownProps}>{answer}</ReactMarkdown>
                        ) : (
                             <div className="flex items-center space-x-1">
                                <input
                                    type="url"
                                    value={localUrl}
                                    onChange={handleUrlChange}
                                    placeholder="Enter URL (https://...)"
                                    className="flex-grow p-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                                />
                                <button onClick={handleFetchUrl} disabled={isLoading || !localUrl.startsWith('http')} className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded disabled:bg-gray-400">
                                    {isLoading ? 'Fetching...' : 'Get'}
                                </button>
                            </div>
                        )}
                         {/* Add Follow-up Buttons */}
                         <div className="mt-2 flex space-x-1">
                           <button onClick={() => handleAddNode('user-question')} className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded">+ Question</button>
                           {/* Add other allowed downstream node buttons */}
                        </div>
                    </>
                );
            default:
                return <div>Unknown Node Type</div>;
        }
    };

    // --- Main Render --- //
    return (
        <div
            ref={ref} // Attach measure ref here
            className={classNames(
                'interactive-node border-[3px] bg-white text-black rounded p-2 shadow-sm',
                // Add border colors based on type
                {
                    'border-sky-400': nodeType === 'llm-question' || nodeType === 'user-question',
                    'border-green-400': nodeType === 'llm-answer',
                    'border-purple-400': nodeType === 'user-file',
                    'border-orange-400': nodeType === 'user-webpage',
                    // Add focus/selection styling
                    'opacity-50': focusedId != null && !isInFocusedBranch(nodeID.replace(/^[qa]-/, '')),
                    'ring-2 ring-yellow-400 ring-offset-2': selected, // Example selection style
                }
            )}
            style={{
                maxWidth: nodeType === 'llm-answer' && answer.length > 800 ? 500 : 300,
                // Height is managed by useEffect setting nodeDims, this could be minHeight
                minHeight: 50, // Ensure a minimum size
            }}
            onClick={() => setFocusedId(nodeID.replace(/^[qa]-/, ''))} // Set focus on click
        >
            <Handle type="target" position={Position.Left} className="!bg-gray-400" />
            <Handle type="source" position={Position.Right} className="!bg-gray-400" />

            <div className="node-content-wrapper" style={{ maxHeight: maxNodeHeightPx, overflowY: 'auto' }}>
                {/* Loading Indicator */}
                {isLoading && (
                    <div className="absolute top-1 right-1 text-xs text-gray-500 flex items-center">
                        <CogIcon className="w-3 h-3 mr-1 animate-spin"/> Processing...
                    </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                     <div className="text-xs text-red-600 bg-red-100 p-1 rounded mt-1 flex items-center">
                        <ExclamationTriangleIcon className="w-3 h-3 mr-1"/> {errorMessage}
                    </div>
                )}

                {/* Main Content based on type */}
                <div ref={ref} className="prose prose-sm max-w-none prose-p:my-1 prose-li:my-0.5 [&>*:first-child]:mt-0">
                     {renderContent()}
                </div>
            </div>
        </div>
    );
};

// Default export or named export
// export default InteractiveNode; // If you prefer default
