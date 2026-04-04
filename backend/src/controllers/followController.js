import Follow from "../model/Follow.js";

export const toggleFollow = async (req, res) => {
    try {
        const {comicId} = req.body;// req.body và req.params khác nhau chỗ nào?
        const userId = req.user.id;

        const existing = await Follow.findOne({
            user: userId,
            comic: comicId
        })

        if(existing) {

            //unfollow 
            await existing.deleteOne();
            return res.json({
                followed: false,
                message: "Đã bỏ theo dõi"
            });
        }

        //follow
        await Follow.create({
            user: userId,
            comic: comicId
        })
        return res.json({
            followed: true,
            message: "Đã theo dõi"
        });
    } catch (err) {
        console.log("lỗi follow/unfollow");
        res.status(500).json({message: "Lỗi follow/unfollow", error: err.message});
    }
}

export const getFollowedComics = async (req, res) => {
    try{
        const follows = await Follow.find({
            user: req.user.id
        })
        .populate("comic")
        .sort({createdAt: -1});
        res.json(follows);
    } catch (err) {
        console.log("lỗi lấy truyện đã theo dõi");
        res.status(500).json({message: "Lỗi lấy truyện đã theo dõi", error: err.message});
    }
}

export const checkFollow = async (req, res) => {
  try {
    const userId = req.user.id;
    const { comicId } = req.params;

    const existing = await Follow.findOne({
      user: userId,
      comic: comicId,
    });

    res.json({ followed: !!existing });
  } catch (err) {
    console.log("lỗi check follow");
    res.status(500).json({
      message: "Lỗi check follow",
      error: err.message,
    });
  }
};