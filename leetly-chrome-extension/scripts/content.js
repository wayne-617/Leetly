// leetcode.com script

(() => {
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, name, date } = obj;

        if (type === "submission") {
            console.log("Received submission data:", { name, date });
            response({ status: "success", message: `Received submission for ${name} on ${date}` });

            chrome.storage.local.get(["githubAccessToken", "githubRepo"], ({ githubAccessToken, githubRepo }) => {
                if (!githubAccessToken || !githubRepo) {
                    console.error("GitHub credentials not found.");
                    sendResponse({ status: "error", message: "GitHub not connected." });
                    return;
                }
            });
        }
    });
})();