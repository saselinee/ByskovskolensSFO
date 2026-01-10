const News = require("../models/News");
const { logError } = require("../utils/logger");

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
exports.employees = (req, res) => res.render("employees", { title: "Medarbejdere" });
