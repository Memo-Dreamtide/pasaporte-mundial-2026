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
  return `${hours}:${minutes} UTC`
}

export default function PartidoCard({ match }: { match: Match }) {
  const isLive = match.status === "live"
  const isFinished = match.status === "finished"

  return (
    <div className={`bg-white/5 rounded-xl p-4 border transition-colors hover:bg-white/10 ${
      isLive ? "border-red-500/50 shadow-lg shadow-red-500/10" : "border-white/10"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs">#{match.match_number}</span>
          {isLive && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse font-bold">
              EN VIVO
            </span>
          )}
          {isFinished && (
            <span className="bg-gray-600 text-white text-xs px-2 py-0.5 rounded-full">
              FINAL
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-xs">{formatDate(match.match_date)}</p>
          <p className="text-gray-500 text-xs">{formatTime(match.match_date)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-3xl">{match.home_team.flag_emoji}</span>
          <div>
            <p className="font-bold text-white text-sm">{match.home_team.name}</p>
            <p className="text-gray-500 text-xs">{match.home_team.code}</p>
          </div>
        </div>

        <div className="text-center px-4">
          {isFinished || isLive ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">{match.home_score}</span>
              <span className="text-gray-500">-</span>
              <span className="text-2xl font-bold text-white">{match.away_score}</span>
            </div>
          ) : (
            <span className="text-lg font-bold text-gray-600">vs</span>
          )}
        </div>

        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="text-right">
            <p className="font-bold text-white text-sm">{match.away_team.name}</p>
            <p className="text-gray-500 text-xs">{match.away_team.code}</p>
          </div>
          <span className="text-3xl">{match.away_team.flag_emoji}</span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <p className="text-gray-500 text-xs">{match.stadium}, {match.city}</p>
      </div>
    </div>
  )
}
