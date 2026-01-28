import React from "react";
import { View } from "react-native";
import ThemeBackground from "../../../../shared/ThemeBackground";
import ChangePasswordModal from "../components/ChangePasswordModal";
import ProfileCard from "../components/ProfileCard";
import { useProfile } from "../hooks/useProfile";
import { styles } from "../styles/profile.styles";

export default function ProfileScreen() {
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
    </ThemeBackground>
  );
}
