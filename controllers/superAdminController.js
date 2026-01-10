const bcrypt = require("bcrypt");
const User = require("../models/User");
const { logInfo, logError } = require("../utils/logger");

// Hjælpefunktion: laver en Date om til "YYYY-MM-DD" (passer til <input type="date">)
function toISODateOnly(date) {
    return date.toISOString().split("T")[0];
}

// Hjælpefunktion: beregn alder i hele år
function getAge(birthDate, today = new Date()) {
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// GET /superadmin/admins
exports.showAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: "admin" }).sort({ createdAt: -1 }).lean();

        const today = new Date();

        const maxBirthDate = new Date(today);
        maxBirthDate.setFullYear(today.getFullYear() - 15);

        const minBirthDate = new Date(today);
        minBirthDate.setFullYear(today.getFullYear() - 70);

        const error = req.query.error || null;
        const success = req.query.success || null;

        return res.render("superadmin/admins", {
            title: "Admin administration",
            admins,
            error,
            success,
            minBirthDate: toISODateOnly(minBirthDate),
            maxBirthDate: toISODateOnly(maxBirthDate),
        });
    } catch (err) {
        logError("Fejl ved visning af admins", err);
        return res.status(500).send("Kunne ikke indlæse admin-oversigt");
    }
};

// POST /superadmin/admins/create
exports.createAdmin = async (req, res) => {
    try {
        const { username, password, firstName, lastName, birthDate } = req.body;

        if (!username || !password || !firstName || !lastName || !birthDate) {
            logInfo("Opret admin afvist: mangler felter");
            return res.redirect("/superadmin/admins?error=" + encodeURIComponent("Alle felter skal udfyldes"));
        }

        const existing = await User.findOne({ username: username.trim() });
        if (existing) {
            logInfo(`Opret admin afvist: brugernavn findes allerede (${username})`);
            return res.redirect("/superadmin/admins?error=" + encodeURIComponent("Brugernavn findes allerede"));
        }

        const bd = new Date(birthDate);
        if (Number.isNaN(bd.getTime())) {
            logInfo("Opret admin afvist: ugyldig fødselsdato");
            return res.redirect("/superadmin/admins?error=" + encodeURIComponent("Ugyldig fødselsdato"));
        }

        const today = new Date();

        if (bd > today) {
            logInfo("Opret admin afvist: fødselsdato i eksistere ikke");
            return res.redirect("/superadmin/admins?error=" + encodeURIComponent("Fødselsdato må ikke være i fremtiden"));
        }

        const age = getAge(bd, today);
        if (age < 15) {
            logInfo(`Opret admin afvist: alder under 15 (${age})`);
            return res.redirect("/superadmin/admins?error=" + encodeURIComponent("Admin skal være mindst 15 år"));
        }
        if (age > 70) {
            logInfo(`Opret admin afvist: alder over 70 (${age})`);
            return res.redirect("/superadmin/admins?error=" + encodeURIComponent("Admin må ikke være over 70 år"));
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await User.create({
            username: username.trim(),
            passwordHash,
            role: "admin",
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            birthDate: bd,
            active: true,
        });

        logInfo(`Admin oprettet: ${username.trim()} (${firstName.trim()} ${lastName.trim()})`);

        return res.redirect("/superadmin/admins?success=" + encodeURIComponent("Admin blev oprettet"));
    } catch (err) {
        logError("Fejl ved oprettelse af admin", err);
        return res.redirect("/superadmin/admins?error=" + encodeURIComponent("Kunne ikke oprette admin"));
    }
};

// POST /superadmin/admins/:id/deactivate
exports.deactivateAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await User.findByIdAndUpdate(id, { active: false }, { new: true });
        if (!updated) {
            logInfo(`Deaktivér admin fejlede: id ikke fundet (${id})`);
            return res.redirect("/superadmin/admins?error=" + encodeURIComponent("Admin ikke fundet"));
        }

        logInfo(`Admin deaktiveret: ${updated.username}`);

        return res.redirect("/superadmin/admins?success=" + encodeURIComponent("Admin blev deaktiveret"));
    } catch (err) {
        logError("Fejl ved deaktivering af admin", err);
        return res.redirect("/superadmin/admins?error=" + encodeURIComponent("Kunne ikke deaktivere admin"));
    }
};
