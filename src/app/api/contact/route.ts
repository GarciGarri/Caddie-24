import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, club, email, phone } = body;

    if (!name || !club || !email) {
      return NextResponse.json(
        { error: "Nombre, club y email son obligatorios" },
        { status: 400 }
      );
    }

    const accessKey = process.env.WEB3FORMS_KEY;

    if (!accessKey) {
      console.warn("WEB3FORMS_KEY not configured");
      return NextResponse.json({
        success: false,
        debug: "WEB3FORMS_KEY not set in environment",
      });
    }

    console.log("Sending to Web3Forms with key:", accessKey.slice(0, 8) + "...");

    const payload = {
      access_key: accessKey,
      subject: `Nueva solicitud de demo - ${club}`,
      from_name: "Caddie 24",
      name,
      club,
      email,
      phone: phone || "No proporcionado",
      message: `Nueva solicitud de demo de Caddie 24:\n\nNombre: ${name}\nClub: ${club}\nEmail: ${email}\nTeléfono: ${phone || "No proporcionado"}`,
    };

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    console.log("Web3Forms raw response:", response.status, text.slice(0, 500));

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({
        success: false,
        debug: `Web3Forms returned status ${response.status} with non-JSON response: ${text.slice(0, 200)}`,
      });
    }

    if (data.success) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({
      success: false,
      debug: data.message || JSON.stringify(data),
    });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { success: false, debug: String(err) },
      { status: 500 }
    );
  }
}
