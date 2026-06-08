import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS } from "../constants/colours";

export default function StarRating({
  rating = 0,
  onRatingChange,
  size = 32,
  editable = true,
}) {
  const stars = [1, 2, 3, 4, 5];

  const handlePress = (value) => {
    if (editable && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <View style={styles.row}>
      {stars.map((n) => {
        const filled = n <= rating;
        const Star = (
          <Text
            style={[
              styles.star,
              { fontSize: size, color: filled ? COLORS.primary : "#D1D5DB" },
            ]}
          >
            ★
          </Text>
        );

        if (editable) {
          return (
            <TouchableOpacity
              key={n}
              onPress={() => handlePress(n)}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              {Star}
            </TouchableOpacity>
          );
        }

        return (
          <View key={n}>
            {Star}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  star: {
    fontWeight: "900",
  },
});
