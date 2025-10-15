import { useEffect, useState } from 'react';
import API from '../services/api';

export default function Reports() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    API.get('/reports/me').then(r => setData(r.data));
  }, []);

  if (!data) return <div>Loading...</div>;
  return (
    <div>
      <h2>My Report</h2>
      <ul>
        <li>CO₂ reduced: {Number(data.co2ReducedKg).toFixed(3)} kg</li>
        <li>Total credits: {Number(data.totalCredits).toFixed(6)}</li>
        <li>Available credits: {Number(data.availableCredits).toFixed(6)}</li>
        <li>Revenue: ${(data.revenueCents/100).toFixed(2)}</li>
      </ul>
    </div>
  );
}
