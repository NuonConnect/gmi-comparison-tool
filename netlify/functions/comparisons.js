// netlify/functions/comparisons.js
import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const store = getStore("gmi-data");
  const KEY = "comparisons";

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Content-Type": "application/json"
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers });
  }

  try {
    // GET - Retrieve all comparisons
    if (req.method === "GET") {
      const data = await store.get(KEY, { type: "json" });
      return new Response(JSON.stringify(data || []), { status: 200, headers });
    }

    // POST - Save comparisons
    if (req.method === "POST") {
      const body = await req.json();
      await store.setJSON(KEY, body);
      return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    }

    // DELETE - Delete a specific comparison
    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");
      
      if (id) {
        const data = await store.get(KEY, { type: "json" }) || [];
        const filtered = data.filter(item => item.id !== parseInt(id) && item.id !== id);
        await store.setJSON(KEY, filtered);
        return new Response(JSON.stringify({ success: true }), { status: 200, headers });
      }
      return new Response(JSON.stringify({ error: "ID required" }), { status: 400, headers });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  } catch (error) {
    console.error("Comparisons API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
};