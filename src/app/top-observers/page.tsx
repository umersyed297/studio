
'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, Home, Users } from "lucide-react";
import Link from "next/link";

interface MockObservation {
  id: string;
  userId: string; // Represents username
  speciesName: string;
  location: string;
  timestamp: string;
}

interface UserObservationCount {
  userId: string;
  count: number;
}

// Enhanced Mock data for more interesting leaderboard
const mockObservations: MockObservation[] = [
  { id: "1", userId: "WildlifeWatcher01", speciesName: "Golden Eagle", location: "Mountain Peak", timestamp: "2023-10-27T10:00:00Z" },
  { id: "2", userId: "EcoExplorer", speciesName: "Red Fox", location: "Forest Trail", timestamp: "2023-10-27T10:15:00Z" },
  { id: "3", userId: "WildlifeWatcher01", speciesName: "Monarch Butterfly", location: "Meadow", timestamp: "2023-10-27T10:30:00Z" },
  { id: "4", userId: "BioBuff", speciesName: "Grizzly Bear", location: "Riverbank", timestamp: "2023-10-27T10:45:00Z" },
  { id: "5", userId: "EcoExplorer", speciesName: "Great Horned Owl", location: "Old Barn", timestamp: "2023-10-27T11:00:00Z" },
  { id: "6", userId: "WildlifeWatcher01", speciesName: "White-tailed Deer", location: "Woodland Edge", timestamp: "2023-10-27T11:15:00Z" },
  { id: "7", userId: "WildlifeWatcher01", speciesName: "Painted Turtle", location: "Pond", timestamp: "2023-10-27T11:30:00Z" },
  { id: "8", userId: "EcoExplorer", speciesName: "American Robin", location: "Backyard", timestamp: "2023-10-27T11:45:00Z" },
  { id: "9", userId: "BioBuff", speciesName: "Coyote", location: "Open Field", timestamp: "2023-10-27T12:00:00Z" },
  { id: "10", userId: "WildlifeWatcher01", speciesName: "Northern Cardinal", location: "Bird Feeder", timestamp: "2023-10-27T12:15:00Z" },
  { id: "11", userId: "NatureNovice", speciesName: "Eastern Gray Squirrel", location: "Park", timestamp: "2023-10-28T09:00:00Z"},
  { id: "12", userId: "EcoExplorer", speciesName: "Mallard Duck", location: "Lake", timestamp: "2023-10-28T09:30:00Z"},
  { id: "13", userId: "BioBuff", speciesName: "Raccoon", location: "Urban Area", timestamp: "2023-10-28T10:00:00Z"},
  { id: "14", userId: "WildlifeWatcher01", speciesName: "Osprey", location: "Coastal Area", timestamp: "2023-10-28T10:30:00Z"},
  { id: "15", userId: "EcoExplorer", speciesName: "Bumblebee", location: "Flower Garden", timestamp: "2023-10-28T11:00:00Z"},
];

const countObservationsByUser = (
  observations: MockObservation[]
): UserObservationCount[] => {
  const userCounts: { [key: string]: number } = {};
  observations.forEach((obs) => {
    userCounts[obs.userId] = (userCounts[obs.userId] || 0) + 1;
  });

  return Object.keys(userCounts)
    .map((userId) => ({ userId, count: userCounts[userId] }))
    .sort((a, b) => b.count - a.count); // Sort descending by count
};

export default function TopObserversPage() {
  const userObservationCounts = countObservationsByUser(mockObservations);

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center">
          <Users className="mr-3 h-10 w-10 md:h-12 md:w-12" />
          Top Observers
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          See who is leading the way in documenting biodiversity! (Based on mock data)
        </p>
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <Card className="shadow-lg max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Trophy className="mr-2 h-6 w-6 text-amber-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userObservationCounts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] text-center">Rank</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead className="text-center">Observations</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userObservationCounts.map((user, index) => (
                  <TableRow key={user.userId}>
                    <TableCell className="font-medium text-center">{index + 1}</TableCell>
                    <TableCell>{user.userId}</TableCell>
                    <TableCell className="text-center">{user.count}</TableCell>
                    <TableCell className="text-right">
                      {user.count >= 5 && (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                          <Trophy className="mr-1 h-3 w-3" />
                          Top Observer
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No observation data available to display leaderboard.</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
