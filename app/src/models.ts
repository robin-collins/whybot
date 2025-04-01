export interface Model {
    name: string;
    key: string;
    description: string;
}

export const MODELS: { [key: string]: Model } = {
    "openai/gpt-4o-mini": {
        name: "gpt-4o-mini",
        key: "gpt-4o-mini",
        description: "Fast and semi-smart",
    },
    "openai/gpt-4o": {
        name: "gpt-4o",
        key: "gpt-4o",
        description: "Slow but very smart",
    },
};
