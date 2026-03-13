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

    if (accessKey) {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `Nueva solicitud de demo - ${club}`,
          from_name: "Caddie 24",
          name,
          club,
          email,
          phone: phone || "No proporcionado",
          message: `Nueva solicitud de demo de Caddie 24:\n\nNombre: ${name}\nClub: ${club}\nEmail: ${email}\nTeléfono: ${phone || "No proporcionado"}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        return NextResponse.json({ success: true });
      }

      // Log error for debugging in Vercel logs
      console.error("Web3Forms error:", data);
    } else {
      console.warn("WEB3FORMS_KEY not configured");
    }

    // Fallback: log to console (visible in Vercel logs)
    console.log("=== NUEVA SOLICITUD DE DEMO ===");
    console.log(`Nombre: ${name}`);
    console.log(`Club: ${club}`);
    console.log(`Email: ${email}`);
    console.log(`Teléfono: ${phone || "No proporcionado"}`);
    console.log("================================");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
