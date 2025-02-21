import { useState } from 'react';
import './index.css';
import Dropdown from './Dropdown';
import { PERSONAS } from './personas';
import { MODELS } from './models';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { StoredMindMap, getMindMaps } from './util/storage';

type SidebarButtonProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

export const SidebarButton = (props: SidebarButtonProps) => {
  return (
    <button
      onClick={props.toggleSidebar}
      className="h-12 w-12 p-2 text-white/50 hover:text-white/80"
    >
      {props.isOpen ? (
        // Left chevron
        <ChevronLeftIcon className="h-8 w-8" />
      ) : (
        // Hamburger menu
        <svg className="h-8 w-8" stroke="currentColor" fill="none" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      )}
    </button>
  );
};

type SidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
  persona: string;
  model: string;
  onSetPersona: (persona: string) => void;
  onSetModel: (model: string) => void;
  onLoadMindMap: (map: StoredMindMap) => void;
};

export const Sidebar = (props: SidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const mindMaps = getMindMaps();

  const filteredMaps = mindMaps.filter(map => {
    const searchLower = searchQuery.toLowerCase();
    return (
      map.name.toLowerCase().includes(searchLower) ||
      map.seedQuery.toLowerCase().includes(searchLower) ||
      Object.values(map.tree).some(
        (node: QATreeNode) =>
          node.question.toLowerCase().includes(searchLower) ||
          node.answer.toLowerCase().includes(searchLower)
      )
    );
  });

  return (
    <div
      className={`fixed z-30 inset-y-0 left-0 transform ${
        props.isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-400 ease-in-out w-80 bg-zinc-800 p-8`}
    >
      <div className="absolute top-0 right-0 -mr-16 p-1">
        <SidebarButton isOpen={props.isOpen} toggleSidebar={props.toggleSidebar} />
      </div>
      <div className="text-gray-300">
        <span className="text-xl">Settings</span>
      </div>
      <nav className="mt-5 flex">
        <div className="flex flex-col py-2 justify-between">
          <div className="h-15">Persona:</div>
          <div className="h-15">Model:</div>
        </div>
        <div className="flex flex-col ml-4">
          <Dropdown
            className="w-44 mb-4"
            value={props.persona}
            options={Object.entries(PERSONAS).map(([k, v]) => {
              return { value: k, name: v.name, popup: v.description };
            })}
            onChange={props.onSetPersona}
          />
          <Dropdown
            className="w-28"
            value={props.model}
            options={Object.entries(MODELS).map(([k, v]) => {
              return { value: k, name: v.name, popup: v.description };
            })}
            onChange={props.onSetModel}
          />
        </div>
      </nav>

      {/* Mind Map History Section */}
      <div className="mt-10">
        <div className="text-gray-300 text-xl mb-4">Mind Map History</div>

        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search mind maps..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-700 rounded text-white text-sm outline-none border border-zinc-600 focus:border-zinc-500"
          />
        </div>

        {/* History List */}
        <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
          {filteredMaps.length > 0 ? (
            filteredMaps.map(map => (
              <div
                key={map.id}
                onClick={() => props.onLoadMindMap(map)}
                className="p-3 bg-zinc-700/50 rounded cursor-pointer hover:bg-zinc-700 transition-colors"
              >
                <div className="text-white/90 text-sm font-medium">{map.name}</div>
                <div className="text-white/50 text-xs mt-1">
                  {new Date(map.date).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-white/50 text-sm text-center py-4">
              {searchQuery
                ? 'No mind maps found matching your search'
                : 'No history yet. Ask a question to create your first mind map!'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
