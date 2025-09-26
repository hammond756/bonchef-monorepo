import { useRecipe } from "@repo/lib/hooks/use-recipe";
import { formatIngredientLine } from "@repo/lib/utils/ingredient-formatting";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { RecipeActionButtons } from "@/components/recipe/recipe-action-buttons";
import { supabase } from "@/lib/utils/supabase/client";


type TabType = "ingredients" | "preparation" | "nutrition";

export default function RecipeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("ingredients");
  
  // Fetch recipe data using the hook
  const { data: recipe, isLoading, error } = useRecipe(supabase, id);

  const handleBack = () => {
    router.back();
  };

  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
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

  if (!recipe) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600">Recipe not found</Text>
      </View>
    );
  }

  const renderIngredients = () => (
    <View className="px-4 py-6">
      {/* Ingredients List */}
      {recipe.ingredients.map((category) => (
        <View key={category.name} className="mb-6">
          {category.name !== "no_group" && (
            <Text
              className="text-xl tracking-wider font-medium text-gray-900 mb-3 font-serif"
            >
            {category.name}
          </Text>)}
          {category.ingredients.map((ingredient, ingredientIndex) => {
            const formatted = formatIngredientLine(ingredient, 1);
            if (!formatted) return null;
            
            return (
              <View key={ingredient.description + ingredient.quantity.low + ingredientIndex} className="flex-row items-start mb-3">
                <View className="w-5 h-5 border border-gray-300 rounded mr-3 mt-0.5" />
                <View className="flex-1">
                  <Text className="text-lg text-gray-900 font-montserrat">
                    {formatted.quantity && (
                      <Text className="font-semibold">
                        {formatted.quantity}
                      </Text>
                    )}
                    {formatted.quantity && " "}
                    {formatted.description}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );

  const renderPreparation = () => (
    <View className="px-4 py-6">
      {recipe.instructions.map((step, index) => (
        <View key={step} className="mb-6">
          <View className="flex-row items-start">
            <View className="w-8 h-8 bg-green-700 rounded-full items-center justify-center mr-4 mt-1">
              <Text className="text-white font-bold text-sm">{index + 1}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg text-gray-900 leading-6">
                {step}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );


  const renderTabContent = () => {
    switch (activeTab) {
      case "ingredients":
        return renderIngredients();
      case "preparation":
        return renderPreparation();
      default:
        return renderIngredients();
    }
  };

  return (
    <View className="flex-1 flex-col bg-white w-full">
      {/* Header Image */}
      <View className="relative h-2/5">
        <Image
          source={{ uri: recipe.thumbnail }}
          className="w-full h-full"
          resizeMode="cover"
        />
        
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.0)', 'rgba(0,0,0,0.5)']}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: "100%" }}
        />

        {/* Action Buttons */}
        <View className="absolute bottom-0 right-0 h-full w-full flex-col justify-end p-4">
          <View className="flex-row justify-between items-end">
            <View className="flex-col justify-start flex-1 pr-4">
              <Text className="text-white text-2xl mb-2 font-serif font-bold">{recipe.title}</Text>
              <Text className="text-white text-base mb-2 font-montserrat">van {recipe.profiles?.display_name}</Text>
            </View>
            <View className="w-12">
              <RecipeActionButtons
                recipe={recipe}
                theme="dark"
                size="lg"
              />
            </View>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row border-b border-gray-200">
        {[
          { key: "ingredients", label: "Ingrediënten" },
          { key: "preparation", label: "Bereiding" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => handleTabPress(tab.key as TabType)}
            className={`flex-1 py-4 items-center ${
              activeTab === tab.key ? "border-b-2 border-green-700" : ""
            }`}
          >
            <Text
              className={`text-xl font-medium ${
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
