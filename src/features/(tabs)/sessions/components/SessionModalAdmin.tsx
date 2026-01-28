import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";

import DateTimePickerModal from "react-native-modal-datetime-picker";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "../styles/sessions.styles";

type Props = {
  visible: boolean;
  onClose: () => void;
  isEditing: boolean;
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  date: Date;
  setDate: (v: Date) => void;
  time: Date;
  setTime: (v: Date) => void;
  location: string;
  setLocation: (v: string) => void;
  onPublish: () => void;
  onRePublish: () => void;
  onCancel: () => void; // parent keeps original cancel logic/alerts
};

export default function SessionModalAdmin({
  visible,
  onClose,
  isEditing,
  title,
  setTitle,
  description,
  setDescription,
  date,
  setDate,
  time,
  setTime,
  location,
  setLocation,
  onPublish,
  onRePublish,
  onCancel
}: Props) {

  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });


  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        style={styles.centered}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <LinearGradient
          colors={["#2372a7ff", "#168895ff", "#032527ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.modalCardGradient}
        >
          {/* glow highlight */}
          <LinearGradient
            colors={["rgba(255, 255, 255, 0.36)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.8, y: 0.2 }}
            style={styles.modalGlow}
          />

          {/* glass card */}
          <LinearGradient
            colors={["rgba(0, 125, 160, 0.18)", "rgba(0, 125, 160, 0.18)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalCardGlass}
          >
            <ScrollView automaticallyAdjustKeyboardInsets>
              <Text style={styles.modalTitle}>
                {isEditing ? "Edit Session" : "Add Session"}
              </Text>

              {/* Title */}
              <Text style={styles.fieldLabel}>Session Title</Text>
              <TextInput
                placeholder="Session Title"
                placeholderTextColor="rgba(0,0,0,0.45)"
                style={styles.inputGlass}
                value={title}
                onChangeText={setTitle}
              />

             {/* DATE */}
              <Text style={styles.fieldLabel}>Select Date</Text>
              <Pressable onPress={() => setDatePickerVisible(true)} style={styles.inputGlassPressable}>
                <FontAwesome name="calendar" size={14} color="#111827" />
                <Text style={styles.inputGlassText}>{fmt(date)}</Text>
              </Pressable>

              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                date={date}
                onConfirm={(selected) => {
                  setDatePickerVisible(false);
                  setDate(selected);
                }}
                onCancel={() => setDatePickerVisible(false)}
              />

              {/* TIME */}
              <Text style={styles.fieldLabel}>Select Time</Text>
              <Pressable onPress={() => setTimePickerVisible(true)} style={styles.inputGlassPressable}>
                <FontAwesome name="clock-o" size={14} color="#111827" />
                <Text style={styles.inputGlassText}>{fmtTime(time)}</Text>
              </Pressable>

              <DateTimePickerModal
                isVisible={isTimePickerVisible}
                mode="time"
                date={time}
                onConfirm={(selected) => {
                  setTimePickerVisible(false);
                  setTime(selected);
                }}
                onCancel={() => setTimePickerVisible(false)}
              />

              {/* Location */}
              <Text style={styles.fieldLabel}>Location</Text>
              <TextInput
                placeholder="Location"
                placeholderTextColor="rgba(0,0,0,0.45)"
                style={styles.inputGlass}
                value={location}
                onChangeText={setLocation}
              />

              {/* Description */}
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                placeholder="Description"
                placeholderTextColor="rgba(0,0,0,0.45)"
                style={[styles.inputGlass, { height: 400, textAlignVertical: "top" }]}
                multiline
                numberOfLines={12}
                value={description}
                onChangeText={setDescription}
              />
            </ScrollView>

            {/* Actions row – keep your exact two-button pattern */}
            <View style={styles.actionRow}>
              <Pressable onPress={onCancel} style={styles.btnGlass}>
                <Text style={styles.btnGlassText}>Cancel</Text>
              </Pressable>
              <View style={{ width: 12 }} />
              <Pressable
                disabled={title.length === 0 || location.length === 0 || !time || !date}
                onPress={isEditing ? onRePublish : onPublish}
                android_ripple={{ color: "rgba(255,255,255,0.2)" }}
                style={({ pressed }) => [
                  styles.btnPrimaryGlass,
                  (title.length === 0 || location.length === 0 || !time || !date) && styles.btnDisabled,
                  pressed && styles.loginBtnPressed,
                ]}
              >
                <Text style={styles.btnPrimaryGlassText}>
                  {isEditing ? "Re-Publish" : "Publish"}
                </Text>
              </Pressable>
            </View>
          </LinearGradient>
        </LinearGradient>
      </KeyboardAvoidingView>
    </Modal>
  );
}
