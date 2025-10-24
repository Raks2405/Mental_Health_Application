import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import ThemeBackground from "../../../../shared/ThemeBackground";
import ProfileCard from "../components/ProfileCard";
import ChangePasswordModal from "../components/ChangePasswordModal";
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
      <LinearGradient
        colors={["rgba(255,255,255,0.36)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 0.2 }}
        style={styles.bgGlow}
      />

      <ProfileCard
        email={email}
        isAdmin={isAdmin}
        isGuest={email === "Guest"}
        onLogout={handleLogout}
        onChangePwd={() => setShowPwdScreen(true)}
      />

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
