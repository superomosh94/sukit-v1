interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  enabled: boolean;
  isRtl: boolean;
}
interface TranslationKey {
  id: string;
  key: string;
  group: string;
  translations: Record<string, string>;
}
const languages: Language[] = [
  {
    id: '1',
    code: 'en',
    name: 'English',
    nativeName: 'English',
    enabled: true,
    isRtl: false,
  },
  {
    id: '2',
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    enabled: true,
    isRtl: false,
  },
  {
    id: '3',
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    enabled: false,
    isRtl: false,
  },
  {
    id: '4',
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    enabled: false,
    isRtl: false,
  },
  {
    id: '5',
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    enabled: false,
    isRtl: true,
  },
];
const translationKeys: TranslationKey[] = [];
let nid = 6;
export class TranslationController {
  async listLanguages() {
    return languages;
  }
  async toggleLanguage(code: string) {
    const l = languages.find((x) => x.code === code);
    if (!l) throw new Error('Language not found');
    l.enabled = !l.enabled;
    return l;
  }
  async listKeys(query?: { group?: string; search?: string }) {
    let r = translationKeys;
    if (query?.group) r = r.filter((x) => x.group === query.group);
    if (query?.search)
      r = r.filter(
        (x) =>
          x.key.includes(query.search!) ||
          Object.values(x.translations).some((v) => v.includes(query.search!))
      );
    return r;
  }
  async createKey(data: any) {
    const k: TranslationKey = {
      id: String(nid++),
      key: data.key,
      group: data.group || 'general',
      translations: data.translations || {},
    };
    translationKeys.push(k);
    return k;
  }
  async updateKey(id: string, data: any) {
    const idx = translationKeys.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error('Key not found');
    Object.assign(translationKeys[idx], data);
    return translationKeys[idx];
  }
  async deleteKey(id: string) {
    const idx = translationKeys.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error('Key not found');
    translationKeys.splice(idx, 1);
    return { success: true };
  }
  async updateTranslation(keyId: string, langCode: string, value: string) {
    const k = translationKeys.find((x) => x.id === keyId);
    if (!k) throw new Error('Key not found');
    k.translations[langCode] = value;
    return k;
  }
  async getExport() {
    return {
      language: languages.filter((l) => l.enabled),
      keys: translationKeys,
    };
  }
}
