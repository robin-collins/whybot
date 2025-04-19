// app/src/NodeInspector.tsx
import React from 'react';
import { useNodes, ViewportPortal, useReactFlow, type XYPosition } from '@xyflow/react';

export default function NodeInspector() {
  const nodes = useNodes();
  const { getInternalNode } = useReactFlow();

  return (
    <ViewportPortal>
      {/* Overlay container to hold all node labels */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {nodes.map((node) => {
          // Grab the internal node to get absolute coords
          const internal = getInternalNode(node.id);
          if (!internal) return null;

          const absPos = internal.internals.positionAbsolute;
          const width = node.measured?.width ?? 0;
          const height = node.measured?.height ?? 0;

          // Nothing to show if not yet measured
          if (width <= 0 || height <= 0) return null;

          const { x, y } = node.position;

          return (
            <div
              key={node.id}
              className="absolute pointer-events-none bg-white/80 p-1 rounded border border-gray-300 text-xs shadow"
              style={{
                transform: `translate(${absPos.x}px, ${absPos.y + height}px)`,
                width,
              }}
            >
              <div>ID: {node.id}</div>
              <div>Type: {node.type}</div>
              <div>Pos: {x.toFixed(1)}, {y.toFixed(1)}</div>
              <div>Size: {width.toFixed(1)}×{height.toFixed(1)}</div>
              <div>Data: {JSON.stringify(node.data)}</div>
            </div>
          );
        })}
      </div>
    </ViewportPortal>
  );
}