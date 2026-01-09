const express = require("express");
const router = express.Router();

const newsController = require("../controllers/newsController");
const { requireAdmin } = require("../middleware/authMiddleware");

// Offentlig
router.get("/news", newsController.listNews);

// Admin (kræver admin eller superadmin)
router.post("/news", requireAdmin, newsController.createNews);
router.post("/news/:id/edit", requireAdmin, newsController.updateNews);
router.post("/news/:id/delete", requireAdmin, newsController.deleteNews);

module.exports = router;
