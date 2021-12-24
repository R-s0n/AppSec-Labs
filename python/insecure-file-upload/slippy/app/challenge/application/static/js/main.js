$(document).ready(function() {
	// update input label on selection
	$('#archiveFile').change(function() {
		$('input[type=file]')[0].files.length ? upload() : pass;
	});
});



const upload = async (upFile) => {

	$('#archiveFile').prop('disabled', true); // disable multiple submission
	$('#loading-container').show();
	$('#uploaded_list').attr('class','hidden');
	$('#progressbar').css({
		'width': '0%',
		'transition': 'none'
	});
	setTimeout(() => {
		$('#progressbar').css({
			'width': '100%',
			'transition': '10s'
		});
	}, 100);
	// prepare alert
	let card = $('#resp-msg');
	card.text('Please wait...');
	card.show();

	// validate
	if ($('input[type=file]')[0].files.length == 0) {
		card.text('Please select a file to upload!');
		$('#archiveFile').prop('disabled', false);
		return;
	}

	let archiveFile = $('input[type=file]')[0].files[0];
	let formData = new FormData();
	formData.append('file', archiveFile);

	await fetch('/api/unslippy', {
			method: 'POST',
			credentials: 'include',
			body: formData,
		})
		.then((response) => response.json()
			.then((resp) => {
				$('#loading-container').hide();
				if (resp.hasOwnProperty('list')) {
					$('#uploaded_list').attr('class','mt-5 text-left');
					populateList(resp.list);
					card.hide();
					$('#archiveFile').prop('disabled', false);
					return;
				}
				card.text('Please make sure the file is a valid tar.gz archive!'); // set response message
			}))
		.catch((error) => {
			$('#loading-container').hide();
			card.text('This file could not be uploaded, please make sure the file is a valid tar.gz archive!');
		});

	$('#archiveFile').prop('disabled', false);
}

const populateList = (fileList) => {
	$('#extracted_list').html('');
	fileList.forEach(fullpath => {
		parentDir = fullpath.match(/\/static\/archives\/\w{30}/)[0];
		filename = fullpath.split(parentDir)[1];
		$('#extracted_list').append(`<li><a href="${parentDir}${filename}">${filename}</a></li>`);
	})
}