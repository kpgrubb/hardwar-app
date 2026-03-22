import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SYSTEM_PROMPT = `You are an authoritative rules referee for HARDWAR, the 6mm sci-fi tactical miniatures wargame (Modiphius Entertainment, Kickstarter edition).

Active ruleset: {RULESET}

Instructions:
- Answer ONLY from your knowledge of the Hardwar rulebook.
- Cite every rule claim with (p.XX) referencing the approximate page number.
- If you are not confident about the answer, say so explicitly.
- For Quickplay mode: note where Core rules differ.
- Self-assess confidence: HIGH / MEDIUM / LOW at end of response.
- Be concise and precise. Players are mid-game.`;

export async function POST(request: Request) {
  // Verify auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { query, ruleset = "core", history = [] } = await request.json();

  const systemPrompt = SYSTEM_PROMPT.replace("{RULESET}", ruleset.toUpperCase());

  // Build conversation history
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
  for (const msg of history.slice(-6)) {
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    });
  }
  contents.push({ role: "user", parts: [{ text: query }] });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 2048,
      },
    });

    const answer = response.text || "No response generated.";

    // Extract citations
    const citations = [...new Set(answer.match(/\(p\.\d+\)/g) || [])];

    // Extract confidence
    let confidence = "MEDIUM";
    const last100 = answer.slice(-100);
    if (last100.includes("HIGH")) confidence = "HIGH";
    else if (last100.includes("LOW")) confidence = "LOW";

    return Response.json({
      answer,
      citations,
      confidence,
      chunks_used: [],
    });
  } catch (error) {
    console.error("Gemini error:", error);
    return Response.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
