import { getAllTagsService } from "../services/tagService.js";

// Get all providers
export const getAllTags = async (req, res) => {
  try {
    const tags = await getAllTagsService();
    if (tags) {
      res.json(tags);
    } else {
      res.status(404).json({ error: "Tags not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
};
