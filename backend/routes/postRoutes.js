import express from "express";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/auth.js";
import cloudinary from "../config/cloudinary.js";

console.log('Loading postRoutes...');
console.log('Using Cloudinary:', cloudinary.config().cloud_name ? 'configured' : 'missing config');

const router = express.Router();

// ── Free user daily post limit ──
const FREE_DAILY_POST_LIMIT = 5;

// GET ALL POSTS
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};
    if (category) {
      query.category = category;
    }
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    const posts = await Post.find(query).populate('user', 'name avatar isPro proPlan').sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// GET PROMOTED ADS (Pro user video ads for homepage)
router.get("/promoted-ads", async (req, res) => {
  try {
    const ads = await Post.find({ isAd: true })
      .populate("user", "name avatar isPro")
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(ads);
  } catch (error) {
    console.error("Error fetching promoted ads:", error);
    res.status(500).json({ message: "Error fetching promoted ads" });
  }
});

// CREATE POST (with Pro features: video upload, unlimited posts, ads)
router.post("/", verifyToken, async (req, res) => {
  try {
    console.log('POST /api/posts request body keys:', Object.keys(req.body));
    const { title, description, category, image, video, isAd, adVideo, mediaType } = req.body;

    // Fetch user to check Pro status
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Auto-expire Pro if past date
    if (user.isPro && user.proExpiresAt && new Date() > new Date(user.proExpiresAt)) {
      user.isPro = false;
      user.proPlan = "none";
      await user.save();
    }

    // ── Free user post limit check ──
    if (!user.isPro) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayPostCount = await Post.countDocuments({
        user: user._id,
        createdAt: { $gte: todayStart },
      });

      if (todayPostCount >= FREE_DAILY_POST_LIMIT) {
        return res.status(403).json({
          message: `Free users can post ${FREE_DAILY_POST_LIMIT} times per day. Upgrade to Pro for unlimited posts!`,
          requiresPro: true,
        });
      }

      // Free users cannot upload videos or create ads
      if (video || isAd || adVideo || mediaType === "video") {
        return res.status(403).json({
          message: "Video uploads and Ad campaigns are Pro-only features. Upgrade to Pro!",
          requiresPro: true,
        });
      }
    }

    let imageUrl = null;
    let videoUrl = "";
    let adVideoUrl = "";

    // Upload image to Cloudinary (with local fallback)
    if (image) {
      try {
        const result = await cloudinary.uploader.upload(image, {
          folder: 'posts',
        });
        console.log('Cloudinary image upload result:', result.secure_url);
        imageUrl = result.secure_url;
      } catch (err) {
        console.warn("Cloudinary upload failed (possibly blocked by network). Falling back to saving base64 to DB.");
        imageUrl = image; // Fallback to raw base64
      }
    }

    // Upload video to Cloudinary (Pro only, with local fallback)
    if (video && user.isPro) {
      try {
        const result = await cloudinary.uploader.upload(video, {
          folder: 'posts/videos',
          resource_type: 'video',
          chunk_size: 6000000,
        });
        console.log('Cloudinary video upload result:', result.secure_url);
        videoUrl = result.secure_url;
      } catch (err) {
        console.warn("Cloudinary video upload failed. Falling back to local base64.");
        videoUrl = video;
      }
    }

    // Upload ad video to Cloudinary (Pro only, with local fallback)
    if (adVideo && user.isPro) {
      try {
        const result = await cloudinary.uploader.upload(adVideo, {
          folder: 'posts/ads',
          resource_type: 'video',
          chunk_size: 6000000,
        });
        console.log('Cloudinary ad video upload result:', result.secure_url);
        adVideoUrl = result.secure_url;
      } catch (err) {
        console.warn("Cloudinary ad video upload failed. Falling back to local base64.");
        adVideoUrl = adVideo;
      }
    }

    const newPost = new Post({
      title,
      description,
      category,
      image: imageUrl,
      video: videoUrl,
      isAd: user.isPro ? (isAd || false) : false,
      adVideo: adVideoUrl,
      mediaType: mediaType || "image",
      user: req.user.id,
    });

    await newPost.save();

    // Populate user details before sending back
    const populatedPost = await Post.findById(newPost._id).populate("user", "name avatar isPro");
    console.log('Saved post:', populatedPost._id);
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error in POST /api/posts:', JSON.stringify(error, null, 2));
    let errMsg = "Error creating post";
    if (error && error.error && error.error.message) {
      errMsg = "Cloudinary Error: " + error.error.message;
    } else if (error && error.error && error.error.code === 'ECONNRESET') {
      errMsg = "Network Error: Could not connect to Cloudinary (ECONNRESET)";
    } else if (error && error.message) {
      errMsg = error.message;
    }
    res.status(500).json({ message: errMsg });
  }
});

// DELETE POST (only owner)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check ownership
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Error deleting post" });
  }
});

export default router;