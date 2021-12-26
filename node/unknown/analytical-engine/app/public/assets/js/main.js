let $ = document.querySelector.bind(document); // imagine using jQuery

$("#execute").onclick = () => {
    let card = $("#input").value;
    $("#engine").contentWindow.postMessage({
        type: "run",
        card
    },  location.origin);
    $("#output").scrollIntoView();
};

$("#reset").onclick = () => {
    $("#input").value = "";
    $("#output").innerText = "";
};

$("#save").onclick = () => {
    let folder = prompt("Enter folder name:", "Default");
    if(!folder) return;
    let name = prompt("Enter card name:");
    if(!name) return;
    let card = $("#input").value;
    $("#engine").contentWindow.postMessage({
        type: "save",
        folder, name, card
    }, location.origin);
};

$("#load").onclick = () => {
    let o = $("#cards").options[$("#cards").selectedIndex];
    $("#engine").contentWindow.postMessage({
        type: "load",
        folder: o.name, name: o.value
    }, location.origin);
};

window.onmessage = (e) => {
    let {
        data,
        origin,
        source
    } = e;

    if (origin !== location.origin || source !== $("#engine").contentWindow) {
        return;
    }

    let {
        type
    } = data;
    switch (type) {
        case "run":
            let inf = data.results;

            if (inf.curve) {
                $("#curve").innerHTML = inf.curve;
            }

            let output = "";
            if (inf.annunciator.L_output) {
                output += "--- Errors ---\n";
                output += inf.annunciator.L_output;
                output += "\n\n";
            }
            if (inf.printer.O_output) {
                output += "--- Printer ---\n";
                output += inf.printer.O_output;
                output += "\n\n";
            }
            if (inf.store.rack.length > 0) {
                output += "--- Store ---\n";
                inf.store.rack.forEach((rack, i) => {
                    output += `${i}`.padStart(3, '0') + "\t" + rack.value + "\n";
                });
            }
            $("#output").innerText = output;

            break;
        case "msg":
            alert(data.msg);
            break;
        case "load":
            $("#input").value = data.card;
            break;
        case "download":
            $("#input").value = data.card;
            $("#execute").click();
            break;
        case "cookie":
            document.cookie = data.cookie;
            break;
        case "list":
            let list = data.list;
            $("#cards").innerHTML = "";
            let o = document.createElement("option");
            o.disabled = o.selected = true;
            o.innerText = "---";
            $("#cards").appendChild(o);
            Object.keys(list).forEach(folder => {
                let o = document.createElement("option");
                o.disabled = true;
                o.innerText = folder;
                $("#cards").appendChild(o);
                list[folder].forEach(name => {
                    let o = document.createElement("option");
                    o.innerText = o.value = name;
                    o.name = folder;
                    $("#cards").appendChild(o);
                });
            });
            break;
    };
};

window.onload = () => {
    let params = new URLSearchParams(location.search);
    if (params.get("card")) {
        let base = `https://raw.githubusercontent.com/cakenggt/analytical-engine-libraries/master/Library/`;
        let card = params.get("card");
        let url = new URL(base + card);

        if (!url.pathname.startsWith(new URL(base).pathname) || url.hostname !== "raw.githubusercontent.com") {
            alert(`[ERROR] Blocked autoload for card ${url}`);
            return;
        }

        $("#engine").contentWindow.postMessage({
            type: "download",
            url: url.toString()
        }, location.origin);
    }

    $("#engine").contentWindow.postMessage({
        type: "list"
    });
};