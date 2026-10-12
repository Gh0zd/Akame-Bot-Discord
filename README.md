# Akame Bot Discord

Bot de Discord desarrollado con **discord.js v14**, **Node.js** y **SQLite**. Incluye comandos de utilidad, diversión, información y configuración, además de un sistema de bienvenidas personalizable. La interfaz y los comandos están disponibles en español, inglés y portugués.

## Características

- Comandos slash y componentes interactivos: botones, menús y modales.
- Preferencias de idioma por usuario y por servidor (`es`, `en` y `pt`).
- Configuración y almacenamiento persistentes con SQLite.
- Bienvenidas con tarjetas **Minimal** o **Panorama**, mensajes personalizables y vista previa privada.
- Seguimiento de invitaciones para ofrecer marcadores de bienvenida relacionados.
- Conteo de besos y abrazos, al igual que el bot de Nekotina.
## Requisitos

- **Node.js 22 o superior**.
- Una aplicación y un bot creados en el [Discord Developer Portal](https://discord.com/developers/applications).
- Activar el intent privilegiado **Server Members Intent** en *Bot → Privileged Gateway Intents*.

## Instalación y configuración

1. Clona el repositorio e instala las dependencias:

   ```bash
   git clone https://github.com/Gh0zd/Akame-Bot-Discord.git
   cd Akame-Bot-Discord
   npm ci
   ```

2. Crea un archivo `.env` en la raíz del proyecto y añade la configuración:

   ```dotenv
   DISCORD_TOKEN=token_del_bot
   CLIENT_ID=id_de_la_aplicacion
   OWNER_IDS=id_de_usuario
   ```

   `OWNER_IDS` admite varios ID separados por comas. No compartas ni subas el archivo `.env` ni el token del bot.

3. Registra los comandos slash y arranca el bot:

   ```bash
   npm run deploy
   npm start
   ```

   Ejecuta `npm run deploy` de nuevo cuando cambien los comandos.

### Variables de entorno

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `DISCORD_TOKEN` | Sí | Token privado del bot. |
| `CLIENT_ID` | Sí | ID de la aplicación de Discord. |
| `OWNER_IDS` | Sí | ID o IDs de los propietarios, separados por comas. |
| `SUPPORT_GUILD_ID` | Según configuración | Servidor para los comandos de desarrollador y el registro de comandos de servidor. Requerido si `SLASH_GLOBAL=false`. |
| `SLASH_GLOBAL` | No | Registra comandos públicos globalmente. Valor predeterminado: `true`. |
| `AUTO_DEPLOY` | No | Registra los comandos al iniciar el bot. Valor predeterminado: `false`. |
| `DEFAULT_LANGUAGE` | No | Idioma predeterminado: `es`, `en` o `pt`. Valor predeterminado: `es`. |
| `DATABASE_PATH` | No | Ruta de la base de datos SQLite. Valor predeterminado: `./data/akame.sqlite`. |


## Idiomas

El idioma se determina por preferencia del usuario, idioma del servidor y, por último, `DEFAULT_LANGUAGE`. Si falta una traducción, se recurre al idioma predeterminado y luego al inglés.

- `/language me` configura el idioma personal.
- `/language server` configura el idioma del servidor y requiere **Gestionar servidor**.
- `/language view` muestra la configuración; `/language reset` restablece el idioma personal o el del servidor, según el ámbito elegido.

Al añadir o modificar textos, actualiza los tres archivos de `src/locales/`: `es.json`, `en.json` y `pt.json`.

## Pruebas

```bash
npm test
```

## Estructura del proyecto

```text
.
├── deploy-commands.js
├── index.js
├── src/
│   ├── commands/       # Comandos slash
│   ├── components/     # Botones, menús y modales
│   ├── database/       # SQLite, migraciones y repositorios
│   ├── events/         # Eventos de Discord
│   ├── handlers/       # Carga y ejecución de comandos y eventos
│   ├── locales/        # Traducciones en inglés, español y portugués
│   └── utils/          # Utilidades compartidas
└── test/               # Pruebas automatizadas
```

## Añadir un comando

Crea un archivo en la categoría correspondiente dentro de `src/commands/`, define el comando con `SlashCommandBuilder` y usa las claves de `src/locales/` para sus textos. Mantén las traducciones de los tres idiomas sincronizadas y ejecuta `npm test`.
