import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions
} from 'react-native';

var LP = require('../i18n/LanguageContext');
var useLanguage = LP.useLanguage;

var screenWidth = Dimensions.get('window').width;

export default function SplashScreen(props) {
  var LCtx = useLanguage();
  var t = LCtx.t;

  var s1 = useState(new Animated.Value(0)); var fadeAnim = s1[0];
  var s2 = useState(new Animated.Value(0.3)); var moonGlow = s2[0];
  var s3 = useState(new Animated.Value(0)); var textFade = s3[0];
  var s4 = useState(new Animated.Value(0)); var verseFade = s4[0];

  useEffect(function() {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(moonGlow, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(moonGlow, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    setTimeout(function() {
      Animated.timing(textFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 500);

    setTimeout(function() {
      Animated.timing(verseFade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 1200);

    setTimeout(function() {
      if (props.onFinish) props.onFinish();
    }, 3500);
  }, []);

  return (
    <View style={sp.container}>

      {renderStars()}

      <Animated.View style={[sp.moonContainer, {opacity: fadeAnim}]}>
        <Animated.Text style={[sp.moonEmoji, {opacity: moonGlow}]}>
          🌙
        </Animated.Text>
      </Animated.View>

      <Animated.View style={[sp.brandBox, {opacity: textFade}]}>
        <Text style={sp.brandName}>SoroudiSoft</Text>
        <Text style={sp.appName}>{t('appNameSplash')}</Text>
        <Text style={sp.version}>{t('version')}</Text>
      </Animated.View>

      <Animated.View style={[sp.verseBox, {opacity: verseFade}]}>
        <Text style={sp.verseText}>{t('splashVerse')}</Text>
      </Animated.View>

    </View>
  );
}

function renderStars() {
  var stars = [];
  for (var i = 0; i < 30; i++) {
    var top = Math.random() * 100;
    var left = Math.random() * 100;
    var size = Math.random() * 2 + 1;
    var opacity = Math.random() * 0.5 + 0.2;
    stars.push(
      <View key={'star'+i} style={{
        position: 'absolute',
        top: top + '%',
        left: left + '%',
        width: size,
        height: size,
        borderRadius: size/2,
        backgroundColor: '#FFF',
        opacity: opacity,
      }} />
    );
  }
  return stars;
}

var sp = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050D1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moonContainer: {
    marginBottom: 30,
  },
  moonEmoji: {
    fontSize: 80,
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandName: {
    color: '#C9A84C',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 20,
    marginTop: 8,
    fontWeight: '600',
  },
  version: {
    color: '#4a6a8a',
    fontSize: 12,
    marginTop: 6,
  },
  verseBox: {
    position: 'absolute',
    bottom: 80,
    paddingHorizontal: 30,
  },
  verseText: {
    color: '#8899aa',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
});
