import redisClient from "../config/redis.js";

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

// ==========================================
// 2. LẤY DANH SÁCH LỊCH SỬ ĐỌC (SẮP XẾP MỚI NHẤT)
// ==========================================
export const getHistory = async (req, res) => {
  try {
    const userId = req.user.id; //
    const redisKey = `user:history:${userId}`;

    // Lấy toàn bộ các trường trong Hash lịch sử của user này
    const rawHistory = await redisClient.hGetAll(redisKey);

    if (!rawHistory || Object.keys(rawHistory).length === 0) {
      return res.json([]);
    }

    // Chuyển đổi dữ liệu chuỗi JSON từ Redis về mảng Object JS
    const historyList = Object.values(rawHistory).map((item) =>
      JSON.parse(item),
    );

    // Sắp xếp mảng theo thời gian 'lastReadAt' giảm dần (mới đọc đưa lên đầu)
    historyList.sort((a, b) => new Date(b.lastReadAt) - new Date(a.lastReadAt));

    // LƯU Ý: Vì Redis chỉ lưu chuỗi text cơ bản chứ không tự động .populate() liên kết bảng như MongoDB
    // Nên nếu Frontend cần full thông tin của 'comic' và 'chapter' (như tên truyện, ảnh đại diện),
    // bạn sẽ cần bổ sung thêm logic populate thủ công bằng Mongoose ở bước này nếu muốn.

    res.json(historyList);
  } catch (err) {
    console.error("Lỗi ở getHistory trên Redis:", err);
    res.status(500).json({ message: "Lỗi hệ thống", error: err.message }); //
  }
};

// ==========================================
// 3. XÓA MỘT LỊCH SỬ ĐỌC TRUYỆN CỦA USER
// ==========================================
export const deleteHistory = async (req, res) => {
  try {
    const userId = req.user.id; //
    const comicId = req.params.comicId; //
    const redisKey = `user:history:${userId}`;

    // Xóa field cụ thể (comicId) khỏi Redis Hash
    const deletedCount = await redisClient.hDel(redisKey, comicId);

    if (deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy lịch sử truyện này." });
    }

    res.json({ message: "Đã xóa lịch sử đọc thành công." });
  } catch (err) {
    console.error("Lỗi ở deleteHistory trên Redis:", err);
    res.status(500).json({ message: "Lỗi hệ thống", error: err.message }); //
  }
};
