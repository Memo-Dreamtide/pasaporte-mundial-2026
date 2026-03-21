type Profile = { id: string; full_name: string; avatar_url: string | null; total_points: number; exact_scores: number; predictions_count: number; streak: number; rank_position: number | null }

export default function RankingTable({ profiles, currentUserId, myProfile }: { profiles: Profile[]; currentUserId: string; myProfile: Profile | null }) {
  return (
    <div>
      {/* My Position */}
      {myProfile && (
        <div className="rounded-2xl p-4 mb-6" style={{ background: "linear-gradient(135deg, rgba(255,215,13,0.1), rgba(69,143,255,0.05))", border: "1px solid rgba(255,215,13,0.15)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black" style={{ color: "#ffd70d" }}>#{myProfile.rank_position || "-"}</span>
              <div>
                <p className="font-black text-white text-sm">{myProfile.full_name || "Sin nombre"}</p>
                <p className="text-white/20 text-[10px] font-semibold">TU POSICIÓN</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-black" style={{ color: "#ffd70d" }}>{myProfile.total_points}</p>
              <p className="text-white/20 text-[10px] font-semibold">PTS</p>
            </div>
          </div>
        </div>
      )}

      {profiles.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/20 text-sm font-semibold mb-2">Sin datos todavía</p>
          <p className="text-white/10 text-xs">El ranking se actualizará cuando se calculen los puntos</p>
        </div>
      ) : (
        <div className="space-y-2">
          {profiles.map((profile, index) => {
            const position = index + 1
            const isCurrentUser = profile.id === currentUserId
            const isTop3 = position <= 3

            const posColors: Record<number, string> = { 1: "#ffd70d", 2: "#458fff", 3: "#f10a3c" }
            const posColor = posColors[position] || "rgba(255,255,255,0.3)"

            return (
              <div
                key={profile.id}
                className="rounded-xl p-4 transition-colors"
                style={{
                  backgroundColor: isCurrentUser ? "rgba(255,215,13,0.06)" : "rgba(255,255,255,0.03)",
                  border: isCurrentUser ? "1px solid rgba(255,215,13,0.15)" : "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 text-center text-lg font-black" style={{ color: posColor }}>{position}</span>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
                      {profile.full_name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">
                        {profile.full_name || "Sin nombre"}
                        {isCurrentUser && <span className="text-[10px] font-black ml-1.5" style={{ color: "#ffd70d" }}>(TÚ)</span>}
                      </p>
                      <p className="text-white/15 text-[10px] font-semibold">{profile.exact_scores} exactos · Racha {profile.streak}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg" style={{ color: isTop3 ? posColor : "white" }}>{profile.total_points}</p>
                    <p className="text-white/15 text-[10px] font-semibold">PTS</p>
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
