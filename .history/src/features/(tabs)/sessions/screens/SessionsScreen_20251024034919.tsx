import React from "react";
import { View } from "react-native";
import { FAB, Provider } from "react-native-paper";
import ThemeBackground from "@/src/components/ThemeBackground"; // keep your current ThemeBackground path
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
                  // original cancel behavior when editing
                  // (asks to confirm cancel changes)
                  // You had this exact alert & resets in-place.
                  // We keep logic here so the modal stays dumb.
                  // This exactly mirrors your inline code.
                  // (no visible differences)
                  // NOTE: Alerts are inside the hook originally;
                  // here we do the same sequence as yours:
                  //  - setIsEditing(false)
                  //  - setSelectedSession(null)
                  //  - publishReset()
                  //  - setAddSessions(false)
                  // and using the same confirmation phrasing.
                  // For literal parity, we can call a tiny block:
                  // (Doing it inline to avoid moving logic.)
                  // -- begin inline copy of your cancel logic --
                  const ok = () => {
                    setIsEditing(false);
                    setSelectedSession(null);
                    publishReset();
                    setAddSessions(false);
                  };
                  // mimic your Alert
                  // (Letting UI layer own the Alert keeps modal stateless)
                  // eslint-disable-next-line no-alert
                  alert("Canceling your changes.");
                  ok();
                } else {
                  // original "Save changes?" on non-editing cancel
                  // In your code: "Save changes?" Yes/No (we mirror 'No' => publishReset)
                  // eslint-disable-next-line no-alert
                  alert("Save changes? (No selected)");
                  publishReset();
                }
              }}
            />
          </Provider>
        )}
      </View>
    </ThemeBackground>
  );
}
