import crypto from 'crypto';
import { logger } from '../utils/logger.js';

// Configuración de cifrado
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // Para GCM, este es el estándar
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;

export interface EncryptedData {
  encryptedData: string;
  iv: string;
  tag: string;
  salt: string;
}

export class DataEncryption {
  /**
   * Genera una clave derivada usando PBKDF2
   */
  private static deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512');
  }

  /**
   * Genera una clave basada en información del usuario
   */
  private static generateUserKey(userId: string, userEmail: string): string {
    // Combinar información del usuario para crear una clave única
    const userInfo = `${userId}-${userEmail}-${process.env.ENCRYPTION_SECRET || 'fallback-secret'}`;
    return crypto.createHash('sha256').update(userInfo).digest('hex');
  }

  /**
   * Genera una clave basada en userId + passphrase del cliente (opcional)
   * Si passphrase es provista, se prioriza para permitir que el cliente descifre.
   */
  private static generateUserKeyFromPassphrase(userId: string, passphrase: string): string {
    const userInfo = `${userId}-${passphrase}`;
    return crypto.createHash('sha256').update(userInfo).digest('hex');
  }

  /**
   * Cifra datos sensibles
   */
  static encryptSensitiveData(
    data: any,
    userId: string,
    userEmail: string,
    passphrase?: string
  ): EncryptedData {
    const password = passphrase
      ? this.generateUserKeyFromPassphrase(userId, passphrase)
      : this.generateUserKey(userId, userEmail);
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = this.deriveKey(password, salt);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const jsonString = JSON.stringify(data);
    let encrypted = cipher.update(jsonString, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      salt: salt.toString('hex'),
    };
  }

  /**
   * Descifra datos sensibles
   */
  static decryptSensitiveData(
    encryptedPayload: EncryptedData,
    userId: string,
    userEmail: string,
    passphrase?: string
  ): any {
    try {
      const password = passphrase
        ? this.generateUserKeyFromPassphrase(userId, passphrase)
        : this.generateUserKey(userId, userEmail);
      const salt = Buffer.from(encryptedPayload.salt, 'hex');
      const iv = Buffer.from(encryptedPayload.iv, 'hex');
      const tag = Buffer.from(encryptedPayload.tag, 'hex');
      const key = this.deriveKey(password, salt);

      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encryptedPayload.encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted);
    } catch (error) {
      logger.error('Error al descifrar datos:', error);
      return null;
    }
  }

  /**
   * Identifica qué campos son sensibles
   */
  static getSensitiveFields(): string[] {
    return [
      'email',
      'phone',
      'location',
      'status', // estado actual del usuario
      'contacts', // información de contacto completa
    ];
  }

  /**
   * Separa datos públicos y sensibles
   */
  static separateData(userData: any): { public: any; sensitive: any } {
    const sensitiveFields = this.getSensitiveFields();
    const publicData: any = {};
    const sensitiveData: any = {};

    Object.keys(userData).forEach(key => {
      if (sensitiveFields.includes(key)) {
        sensitiveData[key] = userData[key];
      } else {
        publicData[key] = userData[key];
      }
    });

    return { public: publicData, sensitive: sensitiveData };
  }
}
