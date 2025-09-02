import { Button } from "@react-navigation/elements";
import { Text, View } from "react-native";



const ImportRecipe = ({ url, text }: { url?: string, text?: string }) => {
  return (
    <View
      className="flex gap-10 mb-20 border-1 rounded-5 h-102"
    >
      <View className="flex-shrink-1 p-5">
        {text && (
          <>
            <Text>TEXT:</Text>
            <Text className="mb-20">{text}</Text>
          </>
        )}
        {url && (
          <>
            <Text>URL:</Text>
            <Text className="mb-20">{url}</Text>
          </>
        )}
      </View>
      <View className="flex">
        <Button>Import</Button>
      </View>
    </View>
  );
};

export default ImportRecipe;