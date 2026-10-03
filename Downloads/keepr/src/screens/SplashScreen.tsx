import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, Animated, Easing } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

export const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
        <Svg fill="none" height="130" viewBox="0 0 180 180" width="130">
          <Path d="M81.5 4.90748C86.7598 1.87072 93.2402 1.87072 98.5 4.90748L159.442 40.0925C164.702 43.1293 167.942 48.7414 167.942 54.815V125.185C167.942 131.259 164.702 136.871 159.442 139.907L98.5 175.093C93.2402 178.129 86.7598 178.129 81.5 175.093L20.5577 139.907C15.2979 136.871 12.0577 131.259 12.0577 125.185V54.815C12.0577 48.7414 15.2979 43.1293 20.5577 40.0925L81.5 4.90748Z" fill="white"/>
          <Path d="M158.574 126.546C160.764 125.317 160.564 122.1 158.237 121.152L87.1319 92.1835C85.1588 91.3796 83 92.8312 83 94.9618V163.851C83 166.145 85.4689 167.59 87.4687 166.467L158.574 126.546Z" fill="url(#paint0_linear_27_56)"/>
          <Path d="M142.406 56.9819C145.043 55.5373 147.929 58.4387 146.47 61.0681L88.6235 165.361C87.1214 168.069 83 167.003 83 163.906V91.3013C83 90.2054 83.5976 89.1967 84.5587 88.6702L142.406 56.9819Z" fill="url(#paint1_linear_27_56)"/>
          <Defs>
            <LinearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_27_56" x1="164" x2="83" y1="95.4542" y2="164.022">
              <Stop offset="0.330434" stopColor="#000000"/>
              <Stop offset="1" stopColor="#737373"/>
            </LinearGradient>
            <LinearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_27_56" x1="89" x2="147.5" y1="164" y2="60">
              <Stop offset="0.553609" stopColor="#000000"/>
              <Stop offset="1" stopColor="#999999"/>
            </LinearGradient>
          </Defs>
        </Svg>
        <Text style={styles.logoText}>keeper</Text>
        <Text style={styles.logoSubtext}>Scan. Save. Solved.</Text>
      </Animated.View>
    </Animated.View>
  );
};

export const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  content: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 16,
    letterSpacing: -1,
  },
  logoSubtext: {
    fontSize: 15,
    fontWeight: '700',
    color: '#a3a3a3',
    marginTop: 4,
    letterSpacing: 0.5,
  },
});