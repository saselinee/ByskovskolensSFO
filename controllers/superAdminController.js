const bcrypt = require("bcrypt");
const User = require("../models/User");

// Liste admins (JSON)
exports.listAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: "admin" }).select(
            "username active createdAt"
        );
        res.json(admins);
    } catch (err) {
        console.error("Fejl ved hentning af admins:", err);
        res.status(500).send("Kunne ikke hente admins");
    }
};

// Opret admin
exports.createAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).send("Username og password er påkrævet");
        }

        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(409).send("Brugernavn findes allerede");
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const admin = await User.create({
            username,
            passwordHash,
            role: "admin",
            active: true,
        });

        res.json({
            message: "Admin oprettet",
            admin: { id: admin._id, username: admin.username, active: admin.active },
        });
    } catch (err) {
        console.error("Fejl ved oprettelse af admin:", err);
        res.status(500).send("Kunne ikke oprette admin");
    }
};

// Deaktivér admin
exports.deactivateAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await User.findByIdAndUpdate(
            id,
            { active: false },
            { new: true }
        );

        if (!updated) {
            return res.status(404).send("Admin ikke fundet");
        }

        res.json({
            message: "Admin deaktiveret",
            admin: { id: updated._id, username: updated.username, active: updated.active },
        });
    } catch (err) {
        console.error("Fejl ved deaktivering af admin:", err);
        res.status(500).send("Kunne ikke deaktivere admin");
    }
};
