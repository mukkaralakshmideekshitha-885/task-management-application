import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, Shield } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 via-slate-50 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-indigo-600 items-center justify-center text-white shadow-lg shadow-indigo-200 mb-4">
          <CheckSquare className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Create an Account
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Join your team and track tasks seamlessly
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Miller"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl outline-hidden transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="jordan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl outline-hidden transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl outline-hidden transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  role === 'MEMBER'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    checked={role === 'MEMBER'}
                    onChange={() => setRole('MEMBER')}
                    className="hidden"
                  />
                  <UserIcon className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs">Team Member</span>
                </label>

                <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  role === 'ADMIN'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    checked={role === 'ADMIN'}
                    onChange={() => setRole('ADMIN')}
                    className="hidden"
                  />
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs">Admin / Lead</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] rounded-xl shadow-md shadow-indigo-200 disabled:opacity-60 transition-all"
            >
              {loading ? 'Creating account...' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-indigo-600 hover:underline">
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
