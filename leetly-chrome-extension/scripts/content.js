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
            const fileName = `${problemTitle.replace(/[^a-zA-Z0-9]/g, "_")}.py`;

            const url = `https://github.com/${githubRepo}/contents/${fileName}`;

            const body = {
                message: `Add solution for ${problemTitle}`,
                content: btoa(code),
            }
        }
    });
})();