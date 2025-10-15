export function computeCo2ReducedKg({ distanceKm, energyKWh }) {
  const baselineIceKgPerKm = parseFloat(process.env.ICE_KG_CO2_PER_KM || '0.192');
  const gridIntensityKgPerKwh = parseFloat(process.env.GRID_KG_CO2_PER_KWH || '0.0');

  const distanceComponent = (Number(distanceKm) || 0) * baselineIceKgPerKm;
  const evComponent = (Number(energyKWh) || 0) * gridIntensityKgPerKwh;
  const saved = distanceComponent - evComponent;
  return saved > 0 ? saved : 0;
}

export function convertCo2KgToCredits(co2ReducedKg) {
  const creditsPerTonne = parseFloat(process.env.CREDITS_PER_TONNE || '1');
  const tonnes = (Number(co2ReducedKg) || 0) / 1000.0;
  return tonnes * creditsPerTonne;
}
