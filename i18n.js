import { I18nManager } from "react-native";
import { I18n } from "i18n-js";
import memoize from "lodash.memoize";

export const DEFAULT_LANGUAGE = "en";
const i18n = new I18n();
let response = "";

const loadTranslations = async (locale, url) => {
 await fetch(`${url}/translations/${locale}.json`)
.then(res => {
      response = await res.json();
})
.catch(err => { 
      response = await fetch(`./assets/translations/${locale}.json`).json();
});
  
  i18n.translations = { [locale]: response };
  i18n.enableFallback = true;
  i18n.defaultLocale = DEFAULT_LANGUAGE;
  i18n.store(response);
};

export const translate = memoize(
  (key, config) => i18n.t(key, config),
  (key, config) => (config ? key + JSON.stringify(config) : key)
);

export const t = translate;

export const setI18nConfig = (codeLang, url) => {
  const fallback = { languageTag: DEFAULT_LANGUAGE, isRTL: false };
  const lang = codeLang ? { languageTag: codeLang, isRTL: false } : null;
  const { languageTag, isRTL } = lang ? lang : fallback;
  I18nManager.forceRTL(isRTL);
  i18n.locale = languageTag;
  loadTranslations(languageTag, url);
  return languageTag;
};
