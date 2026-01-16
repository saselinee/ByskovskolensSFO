const News = require("../models/News");
const User = require("../models/User");
const { logError } = require("../utils/logger");

// Hjælpefunktion: format fødselsdag uden årstal (fx "13. januar")
function formatBirthdayDa(date) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("da-DK", {
        day: "2-digit",
        month: "long",
    });
}

// Hjælpefunktion: check om fødselsdag er i dag (samme dag + måned)
function isBirthdayToday(date) {
    if (!date) return false;
    const d = new Date(date);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
}

// Forside: hent nyheder og render index.ejs
exports.home = async (req, res) => {
    try {
        const items = await News.find().sort({ createdAt: -1 }).lean();

        const newsItems = items.map((item) => {
            const createdAt = item.createdAt
                ? new Date(item.createdAt).toLocaleString("da-DK", {
                    dateStyle: "short",
                    timeStyle: "short",
                })
                : "";

            const updatedAt = item.updatedAt
                ? new Date(item.updatedAt).toLocaleString("da-DK", {
                    dateStyle: "short",
                    timeStyle: "short",
                })
                : "";

            return {
                ...item,
                formattedCreatedAt: createdAt,
                formattedUpdatedAt: updatedAt && updatedAt !== createdAt ? updatedAt : null,
            };
        });

        return res.render("index", {
            title: "Forside",
            newsItems,
        });
    } catch (err) {
        logError("FEJL i pageController.home", err);
        return res.status(500).send("Kunne ikke indlæse forsiden.");
    }
};

exports.about = (req, res) => res.render("about", { title: "Om SFO'en" });

// Medarbejdere: hent aktive admins + superadmins og render employees.ejs
exports.employees = async (req, res) => {
    try {
        const users = await User.find({
            active: true,
            role: { $in: ["admin", "superadmin"] },
        })
            .sort({ role: 1, lastName: 1, firstName: 1 })
            .lean();

        const employees = users.map((u) => {
            const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim();

            // Hvis du ikke har imageUrl i din User model endnu, vil dette bare blive undefined,
            // og så falder den tilbage til placeholder.
            const imageUrl =
                u.imageUrl && String(u.imageUrl).trim()
                    ? String(u.imageUrl).trim()
                    : "/images/employee-placeholder.png";

            return {
                fullName,
                role: u.role,
                birthdayText: formatBirthdayDa(u.birthDate),
                isBirthday: isBirthdayToday(u.birthDate),
                imageUrl,
            };
        });

        return res.render("employees", {
            title: "Medarbejdere",
            employees,
        });
    } catch (err) {
        logError("FEJL i pageController.employees", err);
        return res.status(500).send("Kunne ikke indlæse medarbejdere.");
    }
};
