import { createContext, useContext, useState } from "react";
import { ReactNode } from "react";
import { QATree } from "./types";

export function isChild(
  qaTree: QATree,
  parentId: string,
  childId: string
): boolean {
  console.log("function isChild started");
  let headId: string | undefined = childId;
  while (headId != null) {
    if (headId === parentId) {
      console.log("function isChild finished");
      return true;
    }
    headId = qaTree[headId].parent;
  }
  console.log("function isChild finished");
  return false;
}

interface FocusedContextValue {
  focusedId: string | null;
  setFocusedId: (id: string | null) => void;
  isInFocusedBranch(id: string): boolean;
}

export const FocusedContext = createContext<FocusedContextValue>({
  focusedId: null,
  setFocusedId: () => {},
  isInFocusedBranch: () => false,
});

interface FocusedContextProviderProps {
  qaTree: QATree;
  children: ReactNode;
  onSetFocusedId: (id: string | null) => void;
}

export function FocusedContextProvider(props: FocusedContextProviderProps) {
  console.log("function FocusedContextProvider started");
  const [focusedId, setFocusedId] = useState<string | null>(null);

  function isInFocusedBranch(id: string) {
    if (focusedId === null) {
      return false;
    }
    if (isChild(props.qaTree, focusedId, id)) {
      return true;
    }
    if (isChild(props.qaTree, id, focusedId)) {
      return true;
    }
    return false;
  }

  console.log("function FocusedContextProvider finished");
  return (
    <FocusedContext.Provider
      value={{
        focusedId,
        setFocusedId: (newFocusedId) => {
          setFocusedId(newFocusedId);
          props.onSetFocusedId(newFocusedId);
        },
        isInFocusedBranch,
      }}
    >
      {props.children}
    </FocusedContext.Provider>
  );
}

export function useFocused() {
  console.log("function useFocused started");
  console.log("function useFocused finished");
  return useContext(FocusedContext);
}
