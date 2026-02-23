import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, Modal
} from 'react-native';

var MoonCalculator = require('../calculations/moonPosition');
var HijriCalendar = require('../calculations/hijriCalendar');
var MarajeData = require('../data/maraje');
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
  try { var sf = new Date(date.getTime() - 5*24*3600000); var nm = Astronomy.SearchMoonPhase(0, sf, 35); if (nm) return nm.date; } catch(e) {} return date;
}
function findNextNewMoon(date) {
  try { var r = Astronomy.SearchMoonPhase(0, date, 40); if (r) return r.date; } catch(e) {} return null;
}
function findPrevNewMoon(date) {
  try { var sf = new Date(date.getTime() - 35*24*3600000); var r = Astronomy.SearchMoonPhase(0, sf, 40); if (r) return r.date; } catch(e) {} return null;
}

export default function MarajeScreen() {
  var LCtx = useLanguage();
  var t = LCtx.t;
  var lang = LCtx.lang;
  var isRTL = LCtx.isRTL;
  var HIJRI_MONTHS = LCtx.tArray('hijriMonths');

  var nextH = HijriCalendar.getNextHijriMonth(new Date());

  var s1 = useState(true); var loading = s1[0]; var setLoading = s1[1];
  var s2 = useState([]); var results = s2[0]; var setResults = s2[1];
  var s3 = useState(null); var moonData = s3[0]; var setMoonData = s3[1];
  var s4 = useState(null); var expanded = s4[0]; var setExpanded = s4[1];
  var s5 = useState(null); var city = s5[0]; var setCity = s5[1];
  var s6 = useState(null); var nmDate = s6[0]; var setNmDate = s6[1];
  var s7 = useState([]); var fourDays = s7[0]; var setFourDays = s7[1];
  var s8 = useState(2); var activeDay = s8[0]; var setActiveDay = s8[1];
  var s9 = useState(null); var selDate = s9[0]; var setSelDate = s9[1];
  var s10 = useState(false); var showPicker = s10[0]; var setShowPicker = s10[1];
  var s11 = useState(nextH.year); var hYear = s11[0]; var setHYear = s11[1];
  var s12 = useState(nextH.month); var hMonth = s12[0]; var setHMonth = s12[1];

  useEffect(function() { loadCity(); }, []);
  useEffect(function() { if (city) findNM(); }, [hYear, hMonth, city]);
  useEffect(function() {
    if (city && fourDays.length > 0) doCalc(city, fourDays[activeDay].date);
  }, [activeDay]);

  var getCityName = function(c) {
    if (!c) return '';
    var key = UserSettings.getCityKey(c.name);
    if (key) return t(key);
    return c.name;
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

  var formatDateLocal = function(date) {
    if (!date) return '---';
    if (lang === 'en') return HijriCalendar.formatGregorian(date);
    return HijriCalendar.formatJalali(date);
  };

  var getWeekDayLocal = function(date) {
    if (!date) return '---';
    var days = LCtx.tArray('weekDays');
    return days[date.getDay()];
  };

  var formatDateShortLocal = function(date) {
    if (!date) return '---';
    if (lang === 'en') return (date.getMonth()+1)+'/'+date.getDate();
    return HijriCalendar.formatJalaliShort(date);
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
    var d0 = new Date(nm.getTime()); d0.setHours(12,0,0,0);
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
      var data = MoonCalculator.getFullMoonData(date, c.lat, c.lon, c.alt || 0);
      setMoonData(data);
      var marjaResults = MarajeData.evaluateForAllMaraje(data, t, lang);
      setResults(marjaResults);
      setLoading(false);
    }, 50);
  };

  var changeMonth = function(d) {
    var nm = hMonth + d; var ny = hYear;
    if (nm > 12) {nm=1; ny++;}
    if (nm < 1) {nm=12; ny--;}
    setHMonth(nm); setHYear(ny);
  };

  if (loading && !moonData) {
    return (
      <View style={ms.lc}>
        <ActivityIndicator size="large" color="#C9A84C" />
        <Text style={ms.lt}>{t('calculating')}</Text>
      </View>
    );
  }

  var textAlign = isRTL ? 'right' : 'left';

  return (
    <ScrollView style={ms.container}>
      <View style={ms.content}>

        <View style={ms.titleBox}>
          <Text style={ms.titleT}>{t('marjaOpinions')}</Text>
          <Text style={ms.titleSub}>{t('hilalMonth') + ' ' + HIJRI_MONTHS[hMonth-1] + ' ' + hYear}</Text>
          {city ? <Text style={ms.titleCity}>{'📍 ' + getCityName(city)}</Text> : null}
        </View>

        <View style={ms.monthSel}>
          <TouchableOpacity onPress={function(){changeMonth(-1);}}>
            <Text style={ms.mBtnT}>{isRTL?'▶':'◀'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={function(){setShowPicker(true);}} style={ms.mCenter}>
            <Text style={ms.mCenterT}>{HIJRI_MONTHS[hMonth-1]+' '+hYear}</Text>
            <Text style={ms.mCenterSub}>{t('selectMonthYear')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={function(){changeMonth(1);}}>
            <Text style={ms.mBtnT}>{isRTL?'◀':'▶'}</Text>
          </TouchableOpacity>
        </View>

        {nmDate ? (
          <View style={ms.conjCard}>
            <Text style={ms.conjTitle}>{t('conjunction')}</Text>
            <Text style={ms.conjText}>{formatDateLocal(nmDate)+' '+t('shareTime')+' '+MoonCalculator.formatTime(nmDate)}</Text>
            <Text style={ms.conjText2}>{HijriCalendar.formatGregorian(nmDate)}</Text>
          </View>
        ) : null}

        {fourDays.length > 0 ? (
          <View>
            <Text style={[ms.secTitle,{textAlign:textAlign}]}>{t('selectDay')}</Text>
            <View style={ms.dayBtns}>
              {fourDays.map(function(d, i) {
                var isA = activeDay === i;
                return (
                  <TouchableOpacity key={i} style={[ms.dayBtn, isA && ms.dayBtnA]}
                    onPress={function(){setActiveDay(i); doCalc(city, d.date);}}>
                    <Text style={[ms.dayBtnT, isA&&{color:'#0B1120'}]}>{d.short}</Text>
                    <Text style={[ms.dayBtnD, isA&&{color:'#0B1120'}]}>{getWeekDayLocal(d.date)}</Text>
                    <Text style={[ms.dayBtnD, isA&&{color:'#0B1120'}]}>{formatDateShortLocal(d.date)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : null}

        {selDate ? (
          <View style={ms.dateBox}>
            <Text style={ms.dateW}>{t('sunset')+' '+getWeekDayLocal(selDate)}</Text>
            <Text style={ms.dateJ}>{formatDateLocal(selDate)}</Text>
          </View>
        ) : null}

        <View style={ms.warn}>
          <Text style={[ms.warnT,{textAlign:textAlign}]}>{t('warning')}</Text>
        </View>

        {moonData ? (
          <View style={ms.summary}>
            <Text style={[ms.summaryTitle,{textAlign:textAlign}]}>{t('astronomySummary')}</Text>
            <SRow l={t('moonAgeSummary')} v={moonData.moonAge ? Math.floor(moonData.moonAge)+' '+t('hour') : '---'} />
            <SRow l={t('moonAltitude')} v={MoonCalculator.formatDegree(moonData.moonAltitude)}
              c={moonData.moonAltitude>0?'#00CC44':'#FF3333'} />
            <SRow l={t('lagTimeLabel')} v={MoonCalculator.formatDuration(moonData.lagTime)}
              c={moonData.lagTime>0?'#00CC44':'#FF3333'} />
            <SRow l="Elongation" v={moonData.topoElongation?moonData.topoElongation.toFixed(2)+'°':'---'} />
            <SRow l={t('illumination')} v={moonData.illuminationPercent?moonData.illuminationPercent.toFixed(2)+'%':'---'} />
            <SRow l={t('yallopResult')} v={getCatTextLocal(moonData.yallopCat)}
              c={MoonCalculator.getCatColor(moonData.yallopCat)} />
            <SRow l={t('odehResult')} v={getCatTextLocal(moonData.odehCat)}
              c={MoonCalculator.getCatColor(moonData.odehCat)} />
          </View>
        ) : null}

        <View style={ms.quickGuide}>
          <View style={ms.qgRow}>
            <Text style={ms.qgText}>{t('possibleVisible')}</Text>
            <View style={[ms.qgDot, {backgroundColor:'#00FF88'}]} />
          </View>
          <View style={ms.qgRow}>
            <Text style={ms.qgText}>{t('borderline')}</Text>
            <View style={[ms.qgDot, {backgroundColor:'#FFAA00'}]} />
          </View>
          <View style={ms.qgRow}>
            <Text style={ms.qgText}>{t('notVisible')}</Text>
            <View style={[ms.qgDot, {backgroundColor:'#FF4444'}]} />
          </View>
        </View>

        {results.map(function(marja, index) {
          var isExp = expanded === index;
          var borderColor = marja.isVisible ? '#00FF88' : marja.isBorderline ? '#FFAA00' : '#FF4444';
          var marjaNum = marja.id;
          var marjaName = t('marja'+marjaNum+'Name');
          var marjaCriteria = t('marja'+marjaNum+'Criteria');
          var marjaDesc = t('marja'+marjaNum+'Desc');
          var marjaDetails = LCtx.tArray('marja'+marjaNum+'Details');
          var marjaHorizon = t('marja'+marjaNum+'Horizon');

          return (
            <TouchableOpacity key={marja.id}
              style={[ms.marjaCard, {borderLeftColor: borderColor}]}
              onPress={function() { setExpanded(isExp ? null : index); }}>

              <View style={ms.marjaHeader}>
                <View style={[ms.dot, {backgroundColor: borderColor}]} />
                <View style={{flex:1}}>
                  <Text style={[ms.marjaName,{textAlign:textAlign}]}>{marjaName}</Text>
                  <Text style={[ms.marjaCrit,{textAlign:textAlign}]}>{marjaCriteria}</Text>
                </View>
                <View style={ms.confBox}>
                  <Text style={ms.confText}>{marja.confidence+'%'}</Text>
                  <Text style={ms.confLabel}>{t('confidence')}</Text>
                </View>
              </View>

              <View style={ms.marjaResult}>
                <Text style={[ms.resultText, {color: marja.isVisible ? '#00FF88' : '#FF4444', textAlign:textAlign}]}>
                  {marja.isVisible ? t('newMonthStart') : t('newMonthNotStart')}
                </Text>
                <Text style={[ms.reasonText,{textAlign:textAlign}]}>{marja.reason}</Text>
              </View>

              <View style={[ms.fiqhBox, {borderColor: borderColor}]}>
                <Text style={[ms.fiqhText, {color: borderColor}]}>{marja.fiqhResult}</Text>
              </View>

              {marja.instrumentNote ? (
                <Text style={[ms.instNote,{textAlign:textAlign}]}>{marja.instrumentNote}</Text>
              ) : null}

              {isExp ? (
                <View style={ms.details}>
                  <Text style={[ms.descText,{textAlign:textAlign}]}>{marjaDesc}</Text>

                  <Text style={[ms.detTitle,{textAlign:textAlign}]}>{t('fiqhBasis')}</Text>
                  {marjaDetails.map(function(detail, i) {
                    return <Text key={i} style={[ms.detItem,{textAlign:textAlign}]}>{'• '+detail}</Text>;
                  })}

                  <Text style={[ms.detTitle,{textAlign:textAlign}]}>{t('horizonSharing')}</Text>
                  <Text style={[ms.horizonText,{textAlign:textAlign}]}>{marjaHorizon}</Text>

                  <Text style={[ms.detTitle,{textAlign:textAlign}]}>{t('observationTools')}</Text>
                  <Text style={[ms.instText,{textAlign:textAlign}]}>
                    {marja.acceptsTelescope ? t('telescopeAccepted') : t('telescopeNotAccepted')}
                  </Text>

                  <Text style={[ms.detTitle,{textAlign:textAlign}]}>{t('currentConditions')}</Text>
                  {marja.conditions.map(function(cond, i) {
                    return <Text key={'c'+i} style={[ms.condItem,{textAlign:textAlign}]}>{cond}</Text>;
                  })}
                </View>
              ) : null}

              <Text style={ms.expandHint}>
                {isExp ? t('closeDetails') : t('openDetails')}
              </Text>
            </TouchableOpacity>
          );
        })}

        <View style={{height:40}} />
      </View>

      <Modal visible={showPicker} transparent animationType="slide">
        <View style={ms.moBg}><View style={ms.moBox}>
          <Text style={ms.moTitle}>{t('selectMonthYear')}</Text>
          <View style={ms.yrRow}>
            <TouchableOpacity onPress={function(){setHYear(hYear-1);}} style={ms.yrBtn}>
              <Text style={ms.yrBtnT}>{isRTL?'▶':'◀'}</Text>
            </TouchableOpacity>
            <Text style={ms.yrTxt}>{hYear.toString()}</Text>
            <TouchableOpacity onPress={function(){setHYear(hYear+1);}} style={ms.yrBtn}>
              <Text style={ms.yrBtnT}>{isRTL?'◀':'▶'}</Text>
            </TouchableOpacity>
          </View>
          <View style={ms.moGrid}>
            {HIJRI_MONTHS.map(function(name, i) {
              var isSel = hMonth === (i+1);
              return (
                <TouchableOpacity key={i} style={[ms.moItem, isSel&&ms.moItemA]}
                  onPress={function(){setHMonth(i+1);}}>
                  <Text style={[ms.moItemT, isSel&&{color:'#0B1120'}]}>{name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity style={ms.moOk} onPress={function(){setShowPicker(false);}}>
            <Text style={ms.moOkT}>{t('confirm')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={ms.moCancel} onPress={function(){setShowPicker(false);}}>
            <Text style={ms.moCancelT}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View></View>
      </Modal>

    </ScrollView>
  );
}

function SRow(p) {
  return (
    <View style={ms.sRow}>
      <Text style={[ms.sRowV, p.c?{color:p.c}:null]}>{p.v}</Text>
      <Text style={ms.sRowL}>{p.l}</Text>
    </View>
  );
}

var ms = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0a1628'},
  content:{padding:16},
  lc:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#0a1628'},
  lt:{color:'#C9A84C',fontSize:14,marginTop:15},
  titleBox:{alignItems:'center',paddingVertical:18,backgroundColor:'#111B30',borderRadius:16,marginBottom:14},
  titleT:{color:'#C9A84C',fontSize:18,fontWeight:'bold'},
  titleSub:{color:'#FFF',fontSize:14,marginTop:4},
  titleCity:{color:'#88BBFF',fontSize:12,marginTop:6,fontWeight:'bold'},
  monthSel:{flexDirection:'row',alignItems:'center',backgroundColor:'#111B30',borderRadius:12,padding:10,marginBottom:12},
  mBtnT:{color:'#C9A84C',fontSize:18,fontWeight:'bold',padding:10},
  mCenter:{flex:1,alignItems:'center'},
  mCenterT:{color:'#FFF',fontSize:15,fontWeight:'bold'},
  mCenterSub:{color:'#6688aa',fontSize:9,marginTop:2},
  conjCard:{backgroundColor:'#111B30',borderRadius:14,padding:14,marginBottom:12,alignItems:'center',borderWidth:1,borderColor:'#C9A84C'},
  conjTitle:{color:'#C9A84C',fontSize:13,fontWeight:'bold',marginBottom:6},
  conjText:{color:'#FFF',fontSize:13,fontWeight:'600',textAlign:'center'},
  conjText2:{color:'#6688aa',fontSize:11,textAlign:'center',marginTop:3},
  secTitle:{color:'#C9A84C',fontSize:13,fontWeight:'bold',marginBottom:8},
  dayBtns:{flexDirection:'row',gap:4,marginBottom:12},
  dayBtn:{flex:1,backgroundColor:'#111B30',borderRadius:10,padding:9,alignItems:'center',borderWidth:1,borderColor:'#1a2a4a'},
  dayBtnA:{backgroundColor:'#C9A84C',borderColor:'#C9A84C'},
  dayBtnT:{color:'#CCC',fontSize:10,fontWeight:'bold'},
  dayBtnD:{color:'#6688aa',fontSize:7,marginTop:1},
  dateBox:{alignItems:'center',backgroundColor:'#111B30',borderRadius:12,padding:12,marginBottom:12},
  dateW:{color:'#C9A84C',fontSize:15,fontWeight:'bold'},
  dateJ:{color:'#FFF',fontSize:13,marginTop:3},
  warn:{backgroundColor:'#2a2a1a',borderRadius:10,padding:12,marginBottom:12,borderLeftWidth:3,borderLeftColor:'#FFAA00'},
  warnT:{color:'#FFDD88',fontSize:11,lineHeight:20},
  summary:{backgroundColor:'#1a2a4a',borderRadius:12,padding:15,marginBottom:14},
  summaryTitle:{color:'#C9A84C',fontSize:14,fontWeight:'bold',marginBottom:10},
  sRow:{flexDirection:'row',justifyContent:'space-between',paddingVertical:3},
  sRowL:{color:'#6688aa',fontSize:12},
  sRowV:{color:'#CCDDEE',fontSize:12,fontWeight:'600'},
  quickGuide:{flexDirection:'row',justifyContent:'center',gap:14,marginBottom:12,flexWrap:'wrap'},
  qgRow:{flexDirection:'row',alignItems:'center',gap:4},
  qgDot:{width:10,height:10,borderRadius:5},
  qgText:{color:'#8899aa',fontSize:10},
  marjaCard:{backgroundColor:'#1a2a4a',borderRadius:12,padding:16,marginBottom:10,borderLeftWidth:4},
  marjaHeader:{flexDirection:'row',alignItems:'center',gap:10},
  dot:{width:12,height:12,borderRadius:6},
  marjaName:{color:'#FFFFFF',fontSize:14,fontWeight:'bold'},
  marjaCrit:{color:'#8899aa',fontSize:10,marginTop:2},
  confBox:{alignItems:'center',backgroundColor:'#0a1a2a',borderRadius:8,padding:8,minWidth:50},
  confText:{color:'#FFD700',fontSize:15,fontWeight:'bold'},
  confLabel:{color:'#6688aa',fontSize:8},
  marjaResult:{marginTop:10,paddingTop:10,borderTopWidth:1,borderTopColor:'#2a3a5a'},
  resultText:{fontSize:13,fontWeight:'bold'},
  reasonText:{color:'#8899aa',fontSize:11,marginTop:4},
  fiqhBox:{backgroundColor:'#0a1628',borderRadius:10,padding:12,marginTop:10,borderWidth:1},
  fiqhText:{fontSize:12,fontWeight:'bold',textAlign:'center'},
  instNote:{color:'#FFAA00',fontSize:11,marginTop:8,fontStyle:'italic'},
  details:{marginTop:12,paddingTop:12,borderTopWidth:1,borderTopColor:'#2a3a5a'},
  descText:{color:'#CCDDEE',fontSize:12,lineHeight:22,marginBottom:10},
  detTitle:{color:'#88BBFF',fontSize:12,fontWeight:'bold',marginBottom:5,marginTop:10},
  detItem:{color:'#AABBCC',fontSize:11,paddingVertical:2},
  horizonText:{color:'#AABBCC',fontSize:11,lineHeight:20},
  instText:{color:'#AABBCC',fontSize:11,lineHeight:20},
  condItem:{color:'#CCDDEE',fontSize:11,paddingVertical:2},
  expandHint:{color:'#5577aa',fontSize:10,textAlign:'center',marginTop:8},
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
