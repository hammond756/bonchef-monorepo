import { View, Text, ScrollView, Image, TouchableOpacity, StatusBar, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { RecipeActionButtons } from "@/components/recipe/recipe-action-buttons";
import { useRecipe } from "@repo/lib/hooks/use-recipe";
import { RecipeRead } from "@repo/lib";
import { supabase } from "@/lib/utils/supabase/client";


type TabType = "ingredients" | "preparation" | "nutrition";

export default function RecipeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("ingredients");
  
  // Fetch recipe data using the hook
  const { data: recipe, isLoading, error } = useRecipe(supabase, id);
  const [servings, setServings] = useState(recipe?.n_portions || 6);

  // Use fallback data if API is not available or still loading
  const displayRecipe = recipe

  const handleBack = () => {
    router.back();
  };

  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
  };

  const adjustServings = (delta: number) => {
    const newServings = Math.max(1, servings + delta);
    setServings(newServings);
  };

  // Show loading state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1E4D37" />
        <Text className="mt-4 text-gray-600">Loading recipe...</Text>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-4">
        <Text className="text-lg font-semibold text-red-600 mb-2">Error loading recipe</Text>
        <Text className="text-gray-600 text-center mb-4">
          {error.message || "Something went wrong while loading the recipe."}
        </Text>
        <TouchableOpacity
          onPress={handleBack}
          className="bg-green-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderIngredients = () => (
    <View className="px-4 py-6">
      {/* Servings Adjuster */}
      <View className="bg-green-100 rounded-xl p-4 mb-6">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-medium text-gray-900">Aantal personen</Text>
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity
              onPress={() => adjustServings(-1)}
              className="w-8 h-8 bg-white border border-gray-300 rounded-full items-center justify-center"
            >
              <Text className="text-lg font-medium text-gray-700">-</Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900 min-w-[40px] text-center">
              {servings}
            </Text>
            <TouchableOpacity
              onPress={() => adjustServings(1)}
              className="w-8 h-8 bg-white border border-gray-300 rounded-full items-center justify-center"
            >
              <Text className="text-lg font-medium text-gray-700">+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Ingredients List */}
      {displayRecipe.ingredients.map((category, categoryIndex) => (
        <View key={categoryIndex} className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            {category.name}
          </Text>
          {category.ingredients.map((ingredient, ingredientIndex) => (
            <View key={ingredientIndex} className="flex-row items-start mb-3">
              <View className="w-5 h-5 border border-gray-300 rounded mr-3 mt-0.5" />
              <View className="flex-1">
                <Text className="text-base text-gray-900">
                  <Text className="font-semibold">
                    {ingredient.quantity.low} {ingredient.unit}
                  </Text>{" "}
                  {ingredient.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );

  const renderPreparation = () => (
    <View className="px-4 py-6">
      {displayRecipe.instructions.map((step, index) => (
        <View key={index} className="mb-6">
          <View className="flex-row items-start">
            <View className="w-8 h-8 bg-green-700 rounded-full items-center justify-center mr-4 mt-1">
              <Text className="text-white font-bold text-sm">{index + 1}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base text-gray-900 leading-6">
                {step}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderNutrition = () => (
    <View className="px-4 py-6">
      <Text className="text-lg font-semibold text-gray-900 mb-4">Voedingswaarden</Text>
      <View className="bg-gray-50 rounded-xl p-4">
        <Text className="text-base text-gray-600 text-center">
          Voedingsinformatie wordt binnenkort toegevoegd
        </Text>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "ingredients":
        return renderIngredients();
      case "preparation":
        return renderPreparation();
      case "nutrition":
        return renderNutrition();
      default:
        return renderIngredients();
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" />
      
      {/* Header Image */}
      <View className="relative h-96">
        <Image
          source={{ uri: displayRecipe.thumbnail }}
          className="w-full h-full"
          resizeMode="cover"
        />
        
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: "60%" }}
        />

        {/* Action Buttons */}
        <View className="absolute right-4 top-12">
          <RecipeActionButtons
            recipe={displayRecipe}
            theme="dark"
            size="lg"
          />
        </View>

        {/* Recipe Info Overlay */}
        <View className="absolute bottom-0 left-0 right-0 p-6">
          <Text className="text-3xl font-bold text-white mb-2">
            {displayRecipe.title}
          </Text>
          <Text className="text-white text-base mb-2">
            van {displayRecipe.profiles?.display_name} | Ⓒ {displayRecipe.total_cook_time_minutes} min
          </Text>
          
          {/* Author Avatar */}
          {displayRecipe.profiles?.avatar && (
            <View className="absolute bottom-4 right-6">
              <Image
                source={{ uri: displayRecipe.profiles.avatar }}
                className="w-12 h-12 rounded-full"
              />
            </View>
          )}
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row border-b border-gray-200">
        {[
          { key: "ingredients", label: "Ingrediënten" },
          { key: "preparation", label: "Bereiding" },
          { key: "nutrition", label: "Voeding" }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => handleTabPress(tab.key as TabType)}
            className={`flex-1 py-4 items-center ${
              activeTab === tab.key ? "border-b-2 border-green-700" : ""
            }`}
          >
            <Text
              className={`text-base font-medium ${
                activeTab === tab.key ? "text-green-700" : "text-gray-500"
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}
