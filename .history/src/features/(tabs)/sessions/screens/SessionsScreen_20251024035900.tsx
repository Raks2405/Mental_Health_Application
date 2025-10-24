import React from "react";
import { View, Alert } from "react-native";
import { FAB, Provider } from "react-native-paper";
import ThemeBackground from "@/src/shared/ThemeBackground"; // keep your current ThemeBackground path
import { useSessions } from "../hooks/useSessions";
import SessionListContent from "../components/SessionListContent";
import GuestLockScreen from "../components/GuestLockScreen";
import SessionModalAdmin from "../components/SessionModalAdmin";

export default function SessionsScreen() {
    const {
        user,
        // state
        addSessions, setAddSessions,
        title, setTitle,
        description, setDescription,
        date, setDate,
        time, setTime,
        location, setLocation,
        sessionLists,
        selectedSession, setSelectedSession,
        isLoading,
        isEditing, setIsEditing,
        seenIds, markSeen,
        // logic
        handlePublish,
        handleRePublish,
        handleEditButton,
        handleDeleteButton,
        isFuture,
        publishReset,
    } = useSessions();

    if (user?.email === "Guest") {
        return (
            <ThemeBackground>
                <GuestLockScreen />
            </ThemeBackground>
        );
    }

    return (
        <ThemeBackground>
            <View style={{ flex: 1 }}>
                <SessionListContent
                    sessionLists={sessionLists}
                    isLoading={isLoading}
                    selectedSession={selectedSession}
                    setSelectedSession={setSelectedSession}
                    seenIds={seenIds}
                    markSeen={markSeen}
                    isFuture={isFuture}
                    userEmail={user?.email ?? ""}
                    handleEditButton={(s) => {
                        // identical behavior: from detail modal, go to edit modal
                        handleEditButton(s);
                        // close detail modal here so only one modal is open
                        setSelectedSession(null);
                    }}
                    handleDeleteButton={handleDeleteButton}
                />

                {user?.email === "Admin" && (
                    <Provider>
                        <FAB
                            icon="plus"
                            style={{
                                position: "absolute",
                                alignSelf: "flex-end",
                                bottom: 30,
                                right: 20,
                                backgroundColor: "#041a21ff",
                            }}
                            onPress={() => {
                                setIsEditing(false);
                                setSelectedSession(null);
                                publishReset();
                                setAddSessions(true);
                            }}
                        />

                        <SessionModalAdmin
                            visible={addSessions}
                            onClose={() => setAddSessions(false)}
                            isEditing={isEditing}
                            title={title}
                            setTitle={setTitle}
                            description={description}
                            setDescription={setDescription}
                            date={date}
                            setDate={setDate}
                            time={time}
                            setTime={setTime}
                            location={location}
                            setLocation={setLocation}
                            onPublish={handlePublish}
                            onRePublish={handleRePublish}
                            onCancel={() => {
                                if (isEditing) {
                                    Alert.alert(
                                        "Cancel Editing",
                                        "Are you sure you want to discard your changes?",
                                        [
                                            { text: "No", style: "cancel" },
                                            {
                                                text: "Yes",
                                                style: "destructive",
                                                onPress: () => {
                                                    setIsEditing(false);
                                                    setSelectedSession(null);
                                                    publishReset();
                                                    setAddSessions(false);
                                                },
                                            },
                                        ]
                                    );
                                } else {
                                    Alert.alert(
                                        "Discard Session",
                                        "Changes will be lost. Are you sure you want to discard?",
                                        [
                                            {
                                                text: "Yes",
                                                style: "destructive",
                                                onPress: () => {
                                                    publishReset();
                                                    setAddSessions(false);
                                                },
                                            },
                                            {
                                                text: "No",
                                                style: "cancel",
                                                
                                            },
                                        ]
                                    );
                                }
                            }}
                        />
                    </Provider>
                )}
            </View>
        </ThemeBackground>
    );
}
