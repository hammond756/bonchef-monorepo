import { View, Text, TextInput } from 'react-native'
import { useFormContext, Controller } from 'react-hook-form'
import { Ionicons } from '@expo/vector-icons'
import { RecipeImagePicker } from './image-picker'
import type { RecipeUpdate } from '@repo/lib/services/recipes'

interface RecipeInformationSectionProps {
  className?: string
}

export function RecipeInformationSection({
  className,
}: RecipeInformationSectionProps) {
  const { control, formState: { errors } } = useFormContext<RecipeUpdate>()

  return (
    <View className={className}>
      {/* Recipe Image */}
      <Controller
        name="thumbnail"
        control={control}
        render={({ field: { value, onChange } }) => (
          <RecipeImagePicker
            imageUrl={value}
            onImageChange={onChange}
            className="mx-auto w-full"
          />
        )}
      />

      {/* Recipe Title */}
      <View className="mb-6">
        <Controller
          name="title"
          control={control}
          rules={{ required: 'Titel is verplicht' }}
          render={({ field: { value, onChange } }) => (
            <View>
              <Text className="text-sm text-gray-700 mb-3 font-medium">Recept titel</Text>
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="Voer de titel van je recept in"
                placeholderTextColor="#9CA3AF"
                className="bg-white rounded-lg px-4 py-5 text-gray-900 border border-gray-300 shadow-sm"
                style={{ lineHeight: 20, fontSize: 16 }}
              />
              {errors.title && (
                <Text className="text-red-500 text-xs mt-2">
                  {errors.title.message}
                </Text>
              )}
            </View>
          )}
        />
      </View>

      {/* Cooking Time and Servings - Compact with Icons */}
      <View className="flex-row mb-6">
        {/* Cooking Time */}
        <View className="flex-1">
          <Controller
            name="total_cook_time_minutes"
            control={control}
            rules={{ 
              required: 'Bereidingstijd is verplicht',
              min: { value: 1, message: 'Bereidingstijd moet groter zijn dan 0' }
            }}
            render={({ field: { value, onChange } }) => (
              <View className="flex-row items-center bg-white rounded-lg px-4 py-4 border border-gray-300 shadow-sm mr-2">
                <Ionicons name="time-outline" size={20} color="#4B5563" />
                <TextInput
                  value={value?.toString() || ''}
                  onChangeText={(text) => {
                    const numValue = parseInt(text) || 0
                    onChange(numValue)
                  }}
                  placeholder="45"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className="flex-1 ml-3 text-gray-900"
                  style={{ lineHeight: 20, fontSize: 16 }}
                />
                <Text className="text-gray-500 text-sm ml-2">min</Text>
              </View>
            )}
          />
          {errors.total_cook_time_minutes && (
            <Text className="text-red-500 text-xs mt-1">
              {errors.total_cook_time_minutes.message}
            </Text>
          )}
        </View>
        
        {/* Portions */}
        <View className="flex-1">
          <Controller
            name="n_portions"
            control={control}
            rules={{ 
              required: 'Aantal porties is verplicht',
              min: { value: 1, message: 'Aantal porties moet groter zijn dan 0' }
            }}
            render={({ field: { value, onChange } }) => (
              <View className="flex-row items-center bg-white rounded-lg px-4 py-4 border border-gray-300 shadow-sm ml-2">
                <Ionicons name="people-outline" size={20} color="#4B5563" />
                <TextInput
                  value={value?.toString() || ''}
                  onChangeText={(text) => {
                    const numValue = parseInt(text, 10) || 0
                    onChange(numValue)
                  }}
                  placeholder="4"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className="flex-1 ml-3 text-gray-900"
                  style={{ lineHeight: 20, fontSize: 16 }}
                />
                <Text className="text-gray-500 text-sm ml-2">personen</Text>
              </View>
            )}
          />
          {errors.n_portions && (
            <Text className="text-red-500 text-xs mt-1">
              {errors.n_portions.message}
            </Text>
          )}
        </View>
      </View>

      {/* Description */}
      <View className="mb-6">
        <Controller
          name="description"
          control={control}
          render={({ field: { value, onChange } }) => (
            <View>
              <Text className="text-sm text-gray-700 mb-3 font-medium">Beschrijving</Text>
              <TextInput
                value={value || ''}
                onChangeText={onChange}
                placeholder="Beschrijf hier wat dit recept bijzonder maakt... (optioneel)"
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                className="bg-white rounded-lg px-4 py-5 text-gray-900 border border-gray-300 shadow-sm"
                style={{ minHeight: 100, lineHeight: 20, fontSize: 16 }}
              />
              {errors.description && (
                <Text className="text-red-500 text-xs mt-2">
                  {errors.description.message}
                </Text>
              )}
            </View>
          )}
        />
      </View>

      {/* Source Name */}
      <View className="mb-6">
        <Controller
          name="source_name"
          control={control}
          render={({ field: { value, onChange } }) => (
            <View>
              <Text className="text-sm text-gray-700 mb-3 font-medium">Bron van het recept</Text>
              <TextInput
                value={value || ''}
                onChangeText={onChange}
                placeholder="Bijv. Oma's kookboek, AllRecipes.com, z"
                placeholderTextColor="#9CA3AF"
                className="bg-white rounded-lg px-4 py-5 text-gray-900 border border-gray-300 shadow-sm"
                style={{ lineHeight: 20, fontSize: 16 }}
              />
              {errors.source_name && (
                <Text className="text-red-500 text-xs mt-2">
                  {errors.source_name.message}
                </Text>
              )}
            </View>
          )}
        />
      </View>

      {/* Source URL */}
      <View className="mb-6">
        <Controller
          name="source_url"
          control={control}
          rules={{
            pattern: {
              value: /^https?:\/\/.+/,
              message: 'Ongeldige URL'
            }
          }}
          render={({ field: { value, onChange } }) => (
            <View>
              <Text className="text-sm text-gray-700 mb-3 font-medium">Link naar de bron</Text>
              <TextInput
                value={value || ''}
                onChangeText={onChange}
                placeholder="https://website.com/recept"
                placeholderTextColor="#9CA3AF"
                keyboardType="url"
                className="bg-white rounded-lg px-4 py-5 text-gray-900 border border-gray-300 shadow-sm"
                style={{ lineHeight: 20, fontSize: 16 }}
              />
              {errors.source_url && (
                <Text className="text-red-500 text-xs mt-2">
                  {errors.source_url.message}
                </Text>
              )}
            </View>
          )}
        />
      </View>
    </View>
  )
}