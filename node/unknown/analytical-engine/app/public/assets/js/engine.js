/*
// browerserify code running in bundle.js
// provided for your convenience :>

const AE = require('analytical-engine');

window.run = (cards) => {
    let inf = new AE.Interface();
    inf.submitProgram(cards);
    inf.runToCompletion();
    return inf;
};
*/

let $ = document.querySelector.bind(document); // imagine using jQuery

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
};

// fix include statements to use include libraries from GitHub
let local = "https://raw.githubusercontent.com/cakenggt/analytical-engine-libraries/master/";
let library = "https://raw.githubusercontent.com/cakenggt/analytical-engine/master/Library/";
const fixup = async (card) => {
    let lines = card.split("\n");
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (!line || line[0] === "." || /\s/.test(line[0])) continue;

        if (line.startsWith("A include cards ")) {
            let name = line.slice("A include cards ".length);
            lines[i] = await fixup(await download(local + name + ".ae"));
        }
        if (line.startsWith("A include from library cards for ")) {
            let name = line.slice("A include from library cards for ".length);
            lines[i] = await fixup(await download(library + name + ".ae"));
        }
    }
    return lines.join("\n");
};

const download = async (url) => {
    return await (await fetch(url)).text();
};

class CardStorage {
    constructor() { this.cards = {} };
    addCard(folder, name, card) {
        if(!this.cards[folder]) this.cards[folder] = {};
        this.cards[folder][name] = () => card;
    }
    addCardFromURL(folder, name, url) {
        if(!this.cards[folder]) this.cards[folder] = {};
        this.cards[folder][name] = async () => await download(url);
    }
    async getCard(folder, name) {
        return await this.cards?.[folder]?.[name]?.();
    }
    getAllCards() {
        return Object.fromEntries(Object.keys(this.cards).map(f => [f, Object.keys(this.cards[f])]));
    }
    save() {
        let temp = Object.assign({}, this.cards);
        delete temp["GitHub Cards"];
        localStorage.saved = JSON.stringify(temp, (k, v) => typeof v === "function" ? v() : v);
    }
    load() {
        let saved = JSON.parse(localStorage.saved);
        for(let folder in saved) {
            for(let card in saved[folder]) this.addCard(folder, card, saved[folder][card]);
        }
    }
}

let cards = new CardStorage();

const listCards = () => {
    window.parent.postMessage({
        type: "list",
        list: cards.getAllCards()
    }, location.origin);
    cards.save();
};

window.onmessage = async (e) => {
    let {
        data,
        origin
    } = e;

    let isDebug = $("#developerMode") && $("#developerMode").innerHTML === "1";

    if (!isDebug && origin !== location.origin) {
        return;
    }

    let {
        type
    } = data;
    switch (type) {
        case "load":
            window.parent.postMessage({
                type,
                card: await cards.getCard(data.folder, data.name)
            }, location.origin);
            break;
        case "list":
            listCards();
            break;
        case "save":
            cards.addCard(data.folder, data.name, data.card);
            window.parent.postMessage({
                type: "msg",
                msg: "Card saved successfully."
            }, location.origin);
            listCards();
            break;
        case "download":
            window.parent.postMessage({
                type,
                card: await download(data.url)
            }, location.origin);
            break;
        case "run":
            let results = window.run(await fixup(data.card));
            let curve = results.curveDrawingApparatus.printScreen();
            if (curve.length !== 71) { // empty svg
                $("#curve").innerHTML = curve;
                results.curve = $("#curve").querySelector("svg").outerHTML;
            }
            window.parent.postMessage({
                type,
                results
            }, location.origin);
            break;
        case "debug":
            window.parent.postMessage({
                type: "cookie",
                cookie: `debug=${getCookie("debug") || "1"}`
            }, location.origin);
            setTimeout(() => window.parent.location.reload(), 1000);
            break;
    }
};

window.onload = () => {
    let ghCards = [
        { card: "printchar.ae", name: "printchar"},
        { card: "printstring.ae", name: "printstring"},
        { card: "set.ae", name: "set"},
        { card: "storestring.ae", name: "storestring"},
        { card: "get.ae", name: "get"},
        { card: "lmc.ae", name: "lmc"},
        { card: "mandelbrotviewer.ae", name: "mandlebrotviewer"}
    ];
    let base = "https://raw.githubusercontent.com/cakenggt/analytical-engine-libraries/master/Library/";
    for(let card of ghCards) {
        cards.addCardFromURL("GitHub Cards", card.name, base + card.card)
    }

    if(localStorage.saved) {
        cards.load();
    }

    listCards();
};