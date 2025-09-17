// src/services/tokenStorage.ts
// Pequeño helper para centralizar la lectura/escritura del token en localStorage
// Diseñado para evitar ciclos y permitir que otros módulos (p. ej. AuthContext)
// manipulen el token sin importar axios o la instancia HTTP.

const TOKEN_KEY = 'portfolio_auth_token';

export function setToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    // Silenciar errores de storage en entornos restringidos
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {}
}

export default { setToken, getToken, clearToken };
