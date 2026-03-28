const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

// Environment variables (set in Render)
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

let accessToken = null;

// 🔐 Get OAuth token from FatSecret
async function getAccessToken() {
  console.log("Getting new access token...");

  const response = await fetch("https://oauth.fatsecret.com/connect/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization":
        "Basic " +
        Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
    },
    body: "grant_type=client_credentials&scope=basic",
  });

  const data = await response.json();

  console.log("Token response:", data);

  if (!data.access_token) {
    throw new Error("Failed to get access token");
  }

  accessToken = data.access_token;
  return accessToken;
}

// 🍗 Food search endpoint
app.get("/api/food-search", async (req, res) => {
  const query = req.query.q;

  try {
    if (!accessToken) {
      await getAccessToken();
    }

    console.log("Using Access Token:", accessToken);

    const response = await fetch(
      "https://platform.fatsecret.com/rest/server.api",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          method: "foods.search",
          search_expression: query,
          format: "json",
        }),
      }
    );

    const data = await response.json();

    console.log("FatSecret response:", data);

    res.json(data);
  } catch (error) {
    console.error("FULL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
