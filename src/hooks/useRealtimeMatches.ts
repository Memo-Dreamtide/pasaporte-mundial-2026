"use client"

import { useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase-browser"
import type { RealtimeChannel } from "@supabase/supabase-js"

type MatchUpdate = {
  id: string
  home_score: number | null
  away_score: number | null
  status: string
  minute: number | null
  status_detail: string | null
  updated_at: string
}

/**
 * Hook that subscribes to Supabase Realtime changes on the `matches` table.
 * When a match row is updated, it calls onMatchUpdate with the new data.
 *
 * Usage:
 *   useRealtimeMatches((updatedMatch) => {
 *     setMatches(prev => prev.map(m => m.id === updatedMatch.id ? { ...m, ...updatedMatch } : m))
 *   })
 */
export function useRealtimeMatches(
  onMatchUpdate: (match: MatchUpdate) => void
) {
  const callbackRef = useRef(onMatchUpdate)
  callbackRef.current = onMatchUpdate

  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel

    channel = supabase
      .channel("matches-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "matches",
        },
        (payload) => {
          const newData = payload.new as MatchUpdate
          callbackRef.current(newData)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
}
