const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

const ACCESS_TOKEN = "YOUR_ACCESS_TOKEN"; // we’ll fix this next

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/api/food-search", async (req, res) => {
  const query = req.query.q;

  try {
    const response = await fetch("https://platform.fatsecret.com/rest/server.api", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        method: "foods.search",
        search_expression: query,
        format: "json"
      })
    });

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch food data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
