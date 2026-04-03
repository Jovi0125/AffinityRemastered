"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";

export function useBlocks() {
  const { user } = useAuth();
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchBlocks = useCallback(async () => {
    if (!user) {
      setBlockedIds([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("blocks")
      .select("blocked_id")
      .eq("blocker_id", user.id);

    if (data) {
      setBlockedIds(data.map((b: { blocked_id: string }) => b.blocked_id));
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  const blockUser = useCallback(
    async (blockedId: string) => {
      if (!user) return;
      await supabase
        .from("blocks")
        .insert({ blocker_id: user.id, blocked_id: blockedId });
      setBlockedIds((prev) => [...prev, blockedId]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
  );

  const unblockUser = useCallback(
    async (blockedId: string) => {
      if (!user) return;
      await supabase
        .from("blocks")
        .delete()
        .eq("blocker_id", user.id)
        .eq("blocked_id", blockedId);
      setBlockedIds((prev) => prev.filter((id) => id !== blockedId));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
  );

  const isBlocked = useCallback(
    (userId: string) => blockedIds.includes(userId),
    [blockedIds]
  );

  return { blockedIds, loading, blockUser, unblockUser, isBlocked, refetch: fetchBlocks };
}
