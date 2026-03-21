type Team = {
  id: string
  name: string
  code: string
  flag_emoji: string
  group_letter: string
  confederation: string
}

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
          <div
            key={letter}
            className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
          >
            <div className="bg-white/5 px-4 py-3 border-b border-white/10">
              <h3 className="font-bold text-green-400">Grupo {letter}</h3>
            </div>
            <div className="divide-y divide-white/5">
              {groupTeams.map((team) => (
                <div key={team.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-2xl">{team.flag_emoji}</span>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{team.name}</p>
                    <p className="text-gray-500 text-xs">{team.confederation}</p>
                  </div>
                  <span className="text-gray-600 text-xs">{team.code}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
