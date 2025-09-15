import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Collection() {
  return (
    <View className="flex-1 bg-white">
      <View style={styles.container}>
        <Ionicons name="bookmark-outline" size={64} color="#9CA3AF" />
        <Text style={styles.title}>Collectie</Text>
        <Text style={styles.subtitle}>
          Je opgeslagen recepten verschijnen hier
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
});
