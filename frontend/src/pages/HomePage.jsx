import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  Flame,
  BookMarked,
  CheckCircle,
  Star,
  TrendingUp,
} from "lucide-react";
import Header from "@/components/header";
import api from "@/api/axios";

// ── Helpers ───────────────────────────────────────────────
const formatViews = (n = 0) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

const STATUS_MAP = {
  ongoing: {
    label: "Đang ra",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  completed: {
    label: "Hoàn thành",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  drop: {
    label: "Drop",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  "coming soon": {
    label: "Sắp ra",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
};

// ── Comic Card nhỏ ────────────────────────────────────────
function ComicCard({ comic, rank }) {
  return (
    <Link
      to={`/truyen/${comic.slug}`}
      className="group flex flex-col bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        {comic.coverImg ? (
          <img
            src={comic.coverImg}
            alt={comic.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <BookMarked size={32} className="text-muted-foreground" />
          </div>
        )}
        {/* Rank badge */}
        {rank && (
          <div
            className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
            ${
              rank === 1
                ? "bg-yellow-400 text-yellow-900"
                : rank === 2
                  ? "bg-gray-300 text-gray-700"
                  : rank === 3
                    ? "bg-amber-600 text-amber-100"
                    : "bg-black/60 text-white"
            }`}
          >
            {rank}
          </div>
        )}
        {/* Status */}
        {comic.status && (
          <div
            className={`absolute bottom-2 left-2 px-1.5 py-0.5 text-[10px] font-medium rounded border ${STATUS_MAP[comic.status]?.color ?? ""}`}
          >
            {STATUS_MAP[comic.status]?.label}
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-2.5 flex flex-col gap-1 flex-1">
        <p className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-tight">
          {comic.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {comic.author || "Đang cập nhật"}
        </p>
        <div className="flex items-center gap-1 mt-auto pt-1">
          <Eye size={11} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {formatViews(comic.views)}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Section Header ────────────────────────────────────────
function SectionHeader({ icon, title, to, linkLabel = "Xem tất cả →" }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <h2 className="text-lg font-bold">{title}</h2>
        <div className="w-1 h-1 rounded-full bg-primary" />
      </div>
      {to && (
        <Link
          to={to}
          className="text-xs text-primary hover:underline font-medium"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

// ── HERO SLIDER ───────────────────────────────────────────
function HeroSlider({ comics }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setCurrent((v) => (v + 1) % comics.length),
      5000,
    );
  };

  useEffect(() => {
    if (comics.length === 0) return;
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [comics.length]);

  const go = (dir) => {
    setCurrent((v) => (v + dir + comics.length) % comics.length);
    resetTimer();
  };

  if (comics.length === 0) {
    return (
      <div className="w-full h-[420px] bg-card rounded-xl animate-pulse" />
    );
  }

  const comic = comics[current];

  return (
    <div className="relative w-full h-[400px] md:h-[460px] rounded-xl overflow-hidden group">
      {/* Background blurred cover */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110 blur-sm transition-all duration-700"
        style={{ backgroundImage: `url(${comic.coverImg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      
      <div className="relative h-full flex items-end p-6 md:p-10 gap-6">
        
        <Link to={`/truyen/${comic.slug}`} className="hidden md:block shrink-0">
          <img
            src={comic.coverImg}
            alt={comic.title}
            className="w-36 h-52 object-cover rounded-lg shadow-2xl border border-white/10"
          />
        </Link>

        
        <div className="flex-1 min-w-0 pb-2">
          {/* Genres */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {comic.genres?.slice(0, 3).map((g) => (
              <Link
                key={g._id}
                to={`/the-loai/${g.slug || g._id}`}
                className="px-2 py-0.5 text-xs bg-primary/20 text-primary border border-primary/30 rounded-full hover:bg-primary/30 transition-colors"
              >
                {g.name}
              </Link>
            ))}
            {comic.status && (
              <span
                className={`px-2 py-0.5 text-xs rounded-full border ${STATUS_MAP[comic.status]?.color}`}
              >
                {STATUS_MAP[comic.status]?.label}
              </span>
            )}
          </div>

          <Link to={`/truyen/${comic.slug}`}>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-2 line-clamp-2 hover:text-primary transition-colors">
              {comic.title}
            </h1>
          </Link>
          <p className="text-sm text-gray-300 mb-3">
            {comic.author || "Đang cập nhật"}
          </p>
          <p className="text-sm text-gray-400 line-clamp-2 mb-4 max-w-xl">
            {comic.des}
          </p>

          <div className="flex items-center gap-4">
            <Link
              to={`/truyen/${comic.slug}`}
              className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              Đọc ngay
            </Link>
            <div className="flex items-center gap-1.5 text-gray-300 text-sm">
              <Eye size={14} />
              <span>{formatViews(comic.views)} lượt xem</span>
            </div>
          </div>
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={() => go(-1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => go(1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {comics.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrent(i);
              resetTimer();
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-primary" : "w-1.5 bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────
export default function HomePage() {
  const [sliderComics, setSliderComics] = useState([]);
  const [topComics, setTopComics] = useState([]);
  const [newComics, setNewComics] = useState([]);
  const [completedComics, setCompletedComics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [allRes] = await Promise.all([api.get("/comics?page=1")]);

        const all = allRes.data || [];

        // Slider: top 6 views cao nhất, random trong top 10
        const sorted = [...all].sort((a, b) => b.views - a.views);
        const top10 = sorted.slice(0, 10);
        const shuffled = top10.sort(() => Math.random() - 0.5).slice(0, 6);
        setSliderComics(shuffled);

        // Top views: top 8
        setTopComics(sorted.slice(0, 8));

        // Mới cập nhật: sort theo updatedAt
        const newest = [...all]
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 8);
        setNewComics(newest);

        // Hoàn thành
        const completed = all
          .filter((c) => c.status === "completed")
          .slice(0, 8);
        setCompletedComics(completed);
      } catch (err) {
        console.error("HomePage fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-[1200px] mx-auto px-4 py-6 space-y-10">
        {/* ── HERO SLIDER ── */}
        <section>
          <HeroSlider comics={sliderComics} />
        </section>

        {/* ── TOP VIEWS + MỚI CẬP NHẬT (2 cột) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mới cập nhật — chiếm 2/3 */}
          <section className="lg:col-span-2">
            <SectionHeader
              icon={<Clock size={18} />}
              title="Mới cập nhật"
              to="/moi-cap-nhat"
            />
            {loading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[2/3] bg-card rounded-lg animate-pulse"
                    />
                  ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {newComics.map((comic) => (
                  <ComicCard key={comic._id} comic={comic} />
                ))}
              </div>
            )}
          </section>

          {/* Top views — chiếm 1/3, dạng list */}
          <section>
            <SectionHeader
              icon={<TrendingUp size={18} />}
              title="Top lượt xem"
              to="/top-truyen"
            />
            {loading ? (
              <div className="space-y-3">
                {Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-card rounded-lg animate-pulse"
                    />
                  ))}
              </div>
            ) : (
              <div className="space-y-2">
                {topComics.map((comic, i) => (
                  <Link
                    key={comic._id}
                    to={`/truyen/${comic.slug}`}
                    className="flex items-center gap-3 p-2.5 bg-card border border-border rounded-lg hover:border-primary/40 hover:bg-secondary/50 transition-all group"
                  >
                    {/* Rank */}
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                      ${
                        i === 0
                          ? "bg-yellow-400 text-yellow-900"
                          : i === 1
                            ? "bg-gray-300 text-gray-700"
                            : i === 2
                              ? "bg-amber-600 text-amber-100"
                              : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </span>
                    {/* Cover nhỏ */}
                    {comic.coverImg ? (
                      <img
                        src={comic.coverImg}
                        alt={comic.title}
                        className="w-9 h-12 object-cover rounded shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-12 bg-secondary rounded shrink-0" />
                    )}
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {comic.title}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Eye size={11} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatViews(comic.views)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── TRUYỆN HOT (top 4, banner lớn) ── */}
        <section>
          <SectionHeader
            icon={<Flame size={18} />}
            title="Truyện hot"
            to="/top-truyen"
          />
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[2/3] bg-card rounded-lg animate-pulse"
                  />
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {topComics.slice(0, 4).map((comic, i) => (
                <ComicCard key={comic._id} comic={comic} rank={i + 1} />
              ))}
            </div>
          )}
        </section>

        {/* ── HOÀN THÀNH ── */}
        {completedComics.length > 0 && (
          <section>
            <SectionHeader
              icon={<CheckCircle size={18} />}
              title="Đã hoàn thành"
              to="/hoan-thanh"
            />
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                {Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[2/3] bg-card rounded-lg animate-pulse"
                    />
                  ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                {completedComics.map((comic) => (
                  <ComicCard key={comic._id} comic={comic} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── BANNER CTA ── */}
        <section className="relative rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/5 border border-primary/20 rounded-xl" />
          <div className="relative px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star size={16} className="text-primary fill-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Đề xuất cho bạn
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-1">
                Khám phá kho truyện đồ sộ
              </h3>
              <p className="text-muted-foreground text-sm">
                Hàng nghìn bộ truyện đang chờ bạn khám phá — cập nhật mỗi ngày.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link
                to="/the-loai"
                className="px-5 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
              >
                Duyệt thể loại
              </Link>
              <Link
                to="/moi-cap-nhat"
                className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Xem mới nhất
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer đơn giản */}
      <footer className="border-t border-border mt-12 py-8 text-center text-sm text-muted-foreground">
        <p>© 2025 TruyệnVN · Đọc truyện tranh online miễn phí</p>
      </footer>
    </div>
  );
}
