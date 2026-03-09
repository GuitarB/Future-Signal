export async function onRequestPost(context) {
  try {
    const stripeSecretKey = context.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: "Missing STRIPE_SECRET_KEY secret." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const origin = new URL(context.request.url).origin;

    const body = new URLSearchParams({
      mode: "subscription",
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=cancel`,
      "line_items[0][price]": "price_1T8t20RUjGoXpqp2rs7JI5Ne",
      "line_items[0][quantity]": "1"
    });

    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    });

    const data = await stripeResponse.json();

    if (!stripeResponse.ok) {
      return new Response(JSON.stringify(data), {
        status: stripeResponse.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(
      JSON.stringify({ url: data.url }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to create checkout session.",
        details: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}