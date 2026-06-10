import { prisma } from "@/lib/prisma";

/**
 * Outbound email via the Resend REST API (no SDK needed).
 * Configure in Configuración → Canales: API key + remitente.
 */
export async function sendEmail(
  to: string,
  subject: string,
  text: string
): Promise<{ externalId: string }> {
  const settings = await prisma.clubSettings.findUnique({
    where: { id: "default" },
    select: { resendApiKey: true, emailFromAddress: true, emailFromName: true, clubName: true },
  });

  if (!settings?.resendApiKey || !settings?.emailFromAddress) {
    throw new Error(
      "Email no configurado. Ve a Configuración → Canales para añadir la API key de Resend y el remitente."
    );
  }

  const fromName = settings.emailFromName || settings.clubName || "Club de Golf";
  const html = text
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${fromName} <${settings.emailFromAddress}>`,
      to: [to],
      subject,
      text,
      html,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || `Error de email (${res.status})`);
  }
  return { externalId: data.id || "" };
}
