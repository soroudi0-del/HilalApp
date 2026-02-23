var Astronomy = require('astronomy-engine');
var moment = require('moment-timezone');
var tzlookup = require('tz-lookup');


var MoonCalculator = {



  getHorizonCoords: function(date, observer, body) {

    try {

      var eq = Astronomy.Equator(body, date, observer, true, true);

      var hor = Astronomy.Horizon(date, observer, eq.ra, eq.dec, 'normal');

      return { altitude: hor.altitude, azimuth: hor.azimuth, ra: eq.ra, dec: eq.dec };

    } catch(e) { return null; }

  },



  calcTopoElongation: function(mH, sH) {

    if (!mH || !sH) return 0;

    var mA=mH.altitude*Math.PI/180, sA=sH.altitude*Math.PI/180;

    var dAz=(mH.azimuth-sH.azimuth)*Math.PI/180;

    var cosE=Math.sin(mA)*Math.sin(sA)+Math.cos(mA)*Math.cos(sA)*Math.cos(dAz);

    if(cosE>1)cosE=1; if(cosE<-1)cosE=-1;

    return Math.acos(cosE)*180/Math.PI;

  },



  getFullMoonData: function(date, latitude, longitude, elevation) {

    if (!elevation) elevation = 0;

    var R = {

      sunRise:null,sunSet:null,moonRise:null,moonSet:null,

      nextNewMoon:null,prevNewMoon:null,

      moonAltitude:null,moonAzimuth:null,sunAltitude:null,sunAzimuth:null,

      moonRA:null,moonDec:null,

      illuminationPercent:0,moonAge:null,elongation:0,topoElongation:0,

      lagTime:null,arcv:null,daz:null,arcl:null,crescentWidth:null,

      moonEclipticLat:null,moonEclipticLon:null,moonDistance:null,moonSemiDiam:null,

      yallopQ:null,yallopCat:'',odehCat:'',saaoCat:'',istanbulCat:'',malaysiaCat:'',soroudiCat:'',

      hilalCalcScore:null,hilalCalcCat:'',

      danjonOk:false,bestTime:null,moonAltBest:null,relAz:null,

      isVisible:false,isVisibleNakedEye:false,

    };

    try {

      var obs = new Astronomy.Observer(latitude, longitude, elevation);



      try{var sr=Astronomy.SearchRiseSet('Sun',obs,1,date,1);if(sr)R.sunRise=sr.date;}catch(e){}

      try{var ss=Astronomy.SearchRiseSet('Sun',obs,-1,date,1);if(ss)R.sunSet=ss.date;}catch(e){}

      try{var mr=Astronomy.SearchRiseSet('Moon',obs,1,date,1);if(mr)R.moonRise=mr.date;}catch(e){}

      try{var ms=Astronomy.SearchRiseSet('Moon',obs,-1,date,1);if(ms)R.moonSet=ms.date;}catch(e){}



      var ref = R.sunSet || date;

      var mH = this.getHorizonCoords(ref, obs, 'Moon');

      var sH = this.getHorizonCoords(ref, obs, 'Sun');

      if(mH){R.moonAltitude=mH.altitude;R.moonAzimuth=mH.azimuth;R.moonRA=mH.ra;R.moonDec=mH.dec;}

      if(sH){R.sunAltitude=sH.altitude;R.sunAzimuth=sH.azimuth;}



      try{var nn=Astronomy.SearchMoonPhase(0,date,40);if(nn)R.nextNewMoon=nn.date;}catch(e){}

      try{var sb=new Date(date.getTime()-35*864e5);var pn=Astronomy.SearchMoonPhase(0,sb,40);if(pn)R.prevNewMoon=pn.date;}catch(e){}

      try{var il=Astronomy.Illumination('Moon',ref);if(il)R.illuminationPercent=il.phase_fraction*100;}catch(e){}

      try{R.elongation=Astronomy.AngleFromSun('Moon',ref);}catch(e){}

      R.topoElongation=this.calcTopoElongation(mH,sH);

      try{var ec=Astronomy.EclipticGeoMoon(ref);if(ec){R.moonEclipticLat=ec.lat;R.moonEclipticLon=ec.lon;}}catch(e){}

      try{var gv=Astronomy.GeoVector('Moon',ref,true);if(gv)R.moonDistance=Math.sqrt(gv.x*gv.x+gv.y*gv.y+gv.z*gv.z)*149597870.7;}catch(e){}

      if(R.moonDistance)R.moonSemiDiam=Math.asin(1737.4/R.moonDistance)*180/Math.PI;



      if(R.prevNewMoon&&R.sunSet)R.moonAge=(R.sunSet.getTime()-R.prevNewMoon.getTime())/36e5;

      if(R.moonAltitude!==null&&R.sunAltitude!==null)R.arcv=R.moonAltitude-R.sunAltitude;

      if(R.moonAzimuth!==null&&R.sunAzimuth!==null){R.daz=Math.abs(R.moonAzimuth-R.sunAzimuth);if(R.daz>180)R.daz=360-R.daz;}

      R.arcl=R.topoElongation>0?R.topoElongation:R.elongation;

      R.relAz=R.daz;

      if(R.sunSet&&R.moonSet)R.lagTime=(R.moonSet.getTime()-R.sunSet.getTime())/6e4;



      var useE=R.arcl;

      if(useE>0){

        var eR=useE*Math.PI/180;

        R.crescentWidth=R.moonSemiDiam?R.moonSemiDiam*2*60*(1-Math.cos(eR)):15*(1-Math.cos(eR));

      }

      R.danjonOk=useE>=7;



      if(R.sunSet&&R.lagTime&&R.lagTime>0){

        R.bestTime=new Date(R.sunSet.getTime()+(R.lagTime*4/9)*6e4);

        var bh=this.getHorizonCoords(R.bestTime,obs,'Moon');

        if(bh)R.moonAltBest=bh.altitude;

      }



      var arcv=R.arcv,W=R.crescentWidth,elong=useE,age=R.moonAge,daz=R.daz,lag=R.lagTime;



      // === YALLOP ===

      if(arcv!==null&&W!==null&&W>0){

        R.yallopQ=(arcv-(11.8371-6.3226*W+0.7319*W*W-0.1018*W*W*W))/10;

        if(R.yallopQ>0.216)R.yallopCat='A';

        else if(R.yallopQ>-0.014)R.yallopCat='B';

        else if(R.yallopQ>-0.160)R.yallopCat='C';

        else if(R.yallopQ>-0.232)R.yallopCat='D';

        else if(R.yallopQ>-0.293)R.yallopCat='E';

        else R.yallopCat='F';

      }



      // === ODEH ===

      if(arcv!==null&&W!==null&&W>0){

        var Vlim=-0.1018*W*W*W+0.7319*W*W-6.3226*W+11.8371;

        if(arcv>=Vlim+4)R.odehCat='A';

        else if(arcv>=Vlim)R.odehCat='B';

        else if(arcv>=Vlim-4&&W>=0.05)R.odehCat='C';

        else if(arcv>0)R.odehCat='D';

        else R.odehCat='F';

      }



      // === SAAO ===

      if(age!==null&&arcv!==null&&elong>0){

        if(age>=24&&arcv>=10&&elong>=12)R.saaoCat='A';

        else if(age>=15&&arcv>=5&&elong>=8)R.saaoCat='B';

        else if(age>=12&&arcv>=3&&elong>=7)R.saaoCat='C';

        else R.saaoCat='F';

      }



      // === ISTANBUL ===

      if(age!==null&&arcv!==null&&elong>0){

        if(arcv>=5&&elong>=8&&age>=8)R.istanbulCat='A';

        else if(arcv>=3&&elong>=7)R.istanbulCat='C';

        else R.istanbulCat='F';

      }



      // === MALAYSIA ===

      if(age!==null&&arcv!==null&&elong>0){

        if(arcv>=3&&elong>=6.4&&age>=8)R.malaysiaCat='A';

        else if(arcv>=2&&elong>=5)R.malaysiaCat='C';

        else R.malaysiaCat='F';

      }



            // =============================================

      // === معیار سرودی نسخه ۲ ===

      // === ترکیب هوشمند معیارهای معتبر ===

      // === با تصحیحات فیزیکی اضافی ===

      // =============================================



      if(arcv!==null && W!==null && W>0 && elong>0 && age!==null && lag!==null) {



        // --- مرحله ۱: استفاده از نتیجه فرمول یالوپ ---

        // q از فرمول واقعی یالوپ (۲۹۵ رصد)

        var qScore = 0;

        if (R.yallopQ !== null) {

          if (R.yallopQ > 0.216) qScore = 100;

          else if (R.yallopQ > -0.014) qScore = 75;

          else if (R.yallopQ > -0.160) qScore = 50;

          else if (R.yallopQ > -0.232) qScore = 25;

          else if (R.yallopQ > -0.293) qScore = 10;

          else qScore = 0;

        }



        // --- مرحله ۲: استفاده از نتیجه فرمول عوده ---

        // Vlim از فرمول واقعی عوده (۷۳۷ رصد)

        var Vlim = -0.1018*W*W*W + 0.7319*W*W - 6.3226*W + 11.8371;

        var vDiff = arcv - Vlim;

        var oScore = 0;

        if (vDiff >= 4) oScore = 100;

        else if (vDiff >= 0) oScore = 75;

        else if (vDiff >= -4 && W >= 0.05) oScore = 50;

        else if (arcv > 0) oScore = 25;

        else oScore = 0;



        // --- مرحله ۳: امتیاز شرایط فیزیکی ---



        // ۳a: حد دانژون (elongation)

        // زیر ۷ درجه: غیرممکن (اثبات شده فیزیکی)

        var elongScore = 0;

        if (elong >= 12) elongScore = 100;

        else if (elong >= 10) elongScore = 80;

        else if (elong >= 8) elongScore = 60;

        else if (elong >= 7) elongScore = 30;

        else elongScore = 0;



        // ۳b: سن ماه

        // کمتر از ۸ ساعت: تقریباً غیرممکن

        var ageScore = 0;

        if (age >= 24) ageScore = 100;

        else if (age >= 18) ageScore = 85;

        else if (age >= 15) ageScore = 70;

        else if (age >= 12) ageScore = 50;

        else if (age >= 8) ageScore = 25;

        else ageScore = 0;



        // ۳c: مکث ماه (Lag Time)

        // منفی = ماه قبل خورشید غروب کرده = غیرممکن

        var lagScore = 0;

        if (lag >= 40) lagScore = 100;

        else if (lag >= 25) lagScore = 80;

        else if (lag >= 15) lagScore = 60;

        else if (lag >= 10) lagScore = 40;

        else if (lag >= 5) lagScore = 20;

        else if (lag > 0) lagScore = 10;

        else lagScore = 0;



        // ۳d: ارتفاع هلال

        // منفی = زیر افق = غیرممکن

        var altScore = 0;

        if (arcv >= 10) altScore = 100;

        else if (arcv >= 7) altScore = 85;

        else if (arcv >= 5) altScore = 70;

        else if (arcv >= 3) altScore = 50;

        else if (arcv >= 1) altScore = 25;

        else if (arcv > 0) altScore = 10;

        else altScore = 0;



        // --- مرحله ۴: ترکیب وزن‌دار ---

        // یالوپ و عوده بیشترین وزن (اثبات شده علمی)

        // شرایط فیزیکی به عنوان تصحیح

        R.soroudiScore = Math.round(

          0.30 * qScore +

          0.30 * oScore +

          0.12 * elongScore +

          0.10 * ageScore +

          0.10 * lagScore +

          0.08 * altScore

        );



        // --- مرحله ۵: شرایط قطعی (Veto) ---

        // اگر شرایط فیزیکی غیرممکن باشه، نتیجه F

        var veto = false;



        // ماه زیر افق

        if (arcv < 0) {

          R.soroudiScore = Math.min(R.soroudiScore, 3);

          veto = true;

        }



        // زیر حد دانژون

        if (elong < 6.5) {

          R.soroudiScore = Math.min(R.soroudiScore, 3);

          veto = true;

        }



        // مکث منفی

        if (lag < 0) {

          R.soroudiScore = Math.min(R.soroudiScore, 5);

          veto = true;

        }



        // سن خیلی کم

        if (age < 6) {

          R.soroudiScore = Math.min(R.soroudiScore, 5);

          veto = true;

        }



        // --- مرحله ۶: دسته‌بندی ---

        if (veto) {

          R.soroudiCat = 'F';

        } else if (R.soroudiScore >= 75) {

          R.soroudiCat = 'A';

        } else if (R.soroudiScore >= 55) {

          R.soroudiCat = 'B';

        } else if (R.soroudiScore >= 35) {

          R.soroudiCat = 'C';

        } else if (R.soroudiScore >= 18) {

          R.soroudiCat = 'D';

        } else {

          R.soroudiCat = 'F';

        }

      }



      R.isVisible=R.yallopCat==='A'||R.yallopCat==='B'||R.yallopCat==='C';

      R.isVisibleNakedEye=R.yallopCat==='A'||R.yallopCat==='B';

    } catch(e){console.error('CALC:',e);}

    return R;

  },



  getMultiDayData: function(s,d,la,lo,el){var r=[];for(var i=0;i<d;i++){var dt=new Date(s.getTime()+i*864e5);r.push({date:dt,data:this.getFullMoonData(dt,la,lo,el)});}return r;},

  formatTime: function(d, lat, lon) {
    if (!d) return '---';
    if (lat !== undefined && lon !== undefined) {
      try {
        var tz = tzlookup(lat, lon);
        return moment(d).tz(tz).format('HH:mm:ss');
      } catch (e) {}
    }
    // اگر مختصات داده نشده بود، زمان رو به صورت UTC (جهانی) نشون می‌ده
    return moment(d).utc().format('HH:mm:ss') + ' (UTC)';
  },
  
  formatTimeHM: function(d, lat, lon) {
    if (!d) return '---';
    if (lat !== undefined && lon !== undefined) {
      try {
        var tz = tzlookup(lat, lon);
        return moment(d).tz(tz).format('HH:mm');
      } catch (e) {}
    }
    return moment(d).utc().format('HH:mm') + ' (UTC)';
  },
  formatDegree: function(v){if(v===null||v===undefined)return'---';var a=Math.abs(v),d=Math.floor(a),mf=(a-d)*60,mn=Math.floor(mf),sc=Math.round((mf-mn)*60);return(v>=0?'':'-')+d+'\u00B0 '+mn+"' "+sc+'"';},

  formatDegreeDM: function(v){if(v===null||v===undefined)return'---';var a=Math.abs(v),d=Math.floor(a),m=Math.round((a-d)*60);return(v>=0?'':'-')+d+' درجه و '+m+' دقیقه قوسی';},

  formatDuration: function(m){if(m===null||m===undefined)return'---';var a=Math.abs(m),h=Math.floor(a/60),mn=Math.round(a%60),s=m>=0?'':'-';if(h>0)return s+h+' ساعت و '+mn+' دقیقه';return s+mn+' دقیقه';},

  formatAge: function(h){if(h===null||h===undefined)return'---';var hr=Math.floor(Math.abs(h)),mn=Math.round((Math.abs(h)-hr)*60);return hr+' ساعت و '+mn+' دقیقه';},

  getCatColor: function(c){if(c==='A')return'#00CC44';if(c==='B')return'#88DD00';if(c==='C')return'#FFAA00';if(c==='D')return'#FF6600';if(c==='E')return'#FF2200';if(c==='F')return'#CC0000';return'#666666';},

  getCatText: function(c){if(c==='A')return'رؤیت آسان با چشم غیرمسلح';if(c==='B')return'رؤیت ممکن در شرایط مناسب';if(c==='C')return'نیاز به ابزار نوری';if(c==='D')return'فقط با تلسکوپ';if(c==='E')return'بسیار دشوار';if(c==='F')return'غیرقابل رؤیت';return'نامشخص';},

  getCatTextFull: function(c){if(c==='A')return'هلال به راحتی با چشم عادی رؤیت می‌شود';if(c==='B')return'در شرایط رصدی مناسب با چشم غیرمسلح قابل مشاهده است';if(c==='C')return'با ابزار نوری قابل رؤیت است';if(c==='D')return'فقط با ابزار نوری رؤیت‌پذیر است';if(c==='E')return'حتی با ابزار نوری رؤیت بسیار دشوار است';if(c==='F')return'هلال قابل رؤیت نیست';return'';},

};



module.exports = MoonCalculator;
