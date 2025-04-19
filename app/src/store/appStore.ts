import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools, persist } from "zustand/middleware";
import { QATree, QATreeNode } from "../types";
import { MODELS } from "../models";
import { Persona, PERSONAS } from "../personas";

interface AppState {
  // Core State
  qaTree: QATree | null;
  playing: boolean;
  focusedId: string | null;
  model: string;
  persona: Persona | null;

  // Status/Error State
  isGenerating: boolean;
  error: string | null;

  // Actions
  initializeTree: (seedQuery: string, initialPersona?: Persona | null) => void;
  setPlaying: (isPlaying: boolean) => void;
  setFocusedId: (id: string | null) => void;
  setModel: (model: string) => void;
  setPersona: (persona: Persona | null) => void;
  setIsGenerating: (generating: boolean) => void;
  setError: (errorMessage: string | null) => void;

  // --- QATree Actions ---
  setInitialTree: (tree: QATree) => void;
  addNode: (node: QATreeNode) => void;
  updateNode: (nodeId: string, changes: Partial<QATreeNode>) => void;
  deleteNodeAndDescendants: (nodeId: string) => void;
  updateNodeAnswerChunk: (nodeId: string, chunk: string) => void;
}

const getAllDescendantIds = (tree: QATree, startNodeId: string): string[] => {
  // console.log("function getAllDescendantIds started");
  const descendants: string[] = [];
  const queue: string[] = [startNodeId];
  const visited: Set<string> = new Set();

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    if (currentId !== startNodeId) {
      descendants.push(currentId);
    }

    const node = tree[currentId];
    if (node?.children) {
      node.children.forEach((childId) => {
        if (tree[childId] && !visited.has(childId)) {
          queue.push(childId);
        }
      });
    }
  }
  // console.log("function getAllDescendantIds finished");
  return descendants;
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((set, get) => ({
        qaTree: null,
        playing: true,
        focusedId: null,
        model: "openai/gpt-4.1-mini",
        persona: PERSONAS.researcher,
        isGenerating: false,
        error: null,

        initializeTree: (seedQuery, initialPersona = null) =>
          set((state) => {
            // console.log("function initializeTree started");
            const rootNode: QATreeNode = {
              nodeID: "q-0",
              question: seedQuery,
              answer: "",
              nodeType: "llm-question",
              children: [],
              parent: undefined,
            };
            state.qaTree = { "q-0": rootNode };
            state.focusedId = null;
            state.error = null;
            state.isGenerating = false;
            state.playing = true;
            if (initialPersona) {
              state.persona = initialPersona;
            }
            // console.log("function initializeTree finished");
          }),

        setPlaying: (isPlaying) => {
          // console.log("function setPlaying started");
          set({ playing: isPlaying });
          // console.log("function setPlaying finished");
        },
        setFocusedId: (id) =>
          set((state) => {
            // console.log("function setFocusedId started");
            state.focusedId = id;
            // console.log("function setFocusedId finished");
          }),

        setModel: (model) =>
          set((state) => {
            // console.log("function setModel started");
            state.model = model;
            // console.log("function setModel finished");
          }),
        setPersona: (persona) =>
          set((state) => {
            // console.log("function setPersona started");
            state.persona = persona;
            // console.log("function setPersona finished");
          }),
        setIsGenerating: (generating) =>
          set((state) => {
            // console.log("function setIsGenerating started");
            state.isGenerating = generating;
            // console.log("function setIsGenerating finished");
          }),
        setError: (errorMessage) =>
          set((state) => {
            // console.log("function setError started");
            state.error = errorMessage;
            // console.log("function setError finished");
          }),

        setInitialTree: (tree) =>
          set((state) => {
            // console.log("function setInitialTree started");
            state.qaTree = tree;
            state.focusedId = null;
            state.error = null;
            // console.log("function setInitialTree finished");
          }),

        addNode: (node) =>
          set((state) => {
            // console.log("function addNode started");
            if (!state.qaTree) {
              console.warn("Attempted to add node before tree initialization.");
              // console.log("function addNode finished");
              return;
            }
            if (state.qaTree[node.nodeID]) {
              console.warn(`Attempted to add duplicate node: ${node.nodeID}`);
              // console.log("function addNode finished");
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
            // console.log("function addNode finished");
          }),

        updateNode: (nodeId, changes) =>
          set((state) => {
            // console.log("function updateNode started");
            if (!state.qaTree) {
              // console.log("function updateNode finished");
              return;
            }
            const node = state.qaTree[nodeId];
            if (node) {
              Object.assign(node, changes);
            } else {
              console.warn(`Attempted to update non-existent node: ${nodeId}`);
            }
            // console.log("function updateNode finished");
          }),

        updateNodeAnswerChunk: (nodeId, chunk) =>
          set((state) => {
            // console.log("function updateNodeAnswerChunk started");
            if (!state.qaTree) {
              // console.log("function updateNodeAnswerChunk finished");
              return;
            }
            const node = state.qaTree[nodeId];
            if (node) {
              if (node.answer === undefined || node.answer === null) {
                node.answer = "";
              }
              node.answer += chunk;
            } else {
              console.warn(
                `Attempted to stream to non-existent node: ${nodeId}`
              );
            }
            // console.log("function updateNodeAnswerChunk finished");
          }),

        deleteNodeAndDescendants: (nodeIdToDelete) =>
          set((state) => {
            // console.log("function deleteNodeAndDescendants started");
            if (!state.qaTree) {
              // console.log("function deleteNodeAndDescendants finished");
              return;
            }
            const nodeToDelete = state.qaTree[nodeIdToDelete];
            if (!nodeToDelete) {
              // console.log("function deleteNodeAndDescendants finished");
              return;
            }

            const allIdsToDelete = [
              nodeIdToDelete,
              ...getAllDescendantIds(state.qaTree, nodeIdToDelete),
            ];

            if (nodeToDelete.parent && state.qaTree[nodeToDelete.parent]) {
              const parent = state.qaTree[nodeToDelete.parent];
              if (parent.children) {
                parent.children = parent.children.filter(
                  (id) => id !== nodeIdToDelete
                );
              }
            }

            allIdsToDelete.forEach((id) => {
              if (state.qaTree![id]) {
                delete state.qaTree![id];
              }
            });

            if (get().focusedId && allIdsToDelete.includes(get().focusedId!)) {
              state.focusedId = null;
            }
            // console.log("function deleteNodeAndDescendants finished");
          }),
      })),
      {
        name: "whybot-storage",
        partialize: (state) => ({
          model: state.model,
          personaName: state.persona?.name ?? 'researcher',
        }),
        onRehydrateStorage: () => (state, error) => {
            if (error) {
                console.error("Failed to rehydrate Zustand state:", error);
                return;
            }
            if (state) {
                const personaName = (state as any).personaName;
                if (personaName && PERSONAS[personaName]) {
                    state.persona = PERSONAS[personaName];
                } else {
                    state.persona = PERSONAS.researcher;
                }
                delete (state as any).personaName;
            }
        }
      }
    ),
    { name: "WhyBotAppStore" }
  )
);

export const selectQaTree = (state: AppState) => state.qaTree;
export const selectIsTreeInitialized = (state: AppState) =>
  state.qaTree !== null;
export const selectPlaying = (state: AppState) => state.playing;
export const selectFocusedId = (state: AppState) => state.focusedId;
export const selectError = (state: AppState) => state.error;
export const selectIsGenerating = (state: AppState) => state.isGenerating;
export const selectModel = (state: AppState) => state.model;
export const selectPersona = (state: AppState) => state.persona;
