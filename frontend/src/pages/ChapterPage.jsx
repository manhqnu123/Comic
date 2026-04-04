import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import api from "@/api/axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Headers from "@/components/header";

export default function ChapterPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState([]);
 
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!chapter?.comic?._id) return;

    const fetchChapters = async () => {
      try {
        const res = await api.get(`/chapters/comic/${chapter.comic._id}`);
        setChapters(res.data);
      } catch (err) {
        console.error("Lỗi load danh sách chapter:", err);
      }
    };

    fetchChapters();
  }, [chapter]);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const res = await api.get(`/chapters/${id}`);
        setChapter(res.data);
      } catch (err) {
        console.error("Lỗi load chapter:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const viewedKey = `viewed_${id}`;
    const lastView = localStorage.getItem(viewedKey);

    const now = Date.now();
    const LIMIT = 10 * 60 * 1000; // 10 phút

    if (lastView && now - lastView < LIMIT) return;

    const increaseView = async () => {
      try {
        await api.post(`/chapters/${id}/view`);
        localStorage.setItem(viewedKey, now);
        console.log("Tăng view cho chapter");
      } catch (err) {
        console.error("Lỗi tăng view:", err);
      }
    };

     

    increaseView();
  }, [id]);

  if (loading) {
    return <div className="text-center py-10">Đang tải...</div>;
  }

  if (!chapter) {
    return <div className="text-center py-10">Không tìm thấy chapter</div>;
  }

  return (
    <>
      <Headers />
      <div className="reading-container py-6">
        <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
          {/* Prev */}
          <button
            disabled={!chapter.prevChapter}
            onClick={() => navigate(`/chapter/${chapter.prevChapter}`)}
            className="px-3 py-1 bg-secondary rounded disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Dropdown chọn chapter */}
          <select
            value={chapter?._id || ""}
            onChange={(e) => navigate(`/chapter/${e.target.value}`)}
            className="px-3 py-1 bg-secondary rounded text-sm"
          >
            {chapters.map((chap) => (
              <option key={chap._id} value={chap._id}>
                Chapter {chap.chapterNumber}
              </option>
            ))}
          </select>

          {/* Next */}
          <button
            disabled={!chapter.nextChapter}
            onClick={() => navigate(`/chapter/${chapter.nextChapter}`)}
            className="px-3 py-1 bg-secondary rounded disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        {/* HEADER */}
        <div className="mb-6 text-center">
          <Link
            to={`/truyen/${chapter.comic?.slug}`}
            className="text-primary text-sm hover:underline"
          >
            ← {chapter.comic?.title}
          </Link>

          <h1 className="text-xl font-bold mt-2">
            Chapter {chapter.chapterNumber}
          </h1>
        </div>

        <div className="space-y-3">
          {chapter.img?.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`page-${index}`}
              className="chapter-img"
            />
          ))}
        </div>

        {/* NAVIGATION */}
        <div className="flex justify-between mt-8">
          <button
            disabled={!chapter.prevChapter}
            onClick={() => navigate(`/chapter/${chapter.prevChapter}`)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary rounded disabled:opacity-50"
          >
            <ChevronLeft size={16} />
            Chapter trước
          </button>

          <button
            disabled={!chapter.nextChapter}
            onClick={() => navigate(`/chapter/${chapter.nextChapter}`)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary rounded disabled:opacity-50"
          >
            Chapter sau
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
