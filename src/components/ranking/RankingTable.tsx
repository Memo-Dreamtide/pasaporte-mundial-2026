type Profile = {
  id: string
  full_name: string
  avatar_url: string | null
  total_points: number
  exact_scores: number
  predictions_count: number
  streak: number
  rank_position: number | null
}

const POSITION_STYLES: Record<number, string> = {
  1: "text-yellow-400 font-bold text-lg",
  2: "text-gray-300 font-bold text-lg",
  3: "text-amber-600 font-bold text-lg",
}

const POSITION_BADGES: Record<number, string> = {
  1: "bg-yellow-500/20 border-yellow-500/30",
  2: "bg-gray-400/20 border-gray-400/30",
  3: "bg-amber-600/20 border-amber-600/30",
}

export default function RankingTable({
  profiles,
  currentUserId,
  myProfile,
}: {
  profiles: Profile[]
  currentUserId: string
  myProfile: Profile | null
}) {
  return (
    <div>
      {myProfile && (
        <div className="bg-white/5 rounded-xl p-4 border border-yellow-500/20 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-bold text-lg">
                #{myProfile.rank_position || "-"}
              </span>
              <div>
                <p className="font-bold text-white">{myProfile.full_name || "Sin nombre"}</p>
                <p className="text-gray-500 text-xs">Tu posición actual</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-yellow-400 font-bold text-xl">{myProfile.total_points} pts</p>
              <p className="text-gray-500 text-xs">
                {myProfile.exact_scores} exactos | {myProfile.predictions_count} pronósticos
              </p>
            </div>
          </div>
        </div>
      )}

      {profiles.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg mb-2">Sin datos todavía</p>
          <p className="text-sm">El ranking se actualizará cuando se calculen los puntos de los partidos finalizados.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {profiles.map((profile, index) => {
            const position = index + 1
            const isCurrentUser = profile.id === currentUserId
            const isTop5 = position <= 5

            return (
              <div
                key={profile.id}
                className={`rounded-xl p-4 border transition-colors ${
                  isCurrentUser
                    ? "bg-yellow-500/10 border-yellow-500/30"
                    : isTop5
                    ? `bg-white/5 ${POSITION_BADGES[position] || "border-white/10"}`
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className={`w-8 text-center ${POSITION_STYLES[position] || "text-gray-400"}`}>
                      {position}
                    </span>
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm font-bold text-white">
                      {profile.full_name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className={`font-medium ${isCurrentUser ? "text-yellow-400" : "text-white"}`}>
                        {profile.full_name || "Sin nombre"}
                        {isCurrentUser && <span className="text-xs text-yellow-500 ml-2">(Tú)</span>}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {profile.exact_scores} exactos | Racha: {profile.streak}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${isTop5 ? "text-yellow-400" : "text-white"}`}>
                      {profile.total_points}
                    </p>
                    <p className="text-gray-500 text-xs">pts</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
