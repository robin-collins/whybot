**1. Identifying Current State Management Locations**

Based on the file list and common React patterns, state management is likely concentrated in these areas:

*   **`app/src/GraphPage.tsx`**: This is explicitly mentioned as the primary location for complex state (`qaTree`, generator logic, node/edge states, focus, playing status) using the `useRef` + `structuredClone` + `useState` pattern. This will be the main target for refactoring.
*   **`app/src/Flow.tsx`**: Likely manages React Flow specific state (nodes, edges, viewport), potentially interacting with the global state from `GraphPage.tsx`. We'll need to see how it receives and updates data like nodes/edges.
*   **`app/src/InteractiveNode.tsx` / `app/src/FadeoutTextNode.tsx`**: These custom nodes might have internal state, but more importantly, they will need to *read* global state (like node data from `qaTree`) and potentially trigger global actions (like focusing or updating node content).
*   **`app/src/APIKeyModal.tsx`**: Manages the API key state, likely using `useState`. This seems like a good candidate for global state, including its validation logic.
*   **`app/src/AddNodeModal.tsx`**: Manages form state for adding a new node and needs to trigger an action to add the node to the global `qaTree`.
*   **`app/src/StartPage.tsx`**: May manage state related to initial setup or loading, potentially including model/persona selection.
*   **`app/src/App.tsx`**: Might hold top-level state or context providers, although routing seems to be its main job.
*   **`app/src/FocusedContext.tsx`**: Currently uses React Context for focus management. This state (`focusedId`) should be migrated to the Zustand store.

Other components likely use `useState` for local UI state, which is generally fine to leave as is unless it represents shared application state.

**2. Zustand Implementation Plan**

***Note:** All file paths starting with `src/` in this document refer to files within the `app/src/` directory (e.g., `src/store/appStore.ts` is actually `app/src/store/appStore.ts`).*

This plan follows the guidelines in `state-management.mdc`.

**Goal:** Consolidate shared application state into a single Zustand store (`useAppStore`) using `immer` for immutable updates and `devtools` for debugging, replacing the `useRef`/`useState` combination in `GraphPage.tsx` and other scattered state logic.

**Steps & Example Snippets:**

**A. Define the Store (`app/src/store/appStore.ts`)**

*   Create a new directory `app/src/store` (if it doesn't exist per guidelines).
*   Create `app/src/store/appStore.ts`.
*   Define the state interface and the store using `create`, `immer`, and `devtools`.

```typescript
// app/src/store/appStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools, persist } from 'zustand/middleware'; // Added persist
import { QATree, QATreeNode, Persona } from '../types'; // Adjust path as needed (relative to app/src/store)
import { availableModels } from '../models'; // Adjust path as needed (relative to app/src/store)
// Removed initialTree import - initialization handled differently

interface AppState {
  // Core State
  qaTree: QATree | null; // Initialized via action
  playing: boolean;
  focusedId: string | null;
  apiKey: string | null;
  model: string;
  persona: Persona | null;

  // Status/Error State
  isGenerating: boolean;
  error: string | null; // For displaying application-level errors

  // Actions
  initializeTree: (seedQuery: string, initialPersona?: Persona | null) => void; // New action for initialization
  setPlaying: (isPlaying: boolean) => void;
  setFocusedId: (id: string | null) => void;
  setApiKey: (key: string | null) => void; // Will handle persistence
  setModel: (model: string) => void;
  setPersona: (persona: Persona | null) => void;
  setIsGenerating: (generating: boolean) => void;
  setError: (errorMessage: string | null) => void; // New action for errors

  // --- QATree Actions ---
  setInitialTree: (tree: QATree) => void; // For loading saved graphs explicitly
  addNode: (node: QATreeNode) => void;
  updateNode: (nodeId: string, changes: Partial<QATreeNode>) => void;
  deleteNodeAndDescendants: (nodeId: string) => void; // Renamed and updated for recursion
  updateNodeAnswerChunk: (nodeId: string, chunk: string) => void;
  // ... potentially more specific actions like addChild, removeChild etc.
}

// Helper function to get all descendant IDs (needed for recursive delete)
const getAllDescendantIds = (tree: QATree, startNodeId: string): string[] => {
  const descendants: string[] = [];
  const queue: string[] = [startNodeId];
  const visited: Set<string> = new Set(); // Prevent infinite loops in cyclic graphs (though unlikely here)

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    // Don't add the start node itself to the list of descendants to delete
    if (currentId !== startNodeId) {
        descendants.push(currentId);
    }

    const node = tree[currentId];
    if (node?.children) {
      node.children.forEach(childId => {
        if (tree[childId] && !visited.has(childId)) {
            queue.push(childId);
        }
      });
    }
  }
  return descendants;
};


export const useAppStore = create<AppState>()(
  devtools(
    // Persist allows saving parts of the store (e.g., apiKey, model, persona) to localStorage
    // We explicitly choose *not* to persist qaTree here by default as it can be large
    // and has separate load/save mechanisms.
    persist(
        immer((set, get) => ({
          // Initial State
          qaTree: null, // Start as null, initialized via initializeTree
          playing: true,
          focusedId: null,
          apiKey: null, // Loaded by `persist` middleware from storage if exists
          model: availableModels[0].value, // Default model
          persona: null, // Default persona
          isGenerating: false,
          error: null,

          // --- Actions Implementation ---
          initializeTree: (seedQuery, initialPersona = null) => set((state) => {
             // Create the root question node
             const rootNode: QATreeNode = {
                 nodeID: 'q-0', // Standard initial ID
                 question: seedQuery,
                 answer: '', // Initially no answer
                 nodeType: 'llm-question', // Standard type
                 children: [],
                 parent: null,
                 // Add position if needed by your layout immediately
                 // position: { x: 0, y: 0 }
             };
             state.qaTree = { 'q-0': rootNode };
             state.focusedId = null; // Reset focus
             state.error = null; // Clear errors
             state.playing = true; // Start playing
             // Set initial persona if provided
             if (initialPersona) {
                 state.persona = initialPersona;
             }
             // Reset other relevant states if needed
          }),

          setPlaying: (isPlaying) => set({ playing: isPlaying }),
          setFocusedId: (id) => set({ focusedId: id }),

          // setApiKey now handles persistence via the middleware automatically
          setApiKey: (key) => set({ apiKey: key }),

          setModel: (model) => set({ model: model }),
          setPersona: (persona) => set({ persona: persona }),
          setIsGenerating: (generating) => set({ isGenerating: generating }),
          setError: (errorMessage) => set({ error: errorMessage }),

          // Explicit action to load a full tree (e.g., from a file)
          setInitialTree: (tree) => set({ qaTree: tree, focusedId: null, error: null }),

          addNode: (node) =>
            set((state) => {
              if (!state.qaTree) return; // Should be initialized first
              if (state.qaTree[node.nodeID]) {
                console.warn(`Attempted to add duplicate node: ${node.nodeID}`);
                return;
              }
              state.qaTree[node.nodeID] = node;
              if (node.parent && state.qaTree[node.parent]) {
                const parent = state.qaTree[node.parent];
                if (!parent.children) parent.children = [];
                if (!parent.children.includes(node.nodeID)) {
                  parent.children.push(node.nodeID);
                }
              }
            }),

          updateNode: (nodeId, changes) =>
            set((state) => {
              if (!state.qaTree) return;
              const node = state.qaTree[nodeId];
              if (node) {
                Object.assign(node, changes);
              } else {
                console.warn(`Attempted to update non-existent node: ${nodeId}`);
              }
            }),

          updateNodeAnswerChunk: (nodeId, chunk) =>
            set((state) => {
                if (!state.qaTree) return;
                const node = state.qaTree[nodeId];
                if (node) {
                    if (node.answer === undefined) node.answer = '';
                    node.answer += chunk;
                } else {
                    console.warn(`Attempted to stream to non-existent node: ${nodeId}`);
                }
            }),

          // Updated delete logic for full recursion
          deleteNodeAndDescendants: (nodeIdToDelete) =>
            set((state) => {
              if (!state.qaTree) return;
              const nodeToDelete = state.qaTree[nodeIdToDelete];
              if (!nodeToDelete) return;

              // 1. Find all descendant IDs *before* modifying the tree
              const allIdsToDelete = [nodeIdToDelete, ...getAllDescendantIds(state.qaTree, nodeIdToDelete)];

              // 2. Remove the original node from its parent's children array
              if (nodeToDelete.parent && state.qaTree[nodeToDelete.parent]) {
                const parent = state.qaTree[nodeToDelete.parent];
                if (parent.children) {
                  parent.children = parent.children.filter(id => id !== nodeIdToDelete);
                }
              }

              // 3. Delete all identified nodes
              allIdsToDelete.forEach(id => {
                delete state.qaTree![id]; // Use ! because we checked qaTree exists
              });

              // 4. Clear focus if a deleted node was focused
              if (get().focusedId && allIdsToDelete.includes(get().focusedId!)) {
                  state.focusedId = null;
              }
            }),
        })),
        {
            name: 'whybot-storage', // Name for localStorage key
            // Specify which parts of the state to persist
            partialize: (state) => ({
                apiKey: state.apiKey,
                model: state.model,
                persona: state.persona,
                // Add other small, persistable states here if needed
            }),
        }
    ), // End persist
    { name: 'WhyBotAppStore' } // Name for Redux DevTools
  ) // End devtools
);

// --- Selectors (Optional but Recommended for Reusability) ---
// Place outside create or use a separate file e.g., store/selectors.ts

export const selectQaTree = (state: AppState) => state.qaTree;
export const selectIsTreeInitialized = (state: AppState) => state.qaTree !== null;
export const selectPlaying = (state: AppState) => state.playing;
export const selectFocusedId = (state: AppState) => state.focusedId;
export const selectApiKey = (state: AppState) => state.apiKey;
export const selectError = (state: AppState) => state.error;
export const selectIsGenerating = (state: AppState) => state.isGenerating;
// ... and so on
```

**B. Refactor Components to Use the Store**

*   Remove `useState`, `useRef`, `useReducer` calls related to the state now managed by Zustand.
*   Remove `Context.Provider` for `FocusedContext`.
*   Use `useAppStore` hook with selectors. Remember `useShallow` for multiple values.

*   **Example: `app/src/GraphPage.tsx` (Conceptual)**

    ```typescript
    import React, { useEffect /* remove useState, useRef, useReducer */ } from 'react';
    import { useShallow } from 'zustand/react/shallow';
    import { useAppStore, selectQaTree, selectIsTreeInitialized /* import other selectors/actions */ } from '../store/appStore'; // Relative path from app/src/pages
    import Flow from './Flow'; // Check if Flow is in same dir or needs ../components/
    // ... other imports

    interface GraphPageProps {
        seedQuery: string; // Assuming seed query comes as a prop
        initialPersona?: Persona | null; // Optional persona prop
    }

    function GraphPage({ seedQuery, initialPersona }: GraphPageProps) {
      // Get the initialization action and check if initialized
      const initializeTree = useAppStore((state) => state.initializeTree);
      const isTreeInitialized = useAppStore(selectIsTreeInitialized);

      // Initialize tree on mount or when seedQuery changes
      useEffect(() => {
         if (seedQuery && !isTreeInitialized) { // Only initialize if needed
             initializeTree(seedQuery, initialPersona);
         }
         // Consider re-initialization logic if seedQuery can change dynamically
         // else if (seedQuery && isTreeInitialized /* && condition for re-init */) {
         //    initializeTree(seedQuery, initialPersona);
         // }
      }, [seedQuery, initializeTree, isTreeInitialized, initialPersona]);


      // Select needed state slices *only after* initialization check maybe needed
      const { qaTree, playing, focusedId, apiKey, model, persona, error } = useAppStore(
        useShallow((state) => ({
          qaTree: state.qaTree, // or use selectQaTree
          playing: state.playing,
          focusedId: state.focusedId,
          apiKey: state.apiKey,
          model: state.model,
          persona: state.persona,
          error: state.error, // Select error state
        }))
      );

      // Get actions
      const setPlaying = useAppStore((state) => state.setPlaying);
      const setFocusedId = useAppStore((state) => state.setFocusedId);
      const addNode = useAppStore((state) => state.addNode);
      const updateNode = useAppStore((state) => state.updateNode);
      const deleteNodeAndDescendants = useAppStore((state) => state.deleteNodeAndDescendants);
      const setError = useAppStore((state) => state.setError); // Get error action
      // ... get other actions


      // --- Refactor Effects and Callbacks ---

      // Example: Node Generator Logic
      useEffect(() => {
        const runGenerator = async () => {
           const currentApiKey = useAppStore.getState().apiKey;
           const currentTree = useAppStore.getState().qaTree;
           const currentModel = useAppStore.getState().model;
           const currentPersona = useAppStore.getState().persona;

           if (!currentApiKey || !useAppStore.getState().playing || !currentTree) return;

           const updateChunk = useAppStore.getState().updateNodeAnswerChunk;
           const markGenerating = useAppStore.getState().setIsGenerating;
           const handleError = useAppStore.getState().setError; // Get error setter

           markGenerating(true);
           handleError(null); // Clear previous errors
           try {
               // ... existing generator logic ...
               // Call OpenAI...
               // If API call fails:
               // handleError('OpenAI API request failed. Please check your key and network.');

               // On chunk received:
               // updateChunk(targetNodeId, chunk);

           } catch (err: any) {
                console.error("Generator error:", err);
                handleError(`Generation failed: ${err.message || 'Unknown error'}`);
           }
           finally {
               markGenerating(false);
           }
        };

        // Trigger generator based on dependencies.
        // IMPORTANT: Dependencies need careful review. Triggering on every `qaTree` change might be too much.
        // Consider specific conditions: e.g., a new question node added, 'playing' is true, etc.
        // This might involve adding specific flags to the state or deriving conditions carefully.
         if (playing && isTreeInitialized /* && specific trigger conditions */) {
             // runGenerator();
         }

      }, [playing, isTreeInitialized /* , qaTree - potentially problematic, model, persona, apiKey */]);


      // Example: Handling Focus
      const handleNodeClick = (nodeId: string) => {
        setFocusedId(nodeId);
      };

      // Example: Adding a Node
      const onAddNode = (newNodeData: Omit<QATreeNode, 'nodeID'>) => {
          const newNode: QATreeNode = { /* ... create node ... */ };
          addNode(newNode);
      };

       // Example: Deleting a Node (e.g., via edge click)
       const handleDeleteBranch = (startNodeId: string) => {
           // Confirmation modal logic would go here...
           console.log(`Deleting branch starting from: ${startNodeId}`);
           deleteNodeAndDescendants(startNodeId);
       };

      // --- Rendering ---
      if (!isTreeInitialized || !qaTree) {
          // Display loading state or handle null tree case
          return <div>Loading...</div>;
      }

      // Render Error display if any
      const renderError = () => {
          if (!error) return null;
          return <div style={{ color: 'red', background: 'lightpink', padding: '10px' }}>Error: {error}</div>;
      }

      return (
        <div>
          {renderError()}
          <Flow
            // CRITICAL: Ensure these helpers pass ALL required data, including nodeType, fileInfo, url, isLoading etc.
            // CRITICAL: Ensure edge sources are correct (e.g., from `a-*` nodes for subsequent questions).
            nodes={reactFlowNodesFromQaTree(qaTree)} // Must be accurate
            edges={reactFlowEdgesFromQaTree(qaTree)} // Must be accurate
            focusedId={focusedId}
            onNodeClick={handleNodeClick}
            onEdgeDelete={handleDeleteBranch} // Pass delete handler to Flow/Edges
            // ... other props
          />
          <button onClick={() => setPlaying(!playing)}>
            {playing ? 'Pause' : 'Play'}
          </button>
          {/* ... other UI elements */}
        </div>
      );
    }

    // Helper function (potentially in utils) - Placeholder Signatures
    // IMPORTANT: Implementation needs to be accurate and pass all required data.
    function reactFlowNodesFromQaTree(qaTree: QATree): any[] {
        // Convert QATree to React Flow nodes.
        // Ensure 'data' includes: label, answer, nodeType, fileInfo, url, isLoading, etc. as needed by InteractiveNode.
        console.warn("REACT FLOW NODE CONVERSION NEEDS ACCURATE IMPLEMENTATION - Ensure all node data (type, content, status) is passed.");
        return Object.values(qaTree).map(node => ({ /* ... accurate mapping ... */ }));
    }
     function reactFlowEdgesFromQaTree(qaTree: QATree): any[] {
         // Convert QATree relationships to React Flow edges.
         // Ensure 'source' handles are correct (e.g., 'a-parentId' -> 'q-childId').
         console.warn("REACT FLOW EDGE CONVERSION NEEDS ACCURATE IMPLEMENTATION - Verify source/target and handle IDs.");
        return []; // Placeholder - Needs real implementation
    }
    ```

*   **Example: `app/src/InteractiveNode.tsx`**

    ```typescript
    import React from 'react';
    import { useShallow } from 'zustand/react/shallow';
    import { useAppStore } from '../store/appStore'; // Relative path from app/src/components

    // IMPORTANT: Ensure 'data' prop contains all necessary fields from qaTree node
    function InteractiveNode({ id, data }: { id: string; data: any }) {
      const isFocused = useAppStore((state) => state.focusedId === id);
      const { setFocusedId, updateNode } = useAppStore(
          useShallow((state) => ({
              setFocusedId: state.setFocusedId,
              updateNode: state.updateNode
          }))
      );

      // Note: The "a-0 rendering issue" might relate to layout timing or
      // initial dimension calculation in React Flow / Dagre, potentially independent
      // of Zustand itself. While Zustand ensures data consistency, check layout logic
      // in Flow.tsx and dimension reporting in node components if the issue persists.

      const handleFocus = () => setFocusedId(id);

      const handleAnswerChange = (newAnswer: string) => {
         updateNode(id, { answer: newAnswer });
      };

      // Render node using props.data and isFocused state
      // Ensure all node types (question, answer, user-*, webpage-*) are handled
      return (
        <div onClick={handleFocus} className={isFocused ? 'focused' : ''}>
          <div>{data.label /* Or data.question */}</div>
          {/* Render content based on data.nodeType */}
          {/* ... */}
        </div>
      );
    }
    ```

*   **Example: `app/src/APIKeyModal.tsx`**

    ```typescript
    import React, { useState, useEffect } from 'react';
    import { useAppStore } from '../store/appStore'; // Relative path from app/src/components

    // Mock validation function - replace with actual OpenAI ping/validation logic
    const validateApiKey = async (key: string): Promise<boolean> => {
        console.log("Validating API Key:", key);
        // Replace with actual fetch call to an OpenAI endpoint or your backend validator
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        return key.startsWith('sk-') && key.length > 20; // Basic placeholder check
    }

    function APIKeyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
      const storedApiKey = useAppStore((state) => state.apiKey);
      const setApiKey = useAppStore((state) => state.setApiKey);
      const setError = useAppStore((state) => state.setError); // Get error action

      // Local state for the input and validation status
      const [localKey, setLocalKey] = useState('');
      const [isValidating, setIsValidating] = useState(false);
      const [validationError, setValidationError] = useState<string | null>(null);

      // Sync local input when modal opens or stored key changes
       useEffect(() => {
           if (isOpen) {
               setLocalKey(storedApiKey || '');
               setValidationError(null); // Reset local error on open
           }
       }, [isOpen, storedApiKey]);


      const handleSave = async () => {
        setValidationError(null);
        setError(null); // Clear global error state too
        setIsValidating(true);
        try {
            const isValid = await validateApiKey(localKey);
            if (isValid) {
                setApiKey(localKey); // Update global state (persistence handled by store)
                onClose();
            } else {
                setValidationError("Invalid API Key.");
            }
        } catch (error: any) {
            console.error("API Key validation failed:", error);
            setValidationError(`Validation failed: ${error.message || 'Network error'}`);
            // Optionally set global error too if it's a critical failure
            // setError(`API Key validation failed: ${error.message || 'Network error'}`);
        } finally {
             setIsValidating(false);
        }
      };

      if (!isOpen) return null;

      return (
        // Modal JSX
        <div>
          <input
             type="password"
             value={localKey}
             onChange={(e) => setLocalKey(e.target.value)}
             disabled={isValidating}
           />
          <button onClick={handleSave} disabled={isValidating || !localKey}>
            {isValidating ? 'Validating...' : 'Save Key'}
          </button>
          <button onClick={onClose} disabled={isValidating}>Cancel</button>
          {validationError && <p style={{ color: 'red' }}>{validationError}</p>}
        </div>
      );
    }
    ```

**C. Address Generator Integration**

*   The generator (`nodeGenerator` logic in `app/src/GraphPage.tsx`) should remain asynchronous.
*   It **must** read necessary state using `useAppStore.getState()` *inside* the async function scope to get the latest values and avoid stale closures.
*   It **must** call actions obtained via `useAppStore.getState().actionName` or refs to actions obtained outside the effect closure to update the store with results (e.g., `updateNodeAnswerChunk`, `addNode`, `setIsGenerating`, `setError`).
*   Trigger the generator from a `useEffect` in `app/src/GraphPage.tsx`. Carefully define the dependency array to avoid unnecessary runs. Triggering based only on `playing` might be insufficient. Consider triggering based on specific tree changes (e.g., new question node added) or other relevant state.

**D. Cleanup**

*   Remove the old `qaTreeRef` and `setResultTree(structuredClone(...))` pattern entirely from `app/src/GraphPage.tsx`.
*   Remove the `FocusedContext` provider and consumer.
*   Remove any local `useState` for state now handled globally (e.g., API key in the modal, if not used for temporary input).

**3. Documentation, Comments, and TODOs**

*   **Documentation:** While creating/updating `app/src/store/appStore.ts`, add JSDoc comments explaining each state slice and action, as recommended in the rules.
*   **Inline Comments:** As you refactor components (`app/src/GraphPage.tsx`, `app/src/Flow.tsx`, etc.), add comments explaining:
    *   How components select data from the store (`useAppStore(selector)`).
    *   Why `useShallow` is used.
    *   The purpose of effects that interact with the store or trigger asynchronous operations like the generator.
    *   The flow of data and actions between components and the store.
    *   **Crucially:** Add comments highlighting the expected data structure for React Flow nodes/edges and the importance of the conversion functions (`reactFlowNodesFromQaTree`, `reactFlowEdgesFromQaTree`).
*   **TODOs:** During the refactor, if you encounter code that seems unused *after* the state logic is moved (e.g., old state update helper functions, potentially parts of `app/src/util/`), mark it with `// TODO: Investigate removal after Zustand refactor.`

This updated plan provides a more robust and complete approach to implementing Zustand, addressing the previously identified omissions and potential errors. Remember to test thoroughly after each major step, paying close attention to the recursive delete, store initialization, API key flow, and React Flow data conversion.
