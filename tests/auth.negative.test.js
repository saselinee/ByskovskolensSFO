const request = require("supertest");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/User");

let app;

describe("Auth: negative scenarier", () => {
    beforeAll(async () => {
        process.env.NODE_ENV = "test";
        app = require("../server");
    });

    beforeEach(async () => {
        await User.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    test("afviser login med forkert password (401)", async () => {
        const passwordHash = await bcrypt.hash("rigtigtPassword", 10);

        await User.create({
            username: "testadmin",
            passwordHash,
            role: "admin",
            firstName: "Test",
            lastName: "Admin",
            birthDate: new Date("1990-01-01"),
            active: true,
        });

        const res = await request(app)
            .post("/adminLogin")
            .type("form")
            .send({ username: "testadmin", password: "forkertPassword" });

        expect(res.status).toBe(401);
    });

    test("afviser login hvis konto er deaktiveret (403)", async () => {
        const passwordHash = await bcrypt.hash("password123", 10);

        await User.create({
            username: "disabledadmin",
            passwordHash,
            role: "admin",
            firstName: "Disabled",
            lastName: "Admin",
            birthDate: new Date("1990-01-01"),
            active: false,
        });

        const res = await request(app)
            .post("/adminLogin")
            .type("form")
            .send({ username: "disabledadmin", password: "password123" });

        expect(res.status).toBe(403);
    });
});
