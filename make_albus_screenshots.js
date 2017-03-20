var page = require('webpage').create();

page.viewportSize = {
	width: 1300,
	height: 1000
};

phantom.clearCookies();

var steps = [];
var currentScreenName = 'Login';

function click(anchorText, screenName) {
	var nextUrl = page.evaluate(function(text) {
		var elements = $("a:contains('" + text + "')");
		if (elements.length == 0) {return null}
		return elements[0].href;
	}, anchorText);

	console.log(nextUrl);
	currentScreenName = screenName;

	if (nextUrl) {
		page.open(nextUrl, onLoadFinished);
	} else {
		phantom.exit(1);
	}
}

function pageReset() {
	page.open('http://proplan3/proplan?_s=bogussession', function() {	nextStep() });
}

function makeScreenshot() {
	if (currentScreenName) {
		page.render('screenshots/albus_' + currentScreenName + '.png');
	}
}

function onLoadFinished(status) {
  console.log('Status: ' + status);
	makeScreenshot();
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

function freshLoginSteps() {
	step(function(){ pageReset() });
	step(function(){ click('Brodbeck') });
}

// Erste Seite und Start der Sequenz
page.open('http://proplan3/proplan', function() {
	// Erstes Bild
	makeScreenshot();

	// Ablauf
	step(function(){ click('Brodbeck', 'Home') });
	step(function(){ click('Meldeaufrufe', 'Meldeaufrufe') });

	freshLoginSteps();
	step(function(){ click('Fächli') });
	step(function(){ click('Neue normale E-Mail', 'NormaleEmail') });

	step(function(){ click('Termine', 'Termine') });
	step(function(){ click('Neuer Eintrag') });
	step(function(){ click('Elternanlass', 'NeuerTerminErfassen') });

	// Start
	nextStep();
});
