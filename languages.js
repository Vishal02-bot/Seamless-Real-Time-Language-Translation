// Supported Languages configuration
const SUPPORTED_LANGUAGES = [
  { code: 'auto', name: 'Auto Detect', native: 'Detect Language', flag: '✨', sourceOnly: true },
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸', speechCode: 'en-US' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸', speechCode: 'es-ES' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷', speechCode: 'fr-FR' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪', speechCode: 'de-DE' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', speechCode: 'hi-IN' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵', speechCode: 'ja-JP' },
  { code: 'zh', name: 'Chinese (Simplified)', native: '简体中文', flag: '🇨🇳', speechCode: 'zh-CN' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', speechCode: 'ar-SA', rtl: true },
  { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺', speechCode: 'ru-RU' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹', speechCode: 'pt-PT' },
  { code: 'it', name: 'Italian', native: 'Italiano', flag: '🇮🇹', speechCode: 'it-IT' },
  { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷', speechCode: 'ko-KR' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands', flag: '🇳🇱', speechCode: 'nl-NL' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷', speechCode: 'tr-TR' },
  { code: 'pl', name: 'Polish', native: 'Polski', flag: '🇵🇱', speechCode: 'pl-PL' },
  { code: 'sv', name: 'Swedish', native: 'Svenska', flag: '🇸🇪', speechCode: 'sv-SE' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩', speechCode: 'id-ID' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳', speechCode: 'vi-VN' },
  { code: 'th', name: 'Thai', native: 'ไทย', flag: '🇹🇭', speechCode: 'th-TH' },
  { code: 'el', name: 'Greek', native: 'Ελληνικά', flag: '🇬🇷', speechCode: 'el-GR' },
  { code: 'cs', name: 'Czech', native: 'Čeština', flag: '🇨🇿', speechCode: 'cs-CZ' },
  { code: 'da', name: 'Danish', native: 'Dansk', flag: '🇩🇰', speechCode: 'da-DK' },
  { code: 'fi', name: 'Finnish', native: 'Suomi', flag: '🇫🇮', speechCode: 'fi-FI' },
  { code: 'no', name: 'Norwegian', native: 'Norsk', flag: '🇳🇴', speechCode: 'no-NO' },
  { code: 'uk', name: 'Ukrainian', native: 'Українська', flag: '🇺🇦', speechCode: 'uk-UA' },
  { code: 'he', name: 'Hebrew', native: 'עברית', flag: '🇮🇱', speechCode: 'he-IL', rtl: true },
  { code: 'fa', name: 'Persian', native: 'فارسی', flag: '🇮🇷', speechCode: 'fa-IR', rtl: true },
  { code: 'ur', name: 'Urdu', native: 'اردو', flag: '🇵🇰', speechCode: 'ur-PK', rtl: true },
  { code: 'ro', name: 'Romanian', native: 'Română', flag: '🇷🇴', speechCode: 'ro-RO' },
  { code: 'hu', name: 'Hungarian', native: 'Magyar', flag: '🇭🇺', speechCode: 'hu-HU' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇧🇩', speechCode: 'bn-BD' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳', speechCode: 'mr-IN' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', speechCode: 'ta-IN' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', speechCode: 'te-IN' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳', speechCode: 'gu-IN' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳', speechCode: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳', speechCode: 'ml-IN' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳', speechCode: 'pa-IN' },
  { code: 'ms', name: 'Malay', native: 'Bahasa Melayu', flag: '🇲🇾', speechCode: 'ms-MY' },
  { code: 'fil', name: 'Filipino', native: 'Filipino', flag: '🇵🇭', speechCode: 'fil-PH' },
  { code: 'sw', name: 'Swahili', native: 'Kiswahili', flag: '🇰🇪', speechCode: 'sw-KE' },
  { code: 'af', name: 'Afrikaans', native: 'Afrikaans', flag: '🇿🇦', speechCode: 'af-ZA' },
  { code: 'hr', name: 'Croatian', native: 'Hrvatski', flag: '🇭🇷', speechCode: 'hr-HR' },
  { code: 'sk', name: 'Slovak', native: 'Slovenčina', flag: '🇸🇰', speechCode: 'sk-SK' },
  { code: 'bg', name: 'Bulgarian', native: 'Български', flag: '🇧🇬', speechCode: 'bg-BG' },
  { code: 'sr', name: 'Serbian', native: 'Српски', flag: '🇷🇸', speechCode: 'sr-RS' },
  { code: 'ca', name: 'Catalan', native: 'Català', flag: '🇪🇸', speechCode: 'ca-ES' },
  { code: 'lt', name: 'Lithuanian', native: 'Lietuvių', flag: '🇱🇹', speechCode: 'lt-LT' },
  { code: 'lv', name: 'Latvian', native: 'Latviešu', flag: '🇱🇻', speechCode: 'lv-LV' },
  { code: 'sl', name: 'Slovenian', native: 'Slovenščina', flag: '🇸🇮', speechCode: 'sl-SI' },
  { code: 'et', name: 'Estonian', native: 'Eesti', flag: '🇪🇪', speechCode: 'et-EE' }
];

// Popular quick selection languages for chips
const POPULAR_LANGUAGES = ['en', 'es', 'fr', 'de', 'hi', 'ja', 'zh'];

// Helper to look up a language by code
function getLanguageByCode(code) {
  return SUPPORTED_LANGUAGES.find(l => l.code === code) || null;
}
