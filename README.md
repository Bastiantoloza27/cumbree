# Cumbre

**Nutrición, entrenamiento y metas a largo plazo, en una sola app.**
Cada día suma a tu cima. · Desarrollada por **EduSoftCare**.

Cumbre tiene lo que hace MyFitnessPal (diario, macros, escáner), pero organizado alrededor de una meta futura: la meta se divide en fases de entrenamiento y nutrición con base científica, cada semana se propone un plan acorde a la fase, y todo se registra y se tacha dentro de la app.

## Qué incluye este prototipo

| Área | Qué hace |
| --- | --- |
| Portada y perfiles | Splash, "¿Quién entra?", perfiles separados con PIN y color propio (5 temas, incluido rosa) |
| Datos base | Sexo, edad, estatura, peso y actividad → mantención con Mifflin-St Jeor |
| Meta flexible | Título libre, fecha, dimensiones a medir (peso, fuerza, pádel, retos, cintura o propias) e hitos editables |
| Motor de fases | Divide la meta en fases (base, fuerza, definición, rendimiento…) con calorías, proteína y entrenamiento por fase |
| Semana | Semana sugerida según la fase (respeta tus días fijos), editor libre, plan fijo repetible, tachar con XP |
| Checklist semanal | Objetivos de la semana (proteína, agua, registro, sueño, pasos o los tuyos): automáticos o marcados por día, con bono de semana completa |
| Diario | Registro por texto o voz ("almorcé porotos con riendas y media marraqueta"), buscador de alimentos chilenos, entrada manual, "igual que ayer" |
| Productos | Código de barras (cámara o manual) con Open Food Facts, sellos Ley 20.606 y puntaje según tu meta |
| Coach | Nutricionista deportivo: modo local sin costo, o IA conectada (texto y fotos) que propone registros para confirmar |
| Registro rápido (+) | Agua, peso, fuerza (series, kg, reps), pádel, otros entrenos, retos, medidas y fotos, energía |
| Revisión del domingo | Resumen de la semana, energía, nota y ajuste automático de calorías |
| Progreso | Peso con promedio de 7 días, adherencia semanal, proteína, cintura, exportar datos |

## Ejecutar

```bash
npm install
npm run dev      # desarrollo en http://localhost:5173
npm run build    # versión de producción en /dist
```

Requiere Node 18 o superior. Los datos del prototipo se guardan en el navegador (localStorage), separados por perfil.

## Estructura

Todos los archivos van en la raíz del repositorio (así se pueden subir desde la web de GitHub sin carpetas):

- `main.jsx`, `App.jsx`: arranque y rutas.
- Pantallas: `Hoy.jsx`, `Semana.jsx`, `Diario.jsx`, `Coach.jsx`, `Metas.jsx`, etc.
- Motores: `phases.js` (fases y semana sugerida), `nutrition.js`, `foods.js`, `product.js`, `coach.js`, `store.jsx`.
- Entidades para Base44: los archivos `.json` con nombre de entidad (`Perfil.json`, `Meta.json`, `Fase.json`…).
- `coach_sistema.md`: prompt del coach. `BASE44.md` y `APPLE_SALUD.md`: guías.

## Base científica

Las reglas del motor de fases y de nutrición están documentadas en `phases.js` y `nutrition.js`: ACSM 2009 (progresión en fuerza), Schoenfeld y cols. 2016 (frecuencia), Morton y cols. 2018 e ISSN 2017 (proteína), Helms y cols. 2014 (ritmo de pérdida de peso), Byrne y cols. 2018 (pausas en mantención), ACSM/AND/DC 2016 (carbohidratos según carga), OMS 2020 y PROT-AGE 2013 (adultos mayores). El coach entrega orientación general y no reemplaza a un profesional de la salud.

---
© EduSoftCare. Todos los derechos reservados.
