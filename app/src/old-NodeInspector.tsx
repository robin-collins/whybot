import {
    useNodes,
    ViewportPortal,
    useReactFlow,
    type XYPosition,
  } from '@xyflow/react';

  export default function NodeInspector() {
    const { getInternalNode } = useReactFlow();
    const nodes = useNodes();

    return (
      <ViewportPortal>
        <div className="pointer-events-none">
          {nodes.map((node) => {
            const internalNode = getInternalNode(node.id);
            if (!internalNode) {
              return null;
            }

            const absPosition = internalNode?.internals.positionAbsolute;

            return (
              <NodeInfo
                key={node.id}
                id={node.id}
                selected={!!node.selected}
                type={node.type || 'default'}
                position={node.position}
                absPosition={absPosition}
                width={node.measured?.width ?? 0}
                height={node.measured?.height ?? 0}
                data={node.data}
              />
            );
          })}
        </div>
      </ViewportPortal>
    );
  }

  type NodeInfoProps = {
    id: string;
    type: string;
    selected: boolean;
    position: XYPosition;
    absPosition: XYPosition;
    width?: number;
    height?: number;
    data: any;
  };

  function NodeInfo({
    id,
    type,
    selected,
    position,
    absPosition,
    width,
    height,
    data,
  }: NodeInfoProps) {
    if (!width || !height) {
      return null;
    }

    return (
      <div
        className="pointer-events-none bg-white/80 p-1 rounded border border-gray-300 text-xs shadow"
        style={{
          position: 'absolute',
          transform: `translate(${absPosition.x}px, ${absPosition.y + height}px)`,
          width: width * 2,
        }}
      >
        <div>ID: {id}</div>
        <div>Type: {type}</div>
        <div>Selected: {selected ? 'yes' : 'no'}</div>
        <div>
          Pos: {position.x.toFixed(1)}, {position.y.toFixed(1)}
        </div>
        <div>
          Size: {width}×{height}
        </div>
        <div>data: {JSON.stringify(data)}</div>
      </div>
    );
  }
