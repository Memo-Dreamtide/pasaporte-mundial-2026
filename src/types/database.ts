export type Team = {
  id: string
  name: string
  code: string
  flag_emoji: string
  group_letter: string
  confederation: string
  created_at: string
}

export type Match = {
  id: string
  match_number: number
  home_team_id: string
  away_team_id: string
  home_score: number | null
  away_score: number | null
  stage: 'group' | 'round_of_32' | 'round_of_16' | 'quarter' | 'semi' | 'third_place' | 'final'
  group_letter: string | null
  match_date: string
  stadium: string
  city: string
  status: 'scheduled' | 'live' | 'in_progress' | 'finished' | 'postponed'
  created_at: string
}

export type Prediction = {
  id: string
  user_id: string
  match_id: string
  home_score: number
  away_score: number
  scorer_name: string | null
  points_earned: number | null
  created_at: string
  updated_at: string
}

export type Profile = {
  id: string
  email: string
  full_name: string
  phone: string | null
  doc_type: 'dui' | 'residencia'
  dui: string | null
  residencia: string | null
  avatar_url: string | null
  department: string | null
  total_points: number
  rank_position: number | null
  predictions_count: number
  exact_scores: number
  streak: number
  is_admin: boolean
  created_at: string
}

export type Prize = {
  id: string
  place: number
  prize_name: string
  prize_description: string
  sponsor_name: string
  sponsor_logo: string | null
  winner_id: string | null
  created_at: string
}

export type WeeklyRaffle = {
  id: string
  week_number: number
  prize_name: string
  sponsor_name: string
  draw_date: string
  winner_id: string | null
  participants_count: number
  created_at: string
}

export type Sponsor = {
  id: string
  name: string
  logo_url: string
  category: 'platino' | 'oro' | 'plata'
  website: string | null
  active: boolean
  created_at: string
}

export type Banner = {
  id: string
  position: number
  title: string
  image_url: string
  link: string | null
  sponsor_id: string | null
  active: boolean
  created_at: string
}
