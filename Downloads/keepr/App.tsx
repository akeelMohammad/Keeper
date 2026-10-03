import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

import { supabase } from './lib/supabase';
import { UserProfile, Appliance } from './src/types';
import { evaluateStatus } from './src/utils';
import { styles } from './src/styles';

import { BottomNavBar } from './src/components/Shared';
import { SplashScreen } from './src/screens/SplashScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ActiveWarrantiesScreen } from './src/screens/ActiveWarrantiesScreen';
import { ProtectedValueScreen } from './src/screens/ProtectedValueScreen';
import { VaultScreen } from './src/screens/VaultScreen';
import { ScanScreen } from './src/screens/ScanScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { ProfileScreen, PersonalInfoSubView, NotificationsSubView, SecuritySubView, HelpSubView } from './src/screens/ProfileScreen';

export default function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Auth States
  const [isSignUp, setIsSignUp] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authName, setAuthName] = useState('');
  
  // Forgot Password States
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // App States
  const [user, setUser] = useState<UserProfile>({ name: '', email: '', avatarUri: null, alertDays: 30, pushEnabled: false, emailEnabled: false });
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [subView, setSubView] = useState<'none' | 'activeWarranties' | 'protectedValue'>('none');
  const [profileSubView, setProfileSubView] = useState<'none' | 'personal' | 'notifications' | 'security' | 'help'>('none');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserDataAndAppliances(session.user.id);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserDataAndAppliances(session.user.id);
      else setAppliances([]);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserDataAndAppliances = async (userId: string) => {
    try {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (profileData) {
        setUser({ name: profileData.name || '', email: profileData.email || session?.user?.email || '', avatarUri: profileData.avatar_uri || null, alertDays: profileData.alert_days ?? 30, pushEnabled: profileData.push_enabled ?? false, emailEnabled: profileData.email_enabled ?? false });
      }

      const { data: applianceData, error } = await supabase.from('appliances').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (!error && applianceData) {
        const formatted = applianceData.map((item: any) => ({ id: item.id, name: item.name, brand: item.brand, location: item.location, added: item.added, status: item.status, details: item.details, price: item.price, purchaseDate: item.purchase_date, expiryDate: item.expiry_date, imageUri: item.image_uri }));
        setAppliances(formatted);
      }
    } catch (error) { console.error('Error fetching data:', error); }
  };

  const handleAuthAction = async () => {
    setAuthError(null);

    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Please enter both your email address and password to continue.');
      return;
    }

    if (isSignUp) {
      if (!authName.trim()) {
        setAuthError('Please enter a username for your new account.');
        return;
      }
      if (authPassword.length < 6) {
        setAuthError('For your security, your password must be at least 6 characters long.');
        return;
      }
      if (authPassword !== authConfirmPassword) {
        setAuthError('Passwords do not match. Please ensure both fields are exactly the same.');
        return;
      }
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword.trim(),
          options: { data: { name: authName.trim() } }
        });

        if (error) {
          const rawMsg = (error.message || JSON.stringify(error)).toLowerCase();
          let displayMessage = error.message || 'An error occurred during sign up.';
          if (rawMsg.includes('already registered') || rawMsg.includes('already exists') || error.status === 422) {
            displayMessage = 'This email is already associated with an existing account. Please log in instead.';
          }
          setAuthError(displayMessage);
        } else {
          if (data.user) {
            await supabase.from('profiles').upsert([
              { id: data.user.id, name: authName.trim(), email: authEmail.trim(), alert_days: 30, push_enabled: false, email_enabled: false }
            ]);
            setUser({ name: authName.trim(), email: authEmail.trim(), avatarUri: null, alertDays: 30, pushEnabled: false, emailEnabled: false });
          }
          if (!data.session) {
             setAuthError('Account created successfully! Please check your email inbox to verify your account.');
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword.trim(),
        });

        if (error) {
          const rawMsg = (error.message || JSON.stringify(error)).toLowerCase();
          let displayMessage = error.message || 'An error occurred during login.';
          if (rawMsg.includes('invalid login credentials') || rawMsg.includes('credentials') || error.status === 400) {
            displayMessage = 'Incorrect email or password. Please check your details and try again.';
          }
          setAuthError(displayMessage);
        }
      }
    } catch (err: any) {
      setAuthError(err?.message || 'An unexpected network or system error occurred.');
    }
  };

  const handleRequestPasswordReset = async () => {
    setAuthError(null);
    if (!authEmail.trim()) {
      setAuthError('Please enter your email address to reset your password.');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(authEmail.trim());
      if (error) throw error;
      
      setIsOtpSent(true);
      setAuthError(null);
      Alert.alert("Code Sent", "Check your email for the 6-digit recovery code.");
    } catch (err: any) {
      setAuthError(err?.message || 'Failed to send reset email.');
    }
  };

  const handleVerifyOtpAndUpdatePassword = async () => {
    setAuthError(null);
    if (!resetOtp.trim() || newPassword.length < 6) {
      setAuthError('Please enter the 6-digit code and a valid new password (min 6 characters).');
      return;
    }

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: authEmail.trim(),
        token: resetOtp.trim(),
        type: 'recovery',
      });
      
      if (verifyError) throw verifyError;

      if (data.session) {
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword.trim(),
        });
        if (updateError) throw updateError;

        Alert.alert("Success", "Your password has been successfully reset!");
        setIsForgotPassword(false);
        setIsOtpSent(false);
        setResetOtp('');
        setNewPassword('');
        setAuthPassword('');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Failed to reset password. The code may be invalid or expired.');
    }
  };
  
  const handleAddAppliance = async (newItem: Appliance) => {
    if (!session?.user) return;
    try {
      const evaluatedStatus = evaluateStatus(newItem.expiryDate, user.alertDays);
      const { data, error } = await supabase.from('appliances').insert([{ user_id: session.user.id, name: newItem.name, brand: newItem.brand, location: newItem.location, added: newItem.added, status: evaluatedStatus, details: newItem.details, price: newItem.price, purchase_date: newItem.purchaseDate, expiry_date: newItem.expiryDate, image_uri: newItem.imageUri }]).select().single();
      if (error) Alert.alert('Save Error', error.message);
      else if (data) {
        setAppliances([{ id: data.id, name: data.name, brand: data.brand, location: data.location, added: data.added, status: evaluatedStatus, details: data.details, price: data.price, purchaseDate: data.purchase_date, expiryDate: data.expiry_date, imageUri: data.image_uri }, ...appliances]);
      }
    } catch (err) { console.error('Failed to save appliance:', err); }
  };

  if (isSplashVisible) {
    return <SplashScreen onFinish={() => setIsSplashVisible(false)} />;
  }

  if (authLoading) return <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: '#6b7280' }}>Loading Keeper...</Text></View>;

  if (!session) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.authContainer}>
        <View style={styles.authTopSection}>
          <Svg fill="none" height="110" viewBox="0 0 180 180" width="110">
            <Path d="M81.5 4.90748C86.7598 1.87072 93.2402 1.87072 98.5 4.90748L159.442 40.0925C164.702 43.1293 167.942 48.7414 167.942 54.815V125.185C167.942 131.259 164.702 136.871 159.442 139.907L98.5 175.093C93.2402 178.129 86.7598 178.129 81.5 175.093L20.5577 139.907C15.2979 136.871 12.0577 131.259 12.0577 125.185V54.815C12.0577 48.7414 15.2979 43.1293 20.5577 40.0925L81.5 4.90748Z" fill="black"/>
            <Path d="M158.574 126.546C160.764 125.317 160.564 122.1 158.237 121.152L87.1319 92.1835C85.1588 91.3796 83 92.8312 83 94.9618V163.851C83 166.145 85.4689 167.59 87.4687 166.467L158.574 126.546Z" fill="url(#paint0_linear_27_56)"/>
            <Path d="M142.406 56.9819C145.043 55.5373 147.929 58.4387 146.47 61.0681L88.6235 165.361C87.1214 168.069 83 167.003 83 163.906V91.3013C83 90.2054 83.5976 89.1967 84.5587 88.6702L142.406 56.9819Z" fill="url(#paint1_linear_27_56)"/>
            <Defs>
              <LinearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_27_56" x1="164" x2="83" y1="95.4542" y2="164.022">
                <Stop offset="0.330434" stopColor="white"/>
                <Stop offset="1" stopColor="#737373"/>
              </LinearGradient>
              <LinearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_27_56" x1="89" x2="147.5" y1="164" y2="60">
                <Stop offset="0.553609" stopColor="white"/>
                <Stop offset="1" stopColor="#999999"/>
              </LinearGradient>
            </Defs>
          </Svg>
          <Text style={styles.authLogoText}>keeper</Text>
          <Text style={styles.authLogoSubtext}>Scan. Save. Solved.</Text>
        </View>

        <View style={styles.authBottomSection}>
          <Text style={styles.authWelcomeText}>
            {isForgotPassword ? 'Reset Password' : 'Welcome!'}
          </Text>

          {authError && (
            <View style={styles.authErrorBox}>
              <Ionicons color="#dc2626" name="alert-circle" size={20} />
              <Text style={styles.authErrorText}>{authError}</Text>
            </View>
          )}

          {isForgotPassword ? (
            <>
              {!isOtpSent ? (
                <>
                  <Text style={styles.authInputLabel}>Account Email</Text>
                  <TextInput autoCapitalize="none" keyboardType="email-address" onChangeText={setAuthEmail} placeholder="e-mail" placeholderTextColor="#9ca3af" style={styles.authInput} value={authEmail} />
                  <TouchableOpacity onPress={handleRequestPasswordReset} style={[styles.authPrimaryButton, { marginTop: 10 }]}>
                    <Text style={styles.authPrimaryButtonText}>Send Recovery Code</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.authInputLabel}>6-Digit Code</Text>
                  <TextInput keyboardType="number-pad" onChangeText={setResetOtp} placeholder="Enter code from email" placeholderTextColor="#9ca3af" style={styles.authInput} value={resetOtp} />
                  <Text style={styles.authInputLabel}>New Password</Text>
                  <TextInput autoCapitalize="none" onChangeText={setNewPassword} placeholder="Enter new password" placeholderTextColor="#9ca3af" secureTextEntry style={styles.authInput} value={newPassword} />
                  <TouchableOpacity onPress={handleVerifyOtpAndUpdatePassword} style={[styles.authPrimaryButton, { marginTop: 10 }]}>
                    <Text style={styles.authPrimaryButtonText}>Update Password</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity onPress={() => { setIsForgotPassword(false); setIsOtpSent(false); setAuthError(null); }} style={styles.authToggleTextContainer}>
                <Text style={styles.authToggleText}>Remember your password? <Text style={styles.authToggleTextBold}>Go back</Text></Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {isSignUp && (
                <>
                  <Text style={styles.authInputLabel}>Username</Text>
                  <TextInput autoCapitalize="words" onChangeText={setAuthName} placeholder="username" placeholderTextColor="#9ca3af" style={styles.authInput} value={authName} />
                </>
              )}
              <Text style={styles.authInputLabel}>Email</Text>
              <TextInput autoCapitalize="none" keyboardType="email-address" onChangeText={setAuthEmail} placeholder="e-mail" placeholderTextColor="#9ca3af" style={styles.authInput} value={authEmail} />
              <Text style={styles.authInputLabel}>Password</Text>
              <View style={[styles.passwordInputContainer, { marginBottom: isSignUp ? 20 : 10 }]}>
                <TextInput autoCapitalize="none" onChangeText={setAuthPassword} placeholder="password" placeholderTextColor="#9ca3af" secureTextEntry={!showPassword} style={styles.passwordInput} value={authPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIconContainer}> 
                  <Ionicons color="#000000" name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} />
                </TouchableOpacity>
              </View>

              {!isSignUp && (
                <TouchableOpacity onPress={() => { setIsForgotPassword(true); setAuthError(null); }} style={{ alignItems: 'flex-end', marginBottom: 25 }}>
                  <Text style={{ color: '#9ca3af', fontSize: 13, fontWeight: '600' }}>Forgot password?</Text>
                </TouchableOpacity>
              )}

              {isSignUp && (
                <>
                  <Text style={styles.authInputLabel}>Confirm Password</Text>
                  <View style={[styles.passwordInputContainer, { marginBottom: 35 }]}>
                    <TextInput autoCapitalize="none" onChangeText={setAuthConfirmPassword} placeholder="confirm password" placeholderTextColor="#9ca3af" secureTextEntry={!showConfirmPassword} style={styles.passwordInput} value={authConfirmPassword} />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIconContainer}> 
                      <Ionicons color="#000000" name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={22} />
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <TouchableOpacity onPress={handleAuthAction} style={styles.authPrimaryButton}>
                <Text style={styles.authPrimaryButtonText}>
                  {isSignUp ? 'Create account' : 'Login'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setAuthError(null); setIsSignUp(!isSignUp); }} style={styles.authToggleTextContainer}>
                <Text style={styles.authToggleText}>
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                  <Text style={styles.authToggleTextBold}>{isSignUp ? 'Login' : 'Create account'}</Text>
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.screen}>
      {activeTab === 'home' && subView === 'none' && <HomeScreen appliances={appliances} onNavigateVault={() => { setSubView('none'); setActiveTab('vault'); }} searchQuery={searchQuery} setSearchQuery={setSearchQuery} user={user} onNavigateActiveWarranties={() => setSubView('activeWarranties')} onNavigateProtectedValue={() => setSubView('protectedValue')} />}
      {activeTab === 'home' && subView === 'activeWarranties' && <ActiveWarrantiesScreen alertDays={user.alertDays} appliances={appliances} onBack={() => setSubView('none')} />}
      {activeTab === 'home' && subView === 'protectedValue' && <ProtectedValueScreen alertDays={user.alertDays} appliances={appliances} onBack={() => setSubView('none')} />}
      
      {activeTab === 'vault' && <VaultScreen appliances={appliances} searchQuery={searchQuery} setSearchQuery={setSearchQuery} activeFilter={activeFilter} setActiveFilter={setActiveFilter} alertDays={user.alertDays} />}
      {activeTab === 'scan' && <ScanScreen onAddAppliance={handleAddAppliance} />}
      {activeTab === 'chat' && <ChatScreen appliances={appliances} />}
      
      {activeTab === 'profile' && profileSubView === 'none' && <ProfileScreen onNavigateProfileSub={(sub: string) => setProfileSubView(sub as any)} user={user} />}
      {activeTab === 'profile' && profileSubView === 'personal' && <PersonalInfoSubView onBack={() => setProfileSubView('none')} user={user} onSave={async (updatedUser: any) => { setUser(updatedUser); setProfileSubView('none'); }} />}
      {activeTab === 'profile' && profileSubView === 'notifications' && <NotificationsSubView onBack={() => setProfileSubView('none')} user={user} onUpdateSettings={async (settings: any) => { setUser({ ...user, ...settings }); }} />}
      {activeTab === 'profile' && profileSubView === 'security' && <SecuritySubView onBack={() => setProfileSubView('none')} />}
      {activeTab === 'profile' && profileSubView === 'help' && <HelpSubView onBack={() => setProfileSubView('none')} />}

      <BottomNavBar activeTab={activeTab} onTabPress={(tab) => { setSubView('none'); if (tab !== 'profile') setProfileSubView('none'); setActiveTab(tab); }} />
      <StatusBar style="auto" />
    </View>
  );
}