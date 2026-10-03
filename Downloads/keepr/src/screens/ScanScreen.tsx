import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Appliance, CATEGORY_OPTIONS } from '../types';
import { getAddedLabel, performOnDeviceMLKitOCR } from '../utils';
import { styles } from '../styles';

export const ScanScreen = ({ onAddAppliance }: { onAddAppliance: (item: Appliance) => void; }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualBrand, setManualBrand] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Kitchen');
  const [customCategory, setCustomCategory] = useState('');
  const [manualPurchaseDate, setManualPurchaseDate] = useState('');
  const [manualExpiryDate, setManualExpiryDate] = useState('');
  const [productPhotoUri, setProductPhotoUri] = useState<string | null>(null);
  const [missingFieldsMessage, setMissingFieldsMessage] = useState("We can't find these details from the scan");

  const cameraRef = useRef<any>(null);

  const handleCaptureWithOCR = async () => {
    if (!permission?.granted || !cameraRef.current || isProcessing) {
      setMissingFieldsMessage("OCR unavailable on this device. Please enter details manually.");
      setManualModalVisible(true);
      return;
    }

    if (cameraRef.current && !isProcessing) {
      try {
        setIsProcessing(true);
        setScanMessage('Capturing receipt photo...');

        const photo = await cameraRef.current.takePictureAsync({ skipProcessing: false });
        setScanMessage('Running Google ML Kit On-Device OCR...');
        const extracted = await performOnDeviceMLKitOCR(photo.uri);

        const missing: string[] = [];
        if (!extracted.name) missing.push('Item Name');
        if (!extracted.brand) missing.push('Brand');
        if (extracted.price <= 0) missing.push('Price');
        if (!extracted.purchaseDate) missing.push('Purchase Date');
        if (!extracted.expiryDate) missing.push('Expiry Date');

        if (missing.length > 0) {
          setIsProcessing(false);
          setScanMessage(null);
          setMissingFieldsMessage(`We can't find these items: ${missing.join(', ')}`);
          setManualName(extracted.name || '');
          setManualBrand(extracted.brand || '');
          setManualPrice(extracted.price > 0 ? extracted.price.toString() : '');
          setSelectedCategory('Kitchen');
          setCustomCategory('');
          setManualPurchaseDate(extracted.purchaseDate || '');
          setManualExpiryDate(extracted.expiryDate || '');
          setProductPhotoUri(photo?.uri || null);
          setManualModalVisible(true);
          return;
        }

        const newItem: Appliance = {
          id: Date.now().toString(), name: extracted.name, brand: extracted.brand || 'Generic', location: 'Kitchen',
          added: getAddedLabel('ocr'), status: 'ACTIVE', details: `Purchased ${extracted.purchaseDate}`,
          price: extracted.price, purchaseDate: extracted.purchaseDate, expiryDate: extracted.expiryDate, imageUri: photo?.uri,
        };

        onAddAppliance(newItem);
        setIsProcessing(false);
        setScanMessage(`Successfully extracted & saved ${newItem.name}!`);
        setTimeout(() => setScanMessage(null), 4000);
      } catch (error) {
        setIsProcessing(false);
        setScanMessage(null);
        setMissingFieldsMessage("OCR unavailable on this device. Please enter details manually.");
        setManualModalVisible(true);
      }
    }
  };

  const handleSaveManualEntry = () => {
    const priceNum = parseFloat(manualPrice);
    if (!manualName.trim() || isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid item name and numeric price.');
      return;
    }
    const finalCategory = selectedCategory === 'Other' ? (customCategory.trim() || 'Other') : selectedCategory;
    const newItem: Appliance = {
      id: Date.now().toString(), name: manualName.trim(), brand: manualBrand.trim() || 'Generic', location: finalCategory,
      added: getAddedLabel('manual'), status: 'ACTIVE', details: manualPurchaseDate ? `Purchased ${manualPurchaseDate}` : 'Purchased Recently',
      price: priceNum, purchaseDate: manualPurchaseDate, expiryDate: manualExpiryDate, imageUri: productPhotoUri,
    };

    onAddAppliance(newItem);
    setManualModalVisible(false);
    setScanMessage('Appliance saved to your vault!');
    setTimeout(() => setScanMessage(null), 3000);
  };

  return (
    <ScrollView contentContainerStyle={[styles.scanContainer, { paddingBottom: 90 }]} showsVerticalScrollIndicator={false} style={styles.scanScrollView}>
      <Text style={styles.title}>{permission?.granted ? 'Scan Warranty OCR' : 'Scan Warranty'}</Text>
      <Text style={styles.scanSubtitle}>{permission?.granted ? 'Point camera at your receipt to run Google ML Kit OCR' : 'Camera access is unavailable. You can enter warranty details manually.'}</Text>

      {permission?.granted ? (
        <View style={styles.viewfinderBox}>
          <CameraView facing="back" ref={cameraRef} style={styles.cameraView}>
            <View style={styles.overlayFrame}>
              <View style={[styles.cornerMarker, styles.topLeft]} /><View style={[styles.cornerMarker, styles.topRight]} />
              <View style={[styles.cornerMarker, styles.bottomLeft]} /><View style={[styles.cornerMarker, styles.bottomRight]} />
            </View>
          </CameraView>
        </View>
      ) : (
        <TouchableOpacity onPress={requestPermission} style={[styles.scanPrimaryButton, { marginTop: 24 }]}><Text style={styles.scanPrimaryButtonText}>Grant Camera Permission</Text></TouchableOpacity>
      )}

      {scanMessage && (
        <View style={styles.successAlert}><Ionicons color="#059669" name="checkmark-circle" size={20} /><Text style={styles.successAlertText}>{scanMessage}</Text></View>
      )}

      <View style={styles.scanActionsRow}>
        <TouchableOpacity disabled={isProcessing} onPress={handleCaptureWithOCR} style={[styles.scanPrimaryButton, isProcessing && { opacity: 0.7 }, { flex: 1 }]}>
          <Ionicons color="#ffffff" name="scan" size={22} /><Text style={styles.scanPrimaryButtonText}>{isProcessing ? 'Processing...' : permission?.granted ? 'Snap & Extract' : 'Manual Entry'}</Text>
        </TouchableOpacity>
        <TouchableOpacity disabled={isProcessing} onPress={() => { setMissingFieldsMessage("Manual Entry Mode"); setManualModalVisible(true); }} style={[styles.scanPrimaryButton, { backgroundColor: '#4b5563', flex: 0.5 }]}>
          <Ionicons color="#ffffff" name="create-outline" size={22} /><Text style={styles.scanPrimaryButtonText}>Manual</Text>
        </TouchableOpacity>
      </View>

      <Modal animationType="slide" transparent={true} visible={manualModalVisible}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <ScrollView contentContainerStyle={{ paddingBottom: 10 }} showsVerticalScrollIndicator={false}>
                <View style={styles.errorHeaderContainer}><Ionicons color="#dc2626" name="alert-circle" size={26} /><Text numberOfLines={3} style={styles.errorTitleText}>{missingFieldsMessage}</Text></View>
                <Text style={styles.inputLabel}>Product Photo</Text>
                <View style={styles.photoPickerRow}>
                  {productPhotoUri ? <Image source={{ uri: productPhotoUri }} style={styles.previewThumbnail} /> : <View style={styles.placeholderThumbnail}><Ionicons color="#9ca3af" name="camera-outline" size={24} /></View>}
                  <TouchableOpacity onPress={() => { setManualModalVisible(false); setProductPhotoUri(null); setIsProcessing(false); }} style={styles.photoPickerButton}><Ionicons color="#111827" name="camera" size={18} /><Text style={styles.photoPickerButtonText}>Retake Photo & Return to Camera</Text></TouchableOpacity>
                </View>
                <Text style={styles.inputLabel}>Item Name *</Text>
                <TextInput onChangeText={setManualName} placeholder="e.g. Espresso Machine" placeholderTextColor="#9ca3af" style={styles.modalInput} value={manualName} />
                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.categoryDropdownContainer}>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <TouchableOpacity key={cat} style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipSelected]} onPress={() => setSelectedCategory(cat)}>
                      <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextSelected]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {selectedCategory === 'Other' && <TextInput onChangeText={setCustomCategory} placeholder="e.g. Entertainment" placeholderTextColor="#9ca3af" style={styles.modalInput} value={customCategory} />}
                <Text style={styles.inputLabel}>Price *</Text>
                <TextInput keyboardType="decimal-pad" onChangeText={setManualPrice} placeholder="e.g. 749" placeholderTextColor="#9ca3af" style={styles.modalInput} value={manualPrice} />
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity onPress={() => setManualModalVisible(false)} style={styles.modalCancelButton}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity>
                  <TouchableOpacity onPress={handleSaveManualEntry} style={styles.modalSaveButton}><Text style={styles.modalSaveText}>Save Item</Text></TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
};