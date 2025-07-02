const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const fetch = require("node-fetch");

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 min
const MAX_REQUESTS = 10; // Max requests

const rateLimitMap = new Map();

exports.exchangeToken = onRequest(async (req, res) => {

    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.status(204).send(""); // No Content
        return;
    }
    const ip = req.headers['x-forwarded-for'] || req.ip;
    const now = Date.now();

    const timestamp = rateLimitMap.get(ip) || [];
    const recent = timestamp.filter(time => now - time < RATE_LIMIT_WINDOW);
    recent.push(now);
    rateLimitMap.set(ip, recent);

    if (recent.length > MAX_REQUESTS) {
        return res.status(429).send("Too Many Requests: Rate limit exceeded");
    }

    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }

    const {code } = req.body;
    if (!code) {
        res.status(400).send("Bad Request: 'code' is required");
        return;
    }

    const clientId = process.env.GITHUB_CLIENTID;
    const clientSecret = process.env.GITHUB_CLIENTSECRET;

    logger.info("Received code:", code);
    logger.info(`Client ID: ${clientId}`);
    logger.info(`Client Secret length: ${clientSecret ? clientSecret.length : 'undefined'}`);

    
    try {
        const response = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded"},
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                code
            }),
        });

        const data = await response.json();
        console.log("Response from GitHub:", data);

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