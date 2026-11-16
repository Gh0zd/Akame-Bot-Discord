<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=Akame-Bot-Discord&fontSize=70&fontAlignY=35&animation=twinkling&fontColor=gradient" alt="Banner de Akame-Bot-Discord"/>

  <p>
    <img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fapi.github.com%2Frepos%2FGh0zd%2FAkame-Bot-Discord&query=%24.archived&style=for-the-badge&label=Archivado&color=brightgreen" alt="Estado de archivo"/>
    <img src="https://img.shields.io/github/last-commit/Gh0zd/Akame-Bot-Discord?style=for-the-badge&label=%C3%9Altimo%20Commit" alt="Último Commit"/>
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
    <img src="https://img.shields.io/badge/discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="discord.js"/>
    <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite"/>
  </p>

  <p>
    <strong>Bot de Discord desarrollado con discord.js v14, Node.js y SQLite con soporte multilingüe, sistema de bienvenidas personalizable y comandos de utilidad, diversión e información.</strong>
  </p>
</div>

---

> [!WARNING]
> No compartas ni subas el archivo `.env` ni el token privado del bot al repositorio.

## Características

* **Comandos slash e interacción:** Soporte para comandos slash y componentes interactivos como botones, menús y modales.
* **Soporte multilingüe:** Interfaz y comandos disponibles en español, inglés y portugués con preferencias por usuario y por servidor (`es`, `en` y `pt`).
* **Persistencia con SQLite:** Almacenamiento y configuración persistentes mediante base de datos SQLite local.
* **Sistema de bienvenidas:** Tarjetas visuales en estilos **Minimal** o **Panorama**, mensajes personalizables y vista previa privada.
* **Seguimiento de invitaciones:** Detección de invitaciones para ofrecer marcadores dinámicos en los mensajes de bienvenida.
* **Interacciones sociales:** Conteo de besos y abrazos inspirado en el funcionamiento de Nekotina.

## Requisitos

* **Node.js 22 o superior**.
* Una aplicación y un bot creados en el [Discord Developer Portal](https://discord.com/developers/applications).
* Activar el intent privilegiado **Server Members Intent** en *Bot → Privileged Gateway Intents*.

## Instalación e inicio rápido

1. Clona el repositorio e instala las dependencias:

   ~~~bash
   git clone https://github.com/Gh0zd/Akame-Bot-Discord.git
   cd Akame-Bot-Discord
   npm ci
   ~~~

2. Crea un archivo `.env` en la raíz del proyecto y añade la configuración básica:

   ~~~dotenv
   DISCORD_TOKEN=token_del_bot
   CLIENT_ID=id_de_la_aplicacion
   OWNER_IDS=id_de_usuario
   ~~~

   `OWNER_IDS` admite múltiples identificadores separados por comas.

3. Registra los comandos slash y arranca el bot:

   ~~~bash
   npm run deploy
   npm start
   ~~~

> [!TIP]
> Ejecuta `npm run deploy` nuevamente cada vez que añadas o modifiques la definición de los comandos.

## Configuración y variables de entorno

| Variable | Requerida | Descripción |
| :--- | :--- | :--- |
| `DISCORD_TOKEN` | Sí | Token privado del bot. |
| `CLIENT_ID` | Sí | ID de la aplicación de Discord. |
| `OWNER_IDS` | Sí | ID o IDs de los propietarios, separados por comas. |
| `SUPPORT_GUILD_ID` | Condicional | Servidor para comandos de desarrollador y registro local. Requerido si `SLASH_GLOBAL=false`. |
| `SLASH_GLOBAL` | No | Registra comandos públicos globalmente. Valor predeterminado: `true`. |
| `AUTO_DEPLOY` | No | Registra los comandos automáticamente al iniciar el bot. Valor predeterminado: `false`. |
| `DEFAULT_LANGUAGE` | No | Idioma predeterminado (`es`, `en` o `pt`). Valor predeterminado: `es`. |
| `DATABASE_PATH` | No | Ruta del archivo de base de datos SQLite. Valor predeterminado: `./data/akame.sqlite`. |

### Scripts disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm start` | Inicia la ejecución del bot. |
| `npm run deploy` | Registra o actualiza los comandos slash en Discord. |
| `npm test` | Ejecuta la suite de pruebas automatizadas. |

## Idiomas y desarrollo

El idioma de respuesta se resuelve siguiendo este orden de prioridad: preferencia del usuario, configuración del servidor y, finalmente, `DEFAULT_LANGUAGE`. Si falta una clave de traducción, el sistema recurre al idioma predeterminado y luego al inglés.

| Comando | Permisos requeridos | Descripción |
| :--- | :--- | :--- |
| `/language me` | Ninguno | Configura el idioma personal del usuario. |
| `/language server` | Gestionar servidor | Configura el idioma predeterminado del servidor. |
| `/language view` | Ninguno | Muestra la configuración de idioma activa. |
| `/language reset` | Según ámbito | Restablece el idioma personal o el del servidor. |

> [!NOTE]
> Para añadir un nuevo comando, crea un archivo dentro de la categoría correspondiente en `src/commands/` usando `SlashCommandBuilder`, referencia las claves de traducción en los tres archivos de `src/locales/` (`es.json`, `en.json`, `pt.json`) y verifica la integridad ejecutando `npm test`.

## Estructura del proyecto

~~~text
.
├── deploy-commands.js    # Script de registro de comandos slash
├── index.js              # Punto de entrada principal del bot
├── src/
│   ├── commands/         # Definición de comandos slash por categoría
│   ├── components/       # Manejadores de botones, menús y modales
│   ├── database/         # Conexión SQLite, migraciones y repositorios
│   ├── events/           # Listeners de eventos de Discord
│   ├── handlers/         # Carga y ejecución dinámica de comandos y eventos
│   ├── locales/          # Archivos de traducción (es, en, pt)
│   └── utils/            # Funciones y utilidades compartidas
└── test/                 # Pruebas automatizadas
~~~

## Capturas

<p align="center">
  <img src="https://i.postimg.cc/6qTQYGkv/photo-collage.png" alt="Capturas de pantalla de las funciones y comandos de Akame-Bot-Discord" width="80%"/>
</p>
