import { useState, Dispatch, SetStateAction, useEffect, useMemo } from "react";
import "./index.css";
import {
  PaperAirplaneIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import classNames from "classnames";
import TextareaAutosize from "react-textarea-autosize";
import { QATree } from "./types";
import { PERSONAS } from "./personas";
import { useQuery } from "@tanstack/react-query";
import { getFingerprint } from "./main";
import { SERVER_HOST } from "./constants";
import { MODELS } from "./models";
import Dropdown from "./Dropdown";
import { PlayCircleIcon } from "@heroicons/react/24/outline";
import { APIInfoModal, APIKeyModal } from "./APIKeyModal";
import { Link } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Sidebar } from "./CollapsibleSidebar";
import { useAppStore } from "./store/appStore";
import { useShallow } from "zustand/react/shallow";

export type Example = {
  persona: string;
  model: string;
  tree: QATree;
};

function StartPage(props: {
  onSubmitPrompt: (prompt: string) => void;
  onSetExample: (example: Example) => void;
}) {
  console.log("function StartPage started");
  const { model: modelStoreKey, persona, setModel, setPersona } = useAppStore(
    useShallow((state) => ({
      model: state.model,
      persona: state.persona,
      setModel: state.setModel,
      setPersona: state.setPersona,
    }))
  );

  useEffect(() => {
    if (persona === null) {
      const defaultPersonaKey = Object.keys(PERSONAS)[0];
      setPersona(PERSONAS[defaultPersonaKey]);
      console.log("StartPage: Initialized persona in store to default:", defaultPersonaKey);
    }
  }, [persona, setPersona]);

  const [query, setQuery] = useState("");
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const promptsRemainingQuery = useQuery({
    queryKey: ["promptsRemaining", modelStoreKey],
    queryFn: async () => {
      const result = await fetch(
        `${SERVER_HOST}/api/prompts-remaining?model=${modelStoreKey}&fp=${await getFingerprint()}`
      );
      return result.json();
    },
  });

  const promptsRemaining = useMemo(() => {
    if (promptsRemainingQuery.isLoading) return "...";
    if (promptsRemainingQuery.error) return "?!";
    return promptsRemainingQuery.data?.remaining ?? "?";
  }, [promptsRemainingQuery.isLoading, promptsRemainingQuery.error, promptsRemainingQuery.data]);

  const disableEverything = promptsRemaining === 0;

  const examplesQuery = useQuery({
    queryKey: ["examples"],
    queryFn: async () => {
      const result = await fetch(`${SERVER_HOST}/api/examples`);
      return result.json();
    },
  });
  const examples: Example[] = examplesQuery.isLoading ? [] : examplesQuery.data ?? [];

  async function submitPrompt() {
    console.log("function submitPrompt started");
    if (!persona) {
      console.error("Cannot submit prompt: Persona is not selected in the store.");
      return;
    }
    props.onSubmitPrompt(query);
    fetch(
      `${SERVER_HOST}/api/use-prompt?model=${modelStoreKey}&fp=${await getFingerprint()}`
    );

    try {
      const docRef = await addDoc(collection(db, "prompts"), {
        userId: await getFingerprint(),
        model: modelStoreKey,
        persona: persona.name,
        prompt: query,
        createdAt: new Date(),
        href: window.location.href,
        usingPersonalApiKey: false,
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
    console.log("function submitPrompt finished");
  }

  const [randomQuestionLoading, setRandomQuestionLoading] = useState(false);

  const currentPersonaKey = useMemo(() => {
    if (!persona) return 'researcher';
    return Object.keys(PERSONAS).find(key => PERSONAS[key] === persona) || 'researcher';
  }, [persona]);

  const currentPersonaObject = useMemo(() => persona ?? PERSONAS[Object.keys(PERSONAS)[0]], [persona]);

  return (
    <>
      <div className="m-4">
        <div className="flex justify-end items-center gap-4 mr-8 space-x-4">
          <Sidebar
            toggleSidebar={() => {
              setSidebarOpen(!isSidebarOpen);
            }}
            isOpen={isSidebarOpen}
            persona={currentPersonaKey}
            onSetPersona={(key) => setPersona(PERSONAS[key])}
            model={modelStoreKey}
            onSetModel={setModel}
          />
          <div className="flex items-center gap-4 flex-wrap">
            <div
              className="flex items-center space-x-1 cursor-pointer opacity-80 hover:text-gray-100"
              onClick={() => setIsInfoModalOpen(true)}
            >
              <div
                className={classNames(
                  "border-b border-dashed border-gray-300 text-sm text-gray-300 shrink-0",
                  {
                    "text-white rounded px-2 py-1 border-none bg-red-700 hover:bg-red-800":
                      disableEverything,
                  }
                )}
              >
                {promptsRemaining} prompt{promptsRemaining === 1 ? "" : "s"} left
              </div>
              <InformationCircleIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div>
            <Link
              className="text-sm text-white/70 mt-1 hover:text-white/80"
              to="/about"
            >
              About
            </Link>
          </div>
        </div>
        <APIInfoModal
          open={isInfoModalOpen}
          onClose={() => {
            setIsInfoModalOpen(false);
          }}
          setApiKeyModalOpen={() => {
            setIsApiKeyModalOpen(true);
          }}
        />
        <APIKeyModal
          open={isApiKeyModalOpen}
          onClose={() => {
            setIsApiKeyModalOpen(false);
          }}
        />
      </div>
      <div className="w-[450px] max-w-full mx-auto flex flex-col mt-40 px-4 fs-unmask">
        <div
          className={classNames("fs-unmask", {
            "opacity-30 cursor-not-allowed": disableEverything,
          })}
        >
          <div
            className={classNames("fs-unmask", {
              "pointer-events-none": disableEverything,
            })}
          >
            <div className="mb-4 fs-unmask">
              What would you like to understand?
            </div>
            <div className="flex space-x-2 items-center mb-4 fs-unmask">
              <TextareaAutosize
                disabled={disableEverything}
                className="fs-unmask w-[400px] text-2xl outline-none bg-transparent border-b border-white/40 focus:border-white overflow-hidden shrink"
                placeholder="Why..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !disableEverything && query) {
                    submitPrompt();
                  }
                }}
              />
              <PaperAirplaneIcon
                className={classNames("w-5 h-5 shrink-0", {
                  "opacity-30": !query || disableEverything,
                  "cursor-pointer hover:text-white/80": query && !disableEverything,
                })}
                onClick={async () => {
                  if (query && !disableEverything) {
                    submitPrompt();
                  }
                }}
              />
            </div>
            <div className={classNames("flex space-x-4 items-center group", {
                "cursor-pointer": !disableEverything,
                "cursor-not-allowed": disableEverything,
            })}>
              <img
                src="https://cdn-icons-png.flaticon.com/512/3004/3004157.png"
                className={classNames(
                  "w-6 h-6 invert opacity-70 group-hover:opacity-80",
                  {
                    "animate-pulse": randomQuestionLoading,
                  }
                )}
                alt="Suggest random question icon"
              />
              <div
                className={classNames("text-sm opacity-70", {
                    "group-hover:opacity-80": !disableEverything,
                })}
                onClick={async () => {
                  if (disableEverything) return;
                  setQuery("");
                  setRandomQuestionLoading(true);

                  const modelInfo = MODELS[modelStoreKey];
                  const actualModelKey = modelInfo ? modelInfo.key : modelStoreKey;
                  if (!modelInfo) {
                      console.warn(`Model key "${modelStoreKey}" not found in MODELS dictionary. Sending raw key.`);
                  }

                  try {
                      await window.openai(
                        currentPersonaObject.promptForRandomQuestion,
                        {
                          model: actualModelKey,
                          temperature: 1,
                          nodeId: "random-question-node",
                          onChunk: (chunk) => {
                            setQuery((old) => old + chunk);
                          },
                        }
                      );
                  } catch (error) {
                      console.error("Failed to get random question:", error);
                  }
                  setRandomQuestionLoading(false);
                }}
              >
                Suggest random question
              </div>
            </div>
          </div>
        </div>
        <div className="mt-32 text-gray-300 mb-16">
          <div className="mb-4">Play example runs</div>
          {examples
            .filter((ex) => ex.persona === currentPersonaKey)
            .map((example, i) => {
              return (
                <div
                  key={i}
                  className="mb-4 flex items-center space-x-2 text-white/50 hover:border-gray-300 hover:text-gray-300 cursor-pointer"
                  onClick={() => {
                    props.onSetExample(example);
                  }}
                >
                  <PlayCircleIcon className="w-5 h-5 shrink-0" />
                  <div>{example.tree["q-0"]?.question || example.tree["0"]?.question || "Example"}</div>
                </div>
              );
            })}
        </div>
      </div>
      <div
        id="backdoor"
        className="left-0 bottom-0 w-6 h-6 fixed"
        onClick={async () => {
          try {
            const docRef = await addDoc(collection(db, "backdoorHits"), {
              userId: await getFingerprint(),
              model: modelStoreKey,
              persona: currentPersonaKey,
              prompt: query,
              createdAt: new Date(),
              href: window.location.href,
              usingPersonalApiKey: false,
            });
            console.log("Document written with ID: ", docRef.id);
          } catch (e) {
            console.error("Error adding document: ", e);
          }
          fetch(
            `${SERVER_HOST}/api/moar-prompts?model=${modelStoreKey}&fp=${await getFingerprint()}`
          );
        }}
      />
    </>
  );
  console.log("function StartPage finished");
}

export default StartPage;
