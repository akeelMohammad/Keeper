import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Appliance, STATUS_COLORS } from '../types';
import { evaluateStatus } from '../utils';
import { styles } from '../styles';

export const VaultScreen = ({ appliances, searchQuery, setSearchQuery, activeFilter, setActiveFilter, alertDays }: any) => {
  const evaluatedAppliances = appliances.map((app: Appliance) => ({
    ...app,
    status: evaluateStatus(app.expiryDate, alertDays),
  }));
  const searchMatchedAppliances = evaluatedAppliances.filter((app: Appliance) => app.name.toLowerCase().includes(searchQuery.toLowerCase()) || app.brand.toLowerCase().includes(searchQuery.toLowerCase()));
  const dynamicChips = ['All', ...Array.from(new Set(searchMatchedAppliances.map((app: Appliance) => app.location)))];
  const filteredAppliances = searchMatchedAppliances.filter((app: Appliance) => activeFilter === 'All' ? true : app.location === activeFilter);
  const isDefaultView = searchQuery === '' && activeFilter === 'All';

  return (
    <View style={styles.mainContent}>
      <Text style={styles.title}>My Vault</Text>
      <View style={styles.searchBar}>
        <Ionicons color="#9ca3af" name="search-outline" size={20} />
        <TextInput onChangeText={setSearchQuery} placeholder="Search appliances, brands..." placeholderTextColor="#9ca3af" style={styles.searchInput} value={searchQuery} />
        {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons color="#9ca3af" name="close-circle" size={20} /></TouchableOpacity>}
      </View>

      <ScrollView contentContainerStyle={styles.chipsContent} horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
        {dynamicChips.map((chip: unknown) => (
          <TouchableOpacity key={chip as string} onPress={() => setActiveFilter(chip as string)} style={[styles.chip, chip === activeFilter && styles.chipActive]}>
            <Text style={[styles.chipText, chip === activeFilter && styles.chipTextActive]}>{chip as string}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isDefaultView && evaluatedAppliances.length > 0 && (
        <View style={styles.carouselContainer}>
          <FlatList data={evaluatedAppliances} horizontal keyExtractor={(item) => 'hero-' + item.id} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingRight: 20 }} renderItem={({ item }) => (
            <View style={styles.heroCard}>
              {item.imageUri ? <Image source={{ uri: item.imageUri }} style={styles.heroImage} /> : <View style={styles.heroImagePlaceholder} />}
              <View style={styles.heroOverlay}>
                <Text style={styles.heroTitle}>{item.name}</Text>
                <Text style={styles.heroBrand}>{item.brand || 'Appliance'} • ${item.price}</Text>
              </View>
            </View>
          )} />
        </View>
      )}

      {isDefaultView && evaluatedAppliances.length > 0 && (
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Recent Activity</Text></View>
      )}

      <FlatList data={filteredAppliances} keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingBottom: 24, paddingTop: !isDefaultView && evaluatedAppliances.length > 0 ? 16 : 0 }}
        ListEmptyComponent={
          searchQuery.trim() !== '' ? (
            <View style={styles.emptyContainer}>
              <Ionicons color="#d1d5db" name="search-outline" size={48} />
              <Text style={styles.emptyTitle}>No items found</Text>
              <Text style={styles.emptyText}>There are no items matching "{searchQuery}".</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const colors = STATUS_COLORS[item.status] || STATUS_COLORS.ACTIVE;
          return (
            <View style={styles.row}>
              {item.imageUri ? <Image source={{ uri: item.imageUri }} style={styles.thumbImage} /> : <View style={styles.thumb} />}
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={styles.rowMeta}>{item.added} • ${item.price}</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: colors.bg }]}><Text style={[styles.statusText, { color: colors.text }]}>{item.status}</Text></View>
            </View>
          );
        }}
      />
    </View>
  );
};