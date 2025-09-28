const express = require("express");
const router = express.Router();
const reviewController = require("../app/controllers/ReviewController");

router.get("/", reviewController.listByProduct);
router.get("/stats", reviewController.stats);
router.get("/mine", reviewController.getMine);
router.post("/", reviewController.create);
router.patch("/:id", reviewController.update);
router.delete("/:id", reviewController.remove);
router.patch("/:id/vote", reviewController.vote);

module.exports = router;