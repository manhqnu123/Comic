import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Menu,
  X,
  ChevronDown,
  BookOpen,
  LogOut,
  User,
  Bookmark,
  History,
  Settings,
  Shield,
} from "lucide-react";
import api from "@/api/axios";
import { useAuth } from "@/context/authContext";

const NAV_LINKS = [
  { label: "Mới cập nhật", to: "/moi-cap-nhat" },
  { label: "Top truyện", to: "/top-truyen" },
  { label: "Hoàn thành", to: "/hoan-thanh" },
];

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [genres, setGenres] = useState([]);
  const [genreOpen, setGenreOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const genreRef = useRef(null);
  const userRef = useRef(null);

  // Fetch genres
  useEffect(() => {
    api
      .get("/genres")
      .then((res) => setGenres(res.data.genres || res.data || []))
      .catch((err) => console.error("Error fetching genres:", err));
  }, []);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handler = (e) => {
      if (genreRef.current && !genreRef.current.contains(e.target))
        setGenreOpen(false);
      if (userRef.current && !userRef.current.contains(e.target))
        setUserDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setUserDropOpen(false);
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="max-w-[1200px] mx-auto px-4 h-[60px] flex items-center gap-3">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <BookOpen size={22} className="text-primary" />
          <span className="text-lg font-extrabold tracking-tight">
            Truyện<span className="text-primary">VN</span>
          </span>
        </Link>

        {/* NAV desktop */}
        <nav className="hidden md:flex items-center gap-1 flex-1 ml-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {/* Dropdown Thể loại */}
          <div className="relative" ref={genreRef}>
            <button
              onClick={() => setGenreOpen((v) => !v)}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
            >
              Thể loại
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${genreOpen ? "rotate-180" : ""}`}
              />
            </button>

            {genreOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="grid grid-cols-2 p-2 gap-0.5 max-h-72 overflow-y-auto">
                  {genres.length === 0 ? (
                    <p className="col-span-2 text-xs text-muted-foreground text-center py-4">
                      Đang tải...
                    </p>
                  ) : (
                    genres.map((genre) => (
                      <Link
                        key={genre._id}
                        to={`/the-loai/${genre.slug || genre._id}`}
                        onClick={() => setGenreOpen(false)}
                        className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors truncate"
                      >
                        {genre.name}
                      </Link>
                    ))
                  )}
                </div>
                <div className="border-t border-border p-2">
                  <Link
                    to="/the-loai"
                    onClick={() => setGenreOpen(false)}
                    className="block text-center text-xs text-primary hover:underline py-1"
                  >
                    Xem tất cả thể loại →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>

        <SearchBox
          className="hidden md:block w-56 shrink-0"
          onNavigate={() => {}}
        />

        {/* USER AREA desktop */}
        <div className="hidden md:block shrink-0">
          {user ? (
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setUserDropOpen((v) => !v)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary transition-colors"
              >
                <Avatar user={user} />
                <span className="text-sm font-medium max-w-[90px] truncate">
                  {user.username}
                </span>
                <ChevronDown
                  size={12}
                  className={`text-muted-foreground transition-transform duration-200 ${userDropOpen ? "rotate-180" : ""}`}
                />
              </button>

              {userDropOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
                  <div className="p-1">
                    <DropLink
                      to="/profile"
                      icon={<User size={14} />}
                      label="Trang cá nhân"
                      onClick={() => setUserDropOpen(false)}
                    />
                  
                    {user.role === "admin" && (
                      <DropLink
                        to="/admin"
                        icon={<Shield size={14} />}
                        label="Quản trị"
                        onClick={() => setUserDropOpen(false)}
                      />
                    )}
                  </div>
                  <div className="border-t border-border p-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                    >
                      <LogOut size={14} /> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-secondary transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>

        {/* HAMBURGER */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden ml-auto p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 flex flex-col gap-1">
          <SearchBox className="mb-2" onNavigate={() => setMobileOpen(false)} />

          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {/* Thể loại accordion mobile */}
          <div>
            <button
              onClick={() => setGenreOpen((v) => !v)}
              className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
            >
              Thể loại
              <ChevronDown
                size={14}
                className={`transition-transform ${genreOpen ? "rotate-180" : ""}`}
              />
            </button>
            {genreOpen && (
              <div className="grid grid-cols-2 gap-0.5 pl-2 pt-1 pb-2">
                {genres.map((genre) => (
                  <Link
                    key={genre._id}
                    to={`/the-loai/${genre.slug || genre._id}`}
                    onClick={() => {
                      setGenreOpen(false);
                      setMobileOpen(false);
                    }}
                    className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors truncate"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Auth mobile */}
          <div className="border-t border-border pt-2 mt-1">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 mb-1">
                  <Avatar user={user} />
                  <span className="text-sm font-medium">{user.username}</span>
                </div>
                <DropLink
                  to="/profile"
                  icon={<User size={14} />}
                  label="Trang cá nhân"
                  onClick={() => setMobileOpen(false)}
                />
                {user.role === "admin" && (
                  <DropLink
                    to="/admin"
                    icon={<Shield size={14} />}
                    label="Quản trị"
                    onClick={() => setMobileOpen(false)}
                  />
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-md transition-colors mt-1"
                >
                  <LogOut size={14} /> Đăng xuất
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-secondary transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}


function SearchBox({ className = "", onNavigate }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  // Đóng khi click ngoài
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounce gọi API
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await api.get(
          `/comics/search?keyword=${encodeURIComponent(q)}`,
        );
        setSearchResults((res.data || []).slice(0, 6));
        setSearchOpen(true);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/tim-kiem?q=${encodeURIComponent(q)}`);
    setSearchQuery("");
    setSearchOpen(false);
    onNavigate?.();
  };

  const handleSelect = (slug) => {
    navigate(`/truyen/${slug}`);
    setSearchQuery("");
    setSearchOpen(false);
    onNavigate?.();
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <form
        onSubmit={handleSubmit}
        className="flex items-center bg-input border border-border rounded-md overflow-hidden"
      >
        <input
          type="text"
          placeholder="Tìm truyện..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
          className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground px-3 py-2 w-full"
        />
        <button
          type="submit"
          className="px-3 py-2 text-muted-foreground hover:text-primary transition-colors shrink-0"
        >
          <Search size={15} />
        </button>
      </form>

      {searchOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
          {searchLoading ? (
            <p className="px-4 py-3 text-sm text-muted-foreground text-center">
              Đang tìm...
            </p>
          ) : searchResults.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground text-center">
              Không tìm thấy truyện nào
            </p>
          ) : (
            <>
              {searchResults.map((comic) => (
                <button
                  key={comic._id}
                  onClick={() => handleSelect(comic.slug)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-secondary transition-colors text-left"
                >
                  {comic.coverImg ? (
                    <img
                      src={comic.coverImg}
                      alt={comic.title}
                      className="w-9 h-12 object-cover rounded shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-12 bg-secondary rounded shrink-0 flex items-center justify-center">
                      <BookOpen size={14} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {comic.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {comic.author || "Đang cập nhật"}
                    </p>
                    {comic.genres?.length > 0 && (
                      <p className="text-xs text-primary truncate mt-0.5">
                        {comic.genres.map((g) => g.name || g).join(", ")}
                      </p>
                    )}
                  </div>
                </button>
              ))}
              <div className="border-t border-border">
                <button
                  onClick={handleSubmit}
                  className="w-full px-4 py-2.5 text-xs text-primary hover:bg-secondary transition-colors text-center"
                >
                  Xem tất cả kết quả cho &quot;{searchQuery}&quot; →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────
function Avatar({ user }) {
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.username}
        className="w-8 h-8 rounded-full object-cover border-2 border-primary shrink-0"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
      {user.username?.[0]?.toUpperCase() ?? "U"}
    </div>
  );
}

function DropLink({ to, icon, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
