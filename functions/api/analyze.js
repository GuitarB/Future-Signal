export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const question = (body.question || "").trim();

    if (!question) {
      return new Response(
        JSON.stringify({ error: "Question is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const systemPrompt = `
You are the intelligence engine behind a futuristic product called Future Signal.

Your job is to analyze a user's question about their future, business, identity, money, reinvention, decisions, risks, or strategic direction.

Return only valid JSON with exactly these keys:
- title
- forecast
- opportunity
- risk
- nextMove
- strength

Rules:
- title: short, cinematic, 2 to 5 words
- forecast: 2 to 4 sentences
- opportunity: 2 to 4 sentences
- risk: 2 to 4 sentences
- nextMove: 1 to 3 sentences, highly actionable
- strength: integer from 18 to 96
- write in a sharp, futuristic, strategic tone
- do not use markdown
- do not wrap JSON in code fences
`;

    const userPrompt = `Analyze this question for Future Signal: "${question}"`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${context.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5.4",
        input: [
          {
            role: "system",
            content: [{ type: "input_text", text: systemPrompt }]
          },
          {
            role: "user",
            content: [{ type: "input_text", text: userPrompt }]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: "OpenAI request failed.",
          details: data
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const text =
      data.output_text ||
      data.output?.map(item =>
        item.content?.map(part => part.text || "").join("")
      ).join("") ||
      "";

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "Model returned non-JSON output.",
          raw: text
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Server error.",
        details: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}