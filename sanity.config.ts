import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schema } from './sanity/schemaTypes'
import { dataset, projectId } from './sanity/env'

export default defineConfig({
  name: 'default',
  title: 'DeTy? Admin Panel',

  projectId,
  dataset,

  basePath: '/studio',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Управління контентом')
          .items([
            // 1. Нові пропозиції
            S.listItem()
              .title('Пропозиції (Черга)')
              .icon(() => '🔔')
              .child(
                S.documentList()
                  .title('Нові запити')
                  .filter('_type == "location" && isApproved != true')
              ),

            // 2. Опубліковані на мапі
            S.listItem()
              .title('Опубліковані мітки')
              .icon(() => '✅')
              .child(
                S.documentList()
                  .title('На мапі')
                  .filter('_type == "location" && isApproved == true')
              ),

            S.divider(),

            // 3. Динамічні категорії
            S.listItem()
              .title('Налаштування категорій')
              .icon(() => '⚙️')
              .child(
                S.documentTypeList('category').title('Категорії організацій')
              ),

            S.divider(),

            // 4. Усі інші типи (якщо з'являться)
            ...S.documentTypeListItems().filter(
              (listItem) => !['location', 'category'].includes(listItem.getId() as string)
            ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schema.types,
  },
})