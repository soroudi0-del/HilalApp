var React = require('react');
var createContext = React.createContext;
var useState = React.useState;
var useEffect = React.useEffect;
var useContext = React.useContext;
var useMemo = React.useMemo;
var useCallback = React.useCallback;

var NativeModules = require('react-native').NativeModules;
var Platform = require('react-native').Platform;
var I18nManager = require('react-native').I18nManager;

var translations = require('./translations');

var AsyncStorage = require('@react-native-async-storage/async-storage');
var Storage = AsyncStorage.default || AsyncStorage;

var LanguageContext = createContext();

function getDeviceLanguage() {
  try {
    var locale = '';
    if (Platform.OS === 'ios') {
      var settings = NativeModules.SettingsManager;
      if (settings && settings.settings) {
        var langs = settings.settings.AppleLanguages;
        if (langs && langs.length > 0) locale = langs[0];
      }
    } else {
      var loc = NativeModules.I18nManager;
      if (loc && loc.localeIdentifier) locale = loc.localeIdentifier;
    }
    if (!locale) locale = 'fa';
    locale = locale.toLowerCase();
    if (locale.indexOf('ar') === 0) return 'ar';
    if (locale.indexOf('en') === 0) return 'en';
    return 'fa';
  } catch (e) {
    return 'fa';
  }
}

function LanguageProvider(props) {
  var deviceLang = getDeviceLanguage();
  var s1 = useState(deviceLang);
  var lang = s1[0];
  var setLangState = s1[1];
  var s2 = useState(false);
  var loaded = s2[0];
  var setLoaded = s2[1];

  // کش ترجمه فعلی
  var currentTranslation = useMemo(function() {
    return translations[lang] || translations.fa;
  }, [lang]);

  useEffect(function () {
    loadSavedLang();
  }, []);

  var loadSavedLang = async function () {
    try {
      var saved = await Storage.getItem('appLanguage');
      if (saved && translations[saved]) {
        setLangState(saved);
      }
    } catch (e) { }
    setLoaded(true);
  };

  var setLang = useCallback(async function (newLang) {
    if (!translations[newLang]) return;
    setLangState(newLang);
    try {
      await Storage.setItem('appLanguage', newLang);
    } catch (e) { }
    var isRTL = translations[newLang].dir === 'rtl';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
      I18nManager.allowRTL(isRTL);
    }
  }, []);

  var t = useCallback(function (key, params) {
    var text = currentTranslation[key];
    if (text === undefined) {
      text = translations.fa[key];
    }
    if (text === undefined) return key;
    if (typeof text !== 'string') return text;
    if (params) {
      var keys = Object.keys(params);
      for (var i = 0; i < keys.length; i++) {
        text = text.replace('{' + keys[i] + '}', params[keys[i]]);
      }
    }
    return text;
  }, [currentTranslation]);

  var tArray = useCallback(function (key) {
    var arr = currentTranslation[key];
    if (!arr) arr = translations.fa[key];
    return arr || [];
  }, [currentTranslation]);

  var isRTL = currentTranslation.dir === 'rtl';

  var value = useMemo(function() {
    return {
      lang: lang,
      setLang: setLang,
      t: t,
      tArray: tArray,
      isRTL: isRTL,
      loaded: loaded,
    };
  }, [lang, loaded, t, tArray, isRTL, setLang]);

  return React.createElement(LanguageContext.Provider, { value: value }, props.children);
}

function useLanguage() {
  return useContext(LanguageContext);
}

module.exports = {
  LanguageProvider: LanguageProvider,
  useLanguage: useLanguage,
  LanguageContext: LanguageContext,
};
