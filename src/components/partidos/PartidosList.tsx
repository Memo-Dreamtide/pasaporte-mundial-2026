"use client"

import { useState } from "react"
import PartidoCard from "./PartidoCard"
import { useRealtimeMatches } from "@/hooks/useRealtimeMatches"

type Team = {
  id: string
  name: string
  code: string
  flag_emoji: string
  group_letter: string
}

type Match = {
  id: string
  match_number: number
  home_team: Team
  away_team: Team
  home_score: number | null
  away_score: number | null
  stage: string
  group_letter: string | null
  match_date: string
  stadium: string
  city: string
  status: string
  minute?: number | null
  status_detail?: string | null
}

type FilterType = "todos" | "proximos" | "en_vivo" | "finalizados"

const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"]

const STAGE_LABELS: Record<string, string> = {
  group: "Fase de Grupos",
  round_of_32: "Dieciseisavos",
  round_of_16: "Octavos de Final",
  quarter: "Cuartos de Final",
  semi: "Semifinales",
  third_place: "Tercer Lugar",
  final: "Final",
}

export default function PartidosList({ matches: initialMatches }: { matches: Match[] }) {
  const [matches, setMatches] = useState<Match[]>(initialMatches)
  const [filter, setFilter] = useState<FilterType>("todos")
  const [groupFilter, setGroupFilter] = useState<string>("todos")

  // Subscribe to realtime match updates
  useRealtimeMatches((updatedMatch) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === updatedMatch.id
          ? {
              ...m,
              home_score: updatedMatch.home_score,
              away_score: updatedMatch.away_score,
              status: updatedMatch.status,
              minute: updatedMatch.minute,
              status_detail: updatedMatch.status_detail,
            }
          : m
      )
    )
  })

  const filtered = matches.filter((m) => {
    if (filter === "proximos" && m.status !== "scheduled") return false
    if (filter === "en_vivo" && m.status !== "live") return false
    if (filter === "finalizados" && m.status !== "finished") return false
    if (groupFilter !== "todos" && m.group_letter !== groupFilter) return false
    return true
  })

  const grouped = filtered.reduce((acc, match) => {
    const key = match.stage === "group"
      ? `Grupo ${match.group_letter}`
      : STAGE_LABELS[match.stage] || match.stage
    if (!acc[key]) acc[key] = []
    acc[key].push(match)
    return acc
  }, {} as Record<string, Match[]>)

  const filters: { key: FilterType; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "proximos", label: "Próximos" },
    { key: "en_vivo", label: "En Vivo" },
    { key: "finalizados", label: "Finalizados" },
  ]

  return (
    <div>
      {/* Status Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="px-4 py-2 rounded-full text-xs font-black tracking-wider whitespace-nowrap transition-all duration-200"
            style={{
              backgroundColor: filter === f.key ? "rgba(255,215,13,0.15)" : "rgba(255,255,255,0.04)",
              color: filter === f.key ? "#ffd70d" : "rgba(255,255,255,0.3)",
              border: filter === f.key ? "1px solid rgba(255,215,13,0.2)" : "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {f.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Group Filters */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setGroupFilter("todos")}
          className="px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider whitespace-nowrap transition-all"
          style={{
            backgroundColor: groupFilter === "todos" ? "rgba(42,193,5,0.15)" : "rgba(255,255,255,0.03)",
            color: groupFilter === "todos" ? "#2ac105" : "rgba(255,255,255,0.2)",
            border: groupFilter === "todos" ? "1px solid rgba(42,193,5,0.2)" : "1px solid rgba(255,255,255,0.04)",
          }}
        >
          TODOS
        </button>
        {GROUPS.map((g) => (
          <button
            key={g}
            onClick={() => setGroupFilter(g)}
            className="px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider whitespace-nowrap transition-all"
            style={{
              backgroundColor: groupFilter === g ? "rgba(42,193,5,0.15)" : "rgba(255,255,255,0.03)",
              color: groupFilter === g ? "#2ac105" : "rgba(255,255,255,0.2)",
              border: groupFilter === g ? "1px solid rgba(42,193,5,0.2)" : "1px solid rgba(255,255,255,0.04)",
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/15 text-sm">No hay partidos con este filtro</p>
        </div>
      ) : (
        Object.entries(grouped).map(([section, sectionMatches]) => (
          <div key={section} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#2ac105" }} />
              <h2 className="text-xs font-black tracking-wider uppercase" style={{ color: "#2ac105" }}>{section}</h2>
              <span className="text-white/10 text-[10px] font-semibold">{sectionMatches.length}</span>
            </div>
            <div className="space-y-2">
              {sectionMatches.map((match) => (
                <PartidoCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        ))
      )}

      <p className="text-center text-white/10 text-[10px] font-semibold mt-6 tracking-wider">
        {filtered.length} PARTIDO{filtered.length !== 1 ? "S" : ""}
      </p>
    </div>
  )
}
