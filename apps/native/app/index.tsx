import LoginForm from "@/components/login-form";
import { useSession } from "@/hooks/use-session";
import { useRouter } from "expo-router";
import { useShareIntentContext } from "expo-share-intent";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Home() {
  const router = useRouter();

  const { hasShareIntent } = useShareIntentContext();
  const { session, isLoading } = useSession();

  useEffect(() => {
    if (hasShareIntent) {
      // we want to handle share intent event in a specific page
      console.debug("[expo-router-index] redirect to ShareIntent screen");
      router.replace({
        pathname: "/share-intent",
      });
    }
  }, [hasShareIntent]);

  return (
    <View style={styles.container}>
      <LoginForm />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    padding: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
});