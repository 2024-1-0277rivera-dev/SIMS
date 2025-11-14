import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.message === 'User not found') {
          setError('Account not found. Redirecting to sign up...');
          setTimeout(() => {
              navigate('/signup');
          }, 1500);
      } else {
          setError(err.message || 'Failed to log in.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-indigo-600 dark:text-indigo-400 mb-6">
          SIMS Login
        </h1>
        <Card>
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Log In'}
              </Button>
            </form>
            
            <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
                Don't have an account? <span onClick={() => navigate('/signup')} className="text-indigo-600 hover:underline cursor-pointer">Sign Up</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;