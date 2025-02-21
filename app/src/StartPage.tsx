import { useState, Dispatch, SetStateAction, useEffect } from "react";
import { openai } from "./Flow";
import "./index.css";
import { PaperAirplaneIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import TextareaAutosize from "react-textarea-autosize";
import { QATree } from "./GraphPage";
import { PERSONAS } from "./personas";
import { useQuery } from "@tanstack/react-query";
import { getFingerprint } from "./main";
import { SERVER_HOST } from "./constants";
import { MODELS } from "./models";
import Dropdown from "./Dropdown";
import { PlayCircleIcon } from "@heroicons/react/24/outline";
import { APIKeyModal, ApiKey } from "./APIKeyModal";
import { Link } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Sidebar } from "./CollapsibleSidebar";
import Loader from "./Loader";
import { getMindMaps, StoredMindMap } from "./util/storage";

export type Example = {
    persona: string;
    model: string;
    tree: QATree;
};

function StartPage(props: {
    model: string;
    persona: string;
    apiKey: ApiKey;
    onSubmitPrompt: (prompt: string) => void;
    onSetModel: (model: string) => void;
    onSetPersona: (persona: string) => void;
    onSetExample: (example: Example) => void;
    setApiKey: Dispatch<SetStateAction<ApiKey>>;
    onLoadMindMap: (map: StoredMindMap) => void;
}) {
    const [query, setQuery] = useState("");
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [randomQuestionLoading, setRandomQuestionLoading] = useState(false);
    const [randomButtonClicked, setRandomButtonClicked] = useState(false);
    const [savedMaps, setSavedMaps] = useState<StoredMindMap[]>([]);

    const examplesQuery = useQuery({
        queryKey: ["examples"],
        queryFn: async () => {
            const result = await fetch(`${SERVER_HOST}/api/examples`);
            return result.json();
        },
    });
    const examples: Example[] = examplesQuery.isLoading ? [] : examplesQuery.data;

    async function submitPrompt() {
        props.onSubmitPrompt(query);
        if (!props.apiKey.valid) {
            fetch(`${SERVER_HOST}/api/use-prompt?model=${props.model}&fp=${await getFingerprint()}`);
        }

        try {
            const docRef = await addDoc(collection(db, "prompts"), {
                userId: await getFingerprint(),
                model: props.model,
                persona: props.persona,
                prompt: query,
                createdAt: new Date(),
                href: window.location.href,
                usingPersonalApiKey: props.apiKey.valid,
            });
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    useEffect(() => {
        console.log("PROMPT:", query);
    }, [query]);

    useEffect(() => {
        setSavedMaps(getMindMaps());
    }, []);

    return (
        <>
            <div className="m-4">
                <div className="flex justify-end items-center gap-4 mr-8 space-x-4">
                    <Sidebar
                        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                        isOpen={isSidebarOpen}
                        persona={props.persona}
                        onSetPersona={props.onSetPersona}
                        model={props.model}
                        onSetModel={props.onSetModel}
                        onLoadMindMap={props.onLoadMindMap}
                    />
                    <div className="flex items-center gap-4 flex-wrap">
                        {props.apiKey.valid && (
                            <div
                                className="flex space-x-1 cursor-pointer opacity-80 hover:opacity-90"
                                onClick={() => setIsApiKeyModalOpen(true)}
                            >
                                <div className="border-b border-dashed border-gray-300 text-sm text-gray-300">
                                    Using personal API key
                                </div>
                                <InformationCircleIcon className="h-5 w-5 text-gray-400" />
                            </div>
                        )}
                    </div>
                    <div>
                        <Link className="text-sm text-white/70 mt-1 hover:text-white/80" to="/about">
                            About
                        </Link>
                    </div>
                </div>
                
                <APIKeyModal
                    open={isApiKeyModalOpen}
                    onClose={() => setIsApiKeyModalOpen(false)}
                    apiKey={props.apiKey}
                    setApiKey={props.setApiKey}
                />
            </div>
            <div className="w-[450px] max-w-full mx-auto flex flex-col mt-40 px-4 fs-unmask">
                <div className="mb-4 fs-unmask">What would you like to understand?</div>
                <div className="flex space-x-2 items-center mb-4 fs-unmask">
                    <TextareaAutosize
                        className="fs-unmask w-[400px] text-2xl outline-none bg-transparent border-b border-white/40 focus:border-white overflow-hidden shrink"
                        placeholder="Why..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                submitPrompt();
                            }
                        }}
                    />
                    <PaperAirplaneIcon
                        className={classNames("w-5 h-5 shrink-0", {
                            "opacity-30": !query,
                            "cursor-pointer": query,
                        })}
                        onClick={async () => {
                            if (query) {
                                submitPrompt();
                            }
                        }}
                    />
                </div>
                <div 
                    className={classNames(
                        "flex space-x-4 items-center group",
                        {
                            "cursor-pointer": !randomQuestionLoading,
                            "cursor-not-allowed opacity-50": randomQuestionLoading
                        }
                    )}
                    onClick={async () => {
                        if (randomQuestionLoading) return;
                        
                        setRandomButtonClicked(true);
                        setTimeout(() => setRandomButtonClicked(false), 200);
                        
                        setQuery("");
                        setRandomQuestionLoading(true);
                        try {
                            await openai(PERSONAS[props.persona].promptForRandomQuestion, {
                                model: "gpt-4o-mini",
                                apiKey: props.apiKey.key,
                                temperature: 1,
                                onChunk: (chunk) => {
                                    setQuery((old) => (old + chunk).trim());
                                },
                            });
                        } finally {
                            setRandomQuestionLoading(false);
                        }
                    }}
                >
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/3004/3004157.png"
                        className={classNames(
                            "w-6 h-6 invert",
                            {
                                "opacity-70 group-hover:opacity-80": !randomQuestionLoading,
                                "opacity-50": randomQuestionLoading,
                            }
                        )}
                    />
                    <div className="flex items-center gap-2">
                        <div 
                            className={classNames(
                                "text-sm",
                                {
                                    "opacity-70 group-hover:opacity-80": !randomQuestionLoading,
                                    "opacity-50": randomQuestionLoading,
                                    "text-blue-400": randomButtonClicked
                                }
                            )}
                        >
                            Suggest random question
                        </div>
                        {randomQuestionLoading && <Loader />}
                    </div>
                </div>
                <div className="mt-32 text-gray-300 mb-16">
                    <div className="mb-4">Play example runs</div>
                    {examples
                        .filter((ex) => ex.persona === props.persona)
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
                                    <div>{example.tree["0"].question}</div>
                                </div>
                            );
                        })}
                </div>
                <div className="mt-32 text-gray-300 mb-16">
                    <div className="mb-4">Your Mind Maps</div>
                    {savedMaps.map((map) => (
                        <div 
                            key={map.id}
                            className="mb-4 flex items-center space-x-2 text-white/50 hover:text-gray-300 cursor-pointer"
                            onClick={() => {
                                props.onLoadMindMap(map);
                            }}
                        >
                            <PlayCircleIcon className="w-5 h-5 shrink-0" />
                            <div>{map.name}</div>
                            <div className="text-sm opacity-50">
                                {new Date(map.date).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default StartPage;
