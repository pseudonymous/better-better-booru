// ==UserScript==
// @name           better_better_booru
// @author         otani, modified by Jawertae, A Pseudonymous Coder & Moebius Strip.
// @description    Several changes to make Danbooru much better. Including the viewing of loli/shota images on non-upgraded accounts. Modified to support arrow navigation on pools, improved loli/shota display controls, and more.
// @version        1
// @include        http://*.donmai.us/*
// @include        http://donmai.us/*
// @exclude        http://trac.donmai.us/*
// @grant          none
// ==/UserScript==

// Have a nice day. - A Pseudonymous Coder

/* True or false settings */
// Global
var show_loli = false;
var show_shota = false;
var fix_links = true; // Also removes all the junk after the post ID in the URL. Automatically set if the above are true.

var hide_sign_up_notice = false;
var hide_upgrade_notice = false;
var hide_advertisements = false;
var hide_statusnotice = false;

// Search
var enable_arrow_nav = true; // Allow the use of the left and right keys to navigate post/pool index pages. Doesn't work when input has focus.
var add_border = true; // Add a light blue border to Shota and pink border to Loli.
var search_add = true; // Add the + and - shortcuts to the tag list for including or excluding search terms.
var thumbnail_count = 0; // Number of thumbnails to display per page. Use a number value of 0 to turn off.

// Post
var sample_resize = true; // When you click an image, it switches between the sample and full image.
var image_resize = false; // When initially loading, scale down large images to fit the browser window as needed.
var load_sample_first = true; // Use sample images when available.
var remove_tag_headers = false; // Remove the "copyrights", "characters", and "artist" headers from the sidebar tag list.
var fav_count = true; // Add the number of favorites to the sidebar information.

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

if (fix_links || show_loli || show_shota) {
	var url = location.pathname;

	if (/\/posts\/\d+/.test(url))
		searchJSON("post");
	else if (/^\/(posts|$)/.test(url))
		searchJSON("search");
	else if (/^\/notes/.test(url))
		searchJSON("notes");
	else if (/\/explore\/posts\/popular/.test(url))
		searchJSON("popular");
}

if (hide_upgrade_notice)
	hideUpgradeNotice();

if (hide_sign_up_notice)
	hideSignUpNotice();

if (hide_advertisements) {
	hideAdvertisements();
	hideYourAdHere();
	hideIframes();
	hideEtology();
}

if (hide_statusnotice)
	hideStatusNotice();

if (enable_arrow_nav) {
	var paginator = document.evaluate('//div[@class="paginator" or @class="pagination"]', document, null, 9, null).singleNodeValue;

	if (paginator) // If the paginator exists, arrow navigation should be applicable.
		window.addEventListener("keydown", keyCheck, false);
}

if (search_add && /^\/(posts)?\/?$/.test(location.pathname))
	searchAdd();

if (remove_tag_headers && /posts\/\d+/.test(location.pathname))
	removeTagHeaders();

/* Functions */

/* Functions for creating a url and retrieving info from it */
function searchJSON(mode) {
	if (mode == "search") {
		var url = location.href.replace(/\/?(posts)?\/?(\?|$)/, "/posts.json?");

		if (allowUserLimit())
			url += "&limit=" + thumbnail_count;

		fetchJSON(url, "search");
	}
	else if (mode == "post") {
		var url = location.href.replace(/\/posts\/(\d+).*/, "/posts/$1.json");
		fetchJSON(url, "post");
	}
	else if (mode == "notes") {
		var url = location.href.replace(/\/notes\/?/, "/notes.json");
		fetchJSON(url, "notes");
	}
	else if (mode == "popular") {
		var url = location.href.replace(/\/popular\/?/, "/popular.json");
		fetchJSON(url, "popular");
	}
}

function searchPost() {
}

function fetchJSON(url, mode) {
	// Retrieve JSON.
	var xmlhttp = new XMLHttpRequest();

	if (xmlhttp !== null) {
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4) { // 4 = "loaded"
				if (xmlhttp.status == 200) { // 200 = "OK"
					xml = JSON.parse(xmlhttp.responseText);

					if (mode == "search" || mode == "pool" || mode == "popular" || mode == "notes")
						parseListing(xml, mode);
					else if (mode == "post")
						parsePost(xml);
				}
//        else // Debug
//          GM_log(xmlhttp.statusText);
			}
		};
		xmlhttp.open("GET", url, true);
		xmlhttp.send(null);
	}
}

/* Functions for creating content from retrieved info */
function parseListing(xml, mode) {
	var out = "";

	// Use JSON results for searches and pool collections.
	if (mode == "search") {
		var imgdiv = '//div[@id="posts"]';
		var posts = xml;
	}
	else if (mode == "pool") { // API no longer returns image information about pool contents?
		var imgdiv = '';
		var posts = xml.posts;
	}
	else if (mode == "popular") {
		var imgdiv = '//section[@id="content"]';
		var posts = xml;
	}
	else if (mode == "notes") {
		var imgdiv = '//div[@id="a-index"]';
		var posts = xml;
		var out = "<h1>Notes</h1>";
	}

	var where = document.evaluate(imgdiv, document, null, 9, null).singleNodeValue;
	var paginator = document.evaluate('//div[@class="paginator"]', where, null, 9, null).singleNodeValue;

	// Result preparation.
	for (var i = 0, pl = posts.length; i < pl; i++) {
		var post = posts[i];
		var imgid = post.id;
		var style = "";
		var uploader = post.uploader_id //Only user id provided in the new API?
		var score = post.score;
		var rating = post.rating;
		var tags = post.tag_string;
		var parent = (post.parent_id !== null ? post.parent_id : "");
		var alt = tags;
		var title = tags + " user:" + uploader + " rating:" + rating + " score:" + score;
		var md5 = post.md5;
		var ext = post.file_ext;
		var fileurl = "/data/" + md5 + "." + ext;
		var thumbnailurl = "/ssd/data/preview/" + md5 + ".jpg";

		// Don't display loli/shota if the user has opted so and skip to the next image.
		if (!show_loli && /\bloli\b/.test(tags))
			continue;
		if (!show_shota && /\bshota\b/.test(tags))
			continue;

		// Apply appropriate thumbnail borders. Borders override each other in this order: Loli > Shota > Flagged > Pending > Child > Parent
		if (add_border) {
			if (/\bloli\b/.test(tags))
				style = "border: 2px solid " + loli_border + ";";
			else if (/\bshota\b/.test(tags))
				style = "border: 2px solid " + shota_border + ";";
		}

		if (style === "") {
			if (post.is_flagged)
				style = "border: 2px solid " + flagged_border + ";";
			else if (post.is_pending)
				style = "border: 2px solid " + pending_border + ";";
			else if (parent !== "")
				style = "border: 2px solid " + child_border + ";";
			else if (post.has_children)
				style = "border: 2px solid " + parent_border + ";";
		}

		// eek, huge line.
		if (mode == "search" || mode == "notes" || mode == "popular") {
			out += '<article class="post-preview" id="post_' + imgid + '" data-id="' + imgid + '" data-tags="' + tags + '" data-uploader="' + uploader + '" data-rating="' + rating + '" data-width="' + post.width + '" data-height="' + post.height + '" data-flags="' + post.status + '" data-parent-id="' + parent + '" data-has-children="' + post.has_children + '" data-score="' + score + '"><a href="/posts/' + imgid + '"><img title="' + title + '" src="' + thumbnailurl + '" alt="' + tags + '" style="' + style + '"></a><a style="display: none;" href="' + fileurl + '">Direct Download</a></span></article>';
		}
	}

	// Fix paginator with user's custom limit.
	if (allowUserLimit() && paginator) {
		var pagelinks = document.evaluate('.//a', paginator, null, 6, null);

		for (var i = 0, isl = pagelinks.snapshotLength; i < isl; i++) {
			pagelinks.snapshotItem(i).href = pagelinks.snapshotItem(i).href + "&limit=" + thumbnail_count;
		}
	}

	// Replace results with new results.
	if (paginator)
		where.innerHTML = out + paginator.outerHTML;
	else
		where.innerHTML = out;

	// Blacklist.
	if (mode == "search" || mode == "popular" || mode == "notes") {
		if (!checkLoginStatus() && script_blacklisted_tags.replace(/\s+/, "").length) {
			var blacklisttags = script_blacklisted_tags.replace(/(rating:[qes])\w+/, "$1").split(" ");

			Danbooru.Blacklist.blacklists.length = 0;

			for (var i = 0, bl = blacklisttags.length; i < bl; i++) {
				var tag = Danbooru.Blacklist.parse_entry(blacklisttags[i]);
				Danbooru.Blacklist.blacklists.push(tag);
			}
		}

		var blacklist_used = Danbooru.Blacklist.apply();

		if (mode == "search") {
			document.getElementById("blacklist-list").innerHTML = "";

			if (blacklist_used)
				Danbooru.Blacklist.update_sidebar();
			else
				document.getElementById("blacklist-box").style.display = "none";
		}
	}
}

function parsePost(xml) {
	myImg = xml;

	var imageexists = (document.getElementById("image") === null ? false : true);
	var container = document.getElementById("image-container");

	if (myImg.id) {
		var ext = myImg.file_ext;
		var url = "/data/" + myImg.md5 + "." + ext;
		var height = myImg.image_height;
		var width = myImg.image_width;
		var ratio = 850 / width;
		var sampurl = url.replace(/data\/(\w+)\.\w+$/, "data/sample/sample-$1.jpg");
		var sampheight = Math.round(height * ratio);
		var sampwidth = 850;

		if (ext == "swf") {
			// Create flash object.
			container.innerHTML = '<div id="note-container"></div> <object height="' + height + '" width="' + width + '"> <params name="movie" value="' + url + '"> <embed allowscriptaccess="never" src="' + url + '" height="' + height + '" width="' + width + '"> </params> </object> <p><a href="' + url + '">Save this flash (right click and save)</a></p>'
		}
		else if (height === null) {
			// Create manual download.
			container.innerHTML = '<h2><a href="' + url + '">Download</a></h2>' +
				'<p>You must download this file manually.</p>';
		}
		else {
			if (checkSetting("default-image-size", "large", load_sample_first) && ratio < 1) {
				var newwidth = sampwidth;
				var newheight = sampheight;
				var newurl = sampurl;
				var alttxt = "sample";
			}
			else {
				var newwidth = width;
				var newheight = height;
				var newurl = url;
				var alttxt = url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf("."));
			}

			container.innerHTML = '<div id="note-container"></div> <img alt="' + alttxt + '" data-large-height="' + sampheight + '" data-large-width="' + sampwidth + '" data-original-height="' + height + '" data-original-width="' + width + '" height="' + newheight + '" width="' + newwidth + '" id="image" src="' + newurl + '" />';

			// Make use of what Danbooru has provided us.
			if (!imageexists)
				document.getElementById("translate").addEventListener("click", Danbooru.Note.TranslationMode.start, false); // Make the "Add note" link work.

			document.getElementById("image").addEventListener("click", Danbooru.Note.Box.toggle_all, false); // Make notes toggle when clicking the image.
			Danbooru.Post.initialize_post_image_resize_links(); // Make original image toggle when clicking resized notice ("view original").
			Danbooru.Note.load_all(); // Load/reload notes.
		}

		// Resize image if desired.
		if (checkSetting("always-resize-images", "true", image_resize))
			document.getElementById("image-resize-to-window-link").click();

		// Add favorites count
		if (fav_count) {
			var favs = /fav:/.exec(myImg.fav_string);
			var num_favs = (favs === null ? 0 : favs.length );
			var target = document.getElementById("score-for-post-" + myImg.id).parentNode;

			target.innerHTML += '<li>Favorites: ' + num_favs + '</li>';
		}

		// Display comments.
		document.getElementById("comments").getElementsByTagName("div")[0].removeAttribute("style");
	}
}

/* Functions for support, extra features, and content manipulation */
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

function keyCheck(e) {
	if (document.activeElement.type == "text" || document.activeElement.type == "textarea")
		return;
	else if (e.keyCode == 37)
		arrowNav("left");
	else if (e.keyCode == 39)
		arrowNav("right");
}

function arrowNav(dir) {
	if (/page=1000|page=[ab]/.test(location.href)) { // For pages 1000+.
		var pagelinks = document.evaluate('//div[@class="paginator"]//a', document, null, 6, null);

		if (pagelinks.snapshotItem(1)) {
			switch (dir) {
				case "left": location.href = pagelinks.snapshotItem(0).href; break;
				case "right": location.href = pagelinks.snapshotItem(1).href; break;
				default: break;
			}
		}
		else {
			switch (dir) {
				case "right": location.href = pagelinks.snapshotItem(0).href; break;
				default: break;
			}
		}
	}
	else { // For pages under 1000.
		var page = parseInt(getVar("page"), 10);
		var limit = "";

		if (!page) {
			page = 1;

			if (allowUserLimit())
				limit = "&limit=" + thumbnail_count;
		}

		switch (dir) {
			case "left": page--; break;
			case "right": page++; break;
			default: break;
		}

		if (page < 1 || page > 1000)
			return;

		var url = location.href.replace(/#.+$/, ""); // Get rid of hash portion.

		if (!/\?/.test(url))
			url += "?page=" + page + limit; // Search string not found so create one.
		else if (!/page=\d*/.test(url))
			url += "&page=" + page + limit;
		else
			url = url.replace(/page=\d*/, "page=" + page) + limit;

		location.href = url.replace(/(&)+|(\?)&+|(.)&+$|/g, "$1$2$3"); // Clean up any "&" problems and load.
	}
}

function allowUserLimit() {
	if (thumbnail_count > 0 && /^\/(posts)?\/?$/.test(location.pathname) && !/(page|limit)=\d/.test(location.search))
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

function fetchMeta(name) {
	var tag = document.getElementsByName(name)[0];

	if (tag)
		var data = tag.getAttribute("content");
	else
		return null;

	if (data)
		return data;
	else
		return null;
}

function checkLoginStatus() {
	if (fetchMeta("current-user-id") !== "")
		return true;
	else
		return false;
}

function checkSetting(metaname, metadata, script_setting) {
	if (checkLoginStatus()) {
		if (fetchMeta(metaname) === metadata)
			return true;
		else
			return false;
	}
	else
		return script_setting;
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

function removeTagHeaders() {
	var taglist = document.getElementById("tag-list");
	var newlist = taglist.innerHTML.replace(/<\/ul>.+?<ul>/g, "").replace(/<h\d>.+?<\/h\d>/, "<h1>Tags</h1>");

	taglist.innerHTML = newlist;
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

function hideUpgradeNotice() {
	var x = document.getElementById("upgrade-account-notice");
	if (x)
		x.style.display = "none";
}

function hideSignUpNotice() {
	var x = document.getElementById("sign-up-notice");
	if (x)
		x.style.display = "none";
}

function hideStatusNotice() {
	var img = document.evaluate('//div[@class="status-notice"]', document, null, 6, null);
	for (var i = 0, isl = img.snapshotLength; i < isl; i++) {
		img.snapshotItem(i).style.display = "none";
	}
}
