import { useEffect, useState } from 'react';
import API from '../services/api';

export default function Wallet() {
  const [wallet, setWallet] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [amount, setAmount] = useState(0);

  async function load() {
    const { data } = await API.get('/wallet/me');
    setWallet(data.wallet);
    setEntries(data.entries);
  }

  useEffect(() => { load(); }, []);

  async function deposit() {
    await API.post('/wallet/deposit', { amountCents: Math.round(amount * 100) });
    await load();
  }

  async function withdraw() {
    await API.post('/wallet/withdraw', { amountCents: Math.round(amount * 100) });
    await load();
  }

  return (
    <div>
      <h2>Wallet</h2>
      <div>Balance: {(wallet?.balanceCents || 0) / 100} USD</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <input type="number" step="0.01" value={amount} onChange={e => setAmount(parseFloat(e.target.value))} />
        <button onClick={deposit}>Deposit</button>
        <button onClick={withdraw}>Withdraw</button>
      </div>
      <h3 style={{ marginTop: 16 }}>Ledger</h3>
      <ul>
        {entries.map(e => (
          <li key={e.id}>{e.createdAt}: {e.type} {e.amountCents / 100} USD</li>
        ))}
      </ul>
    </div>
  );
}
