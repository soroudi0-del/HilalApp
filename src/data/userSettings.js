var AsyncStorage = require('@react-native-async-storage/async-storage');

var Storage = AsyncStorage.default || AsyncStorage;

var UserSettings = {

  defaultCity: {
    name: 'قم',
    lat: 34.6401,
    lon: 50.8764,
    alt: 930,
  },

  predefinedCities: [
    {name:'قم', lat:34.6401, lon:50.8764, alt:930},
    {name:'تهران', lat:35.6892, lon:51.3890, alt:1200},
    {name:'مشهد', lat:36.2605, lon:59.6168, alt:990},
    {name:'اصفهان', lat:32.6546, lon:51.6680, alt:1570},
    {name:'شیراز', lat:29.5918, lon:52.5837, alt:1486},
    {name:'تبریز', lat:38.0800, lon:46.2919, alt:1350},
    {name:'اهواز', lat:31.3183, lon:48.6706, alt:18},
    {name:'کرمان', lat:30.2839, lon:57.0834, alt:1755},
    {name:'رشت', lat:37.2808, lon:49.5832, alt:-7},
    {name:'همدان', lat:34.7988, lon:48.5146, alt:1820},
    {name:'یزد', lat:31.8974, lon:54.3569, alt:1216},
    {name:'بندرعباس', lat:27.1865, lon:56.2808, alt:9},
    {name:'سنندج', lat:35.3219, lon:46.9862, alt:1480},
    {name:'نجف', lat:31.9968, lon:44.3148, alt:53},
    {name:'کربلا', lat:32.6160, lon:44.0233, alt:32},
    {name:'بغداد', lat:33.3152, lon:44.3661, alt:34},
    {name:'مکه', lat:21.4225, lon:39.8262, alt:277},
    {name:'مدینه', lat:24.4539, lon:39.6142, alt:597},
    {name:'جده', lat:21.5169, lon:39.2192, alt:12},
    {name:'ریاض', lat:24.7136, lon:46.6753, alt:612},
    {name:'بیروت', lat:33.8938, lon:35.5018, alt:0},
    {name:'دمشق', lat:33.5138, lon:36.2765, alt:680},
    {name:'قاهره', lat:30.0444, lon:31.2357, alt:75},
    {name:'استانبول', lat:41.0082, lon:28.9784, alt:40},
    {name:'آنکارا', lat:39.9334, lon:32.8597, alt:938},
    {name:'کراچی', lat:24.8607, lon:67.0011, alt:8},
    {name:'اسلام‌آباد', lat:33.6844, lon:73.0479, alt:507},
    {name:'کابل', lat:34.5553, lon:69.2075, alt:1791},
    {name:'دوحه', lat:25.2854, lon:51.5310, alt:10},
    {name:'مسقط', lat:23.5880, lon:58.3829, alt:5},
    {name:'کویت', lat:29.3759, lon:47.9774, alt:0},
    {name:'لندن', lat:51.5074, lon:-0.1278, alt:11},
    {name:'پاریس', lat:48.8566, lon:2.3522, alt:35},
    {name:'برلین', lat:52.5200, lon:13.4050, alt:34},
    {name:'نیویورک', lat:40.7128, lon:-74.0060, alt:10},
    {name:'لس‌آنجلس', lat:34.0522, lon:-118.2437, alt:71},
    {name:'شیکاگو', lat:41.8781, lon:-87.6298, alt:181},
    {name:'تورنتو', lat:43.6532, lon:-79.3832, alt:76},
    {name:'سیدنی', lat:-33.8688, lon:151.2093, alt:3},
    {name:'کوالالامپور', lat:3.1390, lon:101.6869, alt:22},
    {name:'جاکارتا', lat:-6.2088, lon:106.8456, alt:8},
    {name:'توکیو', lat:35.6762, lon:139.6503, alt:40},
    {name:'پکن', lat:39.9042, lon:116.4074, alt:43},
  ],

  saveCity: async function(city) {
    try {
      await Storage.setItem('userCity', JSON.stringify(city));
      return true;
    } catch(e) {
      console.log('Save error:', e);
      return false;
    }
  },

  loadCity: async function() {
    try {
      var data = await Storage.getItem('userCity');
      if (data) return JSON.parse(data);
      return this.defaultCity;
    } catch(e) {
      return this.defaultCity;
    }
  },

  saveCustomCity: async function(name, lat, lon, alt) {
    var city = {
      name: name,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      alt: parseFloat(alt) || 0,
      custom: true
    };
    return await this.saveCity(city);
  },

  getCityKey: function(name) {
    var map = {
      'قم': 'cityQom',
      'تهران': 'cityTehran',
      'مشهد': 'cityMashhad',
      'اصفهان': 'cityIsfahan',
      'شیراز': 'cityShiraz',
      'تبریز': 'cityTabriz',
      'اهواز': 'cityAhvaz',
      'کرمان': 'cityKerman',
      'رشت': 'cityRasht',
      'همدان': 'cityHamedan',
      'یزد': 'cityYazd',
      'بندرعباس': 'cityBandarAbbas',
      'سنندج': 'citySanandaj',
      'نجف': 'cityNajaf',
      'کربلا': 'cityKarbala',
      'بغداد': 'cityBaghdad',
      'مکه': 'cityMecca',
      'مدینه': 'cityMedina',
      'جده': 'cityJeddah',
      'ریاض': 'cityRiyadh',
      'بیروت': 'cityBeirut',
      'دمشق': 'cityDamascus',
      'قاهره': 'cityCairo',
      'استانبول': 'cityIstanbul',
      'آنکارا': 'cityAnkara',
      'کراچی': 'cityKarachi',
      'اسلام‌آباد': 'cityIslamabad',
      'کابل': 'cityKabul',
      'دوحه': 'cityDoha',
      'مسقط': 'cityMuscat',
      'کویت': 'cityKuwait',
      'لندن': 'cityLondon',
      'پاریس': 'cityParis',
      'برلین': 'cityBerlin',
      'نیویورک': 'cityNewYork',
      'لس‌آنجلس': 'cityLosAngeles',
      'شیکاگو': 'cityChicago',
      'تورنتو': 'cityToronto',
      'سیدنی': 'citySydney',
      'کوالالامپور': 'cityKualaLumpur',
      'جاکارتا': 'cityJakarta',
      'توکیو': 'cityTokyo',
      'پکن': 'cityBeijing',
    };
    return map[name] || null;
  },
};

module.exports = UserSettings;
