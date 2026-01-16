export default async function handler(req: any, res: any) {
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY on server" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();

    // 🔍 Debug in logs
    console.log("Gemini Raw Response:", JSON.stringify(data));

    // ✅ Safely extract text
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Analysis failed.";

    const groundingSources =
      data?.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) =>
          chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null
        )
        .filter(Boolean) || [];

    return res.status(200).json({
      text,
      groundingSources,
    });
  } catch (error) {
    console.error("Server Gemini Error:", error);
    return res.status(500).json({ error: "Gemini request failed" });
  }
}
