var Astronomy = require('astronomy-engine');



var HijriCalendar = {



  hijriMonths: ['محرم','صفر','ربیع‌الاول','ربیع‌الثانی','جمادی‌الاول','جمادی‌الثانی','رجب','شعبان','شهر رمضان','شوال','ذیقعده','ذیحجه'],

  weekDays: ['یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه','شنبه'],

  persianMonths: ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'],

  gregorianMonths: ['January','February','March','April','May','June','July','August','September','October','November','December'],



  getNextNewMoon: function(d) {

    try { var r = Astronomy.SearchMoonPhase(0, d, 40); return r ? r.date : null; }

    catch(e) { return null; }

  },



  getPrevNewMoon: function(d) {

    try {

      var s = new Date(d.getTime() - 35*24*3600000);

      var r = Astronomy.SearchMoonPhase(0, s, 40);

      return r ? r.date : null;

    } catch(e) { return null; }

  },



  toJalali: function(gy, gm, gd) {

    var g = [0,31,59,90,120,151,181,212,243,273,304,334];

    var jy = (gy <= 1600) ? 0 : 979;

    gy = (gy <= 1600) ? (gy - 621) : (gy - 1600);

    var gy2 = (gm > 2) ? (gy + 1) : gy;

    var days = (365*gy) + Math.floor((gy2+3)/4) - Math.floor((gy2+99)/100) + Math.floor((gy2+399)/400) - 80 + gd + g[gm-1];

    jy += 33 * Math.floor(days / 12053);

    days %= 12053;

    jy += 4 * Math.floor(days / 1461);

    days %= 1461;

    if (days > 365) {

      jy += Math.floor((days - 1) / 365);

      days = (days - 1) % 365;

    }

    var jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);

    var jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));

    return { year: jy, month: jm, day: jd };

  },



  formatJalali: function(date) {

    if (!date) return '---';

    var j = this.toJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());

    return j.day + ' ' + this.persianMonths[j.month - 1] + ' ' + j.year;

  },



  formatJalaliShort: function(date) {

    if (!date) return '---';

    var j = this.toJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());

    return j.year + '/' + j.month + '/' + j.day;

  },



  formatGregorian: function(date) {

    if (!date) return '---';

    return date.getDate() + ' ' + this.gregorianMonths[date.getMonth()] + ' ' + date.getFullYear();

  },



  getWeekDay: function(date) {

    if (!date) return '---';

    return this.weekDays[date.getDay()];

  },



  estimateHijri: function(date) {

    var jd = Math.floor((date.getTime() / 86400000) + 2440587.5);

    var l = jd - 1948440 + 10632;

    var n = Math.floor((l - 1) / 10631);

    l = l - 10631 * n + 354;

    var j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);

    l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;

    var m = Math.floor((24 * l) / 709);

    var d = l - Math.floor((709 * m) / 24);

    var y = 30 * n + j - 30;

    return { year: y, month: m, day: d };

  },



  formatHijri: function(date) {

    if (!date) return '---';

    var h = this.estimateHijri(date);

    return h.day + ' ' + this.hijriMonths[h.month - 1] + ' ' + h.year;

  },



  getNextHijriMonth: function(date) {

    var h = this.estimateHijri(date);

    var nm = h.month + 1;

    var ny = h.year;

    if (nm > 12) { nm = 1; ny++; }

    return { month: nm, year: ny, name: this.hijriMonths[nm - 1] };

  },



  getMoonPhases: function(d) {

    try {

      var nm = Astronomy.SearchMoonPhase(0, d, 40);

      var fq = Astronomy.SearchMoonPhase(90, d, 40);

      var fm = Astronomy.SearchMoonPhase(180, d, 40);

      var lq = Astronomy.SearchMoonPhase(270, d, 40);

      return {

        newMoon: nm ? nm.date : null,

        firstQuarter: fq ? fq.date : null,

        fullMoon: fm ? fm.date : null,

        lastQuarter: lq ? lq.date : null,

      };

    } catch(e) {

      return { newMoon: null, firstQuarter: null, fullMoon: null, lastQuarter: null };

    }

  },



  generateReport: function(date, moonData, city) {

    var nextMonth = this.getNextHijriMonth(date);

    var jalali = this.formatJalali(date);

    var hijri = this.formatHijri(date);

    var greg = this.formatGregorian(date);

    var weekDay = this.getWeekDay(date);



    var MoonCalculator = require('./moonPosition');

    var catText = MoonCalculator.getCatTextFull(moonData.yallopCat);



    var report = 'وضعیت رؤیت هلال ماه ' + nextMonth.name + ' سال ' + nextMonth.year + ' هجری قمری\n\n';

    report += 'در غروب روز ' + weekDay + ' ' + jalali + ' هجری شمسی\n';

    report += 'برابر با ' + hijri + ' هجری قمری\n';

    report += 'مطابق با ' + greg + ' میلادی\n\n';



    if (moonData.prevNewMoon) {

      report += 'New Moon: ' + this.formatGregorian(moonData.prevNewMoon) + '\n';

      report += MoonCalculator.formatTime(moonData.prevNewMoon) + '\n\n';

    }



    report += 'در افق ' + (city || 'محل مورد نظر') + ':\n';

    report += catText + '\n\n';



    if (moonData.yallopCat === 'A' || moonData.yallopCat === 'B') {

      report += 'بنابراین هلال ماه ' + nextMonth.name + ' با چشم غیرمسلح قابل رؤیت می‌باشد.';

    } else if (moonData.yallopCat === 'C') {

      report += 'هلال ماه ' + nextMonth.name + ' با ابزار نوری قابل رؤیت می‌باشد.';

    } else {

      report += 'هلال ماه ' + nextMonth.name + ' قابل رؤیت نمی‌باشد.';

    }



    return report;

  },

};



module.exports = HijriCalendar;

