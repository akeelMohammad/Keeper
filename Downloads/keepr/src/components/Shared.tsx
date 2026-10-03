import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import Svg, { Rect, Circle, Line, Path } from 'react-native-svg';
import { styles } from '../styles';

export const HomeIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 22V12h6v10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const VaultIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 30 30" fill="none">
    <Rect x="1.5" y="1.5" width="27" height="27" rx="2.5" stroke={color} strokeWidth="3" />
    <Circle cx="14.625" cy="14.625" r="5.625" stroke={color} strokeWidth="3" />
    <Circle cx="14.625" cy="14.625" r="1.375" fill={color} stroke={color} />
    <Line x1="15.75" y1="14.5002" x2="18" y2="14.5002" stroke={color} strokeWidth="2" />
  </Svg>
);

export const ScanIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 7V4h3M17 4h3v3M4 17v3h3M17 20h3v-3" />
    <Rect x="9" y="9" width="6" height="6" rx="1" />
  </Svg>
);

export const ChatIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </Svg>
);

export const ProfileIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 30" fill="none">
    <Path d="M8.82676 19.151C10.9816 18.9662 13.1482 18.9662 15.303 19.151C16.4814 19.23 17.6518 19.4021 18.8034 19.6657C21.2942 20.1673 22.9199 21.1571 23.6016 22.6089C24.1462 23.8152 24.1318 25.2024 23.5623 26.3969C22.8674 27.8487 21.2418 28.8385 18.7116 29.3533C17.5639 29.6116 16.398 29.7793 15.2244 29.8548C13.9265 30 12.8253 30 11.8027 30H11.3963C10.817 29.9372 10.3778 29.4449 10.3778 28.8583C10.3778 28.2718 10.817 27.7795 11.3963 27.7167L12.2933 27.7165C13.1923 27.706 14.0969 27.6639 15.0015 27.5847C16.0687 27.5148 17.1291 27.3648 18.1741 27.136C19.9701 26.74 21.0976 22.8333 21.4516 25.4202C21.7269 24.8447 21.7269 24.1743 21.4516 23.5988C21.0976 22.8333 19.9701 22.2394 18.2134 21.883C17.1523 21.6434 16.0739 21.4889 14.9884 21.4211C12.9605 21.2363 10.9202 21.2363 8.89231 21.4211C7.82083 21.491 6.75599 21.641 5.70661 21.8698C3.91056 22.2658 2.79622 22.8333 2.42914 23.5856C2.29908 23.8713 2.232 24.182 2.23249 24.4963C2.23176 24.8149 2.29881 25.1299 2.42914 25.4202C3.05312 26.2781 4.00248 26.8373 5.05112 26.9644L5.20325 27.0057C5.54824 27.1255 5.81905 27.4064 5.92455 27.7648C6.04512 28.1744 5.92983 28.6176 5.6253 28.9151C5.32077 29.2126 4.87735 29.3153 4.47428 29.1817C2.78411 28.9043 1.30171 27.89 0.423331 26.4101C-0.14111 25.2114 -0.14111 23.8208 0.423331 22.6221C1.11815 21.1307 2.74378 20.1673 5.24776 19.6525C6.42668 19.3958 7.62301 19.2281 8.82676 19.151ZM8.94707 0.61081C11.9321 -0.632507 15.3671 0.0575933 17.6495 2.35912C19.9318 4.66064 20.6116 8.12 19.3717 11.1231C18.1319 14.1262 15.2166 16.0811 11.9862 16.0758C7.58196 16.0685 4.01544 12.472 4.01544 8.038L4.02284 7.69084C4.15581 4.57857 6.06869 1.80972 8.94707 0.61081ZM11.9862 2.29672C10.4715 2.29323 9.01759 2.89656 7.94528 3.97364C6.87296 5.05071 6.27032 6.51303 6.27032 8.038C6.26503 10.3667 7.65429 12.469 9.78976 13.3638C11.9252 14.2587 14.3859 13.7696 16.0233 12.1249C17.6608 10.4802 18.1522 8.00404 17.2683 5.85212C16.3843 3.7002 14.2993 2.29672 11.9862 2.29672Z" fill={color} />
  </Svg>
);

export const CustomSwitch = ({ value, onValueChange }: { value: boolean, onValueChange: (val: boolean) => void }) => {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: value ? 1 : 0, duration: 250, useNativeDriver: false }).start();
  }, [value]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 24] });
  const borderColor = anim.interpolate({ inputRange: [0, 1], outputRange: ['#a3a3a3', '#000000'] });
  const knobColor = anim.interpolate({ inputRange: [0, 1], outputRange: ['#d4d4d4', '#000000'] });

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={() => onValueChange(!value)}>
      <Animated.View style={[styles.customSwitchTrack, { borderColor }]}>
        <Animated.View style={[styles.customSwitchKnob, { transform: [{ translateX }], backgroundColor: knobColor }]} />
      </Animated.View>
    </TouchableOpacity>
  );
};

export const BottomNavBar = ({ activeTab, onTabPress }: { activeTab: string; onTabPress: (tab: string) => void }) => {
  const getIconColor = (tabName: string) => activeTab === tabName ? '#000000' : '#999999';

  return (
    <View style={styles.tabBar}>
      <TouchableOpacity onPress={() => onTabPress('home')} style={styles.tabItem}> 
        <HomeIcon color={getIconColor('home')} size={24} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onTabPress('vault')} style={styles.tabItem}> 
        <VaultIcon color={getIconColor('vault')} size={24} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onTabPress('scan')} style={styles.tabItem}> 
        <ScanIcon color={getIconColor('scan')} size={24} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onTabPress('chat')} style={styles.tabItem}> 
        <ChatIcon color={getIconColor('chat')} size={24} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onTabPress('profile')} style={styles.tabItem}> 
        <ProfileIcon color={getIconColor('profile')} size={24} />
      </TouchableOpacity>
    </View>
  );
};