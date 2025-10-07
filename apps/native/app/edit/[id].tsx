import { useLocalSearchParams, useRouter, useNavigation, Stack } from "expo-router";
import { useEffect, useCallback } from "react";
import { ActivityIndicator, Text, View, TouchableOpacity, Alert } from "react-native";
import { usePreventRemove } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { useRecipe, useUpdateRecipe, useDeleteRecipe } from "@repo/lib/hooks/recipes";
import { supabase } from "@/lib/utils/supabase/client";
import { EditRecipeForm } from "@/components/recipe/edit-recipe-form";
import type { RecipeUpdate } from "@repo/lib/services/recipes";

// Component that handles preventing navigation when there are unsaved changes
function UnsavedChangesHandler() {
  const navigation = useNavigation();
  const { formState } = useFormContext<RecipeUpdate>();
  const { isDirty } = formState;

  usePreventRemove(isDirty, ({ data }) => {
    Alert.alert(
      'Wijzigingen verwerpen?',
      'Je hebt niet-opgeslagen wijzigingen. Weet je zeker dat je wilt weggaan?',
      [
        { text: "Blijven bewerken", style: 'cancel', onPress: () => {} },
        {
          text: 'Weggaan',
          style: 'destructive',
          onPress: () => navigation.dispatch(data.action),
        },
      ]
    );
  });

  return null;
}

// Header component that uses the form context
function EditRecipeHeader() {
  const navigation = useNavigation();
  const router = useRouter();
  const { formState, getValues, reset } = useFormContext<RecipeUpdate>();
  const { isDirty, isValid, isSubmitting } = formState;
  const updateRecipeMutation = useUpdateRecipe(supabase);
  const deleteRecipeMutation = useDeleteRecipe(supabase);
  
  const isSaving = updateRecipeMutation.isPending || deleteRecipeMutation.isPending;
  const canSave = isDirty && isValid && !isSubmitting && !isSaving;

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
      const formData = getValues();
      const savedRecipe = await updateRecipeMutation.mutateAsync({
        recipeId: formData.id,
        updates: {
          ...formData,
          status: 'PUBLISHED'
        }
      });
      
      // Reset form state to mark as clean after successful save
      reset(savedRecipe, { keepDirtyValues: false });
      
      router.back();
    } catch {
      Alert.alert(
        'Fout',
        'Er is een fout opgetreden bij het opslaan van je recept.',
        [{ text: 'OK' }]
      );
    }
  }, [canSave, updateRecipeMutation, getValues, router, reset]);

  const handleDelete = useCallback(() => {
    const formData = getValues();
    Alert.alert(
      'Recept verwijderen',
      'Weet je zeker dat je dit recept wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecipeMutation.mutateAsync(formData.id);
              router.back();
            } catch {
              Alert.alert(
                'Fout',
                'Er is een fout opgetreden bij het verwijderen van je recept.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  }, [deleteRecipeMutation, getValues, router]);

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
            className="bg-green-600 rounded-lg px-4 py-2 disabled:bg-gray-400"
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

  // Fetch recipe data using the hook
  const { data: recipe, isLoading, error } = useRecipe(supabase, id);

  // Initialize form with default values
  const methods = useForm<RecipeUpdate>({
    defaultValues: {
      id: '',
      title: '',
      description: '',
      thumbnail: '',
      source_url: '',
      source_name: '',
      n_portions: 1,
      total_cook_time_minutes: 30,
      ingredients: [],
      instructions: [],
      is_public: false,
      status: 'DRAFT'
    },
    mode: 'onChange'
  });

  // Update form when recipe data loads
  useEffect(() => {
    if (recipe) {
      // We need to trigger first to mark fields that are invalid in the db with their errors
      methods.trigger();
      methods.reset(recipe, { keepDirtyValues: false });
    }
  }, [recipe, methods]);

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
    <FormProvider {...methods}>
      <Stack.Screen />
      <UnsavedChangesHandler />
      <EditRecipeHeader />
      <EditRecipeForm />
    </FormProvider>
  );
}