import ReadHistory from "../model/ReadHistory.js";

export const addReadHistory = async (req, res) => {
  try {
    const { comicId, chapterId } = req.body;

    const userId = req.user.id;

    const history = await ReadHistory.findOne({
      user: userId,
      comic: comicId,
    });

    if (history) {
      history.chapter = chapterId;
      history.lastReadAt = Date.now();

      await history.save();

      return res.json(history);
    }

    const newHistory = await ReadHistory.create({
      user: userId,
      comic: comicId,
      chapter: chapterId,
    });

    res.json(newHistory);
  } catch (error) {
    console.log("Lỗi ở addReadHistory");
    res.status(500).json({
      message: "Lỗi hệ thống",
      error: error.message,
    });
  }
};

export const getHistory = async (req, res) => {
  try{
    const history = await ReadHistory.find({
      user: req.user.id,
    })
      .populate("comic")
      .populate("chapter")
      .sort({ lastReadAt: -1 });
    
    res.json(history);
  } catch (err) {
    console.log("Lỗi ở getHistory");
    res.status(500).json({message: "Lỗi hệ thống", error: err.message});
  }
}

export const deleteHistory = async (req, res) => {
  try{
    const history = await ReadHistory.findOneAndDelete({
      user: req.user.id,
      comic: req.params.comicId
    });
    
    res.json({message: "Đã xóa"});
  } catch (err) {
    console.log("Lỗi ở deleteHistory");
    res.status(500).json({message: "Lỗi hệ thống", error: err.message});
  }
}
