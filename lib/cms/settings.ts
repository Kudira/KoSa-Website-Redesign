// Read site settings for public pages. Returns the merged value or default `{}`.

import { prisma } from '@/lib/prisma';
import type { SettingsKey, SettingsByKey } from '@/lib/admin/schemas/settings';

export async function getSetting<K extends SettingsKey>(key: K): Promise<Partial<SettingsByKey[K]>> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    return (row?.value as Partial<SettingsByKey[K]>) ?? ({} as Partial<SettingsByKey[K]>);
  } catch {
    return {} as Partial<SettingsByKey[K]>;
  }
}
