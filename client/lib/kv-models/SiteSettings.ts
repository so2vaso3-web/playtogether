// Vercel KV SiteSettings Model
import { kvHelpers } from '../kv';
import { KV_PREFIXES } from '../kv-local';

export interface IFAQ {
  question: string;
  answer: string;
}

export interface ISiteSettings {
  id: string;
  logoUrl?: string;
  faviconUrl?: string;
  siteName?: string;
  siteDescription?: string;
  primaryColor?: string;
  secondaryColor?: string;
  zaloId?: string;
  zaloQrUrl?: string;
  // Hero Section
  heroTitle?: string;
  heroDescription?: string;
  heroPrimaryButtonText?: string;
  heroPrimaryButtonLink?: string;
  heroSecondaryButtonText?: string;
  heroSecondaryButtonLink?: string;
  // FAQ
  faqs?: IFAQ[];
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  // Social Links
  facebookUrl?: string;
  telegramUrl?: string;
  discordUrl?: string;
  youtubeUrl?: string;
  // Banner/Announcement
  bannerText?: string;
  bannerEnabled?: boolean;
  bannerLink?: string;
  updatedAt: Date | string;
  updatedBy?: string;
}

class SiteSettingsKV {
  private getKey(): string {
    return `${KV_PREFIXES.SETTINGS}main`;
  }

  async getSettings(): Promise<ISiteSettings> {
    try {
      let settings = await kvHelpers.get<any>(this.getKey());
      
      if (!settings) {
        // Create default settings
        const now = new Date();
        settings = {
          id: 'main',
          siteName: 'PlayTogether Hack',
          siteDescription: 'Premium Gaming Tools',
          primaryColor: '#a855f7',
          secondaryColor: '#ec4899',
          zaloId: '0896455341',
          heroTitle: 'PlayTogether Hack Store',
          heroDescription: 'Công cụ hack game hàng đầu với công nghệ Anti-Ban tiên tiến',
          heroPrimaryButtonText: 'Xem Gói Ngay',
          heroPrimaryButtonLink: '#packages',
          heroSecondaryButtonText: 'Hỗ Trợ',
          heroSecondaryButtonLink: '/support',
          faqs: [],
          metaTitle: 'PlayTogether Hack Store',
          metaDescription: 'Công cụ hack game hàng đầu',
          metaKeywords: 'hack game, playtogether, gaming tools',
          bannerEnabled: false,
          updatedAt: now.toISOString(),
        };
        await kvHelpers.set(this.getKey(), settings);
        return {
          ...settings,
          updatedAt: now,
        };
      }
      
      // Ensure all new fields are present with defaults
      const fullSettings: any = {
        ...settings,
        heroTitle: settings.heroTitle || 'PlayTogether Hack Store',
        heroDescription: settings.heroDescription || 'Công cụ hack game hàng đầu với công nghệ Anti-Ban tiên tiến',
        heroPrimaryButtonText: settings.heroPrimaryButtonText || 'Xem Gói Ngay',
        heroPrimaryButtonLink: settings.heroPrimaryButtonLink || '#packages',
        heroSecondaryButtonText: settings.heroSecondaryButtonText || 'Hỗ Trợ',
        heroSecondaryButtonLink: settings.heroSecondaryButtonLink || '/support',
        faqs: settings.faqs || [],
        metaTitle: settings.metaTitle || 'PlayTogether Hack Store',
        metaDescription: settings.metaDescription || 'Công cụ hack game hàng đầu',
        metaKeywords: settings.metaKeywords || 'hack game, playtogether, gaming tools',
        facebookUrl: settings.facebookUrl || '',
        telegramUrl: settings.telegramUrl || '',
        discordUrl: settings.discordUrl || '',
        youtubeUrl: settings.youtubeUrl || '',
        bannerText: settings.bannerText || '',
        bannerEnabled: settings.bannerEnabled !== undefined ? settings.bannerEnabled : false,
        bannerLink: settings.bannerLink || '',
      };
      
      // Convert updatedAt back to Date if it's a string
      if (fullSettings.updatedAt && typeof fullSettings.updatedAt === 'string') {
        fullSettings.updatedAt = new Date(fullSettings.updatedAt);
      }
      
      return fullSettings as ISiteSettings;
    } catch (error: any) {
      console.error('[SiteSettings] getSettings error:', error);
      // Return default on error
      return {
        id: 'main',
        siteName: 'PlayTogether Hack',
        siteDescription: 'Premium Gaming Tools',
        primaryColor: '#a855f7',
        secondaryColor: '#ec4899',
        zaloId: '0896455341',
        updatedAt: new Date(),
      };
    }
  }

  async update(updates: Partial<Omit<ISiteSettings, 'id' | 'updatedAt'>>): Promise<ISiteSettings> {
    try {
      console.log('[SiteSettings] Updating with:', JSON.stringify(updates, null, 2));
      
      const current = await this.getSettings();
      console.log('[SiteSettings] Current settings:', JSON.stringify(current, null, 2));
      
      const now = new Date();
      const updated: any = {
        id: 'main',
        logoUrl: updates.logoUrl !== undefined ? updates.logoUrl : (current.logoUrl || ''),
        faviconUrl: updates.faviconUrl !== undefined ? updates.faviconUrl : (current.faviconUrl || ''),
        siteName: updates.siteName !== undefined ? updates.siteName : (current.siteName || 'PlayTogether Hack'),
        siteDescription: updates.siteDescription !== undefined ? updates.siteDescription : (current.siteDescription || 'Premium Gaming Tools'),
        primaryColor: updates.primaryColor !== undefined ? updates.primaryColor : (current.primaryColor || '#a855f7'),
        secondaryColor: updates.secondaryColor !== undefined ? updates.secondaryColor : (current.secondaryColor || '#ec4899'),
        zaloId: updates.zaloId !== undefined ? updates.zaloId : (current.zaloId || '0896455341'),
        zaloQrUrl: updates.zaloQrUrl !== undefined ? updates.zaloQrUrl : (current.zaloQrUrl || ''),
        // Hero Section
        heroTitle: updates.heroTitle !== undefined ? updates.heroTitle : (current.heroTitle || 'PlayTogether Hack Store'),
        heroDescription: updates.heroDescription !== undefined ? updates.heroDescription : (current.heroDescription || 'Công cụ hack game hàng đầu với công nghệ Anti-Ban tiên tiến'),
        heroPrimaryButtonText: updates.heroPrimaryButtonText !== undefined ? updates.heroPrimaryButtonText : (current.heroPrimaryButtonText || 'Xem Gói Ngay'),
        heroPrimaryButtonLink: updates.heroPrimaryButtonLink !== undefined ? updates.heroPrimaryButtonLink : (current.heroPrimaryButtonLink || '#packages'),
        heroSecondaryButtonText: updates.heroSecondaryButtonText !== undefined ? updates.heroSecondaryButtonText : (current.heroSecondaryButtonText || 'Hỗ Trợ'),
        heroSecondaryButtonLink: updates.heroSecondaryButtonLink !== undefined ? updates.heroSecondaryButtonLink : (current.heroSecondaryButtonLink || '/support'),
        // FAQ
        faqs: updates.faqs !== undefined ? updates.faqs : (current.faqs || []),
        // SEO
        metaTitle: updates.metaTitle !== undefined ? updates.metaTitle : (current.metaTitle || 'PlayTogether Hack Store'),
        metaDescription: updates.metaDescription !== undefined ? updates.metaDescription : (current.metaDescription || 'Công cụ hack game hàng đầu'),
        metaKeywords: updates.metaKeywords !== undefined ? updates.metaKeywords : (current.metaKeywords || 'hack game, playtogether, gaming tools'),
        // Social Links
        facebookUrl: updates.facebookUrl !== undefined ? updates.facebookUrl : (current.facebookUrl || ''),
        telegramUrl: updates.telegramUrl !== undefined ? updates.telegramUrl : (current.telegramUrl || ''),
        discordUrl: updates.discordUrl !== undefined ? updates.discordUrl : (current.discordUrl || ''),
        youtubeUrl: updates.youtubeUrl !== undefined ? updates.youtubeUrl : (current.youtubeUrl || ''),
        // Banner
        bannerText: updates.bannerText !== undefined ? updates.bannerText : (current.bannerText || ''),
        bannerEnabled: updates.bannerEnabled !== undefined ? updates.bannerEnabled : (current.bannerEnabled !== undefined ? current.bannerEnabled : false),
        bannerLink: updates.bannerLink !== undefined ? updates.bannerLink : (current.bannerLink || ''),
        updatedAt: now.toISOString(),
      };

      console.log('[SiteSettings] Merged settings:', JSON.stringify(updated, null, 2));
      
      await kvHelpers.set(this.getKey(), updated);
      console.log('[SiteSettings] Settings saved successfully');
      
      // Verify it was saved correctly
      const verified = await kvHelpers.get<any>(this.getKey());
      if (verified) {
        // Convert updatedAt back to Date
        if (typeof verified.updatedAt === 'string') {
          verified.updatedAt = new Date(verified.updatedAt);
        }
        console.log('[SiteSettings] Verified saved settings:', JSON.stringify(verified, null, 2));
        return verified as ISiteSettings;
      }
      
      return {
        ...updated,
        updatedAt: now,
      } as ISiteSettings;
    } catch (error: any) {
      console.error('[SiteSettings] Update error:', error);
      console.error('[SiteSettings] Update error stack:', error.stack);
      throw error;
    }
  }

  async findOne(): Promise<ISiteSettings | null> {
    return await this.getSettings();
  }

  async create(data: Partial<ISiteSettings>): Promise<ISiteSettings> {
    const now = new Date();
    const settings: any = {
      id: 'main',
      siteName: 'PlayTogether Hack',
      siteDescription: 'Premium Gaming Tools',
      primaryColor: '#a855f7',
      secondaryColor: '#ec4899',
      zaloId: '0896455341',
      ...data,
      updatedAt: now.toISOString(),
    };

    await kvHelpers.set(this.getKey(), settings);
    return {
      ...settings,
      updatedAt: now,
    } as ISiteSettings;
  }
}

export const SiteSettings = new SiteSettingsKV();
export default SiteSettings;
