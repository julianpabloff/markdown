window.addEventListener('load', () => {
	const darkModeToggle = document.getElementById('dark-mode-toggle');

	const setDMButtonText = () =>
		darkModeToggle.innerHTML = `<span>${isDarkMode() ? '\u{263E}' : '\u{1F323}'}</span>`;
	setDMButtonText();

	darkModeToggle.addEventListener('click', () => {
		toggleDarkMode();
		setDMButtonText();
	});

	const processButton = document.getElementById('process-btn');
	const mdInput = document.getElementById('markdown');
	const htmlOutput = document.getElementById('html-output');
	const visualOutput = document.getElementById('visual-output');

	const process = () => {
		const output = marked.parse(mdInput.value);
		htmlOutput.value = output;
		visualOutput.innerHTML = output;
	}
	process();

	processButton.addEventListener('click', process);

	mdInput.addEventListener('keydown', function(event) {
		if (event.keyCode == 13 && event.ctrlKey) process();
		else if (event.key == 'Tab') {
			event.preventDefault();
			const start = this.selectionStart;
			const end = this.selectionEnd;
			console.log(start);
			console.log(end);
			this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
			this.selectionEnd = start + 4;
			this.selectionStart = this.selectionEnd;
		}
	});

	let spellcheck = true;
	const spellcheckButton = document.getElementById('spellcheck');

	const toggleSpellCheck = () => {
		spellcheck = !spellcheck;
		spellcheckButton.innerText = spellcheck ? 'Spellcheck ON' : 'Spellcheck OFF';
		mdInput.spellcheck = spellcheck;
		mdInput.focus();
	}
	toggleSpellCheck();

	spellcheckButton.addEventListener('click', toggleSpellCheck);

	const saveButton = document.getElementById('save-btn');
	const saveMenuContainer = document.getElementById('save-menu');
	const fileNameInput = document.getElementById('file-name');
	const downloadButton = document.getElementById('download-btn');

	saveButton.addEventListener('click', () => {
		saveMenuContainer.style.display = 'flex';
		saveButton.style.display = 'none';
	});

	const updateDownloadButton = () => downloadButton.disabled = fileNameInput.value == '';
	updateDownloadButton();
	fileNameInput.addEventListener('input', updateDownloadButton);

	const saveMarkdown = () => {
		const filename = fileNameInput.value;
		if (filename == '') return;

		const data = mdInput.value;
		const blob = new Blob([data], { type: 'text/markdown' });
		downloadLink.download = filename + '.md';

		const downloadLink = document.createElement('a');
		const url = window.URL.createObjectURL(blob);
		downloadLink.href = url;
		downloadLink.click();
		window.URL.revokeObjectURL(url);

		saveMenuContainer.style.display = 'none';
		saveButton.style.display = 'initial';
	}

	downloadButton.addEventListener('click', saveMarkdown);
});
