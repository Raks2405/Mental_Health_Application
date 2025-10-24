import React from "react";
import {
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
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
}: Props) {
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  const openAndroidDate = () => {
    DateTimePicker.open({
      value: date,
      onChange: (_, selected) => setDate(selected || date),
      mode: "date",
    });
  };

  const openAndroidTime = () => {
    DateTimePicker.open({
      value: time,
      onChange: (_, selected) => setTime(selected || time),
      mode: "time",
      display: "clock",
      is24Hour: false,
    });
  };

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
          {/* Glow */}
          <LinearGradient
            colors={["rgba(255, 255, 255, 0.36)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.8, y: 0.2 }}
            style={styles.modalGlow}
          />

          {/* Glass card */}
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

              {/* Date & Time */}
              {Platform.OS === "ios" ? (
                <>
                  <Text style={styles.fieldLabel}>Select Date</Text>
                  <LinearGradient
                    colors={["rgba(255,255,255,0.75)", "rgba(255,255,255,0.75)"]}
                    style={styles.pickerGlass}
                  >
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display="default"
                      onChange={(_, selected) => setDate(selected || date)}
                      style={{ width: "100%" }}
                    />
                  </LinearGradient>

                  <Text style={styles.fieldLabel}>Select Time</Text>
                  <LinearGradient
                    colors={["rgba(255,255,255,0.75)", "rgba(255,255,255,0.75)"]}
                    style={styles.pickerGlass}
                  >
                    <DateTimePicker
                      value={time}
                      mode="time"
                      display="clock"
                      is24Hour={false}
                      onChange={(_, selected) => setTime(selected || time)}
                      style={{ width: "100%" }}
                    />
                  </LinearGradient>
                </>
              ) : (
                <>
                  <Text style={styles.fieldLabel}>Select Date</Text>
                  <Pressable onPress={openAndroidDate} style={styles.inputGlassPressable}>
                    <FontAwesome name="calendar" size={14} color="#111827" />
                    <Text style={styles.inputGlassText}>{fmt(date)}</Text>
                  </Pressable>

                  <Text style={styles.fieldLabel}>Select Time</Text>
                  <Pressable onPress={openAndroidTime} style={styles.inputGlassPressable}>
                    <FontAwesome name="clock-o" size={14} color="#111827" />
                    <Text style={styles.inputGlassText}>{fmtTime(time)}</Text>
                  </Pressable>
                </>
              )}

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

            {/* Actions */}
            <Pressable
              disabled={title.length === 0 || location.length === 0}
              onPress={isEditing ? onRePublish : onPublish}
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
              style={({ pressed }) => [
                styles.btnPrimaryGlass,
                (title.length === 0 || location.length === 0) && styles.btnDisabled,
                pressed && styles.loginBtnPressed,
              ]}
            >
              <Text style={styles.btnPrimaryGlassText}>
                {isEditing ? "Re-Publish" : "Publish"}
              </Text>
            </Pressable>
          </LinearGradient>
        </LinearGradient>
      </KeyboardAvoidingView>
    </Modal>
  );
}
