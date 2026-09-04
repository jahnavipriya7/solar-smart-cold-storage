module.exports = const vegetables = [
  { name: 'Carrot', emoji: '🥕', minTemp: 0, maxTemp: 2, minHumidity: 95, maxHumidity: 100, shelfLifeDays: 35, category: 'Root', densityLitersPerKg: 1.4 },
  { name: 'Spinach', emoji: '🥬', minTemp: 0, maxTemp: 2, minHumidity: 95, maxHumidity: 100, shelfLifeDays: 12, category: 'Leafy', densityLitersPerKg: 2.2 },
  { name: 'Broccoli', emoji: '🥦', minTemp: 0, maxTemp: 2, minHumidity: 95, maxHumidity: 100, shelfLifeDays: 14, category: 'Flower', densityLitersPerKg: 1.8 },
  { name: 'Cabbage', emoji: '🥬', minTemp: 0, maxTemp: 2, minHumidity: 98, maxHumidity: 100, shelfLifeDays: 42, category: 'Leafy', densityLitersPerKg: 1.7 },
  { name: 'Lettuce', emoji: '🥗', minTemp: 0, maxTemp: 2, minHumidity: 98, maxHumidity: 100, shelfLifeDays: 18, category: 'Leafy', densityLitersPerKg: 2.3 },
  { name: 'Peas', emoji: '🫛', minTemp: 0, maxTemp: 2, minHumidity: 95, maxHumidity: 98, shelfLifeDays: 10, category: 'Legume', densityLitersPerKg: 1.5 },
  { name: 'Corn', emoji: '🌽', minTemp: 0, maxTemp: 2, minHumidity: 95, maxHumidity: 98, shelfLifeDays: 6, category: 'Grain', densityLitersPerKg: 1.6 },
  { name: 'Cauliflower', emoji: '🌸', minTemp: 0, maxTemp: 2, minHumidity: 95, maxHumidity: 98, shelfLifeDays: 25, category: 'Flower', densityLitersPerKg: 1.8 },
  { name: 'Radish', emoji: '🔴', minTemp: 0, maxTemp: 2, minHumidity: 95, maxHumidity: 100, shelfLifeDays: 25, category: 'Root', densityLitersPerKg: 1.4 },
  { name: 'Beet', emoji: '🟣', minTemp: 0, maxTemp: 2, minHumidity: 98, maxHumidity: 100, shelfLifeDays: 150, category: 'Root', densityLitersPerKg: 1.3 },
  { name: 'Mushroom', emoji: '🍄', minTemp: 0, maxTemp: 4, minHumidity: 90, maxHumidity: 95, shelfLifeDays: 6, category: 'Fungi', densityLitersPerKg: 2.0 },
  { name: 'Garlic', emoji: '🧄', minTemp: 0, maxTemp: 5, minHumidity: 65, maxHumidity: 70, shelfLifeDays: 210, category: 'Bulb', densityLitersPerKg: 1.5 },
  { name: 'Onion', emoji: '🧅', minTemp: 0, maxTemp: 5, minHumidity: 65, maxHumidity: 70, shelfLifeDays: 120, category: 'Bulb', densityLitersPerKg: 1.4 },
  { name: 'Potato', emoji: '🥔', minTemp: 4, maxTemp: 7, minHumidity: 95, maxHumidity: 98, shelfLifeDays: 180, category: 'Root', densityLitersPerKg: 1.3 },
  { name: 'Beans', emoji: '🫘', minTemp: 4, maxTemp: 7, minHumidity: 90, maxHumidity: 95, shelfLifeDays: 8, category: 'Legume', densityLitersPerKg: 1.6 },
  { name: 'Okra', emoji: '🌿', minTemp: 7, maxTemp: 10, minHumidity: 90, maxHumidity: 95, shelfLifeDays: 8, category: 'Fruit-Veg', densityLitersPerKg: 1.7 },
  { name: 'Capsicum', emoji: '🫑', minTemp: 7, maxTemp: 13, minHumidity: 90, maxHumidity: 95, shelfLifeDays: 18, category: 'Fruit-Veg', densityLitersPerKg: 1.8 },
  { name: 'Sweet Pepper', emoji: '🌶️', minTemp: 7, maxTemp: 13, minHumidity: 90, maxHumidity: 95, shelfLifeDays: 18, category: 'Fruit-Veg', densityLitersPerKg: 1.8 },
  { name: 'Cucumber', emoji: '🥒', minTemp: 10, maxTemp: 13, minHumidity: 90, maxHumidity: 95, shelfLifeDays: 12, category: 'Fruit-Veg', densityLitersPerKg: 1.5 },
  { name: 'Eggplant', emoji: '🍆', minTemp: 10, maxTemp: 13, minHumidity: 90, maxHumidity: 95, shelfLifeDays: 10, category: 'Fruit-Veg', densityLitersPerKg: 1.7 },
  { name: 'Pumpkin', emoji: '🎃', minTemp: 10, maxTemp: 13, minHumidity: 50, maxHumidity: 70, shelfLifeDays: 75, category: 'Fruit-Veg', densityLitersPerKg: 1.4 },
  { name: 'Tomato Ripe', emoji: '🍅', minTemp: 12, maxTemp: 15, minHumidity: 85, maxHumidity: 90, shelfLifeDays: 5, category: 'Fruit-Veg', densityLitersPerKg: 1.5 },
  { name: 'Tomato Unripe', emoji: '🍅', minTemp: 12, maxTemp: 15, minHumidity: 85, maxHumidity: 90, shelfLifeDays: 18, category: 'Fruit-Veg', densityLitersPerKg: 1.5 },
  { name: 'Bitter Gourd', emoji: '🥒', minTemp: 12, maxTemp: 15, minHumidity: 85, maxHumidity: 90, shelfLifeDays: 16, category: 'Fruit-Veg', densityLitersPerKg: 1.6 },
  { name: 'Ginger', emoji: '🫚', minTemp: 13, maxTemp: 16, minHumidity: 60, maxHumidity: 70, shelfLifeDays: 180, category: 'Root', densityLitersPerKg: 1.4 }
];



function convertKgToLitres(vegs, weightKg) {
  const kg = parseFloat(weightKg) || 0;
  if (kg <= 0 || !vegs || vegs.length === 0) return 0;
  // Calculate average volumetric factor of selected crops
  const avgFactor = vegs.reduce((sum, v) => sum + (v.densityLitersPerKg || 1.5), 0) / vegs.length;
  return parseFloat((kg * avgFactor).toFixed(1));
}

function computeRange(vegs) {
  if (!vegs || vegs.length === 0) return null;
  let minT = vegs[0].minTemp, maxT = vegs[0].maxTemp;
  let minH = vegs[0].minHumidity, maxH = vegs[0].maxHumidity;
  let minShelf = vegs[0].shelfLifeDays;
  
  for (let i = 1; i < vegs.length; i++) {
    minT = Math.max(minT, vegs[i].minTemp);
    maxT = Math.min(maxT, vegs[i].maxTemp);
    minH = Math.max(minH, vegs[i].minHumidity);
    maxH = Math.min(maxH, vegs[i].maxHumidity);
    minShelf = Math.min(minShelf, vegs[i].shelfLifeDays);
  }
  
  if (minT > maxT || minH > maxH) return null;
  
  return {
    minTemp: minT,
    maxTemp: maxT,
    targetTemp: parseFloat(((minT + maxT) / 2).toFixed(1)),
    minHumidity: minH,
    maxHumidity: maxH,
    targetHumidity: parseFloat(((minH + maxH) / 2).toFixed(1)),
    shelfLifeDays: minShelf
  };
}