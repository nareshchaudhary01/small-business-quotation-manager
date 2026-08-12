import { useEffect, useState } from 'react';
import { getCustomers, getOrders, getProducts, getQuotations } from '../api';

const metricCards = [
  { key: 'customers', label: 'Customers', accent: 'from-cyan-500 to-blue-500' },
  { key: 'products', label: 'Products', accent: 'from-violet-500 to-fuchsia-500' },
  { key: 'quotations', label: 'Quotations', accent: 'from-emerald-500 to-teal-500' },
  { key: 'orders', label: 'Orders', accent: 'from-rose-500 to-orange-500' },
];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ customers: 0, products: 0, quotations: 0, orders: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [customers, products, quotations, orders] = await Promise.all([
          getCustomers(),
          getProducts(),
          getQuotations(),
          getOrders(),
        ]);

        setStats({
          customers: customers.data.length,
          products: products.data.length,
          quotations: quotations.data.length,
          orders: orders.data.length,
        });
      } catch (err) {
        setError('Unable to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Welcome back</p>
            <h1 className="mt-2 text-4xl font-semibold text-white">Business manager dashboard</h1>
            <p className="mt-3 max-w-2xl text-slate-400">
              Keep results in view, stay organized, and turn quotations into orders faster.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-900/70 p-5 text-slate-300 shadow-inner">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Status</p>
            <p className="mt-2 text-2xl font-semibold text-white">Live preview</p>
            <p className="mt-1 text-sm text-slate-400">Responsive UI for all devices, ready for your business.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <div
            key={card.key}
            className={`card overflow-hidden border-2 border-white/5 bg-gradient-to-br ${card.accent} p-6 text-white shadow-soft`}>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-200/70">{card.label}</p>
            <p className="mt-6 text-5xl font-semibold">{loading ? '—' : stats[card.key]}</p>
            <p className="mt-3 text-slate-200/80">Strong growth and reliable management.</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="card p-6">
          <h2 className="text-xl font-semibold text-white">Why this matters</h2>
          <p className="mt-3 text-slate-300">A polished interface helps you manage customer relationships, product inventory, quotations, and orders without losing focus. This app works well on laptop, mobile, tablet, and even large screens.</p>
          <ul className="mt-5 space-y-3 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
              Simple navigation and clean forms.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Fast access to customers, products, quotations, and orders.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-fuchsia-400" />
              Designed for use from phone up to desktop and TV screens.
            </li>
          </ul>
        </article>
        <article className="card p-6">
          <h2 className="text-xl font-semibold text-white">Quick tips</h2>
          <div className="mt-4 space-y-4 text-slate-300">
            <div className="rounded-3xl bg-slate-900/80 p-4">
              <p className="font-medium text-white">Use real customer names</p>
              <p className="mt-2 text-sm text-slate-400">Better tracking means faster quotation follow-up.</p>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-4">
              <p className="font-medium text-white">Keep products consistent</p>
              <p className="mt-2 text-sm text-slate-400">Store standard prices so your quotations stay accurate.</p>
            </div>
          </div>
        </article>
      </section>

      {error && <p className="rounded-3xl bg-rose-500/10 px-4 py-4 text-sm text-rose-300">{error}</p>}
    </div>
  );
};

export default Dashboard;
