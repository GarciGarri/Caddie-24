export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-green-600 to-emerald-500" />
        <div className="relative z-10 text-center text-white px-12">
          <div className="text-6xl mb-6">⛳</div>
          <h1 className="text-4xl font-bold mb-4">Caddie 24</h1>
          <p className="text-lg text-green-100 max-w-md">
            CRM de Marketing y Comunicación para Campos de Golf con WhatsApp + IA
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/5 rounded-full" />
      </div>

      {/* Right panel - form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        {children}
      </div>
    </div>
  );
}
