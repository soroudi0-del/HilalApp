import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput, Alert, Modal, Linking
} from 'react-native';

var UserSettings = require('../data/userSettings');
var LP = require('../i18n/LanguageContext');
var useLanguage = LP.useLanguage;

export default function SettingsScreen() {
  var LCtx = useLanguage();
  var t = LCtx.t;
  var lang = LCtx.lang;
  var setLang = LCtx.setLang;
  var isRTL = LCtx.isRTL;

  var s1 = useState(null); var city = s1[0]; var setCity = s1[1];
  var s2 = useState(false); var showList = s2[0]; var setShowList = s2[1];
  var s3 = useState(false); var showCustom = s3[0]; var setShowCustom = s3[1];
  var s4 = useState(''); var cName = s4[0]; var setCName = s4[1];
  var s5 = useState(''); var cLat = s5[0]; var setCLat = s5[1];
  var s6 = useState(''); var cLon = s6[0]; var setCLon = s6[1];
  var s7 = useState('0'); var cAlt = s7[0]; var setCAlt = s7[1];
  var s8 = useState(''); var search = s8[0]; var setSearch = s8[1];
  var s9 = useState(false); var showLang = s9[0]; var setShowLang = s9[1];

  useEffect(function () { loadCity(); }, []);

  var loadCity = async function () {
    var c = await UserSettings.loadCity();
    setCity(c);
  };

  var getCityName = function (c) {
    if (!c) return '';
    // اگر شهر از لیست predefined باشه، نام ترجمه‌شده رو برگردون
    var cityKey = UserSettings.getCityKey(c.name);
    if (cityKey) return t(cityKey);
    return c.name;
  };

  var selectCity = async function (c) {
    await UserSettings.saveCity(c);
    setCity(c);
    setShowList(false);
    Alert.alert(t('saved'), t('savedMsg', { name: getCityName(c) }));
  };

  var saveCustom = async function () {
    if (!cName || !cLat || !cLon) {
      Alert.alert(t('errorTitle'), t('errorFillAll'));
      return;
    }
    var lat = parseFloat(cLat);
    var lon = parseFloat(cLon);
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      Alert.alert(t('errorTitle'), t('errorInvalidCoords'));
      return;
    }
    await UserSettings.saveCustomCity(cName, cLat, cLon, cAlt);
    setCity({ name: cName, lat: lat, lon: lon, alt: parseFloat(cAlt) || 0, custom: true });
    setShowCustom(false);
    Alert.alert(t('saved'), t('savedCustom', { name: cName }));
  };

  var filtered = UserSettings.predefinedCities.filter(function (c) {
    if (!search) return true;
    var localName = getCityName(c);
    return c.name.indexOf(search) !== -1 || localName.indexOf(search) !== -1;
  });

  var textAlign = isRTL ? 'right' : 'left';

  return (
    <ScrollView style={st.container}>
      <View style={st.content}>

        {/* === زبان === */}
        <TouchableOpacity style={st.menuItem} onPress={function () { setShowLang(true); }}>
          <Text style={st.menuItemIcon}>{'🌐'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[st.menuItemTitle, { textAlign: textAlign }]}>{t('language')}</Text>
            <Text style={[st.menuItemSub, { textAlign: textAlign }]}>
              {lang === 'fa' ? 'فارسی' : lang === 'ar' ? 'العربیة' : 'English'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* شهر فعلی */}
        <View style={st.currentBox}>
          <Text style={[st.currentTitle, { textAlign: textAlign }]}>{t('currentCity')}</Text>
          {city ? (
            <View>
              <Text style={st.currentName}>{getCityName(city)}</Text>
              <Text style={st.currentCoords}>
                {(isRTL ? 'عرض' : 'Lat') + ': ' + city.lat.toFixed(4) + '\u00B0 | ' + (isRTL ? 'طول' : 'Lon') + ': ' + city.lon.toFixed(4) + '\u00B0 | ' + (isRTL ? 'ارتفاع' : 'Alt') + ': ' + city.alt + (isRTL ? ' متر' : 'm')}
              </Text>
            </View>
          ) : (
            <Text style={st.currentName}>{t('loading')}</Text>
          )}
        </View>

        <TouchableOpacity style={st.mainBtn} onPress={function () { setShowList(true); }}>
          <Text style={st.mainBtnT}>{t('selectFromList')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={st.mainBtn2} onPress={function () { setShowCustom(true); }}>
          <Text style={st.mainBtn2T}>{t('enterManual')}</Text>
        </TouchableOpacity>

        {/* سلب مسئولیت */}
        <TouchableOpacity style={st.menuItem} onPress={function () {
          Alert.alert('⚠️ ' + t('disclaimer'), t('disclaimerText'), [{ text: t('understood') }]);
        }}>
          <Text style={st.menuItemIcon}>{'⚠️'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[st.menuItemTitle, { textAlign: textAlign }]}>{t('disclaimer')}</Text>
            <Text style={[st.menuItemSub, { textAlign: textAlign }]}>{t('disclaimerSub')}</Text>
          </View>
        </TouchableOpacity>

        {/* روش‌های محاسباتی */}
        <TouchableOpacity style={st.menuItem} onPress={function () {
          Alert.alert('🔬 ' + t('calcMethods'), t('calcMethodsText'), [{ text: t('close') }]);
        }}>
          <Text style={st.menuItemIcon}>{'🔬'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[st.menuItemTitle, { textAlign: textAlign }]}>{t('calcMethods')}</Text>
            <Text style={[st.menuItemSub, { textAlign: textAlign }]}>{t('calcMethodsSub')}</Text>
          </View>
        </TouchableOpacity>

        {/* منابع */}
        <TouchableOpacity style={st.menuItem} onPress={function () {
          Alert.alert('📚 ' + t('references'), t('referencesText'), [{ text: t('close') }]);
        }}>
          <Text style={st.menuItemIcon}>{'📚'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[st.menuItemTitle, { textAlign: textAlign }]}>{t('references')}</Text>
            <Text style={[st.menuItemSub, { textAlign: textAlign }]}>{t('referencesSub')}</Text>
          </View>
        </TouchableOpacity>

        {/* امتیازدهی */}
        
      <View style={st.rateBox}>
  <Text style={st.rateTitle}>{t('rateApp')}</Text>
  <Text style={st.rateSub}>{t('rateSub')}</Text>

  <TouchableOpacity style={st.rateBtn} onPress={function () {
    Linking.openURL('https://play.google.com/store/apps/details?id=com.soroudisoft.hilal').catch(function () { });
  }}>
    <Text style={st.rateBtnT}>{t('rateGoogle')}</Text>
  </TouchableOpacity>
</View>

        {/* ارتباط */}
        <View style={st.contactBox}>
          <Text style={st.contactTitle}>{t('contactUs')}</Text>
          <TouchableOpacity style={st.contactBtn} onPress={function () {
            Linking.openURL('mailto:info.gamevar.ir@gmail.com?subject=HilalApp Feedback').catch(function () { });
          }}>
            <Text style={st.contactBtnT}>{t('sendEmail')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.contactBtn} onPress={function () {
            Linking.openURL('mailto:info.gamevar.ir@gmail.com?subject=Bug Report - HilalApp').catch(function () { });
          }}>
            <Text style={st.contactBtnT}>{t('reportBug')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.contactBtn} onPress={function () {
            Linking.openURL('mailto:info.gamevar.ir@gmail.com?subject=Suggestion - HilalApp').catch(function () { });
          }}>
            <Text style={st.contactBtnT}>{t('suggestion')}</Text>
          </TouchableOpacity>
        </View>

        {/* درباره */}
        <View style={st.aboutBox}>
          <Text style={[st.aboutTitle, { textAlign: textAlign }]}>{t('aboutApp')}</Text>
          <Text style={[st.aboutText, { textAlign: textAlign }]}>{t('aboutText')}</Text>
        </View>

        <View style={{ height: 40 }} />
      </View>

      {/* === Modal زبان === */}
      <Modal visible={showLang} transparent animationType="slide">
        <View style={st.moBg}>
          <View style={st.moBox}>
            <Text style={st.moTitle}>{t('language')}</Text>

            <TouchableOpacity style={[st.langItem, lang === 'fa' && st.langItemActive]}
              onPress={function () { setLang('fa'); setShowLang(false); }}>
              <Text style={[st.langItemT, lang === 'fa' && { color: '#0B1120' }]}>{'🇮🇷  فارسی'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[st.langItem, lang === 'ar' && st.langItemActive]}
              onPress={function () { setLang('ar'); setShowLang(false); }}>
              <Text style={[st.langItemT, lang === 'ar' && { color: '#0B1120' }]}>{'🇸🇦  العربیة'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[st.langItem, lang === 'en' && st.langItemActive]}
              onPress={function () { setLang('en'); setShowLang(false); }}>
              <Text style={[st.langItemT, lang === 'en' && { color: '#0B1120' }]}>{'🇬🇧  English'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={st.moClose} onPress={function () { setShowLang(false); }}>
              <Text style={st.moCloseT}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* === Modal لیست شهرها === */}
      <Modal visible={showList} transparent animationType="slide">
        <View style={st.moBg}>
          <View style={st.moBox}>
            <Text style={st.moTitle}>{t('selectCity')}</Text>
            <TextInput
              style={[st.searchInput, { textAlign: textAlign }]}
              placeholder={t('searchCity')}
              placeholderTextColor="#666"
              value={search}
              onChangeText={setSearch}
            />
            <ScrollView style={{ maxHeight: 400 }}>
              {filtered.map(function (c, i) {
                var isSel = city && city.name === c.name;
                return (
                  <TouchableOpacity key={i}
                    style={[st.cityItem, isSel && st.cityItemSel]}
                    onPress={function () { selectCity(c); }}>
                    <Text style={[st.cityItemName, isSel && { color: '#0B1120' }]}>{getCityName(c)}</Text>
                    <Text style={[st.cityItemCoord, isSel && { color: '#0B1120' }]}>
                      {c.lat.toFixed(2) + '\u00B0, ' + c.lon.toFixed(2) + '\u00B0'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={st.moClose} onPress={function () { setShowList(false); setSearch(''); }}>
              <Text style={st.moCloseT}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* === Modal مکان دستی === */}
      <Modal visible={showCustom} transparent animationType="slide">
        <View style={st.moBg}>
          <View style={st.moBox}>
            <Text style={st.moTitle}>{t('manualLocation')}</Text>

            <Text style={[st.inputLabel, { textAlign: textAlign }]}>{t('locationName')}</Text>
            <TextInput style={st.input} value={cName} onChangeText={setCName}
              placeholder={t('locationNameHint')} placeholderTextColor="#555" />

            <Text style={[st.inputLabel, { textAlign: textAlign }]}>{t('latLabel')}</Text>
            <TextInput style={st.input} value={cLat} onChangeText={setCLat}
              keyboardType="numeric" placeholder={t('latHint')} placeholderTextColor="#555" />

            <Text style={[st.inputLabel, { textAlign: textAlign }]}>{t('lonLabel')}</Text>
            <TextInput style={st.input} value={cLon} onChangeText={setCLon}
              keyboardType="numeric" placeholder={t('lonHint')} placeholderTextColor="#555" />

            <Text style={[st.inputLabel, { textAlign: textAlign }]}>{t('altLabel')}</Text>
            <TextInput style={st.input} value={cAlt} onChangeText={setCAlt}
              keyboardType="numeric" placeholder={t('altHint')} placeholderTextColor="#555" />

            <Text style={[st.helpText, { textAlign: textAlign }]}>{t('coordHelp')}</Text>

            <TouchableOpacity style={st.saveBtn} onPress={saveCustom}>
              <Text style={st.saveBtnT}>{t('saveLocation')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={st.moClose} onPress={function () { setShowCustom(false); }}>
              <Text style={st.moCloseT}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

var st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1120' },
  content: { padding: 16 },
  currentBox: { backgroundColor: '#111B30', borderRadius: 14, padding: 20, marginBottom: 16, alignItems: 'center', borderWidth: 1, borderColor: '#C9A84C' },
  currentTitle: { color: '#C9A84C', fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  currentName: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  currentCoords: { color: '#6688aa', fontSize: 11, marginTop: 6, textAlign: 'center' },
  mainBtn: { backgroundColor: '#C9A84C', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 8 },
  mainBtnT: { color: '#0B1120', fontSize: 16, fontWeight: 'bold' },
  mainBtn2: { backgroundColor: '#1a2a4a', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#C9A84C' },
  mainBtn2T: { color: '#C9A84C', fontSize: 16, fontWeight: 'bold' },
  menuItem: { backgroundColor: '#111B30', borderRadius: 12, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#1a2a4a' },
  menuItemIcon: { fontSize: 22 },
  menuItemTitle: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  menuItemSub: { color: '#6688aa', fontSize: 11, marginTop: 2 },
  rateBox: { backgroundColor: '#111B30', borderRadius: 14, padding: 20, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#C9A84C' },
  rateTitle: { color: '#C9A84C', fontSize: 15, fontWeight: 'bold', marginBottom: 6 },
  rateSub: { color: '#8899aa', fontSize: 12, marginBottom: 16, textAlign: 'center' },
  rateBtn: { backgroundColor: '#1a4a2a', borderRadius: 10, padding: 14, width: '100%', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#00CC44' },
  rateBtnT: { color: '#00CC44', fontSize: 14, fontWeight: 'bold' },
  rateBtn2: { backgroundColor: '#2a2a4a', borderRadius: 10, padding: 14, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#8888FF' },
  rateBtn2T: { color: '#8888FF', fontSize: 14, fontWeight: 'bold' },
  contactBox: { backgroundColor: '#111B30', borderRadius: 14, padding: 18, marginBottom: 12 },
  contactTitle: { color: '#C9A84C', fontSize: 14, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  contactBtn: { backgroundColor: '#1a2a4a', borderRadius: 10, padding: 12, marginBottom: 6, alignItems: 'center' },
  contactBtnT: { color: '#88BBFF', fontSize: 13, fontWeight: 'bold' },
  aboutBox: { backgroundColor: '#111B30', borderRadius: 14, padding: 18 },
  aboutTitle: { color: '#C9A84C', fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  aboutText: { color: '#aabbcc', fontSize: 12, lineHeight: 22 },
  moBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 16 },
  moBox: { backgroundColor: '#111B30', borderRadius: 16, padding: 20, maxHeight: '90%' },
  moTitle: { color: '#C9A84C', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 14 },
  moClose: { padding: 12, alignItems: 'center', marginTop: 8 },
  moCloseT: { color: '#6688aa', fontSize: 14 },
  searchInput: { backgroundColor: '#0B1120', borderRadius: 10, padding: 12, color: '#FFF', fontSize: 14, borderWidth: 1, borderColor: '#2a3a5a', marginBottom: 10 },
  cityItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#1a2a4a' },
  cityItemSel: { backgroundColor: '#C9A84C', borderRadius: 8 },
  cityItemName: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  cityItemCoord: { color: '#6688aa', fontSize: 11 },
  inputLabel: { color: '#8899aa', fontSize: 12, marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: '#0B1120', borderRadius: 10, padding: 12, color: '#FFF', fontSize: 15, borderWidth: 1, borderColor: '#2a3a5a', textAlign: 'center' },
  helpText: { color: '#6688aa', fontSize: 11, lineHeight: 18, marginTop: 12 },
  saveBtn: { backgroundColor: '#C9A84C', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 14 },
  saveBtnT: { color: '#0B1120', fontSize: 16, fontWeight: 'bold' },
  langItem: { backgroundColor: '#1a2a4a', borderRadius: 12, padding: 18, marginBottom: 8, alignItems: 'center', borderWidth: 1, borderColor: '#2a3a5a' },
  langItemActive: { backgroundColor: '#C9A84C', borderColor: '#C9A84C' },
  langItemT: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});
