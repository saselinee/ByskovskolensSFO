require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");

const { logError } = require("./utils/logger");

// Routes
const pageRoutes = require("./routes/pageRoutes");
const authRoutes = require("./routes/authRoutes");
const newsRoutes = require("./routes/newsRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Basis middleware ----------

// Parse form-data (POST forms)
app.use(express.urlencoded({ extended: false }));

// Parse JSON (API / tests)
app.use(express.json());

// Session-håndtering
app.use(
    session({
        secret: process.env.SESSION_SECRET || "CHANGE_ME_IN_ENV",
        resave: false,
        saveUninitialized: false,
        cookie: { httpOnly: true },
    })
);

// Gør session tilgængelig i EJS (fx til navbar)
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.currentPath = req.path;
    next();
});

// Statiske filer
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

// ---------- Global error handler ----------
// Sikkerhedsnet for uventede fejl.
// Primær fejlhåndtering sker i controllers.
app.use((err, req, res, next) => {
    logError(`Uventet serverfejl: ${req.method} ${req.originalUrl}`, err);
    res.status(500).send("Der opstod en serverfejl");
});

// ---------- 404 ----------

app.use((req, res) => {
    res.status(404).send("Siden blev ikke fundet (404)");
});

// ---------- Database + start ----------

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");

        // Start kun serveren hvis vi IKKE kører tests
        if (process.env.NODE_ENV !== "test") {
            app.listen(PORT, () => {
                console.log(`Server running on http://localhost:${PORT}`);
            });
        }
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err.message);
        process.exit(1);
    });

// ---------- Export app (vigtigt for tests) ----------
module.exports = app;
