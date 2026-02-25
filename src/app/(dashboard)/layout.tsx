export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 border-r bg-sidebar lg:block">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-lg font-bold text-sidebar-primary">Caddie 24</h1>
        </div>
        <nav className="space-y-1 p-4">
          <a
            href="/dashboard"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
          >
            Dashboard
          </a>
          <a
            href="/players"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
          >
            Jugadores
          </a>
          <a
            href="/inbox"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
          >
            Bandeja de Entrada
          </a>
          <a
            href="/campaigns"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
          >
            Campañas
          </a>
          <a
            href="/settings"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
          >
            Configuración
          </a>
        </nav>
      </aside>
      <main className="flex-1">
        <header className="flex h-16 items-center justify-between border-b px-6">
          <div className="text-sm text-muted-foreground">
            CRM Golf
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
