const crypto = require('node:crypto');
const { get, run, query } = require('../../database/db.js');

const JWT_SECRET = process.env.JWT_SECRET || 'chave-secreta-escola-design-segura-2026-ptbr-super-forte';
const TOKEN_EXPIRY_HOURS = 24;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

function verifyPassword(password, storedHash) {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch (err) {
    return false;
  }
}

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

function generateToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + (TOKEN_EXPIRY_HOURS * 3600);
  const fullPayload = { ...payload, exp };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyToken(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Token expirado
    }

    return payload;
  } catch (err) {
    return null;
  }
}

function authenticate(login, password) {
  if (!login || !password) {
    throw new Error('Login e senha são obrigatórios.');
  }

  const user = get('SELECT id, nome, login, senha_hash, foto, bio, papel, data_entrada FROM users WHERE login = ?', [login]);
  if (!user) {
    throw new Error('Credenciais inválidas.');
  }

  const isValid = verifyPassword(password, user.senha_hash);
  if (!isValid) {
    throw new Error('Credenciais inválidas.');
  }

  const token = generateToken({
    id: user.id,
    login: user.login,
    nome: user.nome,
    papel: user.papel
  });

  const { senha_hash, ...userProfile } = user;
  return { user: userProfile, token };
}

function getUserById(id) {
  const user = get('SELECT id, nome, login, foto, bio, papel, data_entrada, created_at FROM users WHERE id = ?', [id]);
  return user || null;
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  authenticate,
  getUserById
};
