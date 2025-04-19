import React, { useEffect, useState } from "react";
import useMeasure from "react-use-measure";
import { Handle, Position } from "reactflow";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./fadeout-text.css";
import classNames from "classnames";
import { NodeDims } from "./types";
import { useFocused } from "./FocusedContext";

// console.log("FadeoutTextNode");

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
    isAnswering?: boolean;
  };
};
export const FadeoutTextNode: React.FC<FadeoutTextNodeProps> = (props) => {
  // console.log("function FadeoutTextNode started");
  const isLongAnswer = !props.data.question && props.data.text.length > 800;
  const targetMaxWidth = isLongAnswer ? 500 : 250;

  const [ref, bounds] = useMeasure();
  const [maxNodeHeightPx, setMaxNodeHeightPx] = useState(
    window.innerHeight * 0.99
  );

  useEffect(() => {
    const handleResize = () => {
      setMaxNodeHeightPx(window.innerHeight * 0.99);
    };
    window.addEventListener("resize", handleResize);
    // Initial calculation
    handleResize();
    // Cleanup listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [expanded, setExpanded] = useState(
    // Auto-expand the first question and answer nodes
    props.data.nodeID === "a-0" || props.data.nodeID === "q-0" ? true : false
  );

  useEffect(() => {
    // Update dimensions in parent state whenever measured height changes and the node is expanded
    if (expanded && bounds.width > 0 && bounds.height > 0) {
      const scaleFactor = getScaleFactor();
      const currentActualHeight = bounds.height / scaleFactor;
      const currentWidth = bounds.width / scaleFactor;
      const verticalPaddingAndBorder = 16 + 6; // 8px padding top/bottom + 3px border top/bottom
      const buttonHeight =
        props.data.question && !props.data.hasAnswer ? 28 : 0; // Approx button height
      const baseCalculatedHeight =
        currentActualHeight + verticalPaddingAndBorder + buttonHeight;

      // Cap the height at the calculated max viewport height
      const reportedHeight = Math.min(baseCalculatedHeight, maxNodeHeightPx);

      props.data.setNodeDims((prevState) => ({
        ...prevState,
        [props.data.nodeID]: {
          width: Math.max(currentWidth, targetMaxWidth),
          height: reportedHeight,
        }, // Use measured or target width, capped height
      }));
    }
    // Depend on bounds.width and bounds.height, expanded state, and scale factor
  }, [
    bounds.width,
    bounds.height,
    expanded,
    props.data.setNodeDims,
    props.data.nodeID,
    props.data.question,
    props.data.hasAnswer,
    targetMaxWidth,
    maxNodeHeightPx,
    getScaleFactor,
  ]);

  // Calculate the actual height to apply to the style, considering expansion and max height
  const scaleFactor = getScaleFactor();
  const currentScaledContentHeight = bounds.height / scaleFactor;
  const verticalPaddingAndBorder = 16 + 6; // 8px padding top/bottom + 3px border top/bottom
  const buttonHeight = props.data.question && !props.data.hasAnswer ? 28 : 0;
  const fullCalculatedHeight =
    currentScaledContentHeight + verticalPaddingAndBorder + buttonHeight;
  const cappedHeight = Math.min(fullCalculatedHeight, maxNodeHeightPx);

  const appliedHeight =
    props.data.question && !props.data.hasAnswer
      ? expanded
        ? cappedHeight // Use capped height when expanded
        : Math.min(
            140 + verticalPaddingAndBorder + buttonHeight,
            fullCalculatedHeight
          ) // Collapsed question: min of 140 or actual needed height
      : expanded
      ? cappedHeight // Use capped height when expanded
      : props.data.question
      ? Math.min(140 + verticalPaddingAndBorder, fullCalculatedHeight) // Collapsed question (already answered): min of 140 or actual needed height
      : "auto"; // Answer node collapsed (should not happen often with auto-expand)

  const { focusedId, setFocusedId, isInFocusedBranch } = useFocused();

  return (
    <div
      onClick={() => {
        if (props.data.question) {
          setFocusedId(props.data.nodeID.slice(2));
        }
        // Only trigger expansion on click, dimension update is handled by useEffect
        if (!expanded) {
          setExpanded(true);
        }
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      className={classNames("fadeout-text border-[3px] bg-white text-black", {
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
        maxHeight: maxNodeHeightPx, // Apply max height
        position: "relative",
        borderRadius: 4,
        padding: "8px 12px",
        maxWidth: targetMaxWidth,
        overflow: "hidden",
        height: appliedHeight,
        transition:
          "transform 0.5s, height 0.5s, width 0.5s, max-width 0.5s, opacity 0.15s, border 0.15s",
        paddingBottom:
          props.data.question && !props.data.hasAnswer ? "36px" : "8px",
      }}
    >
      <Handle type={"target"} position={Position.Left} />
      <Handle type={"source"} position={Position.Right} />
      <div
        className={classNames(
          "fadeout-text-inner prose max-w-none prose-*:first:mt-0 text-black prose-li:marker:text-black prose-li:my-1 leading-tight",
          "[&_ul]:mt-[0.25em] [&_ol]:mt-[0.25em]",
          "[&_p]:mt-[1em] [&_p]:mb-0",
          {
            "h-[140px]": props.data.question && !expanded,
          }
        )}
        style={{
          height: "100%", // Allow inner div to fill parent's height
          overflowY: "auto", // Add vertical scroll when needed
          ...(expanded || !props.data.question
            ? { WebkitMaskImage: "none" }
            : {}),
        }}
      >
        <div ref={ref} className="[&>*:first-child]:mt-0">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {props.data.text}
          </ReactMarkdown>
        </div>
      </div>
      {props.data.question &&
        !props.data.hasAnswer &&
        props.data.onGenerateAnswer && (
          <button
            disabled={props.data.isAnswering}
            onClick={(e) => {
              e.stopPropagation();
              if (props.data.onGenerateAnswer) {
                props.data.onGenerateAnswer(props.data.nodeID.slice(2));
              }
            }}
            className={classNames(
              "absolute bottom-1 right-1 text-white px-2 py-0.5 rounded text-xs z-10",
              {
                "bg-green-600 hover:bg-green-700 cursor-wait":
                  props.data.isAnswering,
                "bg-sky-600 hover:bg-sky-700 cursor-pointer":
                  !props.data.isAnswering,
              }
            )}
            style={{
              fontSize: "0.7rem",
              lineHeight: "1rem",
              padding: "2px 6px",
            }}
          >
            {props.data.isAnswering ? "Answering..." : "Answer"}
          </button>
        )}
    </div>
  );
  // console.log("function FadeoutTextNode finished");
};
