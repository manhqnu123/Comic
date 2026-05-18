import { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";

export default function AdminRootRoles() {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal
  const [modal, setModal] = useState({
    open: false,
    mode: "create",
    data: null,
  });
  const [formName, setFormName] = useState("");
  const [formPerms, setFormPerms] = useState([]); // mảng permission _id được chọn
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/roles");
      setRoles(res.data.roles || res.data || []);
    } catch {
      setError("Không thể tải danh sách vai trò.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllPermissions = useCallback(async () => {
    try {
      const res = await api.get("/permissions?limit=100");
      setAllPermissions(res.data.permissions || []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchAllPermissions();
  }, [fetchRoles, fetchAllPermissions]);

  const openCreate = () => {
    setFormName("");
    setFormPerms([]);
    setFormError("");
    setModal({ open: true, mode: "create", data: null });
  };

  const openEdit = (role) => {
    setFormName(role.name);
    setFormPerms(role.permissions?.map((p) => p._id || p) || []);
    setFormError("");
    setModal({ open: true, mode: "edit", data: role });
  };

  const closeModal = () =>
    setModal({ open: false, mode: "create", data: null });

  const togglePerm = (id) => {
    setFormPerms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      setFormError("Tên vai trò không được để trống");
      return;
    }
    setFormLoading(true);
    setFormError("");
    try {
      if (modal.mode === "create") {
        await api.post("/roles", {
          name: formName.trim(),
          permissions: formPerms,
        });
      } else {
        await api.put(`/roles/${modal.data._id}`, {
          name: formName.trim(),
          permissions: formPerms,
        });
      }
      closeModal();
      fetchRoles();
    } catch (err) {
      setFormError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa vai trò "${name}"?`)) return;
    try {
      await api.delete(`/roles/${id}`);
      fetchRoles();
    } catch (err) {
      setError(err.response?.data?.message || "Không thể xóa vai trò.");
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
            Quản lý Vai trò
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(210 20% 70%)" }}>
            {roles.length} vai trò trong hệ thống
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80"
          style={{ background: "hsl(0 80% 55%)", color: "white" }}
        >
          + Tạo vai trò mới
        </button>
      </div>

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
        <div
          className="grid grid-cols-12 px-6 py-3 text-xs font-semibold uppercase tracking-wider"
          style={{
            background: "hsl(220 15% 11%)",
            color: "hsl(210 20% 70%)",
            borderBottom: "1px solid hsl(220 10% 25%)",
          }}
        >
          <div className="col-span-1">#</div>
          <div className="col-span-3">Tên vai trò</div>
          <div className="col-span-6">Quyền được gán</div>
          <div className="col-span-2 text-right">Hành động</div>
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

        {!loading && roles.length === 0 && !error && (
          <div
            className="py-16 text-center"
            style={{ color: "hsl(210 20% 70%)" }}
          >
            <p className="text-sm">Không có vai trò nào</p>
          </div>
        )}

        {!loading &&
          roles.map((role, index) => (
            <div
              key={role._id}
              className="grid grid-cols-12 px-6 py-4 items-start transition-colors hover:bg-white/5"
              style={{ borderBottom: "1px solid hsl(220 10% 20%)" }}
            >
              <div
                className="col-span-1 text-sm pt-1"
                style={{ color: "hsl(210 20% 70%)" }}
              >
                {index + 1}
              </div>
              <div className="col-span-3 pt-1">
                <span
                  className="text-sm font-semibold"
                  style={{ color: "hsl(210 40% 95%)" }}
                >
                  {role.name}
                </span>
              </div>
              <div className="col-span-6 flex flex-wrap gap-1">
                {role.permissions?.length > 0 ? (
                  role.permissions.map((p) => (
                    <span
                      key={p._id || p}
                      className="px-2 py-0.5 rounded text-xs font-mono"
                      style={{
                        background: "hsl(220 10% 20%)",
                        color: "hsl(0 80% 70%)",
                        border: "1px solid hsl(220 10% 28%)",
                      }}
                    >
                      {p.name || p}
                    </span>
                  ))
                ) : (
                  <span
                    className="text-xs"
                    style={{ color: "hsl(210 20% 50%)" }}
                  >
                    Chưa có quyền
                  </span>
                )}
              </div>
              <div className="col-span-2 flex justify-end gap-2 pt-1">
                <button
                  onClick={() => openEdit(role)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-80"
                  style={{
                    background: "hsl(220 10% 22%)",
                    color: "hsl(210 40% 85%)",
                    border: "1px solid hsl(220 10% 30%)",
                  }}
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(role._id, role.name)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-80"
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

      {/* Modal */}
      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="w-full max-w-lg rounded-xl p-6"
            style={{
              background: "hsl(220 15% 14%)",
              border: "1px solid hsl(220 10% 25%)",
            }}
          >
            <h2
              className="text-lg font-bold mb-4"
              style={{ color: "hsl(210 40% 95%)" }}
            >
              {modal.mode === "create"
                ? "Tạo vai trò mới"
                : `Chỉnh sửa: ${modal.data?.name}`}
            </h2>

            {/* Tên vai trò */}
            <div className="mb-4">
              <label
                className="block text-xs font-medium mb-2"
                style={{ color: "hsl(210 20% 70%)" }}
              >
                Tên vai trò
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="VD: moderator"
                className="w-full px-4 py-2 rounded-lg text-sm outline-none"
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

            {/* Chọn quyền */}
            <div className="mb-5">
              <label
                className="block text-xs font-medium mb-2"
                style={{ color: "hsl(210 20% 70%)" }}
              >
                Gán quyền ({formPerms.length}/{allPermissions.length} đã chọn)
              </label>
              <div
                className="rounded-lg p-3 max-h-52 overflow-y-auto flex flex-wrap gap-2"
                style={{
                  background: "hsl(220 15% 10%)",
                  border: "1px solid hsl(220 10% 25%)",
                }}
              >
                {allPermissions.map((perm) => {
                  const selected = formPerms.includes(perm._id);
                  return (
                    <button
                      key={perm._id}
                      onClick={() => togglePerm(perm._id)}
                      className="px-3 py-1 rounded-md text-xs font-mono transition-all"
                      style={{
                        background: selected
                          ? "hsl(0 80% 55%)"
                          : "hsl(220 10% 20%)",
                        color: selected ? "white" : "hsl(210 20% 70%)",
                        border: `1px solid ${selected ? "hsl(0 80% 55%)" : "hsl(220 10% 30%)"}`,
                      }}
                    >
                      {selected ? "✓ " : ""}
                      {perm.name}
                    </button>
                  );
                })}
                {allPermissions.length === 0 && (
                  <p className="text-xs" style={{ color: "hsl(210 20% 50%)" }}>
                    Không có quyền nào
                  </p>
                )}
              </div>
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
