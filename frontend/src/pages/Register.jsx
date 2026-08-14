import { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerRequest, setAuthToken } from '../api';

const Register = ({ onRegistered }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await registerRequest({ name, email, password });
      const token = response.data.access;
      setAuthToken(token);
      onRegistered(token);
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        (err.response?.data && JSON.stringify(err.response.data)) ||
        err.message ||  
        'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-xl">
      <div className="mb-8 space-y-3 text-center">
        <h1 className="text-3xl font-semibold text-white">Create your account</h1>
        <p className="text-slate-400">Start managing your business quotations, customers, and orders.</p>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Full name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            minLength={8}
            className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
            placeholder="At least 8 characters"
          />
        </div>
        {error && <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-white hover:text-cyan-300">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;
