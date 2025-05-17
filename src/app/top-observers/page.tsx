
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Home, Users } from "lucide-react";

// Mock data for UserObservationCount as this page now uses mock data
interface UserObservationCount {
  userId: string;
  count: number;
}

// Mock data - in a real app, this would come from a backend or be processed from observations
const mockUserCounts: UserObservationCount[] = [
  { userId: "NatureFan123", count: 12 },
  { userId: "BirdWatcherPro", count: 8 },
  { userId: "WildernessExplorer", count: 5 },
  { userId: "BugFinder", count: 3 },
  { userId: "PlantLover", count: 1 },
];

export default function TopObserversPage() {
  const [userObservationCounts, setUserObservationCounts] = useState<UserObservationCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setLoading(true);
    setTimeout(() => {
      setUserObservationCounts(mockUserCounts.sort((a, b) => b.count - a.count));
      setLoading(false);
    }, 500); // Simulate network delay
  }, []);

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center">
          <Users className="mr-3 h-10 w-10 md:h-12 md:w-12" />
          Top Observers
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          See who is leading the way in documenting biodiversity! (Using Mock Data)
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
          {loading && (
            <div className="space-y-2 p-4">
              <Skeleton className="h-8 w-full rounded" />
              <Skeleton className="h-8 w-full rounded" />
              <Skeleton className="h-8 w-full rounded" />
              <Skeleton className="h-8 w-full rounded" />
              <Skeleton className="h-8 w-full rounded" />
            </div>
          )}

          {!loading && userObservationCounts.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] text-center">Rank</TableHead>
                  <TableHead>Observer Name</TableHead>
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
          )}
          {!loading && userObservationCounts.length === 0 && (
            <p className="text-muted-foreground text-center py-4">No observation data available to display leaderboard.</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
