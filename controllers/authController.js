const bcrypt = require("bcrypt");
const User = require("../models/User");
const { logInfo, logError } = require("../utils/logger");

// Vis login-siden (GET)
exports.showLogin = (req, res) => {
    res.render("adminLogin", { title: "Admin login" });
};

// Login (POST)
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1) Find bruger
        const user = await User.findOne({ username: username?.trim() });
        if (!user) {
            logInfo(`Login fejlede: ukendt brugernavn "${username}"`);
            return res.status(401).send("Forkert brugernavn eller password");
        }

        // 2) Tjek om konto er aktiv
        if (user.active === false) {
            logInfo(`Login afvist: bruger "${user.username}" er deaktiveret`);
            return res.status(403).send("Din konto er deaktiveret");
        }

        // 3) Tjek password
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
            logInfo(`Login fejlede: forkert password for "${user.username}"`);
            return res.status(401).send("Forkert brugernavn eller password");
        }

        // 4) Gem login-status i session
        req.session.userId = user._id.toString();
        req.session.role = user.role;
        req.session.username = user.username;

        // Gem fulde navn hvis du har firstName/lastName i User
        if (user.firstName && user.lastName) {
            req.session.fullName = `${user.firstName} ${user.lastName}`;
        }

        logInfo(`Login OK: "${user.username}" (${user.role})`);

        // 5) Send tilbage til forsiden
        return res.redirect("/");
    } catch (err) {
        logError("Fejl i authController.login", err);
        return res.status(500).send("Der skete en fejl ved login");
    }
};

// Logout (POST)
exports.logout = (req, res) => {
    const usernameOrId = req.session?.userId || "ukendt";
    logInfo(`Logout: ${usernameOrId}`);

    req.session.destroy((err) => {
        if (err) {
            logError("Fejl ved logout (session.destroy)", err);
            // fallback
            return res.status(500).send("Der skete en fejl ved logout");
        }
        res.redirect("/");
    });
};
