import { type SchemaTypeDefinition } from 'sanity'
import location from './location' 
import { category } from './category'

export const schema: { types: SchemaTypeDefinition[] } = {
  // Додаємо category сюди, щоб Sanity "побачив" цю схему
  types: [location, category], 
}