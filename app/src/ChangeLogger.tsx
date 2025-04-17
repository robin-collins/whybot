import { useEffect, useRef, useState } from 'react';
import {
  useStore,
  useStoreApi,
  type OnNodesChange,
  type NodeChange,
} from '@xyflow/react';

type ChangeLoggerProps = {
  color?: string;
  limit?: number;
};

type ChangeInfoProps = {
  change: NodeChange;
};

function ChangeInfo({ change }: ChangeInfoProps) {
  const id = 'id' in change ? change.id : '-';
  const { type } = change;

  return (
    <div className="mb-2 p-2 bg-gray-100 rounded border border-gray-200">
      <div className="text-xs font-medium">Node ID: {id}</div>
      <div>
        {type === 'add' ? JSON.stringify(change.item, null, 2) : null}
        {type === 'dimensions'
          ? `dimensions: ${change.dimensions?.width} × ${change.dimensions?.height}`
          : null}
        {type === 'position'
          ? `position: ${change.position?.x.toFixed(
              1,
            )}, ${change.position?.y.toFixed(1)}`
          : null}
        {type === 'remove' ? 'remove' : null}
        {type === 'select' ? (change.selected ? 'select' : 'unselect') : null}
      </div>
    </div>
  );
}

export default function ChangeLogger({ limit = 20 }: ChangeLoggerProps) {
  const [changes, setChanges] = useState<NodeChange[]>([]);
  const onNodesChangeIntercepted = useRef(false);
  const onNodesChange = useStore((s) => s.onNodesChange);
  const store = useStoreApi();

  useEffect(() => {
    if (!onNodesChange || onNodesChangeIntercepted.current) {
      return;
    }

    onNodesChangeIntercepted.current = true;
    const userOnNodesChange = onNodesChange;

    const onNodesChangeLogger: OnNodesChange = (changes) => {
      userOnNodesChange(changes);

      setChanges((oldChanges) => [...changes, ...oldChanges].slice(0, limit));
    };

    store.setState({ onNodesChange: onNodesChangeLogger });
  }, [onNodesChange, limit]);

  return (
    <div className="fixed top-16 left-4 w-80 max-h-[70vh] overflow-y-auto bg-white bg-opacity-90 backdrop-blur p-4 rounded-lg shadow z-50">
      <div className="text-lg font-semibold mb-2">Change Logger</div>
      {changes.length === 0 ? (
        <div className="text-sm text-gray-600">No changes triggered</div>
      ) : (
        changes.map((change, index) => (
          <ChangeInfo key={index} change={change} />
        ))
      )}
    </div>
  );
}
