import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/weightBalanceColors";

// A segmented control — reads as a set of exclusive choices (radio
// semantics) but looks like a modern pill toggle instead of circular radios.
export function RadioGroup({
  label,
  value,
  onChangeValue,
  options,
  getLabel,
}: {
  label: string;
  value: string;
  onChangeValue: (value: string) => void;
  options: string[];
  // Formats what's shown on each pill without changing the underlying
  // option value passed to onChangeValue/compared against value — e.g.
  // stripping underscores for display while matching/state still use the
  // raw machine name. Defaults to showing the option as-is.
  getLabel?: (option: string) => string;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track}>
        {options.map((option) => {
          const selected = option === value;
          return (
            <Pressable
              key={option}
              style={[styles.pill, selected && styles.pillSelected]}
              onPress={() => onChangeValue(option)}
            >
              <Text style={[styles.pillText, selected && styles.pillTextSelected]} numberOfLines={1}>
                {getLabel ? getLabel(option) : option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  // flexWrap lets this grow past a couple of options (e.g. a dynamically
  // loaded machine list) without squeezing every pill down to fit one row.
  track: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    padding: 4,
    backgroundColor: colors.borderSoft,
    borderRadius: 14,
  },
  // flexGrow+flexBasis (not flex:1) so pills size to roughly a third of the
  // row and wrap onto new lines as more options are added, rather than all
  // of them shrinking to fit a single row regardless of how many there are.
  pill: {
    flexGrow: 1,
    flexBasis: "28%",
    minWidth: 80,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  pillSelected: {
    backgroundColor: colors.primary,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  pillText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  pillTextSelected: {
    color: "#fff",
  },
});
