import { useState } from 'react';
import API, { setToken } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('EV Owner');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const url = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? { name, email, password } : { email, password };
      const { data } = await API.post(url, payload);
      setToken(data.token);
      window.location.href = '/trips';
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed');
    }
  }

  return (
    <div>
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
        {isRegister && (
          <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        )}
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit">{isRegister ? 'Create account' : 'Sign in'}</button>
      </form>
      <button onClick={() => setIsRegister(!isRegister)} style={{ marginTop: 8 }}>
        {isRegister ? 'Have an account? Sign in' : 'No account? Register'}
      </button>
    </div>
  );
}
