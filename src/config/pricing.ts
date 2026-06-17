export const housePrices: Record<string, number> = {
  '1': 1764, // Retreat by the Falls
  '2': 2070, // Sauna Retreat
  '3': 2200, // Romantic Getaway
  '4': 1600, // Royal Park Apartment
  '5': 2178, // Mountain & Lake Haven
  '6': 1782, // The Cubist Retreat
};

export const platformCommissions: Record<string, number> = {
  'Booking': 0.165,   // 16.5%
  'Airbnb': 0.03,     // 3%
  'Campanyon': 0.10,  // 10%
  'Vrbo': 0.08,       // 8%
};

export function calculatePayout(houseId: string, platform: string, nights: number) {
  const basePrice = housePrices[houseId] || 1500;
  
  // Find matching platform commission, default to 15% if unknown
  let commissionRate = 0.15;
  for (const [key, rate] of Object.entries(platformCommissions)) {
    if (platform.toLowerCase().includes(key.toLowerCase())) {
      commissionRate = rate;
      break;
    }
  }

  const gross = basePrice * nights;
  const commission = gross * commissionRate;
  const net = gross - commission;

  return { gross, commission, net, commissionRate };
}
