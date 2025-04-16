import { useState } from "react";
import "./index.css";
import GraphPage from "./GraphPage";
import { GraphPageExample } from "./GraphPageExample";
import StartPage, { Example } from "./StartPage";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import AboutPage from "./AboutPage";

function CoreStuff() {
  const [seedQuery, setSeedQuery] = useState<string>();
  const [example, setExample] = useState<Example>();

  return example ? (
    <div className="text-white bg-zinc-700 h-screen w-screen fixed left-0 top-0">
      <GraphPageExample
        example={example}
        onExit={() => {
          setSeedQuery(undefined);
          setExample(undefined);
        }}
      />
    </div>
  ) : seedQuery ? (
    <div className="text-white bg-zinc-700 h-screen w-screen fixed left-0 top-0">
      <GraphPage
        onExit={() => setSeedQuery(undefined)}
        seedQuery={seedQuery}
      />
    </div>
  ) : (
    <div className="text-white bg-zinc-700 min-h-screen flex flex-col">
      <StartPage
        onSetExample={setExample}
        onSubmitPrompt={(query) => {
          setSeedQuery(query);
        }}
      />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <CoreStuff />,
  },
  {
    path: "/about",
    element: <AboutPage />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
