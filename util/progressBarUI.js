const ProgressBar = require('ascii-progress');
function leftPad(str, len) {
	return String(str).length >= len ? str : (' '.repeat(len) + str).slice(-len);
}
const colors = [
	'red',
	'cyan',
	'blue',
	'green',
	'yellow',
	'magenta',
	'brightRed',
	'brightBlue',
	'brightCyan',
	'brightGreen',
	'brightYellow',
	'brightMagenta',
];
function progressBarUI(options) {
	const progressIndicators = {};

	return status => label => {
		if (!process.stdout.isTTY) {
			return;
		}
		status = status ? status.replace(/\r?\n|\r/, '') : '';  // clear newlines

		if (!progressIndicators[label]) {
			const color = colors.pop() || '';
			options.schema = `${leftPad(label, 8)}: [ :bar${color ? `.${color}`: ''} ] :current/:total :status`;
			progressIndicators[label] = new ProgressBar(options);
		}
		progressIndicators[label].tick({ status });
	};
}

module.exports = progressBarUI;

