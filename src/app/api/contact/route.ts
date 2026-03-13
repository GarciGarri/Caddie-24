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

    // Send via Web3Forms (free, no signup required for basic use)
    // Fallback: log the contact request
    const targetEmail = "omkagency@gmail.com";

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: process.env.WEB3FORMS_KEY || "",
          subject: `Nueva solicitud de demo - ${club}`,
          from_name: "Caddie 24",
          to: targetEmail,
          name,
          club,
          email,
          phone: phone || "No proporcionado",
          message: `Nueva solicitud de demo de Caddie 24:\n\nNombre: ${name}\nClub: ${club}\nEmail: ${email}\nTeléfono: ${phone || "No proporcionado"}`,
        }),
      });

      if (response.ok) {
        return NextResponse.json({ success: true });
      }
    } catch {
      // Web3Forms not configured — continue to fallback
    }

    // Fallback: log to console (visible in Vercel logs)
    console.log("=== NUEVA SOLICITUD DE DEMO ===");
    console.log(`Nombre: ${name}`);
    console.log(`Club: ${club}`);
    console.log(`Email: ${email}`);
    console.log(`Teléfono: ${phone || "No proporcionado"}`);
    console.log("================================");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
