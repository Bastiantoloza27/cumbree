// Análisis de productos con Open Food Facts + sellos de la Ley 20.606 (límites vigentes).
import { ALIMENTOS } from './foods.js';

const LIMITES = {
  solido: { kcal: 275, sodio: 400, azucar: 10, grasaSat: 4 },
  liquido: { kcal: 70, sodio: 100, azucar: 5, grasaSat: 3 },
};

export async function buscarProducto(codigo) {
  const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(codigo)}.json?fields=product_name,brands,quantity,serving_size,serving_quantity,nutriments,ingredients_text_es,ingredients_text,categories_tags,nova_group,image_front_small_url`);
  if (!r.ok) throw new Error('No se pudo consultar Open Food Facts');
  const j = await r.json();
  if (j.status !== 1 || !j.product) return null;
  const p = j.product;
  const n = p.nutriments || {};
  const liquido = /(^|\D)(ml|l|cl)\b/i.test(p.quantity || '') || (p.categories_tags || []).some((c) => /beverage|bebida|drink/.test(c));
  return {
    codigo,
    nombre: p.product_name || 'Producto sin nombre',
    marca: p.brands || '',
    cantidad: p.quantity || '',
    porcionG: Number(p.serving_quantity) || null,
    porcion: p.serving_size || '',
    imagen: p.image_front_small_url || '',
    ingredientes: p.ingredients_text_es || p.ingredients_text || '',
    nova: p.nova_group || null,
    liquido,
    por100: {
      kcal: Number(n['energy-kcal_100g'] ?? (n.energy_100g ? n.energy_100g / 4.184 : 0)) || 0,
      p: Number(n.proteins_100g) || 0,
      c: Number(n.carbohydrates_100g) || 0,
      g: Number(n.fat_100g) || 0,
      azucar: Number(n.sugars_100g) || 0,
      grasaSat: Number(n['saturated-fat_100g']) || 0,
      sodio: (Number(n.sodium_100g) || 0) * 1000,
      fibra: Number(n.fiber_100g) || 0,
    },
    fuente: 'Open Food Facts',
  };
}

export function sellos(prod) {
  const L = prod.liquido ? LIMITES.liquido : LIMITES.solido;
  const x = prod.por100;
  const s = [];
  if (x.azucar > L.azucar) s.push('ALTO EN AZÚCARES');
  if (x.grasaSat > L.grasaSat) s.push('ALTO EN GRASAS SATURADAS');
  if (x.sodio > L.sodio) s.push('ALTO EN SODIO');
  if (x.kcal > L.kcal) s.push('ALTO EN CALORÍAS');
  return s;
}

/** Puntaje 0–100 respecto de la meta: premia proteína y fibra, castiga sellos y ultraprocesados. */
export function analizar(prod, { enDeficit = true, faltaProteina = 0 } = {}) {
  const x = prod.por100;
  const se = sellos(prod);
  const protPor100kcal = x.kcal ? (x.p / x.kcal) * 100 : 0;
  let score = 55;
  score += Math.min(25, protPor100kcal * 3);
  score += Math.min(8, x.fibra * 1.5);
  score -= se.length * 10;
  if (prod.nova === 4) score -= 8;
  if (enDeficit && x.kcal > 400) score -= 6;
  score = Math.round(Math.max(0, Math.min(100, score)));
  const pros = [];
  const contras = [];
  if (protPor100kcal >= 6) pros.push(`Buena proteína: ${protPor100kcal.toFixed(1).replace('.', ',')} g por cada 100 kcal`);
  else contras.push(`Poca proteína: ${protPor100kcal.toFixed(1).replace('.', ',')} g por cada 100 kcal (ideal: 6 o más)`);
  if (x.fibra >= 3) pros.push(`Aporta fibra (${x.fibra.toFixed(1).replace('.', ',')} g por 100 g)`);
  if (!se.length) pros.push('Sin sellos de advertencia');
  se.forEach((s) => contras.push(s.charAt(0) + s.slice(1).toLowerCase()));
  if (prod.nova === 4) contras.push('Ultraprocesado (NOVA 4)');
  if (faltaProteina > 20 && protPor100kcal < 4) contras.push(`No ayuda con los ${Math.round(faltaProteina)} g de proteína que te faltan hoy`);
  const veredicto = score >= 70 ? 'Buena opción para tu meta' : score >= 45 ? 'Úsalo con moderación' : 'Poco útil para tu meta';
  const alternativa = score < 60 ? ALIMENTOS.find((a) => a.nombre === (prod.liquido ? 'Leche semidescremada' : 'Yogur proteico')) : null;
  return { score, sellos: se, pros, contras, veredicto, protPor100kcal, alternativa };
}

export function porcionAMacros(prod, gramos) {
  const f = gramos / 100;
  const x = prod.por100;
  return { kcal: Math.round(x.kcal * f), p: +(x.p * f).toFixed(1), c: +(x.c * f).toFixed(1), g: +(x.g * f).toFixed(1) };
}
