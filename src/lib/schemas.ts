
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
    // Step 1: Accept FileList, undefined, or null from the input.
    // RHF might provide undefined for an untouched field, or input.files can be null.
    .custom<FileList | undefined | null>()
    // Step 2: Transform the input into a single File object or undefined.
    // If filesInput is a valid, non-empty FileList, take the first file. Otherwise, result is undefined.
    .transform((filesInput) => {
      if (filesInput instanceof FileList && filesInput.length > 0) {
        return filesInput[0]; // This is a File object
      }
      return undefined; // Ensures undefined is returned for null, undefined, or empty FileList
    }) // Output of this transform is: File | undefined
    // Step 3: Refine the result of the transform.
    // Ensure that what we have is indeed a File object. If it's undefined, this refine fails.
    .refine((fileObject): fileObject is File => fileObject instanceof File, {
      message: "Image is required.",
    })
    // Step 4: Now that fileObject is guaranteed to be a File, apply File-specific validations.
    // If the previous refine passed, Zod knows fileObject is of type File here.
    .refine((fileObject) => fileObject.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (fileObject) => ACCEPTED_IMAGE_TYPES.includes(fileObject.type),
      "Only .jpg, .jpeg, .png and .webp formats are accepted."
    ),
  notes: z.string().trim().optional(),
});

export type ObservationFormValues = z.infer<typeof observationFormSchema>;
