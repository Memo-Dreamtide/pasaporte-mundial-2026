"use client"

import { useState } from "react"

type NewsItem = {
  id: string
  title: string
  summary: string
  source_name: string
  source_url: string
  category: string
  image_type: string
  published_at: string
}

const IMAGE_MAP: Record<string, string> = {
  stadium: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&h=400&fit=crop",
  flags: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=400&h=400&fit=crop",
  players: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=400&fit=crop",
  general: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&h=400&fit=crop",
}

const CATEGORY_COLORS: Record<string, string> = {
  clasificacion: "#2ac105",
  organizacion: "#f10a3c",
  sedes: "#458fff",
  partidos: "#ffd70d",
  selecciones: "#ffd70d",
  general: "#458fff",
}

function timeAgo(dateStr: string) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  if (diffHours < 1) return "Hace momentos"
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays === 1) return "Ayer"
  return `Hace ${diffDays} días`
}

function NewsCard({ item, square }: { item: NewsItem; square?: boolean }) {
  const catColor = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.general
  return (
    <a
      href={item.source_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
      style={{ border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className={`relative ${square ? "aspect-square" : "aspect-[4/3]"}`}>
        <img
          src={IMAGE_MAP[item.image_type] || IMAGE_MAP.general}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(5,17,25,0.95) 0%, rgba(5,17,25,0.4) 40%, transparent 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="text-[8px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${catColor}20`, color: catColor }}
            >
              {item.category}
            </span>
            <span className="text-white/20 text-[9px]">{timeAgo(item.published_at)}</span>
          </div>
          <h3 className="text-white font-black text-xs leading-tight line-clamp-2">{item.title}</h3>
          <p className="text-white/20 text-[9px] font-semibold mt-1">{item.source_name}</p>
        </div>
      </div>
    </a>
  )
}

export default function NewsFeed({ news }: { news: NewsItem[] }) {
  const [modalOpen, setModalOpen] = useState(false)

  if (!news || news.length === 0) return null

  const featured = news.slice(0, 2)
  const allNews = news

  return (
    <>
      {/* Dashboard Preview - 2 cards side by side */}
      <div className="relative">
        <div className="grid grid-cols-2 gap-3">
          {featured.map((item) => (
            <NewsCard key={item.id} item={item} square />
          ))}
        </div>
        {/* Overlay button */}
        <button
          onClick={() => setModalOpen(true)}
          className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 hover:opacity-100 transition-opacity duration-300 z-10 cursor-pointer"
          style={{ background: "linear-gradient(to top, rgba(5,17,25,0.8) 0%, transparent 50%)" }}
        >
          <span
            className="text-[10px] font-black tracking-wider uppercase px-4 py-2 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: "rgba(69,143,255,0.2)", color: "#458fff", border: "1px solid rgba(69,143,255,0.3)" }}
          >
            VER TODAS LAS NOTICIAS
          </span>
        </button>
      </div>

      {/* Mobile tap hint */}
      <button
        onClick={() => setModalOpen(true)}
        className="w-full mt-2 py-2 text-center md:hidden"
      >
        <span className="text-[10px] font-bold tracking-wider" style={{ color: "#458fff" }}>VER TODAS LAS NOTICIAS</span>
      </button>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          style={{ backgroundColor: "rgba(5,17,25,0.9)", backdropFilter: "blur(12px)" }}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] rounded-t-2xl md:rounded-2xl overflow-hidden flex flex-col"
            style={{ backgroundColor: "rgba(10,25,40,0.98)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <h2 className="text-lg font-black text-white">NOTICIAS</h2>
                <p className="text-white/20 text-[10px] font-semibold">Últimas novedades del mundial</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 transition-colors text-lg"
                style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              >
                &times;
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1 p-4">
              <div className="grid grid-cols-2 gap-3">
                {allNews.map((item) => (
                  <NewsCard key={item.id} item={item} square />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
