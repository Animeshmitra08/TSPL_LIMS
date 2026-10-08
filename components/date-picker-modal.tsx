import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/weightBalanceColors";

// Two letters each so Tue/Thu and Sun/Sat aren't both rendered as the same
// ambiguous single "T"/"S".
const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function DatePickerModal({
  visible,
  selectedDate,
  onClose,
  onSelect,
}: {
  visible: boolean;
  selectedDate: Date | null;
  onClose: () => void;
  onSelect: (date: Date) => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState((selectedDate ?? today).getFullYear());
  const [viewMonth, setViewMonth] = useState((selectedDate ?? today).getMonth());

  // Re-center on the current selection (or today, if nothing is selected
  // yet) every time it's opened, rather than wherever the month grid was
  // last left scrolled to.
  useEffect(() => {
    if (visible) {
      const base = selectedDate ?? today;
      setViewYear(base.getFullYear());
      setViewMonth(base.getMonth());
    }
  }, [visible, selectedDate]);

  const isCurrentMonthView = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  // Can't go past the current month — every day beyond it is disabled anyway.
  const goToNextMonth = () => {
    if (isCurrentMonthView) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const totalDays = daysInMonth(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  const isSelected = (day: number) =>
    selectedDate !== null &&
    viewYear === selectedDate.getFullYear() &&
    viewMonth === selectedDate.getMonth() &&
    day === selectedDate.getDate();

  const isFutureDay = (day: number) => new Date(viewYear, viewMonth, day).getTime() > new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Pressable style={styles.navButton} onPress={goToPrevMonth} hitSlop={8}>
              <Ionicons name="chevron-back" size={20} color={colors.primary} />
            </Pressable>
            <Text style={styles.headerText}>
              {MONTH_LABELS[viewMonth]} {viewYear}
            </Text>
            <Pressable style={styles.navButton} onPress={goToNextMonth} disabled={isCurrentMonthView} hitSlop={8}>
              <Ionicons name="chevron-forward" size={20} color={isCurrentMonthView ? colors.textMuted : colors.primary} />
            </Pressable>
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((label, index) => (
              <Text key={index} style={styles.weekdayLabel}>
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((day, index) => {
              if (day === null) {
                return <View key={index} style={styles.cell} />;
              }
              const disabled = isFutureDay(day);
              return (
                <View key={index} style={styles.cell}>
                  <Pressable
                    style={[styles.dayButton, isSelected(day) && styles.dayButtonSelected]}
                    disabled={disabled}
                    onPress={() => onSelect(new Date(viewYear, viewMonth, day))}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        disabled && styles.dayTextDisabled,
                        isSelected(day) && styles.dayTextSelected,
                      ]}
                    >
                      {day}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const CELL_SIZE = 40;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    // 7 columns of CELL_SIZE plus 20px padding on each side (below) — the
    // previous "+ 32" undercounted that padding by 8px, so the grid's last
    // column (Saturday's label and every date under it) overflowed past the
    // card's edge and got clipped, throwing off the whole week's alignment.
    width: CELL_SIZE * 7 + 40,
    borderRadius: 24,
    padding: 20,
    backgroundColor: colors.surface,
    elevation: 8,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  navButton: {
    padding: 4,
  },
  headerText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  weekdayRow: {
    flexDirection: "row",
  },
  weekdayLabel: {
    width: CELL_SIZE,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  dayButton: {
    width: CELL_SIZE - 6,
    height: CELL_SIZE - 6,
    borderRadius: (CELL_SIZE - 6) / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  dayButtonSelected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  dayTextDisabled: {
    color: colors.textMuted,
    opacity: 0.5,
  },
  dayTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },
});
