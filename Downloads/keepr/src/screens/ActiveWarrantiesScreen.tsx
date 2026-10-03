import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Appliance, STATUS_COLORS } from '../types';
import { evaluateStatus } from '../utils';
import { styles } from '../styles';

export const ActiveWarrantiesScreen = ({ appliances, alertDays, onBack }: any) => {
  const evaluated = appliances.map((app: Appliance) => ({ ...app, status: evaluateStatus(app.expiryDate, alertDays) }));
  const activeItems = evaluated.filter((app: Appliance) => app.status === 'ACTIVE' || app.status === 'EXPIRING');

  return (
    <View style={styles.mainContent}>
      <View style={styles.subHeaderRow}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons color="#111827" name="arrow-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.title}>Active Warranties</Text>
      </View>
      <FlatList 
        data={activeItems} 
        keyExtractor={(item) => 'active-' + item.id} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingTop: 16, paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons color="#d1d5db" name="shield-outline" size={48} />
            <Text style={styles.emptyTitle}>No active warranties</Text>
            <Text style={styles.emptyText}>You currently have no active protections.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const colors = STATUS_COLORS[item.status] || STATUS_COLORS.ACTIVE;
          return (
            <View style={styles.row}>
              {item.imageUri ? <Image source={{ uri: item.imageUri }} style={styles.thumbImage} /> : <View style={styles.thumb} />}
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={styles.rowMeta}>{item.details} • Value: ${item.price}</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: colors.bg }]}><Text style={[styles.statusText, { color: colors.text }]}>{item.status}</Text></View>
            </View>
          );
        }}
      />
    </View>
  );
};