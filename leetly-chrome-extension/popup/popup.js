document.getElementById("status").textContent = "Click 'Connect' to authenticate with GitHub.";

chrome.storage.local.get("githubToken", ({ githubToken }) => {
  if (githubToken) {
    document.getElementById("connect").style.display = "none";
    document.getElementById("status").textContent = "Connected!";
  } else {
    document.getElementById("status").textContent = "Not connected";
  }
});

document.getElementById("connect").addEventListener("click", async () => {
    console.log("Connecting to GitHub...");
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

document.getElementById("create-repo").addEventListener("click", async () => {
    const repoName = document.getElementById("repo-name").value.trim();
    if (!repoName) {
        document.getElementById("status").textContent = "Please enter a repository name.";
        return;
    }

    chrome.runtime.sendMessage({ type: "create-repo", repoName }, async (response) => {
        if (response.error) {
            document.getElementById("status").textContent = `Error: ${response?.message || "Unknown error"}`;
            return;
        }

        if (response.success) {
            document.getElementById("status").textContent = `Repository '${repoName}' created successfully!`;
        } else {
            alert("Failed to create repository. Please try again.");
        }
    });
});