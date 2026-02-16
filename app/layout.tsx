import "./globals.css";
import Link from "next/link";
import { cookies } from "next/headers";
import LogoutButton from "@/components/layout/LogoutButton";




export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = (await cookies()).get("auth_token")?.value;
  const isAuthenticated = Boolean(token);

  return (
    <html lang="en">
      <body className="min-h-screen">
        {isAuthenticated ? (
          <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
            <header className="border-b border-slate-200 bg-white">
              <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-8">
                <Link href="/" className="text-lg font-black tracking-tight text-slate-900">
                  StayScape
                </Link>
                <nav className="flex items-center gap-3">
                  <Link
                    href="/"
                    className="rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Home
                  </Link>
                  <Link
                    href="/dashboard"
                    className="rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Dashboard
                  </Link>
                  <LogoutButton />
                </nav>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto">{children}</main>

            <footer className="border-t border-slate-200 bg-white">
              <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 text-xs text-slate-600 md:px-8">
                <p>(c) 2026 StayScape</p>
                <p>Secure home rental platform</p>
              </div>
            </footer>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
