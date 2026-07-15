// Serverless extraction proxy (Edge Function). Holds your Anthropic API key server-side.
export default async (request, context) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const mediaType = formData.get("mediaType");
    const isPdf = formData.get("isPdf") === "true";
    const prompt = formData.get("prompt");

    if (!file || !prompt) {
      return new Response(JSON.stringify({ error: "Missing file or prompt" }), { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64 = arrayBufferToBase64(buffer);

    const source = isPdf
      ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } }
      : { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } };

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": Netlify.env.get("ANTHROPIC_API_KEY"),
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        // Switch to "claude-haiku-4-5-20251001" for lower cost and faster runs.
        model: "claude-sonnet-5",
        max_tokens: 4096,
        messages: [{ role: "user", content: [source, { type: "text", text: prompt }] }],
      }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      return new Response(
        JSON.stringify({ error: data?.error?.message || "Extraction failed" }),
        { status: resp.status }
      );
    }

    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || "Server error" }), { status: 500 });
  }
};

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export const config = { path: "/api/extract" };
