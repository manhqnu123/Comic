import Chapter from "../model/Chapter.js";
import Comic from "../model/Comic.js";

export const createChapter = async (req, res) => {
  try {
    const chapter = await Chapter.create(req.body);
    res.status(201).json(chapter);
  } catch (error) {
    console.log("Lỗi tạo chapter");
    res.status(500).json({ message: error.message });
  }
};

export const getChapterByComic = async (req, res) => {
  try {
    const chapters = await Chapter.find({
      comic: req.params.comicId,
    }).sort({ chapterNumber: 1 });
    res.status(200).json(chapters);
  } catch (error) {
    console.log("Lỗi lấy chapter theo comic");
    res.status(500).json({ message: error.message });
  }
};

export const getChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id).populate("comic");

    if (!chapter) {
      return res.status(404).json({ message: "Không tìm thấy chapter" });
    }

    //prev / next
    const prev = await Chapter.findOne({
      comic: chapter.comic._id,
      chapterNumber: { $lt: chapter.chapterNumber },
    }).sort({ chapterNumber: -1 });

    const next = await Chapter.findOne({
      comic: chapter.comic._id,
      chapterNumber: { $gt: chapter.chapterNumber },
    }).sort({ chapterNumber: 1 });

    res.json({
      ...chapter.toObject(),
      prevChapter: prev?._id || null,
      nextChapter: next?._id || null,
    });
  } catch (err) {
    console.log("lỗi đọc chapter");
    res.status(500).json({ message: err.message });
  }
};

export const updateChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(chapter);
  } catch (err) {
    console.log("lỗi cập nhật chapter");
    res.status(500).json({ message: err.message });
  }
};

export const deleteChapter = async (req, res) => {
  try {
    await Chapter.findByIdAndDelete(req.params.id);
    res.json({ message: "Chapter đã được xóa" });
  } catch (err) {
    console.log("lỗi xóa chapter");
    res.status(500).json({ message: err.message });
  }
};

const updateComicViews = async (comicId) => {
  const result = await Chapter.aggregate([
    {
      $match: { comic: comicId },
    },
    {
      $group: {
        _id: "$comic",
        avgViews: { $avg: "$views" },
      },
    },
  ]);

  const totalViews = result[0]?.avgViews || 0;

  await Comic.findByIdAndUpdate(comicId, {
    views: totalViews,
  });
};

//tăng view
export const increaseView = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);

    if (!chapter) {
      return res.status(404).json({ message: "Không tìm thấy chapter" });
    }
    await Chapter.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true },
    );

    await updateComicViews(chapter.comic);

    res.json({ message: "Tăng view thành công" });
  } catch (err) {
    console.error("Lỗi tăng view:", err);
    res.status(500).json({ message: err.message });
  }
};