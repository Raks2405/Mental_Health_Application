import { useUser } from "@/src/UserContext";
import { FontAwesome } from "@expo/vector-icons";
import CheckBox from 'expo-checkbox';
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import React, { useCallback, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { adminEmails } from "../(auth)/loginpage";
import { logOut } from '../../src/auth';
import { auth } from '../../src/firebase';

export default function Profile() {
  const [email, setEmail] = useState<string>("Guest");
  const { user } = useUser();
  const [showPwdScreen, setShowPwdScreen] = useState(false);
  const [currPwd, setCurrPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [saving, setSaving] = useState(false);
  const [isSelectedCurrPwd, setSelectionCurrPwd] = useState(false);
  const [isSelectedNewPwd, setSelectionNewPwd] = useState(false);
  const [isSelectedConfirmPwd, setSelectionConfirmPwd] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const u = auth.currentUser;
      if (!u || u.isAnonymous) setEmail("Guest");
      else setEmail(u.email ?? "Guest");
    }, [])
  );
  const isAdmin = adminEmails.includes(email);

  const handleChangePassword = async () => {
    if (!currPwd || !newPwd || !confirmPwd)
      return Alert.alert('Error', 'All fields are required');
    if (newPwd.length < 6)
      return Alert.alert('Error', 'New password must be at least 6 characters');
    if (newPwd !== confirmPwd)
      return Alert.alert('Error', 'Passwords do not match');

    const user = auth.currentUser;
    if (!user || !user.email) return Alert.alert('Error', 'No authenticated user');

    try {
      setSaving(true);
      const cred = EmailAuthProvider.credential(user.email, currPwd);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPwd);
      setShowPwdScreen(false);
      setCurrPwd(''); setNewPwd(''); setConfirmPwd('');
      Alert.alert('Success', 'Password changed');
    } catch (e) {
      Alert.alert('Failed', 'Check your current password and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient
      colors={['#2372a7ff', '#168895ff', '#032527ff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      {/* subtle glow */}
      <LinearGradient
        colors={['rgba(255,255,255,0.36)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 0.2 }}
        style={styles.bgGlow}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        style={styles.pagePad}
      >
        {/* glass profile card */}
        <View style={styles.cardGlass}>
          <View style={styles.name_iconContainer}>
            <FontAwesome style={styles.userIcon} name="user-circle" size={100} color={'#1f2937'} />
            <Text style={styles.name}>
              {email} {isAdmin ? "(Admin)" : ""}
            </Text>
          </View>

          {/* actions */}
          <View style={styles.subCardGlass}>
            <Pressable
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
              onPress={async () => {
                console.log(user?.email);
                Alert.alert('Logout', 'Are you sure you want to logout?', [
                  { text: 'Cancel' },
                  {
                    text: 'OK', onPress: async () => {
                      try {
                        await logOut();
                        console.log('User logged out');
                        router.replace({ pathname: '/goodbye' });
                      } catch (error) {
                        console.log('Error logging out: ', error);
                        Alert.alert('Error', 'An error occurred while logging out. Please try again.');
                      }
                    }
                  }
                ]);
              }}
            >
              <FontAwesome name='sign-out' size={22} color='#111827' style={{ marginRight: 10 }} />
              <Text style={styles.actionText}>Logout</Text>
            </Pressable>
          </View>

          <View
            style={[
              styles.subCardGlass,
              user?.email === 'Guest' && { opacity: 0.6 }
            ]}
          >
            <Pressable
              disabled={user?.email === 'Guest'}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
              onPress={() => setShowPwdScreen(true)}
            >
              <FontAwesome name='lock' size={22} color='#111827' style={{ marginRight: 10 }} />
              <Text style={styles.actionText}>Change Password</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Change password modal (glass) */}
      <Modal
        visible={showPwdScreen}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPwdScreen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.centered}
        >
          <Pressable style={styles.backdrop} onPress={() => !saving && setShowPwdScreen(false)} />
          <LinearGradient
            colors={['#2372a7ff', '#168895ff', '#032527ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalFrame}
          >
            <View style={styles.modalGlass}>
              <Text style={styles.modalTitle}>Change Password</Text>

              <TextInput
                secureTextEntry={!isSelectedCurrPwd}
                placeholder="Current password"
                placeholderTextColor="rgba(0,0,0,0.45)"
                value={currPwd}
                onChangeText={setCurrPwd}
                style={styles.inputGlass}
              />
              <View style={styles.checkboxRow}>
                <CheckBox value={isSelectedCurrPwd} onValueChange={setSelectionCurrPwd} />
                <Text style={styles.checkboxLabel}>Show password</Text>
              </View>

              <TextInput
                secureTextEntry={!isSelectedNewPwd}
                placeholder="New password (min 6)"
                placeholderTextColor="rgba(0,0,0,0.45)"
                value={newPwd}
                onChangeText={setNewPwd}
                style={styles.inputGlass}
              />
              <View style={styles.checkboxRow}>
                <CheckBox value={isSelectedNewPwd} onValueChange={setSelectionNewPwd} />
                <Text style={styles.checkboxLabel}>Show password</Text>
              </View>

              <TextInput
                secureTextEntry={isSelectedConfirmPwd}
                placeholder="Confirm new password"
                placeholderTextColor="rgba(0,0,0,0.45)"
                value={confirmPwd}
                onChangeText={setConfirmPwd}
                style={styles.inputGlass}
              />
              <View style={styles.checkboxRow}>
                <CheckBox value={isSelectedConfirmPwd} onValueChange={setSelectionConfirmPwd} />
                <Text style={styles.checkboxLabel}>Show password</Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Pressable
                  disabled={saving}
                  onPress={() => setShowPwdScreen(false)}
                  style={[styles.btnSecondary, { marginRight: 10 }]}
                >
                  <Text style={styles.btnSecondaryText}>Cancel</Text>
                </Pressable>
                <Pressable
                  disabled={saving}
                  onPress={handleChangePassword}
                  style={styles.btnPrimary}
                >
                  <Text style={styles.btnPrimaryText}>{saving ? 'Saving...' : 'Save'}</Text>
                </Pressable>
              </View>
            </View>
          </LinearGradient>
        </KeyboardAvoidingView>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  pagePad: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },

  // background glow
  bgGlow: {
    position: 'absolute',
    top: 60,
    left: -20,
    width: 250,
    height: 170,
    borderRadius: 100,
    opacity: 0.85,
  },

  // glass main card
  cardGlass: {
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },

  name_iconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  userIcon: {
    marginBottom: 6,
    color: '#1f2937',
  },
  name: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0b1320',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  subCardGlass: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0b1320',
  },

  // modal
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },

  modalFrame: {
    width: '88%',
    borderRadius: 18,
    padding: 3, // gradient frame
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowColor: '#000',
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: { elevation: 10 }
    })
  },
  modalGlass: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
    color: '#0b1320',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  inputGlass: {
    height: 44,
    borderColor: 'rgba(0,0,0,0.15)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    color: '#0b1320',
    fontSize: 14,
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  checkboxLabel: {
    color: '#0b1320',
    fontSize: 13,
  },

  btnPrimary: {
    backgroundColor: 'rgba(16, 185, 129, 0.98)', // emerald
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  btnSecondary: {
    backgroundColor: 'rgba(37, 99, 235, 0.98)', // blue
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  btnSecondaryText: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
