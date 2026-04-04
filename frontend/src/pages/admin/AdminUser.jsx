import { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";

export default function AdminUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const limit = 10;

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const fetchUsers = useCallback(async (currentPage = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/users?page=${currentPage}&limit=${limit}`, { headers: getHeaders() });
      const data = res.data.data || res.data.users || res.data || [];
      setUsers(data);
      if (res.data.pagination) setPagination(res.data.pagination);
    } catch {
      setError("Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page);
  }, [page, fetchUsers]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;
    try {
      await api.delete(`/users/${id}`, { headers: getHeaders() });
      fetchUsers(page);
    } catch {
      setError("Không thể xóa người dùng.");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  const getAvatar = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "hsl(220 15% 10%)" }}
    >
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "hsl(210 40% 95%)" }}
          >
            Quản lý người dùng
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(210 20% 70%)" }}>
            {pagination ? `Tổng ${pagination.total} người dùng` : ""}
          </p>
        </div>
        <button
          onClick={() => fetchUsers(page)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
          style={{
            background: "hsl(0 80% 55%)",
            color: "white",
          }}
        >
          Làm mới
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-lg text-sm"
          style={{
            background: "hsl(0 80% 20%)",
            border: "1px solid hsl(0 80% 40%)",
            color: "hsl(0 80% 80%)",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "hsl(220 15% 14%)",
          border: "1px solid hsl(220 10% 25%)",
        }}
      >
        {/* Table Header */}
        <div
          className="grid grid-cols-12 px-6 py-3 text-xs font-semibold uppercase tracking-wider"
          style={{
            background: "hsl(220 15% 11%)",
            color: "hsl(210 20% 70%)",
            borderBottom: "1px solid hsl(220 10% 25%)",
          }}
        >
          <div className="col-span-1">#</div>
          <div className="col-span-4">Người dùng</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Ngày tạo</div>
          <div className="col-span-2 text-right">Hành động</div>
        </div>

        {/* Loading */}
        {loading && (
          <div
            className="py-16 text-center"
            style={{ color: "hsl(210 20% 70%)" }}
          >
            <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
            <p className="text-sm">Đang tải...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && users.length === 0 && !error && (
          <div
            className="py-16 text-center"
            style={{ color: "hsl(210 20% 70%)" }}
          >
            <p className="text-sm">Không có người dùng nào</p>
          </div>
        )}

        {/* Rows */}
        {!loading &&
          users.map((user, index) => (
            <div
              key={user._id}
              className="grid grid-cols-12 px-6 py-4 items-center transition-colors hover:bg-white/5"
              style={{ borderBottom: "1px solid hsl(220 10% 20%)" }}
            >
              {/* STT */}
              <div
                className="col-span-1 text-sm"
                style={{ color: "hsl(210 20% 70%)" }}
              >
                {(page - 1) * limit + index + 1}
              </div>

              {/* Avatar + Name */}
              <div className="col-span-4 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background: "hsl(0 80% 55%)",
                    color: "white",
                  }}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center">
                      {getAvatar(user.username)} {/* Fallback nếu không có ảnh */}
                    </div>
                  )}
                </div>
                <span
                  className="text-sm font-medium truncate"
                  style={{ color: "hsl(210 40% 95%)" }}
                >
                  {user.username || "—"}
                </span>
              </div>

              {/* Email */}
              <div
                className="col-span-3 text-sm truncate"
                style={{ color: "hsl(210 20% 70%)" }}
              >
                {user.email || "—"}
              </div>

              {/* Ngày tạo */}
              <div
                className="col-span-2 text-sm"
                style={{ color: "hsl(210 20% 70%)" }}
              >
                {formatDate(user.createdAt)}
              </div>

              {/* Actions */}
              <div className="col-span-2 flex justify-end gap-2">
                <button
                  onClick={() => handleDelete(user._id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                  style={{
                    background: "hsl(0 80% 20%)",
                    color: "hsl(0 80% 70%)",
                    border: "1px solid hsl(0 80% 35%)",
                  }}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm" style={{ color: "hsl(210 20% 70%)" }}>
            Trang {pagination.page} / {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30"
              style={{
                background: "hsl(220 15% 14%)",
                color: "hsl(210 40% 95%)",
                border: "1px solid hsl(220 10% 25%)",
              }}
            >
              ← Trước
            </button>

            {/* Page numbers */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === pagination.totalPages ||
                  Math.abs(p - page) <= 1,
              )
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span
                    key={`dot-${i}`}
                    className="px-2 py-2 text-sm"
                    style={{ color: "hsl(210 20% 70%)" }}
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="w-9 h-9 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background:
                        page === p ? "hsl(0 80% 55%)" : "hsl(220 15% 14%)",
                      color: page === p ? "white" : "hsl(210 40% 95%)",
                      border: `1px solid ${page === p ? "hsl(0 80% 55%)" : "hsl(220 10% 25%)"}`,
                    }}
                  >
                    {p}
                  </button>
                ),
              )}

            <button
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={!pagination.hasNext}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30"
              style={{
                background: "hsl(220 15% 14%)",
                color: "hsl(210 40% 95%)",
                border: "1px solid hsl(220 10% 25%)",
              }}
            >
              Tiếp →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
