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
          }),

        setPlaying: (isPlaying) => set({ playing: isPlaying }),
        setFocusedId: (id) => set({ focusedId: id }),

        setModel: (model) => set({ model: model }),
        setPersona: (persona) => set({ persona: persona }),
        setIsGenerating: (generating) => set({ isGenerating: generating }),
        setError: (errorMessage) => set({ error: errorMessage }),

        setInitialTree: (tree) =>
          set({ qaTree: tree, focusedId: null, error: null }),

        addNode: (node) =>
          set((state) => {
            if (!state.qaTree) {
              console.warn("Attempted to add node before tree initialization.");
              return;
            }
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
              if (node.answer === undefined || node.answer === null) {
                node.answer = "";
              }
              node.answer += chunk;
            } else {
              console.warn(
                `Attempted to stream to non-existent node: ${nodeId}`
              );
            }
          }),

        deleteNodeAndDescendants: (nodeIdToDelete) =>
          set((state) => {
            if (!state.qaTree) return;
            const nodeToDelete = state.qaTree[nodeIdToDelete];
            if (!nodeToDelete) return;

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
