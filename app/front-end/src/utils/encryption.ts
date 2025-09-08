// Utility para descifrado en el frontend usando Web Crypto API
export interface EncryptedData {
  encryptedData: string;
  iv: string;
  tag: string;
  salt: string;
}

export class ClientDecryption {
  /**
   * Convierte hex string a Uint8Array
   */
  private static hexToUint8Array(hexString: string): Uint8Array {
    const bytes = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
      bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
    }
    return bytes;
  }

  /**
   * Genera una clave derivada usando PBKDF2 (Web Crypto API)
   */
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const importedKey = await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, [
      'deriveKey',
    ]);

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt.buffer as ArrayBuffer,
        iterations: 100000,
        hash: 'SHA-512',
      },
      importedKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
  }

  /**
   * Genera una clave basada en información del usuario
   */
  private static async generateUserKey(userId: string, userEmail: string): Promise<string> {
    const userInfo = `${userId}-${userEmail}-fallback-secret`; // En producción usar variable de entorno
    const encoder = new TextEncoder();
    const data = encoder.encode(userInfo);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Descifra datos sensibles en el cliente
   */
  static async decryptSensitiveData(
    encryptedPayload: EncryptedData,
    userId: string,
    userEmail: string
  ): Promise<any> {
    try {
      const password = await this.generateUserKey(userId, userEmail);
      const salt = this.hexToUint8Array(encryptedPayload.salt);
      const iv = this.hexToUint8Array(encryptedPayload.iv);
      const tag = this.hexToUint8Array(encryptedPayload.tag);
      const encryptedData = this.hexToUint8Array(encryptedPayload.encryptedData);

      const key = await this.deriveKey(password, salt);

      // Combinar datos cifrados y tag para AES-GCM
      const encryptedWithTag = new Uint8Array(encryptedData.length + tag.length);
      encryptedWithTag.set(encryptedData);
      encryptedWithTag.set(tag, encryptedData.length);

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv.buffer as ArrayBuffer,
        },
        key,
        encryptedWithTag
      );

      const decoder = new TextDecoder();
      const decryptedString = decoder.decode(decryptedBuffer);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Error al descifrar datos en el cliente:', error);
      return null;
    }
  }

  /**
   * Combina datos públicos y descifrados
   */
  static async decryptProfile(profileData: any): Promise<any> {
    if (!profileData._hasEncryptedData || !profileData._encrypted) {
      return profileData;
    }

    try {
      const sensitiveData = await this.decryptSensitiveData(
        profileData._encrypted,
        profileData.id,
        profileData.email || 'fallback@email.com' // Fallback si no hay email público
      );

      // Combinar datos públicos con datos descifrados
      const { _encrypted, _hasEncryptedData, ...publicData } = profileData;
      return {
        ...publicData,
        ...sensitiveData,
      };
    } catch (error) {
      console.error('Error al descifrar perfil:', error);
      // Devolver solo datos públicos si falla el descifrado
      const { _encrypted, _hasEncryptedData, ...publicData } = profileData;
      return publicData;
    }
  }
}
