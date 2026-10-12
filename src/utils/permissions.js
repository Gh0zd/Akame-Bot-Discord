'use strict';

const { PermissionsBitField } = require('discord.js');
const { translate } = require('./i18n');

const humanize = (name) => name.replace(/([a-z])([A-Z])/g, '$1 $2');

/** Nombre legible (y traducido, si existe) de un permiso de Discord. */
const permissionName = (language, permission) => {
  const key = `permissions.${permission}`;
  const translated = translate(language, key);
  return translated === key ? humanize(permission) : translated;
};

/** Devuelve los nombres de los permisos de `required` que faltan en `held` (PermissionsBitField). */
const missingPermissions = (held, required = []) => (required.length ? new PermissionsBitField(held).missing(required) : []);

const formatPermissions = (language, permissions) =>
  permissions.map((permission) => `\`${permissionName(language, permission)}\``).join(', ');

module.exports = { permissionName, missingPermissions, formatPermissions };
