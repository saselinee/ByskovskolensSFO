const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.render("index", { title: "Forside" }));
router.get("/about", (req, res) => res.render("about", { title: "Om SFO'en" }));
router.get("/employees", (req, res) => res.render("employees", { title: "Medarbejdere" }));

module.exports = router;
