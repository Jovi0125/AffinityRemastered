import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Connection Request System
 *
 * Flow:
 *  1. User A presses Connect → inserts row (sender=A, receiver=B, status='pending')
 *     → sends a notification to B
 *  2. User B sees request in Activity page
 *  3. B accepts → status='accepted', conversation auto-created, A gets notified
 *  4. B declines → status='declined'
 */
export function useConnections() {
  const supabase = createClient();

  /** Send a connection request. Returns "sent" or "already_sent". */
  const sendConnect = useCallback(
    async (myId: string, theirId: string): Promise<"sent" | "already_sent"> => {
      // Check if a request already exists in either direction
      const { data: existing } = await supabase
        .from("connections")
        .select("id, status")
        .or(
          `and(sender_id.eq.${myId},receiver_id.eq.${theirId}),` +
          `and(sender_id.eq.${theirId},receiver_id.eq.${myId})`
        )
        .maybeSingle();

      if (existing) return "already_sent";

      // Insert the pending request
      await supabase.from("connections").insert({
        sender_id: myId,
        receiver_id: theirId,
        status: "pending",
      });

      // Notify the receiver
      await supabase.from("notifications").insert({
        user_id: theirId,
        actor_id: myId,
        type: "connection_request",
        message: "sent you a connection request",
      });

      return "sent";
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  /** Accept an incoming connection request. */
  const acceptConnect = useCallback(
    async (connectionId: string, senderId: string, myId: string) => {
      // Update status
      await supabase
        .from("connections")
        .update({ status: "accepted" })
        .eq("id", connectionId);

      // Create conversation if it doesn't exist
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(participant_1.eq.${myId},participant_2.eq.${senderId}),` +
          `and(participant_1.eq.${senderId},participant_2.eq.${myId})`
        )
        .maybeSingle();

      if (!existing) {
        await supabase.from("conversations").insert({
          participant_1: myId,
          participant_2: senderId,
          last_message: "",
          last_message_at: new Date().toISOString(),
        });
      }

      // Notify the original sender that their request was accepted
      await supabase.from("notifications").insert({
        user_id: senderId,
        actor_id: myId,
        type: "connection_accepted",
        message: "accepted your connection request",
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  /** Decline an incoming connection request. */
  const declineConnect = useCallback(
    async (connectionId: string) => {
      await supabase
        .from("connections")
        .update({ status: "declined" })
        .eq("id", connectionId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return { sendConnect, acceptConnect, declineConnect };
}
