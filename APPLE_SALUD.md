# Importar datos de Apple Salud

Apple Salud no tiene API en la nube: los datos se leen desde el iPhone. Mientras Cumbre no sea una app nativa, se importan con un **Atajo** que corre cada noche.

## 1. Endpoint en Base44

Función de backend `importar_salud` (POST, autenticada con un token personal por usuario):

```json
{
  "token": "<token del usuario>",
  "fecha": "2026-10-08",
  "pasos": 9450,
  "sueno_h": 7.2,
  "kcal_activas": 640,
  "peso": 83.6,
  "entrenamientos": [
    { "id": "<UUID de Salud>", "tipo": "Pádel", "inicio": "2026-10-08T19:00:00", "minutos": 92, "kcal": 612, "distancia_km": 0 }
  ]
}
```

La función debe:
- Guardar pasos, sueño, kcal activas y peso en `Medicion` con `fuente = apple_salud`.
- Por cada entrenamiento, buscar por `external_id`; si no existe, crear la `Sesion` o el `PartidoPadel` y marcar como hecho el día del plan si coincide el tipo. **Nunca duplicar.**
- Sumar solo el `factor_kcal_ejercicio` del perfil (50% por defecto) a la meta del día.

## 2. Atajo en el iPhone

App Atajos → Automatización → Hora del día (23:00, diario) → Ejecutar sin preguntar:

1. **Buscar muestras de salud**: Pasos, hoy → Calcular suma.
2. **Buscar muestras de salud**: Análisis del sueño, últimas 24 h → sumar horas "dormido".
3. **Buscar muestras de salud**: Energía activa, hoy → Calcular suma.
4. **Buscar muestras de salud**: Peso corporal, más reciente hoy.
5. **Buscar entrenamientos** de hoy (o usar la app Health Auto Export para enviarlos con su automatización REST).
6. **Diccionario** con los campos de arriba.
7. **Obtener contenido de URL**: método POST, cuerpo JSON, URL de `importar_salud`.

## 3. Fase nativa (futuro)

Con una app nativa (Expo/React Native o Swift) se lee HealthKit directamente y el Atajo deja de ser necesario. El endpoint `importar_salud` se mantiene igual.
