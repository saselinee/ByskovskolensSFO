const express = require("express");
const path = require("path");

const app = express();

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));

// Set EJS as view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Home page
app.get("/", (req, res) => {
    res.render("index"); // Render views/index.ejs
});

// Other pages
app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/employees", (req, res) => {
    res.render("employees");
});

app.get("/adminLogin", (req, res) => {
    res.render("adminLogin");
});

// Start server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
