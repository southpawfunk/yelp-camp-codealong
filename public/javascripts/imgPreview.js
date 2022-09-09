function previewMultiple(event) {
	const prevImg = document.getElementById('previewImg');
	const prevLabel = document.getElementById('previewLabel');
	let addHTML = '';
	let addText = '';
	for (let i = 0; i < event.target.files.length; i++) {
		const url = URL.createObjectURL(event.target.files[i]);
		addHTML += `<img src="${url}">`;
		addText += `${event.target.files[i].name} `;
	}
	prevImg.innerHTML = addHTML;
	prevLabel.innerText = addText;
}
