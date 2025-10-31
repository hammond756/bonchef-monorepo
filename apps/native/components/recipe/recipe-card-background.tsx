import type React from "react"
import { Image } from "expo-image"
import { View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import type { RecipeDetail } from "@repo/lib/services/recipes"
import { cssInterop } from "nativewind";
import supabaseImageLoader from "@repo/lib/utils/supabase-image-loader"
import { useEffect, useState, useCallback } from "react"

// https://github.com/expo/expo/issues/27783#issuecomment-2622469639
cssInterop(Image, { className: "style" });

interface RecipeCardBackgroundProps {
  recipe: RecipeDetail
  children: React.ReactNode
  className?: string
  blur?: boolean
}

/**
 * Background component for recipe cards with full-container thumbnail and gradient overlay
 * Provides consistent styling for both feed and collection cards
 */
export function RecipeCardBackground({ 
  recipe, 
  children, 
  className = "",
  blur = false
}: Readonly<RecipeCardBackgroundProps>) {
  const [imageUrl, setImageUrl] = useState<string>(supabaseImageLoader({src: recipe.thumbnail, width: 500}))

  const generateImageUrl = useCallback(() => {
    return supabaseImageLoader({src: recipe.thumbnail, width: 500})
  }, [recipe.thumbnail])

  useEffect(() => {
    const newImageUrl = generateImageUrl()
    setImageUrl(newImageUrl)
  }, [generateImageUrl])

  return (
    <View className={`flex-1 overflow-hidden ${className}`}>
      {/* Recipe Image */}
      <Image
        // key={recipe.id}
        source={{ 
          uri: imageUrl
        }}
        className="absolute w-full h-full blur-sm"
        contentFit="cover"
        placeholderContentFit="cover"
        blurRadius={blur ? 50 : 0}
        cachePolicy="memory-disk" // Ensure proper caching 
        // recyclingKey={recipe.id} // Help with memory management
      />
      
      {/* Gradient Overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.0)', 'rgba(0,0,0,0.5)']}
        style={{
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          height: "100%"
        }}
      />
      
      {/* Content Overlay */}
      <View className="flex-1 relative z-10">
        {children}
      </View>
    </View>
  )
}
