import { useEffect, useState } from 'react';
import { createCustomer, deleteCustomer, getCustomers, updateCustomer } from '../api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getCustomers();
      setCustomers(response.data);
    } catch (err) {
      setError('Unable to load customers.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      if (editingId) {
        await updateCustomer(editingId, formData);
      } else {
        await createCustomer(formData);
      }
      setFormData({ name: '', email: '', phone: '', address: '' });
      setEditingId('');
      fetchCustomers();
    } catch (err) {
      setError('Unable to save customer.');
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer.id);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this customer?');
    if (!confirmed) return;

    try {
      await deleteCustomer(id);
      setCustomers((current) => current.filter((customer) => customer.id !== id));
    } catch (err) {
      setError('Unable to delete customer.');
    }
  };

  return (
    <div className="space-y-8">
      <section className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Customers</h1>
            <p className="mt-2 text-slate-400">Add and manage company contacts for your quotations and orders.</p>
          </div>
          <div className="rounded-3xl bg-slate-900/80 px-5 py-4 text-slate-300">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Total customers</p>
            <p className="mt-2 text-3xl font-semibold text-white">{customers.length}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-white">{editingId ? 'Edit customer' : 'Add new customer'}</h2>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                Name
                <input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Email
                <input
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  type="email"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                Phone
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Address
                <input
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                />
              </label>
            </div>
            {error && <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button className="w-full rounded-2xl bg-cyan-500 px-5 py-3 text-white transition hover:bg-cyan-400 sm:w-auto">
                {editingId ? 'Save changes' : 'Create customer'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId('');
                    setFormData({ name: '', email: '', phone: '', address: '' });
                  }}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-5 py-3 text-slate-200 transition hover:border-slate-700 sm:w-auto"
                >
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Customer list</h2>
              <p className="mt-2 text-slate-400">Sort, edit, or remove records quickly.</p>
            </div>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-sm text-slate-300">Fast access</span>
          </div>

          {loading ? (
            <p className="mt-8 text-slate-400">Loading customers…</p>
          ) : (
            <div className="mt-6 space-y-4">
              {customers.length === 0 ? (
                <p className="rounded-3xl bg-slate-900/80 px-4 py-5 text-slate-400">No customers yet. Add one to get started.</p>
              ) : (
                <div className="space-y-4">
                  {customers.map((customer) => (
                    <div key={customer.id} className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 text-slate-200 shadow-sm">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-white">{customer.name}</p>
                          <p className="mt-1 text-sm text-slate-400">{customer.email || 'No email provided'}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm text-slate-300">
                          <span className="rounded-full bg-slate-800 px-3 py-1">{customer.phone || 'No phone'}</span>
                          <span className="rounded-full bg-slate-800 px-3 py-1">{customer.address || 'No address'}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(customer)}
                          className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-400"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(customer.id)}
                          className="rounded-2xl border border-rose-500 px-4 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Customers;
