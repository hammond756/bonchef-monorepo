import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { ActivityIndicator, Text, View, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRecipe } from "@repo/lib/hooks/use-recipe";
import { supabase } from "@/lib/utils/supabase/client";
import { EditRecipeForm } from "@/components/recipe/edit-recipe-form";
import { RecipeEditProvider, useRecipeEditContext } from "@/components/recipe/recipe-edit-context";

// Header component that uses the context
function EditRecipeHeader() {
  const navigation = useNavigation();
  const router = useRouter();
  const { canSave, isSaving, saveRecipe, recipe } = useRecipeEditContext();

  const handleSave = useCallback(async () => {
    if (!canSave) {
      Alert.alert(
        'Kan niet opslaan',
        'Controleer de fouten in het formulier.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await saveRecipe(recipe.is_public || false);
      Alert.alert(
        'Opgeslagen',
        'Je recept is succesvol opgeslagen!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch {
      Alert.alert(
        'Fout',
        'Er is een fout opgetreden bij het opslaan van je recept.',
        [{ text: 'OK' }]
      );
    }
  }, [canSave, saveRecipe, recipe.is_public, router]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Recept verwijderen',
      'Weet je zeker dat je dit recept wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete functionality
            console.log('Delete recipe:', recipe.id);
            router.back();
          },
        },
      ]
    );
  }, [recipe.id, router]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View className="flex-row items-center space-x-2">
          <TouchableOpacity
            onPress={handleDelete}
            className="p-2"
            disabled={isSaving}
          >
            <Ionicons 
              name="trash-outline" 
              size={24} 
              color={isSaving ? "#9CA3AF" : "#EF4444"} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            className="bg-green-600 rounded-lg px-4 py-2"
            disabled={!canSave || isSaving}
          >
            <Text className="text-white font-medium">
              {isSaving ? 'Opslaan...' : 'Opslaan'}
            </Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [canSave, isSaving, navigation, handleDelete, handleSave]);

  return null;
}

export default function EditRecipePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isOnboardingFlow, setIsOnboardingFlow] = useState(false);

  // Fetch recipe data using the hook
  const { data: recipe, isLoading, error } = useRecipe(supabase, id);

  useEffect(() => {
    // Check if this is from onboarding flow (could be passed via params in the future)
    // For now, we'll default to false
    setIsOnboardingFlow(false);
  }, []);

  const handleBack = () => {
    router.back();
  };

  // Show loading state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1E4D37" />
        <Text className="mt-4 text-gray-600">Recept laden...</Text>
      </View>
    );
  }

  // Show error state
  if (error || !recipe) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-lg text-red-600 text-center mb-4">
          Er is een fout opgetreden bij het laden van het recept.
        </Text>
        <Text className="text-gray-600 text-center">
          {error?.message || "Recept niet gevonden"}
        </Text>
      </View>
    );
  }

  return (
    <RecipeEditProvider recipe={recipe}>
      <EditRecipeHeader />
      <EditRecipeForm
        isOnboardingFlow={isOnboardingFlow}
        onBack={handleBack}
      />
    </RecipeEditProvider>
  );
}
