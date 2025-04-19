import { getBezierPath, BaseEdge, type EdgeProps } from "@xyflow/react";
import "./DeletableEdge.css";
import React from 'react';

const requestEdgeDeletion = (
  evt: React.MouseEvent,
  id: string,
  requestDeleteBranch: (edgeId: string) => void
) => {
  // console.log("function requestEdgeDeletion started");
  evt.stopPropagation();
  // console.log(`Requesting deletion for edge ${id}`);
  requestDeleteBranch(id);
  // console.log("function requestEdgeDeletion finished");
};

interface DeletableEdgeData {
  requestDeleteBranch: (edgeId: string) => void;
  targetNodeId: string;
}

export function DeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {

  // Log the received markerEnd prop
  // console.log(`DeletableEdge (${id}): Received markerEnd =`, markerEnd);

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeData = data as DeletableEdgeData | undefined;

  const handleInteractionClick = (event: React.MouseEvent) => {
    if (edgeData?.requestDeleteBranch && edgeData?.targetNodeId) {
      requestEdgeDeletion(event, edgeData.targetNodeId, edgeData.requestDeleteBranch);
    } else {
      console.warn("Custom edge data (requestDeleteBranch/targetNodeId) not found for edge:", id);
    }
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={style}
      />

      <path
        id={`${id}-interaction`}
        style={{ ...(style || {}), stroke: 'transparent', strokeWidth: 15 } as React.CSSProperties}
        className="react-flow__edge-interaction"
        d={edgePath}
        fill="none"
        onClick={handleInteractionClick}
      />
    </>
  );
}
