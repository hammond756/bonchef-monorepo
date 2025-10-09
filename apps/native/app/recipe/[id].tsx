import { useRecipeDetail } from "@repo/lib/hooks/recipes";
import { formatIngredientLine } from "@repo/lib/utils/ingredient-formatting";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Image } from "expo-image";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View, Animated, Dimensions, Pressable } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { RecipeActionButtons } from "@/components/recipe/recipe-action-buttons";
import { supabase } from "@/lib/utils/supabase/client";
import { useTabAnimation } from "@/hooks/use-tab-animation";
import supabaseImageLoader from "@repo/lib/utils/supabase-image-loader";
import { cssInterop } from "nativewind";
import { useAuthContext } from "@/hooks/use-auth-context";
import { Button } from "@/components/ui";

cssInterop(Image, { className: "style" });


type TabType = "ingredients" | "preparation" | "nutrition";

export default function RecipeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const { profile: user } = useAuthContext();

  // Define tabs configuration
  const tabs = [
    { key: "ingredients" as TabType, label: "Ingrediënten" },
    { key: "preparation" as TabType, label: "Bereiding" },
  ];
  
  const screenWidth = Dimensions.get('window').width;
  
  // Use custom hook for tab animation
  const { 
    animatedValues, 
    tabWidth
  } = useTabAnimation({ 
    width: screenWidth, 
    nTabs: tabs.length, 
    activeTab
  });
  
  // Fetch recipe data using the hook
  const { data: recipe, isLoading, error } = useRecipeDetail(supabase, id);

  const handleBack = () => {
    router.back();
  };

  const handleTabPress = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };

  const toggleIngredient = (ingredientKey: string) => {
    setCheckedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientKey)) {
        newSet.delete(ingredientKey);
      } else {
        newSet.add(ingredientKey);
      }
      return newSet;
    });
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
            
            const ingredientKey = `${category.name}-${ingredient.description}-${ingredient.quantity.low}-${ingredientIndex}`;
            const isChecked = checkedIngredients.has(ingredientKey);
            
            return (
              <TouchableOpacity 
                key={ingredientKey} 
                className="flex-row items-start mb-3"
                onPress={() => toggleIngredient(ingredientKey)}
                activeOpacity={0.7}
              >
                <View 
                  className={`w-5 h-5 border rounded mr-3 items-center justify-center ${isChecked ? 'border-green-700 bg-green-50' : 'border-gray-300'}`} 
                  style={{ marginTop: 2 }}
                >
                  {isChecked && (
                    <Ionicons 
                      name="checkmark" 
                      size={16} 
                      color="#1E4D37" 
                    />
                  )}
                </View>
                <View className="flex-1">
                  <Text className={`text-lg text-gray-900 font-montserrat leading-6 ${isChecked ? 'line-through text-gray-500' : ''}`}>
                    {formatted.quantity && (
                      <Text className="font-semibold">
                        {formatted.quantity}
                      </Text>
                    )}
                    {formatted.quantity && " "}
                    {formatted.description}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );

  const renderPreparation = () => (
    <View className="px-4 py-6">
      {recipe.instructions.map((step, index) => (
        <View key={`step-${index}-${step.slice(0, 20)}`} className="mb-6">
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
      case 0:
        return renderIngredients();
      case 1:
        return renderPreparation();
      default:
        return renderIngredients();
    }
  };

  return (
    <>
    <Stack.Screen options={{
      headerRight: () => (
        <Pressable onPress={() => router.push(`/edit/${recipe.id}`)} className="p-2 rounded-full bg-white">
          <Feather name="edit" size={24} color="black" />
        </Pressable>
      ),
    }} />
    <View className="flex-1 flex-col bg-white w-full">
      {/* Header Image */}
      <View className="relative h-2/5">
      <Image
        source={{ 
          // Width matches the recipe card background width, so we share
          // the same cache.
          uri: supabaseImageLoader({src: recipe.thumbnail, width: 500}) || "https://placekitten.com/900/1200" 
        }}
        className="w-full h-full"
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
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => handleTabPress(index)}
            className="flex-1 py-4 items-center relative"
          >
            <Text
              className={`text-xl font-medium ${
                activeTab === index ? "text-green-700" : "text-gray-500"
              }`}
            >
              {tab.label}
            </Text>
            
            {/* Animated underline for each tab */}
            <Animated.View
              style={{
                position: 'absolute',
                bottom: 0,
                height: 2,
                backgroundColor: '#1E4D37',
                width: animatedValues[index],
                left: Animated.add(
                  Animated.divide(Animated.subtract(tabWidth, animatedValues[index]), 2),
                  0
                ),
              }}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>
    </View>
    </>
  );
}
