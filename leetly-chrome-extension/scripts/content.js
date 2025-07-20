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

            fetch(url, {
                method: "PUT",
                headers: {
                    "Authorization": `token ${githubAccessToken}`,
                    "Accept": "application/vnd.github+json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to upload file");
                }
                return response.json();
            })
            .then(data => {
                console.log("File uploaded successfully:", data);
                response({ status: "success", message: "File uploaded successfully." });
            })
            .catch(error => {
                console.error("Error uploading file:", error);
                response({ status: "error", message: "Error uploading file." });
            });
        }
    });
})();