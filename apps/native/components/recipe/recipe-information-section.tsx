import { View } from 'react-native'
import { RecipeImagePicker } from './image-picker'
import Input from '@/components/ui/input'
import TextArea from '@/components/ui/textarea'
import NumberInput from '@/components/ui/number-input'
import URLInput from '@/components/ui/url-input'

interface RecipeInformationSectionProps {
  // Image
  imageUrl?: string | null
  onImageChange: (uri: string) => void

  // Recipe details
  title: string
  onTitleChange: (title: string) => void

  cookingTime: number
  onCookingTimeChange: (time: number) => void

  servings: number
  onServingsChange: (servings: number) => void

  description: string
  onDescriptionChange: (description: string) => void

  source: string
  onSourceChange: (source: string) => void

  sourceUrl: string
  onSourceUrlChange: (sourceUrl: string) => void

  // Validation errors
  errors?: Record<string, string | undefined>

  className?: string
}

export function RecipeInformationSection({
  imageUrl,
  onImageChange,
  title,
  onTitleChange,
  cookingTime,
  onCookingTimeChange,
  servings,
  onServingsChange,
  description,
  onDescriptionChange,
  source,
  onSourceChange,
  sourceUrl,
  onSourceUrlChange,
  errors,
  className,
}: RecipeInformationSectionProps) {
  return (
    <View className={`space-y-6 ${className}`}>
      {/* Recipe Image */}
      <RecipeImagePicker
        imageUrl={imageUrl}
        onImageChange={onImageChange}
        className="mx-auto w-full"
      />

      {/* Recipe Title */}
      <Input
        label="Recept titel"
        placeholder="Voer de titel van je recept in"
        value={title}
        onChangeText={onTitleChange}
        error={errors?.title}
      />

      {/* Cooking Time and Servings */}
      <View className="flex-row space-x-4">
        <View className="flex-1">
          <NumberInput
            label="Bereidingstijd (min)"
            placeholder="30"
            value={cookingTime}
            onChangeText={onCookingTimeChange}
            min={1}
            max={999}
            error={errors?.total_cook_time_minutes}
          />
        </View>
        <View className="flex-1">
          <NumberInput
            label="Porties"
            placeholder="4"
            value={servings}
            onChangeText={onServingsChange}
            min={1}
            max={20}
            error={errors?.n_portions}
          />
        </View>
      </View>

      {/* Description */}
      <TextArea
        label="Beschrijving"
        placeholder="Schrijf hier op wat jouw recept zo goed maakt!"
        value={description}
        onChangeText={onDescriptionChange}
        maxLength={500}
        minHeight={80}
        maxHeight={120}
        error={errors?.description}
        helperText="Optioneel - maximaal 500 karakters"
      />

      {/* Source Name */}
      <Input
        label="Bron naam"
        placeholder="Bijv. Allerhande, Jamie Oliver"
        value={source}
        onChangeText={onSourceChange}
        error={errors?.source_name}
        helperText="Optioneel - waar komt dit recept vandaan?"
      />

      {/* Source URL */}
      <URLInput
        label="Link naar de bron"
        placeholder="https://website.com/recept"
        value={sourceUrl}
        onChangeText={onSourceUrlChange}
        error={errors?.source_url}
        helperText="Optioneel - link naar het originele recept"
      />
    </View>
  )
}
