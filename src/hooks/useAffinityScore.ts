"use client";

import { useMemo } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

interface AffinityResult {
  score: number; // 0–100
  sharedInterests: string[];
  totalUnique: number;
}

export function useAffinityScore(otherInterests: string[]): AffinityResult {
  const { profile } = useAuth();

  return useMemo(() => {
    const myInterests = profile?.interests || [];
    if (myInterests.length === 0 || otherInterests.length === 0) {
      return { score: 0, sharedInterests: [], totalUnique: 0 };
    }

    const mySet = new Set(myInterests);
    const shared = otherInterests.filter((i) => mySet.has(i));
    const totalUnique = new Set([...myInterests, ...otherInterests]).size;

    // Jaccard-like similarity: shared / total unique interests
    const score = totalUnique > 0 ? Math.round((shared.length / totalUnique) * 100) : 0;

    return { score, sharedInterests: shared, totalUnique };
  }, [profile?.interests, otherInterests]);
}

// Standalone function for sorting (doesn't need hook context)
export function calculateAffinityScore(
  myInterests: string[],
  otherInterests: string[]
): number {
  if (myInterests.length === 0 || otherInterests.length === 0) return 0;
  const mySet = new Set(myInterests);
  const shared = otherInterests.filter((i) => mySet.has(i));
  const totalUnique = new Set([...myInterests, ...otherInterests]).size;
  return totalUnique > 0 ? Math.round((shared.length / totalUnique) * 100) : 0;
}
