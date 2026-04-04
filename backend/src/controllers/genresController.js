import Genre from "../model/Genre.js";
import slugify from "slugify";

export const createGenre = async (req, res) => {
  try {
    const { name } = req.body;

    const slug = slugify(name, { lower: true, strict: true });

    const existing = await Genre.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: "Genre already exists" });
    }

    const genre = await Genre.create({
      name,
      slug,
    });

    res.status(201).json(genre);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getGenres = async (req, res) => {
  try{
    const genres = await Genre.find();
    res.status(200).json(genres);
  }catch(error){
    res.status(500).json({message: "Server error"});
  }
}

export const updateGenre = async (req, res) => {
  try {
    const {name} = req.body;
    const slug = slugify(name, {lower: true, strict:true});
    const updatedGenre = await Genre.findByIdAndUpdate(
      req.params.id,
      {name, slug},
      {new: true}
    )
    if(!updateGenre) {
      return res.status(404).json({message: "Genre not found"});
    }
    return res.status(200).json(updatedGenre);
  } catch (error) {
    res.status(500).json({message: "Server error"});
  }
}
