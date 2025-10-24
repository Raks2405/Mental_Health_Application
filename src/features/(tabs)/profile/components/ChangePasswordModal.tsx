import React from "react";
import { Modal, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import CheckBox from "expo-checkbox";
import { styles } from "../styles/profile.styles";

type Props = {
  visible: boolean;
  onClose: () => void;
  currPwd: string;
  setCurrPwd: (v: string) => void;
  newPwd: string;
  setNewPwd: (v: string) => void;
  confirmPwd: string;
  setConfirmPwd: (v: string) => void;
  showCurrPwd: boolean;
  setShowCurrPwd: (v: boolean) => void;
  showNewPwd: boolean;
  setShowNewPwd: (v: boolean) => void;
  showConfirmPwd: boolean;
  setShowConfirmPwd: (v: boolean) => void;
  saving: boolean;
  onSubmit: () => void;
};

export default function ChangePasswordModal({
  visible,
  onClose,
  currPwd,
  setCurrPwd,
  newPwd,
  setNewPwd,
  confirmPwd,
  setConfirmPwd,
  showCurrPwd,
  setShowCurrPwd,
  showNewPwd,
  setShowNewPwd,
  showConfirmPwd,
  setShowConfirmPwd,
  saving,
  onSubmit,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.centered}>
        <Pressable style={styles.backdrop} onPress={() => !saving && onClose()} />
        <LinearGradient
          colors={["#2372a7ff", "#168895ff", "#032527ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.modalFrame}
        >
          <View style={styles.modalGlass}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <TextInput
              secureTextEntry={!showCurrPwd}
              placeholder="Current password"
              placeholderTextColor="rgba(0,0,0,0.45)"
              value={currPwd}
              onChangeText={setCurrPwd}
              style={styles.inputGlass}
            />
            <View style={styles.checkboxRow}>
              <CheckBox value={showCurrPwd} onValueChange={setShowCurrPwd} />
              <Text style={styles.checkboxLabel}>Show password</Text>
            </View>

            <TextInput
              secureTextEntry={!showNewPwd}
              placeholder="New password (min 6)"
              placeholderTextColor="rgba(0,0,0,0.45)"
              value={newPwd}
              onChangeText={setNewPwd}
              style={styles.inputGlass}
            />
            <View style={styles.checkboxRow}>
              <CheckBox value={showNewPwd} onValueChange={setShowNewPwd} />
              <Text style={styles.checkboxLabel}>Show password</Text>
            </View>

            <TextInput
              secureTextEntry={!showConfirmPwd}
              placeholder="Confirm new password"
              placeholderTextColor="rgba(0,0,0,0.45)"
              value={confirmPwd}
              onChangeText={setConfirmPwd}
              style={styles.inputGlass}
            />
            <View style={styles.checkboxRow}>
              <CheckBox value={showConfirmPwd} onValueChange={setShowConfirmPwd} />
              <Text style={styles.checkboxLabel}>Show password</Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <Pressable disabled={saving} onPress={onClose} style={[styles.btnSecondary, { marginRight: 10 }]}>
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable disabled={saving} onPress={onSubmit} style={styles.btnPrimary}>
                <Text style={styles.btnPrimaryText}>{saving ? "Saving..." : "Save"}</Text>
              </Pressable>
            </View>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </Modal>
  );
}
