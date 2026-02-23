import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, Modal, Share
} from 'react-native';

var MoonCalculator = require('../calculations/moonPosition');
var HijriCalendar = require('../calculations/hijriCalendar');
var UserSettings = require('../data/userSettings');
var Astronomy = require('astronomy-engine');
var LP = require('../i18n/LanguageContext');
var useLanguage = LP.useLanguage;

function hijriToApproxDate(hY, hM) {
  var jd = Math.floor((11*hY+3)/30) + 354*hY + 30*hM - Math.floor((hM-1)/2) + 1948440 - 385;
  var a = jd+68569; var b = Math.floor(4*a/146097);
  a = a - Math.floor((146097*b+3)/4);
  var c = Math.floor(4000*(a+1)/1461001);
  a = a - Math.floor(1461*c/4) + 31;
  var d = Math.floor(80*a/2447);
  var day = a - Math.floor(2447*d/80);
  a = Math.floor(d/11);
  var month = d+2-12*a;
  var year = 100*(b-49)+c+a;
  return new Date(year, month-1, day);
}

function findNewMoonNear(date) {
  try {
    var sf = new Date(date.getTime() - 5*24*3600000);
    var nm = Astronomy.SearchMoonPhase(0, sf, 35);
    if (nm) return nm.date;
  } catch(e) {}
  return date;
}

function findNextNewMoon(date) {
  try {
    var r = Astronomy.SearchMoonPhase(0, date, 40);
    if (r) return r.date;
  } catch(e) {}
  return null;
}

function findPrevNewMoon(date) {
  try {
    var sf = new Date(date.getTime() - 35*24*3600000);
    var r = Astronomy.SearchMoonPhase(0, sf, 40);
    if (r) return r.date;
  } catch(e) {}
  return null;
}

export default function HomeScreen() {
  var LCtx = useLanguage();
  var t = LCtx.t;
  var lang = LCtx.lang;
  var isRTL = LCtx.isRTL;
  var HIJRI_MONTHS = LCtx.tArray('hijriMonths');

  var nextH = HijriCalendar.getNextHijriMonth(new Date());

  var s1 = useState(true); var loading = s1[0]; var setLoading = s1[1];
  var s2 = useState(null); var city = s2[0]; var setCity = s2[1];
  var s3 = useState(null); var moonData = s3[0]; var setMoonData = s3[1];
  var s4 = useState(null); var selDate = s4[0]; var setSelDate = s4[1];
  var s5 = useState('yallop'); var crit = s5[0]; var setCrit = s5[1];
  var s6 = useState([]); var fourDays = s6[0]; var setFourDays = s6[1];
  var s7 = useState(2); var activeDay = s7[0]; var setActiveDay = s7[1];
  var s8 = useState(null); var nmDate = s8[0]; var setNmDate = s8[1];
  var s9 = useState(false); var showPicker = s9[0]; var setShowPicker = s9[1];
  var s10 = useState(nextH.year); var hYear = s10[0]; var setHYear = s10[1];
  var s11 = useState(nextH.month); var hMonth = s11[0]; var setHMonth = s11[1];

  useEffect(function() { loadCity(); }, []);
  useEffect(function() { if (city) findNM(); }, [hYear, hMonth, city]);
  useEffect(function() {
    if (city && fourDays.length > 0) {
      doCalc(city, fourDays[activeDay].date);
    }
  }, [activeDay, crit]);

  var getCityName = function(c) {
    if (!c) return '';
    var key = UserSettings.getCityKey(c.name);
    if (key) return t(key);
    return c.name;
  };

  var loadCity = async function() {
    var c = await UserSettings.loadCity();
    setCity(c);
    findDefaultNM(c);
  };

  var findDefaultNM = function(c) {
    var now = new Date();
    var nextNM = findNextNewMoon(now);
    var prevNM = findPrevNewMoon(now);
    var nm = prevNM;
    if (nextNM && prevNM) {
      var diffPrev = Math.abs(now.getTime() - prevNM.getTime());
      if (diffPrev > 3*24*3600000) nm = nextNM;
    }
    if (!nm) nm = nextNM || now;
    setNmDate(nm);
    buildDays(nm, c);
  };

  var findNM = function() {
    var approx = hijriToApproxDate(hYear, hMonth);
    var nm = findNewMoonNear(approx);
    setNmDate(nm);
    buildDays(nm, city);
  };

  var buildDays = function(nm, c) {
    if (!nm) return;
    var d0 = new Date(nm.getTime());
    d0.setHours(12,0,0,0);
    var days = [
      {date: new Date(d0.getTime() - 24*3600000), short: t('dayBefore')},
      {date: new Date(d0.getTime()), short: t('dayConjunction')},
      {date: new Date(d0.getTime() + 24*3600000), short: t('dayAfter')},
      {date: new Date(d0.getTime() + 2*24*3600000), short: t('twoDaysAfter')},
    ];
    setFourDays(days);
    setActiveDay(2);
    if (c) doCalc(c, days[2].date);
  };

  var doCalc = function(c, date) {
    if (!c || !date) return;
    setLoading(true);
    setSelDate(date);
    setTimeout(function() {
      var data = MoonCalculator.getFullMoonData(date, c.lat, c.lon, c.alt);
      setMoonData(data);
      setLoading(false);
    }, 50);
  };

  var changeMonth = function(d) {
    var nm = hMonth + d; var ny = hYear;
    if (nm > 12) {nm=1; ny++;}
    if (nm < 1) {nm=12; ny--;}
    setHMonth(nm); setHYear(ny);
  };

  var getCat = function() {
    if (!moonData) return '';
    if (crit==='yallop') return moonData.yallopCat||'';
    if (crit==='odeh') return moonData.odehCat||'';
    if (crit==='saao') return moonData.saaoCat||'';
    if (crit==='istanbul') return moonData.istanbulCat||'';
    if (crit==='malaysia') return moonData.malaysiaCat||'';
    if (crit==='soroudi') return moonData.soroudiCat||'';
    return moonData.yallopCat||'';
  };

  var getCatTextLocal = function(cat) {
    if (cat==='A') return t('catAText');
    if (cat==='B') return t('catBText');
    if (cat==='C') return t('catCText');
    if (cat==='D') return t('catDText');
    if (cat==='E') return t('catEText');
    if (cat==='F') return t('catFText');
    return t('catUnknown');
  };

  var getCatFullLocal = function(cat) {
    if (cat==='A') return t('catAFull');
    if (cat==='B') return t('catBFull');
    if (cat==='C') return t('catCFull');
    if (cat==='D') return t('catDFull');
    if (cat==='E') return t('catEFull');
    if (cat==='F') return t('catFFull');
    return '';
  };

  var formatDateLocal = function(date) {
    if (!date) return '---';
    if (lang === 'en') return HijriCalendar.formatGregorian(date);
    return HijriCalendar.formatJalali(date);
  };

  var formatDateShortLocal = function(date) {
    if (!date) return '---';
    if (lang === 'en') {
      return (date.getMonth()+1)+'/'+date.getDate();
    }
    return HijriCalendar.formatJalaliShort(date);
  };

  var getWeekDayLocal = function(date) {
    if (!date) return '---';
    var days = LCtx.tArray('weekDays');
    return days[date.getDay()];
  };

  var doShare = function() {
    var cat = getCat();
    var msg = t('shareTitle') + ' ' + HIJRI_MONTHS[hMonth-1] + ' ' + hYear + '\n\n';
    msg += t('shareCity') + ' ' + getCityName(city) + '\n';
    msg += t('shareSunset') + ' ' + getWeekDayLocal(selDate) + ' ' + formatDateLocal(selDate) + '\n';
    msg += HijriCalendar.formatGregorian(selDate) + '\n\n';
    if (nmDate) {
      msg += t('shareConjunction') + ' ' + formatDateLocal(nmDate) + ' ' + t('shareTime') + ' ' + MoonCalculator.formatTime(nmDate) + '\n\n';
    }
    msg += t('shareCriterionResult') + ' ' + crit.toUpperCase() + ':\n';
    msg += getCatTextLocal(cat) + '\n';
    msg += getCatFullLocal(cat) + '\n\n';
    msg += t('shareCompare') + '\n';
    msg += '• Yallop: ' + getCatTextLocal(moonData.yallopCat) + '\n';
    msg += '• Odeh: ' + getCatTextLocal(moonData.odehCat) + '\n';
    msg += '• SAAO: ' + getCatTextLocal(moonData.saaoCat) + '\n';
    msg += '• Istanbul: ' + getCatTextLocal(moonData.istanbulCat) + '\n';
    msg += '• Malaysia: ' + getCatTextLocal(moonData.malaysiaCat) + '\n';
    msg += '• Soroudi: ' + getCatTextLocal(moonData.soroudiCat) + ' (' + moonData.soroudiScore + '/100)\n\n';
    msg += t('shareSpecs') + '\n';
    msg += '• ' + t('shareAltitude') + ' ' + MoonCalculator.formatDegree(moonData.moonAltitude) + '\n';
    msg += '• ' + t('shareAge') + ' ' + MoonCalculator.formatAge(moonData.moonAge) + '\n';
    msg += '• ' + t('shareLag') + ' ' + MoonCalculator.formatDuration(moonData.lagTime) + '\n';
    msg += '• ' + t('shareBrightness') + ' ' + (moonData.illuminationPercent?moonData.illuminationPercent.toFixed(2)+'%':'---') + '\n';
    msg += '• Elongation: ' + (moonData.topoElongation?moonData.topoElongation.toFixed(2)+'°':'---') + '\n\n';
    msg += t('shareApp');
    Share.share({message:msg}).catch(function(e){});
  };

  if (loading && !moonData) {
    return (
      <View style={st.lc}>
        <Text style={{fontSize:60}}>🌙</Text>
        <ActivityIndicator size="large" color="#C9A84C" style={{marginTop:20}} />
        <Text style={st.lt}>{t('calculating')}</Text>
      </View>
    );
  }

  var cat = getCat();
  var catColor = MoonCalculator.getCatColor(cat);
  var textAlign = isRTL ? 'right' : 'left';

  return (
    <ScrollView style={st.container}>
      <View style={st.content}>

        <View style={st.titleBox}>
          <Text style={st.titleT}>{t('hilalStatus') + ' ' + HIJRI_MONTHS[hMonth-1]}</Text>
          <Text style={st.titleSub}>{t('yearHijri', {year: hYear})}</Text>
          {city ? <Text style={st.titleCity}>{'📍 ' + getCityName(city)}</Text> : null}
        </View>

        <View style={st.monthSel}>
          <TouchableOpacity onPress={function(){changeMonth(-1);}}>
            <Text style={st.mBtnT}>{isRTL ? '▶' : '◀'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={function(){setShowPicker(true);}} style={st.mCenter}>
            <Text style={st.mCenterT}>{HIJRI_MONTHS[hMonth-1]+' '+hYear}</Text>
            <Text style={st.mCenterSub}>{t('selectMonthYear')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={function(){changeMonth(1);}}>
            <Text style={st.mBtnT}>{isRTL ? '◀' : '▶'}</Text>
          </TouchableOpacity>
        </View>

        {nmDate ? (
          <View style={st.conjCard}>
            <Text style={st.conjTitle}>{t('conjunction')}</Text>
            <Text style={st.conjText}>{formatDateLocal(nmDate) + ' ' + t('shareTime') + ' ' + MoonCalculator.formatTime(nmDate, city ? city.lat : undefined, city ? city.lon : undefined)}</Text>
            <Text style={st.conjText2}>{HijriCalendar.formatGregorian(nmDate)}</Text>
          </View>
        ) : null}

        {fourDays.length > 0 ? (
          <View>
            <Text style={[st.secTitle, {textAlign: textAlign}]}>{t('selectDay')}</Text>
            <View style={st.dayBtns}>
              {fourDays.map(function(d, i) {
                var isA = activeDay === i;
                return (
                  <TouchableOpacity key={i} style={[st.dayBtn, isA && st.dayBtnA]}
                    onPress={function(){setActiveDay(i); doCalc(city, d.date);}}>
                    <Text style={[st.dayBtnT, isA&&{color:'#0B1120'}]}>{d.short}</Text>
                    <Text style={[st.dayBtnD, isA&&{color:'#0B1120'}]}>{getWeekDayLocal(d.date)}</Text>
                    <Text style={[st.dayBtnD, isA&&{color:'#0B1120'}]}>{formatDateShortLocal(d.date)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : null}

        {selDate ? (
          <View style={st.dateBox}>
            <Text style={st.dateW}>{t('sunset') + ' ' + getWeekDayLocal(selDate)}</Text>
            <Text style={st.dateJ}>{formatDateLocal(selDate)}</Text>
            <Text style={st.dateH}>{HijriCalendar.formatHijri(selDate)}</Text>
            <Text style={st.dateG}>{HijriCalendar.formatGregorian(selDate)}</Text>
          </View>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:14}}>
          {[{id:'yallop',n:'YALLOP'},{id:'odeh',n:'ODEH'},{id:'saao',n:'SAAO'},{id:'istanbul',n:'ISTANBUL'},{id:'malaysia',n:'MALAYSIA'},{id:'soroudi',n:'SOROUDI'}].map(function(c) {
            return (
              <TouchableOpacity key={c.id} style={[st.crBtn, crit===c.id&&st.crBtnA]}
                onPress={function(){setCrit(c.id);}}>
                <Text style={[st.crBtnT, crit===c.id&&{color:'#0B1120'}]}>{c.n}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {moonData ? (
          <View style={[st.resultBox, {borderColor:catColor}]}>
            <View style={[st.catBadge, {backgroundColor:catColor}]}>
              <Text style={st.catBadgeT}>{cat||'?'}</Text>
            </View>
            <Text style={[st.resultMainT, {color:catColor}]}>{getCatTextLocal(cat)}</Text>
            <Text style={st.resultDescT}>{getCatFullLocal(cat)}</Text>
            <Text style={st.resultSunset}>{t('sunset') + ' ' + getWeekDayLocal(selDate) + ' ' + formatDateLocal(selDate)}</Text>
            <Text style={st.resultCrit}>{t('criterion') + ': ' + crit.toUpperCase()}</Text>
          </View>
        ) : null}

        {moonData ? (
          <View style={st.card}>
            <Text style={[st.cardTitle, {textAlign: textAlign}]}>{t('hilalSpecs')}</Text>
            <DR l={t('sunsetTime')} v={MoonCalculator.formatTime(moonData.sunSet, city.lat, city.lon)} rtl={isRTL} />
            <DR l={t('sunAzimuth')} v={MoonCalculator.formatDegree(moonData.sunAzimuth)} rtl={isRTL} />
            <View style={st.sep}/>
            <DR l={t('moonAzimuth')} v={MoonCalculator.formatDegree(moonData.moonAzimuth)} rtl={isRTL} />
            <DR l={t('moonAltitude')} v={MoonCalculator.formatDegree(moonData.moonAltitude)} c={moonData.moonAltitude>0?'#00CC44':'#FF3333'} rtl={isRTL} />
            <DR l={t('dazLabel')} v={MoonCalculator.formatDegreeDM(moonData.daz)} rtl={isRTL} />
            <DR l={t('elongationTopo')} v={moonData.topoElongation?moonData.topoElongation.toFixed(2)+'\u00B0':'---'} rtl={isRTL} />
            <DR l={t('elongationGeo')} v={moonData.elongation?moonData.elongation.toFixed(2)+'\u00B0':'---'} rtl={isRTL} />
            <View style={st.sep}/>
            <DR l={t('moonsetTime')} v={MoonCalculator.formatTime(moonData.moonSet, city.lat, city.lon)} rtl={isRTL} />
            <DR l={t('lagTimeLabel')} v={MoonCalculator.formatDuration(moonData.lagTime)} c={moonData.lagTime>0?'#00CC44':'#FF3333'} rtl={isRTL} />
            <DR l={t('moonAgeLabel')} v={MoonCalculator.formatAge(moonData.moonAge)} rtl={isRTL} />
            <DR l={t('illumination')} v={moonData.illuminationPercent?moonData.illuminationPercent.toFixed(3)+'%':'---'} rtl={isRTL} />
            <DR l={t('crescentWidthLabel')} v={moonData.crescentWidth?moonData.crescentWidth.toFixed(3)+" '":'---'} rtl={isRTL} />
            <DR l={t('moonSemiDiamLabel')} v={moonData.moonSemiDiam?(moonData.moonSemiDiam*60).toFixed(1)+" '":'---'} rtl={isRTL} />
            <View style={st.sep}/>
            <DR l={t('eclipticLat')} v={MoonCalculator.formatDegreeDM(moonData.moonEclipticLat)} rtl={isRTL} />
            <DR l={t('moonDistanceLabel')} v={moonData.moonDistance?(moonData.moonDistance.toFixed(2))+' km':'---'} rtl={isRTL} />
            <DR l="Yallop q" v={moonData.yallopQ!==null?moonData.yallopQ.toFixed(4):'---'} c={catColor} rtl={isRTL} />
            <DR l="Soroudi Score" v={moonData.soroudiScore!==null?moonData.soroudiScore+'/100':'---'} c={MoonCalculator.getCatColor(moonData.soroudiCat)} rtl={isRTL} />
            <DR l={t('danjonLimit')} v={moonData.danjonOk?t('danjonPassed'):t('danjonNotPassed')} c={moonData.danjonOk?'#00CC44':'#FF3333'} rtl={isRTL} />
          </View>
        ) : null}

        {moonData ? (
          <View style={st.card}>
            <Text style={[st.cardTitle, {textAlign: textAlign}]}>{t('compareCriteria')}</Text>
            <CR name="Yallop" cat={moonData.yallopCat} t={getCatTextLocal} />
            <CR name="Odeh" cat={moonData.odehCat} t={getCatTextLocal} />
            <CR name="SAAO" cat={moonData.saaoCat} t={getCatTextLocal} />
            <CR name="Istanbul" cat={moonData.istanbulCat} t={getCatTextLocal} />
            <CR name="Malaysia" cat={moonData.malaysiaCat} t={getCatTextLocal} />
            <CR name="Soroudi" cat={moonData.soroudiCat} t={getCatTextLocal} />
          </View>
        ) : null}

        <View style={st.card}>
          <Text style={[st.cardTitle, {textAlign: textAlign}]}>{t('guide')}</Text>
          <LR cat="A" text={t('catAText')} />
          <LR cat="B" text={t('catBText')} />
          <LR cat="C" text={t('catCText')} />
          <LR cat="D" text={t('catDText')} />
          <LR cat="E" text={t('catEText')} />
          <LR cat="F" text={t('catFText')} />
        </View>

        {city ? (
          <View style={st.locBox}>
            <Text style={st.locT}>{'📍 '+getCityName(city)+' | '+city.lat.toFixed(4)+'\u00B0, '+city.lon.toFixed(4)+'\u00B0 | '+city.alt+'m'}</Text>
          </View>
        ) : null}

        {moonData && selDate ? (
          <TouchableOpacity style={st.shareBtn} onPress={doShare}>
            <Text style={st.shareBtnT}>{t('share')}</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={st.refreshBtn} onPress={function(){loadCity();}}>
          <Text style={st.refreshBtnT}>{t('refresh')}</Text>
        </TouchableOpacity>

        <View style={{height:40}} />
      </View>

      <Modal visible={showPicker} transparent animationType="slide">
        <View style={st.moBg}><View style={st.moBox}>
          <Text style={st.moTitle}>{t('selectMonthYear')}</Text>
          <View style={st.yrRow}>
            <TouchableOpacity onPress={function(){setHYear(hYear-1);}} style={st.yrBtn}>
              <Text style={st.yrBtnT}>{isRTL ? '▶' : '◀'}</Text>
            </TouchableOpacity>
            <Text style={st.yrTxt}>{hYear.toString()}</Text>
            <TouchableOpacity onPress={function(){setHYear(hYear+1);}} style={st.yrBtn}>
              <Text style={st.yrBtnT}>{isRTL ? '◀' : '▶'}</Text>
            </TouchableOpacity>
          </View>
          <View style={st.moGrid}>
            {HIJRI_MONTHS.map(function(name, i) {
              var isSel = hMonth === (i+1);
              return (
                <TouchableOpacity key={i} style={[st.moItem, isSel&&st.moItemA]}
                  onPress={function(){setHMonth(i+1);}}>
                  <Text style={[st.moItemT, isSel&&{color:'#0B1120'}]}>{name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity style={st.moOk} onPress={function(){setShowPicker(false);}}>
            <Text style={st.moOkT}>{t('confirm')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.moCancel} onPress={function(){setShowPicker(false);}}>
            <Text style={st.moCancelT}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View></View>
      </Modal>

    </ScrollView>
  );
}

function DR(p) {
  return (
    <View style={st.dr}>
      <Text style={[st.dv, p.c?{color:p.c}:null]}>{p.v}</Text>
      <Text style={[st.dl, {textAlign: p.rtl ? 'right' : 'left'}]}>{p.l}</Text>
    </View>
  );
}

function CR(p) {
  var color = MoonCalculator.getCatColor(p.cat);
  return (
    <View style={st.critRow}>
      <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
        <View style={[st.critDot,{backgroundColor:color}]}/>
        <Text style={[st.critCatT,{color:color}]}>{p.cat||'?'}</Text>
        <Text style={st.critDescT}>{p.t(p.cat)}</Text>
      </View>
      <Text style={st.critNameT}>{p.name}</Text>
    </View>
  );
}

function LR(p) {
  var color = MoonCalculator.getCatColor(p.cat);
  return (
    <View style={st.legRow}>
      <Text style={st.legText}>{p.text}</Text>
      <View style={{flexDirection:'row',alignItems:'center',gap:4}}>
        <Text style={{color:color,fontWeight:'bold'}}>{p.cat}</Text>
        <View style={[st.legDot,{backgroundColor:color}]}/>
      </View>
    </View>
  );
}

var st = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0B1120'},
  content:{padding:16},
  lc:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#0B1120'},
  lt:{color:'#C9A84C',fontSize:16,marginTop:15},
  titleBox:{alignItems:'center',paddingVertical:18,backgroundColor:'#111B30',borderRadius:16,marginBottom:14},
  titleT:{color:'#C9A84C',fontSize:17,fontWeight:'bold',textAlign:'center'},
  titleSub:{color:'#8899aa',fontSize:13,marginTop:4},
  titleCity:{color:'#88BBFF',fontSize:13,marginTop:6,fontWeight:'bold'},
  monthSel:{flexDirection:'row',alignItems:'center',backgroundColor:'#111B30',borderRadius:12,padding:10,marginBottom:12},
  mBtnT:{color:'#C9A84C',fontSize:18,fontWeight:'bold',padding:10},
  mCenter:{flex:1,alignItems:'center'},
  mCenterT:{color:'#FFF',fontSize:15,fontWeight:'bold'},
  mCenterSub:{color:'#6688aa',fontSize:9,marginTop:2},
  conjCard:{backgroundColor:'#111B30',borderRadius:14,padding:16,marginBottom:14,alignItems:'center',borderWidth:1,borderColor:'#C9A84C'},
  conjTitle:{color:'#C9A84C',fontSize:14,fontWeight:'bold',marginBottom:8},
  conjText:{color:'#FFF',fontSize:14,fontWeight:'600',textAlign:'center'},
  conjText2:{color:'#6688aa',fontSize:12,textAlign:'center',marginTop:4},
  secTitle:{color:'#C9A84C',fontSize:13,fontWeight:'bold',marginBottom:8},
  dayBtns:{flexDirection:'row',gap:4,marginBottom:14},
  dayBtn:{flex:1,backgroundColor:'#111B30',borderRadius:10,padding:10,alignItems:'center',borderWidth:1,borderColor:'#1a2a4a'},
  dayBtnA:{backgroundColor:'#C9A84C',borderColor:'#C9A84C'},
  dayBtnT:{color:'#CCC',fontSize:11,fontWeight:'bold'},
  dayBtnD:{color:'#6688aa',fontSize:8,marginTop:2},
  dateBox:{alignItems:'center',backgroundColor:'#111B30',borderRadius:14,padding:14,marginBottom:14},
  dateW:{color:'#C9A84C',fontSize:16,fontWeight:'bold'},
  dateJ:{color:'#FFF',fontSize:15,fontWeight:'bold',marginTop:4},
  dateH:{color:'#88BBFF',fontSize:13,marginTop:2},
  dateG:{color:'#6688aa',fontSize:12,marginTop:2},
  crBtn:{backgroundColor:'#111B30',paddingHorizontal:16,paddingVertical:9,borderRadius:20,marginRight:6,borderWidth:1,borderColor:'#2a3a5a'},
  crBtnA:{backgroundColor:'#C9A84C',borderColor:'#C9A84C'},
  crBtnT:{color:'#FFF',fontSize:11,fontWeight:'bold'},
  resultBox:{backgroundColor:'#111B30',borderRadius:18,padding:24,alignItems:'center',marginBottom:14,borderWidth:2},
  catBadge:{width:50,height:50,borderRadius:25,justifyContent:'center',alignItems:'center',marginBottom:12},
  catBadgeT:{color:'#FFF',fontSize:24,fontWeight:'bold'},
  resultMainT:{fontSize:18,fontWeight:'bold',textAlign:'center',marginBottom:8},
  resultDescT:{color:'#aabbcc',fontSize:13,textAlign:'center',lineHeight:22},
  resultSunset:{color:'#88BBFF',fontSize:12,marginTop:8,textAlign:'center'},
  resultCrit:{color:'#6688aa',fontSize:11,marginTop:4},
  card:{backgroundColor:'#111B30',borderRadius:14,padding:18,marginBottom:12},
  cardTitle:{color:'#C9A84C',fontSize:15,fontWeight:'bold',marginBottom:12},
  dr:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:6},
  dl:{color:'#8899aa',fontSize:12,flex:1},
  dv:{color:'#FFF',fontSize:13,fontWeight:'600',flex:1,textAlign:'left'},
  sep:{height:1,backgroundColor:'#1a2a4a',marginVertical:8},
  critRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:8,borderBottomWidth:1,borderBottomColor:'#1a2a4a'},
  critDot:{width:10,height:10,borderRadius:5},
  critCatT:{fontSize:16,fontWeight:'bold'},
  critDescT:{color:'#aabbcc',fontSize:11},
  critNameT:{color:'#6688aa',fontSize:12},
  legRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:5},
  legDot:{width:12,height:12,borderRadius:6},
  legText:{color:'#aabbcc',fontSize:12},
  locBox:{backgroundColor:'#111B30',borderRadius:10,padding:12,marginBottom:10,alignItems:'center'},
  locT:{color:'#6688aa',fontSize:10},
  shareBtn:{backgroundColor:'#1a4a2a',borderRadius:12,padding:14,alignItems:'center',marginBottom:8,borderWidth:1,borderColor:'#00CC44'},
  shareBtnT:{color:'#00CC44',fontSize:15,fontWeight:'bold'},
  refreshBtn:{backgroundColor:'#1a2a4a',borderRadius:12,padding:14,alignItems:'center'},
  refreshBtnT:{color:'#C9A84C',fontSize:15,fontWeight:'bold'},
  moBg:{flex:1,backgroundColor:'rgba(0,0,0,0.85)',justifyContent:'center',padding:20},
  moBox:{backgroundColor:'#111B30',borderRadius:16,padding:20},
  moTitle:{color:'#C9A84C',fontSize:15,fontWeight:'bold',textAlign:'center',marginBottom:14},
  yrRow:{flexDirection:'row',justifyContent:'center',alignItems:'center',gap:20,marginBottom:14},
  yrBtn:{backgroundColor:'#1a2a4a',width:36,height:36,borderRadius:18,justifyContent:'center',alignItems:'center'},
  yrBtnT:{color:'#C9A84C',fontSize:16,fontWeight:'bold'},
  yrTxt:{color:'#FFF',fontSize:22,fontWeight:'bold',minWidth:55,textAlign:'center'},
  moGrid:{flexDirection:'row',flexWrap:'wrap',gap:6,justifyContent:'center',marginBottom:14},
  moItem:{backgroundColor:'#1a2a4a',paddingHorizontal:11,paddingVertical:7,borderRadius:8},
  moItemA:{backgroundColor:'#C9A84C'},
  moItemT:{color:'#FFF',fontSize:10,fontWeight:'bold'},
  moOk:{backgroundColor:'#C9A84C',borderRadius:10,padding:12,alignItems:'center',marginBottom:8},
  moOkT:{color:'#0B1120',fontSize:14,fontWeight:'bold'},
  moCancel:{padding:10,alignItems:'center'},
  moCancelT:{color:'#6688aa',fontSize:13},
});
