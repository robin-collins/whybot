import React, { useEffect, useState } from "react";
import useMeasure from "react-use-measure";
import { Handle, Position } from "reactflow";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./fadeout-text.css";
import classNames from "classnames";
import { NodeDims } from "./GraphPage";
import { useFocused } from "./FocusedContext";

const getScaleFactor = (): number => {
  const viewportElement = document.querySelector(
    ".react-flow__viewport"
  ) as HTMLElement;

  if (!viewportElement) {
    console.error(
      'Element with the classname "react-flow__viewport" not found'
    );
    return 1; // default scale factor
  }

  const style = getComputedStyle(viewportElement);
  const transformValue = style.transform;

  // Example transform value: matrix(1, 0, 0, 1, 0, 0)
  // The scale factor is the first value in the matrix
  const match = /matrix\((.+),/.exec(transformValue);

  if (!match) {
    console.warn(
      "Unable to find scale factor from the element's transform property"
    );
    return 1; // default scale factor
  }

  return parseFloat(match[1]);
};

type FadeoutTextNodeProps = {
  data: {
    text: string;
    nodeID: string;
    setNodeDims: React.Dispatch<React.SetStateAction<NodeDims>>;
    question: boolean;
    hasAnswer?: boolean;
    onGenerateAnswer?: (nodeId: string) => void;
  };
};
export const FadeoutTextNode: React.FC<FadeoutTextNodeProps> = (props) => {
  const [ref, bounds] = useMeasure();
  const [expanded, setExpanded] = useState(
    // Auto-expand the first question and answer nodes
    props.data.nodeID === "a-0" || props.data.nodeID === "q-0" ? true : false
  );
  const [actualHeight, setActualHeight] = useState(bounds.height);
  useEffect(() => {
    setActualHeight(bounds.height / getScaleFactor());
  }, [bounds.height]);
  const { focusedId, setFocusedId, isInFocusedBranch } = useFocused();

  return (
    <div
      onClick={() => {
        if (props.data.question) {
          setFocusedId(props.data.nodeID.slice(2));
        }
        setExpanded(true);
        // Now I have to call setNodeDims with the nodeID and set the width and height
        props.data.setNodeDims((prevState) => ({
          ...prevState,
          [props.data.nodeID]: { width: 250, height: actualHeight + (props.data.question && !props.data.hasAnswer ? 36 : 18) },
        }));
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      className={classNames("fadeout-text border", {
        "cursor-pointer": !expanded,
        "cursor-default": expanded,
        "border-sky-400": props.data.question,
        "border-green-400": !props.data.question,
        "opacity-40":
          focusedId != null && !isInFocusedBranch(props.data.nodeID.slice(2)),
        "border-yellow-100":
          props.data.question && focusedId === props.data.nodeID.slice(2),
      })}
      style={{
        position: "relative",
        borderRadius: 4,
        padding: "8px 12px",
        maxWidth: 250,
        overflow: "hidden",
        height: props.data.question
          ? expanded
            ? actualHeight + 16 + 2
            : Math.min(140 + 16 + 2, actualHeight + 16 + 2)
          : "auto",
        transition:
          "transform 0.5s, height 0.5s, width 0.5s, opacity 0.15s, border 0.15s",
        paddingBottom: props.data.question && !props.data.hasAnswer ? "28px" : "8px",
      }}
    >
      <Handle type={"target"} position={Position.Left} />
      <Handle type={"source"} position={Position.Right} />
      <div
        className={classNames("fadeout-text-inner prose prose-sm max-w-none", {
          "h-[140px]": props.data.question && !expanded,
        })}
        style={expanded || !props.data.question ? { WebkitMaskImage: "none" } : {}}
      >
        <div ref={ref}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {props.data.text}
          </ReactMarkdown>
        </div>
      </div>
      {props.data.question && !props.data.hasAnswer && props.data.onGenerateAnswer && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (props.data.onGenerateAnswer) {
              props.data.onGenerateAnswer(props.data.nodeID.slice(2));
            }
          }}
          className="absolute bottom-1 right-1 bg-sky-600 text-white px-2 py-0.5 rounded text-xs hover:bg-sky-700 z-10 cursor-pointer"
          style={{ fontSize: '0.7rem', lineHeight: '1rem', padding: '2px 6px'}}
        >
          Answer
        </button>
      )}
    </div>
  );
};
