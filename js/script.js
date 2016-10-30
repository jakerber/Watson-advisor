var page_load = false;

function rec_audio() {
	alert('Coming soon!');
}

function get_text() {
	// change displays
	document.getElementById("text-input").value = '';
	document.getElementById("text-input").placeholder = 'Ask something new...';

	if (page_load == false) {
		// first request
		document.getElementById("ask-him").style = 'margin-top:40px;';
		document.getElementById("reveal").style.display = 'inline';
		document.getElementById("results").style.display = 'block';
		document.getElementById("adjustable-height").style = 'background-color: rgba(0,0,0,0.4);';

		// liquidate elements
		var max_liq = 2;
		for (var i = 0; i < max_liq; i++) {
			var liq_str = 'liquidate-' + (i+1);
			document.getElementById(liq_str).style.display = 'none';
		}
	}
	page_load = true;

	///////////// RETRIEVE RESPONSE FROM WATSON HERE
	watson_text = 'Hi there! Thanks for using our service. Unfortunately, we don\'t have it up and running yet. Check back soon. - Team Seggy';
	////////////

	document.getElementById("text-display").innerHTML = watson_text;

	//scroll to bottom of div
	$("#adjustable-height").animate({ scrollTop: $('#adjustable-height').prop("scrollHeight")}, 1000);

	//deselection
	// if (document.selection) {
 //        document.selection.empty();
 //    } else if ( window.getSelection ) {
 //        window.getSelection().removeAllRanges();
 //    }

	return false;
}