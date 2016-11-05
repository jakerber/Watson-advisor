var page_load = false;
var rendered_tweets = [];
var help_message = 'Coming soon!';

window.onload = function(){
	window.location = "http://www.cs.dartmouth.edu/~jkerber14/watson/?inputbox=#";
}

function get_help() {
	alert(help_message);
	return false;
}

function render_tweet(div_id, tweet_id) {
	// ensure tweet wasn't already rendered
	for (var i = 0; i < rendered_tweets.length; i++) {
		if (rendered_tweets[i] == tweet_id) {
			// bad
			return 1;
		}
	}

	// add tweets to div on screen
	twttr.widgets.createTweet(
	  	tweet_id,
	  	document.getElementById(div_id),
	  	{
	    	theme: 'dark'
	  	}
	);

	// good
	rendered_tweets.push(tweet_id);
	return 0;
}

function render_twitter_json(json_in) {
	// check for input
	if (!json_in) {
		return;
	}

	// loop through json and render tweets
	var url = '';
	var url_array = [];
	var symbols = [];
	var tweet_id = '';
	var i = 0;
	var tweets_done = 0;
	while (tweets_done < 3 && i < 100) {
		//if tweet exists
		if (json_in.tweets[i]) {

			// make sure it has symbols $
			symbols = json_in.tweets[i].message.twitter_entities.symbols;
			if (symbols.length > 0) {
				url = json_in.tweets[i].message.link;
				url_array = url.split('/');
				tweet_id = url_array[url_array.length-1];

				// render
				if (render_tweet('tweet-container', tweet_id) == 0) {
					// tweet was rendered, count it
					tweets_done++;
				}
			}
		}
		i++;
	}
}

function set_header(symbol) {
	var callback = function(data) {
		// parse response for data
        var price = data.query.results.quote.Ask;
        var name = data.query.results.quote.Name;
        var change = data.query.results.quote.PercentChange;
        var time = data.query.results.quote.LastTradeTime;
        var info_header = '';

        if (price == null || price == undefined) {
			// no data found
        	document.getElementById("sentiment").style.display = 'none';
			info_header = 'Oops! ' + symbol.toUpperCase() + ' is not a valid stock symbol.<br>You can find a full list of ticker symbols online <a href="http://eoddata.com/symbols.aspx" target="_blank">here</a>.<br>';
		} else {
			// display stock data
			if (name == null) {
				document.getElementById("text-display-header").innerHTML = 'An unexpected error occured<br>Please try again';
				return;
			}
			if (change == null) {
				info_header = name + '<br> $' + Number(price).toFixed(2) + ' as of ' + time + '<br><span id="line-white"></span>';
			} else {
				info_header = name + '<br> $' + Number(price).toFixed(2) + ' (' + change + ') as of ' + time + '<br><span id="line-white"></span>';
			}

			//get sentiment data if valid stock
			/****** don't look!!! ******/
			// USERNAME: c368e358-6de7-47f5-92cc-a4b3cffc01b0
			// PASSWORD: q4vS8yNgAc
			/***************************/
			var pos_url = 'https://c368e358-6de7-47f5-92cc-a4b3cffc01b0:q4vS8yNgAc@cdeservice.mybluemix.net:443/api/v1/messages/search?q=' + symbol.toUpperCase() + '%20sentiment%3Apositive%20lang%3Aen%20&size=100&context=';//is%3Averified
			var neg_url = 'https://c368e358-6de7-47f5-92cc-a4b3cffc01b0:q4vS8yNgAc@cdeservice.mybluemix.net:443/api/v1/messages/search?q=' + symbol.toUpperCase() + '%20sentiment%3Anegative%20lang%3Aen%20&size=100&context='; //is%3Averified
			var pos_score = '';
			var neg_score = '';

			// sentiment ajax call to php
			$.ajax({
			    type: "POST",
			    url: './scripts/get_sent.php',
			    dataType: 'json',
			    data: {functionname: 'call_api', arguments: [pos_url, neg_url]},
			    success: function (obj, textstatus) {
			    	// check for error
			    	if (obj.error == 'error') {
			    		score_header = 'No sentiment analysis available for ' + symbol.toUpperCase();
			    	} else {
			    		var json_p = null;
			    		pos_score = obj.result_pos;
						neg_score = obj.result_neg;

						// parse results for scores
						var score_header = '';
						if (pos_score == '' && neg_score == '') {
							score_header = 'No sentiment analysis available for ' + symbol.toUpperCase();
						} else if (pos_score == '' && neg_score != '') {
							score_header = 'Sentiment Analysis with Twitter<br><a href="http://twitter.com"><img id="twtr-logo" src="https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Twitter_bird_logo_2012.svg/1259px-Twitter_bird_logo_2012.svg.png"></img></a><br>Negative: ' + pos_score + '<br>';
							// add tweets
							json_p = JSON.parse(obj.all_neg);
		    				render_twitter_json(json_p);
						} else if (neg_score == '' && pos_score != '') {
							score_header = 'Sentiment Analysis with Twitter<br><a href="http://twitter.com"><img id="twtr-logo" src="https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Twitter_bird_logo_2012.svg/1259px-Twitter_bird_logo_2012.svg.png"></img></a><br>Positive: ' + neg_score + '<br>';
							// add tweets
							json_p = JSON.parse(obj.all_pos);
		    				render_twitter_json(json_p);
						} else {
							// display text
							if ((Number(pos_score) + Number(neg_score)) != 0) {
								var pos_perc = (Number(pos_score) / (Number(pos_score) + Number(neg_score))) * 100;
								var neg_perc = (Number(neg_score) / (Number(pos_score) + Number(neg_score))) * 100;
								score_header = 'Sentiment Analysis with Twitter<br><a href="http://twitter.com"><img id="twtr-logo" src="https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Twitter_bird_logo_2012.svg/1259px-Twitter_bird_logo_2012.svg.png"></img></a><br>Positive: ' + pos_score + ' (' + pos_perc.toFixed(2).toString() + '%),<br>Negative: ' + neg_score + ' (' + neg_perc.toFixed(2).toString() + '%)' + '<br>';
							} else {
								score_header = 'Sentiment Analysis with Twitter<br><a href="http://twitter.com"><img id="twtr-logo" src="https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Twitter_bird_logo_2012.svg/1259px-Twitter_bird_logo_2012.svg.png"></img></a><br>Positive: ' + pos_score + ',<br>' + 'Negative: ' + neg_score + '<br>';
							}
							json_p = JSON.parse(obj.all_pos);
			    			render_twitter_json(json_p);
			    			json_p = JSON.parse(obj.all_neg);
			    			render_twitter_json(json_p);
						}
			    	}
			    	// set header with results
					document.getElementById("sentiment").innerHTML = score_header;
					alert('done');
            	},
            	error: function (xhr, ajaxOptions, thrownError) {
            		alert('Error \'' + thrownError + '\' has occured (' + xhr.status + '). We apologize for this inconvenience. Please try again in a few moments.');
            		location.reload();
            		return;
			    }
			});
		}
		document.getElementById("text-display-header").innerHTML = info_header;
    };

    // get stock data
	var url = 'http://query.yahooapis.com/v1/public/yql';

	// this is the lovely YQL query (html encoded) which lets us get the stock price:
	// select * from html where url="http://finance.yahoo.com/q?s=goog" and xpath='//span[@id="yfs_l10_goog"]'
	var data = 'q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22' + symbol + '%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';
	//alert(url + '?' + data);
	$.getJSON(url, data, callback);
}

/* IMPORTANT:
** - user's input is stored in the variable 'user_input'
** - once you get a response from watson, store the text that you want to display in the variable 'watson_text'
** - stock name and price info will be display in a header by way of function 'set_header' above
*/
function get_text(form) {
	// page is loading
	document.getElementById("adjustable-height").style.display = 'none';
	document.getElementById("loading-wheel").style.display = 'block';
	document.getElementById("loading-back").style.display = 'block';
	document.getElementById("nav_bar").style.display = 'none';
	document.getElementById("foot").style.display = 'none';

	// clear previous tweet displays
	$(".tweet-div").empty();
	rendered_tweets = [];

	// set timer
	var timer = Math.floor(Math.random() * ((8500-5000)+1) + 5000);
	setTimeout(function() {
		// not loading anymore
		document.getElementById("loading-back").style.display = 'none';
		document.getElementById("adjustable-height").style.position = 'relative';
	 	document.getElementById("adjustable-height").style.display = 'block';
	 	document.getElementById("loading-wheel").style.display = 'none';
	 	document.getElementById("body-all").style.overflow = 'scroll';
	 	document.getElementById("nav_bar").style.display = 'block';
	 	document.getElementById("foot").style.display = 'block';
	 	// document.getElementById("foot").style.position = 'relative';

	 	//scroll to bottom of page
	 	$('html, body').animate({
        	scrollTop: $("#ask-him").offset().top
    	}, 1000);
	}, timer);

	// do nothing if no text
	if (form.inputbox.value == '') {
		return;
	}
	// get text from user, display stock symbol
	var user_input = form.inputbox.value;
	document.getElementById("stock-sym-display").innerHTML = user_input.toUpperCase();
	document.getElementById("text-display").innerHTML = 'Loading...';
	document.getElementById("text-display-header").innerHTML = 'Loading...';
	document.getElementById("sentiment").innerHTML = 'Loading...';
	document.getElementById("sentiment").style.display = 'block';

	// change displays
	document.getElementById("text-input").value = '';
	document.getElementById("text-input").placeholder = 'Enter a new stock symbol...';

	if (page_load == false) {
		// first request
		document.getElementById("reveal").style.display = 'inline';
		document.getElementById("results").style.display = 'block';

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
	//var watson_text = 'Hi there! Thanks for using our service. Unfortunately, we don\'t have it up and running yet. Check back soon. - Team Seggy';
	var watson_text = '<a class="help-msg" onclick="get_help();">Not the results you expected?<br><br></a>Hi there! Thanks for using our service. Check back soon for more updates. - Team Seggy';
	////////////

	document.getElementById("text-display").innerHTML = watson_text;
	return false;
}