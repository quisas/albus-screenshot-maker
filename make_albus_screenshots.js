/*
Macht Screenshots automatisch von Albus
siehe http://phantomjs.org
*/

var homepage = 'http://159.100.241.84/app';

var page = require('webpage').create();

page.viewportSize = {
	width: 1300,
	height: 1000
};

phantom.clearCookies();

var steps = [];

//
// Helpers
//
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

//
// Page Manipulation Functions
//

function click(anchorText) {
	var nextUrl = page.evaluate(function(text) {
		var elements = $("a:contains('" + text + "')");
		if (elements.length == 0) {return null}
		return elements[0].href;
	}, anchorText);

//	console.log(nextUrl);

	if (nextUrl) {
		page.open(nextUrl, onLoadFinished);
	} else {
		phantom.exit(1);
	}
}

function mouseClick(selector) {
	page.evaluate(function(s) {
		$(s).click();
	}, selector);
}

function fillIn(selector, text) {
	var nextUrl = page.evaluate(function(selector, text) {
		$(selector).val(text);
	}, selector, text);
}

function submit(buttonText) {
	page.evaluate(function(text) {
		var elements = $("input[type=submit][value='"+text+"']");
		if (elements.length == 0) {return null}
		elements.click();
	}, buttonText);
}


function pageReset() {
	phantom.clearCookies();
	page.open(homepage+'?_s=bogussession', function() {	nextStep() });
}

var screenCounter = 1;
function makeScreenshot(screenName) {
	page.render('screenshots/'+pad(screenCounter, 3)+'_Albus_' + screenName + '.png');
  console.log('Screenshot ' + screenCounter + ' ' + screenName);
	screenCounter++;
}

function onLoadFinished(status) {
	nextStep();
};

function nextStep() {

	var currentStep = steps.shift();

	if (typeof currentStep !== 'undefined') {
		currentStep.call();
	} else {
	  phantom.exit();
	}
}

function step(aFunction) {
	steps.push(aFunction);
}


//
// Funktionen, um Steps zu erzeugen
//

function freshLoginSteps() {
	step(function(){ pageReset() });
	stepClick('Sprout');
}

function stepClick(linkText) {
	step(function(){ click(linkText) });
}

function stepMouseClick(selector) {
	step(function(){ mouseClick(selector); nextStep(); });
}

function stepFillIn(selector, text) {
	step(function(){ fillIn(selector, text); nextStep(); });
}

function stepSubmit(text) {
	step(function(){ submit(text); setTimeout(nextStep, 2000)});
}

function stepScreenshot(screenName) {
	step(function(){ makeScreenshot(screenName); nextStep(); });
}

function stepsLoginUser(username, password) {
	step(function(){ pageReset() });
	stepFillIn('input[type=text][name=loginUsername]', username);
	stepFillIn('input[type=password][name=loginPassword]', password);
	stepSubmit('Anmelden');
//	stepClick(userPersonName);
}


// Erste Seite und Start der Sequenz
page.open(homepage, function() {
	// Erstes Bild
	makeScreenshot('Login');

	//
	// Admin login
	//
	stepsLoginUser('admin', 'hogwarts');
	stepScreenshot('HomeAdmin');

	//
	// Schulleiter login
	//
	stepsLoginUser('albus.dumbledore', 'hogwarts');
	stepScreenshot('HomeSchulleiter');

	// Menus
	stepMouseClick('div.navbar a.dropdown-toggle:contains("Mein Menu")');
	stepScreenshot('MenuMeinMenu');
	stepMouseClick('div.navbar a.dropdown-toggle:contains("Service")');
	stepScreenshot('MenuService');
	stepMouseClick('div.navbar a.dropdown-toggle:contains("Schulbetrieb")');
	stepScreenshot('MenuSchulbetrieb');
	stepMouseClick('div.navbar a.dropdown-toggle:contains("Listen")');
	stepScreenshot('MenuListen');
	stepMouseClick('div.navbar a.dropdown-toggle:contains("Suchen")');
	stepScreenshot('MenuSuchen');
	stepMouseClick('div.navbar a.dropdown-toggle:contains("Export")');
	stepScreenshot('MenuExport');
	stepMouseClick('div.navbar a.dropdown-toggle:contains("Planung")');
	stepScreenshot('MenuPlanung');
	stepMouseClick('div.navbar a.dropdown-toggle:contains("Stundenplaner")');
	stepScreenshot('MenuStundenplaner');
	
	stepClick('Tagesplan');
	stepClick('Heute');
	stepScreenshot('Tagesplan')
	stepClick('Lektion fällt aus');
	stepScreenshot('TagesplanLektionsausfall')

	stepClick('Klassen');
	stepScreenshot('Klassenliste')

	stepClick('Fächli');
	stepScreenshot('FaechliInbox');
	stepClick('Neuer Fächli-Versand');
	stepScreenshot('FaechliVersand');

	stepClick('Dokumente');
	stepScreenshot('ExportDokumente');

	stepClick('Schüler suchen');
	stepScreenshot('SucheSchueler');

	stepClick('Termine');
	stepScreenshot('Termine');
	stepClick('Neuer Eintrag');
	stepClick('Elternanlass');
	stepScreenshot('TerminNeu');

	// Start
	nextStep();
});
