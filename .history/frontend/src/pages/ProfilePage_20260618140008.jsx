import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/api/axios";
import Headers from "@/components/header";

function Avatar({ user, size = "sm" }) {
  const sizes = {
    sm: "w-8 h-8 text-sm",
    lg: "w-16 h-16 text-2xl",
  };
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.username}
        className={`${sizes[size]} rounded-full object-cover border-2 border-primary shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${sizes[size]} rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0`}
    >
      {user?.username?.[0]?.toUpperCase() ?? "U"}
    </div>
  );
}

function InfoCard({ label, value, highlight }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5">
        {label}
      </p>
      <p
        className={`text-sm font-medium ${highlight ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </p>
    </div>
  );
}

function ComicListItem({ title, sub, icon = "📖", href }) {
  const Wrapper = href ? Link : "div";

  return (
    <Wrapper
      to={href}
      className="flex items-center gap-3 bg-card border border-border hover:border-primary rounded-lg p-3 mb-2 cursor-pointer transition-colors"
    >
      <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center text-lg shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <span className="text-muted-foreground text-lg">›</span>
    </Wrapper>
  );
}

const TABS = [
  { key: "info", label: "Thông tin" },
  { key: "follow", label: "Theo dõi" },
  { key: "history", label: "Lịch sử" },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [follows, setFollows] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("info");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/users/profile")
      .then((res) => setProfile(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab !== "follow") return;
    api
      .get("/follow/followed")
      .then((res) => setFollows(res.data))
      .catch(console.error);
  }, [tab]);

  useEffect(() => {
    if (tab !== "history") return;
    api
      .get("/history")
      .then((res) => setHistory(res.data))
      .catch(console.error);
  }, [tab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 text-muted-foreground">
        Đang tải...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-64 text-muted-foreground">
        Không tìm thấy thông tin
      </div>
    );
  }

  return (
    <>
      <Headers />
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {/* Profile header */}
        <div className="relative bg-card border border-border rounded-xl p-5 flex items-center gap-4 overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-primary/10 pointer-events-none" />
          <Avatar user={profile} size="lg" />
          <div>
            <h1 className="text-lg font-semibold">{profile.username}</h1>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <span className="inline-block mt-2 text-xs bg-primary/20 text-primary px-3 py-0.5 rounded-full font-medium">
              Thành viên
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                tab === key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Info tab */}
        {tab === "info" && (
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Tên người dùng" value={profile.username} />
            <InfoCard label="Email" value={profile.email} />
            <InfoCard
              label="Ngày tham gia"
              value={new Date(profile.createdAt).toLocaleDateString("vi-VN")}
            />
            <InfoCard label="Trạng thái" value="● Hoạt động" highlight />
          </div>
        )}

        {/* Follow tab */}
        {tab === "follow" && (
          <div>
            {follows.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 text-sm">
                Chưa theo dõi truyện nào
              </p>
            ) : (
              follows.map((f) => (
                <ComicListItem
                  key={f._id}
                  title={f.comic?.title}
                  href={`/truyen/${f.comic?.slug}`}
                />
              ))
            )}
          </div>
        )}

        {/* History tab */}
        {tab === "history" && (
          <div>
            {history.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 text-sm">
                Chưa có lịch sử đọc
              </p>
            ) : (
              history.map((h) => (
                <ComicListItem
                  key={h._id}
                  icon="🕐"
                  title={h.comic?.title}
                  sub={`Chapter ${h.chapter?.chapterNumber}`}
                />
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
