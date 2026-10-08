import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from "react-native";

const FRAME_SIZE = 260;
const CORNER_SIZE = 32;
const CORNER_THICKNESS = 4;

export function QrScannerModal({
  visible,
  onClose,
  onScanned,
}: {
  visible: boolean;
  onClose: () => void;
  onScanned: (data: string) => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);
  const scanLineY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    setHasScanned(false);

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineY, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineY, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [visible, scanLineY]);

  if (!visible) return null;

  const translateY = scanLineY.interpolate({
    inputRange: [0, 1],
    outputRange: [-FRAME_SIZE / 2 + 10, FRAME_SIZE / 2 - 10],
  });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {!permission ? null : !permission.granted ? (
          <View style={styles.center}>
            <Ionicons name="camera-outline" size={48} color="#fff" />
            <Text style={styles.message}>Camera access is needed to scan the sample QR code.</Text>
            <Pressable style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Grant permission</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={
                hasScanned
                  ? undefined
                  : (result) => {
                      setHasScanned(true);
                      onScanned(result.data);
                    }
              }
            />

            {/* Dimmed mask with a transparent square cut out in the middle. */}
            <View style={styles.maskRow} />
            <View style={styles.maskMiddleRow}>
              <View style={styles.maskSide} />
              <View style={styles.frame}>
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
                <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
              </View>
              <View style={styles.maskSide} />
            </View>
            <View style={styles.maskRow} />

            <Text style={styles.instructions}>Align the QR code within the frame</Text>
          </>
        )}

        <Pressable style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={22} color="#fff" />
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  message: {
    color: "#fff",
    textAlign: "center",
    fontSize: 15,
  },
  permissionButton: {
    backgroundColor: "#0063a8",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  maskRow: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  maskMiddleRow: {
    flexDirection: "row",
    height: FRAME_SIZE,
  },
  maskSide: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    overflow: "hidden",
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: "#00e0a8",
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopWidth: CORNER_THICKNESS,
    borderTopLeftRadius: 12,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderRightWidth: CORNER_THICKNESS,
    borderTopWidth: CORNER_THICKNESS,
    borderTopRightRadius: 12,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: 12,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomWidth: CORNER_THICKNESS,
    borderBottomRightRadius: 12,
  },
  scanLine: {
    position: "absolute",
    left: 8,
    right: 8,
    top: "50%",
    height: 2,
    backgroundColor: "#00e0a8",
    shadowColor: "#00e0a8",
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  instructions: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    padding: 8,
  },
});
