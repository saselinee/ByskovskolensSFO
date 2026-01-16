// Adgangskontrol middleware (genbruges af routes)

// Skal være logget ind
function requireLogin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).send("Du er ikke logget ind");
    }
    next();
}

// Skal være admin eller superadmin
function requireAdmin(req, res, next) {
    if (!["admin", "superadmin"].includes(req.session.role)) {
        return res.status(403).send("Adgang nægtet");
    }
    next();
}

// Skal være superadmin
function requireSuperAdmin(req, res, next) {
    if (req.session.role !== "superadmin") {
        return res.status(403).send("Kun superadmin har adgang");
    }
    next();
}

module.exports = {
    requireLogin,
    requireAdmin,
    requireSuperAdmin,
};
