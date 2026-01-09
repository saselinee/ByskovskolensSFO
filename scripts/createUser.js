require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");

async function createUser() {
    await mongoose.connect(process.env.MONGODB_URI);

    const passwordHash = await bcrypt.hash("admin123", 10);

    await User.create({
        username: "superadmin",
        passwordHash,
        role: "superadmin"
    });

    console.log("Bruger oprettet:");
    console.log("brugernavn: superadmin");
    console.log("password: admin123");

    process.exit();
}

createUser().catch(err => {
    console.error(err);
    process.exit(1);
});
