window.onload = onLoad;
window.onhashchange = onHashChange;

var isie;
var selectedQuote = "auto";
var openedQuotes = ["auto", "homeowners"];
var drawerOpen = false;
var binds = [
    [
        {
            value: "Date",
        },
        {
            value: "Customer Name"
        },
        {
            value: "Control #"
        },
        {
            value: "Premium"
        },
        {
            value: "Items"
        },
        {
            value: "Policy #"
        },
        {
            value: "Reference #"
        }
    ]
];
var callbacks = [];
var settings = {
    theme: "default",
    alwaysFullNote: false,
    showIELinks: false
};
var mvrcodesdata = null;
var debug = true;
var toastShowing = false;
var whatsnew = false;
var version = "1.6";
var DateTime = luxon.DateTime;

if (getCookie("settings") != "") loadSettings();

function onLoad() {

    if (getCookie("bindlog") != "") binds = retrieveBindLog();

    if (getCookie("version") != version) {
        setCookie("version", version, 365);
        whatsnew = true;
    }

    if (getCookie("callbacks") != "") callbacks = getCallbacks();

    loadTheme(settings.theme);
    setFullScreenNote(settings.alwaysFullNote);
    document.getElementById("showielinks").checked = settings.showIELinks;

    dragElement(document.getElementById("calcdraggable"));

    isie = false;
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        isie = true;
    }
    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        isie = true;
    }

    if (!isie) setInterval(startClock, 1000);

    var notes = document.getElementsByClassName("note");

    for (var i = 0; i < notes.length; i++) {
        notes[i].classList.add("faster");
    }

    animateCSS(".navbar", "slideInDown");

    if (isie) {
        var qs = document.getElementById("quickstart");
        qs.classList.remove("hidden");
        setTimeout(function () {
            var splash = document.getElementById("splash");
            splash.classList.add("hidden");
            //document.removeChild(splash);
        }, 2000);
        var dl = document.getElementsByClassName("chromeonly");
        while (dl.length > 0) {
            dl[0].parentNode.removeChild(dl[0]);
        }
    }

    if (!isie) {
        $("[data-toggle='datepicker']").datepicker({
            date: getToday()
        });

        $("input[data-toggle='timepicker']").timepicker({
            defaultTime: "now",
            startTime: "10:00",
            dynamic: false
        });

        var dl = document.getElementsByClassName("ieonly");
        if (!settings.showIELinks)
            while (dl.length > 0) {
                dl[0].parentNode.removeChild(dl[0]);
            }
        setTimeout(function () {
            animateCSS(".splash", "slideOutUp", function () {
                var splash = document.getElementById("splash");
                splash.classList.add("hidden");
            })
        }, 1450);
    }

    if (whatsnew) {
        setTimeout(function () {
            openOverlay("whatsnewoverlay");
        }, 1500);
    }

    mvrcodesdata = JSON.parse(readTextFile("json/hi_mvr_codes.json"));

    document.getElementById("version").innerText = "Version " + version;

    var dates = document.getElementsByTagName("input");

    for (var ii = 0; ii < dates.length; ii++) {
        if (dates[ii].type == "date" || dates[ii].dataset.toggle == "datepicker") {
            dates[ii].value = getToday();
        }
    }

    var selects = document.getElementsByTagName("select");

    for (var i = 0; i < selects.length; i++) {
        var select = selects[i];

        if (select.id == "informedoftdocs") {
            select.value = "yes";
        }
    }

    var dc = document.getElementsByClassName("drawercontents")[0];

    document.getElementById("checkauto").checked = true;
    document.getElementById("checkhomeowners").checked = true;
    refreshTabs();

    var drawercontents = document.getElementsByClassName("drawercontents")[0];

    runTool();

    //saveAllValues();
    //loadAllValues();

}

function saveAllValues() {
    var inputs = document.querySelectorAll("input[type=text]");
    var textareas = document.querySelectorAll("textarea");

    inputs.forEach(function (input) {
        saveValue(input);
    });

    textareas.forEach(function (textarea) {
        saveValue(textarea);
    });
}

function loadAllValues() {
    var inputs = document.querySelectorAll("input[type=text]");
    var textareas = document.querySelectorAll("textarea");

    inputs.forEach(function (input) {
        getValue(value);
    });

    textareas.forEach(function (textarea) {
        getValue(textarea);
    });
}

function onHashChange() {
    runTool();
}

function startClock() {
    var timezones = document.getElementsByClassName("timezone");

    for (var i = 0; i < timezones.length; i++) {
        var timezone = timezones[i];
        var tz = timezone.dataset.timezone;
        var date = DateTime.local().setZone(tz);

        timezone.innerText = date.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);
    }

    callbacks.forEach(function (callback, index, array) {
        var dateTime = DateTime.local();
        var alerted = callback.alerted;
        var reminded = callback.reminded;
        var callbackDate = callback.date;
        var callbackTime = callback.time;
        var callbackRemind = callback.remind;
        var callbackDateTime = DateTime.fromFormat(callbackDate + " " + callbackTime, "MM/dd/yyyy hh:mm a");
        var remindDateTime = callbackDateTime.minus({ minutes: callbackRemind });

        if (dateTime >= callbackDateTime) {
            if (!alerted) {
                alertCallback(callback);
                callback.alerted = true;
                callback.reminded = true;
            }
        } else if (dateTime >= remindDateTime) {
            if (!reminded) {
                alertZebra("A callback was scheduled for <strong>" + callback.name + "</strong> at <em>" + callbackTime + "</em> on " + callbackDate + ". Callback number is <strong>" + callback.number + "</strong>.", "Callback Reminder");
                callback.reminded = true;
            }
        }

    });
}

function runTool() {
    var tool = location.hash.substring(1);

    switch (tool) {
        case "bindlog":
            openBindLogView();
            break;

        case "callbacks":
            openOverlay("callbacksviewoverlay");
            break;

        case "clock":
            openOverlay("clockoverlay");
            break;

        case "disconnected":
            generateDisconnectedNote();
            break;

        case "fullscreen":
            setFullScreenNote(true);
            break;

        case "ghostcall":
            startGhostScript();
            break;

        case "hawaiitools":
            openOverlay('hitoolsoverlay');
            break;

        case "narrativegenerator":
            openNarrative();
            break;

        case "quickstart":
            quickStart();
            break;

        case "whatsnew":
            openOverlay("whatsnewoverlay");
            break;
    }

}

function scheduleCallback() {
    var date = document.getElementById("callbackdate").value;
    var time = document.getElementById("callbacktime").value;
    var name = document.getElementById("callbackname").value;
    var number = document.getElementById("callbacknumber").value;
    var r = document.getElementById("callbackreminder");
    var remind = parseInt(r.options[r.selectedIndex].value);

    var callback = createCallback(name, number, date, time, remind);

    toastMessage("Scheduled callback for " + (callback.name ? callback.name : "customer") + ".");

    buildCallbacks();
}

function createCallback(name, number, date, time, remind) {

    var data = gatherInfo();
    var callback = {
        name: name ? name : data.customername,
        number: number ? number : data.phonenumber,
        date: date,
        time: time,
        note: generateNote(true),
        alerted: false,
        reminded: false,
        snoozed: false,
        remind: remind
    };
    callbacks.push(callback);

    saveCallbacks();

    return callback;

}

function buildCallbacks() {
    var table = document.getElementById("callbackstable");
    table.innerHTML = "<tr><td></td><td><h3>Date</h3></td><td><h3>Time</h3></td><td><h3>Name</h3></td><td><h3>Number</h3></td><td><h3>View Note</h3></td></tr>";

    callbacks.sort(function (a, b) {
        return DateTime.fromFormat(a.date + " " + a.time, "MM/dd/yyyy hh:mm a") - DateTime.fromFormat(b.date + " " + b.time, "MM/dd/yyyy hh:mm a");
    });

    callbacks.forEach(function (cb, row, array) {
        var tr = document.createElement("tr");

        var bell = {
            grey: '<i class="fas fa-bell fa-2x" title="Snoozed" style="color:#979797;"></i>',
            regular: '<i class="far fa-bell fa-2x" title="Upcoming"></i>',
            solid: '<i class="fas fa-bell fa-2x" title="Alerted"></i>'
        };

        var status = document.createElement("td");
        if (!cb.alerted && !cb.snoozed) {
            status.innerHTML = bell.regular;
        } else if (cb.snoozed) {
            status.innerHTML = bell.grey;
        } else if (cb.alerted) {
            status.innerHTML = bell.solid;
        }
        tr.appendChild(status);

        var date = document.createElement("td");
        date.innerHTML = cb.date;
        tr.appendChild(date);

        var time = document.createElement("td");
        time.innerHTML = cb.time;
        tr.appendChild(time);

        var name = document.createElement("td");
        name.innerHTML = cb.name;
        tr.appendChild(name);

        var number = document.createElement("td");
        number.innerHTML = cb.number;
        tr.appendChild(number);

        var viewnote = document.createElement("td");
        var viewnotebtn = document.createElement("div");
        viewnotebtn.classList.add("btn");
        viewnotebtn.innerText = "View Note";
        viewnotebtn.onclick = function () {
            var note = cb.note;
            openOverlay('overlay');
            document.getElementById("preview").value = note;
        }
        viewnote.appendChild(viewnotebtn);
        tr.appendChild(viewnote);

        table.appendChild(tr);

        var close = document.createElement("td");
        close.classList.add("tableclose");
        close.innerHTML = "&times;"
        close.addEventListener("click", function (e) {
            warningZebra("Are you sure you want to delete this callback? This cannot be undone.", "Delete Callback", function () {
                array.splice(row, 1);
                saveCallbacks();
                buildCallbacks();
            });
        });
        tr.appendChild(close);
    });
}

function saveCallbacks() {
    setCookie("callbacks", JSON.stringify(callbacks), 365);
}

function getCallbacks() {
    return JSON.parse(getCookie("callbacks"));
}

function callbackOverlay(overlay) {

    var data = gatherInfo();

    var name = document.getElementById("callbackname");
    var number = document.getElementById("callbacknumber");

    if (data.customername) name.value = data.customername;
    if (data.customernumber) number.value = data.customernumber;

}

function formatPhoneNumber(phoneNumberString) {
    var cleaned = ('' + phoneNumberString).replace(/\D/g, '')
    var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3]
    }
    return null
}

function getOpenedQuotes() {
    var tabs = document.getElementsByClassName("tab activeinline");

    var oq = [];

    for (var i = 0; i < tabs.length; i++) {
        var tab = tabs[i];
        var q = tab.id.replace("tab", "");
        oq.push(q);
    }

    return oq;
}

function selectquote(quote) {

    var notes = document.getElementsByClassName("note");

    for (var i = 0; i < notes.length; i++) {
        notes[i].classList.remove("active");
    }

    var note = document.getElementById(quote);
    var prenote = document.getElementById(selectedQuote);

    var inotes = [];

    for (var i = 0; i < notes.length; i++) {
        inotes.push(notes[i].id);
    }

    var animation = "slideInLeft";

    if (inotes.indexOf(quote) < inotes.indexOf(selectedQuote))
        animation = "slideOutRight";
    else if (inotes.indexOf(quote) > inotes.indexOf(selectedQuote))
        animation = "slideOutLeft";
    else animation = "none";

    note.classList.add("preactive");
    prenote.classList.add("preactive");

    if (!isie && animation != "none") animateCSS("#" + selectedQuote, animation, function () {
        note.classList.remove("preactive");
        prenote.classList.remove("preactive");
        note.classList.add("active");
    });
    else {
        note.classList.remove("preactive");
        prenote.classList.remove("preactive");
        note.classList.add("active");
    }

    selectedQuote = quote;
}

function switchQuote(id) {

    var inotes = document.getElementsByClassName("note");
    var notes = [];

    for (var i = 0; i < inotes.length; i++) {
        notes.push(inotes[i].id);
    }
    var tab = document.getElementById(id);
    var tabs = document.getElementsByClassName("tab");

    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("selectedtab");
    }

    tab.classList.add("selectedtab");

    var quote = id.substring(3, id.length);

    var animation = "slideOutRight";

    if (notes.indexOf(quote) < notes.indexOf(selectedQuote))
        animation = "slideInLeft";
    else if (notes.indexOf(quote) > notes.indexOf(selectedQuote))
        animation = "slideInRight";
    else animation = "none";

    if (!isie && animation != "none") animateCSS("#" + quote, animation)
    selectquote(quote);
}

function refreshTabs() {

    var filtercheckbox = document.getElementsByClassName("filtercheckbox");

    for (var i = 0; i < filtercheckbox.length; i++) {
        var c = filtercheckbox[i];
        var tab = document.getElementById(c.id.replace("check", "tab"));
        if (c.checked) {
            tab.classList.add("activeinline");
        } else {
            tab.classList.remove("activeinline");
        }
    }

    var activetabs = document.getElementsByClassName("activeinline");

    openedQuotes = getOpenedQuotes();

    switchQuote(activetabs[0].id);

}

function toggleFullScreenNote() {
    var freeform = document.getElementsByClassName("freeform")[0];

    if (freeform.classList.contains("fullnote")) {
        freeform.classList.remove("fullnote");
    } else {
        freeform.classList.add("fullnote");
    }
}

function setSetting(setting, value) {
    settings[setting] = value;
}

function setFullScreenNote(alwaysFullNote) {
    var freeform = document.getElementsByClassName("freeform")[0];

    document.getElementById("fullnotecheck").checked = alwaysFullNote;

    if (!alwaysFullNote) {
        freeform.classList.remove("fullnote");
    } else {
        freeform.classList.add("fullnote");
    }
}


function copyFreeform() {
    var freeform = document.getElementById("freeform")
    copyText(freeform.value);
    toastMessage("Copied notes to clipboard!");
}

function shareThis(tool) {
    copyText(window.location.href.replace(location.hash, "") + "#" + tool);
    toastMessage("Copied tool link!");
}

function copyText(value) {
    var tempInput = document.createElement("textarea");
    tempInput.style = "position: absolute; left: -1000px; top: -1000px";
    tempInput.value = value;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
}

function toastMessage(msg, length) {
    var toast = document.createElement("div");
    toast.innerText = msg;

    var toastLength = length ? length : 2500;

    document.body.appendChild(toast);

    toast.classList.add("toast");
    toast.classList.add("faster");

    animateCSS(".toast", "fadeInDown");

    setTimeout(
        function () {
            if (!isie) {
                animateCSS(".toast", "fadeOutUp", function () {
                    document.body.removeChild(toast);
                });
            } else {
                document.body.removeChild(toast);
            }
        }, toastLength);

}

function loadTheme(theme) {

    if (theme) {
        document.getElementById("themeselect").value = theme;
        settings.theme = theme;
    }

    var oldLink = document.querySelector("link[title=THEME]");
    var link = document.createElement("link");
    link.setAttribute("href", "themes/" + theme + "theme.css");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("title", "THEME");

    if (!oldLink) {
        document.head.appendChild(link);
    } else {
        document.head.replaceChild(link, oldLink);
    }
}

function setAlwaysFullscreen(checked) {
    settings.alwaysFullNote = checked;
    setFullScreenNote(checked);
}

function saveSettings() {
    var s = JSON.stringify(settings);
    setCookie("settings", s, 365);
    toastMessage("Saved settings.");
}

function loadSettings() {
    var s = JSON.parse(getCookie("settings"));
    settings = s;
}

function resetNotes() {

    var dialog = warningZebra("Are you sure you want to reset your notes?", "Reset Notes",
        function () {
            toastMessage("Notes successfully reset!")
            var elements = document.getElementsByTagName("input");
            for (var ii = 0; ii < elements.length; ii++) {
                if (elements[ii].type == "text" || elements[ii].type == "number") {
                    elements[ii].value = "";
                }

                if (elements[ii].dataset.toggle == "datepicker") {
                    elements[ii].value = getToday();
                }

                if (elements[ii].dataset.toggle == "timepicker" && !isie) {
                    elements[ii].value = DateTime.local().toLocaleString(DateTime.TIME_SIMPLE);
                }
            }
            var areas = document.getElementsByTagName("textarea");
            for (var aa = 0; aa < areas.length; aa++) {
                areas[aa].innerHTML = "";
                areas[aa].value = "";
            }
            var selects = document.getElementsByTagName("select");
            for (var ss = 0; ss < selects.length; ss++) {
                var s = selects[ss];
                s.selectedIndex = 0;

            }

            while($("#remarkstable").length)
                $("#remarkstable").remove();
        }
    );

}

var dropdownOpen = false;

function toggleDropDown() {
    var btn = document.getElementsByClassName("filterbtn")[0];
    var dropdown = document.getElementsByClassName("quotefilter")[0];

    if (dropdownOpen) {
        btn.classList.remove("filteractive");
        dropdown.classList.remove("quotefilteractive");
        dropdownOpen = false;
    } else {
        btn.classList.add("filteractive");
        dropdown.classList.add("quotefilteractive");
        dropdownOpen = true;
    }
}

function gatherInfo(quote) {

    if (!quote) quote = selectedQuote;

    var data = {};

    data.freeform = document.getElementById("freeform").value;
    data.quotetype = quote;

    var elements = document.getElementsByTagName("input");
    for (var ii = 0; ii < elements.length; ii++) {
        var e = elements[ii];
        if ((isDescendant(document.getElementById(data.quotetype), e) && e.value != "" && e.type != "checkbox") || (isDescendant(document.getElementById("customerinfo"), e) && e.value != "" && e.type != "checkbox")) {
            data[e.id] = e.value;
        }
    }
    var areas = document.getElementsByTagName("textarea");
    for (var aa = 0; aa < areas.length; aa++) {
        var a = areas[aa];
        if (isDescendant(document.getElementById(data.quotetype), a) && a.value != "") {
            data[a.id] = a.value;
        }
    }
    var select = document.getElementsByTagName("select");
    for (var ss = 0; ss < select.length; ss++) {
        var s = select[ss];
        var se = s.options[s.selectedIndex]
        if ((isDescendant(document.getElementById(data.quotetype), s) && se.value != "") || (isDescendant(document.getElementById("customerinfo"), s) && se.value != "")) {
            data[s.id] = se.value;
        }
    }
    var checkbox = document.getElementsByTagName("input");
    for (var cc = 0; cc < checkbox.length; cc++) {
        var c = checkbox[cc];
        if ((isDescendant(document.getElementById(data.quotetype), c) && c.type == "checkbox") || (isDescendant(document.getElementById("customerinfo"), c) && c.type == "checkbox")) {
            data[c.id] = c.checked;
        }
    }

    return data;

}

function generateNote(showPreview) {

    if (!showPreview) animateCSS(".overlay", "fadeIn");

    var data = gatherInfo(selectedQuote);

    var note = "";

    if (data.freeform) note += data.freeform + "\n\n";

    function addNote(label, datakey) {
        if (datakey) note += label + ": " + datakey + "\n";
    }

    if (data.agent) {
        addNote("Agent #", data.agent);

        note += "\n";
    }

    note += (data.customername ? data.customername : "Customer") + " called in for a quote on " + data.quotetype + ".\n";

    if (data.permission) note = note + "Received permission to call customer back at " + data.customernumber + "\n";

    if (data.facta == "accept") note += "FACTA was read. Customer accepted."
    else if (data.facta == "declined") note += "FACTA was read. Customer declined."
    else {
        note += "Did not read FACTA."
    }

    note += "\n\n";

    openedQuotes.forEach(function (quote) {

        var data = gatherInfo(quote);

        if (data.controlnumber) {

            note += (!isie ? quote.capitalize() : quote) + "\n\n";

            addNote("Control Number", data.controlnumber);
            addNote("Policy Number", data.policynumber);
            addNote("Effective Date", data.effectivedate);
            addNote("Closing Date", data.closingdate);
            addNote("Declared Prior", data.declaredprior);
            addNote("No need reason", data.noneed);

            if (data.pqbmodified == "Yes") note += "PQB incidents were modified and/or deleted. Notated in Transaction Remarks."
            else if (data.pqbmodified == "No") note += "PQB incidents were not modified and/or deleted.\n"

            addNote("Number of vehicles", data.vehicles);

            for(var i=1;i<=parseInt(data.vehicles);i++){
                if(data["vehicle"+i+"miles"])
                    addNote((data["vehicle"+i]?data["vehicle"+i]:"Vehicle "+i) +" Odometer Reading", data["vehicle"+i+"miles"]+" mi.");
            }

            note += "\nCoverage\n";

            addNote("Bodily Injury", data.bilimits);
            addNote("Property Damage", data.pdlimits);
            addNote("Watercraft Liability", data.watercraftliability);
            if (data.limitsmodified == "yes")
                note += "Underlying limits were modified.\n";
            else if (data.limitsmodified == "No")
                note += "Underlying limits were not modified.\n";
            addNote("Auto Bodily Injury", data.autobilimits);
            addNote("Auto Property Damage", data.autopdlimits);
            addNote("New Auto Premium", data.newautopremium);
            addNote("Property Liability", data.propertyliability);
            addNote("New Property Premium", data.newpropertypremium);
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
            else if (data.informedoftdocs == "") note += "Did not discuss " + data.quotetype + " required T-Docs with the customer.\n"

            if (data.esign == "opt-in") note += "Customer opted-in for E-Sign."
            else if (data.esign == "opt-out") note += "Customer opted-out for E-Sign."
            else note += "Did not discuss E-Sign with the customer."

            note += "\n\n";

        }

    });

    if (!showPreview) {

        var preview = document.getElementById("preview");

        var overlay = document.getElementById("overlay");
        overlay.classList.add("active");

        preview.value = note.trim();

    }

    return note.trim();

}

function getViolationCodes() {
    var data = mvrcodesdata;
    var code = document.getElementById("violationCode").value;
    var desc = document.getElementById("desc");
    var vicode = document.getElementById("vicode");
    var refcode = document.getElementById("refcode");
    var found = false;

    for (var i = 0; i < data.length; i++) {
        var e = data[i];
        if (e.statuteCode == code) {
            desc.innerText = e.violation;
            vicode.innerText = e.violationCode;
            refcode.innerText = e.mvrReferenceCode;
            found = true;
            break;
        }
    }

    if (!found) toastMessage("Nothing found.");

}

function openOverlay(e, onOpenCallback) {
    animateCSS("#" + e, "fadeIn");
    var overlay = document.getElementById(e);
    overlay.classList.add("active");
    if (typeof onOpenCallback == "function") onOpenCallback(overlay);
}

function closeOverlay(e, onCloseOverlay) {
    var overlay = document.getElementById(e.parentNode.id);
    if (!isie)
        animateCSS("#" + e.parentNode.id, "fadeOut", function () {
            overlay.classList.remove("active");
        });
    else {
        overlay.classList.remove("active");
    }

    if (typeof onCloseOverlay == "function") onCloseOverlay(overlay);
}

function openContact() {
    animateCSS("#aboutoverlay", "fadeIn");
    var overlay = document.getElementById("aboutoverlay");
    overlay.classList.add("active");
}

function closeAbout() {
    if (!isie)
        animateCSS("#aboutoverlay", "fadeOut", function () {
            var overlay = document.getElementById("aboutoverlay");
            overlay.classList.remove("active");
        });
    else {
        var overlay = document.getElementById("aboutoverlay");
        overlay.classList.remove("active");
    }
}

function openNarrative() {
    animateCSS("#narrativeoverlay", "fadeIn");
    var overlay = document.getElementById("narrativeoverlay");
    overlay.classList.add("active");
}

function closeNarrative() {
    if (!isie)
        animateCSS("#narrativeoverlay", "fadeOut", function () {
            var overlay = document.getElementById("narrativeoverlay");
            overlay.classList.remove("active");
        });
    else {
        var overlay = document.getElementById("narrativeoverlay");
        overlay.classList.remove("active");
    }
}

function openChangelog() {
    animateCSS("#changelogoverlay", "fadeIn");

    var txt = readTextFile("changelog.txt");

    var ta = document.getElementById("changelog");
    ta.value = txt;

    var overlay = document.getElementById("changelogoverlay");
    overlay.classList.add("active");
}

function closeChangelog() {
    if (!isie)
        animateCSS("#changelogoverlay", "fadeOut", function () {
            var overlay = document.getElementById("changelogoverlay");
            overlay.classList.remove("active");
        });
    else {
        var overlay = document.getElementById("changelogoverlay");
        overlay.classList.remove("active");
    }
}

function openCalculator() {
    animateCSS("#calcdraggable", "fadeInUp");
    var calc = document.getElementById("calcdraggable");
    var ifcalc = document.getElementById("calculator");
    calc.style.display = "block";

    addInOutClick(calc, function () {
        calc.style.opacity = 1;
    }, function () {
        calc.style.opacity = 0.5;
    });
}

function closeCalculator() {
    if (!isie)
        animateCSS("#calcdraggable", "fadeOutDown", function () {
            var calc = document.getElementById("calcdraggable");
            calc.style.display = "none";
        });
    else {
        var calc = document.getElementById("calcdraggable");
        calc.style.display = "none";
    }
}

function closePreview() {
    if (!isie)
        animateCSS("#overlay", "fadeOut", function () {
            var overlay = document.getElementById("overlay");
            overlay.classList.remove("active");
        });
    else {
        var overlay = document.getElementById("overlay");
        overlay.classList.remove("active");
    }
}

// Bind Log

function importBindLog() {
    var b = prompt("Paste bind log export here:");
    if (b) {
        setCookie("bindlog", b, 365);
        binds = retrieveBindLog();
        buildBindLog();
        toastMessage("Bind log imported.");
    }
}

function exportBindLog() {
    copyText(getCookie("bindlog"));
    toastMessage("Bind log is in clipboard!");
}

function openBindLogView() {
    animateCSS("#bindlogoverlay", "fadeIn");

    buildBindLog();
    var overlay = document.getElementById("bindlogoverlay");
    overlay.classList.add("active");
}

function addBindRow() {

    var table = document.getElementById("logtable");
    var row = table.rows.length + 1;

    var tr = document.createElement("tr");
    tr.id = "row" + row;
    table.appendChild(tr);
    for (var col = 0; col < 7; col++) {
        var td = document.createElement("td");
        var tdinput = document.createElement("input");
        tdinput.type = "text";
        tdinput.size = 8;
        td.appendChild(tdinput);
        tr.appendChild(td);
    }

    var close = document.createElement("td");
    close.id = "close" + row;
    close.classList.add("tableclose");
    close.innerHTML = "&times;"
    close.addEventListener("click", function (e) {
        warningZebra("Are you sure you want to delete this bind from the bind log? This cannot be undone.", "Delete Bind", function () {
            var id = close.id.replace("close", "");
            table.removeChild(document.getElementById("row" + id));
        });
    });
    tr.appendChild(close);

}

function saveEditedBindLog() {
    var table = document.getElementById("logtable");

    binds = [
        [
            {
                value: "Date",
            },
            {
                value: "Customer Name"
            },
            {
                value: "Control #"
            },
            {
                value: "Premium"
            },
            {
                value: "Items"
            },
            {
                value: "Policy #"
            },
            {
                value: "Reference #"
            }
        ]
    ];

    for (var i = 1; i < table.rows.length; i++) {
        var row = table.rows[i];
        var logrow = [];
        for (var d = 0; d < row.cells.length - 1; d++) {
            var cell = row.cells[d];
            var input = cell.childNodes[0];
            var value = input.value;
            var type = isNaN(value) ? "string" : value.length < 4 ? "number" : "string";
            var logdata = {};
            logdata.value = value;
            logdata.type = type;
            logrow.push(logdata);
        }
        binds.push(logrow);
    }

    saveBindLog();

    buildBindLog();

}

function buildBindLog() {
    var table = document.getElementById("logtable");
    table.innerHTML = "";

    for (var row = 0; row < binds.length; row++) {
        var tr = document.createElement("tr");
        tr.id = "row" + row;
        table.appendChild(tr);
        for (var col = 0; col < binds[row].length; col++) {
            var td = document.createElement("td");
            var tdinput = document.createElement("input");
            if (row > 0) {
                tdinput.type = "text";
                tdinput.size = 8;
                td.appendChild(tdinput);
                tdinput.value = binds[row][col].value;
            } else {
                td.innerText = binds[row][col].value;
                td.style.fontWeight = "bold";
                td.style.width = "200px";
            }
            tr.appendChild(td);
        }
        if (row > 0) {
            var close = document.createElement("td");
            close.id = "close" + row;
            close.classList.add("tableclose");
            close.innerHTML = "&times;"
            close.addEventListener("click", function (e) {
                warningZebra("Are you sure you want to delete this bind from the bind log? This cannot be undone.", "Delete Bind", function () {
                    var id = close.id.replace("close", "");
                    table.removeChild(document.getElementById("row" + id));
                });
            });
            tr.appendChild(close);
        }
    }
}

function closeBindLog() {
    if (!isie)
        animateCSS("#bindlogoverlay", "fadeOut", function () {
            var overlay = document.getElementById("bindlogoverlay");
            overlay.classList.remove("active");
        });
    else {
        var overlay = document.getElementById("bindlogoverlay");
        overlay.classList.remove("active");
    }
}

function toggleDrawer() {

    var drawer = document.getElementById("drawer");
    var menuicon = document.getElementById("menuicon");

    if (!drawerOpen) {
        drawerOpen = true;
        drawer.classList.remove("hidden");
        menuicon.classList.add("menuiconopen");
        animateCSS(".drawer", "slideInLeft");
    } else {
        menuicon.classList.remove("menuiconopen");
        if (!isie) animateCSS(".drawer", "slideOutLeft", function () {
            drawer.classList.add("hidden");
            drawerOpen = false;
        });
        else {
            drawer.classList.add("hidden");
            drawerOpen = false;
        }
    }

}

function copy() {
    var textarea = document.getElementById("preview");
    textarea.select();
    document.execCommand("copy");
    toastMessage("Copied note to clipboard.")
}

function copyNarrative() {
    var textarea = document.getElementById("narrative");
    textarea.select();
    document.execCommand("copy");
    toastMessage("Copied narrative to clipboard.")
}

function generateDisconnectedNote() {

    animateCSS("#overlay", "fadeIn");

    var preview = document.getElementById("preview");

    var overlay = document.getElementById("overlay");
    overlay.classList.add("active");

    var data = gatherInfo();

    var note = "";

    var customer = data.customername ? data.customername : "Customer";

    note = customer + " called in and disconnected."

    preview.value = note;
}

// Ghost Script Tool

var ghost = 0;
var timerShowing = false;
var time = 3;
var timer;

function startGhostScript() {
    openGhostWindow();
    displayScript();
}

var gscript = [
    "It appears we have a bad connection, I am unable to hear you.",
    0,
    "I apologize for the inconvenience; I am still unable to hear you.",
    0,
    "I am so sorry; I cannot hear you.\nI understand this may be frustrating, but I will need to disconnect this call.\nPlease call us back at 1-800 Allstate.\nThank you for calling Allstate. Goodbye.",
    1
];

function displayScript() {

    var content = document.getElementById("scriptcontent");
    var timerdisplay = document.getElementById("timerdisplay");
    var nextbtn = document.getElementById("nextbtn");
    content.innerHTML = "";
    if (timerShowing) toggleTimer();

    if (gscript[ghost] == 0) {
        toggleTimer();

        if (timerShowing) {
            timer = setInterval(function () {
                if (time > 0) {
                    time--;
                    timerdisplay.innerText = time;
                } else {
                    nextbtn.onclick = nextScript;
                    nextbtn.style.opacity = 1;
                    nextScript();
                    time = 3;
                    timerdisplay.innerText = time;
                    clearInterval(timer);
                }
            }, 1000);
        }

    } else if (gscript[ghost] == 1) {
        var p = document.createElement("h1");
        p.innerText = "Disconnect the Call.";
        content.appendChild(p);
    } else {
        var p = document.createElement("p");
        p.innerText = gscript[ghost];
        content.appendChild(p);
    }

}

function toggleTimer() {
    var timerdiv = document.getElementById("timerdiv");
    var nextbtn = document.getElementById("nextbtn");
    if (!timerShowing) {
        nextbtn.onclick = null;
        nextbtn.style.opacity = 0.5;
        timerdiv.style.display = "block";
        timerShowing = true;
    } else if (timerShowing) {
        timerdiv.style.display = "none";
        timerShowing = false;
    }
}

function nextScript() {
    var nextbtn = document.getElementById("nextbtn");
    if (ghost < gscript.length - 2) {
        ghost++;
        displayScript();
    } else {
        ghost++;
        displayScript();
        nextbtn.innerText = "Done";
        nextbtn.setAttribute("onclick", 'closeOverlay(document.getElementById("ghostoverlay").children[0])');
    }
}

function openGhostWindow() {
    var timerdisplay = document.getElementById("timerdisplay");
    var timerdiv = document.getElementById("timerdiv");
    var nextbtn = document.getElementById("nextbtn");
    ghost = 0;
    timerShowing = false;
    nextbtn.onclick = nextScript;
    nextbtn.style.opacity = 1;
    time = 3;
    timerdisplay.innerText = time;
    if (timer != null) clearInterval(timer);
    var nextbtn = document.getElementById("nextbtn");
    nextbtn.innerText = "Next";
    nextbtn.onclick = nextScript;
    openOverlay("ghostoverlay");
}

function closeGhostWindow() {
    var timerdisplay = document.getElementById("timerdisplay");
    var timerdiv = document.getElementById("timerdiv");
    var nextbtn = document.getElementById("nextbtn");
    ghost = 0;
    nextbtn.onclick = nextScript;
    nextbtn.style.opacity = 1;
    time = 3;
    timerdisplay.innerText = time;
    clearInterval(timer);
    timerdiv.style.display = "none";
    timerShowing = false;
    nextbtn.innerText = "Next";
    nextbtn.onclick = nextScript;

    closeOverlay(document.getElementById("ghostoverlay").children[0]);
}

// Bind Log

function createBind(customername, controlnumber, premium, items, policynumber, referencenumber) {

    var bind = [
        {
            value: getToday()
        },
        {
            value: customername
        },
        {
            value: controlnumber
        },
        {
            value: "$" + premium
        },
        {
            value: items,
            type: "number"
        },
        {
            value: policynumber
        },
        {
            value: referencenumber
        }
    ];
    binds.push(bind);
}

function addToBindLog() {

    for (var i = 0; i < openedQuotes.length; i++) {
        var data = gatherInfo(openedQuotes[i]);

        if (!data.decline && data.controlnumber) {

            if (data.customername != "undefined" && data.controlnumber && data.policynumber && data.refnumber) {
                createBind(data.customername, data.controlnumber, data.quoteprice, data.vehicles ? data.vehicles : 1, data.policynumber, data.refnumber);
                saveBindLog();
            } else {
                var msg = "<ul>";
                if (data.customername == "undefined")
                    msg += "<li>Customer name is required.</li>";
                if (!data.controlnumber)
                    msg += "<li>Control number is required.</li>";
                if (!data.quoteprice)
                    msg += "<li>Quoted premium is required.</li>";
                if (!data.policynumber)
                    msg += "<li>Policy number is required.</li>";
                if (!data.refnumber)
                    msg += "<li>Down payment reference number is required.</li>";

                msg += "</ul>"

                alertZebra(msg, (!isie ? data.quotetype.capitalize() : data.quotetype) + " Quote");
            }

        }
    }

}

function downloadBindLog() {
    const config = {
        filename: getTodayEXCEL() + '-bindlog',
        sheet: {
            data: binds
        }
    };

    zipcelx(config);

    toastMessage("Downloading Bind Log " + getTodayEXCEL());
}

function saveBindLog() {
    setCookie("bindlog", JSON.stringify(binds), 365);
    toastMessage("Saved bind log.");
}

function retrieveBindLog() {
    return JSON.parse(getCookie("bindlog"));
}

// Add Mileage
function addMileage(vehinput) {
    if ($("#" +selectedQuote+" #remarkstable").length) {
        $("#" +selectedQuote+" #remarkstable").remove();
    }
    var nowtable = $(vehinput.parentNode.parentNode.parentNode.parentNode);
    var table = $("<table/>");
    table.attr("id", "remarkstable");
    var vehicles = parseInt(vehinput.value);

    if(vehicles<=11){
        if (vehicles!=""&&vehicles>0) table.append($("<h3/>").text("Vehicles"));

        for (var i = 1; i < vehicles + 1; i++) {
            var mileage = $.parseHTML("<tr><td><input placeholder='Year/Make/Model' id='vehicle" + i + "'/></td><td><input id='vehicle" + i + "miles' type='number' placeholder='Miles'/></td></tr>");
            table.append(mileage);
        }

        if (vehicles!=""&&vehicles>0) {
            var remark = $.parseHTML("<tr><td><div class='btn' onclick='copyRemark()'>Copy Remark</div></td></tr>");
            table.append(remark);
            nowtable.after(table);
        }
    }else if(vehicles>11){
        alertZebra("You can only have up to 11 vehicles on a policy.");
    }

}

function copyRemark() {
    var table = document.querySelector("#" + selectedQuote + " #remarkstable");
    var vehicles = table.rows.length;
    var note="";

    for (var i = 1; i < vehicles; i++) {
        var vehicle = $("#" + selectedQuote + " #remarkstable #vehicle" + i).val();
        var miles = $("#" + selectedQuote + " #remarkstable #vehicle" + i + "miles").val();

        note+=vehicle + " Odometer Reading: " + miles + " mi.\n";
    }

    copyText(note.trim());
    toastMessage("Transaction Remark was copied to clipboard.");

}

// Misc

function quickStart() {
    var links = [
        "https://oneview.allstate.com/CTIServer/CTIClientApp.jnlp",
        "https://allstate.rightanswers.com/portal/sa/",
        "https://entimpact360/wfo"
    ];

    var doQuickStart = confirm("Do you want to start the following programs:\n1View Telephony\nRight Answers\nVerint");

    if (doQuickStart) {
        for (var i = 0; i < links.length; i++) {
            window.open(links[i], "_blank");
        }
    }

}

function updatemiles() {

    var states = document.getElementById("states");
    var gen = document.getElementById("shortrategenerator");
    var njref = document.getElementById("njref");
    var milesinput = document.getElementById("miles");

    var state = states.options[states.selectedIndex].value;
    var miles = parseInt(milesinput.value);
    var shortrate = false;

    njref.style.display = "none";

    if (state == "ca") {
        if (miles < 12000) shortrate = true;
    } else if (state == "fl") {
        if (miles < 14000) shortrate = true;
    } else if (state == "nj") {
        njref.style.display = "block";
    } else {
        if (miles < 8000) shortrate = true;
    }

    if (shortrate) {
        gen.style.display = "block";
    } else {
        gen.style.display = "none";
    }

    generateNarrative(shortrate);

}

function generateNarrative(shortrate) {

    var veh = document.getElementById("vehicle").value;
    var srd = document.getElementById("shortrateddriver").value;
    var ls = document.getElementById("lifestyle").options[document.getElementById("lifestyle").selectedIndex].value;
    var miles = document.getElementById("miles").value;

    var nar = document.getElementById("narrative");

    var narrative = "";

    if (shortrate) {
        narrative = "Idaho CCC. Short Mileage. Est. annual mileage is " + miles + " for " + veh + ". " + srd + " " + ls + ".";
    } else {
        narrative = "Customer states they drive " + miles + " miles per year."
    }

    nar.value = narrative;
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
    const node = document.querySelector(element);
    node.classList.add('animated', animationName);

    function handleAnimationEnd() {
        node.classList.remove('animated', animationName);
        node.removeEventListener('animationend', handleAnimationEnd);

        if (typeof callback === 'function') callback();
    }

    node.addEventListener('animationend', handleAnimationEnd);
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function getToday() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;

    return today;
}

function getTodayEXCEL() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + '-' + dd + '-' + yyyy;

    return today;
}

function getTodayInput() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = yyyy + '-' + mm + '-' + dd;

    return today;
}

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1)
}

function readTextFile(file) {
    var allText = "";
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                allText = rawFile.responseText;
            }
        }
    }
    rawFile.send(null);
    return allText;
}


function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function addInOutClick(element, incallback, outcallback, win) {
    if (!win) win = window;
    win.addEventListener('mousedown', function (e) {
        if (element.contains(e.target)) {
            // Clicked in box
            incallback();
        } else {
            // Clicked outside the box
            outcallback();
        }
    });
}

if (!debug) window.onerror = function (msg, url, linenumber) {
    console.error(msg + '\nURL: ' + url + '\nLine Number: ' + linenumber);
    var se = document.getElementById("se");
    if (se != undefined) se.innerText += msg + '\nURL: ' + url + '\nLine Number: ' + linenumber;
    return true;
}

if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength, padString) {
        targetLength = targetLength >> 0; //truncate if number or convert non-number to 0;
        padString = String((typeof padString !== 'undefined' ? padString : ' '));
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength - this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0, targetLength) + String(this);
        }
    };
}

function saveValue(element) {
    var id = element.id;
    var value = element.value;
    var parent = element.parentNode;
    var parentId = parent.id;

    setCookie(parentId + "-" + id, value);
}

function getValue(element) {
    var id = element.id;
    var value = element.value;
    var parent = element.parentNode;
    var parentId = parent.id;

    var value = "";

    if (getCookie(parentId + "-" + id) != "")
        value = getCookie(parentId + "-" + id);

    element.value = value;
}

function alertZebra(message, title) {
    new $.Zebra_Dialog(message, {
        type: "information",
        title: title
    });
}

function alertCallback(cb) {
    var message = "A callback was scheduled for <strong>" + cb.name + "</strong> at <em>" + cb.time + "</em> on " + cb.date + ". Callback number is <strong>" + cb.number + "</strong>.";

    var dialog;

    options = {
        title: "Callback Scheduled",
        source: { inline: $('<div>Snooze: <select id="snooze"><option value="5">5 Minutes</option><option value="15">15 Minutes</option><option value="30">30 Minutes</option><option value="60">1 Hour</option></select></div>') },
        buttons: [

            {
                caption: "Snooze",
                callback: function () {
                    var snooze = document.getElementById("snooze")
                    var snoozetime = parseInt(snooze.options[snooze.selectedIndex].value);
                    var snoozedate = DateTime.local().plus({ minutes: snoozetime });
                    cb.date = snoozedate.toLocaleString(DateTime.DATE_SHORT);
                    cb.time = snoozedate.toLocaleString(DateTime.TIME_SIMPLE);
                    cb.alerted = false;
                    cb.snoozed = true;
                    cb.reminded = true;
                    dialog.close();
                    alertZebra("Snoozed callback for <strong>" + cb.name + "</strong>. Next reminder will be at <strong>" + cb.time + "</strong>.", "Callback Snoozed");
                    buildCallbacks();
                    return true;
                }
            },
            {
                caption: "Ok",
                callback: function () {
                    cb.snoozed = false;
                    cb.alerted = true;
                    cb.reminded = true;
                    dialog.close();
                    buildCallbacks();
                    return true;
                }
            }
        ]
    };

    var dialog = new $.Zebra_Dialog(message, options);
}

function warningZebra(message, title, yesCallback, noCallback) {
    var dialog = new $.Zebra_Dialog(message, {
        type: "warning",
        title: title,
        buttons: [
            {
                caption: "Yes",
                callback: function () {
                    yesCallback();
                    return true;
                }
            },
            {
                caption: "No",
                callback: function () {
                    if (noCallback) noCallback();
                    else dialog.close();
                    return true;
                }
            }
        ]
    });
}

if (!debug) console.log = function (msg) { };

var _0x54c5 = ['block', 'right', 'down', 'left', 'addEventListener', 'keyCode', 'length', 'setAttribute', 'data-dblclick', 'getAttribute', 'removeAttribute', 'getElementById', 'style', 'display', 'none']; (function (_0x350604, _0x196ae7) { var _0x5eb505 = function (_0x43833b) { while (--_0x43833b) { _0x350604['push'](_0x350604['shift']()); } }; _0x5eb505(++_0x196ae7); }(_0x54c5, 0x133)); var _0xfc8c = function (_0x5b6207, _0x5a8fc9) { _0x5b6207 = _0x5b6207 - 0x0; var _0x583b6f = _0x54c5[_0x5b6207]; return _0x583b6f; }; var allowSnake = ![]; function doubleclick(_0x30c8db, _0x5d3e4a, _0xfc7248) { if (_0x30c8db['getAttribute']('data-dblclick') == null) { _0x30c8db[_0xfc8c('0x0')](_0xfc8c('0x1'), 0x1); setTimeout(function () { if (_0x30c8db[_0xfc8c('0x2')](_0xfc8c('0x1')) == 0x1) { _0x5d3e4a(); } _0x30c8db[_0xfc8c('0x3')](_0xfc8c('0x1')); }, 0x12c); } else { _0x30c8db[_0xfc8c('0x3')](_0xfc8c('0x1')); _0xfc7248(); } } function toggleSnake() { if (allowSnake) { var _0x2fa168 = document[_0xfc8c('0x4')]('hiddensnake'); if (_0x2fa168[_0xfc8c('0x5')][_0xfc8c('0x6')] == _0xfc8c('0x7')) { _0x2fa168[_0xfc8c('0x5')][_0xfc8c('0x6')] = _0xfc8c('0x8'); } else { _0x2fa168['style'][_0xfc8c('0x6')] = _0xfc8c('0x7'); } } } var allowedKeys = { 37: 'left', 38: 'up', 39: _0xfc8c('0x9'), 40: _0xfc8c('0xa'), 65: 'a', 66: 'b' }; var konamiCode = ['up', 'up', _0xfc8c('0xa'), _0xfc8c('0xa'), _0xfc8c('0xb'), _0xfc8c('0x9'), _0xfc8c('0xb'), _0xfc8c('0x9'), 'b', 'a']; var konamiCodePosition = 0x0; document[_0xfc8c('0xc')]('keydown', function (_0x166dd2) { var _0xcdbbb9 = allowedKeys[_0x166dd2[_0xfc8c('0xd')]]; var _0x5dc3b7 = konamiCode[konamiCodePosition]; if (_0xcdbbb9 == _0x5dc3b7) { konamiCodePosition++; if (konamiCodePosition == konamiCode[_0xfc8c('0xe')]) { activateCheats(); konamiCodePosition = 0x0; } } else { konamiCodePosition = 0x0; } }); function activateCheats() { toastMessage('Allstate\x20Mayhem\x20Snake\x20Activated.'); allowSnake = !![]; }