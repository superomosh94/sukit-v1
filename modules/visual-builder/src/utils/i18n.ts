import { useCallback } from 'react';

type Locale = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh';

const MESSAGES: Record<Locale, Record<string, string>> = {
  en: {
    'builder.title': 'Page Builder',
    'block.heading': 'Heading',
    'block.paragraph': 'Paragraph',
    'block.button': 'Button',
    'block.image': 'Image',
    'block.video': 'Video',
    'block.text': 'Text',
    'save.unsaved': 'Unsaved changes',
    'save.saving': 'Saving...',
    'save.saved': 'Saved',
    'a11y.alt_missing': 'Image is missing alt text for screen readers',
    'a11y.form_label_missing': 'Form field missing label',
    'a11y.fix': 'Fix',
  },
  es: {
    'builder.title': 'Constructor de Páginas',
    'block.heading': 'Encabezado',
    'block.paragraph': 'Párrafo',
    'block.button': 'Botón',
    'block.image': 'Imagen',
    'block.video': 'Vídeo',
    'block.text': 'Texto',
    'save.unsaved': 'Cambios sin guardar',
    'save.saving': 'Guardando...',
    'save.saved': 'Guardado',
    'a11y.alt_missing': 'La imagen no tiene texto alternativo',
    'a11y.form_label_missing': 'Campo de formulario sin etiqueta',
    'a11y.fix': 'Arreglar',
  },
  fr: {
    'builder.title': 'Constructeur de Pages',
    'block.heading': 'Titre',
    'block.paragraph': 'Paragraphe',
    'block.button': 'Bouton',
    'block.image': 'Image',
    'block.video': 'Vidéo',
    'block.text': 'Texte',
    'save.unsaved': 'Modifications non enregistrées',
    'save.saving': 'Enregistrement...',
    'save.saved': 'Enregistré',
    'a11y.alt_missing': "L'image n'a pas de texte alternatif",
    'a11y.form_label_missing': 'Champ de formulaire sans étiquette',
    'a11y.fix': 'Corriger',
  },
  de: {
    'builder.title': 'Seiteneditor',
    'block.heading': 'Überschrift',
    'block.paragraph': 'Absatz',
    'block.button': 'Schaltfläche',
    'block.image': 'Bild',
    'block.video': 'Video',
    'block.text': 'Text',
    'save.unsaved': 'Ungespeicherte Änderungen',
    'save.saving': 'Speichern...',
    'save.saved': 'Gespeichert',
    'a11y.alt_missing': 'Bild hat keinen Alternativtext',
    'a11y.form_label_missing': 'Formularfeld ohne Beschriftung',
    'a11y.fix': 'Beheben',
  },
  ja: {
    'builder.title': 'ページビルダー',
    'block.heading': '見出し',
    'block.paragraph': '段落',
    'block.button': 'ボタン',
    'block.image': '画像',
    'block.video': '動画',
    'block.text': 'テキスト',
    'save.unsaved': '未保存の変更',
    'save.saving': '保存中...',
    'save.saved': '保存済み',
    'a11y.alt_missing': '画像に代替テキストがありません',
    'a11y.form_label_missing': 'フォームフィールドにラベルがありません',
    'a11y.fix': '修正',
  },
  zh: {
    'builder.title': '页面构建器',
    'block.heading': '标题',
    'block.paragraph': '段落',
    'block.button': '按钮',
    'block.image': '图片',
    'block.video': '视频',
    'block.text': '文本',
    'save.unsaved': '未保存的更改',
    'save.saving': '保存中...',
    'save.saved': '已保存',
    'a11y.alt_missing': '图片缺少替代文本',
    'a11y.form_label_missing': '表单字段缺少标签',
    'a11y.fix': '修复',
  },
};

let currentLocale: Locale = 'en';

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function useTranslations() {
  const t = useCallback((key: string, fallback?: string): string => {
    return MESSAGES[currentLocale]?.[key] ?? fallback ?? key;
  }, []);

  return { t, locale: currentLocale, setLocale };
}
