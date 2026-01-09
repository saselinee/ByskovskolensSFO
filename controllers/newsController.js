const News = require("../models/News");

// Offentlig: hent nyheder (JSON - kan beholdes til test, men ikke nødvendig)
exports.listNews = async (req, res) => {
    try {
        const items = await News.find().sort({ date: -1 }).lean();
        res.json(items);
    } catch (err) {
        console.error("Fejl ved hentning af nyheder:", err);
        res.status(500).send("Kunne ikke hente nyheder");
    }
};

// Admin: opret nyhed (HTML form -> redirect tilbage)
exports.createNews = async (req, res) => {
    try {
        const { title, content, imageUrl } = req.body;

        if (!title || !content) {
            return res.status(400).send("Titel og indhold er påkrævet");
        }

        await News.create({
            title,
            content,
            imageUrl: imageUrl || "",
            createdBy: req.session.role,
        });

        // Efter oprettelse: tilbage til forsiden
        return res.redirect("/");
    } catch (err) {
        console.error("Fejl ved oprettelse af nyhed:", err);
        return res.status(500).send("Kunne ikke oprette nyhed");
    }
};

// Admin: rediger nyhed (HTML form -> redirect tilbage)
exports.updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, imageUrl } = req.body;

        const updated = await News.findByIdAndUpdate(
            id,
            { title, content, imageUrl: imageUrl || "" },
            { new: true }
        );

        if (!updated) {
            return res.status(404).send("Nyhed ikke fundet");
        }

        // Efter redigering: tilbage til forsiden
        return res.redirect("/");
    } catch (err) {
        console.error("Fejl ved opdatering af nyhed:", err);
        return res.status(500).send("Kunne ikke opdatere nyhed");
    }
};

// Admin: slet nyhed (HTML form -> redirect tilbage)
exports.deleteNews = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await News.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).send("Nyhed ikke fundet");
        }

        // Efter sletning: tilbage til forsiden
        return res.redirect("/");
    } catch (err) {
        console.error("Fejl ved sletning af nyhed:", err);
        return res.status(500).send("Kunne ikke slette nyhed");
    }
};
