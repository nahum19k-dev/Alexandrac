# Métricas de lectura y avisos de Telegram

La página envía eventos a un receptor independiente. El token de Telegram y el Chat ID se guardan como secretos del servicio, fuera del repositorio público.

## Qué se registra

| Dato | Definición |
| --- | --- |
| Apertura | Una carga de la página; no identifica a una persona. |
| Inicio de recorrido | Al entrar al cielo, después de pulsar «Leer la carta». |
| Lectura por fragmento | Tiempo con la carta visible y la pestaña en primer plano. La foto ampliada pausa este contador. |
| Tiempo leyendo | Suma de los seis contadores de lectura. |
| Tiempo total | Desde el inicio del recorrido hasta cerrarse el último fragmento; incluye navegación y pausas. |
| Finalización | Se cerraron los seis fragmentos con «Siguiente» / «Ver el cielo». No demuestra comprensión del texto. |
| Repetición | Nuevo recorrido desde «Volver a recorrer las estrellas». El servidor cuenta recorridos del mismo identificador anónimo de navegador. |
| Salida anticipada | Último estado enviado al salir, recargar o cerrar la página. |

Los identificadores se guardan localmente. Otro navegador, modo privado o borrar sus datos produce un identificador distinto. No son un conteo fiable de personas únicas.

## Avisos

Se notifican apertura, inicio, cierre de cada fragmento, apertura de foto, finalización y salida anticipada. El mensaje final resume tiempo de lectura, duración total, detalle por fragmento y repeticiones.

Los puntos de control de cada 15 segundos y los cambios de visibilidad se guardan sin enviar un mensaje por cada uno. Los eventos se deduplican en la base de datos; los avisos usan una cola persistente con reintentos acotados. Un fallo ambiguo de red hacia Telegram puede producir una repetición de mensaje durante un reintento.

La detección de cierre usa `pagehide` y `sendBeacon`: es una entrega de mejor esfuerzo. Si se fuerza el cierre del navegador, se pierde la conexión o el sistema termina el proceso, puede faltar el último aviso; queda el último punto de control recibido. No se garantiza un aviso de cierre ni un plazo fijo de entrega.

## Modo administrador

Añadir `?admin=1` al enlace desactiva completamente la recogida y el envío desde esa visita. No se genera sesión de métricas ni se cuenta como repetición. Este parámetro es un modo de prueba, no una credencial de acceso.

## Servicio

La implementación está en la carpeta local `telegram-service`, que tiene su propio repositorio de Sites y no se incluye en el repositorio público de la página. Su identidad se conserva en `.openai/hosting.json`.

- Receptor: `https://alexandra-metricas-lectura.regalantelope2.chatgpt.site`.
- Variables privadas: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `SESSION_SECRET`.
- Origen permitido: `https://nahum19k-dev.github.io`.
- Sesiones de recogida firmadas, validación de eventos y límites de frecuencia.
- Base de datos con sesiones, recorridos, eventos y cola de notificaciones. No hay un endpoint público para leer el historial.

El usuario autorizó abrir el receptor para recibir eventos desde GitHub Pages. El servicio tiene acceso público, pero su API solo ofrece recogida de eventos y comprobación de estado; no publica el historial ni las credenciales. Antes de anunciar avisos operativos, comprobar el envío real y el estado de la cola de Telegram.

## Pruebas

Cliente: `node --test tests/metrics-client.test.mjs` desde la raíz de la página.

Servidor: `node --test tests/worker.test.mjs` desde `telegram-service` (Node 24, SQLite integrado).

Las pruebas automatizadas interceptan Telegram: no generan avisos reales. La revisión visual usa `?admin=1` o interceptación de solicitudes para evitar contaminar estadísticas.
