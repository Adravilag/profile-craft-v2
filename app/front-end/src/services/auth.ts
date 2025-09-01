// Pequeño servicio para gestionar el access token en memoria
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

export default { setAccessToken, getAccessToken, clearAccessToken };
