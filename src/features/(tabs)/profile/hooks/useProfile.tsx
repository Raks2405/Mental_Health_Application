import { useUser } from "@/src/UserContext";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { auth } from "../../../../firebase";
import { logOut } from "../../../../auth";
import { adminEmails } from "@/src/features/auth/screens/LoginScreen";
import { router, useFocusEffect } from "expo-router";

export function useProfile() {
  const { user } = useUser();
  const [email, setEmail] = useState<string>("Guest");
  const [showPwdScreen, setShowPwdScreen] = useState(false);

  const [currPwd, setCurrPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [saving, setSaving] = useState(false);

  const [showCurrPwd, setShowCurrPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const u = auth.currentUser;
      if (!u || u.isAnonymous) setEmail("Guest");
      else setEmail(u.email ?? "Guest");
    }, [])
  );

  const isAdmin = adminEmails.includes(email);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel" },
      {
        text: "OK",
        onPress: async () => {
          try {
            await logOut();
            router.replace({ pathname: "/goodbye" });
          } catch {
            Alert.alert("Error", "An error occurred while logging out.");
          }
        },
      },
    ]);
  };

  const handleChangePassword = async () => {
    if (!currPwd || !newPwd || !confirmPwd)
      return Alert.alert("Error", "All fields are required");
    if (newPwd.length < 6)
      return Alert.alert("Error", "New password must be at least 6 characters");
    if (newPwd !== confirmPwd)
      return Alert.alert("Error", "Passwords do not match");

    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      Alert.alert("Error", "No authenticated user");
      return;
    }

    try {
      setSaving(true);
      const cred = EmailAuthProvider.credential(currentUser.email, currPwd);
      await reauthenticateWithCredential(currentUser, cred);
      await updatePassword(currentUser, newPwd);
      setShowPwdScreen(false);
      setCurrPwd(""); setNewPwd(""); setConfirmPwd("");
      Alert.alert("Success", "Password changed");
    } catch {
      Alert.alert("Failed", "Check your current password and try again.");
    } finally {
      setSaving(false);
    }
  };

  return {
    email,
    isAdmin,
    showPwdScreen,
    setShowPwdScreen,
    handleLogout,

    currPwd, setCurrPwd,
    newPwd, setNewPwd,
    confirmPwd, setConfirmPwd,

    saving,

    showCurrPwd, setShowCurrPwd,
    showNewPwd, setShowNewPwd,
    showConfirmPwd, setShowConfirmPwd,

    handleChangePassword,
  };
}
