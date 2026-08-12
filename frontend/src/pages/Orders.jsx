import { useEffect, useState } from 'react';
import { createOrder, getCustomers, getOrders, getProducts, updateOrder } from '../api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    notes: '',
    discount: 0,
    tax: 0,
    items: [{ name: '', unit_price: 0, quantity: 1, total_price: 0 }],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [customerResponse, productResponse, ordersResponse] = await Promise.all([
        getCustomers(),
        getProducts(),
        getOrders(),
      ]);
      setCustomers(customerResponse.data);
      setProducts(productResponse.data);
      setOrders(ordersResponse.data);
    } catch (err) {
      setError('Unable to load orders, customers, or products.');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (index, itemChanges) => {
    setFormData((current) => {
      const newItems = [...current.items];
      newItems[index] = { ...newItems[index], ...itemChanges };
      if ('unit_price' in itemChanges || 'quantity' in itemChanges) {
        const item = newItems[index];
        newItems[index].total_price = Number((item.unit_price * item.quantity).toFixed(2));
      }
      return { ...current, items: newItems };
    });
  };

  const addItem = () => {
    setFormData((current) => ({
      ...current,
      items: [...current.items, { name: '', unit_price: 0, quantity: 1, total_price: 0 }],
    }));
  };

  const removeItem = (index) => {
    setFormData((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const totalAmount = formData.items.reduce((sum, item) => sum + Number(item.total_price || 0), 0);
  const totalPayable = Number((totalAmount - Number(formData.discount || 0) + Number(formData.tax || 0)).toFixed(2));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        customer_id: formData.customer_id,
        notes: formData.notes,
        discount: Number(formData.discount || 0),
        tax: Number(formData.tax || 0),
        items: formData.items.map((item) => ({
          product_id: item.product_id || '',
          name: item.name,
          unit_price: Number(item.unit_price),
          quantity: Number(item.quantity),
          total_price: Number(item.total_price),
        })),
      };
      await createOrder(payload);
      setSuccess('Order created successfully.');
      setFormData({ customer_id: '', notes: '', discount: 0, tax: 0, items: [{ name: '', unit_price: 0, quantity: 1, total_price: 0 }] });
      loadData();
    } catch (err) {
      setError('Unable to create order.');
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrder(orderId, { ...orders.find((order) => order.id === orderId), status });
      loadData();
    } catch (err) {
      setError('Unable to update order status.');
    }
  };

  return (
    <div className="space-y-8">
      <section className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Orders</h1>
            <p className="mt-2 text-slate-400">Capture commercial orders and track status over time.</p>
          </div>
          <div className="rounded-3xl bg-slate-900/80 px-5 py-4 text-slate-300">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Total orders</p>
            <p className="mt-2 text-3xl font-semibold text-white">{orders.length}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-white">Create order</h2>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  Customer
                  <select
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                    value={formData.customer_id}
                    onChange={(e) => setFormData((prev) => ({ ...prev, customer_id: e.target.value }))}
                    required
                  >
                    <option value="">Select customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  Notes
                  <input
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                    placeholder="Optional order details"
                  />
                </label>
              </div>

              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div className="flex-1 space-y-3">
                        <label className="space-y-2 text-sm text-slate-300">
                          Item name
                          <input
                            value={item.name}
                            onChange={(e) => updateItem(index, { name: e.target.value })}
                            required
                            className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                          />
                        </label>
                        <div className="grid gap-4 sm:grid-cols-3">
                          <label className="space-y-2 text-sm text-slate-300">
                            Price
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => updateItem(index, { unit_price: Number(e.target.value) })}
                              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                              required
                            />
                          </label>
                          <label className="space-y-2 text-sm text-slate-300">
                            Quantity
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                              required
                            />
                          </label>
                          <label className="space-y-2 text-sm text-slate-300">
                            Total
                            <input
                              type="number"
                              value={item.total_price}
                              readOnly
                              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-400 outline-none"
                            />
                          </label>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="h-12 rounded-2xl bg-rose-500 px-5 text-sm font-semibold text-white transition hover:bg-rose-400"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  Discount
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, discount: Number(e.target.value) }))}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  Tax
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.tax}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tax: Number(e.target.value) }))}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-cyan-500/20 bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-400">Subtotal</p>
                  <p className="mt-2 text-3xl font-semibold text-white">₹{totalAmount.toFixed(2)}</p>
                </div>
                <div className="rounded-3xl border border-emerald-500/20 bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-400">Payable</p>
                  <p className="mt-2 text-3xl font-semibold text-white">₹{totalPayable.toFixed(2)}</p>
                </div>
              </div>

              {error && <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}
              {success && <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{success}</p>}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button className="rounded-2xl bg-cyan-500 px-5 py-3 text-white transition hover:bg-cyan-400">Create order</button>
                <button
                  type="button"
                  onClick={addItem}
                  className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-3 text-slate-200 transition hover:border-slate-700"
                >
                  Add item
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold text-white">Recent orders</h2>
          <p className="mt-2 text-slate-400">Review orders and update status quickly.</p>
          {loading ? (
            <p className="mt-6 text-slate-400">Loading orders…</p>
          ) : orders.length === 0 ? (
            <p className="mt-6 rounded-3xl bg-slate-900/80 px-4 py-5 text-slate-400">No orders found yet.</p>
          ) : (
            <div className="mt-6 space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="rounded-3xl border border-white/10 bg-slate-950/50 p-4 text-slate-200 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">Order #{order.id.slice(-6)}</p>
                      <p className="mt-1 text-sm text-slate-400">Customer ID: {order.customer_id}</p>
                    </div>
                    <div className="space-y-2 text-right">
                      <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Status</p>
                      <p className="rounded-full bg-slate-800 px-3 py-1 text-sm font-semibold text-white">{order.status}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-slate-400">Total: ₹{order.total?.toFixed(2) ?? '0.00'}</p>
                    <div className="flex flex-wrap gap-2">
                      {['pending', 'processing', 'completed', 'cancelled'].map((statusOption) => (
                        <button
                          key={statusOption}
                          type="button"
                          onClick={() => handleStatusChange(order.id, statusOption)}
                          className={`rounded-2xl px-3 py-2 text-sm font-semibold text-white transition ${
                            order.status === statusOption
                              ? 'bg-cyan-500'
                              : 'bg-slate-800 hover:bg-slate-700'
                          }`}
                        >
                          {statusOption}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {error && <p className="mt-4 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}
        </div>
      </section>
    </div>
  );
};

export default Orders;
