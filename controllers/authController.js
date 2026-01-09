const bcrypt = require("bcrypt");
const User = require("../models/User");

// Vis login-siden (GET)
exports.showLogin = (req, res) => {
    res.render("adminLogin", { title: "Admin login" });
};

// Login (POST)
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1) Find bruger
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).send("Forkert brugernavn eller password");
        }

        // 2) Tjek om konto er aktiv (hvis du bruger active-feltet)
        if (user.active === false) {
            return res.status(403).send("Din konto er deaktiveret");
        }

        // 3) Tjek password
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
            return res.status(401).send("Forkert brugernavn eller password");
        }

        // 4) Gem login-status i session
        req.session.userId = user._id.toString();
        req.session.role = user.role;

        // 5) Send tilbage til forsiden (samme sider for alle)
        return res.redirect("/");
    } catch (err) {
        console.error("Fejl i login:", err);
        return res.status(500).send("Der skete en fejl ved login");
    }
};

// Logout (POST)
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
};
