
'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, MapPin, ImageUp, FileText, Wand2, Leaf, Loader2, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { observationFormSchema, type ObservationFormValues } from '@/lib/schemas';
import { suggestSpeciesNames } from '@/ai/flows/suggest-species-names';
// Removed: import { saveObservationAction } from '@/lib/actions';
import type { Observation } from '@/types';

const LOCAL_STORAGE_KEY = 'observations';

export default function ObservationForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ObservationFormValues>({
    resolver: zodResolver(observationFormSchema),
    defaultValues: {
      speciesName: '',
      location: '',
      notes: '',
      dateObserved: undefined, // Default to undefined
    },
  });

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = observationFormSchema.shape.imageFile.safeParse(event.target.files);
      if (!validation.success) {
        form.setError("imageFile", { type: "manual", message: validation.error.errors[0].message });
        setImagePreview(null);
        setImageDataUri(null);
        setAiSuggestions([]);
        setAiError(null);
        return;
      }
      
      form.clearErrors("imageFile");

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        setImageDataUri(dataUri); // Store Data URI for submission

        setAiLoading(true);
        setAiSuggestions([]);
        setAiError(null);
        suggestSpeciesNames({ imageDataUri: dataUri })
          .then(response => {
            setAiSuggestions(response.speciesNames);
            if (response.speciesNames.length === 0) {
              setAiError("AI could not confidently suggest any species for this image.");
            }
          })
          .catch(error => {
            console.error("AI suggestion error:", error);
            setAiError("Failed to get AI suggestions. Please try again.");
          })
          .finally(() => {
            setAiLoading(false);
          });
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      setImageDataUri(null);
      setAiSuggestions([]);
      setAiError(null);
    }
  };
  
  useEffect(() => {
    if (form.getValues("imageFile")) {
      form.trigger("imageFile");
    }
  }, [imagePreview, form]);

  const onSubmit: SubmitHandler<ObservationFormValues> = async (data) => {
    if (!imageDataUri) {
      toast({
        title: 'Error',
        description: 'Please select an image.',
        variant: 'destructive',
      });
      return;
    }

    const newObservation: Observation = {
      id: Date.now().toString(), // Simple unique ID
      speciesName: data.speciesName,
      dateObserved: data.dateObserved.toISOString(), // Store as ISO string
      location: data.location,
      imageUrl: imageDataUri, // Store Data URI
      notes: data.notes,
      aiSuggestedSpecies: aiSuggestions,
      createdAt: new Date().toISOString(), // Store as ISO string
    };

    try {
      const existingObservationsRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      const existingObservations: Observation[] = existingObservationsRaw ? JSON.parse(existingObservationsRaw) : [];
      
      // Add new observation and ensure it's an array
      const updatedObservations = [...existingObservations, newObservation];
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedObservations));

      toast({
        title: 'Success!',
        description: 'Observation saved locally!',
        variant: 'default',
      });
      form.reset({ // Reset form with default values for date
        speciesName: '',
        location: '',
        notes: '',
        dateObserved: undefined, // Reset date to undefined
        imageFile: undefined,
      });
      setImagePreview(null);
      setImageDataUri(null);
      setAiSuggestions([]);
      setAiError(null);
      // Manually clear file input if possible (browser security often prevents this)
      const fileInput = document.getElementById('imageFile') as HTMLInputElement | null;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Error saving observation to local storage:', error);
      toast({
        title: 'Error',
        description: 'Failed to save observation locally. Check browser console.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Leaf className="mr-2 h-6 w-6 text-primary" />
          Submit Observation
        </CardTitle>
        <CardDescription>Fill in the details of your nature sighting.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="speciesName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="speciesName">Species Name (Optional)</FormLabel>
                  <FormControl>
                    <Input id="speciesName" placeholder="e.g., Monarch Butterfly" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateObserved"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel htmlFor="dateObserved">Date Observed</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          id="dateObserved"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="location">Location</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input id="location" placeholder="e.g., Margalla Hills" {...field} className="pl-10" />
                    </FormControl>
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="imageFile"
              render={({ field: { onChange, value, ...restField }}) => (
                <FormItem>
                  <FormLabel htmlFor="imageFile">Upload Image</FormLabel>
                  <div className="relative">
                     <FormControl>
                        <Input 
                          id="imageFile" 
                          type="file" 
                          accept="image/png, image/jpeg, image/webp" 
                          onChange={(e) => {
                            onChange(e.target.files); 
                            handleImageChange(e); 
                          }}
                          {...restField} 
                          className="pl-10 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                      </FormControl>
                    <ImageUp className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {imagePreview && (
              <div className="mt-4">
                <Label>Image Preview:</Label>
                <div className="mt-2 aspect-video w-full overflow-hidden rounded-md border border-muted">
                  <Image src={imagePreview} alt="Image preview" width={600} height={400} className="object-cover w-full h-full" data-ai-hint="nature wildlife"/>
                </div>
              </div>
            )}

            {(aiLoading || aiSuggestions.length > 0 || aiError) && (
               <div className="mt-4 p-4 border rounded-md bg-secondary/50">
                <Label className="flex items-center font-semibold">
                  <Wand2 className="mr-2 h-5 w-5 text-primary" />
                  AI-Suggested Species
                </Label>
                {aiLoading && (
                  <div className="mt-2 flex items-center text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Identifying species...</span>
                  </div>
                )}
                {!aiLoading && aiError && (
                  <div className="mt-2 flex items-center text-destructive">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    <span>{aiError}</span>
                  </div>
                )}
                {!aiLoading && !aiError && aiSuggestions.length > 0 && (
                  <ul className="mt-2 list-disc list-inside text-foreground space-y-1">
                    {aiSuggestions.map((name, index) => (
                      <li key={index}>{name}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="notes">Notes (Optional)</FormLabel>
                   <div className="relative">
                    <FormControl>
                      <Textarea
                        id="notes"
                        placeholder="Any observations about behavior, habitat, etc."
                        {...field}
                        className="pl-10 min-h-[100px]"
                      />
                    </FormControl>
                     <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <CardFooter className="p-0 pt-4">
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || aiLoading}>
                {form.formState.isSubmitting || aiLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Submit Observation'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
