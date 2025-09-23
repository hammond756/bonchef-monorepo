import type { RecipeRead } from "@repo/lib/services/recipes"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Alert, Pressable, Text, TouchableOpacity, View } from "react-native"
import { RecipeActionButtons } from "./recipe-action-buttons"
import { RecipeCardBackground } from "./recipe-card-background"
import { RecipeSourceDisplay } from "./recipe-source-display"


interface RecipeFeedCardProps {
    recipe: RecipeRead
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

    const handleCommentClick = () => {
        Alert.alert("Comments", `Open comments for: ${recipe.title}`)
    }

    return (
        <View className="w-full px-4 mb-4">
            <View className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gray-200">
                <Pressable onPress={handleRecipePress} className="flex-1">
                    <RecipeCardBackground recipe={recipe} className="flex-1">
                        {/* Content Overlay */}
                        <View className="absolute right-0 bottom-0 left-0 p-4 pr-20">
                            {/* Description */}
                            <Pressable
                                onPress={handleToggleExpand}
                                className="mb-2"
                                disabled={!isLongCaption}
                            >
                                {isExpanded ? (
                                    <View>
                                        <Text className="text-xs text-white leading-4">
                                            {caption}
                                        </Text>
                                        <TouchableOpacity onPress={() => setIsExpanded(false)}>
                                            <Text className="text-xs font-semibold text-gray-300 mt-1">
                                                minder
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View className="relative">
                                        <Text 
                                            className="text-xs text-white leading-4"
                                            numberOfLines={2}
                                        >
                                            {caption}
                                        </Text>
                                        {isLongCaption && (
                                            <View className="absolute right-0 top-0 h-full w-12 items-end justify-end">
                                                <Text className="text-xs font-semibold text-gray-300">
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

                        {/* Action Buttons */}
                        <View className="absolute right-4 bottom-4">
                            <RecipeActionButtons
                                recipe={recipe}
                                theme="dark"
                                size="md"
                                onCommentClick={handleCommentClick}
                            />
                        </View>
                    </RecipeCardBackground>
                </Pressable>
            </View>
        </View>
    )
}
