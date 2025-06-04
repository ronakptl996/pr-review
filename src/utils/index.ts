import { GoogleGenAI } from "@google/genai";
import { useChromeStorage } from "../hooks/useChromeStorage";

const { getKeyValue } = useChromeStorage();

let geminiTokenPR: string;
let gitTokenPR: string;

getKeyValue("geminiApi_PR_Review").then((res) => (geminiTokenPR = res));
getKeyValue("gitToken_PR_Review").then((res) => (gitTokenPR = res));

export const generateCommitMessage = async (diff: string) => {
  try {
    const ai = new GoogleGenAI({
      apiKey: geminiTokenPR,
    });

    const prompt = `
      You're an AI developer assistant. Analyze the following git diff and generate a conventional commit message.

      Note: If any merge conflicts or overlapping changes are present in the diff, point them out and suggest how to resolve them.
  
      Git Diff:
      ${diff}
  
      Generate the response as a JSON object with the following structure:
        {
        "type": "<feat|fix|chore|refactor|test|docs>",
        "summary": "<short summary>",
        "details": "<bullet points or conflict resolution details>"
        }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: "Generate the Commit message.",
      config: { systemInstruction: prompt },
    });

    const match =
      response.text?.match(/```json\s*([\s\S]*?)```/i) ||
      response.text?.match(/```([\s\S]*?)```/i);

    let jsonString = match ? match[1] : response.text;

    if (!jsonString) {
      throw new Error("No data found in the response");
    }

    return JSON.parse(jsonString);
  } catch (error) {
    throw error;
  }
};

export const getBranchDiff = async (
  baseOwner: string,
  baseRepo: string,
  baseBranch: string,
  headOwner: string,
  headBranch: string
) => {
  const url = `https://api.github.com/repos/${baseOwner}/${baseRepo}/compare/${baseBranch}...${headOwner}:${headBranch}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `token ${gitTokenPR}`,
      Accept: "application/vnd.github.v3.diff",
    },
  });

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`
    );
  }

  return response.text();
};
