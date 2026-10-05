// Base de alimentos chilenos y comunes (valores aproximados por porción casera).
// Fuente: estimaciones a partir de tablas de composición estándar; marcadas como "base Cumbre".
// En producción se complementa con Open Food Facts y la tabla de composición de alimentos de Chile.
// [nombre, porción, kcal, proteína g, carbohidratos g, grasas g, palabras clave]
const RAW = [
  ['Marraqueta', '1 unidad (100 g)', 270, 9, 55, 1.5, 'marraqueta,pan batido,pan frances,pan'],
  ['Hallulla', '1 unidad (90 g)', 270, 7, 47, 6, 'hallulla'],
  ['Pan integral de molde', '1 rebanada (30 g)', 75, 3.5, 12, 1, 'pan integral,pan de molde'],
  ['Palta', '1/2 unidad (75 g)', 120, 1.5, 6, 11, 'palta,aguacate'],
  ['Huevo', '1 unidad', 72, 6.3, 0.4, 4.8, 'huevo,huevos,huevo duro,huevo revuelto'],
  ['Jamón de pavo', '1 lámina (20 g)', 22, 3.5, 0.5, 0.6, 'jamon de pavo,jamon'],
  ['Queso gauda', '1 lámina (20 g)', 72, 5, 0, 5.6, 'queso gauda,queso mantecoso,queso'],
  ['Quesillo', '1 porción (50 g)', 70, 7, 2, 4, 'quesillo,queso fresco'],
  ['Leche semidescremada', '1 taza (200 ml)', 92, 6.6, 9.6, 3, 'leche'],
  ['Café con leche', '1 taza', 60, 3, 5, 2.5, 'cafe con leche,cortado'],
  ['Té o café solo', '1 taza', 2, 0, 0, 0, 'te,cafe,cafe solo,te solo'],
  ['Yogur natural', '1 pote (125 g)', 75, 4.4, 6, 3.5, 'yogur,yoghurt'],
  ['Yogur proteico', '1 pote (150 g)', 130, 15, 12, 2, 'yogur proteico,yogurt proteico,protein yogurt'],
  ['Avena', '1/2 taza (40 g)', 150, 5, 27, 2.8, 'avena'],
  ['Plátano', '1 unidad', 105, 1.3, 27, 0.4, 'platano,banana'],
  ['Manzana', '1 unidad', 95, 0.5, 25, 0.3, 'manzana'],
  ['Naranja', '1 unidad', 70, 1.3, 17, 0.2, 'naranja'],
  ['Porotos con riendas', '1 plato', 520, 24, 82, 9, 'porotos con riendas'],
  ['Porotos granados', '1 plato', 450, 20, 70, 10, 'porotos granados'],
  ['Porotos', '1 plato', 430, 22, 68, 7, 'porotos'],
  ['Lentejas', '1 plato', 400, 24, 60, 6, 'lentejas'],
  ['Garbanzos', '1 plato', 420, 20, 58, 11, 'garbanzos'],
  ['Cazuela de vacuno', '1 plato', 450, 30, 40, 18, 'cazuela de vacuno,cazuela de carne,cazuela'],
  ['Cazuela de ave', '1 plato', 380, 28, 38, 12, 'cazuela de ave,cazuela de pollo'],
  ['Charquicán', '1 plato', 420, 22, 45, 16, 'charquican'],
  ['Pastel de choclo', '1 porción', 650, 30, 60, 32, 'pastel de choclo'],
  ['Humita', '1 unidad', 300, 7, 45, 11, 'humita,humitas'],
  ['Empanada de pino', '1 unidad', 500, 20, 50, 24, 'empanada de pino,empanada'],
  ['Empanada de queso frita', '1 unidad', 420, 12, 35, 26, 'empanada de queso'],
  ['Completo italiano', '1 unidad', 550, 16, 48, 32, 'completo,italiano,hot dog'],
  ['Sopaipilla', '1 unidad', 180, 2.5, 22, 9, 'sopaipilla,sopaipillas'],
  ['Arroz', '1 taza cocido', 205, 4.2, 45, 0.4, 'arroz'],
  ['Fideos', '1 taza cocidos', 220, 8, 43, 1.3, 'fideos,tallarines,pasta,spaghetti'],
  ['Puré de papas', '1 taza', 210, 4, 35, 7, 'pure,pure de papas'],
  ['Papas cocidas', '1 unidad mediana', 130, 3, 30, 0.2, 'papa cocida,papas cocidas,papa'],
  ['Papas fritas', '1 porción (120 g)', 380, 4.5, 48, 19, 'papas fritas'],
  ['Pechuga de pollo a la plancha', '150 g', 250, 46, 0, 6, 'pechuga de pollo,pollo a la plancha,pechuga,pollo'],
  ['Trutro de pollo asado', '1 unidad', 280, 28, 0, 18, 'trutro,pollo asado'],
  ['Bistec de vacuno', '150 g', 270, 40, 0, 12, 'bistec,posta,filete,carne,lomo vetado,asado'],
  ['Carne molida', '150 g cocida', 330, 36, 0, 20, 'carne molida'],
  ['Lomo de cerdo', '150 g', 280, 38, 0, 13, 'cerdo,chuleta,lomo de cerdo'],
  ['Salmón', '150 g', 310, 33, 0, 19, 'salmon'],
  ['Merluza', '150 g', 140, 28, 0, 2.5, 'merluza,pescado,reineta'],
  ['Atún en agua', '1 lata escurrida', 130, 29, 0, 1, 'atun'],
  ['Longaniza', '1 unidad (100 g)', 300, 14, 2, 26, 'longaniza,chorizo'],
  ['Ensalada chilena', '1 porción', 90, 2, 9, 5, 'ensalada chilena,tomate cebolla'],
  ['Ensalada verde con aceite', '1 porción', 80, 1.5, 6, 6, 'ensalada,lechuga'],
  ['Verduras salteadas', '1 taza', 80, 3, 10, 3.5, 'verduras,brocoli,zapallo italiano,verdura'],
  ['Aceite de oliva', '1 cucharada', 117, 0, 0, 13, 'aceite'],
  ['Mayonesa', '1 cucharada', 100, 0.2, 0.1, 11, 'mayonesa,mayo'],
  ['Pebre', '2 cucharadas', 25, 0.3, 2, 2, 'pebre'],
  ['Mantequilla', '1 cucharadita', 36, 0, 0, 4, 'mantequilla'],
  ['Mermelada', '1 cucharada', 50, 0, 13, 0, 'mermelada'],
  ['Bebida azucarada', '1 lata (350 ml)', 150, 0, 38, 0, 'bebida,coca,cola,fanta,sprite'],
  ['Bebida zero', '1 lata (350 ml)', 1, 0, 0, 0, 'bebida zero,coca zero,light'],
  ['Néctar de fruta', '1 vaso (200 ml)', 100, 0, 24, 0, 'nectar,jugo'],
  ['Cerveza', '1 lata (350 ml)', 150, 1.5, 13, 0, 'cerveza,chela'],
  ['Vino', '1 copa (150 ml)', 125, 0.1, 4, 0, 'vino,copa de vino'],
  ['Barra de cereal', '1 unidad (25 g)', 100, 1.8, 18, 2.5, 'barra de cereal,barrita'],
  ['Barra de proteína', '1 unidad', 180, 15, 18, 6, 'barra de proteina,barra proteica'],
  ['Proteína whey', '1 scoop (30 g)', 120, 24, 3, 1.5, 'whey,batido de proteina,scoop de proteina,shake'],
  ['Frutos secos', '1 puñado (30 g)', 180, 5, 7, 15, 'frutos secos,nueces,almendras'],
  ['Maní', '1 puñado (30 g)', 170, 7.5, 5, 14, 'mani'],
  ['Galletas de agua', '4 unidades', 110, 2.5, 18, 3, 'galletas de agua,galletas'],
  ['Chocolate', '1 barra (30 g)', 160, 2, 17, 9, 'chocolate'],
  ['Helado', '1 bola', 140, 2.5, 16, 7, 'helado'],
  ['Pizza', '1 trozo', 280, 12, 32, 11, 'pizza'],
  ['Hamburguesa', '1 unidad con pan', 500, 25, 40, 26, 'hamburguesa'],
  ['Sushi', '10 piezas', 450, 18, 70, 10, 'sushi,handroll'],
  ['Kuchen', '1 trozo', 300, 4, 40, 14, 'kuchen,torta,queque'],
  ['Leche chocolatada', '1 caja (200 ml)', 150, 6, 22, 4, 'leche chocolatada,chocolatada'],
];

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export const ALIMENTOS = RAW.map(([nombre, porcion, kcal, p, c, g, kw], i) => ({
  id: `cl${i}`, nombre, porcion, kcal, p, c, g, keywords: kw.split(',').map(norm), fuente: 'base Cumbre', verificado: true,
}));

export function buscarAlimentos(q, extra = []) {
  const n = norm(q.trim());
  if (!n) return [];
  return [...extra, ...ALIMENTOS]
    .map((a) => {
      const nombre = norm(a.nombre);
      const score = nombre.startsWith(n) ? 3 : a.keywords?.some((k) => k.startsWith(n)) ? 2 : nombre.includes(n) || a.keywords?.some((k) => k.includes(n)) ? 1 : 0;
      return { a, score };
    })
    .filter((x) => x.score)
    .sort((x, y) => y.score - x.score)
    .slice(0, 12)
    .map((x) => x.a);
}

const NUMEROS = { un: 1, una: 1, uno: 1, medio: 0.5, media: 0.5, dos: 2, tres: 3, cuatro: 4, cinco: 5, doble: 2, 'un par de': 2 };

/** Interpreta texto libre ("almorcé porotos con riendas, media marraqueta y ensalada") sin IA. */
export function interpretarTexto(texto) {
  let t = ' ' + norm(texto).replace(/[.,;+]/g, ' , ') + ' ';
  const kws = ALIMENTOS.flatMap((a) => a.keywords.map((k) => ({ k, a }))).sort((x, y) => y.k.length - x.k.length);
  const items = [];
  for (const { k, a } of kws) {
    const re = new RegExp(`(\\d+[\\.,]?\\d*|1/2|medio|media|una|uno|un|dos|tres|cuatro|cinco|doble)?\\s*(?:de\\s+)?(${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?=\\s)`);
    let m;
    while ((m = t.match(re))) {
      const qRaw = m[1];
      let q = 1;
      if (qRaw) q = qRaw === '1/2' ? 0.5 : NUMEROS[qRaw] ?? parseFloat(qRaw.replace(',', '.'));
      if (/\d/.test(qRaw || '') && q > 20) q = q / 100; // "150 g" de algo con porción ~100 g
      items.push({ ...a, cantidad: q, confianza: a.nombre.length > 8 ? 'media' : 'alta' });
      t = t.slice(0, m.index) + ' '.repeat(m[0].length) + t.slice(m.index + m[0].length);
    }
  }
  const comida = /desayun/.test(norm(texto)) ? 'desayuno' : /almorc|almuerz/.test(norm(texto)) ? 'almuerzo' : /\bonce\b/.test(norm(texto)) ? 'once' : /cena|cene/.test(norm(texto)) ? 'cena' : /colacion|snack/.test(norm(texto)) ? 'colación' : null;
  const resto = t.replace(/\b(almorce|almuerzo|desayune|desayuno|cene|cena|once|comi|tome|me|y|con|de|el|la|los|las|un|una|al|en|para|hoy|igual|tambien|colacion)\b/g, ' ').replace(/[ ,]+/g, ' ').trim();
  return { items, comida, sinIdentificar: resto };
}

export function comidaPorHora(h = new Date().getHours()) {
  if (h < 11) return 'desayuno';
  if (h < 16) return 'almuerzo';
  if (h < 20) return 'once';
  return 'cena';
}
export const COMIDAS = ['desayuno', 'almuerzo', 'once', 'cena', 'colación'];
