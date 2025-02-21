import { useState, useCallback } from 'react';
import './index.css';
import GraphPage from './GraphPage';
import { PERSONAS } from './personas';
import { GraphPageExample } from './GraphPageExample';
import { MODELS } from './models';
import { ApiKey } from './APIKeyModal';
import { getApiKeyFromLocalStorage } from './APIKeyModal';
import StartPage, { Example } from './StartPage';
import { RouterProvider, createBrowserRouter, useNavigate, BrowserRouter } from 'react-router-dom';
import AboutPage from './AboutPage';
import { StoredMindMap } from './util/storage';

function CoreStuff() {
  const [seedQuery, setSeedQuery] = useState<string>();
  const [model, setModel] = useState(Object.keys(MODELS)[0]);
  const [persona, setPersona] = useState(Object.keys(PERSONAS)[0]);
  const [apiKey, setApiKey] = useState<ApiKey>(getApiKeyFromLocalStorage());
  const [example, setExample] = useState<Example>();
  const handleLoadMindMap = useCallback((map: StoredMindMap) => {
    setSeedQuery(map.seedQuery);
    setModel(map.model);
    setPersona(map.persona);
  }, []);

  return example ? (
    <div className="text-white bg-zinc-700 h-screen w-screen fixed left-0 top-0">
      <GraphPageExample
        example={example}
        onExit={() => {
          setSeedQuery('');
          setExample(undefined);
        }}
      />
    </div>
  ) : seedQuery ? (
    <div className="text-white bg-zinc-700 h-screen w-screen fixed left-0 top-0">
      <GraphPage
        apiKey={apiKey}
        onExit={() => setSeedQuery('')}
        seedQuery={seedQuery}
        persona={persona}
        model={model}
      />
    </div>
  ) : (
    <div className="text-white bg-zinc-700 min-h-screen flex flex-col">
      <StartPage
        apiKey={apiKey}
        setApiKey={setApiKey}
        model={model}
        persona={persona}
        onSetModel={setModel}
        onSetPersona={setPersona}
        onSetExample={setExample}
        onSubmitPrompt={query => {
          setSeedQuery(query);
          setModel(model);
          setPersona(persona);
        }}
        onLoadMindMap={handleLoadMindMap}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const [apiKey, setApiKey] = useState<ApiKey>(getApiKeyFromLocalStorage());
  const [model, setModel] = useState('openai/gpt-4o-mini');
  const [persona, setPersona] = useState('researcher');
  const navigate = useNavigate();

  const handleLoadMindMap = useCallback((map: StoredMindMap) => {
    setModel(map.model);
    setPersona(map.persona);
    navigate(`/graph?q=${encodeURIComponent(map.seedQuery)}`);
  }, []);

  return (
    <RouterProvider
      router={createBrowserRouter([
        {
          path: '/',
          element: (
            <StartPage
              model={model}
              persona={persona}
              apiKey={apiKey}
              onSubmitPrompt={query => {
                navigate(`/graph?q=${encodeURIComponent(query)}`);
              }}
              onSetModel={setModel}
              onSetPersona={setPersona}
              onSetExample={example => {
                setModel(example.model);
                setPersona(example.persona);
                navigate(`/graph?q=${encodeURIComponent(example.tree['0'].question)}`);
              }}
              setApiKey={setApiKey}
              onLoadMindMap={handleLoadMindMap}
            />
          ),
        },
        {
          path: '/about',
          element: <AboutPage />,
        },
      ])}
    />
  );
}

export default App;
export type { Example };
