// leetcode.com script

(() => {
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, code, problemTitle, codeLanguage, submissionDate } = obj;

        if (type === "submission") {
            console.log("Received submission data:", { code, problemTitle, codeLanguage, submissionDate });
            response({ status: "success", message: `Received submission for ${problemTitle} on ${submissionDate}` });

            chrome.storage.local.get(["githubAccessToken", "githubRepo"], ({ githubAccessToken, githubRepo }) => {
                if (!githubAccessToken || !githubRepo) {
                    console.error("GitHub credentials not found.");
                    response({ status: "error", message: "GitHub not connected." });
                    return;
                }
            });
        }
    });
})();