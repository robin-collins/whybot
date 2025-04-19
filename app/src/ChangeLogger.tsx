import React, { useState, useEffect } from 'react';
import { useStore, type NodeChange } from '@xyflow/react';

// Define interface for the logged change structure
interface LoggedChange {
  id: string;
  type: NodeChange['type']; // Use the type from NodeChange union
  change: NodeChange; // Store the original change object
}

// Selectors to get node changes and dimensions
const nodeChangesSelector = (state) => state.nodeChanges;
const nodeInternalsSelector = (state) => state.nodeInternals;

// Helper function to format node dimensions
function formatNodeDimensions(node) {
  if (!node || !node.measured || typeof node.measured.width === 'undefined' || typeof node.measured.height === 'undefined') {
    return 'dimensions: N/A'; // Return N/A if dimensions aren't available
  }
  return `dimensions: ${Math.round(node.measured.width)} × ${Math.round(node.measured.height)}`;
}

function ChangeLogger() {
  const nodeChanges = useStore(nodeChangesSelector);
  const nodeInternals = useStore(nodeInternalsSelector);
  // Use the new LoggedChange interface for the state type
  const [loggedChanges, setLoggedChanges] = useState<LoggedChange[]>([]);

  useEffect(() => {
    if (nodeChanges?.length) {
      // Map nodeChanges to the LoggedChange structure
      const newChanges: LoggedChange[] = nodeChanges.map((change: NodeChange) => ({
        // Use type assertion for id as it exists on most change types
        id: (change as any).id,
        type: change.type,
        change: change,
      }));

      // Ensure we only update with valid changes containing an ID
      setLoggedChanges(prev =>
        [...prev, ...newChanges.filter(c => c.id)] // Filter out changes without an id if necessary
        .slice(-10) // Keep only the last N changes
      );
    }
  }, [nodeChanges]);

  return (
    <div className="react-flow__devtools-changelogger absolute top-2 left-2 z-10 p-3 bg-gray-800 bg-opacity-80 text-white text-xs rounded-md shadow-lg max-h-60 overflow-y-auto w-64 font-mono">
      <h3 className="text-sm font-semibold mb-2 border-b border-gray-600 pb-1">Change Logger</h3>
      {loggedChanges.length === 0 && <p className="text-gray-400">No changes logged yet.</p>}
      <ul className="space-y-1">
        {loggedChanges.map((log, index) => {
          const node = nodeInternals.get(log.id);
          const dimensions = node ? formatNodeDimensions(node) : 'N/A';
          return (
            <li key={index} className="p-1 bg-gray-700 rounded-sm">
              <div>Node ID: {log.id}</div>
              <div>Type: {log.type}</div>
              <div className="text-gray-300">{dimensions}</div>
              {/* Optional: Display full change details */}
              {/* <pre className="mt-1 text-gray-400 text-[10px] overflow-x-auto">{JSON.stringify(log.change, null, 2)}</pre> */}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ChangeLogger;
