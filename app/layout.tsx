import "./globals.css";
import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import LogoutButton from "@/components/layout/LogoutButton";
import HeaderProfileUploader from "@/components/layout/HeaderProfileUploader";
import logoImage from "./logo.jpg";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StayScape — Premium house rentals",
  description:
    "Discover verified stays, trusted hosts, and honest guest reviews before you book your next trip.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = (await cookies()).get("auth_token")?.value;
  const isAuthenticated = Boolean(token);

  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-canvas font-sans text-ink antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-md">
            <div className="mx-auto w-full max-w-6xl px-5 md:px-8 flex h-[68px] items-center justify-between gap-4">
              <Link
                href="/"
                className="flex items-center gap-2.5"
                aria-label="StayScape home"
              >
                <Image
                  src={logoImage}
                  alt=""
                  className="h-8 w-8 rounded-lg object-cover"
                  priority
                />
                <span className="font-display font-semibold leading-[1.08] tracking-tight text-[1.3rem] text-ink">
                  StayScape
                </span>
              </Link>

              <nav className="flex items-center gap-1 sm:gap-2">
                {isAuthenticated ? (
                  <>
                    <Link href="/" className="items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent font-medium leading-none transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2 text-[0.8125rem] text-ink-soft hover:bg-sunken hover:text-ink hidden sm:inline-flex">
                      Home
                    </Link>
                    <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent font-medium leading-none transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2 text-[0.8125rem] text-ink-soft hover:bg-sunken hover:text-ink">
                      Dashboard
                    </Link>
                    <HeaderProfileUploader />
                    <LogoutButton />
                  </>
                ) : (
                  <>
                    <Link
                      href="/#stays"
                      className="items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent font-medium leading-none transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2 text-[0.8125rem] text-ink-soft hover:bg-sunken hover:text-ink hidden sm:inline-flex"
                    >
                      Browse stays
                    </Link>
                    <Link href="/auth/login" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent font-medium leading-none transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2 text-[0.8125rem] text-ink-soft hover:bg-sunken hover:text-ink">
                      Log in
                    </Link>
                    <Link href="/auth/signup" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent font-medium leading-none transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2 text-[0.8125rem] bg-accent text-white shadow-card hover:bg-accent-hover">
                      Sign up
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="mt-20 border-t border-line bg-surface">
            <div className="mx-auto w-full max-w-6xl px-5 md:px-8 py-14">
              <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
                <div>
                  <div className="flex items-center gap-2.5">
                    <Image
                      src={logoImage}
                      alt=""
                      className="h-8 w-8 rounded-lg object-cover"
                    />
                    <span className="font-display font-semibold leading-[1.08] tracking-tight text-[1.3rem] text-ink">
                      StayScape
                    </span>
                  </div>
                  <p className="mt-4 max-w-sm text-[0.95rem] leading-relaxed text-ink-soft">
                    Verified homes, transparent nightly pricing, and reviews
                    written only by guests who actually stayed.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <a
                    href="mailto:ctemesgen85@gmail.com"
                    className="rounded-2xl border border-line bg-surface shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-soft p-4"
                  >
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">
                      Email
                    </p>
                    <p className="mt-1.5 break-all text-sm font-medium text-ink">
                      ctemesgen85@gmail.com
                    </p>
                  </a>

                  <a href="tel:+251960416208" className="rounded-2xl border border-line bg-surface shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-soft p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">
                      Phone
                    </p>
                    <p className="mt-1.5 text-sm font-medium text-ink">
                      +251 960 416 208
                    </p>
                  </a>
                </div>
              </div>

              <hr className="h-px border-0 bg-line my-8" />

              <div className="flex flex-col gap-2 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
                <p>© 2026 StayScape</p>
                <p>Secure home rental platform</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
