import { getBezierPath, EdgeProps, Position } from 'reactflow';
import './DeletableEdge.css';

interface DeletableEdgeProps extends EdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  style?: React.CSSProperties;
  data?: {
    deleteBranch: (id: string) => void;
  };
}

export const DeletableEdge: React.FC<DeletableEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}) => {
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
      <path id={id} style={style} className="react-flow__edge-path" d={edgePath} />
      <path
        id={id}
        style={style}
        className="react-flow__edge-path fat-edge"
        d={edgePath}
        onClick={evt => {
          evt.stopPropagation();
          if (data?.deleteBranch) {
            data.deleteBranch(id.split('-')[2]);
          }
        }}
      />
    </>
  );
};
