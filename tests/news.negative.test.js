const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const News = require("../models/News");

let app;

describe("News: negative scenarier", () => {
    beforeAll(async () => {
        process.env.NODE_ENV = "test";
        app = require("../server");
    });

    beforeEach(async () => {
        await User.deleteMany({});
        await News.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    test("afviser oprettelse af nyhed uden login (401)", async () => {
        const res = await request(app)
            .post("/news")
            .type("form")
            .send({ title: "Titel", content: "Indhold" });

        expect(res.status).toBe(401);
    });

    test("afviser oprettelse af nyhed hvis titel mangler (400) - kræver login", async () => {
        const agent = request.agent(app);

        // Opret admin i test-databasen
        const passwordHash = await bcrypt.hash("password123", 10);
        await User.create({
            username: "newsadmin",
            passwordHash,
            role: "admin",
            firstName: "News",
            lastName: "Admin",
            birthDate: new Date("1990-01-01"),
            active: true,
        });

        // Log ind (gemmer session i agent)
        const loginRes = await agent
            .post("/adminLogin")
            .type("form")
            .send({ username: "newsadmin", password: "password123" });

        expect([200, 302]).toContain(loginRes.status);

        // Post nyhed uden titel
        const res = await agent
            .post("/news")
            .type("form")
            .send({ content: "Indhold uden titel" });

        expect(res.status).toBe(400);
    });

    test("afviser oprettelse af nyhed hvis indhold mangler (400) - kræver login", async () => {
        const agent = request.agent(app);

        const passwordHash = await bcrypt.hash("password123", 10);
        await User.create({
            username: "newsadmin2",
            passwordHash,
            role: "admin",
            firstName: "News",
            lastName: "Admin2",
            birthDate: new Date("1990-01-01"),
            active: true,
        });

        const loginRes = await agent
            .post("/adminLogin")
            .type("form")
            .send({ username: "newsadmin2", password: "password123" });

        expect([200, 302]).toContain(loginRes.status);

        // Post nyhed uden indhold
        const res = await agent
            .post("/news")
            .type("form")
            .send({ title: "Titel uden indhold" });

        expect(res.status).toBe(400);
    });
});
