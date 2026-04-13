import { z } from 'zod'

export const modelFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: 'El nombre debe tener al menos 2 caracteres' })
    .max(120, { error: 'El nombre no puede exceder 120 caracteres' }),
  description: z
    .string()
    .trim()
    .min(3, { error: 'La descripción debe tener al menos 3 caracteres' })
    .max(200, { error: 'La descripción no puede exceder 200 caracteres' }),
  image: z.url({ error: 'La imagen debe ser una URL válida' }),
  pdf: z
    .url({ error: 'La URL del PDF no es válida' })
    .refine((value) => value.toLowerCase().includes('.pdf'), {
      error: 'La URL debe apuntar a un PDF',
    }),
})

export type ModelFormInput = z.infer<typeof modelFormSchema>
