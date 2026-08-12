import { useEffect, useState } from 'react';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', sku: '', price: '', stock: '' });
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (err) {
      setError('Unable to load products.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const payload = {
      name: formData.name,
      description: formData.description,
      sku: formData.sku,
      price: Number(formData.price) || 0,
      stock: Number(formData.stock) || 0,
    };

    try {
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      setFormData({ name: '', description: '', sku: '', price: '', stock: '' });
      setEditingId('');
      fetchProducts();
    } catch (err) {
      setError('Unable to save product.');
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      sku: product.sku || '',
      price: product.price?.toString() || '',
      stock: product.stock?.toString() || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this product?');
    if (!confirmed) return;

    try {
      await deleteProduct(id);
      setProducts((current) => current.filter((product) => product.id !== id));
    } catch (err) {
      setError('Unable to delete product.');
    }
  };

  return (
    <div className="space-y-8">
      <section className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Products</h1>
            <p className="mt-2 text-slate-400">Define product details and pricing for quotations and orders.</p>
          </div>
          <div className="rounded-3xl bg-slate-900/80 px-5 py-4 text-slate-300">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Inventory size</p>
            <p className="mt-2 text-3xl font-semibold text-white">{products.length}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-white">{editingId ? 'Edit product' : 'Add new product'}</h2>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <label className="space-y-2 text-sm text-slate-300">
                Product name
                <input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Description
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  SKU
                  <input
                    value={formData.sku}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  Price
                  <input
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                  />
                </label>
              </div>
              <label className="space-y-2 text-sm text-slate-300">
                Stock
                <input
                  value={formData.stock}
                  onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
                  type="number"
                  min="0"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                />
              </label>
            </div>
            {error && <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button className="w-full rounded-2xl bg-cyan-500 px-5 py-3 text-white transition hover:bg-cyan-400 sm:w-auto">
                {editingId ? 'Update product' : 'Add product'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId('');
                    setFormData({ name: '', description: '', sku: '', price: '', stock: '' });
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
              <h2 className="text-xl font-semibold text-white">Product inventory</h2>
              <p className="mt-2 text-slate-400">A responsive product list with pricing and stock details.</p>
            </div>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-sm text-slate-300">Business ready</span>
          </div>

          {loading ? (
            <p className="mt-8 text-slate-400">Loading products…</p>
          ) : (
            <div className="mt-6 space-y-4">
              {products.length === 0 ? (
                <p className="rounded-3xl bg-slate-900/80 px-4 py-5 text-slate-400">No products added yet. Create items to begin.</p>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 text-slate-200 shadow-sm">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-white">{product.name}</p>
                          <p className="mt-1 text-sm text-slate-400">{product.description || 'No description'}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm text-slate-300">
                          <span className="rounded-full bg-slate-800 px-3 py-1">₹{product.price?.toFixed(2) ?? '0.00'}</span>
                          <span className="rounded-full bg-slate-800 px-3 py-1">Stock {product.stock ?? 0}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(product)}
                          className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-400"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
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

export default Products;
