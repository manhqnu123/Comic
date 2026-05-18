import { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";

export default function AdminRootPermissions() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Modal state
  const [modal, setModal] = useState({
    open: false,
    mode: "create",
    data: null,
  });
  const [formName, setFormName] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const limit = 15;

  const fetchPermissions = useCallback(
    async (currentPage = 1, searchVal = "") => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(
          `/permissions?page=${currentPage}&limit=${limit}&search=${searchVal}`,
        );
        setPermissions(res.data.permissions || []);
        if (res.data.pagination) setPagination(res.data.pagination);
      } catch {
        setError("Không thể tải danh sách quyền.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchPermissions(page, search);
  }, [page, search, fetchPermissions]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const openCreate = () => {
    setFormName("");
    setFormError("");
    setModal({ open: true, mode: "create", data: null });
  };

  const openEdit = (perm) => {
    setFormName(perm.name);
    setFormError("");
    setModal({ open: true, mode: "edit", data: perm });
  };

  const closeModal = () =>
    setModal({ open: false, mode: "create", data: null });

  const handleSubmit = async () => {
    if (!formName.trim()) {
      setFormError("Tên quyền không được để trống");
      return;
    }
    setFormLoading(true);
    setFormError("");
    try {
      if (modal.mode === "create") {
        await api.post("/permissions", { name: formName.trim() });
      } else {
        await api.put(`/permissions/${modal.data._id}`, {
          name: formName.trim(),
        });
      }
      closeModal();
      fetchPermissions(page, search);
    } catch (err) {
      setFormError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(
        `Xóa quyền "${name}"? Quyền này sẽ bị gỡ khỏi tất cả vai trò đang dùng.`,
      )
    )
      return;
    try {
      await api.delete(`/permissions/${id}`);
      fetchPermissions(page, search);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể xóa quyền.");
    }
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "hsl(220 15% 10%)" }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "hsl(210 40% 95%)" }}
          >
            Quản lý Quyền
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(210 20% 70%)" }}>
            {pagination ? `Tổng ${pagination.total} quyền` : ""}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
          style={{ background: "hsl(0 80% 55%)", color: "white" }}
        >
          + Tạo quyền mới
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Tìm kiếm quyền..."
          className="flex-1 px-4 py-2 rounded-lg text-sm outline-none"
          style={{
            background: "hsl(220 15% 14%)",
            border: "1px solid hsl(220 10% 25%)",
            color: "hsl(210 40% 95%)",
          }}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80"
          style={{
            background: "hsl(220 10% 20%)",
            color: "hsl(210 40% 95%)",
            border: "1px solid hsl(220 10% 25%)",
          }}
        >
          Tìm
        </button>
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setPage(1);
            }}
            className="px-4 py-2 rounded-lg text-sm hover:opacity-80"
            style={{
              background: "hsl(220 10% 20%)",
              color: "hsl(210 20% 70%)",
              border: "1px solid hsl(220 10% 25%)",
            }}
          >
            Xóa lọc
          </button>
        )}
      </form>

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
        {/* Header */}
        <div
          className="grid grid-cols-12 px-6 py-3 text-xs font-semibold uppercase tracking-wider"
          style={{
            background: "hsl(220 15% 11%)",
            color: "hsl(210 20% 70%)",
            borderBottom: "1px solid hsl(220 10% 25%)",
          }}
        >
          <div className="col-span-1">#</div>
          <div className="col-span-7">Tên quyền</div>
          <div className="col-span-4 text-right">Hành động</div>
        </div>

        {loading && (
          <div
            className="py-16 text-center"
            style={{ color: "hsl(210 20% 70%)" }}
          >
            <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
            <p className="text-sm">Đang tải...</p>
          </div>
        )}

        {!loading && permissions.length === 0 && !error && (
          <div
            className="py-16 text-center"
            style={{ color: "hsl(210 20% 70%)" }}
          >
            <p className="text-sm">Không có quyền nào</p>
          </div>
        )}

        {!loading &&
          permissions.map((perm, index) => (
            <div
              key={perm._id}
              className="grid grid-cols-12 px-6 py-4 items-center transition-colors hover:bg-white/5"
              style={{ borderBottom: "1px solid hsl(220 10% 20%)" }}
            >
              <div
                className="col-span-1 text-sm"
                style={{ color: "hsl(210 20% 70%)" }}
              >
                {(page - 1) * limit + index + 1}
              </div>
              <div className="col-span-7">
                <span
                  className="px-3 py-1 rounded-md text-xs font-mono font-medium"
                  style={{
                    background: "hsl(220 10% 20%)",
                    color: "hsl(0 80% 70%)",
                    border: "1px solid hsl(220 10% 30%)",
                  }}
                >
                  {perm.name}
                </span>
              </div>
              <div className="col-span-4 flex justify-end gap-2">
                <button
                  onClick={() => openEdit(perm)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                  style={{
                    background: "hsl(220 10% 22%)",
                    color: "hsl(210 40% 85%)",
                    border: "1px solid hsl(220 10% 30%)",
                  }}
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(perm._id, perm.name)}
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
            <button
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={page === pagination.totalPages}
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

      {/* Modal */}
      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="w-full max-w-md rounded-xl p-6"
            style={{
              background: "hsl(220 15% 14%)",
              border: "1px solid hsl(220 10% 25%)",
            }}
          >
            <h2
              className="text-lg font-bold mb-4"
              style={{ color: "hsl(210 40% 95%)" }}
            >
              {modal.mode === "create" ? "Tạo quyền mới" : "Chỉnh sửa quyền"}
            </h2>
            <div className="mb-4">
              <label
                className="block text-xs font-medium mb-2"
                style={{ color: "hsl(210 20% 70%)" }}
              >
                Tên quyền
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="VD: COMIC_READ"
                className="w-full px-4 py-2 rounded-lg text-sm outline-none font-mono"
                style={{
                  background: "hsl(220 15% 10%)",
                  border: `1px solid ${formError ? "hsl(0 80% 50%)" : "hsl(220 10% 25%)"}`,
                  color: "hsl(210 40% 95%)",
                }}
                autoFocus
              />
              {formError && (
                <p className="mt-2 text-xs" style={{ color: "hsl(0 80% 65%)" }}>
                  ⚠️ {formError}
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg text-sm hover:opacity-80"
                style={{
                  background: "hsl(220 10% 20%)",
                  color: "hsl(210 40% 95%)",
                  border: "1px solid hsl(220 10% 30%)",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={formLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 disabled:opacity-50"
                style={{ background: "hsl(0 80% 55%)", color: "white" }}
              >
                {formLoading
                  ? "Đang lưu..."
                  : modal.mode === "create"
                    ? "Tạo"
                    : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
