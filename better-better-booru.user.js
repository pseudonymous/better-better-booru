// ==UserScript==
// @name           better_better_booru
// @author         otani, modified by Jawertae, A Pseudonymous Coder & Moebius Strip.
// @description    Several changes to make Danbooru much better. Including the viewing of loli/shota images on non-upgraded accounts. Modified to support arrow navigation on pools, improved loli/shota display controls, and more.
// @version        3.3
// @updateURL      https://userscripts.org/scripts/source/100614.meta.js
// @downloadURL    https://userscripts.org/scripts/source/100614.user.js
// @include        http://*.donmai.us/*
// @include        http://donmai.us/*
// @exclude        http://trac.donmai.us/*
// @run-at         document-end
// @grant          none
// ==/UserScript==

// Have a nice day. - A Pseudonymous Coder

function injectMe() { // This is needed to make this script work in Chrome.


	/********************************/
	/* Don't touch above this line! */
	/********************************/


	/* Help */
	// When editing settings, make sure you always maintain the same format. Leave equal signs, quotation marks, and semicolons alone.
	// For true/false settings, you simply use true to turn on the option or false to turn it off. Never use quotation marks for these.
	// For numerical settings, you simply provide the desired number value. Never use quotation marks for these.
	// For settings in quotation marks, you will be provided with special instructions about what to do. Just remember to keep
	// the quotation marks and also make sure not to add any extra ones.

	/* True or false settings */
	// Global
	var show_loli = false;
	var show_shota = false;
	var enable_bbb = true; // Disabling this will disable many main features related to images and their listings (thumbnail_count, image_resize, load_sample_first, loli/shota borders, script_blacklisted_tags). Has no effect if show_loli or show_shota are true.
	var clean_links = false; // Remove everything after the post ID in the thumbnail URLs. Enabling this disables search navigation for posts and active pool detection for posts.

	var hide_sign_up_notice = false;
	var hide_upgrade_notice = false;
	var hide_advertisements = false;
	var hide_tos_notice = false;

	// Search
	var enable_arrow_nav = false; // Allow the use of the left and right keys to navigate index pages. Doesn't work when input has focus.
	var add_border = true; // Add borders to shota and loli. You may set the colors under "Set Border Colors".
	var enable_custom_borders = false; // Change the border colors of flagged, parent, child, and pending posts. You may set the colors under "Set Border Colors".
	var search_add = true; // Add the + and - shortcuts to the tag list for including or excluding search terms.
	var thumbnail_count = 0; // Number of thumbnails to display per page. Use a number value of 0 to turn off.

	// Post
	var alternate_image_swap = false; // Toggle notes via the options in the sidebar and make clicking the image swap between the original and sample image.
	var image_resize = true; // When initially loading, scale down large images to fit the browser window as needed.
	var load_sample_first = true; // Use sample images when available.
	var hide_original_notice = false; // If you don't need the notice for switching back to the sample image, you can choose to hide it by default. You can also click the "X" on the notice to hide it by default via cookies.
	var remove_tag_headers = false; // Remove the "copyrights", "characters", and "artist" headers from the sidebar tag list.

	// Set Border Colors. Use CSS hex values for colors. http://www.w3schools.com/CSS/css_colors.asp
	var loli_border = "#FFC0CB";
	var shota_border = "#66CCFF";
	var child_border = "#CCCC00";
	var parent_border = "#00FF00";
	var pending_border = "#0000FF";
	var flagged_border = "#FF0000";
	var deleted_border = "#000000";

	// Blacklist
	// Guidelines: Matches can consist of a single tag or multiple tags. Each match must be separated by a comma and each tag in a match
	// must be separated by a space. The whole blacklist must remain inside of quotation marks. Using empty quotation marks (ex:"") will
	// disable the script blacklist. When logged in, your account blacklist will override this blacklist.
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


	/* Global Variables */
	var gUrl = location.href.split("#")[0]; // URL without the anchor
	var gUrlPath = location.pathname; // URL path only
	var gUrlQuery = location.search; // URL query string only
	var gLoc = currentLoc(); // Current location (post = single post, search = posts index, notes = notes index, popular = popular index, pool = single pool)

	/* "INIT" */
	if ((enable_bbb || show_loli || show_shota) && (gLoc !== undefined))
		searchJSON(gLoc);

	if (hide_upgrade_notice)
		hideUpgradeNotice();

	if (hide_sign_up_notice)
		hideSignUpNotice();

	if (hide_tos_notice)
		hideTOSNotice();

	if (hide_advertisements) {
		hideAdvertisements();
		hideYourAdHere();
		hideIframes();
	}

	if (clean_links)
		cleanLinks();

	if (enable_arrow_nav) {
		var paginator = document.getElementsByClassName("paginator")[0];

		if (paginator || gLoc === "popular") // If the paginator exists, arrow navigation should be applicable.
			window.addEventListener("keydown", keyCheck, false);
	}

	if (add_border || enable_custom_borders)
		customBorders();

	if (search_add)
		searchAdd();

	if (remove_tag_headers)
		removeTagHeaders();

	/* Functions */

	/* Functions for creating a url and retrieving info from it */
	function searchJSON(mode, xml) {
		if (mode == "search") {
			var url = gUrl.replace(/\/?(posts)?\/?(\?|$)/, "/posts.json?");

			if (allowUserLimit())
				url += "&limit=" + thumbnail_count;

			fetchJSON(url, "search");
		}
		else if (mode == "post") {
			var url = gUrl.replace(/\/posts\/(\d+).*/, "/posts/$1.json");
			fetchJSON(url, "post");
		}
		else if (mode == "notes") {
			var url = gUrl.replace(/\/notes\/?/, "/notes.json");
			fetchJSON(url, "notes");
		}
		else if (mode == "popular") {
			var url = gUrl.replace(/\/popular\/?/, "/popular.json");
			fetchJSON(url, "popular");
		}
		else if (mode == "pool") {
			var url = gUrl.replace(/\/pools\/(\d+)/, "/pools/$1.json");
			fetchJSON(url, "pool");
		}
		else if (mode == "poolsearch") {
			var poolIds = xml.post_ids.split(" ");
			var page = (/page=\d+/.test(gUrlQuery) ? parseInt(getVar("page"), 10) : 1);
			var postIds = poolIds.slice((page - 1) * 20, page * 20);

			fetchJSON("/posts.json?tags=status:any+id:" + postIds.join(","), "poolsearch", postIds);
		}
	}

	function fetchJSON(url, mode, optArg) {
		// Retrieve JSON.
		var xmlhttp = new XMLHttpRequest();

		if (xmlhttp !== null) {
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState == 4) { // 4 = "loaded"
					if (xmlhttp.status == 200) { // 200 = "OK"
						var xml = JSON.parse(xmlhttp.responseText);

						if (mode == "search" || mode == "popular" || mode == "notes")
							parseListing(xml, mode);
						else if (mode == "post")
							parsePost(xml);
						else if (mode == "pool")
							searchJSON("poolsearch", xml);
						else if (mode == "poolsearch")
							parseListing(xml, "pool", optArg);
					}
					// else // Debug
						// GM_log(xmlhttp.statusText);
				}
			};
			xmlhttp.open("GET", url, true);
			xmlhttp.send(null);
		}
	}

	function fetchPages(url) {
		// Retrieve page to get paginator.
		var xmlhttp = new XMLHttpRequest();

		if (xmlhttp !== null) {
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState == 4) { // 4 = "loaded"
					if (xmlhttp.status == 200) { // 200 = "OK"

						var paginator = document.getElementsByClassName("paginator")[0];
						var newPaginator = /<div class="paginator">(.+?)<\/div>/.exec(xmlhttp.responseText)[1];

						if (newPaginator)
							paginator.innerHTML = newPaginator;
					}
				}
			};
			xmlhttp.open("GET", url, true);
			xmlhttp.send(null);
		}
	}

	/* Functions for creating content from retrieved info */
	function parseListing(xml, mode, optArg) {
		var out = "";
		var posts = xml;
		var search = "";

		// Use JSON results for searches and pool collections.
		if (mode == "search") {
			var targetId = "posts";
			search = (/tags=/.test(gUrlQuery) && !clean_links ? "?tags=" + getVar("tags") : "");
		}
		else if (mode == "popular") {
			var targetId = "a-index";
			out = document.getElementById("a-index").innerHTML.split("<article")[0];
		}
		else if (mode == "pool") {
			var targetId = "content";
			var orderedPostIds = optArg;
			search = (!clean_links ? "?pool_id=" + /\/pools\/(\d+)/.exec(gUrlPath)[1] : "");
			out = "\f,;" + orderedPostIds.join("\f,;");
		}
		else if (mode == "notes") {
			var targetId = "a-index";
			out = "<h1>Notes</h1>";
		}

		var where = document.getElementById(targetId);
		var paginator = document.getElementsByClassName("paginator")[0];

		// Result preparation.
		for (var i = 0, pl = posts.length; i < pl; i++) {
			var post = posts[i];
			var imgId = post.id;
			var thumbClass = "post-preview";
			var uploader = post.uploader_name;
			var score = post.score;
			var rating = post.rating;
			var tags = post.tag_string;
			var parent = (post.parent_id !== null ? post.parent_id : "");
			var flags = "";
			var alt = tags;
			var title = tags + " user:" + uploader + " rating:" + rating + " score:" + score;
			var md5 = post.md5;
			var ext = post.file_ext;
			var fileUrl = "/data/" + md5 + "." + ext;
			var thumbnailUrl = (!post.image_height || ext === "swf" ? "/images/download-preview.png" : "/ssd/data/preview/" + md5 + ".jpg");
			var outId = "";
			var thumb = "";

			// Don't display loli/shota if the user has opted so and skip to the next image.
			if ((!show_loli && /\bloli\b/.test(tags)) || (!show_shota && /\bshota\b/.test(tags))) {
				if (mode == "pool") {
					outId = new RegExp("\f,;" + imgId + "(?=<|\f|$)");
					out = out.replace(outId, "");
				}

				continue;
			}

			// Apply appropriate thumbnail borders. Borders override each other in this order: Loli > Shota > Deleted > Flagged > Pending > Child > Parent
			if (add_border) {
				if (/\bloli\b/.test(tags))
					thumbClass += " post-status-loli";
				else if (/\bshota\b/.test(tags))
					thumbClass += " post-status-shota";
			}

			if (thumbClass === "post-preview") {
				if (post.is_deleted) {
					thumbClass += " post-status-deleted";
					flags = "deleted";
				}
				else if (post.is_flagged) {
					thumbClass += " post-status-flagged";
					flags = "flagged";
				}
				else if (post.is_pending) {
					thumbClass += " post-status-pending";
					flags = "pending";
				}
				else if (post.parent_id !== null)
					thumbClass += " post-status-has-parent";
				else if (post.has_children)
					thumbClass += " post-status-has-children";
			}

			// eek, huge line.
			thumb = '<article class="' + thumbClass + '" id="post_' + imgId + '" data-id="' + imgId + '" data-tags="' + tags + '" data-uploader="' + uploader + '" data-rating="' + rating + '" data-width="' + post.image_width + '" data-height="' + post.image_height + '" data-flags="' + flags + '" data-parent-id="' + parent + '" data-has-children="' + post.has_children + '" data-score="' + score + '"><a href="/posts/' + imgId + search + '"><img title="' + title + '" src="' + thumbnailUrl + '" alt="' + tags + '"></a><a style="display: none;" href="' + fileUrl + '">Direct Download</a></span></article>';

			// Generate output
			if (mode == "search" || mode == "notes" || mode == "popular")
				out += thumb;
			else if (mode == "pool") {
				outId = new RegExp("\f,;" + imgId + "(?=<|\f|$)");
				out = out.replace(outId, thumb);
			}
		}

		// Fix paginator with user's custom limit.
		if (allowUserLimit() && paginator) {
			var pageLinks = document.evaluate('.//a', paginator, null, 6, null);

			for (var i = 0, isl = pageLinks.snapshotLength; i < isl; i++) {
				pageLinks.snapshotItem(i).href = pageLinks.snapshotItem(i).href + "&limit=" + thumbnail_count;
			}
		}

		// Replace results with new results.
		if (!posts.length)
			out += '<p>Nobody here but us chickens!</p> <p><a href="javascript:history.back()">Go back</a></p>';

		if (paginator)
			where.innerHTML = out + outerHTML(paginator);
		else
			where.innerHTML = out;

		// Attempt to fix the paginator by retrieving it from an actual page. Might not work if connections are going slowly.
		if (mode == "search" && allowUserLimit()) {
			var pageUrl = gUrl;

			if (/\?/.test(pageUrl))
				pageUrl += "&limit=" + thumbnail_count;
			else
				pageUrl += "?limit=" + thumbnail_count;

			fetchPages(pageUrl);
		}

		// Load the script blacklist if not logged in.
		if (!checkLoginStatus() && /\S/.test(script_blacklisted_tags)) {
			var blacklistTags = script_blacklisted_tags.replace(/\s+/g, " ").replace(/(rating:[qes])\w+/, "$1").split(",");

			Danbooru.Blacklist.blacklists.length = 0;

			for (var i = 0, bl = blacklistTags.length; i < bl; i++) {
				var tag = Danbooru.Blacklist.parse_entry(blacklistTags[i]);
				Danbooru.Blacklist.blacklists.push(tag);
			}
		}

		// Apply the blacklist and update the sidebar for search listings.
		var blacklistUsed = Danbooru.Blacklist.apply();

		if (mode == "search" || mode == "popular") {
			document.getElementById("blacklist-list").innerHTML = "";

			if (blacklistUsed)
				Danbooru.Blacklist.update_sidebar();
			else
				document.getElementById("blacklist-box").style.display = "none";
		}
	}

	function parsePost(xml) {
		var post = xml;
		var imageExists = (document.getElementById("image") === null ? false : true);
		var container = document.getElementById("image-container");

		if (post.id) {
			var ext = post.file_ext;
			var md5 = post.md5;
			var url = "/data/" + md5 + "." + ext;
			var hasLarge = post.has_large;
			var height = post.image_height;
			var width = post.image_width;
			var ratio = 850 / width;
			var sampUrl = "/data/sample/sample-" + md5 + ".jpg";
			var sampHeight = Math.round(height * ratio);
			var sampWidth = 850;

			if (ext == "swf") // Create flash object.
				container.innerHTML = '<div id="note-container"></div> <object height="' + height + '" width="' + width + '"> <params name="movie" value="' + url + '"> <embed allowscriptaccess="never" src="' + url + '" height="' + height + '" width="' + width + '"> </params> </object> <p><a href="' + url + '">Save this flash (right click and save)</a></p>';
			else if (!height) // Create manual download.
				container.innerHTML = '<h2><a href="' + url + '">Download</a></h2> <p>You must download this file manually.</p>';
			else { // Create image
				var useSample = (checkSetting("default-image-size", "large", load_sample_first) && hasLarge);

				if (useSample) {
					var newWidth = sampWidth;
					var newHeight = sampHeight;
					var newUrl = sampUrl;
					var altTxt = "sample";
				}
				else {
					var newWidth = width;
					var newHeight = height;
					var newUrl = url;
					var altTxt = md5;
				}

				container.innerHTML = '<div id="note-container"></div> <img alt="' + altTxt + '" data-large-height="' + sampHeight + '" data-large-width="' + sampWidth + '" data-original-height="' + height + '" data-original-width="' + width + '" height="' + newHeight + '" width="' + newWidth + '" id="image" src="' + newUrl + '" /> <img src="about:blank" height="1" width="1" id="bbb-loader" style="position: absolute; right: 0px; top: 0px; display: none;"/>';
				var img = document.getElementById("image");
				var bbbLoader = document.getElementById("bbb-loader");

				// Enable image swapping between the original and sample image.
				if (hasLarge) {
					var resizeNotice = document.getElementById("image-resize-notice");

					if (resizeNotice)
						resizeNotice.parentNode.removeChild(resizeNotice);

					var bbbResizeNotice = document.createElement("div");
					bbbResizeNotice.className = "ui-corner-all ui-state-highlight notice";
					bbbResizeNotice.style.position = "relative";
					bbbResizeNotice.style.display = "none";
					bbbResizeNotice.innerHTML = '<span id="bbb-sample-notice" style="display:none;">Resized to ' + Math.round(ratio * 100) + '% of original (<a href="' + url + '" id="bbb-original-link">view original</a>)</span><span id="bbb-original-notice" style="display:none;">Viewing original (<a href="' + sampUrl + '" id="bbb-sample-link">view sample</a>)</span> <span id="bbb-img-status"></span><span style="display: none;" class="close-button ui-icon ui-icon-closethick" id="close-original-notice"></span>';
					container.parentNode.insertBefore(bbbResizeNotice , container);

					var swapInit = true;
					var sampleNotice = document.getElementById("bbb-sample-notice");
					var originalNotice = document.getElementById("bbb-original-notice");
					var imgStatus = document.getElementById("bbb-img-status");
					var closeOriginalNotice = document.getElementById("close-original-notice");

					if (useSample) {
						sampleNotice.style.display = "";
						bbbResizeNotice.style.display = "";
					}
					else if (!getCookie()["bbb_hide_original_notice"] && !hide_original_notice) {
						originalNotice.style.display = "";
						closeOriginalNotice.style.display = "";
						bbbResizeNotice.style.display = "";
					}

					document.getElementById("bbb-sample-link").addEventListener("click", function(event) {
						if (swapInit)
							swapInit = false;

						bbbLoader.src = this.href;
						imgStatus.innerHTML = "Loading sample image...";
						event.preventDefault();
					}, false);
					document.getElementById("bbb-original-link").addEventListener("click", function(event) {
						if (swapInit)
							swapInit = false;

						bbbLoader.src = this.href;
						imgStatus.innerHTML = "Loading original image...";
						event.preventDefault();
					}, false);
					bbbLoader.addEventListener("load", function(event) {
						img.src = this.src;
						this.src = "about:blank";
						imgStatus.innerHTML = "";
					}, false);
					bbbLoader.addEventListener("error", function(event) {
						if (this.src != "about:blank")
							imgStatus.innerHTML = "Loading failed!";
						event.preventDefault();
					}, false);
					img.addEventListener("load", function(event) {
						if (!/\/sample\//.test(img.src)) {
							if (getCookie()["bbb_hide_original_notice"] || hide_original_notice)
								bbbResizeNotice.style.display = "none";
							else {
								sampleNotice.style.display = "none";
								originalNotice.style.display = "";
								closeOriginalNotice.style.display = "";
							}

							img.height = height;
							img.width = width;

							if (!swapInit) {
								$("#image").data("scale_factor", 1); // Fix Danbooru. Remove after officially fixed.
								img.style.height = height + "px";
								img.style.width = width + "px";
							}
						}
						else {
							sampleNotice.style.display = "";
							originalNotice.style.display = "none";
							closeOriginalNotice.style.display = "none";
							img.height = sampHeight;
							img.width = sampWidth;

							if (!swapInit) {
								$("#image").data("scale_factor", 1); // Fix Danbooru. Remove after officially fixed.
								img.style.height = sampHeight + "px";
								img.style.width = sampWidth + "px";
							}
						}

						swapInit = false;
						Danbooru.Note.Box.scale_all();
						Danbooru.Post.place_jlist_ads();
					}, false);
					closeOriginalNotice.addEventListener("click", function(event) {
						bbbResizeNotice.style.display = "none";
						createCookie("bbb_hide_original_notice", "true", 1);
					}, false);
				}

				// Enable the "Resize to window", "Toggle Notes", and "Find similar" options for logged out users.
				if (!checkLoginStatus()) {
					var options = document.evaluate('//aside[@id="sidebar"]/section[4]/ul', document, null, 9, null).singleNodeValue;

					options.innerHTML = '<li><a href="#" id="image-resize-to-window-link">Resize to window</a></li>' + (alternate_image_swap ? '<li><a href="#" id="listnotetoggle">Toggle notes</a></li>' : '') + '<li><a href="http://danbooru.iqdb.org/db-search.php?url=http://danbooru.donmai.us/ssd/data/preview/' + md5 + '.jpg">Find similar</a></li>';
					Danbooru.Post.initialize_post_image_resize_to_window_link();
				}

				 // Make the "Add note" link work.
				if (!imageExists && document.getElementById("translate") !== null)
					document.getElementById("translate").addEventListener("click", Danbooru.Note.TranslationMode.start, false);


				if (!alternate_image_swap) { // Make notes toggle when clicking the image.
					img.addEventListener("click", Danbooru.Note.Box.toggle_all, false);
				}
				else { // Make a "Toggle Notes" link in the options bar.
					if (document.getElementById("listnotetoggle") === null) { // For logged in users.
						var translateOption = document.getElementById("translate").parentNode;
						var listNoteToggle = document.createElement("li");

						listNoteToggle.innerHTML = '<a href="#" id="listnotetoggle">Toggle notes</a>';
						translateOption.parentNode.insertBefore(listNoteToggle, translateOption);
					}

					document.getElementById("listnotetoggle").addEventListener("click", function(event) {Danbooru.Note.Box.toggle_all(); event.preventDefault();}, false);

					// Make clicking the image swap between the original and sample image when available.
					if (hasLarge) {
						img.addEventListener("click", function(event) {
							if (/\/sample\//.test(img.src)) {
								if (swapInit)
									swapInit = false;

								bbbLoader.src = url;
								imgStatus.innerHTML = "Loading original image...";
							}
							else {
								if (swapInit)
									swapInit = false;

								bbbLoader.src = sampUrl;
								imgStatus.innerHTML = "Loading sample image...";
							}
						}, false);
					}
				}

				Danbooru.Note.load_all(); // Load/reload notes.

				// Resize image if desired.
				if (checkSetting("always-resize-images", "true", image_resize))
					document.getElementById("image-resize-to-window-link").click();
			}
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
		if (!url)
			url = gUrl;

		var search = new RegExp(getVar + "=.*?(?=[#&]|$)");
		var result = search.exec(url);

		if (result === null)
			return null;
		else
			return result[0].split("=")[1];
	}

	function keyCheck(e) {
		if (document.activeElement.type == "text" || document.activeElement.type == "textarea")
			return;
		else if (e.keyCode == 37)
			danbooruNav("left");
		else if (e.keyCode == 39)
			danbooruNav("right");
	}

	function danbooruNav(dir) {
		if (gLoc === "popular") {
			if (dir === "left")
				Danbooru.PostPopular.nav_prev();
			else if (dir === "right")
				Danbooru.PostPopular.nav_next();
		}
		else {
			if (dir === "left")
				Danbooru.Paginator.prev_page();
			else if (dir === "right")
				Danbooru.Paginator.next_page();
		}
	}

	function cleanLinks() {
		if (gLoc === "post") {
			var target = document.evaluate('//div[@id="pool-nav"]//a', document, null, 6, null)

			for (var i = 0, isl = target.snapshotLength; i < isl; i++) {
				target.snapshotItem(i).href = target.snapshotItem(i).href.split("?")[0];;
			}
		}
		else if (gLoc === "pool") {
			var target = document.evaluate('//section[@id="content"]/article/a', document, null, 6, null)

			for (var i = 0, isl = target.snapshotLength; i < isl; i++) {
				target.snapshotItem(i).href = target.snapshotItem(i).href.split("?")[0];;
			}
		}
		else if (gLoc === "search") {
			var target = document.evaluate('//div[@id="posts"]/article/a', document, null, 6, null)

			for (var i = 0, isl = target.snapshotLength; i < isl; i++) {
				target.snapshotItem(i).href = target.snapshotItem(i).href.split("?")[0];;
			}
		}
	}

	function allowUserLimit() {
		if (thumbnail_count > 0 && gLoc === "search" && !/(page|limit)=\d/.test(gUrlQuery))
			return true;
		else
			return false;
	}

	function currentLoc() {
		if (/\/posts\/\d+/.test(gUrlPath))
			return "post";
		else if (/^\/(posts|$)/.test(gUrlPath))
			return "search";
		else if (/^\/notes/.test(gUrlPath) && !/group_by=note/.test(gUrlQuery))
			return "notes";
		else if (/\/explore\/posts\/popular/.test(gUrlPath))
			return "popular";
		else if (/\/pools\/\d+/.test(gUrlPath))
			return "pool";
		else
			return undefined;
	}

	function checkUrls() {
		for (var i = 0, vul = valid_urls.length; i < vul; i++) {
			if (valid_urls[i] == gUrl.substring(0, gUrl.lastIndexOf("post")))
				return true;
		}
		return false;
	}

	function fetchMeta(name) {
		var tag = document.getElementsByName(name)[0];

		if (tag) {
			if (tag.hasAttribute("content"))
				return tag.content;
			else
				return undefined;
		}
		else
			return undefined;
	}

	function checkLoginStatus() {
		if (fetchMeta("current-user-id") !== "")
			return true;
		else
			return false;
	}

	function checkSetting(metaName, metaData, scriptSetting) {
		if (checkLoginStatus()) {
			if (fetchMeta(metaName) === metaData)
				return true;
			else
				return false;
		}
		else
			return scriptSetting;
	}

	function searchAdd() {
		if (gLoc === "search") {
			// Where = array of <li> in tag-sidebar.
			var where = document.getElementById("tag-box");

			if (!where)
				return;
			else
				where = where.getElementsByTagName("li");

			var tag = getVar("tags");

			if (!tag)
				tag = "";
			else
				tag = "+" + tag;

			for (var i = 0, wl = where.length; i < wl; i++) {
				var newTag = getVar("tags", where[i].getElementsByTagName("a")[1].href);
				var newLink = "/post/index?tags=" + newTag + tag;
				where[i].innerHTML = '<a href="' + newLink + '">+</a> ' + where[i].innerHTML;
				newLink = "/post/index?tags=-" + newTag + tag;
				where[i].innerHTML = '<a href="' + newLink + '">-</a> ' + where[i].innerHTML;
			}
		}
	}

	function customBorders() {
		var borderStyles = document.createElement("style");

		borderStyles.type = "text/css";

		if (add_border)
			borderStyles.innerHTML += " .post-preview.post-status-shota img{border: 2px solid " + shota_border + " !important;} .post-preview.post-status-loli img{border: 2px solid" + loli_border + " !important;}";

		if (enable_custom_borders)
			borderStyles.innerHTML += " .post-preview.post-status-has-parent img{border-color:" + child_border + " !important;} .post-preview.post-status-deleted img{border-color:" + deleted_border + " !important;} .post-preview.post-status-has-children img{border-color:" + parent_border + " !important;} .post-preview.post-status-pending img{border-color:" + pending_border + " !important;} .post-preview.post-status-flagged img{border-color:" + flagged_border + " !important;}";

		document.getElementsByTagName("head")[0].appendChild(borderStyles);
	}

	function removeTagHeaders() {
		if (gLoc === "post") {
			var tagList = document.getElementById("tag-list");
			var newList = tagList.innerHTML.replace(/<\/ul>.+?<ul>/g, "").replace(/<h2>.+?<\/h2>/, "<h1>Tags</h1>");

			tagList.innerHTML = newList;
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

	function createCookie(cName, cValue, expYear) {
		var data = cName + "=" + cValue + "; path=/";

		if (expYear !== null) {
			var expDate = new Date();
			expDate.setFullYear(expDate.getFullYear() + expYear);
			expDate.toUTCString();
			data += "; expires=" + expDate;
		}

		document.cookie = data;
	}

	function outerHTML(node){
		// If IE, Chrome, or newer FF version take the internal method otherwise build one. More thanks to random forums for clearing up outerHTML support.
		return node.outerHTML ||
			(function(n) {
				var div = document.createElement('div'), outer;

				div.appendChild( n.cloneNode(true) );
				outer = div.innerHTML;
				div = null;

				return outer;
			})(node);
	}

	// Does anyone use these options? Adblock should pretty much cover the ads.
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

	function hideTOSNotice() {
		var x = document.getElementById("tos-notice");
		if (x)
			x.style.display = "none";
	}


} // End of injectMe.

// Load script into the page so it can access Danbooru's Javascript in Chrome. Thanks to everyone else that has ever had this problem before... and Google which found the answers to their questions for me.
var script = document.createElement('script');
script.type = "text/javascript";
script.appendChild(document.createTextNode('(' + injectMe + ')();'));
(document.body || document.head || document.documentElement).appendChild(script);
