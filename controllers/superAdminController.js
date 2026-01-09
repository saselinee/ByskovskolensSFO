const bcrypt = require("bcrypt");
const User = require("../models/User");

// Hjælpefunktion: laver en Date om til "YYYY-MM-DD" (passer til <input type="date">)
function toISODateOnly(date) {
    return date.toISOString().split("T")[0];
}

// Hjælpefunktion: beregn alder i hele år
function getAge(birthDate, today = new Date()) {
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Hvis fødselsdag ikke er passeret endnu i år, træk 1 fra
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// GET /superadmin/admins
// Viser en EJS-side med: formular til oprettelse + liste over eksisterende admins
exports.showAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: "admin" }).sort({ createdAt: -1 }).lean();

        // Dato-regler:
        // - Skal være mindst 15 år (seneste fødselsdato = i dag minus 15 år)
        // - Skal være maks 70 år (tidligste fødselsdato = i dag minus 70 år)
        const today = new Date();

        const maxBirthDate = new Date(today);
        maxBirthDate.setFullYear(today.getFullYear() - 15);

        const minBirthDate = new Date(today);
        minBirthDate.setFullYear(today.getFullYear() - 70);

        // Vis simple beskeder via querystring (nemt uden ekstra pakker)
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
        console.error("Fejl ved visning af admins:", err);
        return res.status(500).send("Kunne ikke indlæse admin-oversigt");
    }
};

// POST /superadmin/admins/create
// Opretter en ny admin (kun superadmin har adgang via middleware)
exports.createAdmin = async (req, res) => {
    try {
        const { username, password, firstName, lastName, birthDate } = req.body;

        // 1) Basal validering
        if (!username || !password || !firstName || !lastName || !birthDate) {
            return res.redirect(
                "/superadmin/admins?error=" + encodeURIComponent("Alle felter skal udfyldes")
            );
        }

        // 2) Username skal være unikt
        const existing = await User.findOne({ username: username.trim() });
        if (existing) {
            return res.redirect(
                "/superadmin/admins?error=" + encodeURIComponent("Brugernavn findes allerede")
            );
        }

        // 3) Fødselsdato validering (server-side - kan ikke omgås)
        const bd = new Date(birthDate);
        if (Number.isNaN(bd.getTime())) {
            return res.redirect(
                "/superadmin/admins?error=" + encodeURIComponent("Ugyldig fødselsdato")
            );
        }

        const today = new Date();

        // Må ikke være i fremtiden
        if (bd > today) {
            return res.redirect(
                "/superadmin/admins?error=" + encodeURIComponent("Fødselsdato må ikke være i fremtiden")
            );
        }

        // Alder skal være mellem 15 og 70 år (inkl.)
        const age = getAge(bd, today);

        if (age < 15) {
            return res.redirect(
                "/superadmin/admins?error=" + encodeURIComponent("Admin skal være mindst 15 år")
            );
        }

        if (age > 70) {
            return res.redirect(
                "/superadmin/admins?error=" + encodeURIComponent("Admin må ikke være over 70 år")
            );
        }

        // 4) Hash password og opret admin
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

        // 5) Tilbage til oversigten med success-besked
        return res.redirect(
            "/superadmin/admins?success=" + encodeURIComponent("Admin blev oprettet")
        );
    } catch (err) {
        // VIGTIGT: Kig i terminalen for den rigtige fejlårsag
        console.error("Fejl ved oprettelse af admin:", err);

        return res.redirect(
            "/superadmin/admins?error=" + encodeURIComponent("Kunne ikke oprette admin")
        );
    }
};

// POST /superadmin/admins/:id/deactivate
// Deaktiverer en admin (sætter active=false)
exports.deactivateAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await User.findByIdAndUpdate(id, { active: false }, { new: true });
        if (!updated) {
            return res.redirect(
                "/superadmin/admins?error=" + encodeURIComponent("Admin ikke fundet")
            );
        }

        return res.redirect(
            "/superadmin/admins?success=" + encodeURIComponent("Admin blev deaktiveret")
        );
    } catch (err) {
        console.error("Fejl ved deaktivering af admin:", err);
        return res.redirect(
            "/superadmin/admins?error=" + encodeURIComponent("Kunne ikke deaktivere admin")
        );
    }
};
