import ThemeBackground from "@/src/shared/ThemeBackground";
import { useIsFocused } from "@react-navigation/native";
import { Slot } from "expo-router";
import React from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { FAB } from "react-native-paper";
import QuestionScreen, { QuestionScreenHandle } from "./QuestionScreen";

export default function HomeLayout() {
  const isFocused = useIsFocused();
  const [showQuestions, setShowQuestions] = React.useState(false);
  const [canGoBack, setCanGoBack] = React.useState(false);
  const questionRef = React.useRef<QuestionScreenHandle>(null);

  React.useEffect(() => {
    if (!isFocused && showQuestions) {
      setShowQuestions(false);
    }
  }, [isFocused, showQuestions]);

  return (
    <ThemeBackground>
      <View style={styles.container}>
        <Slot />
        {isFocused && (
          <FAB
            icon="assistant"
            color="#fff"
            style={styles.fab}
            onPress={() => {
              setShowQuestions(true);
            }}
          />
        )}
        <Modal
          visible={showQuestions}
          transparent
          animationType="fade"
          onRequestClose={() => setShowQuestions(false)}
        >
          <KeyboardAvoidingView
            style={styles.modalKeyboard}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Pressable
                  onPress={() => questionRef.current?.goBack()}
                  disabled={!canGoBack}
                >
                  <Text
                    
                    style={[
                      styles.modalClose,
                      { paddingLeft: 5 },
                      !canGoBack && styles.modalCloseDisabled,
                    ]}
                  >
                    Back
                  </Text>
                </Pressable>
                <Text style={styles.modalTitle}>Quick Questions</Text>
                <Pressable onPress={() => setShowQuestions(false)}>
                  <Text style={styles.modalClose}>Close</Text>
                </Pressable>
              </View>
              <View style={{padding: 10, alignItems: 'center'}}>
                <Text style={{color: '#ba3131ff', fontSize: 16, fontWeight: 'bold'}}>
                  IMPORTANT:
                  These are few questions to help you find the right resources.
                  Your answers will not be stored or shared.
                  You can always choose to skip this step.
                </Text>
              </View>
              <View style={styles.modalContent}>
                <QuestionScreen ref={questionRef} onCanGoBackChange={setCanGoBack} />
              </View>
            </View>
          </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </ThemeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#041a21ff",
    zIndex: 10,
    elevation: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalKeyboard: {
    flex: 1,
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    height: "80%",
    minHeight: 260,
    backgroundColor: "#0b3040",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#134b61",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#134b61",
    backgroundColor: "#0f3a4c",
  },
  modalTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    alignItems: "center",
  },
  modalClose: {
    color: "#22d3ee",
    fontWeight: "700",
  },
  modalCloseDisabled: {
    opacity: 0.45,
  },
  modalContent: {
    flex: 1,
  },
});
