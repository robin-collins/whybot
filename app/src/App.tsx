import { useState } from "react";
import "./index.css";
import GraphPage from "./GraphPage";
import { GraphPageExample } from "./GraphPageExample";
import StartPage, { Example } from "./StartPage";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import AboutPage from "./AboutPage";


function CoreStuff() {
  console.log("function CoreStuff started");
  const [seedQuery, setSeedQuery] = useState<string>();
  const [example, setExample] = useState<Example>();
  const [shouldAutoAnswerSeed, setShouldAutoAnswerSeed] = useState(false);

  console.log("function CoreStuff finished");
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
        shouldAutoAnswerSeed={shouldAutoAnswerSeed}
        clearAutoAnswerSeed={() => setShouldAutoAnswerSeed(false)}
      />
    </div>
  ) : (
    <div className="text-white bg-zinc-700 min-h-screen flex flex-col">
      <StartPage
        onSetExample={setExample}
        onSubmitPrompt={(query) => {
          setSeedQuery(query);
          setShouldAutoAnswerSeed(true);
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
  console.log("function App started");
  console.log("function App finished");
  return <RouterProvider router={router} />;
}

export default App;
