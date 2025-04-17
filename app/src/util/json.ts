export function closePartialJson(jsonString: string): string {
  console.log("function closePartialJson started");
  let output = "";
  const bracketStack: string[] = [];

  for (let i = 0; i < jsonString.length; i++) {
    const currentChar = jsonString.charAt(i);
    const prevChar = jsonString.charAt(i - 1);

    if (currentChar === "{" || currentChar === "[") {
      bracketStack.push(currentChar);
    } else if (currentChar === "}" || currentChar === "]") {
      if (bracketStack.length === 0) {
        // Ignore invalid closing brackets
        continue;
      }

      const matchingOpeningBracket = bracketStack.pop();
      if (
        (currentChar === "}" && matchingOpeningBracket !== "{") ||
        (currentChar === "]" && matchingOpeningBracket !== "[")
      ) {
        // Ignore unmatched closing brackets
        continue;
      }
    } else if (currentChar === '"' && prevChar !== "\\") {
      const lastBracket = bracketStack[bracketStack.length - 1];
      if (lastBracket === '"') {
        bracketStack.pop();
      } else {
        bracketStack.push(currentChar);
      }
    } else if (currentChar === "," && i === jsonString.length - 1) {
      // Skip dangling commas
      continue;
    }

    output += currentChar;
  }

  while (bracketStack.length > 0) {
    const bracket = bracketStack.pop();
    if (bracket === "{") {
      output += "}";
    } else if (bracket === "[") {
      output += "]";
    } else if (bracket === '"') {
      output += '"';
    }
  }

  console.log("function closePartialJson finished");
  return output;
}

// Function to download data as JSON file
export function downloadDataAsJson(data: any, filename: string) {
  console.log("function downloadDataAsJson started");
  const json = JSON.stringify(data);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  console.log("function downloadDataAsJson finished");
}
