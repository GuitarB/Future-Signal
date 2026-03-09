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

    const possibleKeys = [
      premiumEmailKey(email),
      email
    ];

    let raw = null;
    let matchedKey = null;

    for (const key of possibleKeys) {
      raw = await env.PREMIUM_USERS.get(key);
      if (raw) {
        matchedKey = key;
        break;
      }
    }

    if (!raw) {
      return json({
        premium: false,
        email,
        found: false
      });
    }

    const normalized = normalizePremiumRecord(raw);

    return json({
      premium: normalized.premium,
      email,
      found: true,
      matchedKey,
      status: normalized.status,
      updatedAt: normalized.updatedAt,
      customerId: normalized.customerId,
      subscriptionId: normalized.subscriptionId
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

function normalizePremiumRecord(raw) {
  const value = String(raw).trim();

  if (!value) {
    return {
      premium: false,
      status: null,
      updatedAt: null,
      customerId: null,
      subscriptionId: null
    };
  }

  if (value.toLowerCase() === "active") {
    return {
      premium: true,
      status: "active",
      updatedAt: null,
      customerId: null,
      subscriptionId: null
    };
  }

  if (value.toLowerCase() === "premium") {
    return {
      premium: true,
      status: "active",
      updatedAt: null,
      customerId: null,
      subscriptionId: null
    };
  }

  try {
    const record = JSON.parse(value);

    return {
      premium: Boolean(record.premium || record.status === "active"),
      status: record.status || null,
      updatedAt: record.updatedAt || null,
      customerId: record.customerId || null,
      subscriptionId: record.subscriptionId || null
    };
  } catch {
    return {
      premium: false,
      status: "invalid_record",
      updatedAt: null,
      customerId: null,
      subscriptionId: null
    };
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json;charset=UTF-8"
    }
  });
}