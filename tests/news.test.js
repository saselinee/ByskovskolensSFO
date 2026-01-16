const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const News = require("../models/News");

describe("News: adgangskontrol", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI);
        await News.deleteMany({ title: "Test nyhed" });
    });

    afterAll(async () => {
        await News.deleteMany({ title: "Test nyhed" });
        await mongoose.connection.close();
    });

    it("afviser oprettelse af nyhed uden login", async () => {
        const res = await request(app)
            .post("/news")
            .send({
                title: "Test nyhed",
                content: "Dette må ikke oprettes"
            });

        expect([401, 403, 302]).toContain(res.statusCode);
    });
});
const User = require("../models/User");
const bcrypt = require("bcrypt");

describe("News: oprettelse som admin", () => {
    let agent;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI);

        // Ryd testdata
        await User.deleteMany({ username: "newsadmin" });
        await News.deleteMany({ title: "Admin test nyhed" });

        // Opret test-admin
        const passwordHash = await bcrypt.hash("test1234", 10);
        await User.create({
            username: "newsadmin",
            passwordHash,
            role: "admin",
            firstName: "News",
            lastName: "Admin",
            birthDate: new Date("1995-01-01"),
            active: true
        });

        // Agent holder cookies (session)
        agent = request.agent(app);

        // Login som admin
        await agent
            .post("/adminLogin")
            .send({ username: "newsadmin", password: "test1234" })
            .expect(302);
    });

    afterAll(async () => {
        await User.deleteMany({ username: "newsadmin" });
        await News.deleteMany({ title: "Admin test nyhed" });
        await mongoose.connection.close();
    });

    it("opretter nyhed som logget admin", async () => {
        const res = await agent
            .post("/news")
            .send({
                title: "Admin test nyhed",
                content: "Denne nyhed er oprettet via test"
            });

        expect(res.statusCode).toBe(302);

        const created = await News.findOne({ title: "Admin test nyhed" });
        expect(created).toBeTruthy();
        expect(created.content).toBe("Denne nyhed er oprettet via test");
    });
});
