const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true },
        date: { type: Date, default: Date.now },
        imageUrl: { type: String, default: "" },
        createdBy: { type: String, default: "" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("News", newsSchema);
