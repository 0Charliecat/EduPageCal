/**
 * **removes slovak** diacritics from string
 * @param {String} this
 */
String.prototype.withoutDiacritics = function() {
	return this.replace(/[áäčďéíľĺňóôŕšťúýž]/g, function(c) {
		return {
			'á': 'a',
			'ä': 'a',
			'č': 'c',
			'ď': 'd',
			'é': 'e',
			'í': 'i',
			'ľ': 'l',
			'ĺ': 'l',
			'ň': 'n',
			'ó': 'o',
			'ô': 'o',
			'ŕ': 'r',
			'š': 's',
			't': 't',
			'ú': 'u',
			'ý': 'y',
			'ž': 'z'
		}[c];
	});
}

module.exports = {
    meow: `meow`
}
