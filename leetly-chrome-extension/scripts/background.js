importScripts('../config.js');

chrome.tabs.onUpdated.addListener((tabId, tab) => {
    if (tab.url && tab.url.includes('leetcode.com') && tab.url.includes('/submissions/')) {
        const urlParts = tab.url.split('/');
        const urlParameters = new URLSearchParams(tab.url.split('?')[1]);
        const name = urlParts[urlParts.length - 4];
        const date = urlParameters.get("envId");

        chrome.tabs.sendMessage(tabId, { type: "submission", name: name, date: date }, (response) => {
            console.log('Message sent to content script');
            console.log("Response from content script: ", response);
        });
    }
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "github-auth") {
        const clientId = "Ov23liIOTLxZBviGZ6l3";
        const redirectUri = chrome.identity.getRedirectURL();
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo`;

        console.log("Redirecting to GitHub OAuth:", authUrl);

        chrome.identity.launchWebAuthFlow({
            url: authUrl,
            interactive: true
        }, async (redirectUrl) => {
            if (chrome.runtime.lastError || !redirectUrl) {
                sendResponse({ error: chrome.runtime.lastError });
                return;
            }

            const url = new URL(redirectUrl);
            const code = url.searchParams.get("code");

            if (!code) {
                console.error("No code received from GitHub OAuth");
                sendResponse({ status: "error", message: "No code received" });
                return;
            }

            const response = await fetch(API_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code })
            })

            if (!response.ok) {
                const text = await response.text(); // handle plain text error
                console.error("Server error response:", text);
                sendResponse({ error: `Server responded with ${response.status}: ${text}` });
                return;
            }

            const { access_token } = await response.json();

            chrome.storage.local.set({ githubToken: access_token }, () => {
                console.log("GitHub token stored in local storage.");
            });
            sendResponse({ accessToken: access_token })
        });
        return true;
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "create-repo") {
        const { repoName } = request;

        chrome.storage.local.get("githubToken", async ({ githubToken }) => {
            if (!githubToken) {
                sendResponse({ error: "Not authenticated with GitHub." });
                return;
            }
            const response = await fetch("https://api.github.com/user/repos", {
                method: "POST",
                headers: {
                    "Authorization": `token ${githubToken}`,
                    "Accept": "application/vnd.github+json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: repoName,
                    description: "Auto-uploaded LeetCode solutions",
                    private: true
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.full_name) {
                        chrome.storage.local.set({ githubRepo: data.full_name }, () => {
                            sendResponse({ status: "success", repo: data.full_name });
                        });
                    } else {
                        sendResponse({ status: "error", message: data.message || "Failed to create repo" });
                    }
                })
                .catch(err => {
                    sendResponse({ status: "error", message: err.message });
                });

            return true; // keep response channel open
        });

        return true; // keep sendResponse open
    }
});