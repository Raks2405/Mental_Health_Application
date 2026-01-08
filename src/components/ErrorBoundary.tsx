import React, { Component, ErrorInfo, ReactNode } from "react";
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error);
    console.error("Error info:", errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReportIssue = () => {
    const subject = encodeURIComponent("App Crash Report");
    const body = encodeURIComponent(
      `Error: ${this.state.error?.message}\n\nStack: ${this.state.error?.stack}`
    );
    Linking.openURL(`mailto:support@example.com?subject=${subject}&body=${body}`);
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.errorCard}>
            <Text style={styles.title}>⚠️ App Error</Text>
            <Text style={styles.message}>
              Something went wrong. We're working on fixing this issue.
            </Text>
            
            {this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorLabel}>Error Details:</Text>
                <Text style={styles.errorText} numberOfLines={3}>
                  {this.state.error.message}
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <Pressable
                style={styles.reloadButton}
                onPress={this.handleReload}
                android_ripple={{ color: "rgba(255,255,255,0.2)" }}
              >
                <Text style={styles.reloadButtonText}>Try Again</Text>
              </Pressable>
              
              <Pressable
                style={styles.reportButton}
                onPress={this.handleReportIssue}
                android_ripple={{ color: "rgba(255,255,255,0.1)" }}
              >
                <Text style={styles.reportButtonText}>Report Issue</Text>
              </Pressable>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#001a25",
  },
  errorCard: {
    backgroundColor: "#00253a",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#004060",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ff6b6b",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
  },
  errorDetails: {
    backgroundColor: "#001220",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    marginBottom: 16,
  },
  errorLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    fontFamily: Platform.OS === "ios" ? "monospace" : "monospace",
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  reloadButton: {
    flex: 1,
    backgroundColor: "#22d3ee",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  reloadButtonText: {
    color: "#001a25",
    fontWeight: "700",
    fontSize: 16,
  },
  reportButton: {
    flex: 1,
    backgroundColor: "transparent",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#475569",
  },
  reportButtonText: {
    color: "#94a3b8",
    fontWeight: "600",
    fontSize: 16,
  },
});

