import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/weightBalanceColors";

export type SubmissionDetail = { label: string; value: string };

export type SubmissionResult = {
  status: "success" | "error";
  title: string;
  message: string;
  details?: SubmissionDetail[];
  reference?: string;
};

// Order-confirmation-style receipt shown after a submit attempt — replaces
// the bare Alert.alert("Submitted"/"Submit failed") with a card that
// actually shows what was sent (Sample ID, Type, Parameter, weights, ...),
// so the operator can visually confirm it before moving on.
export function SubmissionResultModal({
  result,
  onClose,
}: {
  result: SubmissionResult | null;
  onClose: () => void;
}) {
  const visible = result !== null;
  const iconScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    iconScale.setValue(0);
    Animated.spring(iconScale, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
      delay: 80,
    }).start();
  }, [visible, iconScale]);

  if (!result) return null;

  const isSuccess = result.status === "success";
  const accent = isSuccess ? colors.success : colors.danger;
  const accentSoft = isSuccess ? colors.successSoft : "#fee2e2";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.iconRing, { backgroundColor: accentSoft }]}>
            <Animated.View style={{ transform: [{ scale: iconScale }] }}>
              <Ionicons
                name={isSuccess ? "checkmark-circle" : "close-circle"}
                size={56}
                color={accent}
              />
            </Animated.View>
          </View>

          <Text style={styles.title}>{result.title}</Text>
          <Text style={styles.message}>{result.message}</Text>

          {result.details && result.details.length > 0 && (
            <View style={styles.detailsCard}>
              {result.details.map((row, index) => (
                <View
                  key={row.label}
                  style={[styles.detailRow, index === 0 && styles.detailRowFirst]}
                >
                  <Text style={styles.detailLabel} numberOfLines={1}>
                    {row.label}
                  </Text>
                  <Text style={styles.detailValue} numberOfLines={1}>
                    {row.value}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {result.reference && (
            <View style={[styles.referencePill, { backgroundColor: accentSoft }]}>
              <Ionicons
                name={isSuccess ? "time-outline" : "alert-circle-outline"}
                size={14}
                color={accent}
              />
              <Text style={[styles.referenceText, { color: accent }]} numberOfLines={1}>
                {result.reference}
              </Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: accent },
              pressed && styles.closeButtonPressed,
            ]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>{isSuccess ? "Done" : "Close"}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 28,
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: colors.surface,
    alignItems: "center",
    elevation: 10,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
  },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.textPrimary,
    textAlign: "center",
  },
  message: {
    marginTop: 6,
    fontSize: 13.5,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 19,
  },
  detailsCard: {
    width: "100%",
    marginTop: 18,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: "hidden",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  detailRowFirst: {
    borderTopWidth: 0,
  },
  detailLabel: {
    fontSize: 12.5,
    fontWeight: "600",
    color: colors.textMuted,
    flexShrink: 0,
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "right",
  },
  referencePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  referenceText: {
    fontSize: 12,
    fontWeight: "700",
  },
  closeButton: {
    width: "100%",
    marginTop: 20,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  closeButtonPressed: {
    opacity: 0.85,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
