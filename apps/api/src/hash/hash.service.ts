import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  private readonly saltRounds = 10;

  /**
   * Encrypts a plain text password using bcrypt
   * @param plainText - The plain text password to hash
   * @returns A promise that resolves to the hashed password
   */
  async encrypt(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.saltRounds);
  }

  /**
   * Compares a plain text password with a hashed password
   * @param plainText - The plain text password to compare
   * @param hash - The hashed password to compare against
   * @returns A promise that resolves to true if passwords match, false otherwise
   */
  async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
