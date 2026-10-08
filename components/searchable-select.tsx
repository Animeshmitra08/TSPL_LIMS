import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { colors } from "@/constants/weightBalanceColors";

// A combobox: tap the field to open a picker, type in it to filter the
// option list, tap a result to select it, or just leave whatever was typed
// (the caller decides if free text is valid). The list opens in a Modal —
// rendered outside the page's own ScrollView — rather than as an inline
// absolutely-positioned dropdown, because a ScrollView nested inside
// another ScrollView generally won't scroll (or reliably register taps):
// the outer one wins the gesture. A Modal sidesteps that entirely.
export function SearchableSelect({
  label,
  value,
  onChangeValue,
  options,
  placeholder,
  rightAccessory,
  onOpen,
  isLoading,
  disabled,
}: {
  label: string;
  value: string;
  onChangeValue: (value: string) => void;
  options: string[];
  placeholder?: string;
  rightAccessory?: React.ReactNode;
  // Called the first time the field is opened — lets the caller lazy-load
  // options (e.g. fetch sample IDs from the API) instead of on every render.
  onOpen?: () => void;
  isLoading?: boolean;
  // Locks the field to its current value — the picker won't open and the
  // clear button is hidden, for fields whose value is fixed by the screen
  // rather than chosen by the operator (e.g. a screen locked to one Type).
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  // The search box's own text, separate from the committed `value` — typing
  // only narrows the list below (via .includes(), so it matches the typed
  // text anywhere in an option: start, middle, or end), and only tapping a
  // result actually calls onChangeValue. Previously the search TextInput
  // called onChangeValue directly on every keystroke, which committed
  // whatever partial text was typed as the real selected value immediately
  // — e.g. typing "26F" into the Sample ID field set sampleId to "26F" on
  // the very first keystroke, firing every side effect tied to a real
  // Sample ID change (recorded-weights lookup, Dish Number reset, ...)
  // before the operator had picked anything.
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? options.filter((option) => option.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  const openPicker = () => {
    if (disabled) return;
    setQuery("");
    setIsOpen(true);
    onOpen?.();
  };

  const handlePick = (item: string) => {
    onChangeValue(item);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <Pressable style={[styles.input, disabled && styles.inputDisabled]} onPress={openPicker} disabled={disabled}>
          <Text
            style={[
              value ? styles.inputValueText : styles.inputPlaceholderText,
              disabled && styles.inputTextDisabled,
            ]}
            numberOfLines={1}
          >
            {value || placeholder || "Select"}
          </Text>
        </Pressable>
        {!disabled && value.length > 0 && (
          <Pressable style={styles.clearButton} onPress={() => onChangeValue("")} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        )}
        {rightAccessory}
      </View>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <Pressable onPress={() => setIsOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder={placeholder}
              placeholderTextColor={colors.textMuted}
              autoFocus
            />

            {isLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : filtered.length === 0 ? (
              <Text style={styles.emptyText}>No matches</Text>
            ) : (
              <ScrollView style={styles.optionList} keyboardShouldPersistTaps="handled">
                {filtered.map((item) => (
                  <Pressable
                    key={item}
                    style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                    onPress={() => handlePick(item)}
                  >
                    <Text style={styles.optionText}>{item}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.surface,
  },
  inputValueText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  inputPlaceholderText: {
    fontSize: 15,
    color: colors.textMuted,
  },
  inputDisabled: {
    backgroundColor: colors.borderSoft,
  },
  inputTextDisabled: {
    color: colors.textMuted,
  },
  clearButton: {
    padding: 4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 24,
  },
  sheet: {
    maxHeight: "70%",
    borderRadius: 20,
    padding: 18,
    gap: 12,
    backgroundColor: colors.surface,
    elevation: 8,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  searchInput: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    paddingVertical: 14,
    textAlign: "center",
  },
  // flex: 1 is what actually bounds this to the sheet's remaining space —
  // without it, the ScrollView sizes to its own content regardless of the
  // sheet's maxHeight and never becomes internally scrollable.
  optionList: {
    flexGrow: 1,
    flexShrink: 1,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 13,
    borderRadius: 10,
  },
  optionPressed: {
    backgroundColor: colors.primaryLight,
  },
  optionText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
});
