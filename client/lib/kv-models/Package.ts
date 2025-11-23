// Vercel KV Package Model
import { kvHelpers } from '../kv';
import { KV_PREFIXES } from '../kv-local';

export interface FeatureDetail {
  name: string;
  description?: string;
  enabled?: boolean;
}

export interface TabFeatures {
  chung?: FeatureDetail[];
  map?: FeatureDetail[];
  contrung?: FeatureDetail[];
  cauca?: FeatureDetail[];
  thuthap?: FeatureDetail[];
  sukien?: FeatureDetail[];
  minigame?: FeatureDetail[];
  caidat?: FeatureDetail[];
}

export interface IPackage {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // days
  features: string[];
  detailedFeatures?: TabFeatures;
  icon?: string;
  popular: boolean;
  platform: 'android' | 'ios' | 'emulator' | 'all';
  downloadUrl?: string;
  systemRequirements?: string;
  screenshots?: string[];
  version?: string;
  banRisk?: 'none' | 'low' | 'medium' | 'high';
  antiBanGuarantee?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class PackageKV {
  private getKey(id: string): string {
    return `${KV_PREFIXES.PACKAGE}${id}`;
  }

  private async getAllPackageIds(): Promise<string[]> {
    const all = await kvHelpers.get<string[]>(KV_PREFIXES.PACKAGE_ALL) || [];
    return all;
  }

  private async addToAllIndex(id: string): Promise<void> {
    const all = await this.getAllPackageIds();
    if (!all.includes(id)) {
      all.push(id);
      await kvHelpers.set(KV_PREFIXES.PACKAGE_ALL, all);
    }
  }

  private async removeFromAllIndex(id: string): Promise<void> {
    const all = await this.getAllPackageIds();
    const filtered = all.filter(pkgId => pkgId !== id);
    await kvHelpers.set(KV_PREFIXES.PACKAGE_ALL, filtered);
  }

  async create(data: Omit<IPackage, 'id' | 'createdAt' | 'updatedAt'>): Promise<IPackage> {
    const id = crypto.randomUUID();
    const now = new Date();
    
    const pkg: IPackage = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    await kvHelpers.set(this.getKey(id), pkg);
    await this.addToAllIndex(id);

    return pkg;
  }

  async findById(id: string): Promise<IPackage | null> {
    return await kvHelpers.get<IPackage>(this.getKey(id));
  }

  async findAll(): Promise<IPackage[]> {
    const ids = await this.getAllPackageIds();
    if (ids.length === 0) return [];

    const packages = await kvHelpers.mget<IPackage>(ids.map(id => this.getKey(id)));
    return packages.filter((pkg): pkg is IPackage => pkg !== null);
  }

  async update(id: string, updates: Partial<Omit<IPackage, 'id' | 'createdAt'>>): Promise<IPackage | null> {
    const pkg = await this.findById(id);
    if (!pkg) return null;

    const updated: IPackage = {
      ...pkg,
      ...updates,
      updatedAt: new Date(),
    };

    await kvHelpers.set(this.getKey(id), updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const pkg = await this.findById(id);
    if (!pkg) return false;

    await kvHelpers.del(this.getKey(id));
    await this.removeFromAllIndex(id);
    return true;
  }
}

export const Package = new PackageKV();
export default Package;

