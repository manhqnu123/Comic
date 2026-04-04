import Comic from "../model/Comic.js";
import Comment from "../model/Comment.js";

export const createComment = async (req, res) => {
  try {
    const { comic, chapter, content, parentComment } = req.body;

    const comment = await Comment.create({
      user: req.user.id,
      comic,
      chapter,
      content,
      parentComment: parentComment || null,
    });

    await comment.populate("user", "username avatar");
    res.json(comment);
  } catch (err) {
    console.log("lỗi tạo cmt");
    res.status(500).json({ message: "Lỗi tạo comment", error: err.message });
  }
};

export const getCommentsByChapter = async (req, res) => {
  try {
    const chapterId = req.params.chapterId;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({
      chapter: chapterId,
      parentComment: null,
      status: "active",
    })
      .populate("user", "username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      comments,
      currentPage: page,
      totalPages: Math.ceil(comments.length / limit),
    });
  } catch (err) {
    console.log("lỗi lấy cmt chapter");
    res.status(500).json({ message: "Lỗi lấy comment", error: err.message });
  }
};

export const getCommentsByComic = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const comic = await Comic.findOne({ slug });

    if (!comic) {
      return res.status(404).json({ message: "Không tìm thấy truyện" });
    }

    const comments = await Comment.aggregate([
      {
        $match: {
          comic: comic._id,
          parentComment: null,
          status: "active",
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "comments",
          let: { commentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$parentComment", "$$commentId"] },
                status: "active",
              },
            },
            { $count: "count" },
          ],
          as: "replies",
        },
      },
      {
        $addFields: {
          replyCount: {
            $ifNull: [{ $arrayElemAt: ["$replies.count", 0] }, 0],
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          content: 1,
          createdAt: 1,
          likes: 1,
          replyCount: 1,
          "user.username": 1,
          "user.avatar": 1,
        },
      },
    ]);

    const totalComments = await Comment.countDocuments({
      comic: comic._id,
      parentComment: null,
      status: "active",
    });

    res.json({
      comments,
      currentPage: page,
      totalPages: Math.ceil(totalComments / limit),
    });
  } catch (err) {
    console.log("lỗi lấy cmt comic");
    res.status(500).json({ message: "Lỗi lấy comment", error: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    comment.status = "deleted";
    await comment.save();
    res.json({ message: "Xóa comment thành công" });
  } catch (err) {
    console.log("lỗi xóa cmt");
    res.status(500).json({ message: "Lỗi xóa comment", error: err.message });
  }
};

export const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment không tồn tại",
      });
    }

    const userId = req.user.id;

    const isLiked = comment.likes.includes(userId);

    if (isLiked) {
      // unlike
      comment.likes = comment.likes.filter(
        (id) => id.toString() !== userId.toString(),
      );
    } else {
      // like
      comment.likes.push(userId);
    }

    await comment.save();

    res.json({
      totalLikes: comment.likes.length,
      liked: !isLiked,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi like comment",
      error: error.message,
    });
  }
};

export const getReplies = async (req, res) => {
  try {
    const replies = await Comment.find({
      parentComment: req.params.commentId,
      status: "active",
    })
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });
    res.json(replies);
  } catch (err) {
    console.log("lỗi lấy reply");
    res.status(500).json({ message: "Lỗi lấy reply", error: err.message });
  }
};
