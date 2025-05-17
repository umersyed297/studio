
import ObservationForm from '@/components/observation-form';
import { Leaf, ListChecks, MapIcon, MessagesSquare } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 flex flex-col items-center min-h-screen">
      <header className="my-6 md:my-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center">
          <Leaf className="mr-3 h-10 w-10 md:h-12 md:w-12" />
          Nature Observer
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Document your wildlife sightings and get AI-powered species suggestions.
        </p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
          <Button asChild variant="outline" className="w-full">
            <Link href="/observations">
              <ListChecks className="mr-2 h-4 w-4" />
              View All Observations
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/map">
              <MapIcon className="mr-2 h-4 w-4" />
              View Map
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/qa">
              <MessagesSquare className="mr-2 h-4 w-4" />
              Ask About Biodiversity
            </Link>
          </Button>
        </div>
      </header>
      <ObservationForm />
    </main>
  );
}
