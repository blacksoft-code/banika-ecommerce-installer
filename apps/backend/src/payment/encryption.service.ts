import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

@Injectable()
export class EncryptionService {
  private getKey(): Buffer {
    const key = process.env.MASTER_ENCRYPTION_KEY;
    if (!key || key.length !== 32) {
      throw new Error(
        'MASTER_ENCRYPTION_KEY must be set in .env and exactly 32 characters long.',
      );
    }
    return Buffer.from(key, 'utf-8');
  }

  encrypt(plainText: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, this.getKey(), iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf-8'), cipher.final()]);
    // iv-কে encrypted ডাটার সাথে জুড়ে একটাই string হিসেবে সেভ করছি (decrypt করার সময় আলাদা করে নেব)
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(cipherText: string): string {
    const [ivHex, encryptedHex] = cipherText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, this.getKey(), iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf-8');
  }
}