export interface Model {
  name: string;
  key: string;
  description: string;
}

export const MODELS: { [key: string]: Model } = {
  "openai/gpt-4.1-mini": {
    name: "gpt-4.1-mini",
    key: "gpt-4.1-mini",
    description: "Fast and semi-smart",
  },
  "openai/gpt-4.1": {
    name: "gpt-4.1",
    key: "gpt-4.1",
    description: "Slow but very smart",
  },
};
