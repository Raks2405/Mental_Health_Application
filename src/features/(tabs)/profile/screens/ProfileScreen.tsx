import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ThemeBackground from "../../../../shared/ThemeBackground";
import ChangePasswordModal from "../components/ChangePasswordModal";
import ProfileCard from "../components/ProfileCard";
import { useProfile } from "../hooks/useProfile";
import { styles } from "../styles/profile.styles";
import QuestionScreen, { QuestionScreenHandle } from "../../home/screens/QuestionScreen";
import { useRecommendation } from "../../home/context/RecommendationContext";

export default function ProfileScreen() {
  const { setRecommendation } = useRecommendation();
  const {
    email,
    isAdmin,
    showPwdScreen,
    setShowPwdScreen,
    handleLogout,

    currPwd, setCurrPwd,
    newPwd, setNewPwd,
    confirmPwd, setConfirmPwd,
    showCurrPwd, setShowCurrPwd,
    showNewPwd, setShowNewPwd,
    showConfirmPwd, setShowConfirmPwd,
    saving,
    handleChangePassword,
  } = useProfile();
  const [showQuestions, setShowQuestions] = React.useState(false);
  const [canGoBack, setCanGoBack] = React.useState(false);
  const [showRecommendationNotice, setShowRecommendationNotice] = React.useState(false);
  const questionRef = React.useRef<QuestionScreenHandle>(null);

  React.useEffect(() => {
    if (!showQuestions) setCanGoBack(false);
  }, [showQuestions]);

  return (
    <ThemeBackground>
      {/* Background Glow */}
      

      {/* ✅ Centered ProfileCard */}
      <View style={styles.cardWrapper}>
        <ProfileCard
          email={email}
          isAdmin={isAdmin}
          isGuest={email === "Guest"}
          onLogout={handleLogout}
          onChangePwd={() => setShowPwdScreen(true)}
          onOpenQuestions={() => setShowQuestions(true)}
        />
      </View>

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={showPwdScreen}
        onClose={() => setShowPwdScreen(false)}
        currPwd={currPwd}
        setCurrPwd={setCurrPwd}
        newPwd={newPwd}
        setNewPwd={setNewPwd}
        confirmPwd={confirmPwd}
        setConfirmPwd={setConfirmPwd}
        showCurrPwd={showCurrPwd}
        setShowCurrPwd={setShowCurrPwd}
        showNewPwd={showNewPwd}
        setShowNewPwd={setShowNewPwd}
        showConfirmPwd={showConfirmPwd}
        setShowConfirmPwd={setShowConfirmPwd}
        saving={saving}
        onSubmit={handleChangePassword}
      />

      <Modal
        visible={showQuestions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQuestions(false)}
      >
        <KeyboardAvoidingView
          style={qStyles.modalKeyboard}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={qStyles.modalBackdrop}>
            <View style={qStyles.modalCard}>
              <View style={qStyles.modalHeader}>
                <Pressable onPress={() => questionRef.current?.goBack()} disabled={!canGoBack}>
                  <Text
                    style={[
                      qStyles.modalClose,
                      { paddingLeft: 5 },
                      !canGoBack && qStyles.modalCloseDisabled,
                    ]}
                  >
                    Back
                  </Text>
                </Pressable>
                <Text style={qStyles.modalTitle}>Quick Questions</Text>
                <Pressable onPress={() => setShowQuestions(false)}>
                  <Text style={qStyles.modalClose}>Close</Text>
                </Pressable>
              </View>
              <View style={qStyles.noticeWrap}>
                <Text style={qStyles.noticeText}>
                  IMPORTANT: These questions help you find the right resources. Your answers will
                  not be stored or shared. You can skip this step.
                </Text>
              </View>
              <View style={qStyles.modalContent}>
                {showQuestions ? (
                  <QuestionScreen
                    ref={questionRef}
                    onCanGoBackChange={setCanGoBack}
                    onComplete={(result) => {
                      setRecommendation(result);
                      setShowQuestions(false);
                      setShowRecommendationNotice(true);
                    }}
                  />
                ) : null}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showRecommendationNotice}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRecommendationNotice(false)}
      >
        <View style={qStyles.modalBackdrop}>
          <View style={qStyles.noticeCard}>
            <Text style={qStyles.noticeTitle}>Resources Updated</Text>
            <Text style={qStyles.noticeBody}>
              Your resources have been structured according to your answers. Please go to the Home
              tab to view them.
            </Text>
            <Pressable
              style={qStyles.noticeButton}
              onPress={() => setShowRecommendationNotice(false)}
            >
              <Text style={qStyles.noticeButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ThemeBackground>
  );
}

const qStyles = StyleSheet.create({
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
  noticeWrap: {
    padding: 10,
    alignItems: "center",
  },
  noticeText: {
    color: "#ba3131ff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  noticeCard: {
    width: "88%",
    maxWidth: 420,
    backgroundColor: "#0b3040",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#134b61",
    padding: 16,
    alignItems: "center",
  },
  noticeTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  noticeBody: {
    color: "#cbd5db",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 14,
  },
  noticeButton: {
    backgroundColor: "#22d3ee",
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  noticeButtonText: {
    color: "#02131a",
    fontWeight: "800",
    fontSize: 14,
  },
});
