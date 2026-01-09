const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// GET: vis login-formular
router.get("/adminLogin", authController.showLogin);

// POST: login-forsøg
router.post("/adminLogin", authController.login);

// POST: logout
router.post("/logout", authController.logout);

module.exports = router;
