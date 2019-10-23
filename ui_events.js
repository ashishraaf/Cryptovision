/* global $, window, document */
/* global toTitleCase, connect_to_server, refreshHomePanel, closeNoticePanel, openNoticePanel, show_tx_step, marbles*/
/* global pendingTxDrawing:true */
/* exported record_company, autoCloseNoticePanel, start_up, block_ui_delay*/
var ws = {};
// Base 47 characters
var chars = [
		'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J',
		'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'T', 'U',
		'V', 'W', 'X', 'Y', 'Z', 'b', 'c', 'd', 'e',
		'f', 'g', 'h', 'm', 'n', 'p', 'q', 'r', 't',
		'u', 'v', 'w', 'x', 'y', 'z', '2', '3', '4',
		'6', '7'
];

var bgcolors = ['whitebg', 'blackbg', 'redbg', 'greenbg', 'bluebg', 'purplebg', 'pinkbg', 'orangebg', 'yellowbg'];
var autoCloseNoticePanel = null;
var known_companies = {};
var start_up = true;
var lsKey = 'marbles';
var fromLS = {};
var block_ui_delay = 15000; 								//default, gets set in ws block msg
var auditingMarble = null;
var hashval;


// =================================================================================
// On Load
// =================================================================================
$(document).on('ready', function () {
	fromLS = window.localStorage.getItem(lsKey);
	if (fromLS) fromLS = JSON.parse(fromLS);
	else fromLS = { story_mode: false };					//dsh todo remove this
	console.log('from local storage', fromLS);

	connect_to_server();

	// =================================================================================
	// jQuery UI Events
	// =================================================================================
	$('#uploadFile').click(function(){
			var reader = new FileReader();
			const photo = document.getElementById("photo");
      reader.readAsArrayBuffer(photo.files[0]);
      reader.onloadend = function() {
        const ipfs = window.IpfsApi('/ip4/10.87.54.106/tcp/5001') // Connect to IPFS
        const buf = buffer.Buffer(reader.result) // Convert data into buffer
        ipfs.files.add(buf, (err, result) => { // Upload buffer to IPFS
          if(err) {
            console.error(err)
            return
          }
          let url = `http://10.87.54.106:8080/ipfs/${result[0].hash}`
          console.log(`Url --> ${url}`)
          document.getElementById("url").innerHTML= url
          document.getElementById("url").href= url
          document.getElementById("output").src = url
					hashval = result[0].hash
					//Buffer-RELEASE (buf)
        })
      }

	});
	valueoftext= 'png';
	$('#createMarbleButton').click(function () {

		// changes made by ashish

		if(valueoftext == 'txt')
		{
			color1= 'yellow'
		}

		else if (valueoftext == 'doc') {
			color1= 'white'
		}
		else if (valueoftext == 'png') {
			color1 = 'red'
		} else if (valueoftext == 'png') {
			color1 = 'pink'
		}else{
			color1 = 'pink'
		}

		//end of ashish code

		console.log('creating marble');
		var photo = document.getElementById("photo");
		var name = photo.files[0].name;
		var name1 = '';
		name1 = encodeString1212(name1);
		//var hash = Fname;
		//var array = hash.split("http://10.87.55.42:8080/ipfs/");

	//http://10.87.55.42:8080/ipfs/
		// alert(document.getElementById("photo").files[].name);
		var obj = {
			type: 'create',
			color: hashval + '/' + name ,//$('.colorSelected').attr('color'),
			size: '35',//$('select[name="size"]').val(),
			username: $('select[name="user"]').val(),
			company: $('input[name="company"]').val(),
			owner_id: $('input[name="owner_id"]').val(),
			FileName: name,
			Filehash: 'fileahsvaluerandom',
			v: 1
		};
		console.log('creating marble, sending', obj);
		$('#createPanel').fadeOut();
		$('#tint').fadeOut();

		show_tx_step({ state: 'building_proposal' }, function () {
			ws.send(JSON.stringify(obj));

			refreshHomePanel();
			$('.colorValue').html('Color');											//reset
			for (var i in bgcolors) $('.createball').removeClass(bgcolors[i]);		//reset
			$('.createball').css('border', '2px dashed #fff');						//reset
		});

		return false;
	});

	//fix marble owner panel (don't filter/hide it)
	$(document).on('click', '.marblesFix', function () {
		if ($(this).parent().parent().hasClass('marblesFixed')) {
			$(this).parent().parent().removeClass('marblesFixed');
		}
		else {
			$(this).parent().parent().addClass('marblesFixed');
		}
	});

	//marble color picker
	$(document).on('click', '.colorInput', function () {
		$('.colorOptionsWrap').hide();											//hide any others
		$(this).parent().find('.colorOptionsWrap').show();
	});
	$(document).on('click', '.colorOption', function () {
		var color = $(this).attr('color');
		var html = '<span class="fa fa-circle colorSelected ' + color + '" color="' + color + '"></span>';

		$(this).parent().parent().find('.colorValue').html(html);
		$(this).parent().hide();

		for (var i in bgcolors) $('.createball').removeClass(bgcolors[i]);		//remove prev color
		$('.createball').css('border', '0').addClass(color + 'bg');				//set new color
	});

	//username/company search
	$('#searchUsers').keyup(function () {
		var count = 0;
		var input = $(this).val().toLowerCase();
		for (var i in known_companies) {
			known_companies[i].visible = 0;
		}

		//reset - clear search
		if (input === '') {
			$('.marblesWrap').show();
			count = $('#totalUsers').html();
			$('.companyPanel').fadeIn();
			for (i in known_companies) {
				known_companies[i].visible = known_companies[i].count;
				$('.companyPanel[company="' + i + '"]').find('.companyVisible').html(known_companies[i].visible);
				$('.companyPanel[company="' + i + '"]').find('.companyCount').html(known_companies[i].count);
			}
		}
		else {
			var parts = input.split(',');
			console.log('searching on', parts);

			//figure out if the user matches the search
			$('.marblesWrap').each(function () {												//iter on each marble user wrap
				var username = $(this).attr('username');
				var company = $(this).attr('company');
				if (username && company) {
					var full = (username + company).toLowerCase();
					var show = false;

					for (var x in parts) {													//iter on each search term
						if (parts[x].trim() === '') continue;
						if (full.indexOf(parts[x].trim()) >= 0 || $(this).hasClass('marblesFixed')) {
							count++;
							show = true;
							known_companies[company].visible++;								//this user is visible
							break;
						}
					}

					if (show) $(this).show();
					else $(this).hide();
				}
			});

			//show/hide the company panels
			for (i in known_companies) {
				$('.companyPanel[company="' + i + '"]').find('.companyVisible').html(known_companies[i].visible);
				if (known_companies[i].visible === 0) {
					console.log('hiding company', i);
					$('.companyPanel[company="' + i + '"]').fadeOut();
				}
				else {
					$('.companyPanel[company="' + i + '"]').fadeIn();
				}
			}
		}
		//user count
		$('#foundUsers').html(count);
	});

	//login events
	$('#whoAmI').click(function () {													//drop down for login
		if ($('#userSelect').is(':visible')) {
			$('#userSelect').fadeOut();
			$('#carrot').removeClass('fa-angle-up').addClass('fa-angle-down');
		}
		else {
			$('#userSelect').fadeIn();
			$('#carrot').removeClass('fa-angle-down').addClass('fa-angle-up');
		}
	});

	//open create marble panel
	$(document).on('click', '.addMarble', function () {
		//$('#uploadfile').trigger('click')
		var company = $(this).parents('.innerMarbleWrap').parents('.marblesWrap').attr('company');
		var username = $(this).parents('.innerMarbleWrap').parents('.marblesWrap').attr('username');
		var owner_id = $(this).parents('.innerMarbleWrap').parents('.marblesWrap').attr('owner_id');
		var fileName; //=$(this).getElementById('photo').value;
		var fileHash;
		fileHash = 'testhashvalue';
		fileName = this.value;
		$('#tint').fadeIn();
		$('#createPanel').fadeIn();
		$('select[name="user"]').html('<option value="' + username + '">' + toTitleCase(username) + '</option>');
		$('input[name="company"]').val(company);
		$('input[name="owner_id"]').val(owner_id);

		// document.getElementById('uploadfile').onchange=function(){
		// 	//alert('selected files :' + this.value);
		//
		// 	// alert(fileName);
		// };

	});

	//close create marble panel
	$('#tint').click(function () {
		if ($('#startUpPanel').is(':visible')) return;
		if ($('#txStoryPanel').is(':visible')) return;
		$('#createPanel, #tint, #settingsPanel').fadeOut();
	});

	//notification drawer
	$('#notificationHandle').click(function () {
		if ($('#noticeScrollWrap').is(':visible')) {
			closeNoticePanel();
		}
		else {
			openNoticePanel();
		}
	});

	//hide a notification
	$(document).on('click', '.closeNotification', function () {
		$(this).parents('.notificationWrap').fadeOut();
	});

	//settings panel
	$('#showSettingsPanel').click(function () {
		$('#settingsPanel, #tint').fadeIn();
	});
	$('#closeSettings').click(function () {
		$('#settingsPanel, #tint').fadeOut();
	});

	//story mode selection
	$('#disableStoryMode').click(function () {
		set_story_mode('off');
	});
	$('#enableStoryMode').click(function () {
		set_story_mode('on');
	});

	//close create panel
	$('#closeCreate').click(function () {
		$('#createPanel, #tint').fadeOut();
	});

	//change size of marble
	$('select[name="size"]').click(function () {
		var size = $(this).val();
		if (size === '16') $('.createball').animate({ 'height': 150, 'width': 150 }, { duration: 200 });
		else $('.createball').animate({ 'height': 250, 'width': 250 }, { duration: 200 });
	});


	//right click opens audit on marble
	$(document).on('contextmenu', '.ball', function () {
		auditMarble(this, false);
		var username = $(this).parents('.innerMarbleWrap').parents('.marblesWrap').attr('username');
	if (username !=  'n3991925')
	{
			//var company1 = $(this).attr('color');
			//colorVal = escapeHtml(marble.color);
			var colorVal = this.attributes.innerHTML.nodeValue;
			var fileval = colorVal.split("/");
			window.open('http://10.87.54.106:8080/ipfs/' + fileval[0] ,'_blank');
			return false;
}

	});

	//left click audits marble
	$(document).on('click', '.ball', function () {
		var username = $(this).parents('.innerMarbleWrap').parents('.marblesWrap').attr('username');
	if (username !=  'n3991925')
	{
		auditMarble(this, true);
}
//		var colorVal = this.attributes.innerHTML.nodeValue;
//		var fileval = colorVal.split("/");
//		window.open('http://10.87.55.143:8080/ipfs/' + fileval[0] ,'_blank');
});

	function auditMarble(that, open) {
		var marble_id = $(that).attr('id');
		$('.auditingMarble').removeClass('auditingMarble');

		if (!auditingMarble || marbles[marble_id].id != auditingMarble.id) {//different marble than before!
			for (var x in pendingTxDrawing) clearTimeout(pendingTxDrawing[x]);
			$('.txHistoryWrap').html('');										//clear
		}

		auditingMarble = marbles[marble_id];
		console.log('\nuser clicked on marble', marble_id);

		if (open || $('#auditContentWrap').is(':visible')) {
			$(that).addClass('auditingMarble');
			$('#auditContentWrap').fadeIn();
			$('#marbleId').html(marble_id);
			var color = marbles[marble_id].color;
			for (var i in bgcolors) $('.auditMarble').removeClass(bgcolors[i]);	//reset
			$('.auditMarble').addClass(color + 'bg');

			$('#rightEverything').addClass('rightEverythingOpened');
			$('#leftEverything').fadeIn();

			var obj2 = {
				type: 'audit',
				marble_id: marble_id
			};
			ws.send(JSON.stringify(obj2));
		}
	}

	$('#auditClose').click(function () {
		$('#auditContentWrap').slideUp(500);
		$('.auditingMarble').removeClass('auditingMarble');												//reset
		for (var x in pendingTxDrawing) clearTimeout(pendingTxDrawing[x]);
		setTimeout(function () {
			$('.txHistoryWrap').html('<div class="auditHint">Click a Marble to Audit Its Transactions</div>');//clear
		}, 750);
		$('#marbleId').html('-');
		auditingMarble = null;

		setTimeout(function () {
			$('#rightEverything').removeClass('rightEverythingOpened');
		}, 500);
		$('#leftEverything').fadeOut();
	});

	$('#auditButton').click(function () {
		$('#auditContentWrap').fadeIn();
		$('#rightEverything').addClass('rightEverythingOpened');
		$('#leftEverything').fadeIn();
	});

	let selectedOwner = null;
	// show dialog to confirm if they want to disable the marble owner
	$(document).on('click', '.disableOwner', function () {
		$('#disableOwnerWrap, #tint').fadeIn();
		selectedOwner = $(this).parents('.marblesWrap');
	});

	// disable the marble owner
	$('#removeOwner').click(function () {
		var obj = {
			type: 'disable_owner',
			owner_id: selectedOwner.attr('owner_id')
		};
		ws.send(JSON.stringify(obj));
		selectedOwner.css('opacity', 0.4);
	});

	$('.closeDisableOwner, #removeOwner').click(function () {
		$('#disableOwnerWrap, #tint').fadeOut();
	});
});

//toggle story mode
function set_story_mode(setting) {
	if (setting === 'on') {
		fromLS.story_mode = true;
		$('#enableStoryMode').prop('disabled', true);
		$('#disableStoryMode').prop('disabled', false);
		$('#storyStatus').addClass('storyOn').html('on');
		window.localStorage.setItem(lsKey, JSON.stringify(fromLS));		//save
	}
	else {
		fromLS.story_mode = false;
		$('#disableStoryMode').prop('disabled', true);
		$('#enableStoryMode').prop('disabled', false);
		$('#storyStatus').removeClass('storyOn').html('off');
		window.localStorage.setItem(lsKey, JSON.stringify(fromLS));		//save
	}
}

	function encodeString1212(value) {
	  // Get toggle values and convert binary to decimal
	  var toggles = value.slice(0, value.length - 2); // string
	  var decimal = parseInt(toggles, 2); // number (0..1023)

	  //  Get two-digit select value
	  var select = parseInt(value.slice(value.length - 2)); // number (0..99)

	  //  Combine toggle and select values to a single integer
	  var possibility = (decimal * 100) + select; // number (0..103499)

	  var output = '';

	  // Get  base47 value by successively dividing by 47,
	  // taking the remainder as a digit, and using the quotient
	  // for the next division
	  for(var i = 0; i < 3; i++) {
	    var quotient = Math.floor(possibility/47);
	    var remainder = possibility - (quotient * 47);
	    possibility = quotient;
	    output += chars[remainder];
	  }

	  return output;
	} // encode(value)

	function decode(value) {
	  var possibility = 0;

	  // Loop through base47 string, beginning from the end
	  // Recombine the base 47 digits by successively multiplying by 47
	  for(var i = value.length - 1; i >= 0; i--) {
	    var item = value[i];
	    var remainder = chars.indexOf(value[i]);

	    possibility = (possibility * 47) + remainder;
	  }

	  // Convert number to string
	  possibility = possibility.toString();

	  //  Fill numbers < 3 digits with leading zeros
	  while(possibility.length < 3) { possibility = '0' + possibility; }

	  // Get toggles and select values from string
	  var toggles = possibility.slice(0, possibility.length - 2);
	  var select = possibility.slice(possibility.length - 2);

	  // Convert toggles string to binary string and add leading zeros
	  var binary = parseInt(toggles, 10).toString(2);
	  while(binary.length < 10) { binary = '0' + binary; }

	  // Return binary toggle values, followed by the select values
	  return binary + select;
	} // decode(value)
