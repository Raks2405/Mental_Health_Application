import React from "react";
import {
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  ScrollView,
  View
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import DateTimePickerIOS, {
  DateTimePickerAndroid,
  type DateTimePickerEvent
} from "@react-native-community/datetimepicker";
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
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  // ANDROID pickers – correct static API
  const openAndroidDate = () => {
    DateTimePickerAndroid.open({
      value: date,
      onChange: (_e: DateTimePickerEvent, selected?: Date) => {
        const current = selected || date;
        setDate(current);
      },
      mode: "date",
      display: "default"
    });
  };

  const openAndroidTime = () => {
    DateTimePickerAndroid.open({
      value: time,
      onChange: (_e: DateTimePickerEvent, selected?: Date) => {
        const current = selected || time;
        setTime(current);
      },
      mode: "time",
      display: "clock",
      is24Hour: false
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

              {/* iOS pickers */}
              {Platform.OS === "ios" ? (
                <>
                  <Text style={styles.fieldLabel}>Select Date</Text>
                  <View style={styles.pickerGlass}>
                    <DateTimePickerIOS
                      value={date}
                      mode="date"
                      display="default"
                      onChange={(_e: DateTimePickerEvent, selected?: Date) =>
                        setDate(selected ?? date)
                      }
                      style={{ width: "100%" }}
                    />
                  </View>

                  <Text style={styles.fieldLabel}>Select Time</Text>
                  <View style={styles.pickerGlass}>
                    <DateTimePickerIOS
                      value={time}
                      mode="time"
                      display="clock"
                      is24Hour={false}
                      onChange={(_e: DateTimePickerEvent, selected?: Date) =>
                        setTime(selected ?? time)
                      }
                      style={{ width: "100%" }}
                    />
                  </View>
                </>
              ) : (
                // Android pickers
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
