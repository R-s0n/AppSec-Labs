$(document).ready(function() {

	// update input label on selection
	$('#verificationDoc').change(function() {
		$('input[type=file]')[0].files.length ? upload() : pass;
	});

});

const upload = async (upFile) => {

	$("#verificationDoc").prop("disabled", true); // disable multiple submission
	$('#loading-container').show();
	$('#progressbar').css({
		"width": "0%",
		"transition": "none"
	});
	setTimeout(() => {
		$('#progressbar').css({
			"width": "100%",
			"transition": "10s"
		});
	}, 100);

	let card = $("#resp-msg");
	card.text('Please wait...');
	card.show();

	if ($('input[type=file]')[0].files.length == 0) {
		card.text('Please select a file to upload!');
		$("#verificationDoc").prop("disabled", false);
		return;
	}

	let verificationDoc = $('input[type=file]')[0].files[0];
	let formData = new FormData();
	formData.append('verificationDoc', verificationDoc);

	await fetch('/api/upload', {
			method: 'POST',
			credentials: 'include',
			body: formData,
		})
		.then((response) => response.json()
			.then((resp) => {
				$('#loading-container').hide();
				if (response.status == 200) {
					$('#uploaded-file-ref').attr('class','');
					$('#uploaded-file-msg').attr('class','');
					$('#uploaded-file').attr('href',`/uploads/${resp.filename}`);
					$('#uploaded-file').text(resp.filename); 
				}
				verificationDoc.value = []; // reset file input
				card.text(resp.message); // set response message
			}))
		.catch((error) => {
			$('#loading-container').hide();
			card.text("This file could not be uploaded, please try again!");
		});

	$("#verificationDoc").prop("disabled", false);
}