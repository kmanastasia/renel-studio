export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.message || "").trim();

    if (!name || !email || !message) {
      return json({ error: "Missing fields" }, 400);
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Renel Studio <form@renel-studio.com>",
        to: ["renelstudio.info@gmail.com"],
        reply_to: email,
        subject: `[お問い合わせ] ${name} 様より`,
        html: `
          <p><strong>お名前:</strong> ${esc(name)}</p>
          <p><strong>返信先:</strong> ${esc(email)}</p>
          <p><strong>メッセージ:</strong><br>${esc(message).replace(/\n/g, "<br>")}</p>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return json({ error: "Failed to send" }, 500);
    }

    return json({ success: true });
  } catch (e) {
    console.error(e);
    return json({ error: e.message }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function esc(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
