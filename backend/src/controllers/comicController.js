import Comic from "../model/Comic.js";
import slugify from "slugify";

export const createComic = async (req, res) => {
  try {
    const { title, des, author, genres, status } = req.body;

    const coverImg = req.file ? req.file.path : "";

    const slug = slugify(title, {
      lower: true,
      strict: true,
    });

    const comic = await Comic.create({
      title,
      slug,
      des,
      author,
      genres,
      coverImg,
      status,
    });

    res.status(201).json(comic);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi tạo truyện",
      error: error.message,
    });
  }
}; 

//phân trang
export const getComics = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;

    const comics = await Comic.find()
      .populate("genres")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json(comics);
  } catch (err) {
    console.log("lỗi getComics");
    res.status(500).json({ message: err.message });
  }
};

//tìm kiếm
export const searchComics = async (req, res) => {
  try {
    const keyword = req.query.keyword;

    const comics = await Comic.find({
      title: { $regex: keyword, $options: "i" },
    }).populate("genres");

    res.json(comics);
  } catch (err) {
    console.log("lỗi searchComics");
    res.status(500).json({ message: err.message });
  }
};

//lấy chi tiết truyện

export const getDetailComic = async (req, res) => {
  try {
    const comic = await Comic.findOne({ slug: req.params.slug }).populate(
      "genres",
    );
    res.json(comic);
  } catch (err) {
    console.log("lỗi getDetailComic");
    res.status(500).json({ message: err.message });
  }
};

//update truyện
export const updateComic = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.coverImg = req.file.path;
    }

    if (updateData.title) {
      updateData.slug = slugify(updateData.title, {
        lower: true,
        strict: true,
      });
    }

    const comic = await Comic.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    res.json(comic);
  } catch (err) {
    console.log("lỗi updateComic");
    res.status(500).json({ message: err.message });
  }
};

//xóa truyện
export const deleteComic = async (req, res) => {
  try {
    await Comic.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa truyện thành công" });
  } catch (err) {
    console.log("lỗi deleteComic");
    res.status(500).json({ message: err.message });
  }
};
