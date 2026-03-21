"use client"

import { useState } from "react"
import PartidoCard from "./PartidoCard"

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
}

type FilterType = "todos" | "proximos" | "en_vivo" | "finalizados"
type GroupFilter = "todos" | string

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

export default function PartidosList({ matches }: { matches: Match[] }) {
  const [filter, setFilter] = useState<FilterType>("todos")
  const [groupFilter, setGroupFilter] = useState<GroupFilter>("todos")

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

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {(["todos", "proximos", "en_vivo", "finalizados"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? "bg-yellow-500 text-black"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            {f === "todos" && "Todos"}
            {f === "proximos" && "Próximos"}
            {f === "en_vivo" && "En Vivo"}
            {f === "finalizados" && "Finalizados"}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setGroupFilter("todos")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            groupFilter === "todos"
              ? "bg-green-500 text-black"
              : "bg-white/10 text-gray-400 hover:bg-white/20"
          }`}
        >
          Todos
        </button>
        {GROUPS.map((g) => (
          <button
            key={g}
            onClick={() => setGroupFilter(g)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              groupFilter === g
                ? "bg-green-500 text-black"
                : "bg-white/10 text-gray-400 hover:bg-white/20"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p>No hay partidos con este filtro</p>
        </div>
      ) : (
        Object.entries(grouped).map(([section, sectionMatches]) => (
          <div key={section} className="mb-8">
            <h2 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              {section}
            </h2>
            <div className="space-y-3">
              {sectionMatches.map((match) => (
                <PartidoCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        ))
      )}

      <p className="text-center text-gray-600 text-sm mt-8">
        {filtered.length} partido{filtered.length !== 1 ? "s" : ""}
      </p>
    </div>
  )
}
