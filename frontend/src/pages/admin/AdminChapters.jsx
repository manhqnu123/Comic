import { useEffect, useState } from "react";
import api from "../../api/axios";

const EMPTY_FORM = { comic: "", chapterNumber: "", title: "", img: "" };

export default function AdminChapters() {
  const [chapters, setChapters] = useState([]);
  const [comics, setComics] = useState([]); // để chọn comicId
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterComic, setFilterComic] = useState("");
  const [error, setError] = useState("");

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  // ── Fetch comics để hiển thị dropdown ────────────────
  const fetchComics = async () => {
    try {
      const res = await api.get("/comics");
      const data = res.data.comics || res.data || [];
      setComics(data);
      if (data.length > 0) {
        setFilterComic(data[0]._id);
        await fetchChapters(data[0]._id);
      }
    } catch {
      setError("Không thể tải danh sách truyện.");
    }
  };

  // ── Fetch chapters theo comic được chọn ──────────────
  const fetchChapters = async (comicId) => {
    if (!comicId) return;
    try {
      setLoading(true);
      const res = await api.get(`/chapters/comic/${comicId}`);
      setChapters(res.data || []);
    } catch {
      setError("Không thể tải danh sách chapter.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComics();
  }, []);
  useEffect(() => {
    if (filterComic) fetchChapters(filterComic);
  }, [filterComic]);

  // ── Xử lý form ───────────────────────────────────────
  const handleChange = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.comic || !form.chapterNumber) {
      setError("Vui lòng chọn truyện và nhập số chapter.");
      return;
    }

    const payload = {
      comic: form.comic,
      chapterNumber: Number(form.chapterNumber),
      title: form.title,
      img: form.img
        ? form.img
            .split("\n")
            .map((url) => url.trim())
            .filter(Boolean)
        : [],
    };

    try {
      setLoading(true);
      if (editId) {
        await api.put(`/chapters/${editId}`, payload, {
          headers: getHeaders(),
        });
      } else {
        await api.post("/chapters", payload, { headers: getHeaders() });
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditId(null);
      fetchChapters(filterComic);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (chapter) => {
    setEditId(chapter._id);
    setForm({
      comic: chapter.comic?._id || filterComic,
      chapterNumber: chapter.chapterNumber,
      title: chapter.title || "",
      img: chapter.img?.join("\n") || "",
    });
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa chapter này?")) return;
    try {
      await api.delete(`/chapters/${id}`, { headers: getHeaders() });
      fetchChapters(filterComic);
    } catch {
      setError("Xóa thất bại.");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditId(null);
    setError("");
  };

  // ── Render ───────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Quản lý Chapter</h2>
          <p className="text-sm text-muted-foreground">
            {chapters.length} chapter
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setForm({ ...EMPTY_FORM, comic: filterComic });
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 transition"
          >
            + Thêm chapter
          </button>
        )}
      </div>

      {/* Filter theo truyện */}
      {!showForm && (
        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm text-muted-foreground">
            Lọc theo truyện:
          </label>
          <select
            value={filterComic}
            onChange={(e) => setFilterComic(e.target.value)}
            className="bg-input border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {comics.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Form thêm / sửa */}
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-5 mb-6">
          <h3 className="font-semibold mb-4">
            {editId ? "Chỉnh sửa chapter" : "Thêm chapter mới"}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Truyện *</label>
              <select
                name="comic"
                value={form.comic}
                onChange={handleChange}
                className="bg-input border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">-- Chọn truyện --</option>
                {comics.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">
                Số chapter *
              </label>
              <input
                type="number"
                name="chapterNumber"
                value={form.chapterNumber}
                onChange={handleChange}
                className="bg-input border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="1"
                min="1"
              />
            </div>

            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">
                Tiêu đề chapter (tùy chọn)
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="bg-input border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="Tên chapter..."
              />
            </div>

            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">
                URLs ảnh (mỗi URL 1 dòng)
              </label>
              <textarea
                name="img"
                value={form.img}
                onChange={handleChange}
                rows={5}
                className="bg-input border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary resize-none font-mono"
                placeholder={
                  "https://cdn.example.com/page1.jpg\nhttps://cdn.example.com/page2.jpg"
                }
              />
              <p className="text-xs text-muted-foreground">
                {form.img ? form.img.split("\n").filter(Boolean).length : 0} ảnh
              </p>
            </div>

            {error && (
              <p className="col-span-2 text-sm text-red-500">{error}</p>
            )}

            <div className="col-span-2 flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-secondary transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition disabled:opacity-60"
              >
                {loading ? "Đang lưu..." : editId ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bảng danh sách */}
      {loading && !showForm ? (
        <p className="text-muted-foreground text-sm">Đang tải...</p>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Chapter</th>
                <th className="px-4 py-3 text-left">Tiêu đề</th>
                <th className="px-4 py-3 text-left">Số ảnh</th>
                <th className="px-4 py-3 text-left">Views</th>
                <th className="px-4 py-3 text-left">Ngày tạo</th>
                <th className="px-4 py-3 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {chapters.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Chưa có chapter nào
                  </td>
                </tr>
              ) : (
                chapters.map((chapter) => (
                  <tr
                    key={chapter._id}
                    className="border-t border-border hover:bg-secondary/50 transition"
                  >
                    <td className="px-4 py-3 font-medium">
                      Chapter {chapter.chapterNumber}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {chapter.title || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {chapter.img?.length || 0} ảnh
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {chapter.views?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(chapter.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(chapter)}
                          className="px-3 py-1 text-xs border border-border rounded hover:bg-secondary transition"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(chapter._id)}
                          className="px-3 py-1 text-xs border border-red-500/50 text-red-400 rounded hover:bg-red-500/10 transition"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
