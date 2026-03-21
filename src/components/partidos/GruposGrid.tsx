type Team = { id: string; name: string; code: string; flag_emoji: string; group_letter: string; confederation: string }

const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"]

export default function GruposGrid({ teams }: { teams: Team[] }) {
  const grouped = teams.reduce((acc, team) => {
    if (!acc[team.group_letter]) acc[team.group_letter] = []
    acc[team.group_letter].push(team)
    return acc
  }, {} as Record<string, Team[]>)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {GROUPS.map((letter) => {
        const groupTeams = grouped[letter] || []
        return (
          <div key={letter} className="rounded-2xl overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <h3 className="text-xs font-black tracking-wider" style={{ color: "#2ac105" }}>GRUPO {letter}</h3>
            </div>
            <div>
              {groupTeams.map((team, i) => (
                <div
                  key={team.id}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderBottom: i < groupTeams.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}
                >
                  <span className="text-2xl">{team.flag_emoji}</span>
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm">{team.name}</p>
                    <p className="text-white/15 text-[10px] font-semibold">{team.confederation}</p>
                  </div>
                  <span className="text-white/10 text-[10px] font-black">{team.code}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
