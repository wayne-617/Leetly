const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const fetch = require("node-fetch");

exports.exchangeToken = onRequest(async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }

    const {code } = req.body;
    if (!code) {
        res.status(400).send("Bad Request: 'code' is required");
        return;
    }

    const clientId = functions.config().github.clientId;
    const clientSecret = functions.config().github.clientSecret;

    try {
        const response = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: { "Accept": "application/json" },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                code
            }),
        });

        const data = await response.json();

        if (data.error) {
            logger.error("GitHub OAuth error:", data.error);
            res.status(400).send(`Error: ${data.error_description || data.error}`);
            return;
        }

        logger.info("Access token received:", data.access_token);
        res.json(data);
    } catch (error) {
        logger.error("Error exchanging token:", error);
        res.status(500).send("Internal Server Error");
    }
});