import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Appliance, STATUS_COLORS } from '../types';
import { evaluateStatus } from '../utils';
import { styles } from '../styles';

export const ProtectedValueScreen = ({ appliances, alertDays, onBack }: any) => {
  const evaluated = appliances.map((app: Appliance) => ({ ...app, status: evaluateStatus(app.expiryDate, alertDays) }));
  const coveredItems = evaluated.filter((app: Appliance) => app.status === 'ACTIVE' || app.status === 'EXPIRING');
  const sumValue = coveredItems.reduce((acc: number, curr: Appliance) => acc + curr.price, 0);

  return (
    <View style={styles.mainContent}>
      <View style={styles.subHeaderRow}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons color="#111827" name="arrow-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.title}>Protected Value</Text>
      </View>
      <View style={styles.totalValueBanner}>
        <Text style={styles.totalBannerLabel}>Total Sum Coverage</Text>
        <Text style={styles.totalBannerAmount}>${sumValue.toLocaleString()}</Text>
      </View>
      <FlatList 
        data={coveredItems} 
        keyExtractor={(item) => 'protected-' + item.id} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingTop: 16, paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons color="#d1d5db" name="wallet-outline" size={48} />
            <Text style={styles.emptyTitle}>No protected value</Text>
            <Text style={styles.emptyText}>No active item valuations found.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const colors = STATUS_COLORS[item.status] || STATUS_COLORS.ACTIVE;
          return (
            <View style={styles.row}>
              {item.imageUri ? <Image source={{ uri: item.imageUri }} style={styles.thumbImage} /> : <View style={styles.thumb} />}
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={styles.rowMeta}>{item.brand} • {item.location}</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.itemPriceText}>${item.price}</Text>
                <View style={[styles.statusPill, { backgroundColor: colors.bg, marginTop: 4 }]}><Text style={[styles.statusText, { color: colors.text }]}>{item.status}</Text></View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};