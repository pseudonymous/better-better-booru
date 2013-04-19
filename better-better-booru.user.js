// ==UserScript==
// @name           better_better_booru
// @author         otani, modified by Jawertae, A Pseudonymous Coder & Moebius Strip.
// @description    Several changes to make Danbooru much better. Including the viewing of loli/shota images on non-upgraded accounts. Modified to support arrow navigation on pools, improved loli/shota display controls, and more.
// @version        5.1
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
	/*
	 * NOTE: You no longer need to edit this script to change settings!
	 * Use the "BBB Settings" button in the menu instead.
	 */
	var settings = {}; // Container for settings

	settings.defaults = {
		show_loli: false,
		show_shota: false,
		show_deleted: false,
		loli_shota_borders: true,
		custom_borders: false,
		clean_links: false,
		hide_sign_up_notice: false,
		hide_upgrade_notice: false,
		hide_tos_notice: false,
		hide_original_notice: false,
		hide_advertisements: false,
		arrow_nav: false,
		search_add: true,
		thumbnail_count: 0,
		alternate_image_swap: false,
		image_resize: true,
		load_sample_first: true,
		remove_tag_headers: false,
		post_tag_titles: false,
		loli_border: "#FFC0CB",
		shota_border: "#66CCFF",
		child_border: "#CCCC00",
		parent_border: "#00FF00",
		pending_border: "#0000FF",
		flagged_border: "#FF0000",
		deleted_border: "#000000",
		script_blacklisted_tags: ""
	};
	settings.labels = {
		show_loli: "Show Loli",
		show_shota: "Show Shota",
		show_deleted: "Show Deleted",
		loli_shota_borders: "Loli & Shota Borders",
		custom_borders: "Custom Borders",
		clean_links: "Clean Links",
		hide_sign_up_notice: "Hide Sign Up Notice",
		hide_upgrade_notice: "Hide Upgrade Notice",
		hide_tos_notice: "Hide TOS Notice",
		hide_original_notice: "Hide Original Notice",
		hide_advertisements: "Hide Advertisements",
		arrow_nav: "Arrow Navigation",
		search_add: "Search Add",
		thumbnail_count: "Thumbnail Count",
		alternate_image_swap: "Alternate Image Swap",
		image_resize: "Resize Images",
		load_sample_first: "Load Sample First",
		remove_tag_headers: "Remove Tag Headers",
		post_tag_titles: "Post Tag Titles",
		loli_border: "Loli Border Color",
		shota_border: "Shota Border Color",
		child_border: "Child Border Color",
		parent_border: "Parent Border Color",
		pending_border: "Pending Border Color",
		flagged_border: "Flagged Border Color",
		deleted_border: "Deleted Border Color",
		script_blacklisted_tags: "Blacklisted Tags"
	};
	// TODO
	settings.explanations = {
		show_loli: "",
		show_shota: "",
		show_deleted: "",
		loli_shota_borders: "",
		custom_borders: "",
		clean_links: "",
		hide_sign_up_notice: "",
		hide_upgrade_notice: "",
		hide_tos_notice: "",
		hide_original_notice: "",
		hide_advertisements: "",
		arrow_nav: "",
		search_add: "",
		thumbnail_count: "",
		alternate_image_swap: "",
		image_resize: "",
		load_sample_first: "",
		remove_tag_headers: "",
		post_tag_titles: "",
		loli_border: "",
		shota_border: "",
		child_border: "",
		parent_border: "",
		pending_border: "",
		flagged_border: "",
		deleted_border: "",
		script_blacklisted_tags: ""
	};
	settings.user = {};
	settings.inputs = {};

	// Setting sections and ordering.
	settings.sections = {
		image: ["show_loli", "show_shota", "show_deleted", "thumbnail_count", "loli_shota_borders", "custom_borders"],
		layout: ["hide_sign_up_notice", "hide_upgrade_notice", "hide_tos_notice", "hide_original_notice", "hide_advertisements"],
		sidebar: ["search_add", "remove_tag_headers"],
		border: ["loli_border", "shota_border", "child_border", "parent_border", "pending_border", "flagged_border", "deleted_border"],
		loggedOut: ["image_resize", "load_sample_first", "script_blacklisted_tags"],
		misc: ["alternate_image_swap", "clean_links", "arrow_nav", "post_tag_titles"]
	};

	function injectSettings() {
		var menu = document.getElementById("top");
		menu = menu.getElementsByTagName("menu");
		menu = menu[0];

		var link = document.createElement("a");
		link.href = "#";
		link.innerHTML = "BBB Settings";
		link.onclick = function() {
			showSettings();
			return false;
		};

		var item = document.createElement("li");
		item.appendChild(link);

		var menuItems = menu.getElementsByTagName("li")
		menu.insertBefore(item, menuItems[menuItems.length - 1]);
	}

	function showSettings() {
		var menu_exists = document.getElementById("bbb_menu");
		if (menu_exists)
		{
			menu_exists.style.display = "block";
			return;
		}
		var menu = document.createElement("div");
		var header = document.createElement("h1");
		header.innerHTML = "Better Better Booru Settings";
		header.style.textAlign = "center";
		menu.appendChild(header);

		var scrollDiv = document.createElement("div");
		scrollDiv.style.margin = "15px 0px";
		menu.appendChild(scrollDiv);

		createSection("Images & Thumbnails", settings.sections.image, scrollDiv);
		createSection("Layout", settings.sections.layout, scrollDiv);
		createSection("Tag Sidebar", settings.sections.sidebar, scrollDiv);
		createSection("Misc.", settings.sections.misc, scrollDiv);
		createSection("Logged Out Settings", settings.sections.loggedOut, scrollDiv);
		createSection("Border Colors", settings.sections.border, scrollDiv);

		var close = document.createElement("a");
		close.innerHTML = "Save & Close";
		close.href = "#";
		close.style.display = "inline-block";
		close.style.margin = "0px 15px 0px 0px";
		close.style.padding = "5px";
		close.style.border = "1px solid #CCCCCC";
		close.onclick = function() {
			document.getElementById("bbb_menu").style.display = "none";
			saveSettings();
			return false;
		};

		var cancel = document.createElement("a");
		cancel.innerHTML = "Cancel";
		cancel.href = "#";
		cancel.style.display = "inline-block";
		cancel.style.padding = "5px";
		cancel.style.border = "1px solid #CCCCCC";
		cancel.onclick = function() {
			loadSettings();
			removeMenu();
			return false;
		};

		var reset = document.createElement("a");
		reset.innerHTML = "Reset to Defaults";
		reset.href = "#";
		reset.style.display = "inline-block";
		reset.style.cssFloat = "right";
		reset.style.color = "#ff1100";
		reset.style.padding = "5px";
		reset.style.border = "1px solid #CCCCCC";
		reset.onclick = function() {
			settings.user = JSON.parse(JSON.stringify(settings.defaults));
			removeMenu();
			showSettings();
			return false;
		};

		menu.appendChild(close);
		menu.appendChild(cancel);
		menu.appendChild(reset);

		menu.id = "bbb_menu";
		menu.style.background = "white";
		menu.style.position = "fixed";
		menu.style.padding = "15px";
		menu.style.boxShadow = "0 2px 2px rgba(0, 0, 0, 0.5)";
		menu.style.zIndex = "9001";
		menu.style.visibility = "hidden";
		document.body.appendChild(menu);

		var viewHeight = window.innerHeight;
		var viewWidth = window.innerWidth;
		var menuHeight = (menu.clientHeight > viewHeight - 50 ? viewHeight - 50 : menu.clientHeight);
		var menuWidth = menu.clientWidth;
		var scrollDivDiff = menu.clientHeight - scrollDiv.clientHeight;

		menu.style.maxHeight = menuHeight - 30 + "px"; // The subtracted value is the sum of the top and bottom padding. Doing this since this is a controlled element that allows us to avoid some hassle.
		scrollDiv.style.maxHeight = menuHeight - scrollDivDiff + "px";
		scrollDiv.style.minWidth = scrollDiv.clientWidth + scrollbarWidth() + 5 + "px"; // Should keep the potential scrollbar from intruding on the original drawn layout if I'm thinking about this correctly. Seems to work in practice anyway.
		scrollDiv.style.overflowY = "auto";

		menuWidth = menu.clientWidth; // Get new width including potential sidebar.
		menu.style.top = (viewHeight - menuHeight) / 2 + "px";
		menu.style.left = (viewWidth - menuWidth) / 2 + "px";
		menu.style.visibility = "visible";
	}

	function createSection(header, settingList, target) {
		var title = document.createElement("h3");
		title.innerHTML = header;
		title.style.padding = "10px 0px 0px 0px";
		title.style.borderBottom = "2px solid #CCCCCC";
		title.style.width = "85%";
		target.appendChild(title);

		for (var i = 0, sl = settingList.length; i < sl; i++) {
			var setting = settingList[i];

			var label = document.createElement("label");
			label.innerHTML = "<span style='width: 250px; display: inline-block;'>"+settings.labels[setting]+"</span>";
			label.style.padding = "5px 0";
			label.style.display = "block";

			var item;

			switch (typeof(settings.user[setting]))
			{
				case "boolean":
					item = document.createElement("input");
					item.name = setting;
					item.type = "checkbox";
					item.checked = settings.user[setting];
					item.onclick = function() { settings.user[this.name] = this.checked; };
					break;
				case "string":
					item = document.createElement("input");
					item.name = setting;
					item.type = "text";
					item.value = settings.user[setting];
					item.onchange = function() { settings.user[this.name] = this.value; };
					break;
				case "number":
					item = document.createElement("input");
					item.name = setting;
					item.type = "text";
					item.value = settings.user[setting];
					item.onchange = function() { settings.user[this.name] = Number(this.value); };
					break;
				default:
					console.log(typeof(settings.user[setting]));
					break;
			}
			label.appendChild(item);
			target.appendChild(label);
			settings.inputs[setting] = item;
		}
	}

	function removeMenu() {
		// Destroy the menu so that it gets rebuilt.
		var bbb_menu = document.getElementById("bbb_menu");

		bbb_menu.parentNode.removeChild(bbb_menu);
	}

	function loadSettings() {
		// Load stored settings.
		if (typeof(localStorage["bbb_settings"]) === "undefined")
			settings.user = JSON.parse(JSON.stringify(settings.defaults)); // Clone object. Don't reference it.
		else {
			settings.user = JSON.parse(localStorage["bbb_settings"]);

			for (var i in settings.defaults) {
				if (typeof(settings.user[i]) === "undefined")
					settings.user[i] = settings.defaults[i];
			}
		}
	}

	function saveSettings() {
		localStorage["bbb_settings"] = JSON.stringify(settings.user);
	}

	function updateSettings() {
		// Change & save settings without the panel. Accepts a comma delimited list of alternating settings and values: setting1, value1, setting2, value2
		for (var i = 0, al = arguments.length; i < al; i += 2) {
			var setting = arguments[i];
			var value = arguments[i + 1];

			settings.user[setting] = value;

			// Update menu if it exists.
			var input = settings.inputs[setting];

			if (input) {
				switch (typeof(value))
				{
					case "boolean":
						input.checked = value;
						break;
					case "string":
						input.value = value;
						break;
					case "number":
						input.value = value;
						break;
					default:
						console.log(typeof(value));
						break;
				}
			}
		}

		saveSettings();
	}

	loadSettings();
	injectSettings();

	/* Help */
	// When editing settings, make sure you always maintain the same format. Leave equal signs, quotation marks, and semicolons alone.
	// For true/false settings, you simply use true to turn on the option or false to turn it off. Never use quotation marks for these.
	// For numerical settings, you simply provide the desired number value. Never use quotation marks for these.
	// For settings in quotation marks, you will be provided with special instructions about what to do. Just remember to keep
	// the quotation marks and also make sure not to add any extra ones.

	/* True or false settings */
	// Global
	var show_loli = settings.user["show_loli"];
	var show_shota = settings.user["show_shota"];
	var show_deleted = settings.user["show_deleted"]; // Show all deleted posts.

	var loli_shota_borders = settings.user["loli_shota_borders"]; // Add borders to shota and loli. You may set the colors under "Set Border Colors".
	var custom_borders = settings.user["custom_borders"]; // Change the border colors of flagged, parent, child, and pending posts. You may set the colors under "Set Border Colors".
	var clean_links = settings.user["clean_links"]; // Remove everything after the post ID in the thumbnail URLs. Enabling this disables search navigation for posts and active pool detection for posts.

	var hide_sign_up_notice = settings.user["hide_sign_up_notice"];
	var hide_upgrade_notice = settings.user["hide_upgrade_notice"];
	var hide_tos_notice = settings.user["hide_tos_notice"];
	var hide_original_notice = settings.user["hide_original_notice"]; // If you don't need the notice for switching back to the sample image, you can choose to hide it by default. You can also click the "X" on the notice to hide it by default via cookies.
	var hide_advertisements = settings.user["hide_advertisements"];

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

	// Set Border Colors. Use CSS hex values for colors. http://www.w3schools.com/CSS/css_colors.asp
	var loli_border = settings.user["loli_border"];
	var shota_border = settings.user["shota_border"];
	var child_border = settings.user["child_border"];
	var parent_border = settings.user["parent_border"];
	var pending_border = settings.user["pending_border"];
	var flagged_border = settings.user["flagged_border"];
	var deleted_border = settings.user["deleted_border"];

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


	/* Global Variables */
	var gUrl = location.href.split("#")[0]; // URL without the anchor
	var gUrlPath = location.pathname; // URL path only
	var gUrlQuery = location.search; // URL query string only
	var gLoc = currentLoc(); // Current location (post = single post, search = posts index, notes = notes index, popular = popular index, pool = single pool, comments = comments page)

	/* "INIT" */
	if (loli_shota_borders || custom_borders || hide_advertisements)
		customCSS();

	if (show_loli || show_shota || show_deleted) // API only features.
		searchJSON(gLoc);
	else // Alternate mode for features.
		modifyPage(gLoc);

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

	if (arrow_nav) {
		var paginator = document.getElementsByClassName("paginator")[0];

		if (paginator || gLoc == "popular") // If the paginator exists, arrow navigation should be applicable.
			window.addEventListener("keydown", keyCheck, false);
	}

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

		if (mode == "search") {
			var numExpected = getVar("limit") || 20;
			var numDesired = 0;

			if (allowUserLimit()) {
				numDesired = thumbnail_count;
				limit = "&limit=" + thumbnail_count;
			}
			else
				numDesired = numExpected;

			if (numThumbs != numDesired || numThumbs < numExpected)
				fetchJSON(gUrl.replace(/\/?(?:posts)?\/?(?:\?|$)/, "/posts.json?") + limit, "search");
		}
		else if (mode == "post") {
			if (!needPostAPI())
				fetchInfo();
			else
				fetchJSON(gUrl.replace(/\/posts\/(\d+).*/, "/posts/$1.json"), "post");
		}
		else if (mode == "notes") {
			if (numThumbs != 20)
				fetchJSON(gUrl.replace(/\/notes\/?/, "/notes.json"), "notes");
		}
		else if (mode == "popular") {
			if (numThumbs != 20)
				fetchJSON(gUrl.replace(/\/popular\/?/, "/popular.json"), "popular");
		}
		else if (mode == "pool") {
			if (numThumbs != 20)
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
		else if (!checkLoginStatus()) // Apply script blacklist to all other pages.
			delayMe(blacklistInit);
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
					else if (xmlhttp.status == 403)
						danbNotice("Better Better Booru: Error retrieving information. Access denied. You must be logged in to a Danbooru account to access the API for hidden image information.", true);
					else if (xmlhttp.status == 421)
						danbNotice("Better Better Booru: Error retrieving information. Your Danbooru API access is currently throttled. Please try again later.", true);
					else if (xmlhttp.status == 401)
						danbNotice("Better Better Booru: Error retrieving information. You must be logged in to a Danbooru account to access the API for hidden image information.", true);
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
		else if (mode == "search" && allowUserLimit()) {
			var url = gUrl;

			if (/\?/.test(url))
				url += "&limit=" + thumbnail_count;
			else
				url += "?limit=" + thumbnail_count;

			fetchPages(url, "thumbnails");
		}
		else if (!checkLoginStatus()) // Apply script blacklist to all other pages.
			delayMe(blacklistInit);

	}

	function fetchInfo() {
		// Retrieve info in the page. (Alternative to fetchJSON)
		var infoLink = document.evaluate('//aside[@id="sidebar"]/section/ul/li/a[starts-with(@href, "/data/")]', document, null, 9, null).singleNodeValue;
		var infoHref = infoLink.href;
		var imgInfo;

		if (document.getElementById("image")) { // Regular image.
			var img = document.getElementById("image");

			imgInfo = {
				id: Number(fetchMeta("post-id")),
				file_ext: /data\/.+?\.(.+?)$/.exec(infoHref)[1],
				md5: /data\/(.+?)\..+?$/.exec(infoHref)[1],
				url: infoHref,
				image_height: Number(img.getAttribute("data-original-height")),
				image_width: Number(img.getAttribute("data-original-width")),
				has_large: (Number(img.getAttribute("data-original-width")) > 850 ? true : false)
			};
		}
		else if (document.getElementById("image-container").getElementsByTagName("object")[0]) { // Flash object.
			var object = document.getElementById("image-container").getElementsByTagName("object")[0];

			imgInfo = {
				id: Number(fetchMeta("post-id")),
				file_ext: /data\/.+?\.(.+?)$/.exec(infoHref)[1],
				md5: /data\/(.+?)\..+?$/.exec(infoHref)[1],
				url: infoHref,
				image_height: Number(object.height),
				image_width: Number(object.width),
				has_large: false
			};
		}
		else if (/The artist requested removal/.test(document.getElementById("image-container").textContent)) { // Image removed by artist request.
			var infoText = infoLink.parentNode.textContent;

			imgInfo = {
				id: Number(fetchMeta("post-id")),
				file_ext: /data\/.+?\.(.+?)$/.exec(infoHref)[1],
				md5: /data\/(.+?)\..+?$/.exec(infoHref)[1],
				url: infoHref,
				image_height: Number(/\(\d+x(\d+)\)/.exec(infoText)[1]),
				image_width: Number(/\((\d+)x\d+\)/.exec(infoText)[1]),
				has_large: (Number(/\((\d+)x\d+\)/.exec(infoText)[1]) > 850 ? true : false)
			};
		}
		else { // Manual download.
			imgInfo = {
				id: Number(fetchMeta("post-id")),
				file_ext: /data\/.+?\.(.+?)$/.exec(infoHref)[1],
				md5: /data\/(.+?)\..+?$/.exec(infoHref)[1],
				url: infoHref,
				image_height: null,
				image_width: null,
				has_large: false
			};
		}

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
										var match = new RegExp('(<span class="category-)0("> <[^>]+>' + escapeRegEx(tag) + '<\/a> <\/span>)');

										target.innerHTML = target.innerHTML.replace(match, "$1" + i + "$2");
									}
								}
							}

							// Fix the comments.
							childSpan.innerHTML = /<div class="row notices">[\S\s]+?<\/form>[\S\s]+?<\/div>/i.exec(xmlhttp.responseText)[0];

							var comments =  childSpan.getElementsByClassName("comment");
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

							childSpan.innerHTML = /<div id="posts">([\S\s]+?class="paginator"[\S\s]+?<\/div>[\S\s]+?)<\/div>/i.exec(xmlhttp.responseText)[1];

							document.getElementById("posts").innerHTML = childSpan.innerHTML;

							// Thumbnail classes and titles
							Danbooru.Post.initialize_titles();

							// Blacklist
							blacklistInit();
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
			var post = posts[i];
			var imgId = post.id;
			var uploader = post.uploader_name;
			var score = post.score;
			var rating = post.rating;
			var tags = post.tag_string;
			var parent = (post.parent_id !== null ? post.parent_id : "");
			var flags = "";
			var alt = tags;
			var md5 = post.md5;
			var ext = post.file_ext;
			var fileUrl = "/data/" + md5 + "." + ext;
			var thumbnailUrl = (!post.image_height || ext == "swf" ? "/images/download-preview.png" : "/ssd/data/preview/" + md5 + ".jpg");
			var outId = "";
			var thumb = "";

			// Don't display loli/shota if the user has opted so and skip to the next image.
			if ((!show_loli && /\bloli\b/.test(tags)) || (!show_shota && /\bshota\b/.test(tags)) || (!show_deleted && post.is_deleted)) {
				if (gLoc == "pool") {
					outId = new RegExp("\f,;" + imgId + "(?=<|\f|$)");
					out = out.replace(outId, "");
				}

				continue;
			}

			// Apply appropriate thumbnail borders.
			if (post.is_deleted)
				flags = "deleted";
			else if (post.is_flagged)
				flags = "flagged";
			else if (post.is_pending)
				flags = "pending";

			// eek, huge line.
			thumb = '<article class="post-preview" id="post_' + imgId + '" data-id="' + imgId + '" data-tags="' + tags + '" data-uploader="' + uploader + '" data-rating="' + rating + '" data-width="' + post.image_width + '" data-height="' + post.image_height + '" data-flags="' + flags + '" data-parent-id="' + parent + '" data-has-children="' + post.has_children + '" data-score="' + score + '"><a href="/posts/' + imgId + search + '"><img src="' + thumbnailUrl + '" alt="' + tags + '"></a><a style="display: none;" href="' + fileUrl + '">Direct Download</a></span></article>';

			// Generate output
			if (gLoc == "search" || gLoc == "notes" || gLoc == "popular")
				out += thumb;
			else if (gLoc == "pool") {
				outId = new RegExp("\f,;" + imgId + "(?=<|\f|$)");
				out = out.replace(outId, thumb);
			}
		}

		// Replace results with new results.
		if (paginator) {
			where.innerHTML = out + outerHTML(paginator);
			paginator = document.getElementsByClassName("paginator")[0];

			if (gLoc == "search" && allowUserLimit()) {
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
		Danbooru.Post.initialize_titles();

		// Blacklist
		blacklistInit();
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
			var newWidth = 0;
			var newHeight = 0;
			var newUrl = "";
			var altTxt = "";

			if (ext == "swf") // Create flash object.
				container.innerHTML = '<div id="note-container"></div> <object height="' + height + '" width="' + width + '"> <params name="movie" value="' + url + '"> <embed allowscriptaccess="never" src="' + url + '" height="' + height + '" width="' + width + '"> </params> </object> <p><a href="' + url + '">Save this flash (right click and save)</a></p>';
			else if (!height) // Create manual download.
				container.innerHTML = '<p><a href="' + url + '">Save this file (right click and save)</a></p>';
			else { // Create image
				var useSample = (checkSetting("default-image-size", "large", load_sample_first) && hasLarge);

				if (useSample) {
					newWidth = sampWidth;
					newHeight = sampHeight;
					newUrl = sampUrl;
					altTxt = "sample";
				}
				else {
					newWidth = width;
					newHeight = height;
					newUrl = url;
					altTxt = md5;
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

							img.height = height;
							img.width = width;

							if (!swapInit) {
								$("#image").data("scale_factor", 1);
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
								$("#image").data("scale_factor", 1);
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
						updateSettings("hide_original_notice", true);
					}, false);
				}

 				// Favorites listing.
				var postID = post.id;
				var favItem = document.getElementById("favcount-for-post-" + postID).parentNode;

				if (!favItem.children[1]) {
					favItem.innerHTML += '<a href="/favorites?post_id=' + postID + '" data-remote="true" id="show-favlist-link">&raquo;</a><a href="#" data-remote="true" id="hide-favlist-link">&laquo;</a><div id="favlist"></div>';
					Danbooru.Post.initialize_favlist();
				}

				// Enable the "Resize to window", "Toggle Notes", and "Find similar" options for logged out users.
				if (!checkLoginStatus()) {
					var options = document.createElement("section");
					var history = document.evaluate('//aside[@id="sidebar"]/section[last()]', document, null, 9, null).singleNodeValue;

					options.innerHTML = '<h1>Options</h1><ul><li><a href="#" id="image-resize-to-window-link">Resize to window</a></li>' + (alternate_image_swap ? '<li><a href="#" id="listnotetoggle">Toggle notes</a></li>' : '') + '<li><a href="http://danbooru.iqdb.org/db-search.php?url=http://danbooru.donmai.us/ssd/data/preview/' + md5 + '.jpg">Find similar</a></li></ul>';
					history.parentNode.insertBefore(options, history);
					Danbooru.Post.initialize_post_image_resize_to_window_link();
				}

				 // Make the "Add note" link work.
				if (!imageExists && document.getElementById("translate") !== null)
					document.getElementById("translate").addEventListener("click", Danbooru.Note.TranslationMode.start, false);

				if (!alternate_image_swap) { // Make notes toggle when clicking the image.
					img.addEventListener("click", Danbooru.Note.Box.toggle_all, false);
				}
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

				// Load/reload notes.
				Danbooru.Note.load_all();

				// Resize image if desired.
				if (checkSetting("always-resize-images", "true", image_resize))
					document.getElementById("image-resize-to-window-link").click();
			}
		}
	}

	function parseComments(xml) {
		var posts = xml;
		var existingPosts = document.getElementsByClassName("post post-preview"); // Live node list so adding/removing a "post post-preview" class item immediately changes this.
		var eci = 0;
		var endTotal = 5;

		for (var i = 0, pl = posts.length; i < pl; i++) {
			var post = posts[i];
			var existingPost = existingPosts[eci];
			var tags = post.tag_string;

			if (!existingPost || post.id != existingPost.getAttribute("data-id")) {
				if (!/\b(?:loli|shota)\b/.test(tags)) // API post isn't loli/shota and doesn't exist on the page so the API has different information. Skip it and try to find where the page's info matches up.
					continue;
				else if ((!show_loli && /\bloli\b/.test(tags)) || (!show_shota && /\bshota\b/.test(tags))) { // Skip loli/shota if the user has selected to do so.
					endTotal--;
					continue;
				}

				// Prepare the post information.
				var tagLinks = tags.split(" ");
				var parent = (post.parent_id !== null ? post.parent_id : "");
				var flags = "";

				if (post.is_deleted)
					flags = "deleted";
				else if (post.is_flagged)
					flags = "flagged";
				else if (post.is_pending)
					flags = "pending";

				for (var j = 0, tll = tagLinks.length; j < tll; j++)
					tagLinks[j] = '<span class="category-0"> <a href="/posts?tags=' + encodeURIComponent(tagLinks[j]) + '">' + tagLinks[j].replace(/_/g, " ") + '</a> </span> ';

				tagsLinks = tagLinks.join(" ");

				// Create the new post.
				var childSpan = document.createElement("span");

				childSpan.innerHTML = '<div class="post post-preview" data-tags="' + post.tag_string + '" data-uploader="' + post.uploader_name + '" data-rating="' + post.rating + '" data-flags="' + flags + '" data-score="' + post.score + '" data-parent-id="' + parent + '" data-has-children="' + post.has_children + '" data-id="' + post.id + '" data-width="' + post.image_width + '" data-height="' + post.image_height + '"> <div class="preview"> <a href="/posts/' + post.id + '"> <img alt="' + post.md5 + '" src="/ssd/data/preview/' + post.md5 + '.jpg" /> </a> </div> <div class="comments-for-post" data-post-id="' + post.id + '"> <div class="header"> <div class="row"> <span class="info"> <strong>Date</strong> <time datetime="' + post.created_at + '" title="' + post.created_at.replace(/(.+)T(.+)-(.+)/, "$1 $2 -$3") + '">' + post.created_at.replace(/(.+)T(.+):\d+-.+/, "$1 $2") + '</time> </span> <span class="info"> <strong>User</strong> <a href="/users/' + post.uploader_id + '">' + post.uploader_name + '</a> </span> <span class="info"> <strong>Rating</strong> ' + post.rating + ' </span> <span class="info"> <strong>Score</strong> <span> <span id="score-for-post-' + post.id + '">' + post.score + '</span> </span> </span> </div> <div class="row list-of-tags"> <strong>Tags</strong>' + tagsLinks + '</div> </div> </div> <div class="clearfix"></div> </div>';

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
		Danbooru.Post.initialize_titles();

		// Blacklist
		blacklistInit();
	}

	/* Functions for support, extra features, and content manipulation */
	function blacklistInit() {
		Danbooru.Blacklist.entries.length = 0;

		if (!checkLoginStatus() && /\S/.test(script_blacklisted_tags)) { // Load the script blacklist if not logged in.
			var blacklistTags = script_blacklisted_tags.replace(/\s+/g, " ").replace(/(rating:[qes])\w+/, "$1").split(",");

			for (var i = 0, bl = blacklistTags.length; i < bl; i++) {
				var tag = Danbooru.Blacklist.parse_entry(blacklistTags[i]);
				Danbooru.Blacklist.entries.push(tag);
			}
		}
		else // Reload the account blacklist.
			Danbooru.Blacklist.parse_entries();

		// Apply the blacklist and update the sidebar for search listings.
		var blacklistUsed = Danbooru.Blacklist.apply();

		if (gLoc == "search" || gLoc == "popular") {
			document.getElementById("blacklist-list").innerHTML = "";

			if (blacklistUsed)
				Danbooru.Blacklist.update_sidebar();
			else
				document.getElementById("blacklist-box").style.display = "none";
		}
	}

	function limitFix() {
		var links = document.evaluate('//div[@id="page"]//a[starts-with(@href, "/posts?")]', document, null, 6, null);

		for (var i = 0, lsl = links.snapshotLength; i < lsl; i++) {
			var link = links.snapshotItem(i);

			if (!/(?:page|limit)=/.test(link.href))
				link.href += "&limit=" + thumbnail_count;
		}

		links = document.evaluate('//header//a[starts-with(@href, "/posts") or @href="/"]', document, null, 6, null);

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

	function allowUserLimit() {
		if (thumbnail_count > 0 && !/(?:page|limit)=\d/.test(gUrlQuery))
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

	function customCSS() {
		var customStyles = document.createElement("style");

		customStyles.type = "text/css";

		// Borders override each other in this order: Loli > Shota > Deleted > Flagged > Pending > Child > Parent
		if (custom_borders)
			customStyles.innerHTML += " .post-preview.post-status-has-children img{border-color:" + parent_border + " !important;} .post-preview.post-status-has-parent img{border-color:" + child_border + " !important;} .post-preview.post-status-pending img{border-color:" + pending_border + " !important;} .post-preview.post-status-flagged img{border-color:" + flagged_border + " !important;} .post-preview.post-status-deleted img{border-color:" + deleted_border + " !important;}";

		if (loli_shota_borders)
			customStyles.innerHTML += ' .post-preview[data-tags~="shota"] img{border: 2px solid ' + shota_border + ' !important;} .post-preview[data-tags~="loli"] img{border: 2px solid ' + loli_border + ' !important;}';

		if (hide_advertisements)
			customStyles.innerHTML += ' #content.with-ads {margin-right: 0em !important;}';

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

	function danbNotice(txt, isError) {
		// Display the notice or append information to it if it already exists. If a second true argument is provided, the notice is displayed as an error.
		var noticeFunc = (isError ? Danbooru.error : Danbooru.notice);
		var msg = txt;
		var notice = document.getElementById("notice");

		if (/\w/.test(notice.innerHTML))
			msg = notice.innerHTML + "<hr/>" + msg;

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

	function delayMe(func) {
		var timer = setTimeout(func, 0);
	}

	function escapeRegEx(regEx) {
		return regEx.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}

	// Does anyone use these options? Adblock should pretty much cover the ads.
	function hideAdvertisements() {
		var img = document.evaluate('//img[@alt="Advertisement"]', document, null, 6, null);

		for (var i = 0, isl = img.snapshotLength; i < isl; i++)
			img.snapshotItem(i).style.display = "none";
	}

	function hideYourAdHere() {
		var img = document.evaluate('//img[@alt="Your Ad Here"]', document, null, 6, null);

		for (var i = 0, isl = img.snapshotLength; i < isl; i++)
			img.snapshotItem(i).style.display = "none";
	}

	function hideIframes() {
		var img = document.evaluate('//iframe[contains(@src, "jlist")]', document, null, 6, null);

		for (var i = 0, isl = img.snapshotLength; i < isl; i++)
			img.snapshotItem(i).style.display = "none";
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
