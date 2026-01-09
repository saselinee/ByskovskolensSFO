const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
    {
            title: { type: String, required: true, trim: true },
            content: { type: String, required: true },

            imageUrl: { type: String, default: "" },

            // Hvem oprettede nyheden
            createdBy: { type: String, required: true },

            // Hvem redigerede nyheden sidst (valgfri)
            updatedBy: { type: String, default: null },
    },
    { timestamps: true } // createdAt + updatedAt
);

module.exports = mongoose.model("News", newsSchema);
