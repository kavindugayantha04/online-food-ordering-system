const Review = require("../models/Review");

const userCanModify = (req, review) =>
  review.userId.toString() === req.user.id.toString();

const buildPhotoPath = (file) =>
  file ? `/uploads/reviews/${file.filename}` : "";

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Math.round(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10
          ) / 10
        : 0;

    res.status(200).json({
      reviews,
      averageRating,
      totalReviews,
    });
  } catch (error) {
    console.error("getAllReviews:", error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate(
      "userId",
      "name email"
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json(review);
  } catch (error) {
    console.error("getReviewById:", error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

exports.addReview = async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const comment = (req.body.comment || "").trim();
    const rating = Number(req.body.rating);

    if (!name || !comment) {
      return res
        .status(400)
        .json({ message: "Name and comment are required" });
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be a number between 1 and 5" });
    }

    const photo = req.file ? buildPhotoPath(req.file) : "";

    const review = await Review.create({
      userId: req.user.id,
      name,
      rating,
      comment,
      photo,
    });

    const populated = await Review.findById(review._id).populate(
      "userId",
      "name email"
    );

    res.status(201).json({
      message: "Review added successfully",
      review: populated,
    });
  } catch (error) {
    console.error("addReview:", error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (!userCanModify(req, review)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const nameIn =
      req.body.name !== undefined && req.body.name !== null
        ? String(req.body.name).trim()
        : null;
    const commentIn =
      req.body.comment !== undefined && req.body.comment !== null
        ? String(req.body.comment).trim()
        : null;
    const ratingIn =
      req.body.rating !== undefined &&
      req.body.rating !== null &&
      req.body.rating !== ""
        ? Number(req.body.rating)
        : null;

    if (nameIn) review.name = nameIn;
    if (commentIn) review.comment = commentIn;
    if (
      ratingIn != null &&
      Number.isFinite(ratingIn) &&
      ratingIn >= 1 &&
      ratingIn <= 5
    ) {
      review.rating = ratingIn;
    }

    if (req.file) {
      review.photo = buildPhotoPath(req.file);
    }

    await review.save();

    const populated = await Review.findById(review._id).populate(
      "userId",
      "name email"
    );

    res.status(200).json({
      message: "Review updated successfully",
      review: populated,
    });
  } catch (error) {
    console.error("updateReview:", error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const isAdmin = req.user.role === "admin";
    if (!userCanModify(req, review) && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await review.deleteOne();

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("deleteReview:", error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
};
