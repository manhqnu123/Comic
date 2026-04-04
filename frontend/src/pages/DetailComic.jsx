import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "@/context/authContext";
import Header from "@/components/header";

// ─── API helpers ──────────────────────────────────────────────────────────────
const fetchDetailComic = (slug) =>
  api.get(`/comics/${slug}`).then((r) => r.data);
const fetchChapters = (comicId) =>
  api.get(`/chapters/comic/${comicId}`).then((r) => r.data);
const fetchComments = (slug, page = 1) =>
  api.get(`/comments/comic/${slug}?page=${page}`).then((r) => r.data);
const fetchReplies = (commentId) =>
  api.get(`/comments/${commentId}/replies`).then((r) => r.data);
const postCommentApi = (body) =>
  api.post(`/comments`, body).then((r) => r.data);
const toggleFollowApi = (comicId) =>
  api.post(`/follow`, { comicId }).then((r) => r.data);
const likeCommentApi = (commentId) =>
  api.post(`/comments/${commentId}/like`).then((r) => r.data);
const checkFollowApi = (comicId) =>
  api.get(`/follow/check/${comicId}`).then((r) => r.data);

// ─── Status config ────────────────────────────────────────────────────────────
const statusConfig = {
  ongoing: { label: "Đang tiến hành", color: "#22c55e" },
  completed: { label: "Hoàn thành", color: "#3b82f6" },
  drop: { label: "Drop", color: "#ef4444" },
  "coming soon": { label: "Sắp ra mắt", color: "#f59e0b" },
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const EyeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const BookIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const ReplyIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="9 17 4 12 9 7" />
    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
  </svg>
);
const ChevronDown = ({ open }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    style={{
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 0.2s",
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ w = "100%", h = "16px", r = "6px" }) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: r,
      background: "hsl(220 10% 20%)",
      animation: "pulse 1.5s ease-in-out infinite",
    }}
  />
);

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

// ─── CommentItem ──────────────────────────────────────────────────────────────
function CommentItem({ comment, comicId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(comment.likes?.length ?? 0);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyCount, setReplyCount] = useState(comment.replyCount ?? 0);

  const timeAgo = (d) => {
    const s = (Date.now() - new Date(d)) / 1000;
    if (s < 60) return `${Math.floor(s)}s`;
    if (s < 3600) return `${Math.floor(s / 60)}p`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}n`;
  };

  const handleLike = async () => {
    if (!user) return navigate("/login");
    try {
      const data = await likeCommentApi(comment._id);
      setLikes(data.totalLikes);
      setLiked(data.liked);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoadReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }

    setLoadingReplies(true);
    try {
      const data = await fetchReplies(comment._id);
      setReplies(data);
      setReplyCount(data.length);
      setShowReplies(true);
    } catch (e) {
      console.error(e);
    }
    setLoadingReplies(false);
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    if (!user) return navigate("/login");
    try {
      const newReply = await postCommentApi({
        comic: comicId,
        content: replyText,
        parentComment: comment._id,
      });
      setReplies((prev) => [newReply, ...prev]);
      setShowReplies(true);
      setReplyText("");
      setShowReplyBox(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
      <Avatar user={comment.user} />
      <div style={{ flex: 1 }}>
        <div
          style={{
            background: "hsl(220 15% 14%)",
            borderRadius: 12,
            padding: "10px 14px",
            border: "1px solid hsl(220 10% 20%)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontWeight: 600,
                fontSize: 13,
                color: "hsl(210 40% 95%)",
              }}
            >
              {comment.user.username || "Ẩn danh"}
            </span>
            <span style={{ fontSize: 11, color: "hsl(210 20% 50%)" }}>
              {timeAgo(comment.createdAt)}
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: "hsl(210 30% 85%)",
              lineHeight: 1.6,
            }}
          >
            {comment.content}
          </p>
        </div>

        <div style={{ display: "flex", gap: 14, marginTop: 6, paddingLeft: 4 }}>
          <button
            onClick={handleLike}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: liked ? "hsl(0 80% 55%)" : "hsl(210 20% 60%)",
              fontSize: 12,
              padding: "2px 0",
            }}
          >
            <HeartIcon filled={liked} /> {likes > 0 && likes}
          </button>
          <button
            onClick={() => setShowReplyBox((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "hsl(210 20% 60%)",
              fontSize: 12,
              padding: "2px 0",
            }}
          >
            <ReplyIcon /> Trả lời
          </button>
          {(replyCount > 0 || replies.length > 0) && (
            <button
              onClick={handleLoadReplies}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "hsl(210 20% 60%)",
                fontSize: 12,
                padding: "2px 0",
              }}
            >
              {loadingReplies
                ? "..."
                : `${replyCount || replies.length} phản hồi`}
              <ChevronDown open={showReplies} />
            </button>
          )}
        </div>

        {showReplyBox && (
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Viết phản hồi..."
              onKeyDown={(e) => e.key === "Enter" && handleReply()}
              style={{
                flex: 1,
                background: "hsl(220 10% 18%)",
                border: "1px solid hsl(220 10% 28%)",
                borderRadius: 20,
                padding: "7px 14px",
                color: "hsl(210 40% 95%)",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              onClick={handleReply}
              style={{
                padding: "7px 16px",
                borderRadius: 20,
                background: "hsl(0 80% 55%)",
                border: "none",
                color: "#fff",
                fontSize: 13,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Gửi
            </button>
          </div>
        )}

        {showReplies &&
          replies.map((r) => (
            <div key={r._id} style={{ marginTop: 12 }}>
              <CommentItem comment={r} comicId={comicId} />
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DetailComic() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [comic, setComic] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentPage, setCommentPage] = useState(1);
  const [totalCommentPages, setTotalPages] = useState(1);
  const [commentText, setCommentText] = useState("");
  const [followed, setFollowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("chapters");
  const [sortChapter, setSortChapter] = useState("desc");
  const [expandedDesc, setExpandedDesc] = useState(false);

  // Load comic + chapters
  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      try {
        const comicData = await fetchDetailComic(slug);
        setComic(comicData);
        const chaptersData = await fetchChapters(comicData._id);
        setChapters(chaptersData);
      } catch (e) {
        console.error("Lỗi load comic:", e);
      }
      setLoading(false);
    })();
  }, [slug]);

  // ✅ Check follow khi đã có comic + user
  useEffect(() => {
    if (!comic || !user) return;

    (async () => {
      try {
        const data = await checkFollowApi(comic._id);
        setFollowed(data.followed);
      } catch (e) {
        console.error("Lỗi check follow:", e);
      }
    })();
  }, [comic, user]);

  // Load comments — lazy, chỉ khi bấm tab Bình luận
  useEffect(() => {
    if (tab !== "comments" || !comic) return;
    (async () => {
      try {
        const data = await fetchComments(slug, commentPage);
        setComments(data.comments ?? []);
        setTotalPages(data.totalPages ?? 1);
      } catch (e) {
        console.error("Lỗi load comments:", e);
      }
    })();
  }, [tab, commentPage, comic]);

  const handleFollow = async () => {
    if (!user) return navigate("/login");
    const prev = followed;
    setFollowed((v) => !v);
    try {
      const data = await toggleFollowApi(comic._id);
      setFollowed(data.followed);
    } catch (e) {
      setFollowed(prev);
      console.error("Lỗi follow:", e);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    if (!user) return navigate("/login");
    const content = commentText;
    const optimistic = {
      _id: `tmp_${Date.now()}`,
      content,
      user: { username: user.username || "Bạn", avatar: user.avatar || null },
      likes: [],
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [optimistic, ...prev]);
    setCommentText("");
    try {
      await postCommentApi({ comic: comic._id, content });
    } catch (e) {
      console.error("Lỗi gửi comment:", e);
      setComments((prev) => prev.filter((c) => c._id !== optimistic._id));
    }
  };

  const sortedChapters = [...chapters].sort((a, b) =>
    sortChapter === "desc"
      ? b.chapterNumber - a.chapterNumber
      : a.chapterNumber - b.chapterNumber,
  );

  const formatViews = (n) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
        ? `${(n / 1_000).toFixed(0)}K`
        : (n ?? 0);

  const statusInfo = statusConfig[comic?.status] ?? statusConfig.ongoing;

  return (
    <>
      <Header />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Noto+Sans:wght@400;500;600;700&display=swap');
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .detail-page       { animation: fadeUp .4s ease; }
        .chapter-row:hover { background: hsl(220 10% 18%) !important; }
        .btn-read:hover    { filter: brightness(1.15); transform: translateY(-1px); }
        .btn-follow:hover  { opacity: .88; }
        .tab-btn           { transition: all .2s; }
        .genre-tag:hover   { background: hsl(0 80% 55%) !important; color: white !important; }
      `}</style>

      <div
        className="detail-page"
        style={{
          minHeight: "100vh",
          background: "hsl(220 15% 10%)",
          color: "hsl(210 40% 95%)",
          fontFamily: "'Noto Sans', sans-serif",
          paddingBottom: 60,
        }}
      >
        {/* Hero blur banner */}
        <div style={{ position: "relative", height: 340, overflow: "hidden" }}>
          {comic?.coverImg && (
            <>
              <img
                src={comic.coverImg}
                alt=""
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "blur(28px) brightness(0.3)",
                  transform: "scale(1.1)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to bottom, transparent 40%, hsl(220 15% 10%))",
                }}
              />
            </>
          )}
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px" }}>
          {/* Comic info card */}
          <div
            style={{
              display: "flex",
              gap: 24,
              marginTop: -200,
              position: "relative",
              zIndex: 2,
              flexWrap: "wrap",
            }}
          >
            {/* Cover */}
            {loading ? (
              <Skeleton w="160px" h="224px" r="12px" />
            ) : (
              <img
                src={comic?.coverImg}
                alt={comic?.title}
                style={{
                  width: 160,
                  height: 224,
                  borderRadius: 12,
                  objectFit: "cover",
                  flexShrink: 0,
                  boxShadow: "0 8px 32px rgba(0,0,0,.6)",
                  border: "3px solid hsl(220 10% 25%)",
                }}
              />
            )}

            {/* Info */}
            <div style={{ flex: 1, minWidth: 220, paddingTop: 120 }}>
              {loading ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <Skeleton w="70%" h="28px" />
                  <Skeleton w="40%" h="16px" />
                  <Skeleton w="90%" h="16px" />
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 8 }}>
                    <span
                      style={{
                        background: statusInfo.color + "22",
                        color: statusInfo.color,
                        border: `1px solid ${statusInfo.color}55`,
                        borderRadius: 20,
                        padding: "3px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <h1
                    style={{
                      fontFamily: "'Bebas Neue', cursive",
                      fontSize: "clamp(28px, 5vw, 44px)",
                      margin: "0 0 4px",
                      letterSpacing: 1,
                      lineHeight: 1.1,
                    }}
                  >
                    {comic.title}
                  </h1>

                  <p
                    style={{
                      margin: "0 0 12px",
                      color: "hsl(210 20% 60%)",
                      fontSize: 13,
                    }}
                  >
                    Tác giả:{" "}
                    <span style={{ color: "hsl(0 80% 65%)", fontWeight: 600 }}>
                      {comic.author || "Đang cập nhật"}
                    </span>
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: 20,
                      marginBottom: 14,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "hsl(210 20% 65%)",
                        fontSize: 13,
                      }}
                    >
                      <EyeIcon /> {formatViews(comic.views)} lượt xem
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "hsl(210 20% 65%)",
                        fontSize: 13,
                      }}
                    >
                      <BookIcon /> {chapters.length} chương
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                      marginBottom: 18,
                    }}
                  >
                    {comic.genres?.map((g) => (
                      <span
                        key={g._id}
                        className="genre-tag"
                        style={{
                          background: "hsl(220 10% 20%)",
                          border: "1px solid hsl(220 10% 28%)",
                          borderRadius: 20,
                          padding: "3px 12px",
                          fontSize: 12,
                          cursor: "pointer",
                          transition: "all .2s",
                        }}
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      className="btn-read"
                      onClick={() =>
                        chapters.length > 0 &&
                        navigate(
                          `/chapter/${[...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber)[0]._id}`,
                        )
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "9px 20px",
                        borderRadius: 10,
                        background: "hsl(0 80% 55%)",
                        border: "none",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: "pointer",
                        transition: "all .2s",
                      }}
                    >
                      <BookIcon /> Đọc từ đầu
                    </button>
                    <button
                      className="btn-follow"
                      onClick={handleFollow}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "9px 20px",
                        borderRadius: 10,
                        background: followed
                          ? "hsl(0 80% 55%)"
                          : "hsl(220 10% 20%)",
                        border: `1px solid ${followed ? "transparent" : "hsl(220 10% 30%)"}`,
                        color: followed ? "#fff" : "hsl(210 40% 85%)",
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: "pointer",
                        transition: "all .2s",
                      }}
                    >
                      <HeartIcon filled={followed} />{" "}
                      {followed ? "Đang theo dõi" : "Theo dõi"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div
            style={{
              marginTop: 24,
              background: "hsl(220 15% 13%)",
              borderRadius: 12,
              padding: "16px 20px",
              border: "1px solid hsl(220 10% 20%)",
            }}
          >
            <h3
              style={{
                margin: "0 0 10px",
                fontSize: 13,
                fontWeight: 700,
                color: "hsl(210 20% 55%)",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Nội dung
            </h3>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Skeleton />
                <Skeleton w="80%" />
              </div>
            ) : (
              <>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    lineHeight: 1.8,
                    color: "hsl(210 30% 80%)",
                    display: "-webkit-box",
                    WebkitLineClamp: expandedDesc ? "unset" : 3,
                    WebkitBoxOrient: "vertical",
                    overflow: expandedDesc ? "visible" : "hidden",
                  }}
                >
                  {comic?.des || "Chưa có mô tả."}
                </p>
                {(comic?.des?.length ?? 0) > 150 && (
                  <button
                    onClick={() => setExpandedDesc((v) => !v)}
                    style={{
                      marginTop: 6,
                      background: "none",
                      border: "none",
                      color: "hsl(0 80% 60%)",
                      fontSize: 13,
                      cursor: "pointer",
                      padding: 0,
                      fontWeight: 600,
                    }}
                  >
                    {expandedDesc ? "Thu gọn ▲" : "Xem thêm ▼"}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              marginTop: 28,
              borderBottom: "2px solid hsl(220 10% 20%)",
            }}
          >
            {[
              {
                id: "chapters",
                label: `Danh sách chương (${chapters.length})`,
              },
              { id: "comments", label: "Bình luận" },
            ].map((t) => (
              <button
                key={t.id}
                className="tab-btn"
                onClick={() => setTab(t.id)}
                style={{
                  padding: "12px 20px",
                  background: "none",
                  border: "none",
                  borderBottom:
                    tab === t.id
                      ? "2px solid hsl(0 80% 55%)"
                      : "2px solid transparent",
                  marginBottom: -2,
                  color: tab === t.id ? "hsl(0 80% 60%)" : "hsl(210 20% 60%)",
                  fontWeight: tab === t.id ? 700 : 500,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Chapters tab */}
          {tab === "chapters" && (
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: 12,
                }}
              >
                <select
                  value={sortChapter}
                  onChange={(e) => setSortChapter(e.target.value)}
                  style={{
                    background: "hsl(220 10% 18%)",
                    border: "1px solid hsl(220 10% 28%)",
                    borderRadius: 8,
                    padding: "6px 12px",
                    color: "hsl(210 40% 85%)",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  <option value="desc">Mới nhất</option>
                  <option value="asc">Cũ nhất</option>
                </select>
              </div>
              <div
                style={{
                  background: "hsl(220 15% 13%)",
                  borderRadius: 12,
                  border: "1px solid hsl(220 10% 20%)",
                  overflow: "hidden",
                }}
              >
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid hsl(220 10% 18%)",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Skeleton w="40%" h="14px" />
                      <Skeleton w="20%" h="14px" />
                    </div>
                  ))
                ) : sortedChapters.length === 0 ? (
                  <p
                    style={{
                      textAlign: "center",
                      color: "hsl(210 20% 50%)",
                      padding: 32,
                    }}
                  >
                    Chưa có chương nào.
                  </p>
                ) : (
                  sortedChapters.map((ch, i) => (
                    <div
                      key={ch._id}
                      className="chapter-row"
                      onClick={() => navigate(`/chapter/${ch._id}`)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 16px",
                        borderBottom:
                          i < sortedChapters.length - 1
                            ? "1px solid hsl(220 10% 17%)"
                            : "none",
                        cursor: "pointer",
                        transition: "background .15s",
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>
                          Chương {ch.chapterNumber}
                        </span>
                        {ch.title && (
                          <span
                            style={{
                              marginLeft: 8,
                              color: "hsl(210 20% 65%)",
                              fontSize: 13,
                            }}
                          >
                            — {ch.title}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 16,
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            color: "hsl(210 20% 55%)",
                            fontSize: 12,
                          }}
                        >
                          <EyeIcon /> {formatViews(ch.views)}
                        </span>
                        <span
                          style={{ color: "hsl(210 20% 45%)", fontSize: 12 }}
                        >
                          {new Date(ch.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Comments tab */}
          {tab === "comments" && (
            <div style={{ marginTop: 20 }}>
              {/* Input box */}
              <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
                <img
                  src={
                    user?.avatar ||
                    `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.username ?? "guest"}`
                  }
                  alt=""
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: "2px solid hsl(220 10% 25%)",
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    background: "hsl(220 15% 13%)",
                    border: "1px solid hsl(220 10% 25%)",
                    borderRadius: 12,
                    padding: "10px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={
                      user
                        ? "Viết bình luận của bạn..."
                        : "Đăng nhập để bình luận..."
                    }
                    rows={2}
                    disabled={!user}
                    style={{
                      background: "none",
                      border: "none",
                      color: "hsl(210 40% 90%)",
                      fontSize: 14,
                      resize: "none",
                      outline: "none",
                      fontFamily: "inherit",
                      lineHeight: 1.6,
                      cursor: user ? "text" : "not-allowed",
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={handlePostComment}
                      disabled={!commentText.trim()}
                      style={{
                        padding: "7px 20px",
                        borderRadius: 8,
                        background: commentText.trim()
                          ? "hsl(0 80% 55%)"
                          : "hsl(220 10% 22%)",
                        border: "none",
                        color: commentText.trim() ? "#fff" : "hsl(210 20% 50%)",
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: commentText.trim() ? "pointer" : "default",
                        transition: "all .2s",
                      }}
                    >
                      Gửi
                    </button>
                  </div>
                </div>
              </div>

              {/* Comment list */}
              {comments.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "hsl(210 20% 50%)",
                    padding: 40,
                  }}
                >
                  Chưa có bình luận nào. Hãy là người đầu tiên! 🎉
                </p>
              ) : (
                comments.map((c) => (
                  <CommentItem key={c._id} comment={c} comicId={comic?._id} />
                ))
              )}

              {/* Pagination */}
              {totalCommentPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 8,
                    marginTop: 24,
                  }}
                >
                  {Array.from({ length: totalCommentPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCommentPage(i + 1)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        border: "1px solid",
                        borderColor:
                          commentPage === i + 1
                            ? "hsl(0 80% 55%)"
                            : "hsl(220 10% 28%)",
                        background:
                          commentPage === i + 1
                            ? "hsl(0 80% 55%)"
                            : "hsl(220 10% 18%)",
                        color:
                          commentPage === i + 1 ? "#fff" : "hsl(210 30% 70%)",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
