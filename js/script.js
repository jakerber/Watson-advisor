var page_load = false;

window.onload = function(){
	window.location = "http://www.cs.dartmouth.edu/~jkerber14/watson/?inputbox=#";
}

function rec_audio() {
	alert('Coming soon!');
}

function set_header(symbol) {
	var callback = function(data) {
        var price = data.query.results.quote.Ask;
        var name = data.query.results.quote.Name;
        var change = data.query.results.quote.PercentChange;
        var info_header = '';
        if (price == null || price == undefined) {
			info_header = 'Stock symbol ' + symbol + ' not found. A full list of stock symbols can be online at http://eoddata.com/symbols.aspx';
		} else {
			if (change == null) {
				info_header = name + ' — $' + price;
			} else {
				info_header = name + ' — $' + price + ' (' + change + ')';
			}
		}
		document.getElementById("text-display-header").innerHTML = info_header;
    };

	var url = 'http://query.yahooapis.com/v1/public/yql';
	// this is the lovely YQL query (html encoded) which lets us get the stock price:
	// select * from html where url="http://finance.yahoo.com/q?s=goog" and xpath='//span[@id="yfs_l10_goog"]'
	var data = 'q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22' + symbol + '%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';
	$.getJSON(url, data, callback);
}

/* IMPORTANT:
** - user's input is stored in the variable 'user_input'
** - once you get a response from watson, store the text that you want to display in the variable 'watson_text'
** - stock name and price info will be display in a header by way of function 'set_header' above
*/
function get_text(form) {
	// get text from user, display stock symbol
	var user_input = form.inputbox.value;
	document.getElementById("stock-sym-display").innerHTML = user_input.toUpperCase();
	document.getElementById("text-display").innerHTML = 'Loading...';
	document.getElementById("text-display-header").innerHTML = 'Loading...';
	// change displays
	document.getElementById("text-input").value = '';
	document.getElementById("text-input").placeholder = 'Enter a new stock symbol...';

	if (page_load == false) {
		// first request
		document.getElementById("ask-him").style = 'margin-top:40px;';
		// document.getElementById("adjustable-height").style.height = '62%';
		$('#adjustable-height').animate({height:'60%'});
		document.getElementById("reveal").style.display = 'inline';
		document.getElementById("results").style.display = 'block';
		document.getElementById("adjustable-height").style = 'background-color: rgba(0,0,0,0.5);';

		// liquidate elements
		var max_liq = 2;
		for (var i = 0; i < max_liq; i++) {
			var liq_str = 'liquidate-' + (i+1);
			document.getElementById(liq_str).style.display = 'none';
		}
	}
	page_load = true;

	// set header with data
	set_header(user_input);

	///////////// RETRIEVE RESPONSE FROM WATSON HERE
	var watson_text = 'Hi there! Thanks for using our service. Unfortunately, we don\'t have it up and running yet. Check back soon. - Team Seggy';
	////////////

	document.getElementById("text-display").innerHTML = watson_text;

	//scroll to bottom of div
	$("#adjustable-height").animate({ scrollTop: $('#adjustable-height').prop("scrollHeight")}, 1000);

	return false;
}