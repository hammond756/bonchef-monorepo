import type { RecipeDetail } from "@repo/lib/services/recipes"
import { Image, Pressable, Text, View } from "react-native"
interface RecipeActionButtonsProps {
    recipe: RecipeDetail
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
}: Readonly<RecipeActionButtonsProps>) {
    const iconSize = 45
    const buttonSize = iconSize * 1.5
    const textColor = theme === "dark" ? "text-white" : "text-gray-900"

    return (
        <View className="flex items-center justify-start gap-2">
            {/* Profile Button */}
            {recipe.profiles && (
                <Pressable
                    onPress={() => {}}
                    className="flex items-center justify-center rounded-full"
                    style={{ width: buttonSize, height: buttonSize }}
                >
                    {recipe.profiles.avatar ? (
                        <Image 
                            source={{ uri: recipe.profiles.avatar }}
                            className="rounded-full object-cover"
                            style={{ width: iconSize, height: iconSize}}
                        />
                    ) : (
                        <View className="flex items-center justify-center rounded-full bg-black/50" style={{ width: iconSize, height: iconSize }}>
                            <Text className={`text-lg font-bold ${textColor} text-center`}>
                                {recipe.profiles.display_name?.charAt(0) || "?"}
                            </Text>
                        </View>
                    )}
                </Pressable>
            )}
        </View>
    )
}
