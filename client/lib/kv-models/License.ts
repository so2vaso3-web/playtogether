// Vercel KV License Model (stub for now)
import { kvHelpers } from '../kv';

export interface ILicense {
  id: string;
  userId: string;
  packageId: string;
  licenseKey: string;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class LicenseKV {
  private getKey(id: string): string {
    return `license:${id}`;
  }

  async findById(id: string): Promise<ILicense | null> {
    return await kvHelpers.get<ILicense>(this.getKey(id));
  }

  async findByLicenseKey(licenseKey: string): Promise<ILicense | null> {
    // Simple implementation - would need index in production
    return null;
  }

  async create(data: Omit<ILicense, 'id' | 'createdAt' | 'updatedAt'>): Promise<ILicense> {
    const id = crypto.randomUUID();
    const now = new Date();
    
    const license: ILicense = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    await kvHelpers.set(this.getKey(id), license);
    return license;
  }
}

export const License = new LicenseKV();
export default License;

