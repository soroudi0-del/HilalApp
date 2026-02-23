import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, Modal
} from 'react-native';

var MoonCalculator = require('../calculations/moonPosition');
var HijriCalendar = require('../calculations/hijriCalendar');
var UserSettings = require('../data/userSettings');
var Astronomy = require('astronomy-engine');
var LP = require('../i18n/LanguageContext');
var useLanguage = LP.useLanguage;

var CITIES = [
  { name: 'قم', lat: 34.6401, lon: 50.8764, alt: 930 },
  { name: 'تهران', lat: 35.6892, lon: 51.3890, alt: 1200 },
  { name: 'مشهد', lat: 36.2605, lon: 59.6168, alt: 990 },
  { name: 'اصفهان', lat: 32.6546, lon: 51.6680, alt: 1570 },
  { name: 'نجف', lat: 31.9968, lon: 44.3148, alt: 53 },
  { name: 'کربلا', lat: 32.6160, lon: 44.0233, alt: 32 },
  { name: 'مکه', lat: 21.4225, lon: 39.8262, alt: 277 },
  { name: 'مدینه', lat: 24.4539, lon: 39.6142, alt: 277 },
];

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

export default function MoonDataScreen() {
  var LCtx = useLanguage();
  var t = LCtx.t;
  var lang = LCtx.lang;
  var isRTL = LCtx.isRTL;
  var HIJRI_MONTHS = LCtx.tArray('hijriMonths');

  var curH = HijriCalendar.estimateHijri(new Date());

  var s1 = useState(true); var loading = s1[0]; var setLoading = s1[1];
  var s2 = useState(null); var data1 = s2[0]; var setData1 = s2[1];
  var s3 = useState(null); var data2 = s3[0]; var setData2 = s3[1];
  var s4 = useState(0); var cityIdx = s4[0]; var setCityIdx = s4[1];
  var s5 = useState(curH.year); var hYear = s5[0]; var setHYear = s5[1];
  var s6 = useState(curH.month); var hMonth = s6[0]; var setHMonth = s6[1];
  var s7 = useState(false); var showPicker = s7[0]; var setShowPicker = s7[1];
  var s8 = useState(null); var nmDate = s8[0]; var setNmDate = s8[1];

  useEffect(function() { findNM(); }, [hYear, hMonth]);
  useEffect(function() { if (nmDate) calcBothDays(); }, [nmDate, cityIdx]);

  var getCityName = function(c) {
    if (!c) return '';
    var key = UserSettings.getCityKey(c.name);
    if (key) return t(key);
    return c.name;
  };

  var findNM = function() {
    var approx = hijriToApproxDate(hYear, hMonth);
    var nm = findNewMoonNear(approx);
    setNmDate(nm);
  };

  var changeMonth = function(d) {
    var nm = hMonth + d; var ny = hYear;
    if (nm > 12) {nm=1; ny++;}
    if (nm < 1) {nm=12; ny--;}
    setHMonth(nm); setHYear(ny);
  };

  var calcBothDays = function() {
    setLoading(true);
    setTimeout(function() {
      var c = CITIES[cityIdx];
      var d0 = new Date(nmDate.getTime());
      d0.setHours(12,0,0,0);

      var day1 = new Date(d0.getTime() + 24*3600000);
      var dd1 = MoonCalculator.getFullMoonData(day1, c.lat, c.lon, c.alt);
      setData1({date: day1, data: dd1});

      var day2 = new Date(d0.getTime() + 2*24*3600000);
      var dd2 = MoonCalculator.getFullMoonData(day2, c.lat, c.lon, c.alt);
      setData2({date: day2, data: dd2});

      setLoading(false);
    }, 50);
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

  var getCatTextLocal = function(cat) {
    if (cat==='A') return t('catAText');
    if (cat==='B') return t('catBText');
    if (cat==='C') return t('catCText');
    if (cat==='D') return t('catDText');
    if (cat==='E') return t('catEText');
    if (cat==='F') return t('catFText');
    return t('catUnknown');
  };

  if (loading) {
    return (<View style={ms.lc}><ActivityIndicator size="large" color="#C9A84C" /><Text style={ms.lt}>{t('calculating')}</Text></View>);
  }

  var city = CITIES[cityIdx];
  var textAlign = isRTL ? 'right' : 'left';

  return (
    <ScrollView style={ms.container}>
      <View style={ms.content}>

        <View style={ms.titleBox}>
          <Text style={ms.titleT}>{t('hilalSpecsTitle') + ' ' + HIJRI_MONTHS[hMonth-1] + ' ' + hYear}</Text>
        </View>

        <View style={ms.monthSel}>
          <TouchableOpacity onPress={function(){changeMonth(-1);}}><Text style={ms.mBtnT}>{isRTL ? '▶' : '◀'}</Text></TouchableOpacity>
          <TouchableOpacity onPress={function(){setShowPicker(true);}} style={ms.mCenter}>
            <Text style={ms.mCenterT}>{HIJRI_MONTHS[hMonth-1]+' '+hYear}</Text>
            <Text style={ms.mCenterSub}>{t('selectMonthYear')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={function(){changeMonth(1);}}><Text style={ms.mBtnT}>{isRTL ? '◀' : '▶'}</Text></TouchableOpacity>
        </View>

        <Text style={[ms.secT, {textAlign: textAlign}]}>{t('selectCityLabel')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:12}}>
          {CITIES.map(function(c, i) {
            return (
              <TouchableOpacity key={i}
                style={[ms.cityBtn, cityIdx===i && ms.cityBtnA]}
                onPress={function(){setCityIdx(i);}}>
                <Text style={[ms.cityBtnT, cityIdx===i && {color:'#0B1120'}]}>{getCityName(c)}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {nmDate ? (
          <View style={ms.conjCard}>
            <Text style={ms.conjTitle}>{t('conjunctionTitle')}</Text>
            <Text style={ms.conjVal}>{formatDateLocal(nmDate)+'\n'+t('shareTime')+' '+MoonCalculator.formatTime(nmDate, city.lat, city.lon)}</Text>
            <Text style={ms.conjVal2}>{HijriCalendar.formatGregorian(nmDate)}</Text>
          </View>
        ) : null}

        <Text style={[ms.tableTitle, {textAlign: textAlign}]}>
          {t('tableDesc', {month: HIJRI_MONTHS[hMonth-1], year: hYear, city: getCityName(city)})}
        </Text>

        <View style={ms.table}>
          <View style={ms.tableHeader}>
            <View style={ms.th}><Text style={ms.thT}>{data2 ? t('day30')+'\n'+getWeekDayLocal(data2.date)+'\n'+formatDateShortLocal(data2.date) : ''}</Text></View>
            <View style={ms.th}><Text style={ms.thT}>{data1 ? t('day29')+'\n'+getWeekDayLocal(data1.date)+'\n'+formatDateShortLocal(data1.date) : ''}</Text></View>
            <View style={[ms.th, {flex:1.5}]}><Text style={ms.thT}>{t('specLabel')}</Text></View>
          </View>

          <TRow label={t('sunsetTime')} v1={data1?MoonCalculator.formatTimeHM(data1.data.sunSet, city.lat, city.lon):''} v2={data2?MoonCalculator.formatTimeHM(data2.data.sunSet, city.lat, city.lon):''} />
          <TRow label={t('sunAzimuth')} v1={data1?MoonCalculator.formatDegree(data1.data.sunAzimuth):''} v2={data2?MoonCalculator.formatDegree(data2.data.sunAzimuth):''} />
          <TRow label={t('moonAzimuth')} v1={data1?MoonCalculator.formatDegree(data1.data.moonAzimuth):''} v2={data2?MoonCalculator.formatDegree(data2.data.moonAzimuth):''} />
          <TRow label={t('dazLabel')} v1={data1?MoonCalculator.formatDegree(data1.data.daz):''} v2={data2?MoonCalculator.formatDegree(data2.data.daz):''} />
          <TRow label="Elongation" v1={data1&&data1.data.elongation?data1.data.elongation.toFixed(2)+'\u00B0':''} v2={data2&&data2.data.elongation?data2.data.elongation.toFixed(2)+'\u00B0':''} />
          <TRow label={t('moonAltitude')} v1={data1?MoonCalculator.formatDegree(data1.data.moonAltitude):''} v2={data2?MoonCalculator.formatDegree(data2.data.moonAltitude):''}
            c1={data1&&data1.data.moonAltitude>0?'#00CC44':'#FF3333'} c2={data2&&data2.data.moonAltitude>0?'#00CC44':'#FF3333'} />
          <TRow label={t('moonsetTime')} v1={data1?MoonCalculator.formatTimeHM(data1.data.moonSet, city.lat, city.lon):''} v2={data2?MoonCalculator.formatTimeHM(data2.data.moonSet, city.lat, city.lon):''} />
          <TRow label={t('eclipticLat')} v1={data1?MoonCalculator.formatDegreeDM(data1.data.moonEclipticLat):''} v2={data2?MoonCalculator.formatDegreeDM(data2.data.moonEclipticLat):''} />
          <TRow label={t('lagTimeLabel')} v1={data1?MoonCalculator.formatDuration(data1.data.lagTime):''} v2={data2?MoonCalculator.formatDuration(data2.data.lagTime):''}
            c1={data1&&data1.data.lagTime>0?'#00CC44':'#FF3333'} c2={data2&&data2.data.lagTime>0?'#00CC44':'#FF3333'} />
          <TRow label={t('moonAgeLabel')} v1={data1?MoonCalculator.formatAge(data1.data.moonAge):''} v2={data2?MoonCalculator.formatAge(data2.data.moonAge):''} />
          <TRow label={t('illumination')} v1={data1&&data1.data.illuminationPercent?data1.data.illuminationPercent.toFixed(2)+'%':''} v2={data2&&data2.data.illuminationPercent?data2.data.illuminationPercent.toFixed(2)+'%':''} />
          <TRow label={t('moonDistanceKm')} v1={data1&&data1.data.moonDistance?Math.round(data1.data.moonDistance).toLocaleString():''} v2={data2&&data2.data.moonDistance?Math.round(data2.data.moonDistance).toLocaleString():''} />
          <TRow label="Yallop q" v1={data1&&data1.data.yallopQ?data1.data.yallopQ.toFixed(4):''} v2={data2&&data2.data.yallopQ?data2.data.yallopQ.toFixed(4):''}
            c1={MoonCalculator.getCatColor(data1?data1.data.yallopCat:'')} c2={MoonCalculator.getCatColor(data2?data2.data.yallopCat:'')} />
          <TRow label={t('yallopResult')} v1={data1?getCatTextLocal(data1.data.yallopCat):''} v2={data2?getCatTextLocal(data2.data.yallopCat):''}
            c1={MoonCalculator.getCatColor(data1?data1.data.yallopCat:'')} c2={MoonCalculator.getCatColor(data2?data2.data.yallopCat:'')} />
          <TRow label={t('odehResult')} v1={data1?getCatTextLocal(data1.data.odehCat):''} v2={data2?getCatTextLocal(data2.data.odehCat):''} />
        </View>

        <View style={{height:40}} />
      </View>

      <Modal visible={showPicker} transparent animationType="slide">
        <View style={ms.moBg}><View style={ms.moBox}>
          <Text style={ms.moTitle}>{t('selectMonthYear')}</Text>
          <View style={ms.yrRow}>
            <TouchableOpacity onPress={function(){setHYear(hYear-1);}} style={ms.yrBtn}><Text style={ms.yrBtnT}>{isRTL?'▶':'◀'}</Text></TouchableOpacity>
            <Text style={ms.yrTxt}>{hYear.toString()}</Text>
            <TouchableOpacity onPress={function(){setHYear(hYear+1);}} style={ms.yrBtn}><Text style={ms.yrBtnT}>{isRTL?'◀':'▶'}</Text></TouchableOpacity>
          </View>
          <View style={ms.moGrid}>
            {HIJRI_MONTHS.map(function(name,i){var isSel=hMonth===(i+1);
              return(<TouchableOpacity key={i} style={[ms.moItem,isSel&&ms.moItemA]} onPress={function(){setHMonth(i+1);}}>
                <Text style={[ms.moItemT,isSel&&{color:'#0B1120'}]}>{name}</Text>
              </TouchableOpacity>);})}
          </View>
          <TouchableOpacity style={ms.moOk} onPress={function(){setShowPicker(false);}}><Text style={ms.moOkT}>{t('confirm')}</Text></TouchableOpacity>
        </View></View>
      </Modal>

    </ScrollView>
  );
}

function TRow(props) {
  return (
    <View style={ms.tRow}>
      <View style={ms.td}><Text style={[ms.tdT, props.c2?{color:props.c2}:null]}>{props.v2}</Text></View>
      <View style={ms.td}><Text style={[ms.tdT, props.c1?{color:props.c1}:null]}>{props.v1}</Text></View>
      <View style={[ms.td, {flex:1.5}]}><Text style={ms.tdLabel}>{props.label}</Text></View>
    </View>
  );
}

var ms = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0B1120'},
  content:{padding:16},
  lc:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#0B1120'},
  lt:{color:'#C9A84C',fontSize:14,marginTop:15},
  titleBox:{alignItems:'center',paddingVertical:16,backgroundColor:'#111B30',borderRadius:14,marginBottom:16},
  titleT:{color:'#C9A84C',fontSize:16,fontWeight:'bold',textAlign:'center'},
  monthSel:{flexDirection:'row',alignItems:'center',backgroundColor:'#111B30',borderRadius:12,padding:10,marginBottom:12},
  mBtnT:{color:'#C9A84C',fontSize:18,fontWeight:'bold',padding:10},
  mCenter:{flex:1,alignItems:'center'},
  mCenterT:{color:'#FFF',fontSize:15,fontWeight:'bold'},
  mCenterSub:{color:'#6688aa',fontSize:9,marginTop:2},
  secT:{color:'#C9A84C',fontSize:13,fontWeight:'bold',marginBottom:8},
  cityBtn:{backgroundColor:'#111B30',paddingHorizontal:16,paddingVertical:8,borderRadius:20,marginRight:6,borderWidth:1,borderColor:'#2a3a5a'},
  cityBtnA:{backgroundColor:'#C9A84C',borderColor:'#C9A84C'},
  cityBtnT:{color:'#FFFFFF',fontSize:12,fontWeight:'bold'},
  conjCard:{backgroundColor:'#111B30',borderRadius:12,padding:16,marginBottom:16,alignItems:'center',borderWidth:1,borderColor:'#C9A84C'},
  conjTitle:{color:'#C9A84C',fontSize:14,fontWeight:'bold',marginBottom:8},
  conjVal:{color:'#FFFFFF',fontSize:14,textAlign:'center',lineHeight:22},
  conjVal2:{color:'#6688aa',fontSize:12,textAlign:'center',marginTop:4},
  tableTitle:{color:'#aabbcc',fontSize:12,lineHeight:22,marginBottom:16},
  table:{backgroundColor:'#111B30',borderRadius:12,overflow:'hidden'},
  tableHeader:{flexDirection:'row',backgroundColor:'#1a2a4a',padding:10},
  th:{flex:1,alignItems:'center'},
  thT:{color:'#C9A84C',fontSize:10,fontWeight:'bold',textAlign:'center'},
  tRow:{flexDirection:'row',borderBottomWidth:1,borderBottomColor:'#1a2a4a',paddingVertical:8,paddingHorizontal:6},
  td:{flex:1,justifyContent:'center',alignItems:'center'},
  tdT:{color:'#FFFFFF',fontSize:10,textAlign:'center'},
  tdLabel:{color:'#8899aa',fontSize:10,textAlign:'right'},
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
  moOk:{backgroundColor:'#C9A84C',borderRadius:10,padding:12,alignItems:'center'},
  moOkT:{color:'#0B1120',fontSize:14,fontWeight:'bold'},
});
