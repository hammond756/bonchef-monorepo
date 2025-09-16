import { useState } from "react"
import { View, Text, TouchableOpacity, Image, Alert } from "react-native"
import { useRouter } from "expo-router"
import { RecipeRead } from "@repo/lib"
import { RecipeActionButtons } from "./recipe-action-buttons"
import { RecipeSourceDisplay } from "./recipe-source-display"
import { LinearGradient } from "expo-linear-gradient"


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
                {/* Recipe Image */}
                <TouchableOpacity onPress={handleRecipePress} className="flex-1">
                    <Image
                        source={{ 
                            uri: recipe.thumbnail || "https://placekitten.com/900/1200" 
                        }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                    
                    {/* Gradient Overlay */}
                    <LinearGradient
                        // Background Linear Gradient
                        colors={['transparent', 'rgba(0,0,0,0.5)']}
                        style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: "100%"}}
                    />
                </TouchableOpacity>

                {/* Content Overlay */}
                <View className="absolute right-0 bottom-0 left-0 p-4 pr-20">
                    {/* Description */}
                    <TouchableOpacity
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
                    </TouchableOpacity>

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
            </View>
        </View>
    )
}
