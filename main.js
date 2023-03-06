window.addEventListener('load', () => {
	const darkModeToggle = document.getElementById('dark-mode-toggle');

	const setDMButtonText = () =>
		darkModeToggle.innerHTML = `<span>${isDarkMode() ? '\u{263E}' : '\u{1F323}'}</span>`;
	setDMButtonText();

	darkModeToggle.addEventListener('click', () => {
		toggleDarkMode();
		setDMButtonText();
	});

	// Tips
	const tip = document.getElementById('tip');
	const tips = {
		mdInput: { bind: 'CTRL + ENTER', action: 'process' },
		filename: { bind: 'ENTER', action: 'save' }
	}
	const setTip = tipName => {
		const tipText = tips[tipName];
		tip.innerHTML = `press <code>${tipText.bind}</code> to ${tipText.action}`;
	}
	const clearTip = () => tip.innerHTML = '';

	const processButton = document.getElementById('process-btn');
	const mdInput = document.getElementById('markdown');
	// const htmlOutput = document.getElementById('html-output');
	const visualOutput = document.getElementById('visual-output');

	// Markdown input
	const process = () => {
		const output = marked.parse(mdInput.value);
		// htmlOutput.value = output;
		visualOutput.innerHTML = output;
	}
	process();
	processButton.addEventListener('click', process);

	const insertTextIntoMdInput = (text, leaveSelected = false) => {
		const start = mdInput.selectionStart;
		const end = mdInput.selectionEnd;
		const textBefore = mdInput.value.substring(0, start);
		const textAfter = mdInput.value.substring(end);
		mdInput.value = textBefore + text + textAfter;
		handleMDInputChange();
		mdInput.selectionEnd = start + text.length;
		if (!leaveSelected) mdInput.selectionStart = mdInput.selectionEnd;
		else mdInput.selectionStart = start;
	}

	mdInput.addEventListener('keydown', function(event) {
		if (event.keyCode == 13 && event.ctrlKey) process();
		else if (event.key == 'Tab') {
			event.preventDefault();
			insertTextIntoMdInput('    ');
		}
	});
	
	mdInput.addEventListener('focus', () => setTip('mdInput'));
	mdInput.addEventListener('blur', clearTip);
	mdInput.focus();


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
			mdInput.value = history[history.length - 1];
			mdInput.focus();
			process();
		}
	});

	// Image insert
	const fileInput = document.getElementById('image-insert');
	const uploadLabel = document.getElementById('upload-primary-label');
	const progressContainer = document.getElementById('progress-container');
	const progressLabel = document.getElementById('upload-progress-label');

	// Dummy upload functions
	const wait = async (miliseconds = 1000) => new Promise(resolve => setTimeout(resolve, miliseconds));
	const intervalIterate = async (framestep, count, callback) => new Promise(resolve => {
		let i = 0;
		const interval = setInterval(() => {
			callback(i);
			i++;
			if (i >= count) {
				clearInterval(interval);
				resolve();
			}
		}, framestep);
	});
	const preventDefault = event => event.preventDefault();
	progressLabel.addEventListener('mousedown', preventDefault);

	fileInput.addEventListener('click', () => mdInput.focus());
	fileInput.addEventListener('change', async () => {
		const file = fileInput.files[0];
		mdInput.readOnly = true;
		mdInput.addEventListener('mousedown', preventDefault);
		uploadLabel.addEventListener('mousedown', preventDefault);
		fileInput.addEventListener('click', preventDefault);

		uploadLabel.innerText = 'uploading...';
		fileInput.className = 'uploading';

		await intervalIterate(15, 100, i => {
			progressContainer.style.width = i.toString() + '%';
		});
		progressContainer.style.width = '0';
		uploadLabel.innerText = 'upload image';
		fileInput.className = '';
		const imageMD = `![alt_text](${file.name})`;
		insertTextIntoMdInput(imageMD, true);

		mdInput.removeEventListener('mousedown', preventDefault);
		uploadLabel.removeEventListener('mousedown', preventDefault);
		fileInput.removeEventListener('click', preventDefault);
		mdInput.readOnly = false;
	});

	// Save to file
	const saveButtonContainer = document.getElementById('save-button-container');
	const saveFile = document.getElementById('save');
	const filenameContainer = document.getElementById('filename-container');
	const filenameInput = document.getElementById('filename');
	const filenameLabel = document.getElementById('filename-label');

	filenameInput.value = '';
	saveFile.addEventListener('click', () => {
		saveButtonContainer.style.display = 'none';
		filenameContainer.style.display = 'block';
		filenameInput.focus();
	});

	let readyToSave = false;

	const resetLabel = () => {
		filenameLabel.innerText = 'enter filename';
		filenameLabel.className = '';
		readyToSave = false;
		clearTip();
	}
	filenameInput.addEventListener('input', function() {
		if (this.value == '') resetLabel();
		else {
			filenameLabel.innerText = this.value + '.md';
			setTip('filename');
			filenameLabel.className = 'hover-highlight';
			readyToSave = true;
		}
	});

	const closeFilename = () => {
		filenameInput.value = '';
		resetLabel();
		filenameContainer.style.display = 'none';
		saveButtonContainer.style.display = 'block';
	}

	filenameInput.addEventListener('focusout', function() {
		console.log('filenameInput focusout');
		closeFilename();
	});

	const saveMarkdown = () => {
		const filename = filenameInput.value;
		if (filename == '') return;

		const data = mdInput.value;
		const blob = new Blob([data], { type: 'text/markdown' });

		const downloadLink = document.createElement('a');
		downloadLink.download = filename + '.md';
		const url = window.URL.createObjectURL(blob);
		downloadLink.href = url;
		// downloadLink.click();
		console.log('downloaded ' + downloadLink.download);
		window.URL.revokeObjectURL(url);
		closeFilename();
	}

	filenameLabel.addEventListener('mousedown', event => {
		event.preventDefault();
		if (readyToSave) saveMarkdown();
	});

	filenameInput.addEventListener('keydown', function(event) {
		console.log(event.keyCode);
		if (event.key == 'Enter' && readyToSave) saveMarkdown();
	});
});
