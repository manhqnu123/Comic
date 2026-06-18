import redisClient from "../config/redis.js";
import Comic from "../model/Comic.js";
import Chapter from "../model/Chapter.js";

export const addReadHistory = async (req, res) => {
  try {
    const { comicId, chapterId } = req.body; //
    const userId = req.user.id; //

    if (!comicId || !chapterId) {
      return res
        .status(400)
        .json({ message: "Thiếu thông tin truyện hoặc chương." });
    }

    const redisKey = `user:history:${userId}`;
    const historyData = {
      comic: comicId,
      chapter: chapterId,
      lastReadAt: new Date().toISOString(), 
    };

    await redisClient.hSet(redisKey, comicId, JSON.stringify(historyData));

    res.json({
      message: "Đã cập nhật lịch sử đọc vào Redis",
      data: historyData,
    });
  } catch (error) {
    console.error("Lỗi ở addReadHistory trên Redis:", error);
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message }); //
  }
};

export const getHistory = async (req, res) => {
  try {
    const userId = req.user.id; 
    const redisKey = `user:history:${userId}`;

    const rawHistory = await redisClient.hGetAll(redisKey);

    if (!rawHistory || Object.keys(rawHistory).length === 0) {
      return res.json([]);
    }

    const historyList = Object.values(rawHistory).map((item) =>
      JSON.parse(item),
    );

    historyList.sort((a, b) => new Date(b.lastReadAt) - new Date(a.lastReadAt));

    const populatedHistory = await Promise.all(
      historyList.map(async (item) => {
        const comicData = await Comic.findById(item.comic).select(
          "title avatar",
        );
        return { ...item, comic: comicData };
      }),
    );
    res.json(populatedHistory);
  } catch (err) {
    console.error("Lỗi ở getHistory trên Redis:", err);
    res.status(500).json({ message: "Lỗi hệ thống", error: err.message }); //
  }
};

export const deleteHistory = async (req, res) => {
  try {
    const userId = req.user.id; 
    const comicId = req.params.comicId; 
    const redisKey = `user:history:${userId}`;

    const deletedCount = await redisClient.hDel(redisKey, comicId);

    if (deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy lịch sử truyện này." });
    }

    res.json({ message: "Đã xóa lịch sử đọc thành công." });
  } catch (err) {
    console.error("Lỗi ở deleteHistory trên Redis:", err);
    res.status(500).json({ message: "Lỗi hệ thống", error: err.message }); 
  }
};
