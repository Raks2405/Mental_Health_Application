import React from "react";
import { View } from "react-native";
import { FAB, Provider } from "react-native-paper";
import ThemeBackground from "@/src/shared/ThemeBackground";
import { useSessions } from "../hooks/useSessions";
import SessionListContent from "../components/SessionListContent";
import GuestLockScreen from "../components/GuestLockScreen";
import SessionModalAdmin from "../components/SessionModalAdmin"; // from your modal
import { styles } from "../styles/sessions.styles";

export default function SessionsScreen() {
    const {
        user,
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
        handlePublish, handleRePublish,
        handleEditButton, handleDeleteButton,
        isFuture,
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
                />

                {user?.email === "Admin" && (
                    <Provider>
                        <FAB
                            icon="plus"
                            style={{ position: "absolute", alignSelf: "flex-end", bottom: 30, right: 20, backgroundColor: "#041a21ff" }}
                            onPress={() => {
                                setIsEditing(false);
                                setSelectedSession(null);
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
                        />
                    </Provider>
                )}
            </View>
        </ThemeBackground>
    );
}
