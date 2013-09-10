// ==UserScript==
// @name           better_better_booru
// @author         otani, modified by Jawertae, A Pseudonymous Coder & Moebius Strip.
// @description    Several changes to make Danbooru much better. Including the viewing of loli/shota images on non-upgraded accounts and more.
// @version        6.0.1
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
	var bbb = { // Container for script info.
		el: { // Script elements.
			menu:{} // Menu elements.
		},
		img: { // Post content info.
			resized: "none",
			translationMode: false
		},
		options: { // Setting options and data.
			bbb_version: "6.0.1",
			alternate_image_swap: new Option("checkbox", false, "Alternate Image Swap", "Switch between the sample and original image by clicking the image. Notes can be toggled by using the link in the sidebar options section."),
			arrow_nav: new Option("checkbox", false, "Arrow Navigation", "Allow the use of the left and right arrow keys to navigate pages. Has no effect on individual posts."),
			autohide_sidebar: new Option("dropdown", "none", "Auto-hide Sidebar", "Hide the sidebar for individual posts and/or searches until the mouse comes close to the left side of the window or the sidebar gains focus.<br><br><u>Tips</u><br>By using Danbooru's keyboard shortcut for the letter \"Q\" to place focus on the search box, you can unhide the sidebar.<br><br>Use the thumbnail count option to get the most out of this feature on search listings.", {txtOptions:["Disabled:none", "Searches:search", "Posts:post", "Searches & Posts:post search"]}),
			autoscroll_image: new Option("checkbox", false, "Auto-scroll Image", "Position the image as close as possible to the left and top edges of the window viewport when initially loading an individiual post."),
			border_width: new Option("dropdown", 2, "Border Width", "Set the width of thumbnail borders.", {txtOptions:["1:1", "2 (Default):2", "3:3"]}),
			bypass_api: new Option("checkbox", false, "Automatic API Bypass", "When logged out and API only features are enabled, do not warn about needing to be logged in. Instead, automatically bypass those features."),
			clean_links: new Option("checkbox", false, "Clean Links", "Remove the extra information after the post ID in thumbnail links.<br><br><u>Note</u></br>Enabling this option will disable Danbooru's search navigation and active pool detection for individual posts."),
			custom_status_borders: new Option("checkbox", false, "Custom Status Borders", "Override Danbooru's thumbnail borders for deleted, flagged, pending, parent, and child images."),
			custom_tag_borders: new Option("checkbox", true, "Custom Tag Borders", "Add thumbnail borders to images with specific tags."),
			direct_downloads: new Option("checkbox", false, "Direct Downloads", "Allow download managers to download the images displayed in the search, pool, and popular listings."),
			enable_status_message: new Option("checkbox", true, "Enable Status Message", "When requesting information from Danbooru, display the request status in the lower right corner."),
			hide_advertisements: new Option("checkbox", false, "Hide Advertisements", "Hide the advertisements and free up some of the space set aside for them by adjusting the layout."),
			hide_ban_notice: new Option("checkbox", false, "Hide Ban Notice", "Hide the Danbooru ban notice."),
			hide_original_notice: new Option("checkbox", false, "Hide Original Notice", "Hide the Better Better Booru \"viewing original\" notice."),
			hide_sign_up_notice: new Option("checkbox", false, "Hide Sign Up Notice", "Hide the Danbooru account sign up notice."),
			hide_tos_notice: new Option("checkbox", false, "Hide TOS Notice", "Hide the Danbooru terms of service agreement notice."),
			hide_upgrade_notice: new Option("checkbox", false, "Hide Upgrade Notice", "Hide the Danbooru upgrade account notice."),
			image_drag_scroll: new Option("checkbox", false, "Image Drag Scrolling", "While holding down left click on a post image, mouse movement can be used to scroll the whole page and reposition/scroll the image<br><br><u>Note</u><br>This option is automatically disabled when translation mode is active."),
			image_resize: new Option("checkbox", true, "Resize Image", "Shrink large images to fit the browser window when initially loading an individual post.<br><br><u>Note</u><br>When logged in, the account's \"Fit images to window\" setting will override this option."),
			image_resize_mode: new Option("dropdown", "width", "Resize Image Mode", "Choose how to shrink large images to fit the browser window when initially loading an individual post.", {txtOptions:["Width (Default):width", "Width & Height:all"]}),
			load_sample_first: new Option("checkbox", true, "Load Sample First", "Load sample images first when viewing an individual post.<br><br><u>Note</u><br>When logged in, the account's \"Default image width\" setting will override this option."),
			manage_cookies: new Option("checkbox", false, "Manage Notice Cookies", "When using the options to hide the upgrade, sign up, and/or TOS notice, also create cookies to disable these notices at the server level.<br><br><u>Tip</u><br>Use this feature if the notices keep flashing on your screen before being removed."),
			override_account: new Option("checkbox", false, "Override Account Settings", "Allow logged out settings to override account settings when logged in."),
			post_tag_titles: new Option("checkbox", false, "Post Tag Titles", "Change the page titles for individual posts to a full list of the post tags."),
			remove_tag_headers: new Option("checkbox", false, "Remove Tag Headers", "Remove the \"copyrights\", \"characters\", and \"artist\" headers from the sidebar tag list."),
			script_blacklisted_tags: new Option("text", "", "Blacklisted Tags", "Hide images and posts that match the specified tag(s).<br><br><u>Guidelines</u><br>Matches can consist of a single tag or multiple tags. Each match must be separated by a comma and each tag in a match must be separated by a space.<br><br><u>Example</u><br>To filter posts tagged with spoilers and posts tagged with blood AND death, the blacklist would normally look like the following case:<br>spoilers, blood death<br><br><u>Note</u><br>When logged in, the account's \"Blacklisted tags\" list will override this option.", {tagEditMode: true}),
			search_add: new Option("checkbox", true, "Search Add", "Add + and - links to the sidebar tag list that modify the current search by adding or excluding additional search terms."),
			show_deleted: new Option("checkbox", false, "Show Deleted", "Display all deleted images in the search, pool, popular, and notes listings."),
			show_loli: new Option("checkbox", false, "Show Loli", "Display loli images in the search, pool, popular, comments, and notes listings."),
			show_shota: new Option("checkbox", false, "Show Shota", "Display shota images in the search, pool, popular, comments, and notes listings."),
			show_toddlercon: new Option("checkbox", false, "Show Toddlercon", "Display toddlercon images in the search, pool, popular, comments, and notes listings."),
			single_color_borders: new Option("checkbox", false, "Single Color Borders", "Only use one color for each thumbnail border."),
			thumbnail_count: new Option("dropdown", 0, "Thumbnail Count", "Change the number of thumbnails that display in the search and notes listings.", {txtOptions:["Disabled:0"], numRange:[1,200]}),
			track_new:new Option("checkbox", false, "Track New Posts", "Add a menu option titled \"New\" to the posts section submenu (between \"Listing\" and \"Upload\") that links to a customized search focused on keeping track of new posts.<br><br><u>Note</u><br>While browsing the new posts, the current page of images is also tracked. If the new post listing is left, clicking the \"New\" link later on will attempt to pull up the images where browsing was left off at.<br><br><u>Tip</u><br>If you would like to bookmark the new post listing, drag and drop the link to your bookmarks or right click it and bookmark/copy the location from the context menu."),
			status_borders: borderSet(["deleted", true, "#000000", "solid", "post-status-deleted"], ["flagged", true, "#FF0000", "solid", "post-status-flagged"], ["pending", true, "#0000FF", "solid", "post-status-pending"], ["child", true, "#CCCC00", "solid", "post-status-has-parent"], ["parent", true, "#00FF00", "solid", "post-status-has-children"]),
			tag_borders: borderSet(["loli", true, "#FFC0CB", "solid"], ["shota", true, "#66CCFF", "solid"], ["toddlercon", true, "#9370DB", "solid"]),
			track_new_data: {viewed:0, viewing:1}
		},
		sections: { // Setting sections and ordering.
			browse: new Section("general", ["show_loli", "show_shota", "show_toddlercon", "show_deleted", "thumbnail_count"], "Image Browsing"),
			layout: new Section("general", ["hide_sign_up_notice", "hide_upgrade_notice", "hide_tos_notice", "hide_original_notice", "hide_advertisements", "hide_ban_notice"], "Layout"),
			sidebar: new Section("general", ["search_add", "remove_tag_headers", "autohide_sidebar"], "Tag Sidebar"),
			image_control: new Section("general", ["alternate_image_swap", "image_resize_mode", "image_drag_scroll", "autoscroll_image"], "Image Control"),
			logged_out: new Section("general", ["image_resize", "load_sample_first", "script_blacklisted_tags"], "Logged Out Settings"),
			misc: new Section("general", ["direct_downloads", "track_new", "clean_links", "arrow_nav", "post_tag_titles"], "Misc."),
			script_settings: new Section("general", ["bypass_api", "manage_cookies", "enable_status_message", "override_account"], "Script Settings"),
			border_options: new Section("general", ["custom_tag_borders", "custom_status_borders", "single_color_borders", "border_width"], "Options"),
			status_borders: new Section("border", "status_borders", "Custom Status Borders", "When using custom status borders, the borders can be edited here. For easy color selection, use one of the many free tools on the internet like <a target=\"_blank\" href=\"http://www.quackit.com/css/css_color_codes.cfm\">this one</a>."),
			tag_borders: new Section("border", "tag_borders", "Custom Tag Borders", "When using custom tag borders, the borders can be edited here. For easy color selection, use one of the many free tools on the internet like <a target=\"_blank\" href=\"http://www.quackit.com/css/css_color_codes.cfm\">this one</a>.")
		},
		user: {} // User settings.
	};

	loadSettings(); // Load user settings.

	// Location variables.
	var gUrl = location.href.split("#", 1)[0]; // URL without the anchor
	var gUrlPath = location.pathname; // URL path only
	var gUrlQuery = location.search; // URL query string only
	var gLoc = currentLoc(); // Current location (post = single post, search = posts index, notes = notes index, popular = popular index, pool = single pool, comments = comments page, intro = introduction page)

	// Script variables.
	// Global
	var show_loli = bbb.user.show_loli;
	var show_shota = bbb.user.show_shota;
	var show_toddlercon = bbb.user.show_toddlercon;
	var show_deleted = bbb.user.show_deleted;
	var direct_downloads = bbb.user.direct_downloads;

	var custom_tag_borders = bbb.user.custom_tag_borders;
	var custom_status_borders = bbb.user.custom_status_borders;
	var single_color_borders = bbb.user.single_color_borders;
	var border_width = bbb.user.border_width;
	var clean_links = bbb.user.clean_links;
	var autohide_sidebar = bbb.user.autohide_sidebar;

	var bypass_api = bbb.user.bypass_api;
	var manage_cookies = bbb.user.manage_cookies;
	var enable_status_message = bbb.user.enable_status_message;
	var override_account = bbb.user.override_account;
	var track_new = bbb.user.track_new;

	var hide_sign_up_notice = bbb.user.hide_sign_up_notice;
	var hide_upgrade_notice = bbb.user.hide_upgrade_notice;
	var hide_tos_notice = bbb.user.hide_tos_notice;
	var hide_original_notice = bbb.user.hide_original_notice;
	var hide_advertisements = bbb.user.hide_advertisements;
	var hide_ban_notice = bbb.user.hide_ban_notice;

	// Search
	var arrow_nav = bbb.user.arrow_nav;
	var search_add = bbb.user.search_add;
	var thumbnail_count = bbb.user.thumbnail_count;
	var thumbnail_count_default = 20; // Number of thumbnails BBB should expect Danbooru to return by default.

	// Post
	var alternate_image_swap = bbb.user.alternate_image_swap;
	var image_resize = bbb.user.image_resize;
	var image_resize_mode = bbb.user.image_resize_mode;
	var image_drag_scroll = bbb.user.image_drag_scroll;
	var load_sample_first = bbb.user.load_sample_first;
	var remove_tag_headers = bbb.user.remove_tag_headers;
	var post_tag_titles = bbb.user.post_tag_titles;
	var autoscroll_image = bbb.user.autoscroll_image;

	// Stored data
	var status_borders = bbb.user.status_borders;
	var tag_borders = bbb.user.tag_borders;
	var track_new_data = bbb.user.track_new_data;
	var script_blacklisted_tags = bbb.user.script_blacklisted_tags;

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

	if (!useAccount()) // Immediately apply script blacklist for logged out users or blacklist override.
		delayMe(blacklistInit);

	if (search_add)
		searchAdd();

	if (remove_tag_headers)
		removeTagHeaders();

	if (post_tag_titles)
		postTagTitles();

	if (track_new)
		trackNew();

	injectSettings();

	if (enable_status_message)
		bbbStatusInit();

	if (!noXML()) {
		if (useAPI()) // API only features.
			searchJSON(gLoc);
		else // Alternate mode for features.
			modifyPage(gLoc);
	}

	if (clean_links)
		cleanLinks();

	if (arrow_nav && allowArrowNav())
		document.addEventListener("keydown", arrowNav, false);

	if (thumbnail_count)
		limitFix();

	/* Functions */

	/* Functions for creating a url and retrieving info from it */
	function searchJSON(mode, xml) {
		var numThumbs = document.getElementsByClassName("post-preview").length;
		var limit = "";

		if (mode === "search" || mode === "notes") {
			var numExpected = getVar("limit") || thumbnail_count_default;
			var numDesired = 0;

			if (allowUserLimit()) {
				numDesired = thumbnail_count;
				limit = "&limit=" + thumbnail_count;
			}
			else
				numDesired = numExpected;

			if (numThumbs !== numDesired || numThumbs < numExpected || direct_downloads) {
				if (mode === "search")
					fetchJSON(gUrl.replace(/\/?(?:posts)?\/?(?:\?|$)/, "/posts.json?") + limit, "search");
				else
					fetchJSON(gUrl.replace(/\/notes\/?(?:\?|$)/, "/notes.json?") + limit, "notes");
			}
		}
		else if (mode === "post") {
			if (!needPostAPI())
				fetchInfo();
			else
				fetchJSON(gUrl.replace(/\/posts\/(\d+).*/, "/posts/$1.json"), "post");
		}
		else if (mode === "popular") {
			if (numThumbs !== thumbnail_count_default || direct_downloads)
				fetchJSON(gUrl.replace(/\/popular\/?/, "/popular.json"), "popular");
		}
		else if (mode === "pool") {
			if (numThumbs !== thumbnail_count_default || direct_downloads)
				fetchJSON(gUrl.replace(/\/pools\/(\d+)/, "/pools/$1.json"), "pool");
		}
		else if (mode === "poolsearch") {
			var poolIds = xml.post_ids.split(" ");
			var page = getVar("page") || 1;
			var postIds = poolIds.slice((page - 1) * thumbnail_count_default, page * thumbnail_count_default);

			fetchJSON("/posts.json?tags=status:any+id:" + postIds.join(","), "poolsearch", postIds);
		}
		else if (mode === "comments") {
			if (numThumbs !== 5)
				fetchJSON(gUrl.replace(/\/comments\/?/, "/comments.json"), "comments");
		}
	}

	function fetchJSON(url, mode, optArg) {
		// Retrieve JSON.
		var xmlhttp = new XMLHttpRequest();

		if (xmlhttp !== null) {
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState === 4) { // 4 = "loaded"
					if (xmlhttp.status === 200) { // 200 = "OK"
						var xml = JSON.parse(xmlhttp.responseText);

						if (mode === "search" || mode === "popular" || mode === "notes")
							parseListing(xml);
						else if (mode === "post")
							parsePost(xml);
						else if (mode === "pool")
							searchJSON("poolsearch", xml);
						else if (mode === "poolsearch")
							parseListing(xml, optArg);
						else if (mode === "comments")
							parseComments(xml);
					}
					else {
						if (xmlhttp.status === 403 || xmlhttp.status === 401) {
							danbNotice('Better Better Booru: Error retrieving information. Access denied. You must be logged in to a Danbooru account to access the API for hidden image information and direct downloads. <br><span style="font-size: smaller;">(<span><a href="#" id="bbb-bypass-api-link">Do not warn me again and automatically bypass API features in the future.</a></span>)</span>', "error");
							document.getElementById("bbb-bypass-api-link").addEventListener("click", function(event) {
								updateSettings("bypass_api", true);
								this.parentNode.innerHTML = "Settings updated. You may change this setting under preferences in the settings panel.";
								event.preventDefault();
							}, false);
						}
						else if (xmlhttp.status === 421)
							danbNotice("Better Better Booru: Error retrieving information. Your Danbooru API access is currently throttled. Please try again later.", "error");
						else if (xmlhttp.status !== 0)
							danbNotice("Better Better Booru: Error retrieving information. (Code: " + xmlhttp.status + " " + xmlhttp.statusText + ")", "error");

						// Update status message.
						bbbStatus("error");
					}
				}
			};
			xmlhttp.open("GET", url, true);
			xmlhttp.send(null);

			// Loading status message.
			if (mode === "search" || mode === "popular" || mode === "notes" || mode === "post" || mode === "pool")
				bbbStatus("image");
			else if (mode === "comments")
				bbbStatus("comment");
		}
	}

	function modifyPage(mode) {
		// Let other functions that don't require the API run. (Alternative to searchJSON)
		if (mode === "post") {
			if (!needPostAPI())
				fetchInfo();
		}
		else if (mode === "search" || mode === "notes") {
			if (allowUserLimit()) {
				var url = gUrl;

				if (url.indexOf("?") > -1)
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
		var infoHrefValues = /data\/(.+?)\.(.+?)$/.exec(infoHref);
		var md5 = infoHrefValues[1];
		var ext = infoHrefValues[2];
		var infoSection = infoLink.parentNode.parentNode;
		var imgHeight = 0;
		var imgWidth = 0;
		var hasLarge = false;
		var childNotice = document.getElementsByClassName("notice-child");
		var img = document.getElementById("image");
		var imgContainer = document.getElementById("image-container");
		var object = imgContainer.getElementsByTagName("object")[0];
		var infoTextDim = /\((\d+)x(\d+)\)/.exec(infoLink.parentNode.textContent);
		var postId = fetchMeta("post-id");

		if (img) { // Regular image.
			imgHeight = Number(img.getAttribute("data-original-height"));
			imgWidth = Number(img.getAttribute("data-original-width"));
			hasLarge = (imgWidth > 850 ? true : false);
		}
		else if (object) { // Flash object.
			imgHeight = Number(object.getAttribute("height"));
			imgWidth = Number(object.getAttribute("width"));
			hasLarge = false;
		}
		else if (infoTextDim) { // Displayed content removed but the link still exists.
			imgHeight = Number(infoTextDim[2]);
			imgWidth = Number(infoTextDim[1]);
			hasLarge = (imgWidth > 850 ? true : false);
		}
		else { // Manual download.
			imgHeight = null;
			imgWidth = null;
			hasLarge = false;
		}

		var imgInfo = {
			id: Number(postId),
			file_ext: ext,
			md5: md5,
			url: infoHref,
			fav_count: Number(document.getElementById("favcount-for-post-" + postId).textContent),
			has_children: (document.getElementsByClassName("notice-parent").length ? true : false),
			parent_id: (childNotice.length ? Number(childNotice[0].children[0].href.match(/\d+/)) : null),
			rating: /Rating:\s*(\w)/.exec(infoSection.textContent)[1].toLowerCase(),
			score: Number(document.getElementById("score-for-post-" + postId).textContent),
			tag_string: fetchMeta("tags"),
			pool_string: fetchMeta("pools"),
			uploader_name: /Uploader:\s*(.+?)\s*»/.exec(infoSection.textContent)[1],
			is_deleted: (fetchMeta("post-is-deleted") === "false" ? false : true),
			is_flagged: (fetchMeta("post-is-flagged") === "false" ? false : true),
			is_pending: (!document.getElementById("pending-approval-notice") ? false : true),
			image_height: imgHeight,
			image_width: imgWidth,
			has_large: hasLarge,
			file_url: "/data/" + md5 + "." + ext,
			large_file_url: "/data/sample/sample-" + md5 + ".jpg",
			preview_file_url: (!imgHeight || ext === "swf" ? "/images/download-preview.png" : "/ssd/data/preview/" + md5 + ".jpg"),
			exists: true
		};

		delayMe(function(){parsePost(imgInfo);}); // Delay is needed to force the script to pause and allow Danbooru to do whatever. It essentially mimics the async nature of the API call.
	}

	function fetchPages(url, mode, optArg) {
		// Retrieve an actual page for certain pieces of information.
		var xmlhttp = new XMLHttpRequest();

		if (xmlhttp !== null) {
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState === 4) { // 4 = "loaded"
					if (xmlhttp.status === 200) { // 200 = "OK"
						var childSpan = document.createElement("span");
						var newContent;
						var target;

						childSpan.innerHTML = xmlhttp.responseText;

						if (mode === "paginator") { // Fetch updated paginator for the first page of searches.
							target = document.getElementsByClassName("paginator")[0];
							newContent = childSpan.getElementsByClassName("paginator")[0];

							if (newContent)
								target.parentNode.replaceChild(newContent, target);
						}
						else if (mode === "comments") { // Fetch post to get comments.
							var post = optArg.post;
							var postId = optArg.post_id;
							var commentSection = childSpan.getElementsByClassName("comments-for-post")[0];
							var comments = commentSection.getElementsByClassName("comment");
							var numComments = comments.length;
							var toShow = 6; // Number of comments to display.
							target = post.getElementsByClassName("comments-for-post")[0];
							newContent = document.createDocumentFragment();

							// Fix the comments.
							if (numComments > toShow) {
								for (var i = 0, toHide = numComments - toShow; i < toHide; i++)
									comments[i].style.display = "none";

								commentSection.getElementsByClassName("row notices")[0].innerHTML = '<span class="info" id="threshold-comments-notice-for-' + postId + '"> <a href="/comments?include_below_threshold=true&amp;post_id=' + postId + '" data-remote="true">Show all comments</a> </span>';
							}

							// Add it all in and get it ready.
							while (commentSection.children[0])
								newContent.appendChild(commentSection.children[0]);

							target.appendChild(newContent);

							Danbooru.Comment.initialize_all();

							// Update status message.
							bbbStatus("loaded");
						}
						else if (mode === "thumbnails") { // Fetch the thumbnails and paginator from the page of a search and replace the existing ones.
							var divId = (gLoc === "search" ? "posts" : "a-index");
							var paginator = childSpan.getElementsByClassName("paginator")[0];
							target = document.getElementById(divId);
							newContent = (paginator ? paginator.parentNode : null);

							if (newContent)
								target.parentNode.replaceChild(newContent, target);

							// Thumbnail classes and titles
							formatThumbnails();

							// Blacklist
							blacklistInit();

							// Clean links
							if (clean_links)
								cleanLinks();

							// Update status message.
							bbbStatus("loaded");
						}
					}
					else if (xmlhttp.status !== 0) {
						danbNotice("Better Better Booru: Error retrieving information. (Code: " + xmlhttp.status + " " + xmlhttp.statusText + ")", "error");

						// Update status message.
						bbbStatus("error");
					}
				}
			};
			xmlhttp.open("GET", url, true);
			xmlhttp.send(null);

			// Loading status message.
			if (mode === "thumbnails")
				bbbStatus("image");
			else if (mode === "comments")
				bbbStatus("comment");
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
		if (!posts.length) {
			bbbStatus("loaded");
			return;
		}

		// Use JSON results for searches and pool collections.
		if (gLoc === "search") {
			where = document.getElementById("posts");
			search = (gUrlQuery.indexOf("tags=") > -1 && !clean_links ? "?tags=" + getVar("tags") : "");
		}
		else if (gLoc === "popular") {
			where = document.getElementById("a-index");
			out = document.getElementById("a-index").innerHTML.split("<article", 1)[0];
		}
		else if (gLoc === "pool") {
			var orderedPostIds = optArg;
			where = document.getElementById("a-show").getElementsByTagName("section")[0];
			search = (!clean_links ? "?pool_id=" + /\/pools\/(\d+)/.exec(gUrlPath)[1] : "");
			out = "\f,;" + orderedPostIds.join("\f,;");
		}
		else if (gLoc === "notes") {
			where = document.getElementById("a-index");
			out = "<h1>Notes</h1>";
		}

		if (!where) {
			bbbStatus("error");
			return;
		}

		// Result preparation.
		for (var i = 0, pl = posts.length; i < pl; i++) {
			var post = formatJSON(posts[i]);
			var outId = "";
			var thumb = "";

			// Don't display loli/shota/toddlercon/deleted if the user has opted so and skip to the next image.
			if ((!show_loli && /\bloli\b/.test(post.tag_string)) || (!show_shota && /\bshota\b/.test(post.tag_string)) || (!show_toddlercon && /\btoddlercon\b/.test(post.tag_string)) || (!show_deleted && post.is_deleted)) {
				if (gLoc === "pool") {
					outId = new RegExp("\f,;" + post.id + "(?=<|\f|$)");
					out = out.replace(outId, "");
				}

				continue;
			}

			// eek, huge line.
			thumb = '<article class="post-preview' + post.thumb_class + '" id="post_' + post.id + '" data-id="' + post.id + '" data-tags="' + post.tag_string + '" data-pools="' + post.pool_string + '" data-uploader="' + post.uploader_name + '" data-rating="' + post.rating + '" data-width="' + post.image_width + '" data-height="' + post.image_height + '" data-flags="' + post.flags + '" data-parent-id="' + post.parent + '" data-has-children="' + post.has_children + '" data-score="' + post.score + '" data-fav-count="' + post.fav_count + '"><a href="/posts/' + post.id + search + '"><img src="' + post.preview_file_url + '" alt="' + post.tag_string + '"></a></article>';

			if (direct_downloads)
				thumb += '<a style="display: none;" href="' + post.file_url + '">Direct Download</a></span>';

			// Generate output.
			if (gLoc === "search" || gLoc === "notes" || gLoc === "popular")
				out += thumb;
			else if (gLoc === "pool") {
				outId = new RegExp("\f,;" + post.id + "(?=<|\f|$)");
				out = out.replace(outId, thumb);
			}
		}

		// Replace results with new results.
		if (paginator) {
			where.innerHTML = out + outerHTML(paginator);
			paginator = document.getElementsByClassName("paginator")[0];

			if (gLoc === "search" || gLoc === "notes") {
				var noPages = paginator.textContent.indexOf("Go back") > -1;
				var pageUrl = gUrl;

				if (allowUserLimit()) {
					// Fix existing paginator with user's custom limit.
					var pageLinks = document.evaluate('.//a', paginator, null, 6, null);

					for (var i = 0, isl = pageLinks.snapshotLength; i < isl; i++)
						pageLinks.snapshotItem(i).href = pageLinks.snapshotItem(i).href + "&limit=" + thumbnail_count;

					// Attempt to fix the paginator by retrieving it from an actual page. Might not work if connections are going slowly.
					if (pageUrl.indexOf("?") > -1)
						pageUrl += "&limit=" + thumbnail_count;
					else
						pageUrl += "?limit=" + thumbnail_count;

					fetchPages(pageUrl, "paginator");
				}
				else if (noPages) // Fix the paginator if the post xml and existing page are out of sync.
					fetchPages(pageUrl, "paginator");
			}
		}
		else
			where.innerHTML = out;

		// Thumbnail classes and titles.
		formatThumbnails();

		// Blacklist.
		blacklistInit();

		// Update status message.
		bbbStatus("loaded");
	}

	function parsePost(xml) {
		var post = formatJSON(xml);
		var imgContainer = document.getElementById("image-container");

		if (!post.id || !imgContainer)
			return;

		var ratio = (post.image_width > 850 ? 850 / post.image_width : 1);
		var sampHeight = Math.round(post.image_height * ratio);
		var sampWidth = Math.round(post.image_width * ratio);
		var newWidth = 0;
		var newHeight = 0;
		var newUrl = "";
		var altTxt = "";

		if (post.file_ext === "swf") // Create flash object.
			imgContainer.innerHTML = '<div id="note-container"></div> <div id="note-preview"></div> <object height="' + post.image_height + '" width="' + post.image_width + '"> <params name="movie" value="' + post.file_url + '"> <embed allowscriptaccess="never" src="' + post.file_url + '" height="' + post.image_height + '" width="' + post.image_width + '"> </params> </object> <p><a href="' + post.file_url + '">Save this flash (right click and save)</a></p>';
		else if (!post.image_height) // Create manual download.
			imgContainer.innerHTML = '<div id="note-container"></div> <div id="note-preview"></div><p><a href="' + post.file_url + '">Save this file (right click and save)</a></p>';
		else { // Create image
			var useSample = (checkSetting("default-image-size", "large", load_sample_first) && post.has_large);

			if (useSample) {
				newWidth = sampWidth;
				newHeight = sampHeight;
				newUrl = post.large_file_url;
				altTxt = "Sample";
			}
			else {
				newWidth = post.image_width;
				newHeight = post.image_height;
				newUrl = post.file_url;
				altTxt = post.md5;
			}

			imgContainer.innerHTML = '<div id="note-container"></div> <div id="note-preview"></div> <img alt="' + altTxt + '" data-fav-count="' + post.fav_count + '" data-flags="' + post.flags + '" data-has-children="' + post.has_children + '" data-large-height="' + sampHeight + '" data-large-width="' + sampWidth + '" data-original-height="' + post.image_height + '" data-original-width="' + post.image_width + '" data-rating="' + post.rating + '" data-score="' + post.score + '" data-tags="' + post.tag_string + '" data-pools="' + post.pool_string + '" data-uploader="' + post.uploader_name + '" height="' + newHeight + '" width="' + newWidth + '" id="image" src="' + newUrl + '" /> <img src="about:blank" height="1" width="1" id="bbb-loader" style="position: absolute; right: 0px; top: 0px; display: none;"/>';

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
				bbbResizeNotice.innerHTML = '<span id="bbb-sample-notice" style="display:none;">Resized to ' + Math.round(ratio * 100) + '% of original (<a href="' + post.file_url + '" id="bbb-original-link">view original</a>)</span><span id="bbb-original-notice" style="display:none;">Viewing original (<a href="' + post.large_file_url + '" id="bbb-sample-link">view sample</a>)</span> <span id="bbb-img-status"></span><span style="display: none;" class="close-button ui-icon ui-icon-closethick" id="close-original-notice"></span>';
				imgContainer.parentNode.insertBefore(bbbResizeNotice, imgContainer);

				var swapInit = true;
				var sampleNotice = document.getElementById("bbb-sample-notice");
				var originalNotice = document.getElementById("bbb-original-notice");
				var imgStatus = document.getElementById("bbb-img-status");
				var closeOriginalNotice = document.getElementById("close-original-notice");

				if (useSample) {
					sampleNotice.style.display = "inline";
					bbbResizeNotice.style.display = "block";
				}
				else if (!hide_original_notice) {
					originalNotice.style.display = "inline";
					closeOriginalNotice.style.display = "inline";
					bbbResizeNotice.style.display = "block";
				}

				document.getElementById("bbb-sample-link").addEventListener("click", function(event) {
					if (event.button === 0) {
						if (swapInit)
							swapInit = false;

						bbbLoader.src = this.href;
						imgStatus.innerHTML = "Loading sample image...";
						event.preventDefault();
					}
				}, false);
				document.getElementById("bbb-original-link").addEventListener("click", function(event) {
					if (event.button === 0) {
						if (swapInit)
							swapInit = false;

						bbbLoader.src = this.href;
						imgStatus.innerHTML = "Loading original image...";
						event.preventDefault();
					}
				}, false);
				bbbLoader.addEventListener("load", function(event) {
					img.src = this.src;
					this.src = "about:blank";
					imgStatus.innerHTML = "";
				}, false);
				bbbLoader.addEventListener("error", function(event) {
					if (this.src !== "about:blank")
						imgStatus.innerHTML = "Loading failed!";

					event.preventDefault();
				}, false);
				img.addEventListener("load", function(event) {
					if (img.src.indexOf("/sample/") < 0) {
						if (hide_original_notice)
							bbbResizeNotice.style.display = "none";
						else {
							sampleNotice.style.display = "none";
							originalNotice.style.display = "inline";
							closeOriginalNotice.style.display = "inline";
						}

						img.alt = post.md5;
						img.setAttribute("height", post.image_height);
						img.setAttribute("width", post.image_width);

						if (!swapInit)
							resizeImage("none");
					}
					else {
						sampleNotice.style.display = "inline";
						originalNotice.style.display = "none";
						closeOriginalNotice.style.display = "none";
						img.alt = "Sample";
						img.setAttribute("height", sampHeight);
						img.setAttribute("width", sampWidth);

						if (!swapInit)
							resizeImage("none");
					}
				}, false);
				closeOriginalNotice.addEventListener("click", function(event) {
					bbbResizeNotice.style.display = "none";
					updateSettings("hide_original_notice", true);
				}, false);
			}

			// Enable the "Resize to window", "Toggle Notes", and "Find similar" options for logged out users.
			if (!isLoggedIn()) {
				var options = document.createElement("section");
				var history = document.evaluate('//aside[@id="sidebar"]/section[last()]', document, null, 9, null).singleNodeValue;

				options.innerHTML = '<h1>Options</h1><ul><li><a href="#" id="image-resize-to-window-link">Resize to window</a></li>' + (alternate_image_swap ? '<li><a href="#" id="listnotetoggle">Toggle notes</a></li>' : '') + '<li><a href="http://danbooru.iqdb.org/db-search.php?url=http://danbooru.donmai.us/ssd/data/preview/' + post.md5 + '.jpg">Find similar</a></li></ul>';
				history.parentNode.insertBefore(options, history);
			}

			// Make translation mode work.
			if (!document.getElementById("note-locked-notice")) {
				var translateLink = document.getElementById("translate");

				// Make the normal toggling work for hidden posts.
				if (!post.exists) {
					if (translateLink)
						translateLink.addEventListener("click", Danbooru.Note.TranslationMode.toggle, false);

					document.addEventListener("keydown", function(event) {
						if (event.keyCode === 78 && document.activeElement.type !== "text" && document.activeElement.type !== "textarea")
							Danbooru.Note.TranslationMode.toggle(event);
					}, false);
				}

				// Script translation mode events and tracking used to resolve timing issues.
				bbb.img.translationMode = Danbooru.Note.TranslationMode.active;

				if (translateLink)
					translateLink.addEventListener("click", translationModeToggle, false);

				document.addEventListener("keydown", function(event) {
					if (event.keyCode === 78 && document.activeElement.type !== "text" && document.activeElement.type !== "textarea")
						translationModeToggle();
				}, false);
			}

			if (!alternate_image_swap) { // Make notes toggle when clicking the image.
				document.addEventListener("click", function(event) {
					if (event.target.id === "image" && event.button === 0 && !bbb.img.translationMode) {
						if (!bbb.dragScroll || !bbb.dragScroll.moved)
							Danbooru.Note.Box.toggle_all();

						event.stopPropagation();
					}
				}, true);
			}
			else { // Make sample/original images swap when clicking the image.
				// Make a "Toggle Notes" link in the options bar.
				if (!document.getElementById("listnotetoggle")) { // For logged in users.
					var translateOption = document.getElementById("translate").parentNode;
					var listNoteToggle = document.createElement("li");

					listNoteToggle.innerHTML = '<a href="#" id="listnotetoggle">Toggle notes</a>';
					translateOption.parentNode.insertBefore(listNoteToggle, translateOption);
				}

				document.getElementById("listnotetoggle").addEventListener("click", function(event) {
					Danbooru.Note.Box.toggle_all();
					event.preventDefault();
				}, false);

				// Make clicking the image swap between the original and sample image when available.
				if (post.has_large) {
					document.addEventListener("click", function(event) {
						if (event.target.id === "image" && event.button === 0 && !bbb.img.translationMode) {
							if (!bbb.dragScroll || !bbb.dragScroll.moved) {
								if (img.src.indexOf("/sample/") > -1) {
									if (swapInit)
										swapInit = false;

									bbbLoader.src = post.file_url;
									imgStatus.innerHTML = "Loading original image...";
								}
								else {
									if (swapInit)
										swapInit = false;

									bbbLoader.src = post.large_file_url;
									imgStatus.innerHTML = "Loading sample image...";
								}
							}

							event.stopPropagation();
						}
					}, true);
				}
			}

			// Alter the "resize to window" link.
			var resizeListItem = document.getElementById("image-resize-to-window-link").parentNode;
			var resizeFrag = document.createDocumentFragment();

			var resizeListWidth = document.createElement("li");
			resizeFrag.appendChild(resizeListWidth);

			var resizeLinkWidth = document.createElement("a");
			resizeLinkWidth.href = "#";
			resizeLinkWidth.innerHTML = "Resize to window width";
			resizeLinkWidth.addEventListener("click", function(event) {
				resizeImage("width");
				event.preventDefault();
			}, false);
			resizeListWidth.appendChild(resizeLinkWidth);
			bbb.el.resizeLinkWidth = resizeLinkWidth;

			var resizeListAll = document.createElement("li");
			resizeFrag.appendChild(resizeListAll);

			var resizeLinkAll = document.createElement("a");
			resizeLinkAll.href = "#";
			resizeLinkAll.innerHTML = "Resize to window";
			resizeLinkAll.addEventListener("click", function(event) {
				resizeImage("all");
				event.preventDefault();
			}, false);
			resizeListAll.appendChild(resizeLinkAll);
			bbb.el.resizeLinkAll = resizeLinkAll;

			resizeListItem.parentNode.replaceChild(resizeFrag, resizeListItem);

			// Resize the image if desired.
			if (checkSetting("always-resize-images", "true", image_resize))
				resizeImage(image_resize_mode);

			// Load/reload notes.
			Danbooru.Note.load_all();

			// Allow drag scrolling.
			if (image_drag_scroll)
				dragScrollInit();
		}

		// Auto position the content if desired.
		if (autoscroll_image)
			autoscrollImage();

		// Blacklist.
		blacklistInit();

		// Update status message.
		bbbStatus("loaded");
	}

	function parseComments(xml) {
		var posts = xml;
		var numPosts = posts.length;
		var expectedPosts = numPosts;
		var existingPosts = document.getElementsByClassName("post post-preview"); // Live node list so adding/removing a "post post-preview" class item immediately changes this.
		var eci = 0;

		for (var i = 0; i < numPosts; i++) {
			var post = formatJSON(posts[i]);
			var existingPost = existingPosts[eci];

			if (!existingPost || post.id !== Number(existingPost.getAttribute("data-id"))) {
				if (!/\b(?:loli|shota|toddlercon)\b/.test(post.tag_string)) // API post isn't loli/shota and doesn't exist on the page so the API has different information. Skip it and try to find where the page's info matches up.
					continue;
				else if ((!show_loli && /\bloli\b/.test(post.tag_string)) || (!show_shota && /\bshota\b/.test(post.tag_string)) || (!show_toddlercon && /\btoddlercon\b/.test(post.tag_string))) { // Skip loli/shota/toddlercon if the user has selected to do so.
					expectedPosts--;
					continue;
				}

				// Prepare the post information.
				var tagLinks = post.tag_string.bbbSpacePad();
				var generalTags = post.tag_string_general.split(" ");
				var artistTags = post.tag_string_artist.split(" ");
				var copyrightTags = post.tag_string_copyright.split(" ");
				var characterTags = post.tag_string_character.split(" ");
				var limit = (thumbnail_count ? "&limit=" + thumbnail_count : "");
				var tag;

				for (var j = 0, gtl = generalTags.length; j < gtl; j++) {
					tag = generalTags[j];
					tagLinks = tagLinks.replace(tag.bbbSpacePad(), ' <span class="category-0"> <a href="/posts?tags=' + encodeURIComponent(tag) + limit + '">' + tag.replace(/_/g, " ") + '</a> </span> ');
				}

				for (var j = 0, atl = artistTags.length; j < atl; j++) {
					tag = artistTags[j];
					tagLinks = tagLinks.replace(tag.bbbSpacePad(), ' <span class="category-1"> <a href="/posts?tags=' + encodeURIComponent(tag) + limit + '">' + tag.replace(/_/g, " ") + '</a> </span> ');
				}

				for (var j = 0, ctl = copyrightTags.length; j < ctl; j++) {
					tag = copyrightTags[j];
					tagLinks = tagLinks.replace(tag.bbbSpacePad(), ' <span class="category-3"> <a href="/posts?tags=' + encodeURIComponent(tag) + limit + '">' + tag.replace(/_/g, " ") + '</a> </span> ');
				}

				for (var j = 0, ctl = characterTags.length; j < ctl; j++) {
					tag = characterTags[j];
					tagLinks = tagLinks.replace(tag.bbbSpacePad(), ' <span class="category-4"> <a href="/posts?tags=' + encodeURIComponent(tag) + limit + '">' + tag.replace(/_/g, " ") + '</a> </span> ');
				}

				// Create the new post.
				var childSpan = document.createElement("span");

				childSpan.innerHTML = '<div class="post post-preview' + post.thumb_class + '" data-tags="' + post.tag_string + '" data-pools="' + post.pool_string + '" data-uploader="' + post.uploader_name + '" data-rating="' + post.rating + '" data-flags="' + post.flags + '" data-score="' + post.score + '" data-parent-id="' + post.parent + '" data-has-children="' + post.has_children + '" data-id="' + post.id + '" data-width="' + post.image_width + '" data-height="' + post.image_height + '"> <div class="preview"> <a href="/posts/' + post.id + '"> <img alt="' + post.md5 + '" src="' + post.preview_file_url + '" /> </a> </div> <div class="comments-for-post" data-post-id="' + post.id + '"> <div class="header"> <div class="row"> <span class="info"> <strong>Date</strong> <time datetime="' + post.created_at + '" title="' + post.created_at.replace(/(.+)T(.+)-(.+)/, "$1 $2 -$3") + '">' + post.created_at.replace(/(.+)T(.+):\d+-.+/, "$1 $2") + '</time> </span> <span class="info"> <strong>User</strong> <a href="/users/' + post.uploader_id + '">' + post.uploader_name + '</a> </span> <span class="info"> <strong>Rating</strong> ' + post.rating + ' </span> <span class="info"> <strong>Score</strong> <span> <span id="score-for-post-' + post.id + '">' + post.score + '</span> </span> </span> </div> <div class="row list-of-tags"> <strong>Tags</strong>' + tagLinks + '</div> </div> </div> <div class="clearfix"></div> </div>';

				if (!existingPost) // There isn't a next post so append the new post to the end before the paginator.
					document.getElementById("a-index").insertBefore(childSpan.firstChild, document.getElementsByClassName("paginator")[0]);
				else // Insert new post before the post that should follow it.
					existingPost.parentNode.insertBefore(childSpan.firstChild, existingPost);

				// Get the comments.
				fetchPages("/posts/" + post.id, "comments", {post: existingPosts[eci], post_id: post.id});
			}

			eci++;
		}

		// If we don't have the expected number of posts, the API info and page are too out of sync.
		if (existingPosts.length !== expectedPosts) {
			danbNotice("Better Better Booru: Loading of hidden loli/shota post(s) failed. Please refresh.", "error");
			bbbStatus("error");
		}
		else
			bbbStatus("loaded");

		// Thumbnail classes and titles.
		formatThumbnails();

		// Blacklist.
		blacklistInit();
	}

	/* Functions for the settings panel */
	function injectSettings() {
		var menu = document.getElementById("top");

		if (!menu)
			return;

		menu = menu.getElementsByTagName("menu")[0];

		var link = document.createElement("a");
		link.href = "#";
		link.innerHTML = "BBB Settings";
		link.addEventListener("click", function(event) {
			if (!bbb.el.menu.window) {
				loadSettings();
				createMenu();
			}

			event.preventDefault();
		}, false);

		var item = document.createElement("li");
		item.appendChild(link);

		var menuItems = menu.getElementsByTagName("li");
		menu.insertBefore(item, menuItems[menuItems.length - 1]);

		window.addEventListener("resize", adjustMenuTimer, false);
	}

	function createMenu() {
		var menu = document.createElement("div");
		menu.id = "bbb_menu";
		menu.style.visibility = "hidden";
		bbb.el.menu.window = menu;

		var header = document.createElement("h1");
		header.innerHTML = "Better Better Booru Settings";
		header.style.textAlign = "center";
		menu.appendChild(header);

		var tabBar = document.createElement("div");
		tabBar.style.padding = "0px 15px";
		tabBar.addEventListener("click", function(event) {
			var target = event.target;

			if (target.href)
				changeTab(target);

			event.preventDefault();
		}, false);
		menu.appendChild(tabBar);

		var generalTab = document.createElement("a");
		generalTab.name = "general";
		generalTab.href = "#";
		generalTab.innerHTML = "General";
		generalTab.className = "bbb-tab bbb-active-tab";
		tabBar.appendChild(generalTab);
		bbb.el.menu.generalTab = generalTab;

		var borderTab = document.createElement("a");
		borderTab.name = "borders";
		borderTab.href = "#";
		borderTab.innerHTML = "Borders";
		borderTab.className = "bbb-tab";
		tabBar.appendChild(borderTab);
		bbb.el.menu.borderTab = borderTab;

		var prefTab = document.createElement("a");
		prefTab.name = "pref";
		prefTab.href = "#";
		prefTab.innerHTML = "Preferences";
		prefTab.className = "bbb-tab";
		tabBar.appendChild(prefTab);
		bbb.el.menu.prefTab = prefTab;

		var helpTab = document.createElement("a");
		helpTab.name = "help";
		helpTab.href = "#";
		helpTab.innerHTML = "Help";
		helpTab.className = "bbb-tab";
		tabBar.appendChild(helpTab);
		bbb.el.menu.helpTab = helpTab;

		var scrollDiv = document.createElement("div");
		scrollDiv.className = "bbb-scroll-div";
		menu.appendChild(scrollDiv);
		scrollDiv.scrollTop = 0;
		bbb.el.menu.scrollDiv = scrollDiv;

		var generalPage = document.createElement("div");
		generalPage.className = "bbb-page";
		generalPage.style.display = "block";
		scrollDiv.appendChild(generalPage);
		bbb.el.menu.generalPage = generalPage;

		generalPage.bbbSection(bbb.sections.browse);
		generalPage.bbbSection(bbb.sections.image_control);
		generalPage.bbbSection(bbb.sections.sidebar);
		generalPage.bbbSection(bbb.sections.misc);
		generalPage.bbbSection(bbb.sections.layout);
		generalPage.bbbSection(bbb.sections.logged_out);

		var bordersPage = document.createElement("div");
		bordersPage.className = "bbb-page";
		scrollDiv.appendChild(bordersPage);
		bbb.el.menu.bordersPage = bordersPage;

		bordersPage.bbbSection(bbb.sections.border_options);
		bordersPage.bbbSection(bbb.sections.status_borders);
		bordersPage.bbbSection(bbb.sections.tag_borders);

		var prefPage = document.createElement("div");
		prefPage.className = "bbb-page";
		scrollDiv.appendChild(prefPage);
		bbb.el.menu.prefPage = prefPage;

		prefPage.bbbSection(bbb.sections.script_settings);
		prefPage.bbbBackupSection();

		var helpPage = document.createElement("div");
		helpPage.className = "bbb-page";
		scrollDiv.appendChild(helpPage);
		bbb.el.menu.helpPage = helpPage;

		helpPage.bbbTextSection('Thumbnail Matching Rules', 'For creating thumbnail matching rules, please consult the following examples:<ul><li><b>tag1</b> - Match posts with tag1.</li><li><b>tag1 tag2</b> - Match posts with tag1 AND tag2.</li><li><b>-tag1</b> - Match posts without tag1.</li><li><b>tag1 -tag2</b> - Match posts with tag1 AND without tag2.</li><li><b>~tag1 ~tag2</b> - Match posts with tag1 OR tag2.</li><li><b>~tag1 ~-tag2</b> - Match posts with tag1 OR without tag2.</li><li><b>tag1 ~tag2 ~tag3</b> - Match posts with tag1 AND either tag2 OR tag3.</li></ul><br><br>Wildcards can be used with any of the above methods:<ul><li><b>~tag1* ~-*tag2</b> - Match posts with tags starting with tag1 OR posts without tags ending with tag2.</li></ul><br><br>Multiple match rules can be applied by using commas:<ul><li><b>tag1 tag2, tag3 tag4</b> - Match posts with tag1 AND tag2 or posts with tag3 AND tag4.</li><li><b>tag1 ~tag2 ~tag3, tag4</b> - Match posts with tag1 AND either tag2 OR tag3 or posts with tag4.</li></ul><br><br>The following metatags are supported:<ul><li><b>rating:safe</b> - Match posts rated safe. Accepted values include safe, explicit, and questionable.</li><li><b>status:pending</b> - Match pending posts. Accepted values include active, pending, flagged, and deleted. Note that flagged posts also count as active posts.</li><li><b>user:albert</b> - Match posts made by the user Albert.</li><li><b>pool:1</b> - Match posts that are in the pool with an ID number of 1.</li><li><b>id:1</b> - Match posts with an ID number of 1.</li><li><b>score:1</b> - Match posts with a score of 1.</li><li><b>favcount:1</b> - Match posts with a favorite count of 1.</li><li><b>height:1</b> - Match posts with a height of 1.</li><li><b>width:1</b> - Match posts with a width of 1.</li></ul><br><br>The id, score, favcount, width, and height metatags can also use number ranges for matching:<ul><li><b>score:&lt;5</b> - Match posts with a score less than 5.</li><li><b>score:&gt;5</b> - Match posts with a score greater than 5.</li><li><b>score:&lt;=5</b> or <b>score:..5</b> - Match posts with a score equal to OR less than 5.</li><li><b>score:&gt;=5</b> or <b>score:5..</b> - Match posts with a score equal to OR greater than 5.</li><li><b>score:1..5</b> - Match posts with a score equal to OR greater than 1 AND equal to OR less than 5.</li></ul>');
		helpPage.bbbTextSection('Questions, Suggestions, or Bugs?', 'If you have any questions, please use the UserScripts forums located <a target="_blank" href="http://userscripts.org/scripts/discuss/100614">here</a>. If you\'d like to report a bug or make a suggestion, please create an issue on GitHub <a target="_blank" href="https://github.com/pseudonymous/better-better-booru/issues">here</a>.');
		helpPage.bbbTocSection();

		var close = document.createElement("a");
		close.innerHTML = "Save & Close";
		close.href = "#";
		close.className = "bbb-button";
		close.style.marginRight = "15px";
		close.addEventListener("click", function(event) {
			removeMenu();
			saveSettings();
			event.preventDefault();
		}, false);

		var cancel = document.createElement("a");
		cancel.innerHTML = "Cancel";
		cancel.href = "#";
		cancel.className = "bbb-button";
		cancel.addEventListener("click", function(event) {
			removeMenu();
			loadSettings();
			event.preventDefault();
		}, false);

		var reset = document.createElement("a");
		reset.innerHTML = "Reset to Defaults";
		reset.href = "#";
		reset.className = "bbb-button";
		reset.style.cssFloat = "right";
		reset.style.color = "#ff1100";
		reset.addEventListener("click", function(event) {
			removeMenu();
			loadDefaults();
			createMenu();
			event.preventDefault();
		}, false);

		menu.appendChild(close);
		menu.appendChild(cancel);
		menu.appendChild(reset);

		var tip = document.createElement("div");
		tip.className = "bbb-expl";
		menu.appendChild(tip);
		bbb.el.menu.tip = tip;

		var tagEditBlocker = document.createElement("div");
		tagEditBlocker.className = "bbb-edit-blocker";
		menu.appendChild(tagEditBlocker);
		bbb.el.menu.tagEditBlocker = tagEditBlocker;

		var tagEditBox = document.createElement("div");
		tagEditBox.className = "bbb-edit-box";
		tagEditBlocker.appendChild(tagEditBox);

		var tagEditHeader = document.createElement("h2");
		tagEditHeader.innerHTML = "Tag Editor";
		tagEditHeader.className = "bbb-header";
		tagEditBox.appendChild(tagEditHeader);

		var tagEditText = document.createElement("div");
		tagEditText.className = "bbb-edit-text";
		tagEditText.innerHTML = "<b>Note:</b> Unlike Danbooru, separate matching rules/tag combinations have to be separated by commas and not by separate lines. Separate lines are only used here to improve readability.";
		tagEditBox.appendChild(tagEditText);

		var tagEditArea = document.createElement("textarea");
		tagEditArea.className = "bbb-edit-area";
		tagEditBox.appendChild(tagEditArea);
		bbb.el.menu.tagEditArea = tagEditArea;

		var tagEditOk = document.createElement("a");
		tagEditOk.innerHTML = "OK";
		tagEditOk.href = "#";
		tagEditOk.className = "bbb-button";
		tagEditOk.addEventListener("click", function(event) {
			var tags = tagEditArea.value.replace(/\r?\n/g, "").replace(/,(\S)/g, ", $1").bbbSpaceClean();
			var args = bbb.tagEdit;

			tagEditBlocker.style.display = "none";
			args.input.value = tags;
			args.object[args.prop] = tags;
			event.preventDefault();
		}, false);
		tagEditBox.appendChild(tagEditOk);

		var tagEditCancel = document.createElement("a");
		tagEditCancel.innerHTML = "Cancel";
		tagEditCancel.href = "#";
		tagEditCancel.className = "bbb-button";
		tagEditCancel.style.cssFloat = "right";
		tagEditCancel.addEventListener("click", function(event) {
			tagEditBlocker.style.display = "none";
			event.preventDefault();
		}, false);
		tagEditBox.appendChild(tagEditCancel);

		// Add menu to the DOM and manipulate the dimensions.
		document.body.appendChild(menu);

		var viewHeight = window.innerHeight;
		var barWidth = scrollbarWidth();
		var scrollDivDiff = menu.offsetHeight - scrollDiv.clientHeight;

		scrollDiv.style.maxHeight = viewHeight - scrollDiv.bbbGetPadding().height - scrollDivDiff - 50 + "px"; // Subtract 50 for margins (25 each).
		scrollDiv.style.minWidth = 901 + barWidth + 3 + "px"; // Should keep the potential scrollbar from intruding on the original drawn layout if I'm thinking about this correctly. Seems to work in practice anyway.
		scrollDiv.style.paddingLeft = barWidth + 3 + "px";

		var menuWidth = menu.offsetWidth;

		menu.style.marginLeft = -menuWidth / 2 + "px";
		menu.style.visibility = "visible";
	}

	function createSection(section) {
		var sectionFrag = document.createDocumentFragment();

		if (section.header) {
			var sectionHeader = document.createElement("h2");
			sectionHeader.innerHTML = section.header;
			sectionHeader.className = "bbb-header";
			sectionFrag.appendChild(sectionHeader);
		}

		if (section.text) {
			var sectionText = document.createElement("div");
			sectionText.innerHTML = section.text;
			sectionText.className = "bbb-section-text";
			sectionFrag.appendChild(sectionText);
		}

		var sectionDiv = document.createElement("div");
		sectionDiv.className = "bbb-section-options";
		sectionFrag.appendChild(sectionDiv);

		if (section.type === "general") {
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
		}
		else if (section.type === "border") {
			var borderSettings = bbb.user[section.settings];

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
		}

		return sectionFrag;
	}

	Element.prototype.bbbSection = function(section) {
		this.appendChild(createSection(section));
	};

	function createOption(settingName) {
		var optionObject = bbb.options[settingName];
		var userSetting = bbb.user[settingName];

		var label = document.createElement("label");
		label.className = "bbb-general-label";

		var textSpan = document.createElement("span");
		textSpan.className = "bbb-general-text";
		textSpan.innerHTML = optionObject.label;
		label.appendChild(textSpan);

		var inputSpan = document.createElement("span");
		inputSpan.className = "bbb-general-input";
		label.appendChild(inputSpan);

		var item;
		var itemFrag = document.createDocumentFragment();

		switch (optionObject.type) {
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

						if (selectOption.value === String(userSetting))
							selectOption.selected = true;

						item.appendChild(selectOption);
					}
				}

				if (numList) {
					for (var i = 0, nll = numList.length; i < nll; i++) {
						selectOption = document.createElement("option");
						selectOption.innerHTML = numList[i];
						selectOption.value = numList[i];

						if (selectOption.value === String(userSetting))
							selectOption.selected = true;

						item.appendChild(selectOption);
					}
				}

				if (numRange) {
					for (var i = numRange[0], end = numRange[1]; i <= end; i++) {
						selectOption = document.createElement("option");
						selectOption.innerHTML = i;
						selectOption.value = i;

						if (selectOption.value === String(userSetting))
							selectOption.selected = true;

						item.appendChild(selectOption);
					}
				}

				item.addEventListener("change", function() {
					var selected = this.value;
					bbb.user[settingName] = (bbbIsNum(selected) ? Number(selected) : selected);
				}, false);
				itemFrag.appendChild(item);
				break;
			case "checkbox":
				item = document.createElement("input");
				item.name = settingName;
				item.type = "checkbox";
				item.checked = userSetting;
				item.addEventListener("click", function() { bbb.user[settingName] = this.checked; }, false);
				itemFrag.appendChild(item);
				break;
			case "text":
				item = document.createElement("input");
				item.name = settingName;
				item.type = "text";
				item.value = userSetting;
				item.addEventListener("change", function() { bbb.user[settingName] = this.value.bbbSpaceClean(); }, false);
				itemFrag.appendChild(item);

				if (optionObject.tagEditMode) {
					var tagExpand = document.createElement("a");
					tagExpand.href = "#";
					tagExpand.className = "bbb-edit-link";
					tagExpand.innerHTML = "&raquo;";
					tagExpand.addEventListener("click", function(event) {
						tagEditWindow(item, bbb.user, settingName);
						event.preventDefault();
					}, false);
					itemFrag.appendChild(tagExpand);
				}
				break;
			case "number":
				item = document.createElement("input");
				item.name = settingName;
				item.type = "text";
				item.value = userSetting;
				item.addEventListener("change", function() { bbb.user[settingName] = Number(this.value); }, false);
				itemFrag.appendChild(item);
				break;
			default:
				console.log("Better Better Booru Error: Unexpected object type. Type: " + optionObject.type);
				break;
		}
		inputSpan.appendChild(itemFrag);

		var explLink = document.createElement("a");
		explLink.innerHTML = "?";
		explLink.href = "#";
		explLink.className = "bbb-expl-link";
		explLink.addEventListener("click", function(event) { event.preventDefault(); }, false);
		explLink.bbbSetTip(bbb.options[settingName].expl);
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
		helpButton.bbbSetTip("<b>Enabled:</b> When checked, the border will be applied. When unchecked, it won't be applied.<br><br><b>Status/Tags:</b> Describes the posts that the border should be applied to. For custom tag borders, you may specify the rules the post must match for the border to be applied. Please read the \"Thumbnail Matching Rules\" section under the help tab for information about creating rules.<br><br><b>Color:</b> Set the color of the border. Hex RGB color codes (#000000, #FFFFFF, etc.) are the recommended values.<br><br><b>Style:</b> Set how the border looks. Please note that double only works with a border width of 3.<br><br><b>Move:</b> Move the border to a new position. Higher borders have higher priority. In the event of a post matching more than 4 borders, the first 4 borders get applied and the rest are ignored. If single color borders are enabled, only the first matching border is applied.<br><br><b>Preview:</b> Display a preview of the border's current settings.<br><br><b>Delete:</b> Remove the border and its settings.<br><br><b>New:</b> Create a new border.");
		editSpan.appendChild(helpButton);

		var borderSettingsDiv = document.createElement("div");
		borderSettingsDiv.className = "bbb-border-settings";
		borderDiv.appendChild(borderSettingsDiv);

		var nameLabel = document.createElement("label");
		nameLabel.className = "bbb-border-name";
		borderSettingsDiv.appendChild(nameLabel);

		if (isStatus)
			nameLabel.innerHTML = "Status:" + borderItem.tags;
		else {
			nameLabel.innerHTML = "Tags:";

			var nameInput = document.createElement("input");
			nameInput.type = "text";
			nameInput.value = borderItem.tags;
			nameInput.addEventListener("change", function() { borderItem.tags = this.value.bbbSpaceClean(); }, false);
			nameLabel.appendChild(nameInput);

			var nameExpand = document.createElement("a");
			nameExpand.href = "#";
			nameExpand.className = "bbb-edit-link";
			nameExpand.innerHTML = "&raquo;";
			nameExpand.addEventListener("click", function(event) {
				tagEditWindow(nameInput, borderItem, "tags");
				event.preventDefault();
			}, false);
			nameLabel.appendChild(nameExpand);
		}

		var colorLabel = document.createElement("label");
		colorLabel.innerHTML = "Color:";
		colorLabel.className = "bbb-border-color";
		borderSettingsDiv.appendChild(colorLabel);

		var colorInput = document.createElement("input");
		colorInput.type = "text";
		colorInput.value = borderItem.border_color;
		colorInput.addEventListener("change", function() { borderItem.border_color = this.value.bbbSpaceClean(); }, false);
		colorLabel.appendChild(colorInput);

		var styleLabel = document.createElement("label");
		styleLabel.innerHTML = "Style:";
		styleLabel.className = "bbb-border-style";
		borderSettingsDiv.appendChild(styleLabel);

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
			if (styleOptions[i].value === borderItem.border_style) {
				styleOptions[i].selected = true;
				break;
			}
		}

		return indexWrapper;
	}

	function createTextSection(header, text) {
		var sectionFrag = document.createDocumentFragment();

		if (header) {
			var sectionHeader = document.createElement("h2");
			sectionHeader.innerHTML = header;
			sectionHeader.className = "bbb-header";
			sectionFrag.appendChild(sectionHeader);
		}

		if (text) {
			var desc = document.createElement("div");
			desc.innerHTML = text;
			desc.className = "bbb-section-text";
			sectionFrag.appendChild(desc);
		}

		return sectionFrag;
	}

	Element.prototype.bbbTextSection = function(header, text) {
		this.appendChild(createTextSection(header, text));
	};

	function createBackupSection() {
		var sectionFrag = document.createDocumentFragment();

		var sectionHeader = document.createElement("h2");
		sectionHeader.innerHTML = "Backup/Restore Settings";
		sectionHeader.className = "bbb-header";
		sectionFrag.appendChild(sectionHeader);

		var sectionText = document.createElement("div");
		sectionText.innerHTML = "When creating a backup, there are two options. Creating a text backup will provide a plain text format backup in the area provided that can be copied and saved where desired. Creating a backup page will open a new page that can be saved with the browser's \"save page\" option. To restore a backup, copy and paste the desired backup into the provided area and click \"Restore Backup\".";
		sectionText.className = "bbb-section-text";
		sectionFrag.appendChild(sectionText);

		var sectionDiv = document.createElement("div");
		sectionDiv.className = "bbb-section-options";
		sectionDiv.innerHTML = "<b>Backup Text:</b><br>";
		sectionFrag.appendChild(sectionDiv);

		var backupTextarea = document.createElement("textarea");
		backupTextarea.className = "bbb-backup-area";
		sectionDiv.appendChild(backupTextarea);
		bbb.el.menu.backupTextarea = backupTextarea;

		var buttonDiv = document.createElement("div");
		buttonDiv.className = "bbb-section-options";
		sectionFrag.appendChild(buttonDiv);

		var textBackup = document.createElement("a");
		textBackup.innerHTML = "Create Backup Text";
		textBackup.href = "#";
		textBackup.className = "bbb-button";
		textBackup.style.marginRight = "15px";
		textBackup.addEventListener("click", function(event) {
			createBackupText();
			event.preventDefault();
		}, false);
		buttonDiv.appendChild(textBackup);

		var pageBackup = document.createElement("a");
		pageBackup.innerHTML = "Create Backup Page";
		pageBackup.href = "#";
		pageBackup.className = "bbb-button";
		pageBackup.style.marginRight = "15px";
		pageBackup.addEventListener("click", function(event) {
			createBackupPage();
			event.preventDefault();
		}, false);
		buttonDiv.appendChild(pageBackup);

		var restoreBackup = document.createElement("a");
		restoreBackup.innerHTML = "Restore Backup";
		restoreBackup.style.cssFloat = "right";
		restoreBackup.href = "#";
		restoreBackup.className = "bbb-button";
		restoreBackup.addEventListener("click", function(event) {
			restoreBackupText();
			event.preventDefault();
		}, false);
		buttonDiv.appendChild(restoreBackup);

		return sectionFrag;
	}

	Element.prototype.bbbBackupSection = function() {
		this.appendChild(createBackupSection());
	};

	function createTocSection(page) {
		// Generate a Table of Contents based on the page's current section headers.
		var sectionFrag = document.createDocumentFragment();
		var pageSections = page.getElementsByTagName("h2");

		var sectionHeader = document.createElement("h2");
		sectionHeader.innerHTML = "Table of Contents";
		sectionHeader.className = "bbb-header";
		sectionFrag.appendChild(sectionHeader);

		var sectionText = document.createElement("div");
		sectionText.className = "bbb-section-text";
		sectionFrag.appendChild(sectionText);

		var tocList = document.createElement("ul");
		tocList.className = "bbb-toc";
		sectionText.appendChild(tocList);

		for (var i = 0, psl = pageSections.length; i < psl;) {
			var listItem = document.createElement("li");
			tocList.appendChild(listItem);

			var linkItem = document.createElement("a");
			linkItem.textContent = pageSections[i].textContent;
			linkItem.href = "#" + (++i);
			listItem.appendChild(linkItem);
		}

		tocList.addEventListener("click", function (event) {
			var target = event.target;
			var targetValue = target.href;

			if (targetValue) {
				var sectionTop = pageSections[targetValue.split("#")[1]].offsetTop;
				bbb.el.menu.scrollDiv.scrollTop = sectionTop;
				event.preventDefault();
			}
		}, false);

		return sectionFrag;
	}

	Element.prototype.bbbTocSection = function() {
		var page = this;
		page.insertBefore(createTocSection(page), page.firstChild);
	};

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
		 * The setting list for border sections is the setting name containing the borders as a string.
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
		// Reset the list of border items after moving or creating a new border.
		var borderElements = section.children;

		for (var i = 0, bel = borderElements.length; i < bel; i ++) {
			var borderElement = borderElements[i];

			borderElement.className = borderElement.className.replace(/\s?bbb-no-highlight/gi, "");
			borderElement.setAttribute("data-bbb-index", i);
		}
	}

	function deleteBorder(borderSettings, borderElement) {
		// Remove a border and if it's the last border, create a blank disabled one.
		var section = borderElement.parentNode;
		var index = Number(borderElement.getAttribute("data-bbb-index"));

		section.removeChild(borderElement);
		borderSettings.splice(index,1);

		if (borderSettings.length === 0) {
			// If no borders are left, add a new blank border.
			var newBorderItem = new Border("", false, "#000000", "solid");
			borderSettings.push(newBorderItem);

			var newBorderElement = createBorderOption(borderSettings, 0);
			section.insertBefore(newBorderElement, section.children[0]);
		}

		resetBorderElements(section);
	}

	function moveBorder(borderSettings, borderElement) {
		// Prepare to move a border and wait for the user to click where it'll go.
		var section = borderElement.parentNode;
		var index = Number(borderElement.getAttribute("data-bbb-index"));

		borderElement.className += " bbb-no-highlight";
		borderElement.nextSibling.className += " bbb-no-highlight";
		bbb.borderEdit = {mode: "move", settings: borderSettings, section: section, index: index, element: borderElement};
		section.className += " bbb-insert-highlight";
		bbb.el.menu.window.addEventListener("click", insertBorder, true);
	}

	function newBorder(borderSettings, borderElement) {
		// Prepare to create a border and wait for the user to click where it'll go.
		var section = borderElement.parentNode;

		bbb.borderEdit = {mode: "new", settings: borderSettings, section: section};
		section.className += " bbb-insert-highlight";
		bbb.el.menu.window.addEventListener("click", insertBorder, true);
	}

	function insertBorder (event) {
		// Place either a new or moved border where indicated.
		var target = event.target;
		var section = bbb.borderEdit.section;

		if (target.className === "bbb-border-divider") {
			var newIndex = Number(target.parentNode.getAttribute("data-bbb-index"));
			var borderSettings = bbb.borderEdit.settings;

			if (bbb.borderEdit.mode === "new") { // Make a new border.
				var newBorderItem = new Border("", false, "#000000", "solid");
				borderSettings.splice(newIndex, 0, newBorderItem);

				var newBorderElement = createBorderOption(borderSettings, newIndex);

				section.insertBefore(newBorderElement, section.children[newIndex]);

			}
			else if (bbb.borderEdit.mode === "move") { // Move the border.
				var oldIndex = bbb.borderEdit.index;

				if (newIndex !== oldIndex) {
					var borderItem = borderSettings.splice(oldIndex, 1)[0];
					var borderElement = bbb.borderEdit.element;

					if (newIndex < oldIndex)
						borderSettings.splice(newIndex, 0, borderItem);
					else if (newIndex > oldIndex)
						borderSettings.splice(newIndex - 1, 0, borderItem);

					section.insertBefore(borderElement, section.children[newIndex]);
				}
			}
		}

		resetBorderElements(section);
		section.className = section.className.replace(/\s?bbb-insert-highlight/gi, "");
		bbb.el.menu.window.removeEventListener("click", insertBorder, true);
	}

	function showTip(event, text, styleString) {
		var x = event.clientX;
		var y = event.clientY;
		var tip = bbb.el.menu.tip;
		var topOffset = 0;

		if (styleString)
			tip.setAttribute("style", styleString);

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
			tip.style.width = "auto";

		// Don't allow the tip to go above the top of the window.
		if (y - tip.offsetHeight - 2 < 5)
			topOffset = y - tip.offsetHeight - 7;

		tip.style.left = x - tip.offsetWidth - 2 + "px";
		tip.style.top = y - tip.offsetHeight - 2 - topOffset + "px";
		tip.style.visibility = "visible";
	}

	function hideTip() {
		bbb.el.menu.tip.removeAttribute("style");
	}

	Element.prototype.bbbBorderPreview = function(borderItem) {
		this.addEventListener("click", function(event) { showTip(event, "<img src=\"http://danbooru.donmai.us/ssd/data/preview/d34e4cf0a437a5d65f8e82b7bcd02606.jpg\" alt=\"IMAGE\" style=\"width: 105px; height: 150px; border-color: " + borderItem.border_color + "; border-style: " + borderItem.border_style + "; border-width: " + bbb.user.border_width + "px; line-height: 150px; text-align: center; vertical-align: middle;\">", "background-color: #FFFFFF;"); }, false);
		this.addEventListener("mouseout", hideTip, false);
	};

	Element.prototype.bbbSetTip = function(text) {
		this.addEventListener("click", function(event) { showTip(event, text, false); }, false);
		this.addEventListener("mouseout", hideTip, false);
	};

	function changeTab(tab) {
		var activeTab = document.getElementsByClassName("bbb-active-tab")[0];

		if (tab === activeTab)
			return;

		activeTab.className = activeTab.className.replace(/\s?bbb-active-tab/g, "");
		bbb.el.menu[activeTab.name + "Page"].style.display = "none";
		bbb.el.menu.scrollDiv.scrollTop = 0;
		tab.className += " bbb-active-tab";
		bbb.el.menu[tab.name + "Page"].style.display = "block";
	}

	function tagEditWindow(input, object, prop) {
		bbb.el.menu.tagEditBlocker.style.display = "block";
		bbb.el.menu.tagEditArea.value = input.value.replace(/(,\s*)/g, "$1\r\n\r\n");
		bbb.tagEdit = {input: input, object: object, prop: prop};
	}

	function adjustMenuHeight() {
		var menu = bbb.el.menu.window;
		var scrollDiv = bbb.el.menu.scrollDiv;
		var viewHeight = window.innerHeight;
		var scrollDivDiff = menu.offsetHeight - scrollDiv.clientHeight;

		scrollDiv.style.maxHeight = viewHeight - scrollDiv.bbbGetPadding().height - scrollDivDiff - 50 + "px"; // Subtract 50 for margins (25 each).
	}

	function adjustMenuTimer() {
		if (!adjustMenuTimeout && bbb.el.menu.window)
			var adjustMenuTimeout = window.setTimeout(function() { adjustMenuHeight(); }, 50);
	}

	function removeMenu() {
		// Destroy the menu so that it gets rebuilt.
		var menu = bbb.el.menu.window;

		if (!menu)
			return;

		menu.parentNode.removeChild(menu);
		bbb.el.menu = {};
	}

	function loadSettings() {
		// Load stored settings.
		if (typeof(localStorage.bbb_settings) === "undefined")
			loadDefaults();
		else {
			bbb.user = JSON.parse(localStorage.bbb_settings);
			checkUser(bbb.user, bbb.options);
			convertSettings();
		}
	}

	function loadDefaults() {
		bbb.user = {};

		for (var i in bbb.options) {
			if (typeof(bbb.options[i].def) !== "undefined")
				bbb.user[i] = bbb.options[i].def;
			else
				bbb.user[i] = bbb.options[i];
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
		// Save the user settings to localStorage after making any neccessary checks/adjustments.
		if (!bbb.user.track_new && bbb.user.track_new_data.viewed) // Reset new post tracking if it's disabled.
			bbb.user.track_new_data = bbb.options.track_new_data.def;

		localStorage.bbb_settings = JSON.stringify(bbb.user);
	}

	function updateSettings() {
		// Change & save the settings without the panel. Accepts a comma delimited list of alternating settings and values: setting1, value1, setting2, value2
		loadSettings();

		for (var i = 0, al = arguments.length; i < al; i += 2) {
			var setting = arguments[i].split(".");
			var value = arguments[i + 1];
			var settingPath = bbb.user;

			for (var j = 0, spl = setting.length - 1; j < spl; j++)
				settingPath = settingPath[setting[j]];

			settingPath[setting[j]] = value;
		}

		saveSettings();
	}

	function convertSettings() {
		// If the user settings are from an old version, attempt to convert some settings and update the version number. Settings will start conversion at the appropriate case and be allowed to run through every case after it until the end.
		var mode = bbb.user.bbb_version;

		if (isOldVersion(mode)) {
			switch (mode) {
				case "6.0":
					break;
			}

			bbb.user.bbb_version = bbb.options.bbb_version;
		}
	}

	function createBackupText() {
		// Create a plain text version of the settings.
		var textarea = bbb.el.menu.backupTextarea;
		textarea.value = "Better Better Booru v" + bbb.user.bbb_version + " Backup (" + bbbTimestamp("y-m-d hh:mm:ss") + "):\r\n\r\n" + JSON.stringify(bbb.user) + "\r\n";
		textarea.focus();
		textarea.setSelectionRange(0,0);
	}

	function createBackupPage() {
		// Open a new tab/window and place the setting text in it.
		var backupWindow = window.open();
		backupWindow.document.writeln('<!doctype html><html style="background-color: #FFFFFF;"><head><meta charset="UTF-8" /><title>Better Better Booru v' + bbb.user.bbb_version + ' Backup (' + bbbTimestamp("y-m-d hh:mm:ss") + ')</title></head><body style="background-color: #FFFFFF; color: #000000; padding: 20px; word-wrap: break-word;">' + JSON.stringify(bbb.user) + '</body></html>');
		backupWindow.document.close();
	}

	function restoreBackupText() {
		// Load the backup text provided into the script.
		var textarea = bbb.el.menu.backupTextarea;
		var backupString = textarea.value.replace(/\r?\n/g, "").match(/{.+}/);

		if (backupString) {
			try {
				bbb.user = JSON.parse(backupString); // This is where we expect an error.
				removeMenu();
				checkUser(bbb.user, bbb.options);
				convertSettings();
				createMenu();
				alert("Backup settings loaded successfully. After reviewing the settings to ensure they are correct, please click \"Save & Close\" to finalize the restore.");
			}
			catch (error) {
				if (error instanceof SyntaxError)
					alert("The backup does not appear to be formatted correctly. Please make sure everything was pasted correctly/completely and that only one backup is provided.");
				else
					alert("Unexpected error: " + error.message);
			}
		}
		else
			alert("A backup could not be detected in the text provided. Please make sure everything was pasted correctly/completely.");
	}

	/* Functions for support, extra features, and content manipulation */
	function blacklistInit() {
		// Reset the blacklist with the account settings when logged in or script settings when logged out/using the override.
		Danbooru.Blacklist.entries.length = 0;

		if (!useAccount()) { // Clean up blacklisted entries and load the script blacklist.
			var blacklistedPosts = document.getElementsByClassName("blacklisted");

			while (blacklistedPosts[0]) {
				var blacklistedPost = blacklistedPosts[0];
				blacklistedPost.className = blacklistedPost.className.replace(/\s?blacklisted(-active)?/ig, "");
			}

			if (/\S/.test(script_blacklisted_tags)) {
				var blacklistTags = script_blacklisted_tags.toLowerCase().replace(/\b(rating:[qes])\w+/, "$1").split(",");

				for (var i = 0, bl = blacklistTags.length; i < bl; i++) {
					var tag = Danbooru.Blacklist.parse_entry(blacklistTags[i]);
					Danbooru.Blacklist.entries.push(tag);
				}
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

	function resizeImage(mode) {
		// Custom resize post image script.
		var img = document.getElementById("image");
		var imgContainer = document.getElementById("image-container");

		if (!img || !imgContainer)
			return;

		var currentMode = bbb.img.resized;
		var resizeLinkWidth = bbb.el.resizeLinkWidth;
		var resizeLinkAll = bbb.el.resizeLinkAll;
		var availableWidth = imgContainer.clientWidth;
		var availableHeight = window.innerHeight - 40;
		var imgStyleWidth = img.clientWidth;
		var imgStyleHeight = img.clientHeight;
		var imgWidth = img.getAttribute("width"); // Was NOT expecting img.width to return the current width (css style width) and not the width attribute's value here...
		var imgHeight = img.getAttribute("height");
		var tooWide = imgStyleWidth > availableWidth;
		var tooTall = imgStyleHeight > availableHeight;
		var widthRatio = availableWidth / imgWidth;
		var heightRatio = availableHeight / imgHeight;
		var ratio;

		if (mode === "none" || mode === currentMode || (mode === "width" && widthRatio >= 1) || (mode === "all" && widthRatio >= 1 && heightRatio >= 1)) {
			img.style.width = imgWidth + "px";
			img.style.height = imgHeight + "px";
			bbb.img.resized = "none";
			resizeLinkWidth.style.fontWeight = "normal";
			resizeLinkAll.style.fontWeight = "normal";
			Danbooru.Note.Box.scale_all();

			if (Danbooru.Post.place_jlist_ads)
				Danbooru.Post.place_jlist_ads();
		}
		else if (mode === "width" && (tooWide || currentMode === "all")) {
			ratio = widthRatio;
			img.style.width = imgWidth * ratio + "px";
			img.style.height = imgHeight * ratio + "px";
			bbb.img.resized = "width";
			resizeLinkWidth.style.fontWeight = "bold";
			resizeLinkAll.style.fontWeight = "normal";
			Danbooru.Note.Box.scale_all();

			if (Danbooru.Post.place_jlist_ads)
				Danbooru.Post.place_jlist_ads();
		}
		else if (mode === "all" && (tooWide || tooTall || currentMode === "width")) {
			ratio = (widthRatio < heightRatio ? widthRatio : heightRatio);
			img.style.width = imgWidth * ratio + "px";
			img.style.height = imgHeight * ratio + "px";
			bbb.img.resized = "all";
			resizeLinkWidth.style.fontWeight = "normal";
			resizeLinkAll.style.fontWeight = "bold";
			Danbooru.Note.Box.scale_all();

			if (Danbooru.Post.place_jlist_ads)
				Danbooru.Post.place_jlist_ads();
		}
	}

	function limitFix() {
		// Add the limit variable to link URLs that are not thumbnails.
		var links = document.evaluate('//div[@id="page"]//a[starts-with(@href, "/posts?")]', document, null, 6, null);
		var link;

		for (var i = 0, lsl = links.snapshotLength; i < lsl; i++) {
			link = links.snapshotItem(i);

			if (!/(?:page|limit)=/.test(link.href))
				link.href += "&limit=" + thumbnail_count;
		}

		links = document.evaluate('//header//a[starts-with(@href, "/posts") or @href="/" or @href="/notes?group_by=post"]', document, null, 6, null);

		for (var i = 0, lsl = links.snapshotLength; i < lsl; i++) {
			link = links.snapshotItem(i);

			if (link.href.indexOf("?") > -1)
				link.href += "&limit=" + thumbnail_count;
			else
				link.href += "?limit=" + thumbnail_count;
		}

		if (gLoc === "search" || gLoc === "post" || gLoc === "intro") {
			var container = document.getElementById("search-box") || document.getElementById("a-intro");

			if (!container)
				return;

			var limitInput = document.createElement("input");
			limitInput.name = "limit";
			limitInput.value = thumbnail_count;
			limitInput.type = "hidden";
			container.getElementsByTagName("form")[0].appendChild(limitInput);
		}
	}

	function isThere(url) {
		// Checks if file exists. Thanks to some random forum!
		var req = new XMLHttpRequest(); // XMLHttpRequest object.
		try {
			req.open("HEAD", url, false);
			req.send(null);
			return (req.status === 200 ? true : false);
		} catch(er) {
			return false;
		}
	}

	function getVar(urlVar, url) {
		// Retrieve a variable value from a specified URL or the current URL.
		if (!url)
			url = gUrlQuery;

		var result = url.split(urlVar + "=")[1];

		if (!result)
			return undefined;
		else
			result = result.split(/[#&]/, 1)[0];

		if (!result)
			return undefined;
		else if (bbbIsNum(result))
			return Number(result);
		else
			return result;
	}

	function arrowNav(e) {
		// Bind the arrow keys to Danbooru's page navigation.
		if (document.activeElement.type !== "text" && document.activeElement.type !== "textarea") {
			if (e.keyCode === 37)
				danbooruNav("left");
			else if (e.keyCode === 39)
				danbooruNav("right");
		}
	}

	function danbooruNav(dir) {
		// Determine the correct Danbooru page function and use it.
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
		// Remove the query portion of thumbnail links.
		var target;

		if (gLoc === "post")
			target = document.evaluate('//div[@id="pool-nav"]//a', document, null, 6, null);
		else if (gLoc === "pool")
			target = document.evaluate('//section[@id="content"]/article/a', document, null, 6, null);
		else if (gLoc === "search")
			target = document.evaluate('//div[@id="posts"]/article/a', document, null, 6, null);
		else if (gLoc === "intro")
			target = document.evaluate('//div[@id="a-intro"]//article/a', document, null, 6, null);

		if (target) {
			for (var i = 0, isl = target.snapshotLength; i < isl; i++)
				target.snapshotItem(i).href = target.snapshotItem(i).href.split("?", 1)[0];
		}
	}

	function autohideSidebar() {
		// Show the sidebar when it gets focus, hide it when it loses focus, and don't allow its links to retain focus.
		var sidebar = document.getElementById("sidebar");

		if (!sidebar)
			return;

		sidebar.addEventListener("click", function(event) {
			var target = event.target;

			if (target.href)
				target.blur();
		}, false);
		sidebar.addEventListener("focus", function() {
			sidebar.className += " bbb-sidebar-show";
		}, true);
		sidebar.addEventListener("blur", function() {
			sidebar.className = sidebar.className.replace(/\s?bbb-sidebar-show/gi, "");
		}, true);
	}

	function autoscrollImage() {
		var target = document.getElementById("image") || document.getElementById("image-container").getElementsByTagName("object")[0];

		if (target)
			target.scrollIntoView();
	}

	function allowUserLimit() {
		// Allow use of the limit variable if it isn't currently set and we're on the first page.
		if (thumbnail_count && !/(?:page|limit)=\d/.test(gUrlQuery))
			return true;
		else
			return false;
	}

	function allowArrowNav() {
		var paginator = document.getElementsByClassName("paginator")[0];

		if (paginator || gLoc === "popular") // If the paginator exists, arrow navigation should be applicable.
			return true;
		else
			return false;
	}

	function needPostAPI() {
		// Test for hidden post images.
		var objectExists = document.getElementById("image-container").getElementsByTagName("object")[0];
		var imgExists = document.getElementById("image");
		var infoExists = document.evaluate('//aside[@id="sidebar"]/section/ul/li/a[starts-with(@href, "/data/")]', document, null, 9, null).singleNodeValue;

		if (objectExists || imgExists || infoExists)
			return false;
		else
			return true;
	}

	function currentLoc() {
		// Test the page URL to find which section of Danbooru the script is running on.
		if (/\/posts\/\d+/.test(gUrlPath))
			return "post";
		else if (/^\/(?:posts|$)/.test(gUrlPath))
			return "search";
		else if (gUrlPath.indexOf("/notes") === 0 && gUrlQuery.indexOf("group_by=note") < 0)
			return "notes";
		else if (/^\/comments\/?$/.test(gUrlPath) && gUrlQuery.indexOf("group_by=comment") < 0)
			return "comments";
		else if (gUrlPath.indexOf("/explore/posts/popular") === 0)
			return "popular";
		else if (/\/pools\/\d+/.test(gUrlPath))
			return "pool";
		else if (gUrlPath.indexOf("/explore/posts/intro") === 0)
			return "intro";
		else
			return undefined;
	}

	function checkUrls() {
		for (var i = 0, vul = valid_urls.length; i < vul; i++) {
			if (valid_urls[i] === gUrl.substring(0, gUrl.lastIndexOf("post")))
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

	function noXML() {
		// Don't use XML requests on certain pages where it won't do any good.
		var limit = getVar("limit");
		var page = getVar("page");
		var result = false;

		if (gLoc === "search") {
			if (limit === 0 || page === "b1")
				result = true;
		}
		else if (gLoc === "notes") {
			if (limit === 0)
				result = true;
		}
		else if (gLoc === "comments") {
			if (page === "b1")
				result = true;
		}

		return result;
	}

	function useAPI() {
		if ((show_loli || show_shota || show_deleted || direct_downloads) && (isLoggedIn() || !bypass_api))
			return true;
		else
			return false;
	}

	function useAccount() {
		if (isLoggedIn() && !override_account)
			return true;
		else
			return false;
	}

	function checkSetting(metaName, metaData, scriptSetting) {
		// Check for the user's account settings and use the script setting if they're logged out or want to override them.
		if (useAccount()) {
			if (fetchMeta(metaName) === metaData)
				return true;
			else
				return false;
		}
		else
			return scriptSetting;
	}

	function searchAdd() {
		if (gLoc === "search" || gLoc === "post") {
			// Where = array of <li> in tag-sidebar.
			var where = document.getElementById("tag-box") || document.getElementById("tag-list");

			if (!where)
				return;

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

			if (borderItem.tags === "parent") {
				parent = statusBorderSettings.splice(i, 1)[0];
				i--;
				sbsl--;
			}
			else if (borderItem.tags === "child") {
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

		if (!posts.length)
			return;

		var searches = [];
		var statusBorderSettings = (!single_color_borders && custom_status_borders ? statusBorderSort() : null); // Sort borders to support multi color borders.

		// Create and cache border search objects.
		if (custom_tag_borders) {
			for (var i = 0, tbsl = tag_borders.length; i < tbsl; i++)
				searches.push(createSearch(tag_borders[i].tags));
		}

		// Cycle through each post and apply titles and borders.
		for (var i = 0, pl = posts.length; i < pl; i++) {
			var post = posts[i];
			var img = post.getElementsByTagName("img")[0];

			if (!img)
				continue;

			var link = img.parentNode;
			var classes = post.className;
			var tags = post.getAttribute("data-tags");
			var user = " user:" + post.getAttribute("data-uploader");
			var rating = " rating:" + post.getAttribute("data-rating");
			var score = " score:" + post.getAttribute("data-score");
			var title = tags + user + rating + score;
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

				if (primaryLength === 2)
					img.setAttribute("style", "border-style: " + primary[1][1] + " " + primary[0][1] + " " + primary[0][1] + " " + primary[1][1] + " !important; border-color: " + primary[1][0] + " " + primary[0][0] + " " + primary[0][0] + " " + primary[1][0] + " !important;");
				else if (primaryLength === 3)
					img.setAttribute("style", "border-style: " + primary[2][1] + " " + primary[0][1] + " " + primary[0][1] + " " + primary[1][1] + " !important; border-color: " + primary[2][0] + " " + primary[0][0] + " " + primary[0][0] + " " + primary[1][0] + " !important;");
			}
			else // Default Danbooru border styling.
				Danbooru.Post.initialize_preview_borders_for(post);

			// Secondary custom tag borders.
			if (custom_tag_borders) {
				for (var j = 0, tbsl = tag_borders.length; j < tbsl; j++) {
					var tagBorderItem = tag_borders[j];

					if (tagBorderItem.is_enabled && thumbSearchMatch(post, searches[j])) {
						secondary.push([tagBorderItem.border_color, tagBorderItem.border_style]);

						if (secondary.length === 4)
							break;
					}
				}

				secondaryLength = secondary.length;

				if (secondaryLength) {
					link.className += " bbb-custom-tag";

					if (secondaryLength === 1 || (single_color_borders && secondaryLength > 1))
						link.setAttribute("style", "border: " + border_width + "px " + secondary[0][0] + " " + secondary[0][1] + " !important;");
					else if (secondaryLength === 2)
						link.setAttribute("style", "border-color: " + secondary[0][0] + " " + secondary[1][0] + " " + secondary[1][0] + " " + secondary[0][0] + " !important; border-style: " + secondary[0][1] + " " + secondary[1][1] + " " + secondary[1][1] + " " + secondary[0][1] + " !important;");
					else if (secondaryLength === 3)
						link.setAttribute("style", "border-color: " + secondary[0][0] + " " + secondary[1][0] + " " + secondary[2][0] + " " + secondary[0][0] + " !important; border-style: " + secondary[0][1] + " " + secondary[1][1] + " " + secondary[2][1] + " " + secondary[0][1] + " !important;");
					else if (secondaryLength === 4)
						link.setAttribute("style", "border-color: " + secondary[0][0] + " " + secondary[2][0] + " " + secondary[3][0] + " " + secondary[1][0] + " !important; border-style: " + secondary[0][1] + " " + secondary[2][1] + " " + secondary[3][1] + " " + secondary[1][1] + " !important;");
				}
			}
		}
	}

	function formatJSON(post) {
		// Add information to the JSON post object.
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

		post.parent = (post.parent_id ? post.parent_id : "");
		post.flags = flags;
		post.thumb_class = thumbClass;

		return post;
	}

	function customCSS() {
		var customStyles = document.createElement("style");
		customStyles.type = "text/css";

		var styles = '#bbb_menu {background-color: #FFFFFF; border: 1px solid #CCCCCC; box-shadow: 0 2px 2px rgba(0, 0, 0, 0.5); padding: 15px; position: fixed; top: 25px; left: 50%; z-index: 9001;}' +
		'#bbb_menu * {font-size: 14px; line-height: 16px; outline: 0px none; border: 0px none; margin: 0px; padding: 0px;}' + // Reset some base settings.
		'#bbb_menu h1 {font-size: 24px; line-height: 42px;}' +
		'#bbb_menu h2 {font-size: 16px; line-height: 25px;}' +
		'#bbb_menu input, #bbb_menu select, #bbb_menu textarea {border: #CCCCCC 1px solid;}' +
		'#bbb_menu input {height: 17px; padding: 1px 0px; margin-top: 4px; vertical-align: top;}' +
		'#bbb_menu input[type="checkbox"] {margin: 0px; vertical-align: middle; position: relative; bottom: 2px;}' +
		'#bbb_menu select {height: 21px; margin-top: 4px; vertical-align: top;}' +
		'#bbb_menu option {padding: 0px 3px;}' +
		'#bbb_menu textarea {padding: 2px; resize: none;}' +
		'#bbb_menu ul {list-style: outside disc none; margin-top: 0px; margin-bottom: 0px; margin-left: 20px; display: inline-block;}' +
		'#bbb_menu .bbb-scroll-div {border: 1px solid #CCCCCC; margin: -1px 0px 5px 0px; padding: 5px 0px; overflow-y: auto;}' +
		'#bbb_menu .bbb-page {position: relative; display: none;}' +
		'#bbb_menu .bbb-button {border: 1px solid #CCCCCC; border-radius: 5px; display: inline-block; padding: 5px;}' +
		'#bbb_menu .bbb-tab {border-top-left-radius: 5px; border-top-right-radius: 5px; display: inline-block; padding: 5px; border: 1px solid #CCCCCC; margin-right: -1px;}' +
		'#bbb_menu .bbb-active-tab {background-color: #FFFFFF; border-bottom-width: 0px; padding-bottom: 6px;}' +
		'#bbb_menu .bbb-header {border-bottom: 2px solid #CCCCCC; margin-bottom: 5px; width: 700px;}' +
		'#bbb_menu .bbb-toc {list-style-type: upper-roman; margin-left: 30px;}' +
		'#bbb_menu .bbb-section-options, #bbb_menu .bbb-section-text {margin-bottom: 5px; max-width: 902px;}' +
		'#bbb_menu .bbb-section-options-left, #bbb_menu .bbb-section-options-right {display: inline-block; vertical-align: top; width: 435px;}' +
		'#bbb_menu .bbb-section-options-left {border-right: 1px solid #CCCCCC; margin-right: 15px; padding-right: 15px;}' +
		'#bbb_menu .bbb-general-label {display: block; height: 29px; padding: 0px 5px;}' +
		'#bbb_menu .bbb-general-label:hover {background-color: #EEEEEE;}' +
		'#bbb_menu .bbb-general-text {line-height: 29px;}' +
		'#bbb_menu .bbb-general-input {float: right; line-height: 29px;}' +
		'#bbb_menu .bbb-expl {background-color: #CCCCCC; border: 1px solid #000000; display: none; font-size: 12px; padding: 5px; position: fixed; max-width: 420px; width: 420px; overflow: hidden;}' +
		'#bbb_menu .bbb-expl * {font-size: 12px;}' +
		'#bbb_menu .bbb-expl-link {font-size: 12px; font-weight: bold; margin-left: 5px; padding: 2px;}' +
		'#bbb_menu .bbb-border-div {background-color: #EEEEEE; padding: 2px; margin: 0px 5px 0px 0px;}' +
		'#bbb_menu .bbb-border-bar, #bbb_menu .bbb-border-settings {height: 29px; padding: 0px 2px; overflow: hidden;}' +
		'#bbb_menu .bbb-border-settings {background-color: #FFFFFF;}' +
		'#bbb_menu .bbb-border-div label, #bbb_menu .bbb-border-div span {display: inline-block; line-height: 29px;}' +
		'#bbb_menu .bbb-border-name {text-align: left; width: 540px;}' +
		'#bbb_menu .bbb-border-name input {width:460px;}' +
		'#bbb_menu .bbb-border-color {text-align: center; width: 210px;}' +
		'#bbb_menu .bbb-border-color input {width: 148px;}' +
		'#bbb_menu .bbb-border-style {float: right; text-align: right; width: 130px;}' +
		'#bbb_menu .bbb-border-divider {height: 4px;}' +
		'#bbb_menu .bbb-insert-highlight .bbb-border-divider {background-color: blue; cursor: pointer;}' +
		'#bbb_menu .bbb-no-highlight .bbb-border-divider {background-color: transparent; cursor: auto;}' +
		'#bbb_menu .bbb-border-button {border: 1px solid #CCCCCC; border-radius: 5px; display: inline-block; padding: 2px; margin: 0px 2px;}' +
		'#bbb_menu .bbb-border-spacer {display: inline-block; height: 12px; width: 0px; border-right: 1px solid #CCCCCC; margin: 0px 5px;}' +
		'#bbb_menu .bbb-backup-area {height: 200px; width: 896px; margin-top: 2px;}' +
		'#bbb_menu .bbb-edit-blocker {display: none; height: 100%; width: 100%; background-color: rgba(0, 0, 0, 0.33); position: fixed; top: 0px; left: 0px;}'+
		'#bbb_menu .bbb-edit-box {height: 500px; width: 800px; margin-left: -412px; margin-top: -262px; position: fixed; left: 50%; top: 50%; background-color: #FFFFFF; border: 2px solid #CCCCCC; padding: 10px; box-shadow: 0 2px 2px rgba(0, 0, 0, 0.5);}' +
		'#bbb_menu .bbb-edit-text {margin-bottom: 5px;}' +
		'#bbb_menu .bbb-edit-area {height: 392px; width: 794px; margin-bottom: 5px;}' +
		'#bbb_menu .bbb-edit-link {background-color: #FFFFFF; border: 1px solid #CCCCCC; display: inline-block; height: 19px; line-height: 19px; margin-left: -1px; padding: 0px 2px; margin-top: 4px; text-align: center; vertical-align: top;}' +
		'.bbb-status {background-color: rgba(255, 255, 255, 0.75); border: 1px solid rgba(204, 204, 204, 0.75); font-size: 12px; font-weight: bold; display: none; padding: 3px; position: fixed; bottom: 0px; right: 0px; z-index: 9002;}' +
		'.bbb-custom-tag {padding: 0px !important; display: inline-block !important; border-width: ' + border_width + 'px !important;}' +
		'.bbb-keep-notice {display: block !important; opacity: 1.0 !important;}';

		// Provide a little extra space for listings that allow thumbnail_count.
		if (thumbnail_count && (gLoc === "search" || gLoc === "notes")) {
			styles += 'div#page {margin: 0px 10px 0px 20px !important;}' +
			'section#content {padding: 0px !important;}';
		}

		// Border setup.
		var totalBorderWidth = (custom_tag_borders ? border_width * 2 + 1 : border_width);
		var thumbMaxDim = 150 + totalBorderWidth * 2;
		var listingExtraSpace = 14 - totalBorderWidth * 2;
		var commentExtraSpace = 34 - totalBorderWidth * 2;
		var statusBorderItem;

		styles += 'article.post-preview {height: ' + thumbMaxDim + 'px !important; width: ' + thumbMaxDim + 'px !important; margin: 0px ' + listingExtraSpace + 'px ' + listingExtraSpace + 'px 0px !important;}' +
		'article.post-preview a {line-height: 0px !important;}' +
		'.post-preview div.preview {height: ' + thumbMaxDim + 'px !important; width: ' + thumbMaxDim + 'px !important; margin-right: ' + commentExtraSpace + 'px !important;}' +
		'.post-preview div.preview a {line-height: 0px !important;}' +
		'.post-preview img {border-width: ' + border_width + 'px !important;}';

		if (custom_status_borders) {
			var activeStatusStyles = "";

			for (var i = 0, sbsl = status_borders.length; i < sbsl; i++) {
				statusBorderItem = status_borders[i];

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
				statusBorderItem = status_borders[i];
				styles += ".post-preview." + statusBorderItem.class_name + " a.bbb-custom-tag {padding: 1px !important;}";
			}
		}

		// Hide sidebar.
		if (autohide_sidebar.indexOf(gLoc) > -1) {
			styles += 'div#page {margin: 0px 10px 0px 20px !important;}' +
			'aside#sidebar {background-color: transparent !important; border-width: 0px !important; height: 100% !important; width: 250px !important; position: fixed !important; left: -280px !important; overflow-y: hidden !important; padding: 0px 20px !important; top: 0px !important; z-index: 2001 !important;}' +
			'aside#sidebar.bbb-sidebar-show, aside#sidebar:hover {background-color: #FFFFFF !important; border-right: 1px solid #CCCCCC !important; left: 0px !important; overflow-y: auto !important; padding: 0px 15px !important;}' +
			'section#content {margin-left: 0px !important;}' +
			'.ui-autocomplete {z-index: 2002 !important;}';
		}

		if (hide_advertisements) {
			styles += '#content.with-ads {margin-right: 0em !important;}' +
			'img[alt="Advertisement"] {display: none !important;}' +
			'img[alt="Your Ad Here"] {display: none !important;}' +
			'iframe {display: none !important;}';
		}

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
		// Remove the "copyright", "characters", and "artist" headers in the post sidebar.
		if (gLoc === "post") {
			var tagList = document.getElementById("tag-list");

			if (tagList)
				tagList.innerHTML = tagList.innerHTML.replace(/<\/ul>.+?<ul>/g, "").replace(/<h2>.+?<\/h2>/, "<h1>Tags</h1>");
		}
	}

	function postTagTitles() {
		// Replace the post title with the full set of tags.
		if (gLoc === "post")
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

		if (expDays !== undefined) {
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

	function danbNotice(txt, noticeType) {
		// Display the notice or append information to it if it already exists.
		// A secondary string argument can be provided: "temp" = automatically hidden temporary notice (default behavior), "perm" = permanent notice, "error" = permanent error notice
		var type = noticeType || "temp";
		var noticeFunc = (type === "error" ? Danbooru.error : Danbooru.notice);
		var notice = document.getElementById("notice");
		var msg = txt;

		if (!notice || !noticeFunc)
			return;

		if ((notice.style.display !== "none" || notice.className.indexOf("bbb-keep-notice") > -1) && /\w/.test(notice.children[0].innerHTML)) { // Keep the notice open if it's already open.
			type = (type === "temp" ? "perm" : type);
			msg = notice.children[0].innerHTML + "<hr/>" + msg;
			notice.className += " bbb-keep-notice";
			document.getElementById("close-notice-link").addEventListener("click", hideDanbNotice, false);
		}

		if (type === "perm")
			noticeFunc(msg, true);
		else
			noticeFunc(msg);
	}

	function hideDanbNotice(event) {
		document.getElementById("close-notice-link").removeEventListener("click", hideDanbNotice, false);

		var notice = document.getElementById("notice");
		notice.style.display = "block";
		notice.className = notice.className.replace(/\s?bbb-keep-notice/gi, "");
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
		if (window.getComputedStyle) {
			var computed = window.getComputedStyle(this, null);
			var paddingLeft = parseFloat(computed.paddingLeft);
			var paddingRight = parseFloat(computed.paddingRight);
			var paddingTop = parseFloat(computed.paddingTop);
			var paddingBottom = parseFloat(computed.paddingBottom);
			var paddingHeight = paddingTop + paddingBottom;
			var paddingWidth = paddingLeft + paddingRight;
			return {width: paddingWidth, height: paddingHeight, top: paddingTop, bottom: paddingBottom, left: paddingLeft, right: paddingRight};
		}
	};

	String.prototype.bbbSpacePad = function() {
		// Add a leading and trailing space.
		var text = this;
		return (text.length ? " " + text + " " : text);
	};

	String.prototype.bbbSpaceClean = function() {
		// Remove leading, trailing, and multiple spaces.
		return this.replace(/\s+/g, " ").replace(/^\s|\s$/g, "");
	};

	function bbbIsNum(value) {
		return /^-?\d+(\.\d+)?$/.test(value);
	}

	function thumbSearchMatch(post, searchArray) {
		// Take search objects and test them against a thumbnail's info.
		var tags = post.getAttribute("data-tags");
		var user = " user:" + post.getAttribute("data-uploader").replace(/\s/g, "_").toLowerCase();
		var rating = " rating:" + post.getAttribute("data-rating");
		var pools = " " + post.getAttribute("data-pools");
		var score = post.getAttribute("data-score");
		var favcount = post.getAttribute("data-fav-count");
		var id = post.getAttribute("data-id");
		var width = post.getAttribute("data-width");
		var height = post.getAttribute("data-height");
		var flags = post.getAttribute("data-flags") || "active";
		var status = (flags === "flagged" ? " status:flagged status:active" : " status:" + flags);
		var postInfo = {
			tags: (tags + rating + status + user + pools).bbbSpacePad(),
			score: Number(score),
			favcount: Number(favcount),
			id: Number(id),
			width: Number(width),
			height: Number(height)
		};
		var anyResult;
		var allResult;
		var searchTerm = "";

		for (var i = 0, sal = searchArray.length; i < sal; i++) {
			var searchObject = searchArray[i];
			var all = searchObject.all;
			var any = searchObject.any;

			// Continue to the next matching rule if there are no tags to test.
			if (!any.total && !all.total)
				continue;

			if (any.total) {
				anyResult = false;

				// Loop until one positive match is found.
				for (var j = 0, ail = any.includes.length; j < ail; j++) {
					searchTerm = any.includes[j];

					if (thumbTagMatch(postInfo, searchTerm)) {
						anyResult = true;
						break;
					}
				}

				// If we don't have a positive match yet, loop through the excludes.
				if (!anyResult) {
					for (var j = 0, ael = any.excludes.length; j < ael; j++) {
						searchTerm = any.excludes[j];

						if (!thumbTagMatch(postInfo, searchTerm)) {
							anyResult = true;
							break;
						}
					}
				}

				// Continue to the next matching rule if none of the "any" tags matched.
				if (!anyResult)
					continue;
			}

			if (all.total) {
				allResult = true;

				// Loop until a negative match is found.
				for (var j = 0, ail = all.includes.length; j < ail; j++) {
					searchTerm = all.includes[j];

					if (!thumbTagMatch(postInfo, searchTerm)) {
						allResult = false;
						break;
					}
				}

				// If we still have a positive match, loop through the excludes.
				if (allResult) {
					for (var j = 0, ael = all.excludes.length; j < ael; j++) {
						searchTerm = all.excludes[j];

						if (thumbTagMatch(postInfo, searchTerm)) {
							allResult = false;
							break;
						}
					}
				}

				// Continue to the next matching rule if one of the "all" tags didn't match.
				if (!allResult)
					continue;
			}

			// Loop completed without a negative match so return true.
			return true;
		}

		// If we haven't managed a positive match for any rules, return false.
		return false;
	}

	function thumbTagMatch(postInfo, tag) {
		// Test thumbnail info for a tag match.
		if (typeof(tag) === "string") { // Check regular tags and metatags with string values.
			if (postInfo.tags.indexOf(tag) > -1)
				return true;
			else
				return false;
		}
		else if (tag instanceof RegExp) { // Check wildcard tags.
			return tag.test(postInfo.tags);
		}
		else if (typeof(tag) === "object") { // Check numeric metatags.
			var tagsMetaValue = postInfo[tag.tagName];

			if (tag.equals !== undefined) {
				if (tagsMetaValue !== tag.equals)
					return false;
			}
			else {
				if (tag.greater !== undefined && tagsMetaValue <= tag.greater)
					return false;

				if (tag.less !== undefined && tagsMetaValue >= tag.less)
					return false;
			}

			return true;
		}
	}

	function createSearch(search) {
		// Take search strings, turn them into search objects, and pass back the objects in an array.
		var searchStrings = search.toLowerCase().replace(/\b(rating:[qes])\w+/g, "$1").split(",");
		var searches = [];

		// Sort through each matching rule.
		for (var i = 0, sssl = searchStrings.length; i < sssl; i++) {
			var searchString = searchStrings[i].split(" ");
			var searchObject = {
				all: {includes: [], excludes: [], total: 0},
				any: {includes: [], excludes: [], total: 0}
			};

			// Divide the tags into any and all sets with excluded and included tags.
			for (var j = 0, ssl = searchString.length; j < ssl; j++) {
				var searchTerm = searchString[j];
				var mode;
				var primaryMode = "all";
				var secondaryMode = "includes";

				while (searchTerm.charAt(0) === "~" || searchTerm.charAt(0) === "-") {
					switch (searchTerm.charAt(0)) {
						case "~":
							primaryMode = "any";
							break;
						case "-":
							secondaryMode = "excludes";
							break;
					}

					searchTerm = searchTerm.slice(1);
				}

				if (searchTerm.length > 0)
					mode = searchObject[primaryMode][secondaryMode];
				else
					continue;

				if (isNumMetatag(searchTerm)) { // Parse numeric metatags and turn them into objects.
					var tagArray = searchTerm.split(":");
					var metaObject = {
						tagName: tagArray[0],
						equals: undefined,
						greater: undefined,
						less: undefined
					};
					var numSearch = tagArray[1];
					var numArray;
					var equals;
					var greater;
					var less;

					if (numSearch.indexOf("<=") === 0 || numSearch.indexOf("..") === 0) { // Less than or equal to. (tag:<=# & tag:..#)
						less = parseInt(numSearch.slice(2), 10);

						if (!isNaN(less)) {
							metaObject.less = less + 1;
							mode.push(metaObject);
						}
					}
					else if (numSearch.indexOf(">=") === 0) { // Greater than or equal to. (tag:>=#)
						greater = parseInt(numSearch.slice(2), 10);

						if (!isNaN(greater)) {
							metaObject.greater = greater - 1;
							mode.push(metaObject);
						}
					}
					else if (numSearch.length > 2 && numSearch.indexOf("..") === numSearch.length - 2) { // Greater than or equal to. (tag:#..)
						greater = parseInt(numSearch.slice(0, -2), 10);

						if (!isNaN(greater)) {
							metaObject.greater = greater - 1;
							mode.push(metaObject);
						}
					}
					else if (numSearch.charAt(0) === "<") { // Less than. (tag:<#)
						less = parseInt(numSearch.slice(1), 10);

						if (!isNaN(less)) {
							metaObject.less = less;
							mode.push(metaObject);
						}
					}
					else if (numSearch.charAt(0) === ">") { // Greater than. (tag:>#)
						greater = parseInt(numSearch.slice(1), 10);

						if (!isNaN(greater)) {
							metaObject.greater = greater;
							mode.push(metaObject);
						}
					}
					else if (numSearch.indexOf("..") > -1) { // Greater than or equal to and less than or equal to range. tag:#..#
						numArray = numSearch.split("..");
						greater = parseInt(numArray[0], 10);
						less = parseInt(numArray[1], 10);

						if (!isNaN(greater) && !isNaN(less)) {
							metaObject.greater = greater - 1;
							metaObject.less = less + 1;
							mode.push(metaObject);
						}
					}
					else { // Exact number. (tag:#)
						equals = parseInt(numSearch, 10);

						if (!isNaN(equals)) {
							metaObject.equals = equals;
							mode.push(metaObject);
						}
					}
				}
				else if (searchTerm.indexOf("*") > -1) // Prepare wildcard tags as regular expressions.
					mode.push(new RegExp(escapeRegEx(searchTerm).replace(/\*/g, "\S*").bbbSpacePad()));
				else if (typeof(searchTerm) === "string") // Add regular tags.
					mode.push(searchTerm.bbbSpacePad());
			}

			searchObject.all.total = searchObject.all.includes.length + searchObject.all.excludes.length;
			searchObject.any.total = searchObject.any.includes.length + searchObject.any.excludes.length;
			searches.push(searchObject);
		}

		return searches;
	}

	function isNumMetatag(tag) {
		// Check if the tag from a search string is a numeric metatag.
		if (tag.indexOf(":") < 0)
			return false;
		else {
			var tagName = tag.split(":", 1)[0];

			if (tagName === "score" || tagName === "favcount" || tagName === "id" || tagName === "width" || tagName === "height")
				return true;
			else
				return false;
		}
	}

	function delayMe(func) {
		// Run the function after the browser has finished its current stack of tasks.
		window.setTimeout(func, 0);
	}

	function escapeRegEx(regEx) {
		return regEx.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}

	function bbbStatusInit() {
		// Insert the status message container and prep the request tracking.
		var statusDiv = document.createElement("div");
		statusDiv.className = "bbb-status";
		document.body.appendChild(statusDiv);
		bbb.el.status = statusDiv;
		bbb.statusCount = 0;
	}

	function bbbStatus(mode) {
		// Updates the BBB status message.
		if (enable_status_message) {
			var status = bbb.el.status;

			if (mode === "image") { // Status mode for loading thumbnails and hidden images.
				status.style.display = "block";
				status.innerHTML = "Loading image info...";
				bbb.statusCount++;
			}
			else if (mode === "comment") { // Status mode for loading hidden comments.
				status.style.display = "block";
				status.innerHTML = "Loading comment info...";
				bbb.statusCount++;
			}
			else if (mode === "loaded") { // Status mode for successful requests. Hides itself automatically.
				bbb.statusCount--;

				if (bbb.statusCount === 0) {
					status.style.display = "block";
					status.innerHTML = "Loaded!";
					window.setTimeout( function() { bbbStatus("clear"); }, 1500);
				}
			}
			else if (mode === "error") { // Status mode for unsuccessful requests. Hides itself automatically.
				bbb.statusCount = -9000;
				status.style.display = "block";
				status.innerHTML = "Error.";
				window.setTimeout( function() { bbbStatus("clear"); }, 1500);
			}
			else if (mode === "clear") // Status mode for hiding the status message.
				status.style.display = "none";
		}
	}

	Number.prototype.bbbPadDate = function() {
		// Adds a leading "0" to single digit date/time values.
		var numString = String(this);

		if (numString.length === 1)
			numString = "0" + numString;

		return numString;
	};

	function bbbTimestamp(format) {
		// Returns a simple timestamp based on the format string provided. String placeholders: y = year, m = month, d = day, hh = hours, mm = minutes, ss = seconds
		var time = new Date();
		var year = time.getFullYear();
		var month = (time.getMonth() + 1).bbbPadDate();
		var day = time.getDate().bbbPadDate();
		var hours = time.getHours().bbbPadDate();
		var minutes = time.getMinutes().bbbPadDate();
		var seconds = time.getSeconds().bbbPadDate();
		var stamp = format.replace("hh", hours).replace("mm", minutes).replace("ss", seconds).replace("y", year).replace("m", month).replace("d", day);

		return stamp;
	}

	function isOldVersion(ver) {
		// Takes the provided version and compares it to the script version. Returns true if the provided version is older than the script version.
		var userNums = ver.split(".");
		var userLength = userNums.length;
		var scriptNums = bbb.options.bbb_version.split(".");
		var scriptLength = scriptNums.length;
		var loopLength = (userLength > scriptLength ? userLength : scriptLength);

		for (var i = 0; i < loopLength; i++) {
			var userNum = (userNums[i] ? Number(userNums[i]) : 0);
			var scriptNum = (scriptNums[i] ? Number(scriptNums[i]) : 0);

			if (userNum < scriptNum)
				return true;
		}

		return false;
	}

	function dragScrollInit() {
		bbb.dragScroll = {
			moved: false,
			lastX: undefined,
			lastY: undefined
		};

		if (!bbb.img.translationMode)
			dragScrollEnable();
	}

	function dragScrollToggle() {
		if (bbb.img.translationMode)
			dragScrollDisable();
		else
			dragScrollEnable();
	}

	function dragScrollEnable() {
		var img = document.getElementById("image");

		img.addEventListener("mousedown", dragScrollOn, false);
		img.addEventListener("dragstart", disableEvent, false);
		img.addEventListener("selectstart", disableEvent, false);
	}

	function dragScrollDisable() {
		var img = document.getElementById("image");

		img.removeEventListener("mousedown", dragScrollOn, false);
		img.removeEventListener("dragstart", disableEvent, false);
		img.removeEventListener("selectstart", disableEvent, false);
	}

	function dragScrollOn(event) {
		if (event.button === 0) {
			bbb.dragScroll.lastX = event.clientX;
			bbb.dragScroll.lastY = event.clientY;
			bbb.dragScroll.moved = false;

			document.addEventListener("mousemove", dragScrollMove, false);
			document.addEventListener("mouseup", dragScrollOff, false);
		}
	}

	function dragScrollMove(event) {
		var newX = event.clientX;
		var newY = event.clientY;
		var xDistance = bbb.dragScroll.lastX - newX;
		var yDistance = bbb.dragScroll.lastY - newY;

		window.scrollBy(xDistance, yDistance);

		bbb.dragScroll.lastX = newX;
		bbb.dragScroll.lastY = newY;
		bbb.dragScroll.moved = xDistance !== 0 || yDistance !== 0 || bbb.dragScroll.moved; // Doing this since I'm not sure what Chrome's mousemove event is doing. It apparently fires even when the moved distance is equal to zero.
	}

	function dragScrollOff(event) {
		document.removeEventListener("mousemove", dragScrollMove, false);
		document.removeEventListener("mouseup", dragScrollOff, false);
	}

	function disableEvent(event) {
		event.preventDefault();
		event.stopPropagation();
	}

	function translationModeToggle() {
		bbb.img.translationMode = !bbb.img.translationMode;

		if (image_drag_scroll)
			dragScrollToggle();
	}

	function trackNew() {
		var header = document.getElementById("top");

		if (!header)
			return;

		var activeMenu = header.getElementsByClassName("current")[0];
		var secondMenu = header.getElementsByTagName("menu")[1];

		// Insert new posts link.
		if (activeMenu && activeMenu.textContent === "Posts" && secondMenu) {
			var menuItems = secondMenu.getElementsByTagName("li");
			var menuItem = document.createElement("li");
			var trackLink = document.createElement("a");
			trackLink.innerHTML = "New";
			trackLink.href = "/posts?new_posts=redirect&page=b1";
			trackLink.onclick = "return false";
			menuItem.appendChild(trackLink);
			secondMenu.insertBefore(menuItem, menuItems[1]);

			trackLink.addEventListener("click", function(event) {
				if (event.button === 0) {
					trackNewLoad();
					event.preventDefault();
				}
			}, false);
		}

		if (gLoc === "search") {
			var info = track_new_data;
			var mode = getVar("new_posts");
			var postsDiv = document.getElementById("posts");
			var postSections = document.getElementById("post-sections");
			var posts = document.getElementsByClassName("post-preview");
			var firstPost = posts[0];

			if (mode === "init" && !info.viewed && !getVar("tags") && !getVar("page")) { // Initialize.
				if (firstPost) {
					info.viewed = Number(firstPost.getAttribute("data-id"));
					info.viewing = 1;
					saveSettings();
					danbNotice("Better Better Booru: New post tracking initialized. Tracking will start with new posts after the current last image.", "perm");
				}
			}
			else if (mode === "redirect") { // Bookmarkable redirect link. (http://danbooru.donmai.us/posts?new_posts=redirect&page=b1)
				if (postsDiv)
					postsDiv.innerHTML = "<b>Redirecting...</b>";

				trackNewLoad();
			}
			else if (mode === "list") {
				var limitNum = getVar("limit") || thumbnail_count || thumbnail_count_default;
				var currentPage = getVar("page") || 1;
				var savedPage = Math.ceil((info.viewing - limitNum) / limitNum) + 1;
				var currentViewed = Number(/id:>(\d+)/.exec(decodeURIComponent(gUrlQuery))[1]);

				// Replace the chickens message on the first page with a more specific message.
				if (!firstPost && currentPage < 2) {
					if (postsDiv && postsDiv.children[0])
						postsDiv.children[0].innerHTML = "No new posts.";
				}

				// Update the saved page information.
				if (savedPage !== currentPage && info.viewed === currentViewed) {
					info.viewing = (currentPage - 1) * limitNum + 1;
					saveSettings();
				}

				// Modify new post searches with a mark as viewed link.
				if (postSections) {
					var markSection = document.createElement("li");
					var markLink = document.createElement("a");
					markLink.innerHTML = (currentPage > 1 ? "Mark pages 1-" + currentPage + " viewed" : "Mark page 1 viewed");
					markLink.href = "#";
					markSection.appendChild(markLink);
					postSections.appendChild(markSection);

					markLink.addEventListener("click", function(event) {
						trackNewMark();
						event.preventDefault();
					}, false);

					var resetSection = document.createElement("li");
					var resetLink = document.createElement("a");
					resetLink.innerHTML = "Reset (Mark all viewed)";
					resetLink.href = "#";
					resetLink.style.color = "#FF1100";
					resetLink.style.cssFloat = "right";
					resetSection.appendChild(resetLink);
					postSections.appendChild(resetSection);

					resetLink.addEventListener("click", function(event) {
						trackNewReset();
						event.preventDefault();
					}, false);
				}
			}
		}
	}

	function trackNewLoad() {
		// Create the search URL and load it.
		var info = bbb.user.track_new_data;
		var limitNum = bbb.user.thumbnail_count || thumbnail_count_default;
		var savedPage = Math.ceil((info.viewing - limitNum) / limitNum) + 1;

		if (info.viewed)
			location.href = "/posts?new_posts=list&tags=order:id_asc+id:>" + info.viewed + "&page=" + savedPage + "&limit=" + limitNum;
		else
			location.href = "/posts?new_posts=init&limit=" + limitNum;
	}

	function trackNewReset() {
		// Reinitialize settings/Mark all viewed.
		loadSettings();

		var limitNum = bbb.user.thumbnail_count || thumbnail_count_default;

		bbb.user.track_new_data = bbb.options.track_new_data.def;
		saveSettings();

		danbNotice("Better Better Booru: Reinitializing new post tracking. Please wait.", "perm");
		location.href = "/posts?new_posts=init&limit=" + limitNum;
	}

	function trackNewMark() {
		// Mark the current images and older as viewed.
		loadSettings();

		var info = bbb.user.track_new_data;
		var limitNum = getVar("limit") || bbb.user.thumbnail_count || thumbnail_count_default;
		var posts = document.getElementsByClassName("post-preview");
		var lastPost = posts[posts.length - 1];
		var lastId = (lastPost ? Number(lastPost.getAttribute("data-id")) : null );

		if (!lastPost)
			danbNotice("Better Better Booru: Unable to mark as viewed. No posts detected.", "error");
		else if (info.viewed >= lastId)
			danbNotice("Better Better Booru: Unable to mark as viewed. Posts have already been marked.", "error");
		else {
			info.viewed = Number(lastPost.getAttribute("data-id"));
			info.viewing = 1;
			saveSettings();

			danbNotice("Better Better Booru: Posts marked as viewed. Please wait while the pages are updated.", "perm");
			location.href = "/posts?new_posts=list&tags=order:id_asc+id:>" + bbb.user.track_new_data.viewed + "&page=1&limit=" + limitNum;
		}
	}

} // End of injectMe.

// Load script into the page so it can access Danbooru's Javascript in Chrome. Thanks to everyone else that has ever had this problem before... and Google which found the answers to their questions for me.
if (document.body) {
	var script = document.createElement('script');
	script.type = "text/javascript";
	script.appendChild(document.createTextNode('(' + injectMe + ')();'));
	document.body.appendChild(script);
}
