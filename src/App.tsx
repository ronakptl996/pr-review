import { useEffect, useState } from "react";
import "./App.css";
import { generateCommitMessage, getBranchDiff } from "./utils";
import { useAuthContext } from "./context/authContext";

export type CommitMessage = {
  type: string;
  summary: string;
  details: string;
};

function App() {
  const [url, setUrl] = useState("");
  const [isValidCompare, setIsValidCompare] = useState(false);
  const [commitMessage, setCommitMessage] = useState<CommitMessage | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const storage = useChromeStorage();
  const {
    isOpen,
    geminiAPI,
    gitToken,
    setIsOpen,
    setGeminiAPI,
    setGitToken,
    handlerToken,
  } = useAuthContext();

  useEffect(() => {
    if (!chrome) return;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0]?.url || "";
      setUrl(currentUrl);

      const compareRegex =
        /^https:\/\/github\.com\/[^/]+\/[^/]+\/compare\/[^.]+\.{3}(?:[^:]+:[^/]+|[^/]+)$/;
      setIsValidCompare(compareRegex.test(currentUrl));
    });
  }, []);

  const handleGeneratePRReview = async () => {
    console.log("Generating PR review...");
    setLoading(true);
    setError(null);
    setCommitMessage(null);
    try {
      const match = url.match(
        /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/compare\/([^.]+)\.{3}(?:([^:]+):([^/]+)|([^/]+))$/
      );

      if (match) {
        const [
          _,
          baseOwner,
          baseRepo,
          baseBranch,
          headOwner,
          headBranch,
          simpleHeadBranch,
        ] = match;

        const finalHeadOwner = headOwner || baseOwner;
        const finalHeadBranch = headBranch || simpleHeadBranch;

        const diff = await getBranchDiff(
          baseOwner,
          baseRepo,
          baseBranch,
          finalHeadOwner,
          finalHeadBranch
        );

        const commitMessage = (await generateCommitMessage(
          diff
        )) as CommitMessage;

        console.log("commitMessage >>>", commitMessage);
        setCommitMessage(commitMessage);

        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, {
              type: "SET_COMMIT_MESSAGE",
              payload: commitMessage,
            });
          }
        });
      } else {
        setError("Invalid GitHub compare URL format.");
      }
    } catch (error: any) {
      console.error("Error generating PR review:", error);
      setError(`Failed to generate PR review: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full h-[600px] overflow-hidden shadow-2xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-4 border border-gray-200 dark:border-gray-700 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">🤖 PR Review Assistant</h2>
        {isValidCompare ? (
          <>
            {isOpen ? (
              <div className="w-[400px] m-auto mt-4 p-10 rounded-2xl border border-gray-700">
                <h1 className="text-xl text-gray-200 text-center font-bold">
                  Set the Token
                </h1>
                <p className="text-sm text-gray-300 text-center">
                  Setup your token and get started
                </p>
                <form onSubmit={handlerToken} className="mt-3">
                  <label htmlFor="gemini" className="text-gray-400">
                    Gemini API
                  </label>
                  <input
                    name="gemini"
                    type="text"
                    value={geminiAPI}
                    onChange={(e) => setGeminiAPI(e.target.value)}
                    className="p-2 mb-4 w-full border border-gray-700 outline-none rounded block"
                    placeholder="Enter Gemini API"
                  />
                  <label htmlFor="git" className="text-gray-400">
                    Git Token
                  </label>
                  <input
                    name="git"
                    type="text"
                    value={gitToken}
                    onChange={(e) => setGitToken(e.target.value)}
                    className="p-2 mb-4 w-full border border-gray-700 outline-none rounded block"
                    placeholder="Enter Git Token"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 cursor-pointer px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:from-gray-500 disabled:to-gray-600 disabled:hover:from-gray-500 disabled:hover:to-gray-600"
                    disabled={!gitToken || !geminiAPI}
                  >
                    Submit
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex flex-col space-y-4 relative">
                <button
                  onClick={() => setIsOpen(true)}
                  className="ml-auto p-2 rounded hover:bg-gray-600 text-gray-200 underline cursor-pointer"
                >
                  Set the token
                </button>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Current URL:
                  </p>
                  <p className="text-sm font-mono break-all">{url}</p>
                </div>

                <button
                  className="w-full py-3 px-4 bg-gradient-to-r disabled:bg-gray-300 disabled:text-gray-800 from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  onClick={handleGeneratePRReview}
                  disabled={loading}
                >
                  {loading ? "Generating..." : "✨ Generate PR Review"}
                </button>

                {error && (
                  <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-3 rounded-lg text-sm">
                    Error: {error}
                  </div>
                )}

                {commitMessage && (
                  <>
                    <div className="space-y-4 overflow-y-auto">
                      <section>
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          ✅ Commit Message
                        </h3>
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap">
                          {commitMessage?.type}: {commitMessage?.summary}
                          <br />
                        </div>
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1 mt-2">
                          📘 Summary
                        </h3>
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap">
                          {commitMessage?.details}
                        </div>
                      </section>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400 text-center">
              Please navigate to a GitHub compare page to generate a review
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
