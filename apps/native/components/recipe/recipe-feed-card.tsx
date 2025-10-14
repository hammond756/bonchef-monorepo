import type { RecipeDetail } from "@repo/lib/services/recipes"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Pressable, Text, TouchableOpacity, View } from "react-native"
import { RecipeActionButtons } from "./recipe-action-buttons"
import { RecipeCardBackground } from "./recipe-card-background"
import { RecipeSourceDisplay } from "./recipe-source-display"


interface RecipeFeedCardProps {
    recipe: RecipeDetail
}


/**
 * Recipe feed card component displaying recipe image, title, description, and action buttons
 * Ported from web version with native-specific styling and interactions
 */
export function RecipeFeedCard({ recipe }: Readonly<RecipeFeedCardProps>) {
    const [isExpanded, setIsExpanded] = useState(false)
    const router = useRouter()

    const caption = recipe.description || ""
    const isLongCaption = caption.length > 80

    const handleRecipePress = () => {
        router.push(`/recipe/${recipe.id}`)
    }

    const handleToggleExpand = () => {
        if (isLongCaption) {
            setIsExpanded(!isExpanded)
        }
    }

    return (
        <View className="w-full px-4 mb-4">
            <View className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gray-200">
                <Pressable onPress={handleRecipePress} className="flex-1">
                    <RecipeCardBackground recipe={recipe} className="flex-1">
                        {/* Main Content Container */}
                        <View className="flex-1 justify-end">
                            {/* Content Row */}
                            <View className="flex-row p-4">
                                {/* Left Content */}
                                <View className="flex-1 pr-4">
                                    {/* Description */}
                                    <Pressable
                                        onPress={handleToggleExpand}
                                        className="mb-2"
                                        disabled={!isLongCaption}
                                    >
                                        {isExpanded ? (
                                            <View>
                                                <Text className="text-sm text-white leading-4">
                                                    {caption}
                                                </Text>
                                                <TouchableOpacity onPress={() => setIsExpanded(false)}>
                                                    <Text className="text-xs font-semibold text-gray-300 mt-1">
                                                        minder
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <View className="flex-row">
                                                <View className="flex-1">
                                                    <Text 
                                                        className="text-sm text-white leading-4"
                                                        numberOfLines={2}
                                                    >
                                                        {caption}
                                                    </Text>
                                                </View>
                                                {isLongCaption && (
                                                    <View className="ml-2 justify-end">
                                                        <Text className="text-sm font-semibold text-gray-300">
                                                            ... meer
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        )}
                                    </Pressable>

                                    {/* Recipe Title */}
                                    <Text 
                                        className="text-2xl font-bold text-white leading-tight font-serif"
                                        numberOfLines={2}
                                    >
                                        {recipe.title}
                                    </Text>

                                    {/* Source */}
                                    <View className="mt-1">
                                        <RecipeSourceDisplay recipe={recipe} />
                                    </View>
                                </View>

                                {/* Right Action Buttons */}
                                <View className="justify-end">
                                    <RecipeActionButtons
                                        recipe={recipe}
                                        theme="dark"
                                        size="md"
                                    />
                                </View>
                            </View>
                        </View>
                    </RecipeCardBackground>
                </Pressable>
            </View>
        </View>
    )
}
