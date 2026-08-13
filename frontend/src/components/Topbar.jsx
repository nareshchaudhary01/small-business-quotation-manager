import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const pages = [
  { path: '/', label: 'Dashboard' },
  { path: '/customers', label: 'Customers' },
  { path: '/products', label: 'Products' },
  { path: '/quotations', label: 'Quotations' },
  { path: '/orders', label: 'Orders' },
];

const Topbar = ({ onLogout, token }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 text-slate-100 sm:px-6 lg:px-8">
        <div>
          <Link to="/" className="text-2xl font-semibold tracking-tight text-white">
            <span className="text-cyan-300">Biz</span>Quote
          </Link>
          <p className="text-sm text-slate-400">Smart quotations for every device.</p>
        </div>

        {token ? (
          <>
            <button
              type="button"
              className="mr-2 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/80 text-slate-200 transition md:hidden"
              onClick={() => setMobileOpen((current) => !current)}
              aria-label="Toggle navigation"
            >
              <span className="text-xl">☰</span>
            </button>

            <nav className="hidden items-center gap-3 md:flex">
              {pages.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={
                    location.pathname === item.path
                      ? 'rounded-full px-4 py-2 text-sm transition bg-slate-900 text-white shadow-lg'
                      : 'rounded-full px-4 py-2 text-sm transition text-slate-300 hover:bg-slate-900/80 hover:text-white'
                  }>
                  {item.label}
                </Link>
              ))}
              <button
                onClick={onLogout}
                className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
              >
                Sign out
              </button>
            </nav>
          </>
        ) : null}
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-slate-950/95 px-4 py-4 md:hidden">
          <nav className="space-y-3">
            {pages.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={
                  location.pathname === item.path
                    ? 'block rounded-2xl px-4 py-3 text-sm transition bg-slate-900 text-white'
                    : 'block rounded-2xl px-4 py-3 text-sm transition text-slate-300 hover:bg-slate-900/80 hover:text-white'
                }>
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={onLogout}
              className="w-full rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
            >
              Sign out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Topbar;
