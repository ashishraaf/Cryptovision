/* global bag, $, ws*/
/* global escapeHtml, toTitleCase, formatDate, known_companies, transfer_marble, record_company, show_tx_step, refreshHomePanel, auditingMarble*/
/* exported build_marble, record_company, build_user_panels, build_company_panel, build_notification, populate_users_marbles*/
/* exported build_a_tx, marbles */

var marbles = {};

// =================================================================================
//	UI Building
// =================================================================================
//build a marble
function build_marble(marble) {
	var html = '';
	var colorClass = '';
	var size = 'largeMarble';
	var auditing = '';
	var colorVal = '';
	var usrexits;
	//var FileName = Fname;

	marbles[marble.id] = marble;
	colorVal = escapeHtml(marble.color);
//FileName = escapeHtml(marble.owner.company);
	// var array = colorVal.split('||');
	// fileNameVal = array[0];
var fileval = colorVal.split("/");
// => "Tabs1"
//var lastChar = id.substr(id.length - 3);
	marble.id = escapeHtml(marble.id);
	marble.color = escapeHtml(marble.color);
	marble.owner.id = escapeHtml(marble.owner.id);
	marble.owner.username = escapeHtml(marble.owner.username);
	marble.owner.company = escapeHtml(marble.owner.company);

	var full_owner = escapeHtml(marble.owner.username.toLowerCase() + '.' + marble.owner.company);

	console.log('[ui] building marble: ', marble.color, full_owner, marble.id.substring(0, 4) + '...');
	if (marble.size == 16) size = 'smallMarble';
	var id = fileval[1];
	//var valueoftext = id.substr(id.length - 3);

	if(id.substr(id.length - 3) == 'txt'){
		if (marble.color) colorClass = 'green' + 'bg';
	}
	else if (id.substr(id.length - 4) == 'docx') {
		if (marble.color) colorClass = 'blue' + 'bg';
	}
	else if (id.substr(id.length - 3) == 'pdf') {
		if (marble.color) colorClass = 'red' + 'bg';
	} else if (id.substr(id.length - 3) == 'jpg') {
	if (marble.color) colorClass = 'yellow' + 'bg';
	} else if(id.substr(id.length - 3) == 'png'){
		if (marble.color) colorClass = 'pink' + 'bg';
	}else{
		if (marble.color) colorClass = 'black' + 'bg';
	}

	//if (marble.color) colorClass = 'white' + 'bg';

	if (auditingMarble && marble.id === auditingMarble.id) auditing = 'auditingMarble';

	html += '<br>' + '<span id="' + marble.id + '" class="ball ' + size + ' ' + colorClass + ' ' + auditing + ' title="' + marble.id + '"';
	html += ' username="' + marble.owner.username + '" company="' + marble.owner.company + '" owner_id="' + marble.owner.id + '"innerHTML="' + colorVal + '">&nbsp;&nbsp </span>'+fileval[1]+'';

	$('.marblesWrap[owner_id="' + marble.owner.id + '"]').find('.innerMarbleWrap').prepend(html);
	$('.marblesWrap[owner_id="' + marble.owner.id + '"]').find('.noMarblesMsg').hide();
	return html;
}

//redraw the user's marbles
function populate_users_marbles(msg) {

	//reset
	console.log('[ui] clearing marbles for user ' + msg.owner_id);
	$('.marblesWrap[owner_id="' + msg.owner_id + '"]').find('.innerMarbleWrap').html('<i class="fa fa-plus addMarble"></i>');
	$('.marblesWrap[owner_id="' + msg.owner_id + '"]').find('.noMarblesMsg').show();

	for (var i in msg.marbles) {
		build_marble(msg.marbles[i]);
	}
}

//crayp resize - dsh to do, dynamic one
function size_user_name(name) {
	var style = '';
	if (name.length >= 10) style = 'font-size: 22px;';
	if (name.length >= 15) style = 'font-size: 18px;';
	if (name.length >= 20) style = 'font-size: 15px;';
	if (name.length >= 25) style = 'font-size: 11px;';
	return style;
}

//build all user panels
function build_user_panels(data) {

	//reset
	console.log('[ui] clearing all user panels');
	$('.ownerWrap').html('');
	for (var x in known_companies) {
		known_companies[x].count = 0;
		known_companies[x].visible = 0;							//reset visible counts
	}
	var url_string = "http://www.example.com/t.html?a=1&b=3&c=m2-m3-m4-m5"; //window.location.href
var url = new URL(url_string);
	var c = url.searchParams.get("c");
//for (var i in data) {
//	if (escapeHtml(data[i].username) = Loginusr)
//	{
//		usrexits = escapeHtml(data[i].username);
//	}
//}
//if (usrexits === "")
//{
//	document.getElementById('userField').innerHTML="usrexits";
//}
	for (var i in data) {
		var html = '';
		var colorClass = '';
		data[i].id = escapeHtml(data[i].id);
		data[i].username = escapeHtml(data[i].username);
		data[i].company = escapeHtml(data[i].company);
		record_company(data[i].company);
		known_companies[data[i].company].count++;
		known_companies[data[i].company].visible++;

		console.log('[ui] building owner panel ' + data[i].id);

		let disableHtml = '';
		if (data[i].company  === escapeHtml(bag.marble_company)) {
			disableHtml = '<span class="fa fa-trash disableOwner" title="Disable Owner"></span>';
		}
		if (data[i].username === 'n3991925')
		{
		html += `<div id="user` + i + `wrap" username="` + data[i].username + `" company="` + data[i].company +
			`" owner_id="` + data[i].id + `" class="marblesWrap ` + colorClass + `"  >
					<div class="legend" style="` + size_user_name(data[i].username) + `">
						` + toTitleCase(data[i].username) + `
						<span class="fa fa-thumb-tack marblesFix" title="Never Hide Owner"></span>
						` + disableHtml + `
					</div>
					<div class="innerMarbleWrap"><i class="fa fa-plus addMarble"></i></div>
					<div class="noMarblesMsg hint">lost all marbles</div>
					<div><div class="wrapper"><input type="file" id="uploadfile" style="visibility:hidden" onchange="fileSelected(this)"/></div></div>
				</div>`;
}
else {
	html += `<div id="user` + i + `wrap" username="` + data[i].username + `" company="` + data[i].company +
		`" owner_id="` + data[i].id + `" class="marblesWrap ` + colorClass + `" >
				<div class="legend" style="` + size_user_name(data[i].username) + `">
					` + toTitleCase(data[i].username) + `
					<span class="fa fa-thumb-tack marblesFix" title="Never Hide Owner"></span>
					` + disableHtml + `
				</div>
				<div class="innerMarbleWrap"><i class="fa fa-plus addMarble"></i></div>
				<div class="noMarblesMsg hint">lost all marbles</div><div><div class="wrapper"><input type="file" id="uploadfile" style="visibility:hidden" onchange="fileSelected(this)"/></div></div>
			</div>`;
}
		$('.companyPanel[company="' + data[i].company + '"]').find('.ownerWrap').append(html);
		$('.companyPanel[company="' + data[i].company + '"]').find('.companyVisible').html(known_companies[data[i].company].visible);
		$('.companyPanel[company="' + data[i].company + '"]').find('.companyCount').html(known_companies[data[i].company].count);
	}

	//drag and drop marble
		$('.innerMarbleWrap').sortable({ connectWith: '.innerMarbleWrap', items: 'span' }).disableSelection();
	$('.innerMarbleWrap').droppable({
		drop:
		function (event, ui) {
			var marble_id = $(ui.draggable).attr('id');

			//  ------------ Delete Marble ------------ //
			if ($(event.target).attr('id') === 'trashbin') {
				console.log('removing marble', marble_id);
				show_tx_step({ state: 'building_proposal' }, function () {
					var obj = {
						type: 'delete_marble',
						id: marble_id,
						v: 1
					};
					ws.send(JSON.stringify(obj));
					$(ui.draggable).addClass('invalid bounce');
					refreshHomePanel();
				});
			}

			//  ------------ Transfer Marble ------------ //
			else {
				var dragged_owner_id = $(ui.draggable).attr('owner_id');

				var dropped_owner_id = $(event.target).parents('.marblesWrap').attr('owner_id');

				console.log('dropped a marble', dragged_owner_id, dropped_owner_id);
				if (dragged_owner_id != dropped_owner_id) {										//only transfer marbles that changed owners
					$(ui.draggable).addClass('invalid bounce');
					transfer_marble(marble_id, dropped_owner_id);
					return true;

				}
			}
	}
	});

	//user count
	$('#foundUsers').html(data.length);
	$('#totalUsers').html(data.length);
}

function myLogin()
{
Loginusr = document.getElementById("usrname").value

}

//build company wrap
function build_company_panel(company) {
	company = escapeHtml(company);
	console.log('[ui] building company panel ' + company);

	var mycss = '';
	if (company === escapeHtml(bag.marble_company)) mycss = 'myCompany';

	var html = `<div class="companyPanel" company="` + company + `">
					<div class="companyNameWrap ` + mycss + `">
					<span class="companyName">` + company + `&nbsp;-&nbsp;</span>
					<span class="companyVisible">0</span>/<span class="companyCount">0</span>`;
	if (company === escapeHtml(bag.marble_company)) {
		html += '<span class="fa fa-exchange floatRight"></span>';
	} else {
		html += '<span class="fa fa-long-arrow-left floatRight"></span>';
	}
	html += `	</div>
				<div class="ownerWrap"></div>
			</div>`;
	$('#allUserPanelsWrap').append(html);
}

//build a notification msg, `error` is boolean
function build_notification(error, msg) {
	var html = '';
	var css = '';
	var iconClass = 'fa-check';
	if (error) {
		css = 'warningNotice';
		iconClass = 'fa-minus-circle';
	}

	html += `<div class="notificationWrap ` + css + `">
				<span class="fa ` + iconClass + ` notificationIcon"></span>
				<span class="noticeTime">` + formatDate(Date.now(), `%M/%d %I:%m:%s`) + `&nbsp;&nbsp;</span>
				<span>` + escapeHtml(msg) + `</span>
				<span class="fa fa-close closeNotification"></span>
			</div>`;
	return html;
}


//build a tx history div
function build_a_tx(data, pos) {
	var html = '';
	var username = '-';
	var company = '-';
	var FileName = '-';
	var id = '-';
	if (data && data.value && data.value.owner && data.value.owner.username) {
		username = data.value.owner.username;
		company = data.value.owner.company;
		id = data.value.owner.id;
		var colorVal = data.value.color;
		var fileval = colorVal.split("/");
		FileName = fileval[1];
	}

	html += `<div class="txDetails">
				<div class="txCount">TX ` + (Number(pos) + 1) + `</div>
				<p>
					<div class="marbleLegend">Transaction: </div>
					<div class="marbleName txId">` + data.txId.substring(0, 14) + `...</div>
				</p>
				<p>
					<div class="marbleLegend">Owner: </div>
					<div class="marbleName">` + username + `</div>
				</p>
				<p>
					<div class="marbleLegend">Company: </div>
					<div class="marbleName">` + company + `</div>
				</p>
				<p>
					<div class="marbleLegend">Ower Id: </div>
					<div class="marbleName">` + id + `</div>
				</p>
				<p>
					<div class="marbleLegend">FileName: </div>
					<div class="marbleName">` + FileName + `</div>
				</p>
			</div>`;
	return html;
}
