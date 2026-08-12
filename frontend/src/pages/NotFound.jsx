import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-slate-950/80 p-10 text-center shadow-soft backdrop-blur-xl">
    <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">404</p>
    <h1 className="mt-4 text-4xl font-semibold text-white">Page not found</h1>
    <p className="mt-3 text-slate-400">The page you requested does not exist or has been moved.</p>
    <Link
      to="/"
      className="mt-8 inline-flex rounded-2xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400"
    >
      Back to dashboard
    </Link>
  </div>
);

export default NotFound;
