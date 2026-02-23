<div align="center">

# 🌙 Hilal Sighting

### Crescent Moon Visibility Prediction App

[![Platform](https://img.shields.io/badge/Platform-Android-green.svg)](https://github.com/soroudi0-del/HilalApp/releases)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-black.svg)](https://expo.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Languages](https://img.shields.io/badge/Languages-FA%20%7C%20AR%20%7C%20EN-orange.svg)](#languages)

**The most comprehensive crescent moon (Hilal) visibility prediction application for the global Muslim community.**

[Download on Github](https://github.com/soroudi0-del/HilalApp/releases) · [Report Bug](mailto:info.gamevar.ir@gmail.com) · [Request Feature](mailto:info.gamevar.ir@gmail.com)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [The Problem](#the-problem)
- [Features](#features)
- [Screenshots](#screenshots)
- [Scientific Criteria](#scientific-criteria)
- [Scholar Opinions](#scholar-opinions-maraje)
- [Astronomical Parameters](#astronomical-parameters)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Building](#building)
- [Supported Cities](#supported-cities)
- [Languages](#languages)
- [Scientific References](#scientific-references)
- [Disclaimer](#disclaimer)
- [Contributing](#contributing)
- [Contact](#contact)
- [License](#license)

---

## About

Hilal Sighting is a mobile application that calculates and predicts the visibility of the new crescent moon (Hilal) from any location on Earth. The Islamic lunar calendar is observation-based: each month begins when the thin crescent moon is sighted by eye after sunset following a new moon conjunction (Iqtiran). This app provides scientifically-grounded predictions to assist in that determination.

The application uniquely combines **rigorous astronomical computation** with **Islamic jurisprudential analysis**, offering visibility assessments from the perspective of 10 prominent Shia scholars with differing methodological approaches.

---

## The Problem

Every lunar month — and especially before Ramadan, Eid al-Fitr, and Eid al-Adha — over 1.8 billion Muslims worldwide need to determine whether the new crescent moon is visible. This determination is complicated by several factors:

| Challenge | Description |
|-----------|-------------|
| **Astronomical complexity** | Visibility depends on dozens of interrelated parameters including moon altitude, elongation, age, atmospheric refraction, and observer location |
| **Geographic variation** | The crescent may be visible in one city but not another, even within the same country |
| **Scholarly disagreement** | Different religious scholars have different criteria for what constitutes valid sighting |
| **Multiple criteria** | Various astronomical criteria exist (Yallop, Odeh, SAAO, etc.) and may give different results |
| **Accessibility** | Most existing tools are either too technical for general users or too simplified to be accurate |

**Hilal Sighting addresses all of these challenges in a single, user-friendly application.**

---

## Features

### 🔭 Core Astronomical Features

| Feature | Description |
|---------|-------------|
| **6 Visibility Criteria** | Yallop, Odeh, SAAO, Istanbul, Malaysia, and Soroudi Combined |
| **Precise Conjunction Time** | Exact new moon date and time calculation |
| **Multi-day Analysis** | Visibility assessment for 4 consecutive days around conjunction |
| **Comprehensive Parameters** | 20+ astronomical parameters calculated for each prediction |
| **Danjon Limit Check** | Automatic verification against the 7° elongation physical limit |
| **Best Viewing Time** | Optimal observation time calculation |

### 🗺️ Global Visualization

| Feature | Description |
|---------|-------------|
| **World Visibility Map** | Color-coded global map showing visibility zones |
| **City-by-City Analysis** | Detailed data for 40+ cities across 20+ countries |
| **User Location** | Highlighted user city on the map with detailed breakdown |
| **Interactive City List** | Expandable city cards with full astronomical data |

### 📖 Jurisprudential Analysis

| Feature | Description |
|---------|-------------|
| **10 Scholar Opinions** | Individual assessment based on each scholar's methodology |
| **Fiqh Details** | Detailed explanation of each scholar's jurisprudential basis |
| **Horizon Rules** | Scholar-specific horizon sharing requirements |
| **Instrument Rulings** | Whether telescope/binocular sighting is accepted |
| **Confidence Score** | Percentage-based confidence for each assessment |

### 📊 Data & Comparison

| Feature | Description |
|---------|-------------|
| **Comparison Table** | Side-by-side data for 29th vs 30th of each lunar month |
| **Multi-City Selection** | Quick switching between 8 key cities |
| **Criteria Comparison** | All 6 criteria results displayed simultaneously |
| **Share Reports** | Text-based shareable visibility reports |

### 🌐 Internationalization

| Feature | Description |
|---------|-------------|
| **Three Languages** | Persian (فارسی), Arabic (العربیة), English |
| **RTL Support** | Full right-to-left layout for Persian and Arabic |
| **Auto-detection** | Language automatically set from device locale |
| **Localized Calendar** | Jalali (Shamsi), Hijri, and Gregorian date display |

---

## Screenshots

| Home Screen | Global Map | Scholar Opinions | Moon Data |
|:-----------:|:----------:|:----------------:|:---------:|
| Main visibility result with selected criterion | Color-coded world visibility map | 10 Shia scholar assessments with fiqh details | Detailed comparison table for consecutive days |

---

## Scientific Criteria

### 1. Yallop Criterion (1997)

**Source:** B.D. Yallop, HM Nautical Almanac Office, Technical Note No. 69

Based on **295 verified crescent observations**. Computes a q-value:

```
q = (ARCV - (11.8371 - 6.3226W + 0.7319W² - 0.1018W³)) / 10
```

| Category | q Value | Interpretation |
|----------|---------|----------------|
| **A** | q > +0.216 | Easily visible to the naked eye |
| **B** | +0.216 ≥ q > −0.014 | Visible under perfect conditions |
| **C** | −0.014 ≥ q > −0.160 | May need optical aid |
| **D** | −0.160 ≥ q > −0.232 | Will need optical aid |
| **E** | −0.232 ≥ q > −0.293 | Not visible with telescope |
| **F** | q ≤ −0.293 | Not visible — below Danjon limit |

### 2. Odeh Criterion (2004)

**Source:** M.Sh. Odeh, Experimental Astronomy, Vol. 18, pp. 39-64

Based on **737 verified observations** — the largest dataset to date. Currently considered the most accurate single criterion available.

```
V_limit = -0.1018W³ + 0.7319W² - 6.3226W + 11.8371

ARCV ≥ V_limit + 4  → A (naked eye)
ARCV ≥ V_limit      → B (possible naked eye)
ARCV ≥ V_limit - 4  → C (optical aid, W ≥ 0.05)
ARCV > 0            → D (telescope only)
else                → F (not visible)
```

### 3. SAAO Criterion

**Source:** Caldwell & Laney, South African Astronomical Observatory (2001)

| Category | Moon Age | ARCV | Elongation |
|----------|----------|------|------------|
| **A** | ≥ 24h | ≥ 10° | ≥ 12° |
| **B** | ≥ 15h | ≥ 5° | ≥ 8° |
| **C** | ≥ 12h | ≥ 3° | ≥ 7° |
| **F** | Below thresholds | | |

### 4. Istanbul Criterion (1978)

```
Visible if: Altitude ≥ 5° AND Elongation ≥ 8° AND Age ≥ 8 hours
```

### 5. Malaysia Criterion

```
Visible if: Altitude ≥ 3° AND Elongation ≥ 6.4° AND Age ≥ 8 hours
```

### 6. Soroudi Combined Criterion

Original criterion developed for this application. Weighted combination:

```
Score = 0.30 × Yallop_score
      + 0.30 × Odeh_score
      + 0.12 × Elongation_score
      + 0.10 × Age_score
      + 0.10 × LagTime_score
      + 0.08 × Altitude_score
```

**Veto conditions** (override to F): Moon below horizon, below Danjon limit, negative lag time, or moon age < 6 hours.

| Score | Category |
|-------|----------|
| ≥ 75 | A |
| ≥ 55 | B |
| ≥ 35 | C |
| ≥ 18 | D |
| < 18 | F |

---

## Scholar Opinions (Maraje)

The app evaluates visibility according to 10 prominent Shia scholars:

| # | Scholar | Sighting Method | Telescope | Ruler's Decree | Horizon Rule |
|---|---------|----------------|-----------|----------------|--------------|
| 1 | Ayatollah Khamenei | Eye (aided/unaided) | ✅ | ✅ Binding | Shared horizon (decree covers country) |
| 2 | Ayatollah Sistani | Naked eye only | ❌ | ⚠️ Not sufficient alone | Shared horizon required |
| 3 | Ayatollah Vahid Khorasani | Naked eye only | ❌ | ❌ Questionable | Shared night sufficient |
| 4 | Ayatollah Shobeiri Zanjani | Naked eye only | ❌ | ⚠️ Unless certainty | Shared horizon or proximity |
| 5 | Ayatollah Makarem Shirazi | Naked eye only | ❌ | ✅ Binding | East→West valid |
| 6 | Ayatollah Nouri Hamedani | Naked eye only | ❌ | ✅ Binding | Shared night sufficient |
| 7 | Ayatollah Safi Golpaygani | Naked eye only | ❌ | ✅ Binding | Possibly universal |
| 8 | Ayatollah Sobhani | Naked eye only | ❌ | ✅ Binding | East→West valid |
| 9 | Ayatollah Fayyad | Naked eye + science | ❌ | ✅ Binding | Universal (any city) |
| 10 | Ayatollah Mousavi Ardabili | Naked eye only | ❌ | ✅ Binding | Shared horizon |

---

## Astronomical Parameters

| Parameter | Description | Unit |
|-----------|-------------|------|
| `sunSet` | Local sunset time | HH:MM:SS |
| `moonSet` | Local moonset time | HH:MM:SS |
| `moonAltitude` | Moon altitude at sunset | degrees |
| `daz` | Relative azimuth between moon and sun | degrees |
| `arcv` | Arc of vision | degrees |
| `elongation` | Geocentric elongation | degrees |
| `topoElongation` | Topocentric elongation | degrees |
| `moonAge` | Time since conjunction | hours |
| `lagTime` | Moonset − sunset | minutes |
| `illuminationPercent` | Moon illumination | % |
| `crescentWidth` | Crescent angular width | arcminutes |
| `moonDistance` | Earth-Moon distance | km |
| `moonEclipticLat` | Ecliptic latitude | degrees |
| `yallopQ` | Yallop q-value | dimensionless |
| `soroudiScore` | Soroudi combined score | 0-100 |
| `danjonOk` | Danjon limit check | boolean |

**Coordinate System:** Topocentric with atmospheric refraction correction.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [React Native](https://reactnative.dev/) 0.81 | Cross-platform mobile framework |
| [Expo](https://expo.dev/) 54 | Development & build platform |
| [Astronomy Engine](https://github.com/cosinekitty/astronomy) 2.1 | Astronomical calculations (VSOP87 + ELP/MPP02) |
| [React Navigation](https://reactnavigation.org/) 7 | Tab-based navigation |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | Local persistence |

---

## Architecture

```
┌──────────────────────────────────────────────┐
│                   App.js                      │
│             (LanguageProvider)                 │
│                                               │
│  ┌──────┐ ┌────────┐ ┌─────┐ ┌─────┐ ┌─────┐│
│  │ Home │ │MoonData│ │ Map │ │Marja│ │ Set │││
│  └──┬───┘ └───┬────┘ └──┬──┘ └──┬──┘ └──┬──┘│
│     └─────────┴─────────┴───────┴───────┘    │
│                     │                         │
│  ┌──────────────────▼───────────────────────┐│
│  │          Calculation Layer                ││
│  │  moonPosition.js  │  hijriCalendar.js    ││
│  │  (6 criteria)     │  (3 calendars)       ││
│  └──────────┬────────┘──────────────────────┘│
│             │                                 │
│  ┌──────────▼──────────────────────────────┐ │
│  │  Data Layer                              │ │
│  │  maraje.js │ userSettings.js │ i18n/     │ │
│  └──────────────────────────────────────────┘│
└──────────────────────────────────────────────┘
```

---

## Project Structure

```
HilalApp/
├── App.js                     # Root component
├── app.json                   # Expo config
├── package.json               # Dependencies
├── src/
│   ├── screens/
│   │   ├── SplashScreen.js    # Animated splash
│   │   ├── HomeScreen.js      # Main visibility
│   │   ├── MoonDataScreen.js  # Data comparison
│   │   ├── MapScreen.js       # Global map
│   │   ├── MarajeScreen.js    # Scholar opinions
│   │   └── SettingsScreen.js  # Settings
│   ├── calculations/
│   │   ├── moonPosition.js    # Astronomical engine
│   │   └── hijriCalendar.js   # Calendar conversions
│   ├── data/
│   │   ├── maraje.js          # 10 scholar profiles
│   │   └── userSettings.js    # Cities & preferences
│   └── i18n/
│       ├── translations.js    # fa/ar/en strings
│       └── LanguageContext.js  # Language context
└── assets/                    # Icons & images
```

---

## Installation

```bash
# Clone
git clone https://github.com/SoroudiSoft/HilalApp.git
cd HilalApp

# Install dependencies
npm install

# Start
npx expo start

# Scan QR code with Expo Go app on your phone
```

---

## Building

```bash
# APK for testing
eas build --platform android --profile preview

# AAB for Google Play
eas build --platform android --profile production

# Local build (no server upload)
eas build --platform android --profile preview --local
```

---

## Supported Cities

<details>
<summary>Click to see all 43 cities</summary>

**Iran:** Qom, Tehran, Mashhad, Isfahan, Shiraz, Tabriz, Ahvaz, Kerman, Rasht, Hamedan, Yazd, Bandar Abbas, Sanandaj

**Iraq:** Najaf, Karbala, Baghdad

**Saudi Arabia:** Mecca, Medina, Jeddah, Riyadh

**Middle East:** Beirut, Damascus, Cairo, Istanbul, Ankara, Doha, Muscat, Kuwait

**South Asia:** Karachi, Islamabad, Kabul

**Europe:** London, Paris, Berlin

**Americas:** New York, Los Angeles, Chicago, Toronto

**Asia-Pacific:** Sydney, Kuala Lumpur, Jakarta, Tokyo, Beijing

</details>

Custom locations can be added by entering coordinates manually.

---

## Languages

| Language | Direction | Calendar Display |
|----------|-----------|-----------------|
| Persian (فارسی) | RTL | Jalali + Hijri |
| Arabic (العربیة) | RTL | Hijri + Gregorian |
| English | LTR | Gregorian + Hijri |

---

## Scientific References

1. **Yallop, B.D.** (1997). *"A Method for Predicting the First Sighting of the New Crescent Moon."* HM Nautical Almanac Office, Technical Note No. 69.

2. **Odeh, M.Sh.** (2004). *"New Criterion for Lunar Crescent Visibility."* Experimental Astronomy, 18, 39-64.

3. **Caldwell, J.A.R. & Laney, C.D.** (2001). *"First Visibility of the Lunar Crescent."* SAAO.

4. **Ilyas, M.** (1994). *"Lunar Crescent Visibility Criterion."* QJRAS, 35, 425-461.

5. **Danjon, A.** (1936). *"Le croissant lunaire."* L'Astronomie, 50, 57-66.

6. **Cross, D.** (2020). *Astronomy Engine.* [github.com/cosinekitty/astronomy](https://github.com/cosinekitty/astronomy)

---

## Disclaimer

> ⚠️ **This application is solely an astronomical calculation tool.** Results are NOT a substitute for actual crescent moon sighting. The definitive determination of Islamic lunar months is based exclusively on actual crescent observation and the rulings of qualified religious scholars. Atmospheric conditions, light pollution, and observer acuity are not factored in. Always refer to official sighting reports from your religious authority.

---

## Contributing

Contributions welcome! Areas of interest:

- 🌍 Additional cities with verified coordinates
- 🕌 Sunni scholar opinions
- 🌐 More languages (Turkish, Urdu, Malay)
- 📱 iOS testing
- 🔬 Validation against historical sighting data
- 🎨 UI/UX improvements

### How to Contribute

1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open Pull Request

---

## Contact

**Mohammad Mahdi Soroudi** — SoroudiSoft

📧 [info.gamevar.ir@gmail.com](mailto:info.gamevar.ir@gmail.com)

---

## License

MIT License — see [LICENSE](LICENSE) file.

---

<div align="center">

**Built with ❤️ for the global Muslim community**

🌙 *"These predictions and calculations are within the realm of Allah's will, the Almighty, the All-Knowing."*

⭐ If you find this useful, please star this repository!

</div>
