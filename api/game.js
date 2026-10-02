const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyckCe1yrtVeS0PJbkUWg8JgelkKxgzECslmJ6xZ6Th66V-1aVOx2OCulWDWeh8fG-W/exec";

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed."
    });
  }

  try {
    const payload =
      typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body || {});

    console.log("Forwarding request to Apps Script:", payload);

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: payload,
      redirect: "follow"
    });

    const text = await response.text();

    console.log("Apps Script status:", response.status);
    console.log("Apps Script response:", text);

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        message: "Game server returned an error.",
        status: response.status,
        response: text
      });
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch (error) {
      return res.status(502).json({
        success: false,
        message: "Invalid response received from game server.",
        raw: text
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("Game API proxy error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to connect to the game server.",
      error: error.message
    });
  }
}