/*
FINANCIAL ADVSIOR WATSON
© 2016 Josh Kerber
CS89
*/
var page_load = false;
var rendered_tweets = [];
var help_message = 'Hi! Thank you for using our service.\n\nWith our Market Sentiment Synthesizer, you can utilize IBM\'s Watson to gather information on stocks you want to learn more about. We\'ll provide you with relavent articles and tweets that will show you what people are thinking. We\'ll also provide you with a sentiment analysis of the data, so you can see if people are exicted or upset with the stock in today\'s market. Articles with a positive sentiment will be highlighted green, negative sentiment red, and nuetral orange. All you have to do is enter the stock\'s ticker symbol!\n\nWe are currently using a free trial of Watson which occasionally goes over its daily API call limit. We apologize in advance if this happens to you.\n\nAre no articles or tweets being displayed? This is because not enough people are talking about the stock. To ensure relavent data is being presented, information is only presented if we feel it relates to the stock provided.\n\nStill have questions? Don\'t hesistate to email anish.chadalavada.18@dartmouth.edu if you need help!\n\n- MSS Team';
var max_tweets = 500;
var time_min_sec = 6;
var time_max_sec = 8;
var twitter_icon_url = 'http://www.qs-asia.com/main/wp-content/uploads/2016/06/twitter.png';

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
	while (tweets_done < 3 && i < max_tweets) {
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
	var twitter_callback = function(data) {
		if (!data.query.results) {
			alert('An unknown error has occured. We apologize for this inconvenience. Please try again in a few moments.');
    		location.reload();
    		return;
		}
		// parse response for data
        var price = data.query.results.quote.Ask;
        var name = data.query.results.quote.Name;
        var change = data.query.results.quote.PercentChange;
        var info_header = '';

        if (price == null || price == undefined) {
			// no data found
        	document.getElementById("sentiment").style.display = 'none';
        	document.getElementById("alchemy").style.display = 'none';
			info_header = 'Oops! ' + symbol.toUpperCase() + ' is not a valid stock symbol.<br>You can find a full list of ticker symbols online <a href="http://eoddata.com/symbols.aspx" target="_blank">here</a>.<br>';
		} else {
			// STOCK IS VALID LET'S GO!!!!
			// display stock data
			if (name == null) {
				document.getElementById("text-display-header").innerHTML = 'An unexpected error occured<br>Please try again';
				return;
			}
			if (change == null) {
				info_header = name + '<br> $' + Number(price).toFixed(2) + '<br><span id="line-white"></span>';
			} else {
				info_header = name + '<br> $' + Number(price).toFixed(2) + ' (' + change + ')<br><span id="line-white"></span>';
			}

			//get sentiment data if valid stock
			/****** don't look!!! ******/
			// USERNAME: c368e358-6de7-47f5-92cc-a4b3cffc01b0
			// PASSWORD: q4vS8yNgAc
			/***************************/
			var pos_url = 'https://c368e358-6de7-47f5-92cc-a4b3cffc01b0:q4vS8yNgAc@cdeservice.mybluemix.net:443/api/v1/messages/search?q=' + symbol.toUpperCase() + '%20sentiment%3Apositive%20lang%3Aen%20is%3Averified%20posted%3A2016-10-20&size=' + max_tweets + '&context=';//is%3Averified
			var neg_url = 'https://c368e358-6de7-47f5-92cc-a4b3cffc01b0:q4vS8yNgAc@cdeservice.mybluemix.net:443/api/v1/messages/search?q=' + symbol.toUpperCase() + '%20sentiment%3Anegative%20lang%3Aen%20is%3Averified%20posted%3A2016-10-20&size=' + max_tweets + '&context='; //is%3Averified
			var pos_score = '';
			var neg_score = '';

			// twitter sentiment ajax call to php
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
						// prepare to display tweets
						document.getElementById("tweet-container").style.display = 'block';
			    		var json_p = null;
			    		pos_score = obj.result_pos;
						neg_score = obj.result_neg;

						// parse results for scores
						var score_header = '';
						if (pos_score == '' && neg_score == '') {
							score_header = 'No sentiment analysis available for ' + name + '<br><a href="http://twitter.com"><img id="twtr-logo" src="' + twitter_icon_url + '"></img><br>';
						} else if (pos_score == '' && neg_score != '') {
							score_header = 'Sentiment Analysis with Twitter<br><a href="http://twitter.com"><img id="twtr-logo" src="' + twitter_icon_url + '"></img></a><br>Negative: ' + pos_score + ' tweets<br>';
							// add tweets
							json_p = JSON.parse(obj.all_neg);
		    				render_twitter_json(json_p);
						} else if (neg_score == '' && pos_score != '') {
							score_header = 'Sentiment Analysis with Twitter<br><a href="http://twitter.com"><img id="twtr-logo" src="' + twitter_icon_url + '"></img></a><br>Positive: ' + neg_score + ' tweets<br>';
							// add tweets
							json_p = JSON.parse(obj.all_pos);
		    				render_twitter_json(json_p);
						} else {
							// display text
							if ((Number(pos_score) + Number(neg_score)) != 0) {
								var pos_perc = (Number(pos_score) / (Number(pos_score) + Number(neg_score))) * 100;
								var neg_perc = (Number(neg_score) / (Number(pos_score) + Number(neg_score))) * 100;
								score_header = 'Sentiment Analysis with Twitter<br><a href="http://twitter.com"><img id="twtr-logo" src="' + twitter_icon_url + '"></img></a><br>' + pos_perc.toFixed(2).toString() + '% Positive,<br>' + neg_perc.toFixed(2).toString() + '% Negative' + '<br>';
							} else {
								score_header = 'Sentiment Analysis with Twitter<br><a href="http://twitter.com"><img id="twtr-logo" src="' + twitter_icon_url + '"></img></a><br>Positive: ' + pos_score + ' tweets,<br>' + 'Negative: ' + neg_score + ' tweets<br>';
							}
							json_p = JSON.parse(obj.all_pos);
			    			render_twitter_json(json_p);
			    			json_p = JSON.parse(obj.all_neg);
			    			render_twitter_json(json_p);
						}
			    	}
			    	// set header with results
					document.getElementById("sentiment").innerHTML = score_header;
            	},
            	error: function (xhr, ajaxOptions, thrownError) {
            		alert('Error \'' + thrownError + '\' has occured (' + xhr.status + '). We apologize for this inconvenience. Please try again in a few moments.');
            		location.reload();
            		return;
			    }
			});
			// alchemy api call
			/****** don't look!!! ******/
			var API_KEY_ARRAY = [];
			API_KEY_ARRAY.push('025b3aef7aecbe72d5917c58e7b3ddd89ca8fee1');
			API_KEY_ARRAY.push('176ef59fcb828eeba09a4115c6b7df723dcdb0c6');
			API_KEY_ARRAY.push('21bb6af45b7e95a6d576264950e6ed3ec0f65c1f');
			var API_KEY = API_KEY_ARRAY[Math.floor(Math.random() * ((2 - 0) + 1) + 0)];
			/***************************/															//
			var alchemy_url = 'https://access.alchemyapi.com/calls/data/GetNews?apikey=' + API_KEY + '&return=enriched.url.title,enriched.url.url,enriched.url.enrichedTitle.docSentiment&start=1476662400&end=1478386800&q.enriched.url.enrichedTitle.entities.entity=|text=' + symbol.toUpperCase() + ',type=company|&q.enriched.url.enrichedTitle.taxonomy.taxonomy_.label=finance&count=25&outputMode=json';
//https://access.alchemyapi.com/calls/data/GetNews?apikey=025b3aef7aecbe72d5917c58e7b3ddd89ca8fee1&return=enriched.url.title,enriched.url.url&start=1475280000&end=1478386800&q.enriched.url.enrichedTitle.entities.entity=|text=AMZN,type=company|&count=25&outputMode=json
			var alchemy_callback = function(data) {
				if (!data || !data.result || !data.result.docs || data.result == 'ERROR') {
				// 	// coudln't get articles
					var no_news_msg = 'Watson cannot retrieve news articles at this time. We apologize for this inconvenience. Please try again in a few moments.';
					document.getElementById("alchemy").innerHTML = name + ' In The News<br><img id="news-logo" src="http://www.corelinerless.com/images/ico-news.png"></img><br><p>' + no_news_msg + '</p>';
				} else {
					var alchemy_string = name + ' In The News<br><img id="news-logo" src="http://www.corelinerless.com/images/ico-news.png"></img><br>';
					var url = '';
					var title = '';
					var sentiment = '';
					// get articles with url
					var loop_max = Math.min(data.result.docs.length, 5);
					for (var i = 0; i < loop_max; i++) {
						url = data.result.docs[i].source.enriched.url.url;
						title = data.result.docs[i].source.enriched.url.title;
						sentiment = data.result.docs[i].source.enriched.url.enrichedTitle.docSentiment.type;
						//alert('found url ' + url + ' and title ' + title);
						if (url && title && sentiment) {
							// add to final display string if not null
							if (sentiment == 'positive') {
								alchemy_string = alchemy_string + '<a target="_blank" class="news-article-pos" href="' + url + '">' + title + '</a>';
							} else if (sentiment == 'negative') {
								alchemy_string = alchemy_string + '<a target="_blank" class="news-article-neg" href="' + url + '">' + title + '</a>';
							} else {
								alchemy_string = alchemy_string + '<a target="_blank" class="news-article-nue" href="' + url + '">' + title + '</a>';
							}
						}
					}
					// send it
					alchemy_string = alchemy_string + '<br><br>';
					document.getElementById("alchemy").innerHTML = alchemy_string;
				}
			}
			$.getJSON(alchemy_url, alchemy_callback);	//alert(alchemy);
		}
		// display info
		document.getElementById("text-display-header").innerHTML = info_header;
    };

    // get stock data
	var url = 'http://query.yahooapis.com/v1/public/yql';

	// get stock data from yahoo finance
	var data = 'q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22' + symbol + '%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';
	$.getJSON(url, data, twitter_callback);	//alert(url + '?' + data);
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
	document.getElementById("tweet-container").style.display = 'none';
	document.getElementById("title-main").innerHTML = 'Market Sentiment Synthesizer';

	// clear previous tweet displays
	$(".tweet-div").empty();
	rendered_tweets = [];

	// set timer
	var time_min_milisec = time_min_sec * 1000;
	var time_max_milisec = time_max_sec * 1000;
	var timer = Math.floor(Math.random() * ((time_max_milisec - time_min_milisec ) + 1) + time_min_milisec);
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
        	scrollTop: $("#stock-sym-display").offset().top
    	}, 1000);
	}, timer);

	// do nothing if no text
	if (form.inputbox.value == '') {
		return;
	}
	// get text from user, display stock symbol
	var user_input = form.inputbox.value;
	document.getElementById("stock-sym-display").innerHTML = user_input.toUpperCase();
	// document.getElementById("text-display").innerHTML = 'Loading...';
	document.getElementById("text-display-header").innerHTML = 'Loading...';
	document.getElementById("sentiment").innerHTML = 'Loading...';
	document.getElementById("sentiment").style.display = 'block';
	document.getElementById("alchemy").innerHTML = 'Loading...';
	document.getElementById("alchemy").style.display = 'block';

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

	///////////// RETRIEVE RESPONSE FROM WATSON HERE /////////////
	//var watson_text = 'Hi there! Thanks for using our service. Unfortunately, we don\'t have it up and running yet. Check back soon. - Team Seggy';
	var watson_text = '<a class="help-msg" onclick="get_help();">Not the results you were expecting?</a>';
	//////////////////////////////////////////////////////////////

	document.getElementById("text-display").innerHTML = watson_text;
	return false;
}