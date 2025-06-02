import { useEffect } from "react";

const ContentPage: React.FC = () => {
  useEffect(() => {
    console.log("Content script loaded");

    console.log("PR Reviewer content script loaded on:", window.location.href);

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("request >>>", request);
      console.log("sender >>>", sender);
      console.log("sendResponse >>>", sendResponse);
      if (request.action === "injectCommitMessage") {
        // Example: Inject the commit message into a specific area on the GitHub page
        // You'd need to find the appropriate selector on GitHub's PR page
        // const commentBox = document.querySelector('textarea[name="comment[body]"]');
        // if (commentBox) {
        //   commentBox.value = request.commitMessage;
        //   sendResponse({
        //     status: "success",
        //     message: "Commit message injected into comment box!",
        //   });
        // } else {
        //   addTextToBody("Could not find comment box to inject message.");
        //   sendResponse({ status: "error", message: "Comment box not found." });
        // }
      }
      // Return true to indicate that you want to send a response asynchronously
      return true;
    });
  }, []);

  return <div id="pr-reviewer-injected-ui-root"></div>;
};

export default ContentPage;
