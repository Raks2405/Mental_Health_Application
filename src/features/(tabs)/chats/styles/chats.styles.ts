import { StyleSheet } from "react-native";

export const chatStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  title: {
    color: "#e0f2fe",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  subtitle: {
    color: "rgba(224,242,254,0.8)",
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
  },
  error: {
    marginTop: 10,
    color: "#fecdd3",
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 4,
  },
  empty: {
    marginTop: 40,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  emptyTitle: {
    color: "#e0f2fe",
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 6,
  },
  emptyText: {
    color: "rgba(224,242,254,0.7)",
    fontSize: 14,
    lineHeight: 20,
  },
  bubble: {
    maxWidth: "86%",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  bubbleUser: {
    alignSelf: "flex-end",
    backgroundColor: "#0ea5e9",
    marginLeft: "14%",
  },
  bubbleAssistant: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.28)",
    marginRight: "14%",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
  },
  bubbleLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  bubbleText: {
    color: "#f8fafc",
    fontSize: 15,
    lineHeight: 21,
  },
  timestamp: {
    marginTop: 8,
    color: "rgba(248,250,252,0.6)",
    fontSize: 11,
    fontWeight: "700",
  },
  thinking: {
    fontStyle: "italic",
    color: "rgba(248,250,252,0.8)",
  },
});
