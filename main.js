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
	// const htmlOutput = document.getElementById('html-output');
	const visualOutput = document.getElementById('visual-output');

	const process = () => {
		const output = marked.parse(mdInput.value);
		// htmlOutput.value = output;
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
			this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
			handleMDInputChange();
			this.selectionEnd = start + 4;
			this.selectionStart = this.selectionEnd;
		}
	});


	// TOOLS

	// Wrap
	const wrap = document.getElementById('wrap');
	mdInput.wrap = wrap.checked ? 'soft' : 'off';
	wrap.addEventListener('input', () => {
		mdInput.wrap = wrap.checked ? 'soft' : 'off';
		mdInput.scrollTo(0, mdInput.scrollTop);
	});

	// Spellcheck
	const spellcheck = document.getElementById('spellcheck');
	mdInput.spellcheck = spellcheck.checked;
	spellcheck.addEventListener('input', () => mdInput.spellcheck = spellcheck.checked);

	// Undo
	const history = [mdInput.value];
	let timer = false;
	const handleMDInputChange = () => {
		if (timer) {
			clearTimeout(timer);
			timer = false;
		}
		timer = setTimeout(() => history.push(mdInput.value), 700);
	}
	mdInput.addEventListener('input', handleMDInputChange);

	const undo = document.getElementById('undo');
	undo.addEventListener('click', () => {
		if (history.length > 1) {
			history.pop();
			mdInput.value = history.at(-1);
		}
		mdInput.focus();
	});

	// Image insert
	let lastSelectionStart, lastSelectionEnd;
	mdInput.addEventListener('blur', function() {
		lastSelectionStart = this.selectionStart;
		lastSelectionEnd = this.selectionEnd;
	});

	const fileInput = document.getElementById('image-insert');
	fileInput.addEventListener('click', event => {
		mdInput.readOnly = true;
		mdInput.selectionStart = lastSelectionStart;
		mdInput.selectionEnd = lastSelectionEnd;
		mdInput.focus();
		const preventSelction = event => {
			event.preventDefault();
		};
		mdInput.addEventListener('mousedown', preventSelction);
		setTimeout(() => {
			mdInput.readOnly = false;
			mdInput.removeEventListener('mousedown', preventSelction);
		}, 3000);
		console.log('fileInput clicked');
	});
	// fileInput.addEventListener('change', () => {
	// 	console.log(fileInput.value);
	// 	console.log(fileInput.files);
	// });

	// Save to file
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

	const saveFile = document.getElementById('save');
	saveFile.addEventListener('click', () => {
		console.log('saving');
	});
});
