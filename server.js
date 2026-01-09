require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");

// Routes
const pageRoutes = require("./routes/pageRoutes");
const authRoutes = require("./routes/authRoutes");
const newsRoutes = require("./routes/newsRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Basis middleware ----------

// Læs form-data fra HTML forms
app.use(express.urlencoded({ extended: false }));

// Læs JSON (bruges til test og senere API/CRUD)
app.use(express.json());

// Sessions: gemmer login-state på serveren
app.use(
    session({
        secret: process.env.SESSION_SECRET || "CHANGE_ME_IN_ENV",
        resave: false,
        saveUninitialized: false,
        cookie: { httpOnly: true },
    })
);

// Gør session tilgængelig i EJS views (res.locals.session)
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// Server statiske filer
app.use(express.static(path.join(__dirname, "public")));

// ---------- View engine ----------

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(expressLayouts);
app.set("layout", "layout");

// ---------- Routes ----------

app.use(pageRoutes);
app.use(authRoutes);
app.use(newsRoutes);
app.use(superAdminRoutes);

// 404 (skal ligge nederst)
app.use((req, res) => {
    res.status(404).send("Siden blev ikke fundet (404)");
});

// ---------- Database + start ----------

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err.message);
        process.exit(1);
    });
