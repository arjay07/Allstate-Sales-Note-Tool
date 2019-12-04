window.onload = onLoad;

function onLoad() {

    var isie = false;
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        isie = true;
    }
    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        isie = true;
    }

    if (isie) {
        var qs = document.getElementById("quickstart");
        qs.classList.remove("hidden");
        var splash = document.getElementById("splash");
        splash.classList.add("hidden");
    }

    if(!isie){
        setTimeout(function(){
        animateCSS(".splash", "slideOutUp", function(){
                var splash = document.getElementById("splash");
                splash.classList.add("hidden");
            })
        }, 1450);
    }

}

var selectedQuote = "auto";

function selectquote() {
    var quotes = document.getElementById("quotes");
    var quote = quotes.options[quotes.selectedIndex].value;

    var notes = document.getElementsByClassName("note");

    for (var i = 0; i < notes.length; i++) {
        notes[i].classList.remove("active");
    }

    var note = document.getElementById(quote);

    note.classList.add("active");

    selectedQuote = quote;
}

function resetNotes() {

    var shouldReset = confirm("Are you sure you want to reset your notes?");

    if (shouldReset == true) {
        alert("Notes successfully reset!")
        var elements = document.getElementsByTagName("input");
        for (var ii = 0; ii < elements.length; ii++) {
            if (elements[ii].type == "text" || elements[ii].type == "number") {
                elements[ii].value = "";
            }
        }
        var areas = document.getElementsByTagName("textarea");
        for (var aa = 0; aa < areas.length; aa++) {
            areas[aa].innerHTML = "";
            areas[aa].value = "";
        }
    }

}

function gatherInfo() {
    var data = {};

    data.freeform = document.getElementById("freeform").value;
    data.quotetype = selectedQuote;

    var elements = document.getElementsByTagName("input");
    for (var ii = 0; ii < elements.length; ii++) {
        var e = elements[ii];
        if ((isDescendant(document.getElementById(selectedQuote), e) && e.value != "" && e.type != "checkbox") || (isDescendant(document.getElementById("customerinfo"), e) && e.value != "" && e.type != "checkbox")) {
            data[e.id] = e.value;
        }
    }
    var areas = document.getElementsByTagName("textarea");
    for (var aa = 0; aa < areas.length; aa++) {
        var a = areas[aa];
        if (isDescendant(document.getElementById(selectedQuote), a) && a.value != "") {
            data[a.id] = a.value;
        }
    }
    var select = document.getElementsByTagName("select");
    for (var ss = 0; ss < select.length; ss++) {
        var s = select[ss];
        var se = s.options[s.selectedIndex]
        if ((isDescendant(document.getElementById(selectedQuote), s) && se.value != "") || (isDescendant(document.getElementById("customerinfo"), s) && se.value != "")) {
            data[s.id] = se.value;
        }
    }
    var checkbox = document.getElementsByTagName("input");
    for (var cc = 0; cc < checkbox.length; cc++) {
        var c = checkbox[cc];
        if ((isDescendant(document.getElementById(selectedQuote), c) && c.type == "checkbox") || (isDescendant(document.getElementById("customerinfo"), c) && c.type == "checkbox")) {
            data[c.id] = c.checked;
        }
    }

    return data;

}

function generateNote() {

    animateCSS(".overlay", "fadeIn");

    var data = gatherInfo();
    var note = data.freeform + "\n\n";

    function addNote(label, datakey) {
        if (datakey) note += label + ": " + datakey + "\n";
    }

    addNote("Agent #", data.agent);

    note += "\n";

    note += data.customername + " called in for a quote on " + data.quotetype + ".\n";

    if (data.permission) note = note + "Received permission to call customer back at " + data.customernumber + "\n";

    if (data.facta == "accept") note += "FACTA was read. Customer accepted."
    else if (data.facta == "declined") note += "FACTA was read. Customer declined."
    else {
        note += "Did not read FACTA."
    }

    note += "\n\n";

    addNote("Control Number", data.controlnumber);
    addNote("Policy Number", data.policynumber);
    addNote("Effective Date", data.effectivedate);
    addNote("Closing Date", data.closingdate);
    addNote("Declared Prior", data.declaredprior);
    addNote("No need reason", data.noneed);

    if (data.pqbmodified == "Yes") note += "PQB incidents were modified and/or deleted. Notated in Transaction Remarks."
    else if (data.pqbmodified == "No") note += "PQB incidents were not modified and/or deleted.\n"

    addNote("Number of vehicles", data.vehicles);

    note += "\nCoverage\n";

    addNote("Bodily Injury", data.bilimits);
    addNote("Property Damage", data.pdlimits);
    addNote("Watercraft Liability", data.watercraftliability);
    addNote("Collision", data.collision);
    addNote("Comprehensive", data.comprehensive);
    addNote("CARCO", data.carco);
    addNote("Customer rejected these coverages", data.rejected);

    note += "\nPayment\n";

    addNote("Quoted Premium", data.quoteprice);
    addNote("Declined bind because", data.decline);
    addNote("Down Payment", data.downpayment);
    addNote("Down Payment Method", data.paymethod);
    addNote("Down Payment Reference #", data.refnumber);

    note += "\nDocuments\n";

    addNote("Customer sent in", data.docsreceived);

    if (data.informedoftdocs == "yes") note += "Discussed " + data.quotetype + " required T-Docs with the customer.\n"
    else if (data.informedoftdocs == "no") note += "Did not discuss " + data.quotetype + " required T-Docs with the customer.\n"
    else note += "Did not discuss " + data.quotetype + " required T-Docs with the customer.\n"

    if (data.esign == "opt-in") note += "Customer opted-in for E-Sign."
    else if (data.esign == "opt-out") note += "Customer opted-out for E-Sign."
    else note += "Did not discuss E-Sign with the customer."

    var preview = document.getElementById("preview");

    var overlay = document.getElementById("overlay");
    overlay.classList.add("active");

    preview.value = note;

}

function closePreview() {
    animateCSS(".overlay", "fadeOut", function () {
        var overlay = document.getElementById("overlay");
        overlay.classList.remove("active");
    });
}

function copy() {
    var textarea = document.getElementById("preview");
    textarea.select();
    document.execCommand("copy");
    alert("Copied note to clipboard.")
}

function quickStart() {
    var links = [
        "https://oneview.allstate.com/CTIServer/CTIClientApp.jnlp",
        "https://allstate.rightanswers.com/portal/sa/",
        "https://entimpact360/wfo"
    ];

    for (var i = 0; i < links.length; i++) {
        window.open(links[i], "_blank");
    }

}

function isDescendant(parent, child) {
    var node = child.parentNode;
    while (node != null) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

function animateCSS(element, animationName, callback) {
    const node = document.querySelector(element)
    node.classList.add('animated', animationName)

    function handleAnimationEnd() {
        node.classList.remove('animated', animationName)
        node.removeEventListener('animationend', handleAnimationEnd)

        if (typeof callback === 'function') callback()
    }

    node.addEventListener('animationend', handleAnimationEnd)
}