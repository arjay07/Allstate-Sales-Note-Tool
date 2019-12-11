window.onload = onLoad;

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

function onLoad() {

    if(getCookie("bindlog")!="")binds=retrieveBindLog();

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

    var notes = document.getElementsByClassName("note");

    for (var i = 0; i < notes.length; i++) {
        notes[i].classList.add("faster");
    }

    if (isie) {
        var qs = document.getElementById("quickstart");
        qs.classList.remove("hidden");
        setTimeout(function(){
            var splash = document.getElementById("splash");
            splash.classList.add("hidden");
            var splash = document.getElementById("splash");
            splash.parentNode.removeChild(splash);
        }, 1450);
    }

    if(!isie){
        var dl = document.getElementsByClassName("ieonly");
        while(dl.length>0){
            dl[0].parentNode.removeChild(dl[0]);
        }
        setTimeout(function(){
        animateCSS(".splash", "slideOutUp", function(){
                var splash = document.getElementById("splash");
                splash.classList.add("hidden");
            })
        }, 1450);
    }

    var dc = document.getElementsByClassName("drawercontents")[0];

    document.getElementById("checkauto").checked = true;
    document.getElementById("checkhomeowners").checked = true;
    refreshTabs();

    var drawer = document.getElementById("drawer");
    var dropdown = document.getElementById("quoteselct");

}

function getOpenedQuotes(){
    var tabs = document.getElementsByClassName("tab activeinline");

    var oq=[];

    for(var i=0;i<tabs.length;i++){
        var tab=tabs[i];
        var q=tab.id.replace("tab", "");
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

    for(var i=0;i<notes.length;i++){
        inotes.push(notes[i].id);
    }

    var animation="slideInLeft";

    if(inotes.indexOf(quote)<inotes.indexOf(selectedQuote))
        animation="slideOutRight";
    else if(inotes.indexOf(quote)>inotes.indexOf(selectedQuote))
        animation="slideOutLeft";
    else animation="none";

    note.classList.add("preactive");
    prenote.classList.add("preactive");

    if(!isie && animation!="none")animateCSS("#" + selectedQuote, animation, function(){
        note.classList.remove("preactive");
        prenote.classList.remove("preactive");
        note.classList.add("active");
    });
    else{
        note.classList.remove("preactive");
        prenote.classList.remove("preactive");
        note.classList.add("active");
    }

    selectedQuote = quote;
}

function switchQuote(id){

    var inotes = document.getElementsByClassName("note");
    var notes = [];

    for(var i=0;i<inotes.length;i++){
        notes.push(inotes[i].id);
    }
    var tab = document.getElementById(id);
    var tabs = document.getElementsByClassName("tab");

    for(var i=0; i<tabs.length;i++){
        tabs[i].classList.remove("selectedtab");
    }

    tab.classList.add("selectedtab");
    
    var quote=id.substring(3, id.length);

    var animation="slideOutRight";

    if(notes.indexOf(quote)<notes.indexOf(selectedQuote))
        animation="slideInLeft";
    else if(notes.indexOf(quote)>notes.indexOf(selectedQuote))
        animation="slideInRight";
    else animation="none";

    if(!isie && animation!="none")animateCSS("#" + quote, animation)
    selectquote(quote);
}

function refreshTabs(){
    
    var filtercheckbox = document.getElementsByClassName("filtercheckbox");

    for(var i=0;i<filtercheckbox.length;i++){
        var c = filtercheckbox[i];
        var tab = document.getElementById(c.id.replace("check", "tab"));
        if(c.checked){
            tab.classList.add("activeinline");
        }else{
            tab.classList.remove("activeinline");
        }
    }

    var activetabs = document.getElementsByClassName("activeinline");

    openedQuotes=getOpenedQuotes();

    switchQuote(activetabs[0].id);
    
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

function toggleDropDown(){
    var btn=document.getElementsByClassName("filterbtn")[0];
    var dropdown=document.getElementById("quotefilter");

    if(dropdown.style.display=="block"){
        btn.classList.remove("filteractive");
        dropdown.style.display="none";
    }else{
        btn.classList.add("filteractive");
        dropdown.style.display="block";

    }
}

function gatherInfo(quote) {

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

function generateNote() {

    animateCSS(".overlay", "fadeIn");

    var data = gatherInfo(selectedQuote);

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

    for(var i=0;i<openedQuotes.length;i++){

        var quote=openedQuotes[i];

        var data = gatherInfo(quote);

        note+=quote.capitalize()+"\n\n";

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
        if(data.limitsmodified=="yes")
            note+="Underlying limits were modified.\n";
        else if(data.limitsmodified=="No")
            note+="Underlying limits were not modified.\n";
        addNote("Auto Bodily Injury", data.autobilimits);
        addNote("Auto Property Damage", data.autopdlimits);
        addNote("New Auto Premium", data.newautopremium);
        addNote("New Property Premium", data.newpropertypremium);
        addNote("Property Liability", data.propertyliability);
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

        note+="\n\n";
    
    }

    preview.value = note;

}

function openContact(){
    animateCSS("#aboutoverlay", "fadeIn");
    var overlay = document.getElementById("aboutoverlay");
    overlay.classList.add("active");
}

function closeAbout() {
    if(!isie)
    animateCSS("#aboutoverlay", "fadeOut", function () {
        var overlay = document.getElementById("aboutoverlay");
        overlay.classList.remove("active");
    });
    else{
        var overlay = document.getElementById("aboutoverlay");
        overlay.classList.remove("active");
    }
}

function openChangelog(){
    animateCSS("#changelogoverlay", "fadeIn");

    var txt = readTextFile("changelog.txt");

    var ta = document.getElementById("changelog");
    ta.value = txt;

    var overlay = document.getElementById("changelogoverlay");
    overlay.classList.add("active");
}

function closeChangelog() {
    if(!isie)
    animateCSS("#changelogoverlay", "fadeOut", function () {
        var overlay = document.getElementById("changelogoverlay");
        overlay.classList.remove("active");
    });
    else{
        var overlay = document.getElementById("changelogoverlay");
        overlay.classList.remove("active");
    }
}

function closePreview() {
    if(!isie)
    animateCSS("#overlay", "fadeOut", function () {
        var overlay = document.getElementById("overlay");
        overlay.classList.remove("active");
    });
    else{
        var overlay = document.getElementById("overlay");
        overlay.classList.remove("active");
    }
}

function openBindLogView(){
    animateCSS("#bindlogoverlay", "fadeIn");

    var table = document.getElementById("logtable");
    table.innerHTML="";

    for(var row=0;row<binds.length;row++){
        var tr=document.createElement("tr");
        tr.id="row"+row;
        table.appendChild(tr);
        for(var col=0;col<binds[row].length;col++){
            var td=document.createElement("td");
            var tdinput=document.createElement("input");
            tdinput.type="text";
            tdinput.size=8;
            td.appendChild(tdinput);
            tdinput.value=binds[row][col].value;
            tr.appendChild(td);
        }
        if(row>0){
            var close=document.createElement("td");
            close.id="close"+row;
            close.classList.add("tableclose");
            close.innerHTML="&times;"
            close.addEventListener("click", function(e){
                var id=this.id.replace("close", "");
                table.removeChild(document.getElementById("row"+id));
            });
            tr.appendChild(close);
        }
    }
    var overlay = document.getElementById("bindlogoverlay");
    overlay.classList.add("active");
}

function addBindRow(){

    var table=document.getElementById("logtable");
    var row = table.rows.length+1;

    var tr=document.createElement("tr");
    tr.id="row"+row;
    table.appendChild(tr);
    for(var col=0;col<7;col++){
        var td=document.createElement("td");
        var tdinput=document.createElement("input");
        tdinput.type="text";
        tdinput.size=8;
        td.appendChild(tdinput);
        tr.appendChild(td);
    } 

    var close=document.createElement("td");
    close.id="close"+row;
    close.classList.add("tableclose");
    close.innerHTML="&times;"
    close.addEventListener("click", function(e){
        var id=this.id.replace("close", "");
        table.removeChild(document.getElementById("row"+id));
    });
    tr.appendChild(close);

}

function saveEditedBindLog(){
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
    
    for(var i=1;i<table.rows.length;i++){
        var row=table.rows[i];
        var logrow=[];
        for(var d=0;d<row.cells.length-1;d++){
            var cell=row.cells[d];
            var input=cell.childNodes[0];
            var value=input.value;
            var type=isNaN(value)?"string":value.length<4?"number":"string";
            var logdata={};
            logdata.value=value;
            logdata.type=type;
            logrow.push(logdata);
        }
        binds.push(logrow);
    }

    saveBindLog();
    openBindLogView();

}

function closeBindLog() {
    if(!isie)
    animateCSS("#bindlogoverlay", "fadeOut", function () {
        var overlay = document.getElementById("bindlogoverlay");
        overlay.classList.remove("active");
    });
    else{
        var overlay = document.getElementById("bindlogoverlay");
        overlay.classList.remove("active");
    }
}

function toggleDrawer(){

    var drawer = document.getElementById("drawer");
    var menuicon = document.getElementById("menuicon");

    if(!drawerOpen){
        drawerOpen=true;
        drawer.classList.remove("hidden");
        menuicon.classList.add("menuiconopen");
        animateCSS(".drawer", "slideInLeft");
    }else{
        menuicon.classList.remove("menuiconopen");
        if(!isie) animateCSS(".drawer", "slideOutLeft", function(){
            drawer.classList.add("hidden");
            drawerOpen=false;
        });
        else{
            drawer.classList.add("hidden");
            drawerOpen=false;
        }
    }

}

function copy() {
    var textarea = document.getElementById("preview");
    textarea.select();
    document.execCommand("copy");
    alert("Copied note to clipboard.")
}

function createBind(customername, controlnumber, premium, items, policynumber, referencenumber){

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

function addToBindLog(){

    for(var i=0;i<openedQuotes.length;i++){
        var data = gatherInfo(openedQuotes[i]);

        if(!data.decline){

            if(data.customername!="undefined" && data.controlnumber && data.policynumber && data.refnumber){
                createBind(data.customername, data.controlnumber, data.quoteprice, data.vehicles?data.vehicles:1, data.policynumber, data.refnumber);
                saveBindLog();
            }else{
                if(data.customername===undefined)
                    alert("Customer name is required.");
                if(!data.controlnumber)
                    alert("Control number is required.");
                if(!data.quoteprice)
                    alert("Quoted premium is required.");
                if(!data.vehicles){
                    alert("Number of vehicles is required.");
                }
                if(!data.policynumber)
                    alert("Policy number is required.");
                if(!data.refnumber)
                    alert("Down payment reference number is required.");
            }

        }
    }
    
}

function downloadBindLog(){
    const config = {
    filename: getTodayEXCEL() + '-bindlog',
    sheet: {
        data: binds
    }
    };

    zipcelx(config);
}

function saveBindLog(){
    setCookie("bindlog", JSON.stringify(binds), 365);
    alert("Saved bind log.");
}

function retrieveBindLog(){
    return JSON.parse(getCookie("bindlog"));
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

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
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

function getToday(){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;

    return today;
}

function getTodayEXCEL(){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + '-' + dd + '-' + yyyy;

    return today;
}

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1)
}

function readTextFile(file)
{
    var allText = "";
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                allText = rawFile.responseText;
            }
        }
    }
    rawFile.send(null);
    return allText;
}

var _0x54c5=['block','right','down','left','addEventListener','keyCode','length','setAttribute','data-dblclick','getAttribute','removeAttribute','getElementById','style','display','none'];(function(_0x350604,_0x196ae7){var _0x5eb505=function(_0x43833b){while(--_0x43833b){_0x350604['push'](_0x350604['shift']());}};_0x5eb505(++_0x196ae7);}(_0x54c5,0x133));var _0xfc8c=function(_0x5b6207,_0x5a8fc9){_0x5b6207=_0x5b6207-0x0;var _0x583b6f=_0x54c5[_0x5b6207];return _0x583b6f;};var allowSnake=![];function doubleclick(_0x30c8db,_0x5d3e4a,_0xfc7248){if(_0x30c8db['getAttribute']('data-dblclick')==null){_0x30c8db[_0xfc8c('0x0')](_0xfc8c('0x1'),0x1);setTimeout(function(){if(_0x30c8db[_0xfc8c('0x2')](_0xfc8c('0x1'))==0x1){_0x5d3e4a();}_0x30c8db[_0xfc8c('0x3')](_0xfc8c('0x1'));},0x12c);}else{_0x30c8db[_0xfc8c('0x3')](_0xfc8c('0x1'));_0xfc7248();}}function toggleSnake(){if(allowSnake){var _0x2fa168=document[_0xfc8c('0x4')]('hiddensnake');if(_0x2fa168[_0xfc8c('0x5')][_0xfc8c('0x6')]==_0xfc8c('0x7')){_0x2fa168[_0xfc8c('0x5')][_0xfc8c('0x6')]=_0xfc8c('0x8');}else{_0x2fa168['style'][_0xfc8c('0x6')]=_0xfc8c('0x7');}}}var allowedKeys={37:'left',38:'up',39:_0xfc8c('0x9'),40:_0xfc8c('0xa'),65:'a',66:'b'};var konamiCode=['up','up',_0xfc8c('0xa'),_0xfc8c('0xa'),_0xfc8c('0xb'),_0xfc8c('0x9'),_0xfc8c('0xb'),_0xfc8c('0x9'),'b','a'];var konamiCodePosition=0x0;document[_0xfc8c('0xc')]('keydown',function(_0x166dd2){var _0xcdbbb9=allowedKeys[_0x166dd2[_0xfc8c('0xd')]];var _0x5dc3b7=konamiCode[konamiCodePosition];if(_0xcdbbb9==_0x5dc3b7){konamiCodePosition++;if(konamiCodePosition==konamiCode[_0xfc8c('0xe')]){activateCheats();konamiCodePosition=0x0;}}else{konamiCodePosition=0x0;}});function activateCheats(){alert('Allstate\x20Mayhem\x20Snake\x20Activated.');allowSnake=!![];}