var async = require('asyncawait/async');
var await = require('asyncawait/await');
var request = require('co-request');
var log = require('./utilities/logger');
var _ = require('lodash');
var scrape = require('./scrape');
var cheerio = require('cheerio');

var constructUrl = function(searchTerm) {
	var searchTermString = encodeURIComponent(searchTerm).replace('%20', '+');
	return 'http://autosug.ebaystatic.com/autosug?kwd=' + searchTermString + '&sId=3';
};

var _getSuggestions = async (function (params) {
	var searchTerm = params.searchTerm;

	var html = await (scrape.scrape(constructUrl(searchTerm)));

	var suggestions = JSON.parse(html.match('({.*})')[0]).res.sug;
	var response = {suggestions: suggestions}
	return response;
});


module.exports.getSuggestions = async (function(params) {
	var cacheKey = 'suggestions.' + params.searchTerm;

	var suggestions = await (redis.get(cacheKey));
	if (suggestions != null) {
		return JSON.parse(suggestions);
	} else {
		var suggestions = await (_getSuggestions(params));
		await (redis.set(cacheKey, JSON.stringify(suggestions)));
		return suggestions;
	}
});
