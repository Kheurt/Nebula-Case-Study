import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="text-2xl font-bold text-white">
              Nebula
            </Link>
            <p className="mt-4 text-sm leading-relaxed">
              Short, intensive professional immersions led by expert coaches.
              Build real-world skills through hands-on learning.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { label: 'X', href: '#' },
                { label: 'in', href: '#' },
                { label: 'gh', href: '#' },
              ].map((s) => (
                <span
                  key={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Platform
            </h3>
            <ul className="mt-4 space-y-3">
              {[
                { label: 'Browse Programs', href: '/programs' },
                { label: 'Register', href: '/register' },
                { label: 'Sign In', href: '/login' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Domains */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Domains
            </h3>
            <ul className="mt-4 space-y-3">
              {[
                { label: 'Software Engineering', domain: 'SOFTWARE' },
                { label: 'Data & BI', domain: 'DATA' },
                { label: 'Finance', domain: 'FINANCE' },
                { label: 'Marketing', domain: 'MARKETING' },
                { label: 'Consulting', domain: 'CONSULTING' },
              ].map((item) => (
                <li key={item.domain}>
                  <Link
                    href={`/programs?domain=${item.domain}`}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Newsletter
            </h3>
            <p className="mt-4 text-sm">
              Get notified about new programs and immersion opportunities.
            </p>
            <div className="mt-4 flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm">
          © 2026 Nebula Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
