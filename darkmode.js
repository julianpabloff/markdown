let darkMode = localStorage.getItem('darkMode') | 0;

const colorStyleSheet = new CSSStyleSheet();
document.adoptedStyleSheets = [colorStyleSheet];

// This is where the variables are set which the user css references
const brightnessMap = new Map()
	.set('body-color', 234)
	.set('text-color', 80)
	.set('dim-text-color', 140)
	.set('border-color', 230)
	.set('section-color', 244)
	.set('pane-color', 238)

const applyThemeColors = () => {
	let cssVariables = [];
	brightnessMap.forEach((brightness, variableName) => {
		let value = brightness + (255 - brightness * 2) * darkMode;

		// Increase brightness/contrast for dark mode with a quadratic
		if (darkMode) {
			const increase = Math.round(Math.pow(value - 255, 2) / -255 + 255) - value;
			value = value + Math.floor(increase / 3);
		}

		const hex = (value << 16) + (value << 8) + value;
		const hexString = hex.toString(16);
		const cssHexString = '#' + '0'.repeat(6 - hexString.length) + hexString;

		cssVariables.push(`--${variableName}: ${cssHexString};`);
	});

	// Construct cssText
	const output = [];
	output.push(':root {');
	cssVariables.forEach(variable => output.push(variable));
	output.push('}');

	colorStyleSheet.replaceSync(output.join(''));
}
applyThemeColors();

const isDarkMode = () => darkMode;
const setDarkMode = bool => {
	localStorage.setItem('darkMode', bool | 0);
	darkMode = bool | 0;
};
const toggleDarkMode = () => {
	setDarkMode(!darkMode);
	applyThemeColors();
};
