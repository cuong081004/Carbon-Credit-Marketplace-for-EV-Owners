import { useEffect, useState } from 'react';
import API from '../services/api';

export default function Market() {
  const [listings, setListings] = useState<any[]>([]);
  const [priceSuggestion, setPriceSuggestion] = useState<number | null>(null);
  const [myLots, setMyLots] = useState<any[]>([]);
  const [selectedLot, setSelectedLot] = useState<number | null>(null);
  const [qty, setQty] = useState<number>(0);
  const [type, setType] = useState<'FIXED' | 'AUCTION'>('FIXED');
  const [price, setPrice] = useState<number>(0);

  async function load() {
    const { data } = await API.get('/market/listings');
    setListings(data.listings);
    try {
      const s = await API.get('/market/suggest-price');
      setPriceSuggestion(s.data.suggestedPricePerCreditCents / 100);
      const lotsRes = await API.get('/market/my-lots');
      setMyLots(lotsRes.data.lots);
    } catch {}
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h2>Market</h2>
      {priceSuggestion && <div>Suggested price: ${priceSuggestion.toFixed(2)} per credit</div>}
      <details style={{ marginTop: 12 }}>
        <summary>Create listing</summary>
        <div style={{ display: 'grid', gap: 8, maxWidth: 600, marginTop: 8 }}>
          <select value={selectedLot ?? ''} onChange={e => setSelectedLot(e.target.value ? parseInt(e.target.value) : null)}>
            <option value="">Select credit lot</option>
            {myLots.map(l => (
              <option value={l.id} key={l.id}>Lot #{l.id} - {Number(l.availableCredits).toFixed(6)} cr</option>
            ))}
          </select>
          <label>
            Type
            <select value={type} onChange={e => setType(e.target.value as any)}>
              <option value="FIXED">Fixed</option>
              <option value="AUCTION">Auction</option>
            </select>
          </label>
          <input type="number" step="0.000001" placeholder="Quantity" value={qty} onChange={e => setQty(parseFloat(e.target.value))} />
          {type === 'FIXED' ? (
            <input type="number" step="0.01" placeholder="Price per credit (USD)" value={price} onChange={e => setPrice(parseFloat(e.target.value))} />
          ) : (
            <input type="number" step="0.01" placeholder="Min price per credit (USD)" value={price} onChange={e => setPrice(parseFloat(e.target.value))} />
          )}
          <button onClick={async () => {
            if (!selectedLot) return;
            await API.post('/market/listings', {
              creditLotId: selectedLot,
              type,
              quantity: qty,
              pricePerCreditCents: type === 'FIXED' ? Math.round(price * 100) : undefined,
              minPricePerCreditCents: type === 'AUCTION' ? Math.round(price * 100) : undefined,
            });
            await load();
          }}>Create</button>
        </div>
      </details>
      <table style={{ width: '100%', marginTop: 12 }}>
        <thead>
          <tr>
            <th>Seller</th>
            <th>Type</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {listings.map(l => (
            <tr key={l.id}>
              <td>{l.user?.name || l.userId}</td>
              <td>{l.type}</td>
              <td>{Number(l.quantity).toFixed(6)}</td>
              <td>{l.type === 'FIXED' ? `$${(l.pricePerCreditCents/100).toFixed(2)}` : `Min $${(l.minPricePerCreditCents/100).toFixed(2)}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
