interface Named {
  name: string;
  nameAr: string;
  nameHe?: string;
}

/** Display name in the active language, falling back to the English name. */
export const localName = (item: Named, language: string): string => {
  if (language === 'ar') return item.nameAr || item.name;
  if (language === 'he') return item.nameHe || item.name;
  return item.name;
};
