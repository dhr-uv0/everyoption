"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { createClient } from "@/lib/supabase/client";

interface NavbarProps {
  userEmail?: string | null;
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/learn", label: "Learn" },
];

export function Navbar({ userEmail }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-[var(--border-color)] backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center gap-8">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="font-serif font-bold text-[17px] text-[var(--text-primary)] shrink-0"
        >
          EveryOption
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1 flex-1">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "text-[var(--text-primary)] bg-surface"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-surface"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          <ThemeToggle />

          {userEmail && (
            <span className="text-xs text-[var(--text-muted)] hidden sm:block">
              {userEmail}
            </span>
          )}

          <button
            onClick={handleSignOut}
            className="text-xs font-semibold text-[var(--text-secondary)] hover:text-error transition-colors duration-150 px-2 py-1 rounded-sm"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
