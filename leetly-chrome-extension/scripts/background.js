// background script
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

            const response = await fetch("PLACEHOLDER", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code })
            })
            
            const { access_token } = await response.json();
            sendResponse({ accessToken: access_token})
        });
        return true;
    }
});
