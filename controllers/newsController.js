const News = require("../models/News");
const { logInfo, logError } = require("../utils/logger");

// Offentlig: hent nyheder (JSON - kan beholdes til test)
exports.listNews = async (req, res) => {
    try {
        const items = await News.find().sort({ createdAt: -1 }).lean();
        res.json(items);
    } catch (err) {
        logError("Fejl ved hentning af nyheder", err);
        res.status(500).send("Kunne ikke hente nyheder");
    }
};

// Admin: opret nyhed (HTML form -> redirect tilbage)
exports.createNews = async (req, res) => {
    try {
        const { title, content, imageUrl } = req.body;

        if (!title || !content) {
            logInfo("Opret nyhed afvist: mangler title/content");
            return res.status(400).send("Titel og indhold er påkrævet");
        }

        // Brug fulde navn hvis det findes i session - ellers fallback til brugernavn/rolle
        const createdBy =
            req.session.fullName || req.session.username || "Ukendt";

        const created = await News.create({
            title,
            content,
            imageUrl: imageUrl || "",
            createdBy,
            updatedBy: null,
        });

        logInfo(`Nyhed oprettet: "${created.title}" af ${createdBy}`);

        return res.redirect("/");
    } catch (err) {
        logError("Fejl ved oprettelse af nyhed", err);
        return res.status(500).send("Kunne ikke oprette nyhed");
    }
};

// Admin: rediger nyhed (HTML form -> redirect tilbage)
exports.updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, imageUrl } = req.body;

        const updatedBy =
            req.session.fullName || req.session.username || "Ukendt";

        const updated = await News.findByIdAndUpdate(
            id,
            {
                title,
                content,
                imageUrl: imageUrl || "",
                updatedBy,
            },
            { new: true }
        );

        if (!updated) {
            logInfo(`Rediger nyhed fejlede: id ikke fundet (${id})`);
            return res.status(404).send("Nyhed ikke fundet");
        }

        logInfo(`Nyhed redigeret: "${updated.title}" af ${updatedBy}`);

        return res.redirect("/");
    } catch (err) {
        logError("Fejl ved opdatering af nyhed", err);
        return res.status(500).send("Kunne ikke opdatere nyhed");
    }
};

// Admin: slet nyhed (HTML form -> redirect tilbage)
exports.deleteNews = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await News.findByIdAndDelete(id);
        if (!deleted) {
            logInfo(`Slet nyhed fejlede: id ikke fundet (${id})`);
            return res.status(404).send("Nyhed ikke fundet");
        }

        const by = req.session.fullName || req.session.username || "Ukendt";
        logInfo(`Nyhed slettet: "${deleted.title}" af ${by}`);

        return res.redirect("/");
    } catch (err) {
        logError("Fejl ved sletning af nyhed", err);
        return res.status(500).send("Kunne ikke slette nyhed");
    }
};
