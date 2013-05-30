// ==UserScript==
// @name           better_better_booru
// @author         otani, modified by Jawertae, A Pseudonymous Coder & Moebius Strip.
// @description    Several changes to make Danbooru much better. Including the viewing of loli/shota images on non-upgraded accounts. Modified to support arrow navigation on pools, improved loli/shota display controls, and more.
// @version        ?.?
// @updateURL      https://userscripts.org/scripts/source/100614.meta.js
// @downloadURL    https://userscripts.org/scripts/source/100614.user.js
// @match          http://*.donmai.us/*
// @match          https://*.donmai.us/*
// @match          http://donmai.us/*
// @exclude        http://trac.donmai.us/*
// @run-at         document-end
// @grant          none
// ==/UserScript==

// Have a nice day. - A Pseudonymous Coder

function injectMe() { // This is needed to make this script work in Chrome.
	/*
	 * NOTE: You no longer need to edit this script to change settings!
	 * Use the "BBB Settings" button in the menu instead.
	 */

	/* Global Variables */
	var bbbInfo = {}; // Container for misc info.
	var settings = {}; // Container for settings.

	// Initialize settings.
	settings.options = {
		bbb_version: "6.0",
		alternate_image_swap: new Option("checkbox", false, "Alternate Image Swap", "Switch between the sample and original image by clicking the image. Notes can be toggled by using the link in the sidebar options section."),
		arrow_nav: new Option("checkbox", false, "Arrow Navigation", "Allow the use of the left and right arrow keys to navigate pages. Has no effect on individual posts."),
		autohide_sidebar: new Option("dropdown", "none", "Auto-hide Sidebar", "Hide the sidebar for individual posts and/or searches until the mouse comes close to the left side of the window or the sidebar gains focus.<br><br><u>Tips</u><br>By using Danbooru's keyboard shortcut for the letter \"Q\" to place focus on the search box, you can unhide the sidebar.<br><br>Use the thumbnail count option to get the most out of this feature on search listings.", {txtOptions:["Disabled:none", "Searches:search", "Posts:post", "Searches & Posts:post search"]}),
		border_width: new Option("dropdown", 2, "Border Width", "Set the width of thumbnail borders.", {txtOptions:["1:1", "2 (Default):2", "3:3"]}),
		bypass_api: new Option("checkbox", false, "Automatic API Bypass", "When logged out and API only features are enabled, do not warn about needing to be logged in. Instead, automatically bypass those features."),
		clean_links: new Option("checkbox", false, "Clean Links", "Remove the extra information after the post ID in thumbnail links.<br><br><u>Note</u></br>Enabling this option will disable Danbooru's search navigation and active pool detection for individual posts."),
		custom_status_borders: new Option("checkbox", false, "Custom Status Borders", "Override Danbooru's thumbnail colors for deleted, flagged, pending, parent, and child images."),
		custom_tag_borders: new Option("checkbox", true, "Custom Tag Borders", "Add thumbnail borders to images with specific tags."),
		direct_downloads: new Option("checkbox", false, "Direct Downloads", "Allow download managers to download the images displayed in the search, pool, and popular listings."),
		hide_advertisements: new Option("checkbox", false, "Hide Advertisements", "Hide the advertisements and free up some of the space set aside for them by adjusting the layout."),
		hide_ban_notice: new Option("checkbox", false, "Hide Ban Notice", "Hide the Danbooru ban notice."),
		hide_original_notice: new Option("checkbox", false, "Hide Original Notice", "Hide the Better Better Booru \"viewing original\" notice."),
		hide_sign_up_notice: new Option("checkbox", false, "Hide Sign Up Notice", "Hide the Danbooru account sign up notice."),
		hide_tos_notice: new Option("checkbox", false, "Hide TOS Notice", "Hide the Terms of Service agreement notice."),
		hide_upgrade_notice: new Option("checkbox", false, "Hide Upgrade Notice", "Hide the Danbooru upgrade account notice."),
		image_resize: new Option("checkbox", true, "Resize Images", "Shrink large images to fit the browser window when initially loading an individual post."),
		load_sample_first: new Option("checkbox", true, "Load Sample First", "Load sample images first when viewing an individual post."),
		manage_cookies: new Option("checkbox", false, "Manage Notice Cookies", "When using the options to hide the upgrade, sign up, and/or TOS notice, also create cookies to disable these notices at the server level.<br><br><u>Tip</u><br>Use this feature if the notices keep flashing on your screen before being removed."),
		post_tag_titles: new Option("checkbox", false, "Post Tag Titles", "Change the page titles for individual posts to a full list of the post tags."),
		remove_tag_headers: new Option("checkbox", false, "Remove Tag Headers", "Remove the \"copyrights\", \"characters\", and \"artist\" headers from the sidebar tag list."),
		script_blacklisted_tags: new Option("text", "", "Blacklisted Tags", "Hide images and posts that match the specified tag(s).<br><br><u>Guidelines</u><br>Matches can consist of a single tag or multiple tags. Each match must be separated by a comma and each tag in a match must be separated by a space.<br><br><u>Example</u><br>To filter posts tagged with spoilers and posts tagged with blood AND death, the blacklist would normally look like the following case:<br>spoilers, blood death"),
		search_add: new Option("checkbox", true, "Search Add", "Add + and - links to the sidebar tag list that modify the current search by adding or excluding additional search terms."),
		show_deleted: new Option("checkbox", false, "Show Deleted", "Display all deleted images in the search, pool, popular, and notes listings."),
		show_loli: new Option("checkbox", false, "Show Loli", "Display loli images in the search, pool, popular, comments, and notes listings."),
		show_shota: new Option("checkbox", false, "Show Shota", "Display shota images in the search, pool, popular, comments, and notes listings."),
		single_color_borders: new Option("checkbox", false, "Single Color Borders", "Only use one color for each thumbnail border."),
		thumbnail_count: new Option("dropdown", 0, "Thumbnail Count", "Change the number of thumbnails that display in a search listing.", {txtOptions:["Disabled:0"], numRange:[1,200]}),
		status_borders: borderSet(["deleted", true, "#000000", "solid", "post-status-deleted"], ["flagged", true, "#FF0000", "solid", "post-status-flagged"], ["pending", true, "#0000FF", "solid", "post-status-pending"], ["child", true, "#CCCC00", "solid", "post-status-has-parent"], ["parent", true, "#00FF00", "solid", "post-status-has-children"]),
		tag_borders: borderSet(["loli", true, "#FFC0CB", "solid"], ["shota", true, "#66CCFF", "solid"])
	};

	settings.user = {};
	loadSettings(); // Load user settings.

	settings.inputs = {};
	settings.el = {}; // Menu elements.
	settings.sections = { // Setting sections and ordering.
		browse: new Section("general", ["show_loli", "show_shota", "show_deleted", "thumbnail_count"], "Image Browsing"),
		layout: new Section("general", ["hide_sign_up_notice", "hide_upgrade_notice", "hide_tos_notice", "hide_original_notice", "hide_advertisements", "hide_ban_notice"], "Layout"),
		sidebar: new Section("general", ["search_add", "remove_tag_headers", "autohide_sidebar"], "Tag Sidebar"),
		logged_out: new Section("general", ["image_resize", "load_sample_first", "script_blacklisted_tags"], "Logged Out Settings"),
		misc: new Section("general", ["direct_downloads", "alternate_image_swap", "clean_links", "arrow_nav", "post_tag_titles"], "Misc."),
		pref: new Section("general", ["bypass_api", "manage_cookies"], ""),
		border_options: new Section("general", ["custom_tag_borders", "custom_status_borders", "single_color_borders", "border_width"], "Options"),
		status_borders: new Section("border", "status_borders", "Custom Status Border Styles", "When using custom status borders, you can edit your borders here. For easy color selection, use one of the many free tools on the internet like <a target=\"_blank\" href=\"http://www.quackit.com/css/css_color_codes.cfm\">this one</a>."),
		tag_borders: new Section("border", "tag_borders", "Custom Tag Border Styles", "When using custom tag borders, you can edit your borders here. For easy color selection, use one of the many free tools on the internet like <a target=\"_blank\"  href=\"http://www.quackit.com/css/css_color_codes.cfm\">this one</a>.")
	};

	// Location variables.
	var gUrl = location.href.split("#")[0]; // URL without the anchor
	var gUrlPath = location.pathname; // URL path only
	var gUrlQuery = location.search; // URL query string only
	var gLoc = currentLoc(); // Current location (post = single post, search = posts index, notes = notes index, popular = popular index, pool = single pool, comments = comments page)

	// Script variables.
	// Global
	var show_loli = settings.user["show_loli"];
	var show_shota = settings.user["show_shota"];
	var show_deleted = settings.user["show_deleted"]; // Show all deleted posts.
	var direct_downloads = settings.user["direct_downloads"]; // Allow download managers for thumbnail listings.

	var custom_tag_borders = settings.user["custom_tag_borders"]; //
	var custom_status_borders = settings.user["custom_status_borders"]; // Change the border colors of flagged, parent, child, and pending posts. You may set the colors under "Set Border Colors".
	var single_color_borders = settings.user["single_color_borders"]; // Use simple single color borders.
	var border_width = settings.user["border_width"]; // Set the thumbnail border width.
	var clean_links = settings.user["clean_links"]; // Remove everything after the post ID in the thumbnail URLs. Enabling this disables search navigation for posts and active pool detection for posts.
	var autohide_sidebar = settings.user["autohide_sidebar"]; // Hide the sidebar for individual posts and searches until the mouse comes close to the left side of the window or the sidebar gains focus (ex: By pressing "Q" to focus on the search box).

	var bypass_api = settings.user["bypass_api"]; // Automatically bypass API features when they can't be used.
	var manage_cookies = settings.user["manage_cookies"]; // Create cookies to completely stop notices.

	var hide_sign_up_notice = settings.user["hide_sign_up_notice"];
	var hide_upgrade_notice = settings.user["hide_upgrade_notice"];
	var hide_tos_notice = settings.user["hide_tos_notice"];
	var hide_original_notice = settings.user["hide_original_notice"]; // If you don't need the notice for switching back to the sample image, you can choose to hide it by default. You can also click the "X" on the notice to hide it by default via cookies.
	var hide_advertisements = settings.user["hide_advertisements"];
	var hide_ban_notice = settings.user["hide_ban_notice"];

	// Search
	var arrow_nav = settings.user["arrow_nav"]; // Allow the use of the left and right keys to navigate index pages. Doesn't work when input has focus.
	var search_add = settings.user["search_add"]; // Add the + and - shortcuts to the tag list for including or excluding search terms.
	var thumbnail_count = settings.user["thumbnail_count"]; // Number of thumbnails to display per page. Use a number value of 0 to turn off.

	// Post
	var alternate_image_swap = settings.user["alternate_image_swap"]; // Toggle notes via the options in the sidebar and make clicking the image swap between the original and sample image.
	var image_resize = settings.user["image_resize"]; // When initially loading, scale down large images to fit the browser window as needed. When logged in, your account settings will override this setting.
	var load_sample_first = settings.user["load_sample_first"]; // Use sample images when available. When logged in, your account settings will override this setting.
	var remove_tag_headers = settings.user["remove_tag_headers"]; // Remove the "copyrights", "characters", and "artist" headers from the sidebar tag list.
	var post_tag_titles = settings.user["post_tag_titles"]; // Revert post page titles to the more detailed full list of tags

	// Borders
	var status_borders = settings.user["status_borders"];
	var tag_borders = settings.user["tag_borders"];

	// Blacklist
	// Guidelines: Matches can consist of a single tag or multiple tags. Each match must be separated by a comma and each tag in a match
	// must be separated by a space. The whole blacklist must remain inside of quotation marks. Using empty quotation marks (ex:"") will
	// disable the script blacklist. When logged in, your account blacklist will override this blacklist.
	// Example: To filter posts tagged with spoilers and posts tagged with blood AND death, the blacklist would normally look like the
	// following case: "spoilers, blood death"
	var script_blacklisted_tags = settings.user["script_blacklisted_tags"];

	// List of valid URL's to parse for. Feel free to suggest more!
	var valid_urls = [
		"http://danbooru.donmai.us/",
		"http://testbooru.donmai.us/",
		"http://hijiribe.donmai.us/",
		"http://sonohara.donmai.us/",
		"http://testbooru.donmau.us"
	];

	/* "INIT" */
	customCSS(); // Contains the portions related to ads and notices.

	if (single_color_borders || custom_status_borders || custom_tag_borders)
		delayMe(formatThumbnails);

	if (autohide_sidebar.indexOf(gLoc) > -1)
		autohideSidebar();

	if (!isLoggedIn()) // Immediately apply script blacklist for logged out users.
		delayMe(blacklistInit);

	injectSettings();

	if (useAPI()) // API only features.
		searchJSON(gLoc);
	else // Alternate mode for features.
		modifyPage(gLoc);

	if (clean_links)
		cleanLinks();

	if (arrow_nav && allowArrowNav())
		window.addEventListener("keydown", keyCheck, false);

	if (search_add)
		searchAdd();

	if (remove_tag_headers)
		removeTagHeaders();

	if (post_tag_titles)
		postTagTitles();

	if (thumbnail_count)
		limitFix();

	/* Functions */

	/* Functions for creating a url and retrieving info from it */
	function searchJSON(mode, xml) {
		var numThumbs = document.getElementsByClassName("post-preview").length;
		var limit = "";

		if (mode == "search" || mode == "notes") {
			var numExpected = getVar("limit") || 20;
			var numDesired = 0;

			if (allowUserLimit()) {
				numDesired = thumbnail_count;
				limit = "&limit=" + thumbnail_count;
			}
			else
				numDesired = numExpected;

			if (numThumbs != numDesired || numThumbs < numExpected || direct_downloads) {
				if (mode == "search")
					fetchJSON(gUrl.replace(/\/?(?:posts)?\/?(?:\?|$)/, "/posts.json?") + limit, "search");
				else
					fetchJSON(gUrl.replace(/\/notes\/?(?:\?|$)/, "/notes.json?") + limit, "notes");
			}
		}
		else if (mode == "post") {
			if (!needPostAPI())
				fetchInfo();
			else
				fetchJSON(gUrl.replace(/\/posts\/(\d+).*/, "/posts/$1.json"), "post");
		}
		else if (mode == "popular") {
			if (numThumbs != 20 || direct_downloads)
				fetchJSON(gUrl.replace(/\/popular\/?/, "/popular.json"), "popular");
		}
		else if (mode == "pool") {
			if (numThumbs != 20 || direct_downloads)
				fetchJSON(gUrl.replace(/\/pools\/(\d+)/, "/pools/$1.json"), "pool");
		}
		else if (mode == "poolsearch") {
			var poolIds = xml.post_ids.split(" ");
			var page = getVar("page") || 1;
			var postIds = poolIds.slice((page - 1) * 20, page * 20);

			fetchJSON("/posts.json?tags=status:any+id:" + postIds.join(","), "poolsearch", postIds);
		}
		else if (mode == "comments") {
			if (numThumbs != 5)
				fetchJSON(gUrl.replace(/\/comments\/?/, "/comments.json"), "comments");
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
							parseListing(xml);
						else if (mode == "post")
							parsePost(xml);
						else if (mode == "pool")
							searchJSON("poolsearch", xml);
						else if (mode == "poolsearch")
							parseListing(xml, optArg);
						else if (mode == "comments")
							parseComments(xml);
					}
					else if (xmlhttp.status == 403 || xmlhttp.status == 401) {
						danbNotice('Better Better Booru: Error retrieving information. Access denied. You must be logged in to a Danbooru account to access the API for hidden image information and direct downloads. <br><span style="font-size: smaller;">(<span><a href="#" id="bbb-bypass-api-link">Do not warn me again and automatically bypass API features in the future by using cookies.</a></span>)</span>', true);
						document.getElementById("bbb-bypass-api-link").addEventListener("click", function(event) {
							updateSettings("bypass_api", true);
							this.parentNode.innerHTML="Settings updated. You may change this setting under preferences in the settings panel.";
							event.preventDefault();
						}, false);
					}
					else if (xmlhttp.status == 421)
						danbNotice("Better Better Booru: Error retrieving information. Your Danbooru API access is currently throttled. Please try again later.", true);
					else if (xmlhttp.status == 500)
						danbNotice("Better Better Booru: Error retrieving information. Internal server error.", true);
					else if (xmlhttp.status == 503)
						danbNotice("Better Better Booru: Error retrieving information. Service unavailable.", true);
				}
			};
			xmlhttp.open("GET", url, true);
			xmlhttp.send(null);
		}
	}

	function modifyPage(mode) {
		// Let other functions that don't require the API run. (Alternative to searchJSON)
		if (mode == "post") {
			if (!needPostAPI())
				fetchInfo();
		}
		else if (mode == "search" || mode == "notes") {
			if (allowUserLimit()) {
				var url = gUrl;

				if (/\?/.test(url))
					url += "&limit=" + thumbnail_count;
				else
					url += "?limit=" + thumbnail_count;

				fetchPages(url, "thumbnails");
			}
		}
	}

	function fetchInfo() {
		// Retrieve info in the page. (Alternative to fetchJSON)
		var infoLink = document.evaluate('//aside[@id="sidebar"]/section/ul/li/a[starts-with(@href, "/data/")]', document, null, 9, null).singleNodeValue;
		var infoHref = infoLink.href;
		var infoSection = infoLink.parentNode.parentNode;
		var imgHeight = 0;
		var imgWidth = 0;
		var hasLarge = false;
		var childNotice = document.getElementsByClassName("notice-child");

		if (document.getElementById("image")) { // Regular image.
			var img = document.getElementById("image");

			imgHeight = Number(img.getAttribute("data-original-height"));
			imgWidth = Number(img.getAttribute("data-original-width"));
			hasLarge = (Number(img.getAttribute("data-original-width")) > 850 ? true : false);
		}
		else if (document.getElementById("image-container").getElementsByTagName("object")[0]) { // Flash object.
			var object = document.getElementById("image-container").getElementsByTagName("object")[0];

			imgHeight = Number(object.getAttribute("height"));
			imgWidth = Number(object.getAttribute("width"));
			hasLarge = false;
		}
		else if (/The artist requested removal/.test(document.getElementById("image-container").textContent)) { // Image removed by artist request.
			var infoText = infoLink.parentNode.textContent;

			imgHeight = Number(/\(\d+x(\d+)\)/.exec(infoText)[1]);
			imgWidth = Number(/\((\d+)x\d+\)/.exec(infoText)[1]);
			hasLarge = (Number(/\((\d+)x\d+\)/.exec(infoText)[1]) > 850 ? true : false);
		}
		else { // Manual download.
			imgHeight = null;
			imgWidth = null;
			hasLarge = false;
		}

		var imgInfo = {
			id: Number(fetchMeta("post-id")),
			file_ext: /data\/.+?\.(.+?)$/.exec(infoHref)[1],
			md5: /data\/(.+?)\..+?$/.exec(infoHref)[1],
			url: infoHref,
			fav_count: Number(document.getElementById("favcount-for-post-" + fetchMeta("post-id")).textContent),
			has_children: (document.getElementsByClassName("notice-parent").length ? true : false),
			parent_id: (childNotice.length ? Number(/\d+/.exec(childNotice[0].children[0].href)[0]) : null),
			rating: /Rating:\s*(\w)/.exec(infoSection.textContent)[1].toLowerCase(),
			score: Number(document.getElementById("score-for-post-" + fetchMeta("post-id")).textContent),
			tag_string: fetchMeta("tags"),
			uploader_name: /Uploader:\s*(.+?)\s*»/.exec(infoSection.textContent)[1],
			is_deleted: (fetchMeta("post-is-deleted") == "false" ? false : true),
			is_flagged: (fetchMeta("post-is-flagged") == "false" ? false : true),
			is_pending: (fetchMeta("post-is-approvable" == "false" ? false : true)),
			image_height: imgHeight,
			image_width: imgWidth,
			has_large: hasLarge,
			exists: true
		};

		delayMe(function(){parsePost(imgInfo);}); // Delay is needed to force the script to pause and allow Danbooru to do whatever. It essentially mimics the async nature of the API call.
	}

	function fetchPages(url, mode, optArg) {
		// Retrieve an actual page for certain pieces of information.
		var xmlhttp = new XMLHttpRequest();

		if (xmlhttp !== null) {
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState == 4) { // 4 = "loaded"
					if (xmlhttp.status == 200) { // 200 = "OK"

						if (mode == "paginator") { // Fetch updated paginator for first page of searches.
							var paginator = optArg;
							var newPaginator = /<div class="paginator">(.+?)<\/div>/i.exec(xmlhttp.responseText)[1];

							if (newPaginator)
								paginator.innerHTML = newPaginator;
						}
						else if (mode == "comments") { // Fetch post to get comments and tag colors.
							var childSpan = document.createElement("span");
							var post = optArg[0];
							var postId = optArg[1];

							// Fix the tag colors.
							childSpan.innerHTML = /<section id="tag-list">[\S\s]+?<\/section>/i.exec(xmlhttp.responseText)[0];

							var target = post.getElementsByClassName("row list-of-tags")[0];

							for (var i = 1; i < 5; i++) {
								var category = "category-" + i;
								var categoryList = childSpan.getElementsByClassName(category);

								if (categoryList) {
									for (var j = 0, cll = categoryList.length; j < cll; j++) {
										var tag = categoryList[j].children[1].textContent;
										var match = new RegExp('(<span class="category-)0("> <[^>]+>' + escapeRegEx(tag) + '<\/a> <\/span>)', "i");

										target.innerHTML = target.innerHTML.replace(match, "$1" + i + "$2");
									}
								}
							}

							// Fix the comments.
							childSpan.innerHTML = /<div class="row notices">[\S\s]+?<\/form>[\S\s]+?<\/div>/i.exec(xmlhttp.responseText)[0];

							var comments = childSpan.getElementsByClassName("comment");
							var numComments = comments.length;
							var toShow = 6; // Number of comments to display.

							if (numComments > toShow) {
								for (var i = 0, toHide = numComments - toShow; i < toHide; i++)
									comments[i].style.display = "none";

								childSpan.getElementsByClassName("row notices")[0].innerHTML = '<span class="info" id="threshold-comments-notice-for-' + postId + '"> <a href="/comments?include_below_threshold=true&amp;post_id=' + postId + '" data-remote="true">Show all comments</a> </span>';
							}

							// Add it all in and get it ready.
							target = post.getElementsByClassName("comments-for-post")[0];

							while (childSpan.children[0])
								target.appendChild(childSpan.children[0]);

							Danbooru.Comment.initialize_all();
						}
						else if (mode == "thumbnails") { // Fetch the thumbnails and paginator from the page of a search and replace the existing ones.
							var childSpan = document.createElement("span");
							var divId = (gLoc == "search" ? "posts" : "a-index");
							var divRegEx = new RegExp('<div id="' + divId + '">([\\S\\s]+?class="paginator"[\\S\\s]+?<\\/div>[\\S\\s]+?)<\\/div>', "i");

							childSpan.innerHTML = divRegEx.exec(xmlhttp.responseText)[1];

							document.getElementById(divId).innerHTML = childSpan.innerHTML;

							// Thumbnail classes and titles
							formatThumbnails();

							// Blacklist
							blacklistInit();

							// Clean links
							if (clean_links)
								cleanLinks();
						}
					}
					else if (xmlhttp.status == 500)
						danbNotice("Better Better Booru: Error retrieving information. Internal server error.", true);
					else if (xmlhttp.status == 503)
						danbNotice("Better Better Booru: Error retrieving information. Service unavailable.", true);
				}
			};
			xmlhttp.open("GET", url, true);
			xmlhttp.send(null);
		}
	}

	/* Functions for creating content from retrieved info */
	function parseListing(xml, optArg) {
		var out = "";
		var posts = xml;
		var search = "";
		var where;
		var paginator = document.getElementsByClassName("paginator")[0];

		// If no posts, do nothing.
		if (!posts.length)
			return;

		// Use JSON results for searches and pool collections.
		if (gLoc == "search") {
			where = document.getElementById("posts");
			search = (/tags=/.test(gUrlQuery) && !clean_links ? "?tags=" + getVar("tags") : "");
		}
		else if (gLoc == "popular") {
			where = document.getElementById("a-index");
			out = document.getElementById("a-index").innerHTML.split("<article")[0];
		}
		else if (gLoc == "pool") {
			var orderedPostIds = optArg;
			where = document.getElementById("a-show").getElementsByTagName("section")[0];
			search = (!clean_links ? "?pool_id=" + /\/pools\/(\d+)/.exec(gUrlPath)[1] : "");
			out = "\f,;" + orderedPostIds.join("\f,;");
		}
		else if (gLoc == "notes") {
			where = document.getElementById("a-index");
			out = "<h1>Notes</h1>";
		}

		// Result preparation.
		for (var i = 0, pl = posts.length; i < pl; i++) {
			var post = formatJSON(posts[i]);
			var outId = "";
			var thumb = "";

			// Don't display loli/shota if the user has opted so and skip to the next image.
			if ((!show_loli && /\bloli\b/.test(post.tag_string)) || (!show_shota && /\bshota\b/.test(post.tag_string)) || (!show_deleted && post.is_deleted)) {
				if (gLoc == "pool") {
					outId = new RegExp("\f,;" + post.id + "(?=<|\f|$)");
					out = out.replace(outId, "");
				}

				continue;
			}

			// eek, huge line.
			thumb = '<article class="post-preview' + post.thumb_class + '" id="post_' + post.id + '" data-id="' + post.id + '" data-tags="' + post.tag_string + '" data-user="' + post.uploader_name + '" data-uploader="' + post.uploader_name + '" data-rating="' + post.rating + '" data-width="' + post.image_width + '" data-height="' + post.image_height + '" data-flags="' + post.flags + '" data-parent-id="' + post.parent + '" data-has-children="' + post.has_children + '" data-score="' + post.score + '"><a href="/posts/' + post.id + search + '"><img src="' + post.thumb_url + '" alt="' + post.tag_string + '"></a></article>';

			if (direct_downloads)
				thumb += '<a style="display: none;" href="' + post.file_url + '">Direct Download</a></span>';

			// Generate output
			if (gLoc == "search" || gLoc == "notes" || gLoc == "popular")
				out += thumb;
			else if (gLoc == "pool") {
				outId = new RegExp("\f,;" + post.id + "(?=<|\f|$)");
				out = out.replace(outId, thumb);
			}
		}

		// Replace results with new results.
		if (paginator) {
			where.innerHTML = out + outerHTML(paginator);
			paginator = document.getElementsByClassName("paginator")[0];

			if ((gLoc == "search" || gLoc == "notes") && (allowUserLimit())) {
				// Fix existing paginator with user's custom limit.
				var pageLinks = document.evaluate('.//a', paginator, null, 6, null);

				for (var i = 0, isl = pageLinks.snapshotLength; i < isl; i++)
					pageLinks.snapshotItem(i).href = pageLinks.snapshotItem(i).href + "&limit=" + thumbnail_count;

				// Attempt to fix the paginator by retrieving it from an actual page. Might not work if connections are going slowly.
				var pageUrl = gUrl;

				if (/\?/.test(pageUrl))
					pageUrl += "&limit=" + thumbnail_count;
				else
					pageUrl += "?limit=" + thumbnail_count;

				fetchPages(pageUrl, "paginator", paginator);
			}
		}
		else
			where.innerHTML = out;

		// Thumbnail classes and titles
		formatThumbnails();

		// Blacklist
		blacklistInit();
	}

	function parsePost(xml) {
		var post = formatJSON(xml);
		var container = document.getElementById("image-container");

		if (post.id) {
			var ratio = (post.image_width > 850 ? 850 / post.image_width : 1);
			var sampHeight = Math.round(post.image_height * ratio);
			var sampWidth = Math.round(post.image_width * ratio);
			var newWidth = 0;
			var newHeight = 0;
			var newUrl = "";
			var altTxt = "";

			if (post.file_ext == "swf") // Create flash object.
				container.innerHTML = '<div id="note-container"></div> <object height="' + post.image_height + '" width="' + post.image_width + '"> <params name="movie" value="' + post.file_url + '"> <embed allowscriptaccess="never" src="' + post.file_url + '" height="' + post.image_height + '" width="' + post.image_width + '"> </params> </object> <p><a href="' + post.file_url + '">Save this flash (right click and save)</a></p>';
			else if (!post.image_height) // Create manual download.
				container.innerHTML = '<p><a href="' + post.file_url + '">Save this file (right click and save)</a></p>';
			else { // Create image
				var useSample = (checkSetting("default-image-size", "large", load_sample_first) && post.has_large);

				if (useSample) {
					newWidth = sampWidth;
					newHeight = sampHeight;
					newUrl = post.samp_url;
					altTxt = "sample";
				}
				else {
					newWidth = post.image_width;
					newHeight = post.image_height;
					newUrl = post.file_url;
					altTxt = post.md5;
				}

				container.innerHTML = '<div id="note-container"></div> <img alt="' + altTxt + '" data-fav-count="' + post.fav_count + '" data-flags="' + post.flags + '" data-has-children="' + post.has_children + '" data-parent-id="' + post.parent + '" data-large-height="' + sampHeight + '" data-large-width="' + sampWidth + '" data-original-height="' + post.image_height + '" data-original-width="' + post.image_width + '" data-rating="' + post.rating + '" data-score="' + post.score + '" data-tags="' + post.tag_string + '" data-user="' + post.uploader_name + '" data-uploader="' + post.uploader_name + '" height="' + newHeight + '" width="' + newWidth + '" id="image" src="' + newUrl + '" /> <img src="about:blank" height="1" width="1" id="bbb-loader" style="position: absolute; right: 0px; top: 0px; display: none;"/>';
				var img = document.getElementById("image");
				var bbbLoader = document.getElementById("bbb-loader");

				// Enable image swapping between the original and sample image.
				if (post.has_large) {
					// Remove the original notice (it's not always there) and replace it with our own.
					var resizeNotice = document.getElementById("image-resize-notice");

					if (resizeNotice)
						resizeNotice.parentNode.removeChild(resizeNotice);

					var bbbResizeNotice = document.createElement("div");
					bbbResizeNotice.className = "ui-corner-all ui-state-highlight notice notice-resized";
					bbbResizeNotice.style.position = "relative";
					bbbResizeNotice.style.display = "none";
					bbbResizeNotice.innerHTML = '<span id="bbb-sample-notice" style="display:none;">Resized to ' + Math.round(ratio * 100) + '% of original (<a href="' + post.file_url + '" id="bbb-original-link">view original</a>)</span><span id="bbb-original-notice" style="display:none;">Viewing original (<a href="' + post.samp_url + '" id="bbb-sample-link">view sample</a>)</span> <span id="bbb-img-status"></span><span style="display: none;" class="close-button ui-icon ui-icon-closethick" id="close-original-notice"></span>';
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
					else if (!hide_original_notice) {
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
							if (hide_original_notice)
								bbbResizeNotice.style.display = "none";
							else {
								sampleNotice.style.display = "none";
								originalNotice.style.display = "";
								closeOriginalNotice.style.display = "";
							}

							img.setAttribute("height", post.image_height);
							img.setAttribute("width", post.image_width);

							if (!swapInit) {
								bbbInfo.resized = false;
								img.style.height = post.image_height + "px";
								img.style.width = post.image_width + "px";
								Danbooru.Note.Box.scale_all();
								if (Danbooru.Post.place_jlist_ads)
									Danbooru.Post.place_jlist_ads();
							}
						}
						else {
							sampleNotice.style.display = "";
							originalNotice.style.display = "none";
							closeOriginalNotice.style.display = "none";
							img.setAttribute("height", sampHeight);
							img.setAttribute("width", sampWidth);

							if (!swapInit) {
								bbbInfo.resized = false;
								img.style.height = sampHeight + "px";
								img.style.width = sampWidth + "px";
								Danbooru.Note.Box.scale_all();
								if (Danbooru.Post.place_jlist_ads)
									Danbooru.Post.place_jlist_ads();
							}
						}
					}, false);
					closeOriginalNotice.addEventListener("click", function(event) {
						bbbResizeNotice.style.display = "none";
						updateSettings("hide_original_notice", true);
					}, false);
				}

				// Favorites listing.
				var postID = post.id;
				var favItem = document.getElementById("favcount-for-post-" + postID).parentNode;

				if (!favItem.children[1] && isLoggedIn()) {
					favItem.innerHTML += '<a href="/favorites?post_id=' + postID + '" data-remote="true" id="show-favlist-link">&raquo;</a><a href="#" data-remote="true" id="hide-favlist-link">&laquo;</a><div id="favlist"></div>';
					Danbooru.Post.initialize_favlist();
				}

				// Enable the "Resize to window", "Toggle Notes", and "Find similar" options for logged out users.
				if (!isLoggedIn()) {
					var options = document.createElement("section");
					var history = document.evaluate('//aside[@id="sidebar"]/section[last()]', document, null, 9, null).singleNodeValue;

					options.innerHTML = '<h1>Options</h1><ul><li><a href="#" id="image-resize-to-window-link">Resize to window</a></li>' + (alternate_image_swap ? '<li><a href="#" id="listnotetoggle">Toggle notes</a></li>' : '') + '<li><a href="http://danbooru.iqdb.org/db-search.php?url=http://danbooru.donmai.us/ssd/data/preview/' + post.md5 + '.jpg">Find similar</a></li></ul>';
					history.parentNode.insertBefore(options, history);
				}

				// Make the "Add note" link work.
				if (!post.exists && document.getElementById("translate") !== null)
					document.getElementById("translate").addEventListener("click", Danbooru.Note.TranslationMode.start, false);

				if (!alternate_image_swap) // Make notes toggle when clicking the image.
					img.addEventListener("click", Danbooru.Note.Box.toggle_all, false);
				else { // Make sample/original images swap when clicking the image.
					// Make a "Toggle Notes" link in the options bar.
					if (document.getElementById("listnotetoggle") === null) { // For logged in users.
						var translateOption = document.getElementById("translate").parentNode;
						var listNoteToggle = document.createElement("li");

						listNoteToggle.innerHTML = '<a href="#" id="listnotetoggle">Toggle notes</a>';
						translateOption.parentNode.insertBefore(listNoteToggle, translateOption);
					}

					document.getElementById("listnotetoggle").addEventListener("click", function(event) {Danbooru.Note.Box.toggle_all(); event.preventDefault();}, false);

					// Make clicking the image swap between the original and sample image when available.
					if (post.has_large) {
						img.addEventListener("click", function(event) {
							if (/\/sample\//.test(img.src)) {
								if (swapInit)
									swapInit = false;

								bbbLoader.src = post.file_url;
								imgStatus.innerHTML = "Loading original image...";
							}
							else {
								if (swapInit)
									swapInit = false;

								bbbLoader.src = post.samp_url;
								imgStatus.innerHTML = "Loading sample image...";
							}
						}, false);
					}
				}

				// Alter the "resize to window" link.
				var resizeLink = document.getElementById("image-resize-to-window-link");
				var resizeLinkClone = resizeLink.cloneNode(true);
				resizeLinkClone.addEventListener("click", function(event) {resizeImage(); event.preventDefault();}, false);
				resizeLink.parentNode.replaceChild(resizeLinkClone, resizeLink);

				// Resize the image if desired.
				if (checkSetting("always-resize-images", "true", image_resize))
					resizeImage();

				// Load/reload notes.
				Danbooru.Note.load_all();
			}

		// Blacklist
		blacklistInit();
		}
	}

	function parseComments(xml) {
		var posts = xml;
		var existingPosts = document.getElementsByClassName("post post-preview"); // Live node list so adding/removing a "post post-preview" class item immediately changes this.
		var eci = 0;
		var endTotal = 5;

		for (var i = 0, pl = posts.length; i < pl; i++) {
			var post = formatJSON(posts[i]);
			var existingPost = existingPosts[eci];

			if (!existingPost || post.id != existingPost.getAttribute("data-id")) {
				if (!/\b(?:loli|shota)\b/.test(post.tag_string)) // API post isn't loli/shota and doesn't exist on the page so the API has different information. Skip it and try to find where the page's info matches up.
					continue;
				else if ((!show_loli && /\bloli\b/.test(post.tag_string)) || (!show_shota && /\bshota\b/.test(post.tag_string))) { // Skip loli/shota if the user has selected to do so.
					endTotal--;
					continue;
				}

				// Prepare the post information.
				var tagLinks = post.tag_string.split(" ");

				for (var j = 0, tll = tagLinks.length; j < tll; j++)
					tagLinks[j] = '<span class="category-0"> <a href="/posts?tags=' + encodeURIComponent(tagLinks[j]) + '">' + tagLinks[j].replace(/_/g, " ") + '</a> </span> ';

				tagsLinks = tagLinks.join(" ");

				// Create the new post.
				var childSpan = document.createElement("span");

				childSpan.innerHTML = '<div class="post post-preview' + post.thumb_class + '" data-tags="' + post.tag_string + '" data-user="' + post.uploader_name + '" data-uploader="' + post.uploader_name + '" data-rating="' + post.rating + '" data-flags="' + post.flags + '" data-score="' + post.score + '" data-parent-id="' + post.parent + '" data-has-children="' + post.has_children + '" data-id="' + post.id + '" data-width="' + post.image_width + '" data-height="' + post.image_height + '"> <div class="preview"> <a href="/posts/' + post.id + '"> <img alt="' + post.md5 + '" src="' + post.thumb_url + '" /> </a> </div> <div class="comments-for-post" data-post-id="' + post.id + '"> <div class="header"> <div class="row"> <span class="info"> <strong>Date</strong> <time datetime="' + post.created_at + '" title="' + post.created_at.replace(/(.+)T(.+)-(.+)/, "$1 $2 -$3") + '">' + post.created_at.replace(/(.+)T(.+):\d+-.+/, "$1 $2") + '</time> </span> <span class="info"> <strong>User</strong> <a href="/users/' + post.uploader_id + '">' + post.uploader_name + '</a> </span> <span class="info"> <strong>Rating</strong> ' + post.rating + ' </span> <span class="info"> <strong>Score</strong> <span> <span id="score-for-post-' + post.id + '">' + post.score + '</span> </span> </span> </div> <div class="row list-of-tags"> <strong>Tags</strong>' + tagsLinks + '</div> </div> </div> <div class="clearfix"></div> </div>';

				if (!existingPost) // There isn't a next post so append the new post to the end before the paginator.
					document.getElementById("a-index").insertBefore(childSpan.firstChild, document.getElementsByClassName("paginator")[0]);
				else // Insert new post before the post that should follow it.
					existingPost.parentNode.insertBefore(childSpan.firstChild, existingPost);

				// Get the tag colors and comments.
				fetchPages("/posts/" + post.id, "comments", [existingPosts[eci], post.id]);
			}

			eci++;
		}

		// If we don't have the expected number of posts, the API info and page are too out of sync.
		if (existingPosts.length != endTotal)
			danbNotice("Better Better Booru: Loading of hidden loli/shota post(s) failed. Please refresh.", true);

		// Thumbnail classes and titles
		formatThumbnails();

		// Blacklist
		blacklistInit();
	}

	/* Functions for the settings panel */
	function injectSettings() {
		var menu = document.getElementById("top");
		menu = menu.getElementsByTagName("menu");
		menu = menu[0];

		var link = document.createElement("a");
		link.href = "#";
		link.innerHTML = "BBB Settings";
		link.addEventListener("click", function(event) {
			showSettings();
			event.preventDefault();
		}, false);

		var item = document.createElement("li");
		item.appendChild(link);

		var menuItems = menu.getElementsByTagName("li");
		menu.insertBefore(item, menuItems[menuItems.length - 1]);
	}

	function showSettings() {
		if (settings.el.menu) {
			settings.el.menu.style.display = "block";
			settings.el.scrollDiv.scrollTop = 0;
			return;
		}

		var menu = document.createElement("div");
		menu.id = "bbb_menu";
		menu.style.visibility = "hidden";
		settings.el.menu = menu;

		var header = document.createElement("h1");
		header.innerHTML = "Better Better Booru Settings";
		header.style.textAlign = "center";
		menu.appendChild(header);

		var tabBar = document.createElement("div");
		tabBar.style.padding = "0px 15px";
		menu.appendChild(tabBar);

		var generalTab = document.createElement("a");
		generalTab.name = "general";
		generalTab.href = "#";
		generalTab.innerHTML = "General";
		generalTab.className = "bbb-tab bbb-active-tab";
		generalTab.addEventListener("click", function(event) {
			changeTab(this);
			event.preventDefault();
		}, false);
		tabBar.appendChild(generalTab);

		var borderTab = document.createElement("a");
		borderTab.name = "borders";
		borderTab.href = "#";
		borderTab.innerHTML = "Borders";
		borderTab.className = "bbb-tab";
		borderTab.addEventListener("click", function(event) {
			changeTab(this);
			event.preventDefault();
		}, false);
		tabBar.appendChild(borderTab);

		var prefTab = document.createElement("a");
		prefTab.name = "pref";
		prefTab.href = "#";
		prefTab.innerHTML = "Preferences";
		prefTab.className = "bbb-tab";
		prefTab.addEventListener("click", function(event) {
			changeTab(this);
			event.preventDefault();
		}, false);
		tabBar.appendChild(prefTab);

		var scrollDiv = document.createElement("div");
		scrollDiv.className = "bbb-scroll-div";
		menu.appendChild(scrollDiv);
		scrollDiv.scrollTop = 0;
		settings.el.scrollDiv = scrollDiv;

		var generalPage = document.createElement("div");
		scrollDiv.appendChild(generalPage);
		settings.el.generalPage = generalPage;

		generalPage.bbbCreateSection(settings.sections.browse);
		generalPage.bbbCreateSection(settings.sections.sidebar);
		generalPage.bbbCreateSection(settings.sections.misc);
		generalPage.bbbCreateSection(settings.sections.layout);
		generalPage.bbbCreateSection(settings.sections.logged_out);

		var bordersPage = document.createElement("div");
		bordersPage.style.display = "none";
		scrollDiv.appendChild(bordersPage);
		settings.el.bordersPage = bordersPage;

		bordersPage.bbbCreateSection(settings.sections.border_options);
		bordersPage.bbbCreateSection(settings.sections.status_borders);
		bordersPage.bbbCreateSection(settings.sections.tag_borders);

		var prefPage = document.createElement("div");
		prefPage.style.display = "none";
		scrollDiv.appendChild(prefPage);
		settings.el.prefPage = prefPage;

		prefPage.bbbCreateSection(settings.sections.pref);

		var close = document.createElement("a");
		close.innerHTML = "Save & Close";
		close.href = "#";
		close.className = "bbb-button";
		close.style.marginRight = "15px";
		close.addEventListener("click", function(event) {
			settings.el.menu.style.display = "none";
			saveSettings();
			event.preventDefault();
		}, false);

		var cancel = document.createElement("a");
		cancel.innerHTML = "Cancel";
		cancel.href = "#";
		cancel.className = "bbb-button";
		cancel.addEventListener("click", function(event) {
			loadSettings();
			removeMenu();
			event.preventDefault();
		}, false);

		var reset = document.createElement("a");
		reset.innerHTML = "Reset to Defaults";
		reset.href = "#";
		reset.className = "bbb-button";
		reset.style.cssFloat = "right";
		reset.style.color = "#ff1100";
		reset.addEventListener("click", function(event) {
			loadDefaults();
			removeMenu();
			showSettings();
			event.preventDefault();
		}, false);

		menu.appendChild(close);
		menu.appendChild(cancel);
		menu.appendChild(reset);

		var tip = document.createElement("div");
		tip.className = "bbb-expl";
		menu.appendChild(tip);
		settings.el.tip = tip;


		// Add menu to the DOM and manipulate the dimensions.
		document.body.appendChild(menu);

		var viewHeight = window.innerHeight;
		var scrollDivDiff = menu.clientHeight - scrollDiv.clientHeight;

		scrollDiv.style.maxHeight = viewHeight - menu.bbbGetPadding().height - scrollDivDiff - 25 + "px"; // Subtract 25 for the bottom "margin".
		scrollDiv.style.minWidth = 901 + scrollbarWidth() + 3 + "px"; // Should keep the potential scrollbar from intruding on the original drawn layout if I'm thinking about this correctly. Seems to work in practice anyway.
		scrollDiv.style.paddingLeft = scrollbarWidth() + 3 + "px";

		var viewWidth = window.innerWidth;
		var menuWidth = menu.clientWidth;

		menu.style.left = (viewWidth - menuWidth) / 2 + "px";
		menu.style.visibility = "visible";
	}

	Element.prototype.bbbCreateSection = function(section) {
		var target = this;

		if (section.header) {
			var sectionHeader = document.createElement("h3");
			sectionHeader.innerHTML = section.header;
			sectionHeader.className = "bbb-section-header";
			target.appendChild(sectionHeader);
		}

		if (section.text) {
			var sectionText = document.createElement("div");
			sectionText.innerHTML = section.text;
			sectionText.className = "bbb-section-text";
			target.appendChild(sectionText);
		}

		var sectionDiv = document.createElement("div");
		sectionDiv.className = "bbb-section-options";

		if (section.type == "general") {
			var settingList = section.settings;
			var sll = settingList.length;
			var halfway = (sll > 1 ? Math.ceil(sll / 2) : 0);

			var leftSide = document.createElement("div");
			leftSide.className = "bbb-section-options-left";
			sectionDiv.appendChild(leftSide);

			var rightSide = document.createElement("div");
			rightSide.className = "bbb-section-options-right";
			sectionDiv.appendChild(rightSide);

			var optionTarget = leftSide;

			for (var i = 0; i < sll; i++) {
				var settingName = settingList[i];

				if (halfway && i >= halfway)
						optionTarget = rightSide;

				var newOption = createOption(settingName);
				optionTarget.appendChild(newOption);
			}

			target.appendChild(sectionDiv);
		}
		else if (section.type == "border") {
			var borderSettings = settings.user[section.settings];

			for (var i = 0, bsl = borderSettings.length; i < bsl; i++) {
				var newBorderOption = createBorderOption(borderSettings, i);
				sectionDiv.appendChild(newBorderOption);
			}

			var indexWrapper = document.createElement("div");
			indexWrapper.setAttribute("data-bbb-index", i);
			sectionDiv.appendChild(indexWrapper);

			var borderDivider = document.createElement("div");
			borderDivider.className = "bbb-border-divider";
			indexWrapper.appendChild(borderDivider);

			target.appendChild(sectionDiv);
		}
	};

	function createOption(settingName) {
		var optionObject = settings.options[settingName];
		var userSetting = settings.user[settingName];

		var label = document.createElement("label");
		label.className = "bbb-label";

		var textSpan = document.createElement("span");
		textSpan.className = "bbb-label-text";
		textSpan.innerHTML = optionObject.label;
		label.appendChild(textSpan);

		var inputSpan = document.createElement("span");
		inputSpan.className = "bbb-label-input";
		label.appendChild(inputSpan);

		var item;
		switch (optionObject.type)
		{
			case "dropdown":
				var txtOptions = optionObject.txtOptions;
				var numRange = optionObject.numRange;
				var numList = optionObject.numList;
				var selectOption;

				item = document.createElement("select");
				item.name = settingName;

				if (txtOptions) {
					for (var i = 0, tol = txtOptions.length; i < tol; i++) {
						var txtOption = txtOptions[i].split(":");

						selectOption = document.createElement("option");
						selectOption.innerHTML = txtOption[0];
						selectOption.value = txtOption[1];

						if (selectOption.value == userSetting)
							selectOption.selected = true;

						item.appendChild(selectOption);
					}
				}

				if (numList) {
					for (var i = 0, nll = numList.length; i < nll; i++) {
						selectOption = document.createElement("option");
						selectOption.innerHTML = numList[i];
						selectOption.value = numList[i];

						if (selectOption.value == userSetting)
							selectOption.selected = true;

						item.appendChild(selectOption);
					}
				}

				if (numRange) {
					var i = numRange[0];
					var end = numRange[1];

					while (i <= end) {
						selectOption = document.createElement("option");
						selectOption.innerHTML = i;
						selectOption.value = i;

						if (selectOption.value == userSetting)
							selectOption.selected = true;

						item.appendChild(selectOption);
						i++;
					}
				}

				item.addEventListener("change", function() {
					var selected = this.value;
					settings.user[settingName] = (/^-?\d+(\.\d+)?$/.test(selected) ? Number(selected) : selected);
				}, false);
				break;
			case "checkbox":
				item = document.createElement("input");
				item.name = settingName;
				item.type = "checkbox";
				item.checked = userSetting;
				item.addEventListener("click", function() { settings.user[settingName] = this.checked; }, false);
				break;
			case "text":
				item = document.createElement("input");
				item.name = settingName;
				item.type = "text";
				item.value = userSetting;
				item.addEventListener("change", function() { settings.user[settingName] = this.value.bbbSpaceClean(); }, false);
				break;
			case "number":
				item = document.createElement("input");
				item.name = settingName;
				item.type = "text";
				item.value = userSetting;
				item.addEventListener("change", function() { settings.user[settingName] = Number(this.value); }, false);
				break;
			default:
				console.log("Better Better Booru Error: Unexpected object type. Type: " + optionObject.type);
				break;
		}
		settings.inputs[settingName] = item;
		inputSpan.appendChild(item);

		var explLink = document.createElement("a");
		explLink.innerHTML = "?";
		explLink.href = "#";
		explLink.className = "bbb-expl-link";
		explLink.addEventListener("click", function(event) { event.preventDefault(); }, false);
		explLink.bbbSetTip(settings.options[settingName].expl);
		inputSpan.appendChild(explLink);

		return label;
	}

	function createBorderOption(borderSettings, i) {
		var borderItem = borderSettings[i];
		var isStatus = (borderItem.class_name ? true : false);

		var borderSpacer = document.createElement("span");
		borderSpacer.className = "bbb-border-spacer";

		var indexWrapper = document.createElement("div");
		indexWrapper.setAttribute("data-bbb-index", i);

		var borderDivider = document.createElement("div");
		borderDivider.className = "bbb-border-divider";
		indexWrapper.appendChild(borderDivider);

		var borderDiv = document.createElement("div");
		borderDiv.className = "bbb-border-div";
		indexWrapper.appendChild(borderDiv);

		var borderBarDiv = document.createElement("div");
		borderBarDiv.className = "bbb-border-bar";
		borderDiv.appendChild(borderBarDiv);

		var enableLabel = document.createElement("label");
		enableLabel.innerHTML = "Enabled:";
		borderBarDiv.appendChild(enableLabel);

		var enableBox = document.createElement("input");
		enableBox.type = "checkbox";
		enableBox.checked = borderItem.is_enabled;
		enableBox.addEventListener("click", function() { borderItem.is_enabled = this.checked; }, false);
		enableLabel.appendChild(enableBox);

		var editSpan = document.createElement("span");
		editSpan.innerHTML = "Edit:";
		editSpan.style.cssFloat = "right";
		borderBarDiv.appendChild(editSpan);

		var moveButton = document.createElement("a");
		moveButton.href = "#";
		moveButton.innerHTML = "Move";
		moveButton.className = "bbb-border-button";
		moveButton.addEventListener("click", function(event) {
			moveBorder(borderSettings, indexWrapper);
			event.preventDefault();
		}, false);
		moveButton.bbbSetTip("Click the blue highlighted area that indicates where you would like to move this border.");
		editSpan.appendChild(moveButton);

		var previewButton = document.createElement("a");
		previewButton.href = "#";
		previewButton.innerHTML = "Preview";
		previewButton.className = "bbb-border-button";
		previewButton.addEventListener("click", function(event) { event.preventDefault(); }, false);
		previewButton.bbbBorderPreview(borderItem);
		editSpan.appendChild(previewButton);

		if (!isStatus) {
			var deleteButton = document.createElement("a");
			deleteButton.href = "#";
			deleteButton.innerHTML = "Delete";
			deleteButton.className = "bbb-border-button";
			deleteButton.addEventListener("click", function(event) {
				deleteBorder(borderSettings, indexWrapper);
				event.preventDefault();
			}, false);
			editSpan.appendChild(deleteButton);

			var newButton = document.createElement("a");
			newButton.href = "#";
			newButton.innerHTML = "New";
			newButton.className = "bbb-border-button";
			newButton.addEventListener("click", function(event) {
				newBorder(borderSettings, indexWrapper);
				event.preventDefault();
			}, false);
			newButton.bbbSetTip("Click the blue highlighted area that indicates where you would like to create a border.");
			editSpan.appendChild(newButton);
		}

		editSpan.appendChild(borderSpacer.cloneNode(false));

		var helpButton = document.createElement("a");
		helpButton.href = "#";
		helpButton.innerHTML = "Help";
		helpButton.className = "bbb-border-button";
		helpButton.addEventListener("click", function(event) { event.preventDefault(); }, false);
		helpButton.bbbSetTip("<u><b>Border Options</b></u><br><b>Enabled:</b> When checked, the border will be applied. When unchecked, it won't be applied.<br><br><b>Status/Tags:</b> Describes the posts that the border should be applied to. For custom tag borders, you may specify the rules the post must match for the border to be applied.<br><br><b>Color:</b> Set the color of the border. Hex RGB color codes (#00000, #FFFFFF, etc.) are the recommended values.<br><br><b>Style:</b> Set how the border looks. Please note that double only works with a border width of 3.<br><br><b>Move:</b> Move the border to a new position. Higher borders have higher priority. In the event of a post matching more than 4 borders, the first 4 borders get applied and the rest are ignored. If single color borders are enabled, only the first matching border is applied.<br><br><b>Preview:</b> Display a preview of the border's current settings.<br><br><b>Delete:</b> Remove the border and its settings.<br><br><b>New:</b> Create a new border.");
		editSpan.appendChild(helpButton);

		var borderSettingsDiv = document.createElement("div");
		borderSettingsDiv.className = "bbb-border-settings";
		borderDiv.appendChild(borderSettingsDiv);

		var nameLabel  = document.createElement("label");
		borderSettingsDiv.appendChild(nameLabel);

		if (isStatus)
			nameLabel.innerHTML = "Status:" + borderItem.tags;
		else {
			nameLabel.innerHTML = "Tags:";

			var nameInput = document.createElement("input");
			nameInput.type = "text";
			nameInput.value = borderItem.tags;
			nameInput.addEventListener("change", function() { borderItem.tags = this.value.bbbSpaceClean(); }, false);
			nameInput.style.width = "400px";
			nameLabel.appendChild(nameInput);

			var nameTip = document.createElement("a");
			nameTip.href = "#";
			nameTip.innerHTML = "?";
			nameTip.className = "bbb-expl-link";
			nameTip.addEventListener("click", function(event) { event.preventDefault(); }, false);
			nameTip.bbbSetTip("For creating border match rules, please consult the following examples:<ul><li><b>tag1 tag2</b> - Match posts with tag1 AND tag2.</li><li><b>-tag1</b> - Match posts without tag1.</li><li><b>tag1 -tag2</b> - Match posts with tag1 AND without tag2.</li><li><b>~tag1 ~tag2</b> - Match posts with tag1 OR tag2.</li><li><b>~tag1 ~-tag2</b> - Match posts with tag1 OR without tag2.</li><li><b>tag1 ~tag2 ~tag3</b> - Match posts with tag1 AND either tag2 OR tag3.</li><li><b>rating:safe</b> - Match posts rated safe.</li><li><b>user:albert</b> - Match posts made by Albert.</li></ul>");
			nameLabel.appendChild(nameTip);
		}

		var otherSpan = document.createElement("span");
		otherSpan.style.cssFloat = "right";
		borderSettingsDiv.appendChild(otherSpan);

		var colorLabel = document.createElement("label");
		colorLabel.innerHTML = "Color:";
		otherSpan.appendChild(colorLabel);

		var colorInput = document.createElement("input");
		colorInput.type = "text";
		colorInput.value = borderItem.border_color;
		colorInput.addEventListener("change", function() { borderItem.border_color = this.value.bbbSpaceClean(); }, false);
		colorLabel.appendChild(colorInput);

		otherSpan.appendChild(borderSpacer.cloneNode(false));

		var styleLabel = document.createElement("label");
		styleLabel.innerHTML = "Style:";
		otherSpan.appendChild(styleLabel);

		var styleDrop = document.createElement("select");
		styleDrop.addEventListener("change", function() { borderItem.border_style = this.value; }, false);
		styleLabel.appendChild(styleDrop);

		var solidOption = document.createElement("option");
		solidOption.innerHTML = "solid";
		solidOption.value = "solid";
		styleDrop.appendChild(solidOption);

		var dashedOption = document.createElement("option");
		dashedOption.innerHTML = "dashed";
		dashedOption.value = "dashed";
		styleDrop.appendChild(dashedOption);

		var dottedOption = document.createElement("option");
		dottedOption.innerHTML = "dotted";
		dottedOption.value = "dotted";
		styleDrop.appendChild(dottedOption);

		var doubleOption = document.createElement("option");
		doubleOption.innerHTML = "double";
		doubleOption.value = "double";
		styleDrop.appendChild(doubleOption);

		var styleOptions = styleDrop.getElementsByTagName("option");

		for (var i = 0; i < 4; i++) {
			if (styleOptions[i].value == borderItem.border_style) {
				styleOptions[i].selected = true;
				break;
			}
		}

		return indexWrapper;
	}

	function createTextSection(target, header, text) {
		if (header) {
			var sectionHeader = document.createElement("h3");
			sectionHeader.innerHTML = header;
			sectionHeader.className = "bbb-section-header";
			target.appendChild(sectionHeader);
		}

		if (text) {
			var desc = document.createElement("div");
			desc.innerHTML = text;
			target.appendChild(desc);
		}
	}

	function Option(type, def, lbl, expl, optPropObject) {
		/*
		 * Option type notes
		 * =================
		 * By specifying a unique type, you can create a specialized menu option.
		 *
		 * Checkbox, text, and number do not require any extra properties.
		 *
		 * Dropdown requires either txtOptions, numRange, or numList.
		 * txtOptions = Array containing a list of options and their values separated by a colon. (ex: ["option1:value1", "option2:value2"])
		 * numRange = Array containing the starting and ending numbers of the number range.
		 * numList = Array containing a list of the desired numbers.
		 * If more than one of these is provided, they are added to the list in this order: txtOptions, numList, numRange
		 */

		this.type = type;
		this.def = def; // Default.
		this.label = lbl;
		this.expl = expl; // Explanation.

		if (optPropObject) { // Additional properties provided in the form of an object.
			for (var i in optPropObject)
				this[i] = optPropObject[i];
		}
	}

	function Section(type, settingList, header, text) {
		/*
		 * Section type notes
		 * ==================
		 * Current section types are general and border.
		 *
		 * The setting list for general sections are provided in the form of an array containing the settings names as string.
		 * The setting list for border sections is the setting name as a string.
		 */

		this.type = type;
		this.settings = settingList;
		this.header = header;
		this.text = text;
	}

	function Border(tags, isEnabled, color, style, className) {
		this.tags = tags;
		this.is_enabled = isEnabled;
		this.border_color = color;
		this.border_style = style;
		this.class_name = className;
	}

	function borderSet() {
		var formatted = [];

		for (var i = 0, al = arguments.length; i < al; i++) {
			var border = arguments[i];

			formatted.push(new Border(border[0], border[1], border[2], border[3], border[4]));
		}

		return formatted;
	}

	function resetBorderElements(section) {
		var borderElements = section.children;

		for (var i = 0, bel = borderElements.length; i < bel; i ++) {
			var borderElement = borderElements[i];

			borderElement.className = borderElement.className.replace(/\s?bbb-no-highlight/, "");
			borderElement.setAttribute("data-bbb-index", i);
		}
	}

	function deleteBorder(borderSettings, borderElement) {
		var section = borderElement.parentNode;
		var index = Number(borderElement.getAttribute("data-bbb-index"));

		section.removeChild(borderElement);
		borderSettings.splice(index,1);

		if (borderSettings.length == 0) {
			// If no borders are left, add a new blank border.
			var newBorderItem = new Border("", false, "#000000", "solid");
			borderSettings.splice(0, 0, newBorderItem);

			var newBorderElement = createBorderOption(borderSettings, 0);
			section.insertBefore(newBorderElement, section.children[0]);
		}

		resetBorderElements(section);
	}

	function moveBorder(borderSettings, borderElement) {
		var section = borderElement.parentNode;
		var index = Number(borderElement.getAttribute("data-bbb-index"));

		borderElement.className += " bbb-no-highlight";
		borderElement.nextSibling.className += " bbb-no-highlight";
		settings.borderMode = {mode:"move", settings:borderSettings, section:section, index:index, element:borderElement};
		section.className += " bbb-insert-highlight";
		settings.el.menu.addEventListener("click", insertBorder, true);
	}

	function newBorder(borderSettings, borderElement) {
		var section = borderElement.parentNode;

		settings.borderMode = {mode:"new", settings:borderSettings, section:section};
		section.className += " bbb-insert-highlight";
		settings.el.menu.addEventListener("click", insertBorder, true);
	}

	function insertBorder (event) {
		var target = event.target;
		var section = settings.borderMode.section;

		if (target.className == "bbb-border-divider") {
			var newIndex = Number(target.parentNode.getAttribute("data-bbb-index"));
			var borderSettings = settings.borderMode.settings;

			if (settings.borderMode.mode == "new") { // Make a new border.
				var newBorderItem = new Border("", false, "#000000", "solid");
				borderSettings.splice(newIndex, 0, newBorderItem);

				var newBorderElement = createBorderOption(borderSettings, newIndex);

				section.insertBefore(newBorderElement, section.children[newIndex]);

			}
			else if (settings.borderMode.mode == "move") { // Move the border.
				var oldIndex = settings.borderMode.index;

				if (newIndex != oldIndex) {
					var borderItem = borderSettings.splice(oldIndex, 1)[0];
					var borderElement = settings.borderMode.element;

					if (newIndex < oldIndex)
						borderSettings.splice(newIndex, 0, borderItem);
					else if  (newIndex > oldIndex)
						borderSettings.splice(newIndex - 1, 0, borderItem);

					section.insertBefore(borderElement, section.children[newIndex]);
				}
			}
		}

		resetBorderElements(section);
		section.className = section.className.replace(/\s?bbb-insert-highlight/gi, "");
		settings.el.menu.removeEventListener("click", insertBorder, true);
	}

	function showTip(event, text, backgroundColor) {
		var x = event.clientX;
		var y = event.clientY;
		var tip = settings.el.tip;
		var topOffset = 0;

		if (backgroundColor)
			tip.style.backgroundColor = backgroundColor;

		tip.innerHTML = text;
		tip.style.visibility = "hidden";
		tip.style.display = "block";

		// Resize the tip to minimize blank space.
		var origHeight = tip.clientHeight;
		var padding = tip.bbbGetPadding();
		var paddingWidth = padding.width;

		while (origHeight >= tip.clientHeight && tip.clientWidth > 15)
			tip.style.width = tip.clientWidth - paddingWidth - 2 + "px";

		tip.style.width = tip.clientWidth - paddingWidth + 2 + "px";

		if (tip.scrollWidth > tip.clientWidth)
			tip.style.width = tip.scrollWidth - padding.right + "px";

		// Don't allow the tip to go above the top of the window.
		if (y - tip.offsetHeight - 2 < 5)
			topOffset = y - tip.offsetHeight - 7;

		tip.style.left = x - tip.offsetWidth - 2 + "px";
		tip.style.top = y - tip.offsetHeight - 2 - topOffset + "px";
		tip.style.visibility = "visible";
	}

	function hideTip() {
		settings.el.tip.removeAttribute("style");
	}

	Element.prototype.bbbBorderPreview = function(borderItem) {
		this.addEventListener("click", function(event) { showTip(event, "<img src=\"http://danbooru.donmai.us/ssd/data/preview/d34e4cf0a437a5d65f8e82b7bcd02606.jpg\" alt=\"IMAGE\" style=\"width: 105px; height: 150px; border-color: " + borderItem.border_color + "; border-style: " + borderItem.border_style + "; border-width: " + settings.user["border_width"] + "px; line-height: 150px; text-align: center; vertical-align: middle;\">", "#FFFFFF"); }, false);
		this.addEventListener("mouseout", hideTip, false);
	};

	Element.prototype.bbbSetTip = function(text) {
		this.addEventListener("click", function(event) { showTip(event, text, false); }, false);
		this.addEventListener("mouseout", hideTip, false);
	};

	function changeTab(tab) {
		var activeTab = document.getElementsByClassName("bbb-active-tab")[0];

		if (tab == activeTab)
			return;

		activeTab.className = activeTab.className.replace(/bbb-active-tab/g, "");
		settings.el[activeTab.name + "Page"].style.display = "none";
		tab.className += " bbb-active-tab";
		settings.el.scrollDiv.scrollTop = 0;
		settings.el[tab.name + "Page"].style.display = "block";
	}

	function removeMenu() {
		// Destroy the menu so that it gets rebuilt.
		var menu = settings.el.menu;

		menu.parentNode.removeChild(menu);
		settings.el = {};
		settings.inputs = {};
	}

	function loadSettings() {
		// Load stored settings.
		if (typeof(localStorage["bbb_settings"]) === "undefined")
			loadDefaults();
		else {
			settings.user = JSON.parse(localStorage["bbb_settings"]);
			checkUser(settings.user, settings.options);
		}
	}

	function loadDefaults() {
		settings.user = {};

		for (var i in settings.options) {
			if (typeof(settings.options[i].def) !== "undefined")
				settings.user[i] = settings.options[i].def;
			else
				settings.user[i] = settings.options[i];
		}
	}

	function checkUser(user, options) {
		// Verify the user has all the base settings and add them with their default values if they don't.
		for (var i in options) {
			if (typeof(user[i]) === "undefined") {
				if (typeof(options[i].def) !== "undefined")
					user[i] = options[i].def;
				else
					user[i] = options[i];
			}
			else if (typeof(user[i]) === "object" && !(user[i] instanceof Array))
				checkUser(user[i], options[i]);
		}
	}

	function saveSettings() {
		localStorage["bbb_settings"] = JSON.stringify(settings.user);
	}

	function updateSettings() {
		// Change & save settings without the panel. Accepts a comma delimited list of alternating settings and values: setting1, value1, setting2, value2
		for (var i = 0, al = arguments.length; i < al; i += 2) {
			var settingName = arguments[i];
			var value = arguments[i + 1];
			var userSetting = settings.user[settingName];
			var input = settings.inputs[settingName];

			settings.user[settingName] = value;

			// Update menu if it exists.
			if (input) {
				var optionObject = settings.options[settingName];

				switch (optionObject.type)
				{
					case "dropdown":
						if (input.value != userSetting) {
							var selectOptions = input.getElementsByTagName("option");

							for (var j = 0, sol = selectOptions.length; j < sol; j++) {
								var selectOption = selectOptions[j];

								if (selectOption.value == userSetting) {
									selectOption.selected = true;
									break;
								}
							}
						}
						break;
					case "checkbox":
						input.checked = value;
						break;
					case "text":
						input.value = value;
						break;
					case "number":
						input.value = value;
						break;
					default:
						console.log("Better Better Booru Error: Unexpected object type. Type: " + optionObject.type);
						break;
				}
			}
		}

		saveSettings();
	}

	function convertSettings(mode) {
		var old = {};

		switch (mode) {
			case "?":
				break;
		}
	}

	/* Functions for support, extra features, and content manipulation */
	function blacklistInit() {
		Danbooru.Blacklist.entries.length = 0;

		if (!isLoggedIn() && /\S/.test(script_blacklisted_tags)) { // Load the script blacklist if not logged in.
			var blacklistTags = script_blacklisted_tags.toLowerCase().replace(/\b(rating:[qes])\w+/, "$1").split(",");

			for (var i = 0, bl = blacklistTags.length; i < bl; i++) {
				var tag = Danbooru.Blacklist.parse_entry(blacklistTags[i]);
				Danbooru.Blacklist.entries.push(tag);
			}
		}
		else // Reload the account blacklist.
			Danbooru.Blacklist.parse_entries();

		// Apply the blacklist and update the sidebar for search listings.
		var blacklistUsed = Danbooru.Blacklist.apply();
		var blacklistList = document.getElementById("blacklist-list");

		if (blacklistList) {
			blacklistList.innerHTML = "";

			if (blacklistUsed)
				Danbooru.Blacklist.update_sidebar();
			else
				document.getElementById("blacklist-box").style.display = "none";
		}
	}

	function resizeImage() {
		var img = document.getElementById("image");
		var imgContainer = document.getElementById("image-container");
		var availableWidth = imgContainer.clientWidth;
		var imgWidth = img.clientWidth;
		var imgHeight = img.clientHeight;
		var ratio = availableWidth / imgWidth;

		if (!bbbInfo.resized && imgWidth > availableWidth) {
			img.style.width = imgWidth * ratio + "px";
			img.style.height = imgHeight * ratio + "px";
			bbbInfo.resized = true;
			Danbooru.Note.Box.scale_all();
			if (Danbooru.Post.place_jlist_ads)
				Danbooru.Post.place_jlist_ads();
		}
		else if (bbbInfo.resized) {
			img.style.width = img.getAttribute("width") + "px"; // Was NOT expecting img.width to return the current width (css style width) and not the width attribute's value here...
			img.style.height = img.getAttribute("height") + "px";
			bbbInfo.resized = false;
			Danbooru.Note.Box.scale_all();
			if (Danbooru.Post.place_jlist_ads)
				Danbooru.Post.place_jlist_ads();
		}
	}

	function limitFix() {
		var links = document.evaluate('//div[@id="page"]//a[starts-with(@href, "/posts?")]', document, null, 6, null);

		for (var i = 0, lsl = links.snapshotLength; i < lsl; i++) {
			var link = links.snapshotItem(i);

			if (!/(?:page|limit)=/.test(link.href))
				link.href += "&limit=" + thumbnail_count;
		}

		links = document.evaluate('//header//a[starts-with(@href, "/posts") or @href="/" or @href="/notes?group_by=post"]', document, null, 6, null);

		for (var i = 0, lsl = links.snapshotLength; i < lsl; i++) {
			var link = links.snapshotItem(i);

			if (!/\?/.test(link.href))
				link.href += "?limit=" + thumbnail_count;
			else
				link.href += "&limit=" + thumbnail_count;
		}

		if (gLoc == "search" || gLoc == "post")
			document.getElementById("search-box").getElementsByTagName("form")[0].innerHTML += '<input name="limit" value="' + thumbnail_count + '" type="hidden">';

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
		if (!url)
			url = gUrl;

		var search = new RegExp(getVar + "=.*?(?=[#&]|$)");
		var result = search.exec(url);

		if (result === null)
			return null;
		else {
			result = result[0].split("=")[1];

			if (/^-?\d+(\.\d+)?$/.test(result))
				return Number(result);
			else
				return result;
		}
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
		if (gLoc == "popular") {
			if (dir == "left")
				Danbooru.PostPopular.nav_prev();
			else if (dir == "right")
				Danbooru.PostPopular.nav_next();
		}
		else {
			if (dir == "left")
				Danbooru.Paginator.prev_page();
			else if (dir == "right")
				Danbooru.Paginator.next_page();
		}
	}

	function cleanLinks() {
		var target;

		if (gLoc == "post") {
			target = document.evaluate('//div[@id="pool-nav"]//a', document, null, 6, null);

			for (var i = 0, isl = target.snapshotLength; i < isl; i++)
				target.snapshotItem(i).href = target.snapshotItem(i).href.split("?")[0];
		}
		else if (gLoc == "pool") {
			target = document.evaluate('//section[@id="content"]/article/a', document, null, 6, null);

			for (var i = 0, isl = target.snapshotLength; i < isl; i++)
				target.snapshotItem(i).href = target.snapshotItem(i).href.split("?")[0];
		}
		else if (gLoc == "search") {
			target = document.evaluate('//div[@id="posts"]/article/a', document, null, 6, null);

			for (var i = 0, isl = target.snapshotLength; i < isl; i++)
				target.snapshotItem(i).href = target.snapshotItem(i).href.split("?")[0];
		}
	}

	function autohideSidebar() {
		var sidebar = document.getElementById("sidebar");

		sidebar.addEventListener("click", function(event) {
			var target = event.target;

			if (target instanceof HTMLAnchorElement)
				target.blur();
		}, false);
		sidebar.addEventListener("focus", function() {
			sidebar.className += " bbb-sidebar-show";
		}, true);
		sidebar.addEventListener("blur", function() {
			sidebar.className = sidebar.className.replace(/\sbbb-sidebar-show/g, "");
		}, true);
	}

	function allowUserLimit() {
		if (thumbnail_count > 0 && !/(?:page|limit)=\d/.test(gUrlQuery))
			return true;
		else
			return false;
	}

	function allowArrowNav() {
		var paginator = document.getElementsByClassName("paginator")[0];

		if (paginator || gLoc == "popular") // If the paginator exists, arrow navigation should be applicable.
			return true;
		else
			return false;
	}

	function needPostAPI() {
		if (document.getElementById("image-container").getElementsByTagName("object")[0] || document.getElementById("image") || /Save this file|The artist requested removal/.test(document.getElementById("image-container").textContent))
			return false;
		else
			return true;
	}

	function currentLoc() {
		if (/\/posts\/\d+/.test(gUrlPath))
			return "post";
		else if (/^\/(?:posts|$)/.test(gUrlPath))
			return "search";
		else if (/^\/notes/.test(gUrlPath) && !/group_by=note/.test(gUrlQuery))
			return "notes";
		else if (/^\/comments\/?$/.test(gUrlPath) && !/group_by=comment/.test(gUrlQuery))
			return "comments";
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

	function isLoggedIn() {
		if (fetchMeta("current-user-id") !== "")
			return true;
		else
			return false;
	}

	function useAPI() {
		var tryAPI = false;

		if (show_loli || show_shota || show_deleted || direct_downloads) {
			if (isLoggedIn() || !bypass_api)
				tryAPI = true;
		}

		return tryAPI;
	}

	function checkSetting(metaName, metaData, scriptSetting) {
		if (isLoggedIn()) {
			if (fetchMeta(metaName) === metaData)
				return true;
			else
				return false;
		}
		else
			return scriptSetting;
	}

	function searchAdd() {
		if (gLoc == "search" || gLoc == "post") {
			// Where = array of <li> in tag-sidebar.
			var where = document.getElementById("tag-box");

			if (!where)
				where = document.getElementById("tag-list");

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
				var newLink = "/posts?tags=" + newTag + tag;
				where[i].innerHTML = '<a href="' + newLink + '">+</a> ' + where[i].innerHTML;
				newLink = "/posts?tags=-" + newTag + tag;
				where[i].innerHTML = '<a href="' + newLink + '">-</a> ' + where[i].innerHTML;
			}
		}
	}

	function statusBorderSort() {
		// Ignore border ordering when multicolor borders are in use.
		var statusBorderSettings = status_borders.slice(0); // Clone the array. Don't reference it.
		var parent;
		var child;

		for (var i = 0, sbsl = statusBorderSettings.length; i < sbsl; i++) {
			var borderItem = statusBorderSettings[i];

			if (borderItem.tags == "parent") {
				parent = statusBorderSettings.splice(i, 1)[0];
				i--;
				sbsl--;
			}
			else if (borderItem.tags == "child") {
				child = statusBorderSettings.splice(i, 1)[0];
				i--;
				sbsl--;
			}
		}

		statusBorderSettings.push(child);
		statusBorderSettings.push(parent);

		return statusBorderSettings;
	}

	function formatThumbnails() {
		// Create thumbnail titles and borders.
		var posts = document.getElementsByClassName("post-preview");

		// Sort borders to support multi color borders.
		if (!single_color_borders && posts)
			var statusBorderSettings = statusBorderSort();

		// Create and cache border search objects.
		if (custom_tag_borders) {
			var searches = [];

			for (var i = 0, tbsl = tag_borders.length; i < tbsl; i++)
				searches.push(createSearch(tag_borders[i].tags));
		}

		// Cycle through each post and apply titles and borders.
		for (var i = 0, pl = posts.length; i < pl; i++) {
			var post = posts[i];
			var img = post.getElementsByTagName("img")[0];
			var link = img.parentNode;
			var classes = post.className;
			var tags = post.getAttribute("data-tags");
			var user = post.getAttribute("data-uploader");
			var rating = post.getAttribute("data-rating");
			var score = post.getAttribute("data-score");
			var title = tags + " user:" + user + " rating:" + rating + " score:" + score;
			var postInfo = tags + " user:" + user.replace(/\s/g, "_").toLowerCase() + " rating:" + rating + " score:" + score;
			var primary = [];
			var primaryLength = 0;
			var secondary = [];
			var secondaryLength = 0;

			// Create title.
			img.title = title;

			// Primary status borders.
			if (single_color_borders) // Don't allow multi color borders.
				img.removeAttribute("style");
			else if (custom_status_borders) {
				var spacedPostClasses = classes.bbbSpacePad();

				for (var j = 0, sbsl = statusBorderSettings.length; j < sbsl; j++) {
					var statusBorderItem = statusBorderSettings[j];
					var spacedStatusClass = statusBorderItem.class_name.bbbSpacePad();

					if (statusBorderItem.is_enabled && spacedPostClasses.indexOf(spacedStatusClass) > -1) {
						primary.push([statusBorderItem.border_color, statusBorderItem.border_style]);

						if (j < 3)
							j = 2;
					}
				}

				primaryLength = primary.length;

				if (primaryLength == 2)
					img.setAttribute("style", "border-style: " + primary[1][1] + " " + primary[0][1] + " " + primary[0][1] + " " + primary[1][1] + " !important; border-color: " + primary[1][0] + " " + primary[0][0] + " " + primary[0][0] + " " + primary[1][0] + " !important;");
				else if (primaryLength == 3)
					img.setAttribute("style", "border-style: " + primary[2][1] + " " + primary[0][1] + " " + primary[0][1] + " " + primary[1][1] + " !important; border-color: " + primary[2][0] + " " + primary[0][0] + " " + primary[0][0] + " " + primary[1][0] + " !important;");
			}
			else // Default Danbooru border styling.
				Danbooru.Post.initialize_preview_borders_for(post);

			// Secondary custom tag borders.
			if (custom_tag_borders) {
				var spacedPostInfo = postInfo.bbbSpacePad();

				for (var j = 0, tbsl = tag_borders.length; j < tbsl; j++) {
					var tagBorderItem = tag_borders[j];

					if (tagBorderItem.is_enabled && spacedPostInfo.bbbTagMatch(searches[j])) {
						secondary.push([tagBorderItem.border_color, tagBorderItem.border_style]);

						if (secondary.length == 4)
							break;
					}
				}

				secondaryLength = secondary.length;

				if (secondaryLength) {
					link.className += " bbb-custom-tag";

					if (secondaryLength == 1 || (single_color_borders && secondaryLength > 1))
						link.setAttribute("style", "border: " + border_width + "px " + secondary[0][0] + " " + secondary[0][1] + " !important;");
					else if (secondaryLength == 2)
						link.setAttribute("style", "border-color: " + secondary[0][0] + " " + secondary[1][0] + " " + secondary[1][0] + " " + secondary[0][0] + " !important; border-style: " + secondary[0][1] + " " + secondary[1][1] + " " + secondary[1][1] + " " + secondary[0][1] + " !important;");
					else if (secondaryLength == 3)
						link.setAttribute("style", "border-color: " + secondary[0][0] + " " + secondary[1][0] + " " + secondary[2][0] + " " + secondary[0][0] + " !important; border-style: " + secondary[0][1] + " " + secondary[1][1] + " " + secondary[2][1] + " " + secondary[0][1] + " !important;");
					else if (secondaryLength == 4)
						link.setAttribute("style", "border-color: " + secondary[0][0] + " " + secondary[2][0] + " " + secondary[3][0] + " " + secondary[1][0] + " !important; border-style: " + secondary[0][1] + " " + secondary[2][1] + " " + secondary[3][1] + " " + secondary[1][1] + " !important;");
				}
			}
		}
	}

	function formatJSON(post) {
		// Add information to the JSON post object.
		var ext = post.file_ext;
		var md5 = post.md5;
		var flags = "";
		var thumbClass = "";

		if (post.is_deleted) {
			flags = "deleted";
			thumbClass += " post-status-deleted";
		}
		if (post.is_flagged) {
			flags = "flagged";
			thumbClass += " post-status-flagged";
		}
		if (post.is_pending) {
			flags = "pending";
			thumbClass += " post-status-pending";
		}
		if (post.has_children)
			thumbClass += " post-status-has-children";
		if (post.parent_id)
			thumbClass += " post-status-has-parent";

		post.parent = (post.parent_id !== null ? post.parent_id : ""); // Format to return a blank string if there is no parent.
		post.file_url = "/data/" + md5 + "." + ext;
		post.samp_url = "/data/sample/sample-" + md5 + ".jpg";
		post.thumb_url = (!post.image_height || ext == "swf" ? "/images/download-preview.png" : "/ssd/data/preview/" + md5 + ".jpg");
		post.flags = flags;
		post.thumb_class = thumbClass;

		return post;
	}

	function customCSS() {
		var customStyles = document.createElement("style");
		customStyles.type = "text/css";

		var styles = '#bbb_menu {background-color: #FFFFFF; border: 1px solid #CCCCCC; box-shadow: 0 2px 2px rgba(0, 0, 0, 0.5); font-size: 14px; padding: 15px; position: fixed; top: 25px; z-index: 9001;}' +
		'#bbb_menu a:focus {outline: none;}' +
		'.bbb-scroll-div {border: 1px solid #CCCCCC; margin: -1px 0px 15px 0px; padding: 5px 0px; overflow-y: auto;}' +
		'.bbb-section-header {border-bottom: 2px solid #CCCCCC; padding-top: 10px; width: 750px;}' +
		'.bbb-section-options, .bbb-section-text {margin: 5px 0px; max-width: 902px;}' +
		'.bbb-section-options-left, .bbb-section-options-right {display: inline-block; vertical-align: top; width: 435px;}' +
		'.bbb-section-options-left {border-right: 1px solid #CCCCCC; margin-right: 15px; padding-right: 15px;}' +
		'.bbb-label {display: block; height: 29px; padding: 0px 5px; overflow: hidden;}' + // Overflow is used here to correct bbb-label-input float problems.
		'.bbb-label:hover {background-color: #EEEEEE;}' +
		'.bbb-label > span {display: inline-block; line-height: 29px; vertical-align: middle;}' +
		'.bbb-label input[type="checkbox"] {vertical-align: middle; position: relative; bottom: 1px;}' +
		// '.bbb-label-text {}' +
		'.bbb-label-input {float: right;}' +
		'.bbb-expl {background-color: #CCCCCC; border: 1px solid #000000; display: none; font-size: 12px; padding: 5px; position: fixed; width: 400px; overflow: hidden;}' +
		'.bbb-expl ul {list-style: none outside disc; margin-top: 0px; margin-bottom: 0px; margin-left: 20px; display: inline-block;}' +
		'.bbb-expl-link {font-size: 12px; font-weight: bold; margin-left: 5px; padding: 2px;}' +
		'.bbb-button {border: 1px solid #CCCCCC; display: inline-block; padding: 5px;}' +
		'.bbb-tab {display: inline-block; padding: 5px; border: 1px solid #CCCCCC; margin-right: -1px;}' +
		'.bbb-active-tab {background-color: #FFFFFF; border-bottom-width: 0px; padding-bottom: 6px;}' +
		'a.bbb-custom-tag {padding: 0px !important; display: inline-block !important; border-width: ' + border_width + 'px !important;}' +
		'.bbb-border-button {border: 1px solid #CCCCCC; display: inline-block; padding: 2px; margin: 0px 2px;}' +
		'.bbb-border-div {background-color: #EEEEEE; padding: 2px; margin: 0px 5px 0px 0px;}' +
		'.bbb-border-divider {height: 4px;}' +
		'.bbb-insert-highlight .bbb-border-divider {background-color: blue; cursor: pointer;}' +
		'.bbb-no-highlight .bbb-border-divider {background-color: transparent; cursor: auto;}' +
		'.bbb-border-bar, .bbb-border-settings {height: 29px; padding: 0px 2px; overflow: hidden;}' +
		'.bbb-border-settings {background-color: #FFFFFF;}' +
		'.bbb-border-bar input[type="checkbox"] {vertical-align: middle; position: relative; bottom: 1px;}' +
		'.bbb-border-bar > *, .bbb-border-settings > * {display: inline-block; line-height: 29px; vertical-align: middle;}' +
		'.bbb-border-spacer {display: inline-block; height: 12px; width: 0px; border-right: 1px solid #CCCCCC; margin: 0px 5px;}';

		// Provide a little extra space for listings that allow thumbnail_count.
		if ((gLoc == "search" || gLoc == "notes") && (thumbnail_count))
			styles += 'div#page {margin: 0px 10px 0px 20px !important;}';

		// Border setup
		var totalBorderWidth = (custom_tag_borders ? border_width * 2 + 1 : border_width);
		var thumbMaxDim = 150 + totalBorderWidth * 2;
		var listingExtraSpace = 14 - totalBorderWidth * 2;
		var commentExtraSpace = 34 - totalBorderWidth * 2;

		styles += 'article.post-preview {height: ' + thumbMaxDim + 'px !important; width: ' + thumbMaxDim + 'px !important; margin: 0px ' + listingExtraSpace + 'px ' + listingExtraSpace + 'px 0px !important;}' +
		'.post-preview div.preview {height: ' + thumbMaxDim + 'px !important; width: ' + thumbMaxDim + 'px !important; margin-right: ' + commentExtraSpace + 'px !important;}' +
		'.post-preview img {border-width: ' + border_width + 'px !important;}';


		if (custom_status_borders) {
			var activeStatusStyles = "";

			for (var i = 0, sbsl = status_borders.length; i < sbsl; i++) {
				var statusBorderItem = status_borders[i];

				if (statusBorderItem.is_enabled) {
					activeStatusStyles = ".post-preview." + statusBorderItem.class_name + " img {border-color: " + statusBorderItem.border_color + " !important; border-style: " + statusBorderItem.border_style + " !important;}" + activeStatusStyles;

					if (custom_tag_borders)
						activeStatusStyles = ".post-preview." + statusBorderItem.class_name + " a.bbb-custom-tag {padding: 1px !important;}" + activeStatusStyles;
				}
				else
					styles += ".post-preview." + statusBorderItem.class_name + " img {border: none !important;}";
			}

			styles += activeStatusStyles;
		}
		else if (custom_tag_borders) {
			for (var i = 0, sbsl = status_borders.length; i < sbsl; i++) {
				var statusBorderItem = status_borders[i];

				styles += ".post-preview." + statusBorderItem.class_name + " a.bbb-custom-tag {padding: 1px !important;}";
			}
		}

		// Hide sidebar.
		if (autohide_sidebar.indexOf(gLoc) > -1)
			styles += 'div#page {margin: 0px 10px 0px 20px !important;}' +
			'aside#sidebar {background-color: transparent !important; border-width: 0px !important; height: 100% !important; width: 250px !important; position: fixed !important; left: -280px !important; overflow-y: hidden !important; padding: 0px 20px !important; top: 0px !important; z-index: 2001 !important;}' +
			'aside#sidebar.bbb-sidebar-show, aside#sidebar:hover {background-color: #FFFFFF !important; border-right: 1px solid #CCCCCC !important; left: 0px !important; overflow-y: auto !important; padding: 0px 15px !important;}' +
			'section#content {margin-left: 0px !important;}' +
			'.bbb-unhide {height: 100%; width: 15px; position: fixed; left: 0px; top: 0px; z-index: 2000;}';

		if (hide_advertisements)
			styles += '#content.with-ads {margin-right: 0em !important;}' +
			'img[alt="Advertisement"] {display: none !important;}' +
			'img[alt="Your Ad Here"] {display: none !important;}' +
			'iframe {display: none !important;}';

		if (hide_tos_notice && document.getElementById("tos-notice")) {
			styles += '#tos-notice {display: none !important;}';

			if (manage_cookies)
				createCookie("accepted_tos", 1, 365);
		}

		if (hide_sign_up_notice && document.getElementById("sign-up-notice")) {
			styles += '#sign-up-notice {display: none !important;}';

			if (manage_cookies)
				createCookie("hide_sign_up_notice", 1, 7);
		}

		if (hide_upgrade_notice && document.getElementById("upgrade-account-notice")) {
			styles += '#upgrade-account-notice {display: none !important;}';

			if (manage_cookies)
				createCookie("hide_upgrade_account_notice", 1, 7);
		}

		if (hide_ban_notice)
			styles += '#ban-notice {display: none !important;}';

		customStyles.innerHTML = styles;
		document.getElementsByTagName("head")[0].appendChild(customStyles);
	}

	function removeTagHeaders() {
		if (gLoc == "post") {
			var tagList = document.getElementById("tag-list");
			var newList = tagList.innerHTML.replace(/<\/ul>.+?<ul>/g, "").replace(/<h2>.+?<\/h2>/, "<h1>Tags</h1>");

			tagList.innerHTML = newList;
		}
	}

	function postTagTitles() {
		if (gLoc == "post")
			document.title = fetchMeta("tags").replace(/\s/g, ", ").replace(/_/g, " ") + " - Danbooru";
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

	function createCookie(cName, cValue, expDays) {
		var data = cName + "=" + cValue + "; path=/";

		if (expDays !== null) {
			var expDate = new Date();
			expDate.setTime(expDate.getTime() + expDays * 86400000);
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

	function danbNotice(txt, isError) {
		// Display the notice or append information to it if it already exists. If a second true argument is provided, the notice is displayed as an error.
		var noticeFunc = (isError ? Danbooru.error : Danbooru.notice);
		var msg = txt;
		var notice = document.getElementById("notice");

		if (/\w/.test(notice.children[0].innerHTML))
			msg = notice.children[0].innerHTML + "<hr/>" + msg;

		noticeFunc(msg);
	}

	function scrollbarWidth() {
		var scroller = document.createElement("div");
		scroller.style.width = "150px";
		scroller.style.height = "150px";
		scroller.style.visibility = "hidden";
		scroller.style.overflow = "scroll";
		scroller.style.position = "absolute";
		scroller.style.top = "0px";
		scroller.style.left = "0px";
		document.body.appendChild(scroller);
		var scrollDiff = scroller.offsetWidth - scroller.clientWidth;
		document.body.removeChild(scroller);

		return scrollDiff;
	}

	Element.prototype.bbbGetPadding = function() {
		// Get all the padding measurements of an element including the total width and height.
		var paddingLeft;
		var paddingRight;
		var paddingTop;
		var paddingBottom;
		var paddingWidth;
		var paddingHeight;

		if (window.getComputedStyle) {
			var computed = window.getComputedStyle(this, null);

			paddingLeft = Number(computed.paddingLeft.slice(0,-2));
			paddingRight = Number(computed.paddingRight.slice(0,-2));
			paddingTop = Number(computed.paddingTop.slice(0,-2));
			paddingBottom = Number(computed.paddingBottom.slice(0,-2));
			paddingHeight = paddingTop + paddingBottom;
			paddingWidth = paddingLeft + paddingRight;
		}
		else {
			var clone = this.cloneNode(false);

			clone.style.width = "0px";
			clone.style.height = "0px";
			clone.style.visibility = "hidden";
			clone.style.position = "absolute";
			clone.style.top = "0px";
			clone.style.left = "0px";
			document.body.appendChild(clone);
			paddingWidth = clone.clientWidth;
			paddingHeight = clone.clientHeight;
			clone.style.paddingLeft = "0px";
			clone.style.paddingTop = "0px";
			paddingRight = clone.clientWidth;
			paddingLeft = paddingWidth - paddingRight;
			paddingBottom = clone.clientHeight;
			paddingTop = paddingHeight - paddingBottom;
			document.body.removeChild(clone);
		}

		return {width: paddingWidth, height: paddingHeight, top: paddingTop, bottom: paddingBottom, left: paddingLeft, right: paddingRight};
	};

	String.prototype.bbbSpacePad = function() {
		return (this.length ? " " + this + " " : this);
	};

	String.prototype.bbbSpaceClean = function() {
		return this.replace(/\s+/g, " ").replace(/^\s|\s$/g, "");
	};

	String.prototype.bbbTagMatch = function(searchObject) {
		var tags = this;
		var all = searchObject.all;
		var any = searchObject.any;
		var anyLoops = 0;
		var searchTerm = "";

		if (!any.total && !all.total) // No tags to test.
			return false;

		if (any.total) {
			// Loop until one match is found.
			for (var i = 0, ail = any.includes.length; i < ail; i++) {
				searchTerm = any.includes[i];

				if (tags.indexOf(searchTerm) > -1)
					break;
				else
					anyLoops++;
			}

			if (anyLoops == ail) { // If the first loop finished, loop through the excludes for one match.
				for (var i = 0, ael = any.excludes.length; i < ael; i++) {
					searchTerm = any.excludes[i];

					if (tags.indexOf(searchTerm) < 0)
						break;
					else
						anyLoops++;
				}
			}

			// Return false if one match isn't found.
			if (anyLoops == any.total)
				return false;
		}

		if (all.total) {
			// Return false on the first negative match.
			for (var i = 0, ail = all.includes.length; i < ail; i++) {
				searchTerm = all.includes[i];

				if (tags.indexOf(searchTerm) < 0)
					return false;
			}

			for (var i = 0, ael = all.excludes.length; i < ael; i++) {
				searchTerm = all.excludes[i];

				if (tags.indexOf(searchTerm) > -1)
					return false;
			}
		}

		// If we haven't managed to find any indications of a negative match, return true.
		return true;
	};

	function createSearch(search) {
		var searchString = search.toLowerCase().replace(/\b(rating:[qes])\w+/g, "$1").split(" ");
		var all = {includes: [], excludes: [], total: 0};
		var any = {includes: [], excludes: [], total: 0};
		var mode;
		var searchTerm = "";

		// Divide the tags into any and all sets with excluded and included tags.
		for (var i = 0, ssl = searchString.length; i < ssl; i++) {
			searchTerm = searchString[i];

			if (searchTerm.charAt(0) == "~") {
				mode =  any;
				searchTerm = searchTerm.slice(1);
			}
			else
				mode = all;

			if (searchTerm.charAt(0) == "-") {
				if (searchTerm.length > 1) {
					mode.excludes.push(searchTerm.slice(1).bbbSpacePad());
					mode.total++;
				}
			}
			else if (searchTerm.length > 0) {
				mode.includes.push(searchTerm.bbbSpacePad());
				mode.total++;
			}
		}

		return {all: all, any: any};
	}

	function delayMe(func) {
		var timer = setTimeout(func, 0);
	}

	function escapeRegEx(regEx) {
		return regEx.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}


} // End of injectMe.

// Load script into the page so it can access Danbooru's Javascript in Chrome. Thanks to everyone else that has ever had this problem before... and Google which found the answers to their questions for me.
var script = document.createElement('script');
script.type = "text/javascript";
script.appendChild(document.createTextNode('(' + injectMe + ')();'));
(document.body || document.head || document.documentElement).appendChild(script);
