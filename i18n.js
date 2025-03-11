import { I18nManager } from "react-native";
import memoize from "lodash.memoize";
import { I18n } from "i18n-js";

const i18n = new I18n();

export const translationGetters = {
  en: () => require("./assets/translations/en.json"),
  es: () => require("./assets/translations/es.json"),
  fr: () => require("./assets/translations/fr.json"),
  it: () => require("./assets/translations/it.json"),
  pt: () => require("./assets/translations/pt.json"),
  de: () => require("./assets/translations/de.json"),
  ja: () => require("./assets/translations/ja.json"),
  ko: () => require("./assets/translations/ko.json"),
  zh: () => require("./assets/translations/zh.json")
};


const loadTranslations = async (locale) => {
  i18n.locale = locale;
  i18n.enableFallback = true;
  i18n.defaultLocale = 'en';
  i18n.translations = { [locale]: translationGetters[locale]() };
 };

export const translate = memoize(
  (key, config) => i18n.t(key, config),
  (key, config) => (config ? key + JSON.stringify(config) : key)
);

export const t = translate;

export const setI18nConfig = (codeLang) => {
  const fallback = { languageTag: 'en', isRTL: false };
  const lang = codeLang ? { languageTag: codeLang, isRTL: false } : null;
  const { languageTag, isRTL } = lang ? lang : fallback;
  I18nManager.forceRTL(isRTL);
  loadTranslations(languageTag);
};
