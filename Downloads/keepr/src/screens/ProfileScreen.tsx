import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { UserProfile } from '../types';
import { supabase } from '../../lib/supabase';
import { CustomSwitch } from '../components/Shared';
import { styles } from '../styles';

export const ProfileScreen = ({ user, onNavigateProfileSub }: any) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.mainContent}>
      <Text style={styles.title}>My Profile</Text>
      <View style={styles.profileCard}>
        <View style={styles.profileAvatarContainer}>
          {user.avatarUri ? <Image source={{ uri: user.avatarUri }} style={styles.profileAvatarImage} /> : <Text style={styles.profileAvatarText}>{user.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'U'}</Text>}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user.name || 'User'}</Text>
          <Text style={styles.profileEmail}>{user.email || 'No email'}</Text>
        </View>
      </View>
      <Text style={styles.profileSectionHeader}>Account Preferences</Text>
      <View style={styles.profileSectionGroup}>
        <TouchableOpacity onPress={() => onNavigateProfileSub('personal')} style={styles.profileRowItem}> <View style={styles.profileRowLeft}><Ionicons color="#374151" name="person-outline" size={20} /><Text style={styles.profileRowText}>Personal Information</Text></View><Ionicons color="#9ca3af" name="chevron-forward" size={18} /></TouchableOpacity>
        <TouchableOpacity onPress={() => onNavigateProfileSub('notifications')} style={styles.profileRowItem}> <View style={styles.profileRowLeft}><Ionicons color="#374151" name="notifications-outline" size={20} /><Text style={styles.profileRowText}>Warranty Expiry Alerts</Text></View><Ionicons color="#9ca3af" name="chevron-forward" size={18} /></TouchableOpacity>
        <TouchableOpacity onPress={() => onNavigateProfileSub('security')} style={styles.profileRowItem}> <View style={styles.profileRowLeft}><Ionicons color="#374151" name="shield-checkmark-outline" size={20} /><Text style={styles.profileRowText}>Security & Privacy</Text></View><Ionicons color="#9ca3af" name="chevron-forward" size={18} /></TouchableOpacity>
      </View>
      <Text style={styles.profileSectionHeader}>Support & About</Text>
      <View style={styles.profileSectionGroup}>
        <TouchableOpacity onPress={() => onNavigateProfileSub('help')} style={styles.profileRowItem}> <View style={styles.profileRowLeft}><Ionicons color="#374151" name="help-circle-outline" size={20} /><Text style={styles.profileRowText}>Help Center & FAQ</Text></View><Ionicons color="#9ca3af" name="chevron-forward" size={18} /></TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert("App Version", "Keeper v1.2.0 (Build 402)")} style={styles.profileRowItem}> <View style={styles.profileRowLeft}><Ionicons color="#374151" name="information-circle-outline" size={20} /><Text style={styles.profileRowText}>App Version</Text></View><Text style={styles.profileVersionText}>v1.2.0</Text></TouchableOpacity>
      </View>
      <TouchableOpacity onPress={async () => { await supabase.auth.signOut(); Alert.alert("Logged Out", "You have been logged out successfully."); }} style={styles.logoutButton}><Ionicons color="#dc2626" name="log-out-outline" size={20} /><Text style={styles.logoutButtonText}>Log Out</Text></TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export const PersonalInfoSubView = ({ user, onBack, onSave }: any) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [avatarUri, setAvatarUri] = useState<string | null>(user.avatarUri);
  const hasChanges = name.trim() !== user.name || email.trim() !== user.email || avatarUri !== user.avatarUri;

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets && result.assets.length > 0) setAvatarUri(result.assets[0].uri);
  };

  return (
    <ScrollView automaticallyAdjustKeyboardInsets={true} showsVerticalScrollIndicator={false} style={styles.mainContent}>
      <View style={styles.subHeaderRow}><TouchableOpacity onPress={onBack} style={styles.backButton}><Ionicons color="#111827" name="arrow-back" size={22} /></TouchableOpacity><Text style={styles.title}>Personal Info</Text></View>
      <View style={styles.editAvatarWrapper}>
        <TouchableOpacity onPress={handlePickImage} style={styles.editAvatarContainer}>
          {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.editAvatarImage} /> : <Text style={styles.editAvatarInitials}>{name ? name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : '?'}</Text>}
          <View style={styles.editAvatarBadge}><Ionicons color="#ffffff" name="camera" size={14} /></View>
        </TouchableOpacity>
      </View>
      <View style={{ marginTop: 20 }}>
        <Text style={styles.inputLabel}>Full Name</Text><TextInput onChangeText={setName} style={styles.modalInput} value={name} />
        <Text style={styles.inputLabel}>Email Address</Text><TextInput autoCapitalize="none" keyboardType="email-address" onChangeText={setEmail} style={styles.modalInput} value={email} />
        <TouchableOpacity disabled={!hasChanges} onPress={() => onSave({ ...user, name: name.trim(), email: email.trim(), avatarUri })} style={[styles.modalSaveButton, { marginTop: 32, opacity: hasChanges ? 1 : 0.5 }]}><Text style={styles.modalSaveText}>Save Changes</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export const NotificationsSubView = ({ user, onBack, onUpdateSettings }: any) => {
  const [pushEnabled, setPushEnabled] = useState(user.pushEnabled);
  const [emailEnabled, setEmailEnabled] = useState(user.emailEnabled);
  const [alertDays, setAlertDays] = useState<number>(user.alertDays);
  const DURATION_OPTIONS = [7, 14, 30, 60];

  const handlePushToggle = async (val: boolean) => {
    setPushEnabled(val);
    if (val) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') Alert.alert("Push Alerts Enabled", `You will receive device alerts ${alertDays} days before an item expires.`);
      else { Alert.alert("Permission Denied", "Please enable notifications in settings."); val = false; setPushEnabled(false); }
    }
    onUpdateSettings({ pushEnabled: val, emailEnabled, alertDays });
  };

  return (
    <View style={styles.mainContent}>
      <View style={styles.subHeaderRow}><TouchableOpacity onPress={onBack} style={styles.backButton}><Ionicons color="#111827" name="arrow-back" size={22} /></TouchableOpacity><Text style={styles.title}>Expiry Alerts</Text></View>
      <View style={{ gap: 16, marginTop: 24 }}>
        <View style={styles.settingToggleRow}><Text style={styles.settingToggleText}>Push Notifications</Text><CustomSwitch onValueChange={handlePushToggle} value={pushEnabled} /></View>
        <View style={styles.settingToggleRow}><View><Text style={styles.settingToggleText}>Email Summaries</Text><Text style={styles.settingToggleSubtext}>{user.email}</Text></View><CustomSwitch onValueChange={(val) => { setEmailEnabled(val); onUpdateSettings({ pushEnabled, emailEnabled: val, alertDays }); }} value={emailEnabled} /></View>
        <View style={styles.daysSelectorContainer}>
          <Text style={styles.daysSelectorTitle}>Notify me before expiry:</Text>
          <View style={styles.daysSelectorRow}>
            {DURATION_OPTIONS.map((days) => (
              <TouchableOpacity key={days} onPress={() => { setAlertDays(days); onUpdateSettings({ pushEnabled, emailEnabled, alertDays: days }); }} style={[styles.dayChip, alertDays === days && styles.dayChipActive]}><Text style={[styles.dayChipText, alertDays === days && styles.dayChipTextActive]}>{days} Days</Text></TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

export const SecuritySubView = ({ onBack }: any) => (
  <View style={styles.mainContent}>
    <View style={styles.subHeaderRow}><TouchableOpacity onPress={onBack} style={styles.backButton}><Ionicons color="#111827" name="arrow-back" size={22} /></TouchableOpacity><Text style={styles.title}>Security & Privacy</Text></View>
    <View style={{ gap: 16, marginTop: 24 }}>
      <TouchableOpacity onPress={() => Alert.alert("Export Vault Data", "Ready for export.", [{ text: "Cancel", style: "cancel" }, { text: "Download Archive" }])} style={styles.exportDataButton}><Ionicons color="#dc2626" name="cloud-download-outline" size={20} /><Text style={styles.exportDataButtonText}>Export Encrypted Vault Data</Text></TouchableOpacity>
    </View>
  </View>
);

export const HelpSubView = ({ onBack }: any) => (
  <ScrollView showsVerticalScrollIndicator={false} style={styles.mainContent}>
    <View style={styles.subHeaderRow}><TouchableOpacity onPress={onBack} style={styles.backButton}><Ionicons color="#111827" name="arrow-back" size={22} /></TouchableOpacity><Text style={styles.title}>Help Center</Text></View>
    <View style={{ gap: 14, marginTop: 20 }}>
      <View style={styles.faqCard}><Text style={styles.faqTitle}>How does OCR receipt scanning work?</Text><Text style={styles.faqBody}>Point your camera at any purchase receipt. Google ML Kit extracts text blocks locally.</Text></View>
    </View>
  </ScrollView>
);