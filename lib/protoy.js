/**
 * **removes slovak** diacritics from string
 * @param {String} this
 */
String.prototype.withoutDiacritics = () => {
	return this.normalize('NFKD').replace(/[^\w\s.-_\/]/g, '')
}

module.exports = {
    meow: `meow`
}
