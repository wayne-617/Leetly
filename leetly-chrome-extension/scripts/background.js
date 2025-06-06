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