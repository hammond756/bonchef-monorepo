import React from "react"
import { View, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { RecipeRead } from "@repo/lib/services/recipes"

interface RecipeCardBackgroundProps {
  recipe: RecipeRead
  children: React.ReactNode
  className?: string
}

/**
 * Background component for recipe cards with full-container thumbnail and gradient overlay
 * Provides consistent styling for both feed and collection cards
 */
export function RecipeCardBackground({ 
  recipe, 
  children, 
  className = "" 
}: Readonly<RecipeCardBackgroundProps>) {
  return (
    <View className={`relative overflow-hidden ${className}`}>
      {/* Recipe Image */}
      <Image
        source={{ 
          uri: recipe.thumbnail || "https://placekitten.com/900/1200" 
        }}
        className="w-full h-full"
        resizeMode="cover"
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
      {children}
    </View>
  )
}
