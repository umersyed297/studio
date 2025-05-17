
import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const observationFormSchema = z.object({
  observerName: z.string().trim().min(1, "Observer name is required."),
  speciesName: z.string().trim().optional(),
  dateObserved: z.date({
    required_error: "Date observed is required.",
    invalid_type_error: "Valid date is required.",
  }),
  location: z.string().trim().min(1, "Location is required."),
  imageFile: z
    .custom<FileList | undefined | null>()
    .transform((filesInput) => {
      if (filesInput instanceof FileList && filesInput.length > 0) {
        return filesInput[0];
      }
      return undefined;
    })
    .refine((fileObject): fileObject is File => fileObject instanceof File, {
      message: "Image is required.",
    })
    .refine((fileObject) => fileObject.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (fileObject) => ACCEPTED_IMAGE_TYPES.includes(fileObject.type),
      "Only .jpg, .jpeg, .png and .webp formats are accepted."
    ),
  notes: z.string().trim().optional(),
});

export type ObservationFormValues = z.infer<typeof observationFormSchema>;
