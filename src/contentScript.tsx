import { createRoot } from "react-dom/client";
import { injectReactRoot } from "./injectReactRoot";
import App from "./App";

function setCommitMessage(message: any) {
  const selector = "#pull_request_title"; // fallback selector
  const bodyId = "#pull_request_body";
  const input = document.querySelector<HTMLTextAreaElement>(selector);
  const bodySelector = document.querySelector<HTMLTextAreaElement>(bodyId);

  if (input) {
    input.value = `${message.type}: ${message.summary}`;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    console.log("✅ Commit message set.");
  }

  if (bodySelector) {
    console.log("INSIDE BODY >>>>>");
    const summary = message.details.map((text: string) => `- ${text} \n`);
    console.log("Summary >>>", summary);
    bodySelector.value = summary;
  }
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "SET_COMMIT_MESSAGE") {
    setCommitMessage(msg.payload);
    console.log("RECEIVE MSG >>>", msg.payload);
  }
});

const rootContainer = injectReactRoot();
const root = createRoot(rootContainer);
root.render(<App />);
