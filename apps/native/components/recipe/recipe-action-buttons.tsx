import type { RecipeRead } from "@repo/lib/services/recipes"
import { Alert, Image, Text, TouchableOpacity, View } from "react-native"
interface RecipeActionButtonsProps {
    recipe: RecipeRead
    theme?: "light" | "dark"
    size?: "md" | "lg"
}

/**
 * Action buttons for recipe interactions
 * Includes share, like, comment, bookmark, and profile buttons
 */
export function RecipeActionButtons({ 
    recipe, 
    theme = "dark", 
    size = "lg",
}: Readonly<RecipeActionButtonsProps>) {
    const iconSize = size === "lg" ? 24 : 20
    const buttonSize = size === "lg" ? 48 : 40
    const textColor = theme === "dark" ? "text-white" : "text-gray-900"

    const handleProfile = () => {
        Alert.alert("Profile", `View profile: ${recipe.profiles?.display_name || "Unknown"}`)
    }

    return (
        <View className="flex items-center justify-start gap-2">
            {/* Profile Button */}
            {recipe.profiles && (
                <TouchableOpacity
                    onPress={handleProfile}
                    className="flex items-center justify-center rounded-full"
                    style={{ width: buttonSize, height: buttonSize }}
                >
                    {recipe.profiles.avatar ? (
                        <Image 
                            source={{ uri: recipe.profiles.avatar }}
                            style={{ width: iconSize, height: iconSize, borderRadius: iconSize / 2 }}
                        />
                    ) : (
                        <View className="flex items-center justify-center rounded-full bg-black/50" style={{ width: iconSize * 2, height: iconSize * 2 }}>
                            <Text className={`text-lg font-bold ${textColor} text-center`}>
                                {recipe.profiles.display_name?.charAt(0) || "?"}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            )}
        </View>
    )
}
