import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Animated, Easing, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { Appliance, UserProfile, STATUS_COLORS } from '../types';
import { evaluateStatus } from '../utils';
import { styles } from '../styles';

export const HomeScreen = ({ 
  user, 
  searchQuery, 
  setSearchQuery, 
  appliances, 
  onNavigateVault, 
  onNavigateActiveWarranties, 
  onNavigateProtectedValue 
}: {
  user: UserProfile;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  appliances: Appliance[];
  onNavigateVault: () => void;
  onNavigateActiveWarranties: () => void;
  onNavigateProtectedValue: () => void;
}) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const firstName = user?.name ? user.name.trim().split(' ')[0] : 'User';

  useEffect(() => {
    animValue.setValue(0);
    Animated.timing(animValue, { 
      toValue: 1, 
      duration: 1600, 
      easing: Easing.out(Easing.cubic), 
      useNativeDriver: true 
    }).start();
  }, []);

  const graphicOpacity = animValue.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const graphicScale = animValue.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const graphicTranslateY = animValue.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  const alertDays = user.alertDays || 30;
  const evaluatedAppliances = appliances.map((app: Appliance) => ({
    ...app,
    status: evaluateStatus(app.expiryDate, alertDays),
  }));

  const searchMatchedAppliances = evaluatedAppliances.filter((app: Appliance) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = evaluatedAppliances.filter((app: Appliance) => app.status === 'ACTIVE' || app.status === 'EXPIRING').length;
  
  const totalProtectedValue = evaluatedAppliances
    .filter((app: Appliance) => app.status === 'ACTIVE' || app.status === 'EXPIRING')
    .reduce((sum: number, item: Appliance) => sum + item.price, 0);
    
  const formattedProtectedValue = totalProtectedValue >= 1000 
    ? `${(totalProtectedValue / 1000).toFixed(1)}k` 
    : `${totalProtectedValue}`;
    
  const upcomingItems = searchMatchedAppliances.filter((app: Appliance) => app.status === 'EXPIRING' || app.status === 'ACTIVE');
  const expiredItems = searchMatchedAppliances.filter((app: Appliance) => app.status === 'EXPIRED');

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.homeContainer}>
      <View style={styles.headerBlock}>
        <View style={styles.homeHeaderRow}>
          {user.avatarUri ? (
            <Image source={{ uri: user.avatarUri }} style={styles.homeHeaderAvatar} />
          ) : (
            <View style={styles.homeHeaderAvatarPlaceholder}>
              <Text style={styles.homeHeaderAvatarText}>
                {user.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'U'}
              </Text>
            </View>
          )}
          <Text style={styles.headerWelcomeText}>Welcome, {firstName}!</Text>
        </View>
        <Animated.View style={[styles.headerAccentLeft, { opacity: graphicOpacity, transform: [{ scale: graphicScale }] }]}>
          <Svg fill="none" height="80" viewBox="0 0 80 80" width="80">
            <Circle cx="0" cy="80" r="70" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="8" />
            <Circle cx="0" cy="80" r="45" stroke="rgba(255, 255, 255, 0.20)" strokeWidth="8" />
            <Circle cx="0" cy="80" r="20" stroke="rgba(255, 255, 255, 0.30)" strokeWidth="8" />
          </Svg>
        </Animated.View>
        <Animated.View style={[styles.headerAbstractArt, { opacity: graphicOpacity, transform: [{ scale: graphicScale }, { translateY: graphicTranslateY }] }]}>
          <Svg fill="none" height="110" viewBox="0 0 220 110" width="220">
            <Circle cx="110" cy="110" r="100" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="12" />
            <Circle cx="110" cy="110" r="70" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="12" />
            <Circle cx="110" cy="110" r="40" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="12" />
          </Svg>
        </Animated.View>
        <Animated.View style={[styles.headerAccentRight, { opacity: graphicOpacity, transform: [{ scale: graphicScale }] }]}>
          <Svg fill="none" height="80" viewBox="0 0 80 80" width="80">
            <Circle cx="80" cy="80" r="70" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="8" />
            <Circle cx="80" cy="80" r="45" stroke="rgba(255, 255, 255, 0.20)" strokeWidth="8" />
            <Circle cx="80" cy="80" r="20" stroke="rgba(255, 255, 255, 0.30)" strokeWidth="8" />
          </Svg>
        </Animated.View>
      </View>

      <View style={styles.homeBody}>
        <View style={styles.homeSearchBar}>
          <Ionicons color="#4b5563" name="search-outline" size={22} />
          <TextInput 
            onChangeText={setSearchQuery} 
            placeholder="Search appliances, brands..." 
            placeholderTextColor="#9ca3af" 
            style={styles.homeSearchInput} 
            value={searchQuery} 
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons color="#9ca3af" name="close-circle" size={20} />
            </TouchableOpacity>
          )}
        </View>

        {searchQuery.trim() !== '' ? (
          <View style={{ marginTop: 16 }}>
            {searchMatchedAppliances.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons color="#d1d5db" name="search-outline" size={48} />
                <Text style={styles.emptyTitle}>No items found</Text>
                <Text style={styles.emptyText}>There are no items matching "{searchQuery}".</Text>
              </View>
            ) : (
              searchMatchedAppliances.map((item: Appliance) => {
                const colors = STATUS_COLORS[item.status] || STATUS_COLORS.ACTIVE;
                return (
                  <View key={item.id} style={[styles.row, { marginBottom: 12 }]}>
                    {item.imageUri ? (
                      <Image source={{ uri: item.imageUri }} style={styles.thumbImage} />
                    ) : (
                      <View style={styles.thumb} />
                    )}
                    <View style={styles.rowBody}>
                      <Text style={styles.rowTitle}>{item.name}</Text>
                      <Text style={styles.rowMeta}>{item.added} • ${item.price}</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: colors.bg }]}>
                      <Text style={[styles.statusText, { color: colors.text }]}>{item.status}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        ) : (
          <>
            <View style={styles.metricsRow}>
              <TouchableOpacity onPress={onNavigateActiveWarranties} style={styles.metricCard}>
                <Text style={styles.metricCardHeader}>ACTIVE WARRANTIES</Text>
                <Text style={styles.metricValue}>{activeCount}</Text>
                <Text style={styles.metricSub}>items protected</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onNavigateProtectedValue} style={styles.metricCard}>
                <Text style={styles.metricCardHeader}>PROTECTED VALUE</Text>
                <Text style={styles.metricValue}>${formattedProtectedValue}</Text>
                <Text style={styles.metricSub}>total coverage</Text>
              </TouchableOpacity>
            </View>

            {evaluatedAppliances.length > 0 && (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeading}>Upcoming Expirations</Text>
                  <TouchableOpacity onPress={onNavigateVault}>
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                </View>
                {upcomingItems.slice(0, 2).map((item: Appliance) => (
                  <View key={item.id} style={styles.itemCard}>
                    {item.imageUri ? (
                      <Image source={{ uri: item.imageUri }} style={styles.itemThumbImage} />
                    ) : (
                      <View style={styles.itemThumbPlaceholder} />
                    )}
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDate}>{item.details} • ${item.price}</Text>
                    </View>
                    <View style={styles.pillExpiring}>
                      <Text style={styles.pillExpiringText}>Expires soon</Text>
                    </View>
                  </View>
                ))}

                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeading}>Recently Expired</Text>
                  <TouchableOpacity onPress={onNavigateVault}>
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                </View>
                {expiredItems.slice(0, 1).map((item: Appliance) => (
                  <View key={item.id} style={[styles.itemCard, { marginBottom: 30 }]}>
                    {item.imageUri ? (
                      <Image source={{ uri: item.imageUri }} style={styles.itemThumbImage} />
                    ) : (
                      <View style={styles.itemThumbPlaceholder} />
                    )}
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDate}>{item.details} • ${item.price}</Text>
                    </View>
                    <View style={styles.pillExpired}>
                      <Text style={styles.pillExpiredText}>Expired</Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};