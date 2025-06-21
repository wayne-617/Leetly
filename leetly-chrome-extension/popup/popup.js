document.getElementById("status").textContent = "Click 'Connect' to authenticate with GitHub.";

document.getElementById("connect").addEventListener("click", async () => {
    chrome.runtime.sendMessage({ type: "github-auth" }, async (response) => {
        if (response.error) {
            console.error("Error during GitHub authentication:", response.error);
            document.getElementById("status").textContent = "Authentication failed. Please try again.";
            return;
        }

        if (response.accessToken) {
            console.log("GitHub access token received:", response.accessToken);
            document.getElementById("status").textContent = "Connected to GitHub successfully!";
        } else {
            console.error("No access token received.");
            document.getElementById("status").textContent = "Failed to connect to GitHub.";
        }
    });
})
