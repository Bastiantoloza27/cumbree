# Llevar Cumbre a Base44

Hay dos caminos. El **A** es el más rápido para tener la app real funcionando.

## Camino A — Importar el repositorio en Base44 (Base Code)

1. En Base44, abre **Base Code** → **Connect GitHub** (o pega la URL de este repositorio).
2. Selecciona la rama `main` y conecta. Base44 levanta la vista previa del proyecto (React + Vite).
3. Pide al builder de Base44, en este orden:
   1. *"Crea las entidades definidas en los archivos JSON de la raíz con nombre de entidad (Perfil.json, Meta.json, Fase.json, etc.; uno por entidad) con reglas de acceso para que cada usuario solo lea y escriba sus propios registros (created_by = usuario actual)."*
   2. *"Activa el inicio de sesión de Base44 y reemplaza `store.jsx` por un adaptador que use el SDK de Base44 (`base44.entities.<Entidad>.list/create/update/delete`) manteniendo la misma interfaz `useStore()` (perfil, data, update, sumarXP)."*
   3. *"Reemplaza `llamarModelo()` de `coach.js` por la integración `InvokeLLM` de Base44 (o una función de backend), usando `coach_sistema.md` como prompt de sistema y el texto de `contexto()` como contexto. Para fotos, sube la imagen con `UploadFile` y pásala como `file_urls`."*
   4. *"Crea la función de backend `importar_salud` según `APPLE_SALUD.md`."*
   5. *"Guarda las fotos de progreso con `UploadFile` en vez de base64."*

> Base Code entrega una vista previa de desarrollo; Base44 indica que conectar un repositorio no configura entidades ni login automáticamente, por eso los pasos 3.1 y 3.2.

## Camino B — Construirla nativa en Base44 con prompts

Crea una app nueva en Base44 y pega este prompt inicial:

```
Crea "Cumbre", app móvil en español de Chile de nutrición, entrenamiento y metas a largo plazo.
Desarrollada por EduSoftCare (mostrar "Desarrollada por EduSoftCare" en portada y pie).
Identidad: fondo #EEF3EF, verde bosque #0F2A22, acento volt #C8F03C, rachas #F2643D.
Tipografías: Bricolage Grotesque (títulos) y Manrope (texto). Logo: un check cuya subida dibuja una
montaña, con un punto volt en la cima. Temas por perfil: bosque, océano, rosa, atardecer, violeta.
Usa las entidades de los archivos JSON del repositorio. Cada usuario ve solo sus datos.
Pantallas: Portada, Datos base (Mifflin-St Jeor), Crear meta (3 pasos: meta y fecha, dimensiones, hitos),
Fases, Hoy, Semana (tachar), Semana sugerida, Editar semana, Diario (desayuno, almuerzo, once, cena,
colación), Analizar producto (Open Food Facts + sellos Ley 20.606), Coach (InvokeLLM), Registrar (+),
Sesión de fuerza, Partido de pádel, Medidas y fotos, Retos, Revisión del domingo, Progreso, Perfil.
Barra inferior: Hoy, Diario, +, Semana, Metas, Coach.
```

Luego copia la lógica de `phases.js` (motor de fases y semana sugerida) y `nutrition.js` como funciones de backend, para que el plan lo calculen reglas fijas y no la IA.

## Entidades

21 entidades (archivos JSON en la raíz): Perfil, Meta, Dimension, Hito, Fase, Actividad, Sesion, SerieFuerza, PartidoPadel, Alimento, RegistroComida, AnalisisProducto, Medicion, FotoProgreso, Agua, Reto, RevisionSemanal, MensajeCoach, LogroXP, ObjetivoSemanal, CheckDiario.

## Seguridad

- La clave de la API de IA va solo en el servidor (secretos de Base44), nunca en el cliente.
- Reglas de acceso por usuario en todas las entidades con datos personales.
- Fotos de progreso privadas.
