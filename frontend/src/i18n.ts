import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import pt from './locales/pt.json'

i18n
  .use(LanguageDetector) // detecta idioma do navegador automaticamente
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      pt: { translation: pt }
    },
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false // React já escapa por padrão
    },
    detection: {
      // Ordem de detecção: localStorage primeiro, depois navegador, depois HTML tag
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      // Cache a escolha no localStorage para persistir entre sessões
      caches: ['localStorage'],
      // Chave para armazenar no localStorage
      lookupLocalStorage: 'i18nextLng'
    }
  })

export default i18n
