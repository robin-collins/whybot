declare global {
  interface Window {
    openai: (
      prompt: string,
      opts: {
        apiKey: string;
        model: string;
        temperature: number;
        nodeId?: string;
        onChunk: (chunk: string) => void;
      }
    ) => Promise<void> & { cleanup?: () => void };
  }
}

export {};
