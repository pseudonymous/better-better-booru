// ==UserScript==
// @name           better_better_booru
// @author         otani, modified by Jawertae, A Pseudonymous Coder & Moebius Strip.
// @description    Several changes to make Danbooru much better. Including the viewing of loli/shota images on non-upgraded accounts. Modified to support arrow navigation on pools, improved loli/shota display controls, and more.
// @include        http://*.donmai.us/*
// @include        http://donmai.us/*
// @include        http://*e621.net/*
// @exclude        http://trac.donmai.us/*
// @grant          none
// ==/UserScript==

// Have a nice day. - A Pseudonymous Coder

/* True or false settings */
// Global
var show_loli = true;
var show_shota = true;
var fix_links = true; // Also removes all the junk after the post ID in the URL. Automatically set if the above are true.

var hide_upgrade_message = true;
var hide_advertisements = true;
var hide_statusnotice = false;

// Popular
var enable_popular_by = true; // Enable popular by week and popular by month links on the post subnavbar.

// Search
var enable_arrow_nav = true; // Allow the use of the left and right keys to navigate post/pool index pages. Doesn't work when input has focus.
var add_border = true; // Add a light blue border to Shota and pink border to Loli.
var search_add = true; // Add the + and - shortcuts to the tag list for including or excluding search terms.
var thumbnail_count = 0; // Number of thumbnails to display per page. Use a number value of 0 to turn off.

// Post
var hide_comment_message = true;
var sample_resize = true; // When you click an image, it switches between the sample and full image.
var image_resize = false; // When initially loading, scale down large images to fit the browser window as needed.
var load_sample_first = true; // Use sample images when available.
var change_loli_shota_only = false; // Only posts tagged with loli or shota will have their images and notes changed.
var enable_favorited_by = true; // Display the list of users that have added the post to their favorites.

// Set Border Colors. Use CSS hex values for colors. http://www.w3schools.com/CSS/css_colors.asp
var loli_border = "#FFC0CB";
var shota_border = "#66CCFF";
var child_border = "#CCCC00";
var parent_border = "#00FF00";
var pending_border = "#0000FF";
var flagged_border = "#FF0000";

// Blacklist
// Guidelines: Matches can consist of a single tag or multiple tags. Each match must be separated by a comma and each tag in a match
// must be separated by a space. The whole blacklist must remain inside of quotation marks. Using empty quotation marks will disable
// the blacklist. When logged in and as long as it is not blank, your account blacklist will override this blacklist.
// Example: To filter posts tagged with spoilers and posts tagged with blood AND death, the blacklist would normally look like the
// following case: "spoilers, blood death"
var script_blacklisted_tags = "";

// List of valid URL's to parse for. Feel free to suggest more!
var valid_urls = [
	"http://danbooru.donmai.us/",
	"http://testbooru.donmai.us/",
	"http://hijiribe.donmai.us/",
	"http://sonohara.donmai.us/",
	"http://testbooru.donmau.us"
];


/********************************/
/* Don't touch below this line! */
/********************************/


var myImg = {}; // Image related global variables
var myNotes = {}; // Note related global variables

if (fix_links || show_loli || show_shota) {
	var url = location.href;
	url = url.replace("http://", "");
	url = url.substring(url.indexOf("/"));

	if (url.length > 1) {
		if (/post\/show/.test(location.href)) {
			if (checkUrls())
				searchPost();
		}
		else if (/post\/popular_by_/.test(location.href))
			searchPopular();
		else if (/pool\/show/.test(location.href))
			searchPool();
		else if (/\.\w+\/(comment|note)/.test(location.href))
			filterOther();
		else if (/\/post\/?(index)?(\?|$)/.test(location.href))
			searchImages();
	}
}

if (hide_upgrade_message)
	hideUpgradeMessage();

if (hide_advertisements) {
	hideAdvertisements();
	hideYourAdHere();
	hideIframes();
	hideEtology();
}

if (hide_statusnotice)
	hideStatusNotice();

if (enable_popular_by && /post\/popular_by/.test(location.href))
	enablePopularBy();

// Focus tag field automatically.
//if (location.pathname == "/")
//	document.getElementById("tags").focus();

if (/post|pool/.test(location.href) || location.pathname == "/") {
	// Turns off arrow nav if an input box or textarea has focus.
	checkFocus();
	window.addEventListener("keydown", keyCheck, false);
}

if (search_add && /post/.test(location.href))
	searchAdd();

if (/user\/home/.test(location.href))
	searchSettings();

if (hide_comment_message)
	hideCommentMessage();

/* Functions */

/* Functions for creating a url and retrieving info it */
function searchImages() {
	var url = location.href.replace(/\/post\/?(index)?\??/, "/post/index.json?");

	if (allowUserLimit() && !/page=|limit=/.test(location.href))
		url += "&limit=" + thumbnail_count;

	fetchJSON(url, "search");
}

function searchPool() {
	var url = location.href.replace(/\/pool\/show\/(\d+)\??/, "/pool/show.json?id=$1&");
	fetchJSON(url, "pool");
}

function searchPopular() {
	var url = location.href.replace(/\/post\/popular_by_(\w+)/, "/post/popular_by_$1.json");
	fetchJSON(url, "popular");
}

function searchPost() {
	var url = location.href.replace(/\/post\/show\/(\d+).*/, "/post/index.json?tags=status:any+id:$1");
	fetchJSON(url, "post");
}

function searchNotes() {
	var url = location.href.replace(/\/post\/show\/(\d+).*/, "/note/index.json?post_id=$1");
	fetchJSON(url, "notes");
}

function searchSettings() {
	if (!getCookie()["login"]) {
		var where = document.evaluate('//div[@id="user-index"]/ul', document, null, 9, null).singleNodeValue;

		if (where) {
			var eraselist = document.createElement("li");

			eraselist.innerHTML = '<a href="#" id="erasesettings">&#187; Erase BBB Saved Account Settings</a>';
			where.appendChild(eraselist);
			document.getElementById("erasesettings").addEventListener("click", function(event) {
				if (getCookie()["bbb_load_sample"] || getCookie()["bbb_image_resize"] || getCookie()["bbb_session"]) {
					createCookie("bbb_image_resize", "", -1);
					createCookie("bbb_load_sample", "", -1);
					createCookie("bbb_session", "", -1);
					noticeMessage("Saved account settings erased");
				}
				else
					noticeMessage("No saved account settings detected");

				event.preventDefault();
			}, false);
		}
	}
	else
		fetchData("settings", "/user/edit");
}

function fetchJSON(url, mode) {
	// Retrieve JSON.
	var xmlhttp = new XMLHttpRequest();

	if (xmlhttp !== null) {
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4) { // 4 = "loaded"
				if (xmlhttp.status == 200) { // 200 = "OK"
					xml = JSON.parse(xmlhttp.responseText);

					if (mode == "search" || mode == "pool" || mode == "popular")
						parseListing(xml, mode);
					else if (mode == "notes")
						parseNotes(xml);
					else if (mode == "post")
						parsePost(xml);
					else if (mode == "postfavs")
						parseFavoritedBy(xml.favorited_users.split(","));
				}
//				else // Debug
//					GM_log(xmlhttp.statusText);
			}
		};
		xmlhttp.open("GET", url, true);
		xmlhttp.send(null);
	}
}

function fetchData(mode, url, argthree) {
	// Retrieve XML.
	var xmlhttp = new XMLHttpRequest();

	if (xmlhttp !== null) {
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4) { // 4 = "loaded"
				if (xmlhttp.status == 200) { // 200 = "OK"

					if (mode == "pages") {
						xml = new DOMParser();
						xml = xml.parseFromString(xmlhttp.responseText, "text/xml");

						paginator(xml.getElementsByTagName("posts")[0].getAttribute("count"), argthree);
					}
					else if (mode == "settings") {
						var settings = /user_always_resize_images[\S\s]+<\/\s*form\s*>/.exec(xmlhttp.responseText);

						if (settings) {
							var danb_resize_image = /<input([^>]+checked[^>]+user_always_resize_images|[^>]+user_always_resize_images[^>]+checked)/.test(settings);
							var danb_show_samp = /<input([^>]+checked[^>]+user_show_samples|[^>]+user_show_samples[^>]+checked)/.test(settings);

							createCookie("bbb_image_resize", danb_resize_image, 1);
							createCookie("bbb_load_sample", danb_show_samp, 1);
							createCookie("bbb_session", "true");
						}
					}
				}
			}
		};
		xmlhttp.open("GET", url, true);
		xmlhttp.send(null);
	}
}

/* Functions for creating content from retrieved info */
function parseListing(xml, mode) {
	// Use JSON results for searches and pool collections.
	if (mode == "search") {
		var imgdiv = '//div[@class="content"]/div[last()-1]';
		var posts = xml;
	}
	else if (mode == "pool") {
		var imgdiv = '//div[@id="content"]/div[last()-1]/div[last()]';
		var posts = xml.posts;
	}
	else {
		var imgdiv = '//div[@id="post-popular"]/div[last()]';
		var posts = xml;
	}

	var where = document.evaluate(imgdiv, document, null, 9, null).singleNodeValue;
	var out = "";

	// Blacklist preparation.
	var blacklistedposts = [];
	var blacklist = blacklistInit();

	// Result preparation.
	for (var i = 0, pl = posts.length; i < pl; i++) {
		var post = posts[i];
		var url = post.id;
		var imgid = url;
		var style = "";
		var spanstyle = "";
		var tags = post.tags  + " rating:" + post.rating;
		var alt = tags + " score:" + post.score + " user:" + post.author;
		var fileurl = post.file_url;
		var extension = fileurl.substring(fileurl.lastIndexOf(".") + 1);
		var thumbnailurl = post.preview_url;

		// Don't display loli/shota if the user has opted so and skip to the next image.
		if (!show_loli && /\bloli\b/.test(tags))
			continue;
		if (!show_shota && /\bshota\b/.test(tags))
			continue;

		// Blacklist test.
		if (isBlacklisted(blacklist, tags)) {
			blacklistedposts.push( {id: imgid, tags: tags} );
			spanstyle = ' style="display: none;"';
			thumbnailurl = "/blacklisted-preview.png";
		}

		// Apply appropriate thumbnail borders. Borders override each other in this order: Loli > Shota > Flagged > Pending > Child > Parent
		if (add_border) {
			if (/\bloli\b/.test(tags))
				style = "border: 3px solid " + loli_border + ";";
			else if (/\bshota\b/.test(tags))
				style = "border: 3px solid " + shota_border + ";";
		}

		if (style === "") {
			if (post.status == "flagged")
				style = "border: 3px solid " + flagged_border + ";";
			else if (post.status == "pending")
				style = "border: 3px solid " + pending_border + ";";
			else if (post.parent_id !== null)
				style = "border: 3px solid " + child_border + ";";
			else if (post.has_children)
				style = "border: 3px solid " + parent_border + ";";
		}

		// Get swf details from results. Correct file, height, and width.
		if (extension == "swf")
			url += "?swf=" + post.md5 + "&height=" + post.height + "&width=" + post.width;

		// eek, huge line.
		if (mode == "search") {
			out += '<span class="thumb" id="p' + imgid + '"' + spanstyle + '><a href="/post/show/' +
				url + '" onclick="return PostModeMenu.click(' + imgid + ')">' +
				'<img src="' + post.preview_url + '" alt="' + alt + '" title="' + alt + '" style="' +
				style + '"/></a><a style="display: none;" href="' + fileurl + '">Direct Download</a></span>';
			var lastimgid = imgid;
		}
		else {
			out += '<span class="thumb" id="p' + imgid + '"> <a href="/post/show/' +
				url + '">' + '<img  class="preview" src="' + thumbnailurl +
				'" title="' + alt + '" alt="' + alt + '" style="' + style +
				'"/></a><a style="display: none;" href="' + fileurl + '">Direct Download</a></span>';
		}
	}

	// Replace results with new results.
	where.innerHTML = out;

	// Fix the page numbers for first page.
	if (allowUserLimit()) {
		if (!/page=|limit=|before_id=/.test(location.href))
			fetchData("pages", location.href.replace(/\/post\/?(index)?/, "/post/index.xml"), lastimgid);
		else if (/page=1000|before_id=/.test(location.href))
			paginator(null, lastimgid);
	}

	// Fix the blacklist menu in the sidebar.
	blacklistBarInit(blacklist, blacklistedposts);
}

function parsePost(xml) {
	var paragraph = document.evaluate('//div[@id="right-col"]/div[2]', document, null, 9, null).singleNodeValue;
	myImg = xml[0];

	// Make sure the stored account settings are up to date.
	if (getCookie()["login"] && !getCookie()["bbb_session"])
		fetchData("settings", "/user/edit");

	if (myImg.id) {
		// Use JSON info to modify the page.
		myImg.no_sample = (myImg.file_url == myImg.sample_url ? true : false);
		myImg.extension = myImg.file_url.substring(myImg.file_url.lastIndexOf(".") + 1);

		if (!change_loli_shota_only || /\b(loli|shota)\b/.test(myImg.tags) || myImg.status == "deleted") {
			if (myImg.extension == "swf") {
				// Create flash file.
				paragraph.innerHTML = '<embed src="' + myImg.file_url + '" width="' + myImg.width +
					'px" height="' + myImg.height + 'px"></embed><p><br/><a href="' + myImg.file_url +
					'">Save this flash (right click and save)</a></p>';
			}
			else if (/download-preview\.png$/.test(myImg.preview_url)) {
				// Create manual download.
				paragraph.innerHTML = '<h2><a href="' + myImg.file_url + '">Download</a></h2>' +
					'<p>You must download this file manually.</p>';
			}
			else {
				// Create image.
				if (checkSetting("bbb_load_sample", load_sample_first) && !myImg.no_sample)
					paragraph.innerHTML = '<img id="better_danbooru" src="' + myImg.sample_url + '"/>';
				else
					paragraph.innerHTML = '<img id="better_danbooru" src="' + myImg.file_url + '"/>';

				var imgreplaced = true;
  			}
		}
	}
	else {
		// Use info in the page to modify the page.
		if (/swf/.test(location.href)) {
			// Fetch swf info from url, create flash, and stop.
			paragraph.innerHTML = '<embed src="../../data/' + getVar("swf") +
				'.swf" width="' + getVar("width") + 'px" height="' + getVar("height") +
				'px"></embed><p><br/><a href="../../data/' + getVar("swf") +
				'.swf">Save this flash (right click and save)</a></p>';
			return;
		}
		else {
			// Fetch full image from highres link and create image.
			var highres = document.getElementById("highres");

			if (highres && highres.href) {
				myImg = {
					file_url: highres.href,
					sample_url: highres.href.replace("/data/", "/data/sample/sample-").replace(/\..{3,4}$/, ".jpg"),
					id: /\d+/.exec(location.href),
					width: parseInt(/^(\d+)x/.exec(highres.innerHTML)[1], 10),
					height: parseInt(/x(\d+)/.exec(highres.innerHTML)[1], 10)
				};

				var xmlnodomainfix = myImg.sample_url.substring(myImg.sample_url.lastIndexOf("data") - 1);

				if (!isThere(xmlnodomainfix)) {
					paragraph.innerHTML = '<img id="better_danbooru" src="' + myImg.file_url + '"/>';

					myImg.no_sample = true;
					myImg.sample_url = myImg.file_url;
				}
				else {
					if (checkSetting("bbb_load_sample", load_sample_first))
						paragraph.innerHTML = '<img id="better_danbooru" src="' + myImg.sample_url + '"/>';
					else
						paragraph.innerHTML = '<img id="better_danbooru" src="' + myImg.file_url + '"/>';

					myImg.no_sample = false;
				}

				var imgreplaced = true;
			}
		}
	}

	// Insert "Favorited by" list.
	if (enable_favorited_by)
		fetchJSON(location.href.replace(/\/post\/show\/(\d+).*/, "/favorite/list_users.json?id=$1"), "postfavs");

	// Check if the script took action and made an actual image.
	if (imgreplaced) {
		myImg.img = document.getElementById("better_danbooru");

		// Initialize notes.
		myNotes = {
			status: "block",
			notecount: 0,
			newnotecount: 0,
			notes: [],
			edit: {
				mode: "off"
			}
		};

		// Create the note container.
		var container = myNotes.container = document.createElement("div");
		container.id = "bbb-container";
		container.style.position = "absolute";
		container.innerHTML = "<style> div.bbb-body {background: #FFE; border: 1px solid black; display: none; z-index: 10; position: absolute; padding: 5px; overflow: auto; max-width: 400px; cursor: pointer;} p.tn {font-size: 0.8em; color: gray;} div.bbb-box {position: absolute; border: 1px solid black; background: #FFE; display: block; opacity: 0.5; cursor: move;} div.bbb-corner {background: black; width: 7px; height: 7px; position: absolute; bottom:0; right: 0; cursor: se-resize;} div.unsaved {background: #FFF; border: 1px solid red; z-index: 11;} div.unsaved > div.bbb-corner{background: red;} </style>";
		paragraph.insertBefore(container, paragraph.firstChild);

		// Add any existing notes upon loading.
		myImg.img.addEventListener("load", searchNotes, false);

		// Add toggle notes option to options menu.
		var optionsmenu = document.evaluate('//div[@class="sidebar"]/div[last()-2]/ul', document, null, 9, null).singleNodeValue;
		var listnotetoggle = document.createElement("li");

		listnotetoggle.innerHTML = '<a href="#" id="listnotetoggle">Toggle notes</a>';
		optionsmenu.insertBefore(listnotetoggle, optionsmenu.children[1]);
		document.getElementById("listnotetoggle").addEventListener("click", function(event) { noteToggle(); event.preventDefault(); }, false);

		// Fix add translation menu option.
		var addtransmenuoption = document.evaluate('//div[@class="sidebar"]//a[starts-with(@onclick, "Note.create")]', document, null, 9, null).singleNodeValue;

		if (addtransmenuoption) {
			addtransmenuoption.removeAttribute("onclick");
			addtransmenuoption.addEventListener("click", function(event) { noteEditNew(); event.preventDefault(); }, false);
		}

		// Enable sample/original image swapping.
		if (sample_resize && !myImg.no_sample)
			myImg.img.addEventListener("click", function() { swapImage(this); }, false);

		// Enable image resizing and fix the resize menu option.
		var resizemenuoption = document.evaluate('//div[@class="sidebar"]//a[starts-with(@onclick, "Post.resize")]', document, null, 9, null).singleNodeValue;

		if (resizemenuoption) {
			if (checkSetting("bbb_image_resize", image_resize))
				imageResize("load");

			resizemenuoption.removeAttribute("onclick");
			resizemenuoption.addEventListener("click", function(event) { imageResize(); noteResize(); event.preventDefault(); }, false);
		}

		// Fix resized notice links.
		var resizednotice = document.getElementById("resized_notice");

		if (resizednotice) {
			var vieworiginal = document.evaluate('.//a[starts-with(@onclick, "Post.highres")]', resizednotice, null, 9, null).singleNodeValue;
			var alwaysvieworiginal = document.evaluate('.//a[starts-with(@onclick, "User.disable_samples")]', resizednotice, null, 9, null).singleNodeValue;

			if (vieworiginal) {
				vieworiginal.removeAttribute("onclick");
				vieworiginal.addEventListener("click", function(event) {
					if (myImg.img.src != myImg.file_url)
						swapImage(myImg.img);

					this.parentNode.style.display = "none";
					event.preventDefault();
				}, false);
			}

			if (alwaysvieworiginal) {
				alwaysvieworiginal.addEventListener("click", function(event) {
					if (myImg.img.src != myImg.file_url)
						swapImage(myImg.img);

					createCookie("bbb_load_sample", "false", 1);
					event.preventDefault();
				}, false);
			}
		}
	}

	// Allow tags to be edited.
	document.getElementById("post_tags").disabled = false;
}

function parseNotes(xml) {
	myImg.ratio = myImg.img.clientWidth / myImg.width;
	myNotes.notes = xml;

	for (var i = 0, newnote; newnote = myNotes.notes[i]; i++) {
		if (!newnote.is_active) {
			myNotes.notes.splice(i--, 1);
			continue;
		}

 		myNotes["n" + newnote.id] = newnote;
 		newnote.servercopy = noteEditCopy(newnote);

		noteEditCreate(newnote);
	}

	noteUpdateCount("init");

	myImg.img.removeEventListener("load", searchNotes, false);
	myImg.img.addEventListener("load", noteResize, false);
}

function parseFavoritedBy(favuserlist) {
	if (!favuserlist[0] || document.getElementById("favorited-by"))
		return;

	var statslist = document.evaluate('//div[@id="stats"]/ul', document, null, 9, null).singleNodeValue;

	if (statslist) {
  		var favuserbar = document.createElement("li");
  		var out = 'Favorited by:<span id="favbyblock" style="overflow: auto; max-height: 305px;"> <a href="/user?commit=Search&name=' + favuserlist[0] + '">'  + favuserlist[0] + '</a>';
  		var outhidden = "";
  		var numfavusers = favuserlist.length;

  		for (var i = 1; i < numfavusers; i++) {
	  		if (i < 6)
		  		out += ', <a href="/user?commit=Search&name=' + favuserlist[i] + '">'  + favuserlist[i] + '</a>';
		  	else
				outhidden += ', <a href="/user?commit=Search&name=' + favuserlist[i] + '">'  + favuserlist[i] + '</a>';
  		}

		if (outhidden !== "") {
			outhidden = '<span style="display: none;" id="hiddenfav">' + outhidden +
				'</span> <span>(<a href ="#" id="favtoggle">' + (numfavusers - 6) + ' more</a>)</span>';
		}

  		favuserbar.innerHTML = out + outhidden;
  		statslist.appendChild(favuserbar);

  		if (document.getElementById("favtoggle")) {
	  		document.getElementById("favtoggle").addEventListener("click", function(event) {
		  		var favbyblock = document.getElementById("favbyblock");

		  		this.parentNode.style.display = "none";
		  		favbyblock.style.display = "block";
				document.getElementById("hiddenfav").style.display = "";

				if (favbyblock.offsetHeight < 305)
					favbyblock.style.display = "";

				event.preventDefault();
	  		}, false);
  		}
	}
}

function paginator(postcount, lastimgid) {
	var pageindex = document.getElementById("paginator");

	if (pageindex) {
		if (postcount === null) {
			// Modify pages using "next" and "previous" links.
			var nextpage = pageindex.getElementsByTagName("a")[1];
			var limit = "&limit=" + (/limit=/.test(location.href) ? getVar("limit") : thumbnail_count);

			nextpage.href = nextpage.href.replace(/before_id=\d+/, "before_id=" + lastimgid) + limit;
		}
		else {
			// Modify pages using page numbers.
			var pages = Math.ceil(parseInt(postcount, 10) / thumbnail_count);

			if (pages < 2) {
				pageindex.innerHTML = "";
			}
			else {
				var newpages = "";
				var newurl = location.href.replace(/.+\/post\/?(index)?\??/, "/post/index?") + "&limit=" + thumbnail_count + "&page=";
				var pageloop = (pages <= 5 ? pages : 5);

				for (var i = 2; i <= pageloop; i++) {
					newpages += '<a href="' + newurl + i + '">' + i + '</a> ';
				}

				if (pages > 999)
					newpages += '... <a href="' + newurl + '999">999</a> ' + (pages > 1000 ? '... ' : '') + '<a href="' + newurl + pages + '">' + pages + '</a> ';
				else if (pages > 7)
					newpages += '... <a href="' + newurl + pages + '">' + pages + '</a> ';
				else if (pages > 5) {
					newpages += '<a href="' + newurl + '6">6</a> ';
						if (pages > 6)
							newpages += '<a href="' + newurl + '7">7</a> ';
				}

				pageindex.innerHTML = '<div class="pagination"><span class="disabled">&lt;&lt;</span> <span class="current">1</span> ' +
					newpages + '<a href="' + newurl + '2">&gt;&gt;</a></div>';
			}
		}
	}
}

/* Functions for support, extra features, and content manipulation */
function swapImage(img) {
	var origsrc = img.src;

	img.src = "about:blank";

	var swaptimer = window.setTimeout( function() {
		myNotes.container.style.display = "none";

		if (origsrc == myImg.file_url)
			img.src = myImg.sample_url;
		else
			img.src = myImg.file_url;

		// Prevent stretching.
		img.removeAttribute("height");
		img.removeAttribute("width");
		img.style.maxWidth = "none";
	}, 50);
}

function imageResize(mode) {
	var availablewidth = document.getElementById("right-col").clientWidth;
	var img = myImg.img;

	if (mode == "load")
		img.style.maxWidth = availablewidth - 15 + "px";
	else {
		if (img.clientWidth > availablewidth)
			img.style.maxWidth = availablewidth - 15 + "px";
		else
			img.style.maxWidth = "none";
	}
}

function noteResize() {
	if (myImg.img.src == "about:blank")
		return;

	var ratio = myImg.ratio = myImg.img.clientWidth / myImg.width;
	var containerstyle = myNotes.container.style;

	containerstyle.display = "none";

	for (var i = 0, ml = myNotes.notes.length; i < ml; i++) {
		var note = myNotes.notes[i];

		if (!note.is_active)
			continue;

		var boxstyle = document.getElementById("b" + note.id).style;

		boxstyle.left = note.x * ratio + "px";
		boxstyle.top = note.y * ratio + "px";
		boxstyle.width = note.width * ratio + "px";
		boxstyle.height = note.height * ratio + "px";
	}

	containerstyle.display = myNotes.status;
}

function noteDisplay(text) {
	text.style.display = "block";

	var imgwidth = myImg.img.clientWidth;
	var origwidth = text.offsetWidth;
	var origheight = text.offsetHeight;
	var box = text.previousSibling;

	text.style.top = box.offsetTop + box.offsetHeight + 3 + "px";
	text.style.left = box.offsetLeft + "px";

	if (!text.style.minWidth && origwidth / origheight < 2) {
		// Calculate an ideal width and apply it.
		var newwidth = Math.sqrt(origheight * origwidth * 2);

		if (newwidth > 400)
			newwidth = 400;

		text.style.minWidth = newwidth + "px";

		// If the ratio hasn't been reached (usually due to a longer word), increase the width until it does or the max width gets close.
		while (text.offsetWidth / text.offsetHeight < 2 && newwidth < 391) {
			newwidth += 10;
			text.style.minWidth = newwidth + "px";
		}

		// Try to fix lines with one small word on them.
		var curheight = text.offsetHeight;
		var curwidth = newwidth;

		for (var i = 0; i < 5; i++) {
			if (text.offsetHeight < curheight || newwidth >= 400)
				break;

			newwidth += 5;
			text.style.minWidth = newwidth + "px";

			if (i == 4) {
				text.style.minWidth = curwidth + "px";
			}
		}

		// Decrease the width as much as possible without increasing the height or triggering scrollbars.
		curheight = text.offsetHeight;

		while (text.offsetHeight <= curheight && newwidth >= 3 && text.scrollWidth == text.clientWidth) {
			newwidth -= 3;
			text.style.minWidth = newwidth + "px";
		}

		text.style.minWidth = newwidth + 3 + "px";

		// Check if change decreased height and change back if not.
		if (text.offsetHeight >= origheight)
			text.style.minWidth = "0px";
	}

	// Check if text extends beyond image's side and correct it.
	if (text.offsetLeft + text.offsetWidth > imgwidth)
		text.style.left = text.offsetLeft - ((text.offsetLeft + text.offsetWidth) - imgwidth) + "px";
}

function noteToggle() {
	var containerstyle = myNotes.container.style;

	if (containerstyle.display != "none")
		containerstyle.display = myNotes.status = "none";
	else
		containerstyle.display = myNotes.status = "block";
}

function noteUpdateCount(mode) {
	// Add/update message about number of notes and second toggle notes link.
	if (mode == "init") {
		myNotes.notecount = myNotes.notes.length;

		if (myNotes.notes.length < 1)
			return;
	}
	else if (mode == "add")
		myNotes.notecount++;
	else if (mode == "remove")
		myNotes.notecount--;

	var notecountdiv = document.getElementById("note-count");

	if (notecountdiv && myNotes.notecount > -1) {
		notecountdiv.innerHTML = 'This post has <a href="/note/history?post_id=' + myImg.id + '">' +
			myNotes.notecount + ' note' + (myNotes.notecount != 1 ? "s" : "") + '</a> (<a href="#" id="notetoggle">Toggle notes</a>)';
		document.getElementById("notetoggle").addEventListener("click", function(event) { noteToggle(); event.preventDefault(); }, false);
	}
}

function disableEvent(event) {
	if (event && event.preventDefault())
		event.preventDefault();
	else
		return false;
}

function noteEditResizeOn(event) {
	var box = myNotes.edit.box = this.parentNode;
	myNotes.edit.note = myNotes["n" + box.id.substring(1)];

	box.nextSibling.style.display = "none";
	myNotes.edit.mode = "resize";
	myNotes.edit.origx = event.pageX;
	myNotes.edit.origy = event.pageY;
	myNotes.edit.origwidth = box.offsetWidth;
	myNotes.edit.origheight = box.offsetHeight;

	document.addEventListener("selectstart", disableEvent, false);
	document.addEventListener("mousemove", noteEditResize, false);
	document.addEventListener("mouseup", noteEditResizeOff, false);

	event.preventDefault();
	event.stopPropagation();
}

function noteEditResize(event) {
	var box = myNotes.edit.box;
	var boxleft = box.offsetLeft;
	var boxtop = box.offsetTop;
	var img = myImg.img;
	var imgheight = img.clientHeight;
	var imgwidth = img.clientWidth;
	var newheight = myNotes.edit.origheight + (event.pageY - myNotes.edit.origy);
	var newwidth = myNotes.edit.origwidth + (event.pageX - myNotes.edit.origx);

	if (newheight < 10)
		box.style.height = "10px";
	else if (boxtop + newheight > imgheight - 5)
		box.style.height = imgheight - boxtop - 5 + "px";
	else
		box.style.height = newheight + "px";

	if (newwidth < 10)
		box.style.width = "10px";
	else if (boxleft + newwidth > imgwidth - 5)
		box.style.width = imgwidth - boxleft - 5 + "px";
	else
		box.style.width = newwidth + "px";

	event.preventDefault();
	event.stopPropagation();
}

function noteEditResizeOff() {
	var note = myNotes.edit.note;
	var box = myNotes.edit.box;

	myNotes.edit.mode = "off";
	note.width = box.offsetWidth / myImg.ratio;
	note.height = box.offsetHeight / myImg.ratio;

	document.removeEventListener("selectstart", disableEvent, false);
	document.removeEventListener("mousemove", noteEditResize, false);
	document.removeEventListener("mouseup", noteEditResizeOff, false);
}

function noteEditMoveOn(event) {
	var box = myNotes.edit.box = this;
	myNotes.edit.note = myNotes["n" + box.id.substring(1)];

	box.nextSibling.style.display = "none";
	myNotes.edit.mode = "move";
	myNotes.edit.origx = event.pageX;
	myNotes.edit.origy = event.pageY;
	myNotes.edit.origleft = box.offsetLeft;
	myNotes.edit.origtop = box.offsetTop;

	document.addEventListener("selectstart", disableEvent, false);
	document.addEventListener("mousemove", noteEditMove, false);
	document.addEventListener("mouseup", noteEditMoveOff, false);

	event.preventDefault();
	event.stopPropagation();
}

function noteEditMove(event) {
	var box = myNotes.edit.box;
	var boxheight = box.clientHeight;
	var boxwidth = box.clientWidth;
	var img = myImg.img;
	var imgheight = img.clientHeight;
	var imgwidth = img.clientWidth;
	var newtop = myNotes.edit.origtop + (event.pageY - myNotes.edit.origy);
	var newleft = myNotes.edit.origleft + (event.pageX - myNotes.edit.origx);

	if (newtop < 5)
		box.style.top = "5px";
	else if (newtop + boxheight > imgheight - 5)
		box.style.top = imgheight - boxheight - 5 + "px";
	else
		box.style.top = newtop + "px";

	if (newleft < 5)
		box.style.left = "5px";
	else if (newleft + boxwidth > imgwidth - 5)
		box.style.left = imgwidth - boxwidth - 5 + "px";
	else
		box.style.left = newleft + "px";

	event.preventDefault();
	event.stopPropagation();
}

function noteEditMoveOff() {
	var note = myNotes.edit.note;
	var box = myNotes.edit.box;

	myNotes.edit.mode = "off";
	note.x = box.offsetLeft / myImg.ratio;
	note.y = box.offsetTop / myImg.ratio;

	noteDisplay(box.nextSibling);

	document.removeEventListener("selectstart", disableEvent, false);
	document.removeEventListener("mousemove", noteEditMove, false);
	document.removeEventListener("mouseup", noteEditMoveOff, false);
}

function noteEditbox() {
	if (document.getElementById("bbb-edit-box"))
		myNotes.container.removeChild(document.getElementById("bbb-edit-box"));

	// Create the edit-box and position it.
	var container = myNotes.container;
	var availablewidth = document.getElementById("right-col").offsetWidth;
	var horizscroll = window.pageXOffset;
	var availableheight = window.innerHeight;
	var vertoffset = myImg.img.offsetTop;
	var vertscroll = window.pageYOffset;

	var editbox = myNotes.editbox = document.createElement("div");
	editbox.id = "bbb-edit-box";
	editbox.setAttribute("style","position: absolute; z-index: 100; background: white; border: 1px solid black; padding: 12px;");
	editbox.innerHTML = '<form onsubmit="return false;" style="padding: 0pt; margin: 0pt;"><textarea rows="7" id="bbb-edit-box-text" style="width: 350px; margin: 2px 2px 12px;" onmousedown="event.stopPropagation();"></textarea><input value="Save" name="save" id="bbb-note-save" type="submit" onmousedown="event.stopPropagation();"><input value="Cancel" name="cancel" id="bbb-note-cancel" type="submit" onmousedown="event.stopPropagation();"><input value="Delete" name="remove" id="bbb-note-remove" type="submit" onmousedown="event.stopPropagation();"><input value="History" name="history" id="bbb-note-history" type="submit" onmousedown="event.stopPropagation();"></form>';
	editbox.addEventListener("mousedown", noteEditboxMoveOn, false);
	container.appendChild(editbox);
	editbox.style.left = availablewidth / 2 + horizscroll - editbox.offsetWidth / 2 + "px";
	editbox.style.top = availableheight / 2 - vertoffset + vertscroll - editbox.offsetHeight / 2 + "px";

	// Set up the edit-box form actions.
	var text = this;
	var box = text.previousSibling;
	var corner = box.firstChild;
	var noteid = text.id.substring(1);
	var note = myNotes["n" + noteid];
	var textarea = document.getElementById("bbb-edit-box-text");

	document.getElementById("bbb-note-save").addEventListener("click", function() {
		noteEditSave(textarea.value, note, box, text, corner);
	}, false);
	document.getElementById("bbb-note-cancel").addEventListener("click", function() {
		// Restore note to its last saved position and dimensions.
		var copy = note.servercopy;
		var ratio = myImg.ratio;

		note.x = copy.x;
		note.y = copy.y;
		note.width = copy.width;
		note.height = copy.height;

		box.style.left = note.x * ratio + "px";
		box.style.top = note.y * ratio + "px";
		box.style.height = note.height * ratio + "px";
		box.style.width = note.width * ratio + "px";

		container.removeChild(editbox);
	}, false);

	if (note.version) {
		document.getElementById("bbb-edit-box-text").value = note.body;
		document.getElementById("bbb-note-remove").addEventListener("click", function() {
			if (confirm("Do you really want to delete this note?"))
				noteEditDelete(note, box, text);
		}, false);
		document.getElementById("bbb-note-history").addEventListener("click", function() {
			window.location.pathname = "/note/history/" + noteid;
		}, false);
	}
	else {
		document.getElementById("bbb-note-remove").addEventListener("click", function() {
			if (confirm("Do you really want to delete this note?")) {
				note.is_active = false;

				container.removeChild(box);
				container.removeChild(text);
				container.removeChild(editbox);

				noticeMessage("Note removed");
			}
		}, false);
		document.getElementById("bbb-note-history").addEventListener("click", function() {
			noticeMessage("This note has no history");
		}, false);
	}

	textarea.focus();
	textarea.setSelectionRange(0,0);
}

function noteEditboxMoveOn(event) {
	var editbox = this;
	myNotes.edit.origx = event.pageX;
	myNotes.edit.origy = event.pageY;
	myNotes.edit.origleft = editbox.offsetLeft;
	myNotes.edit.origtop = editbox.offsetTop;

	document.addEventListener("selectstart", disableEvent, false);
	document.addEventListener("mousemove", noteEditboxMove, false);
	document.addEventListener("mouseup", noteEditboxMoveOff, false);

	event.preventDefault();
}

function noteEditboxMove(event) {
	var newtop = myNotes.edit.origtop + (event.pageY - myNotes.edit.origy);
	var newleft = myNotes.edit.origleft + (event.pageX - myNotes.edit.origx);
	var editbox = myNotes.editbox;

	editbox.style.top = newtop + "px";
	editbox.style.left = newleft + "px";

	event.preventDefault();
}

function noteEditboxMoveOff() {
	document.removeEventListener("selectstart", disableEvent, false);
	document.removeEventListener("mousemove", noteEditboxMove, false);
	document.removeEventListener("mouseup", noteEditboxMoveOff, false);
}

function noteEditNew() {
	var img = myImg.img;
	var imgwidth = myImg.width;
	var imgheight = myImg.height;
	var imgrect = img.getBoundingClientRect();
	var ratio = myImg.ratio = img.clientWidth / imgwidth;
	var limit = 5 / ratio;
	var noteleft = limit;
	var notetop = limit;
	var notewidth = (imgwidth < 160 ? imgwidth - 10 : 148);
	var noteheight = (imgheight < 160 ? imgheight - 10 : 148);

	if (imgrect.top < 0)
		notetop += Math.abs(imgrect.top) / ratio;

	if (notetop + noteheight > imgheight - limit)
		notetop = imgheight - noteheight - limit;

	if (imgrect.left < 0)
		noteleft += Math.abs(imgrect.left) / ratio;

	if (noteleft + notewidth > imgwidth - limit)
		noteleft = imgwidth - notewidth - limit;

	myNotes.newnotecount++;

	// Create new note object and add it to the notes array.
	var newnote = {
		id: "newnote" + myNotes.newnotecount,
		post_id: myImg.id,
		x: noteleft,
		y: notetop,
		width: notewidth,
		height: noteheight,
		version: 0,
		is_active: true
	};

	newnote.servercopy = noteEditCopy(newnote);
	var newlength = myNotes.notes.push(newnote);
	myNotes["n" + newnote.id] = myNotes.notes[--newlength];

	noteEditCreate(newnote);
}

function noteEditCreate(newnote) {
	// Create note elements and add them to the container.
	var container = myNotes.container;
	var ratio = myImg.ratio;

	var box = document.createElement("div");
	box.id = "b" + newnote.id;
	box.style.left = newnote.x * ratio + "px";
	box.style.top = newnote.y * ratio + "px";
	box.style.height = newnote.height * ratio + "px";
	box.style.width = newnote.width * ratio + "px";
	box.addEventListener("mousedown", noteEditMoveOn, false);
	box.addEventListener("mouseover", function() {
		if (myNotes.edit.mode != "off")
			return;

		myNotes.lasttext.style.display = "none";
		noteDisplay(this.nextSibling);
		window.clearTimeout(myNotes.timerID);
	}, false);
	box.addEventListener("mouseout", function() {
		var next = myNotes.lasttext = this.nextSibling;
		myNotes.timerID = window.setTimeout( function() { next.style.display = "none"; }, 200);
	}, false);

	var corner = document.createElement("div");
	corner.className = "bbb-corner";
	corner.id = "c" + newnote.id;
	corner.addEventListener("mousedown", noteEditResizeOn, false);

	var text = document.createElement("div");
	text.className = "bbb-body";
	text.id = "t" + newnote.id;
	text.title = "Click to edit";
	text.addEventListener("click", noteEditbox, false);
	text.addEventListener("mouseover", function() {
		if (myNotes.edit.mode != "off")
			return;

		window.clearTimeout(myNotes.timerID);
	}, false);
	text.addEventListener("mouseout", function() {
		var self = myNotes.lasttext = this;
		myNotes.timerID = window.setTimeout( function() { self.style.display = "none"; }, 200);
	}, false);

	// Handle new notes and existing notes differently.
	if (newnote.version) {
		box.className = "bbb-box";
		text.innerHTML = newnote.body.replace(/<tn>([\S\s]+?)<\/tn>/g, '<br><p class="tn">$1</p>').replace(/\n/g, '<br>');
	}
	else {
		box.className = "bbb-box unsaved";
		text.style.height = "75px";
		text.style.width = "75px";
	}

	box.appendChild(corner);
	container.appendChild(box);
	container.appendChild(text);

	if (text && !myNotes.lasttext)
		myNotes.lasttext = text;
}

function noteEditSave(body, note, box, text, corner) {
	var xmlhttp = new XMLHttpRequest();

	if (xmlhttp !== null) {
		var url = "/note/update.json?note[x]=" + note.x + "&note[y]=" + note.y + "&note[width]=" + note.width +
			"&note[height]=" + note.height + "&note[body]=" + encodeURIComponent(body);

		if (note.version)
			url += "&id=" + note.id;
		else
			url += "&note[post_id]=" + note.post_id;

		noticeMessage("Saving note...");

		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4) { // 4 = "loaded"
				if (xmlhttp.status == 200) { // 200 = "OK"
					xml = JSON.parse(xmlhttp.responseText);

					if (xml.success) {
						note.id = xml.new_id;
						note.body = body;
						note.servercopy = noteEditCopy(note);
						text.removeAttribute("style");
						text.innerHTML = xml.formatted_body;

						if (!note.version) {
							note.version = 1;
							box.id = "b" + note.id;
							box.className = "bbb-box";
							corner.id = "c" + note.id;
							text.id = "t" + note.id;
							myNotes["n" + note.id] = note;

							noteUpdateCount("add");
						}

						myNotes.container.removeChild(myNotes.editbox);
						noticeMessage("Note saved");
					}
					else
						noticeMessage("Error: " + xml.reason);
				}
				else
					noticeMessage("Access denied");
			}
		};
		xmlhttp.open("post", url, true);
		xmlhttp.send(null);
	}
}

function noteEditDelete(note, box, text) {
	var xmlhttp = new XMLHttpRequest();

	if (xmlhttp !== null) {
		var url = "/note/update.json?note[is_active]=0&id=" + note.id;

		noticeMessage("Removing note...");

		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4) { // 4 = "loaded"
				if (xmlhttp.status == 200) { // 200 = "OK"
					xml = JSON.parse(xmlhttp.responseText);

					if (xml.success) {
						var container = myNotes.container;
						note.is_active = false;

						container.removeChild(box);
						container.removeChild(text);
						container.removeChild(myNotes.editbox);

						noteUpdateCount("remove");
						noticeMessage("Note removed");
					}
					else
						noticeMessage("Error: " + xml.reason);
				}
				else
					noticeMessage("Access denied");
			}
		};
		xmlhttp.open("post", url, true);
		xmlhttp.send(null);
	}
}

function noteEditCopy(note) {
	//Create a copy of the information needed for restoring a note's position after canceling.
	var copy = {
		x: note.x,
		y: note.y,
		width: note.width,
		height: note.height
	};

	return copy;
}

function isThere(url) {
	// Checks if file exists. Thanks to some random forum!
	var req = new XMLHttpRequest(); // XMLHttpRequest object.
	try {
		req.open("HEAD", url, false);
		req.send(null);
		return (req.status == 200 ? true : false);
	} catch(er) {
		return false;
	}
}

function getVar(getVar, url) {
	// Wow I actually found a good use for my get variable method.
	if (!url)
		url = location.href;

	var search = new RegExp(getVar + "=.+?(?=&)");
	var result = new String(search.exec(url));

	if (result == "null") {
		var search = new RegExp(getVar + "=.+");
		var result = new String(search.exec(url));
	}

	return result.split("=")[1];
}

function enablePopularBy() {
	document.getElementById("header").innerHTML +=
		'<ul class="flat-list" id="subnavbar" style="position: relative; top: -15px">' +
		'<li><a href="/post/popular_by_day">Popular By Day</a></li>' +
		'<li><a href="/post/popular_by_week">Popular By Week</a></li>' +
		'<li><a href="/post/popular_by_month">Popular By Month</a></li></ul>';
}

function keyCheck(e) {
	if (!enable_arrow_nav)
		return; // If arrow nav is disabled, don't do anything.
	if (e.keyCode == 37)
		arrowNav("left");
	if (e.keyCode == 39)
		arrowNav("right");
}

function arrowNav(dir) {
	if (/page=1000|before_id=/.test(location.href)) {
		var pagelinks = document.getElementById("paginator").getElementsByTagName("a");

		if (pagelinks[1]) {
			switch (dir) {
				case "left": window.location = pagelinks[0].href; break;
				case "right": window.location = pagelinks[1].href; break;
				default: break;
			}
		}
	}
	else {
		var page = parseInt(getVar("page"), 10);
		var limit = "";

		if (!page) {
			page = 1;

			if (allowUserLimit() && !/limit=/.test(location.href))
				limit = "&limit=" + thumbnail_count;
		}

		var url = location.href;

		if (/\/post\/show\//.test(url))
			return;

		switch (dir) {
			case "left": page--; break;
			case "right": page++; break;
			default: break;
		}

		if (page < 1 || page > 1000)
			return;

		if (location.pathname == "/")
			url += "posts";

		if (!/\?/.test(url))
			url += "?"; // If no ? is found, add one. Needed for GET vars.

		url = url.replace(/&?page=\d+/, "");
		url = url + "&page=" + page + limit;
		url = url.replace("?&", "?"); // This could probably be one regex.
		url = url.replace("page=&page=", "page=");
		window.location = url;
	}
}

function allowUserLimit() {
	if (thumbnail_count > 0 && /donmai.us\/post/.test(location.href))
		return true;
	else
		return false;
}

function checkUrls() {
	for (var i = 0, vul = valid_urls.length; i < vul; i++) {
		if (valid_urls[i] == location.href.substring(0, location.href.lastIndexOf("post")))
			return true;
	}
	return false;
}

function checkSetting(cookie_setting, script_setting) {
	if (getCookie()[cookie_setting]) {
		if (getCookie()[cookie_setting] == "true")
			return true;
		else
			return false;
	}
	else
		return script_setting;
}

function checkFocus() {
	var input = document.getElementsByTagName("input");
	var textarea = document.getElementsByTagName("textarea");
	addEvent(input);
	addEvent(textarea);
}

function addEvent(vars) {
	for (var i = 0, vl = vars.length; i < vl; i++) {
		vars[i].addEventListener("focus", function() { enable_arrow_nav = false; }, false);
		vars[i].addEventListener("blur", function() { enable_arrow_nav = true; }, false);
	}
}

function searchAdd() {
	// Where = array of <li> in tag-sidebar.
	var where = document.getElementById("tag-box");

	if (!where)
		return;
	else
		where = where.getElementsByTagName("li");

	var tag = getVar("tags");

	if (!tag)
		tag = "";

	for (var i = 0, wl = where.length; i < wl; i++) {
		var newTag = getVar("tags", where[i].getElementsByTagName("a")[1].href);
		var newLink = "/post/index?tags=" + newTag + " " + tag;
		where[i].innerHTML = '<a href="' + newLink + '">+</a> ' + where[i].innerHTML;
		var newLink = "/post/index?tags=-" + newTag + " " + tag;
		where[i].innerHTML = '<a href="' + newLink + '">-</a> ' + where[i].innerHTML;
	}
}

function noticeMessage(msg) {
	var notice = document.getElementById("notice");

	if (notice) {
		notice.innerHTML = msg;
		notice.style.display = "block";
	}
}

function getCookie() {
	// Return associative array with cookie values.
	var data = document.cookie;

	if(!data)
		return false;

	data = data.split("; ");
	var out = [];

	for (var i = 0, dl = data.length; i < dl; i++) {
		var temp = data[i].split("=");
		out[temp[0]] = temp[1];
	}

	return out;
}

function createCookie(cname, cvalue, expyear) {
	var data = cname + "=" + cvalue + "; path=/";

	if (expyear !== null) {
		var expdate = new Date();
		expdate.setFullYear(expdate.getFullYear() + expyear);
		expdate.toUTCString();
		data += "; expires=" + expdate;
	}

	document.cookie = data;
}

function filterOther() {
	// Replace the thumbnails of blacklisted posts.
	var imgs = document.getElementsByTagName("img");
	var blacklist = blacklistInit();

	for (var i = 0, il = imgs.length; i < il; i++) {
		var img = imgs[i];
		var tags = img.title;

		if (isBlacklisted(blacklist, tags)) {
			img.src = "/blacklisted-preview.png";
			img.removeAttribute("height");
			img.removeAttribute("width");
		}
	}
}

function isBlacklisted(blacklist, origtags) {
	if (blacklist === "")
		return false;

	var blacklisttags = blacklist.replace(/rating%3A(\w)\w*/i, "rating%3A$1").split("&");
	var tags = origtags.replace(/rating:(\w)\w+/i, "rating:$1");

	for (var x = 0, btl = blacklisttags.length; x < btl; x++) {
		if (/\+/.test(blacklisttags[x])) {
			// Check for multiple tag matches.
			var multitag = blacklisttags[x].split("+");

			for (var y = 0, mtl = multitag.length; y < mtl; y++) {
				var search = new RegExp("\\s" + multitag[y] + "\\s", "i");
				var enctags = encodeURIComponent(tags).replace(/%20|^|$/g, " ");

				if (!search.test(enctags))
					break;

				if (y + 1 == multitag.length)
					return true;
			}
		}
		else {
			// Check for single tag matches.
			var search = new RegExp("\\s" + blacklisttags[x] + "\\s", "i");
			var enctags = encodeURIComponent(tags).replace(/%20|^|$/g, " ");

			if (search.test(enctags))
				return true;
		}
	}

	return false;
}

function blacklistInit() {
	if (getCookie()["blacklisted_tags"] === "") {
		if (script_blacklisted_tags === "")
			return "";
		else
			return encodeURIComponent(script_blacklisted_tags).replace(/(%20)*%2C(%20)*/g, "&").replace(/(%20)+/g, "+");
	}
	else
		return getCookie()["blacklisted_tags"];
}

function blacklistBarInit(blacklist, blacklistedposts) {
	var numblacklistedposts = blacklistedposts.length;
	var blacklistbar = document.getElementById("blacklisted-sidebar");

	if (!numblacklistedposts || !blacklistbar)
		return;

	blacklistbar.style.display = "none";
	blacklistbar.innerHTML = '<h5> <a href="#" id="blacklistbartoggle">Hidden</a> <span id="blacklistbarcount" class="post-count">' +
		numblacklistedposts + '</span> </h5> <ul id="blacklistbarlist" style="display: none;"> </ul>';

	var encblacklisttags = blacklist.replace(/rating%3A(\w)\w*/i, "rating%3A$1").split("&");
	var decblacklisttags = decodeURIComponent(blacklist).replace("+", " ").split("&");
	var blacklistbarlist = document.getElementById("blacklistbarlist");

	for (var x = 0, ebt = encblacklisttags.length; x < ebt; x++) {
		var nummatches = 0;

		// Figure out how many images satisfy each blacklist match.
		for (var y = 0; y < numblacklistedposts; y++) {
			if (/\+/.test(encblacklisttags[x])) {
				// Check for multiple tag matches.
				var multitag = encblacklisttags[x].split("+");

				for (var z = 0, mtl = multitag.length; z < mtl; z++) {
					var search = new RegExp("\\s" + multitag[z] + "\\s", "i");
					var enctags = encodeURIComponent(blacklistedposts[y].tags).replace(/%20|^|$/g, " ");

					if (!search.test(enctags))
						break;

					if (z + 1 == multitag.length)
						nummatches++;
				}
			}
			else {
				// Check for single tag matches.
				var search = new RegExp("\\s" + encblacklisttags[x] + "\\s", "i");
				var enctags = encodeURIComponent(blacklistedposts[y].tags).replace(/%20|^|$/g, " ");

				if (search.test(enctags))
					nummatches++;
			}

		}

		if (nummatches) {
			var blacklistbaritem = document.createElement("li");
			var workingblacklist = blacklist;

			blacklistbaritem.innerHTML = '<a href="#" class="blacklisted-tags">&#187; ' + decblacklisttags[x] +
				'</a> <span class="post-count">' + nummatches + '</span>';
			blacklistbarlist.appendChild(blacklistbaritem);

			blacklistbaritem.children[0].addEventListener("click", function(curencblacklisttag) {
				return function(event) {
					var newblacklistbarcount = parseInt(document.getElementById("blacklistbarcount").innerHTML, 10);

					if (this.className == "blacklisted-tags") {
						// Display blacklisted posts.
	 					var remove = curencblacklisttag;
						workingblacklist = workingblacklist.replace(remove, "").replace(/^&|&$/, "").replace(/&+/, "&");
						this.className = "blacklisted-tags-disabled";

	 					for (var i = 0; i < numblacklistedposts; i++) {
		 					var curpost = document.getElementById("p" + blacklistedposts[i].id);

							if (!isBlacklisted(workingblacklist, blacklistedposts[i].tags) && curpost.style.display == "none") {
								curpost.style.display = "";
								newblacklistbarcount--;
							}
	 					}
					}
					else {
						// Hide blacklisted posts.
	 					workingblacklist += (workingblacklist ? "&" : "") + curencblacklisttag;
						this.className = "blacklisted-tags";

	 					for (var i = 0; i < numblacklistedposts; i++) {
		 					var curpost = document.getElementById("p" + blacklistedposts[i].id);

							if (isBlacklisted(workingblacklist, blacklistedposts[i].tags) && curpost.style.display != "none") {
								curpost.style.display = "none";
								newblacklistbarcount++;
							}
	 					}
					}

					document.getElementById("blacklistbarcount").innerHTML = newblacklistbarcount;
					event.preventDefault();
				};
			}(encblacklisttags[x]), false);
		}
	}

	document.getElementById("blacklistbartoggle").addEventListener("click", function(event) {
		var blbl = document.getElementById("blacklistbarlist");

		if (blbl.style.display == "none")
			blbl.style.display = "";
		else
			blbl.style.display = "none";

		event.preventDefault();
	}, false);

	blacklistbar.style.display = "";
}

// Does anyone use these options? Adblock should pretty much cover the ads.
function hideEtology() {
	var img = document.evaluate('//div[@class="etology"]', document, null, 6, null);
	for (var i = 0, isl = img.snapshotLength; i < isl; i++) {
		img.snapshotItem(i).style.display = "none";
	}
}

function hideAdvertisements() {
	var img = document.evaluate('//img[@alt="Advertisement"]', document, null, 6, null);
	for (var i = 0, isl = img.snapshotLength; i < isl; i++) {
		img.snapshotItem(i).style.display = "none";
	}
}

function hideYourAdHere() {
	var img = document.evaluate('//img[@alt="Your Ad Here"]', document, null, 6, null);
	for (var i = 0, isl = img.snapshotLength; i < isl; i++) {
		img.snapshotItem(i).style.display = "none";
	}
}

function hideIframes() {
	var img = document.evaluate('//iframe[contains(@src, "jlist")]', document, null, 6, null);
	for (var i = 0, isl = img.snapshotLength; i < isl; i++) {
		img.snapshotItem(i).style.display = "none";
	}
}

function hideCommentMessage() {
	var x = document.getElementById("comments");
	if (!x)
		x = document.getElementById("comment-list");
	if (x)
		x.getElementsByTagName("div")[0].style.display = "none";
}

function hideUpgradeMessage() {
	var x = document.getElementById("upgrade-account");
	if (x)
		x.style.display = "none";
}

function hideStatusNotice() {
	var img = document.evaluate('//div[@class="status-notice"]', document, null, 6, null);
	for (var i = 0, isl = img.snapshotLength; i < isl; i++) {
		img.snapshotItem(i).style.display = "none";
	}
}
