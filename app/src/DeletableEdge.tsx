import { getBezierPath } from "reactflow";
import "./DeletableEdge.css";
import { useState } from "react";

const requestEdgeDeletion = (
  evt: React.MouseEvent,
  id: string,
  requestDeleteBranch: (edgeId: string) => void
) => {
  evt.stopPropagation();
  console.log(`Requesting deletion for edge ${id}`);
  requestDeleteBranch(id);
};

type DeletableEdgeProps = {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: any;
  style?: any;
  targetPosition: any;
  data?: {
    requestDeleteBranch: (edgeId: string) => void;
  };
};

export function DeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}: DeletableEdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <g className={"contains-path-and-arrow"}>
        <defs>
          <marker
            className="react-flow__arrowhead"
            id={`${id}-marker`}
            markerWidth="12.5"
            markerHeight="12.5"
            viewBox="-10 -10 20 20"
            markerUnits="strokeWidth"
            orient="auto-start-reverse"
            refX="0"
            refY="0"
          >
            <polyline
              id={`${id}-poly`}
              stroke="#b1b1b7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              fill="none"
              points="-5,-4 0,0 -5,4"
            ></polyline>
          </marker>
        </defs>
        <path
          id={id}
          style={style}
          className="react-flow__edge-path"
          d={edgePath}
          markerEnd={`url(#${id}-marker)`}
          onClick={(event) => {
            if (data?.requestDeleteBranch) {
              requestEdgeDeletion(event, id, data.requestDeleteBranch);
            } else {
              console.log("requestDeleteBranch not provided to edge", id);
            }
          }}
        />
        <path
          id={`${id}-fat`}
          style={style}
          className="fat-path"
          d={edgePath}
          onClick={(event) => {
            if (data?.requestDeleteBranch) {
              requestEdgeDeletion(event, id, data.requestDeleteBranch);
            } else {
              console.log("requestDeleteBranch not provided to edge", id);
            }
          }}
        />
      </g>
    </>
  );
}
