const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");

let app;

describe("Superadmin: negative scenarier", () => {
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

    test("afviser adgang til superadmin som almindelig admin (403/401)", async () => {
        const agent = request.agent(app);

        const passwordHash = await bcrypt.hash("password123", 10);
        await User.create({
            username: "normaladmin",
            passwordHash,
            role: "admin",
            firstName: "Normal",
            lastName: "Admin",
            birthDate: new Date("1990-01-01"),
            active: true,
        });

        const loginRes = await agent
            .post("/adminLogin")
            .type("form")
            .send({ username: "normaladmin", password: "password123" });

        expect([200, 302]).toContain(loginRes.status);

        const res = await agent.get("/superadmin/admins");
        expect([401, 403]).toContain(res.status);
    });
});
