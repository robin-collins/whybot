import { QATree } from '../GraphPage';

export interface StoredMindMap {
  id: string;
  name: string;
  date: string;
  tree: QATree;
  persona: string;
  model: string;
  seedQuery: string;
}

export const saveMindMap = (mindMap: StoredMindMap) => {
  const maps = getMindMaps();
  const existingIndex = maps.findIndex(m => m.id === mindMap.id);

  if (existingIndex >= 0) {
    maps[existingIndex] = mindMap;
  } else {
    maps.push(mindMap);
  }

  localStorage.setItem('mindmaps', JSON.stringify(maps));
};

export const getMindMaps = (): StoredMindMap[] => {
  const maps = localStorage.getItem('mindmaps');
  return maps ? JSON.parse(maps) : [];
};

export const getMindMap = (id: string): StoredMindMap | undefined => {
  return getMindMaps().find(m => m.id === id);
};

export const autoSaveMindMap = (
  tree: QATree,
  persona: string,
  model: string,
  seedQuery: string
) => {
  const id = `mindmap_${seedQuery.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  saveMindMap({
    id,
    name: seedQuery,
    date: new Date().toISOString(),
    tree,
    persona,
    model,
    seedQuery,
  });
};
