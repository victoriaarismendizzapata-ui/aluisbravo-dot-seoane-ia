# SeoaIA

Plataforma educativa en desarrollo para el IESTP Manuel Seoane Corrales.

## Publicar en Render
1. En Render, crea un **Web Service** y conecta este repositorio.
2. Build Command: `npm install`.
3. Start Command: `npm start`.
4. Añade `OPENAI_API_KEY` en **Environment** de Render. No escribas la clave en archivos ni la subas a GitHub.
5. Cuando termine el despliegue, abre `/api/status` para comprobar el estado del servidor.

## Variables
- `OPENAI_API_KEY`: clave privada del proveedor de IA (configurar en Render).
- `OPENAI_MODEL`: modelo disponible para la cuenta; por defecto `gpt-4o-mini`.
- `PORT`: Render lo asigna automáticamente.

## Estado actual y límites
Esta es la base inicial de despliegue, no una versión final del sistema completo. Los sílabos PDF, herramientas de imagen/video, voz avanzada, autenticación e integración con datos académicos oficiales aún requieren integración y pruebas por separado. No se deben presentar como funciones terminadas hasta verificarlas.
