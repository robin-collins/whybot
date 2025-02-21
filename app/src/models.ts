export interface Model {
    name: string;
    key: string;
    description: string;
}

export const MODELS: { [key: string]: Model } = {
    "openai/gpt-4o-mini": {
        name: "GPT-4o-mini",
        key: "gpt-4o-mini",
        description: "Fast and smart",
    },
    "openai/o3-mini": {
        name: "O3-mini",
        key: "o3-mini",
        description: "Reasoning model",
    },
};
