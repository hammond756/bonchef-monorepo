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
  const { control } = useFormContext<RecipeUpdate>()

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
      <Controller
        name="title"
        control={control}
        rules={{ required: 'Titel is verplicht' }}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <Input
            label="Recept titel"
            placeholder="Voer de titel van je recept in"
            value={value}
            onChangeText={onChange}
            error={error?.message}
          />
        )}
      />

      {/* Cooking Time and Servings */}
      <View className="flex-row mb-4">
        <Controller
          name="total_cook_time_minutes"
          control={control}
          rules={{ 
            required: 'Bereidingstijd is verplicht',
            min: { value: 1, message: 'Bereidingstijd moet groter zijn dan 0' },
            pattern: {
              value: /^\d+$/,
              message: 'Bereidingstijd moet een getal zijn'
            }
          }}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <NumberInput
              placeholder="45"
              value={value === undefined || value === null ? '' : value.toString()}
              onChangeText={onChange}
              error={error?.message}
              icon="time-outline"
              suffix="min"
              compact
              className="mr-2"
            />
          )}
        />
        
        <Controller
          name="n_portions"
          control={control}
          rules={{ 
            required: 'Aantal porties is verplicht',
            min: { value: 1, message: 'Aantal porties moet groter zijn dan 0' },
            pattern: {
              value: /^\d+$/,
              message: 'Aantal porties moet een getal zijn'
            }
          }}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <NumberInput
              placeholder="4"
              value={value === undefined || value === null ? '' : value.toString()}
              onChangeText={onChange}
              error={error?.message}
              icon="people-outline"
              suffix="personen"
              compact
              className="ml-2"
            />
          )}
        />
      </View>

      {/* Description */}
      <Controller
        name="description"
        control={control}
        rules={{
          maxLength: { value: 500, message: 'Beschrijving mag maximaal 500 karakters bevatten' }
        }}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <TextArea
            label="Beschrijving (optioneel)"
            placeholder="Beschrijf hier wat dit recept bijzonder maakt..."
            value={value || ''}
            onChangeText={onChange}
            maxLength={500}
            minHeight={100}
            maxHeight={120}
            error={error?.message}
          />
        )}
      />

      {/* Source Name */}
      <Controller
        name="source_name"
        control={control}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <Input
            label="Bron van het recept (optioneel)"
            placeholder="Bijv. Oma's kookboek, AllRecipes.com"
            value={value || ''}
            onChangeText={onChange}
            error={error?.message}
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
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <URLInput
            label="Link naar de bron (optioneel)"
            placeholder="https://website.com/recept"
            value={value || ''}
            onChangeText={onChange}
            error={error?.message}
          />
        )}
      />
    </View>
  )
}