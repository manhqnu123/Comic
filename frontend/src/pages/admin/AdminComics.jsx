import { useEffect, useState } from "react";
import api from "../../api/axios";

const EMPTY_FORM = {
  title: "",
  des: "",
  author: "",
  coverImg: "",
  status: "ongoing",
  genres: "",
};
const STATUS_OPTIONS = ["ongoing", "completed", "drop", "coming soon"];

export default function AdminComics() {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  // ── Fetch danh sách ──────────────────────────────────
  const fetchComics = async () => {
    try {
      setLoading(true);
      const res = await api.get("/comics");
      setComics(res.data.comics || res.data || []);
    } catch {
      setError("Không thể tải danh sách truyện.");
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const res = await api.get("/genres");
      setGenres(res.data);
    } catch {
      setError("Không thể tải thể loại.");
    }
  };

  useEffect(() => {
    fetchComics();
    fetchGenres();
  }, []);

  // ── Xử lý form ───────────────────────────────────────
  const handleChange = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Tiêu đề không được để trống.");
      return;
    }

    // 1. Khởi tạo FormData
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("des", form.des);
    formData.append("author", form.author);
    formData.append("status", form.status);

    // Gửi mảng thể loại
    selectedGenres.forEach((id) => {
      formData.append("genres", id);
    });

    if (file) {
      // Tên key "image" phải khớp với uploadCloud.single("image") ở Backend
      formData.append("image", file);
    }

    // const payload = {
    //   ...form,
    //   genres: selectedGenres,
    // };

    try {
      setLoading(true);
      const config = {
        headers: {
          ...getHeaders(),
          "Content-Type": "multipart/form-data",  
        },
      };

      if (editId) {
        await api.put(`/comics/${editId}`, formData, config);
      } else {
        if (!file) {
          setError("Vui lòng chọn ảnh bìa.");
          setLoading(false);
          return;
        }
        await api.post("/comics", formData, config);
      }

      // Reset form sau khi thành công
      handleCancel();
      fetchComics();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi hệ thống.");
    } finally {
      setLoading(false);
    }
  };

 const handleEdit = (comic) => {
   setEditId(comic._id);
   setSelectedGenres(comic.genres?.map((g) => g._id) || []);
   setForm({
     title: comic.title,
     des: comic.des,
     author: comic.author,
     coverImg: comic.coverImg,
     status: comic.status,
   });
   setPreview(comic.coverImg); // Hiển thị ảnh cũ để xem trước
   setShowForm(true);
   setError("");
 };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa truyện này sẽ xóa toàn bộ chapter. Xác nhận?"))
      return;
    try {
      await api.delete(`/comics/${id}`, { headers: getHeaders() });
      fetchComics();
    } catch {
      setError("Xóa thất bại.");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditId(null);
    setSelectedGenres([]);
    setFile(null); // Reset file
    setPreview(""); // Reset ảnh preview
    setError("");
  };

  // ── Render ───────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Quản lý Truyện</h2>
          <p className="text-sm text-muted-foreground">
            {comics.length} truyện
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 transition"
          >
            + Thêm truyện
          </button>
        )}
      </div>

      {/* Form thêm / sửa */}
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-5 mb-6">
          <h3 className="font-semibold mb-4">
            {editId ? "Chỉnh sửa truyện" : "Thêm truyện mới"}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Tiêu đề *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="bg-input border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="Tên truyện"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Tác giả</label>
              <input
                name="author"
                value={form.author}
                onChange={handleChange}
                className="bg-input border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="Tên tác giả"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">
                Trạng thái
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="bg-input border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <label className="text-xs text-muted-foreground">
                Ảnh bìa truyện *
              </label>
              <div className="flex items-center gap-4">
                {/* 1. Khu vực hiển thị ảnh xem trước */}
                <div className="w-20 h-28 bg-secondary rounded border border-border overflow-hidden flex items-center justify-center">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">
                      No Image
                    </span>
                  )}
                </div>

                {/* 2. Nút chọn file */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const selectedFile = e.target.files[0];
                    if (selectedFile) {
                      setFile(selectedFile); // Lưu file để gửi đi
                      setPreview(URL.createObjectURL(selectedFile)); // Tạo link để hiển thị
                    }
                  }}
                />
              </div>
            </div>

            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Mô tả</label>
              <textarea
                name="des"
                value={form.des}
                onChange={handleChange}
                rows={3}
                className="bg-input border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                placeholder="Nội dung mô tả..."
              />
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <label className="text-xs text-muted-foreground">Thể loại</label>
              <div className="grid grid-cols-3 gap-2">
                {genres.map((genre) => (
                  <label
                    key={genre._id}
                    className="flex items-center gap-2 px-3 py-2 bg-input border border-border rounded-md cursor-pointer hover:bg-secondary transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(genre._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGenres([...selectedGenres, genre._id]);
                        } else {
                          setSelectedGenres(
                            selectedGenres.filter((id) => id !== genre._id),
                          );
                        }
                      }}
                      className="accent-primary"
                    />
                    <span className="text-sm">{genre.name}</span>
                  </label>
                ))}
              </div>
              {genres.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Chưa có thể loại nào.
                </p>
              )}
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
                <th className="px-4 py-3 text-left">Ảnh bìa</th>
                <th className="px-4 py-3 text-left">Tiêu đề</th>
                <th className="px-4 py-3 text-left">Tác giả</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left">Views</th>
                <th className="px-4 py-3 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {comics.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Chưa có truyện nào
                  </td>
                </tr>
              ) : (
                comics.map((comic) => (
                  <tr
                    key={comic._id}
                    className="border-t border-border hover:bg-secondary/50 transition"
                  >
                    <td className="px-4 py-3">
                      {comic.coverImg ? (
                        <img
                          src={comic.coverImg}
                          alt={comic.title}
                          className="w-10 h-14 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-14 bg-secondary rounded flex items-center justify-center text-xs text-muted-foreground">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium max-w-[200px] truncate">
                      {comic.title}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {comic.author || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          comic.status === "ongoing"
                            ? "bg-green-500/20 text-green-400"
                            : comic.status === "completed"
                              ? "bg-blue-500/20 text-blue-400"
                              : comic.status === "drop"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {comic.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {comic.views?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(comic)}
                          className="px-3 py-1 text-xs border border-border rounded hover:bg-secondary transition"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(comic._id)}
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
