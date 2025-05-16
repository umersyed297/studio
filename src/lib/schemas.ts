import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const observationFormSchema = z.object({
  speciesName: z.string().trim().optional(),
  dateObserved: z.date({
    required_error: "Date observed is required.",
    invalid_type_error: "Valid date is required.",
  }),
  location: z.string().trim().min(1, "Location is required."),
  imageFile: z
    .custom<FileList>()
    .refine((files) => files && files.length > 0, "Image is required.")
    .transform((files) => files?.[0]) // Get the first file
    .refine((file) => !!file, "Image is required.")
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are accepted."
    ),
  notes: z.string().trim().optional(),
});

export type ObservationFormValues = z.infer<typeof observationFormSchema>;
