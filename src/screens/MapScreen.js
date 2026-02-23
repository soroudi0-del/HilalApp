import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, Dimensions, Modal
} from 'react-native';

var MoonCalculator = require('../calculations/moonPosition');
var HijriCalendar = require('../calculations/hijriCalendar');
var UserSettings = require('../data/userSettings');
var Astronomy = require('astronomy-engine');
var LP = require('../i18n/LanguageContext');
var useLanguage = LP.useLanguage;

var SW = Dimensions.get('window').width - 32;
var MH = Math.round(SW * 0.55);

var GRID = [];
for (var la=-55; la<=65; la+=12) {
  for (var lo=-170; lo<=170; lo+=12) {
    GRID.push({lat:la, lon:lo});
  }
}

var LAND = [
  [{lat:37,lon:-1},{lat:37,lon:10},{lat:33,lon:12},{lat:32,lon:24},{lat:31,lon:32},{lat:22,lon:37},{lat:12,lon:44},{lat:2,lon:42},{lat:-3,lon:40},{lat:-11,lon:40},{lat:-16,lon:36},{lat:-26,lon:33},{lat:-34,lon:26},{lat:-34,lon:18},{lat:-30,lon:17},{lat:-22,lon:14},{lat:-17,lon:12},{lat:-5,lon:12},{lat:4,lon:10},{lat:6,lon:1},{lat:5,lon:-4},{lat:8,lon:-8},{lat:5,lon:-10},{lat:8,lon:-14},{lat:12,lon:-17},{lat:15,lon:-17},{lat:21,lon:-17},{lat:27,lon:-13},{lat:32,lon:-5},{lat:36,lon:-6},{lat:37,lon:-1}],
  [{lat:36,lon:-9},{lat:37,lon:-7},{lat:43,lon:-9},{lat:44,lon:-1},{lat:46,lon:-1},{lat:48,lon:-5},{lat:49,lon:0},{lat:51,lon:2},{lat:54,lon:6},{lat:55,lon:8},{lat:56,lon:10},{lat:58,lon:12},{lat:59,lon:18},{lat:60,lon:22},{lat:64,lon:26},{lat:66,lon:26},{lat:70,lon:28},{lat:70,lon:32},{lat:68,lon:38},{lat:65,lon:40},{lat:60,lon:30},{lat:55,lon:28},{lat:55,lon:21},{lat:50,lon:20},{lat:48,lon:17},{lat:46,lon:16},{lat:44,lon:15},{lat:42,lon:19},{lat:40,lon:20},{lat:38,lon:24},{lat:36,lon:28},{lat:36,lon:22},{lat:38,lon:22},{lat:40,lon:26},{lat:42,lon:28},{lat:42,lon:42},{lat:40,lon:44},{lat:42,lon:44},{lat:44,lon:40},{lat:46,lon:38},{lat:48,lon:40},{lat:52,lon:42},{lat:55,lon:40},{lat:60,lon:44}],
  [{lat:42,lon:28},{lat:42,lon:35},{lat:38,lon:36},{lat:37,lon:36},{lat:33,lon:36},{lat:30,lon:35},{lat:28,lon:34},{lat:22,lon:37},{lat:16,lon:42},{lat:12,lon:44},{lat:12,lon:51},{lat:16,lon:53},{lat:22,lon:59},{lat:24,lon:57},{lat:25,lon:56},{lat:26,lon:56},{lat:27,lon:50},{lat:30,lon:48},{lat:31,lon:48},{lat:32,lon:44},{lat:36,lon:36},{lat:38,lon:44},{lat:40,lon:50},{lat:38,lon:54},{lat:37,lon:55},{lat:36,lon:54},{lat:26,lon:62},{lat:25,lon:66},{lat:24,lon:68},{lat:8,lon:77},{lat:16,lon:80},{lat:22,lon:88},{lat:20,lon:92},{lat:26,lon:97},{lat:22,lon:99},{lat:18,lon:98},{lat:10,lon:99},{lat:7,lon:100},{lat:1,lon:103},{lat:6,lon:117},{lat:8,lon:118},{lat:18,lon:108},{lat:22,lon:108},{lat:30,lon:122},{lat:35,lon:128},{lat:38,lon:129},{lat:40,lon:130},{lat:43,lon:132},{lat:47,lon:135},{lat:50,lon:140},{lat:54,lon:137},{lat:56,lon:138},{lat:60,lon:150},{lat:62,lon:164},{lat:66,lon:170},{lat:70,lon:180},{lat:70,lon:40},{lat:60,lon:44}],
  [{lat:70,lon:-165},{lat:65,lon:-168},{lat:60,lon:-165},{lat:58,lon:-155},{lat:55,lon:-130},{lat:50,lon:-127},{lat:48,lon:-125},{lat:42,lon:-124},{lat:35,lon:-120},{lat:30,lon:-118},{lat:28,lon:-115},{lat:23,lon:-110},{lat:20,lon:-105},{lat:16,lon:-95},{lat:15,lon:-88},{lat:10,lon:-84},{lat:8,lon:-77},{lat:10,lon:-76},{lat:18,lon:-76},{lat:20,lon:-75},{lat:23,lon:-80},{lat:25,lon:-81},{lat:30,lon:-82},{lat:30,lon:-88},{lat:29,lon:-90},{lat:30,lon:-94},{lat:26,lon:-97},{lat:30,lon:-97},{lat:32,lon:-107},{lat:32,lon:-117},{lat:48,lon:-90},{lat:47,lon:-80},{lat:45,lon:-75},{lat:42,lon:-70},{lat:40,lon:-74},{lat:44,lon:-67},{lat:45,lon:-62},{lat:47,lon:-60},{lat:50,lon:-56},{lat:52,lon:-56},{lat:55,lon:-60},{lat:58,lon:-60},{lat:60,lon:-65},{lat:62,lon:-75},{lat:66,lon:-62},{lat:70,lon:-56},{lat:72,lon:-60},{lat:72,lon:-80},{lat:70,lon:-100},{lat:70,lon:-140},{lat:70,lon:-165}],
  [{lat:12,lon:-72},{lat:10,lon:-67},{lat:8,lon:-60},{lat:5,lon:-52},{lat:2,lon:-50},{lat:0,lon:-48},{lat:-5,lon:-35},{lat:-8,lon:-35},{lat:-15,lon:-39},{lat:-18,lon:-40},{lat:-22,lon:-41},{lat:-25,lon:-48},{lat:-30,lon:-51},{lat:-33,lon:-53},{lat:-35,lon:-57},{lat:-40,lon:-62},{lat:-42,lon:-65},{lat:-46,lon:-68},{lat:-52,lon:-70},{lat:-55,lon:-68},{lat:-55,lon:-72},{lat:-48,lon:-76},{lat:-42,lon:-73},{lat:-37,lon:-73},{lat:-30,lon:-72},{lat:-25,lon:-70},{lat:-18,lon:-70},{lat:-14,lon:-76},{lat:-5,lon:-81},{lat:-1,lon:-80},{lat:2,lon:-79},{lat:7,lon:-78},{lat:10,lon:-76},{lat:12,lon:-72}],
  [{lat:-12,lon:130},{lat:-13,lon:136},{lat:-15,lon:140},{lat:-18,lon:146},{lat:-20,lon:149},{lat:-24,lon:152},{lat:-27,lon:153},{lat:-33,lon:152},{lat:-36,lon:150},{lat:-38,lon:147},{lat:-39,lon:146},{lat:-38,lon:141},{lat:-35,lon:137},{lat:-35,lon:135},{lat:-32,lon:132},{lat:-32,lon:127},{lat:-34,lon:115},{lat:-28,lon:114},{lat:-24,lon:113},{lat:-22,lon:114},{lat:-20,lon:119},{lat:-16,lon:123},{lat:-14,lon:126},{lat:-12,lon:130}],
];

var MAP_CITIES = [
  {name:'تهران',lat:35.69,lon:51.39,show:true},
  {name:'مکه',lat:21.42,lon:39.83,show:true},
  {name:'قاهره',lat:30.04,lon:31.24,show:true},
  {name:'استانبول',lat:41.01,lon:28.98,show:true},
  {name:'لندن',lat:51.51,lon:-0.13,show:true},
  {name:'نیویورک',lat:40.71,lon:-74.01,show:true},
  {name:'لس‌آنجلس',lat:34.05,lon:-118.24,show:true},
  {name:'کراچی',lat:24.86,lon:67.00,show:true},
  {name:'جاکارتا',lat:-6.21,lon:106.85,show:true},
  {name:'سیدنی',lat:-33.87,lon:151.21,show:true},
];

var ALL_CITIES = [
  {name:'تهران',lat:35.69,lon:51.39,flag:'🇮🇷',countryKey:'countryIran'},
  {name:'قم',lat:34.64,lon:50.88,flag:'🇮🇷',countryKey:'countryIran'},
  {name:'مشهد',lat:36.26,lon:59.62,flag:'🇮🇷',countryKey:'countryIran'},
  {name:'اصفهان',lat:32.65,lon:51.67,flag:'🇮🇷',countryKey:'countryIran'},
  {name:'شیراز',lat:29.59,lon:52.58,flag:'🇮🇷',countryKey:'countryIran'},
  {name:'تبریز',lat:38.08,lon:46.29,flag:'🇮🇷',countryKey:'countryIran'},
  {name:'نجف',lat:32.00,lon:44.31,flag:'🇮🇶',countryKey:'countryIraq'},
  {name:'کربلا',lat:32.62,lon:44.02,flag:'🇮🇶',countryKey:'countryIraq'},
  {name:'مکه',lat:21.42,lon:39.83,flag:'🇸🇦',countryKey:'countrySaudi'},
  {name:'مدینه',lat:24.45,lon:39.61,flag:'🇸🇦',countryKey:'countrySaudi'},
  {name:'بیروت',lat:33.89,lon:35.50,flag:'🇱🇧',countryKey:'countryLebanon'},
  {name:'دمشق',lat:33.51,lon:36.28,flag:'🇸🇾',countryKey:'countrySyria'},
  {name:'قاهره',lat:30.04,lon:31.24,flag:'🇪🇬',countryKey:'countryEgypt'},
  {name:'استانبول',lat:41.01,lon:28.98,flag:'🇹🇷',countryKey:'countryTurkey'},
  {name:'کراچی',lat:24.86,lon:67.00,flag:'🇵🇰',countryKey:'countryPakistan'},
  {name:'لندن',lat:51.51,lon:-0.13,flag:'🇬🇧',countryKey:'countryUK'},
  {name:'نیویورک',lat:40.71,lon:-74.01,flag:'🇺🇸',countryKey:'countryUSA'},
  {name:'لس‌آنجلس',lat:34.05,lon:-118.24,flag:'🇺🇸',countryKey:'countryUSA'},
  {name:'تورنتو',lat:43.65,lon:-79.38,flag:'🇨🇦',countryKey:'countryCanada'},
  {name:'سیدنی',lat:-33.87,lon:151.21,flag:'🇦🇺',countryKey:'countryAustralia'},
  {name:'جاکارتا',lat:-6.21,lon:106.85,flag:'🇮🇩',countryKey:'countryIndonesia'},
  {name:'کوالالامپور',lat:3.14,lon:101.69,flag:'🇲🇾',countryKey:'countryMalaysia'},
];

function hijriToApproxDate(hY,hM){var jd=Math.floor((11*hY+3)/30)+354*hY+30*hM-Math.floor((hM-1)/2)+1948440-385;var a=jd+68569;var b=Math.floor(4*a/146097);a=a-Math.floor((146097*b+3)/4);var c=Math.floor(4000*(a+1)/1461001);a=a-Math.floor(1461*c/4)+31;var d=Math.floor(80*a/2447);var day=a-Math.floor(2447*d/80);a=Math.floor(d/11);var month=d+2-12*a;var year=100*(b-49)+c+a;return new Date(year,month-1,day);}

function findNewMoonNear(date){try{var sf=new Date(date.getTime()-5*24*3600000);var nm=Astronomy.SearchMoonPhase(0,sf,35);if(nm)return nm.date;}catch(e){}return date;}

export default function MapScreen() {
  var LCtx = useLanguage();
  var t = LCtx.t;
  var lang = LCtx.lang;
  var isRTL = LCtx.isRTL;
  var HIJRI_MONTHS = LCtx.tArray('hijriMonths');

  var curH = HijriCalendar.estimateHijri(new Date());

  var s1=useState(false);var loading=s1[0];var setLoading=s1[1];
  var s2=useState(curH.year);var hYear=s2[0];var setHYear=s2[1];
  var s3=useState(curH.month);var hMonth=s3[0];var setHMonth=s3[1];
  var s4=useState(null);var nmDate=s4[0];var setNmDate=s4[1];
  var s5=useState('yallop');var crit=s5[0];var setCrit=s5[1];
  var s6=useState(false);var showPicker=s6[0];var setShowPicker=s6[1];
  var s7=useState(null);var mapData=s7[0];var setMapData=s7[1];
  var s8=useState([]);var cityData=s8[0];var setCityData=s8[1];
  var s9=useState(2);var activeDay=s9[0];var setActiveDay=s9[1];
  var s10=useState(null);var selCity=s10[0];var setSelCity=s10[1];
  var s11=useState([]);var fourDays=s11[0];var setFourDays=s11[1];
  var s12=useState(false);var nmFound=s12[0];var setNmFound=s12[1];
  var s13=useState(null);var userCity=s13[0];var setUserCity=s13[1];
  var s14=useState(null);var userCityData=s14[0];var setUserCityData=s14[1];

  useEffect(function(){loadUserCity();findNM();},[]);
  useEffect(function(){findNM();},[hYear,hMonth]);

  var loadUserCity = async function(){var c = await UserSettings.loadCity();setUserCity(c);};

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
    if (lang==='en') return HijriCalendar.formatGregorian(date);
    return HijriCalendar.formatJalali(date);
  };

  var getWeekDayLocal = function(date) {
    if (!date) return '---';
    var days = LCtx.tArray('weekDays');
    return days[date.getDay()];
  };

  var formatDateShortLocal = function(date) {
    if (!date) return '---';
    if (lang==='en') return (date.getMonth()+1)+'/'+date.getDate();
    return HijriCalendar.formatJalaliShort(date);
  };

  var findNM = function(){
    var approx = hijriToApproxDate(hYear, hMonth);
    var nm = findNewMoonNear(approx);
    setNmDate(nm);
    var d0=new Date(nm.getTime()); d0.setHours(12,0,0,0);
    var days=[
      {date:new Date(d0.getTime()-24*3600000), short:t('dayBefore')},
      {date:new Date(d0.getTime()), short:t('dayConjunction')},
      {date:new Date(d0.getTime()+24*3600000), short:t('dayAfter')},
      {date:new Date(d0.getTime()+2*24*3600000), short:t('twoDaysAfter')},
    ];
    setFourDays(days);
    setNmFound(true);
    setMapData(null);setCityData([]);setUserCityData(null);
  };

  var getCatForCrit = function(data) {
    if(crit==='yallop') return data.yallopCat||'';
    if(crit==='odeh') return data.odehCat||'';
    if(crit==='saao') return data.saaoCat||'';
    if(crit==='istanbul') return data.istanbulCat||'';
    if(crit==='malaysia') return data.malaysiaCat||'';
    if(crit==='soroudi') return data.soroudiCat||'';
    return data.yallopCat||'';
  };

  var calcDay = function(dayIdx){
    if(fourDays.length===0)return;
    setActiveDay(dayIdx);setLoading(true);setSelCity(null);
    setTimeout(function(){
      var theDate = fourDays[dayIdx].date;
      var gd = GRID.map(function(p){
        var data=MoonCalculator.getFullMoonData(theDate,p.lat,p.lon,0);
        return {lat:p.lat,lon:p.lon,cat:getCatForCrit(data)};
      });
      setMapData(gd);

      var cd = ALL_CITIES.map(function(c){
        var data=MoonCalculator.getFullMoonData(theDate,c.lat,c.lon,0);
        return {name:c.name,flag:c.flag,countryKey:c.countryKey,lat:c.lat,lon:c.lon,cat:getCatForCrit(data),data:data};
      });
      cd.sort(function(a,b){return(b.data.yallopQ||-999)-(a.data.yallopQ||-999);});
      setCityData(cd);

      if(userCity){
        var uData=MoonCalculator.getFullMoonData(theDate,userCity.lat,userCity.lon,userCity.alt||0);
        setUserCityData({name:userCity.name,lat:userCity.lat,lon:userCity.lon,cat:getCatForCrit(uData),data:uData});
      }
      setLoading(false);
    },50);
  };

  var changeMonth=function(d){var nm=hMonth+d;var ny=hYear;if(nm>12){nm=1;ny++;}if(nm<1){nm=12;ny--;}setHMonth(nm);setHYear(ny);};
  var toX=function(lon){return((lon+180)/360)*SW;};
  var toY=function(lat){return((90-lat)/140)*MH;};
  var textAlign = isRTL ? 'right' : 'left';

  return(
    <ScrollView style={z.container}>
      <View style={z.content}>

        <View style={z.titleBox}>
          <Text style={z.titleT}>{t('worldMap')}</Text>
          <Text style={z.titleT2}>{t('month')+' '+HIJRI_MONTHS[hMonth-1]+' '+t('year')+' '+hYear}</Text>
          {userCity?<Text style={z.titleCity}>{'📍 '+t('yourCity')+': '+getCityName(userCity)}</Text>:null}
        </View>

        <View style={z.monthSel}>
          <TouchableOpacity onPress={function(){changeMonth(-1);}}><Text style={z.mBtnT}>{isRTL?'▶':'◀'}</Text></TouchableOpacity>
          <TouchableOpacity onPress={function(){setShowPicker(true);}} style={z.mCenter}>
            <Text style={z.mCenterT}>{HIJRI_MONTHS[hMonth-1]+' '+hYear}</Text>
            <Text style={z.mCenterSub}>{t('selectMonthYear')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={function(){changeMonth(1);}}><Text style={z.mBtnT}>{isRTL?'◀':'▶'}</Text></TouchableOpacity>
        </View>

        {nmDate?(
          <View style={z.nmCard}>
            <Text style={z.nmT}>{'🌑 '+formatDateLocal(nmDate)}</Text>
            <Text style={z.nmT}>{HijriCalendar.formatGregorian(nmDate)}</Text>
            <Text style={z.nmT2}>{t('shareTime')+' '+MoonCalculator.formatTime(nmDate)}</Text>
          </View>
        ):null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:8}}>
          {[{id:'yallop',n:'YALLOP'},{id:'odeh',n:'ODEH'},{id:'saao',n:'SAAO'},{id:'istanbul',n:'ISTANBUL'},{id:'malaysia',n:'MALAYSIA'},{id:'soroudi',n:'SOROUDI'}].map(function(c){
            return(<TouchableOpacity key={c.id} style={[z.crBtn,crit===c.id&&z.crBtnA]}
              onPress={function(){setCrit(c.id);setMapData(null);setCityData([]);setUserCityData(null);}}>
              <Text style={[z.crBtnT,crit===c.id&&{color:'#0B1120'}]}>{c.n}</Text>
            </TouchableOpacity>);
          })}
        </ScrollView>

        {fourDays.length>0?(
          <View>
            <View style={z.dayBtns}>
              {fourDays.map(function(d,i){
                var isA=activeDay===i&&mapData!==null;
                return(
                  <TouchableOpacity key={i} style={[z.dayBtn,isA&&z.dayBtnA]} onPress={function(){calcDay(i);}}>
                    <Text style={[z.dayBtnT,isA&&{color:'#0B1120'}]}>{d.short}</Text>
                    <Text style={[z.dayBtnD,isA&&{color:'#0B1120'}]}>{getWeekDayLocal(d.date)}</Text>
                    <Text style={[z.dayBtnD,isA&&{color:'#0B1120'}]}>{formatDateShortLocal(d.date)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {activeDay!==null && mapData!==null && fourDays.length>0 ? (
              <Text style={z.dayNote}>{t('hilalStatusInCity')+' '+getWeekDayLocal(fourDays[activeDay].date)+' '+formatDateLocal(fourDays[activeDay].date)}</Text>
            ) : null}
          </View>
        ):null}

        {loading?(<View style={z.loadBox}><ActivityIndicator size="large" color="#C9A84C"/><Text style={z.lt}>{t('calculating')}</Text></View>):null}

        {!loading&&mapData&&fourDays.length>0?(
          <View>
            <View style={z.mapHeader}>
              <Text style={z.mapHT}>{fourDays[activeDay].short}</Text>
              <Text style={z.mapHT2}>{getWeekDayLocal(fourDays[activeDay].date)+' '+formatDateLocal(fourDays[activeDay].date)}</Text>
              <Text style={z.mapHT3}>{HijriCalendar.formatGregorian(fourDays[activeDay].date)+' | '+crit.toUpperCase()}</Text>
            </View>

            <View style={[z.mapBox,{width:SW,height:MH+22}]}>
              <View style={{width:SW,height:MH,backgroundColor:'#04111E'}}>
                {[-60,-30,0,30,60].map(function(lat,i){return <View key={'h'+i} style={{position:'absolute',left:0,right:0,top:toY(lat),height:0.5,backgroundColor:'#0E1E2E'}}/>;})}{[-150,-120,-90,-60,-30,0,30,60,90,120,150].map(function(lon,i){return <View key={'v'+i} style={{position:'absolute',top:0,bottom:0,left:toX(lon),width:0.5,backgroundColor:'#0E1E2E'}}/>;})}<View style={{position:'absolute',left:0,right:0,top:toY(0),height:1,backgroundColor:'#1a2a3a'}}/>

                {mapData.map(function(p,i){
                  if(!p.cat)return null;
                  var color=MoonCalculator.getCatColor(p.cat);
                  return(<View key={'g'+i} style={{position:'absolute',left:toX(p.lon)-5,top:toY(p.lat)-5,width:10,height:10,borderRadius:5,backgroundColor:color,opacity:0.55}}/>);
                })}

                {LAND.map(function(cont,ci){
                  var els=[];
                  for(var pi=0;pi<cont.length-1;pi++){
                    var x1=toX(cont[pi].lon),y1=toY(cont[pi].lat);
                    var x2=toX(cont[pi+1].lon),y2=toY(cont[pi+1].lat);
                    var dx=x2-x1,dy=y2-y1;
                    var len=Math.sqrt(dx*dx+dy*dy);
                    var ang=Math.atan2(dy,dx)*180/Math.PI;
                    if(len>0&&len<SW*0.5){
                      els.push(<View key={'c'+ci+'p'+pi} style={{position:'absolute',left:x1,top:y1,width:len,height:1,backgroundColor:'#1a4a1a',transform:[{rotate:ang+'deg'}],transformOrigin:'left center'}}/>);
                    }
                  }
                  return els;
                })}

                {MAP_CITIES.map(function(c,i){
                  var cd=cityData.find(function(x){return x.name===c.name;});
                  var cat=cd?cd.cat:'';
                  var color=cat?MoonCalculator.getCatColor(cat):'#444';
                  var x=toX(c.lon),y=toY(c.lat);
                  return(<View key={'mc'+i}>
                    <View style={{position:'absolute',left:x-2.5,top:y-2.5,width:5,height:5,borderRadius:2.5,backgroundColor:color,borderWidth:1,borderColor:'#AAA',zIndex:10}}/>
                    {c.show?<Text style={{position:'absolute',left:x+4,top:y-5,color:'#7799aa',fontSize:5.5,zIndex:5}}>{getCityName(c)}</Text>:null}
                  </View>);
                })}

                {userCityData?(function(){
                  var color=MoonCalculator.getCatColor(userCityData.cat);
                  var x=toX(userCityData.lon),y=toY(userCityData.lat);
                  return(
                    <View>
                      <View style={{position:'absolute',left:x-8,top:y-8,width:16,height:16,borderRadius:8,borderWidth:2,borderColor:'#FFF',zIndex:20}}/>
                      <View style={{position:'absolute',left:x-5,top:y-5,width:10,height:10,borderRadius:5,backgroundColor:color,zIndex:21}}/>
                      <Text style={{position:'absolute',left:x+10,top:y-8,color:'#FFD700',fontSize:8,fontWeight:'bold',zIndex:22}}>{'📍 '+getCityName(userCityData)}</Text>
                    </View>
                  );
                })():null}

              </View>

              <View style={{flexDirection:'row',justifyContent:'center',paddingVertical:3,gap:6,flexWrap:'wrap',backgroundColor:'#060F1A'}}>
                {['A','B','C','D','F'].map(function(c){
                  return(<View key={c} style={{flexDirection:'row',alignItems:'center',gap:2}}>
                    <Text style={{color:'#556677',fontSize:7}}>{c}</Text>
                    <View style={{width:7,height:7,borderRadius:4,backgroundColor:MoonCalculator.getCatColor(c)}}/>
                  </View>);
                })}
                {userCity?<Text style={{color:'#FFD700',fontSize:7}}>{'⭐ '+getCityName(userCity)}</Text>:null}
              </View>
            </View>

            {userCityData?(
              <View style={[z.userCityBox,{borderColor:MoonCalculator.getCatColor(userCityData.cat)}]}>
                <Text style={[z.userCityTitle,{textAlign:textAlign}]}>{'⭐ '+getCityName(userCityData)+':'}</Text>
                <View style={{flexDirection:'row',alignItems:'center',gap:8,marginTop:8}}>
                  <View style={[z.badge,{backgroundColor:MoonCalculator.getCatColor(userCityData.cat)}]}>
                    <Text style={z.badgeT}>{userCityData.cat||'?'}</Text>
                  </View>
                  <Text style={[z.userCatText,{color:MoonCalculator.getCatColor(userCityData.cat)}]}>{getCatTextLocal(userCityData.cat)}</Text>
                </View>
                <View style={{marginTop:8}}>
                  <CDR l={t('moonAltitude')} v={MoonCalculator.formatDegree(userCityData.data.moonAltitude)} c={userCityData.data.moonAltitude>0?'#0C4':'#F33'} />
                  <CDR l={t('moonAgeLabel')} v={MoonCalculator.formatAge(userCityData.data.moonAge)} />
                  <CDR l={t('lagTimeLabel')} v={MoonCalculator.formatDuration(userCityData.data.lagTime)} c={userCityData.data.lagTime>0?'#0C4':'#F33'} />
                  <CDR l="Elongation" v={userCityData.data.topoElongation?userCityData.data.topoElongation.toFixed(2)+'\u00B0':'---'} />
                  <CDR l={t('illumination')} v={userCityData.data.illuminationPercent?userCityData.data.illuminationPercent.toFixed(2)+'%':'---'} />
                  <CDR l="Yallop q" v={userCityData.data.yallopQ!==null?userCityData.data.yallopQ.toFixed(4):'---'} c={MoonCalculator.getCatColor(userCityData.data.yallopCat)} />
                </View>
              </View>
            ):null}

            <Text style={[z.secTitle,{textAlign:textAlign}]}>{t('cityStatus')}</Text>
            {cityData.map(function(city,i){
              var color=MoonCalculator.getCatColor(city.cat);
              var isExp=selCity===i;
              return(<TouchableOpacity key={i} style={[z.cityCard,{borderLeftColor:color}]} onPress={function(){setSelCity(isExp?null:i);}}>
                <View style={z.cityH}>
                  <Text style={{fontSize:16}}>{city.flag}</Text>
                  <View style={{flex:1}}><Text style={z.cityN}>{getCityName(city)}</Text><Text style={z.cityC}>{t(city.countryKey)}</Text></View>
                  <View style={[z.badge,{backgroundColor:color}]}><Text style={z.badgeT}>{city.cat||'?'}</Text></View>
                </View>
                {isExp?(<View style={z.cityExp}>
                  <Text style={[z.cityFull,{color:color,textAlign:textAlign}]}>{getCatFullLocal(city.cat)}</Text>
                  <CDR l={t('altitude')} v={MoonCalculator.formatDegree(city.data.moonAltitude)} c={city.data.moonAltitude>0?'#0C4':'#F33'} />
                  <CDR l={t('age')} v={MoonCalculator.formatAge(city.data.moonAge)} />
                  <CDR l={t('lag')} v={MoonCalculator.formatDuration(city.data.lagTime)} c={city.data.lagTime>0?'#0C4':'#F33'} />
                  <CDR l="Elong" v={city.data.elongation?city.data.elongation.toFixed(2)+'\u00B0':'---'} />
                  <CDR l={t('brightness')} v={city.data.illuminationPercent?city.data.illuminationPercent.toFixed(2)+'%':'---'} />
                  <CDR l={t('sunsetShort')} v={MoonCalculator.formatTimeHM(city.data.sunSet, city.lat, city.lon)} />
                  <CDR l="Q" v={city.data.yallopQ!==null?city.data.yallopQ.toFixed(4):'---'} c={MoonCalculator.getCatColor(city.data.yallopCat)} />
                </View>):null}
                <Text style={z.expH}>{isExp?'▲':'▼'}</Text>
              </TouchableOpacity>);
            })}
          </View>
        ):null}

        {!loading&&!mapData&&nmFound?(<View style={z.emptyBox}><Text style={{fontSize:40}}>👆</Text><Text style={z.emptyT}>{t('selectADay')}</Text></View>):null}

        <View style={z.noteBox}>
          <Text style={[z.noteT,{textAlign:textAlign}]}>{t('mapGuide')}</Text>
        </View>

        <View style={{height:40}}/>
      </View>

      <Modal visible={showPicker} transparent animationType="slide">
        <View style={z.moBg}><View style={z.moBox}>
          <Text style={z.moTitle}>{t('selectMonthYear')}</Text>
          <View style={z.yrRow}>
            <TouchableOpacity onPress={function(){setHYear(hYear-1);}} style={z.yrBtn}><Text style={z.yrBtnT}>{isRTL?'▶':'◀'}</Text></TouchableOpacity>
            <Text style={z.yrTxt}>{hYear.toString()}</Text>
            <TouchableOpacity onPress={function(){setHYear(hYear+1);}} style={z.yrBtn}><Text style={z.yrBtnT}>{isRTL?'◀':'▶'}</Text></TouchableOpacity>
          </View>
          <View style={z.moGrid}>
            {HIJRI_MONTHS.map(function(name,i){var isSel=hMonth===(i+1);
              return(<TouchableOpacity key={i} style={[z.moItem,isSel&&z.moItemA]} onPress={function(){setHMonth(i+1);}}>
                <Text style={[z.moItemT,isSel&&{color:'#0B1120'}]}>{name}</Text>
              </TouchableOpacity>);})}
          </View>
          <TouchableOpacity style={z.moOk} onPress={function(){setShowPicker(false);}}><Text style={z.moOkT}>{t('confirm')}</Text></TouchableOpacity>
        </View></View>
      </Modal>

    </ScrollView>
  );
}

function CDR(p){return(<View style={z.cdr}><Text style={[z.cdrV,p.c?{color:p.c}:null]}>{p.v}</Text><Text style={z.cdrL}>{p.l}</Text></View>);}

var z = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0B1120'},
  content:{padding:16},
  lt:{color:'#C9A84C',fontSize:13,marginTop:10},
  titleBox:{alignItems:'center',paddingVertical:16,backgroundColor:'#111B30',borderRadius:14,marginBottom:10},
  titleT:{color:'#C9A84C',fontSize:16,fontWeight:'bold'},
  titleT2:{color:'#FFF',fontSize:13,marginTop:4},
  titleCity:{color:'#FFD700',fontSize:12,marginTop:4,fontWeight:'bold'},
  monthSel:{flexDirection:'row',alignItems:'center',backgroundColor:'#111B30',borderRadius:12,padding:10,marginBottom:8},
  mBtnT:{color:'#C9A84C',fontSize:18,fontWeight:'bold',padding:10},
  mCenter:{flex:1,alignItems:'center'},
  mCenterT:{color:'#FFF',fontSize:15,fontWeight:'bold'},
  mCenterSub:{color:'#6688aa',fontSize:9,marginTop:2},
  nmCard:{backgroundColor:'#111B30',borderRadius:10,padding:10,marginBottom:8,alignItems:'center',borderWidth:1,borderColor:'#C9A84C'},
  nmT:{color:'#FFF',fontSize:12},
  nmT2:{color:'#88BBFF',fontSize:11,marginTop:2},
  crBtn:{backgroundColor:'#111B30',paddingHorizontal:12,paddingVertical:7,borderRadius:20,marginRight:5,borderWidth:1,borderColor:'#2a3a5a'},
  crBtnA:{backgroundColor:'#C9A84C'},
  crBtnT:{color:'#FFF',fontSize:10,fontWeight:'bold'},
  dayBtns:{flexDirection:'row',gap:4,marginBottom:10,marginTop:4},
  dayBtn:{flex:1,backgroundColor:'#111B30',borderRadius:8,padding:8,alignItems:'center',borderWidth:1,borderColor:'#1a2a4a'},
  dayBtnA:{backgroundColor:'#C9A84C'},
  dayBtnT:{color:'#CCC',fontSize:9,fontWeight:'bold'},
  dayBtnD:{color:'#6688aa',fontSize:7,marginTop:1},
  loadBox:{alignItems:'center',paddingVertical:30},
  mapHeader:{backgroundColor:'#111B30',borderTopLeftRadius:12,borderTopRightRadius:12,padding:10,alignItems:'center'},
  mapHT:{color:'#C9A84C',fontSize:12,fontWeight:'bold'},
  mapHT2:{color:'#FFF',fontSize:11,marginTop:2},
  mapHT3:{color:'#6688aa',fontSize:9,marginTop:2},
  mapBox:{backgroundColor:'#040E1A',borderBottomLeftRadius:12,borderBottomRightRadius:12,overflow:'hidden',marginBottom:10,borderWidth:1,borderColor:'#1a3a5a'},
  userCityBox:{backgroundColor:'#111B30',borderRadius:12,padding:14,marginBottom:10,borderWidth:2},
  userCityTitle:{color:'#FFD700',fontSize:13,fontWeight:'bold'},
  userCatText:{fontSize:13,fontWeight:'bold'},
  badge:{width:26,height:26,borderRadius:13,justifyContent:'center',alignItems:'center'},
  badgeT:{color:'#FFF',fontSize:12,fontWeight:'bold'},
  secTitle:{color:'#C9A84C',fontSize:13,fontWeight:'bold',marginBottom:8},
  cityCard:{backgroundColor:'#111B30',borderRadius:10,padding:12,marginBottom:5,borderLeftWidth:3},
  cityH:{flexDirection:'row',alignItems:'center',gap:6},
  cityN:{color:'#FFF',fontSize:12,fontWeight:'bold'},
  cityC:{color:'#6688aa',fontSize:9},
  cityExp:{marginTop:8,paddingTop:8,borderTopWidth:1,borderTopColor:'#1a2a4a'},
  cityFull:{fontSize:10,lineHeight:16,marginBottom:4},
  cdr:{flexDirection:'row',justifyContent:'space-between',paddingVertical:3},
  cdrL:{color:'#6688aa',fontSize:10},
  cdrV:{color:'#CDE',fontSize:10,fontWeight:'600'},
  expH:{color:'#4a6a8a',fontSize:9,textAlign:'center',marginTop:4},
  emptyBox:{alignItems:'center',paddingVertical:40},
  emptyT:{color:'#6688aa',fontSize:13,marginTop:8},
  noteBox:{backgroundColor:'#111B30',borderRadius:10,padding:12,marginTop:6},
  noteT:{color:'#8899aa',fontSize:10,lineHeight:18},
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
  dayNote:{color:'#88BBFF',fontSize:11,textAlign:'center',marginTop:6,marginBottom:4,fontStyle:'italic'},
});
