
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
import { Trophy, Home, Users, AlertTriangle, RefreshCw } from "lucide-react";
import type { UserObservationCount } from '@/types';
import { getTopObserversAction } from '@/lib/actions';

export default function TopObserversPage() {
  const [userObservationCounts, setUserObservationCounts] = useState<UserObservationCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopObservers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTopObserversAction();
      if (result.success && result.data) {
        setUserObservationCounts(result.data);
      } else {
        setError(result.error || 'Failed to load top observers data.');
        setUserObservationCounts([]);
      }
    } catch (e) {
      console.error('Error fetching top observers:', e);
      setError((e as Error).message || 'An unexpected error occurred.');
      setUserObservationCounts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTopObservers();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center">
          <Users className="mr-3 h-10 w-10 md:h-12 md:w-12" />
          Top Observers
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          See who is leading the way in documenting biodiversity! (Data from MongoDB)
        </p>
        <div className="mt-6 space-x-2 flex justify-center items-center">
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" onClick={fetchTopObservers} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Leaderboard
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

          {!loading && error && (
            <div className="text-center py-10 bg-destructive/10 p-6 rounded-md">
              <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
              <p className="text-destructive text-lg font-semibold">Error Loading Leaderboard</p>
              <p className="text-destructive/80">{error}</p>
            </div>
          )}

          {!loading && !error && userObservationCounts.length > 0 && (
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
          {!loading && !error && userObservationCounts.length === 0 && (
            <p className="text-muted-foreground text-center py-4">No observation data available to display leaderboard.</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
