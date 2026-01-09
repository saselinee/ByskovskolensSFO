const News = require("../models/News");

// Forside: hent nyheder og render index.ejs
exports.home = async (req, res) => {
    try {
        const items = await News.find().sort({ date: -1 }).lean();

        const newsItems = items.map((item) => ({
            ...item,
            formattedDate: item.date
                ? new Date(item.date).toLocaleDateString("da-DK")
                : "",
        }));

        return res.render("index", {
            title: "Forside",
            newsItems,
        });
    } catch (err) {
        console.error("FEJL i pageController.home:", err); // VIGTIGT: se terminalen
        return res.status(500).send("Kunne ikke indlæse forsiden.");
    }
};

exports.about = (req, res) => res.render("about", { title: "Om SFO'en" });
exports.employees = (req, res) => res.render("employees", { title: "Medarbejdere" });
