import React, { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  onSend: (text: string) => void | Promise<void>;
  disabled?: boolean;
};

export default function ChatInput({ onSend, disabled = false }: Props) {
  const [value, setValue] = useState("");
  const insets = useSafeAreaInsets();
  const bottomPadding = useMemo(() => Math.max(insets.bottom, 12), [insets.bottom]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    setValue("");
    onSend(trimmed);
  };

  return (
    
      <View style={[styles.shell, { paddingBottom: bottomPadding }]}>
        <TextInput
          placeholder="Share a thought or ask for support..."
          placeholderTextColor="rgba(255,255,255,0.6)"
          value={value}
          onChangeText={setValue}
          style={styles.input}
          multiline
          blurOnSubmit
          editable={!disabled}
        />
        
        <Pressable
          onPress={handleSend}
          android_ripple={{ color: "rgba(255,255,255,0.15)" }}
          disabled={disabled}
          style={({ pressed }) => [
            styles.sendButton,
            disabled && styles.sendButtonDisabled,
            pressed && !disabled && styles.sendButtonPressed,
          ]}
        >
          <Text style={styles.sendText}>{disabled ? "..." : "Send"}</Text>
        </Pressable>
      </View>
    
  );
}

const styles = StyleSheet.create({
  shell: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(0,0,0,0.22)",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  input: {
    flex: 1,
    minHeight: 56,
    maxHeight: 160,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#f8fafc",
    fontSize: 15,
    lineHeight: 20,
  },
  sendButton: {
    marginTop: 5,
    alignSelf: "center",
    backgroundColor: "#0ea5e9",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  sendButtonPressed: {
    opacity: 0.9,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendText: {
    color: "#0b1f2a",
    fontWeight: "800",
    fontSize: 15,
  },
});
