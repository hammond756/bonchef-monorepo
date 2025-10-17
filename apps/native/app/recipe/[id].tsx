import { useRecipeDetail } from "@repo/lib/hooks/recipes";
import { formatIngredientLine } from "@repo/lib/utils/ingredient-formatting";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Image } from "expo-image";
import { ActivityIndicator, Text, TouchableOpacity, View, Dimensions, Pressable } from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler, 
  useAnimatedStyle, 
  interpolate, 
  withTiming
} from "react-native-reanimated";
import { Feather, Ionicons } from "@expo/vector-icons";
import { RecipeActionButtons } from "@/components/recipe/recipe-action-buttons";
import { supabase } from "@/lib/utils/supabase/client";
import supabaseImageLoader from "@repo/lib/utils/supabase-image-loader";
import { cssInterop } from "nativewind";
import { useAuthContext } from "@/hooks/use-auth-context";
import { RecipeSourceDisplay } from "@/components/recipe/recipe-source-display";

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
  const headerHeight = screenWidth * (4/3); // 3:4 aspect ratio
  const tabHeight = 60; // Approximate tab height
  
  // Scroll animation values
  const scrollY = useSharedValue(0);
  const tabUnderlineTranslateX = useSharedValue(0);
  
  // Initialize tab underline position
  useEffect(() => {
    tabUnderlineTranslateX.value = 0; // Start at first tab
  }, [tabUnderlineTranslateX]);
  
  // Fetch recipe data using the hook
  const { data: recipe, isLoading, error } = useRecipeDetail(supabase, id);

  const handleBack = () => {
    router.back();
  };

  const handleTabPress = (tabIndex: number) => {
    setActiveTab(tabIndex);
    // Animate the underline to the new position
    tabUnderlineTranslateX.value = withTiming(
      (screenWidth / tabs.length) * tabIndex,
      { duration: 300 }
    );
  };

  // Scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animated styles
  const headerImageStyle = useAnimatedStyle(() => {
    const translateY = scrollY.value * 0.5; // Subtle parallax
    const scale = Math.max(1.1, 1 + scrollY.value * 0.0001); // Prevent gaps
    
    return {
      transform: [
        { translateY },
        { scale }
      ],
    };
  });

  const stickyTabsStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [headerHeight - tabHeight, headerHeight],
      [0, -(headerHeight - tabHeight)],
      'clamp'
    );
    
    return {
      transform: [{ translateY }],
      zIndex: 10,
    };
  });


  const headerAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColorOpacity = interpolate(
      scrollY.value,
      [headerHeight - 100, headerHeight],
      [0, 1],
      'clamp'
    );
    
    const shadowOpacity = interpolate(
      scrollY.value,
      [headerHeight - 100, headerHeight],
      [0, 0.1],
      'clamp'
    );
    
    return {
      backgroundColor: `rgba(255, 255, 255, ${backgroundColorOpacity})`,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity,
      shadowRadius: 3.84,
      elevation: 5,
    };
  });

  const tabUnderlineStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabUnderlineTranslateX.value }],
      width: screenWidth / tabs.length,
      backgroundColor: '#16a34a',
    };
  });

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
    <View className="px-4 py-10">
      {/* Ingredients List */}
      {recipe.ingredients.map((category, idx) => (
        <View key={category.name} className="mb-6">
          {idx > 0 && (
            <View className="h-px bg-gray-200 mb-12" />
          )}
          {category.name !== "no_group" && (
            <Text
              className="mb-5 text-xl font-semibold font-lora"
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
                className="flex-row items-start mb-5 ml-3"
                onPress={() => toggleIngredient(ingredientKey)}
                activeOpacity={0.7}
              >
                <View 
                  className={`w-5 h-5 border rounded mr-3 items-center justify-center ${isChecked ? 'border-green-600 bg-green-50' : 'border-gray-300'}`} 
                  style={{ marginTop: 7 }}
                >
                  {isChecked && (
                    <Ionicons 
                      name="checkmark" 
                      size={16} 
                      color="#16a34a" 
                    />
                  )}
                </View>
                <View className="flex-1">
                  <Text className={`text-xl text-gray-900 leading-relaxed font-montserrat font-light ${isChecked ? 'line-through text-gray-500' : ''}`}>
                    {formatted.quantity && (
                      <Text className="font-semibold font-montserrat">
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
            <View className="w-8 h-8 bg-[#ebffed] rounded-full items-center justify-center mr-4 mt-1">
              <Text className="text-gray-950 font-bold text-sm font-montserrat">{index + 1}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg text-gray-900 leading-normal font-montserrat">
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
    <Stack.Screen
      options={{
        headerTransparent: true,
        headerLeft: () => (
          <TouchableOpacity onPress={handleBack} className="p-2 bg-white rounded-full">
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          user?.id === recipe.profiles?.id && (
            <Pressable onPress={() => router.push(`/edit/${recipe.id}`)} className="p-2 bg-white rounded-full">
              <Feather name="edit" size={24} color="black" />
            </Pressable>
          )
        ),
        headerTintColor: 'white',
        headerBackground: () => <Animated.View style={[{ flex: 1 }, headerAnimatedStyle]} />,
      }}
    />

    <View className="flex-1 bg-white">
      <Animated.ScrollView 
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* Header Image with Parallax */}
        <View style={{ height: headerHeight, overflow: 'hidden' }}>
          <Animated.View style={headerImageStyle}>
            <Image
              source={{ 
                uri: supabaseImageLoader({src: recipe.thumbnail, width: 500}) || "https://placekitten.com/900/1200" 
              }}
              style={{
                width: screenWidth * 1.1, // Slightly wider to prevent gaps
                height: headerHeight * 1.1,
                marginLeft: -(screenWidth * 0.05), // Center the oversized image
              }}
            />
          </Animated.View>
          
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.0)', 'rgba(0,0,0,0.5)']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: "100%" }}
          />

          {/* Action Buttons */}
          <View className="absolute bottom-0 right-0 h-full w-full flex-col justify-end p-4">
            <View className="flex-row justify-between items-end">
              <View className="flex-col justify-start flex-1 pr-4">
                <Text className="text-white text-2xl mb-2 font-lora font-bold">{recipe.title}</Text>
                <RecipeSourceDisplay recipe={recipe} />
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

        {/* Tab Navigation - becomes sticky */}
        <Animated.View 
          style={[
            {
              backgroundColor: 'white',
              borderBottomWidth: 1,
              borderBottomColor: '#e5e7eb',
            },
            stickyTabsStyle
          ]}
        >
          <View className="flex-row">
            {tabs.map((tab, index) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => handleTabPress(index)}
                className="flex-1 py-4 items-center relative"
              >
                <Text
                  className={`text-xl font-medium font-montserrat ${
                    activeTab === index ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Animated underline */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                bottom: 0,
                height: 2,
                backgroundColor: '#16a34a',
              },
              tabUnderlineStyle
            ]}
          />
        </Animated.View>

        {renderTabContent()}
      </Animated.ScrollView>
    </View>
    </>
  );
}
