export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    if (!env.PREMIUM_USERS) {
      return json(
        { error: "Missing PREMIUM_USERS KV binding." },
        500
      );
    }

    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();

    if (!email) {
      return json(
        { error: "Email is required." },
        400
      );
    }

    const raw = await env.PREMIUM_USERS.get(premiumEmailKey(email));

    if (!raw) {
      return json({
        premium: false,
        email,
        found: false
      });
    }

    let record;
    try {
      record = JSON.parse(raw);
    } catch {
      return json({
        premium: false,
        email,
        found: true,
        error: "Stored premium record is invalid."
      });
    }

    return json({
      premium: Boolean(record.premium),
      email,
      found: true,
      status: record.status || null,
      updatedAt: record.updatedAt || null,
      customerId: record.customerId || null,
      subscriptionId: record.subscriptionId || null
    });
  } catch (error) {
    return json(
      {
        error: "Premium check failed.",
        details: error instanceof Error ? error.message : String(error)
      },
      500
    );
  }
}

function premiumEmailKey(email) {
  return `premium:email:${String(email).trim().toLowerCase()}`;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json;charset=UTF-8"
    }
  });
}