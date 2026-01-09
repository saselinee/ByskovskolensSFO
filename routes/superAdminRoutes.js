const express = require("express");
const router = express.Router();

const superAdminController = require("../controllers/superAdminController");
const { requireSuperAdmin } = require("../middleware/authMiddleware");

router.get("/superadmin/admins", requireSuperAdmin, superAdminController.listAdmins);
router.post("/superadmin/admins/create", requireSuperAdmin, superAdminController.createAdmin);
router.post("/superadmin/admins/:id/deactivate", requireSuperAdmin, superAdminController.deactivateAdmin);

module.exports = router;
