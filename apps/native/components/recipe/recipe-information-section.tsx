import { View } from 'react-native'
import { useFormContext, Controller } from 'react-hook-form'
import { RecipeImagePicker } from './image-picker'
import Input from '@/components/ui/input'
import TextArea from '@/components/ui/textarea'
import NumberInput from '@/components/ui/number-input'
import URLInput from '@/components/ui/url-input'
import type { RecipeUpdate } from '@repo/lib/services/recipes'

interface RecipeInformationSectionProps {
  className?: string
}

export function RecipeInformationSection({
  className,
}: RecipeInformationSectionProps) {
  const { control, formState: { errors } } = useFormContext<RecipeUpdate>()

  return (
    <View className={`space-y-6 ${className}`}>
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
      <Controller
        name="title"
        control={control}
        rules={{ required: 'Titel is verplicht' }}
        render={({ field: { value, onChange } }) => (
          <Input
            label="Recept titel"
            placeholder="Voer de titel van je recept in"
            value={value}
            onChangeText={onChange}
            error={errors.title?.message}
          />
        )}
      />

      {/* Cooking Time and Servings */}
      <View className="flex-row space-x-4">
        <View className="flex-1">
          <Controller
            name="total_cook_time_minutes"
            control={control}
            rules={{ 
              required: 'Bereidingstijd is verplicht',
              min: { value: 1, message: 'Bereidingstijd moet groter zijn dan 0' }
            }}
            render={({ field: { value, onChange } }) => (
              <NumberInput
                label="Bereidingstijd (min)"
                placeholder="30"
                value={value}
                onChangeText={onChange}
                min={1}
                max={999}
                error={errors.total_cook_time_minutes?.message}
              />
            )}
          />
        </View>
        <View className="flex-1">
          <Controller
            name="n_portions"
            control={control}
            rules={{ 
              required: 'Aantal porties is verplicht',
              min: { value: 1, message: 'Aantal porties moet groter zijn dan 0' }
            }}
            render={({ field: { value, onChange } }) => (
              <NumberInput
                label="Porties"
                placeholder="4"
                value={value}
                onChangeText={onChange}
                min={1}
                max={20}
                error={errors.n_portions?.message}
              />
            )}
          />
        </View>
      </View>

      {/* Description */}
      <Controller
        name="description"
        control={control}
        render={({ field: { value, onChange } }) => (
          <TextArea
            label="Beschrijving"
            placeholder="Schrijf hier op wat jouw recept zo goed maakt!"
            value={value || ''}
            onChangeText={onChange}
            maxLength={500}
            minHeight={80}
            maxHeight={120}
            error={errors.description?.message}
            helperText="Optioneel - maximaal 500 karakters"
          />
        )}
      />

      {/* Source Name */}
      <Controller
        name="source_name"
        control={control}
        render={({ field: { value, onChange } }) => (
          <Input
            label="Bron naam"
            placeholder="Bijv. Allerhande, Jamie Oliver"
            value={value || ''}
            onChangeText={onChange}
            error={errors.source_name?.message}
            helperText="Optioneel - waar komt dit recept vandaan?"
          />
        )}
      />

      {/* Source URL */}
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
          <URLInput
            label="Link naar de bron"
            placeholder="https://website.com/recept"
            value={value || ''}
            onChangeText={onChange}
            error={errors.source_url?.message}
            helperText="Optioneel - link naar het originele recept"
          />
        )}
      />
    </View>
  )
}