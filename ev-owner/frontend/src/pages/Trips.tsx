import { useEffect, useState } from 'react';
import API from '../services/api';

export default function Trips() {
  const [trips, setTrips] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const { data } = await API.get('/trips');
    setTrips(data.trips);
  }

  useEffect(() => {
    load();
  }, []);

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    const { data } = await API.post('/trips/import', form);
    setMessage(`Imported ${data.count} trips, minted ${data.totalCreditsMinted.toFixed(6)} credits`);
    setFile(null);
    await load();
  }

  return (
    <div>
      <h2>Trips</h2>
      <form onSubmit={onUpload} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="file" accept=".csv" onChange={e => setFile(e.target.files?.[0] || null)} />
        <button type="submit">Import</button>
      </form>
      {message && <div style={{ color: 'green', marginTop: 8 }}>{message}</div>}
      <table style={{ width: '100%', marginTop: 12 }}>
        <thead>
          <tr>
            <th>Start</th>
            <th>End</th>
            <th>Distance (km)</th>
            <th>Energy (kWh)</th>
            <th>CO₂ Reduced (kg)</th>
          </tr>
        </thead>
        <tbody>
          {trips.map(t => (
            <tr key={t.id}>
              <td>{t.startAt ? new Date(t.startAt).toLocaleString() : '-'}</td>
              <td>{t.endAt ? new Date(t.endAt).toLocaleString() : '-'}</td>
              <td>{Number(t.distanceKm).toFixed(3)}</td>
              <td>{Number(t.energyKWh).toFixed(3)}</td>
              <td>{Number(t.co2ReducedKg).toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
