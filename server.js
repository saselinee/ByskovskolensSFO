// Indlæs miljøvariabler fra .env (fx MONGODB_URI og SESSION_SECRET)
require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");
const expressLayouts = require("express-ejs-layouts");

const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middleware (kører på alle requests) ----------

// Gør det muligt at læse form-data fra <form method="post"> (req.body)
app.use(express.urlencoded({ extended: false }));

// (Valgfrit) Gør det muligt at læse JSON (praktisk senere til API/CRUD)
app.use(express.json());

// Session: gemmer login-status på serveren (req.session)
app.use(
    session({
        secret: process.env.SESSION_SECRET || "skift-dette-senere",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,

        },
    })
);

// Gør session tilgængelig i dine EJS views som "session"
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// Server statiske filer fra /public (CSS, JS, billeder)
app.use(express.static(path.join(__dirname, "public")));

// ---------- View engine (EJS + layout) ----------

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(expressLayouts);
app.set("layout", "layout");

// ---------- Routes (sider) ----------

app.get("/", (req, res) => res.render("index", { title: "Forside" }));
app.get("/about", (req, res) => res.render("about", { title: "Om SFO'en" }));
app.get("/employees", (req, res) => res.render("employees", { title: "Medarbejdere" }));

// Login-side (GET) viser formularen
app.get("/adminLogin", (req, res) => res.render("adminLogin", { title: "Admin login" }));

// Login (POST) tjekker brugernavn + password og gemmer session
app.post("/adminLogin", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find bruger i databasen
        const user = await User.findOne({ username });

        // Hvis brugeren ikke findes, returnér generisk fejl (sikkerhed)
        if (!user) {
            return res.status(401).send("Forkert brugernavn eller password");
        }

        // Tjek password mod det hash der ligger i databasen
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatch) {
            return res.status(401).send("Forkert brugernavn eller password");
        }

        // Gem login-status i session
        req.session.userId = user._id.toString();
        req.session.role = user.role;

        // Send brugeren tilbage til forsiden (samme sider for alle)
        return res.redirect("/");
    } catch (err) {
        console.error("Fejl i login:", err);
        return res.status(500).send("Der skete en fejl ved login");
    }
});

// Midlertidig test-route: viser om man er logget ind (kan slettes senere)
app.get("/session-test", (req, res) => {
    if (!req.session.userId) {
        return res.send("Ikke logget ind");
    }
    return res.send(`Logget ind. Rolle: ${req.session.role}`);
});

// Logout
app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

// 404 handler (skal ligge nederst efter alle routes)
app.use((req, res) => {
    res.status(404).send("Siden blev ikke fundet (404).");
});

// ---------- Database + start server ----------

// Forbind til MongoDB og start først serveren, når forbindelsen er OK.
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
