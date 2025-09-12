import { View, TouchableOpacity, Text, Alert, Image } from "react-native"
import { Recipe } from "../../lib/types"
import { Ionicons } from "@expo/vector-icons"

interface RecipeActionButtonsProps {
    recipe: Recipe
    theme?: "light" | "dark"
    size?: "md" | "lg"
    onCommentClick?: () => void
}

/**
 * Action buttons for recipe interactions
 * Includes share, like, comment, bookmark, and profile buttons
 */
export function RecipeActionButtons({ 
    recipe, 
    theme = "dark", 
    size = "lg",
    onCommentClick 
}: Readonly<RecipeActionButtonsProps>) {
    const iconSize = size === "lg" ? 24 : 20
    const buttonSize = size === "lg" ? 48 : 40
    const textColor = theme === "dark" ? "text-white" : "text-gray-900"
    const iconColor = theme === "dark" ? "#ffffff" : "#000000"

    const handleShare = () => {
        Alert.alert("Share", `Share recipe: ${recipe.title}`)
    }

    const handleLike = () => {
        Alert.alert("Like", `Like recipe: ${recipe.title}`)
    }

    const handleComment = () => {
        if (onCommentClick) {
            onCommentClick()
        } else {
            Alert.alert("Comment", `Comment on recipe: ${recipe.title}`)
        }
    }

    const handleBookmark = () => {
        Alert.alert("Bookmark", `Bookmark recipe: ${recipe.title}`)
    }

    const handleProfile = () => {
        Alert.alert("Profile", `View profile: ${recipe.profiles?.display_name || "Unknown"}`)
    }

    return (
        <View className="items-center space-y-3">
            {/* Share Button */}
            <TouchableOpacity
                onPress={handleShare}
                className="items-center justify-center rounded-full bg-black/20 p-2"
                style={{ width: buttonSize, height: buttonSize }}
            >
                <Ionicons name="share-outline" size={iconSize} color={iconColor} />
            </TouchableOpacity>

            {/* Like Button */}
            <TouchableOpacity
                onPress={handleLike}
                className="items-center justify-center rounded-full bg-black/20 p-2"
                style={{ width: buttonSize, height: buttonSize }}
            >
                <Ionicons 
                    name={recipe.is_liked_by_current_user ? "heart" : "heart-outline"}
                    size={iconSize} 
                    color={iconColor}
                />
                {recipe.like_count && recipe.like_count > 0 && (
                    <Text className={`text-xs ${textColor} mt-1`}>
                        {recipe.like_count}
                    </Text>
                )}
            </TouchableOpacity>

            {/* Comment Button */}
            <TouchableOpacity
                onPress={handleComment}
                className="items-center justify-center rounded-full bg-black/20 p-2"
                style={{ width: buttonSize, height: buttonSize }}
            >
                <Ionicons name="chatbubble-outline" size={iconSize} color={iconColor} />
                {recipe.comment_count && recipe.comment_count > 0 && (
                    <Text className={`text-xs ${textColor} mt-1`}>
                        {recipe.comment_count}
                    </Text>
                )}
            </TouchableOpacity>

            {/* Bookmark Button */}
            <TouchableOpacity
                onPress={handleBookmark}
                className="items-center justify-center rounded-full bg-black/20 p-2"
                style={{ width: buttonSize, height: buttonSize }}
            >
                <Ionicons 
                    name={recipe.is_bookmarked_by_current_user ? "bookmark" : "bookmark-outline"}
                    size={iconSize} 
                    color={iconColor}
                />
                {recipe.bookmark_count && recipe.bookmark_count > 0 && (
                    <Text className={`text-xs ${textColor} mt-1`}>
                        {recipe.bookmark_count}
                    </Text>
                )}
            </TouchableOpacity>

            {/* Profile Button */}
            {recipe.profiles && (
                <TouchableOpacity
                    onPress={handleProfile}
                    className="items-center justify-center rounded-full bg-black/20 p-2"
                    style={{ width: buttonSize, height: buttonSize }}
                >
                    <Image 
                        source={{ uri: recipe.profiles.avatar || "https://via.placeholder.com/150" }}
                        style={{ width: iconSize, height: iconSize }}
                    />
                </TouchableOpacity>
            )}
        </View>
    )
}
