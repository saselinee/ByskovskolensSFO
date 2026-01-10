const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const User = require("../models/User");
const bcrypt = require("bcrypt");

describe("Auth: login", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI);

        // Ryd test-bruger hvis den findes
        await User.deleteMany({ username: "testadmin" });

        // Opret test-admin (skal matche User-schema)
        const passwordHash = await bcrypt.hash("test1234", 10);

        await User.create({
            username: "testadmin",
            passwordHash,
            role: "admin",
            firstName: "Test",
            lastName: "Admin",
            birthDate: new Date("2000-01-01"), // REQUIRED i dit schema
            active: true
        });
    });

    afterAll(async () => {
        await User.deleteMany({ username: "testadmin" });
        await mongoose.connection.close();
    });

    it("logger admin ind med korrekt login", async () => {
        const res = await request(app)
            .post("/adminLogin")
            .send({ username: "testadmin", password: "test1234" });

        // Du redirecter ved succes
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe("/");
    });
});
