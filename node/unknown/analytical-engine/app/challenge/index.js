const express = require("express");
const crypto = require("crypto");

const app = express();

const PORT = process.env.PORT || 80;

app.set("view engine", "hbs");
app.use(require("cookie-parser")());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.use(require("express-session")({
    secret: crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
}));

app.use((req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString("hex");
    res.setHeader("Content-Security-Policy", `
        default-src 'self';
        style-src
            'self'
            https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css
            https://fonts.googleapis.com/css
            https://use.fontawesome.com/releases/v5.12.0/css/all.css;
        font-src
            https://fonts.gstatic.com/s/
            https://use.fontawesome.com/releases/v5.12.0/webfonts/;
        connect-src 'self' https://raw.githubusercontent.com/cakenggt/;
        object-src 'none';
        base-uri 'self';
        script-src 'nonce-${res.locals.nonce}' 'unsafe-inline';
    `.trim().replace(/\s+/g, " "));
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    if(req.cookies.debug) res.locals.debug = req.cookies.debug;
    if(req.session.msg) {
        res.locals.msg = req.session.msg;
        req.session.msg = null;
    }
    next();
});

let checking = false;
const bot = require("./bot.js");
app.post("/report", async (req, res) => {
    let { link } = req.body;

    if(checking) {
        req.session.msg = "Please wait for the previous submission to finish.";
        return res.redirect("/report");
    }

    if(!link) {
        req.session.msg = "Missing link.";
        return res.redirect("/report");
    }

    let url;
    try {
        url = new URL(link);
    }
    catch (err) {
        req.session.msg = "Invalid link.";
        return res.redirect("/report");
    }

    if(!['http:', 'https:'].includes(url.protocol)) {
        req.session.msg = "Link must be of protocol http: or https:";
        return res.redirect("/report");
    }

    checking = true;

    req.session.msg = "Checking out your link now...";
    res.redirect("/report");

    await bot.visit(link);

    checking = false;
});

app.get("/report", (req, res) => res.render("report"));
app.get("/engine", (req, res) => res.render("engine"));
app.get("/", (req, res) => res.render("index"));

app.get('*', (req, res) => {
    res.set("Content-Type", "text/plain");
    res.status = 404;
    res.send(`Error: ${req.originalUrl} was not found`);
});

app.use((err, req, res, next) => {
    res.set("Content-Type", "text/plain");
    res.send(`Error: ${err.message}`);
});

app.listen(PORT, () => console.log(`AnalyticalEngine listening on port ${PORT}`));