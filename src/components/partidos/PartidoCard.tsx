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
  home_team: Team | null
  away_team: Team | null
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

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
  const days = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"]
  return `${days[date.getUTCDay()]}, ${date.getUTCDate()} ${months[date.getUTCMonth()]}`
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const hours = date.getUTCHours().toString().padStart(2, "0")
  const minutes = date.getUTCMinutes().toString().padStart(2, "0")
  return `${hours}:${minutes}`
}

const STAGE_LABELS: Record<string, string> = {
  round_of_32: "Dieciseisavos",
  round_of_16: "Octavos",
  quarter: "Cuartos",
  semi: "Semifinal",
  third_place: "3er Lugar",
  final: "Final",
}

export default function PartidoCard({ match }: { match: Match }) {
  const isLive = match.status === "live"
  const isFinished = match.status === "finished"
  const hasTeams = match.home_team && match.away_team

  return (
    <div
      className="rounded-xl p-4 transition-colors"
      style={{
        backgroundColor: isLive ? "rgba(241,10,60,0.06)" : "rgba(255,255,255,0.03)",
        border: isLive ? "1px solid rgba(241,10,60,0.2)" : "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {match.stage !== "group" && (
            <span className="text-[9px] font-black px-2 py-0.5 rounded" style={{ backgroundColor: "rgba(69,143,255,0.1)", color: "#458fff" }}>
              {STAGE_LABELS[match.stage] || match.stage}
            </span>
          )}
          {isLive && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1.5" style={{ backgroundColor: "rgba(241,10,60,0.2)", color: "#f10a3c" }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f10a3c] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f10a3c]" />
              </span>
              EN VIVO{match.minute ? ` ${match.minute}'` : ""}
            </span>
          )}
          {isFinished && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>
              FIN
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-white/30 text-[10px] font-semibold">{formatDate(match.match_date)}</p>
          <p className="text-white/15 text-[10px]">{formatTime(match.match_date)} UTC</p>
        </div>
      </div>

      {hasTeams ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-3xl">{match.home_team!.flag_emoji}</span>
            <div>
              <p className="font-black text-white text-sm">{match.home_team!.name}</p>
              <p className="text-white/20 text-[10px] font-semibold">{match.home_team!.code}</p>
            </div>
          </div>

          <div className="text-center px-4">
            {isFinished || isLive ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <span className={`text-3xl font-black ${isLive ? "text-white" : "text-white/70"}`}>{match.home_score}</span>
                  <span className="text-white/20 text-lg">:</span>
                  <span className={`text-3xl font-black ${isLive ? "text-white" : "text-white/70"}`}>{match.away_score}</span>
                </div>
                {isLive && match.minute && (
                  <span className="text-[9px] font-bold text-[#f10a3c] mt-0.5">{match.status_detail || `${match.minute}'`}</span>
                )}
                {isFinished && (
                  <span className="text-[9px] font-bold text-white/20 mt-0.5">FINAL</span>
                )}
              </div>
            ) : (
              <span className="text-white/10 text-sm font-black">VS</span>
            )}
          </div>

          <div className="flex items-center gap-3 flex-1 justify-end">
            <div className="text-right">
              <p className="font-black text-white text-sm">{match.away_team!.name}</p>
              <p className="text-white/20 text-[10px] font-semibold">{match.away_team!.code}</p>
            </div>
            <span className="text-3xl">{match.away_team!.flag_emoji}</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-3">
          <span className="text-white/10 text-xs font-black">POR DEFINIR</span>
        </div>
      )}

      <div className="mt-3 text-center">
        <p className="text-white/10 text-[10px] font-medium">{match.stadium}, {match.city}</p>
      </div>
    </div>
  )
}
