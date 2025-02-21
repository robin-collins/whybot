import { useState, useCallback, useEffect } from 'react';
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

function App() {
  return (
    <RouterProvider
      router={createBrowserRouter([
        {
          path: '/',
          element: <AppContent />,
        },
        {
          path: '/graph',
          element: <AppContent />,
        },
        {
          path: '/example',
          element: <AppContent />,
        },
        {
          path: '/about',
          element: <AboutPage />,
        },
      ])}
    />
  );
}

function AppContent() {
  const [apiKey, setApiKey] = useState<ApiKey>(getApiKeyFromLocalStorage());
  const [model, setModel] = useState(Object.keys(MODELS)[0]);
  const [persona, setPersona] = useState(Object.keys(PERSONAS)[0]);
  const navigate = useNavigate();
  const [seedQuery, setSeedQuery] = useState<string>();
  const [example, setExample] = useState<Example | undefined>();

  const handleLoadMindMap = useCallback(
    (map: StoredMindMap) => {
      // Moved from CoreStuff and modified
      setModel(map.model);
      setPersona(map.persona);
      setSeedQuery(map.seedQuery); // Set seedQuery when loading mindmap
      navigate(`/graph?q=${encodeURIComponent(map.seedQuery)}`); // Navigate to graph route
    },
    [navigate]
  );

  const handleSetExample = useCallback(
    (ex: Example) => {
      // New handler for setting example
      setExample(ex);
      setSeedQuery(undefined); // Clear seedQuery when example is set
      setModel(ex.model);
      setPersona(ex.persona);
      navigate(`/example?ex=${encodeURIComponent(ex.tree['0'].question)}`); // Navigate to example route
    },
    [navigate]
  );

  const handleSubmitPrompt = useCallback(
    (query: string) => {
      // New handler for submitting prompt
      setSeedQuery(query);
      setExample(undefined); // Clear example when new query is submitted
      setModel(model);
      setPersona(persona);
      navigate(`/graph?q=${encodeURIComponent(query)}`); // Navigate to graph route
    },
    [navigate, model, persona]
  );

  const handleGraphExit = useCallback(() => {
    // New handler for exiting GraphPage
    setSeedQuery(undefined);
    navigate('/'); // Navigate back to start page
  }, [navigate]);

  const handleExampleExit = useCallback(() => {
    // New handler for exiting GraphPageExample
    setExample(undefined);
    navigate('/'); // Navigate back to start page
  }, [navigate]);

  // Get the current location's search params
  const location = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);

  // Initialize state based on URL if needed
  useEffect(() => {
    if (location === '/graph') {
      const q = searchParams.get('q');
      if (q) setSeedQuery(decodeURIComponent(q));
    } else if (location === '/example') {
      const ex = searchParams.get('ex');
      if (ex && examples?.length) {
        const matchingExample = examples.find(e => e.tree['0'].question === decodeURIComponent(ex));
        if (matchingExample) setExample(matchingExample);
      }
    }
  }, [location]);

  return (
    <div className="text-white bg-zinc-700 min-h-screen flex flex-col">
      {seedQuery ? (
        <div className="text-white bg-zinc-700 h-screen w-screen fixed left-0 top-0">
          <GraphPage
            apiKey={apiKey}
            onExit={handleGraphExit}
            seedQuery={seedQuery}
            persona={persona}
            model={model}
          />
        </div>
      ) : example ? (
        <div className="text-white bg-zinc-700 h-screen w-screen fixed left-0 top-0">
          <GraphPageExample example={example} onExit={handleExampleExit} />
        </div>
      ) : (
        <StartPage
          model={model}
          persona={persona}
          apiKey={apiKey}
          onSubmitPrompt={handleSubmitPrompt}
          onSetModel={setModel}
          onSetPersona={setPersona}
          onSetExample={handleSetExample}
          setApiKey={setApiKey}
          onLoadMindMap={handleLoadMindMap}
        />
      )}
    </div>
  );
}

export default App;
export type { Example };
