export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    if (!env.STRIPE_WEBHOOK_SECRET) {
      return json(
        { error: "Missing STRIPE_WEBHOOK_SECRET secret." },
        500
      );
    }

    if (!env.PREMIUM_USERS) {
      return json(
        { error: "Missing PREMIUM_USERS KV binding." },
        500
      );
    }

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return json({ error: "Missing stripe-signature header." }, 400);
    }

    const rawBody = await request.text();

    const isValid = await verifyStripeSignature(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );

    if (!isValid) {
      return json({ error: "Invalid webhook signature." }, 400);
    }

    const event = JSON.parse(rawBody);
    const type = event.type;
    const data = event.data?.object || {};

    if (type === "checkout.session.completed") {
      await handleCheckoutCompleted(data, env);
    }

    if (type === "customer.subscription.created") {
      await handleSubscriptionUpdated(data, env, "active");
    }

    if (type === "customer.subscription.updated") {
      await handleSubscriptionUpdated(data, env, data.status || "updated");
    }

    if (type === "customer.subscription.deleted") {
      await handleSubscriptionDeleted(data, env);
    }

    return json({ received: true, type });
  } catch (error) {
    return json(
      {
        error: "Webhook processing failed.",
        details: error instanceof Error ? error.message : String(error)
      },
      500
    );
  }
}

async function handleCheckoutCompleted(session, env) {
  const customerId = session.customer || null;
  const subscriptionId = session.subscription || null;

  const email =
    session.customer_details?.email ||
    session.customer_email ||
    null;

  const record = {
    premium: true,
    source: "checkout.session.completed",
    email,
    customerId,
    subscriptionId,
    status: "active",
    updatedAt: new Date().toISOString()
  };

  if (email) {
    await env.PREMIUM_USERS.put(
      premiumEmailKey(email),
      JSON.stringify(record)
    );
  }

  if (customerId) {
    await env.PREMIUM_USERS.put(
      premiumCustomerKey(customerId),
      JSON.stringify(record)
    );
  }

  if (subscriptionId) {
    await env.PREMIUM_USERS.put(
      premiumSubscriptionKey(subscriptionId),
      JSON.stringify(record)
    );
  }
}

async function handleSubscriptionUpdated(subscription, env, status) {
  const customerId = subscription.customer || null;
  const subscriptionId = subscription.id || null;

  const record = {
    premium: status === "active" || status === "trialing",
    source: "customer.subscription.updated",
    customerId,
    subscriptionId,
    status,
    updatedAt: new Date().toISOString()
  };

  if (customerId) {
    const existingRaw = await env.PREMIUM_USERS.get(
      premiumCustomerKey(customerId)
    );

    if (existingRaw) {
      try {
        const existing = JSON.parse(existingRaw);
        if (existing.email) {
          record.email = existing.email;
          await env.PREMIUM_USERS.put(
            premiumEmailKey(existing.email),
            JSON.stringify(record)
          );
        }
      } catch {
        // ignore malformed existing record
      }
    }

    await env.PREMIUM_USERS.put(
      premiumCustomerKey(customerId),
      JSON.stringify(record)
    );
  }

  if (subscriptionId) {
    await env.PREMIUM_USERS.put(
      premiumSubscriptionKey(subscriptionId),
      JSON.stringify(record)
    );
  }
}

async function handleSubscriptionDeleted(subscription, env) {
  const customerId = subscription.customer || null;
  const subscriptionId = subscription.id || null;

  let email = null;

  if (customerId) {
    const existingRaw = await env.PREMIUM_USERS.get(
      premiumCustomerKey(customerId)
    );

    if (existingRaw) {
      try {
        const existing = JSON.parse(existingRaw);
        email = existing.email || null;
      } catch {
        // ignore malformed record
      }
    }
  }

  const record = {
    premium: false,
    source: "customer.subscription.deleted",
    email,
    customerId,
    subscriptionId,
    status: "canceled",
    updatedAt: new Date().toISOString()
  };

  if (email) {
    await env.PREMIUM_USERS.put(
      premiumEmailKey(email),
      JSON.stringify(record)
    );
  }

  if (customerId) {
    await env.PREMIUM_USERS.put(
      premiumCustomerKey(customerId),
      JSON.stringify(record)
    );
  }

  if (subscriptionId) {
    await env.PREMIUM_USERS.put(
      premiumSubscriptionKey(subscriptionId),
      JSON.stringify(record)
    );
  }
}

function premiumEmailKey(email) {
  return `premium:email:${String(email).trim().toLowerCase()}`;
}

function premiumCustomerKey(customerId) {
  return `premium:customer:${customerId}`;
}

function premiumSubscriptionKey(subscriptionId) {
  return `premium:subscription:${subscriptionId}`;
}

async function verifyStripeSignature(payload, signatureHeader, webhookSecret) {
  const parsed = parseStripeSignature(signatureHeader);
  const timestamp = parsed.t;
  const signatures = parsed.v1;

  if (!timestamp || !signatures.length) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = await hmacSha256Hex(webhookSecret, signedPayload);

  return signatures.some((sig) => safeEqual(sig, expected));
}

function parseStripeSignature(header) {
  const parts = header.split(",");
  const out = { t: null, v1: [] };

  for (const part of parts) {
    const [key, value] = part.split("=");
    if (!key || !value) continue;

    if (key === "t") {
      out.t = value;
    }

    if (key === "v1") {
      out.v1.push(value);
    }
  }

  return out;
}

async function hmacSha256Hex(secret, message) {
  const enc = new TextEncoder();

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    enc.encode(message)
  );

  return bufferToHex(signature);
}

function bufferToHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;

  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json;charset=UTF-8"
    }
  });
}