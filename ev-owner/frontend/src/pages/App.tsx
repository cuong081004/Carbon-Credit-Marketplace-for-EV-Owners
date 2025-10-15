import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './Login';
import Trips from './Trips';
import Wallet from './Wallet';
import Market from './Market';
import Reports from './Reports';
import { getToken } from '../services/api';

export default function App() {
  const authed = !!getToken();
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', maxWidth: 1000, margin: '0 auto', padding: 16 }}>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Link to="/">Home</Link>
        <Link to="/trips">Trips</Link>
        <Link to="/wallet">Wallet</Link>
        <Link to="/market">Market</Link>
        <Link to="/reports">Reports</Link>
      </nav>
      <Routes>
        <Route path="/" element={authed ? <Navigate to="/trips" /> : <Login />} />
        <Route path="/trips" element={authed ? <Trips /> : <Navigate to="/" />} />
        <Route path="/wallet" element={authed ? <Wallet /> : <Navigate to="/" />} />
        <Route path="/market" element={<Market />} />
        <Route path="/reports" element={authed ? <Reports /> : <Navigate to="/" />} />
      </Routes>
    </div>
  );
}
