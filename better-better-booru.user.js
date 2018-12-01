// ==UserScript==
// @name           better_better_booru
// @namespace      https://greasyfork.org/scripts/3575-better-better-booru
// @author         otani, modified by Jawertae, A Pseudonymous Coder & Moebius Strip.
// @description    Several changes to make Danbooru much better.
// @version        8.2.3
// @updateURL      https://greasyfork.org/scripts/3575-better-better-booru/code/better_better_booru.meta.js
// @downloadURL    https://greasyfork.org/scripts/3575-better-better-booru/code/better_better_booru.user.js
// @match          *://*.donmai.us/*
// @run-at         document-end
// @grant          GM_setValue
// @grant          GM_getValue
// @grant          GM_deleteValue
// @grant          GM_listValues
// @icon           data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAAAAABWESUoAAAA9klEQVQ4y2NgGBgQu/Dau1/Pt/rhVPAfCkpwKXhUZ8Al2vT//yu89vDjV8AkP/P//zY0K//+eHVmoi5YyB7I/VDGiKYADP60wRT8P6aKTcH//0lgQcHS//+PYFdwFu7Ib8gKGBgYOQ22glhfGO7mqbEpzv///xyqAiAQAbGewIz8aoehQArEWsyQsu7O549XJiowoCpg4rM9CGS8V8UZ9GBwy5wBr4K/teL4Ffz//8mHgIL/v82wKgA6kkXE+zKIuRaHAhDQATFf4lHABmL+xKPAFhKUOBQwSyU+AzFXEvDFf3sCCnrxh8O3Ujwh+fXZvjoZ+udTAERqR5IgKEBRAAAAAElFTkSuQmCC
// ==/UserScript==

// Have a nice day. - A Pseudonymous Coder

function bbbScript() { // Wrapper for injecting the script into the document.
	/*
	 * NOTE: You no longer need to edit this script to change settings!
	 * Use the "BBB Settings" button in the menu instead.
	 */

	// If Danbooru's JS isn't available, assume we're somewhere this script isn't needed and stop.
	if (typeof(Danbooru) === "undefined")
		return;

	/* Helper Prototypes */
	// Don't get hoisted so they should be declared at the top to simplify things.
	String.prototype.bbbSpacePad = function() {
		// Add a leading and trailing space.
		return (this.length ? " " + this + " " : "");
	};

	String.prototype.bbbSpaceClean = function() {
		// Remove leading, trailing, and multiple spaces.
		return this.replace(/\s+/g, " ").replace(/^\s|\s$/g, "");
	};

	String.prototype.bbbTagClean = function() {
		// Remove extra commas along with leading, trailing, and multiple spaces.
		return this.replace(/(?:^|[\s,]+)(%?\))(?:$|\s+)/, " $1 ").replace(/(?:^|\s+)([~-]*\(%?)(?:$|[\s,]+)/g, " $1 ").replace(/[\s,]*,[\s,]*/g, ", ").replace(/[\s,]+$|^[\s,]+/g, "").replace(/\s+/g, " ");
	};

	String.prototype.bbbHash = function() {
		// Turn a string into a hash using the current Danbooru hash method.
		var hash = 5381;
		var i = this.length;

		while(i)
			hash = (hash * 33) ^ this.charCodeAt(--i);

		return hash >>> 0;
	};

	Number.prototype.bbbEncode62 = function() {
		// Encode a number to base62.
		var encodeChars = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
		var encoded = "";
		var num = this;

		if (num === 0)
			encoded = encodeChars[0];
		else {
			while (num > 0) {
				encoded = encodeChars[num % 62] + encoded;
				num = Math.floor(num / 62);
			}
		}

		return encoded;
	};

	Element.prototype.bbbParent = function(parentName, limit) {
		// Search an element's successive parent nodes for a specific tag name or until the amount limit is hit.
		var el = this;
		var search = parentName.toUpperCase();

		for (var i = 0, il = limit || 1; i < il; i++) {
			var parent = el.parentNode;

			if (parent && parent.tagName === search)
				return parent;
			else
				el = parent;
		}

		return null;
	};

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

	Element.prototype.bbbHasClass = function() {
		// Test an element for one or more collections of classes.
		var classList = this.classList;

		for (var i = 0, il = arguments.length; i < il; i++) {
			var classes = arguments[i].bbbSpaceClean();

			if (!classes)
				continue;

			var classArray = classes.split(" ");
			var hasClass = true;

			for (var j = 0, jl = classArray.length; j < jl; j++) {
				if (!classList.contains(classArray[j])) {
					hasClass = false;
					break;
				}
			}

			if (hasClass)
				return true;
		}

		return false;
	};

	Element.prototype.bbbAddClass = function(classString) {
		// Add one or more classes to an element.
		var classes = classString.bbbSpaceClean();

		if (!classes)
			return;

		var classList = this.classList;
		var classArray = classes.split(" ");

		for (var i = 0, il = classArray.length; i < il; i++)
			classList.add(classArray[i]);
	};

	Element.prototype.bbbRemoveClass = function(classString) {
		// Remove one or more classes from an element.
		var classes = classString.bbbSpaceClean();

		if (!classes)
			return;

		var classList = this.classList;
		var classArray = classes.split(" ");

		for (var i = 0, il = classArray.length; i < il; i++)
			classList.remove(classArray[i]);
	};

	Element.prototype.bbbWatchNodes = function(func) {
		// Watch for new nodes.
		var observer = window.MutationObserver || window.WebKitMutationObserver;

		if (observer) {
			observer = new observer(func);
			observer.observe(this, {childList: true, subtree: true});
		}
		else
			this.addEventListener("DOMNodeInserted", func, false);
	};

	Element.prototype.bbbOverrideClick = function(func) {
		// Override Danbooru's click event listeners by capturing clicks on the parent node and stopping them.
		var target = this;

		var wrapperFunc = function(event) {
			if (event.target !== target || event.button !== 0)
				return;

			func(event);
			event.stopPropagation();
		};

		target.parentNode.addEventListener("click", wrapperFunc, true);
	};

	Element.prototype.bbbInfo = function(name, value) {
		// Retrieve or set info in data attributes.
		if (this.tagName === "HTML") { // Pseudo document.bbbInfo for retrieved pages.
			var imgContainer = getId("image-container", this);

			if (typeof(value) !== "undefined" && imgContainer)
				imgContainer.setAttribute("data-" + name, value);
			else if (name && imgContainer)
				return imgContainer.getAttribute("data-" + name);
			else
				return scrapePost(this);
		}
		else if (typeof(value) !== "undefined")
			this.setAttribute("data-" + name, value);
		else if (name)
			return this.getAttribute("data-" + name);
		else if (this.bbbHasClass("post-preview"))
			return scrapeThumb(this);
		else {
			// Always try to send the HTML element in order to provide the most information.
			var parent = this;

			while (parent.parentNode)
				parent = parent.parentNode;

			return scrapePost(parent);
		}
	};

	document.bbbInfo = function(name, value) {
		// Document specific bbbInfo that goes along with the element prototype method.
		var imgContainer = document.getElementById("image-container");

		if (typeof(value) !== "undefined" && imgContainer)
			imgContainer.setAttribute("data-" + name, value);
		else if (name && imgContainer)
			return imgContainer.getAttribute("data-" + name);
		else
			return scrapePost(document);
	};

	Storage.prototype.bbbSetItem = function(key, value) {
		// Store a value in storage and warn if it is full.
		try {
			this.setItem(key, value);
		}
		catch (error) {
			if (error.code === 22 || error.code === 1014) {
				if (this === localStorage) {
					if (!bbb.flags.local_storage_full) {
						if (localStorage.length > 2000) {
							// Try clearing out autocomplete if that appears to be the problem.
							cleanLocalStorage("autocomplete");

							try {
								localStorage.setItem(key, value);
							}
							catch (localError) {
								bbb.flags.local_storage_full = true;
							}
						}
						else
							bbb.flags.local_storage_full = true;

						// Store the local storage value until it can be retried.
						if (bbb.flags.local_storage_full) {
							bbb.local_storage_queue = {};
							bbb.local_storage_queue[key] = value;
							localStorageDialog();
						}
					}
					else {
						// Temporarily store additional local storage values until they can be retried.
						if (sessionStorage.getItem("bbb_local_storage_queue")) {
							var sessLocal = parseJson(sessionStorage.getItem("bbb_local_storage_queue"), {});

							sessLocal[key] = value;
							sessionStorage.bbbSetItem("bbb_local_storage_queue", JSON.stringify(sessLocal));
						}
						else
							bbb.local_storage_queue[key] = value;
					}
				}
				else {
					// Keep only a few values in session storage.
					for (var i = sessionStorage.length - 1; i >= 0; i--) {
						var keyName = sessionStorage.key(i);

						if (keyName !== "bbb_endless_default" && keyName !== "bbb_quick_search" && keyName !== "bbb_posts_cache")
							sessionStorage.removeItem(keyName);
					}

					try {
						sessionStorage.setItem(key, value);
					}
					catch (sessionError) {
						bbbNotice("Your settings/data could not be saved/updated. The browser's session storage is full.", -1);
					}
				}
			}
			else
				bbbNotice("Unexpected error while attempting to save/update settings. (Error: " + error.message + ")", -1);
		}
	};

	/* Global Variables */
	var bbb = { // Container for script info.
		autocomplete: {},
		blacklist: {
			entries: [],
			match_list: {},
			smart_view_target: undefined
		},
		custom_tag: {
			searches: [],
			style_list: {}
		},
		dialog: {
			queue: []
		},
		drag_scroll: {
			lastX: undefined,
			lastY: undefined,
			moved: false,
			target: undefined
		},
		el: { // Script elements.
			menu: {} // Menu elements.
		},
		endless: {
			append_page: false,
			enabled: false,
			fill_first_page: false,
			last_paginator: undefined,
			new_paginator: undefined,
			no_thumb_count: 0,
			pages: [],
			paused: false,
			posts: {}
		},
		fixed_paginator_space: 0,
		fixed_sidebar: {
			content: undefined,
			left: undefined,
			sidebar: undefined,
			top: undefined
		},
		flags: {},
		gm_data: undefined,
		groups: undefined,
		hotkeys: {
			other: { // Hotkeys for misc locations.
				66: {func: openMenu} // B
			},
			post: { // Post hotkeys.
				49: {func: resizeHotkey, custom_handler: true}, // 1
				50: {func: resizeHotkey, custom_handler: true}, // 2
				51: {func: resizeHotkey, custom_handler: true}, // 3
				52: {func: resizeHotkey, custom_handler: true}, // 4
				66: {func: openMenu}, // B
				86: {func: swapPost} // V
			}
		},
		post: { // Post content info and status.
			info: {}, // Post information object.
			resize: {
				mode: "none",
				ratio: 1
			},
			swapped: false // Whether the post content has been changed between the original and sample versions.
		},
		options: { // Setting options and data.
			bbb_version: "8.2.3",
			add_popular_link: newOption("checkbox", false, "Add Popular Link", "Add a link to the popular listing to the \"posts\" submenu"),
			add_random_post_link: newOption("checkbox", false, "Add Random Link", "Add a link to a random post to the post sidebar options menu."),
			alternate_image_swap: newOption("checkbox", false, "Alternate Image Swap", "Switch between the sample and original image by clicking the image. <tiphead>Note</tiphead>Notes can be toggled by using the link in the sidebar options section."),
			autohide_sidebar: newOption("dropdown", "none", "Auto-hide Sidebar", "Hide the sidebar for posts, favorites listings, and/or searches until the mouse comes close to the left side of the window or the sidebar gains focus.<tiphead>Tips</tiphead>By using Danbooru's hotkey for the letter \"Q\" to place focus on the search box, you can unhide the sidebar.<br><br>Use the \"thumbnail count\" option to get the most out of this feature on search listings.", {txtOptions:["Disabled:none", "Favorites:favorites", "Posts:post", "Searches:search", "Favorites & Posts:favorites post", "Favorites & Searches:favorites search", "Posts & Searches:post search", "All:favorites post search"]}),
			autoscroll_post: newOption("dropdown", "none", "Auto-scroll Post", "Automatically scroll a post to a particular point. <tipdesc>Below Header:</tipdesc> Scroll the window down until the header is no longer visible or scrolling is no longer possible. <tipdesc>Post Content:</tipdesc> Position the post content as close as possible to the left and top edges of the window viewport when initially loading a post. Using this option will also scroll past any notices above the content.", {txtOptions:["Disabled:none", "Below Header:header", "Post Content:post"]}),
			blacklist_add_bars: newOption("checkbox", false, "Additional Bars", "Add a blacklist bar to the comment search listing and individually linked comments so that blacklist entries can be toggled as needed."),
			blacklist_highlight_color: newOption("text", "#CCCCCC", "Highlight Color", "When using highlighting for \"thumbnail marking\", you may set the color here. <tiphead>Notes</tiphead>Leaving this field blank will result in the default color being used. <br><br>For easy color selection, use one of the many free tools on the internet like <a target=\"_blank\" href=\"http://www.quackit.com/css/css_color_codes.cfm\">this one</a>. Hex RGB color codes (#000000, #FFFFFF, etc.) are the recommended values."),
			blacklist_ignore_fav: newOption("checkbox", false, "Ignore Favorites", "Allow the blacklist to ignore your favorited posts."),
			blacklist_thumb_controls: newOption("checkbox", false, "Thumbnail Controls", "Allow control over individual blacklisted thumbnails and access to blacklist toggle links from blacklisted thumbnails. <tiphead>Directions</tiphead>For blacklisted thumbnails that have been revealed, hovering over them will reveal a clickable \"X\" icon that can hide them again. <br><br>If using \"hidden\" or \"replaced\" for the \"post display\" option, clicking on the area of a blacklisted thumbnail will pop up a menu that displays what blacklist entries it matches. Clicking the thumbnail area a second time while that menu is open will reveal that single thumbnail. <br><br>The menu that pops up on the first click also allows for toggling any listed blacklist entry for the entire page and navigating to the post without revealing its thumbnail. <tiphead>Note</tiphead>Toggling blacklist entries will have no effect on posts that have been changed via their individual controls."),
			blacklist_post_display: newOption("dropdown", "disabled", "Post Display", "Set how the display of blacklisted posts in thumbnail listings and the comments section is handled. <tipdesc>Removed:</tipdesc> Posts and the space they take up are completely removed. <tipdesc>Hidden:</tipdesc> Post space is preserved, but thumbnails are hidden. <tipdesc>Replaced:</tipdesc> Thumbnails are replaced by \"blacklisted\" thumbnail placeholders.", {txtOptions:["Disabled:disabled", "Removed:removed", "Hidden:hidden", "Replaced:replaced"]}),
			blacklist_smart_view: newOption("checkbox", false, "Smart View", "When navigating to a blacklisted post by using its thumbnail, if the thumbnail has already been revealed, the post content will temporarily be exempt from any blacklist checks for 1 minute and be immediately visible. <tiphead>Note</tiphead>Thumbnails in the parent/child notices of posts with exempt content will still be affected by the blacklist."),
			blacklist_session_toggle: newOption("checkbox", false, "Session Toggle", "When toggling an individual blacklist entry on and off, the mode it's toggled to will persist across other pages in the same browsing session until it ends.<tiphead>Note</tiphead>For blacklists with many entries, this option can cause unexpected behavior (ex: getting logged out) if too many entries are toggled off at the same time."),
			blacklist_thumb_mark: newOption("dropdown", "none", "Thumbnail Marking", "Mark the thumbnails of blacklisted posts that have been revealed to make them easier to distinguish from other thumbnails. <tipdesc>Highlight:</tipdesc> Change the background color of blacklisted thumbnails. <tipdesc>Icon Overlay:</tipdesc> Add an icon to the lower right corner of blacklisted thumbnails.", {txtOptions:["Disabled:none", "Highlight:highlight", "Icon Overlay:icon"]}),
			blacklist_video_playback: newOption("dropdown", "pause resume", "Video Playback", "Allow the blacklist to control the playback of video content. <tipdesc>Pause:</tipdesc> Video content will pause when it is hidden. <tipdesc>Pause and Resume:</tipdesc> Video content will pause when it is hidden and resume playing when unhidden.", {txtOptions:["Disabled:disabled", "Pause:pause", "Pause & Resume:pause resume"]}),
			border_spacing: newOption("dropdown", 0, "Border Spacing", "Set the amount of blank space between a border and thumbnail and between a custom tag border and status border. <tiphead>Note</tiphead>Even when set to 0, status borders and custom tag borders will always have a minimum value of 1 between them. <tiphead>Tip</tiphead>Use this option if you often have trouble distinguishing a border from the thumbnail image.", {txtOptions:["0 (Default):0", "1:1", "2:2", "3:3"]}),
			border_width: newOption("dropdown", 2, "Border Width", "Set the width of thumbnail borders.", {txtOptions:["1:1", "2 (Default):2", "3:3", "4:4", "5:5"]}),
			bypass_api: newOption("checkbox", false, "Automatic API Bypass", "When logged out and API only features are enabled, do not warn about needing to be logged in. Instead, automatically bypass those features."),
			clean_links: newOption("checkbox", false, "Clean Links", "Remove the extra information after the post ID in thumbnail listing post links.<tiphead>Note</tiphead>Enabling this option will disable Danbooru's search navigation and active pool/favorite group detection for posts."),
			collapse_sidebar: newOption("checkbox", false, "Collapsible Sidebar", "Allow sections in the sidebar to be expanded and collapsed via clicking their header titles.<tiphead>Note</tiphead>Sections can be set to default to expanded or collapsed by right clicking their titles."),
			comment_score: newOption("checkbox", false, "Comment Scores", "Make comment scores visible by adding them as direct links to their respective comments."),
			custom_status_borders: newOption("checkbox", false, "Custom Status Borders", "Override Danbooru's thumbnail borders for deleted, flagged, pending, parent, and child images."),
			custom_tag_borders: newOption("checkbox", true, "Custom Tag Borders", "Add thumbnail borders to posts with specific tags."),
			direct_downloads: newOption("checkbox", false, "Direct Downloads", "Allow download managers to download the posts displayed in the favorites, search, pool, popular, and favorite group listings. <tiphead>Note</tiphead>Posts filtered out by the blacklist or quick search will not provide direct downloads until the blacklist entry or quick search affecting them is disabled."),
			disable_embedded_notes: newOption("checkbox", false, "Disable Embedded Notes", "Force posts with embedded notes to display with the original note styling. <tiphead>Notes</tiphead>While notes will display with the original styling, the actual post settings will still have embedded notes set to enabled. <br><br>Due to the actual settings, users that may wish to edit notes will have to edit the notes with the embedded note styling so that nothing ends up breaking in unexpected ways. When toggling translation mode or opening the edit note dialog box, the notes will automatically revert back to the original embedded notes until the page is reloaded. <br><br>Note resizing and moving will be allowed without the reversion to embedded notes since this ability is sometimes necessary for badly positioned notes. Any note resizing or moving done as a part of intended note editing should be done <b>after</b> triggering the embedded note reversion since any changes before it will be lost."),
			disable_tagged_filenames: newOption("checkbox", false, "Disable Tagged Filenames", "Remove the tag information from post filenames and only leave the original md5 hash. <tiphead>Note</tiphead>For logged in users with their account's \"disable tagged filenames\" setting set to \"yes\", this option must be enabled for consistent behavior on hidden posts. <br><br>For logged in users with their account's \"disable tagged filenames\" setting set to \"no\" and logged out users, this option can be enabled to remove the tags from filenames without having to use an account setting."),
			enable_menu_autocomplete: newOption("checkbox", true, "Enable Menu Autocomplete", "Allow the BBB menu to use Danbooru's tag autocomplete."),
			enable_status_message: newOption("checkbox", true, "Enable Status Message", "When requesting information from Danbooru, display the request status in the lower right corner."),
			endless_default: newOption("dropdown", "disabled", "Default", "Enable endless pages on the favorites, search, pool, and favorite group listings. <tipdesc>Off:</tipdesc> Start up with all features off. <tipdesc>On:</tipdesc> Start up with all features on.<tipdesc>Paused:</tipdesc> Start up with all features on, but do not append new pages until the \"load more\" button is clicked. <tiphead>Note</tiphead>When not set to disabled, endless pages can be toggled between off and on/paused by using the \"E\" hotkey or the \"endless\" link next to the \"listing\" link in the page submenu. <tiphead>Tip</tiphead>The \"new tab/window\" and \"fixed paginator\" options can provide additional customization for endless pages.", {txtOptions:["Disabled:disabled", "Off:off", "On:on", "Paused:paused"]}),
			endless_fill: newOption("checkbox", false, "Fill Pages", "When appending pages with missing thumbnails caused by hidden posts or removed duplicate posts, retrieve thumbnails from the following pages and add them to the new page until the desired number of thumbnails is reached. <tiphead>Note</tiphead>If using page separators, the displayed page number for appended pages composed of thumbnails from multiple Danbooru pages will be replaced by a range consisting of the first and last pages from which thumbnails were retrieved."),
			endless_pause_interval: newOption("dropdown", 0, "Pause Interval", "Pause endless pages each time the number of pages reaches a multiple of the selected amount. <tiphead>Note</tiphead> When this option is enabled, the \"Shift + E\" hotkey can be used to continue loading more pages after pausing.", {txtOptions:["Disabled:0"], numRange:[1,100]}),
			endless_preload: newOption("checkbox", false, "Preload Next Page", "Start loading the next page as soon as possible.<tiphead>Note</tiphead>A preloaded page will not be appended until the scroll limit is reached."),
			endless_remove_dup: newOption("checkbox", false, "Remove Duplicates", "When appending new pages, remove posts that already exist in the listing from the new page.<tiphead>Note</tiphead>Duplicate posts are caused by the addition of new posts to the beginning of a listing or changes to the order of the posts."),
			endless_scroll_limit: newOption("dropdown", 500, "Scroll Limit", "Set the minimum amount of pixels that the window can have left to vertically scroll before it starts appending the next page.", {numList:[0,50,100,150,200,250,300,350,400,450,500,550,600,650,700,750,800,850,900,950,1000,1050,1100,1150,1200,1250,1300,1350,1400,1450,1500]}),
			endless_separator: newOption("dropdown", "divider", "Page Separator", "Distinguish pages from each other by marking them with a separator.<tipdesc>Marker:</tipdesc> Place a thumbnail sized marker before the first thumbnail of each page.<tipdesc>Divider:</tipdesc> Completely separate pages by placing a horizontal line between them.", {txtOptions:["None:none", "Marker:marker", "Divider:divider"]}),
			endless_session_toggle: newOption("checkbox", false, "Session Toggle", "When toggling endless pages on and off, the mode it's toggled to will override the default and persist across other pages in the same browsing session for that tab until it ends."),
			fixed_paginator: newOption("dropdown", "disabled", "Fixed Paginator", "Make the paginator always visible for the favorites, search, pool, and favorite group listings by fixing it to the bottom of the window when it would normally start scrolling out of view. <tipdesc>Endless:</tipdesc> Only change the paginator during endless pages browsing. <tipdesc>Normal:</tipdesc> Only change the paginator during normal browsing. <tipdesc>Always:</tipdesc> Change the paginator during normal and endless pages browsing. <tiphead>Note</tiphead>Options labeled with \"minimal\" will also make the fixed paginator smaller by removing most of the blank space within it.", {txtOptions:["Disabled:disabled", "Endless:endless", "Endless (Minimal):endless minimal", "Normal:normal", "Normal (Minimal):normal minimal", "Always:endless normal", "Always (Minimal):endless normal minimal"]}),
			fixed_sidebar: newOption("dropdown", "none", "Fixed Sidebar", "Make the sidebar never completely vertically scroll out of view for posts, favorites listings, and/or searches by fixing it to the top or bottom of the window when it would normally start scrolling out of view. <tiphead>Note</tiphead>The \"auto-hide sidebar\" option will override this option if both try to modify the same page. <tiphead>Tip</tiphead>Depending on the available height in the browser window and the Danbooru location being modified, the \"tag scrollbars\", \"collapsible sidebar\", and/or \"remove tag headers\" options may be needed for best results.", {txtOptions:["Disabled:none", "Favorites:favorites", "Posts:post", "Searches:search", "Favorites & Posts:favorites post", "Favorites & Searches:favorites search", "Posts & Searches:post search", "All:favorites post search"]}),
			hide_ban_notice: newOption("checkbox", false, "Hide Ban Notice", "Hide the Danbooru ban notice."),
			hide_comment_notice: newOption("checkbox", false, "Hide Comment Guide Notice", "Hide the Danbooru comment guide notice."),
			hide_fav_button: newOption ("checkbox", false, "Hide Favorite Button", "Hide the favorite button below post content."),
			hide_pool_notice: newOption("checkbox", false, "Hide Pool Guide Notice", "Hide the Danbooru pool guide notice."),
			hide_sign_up_notice: newOption("checkbox", false, "Hide Sign Up Notice", "Hide the Danbooru account sign up notice."),
			hide_tag_notice: newOption("checkbox", false, "Hide Tag Guide Notice", "Hide the Danbooru tag guide notice."),
			hide_tos_notice: newOption("checkbox", false, "Hide TOS Notice", "Hide the Danbooru terms of service agreement notice."),
			hide_upgrade_notice: newOption("checkbox", false, "Hide Upgrade Notice", "Hide the Danbooru upgrade account notice."),
			hide_upload_notice: newOption("checkbox", false, "Hide Upload Guide Notice", "Hide the Danbooru upload guide notice."),
			hide_hidden_notice: newOption("checkbox", false, "Hide Hidden Posts Notice", "Hide the Danbooru hidden posts notice."),
			image_swap_mode: newOption("dropdown", "load", "Image Swap Mode", "Set how swapping between the sample and original image is done.<tipdesc>Load First:</tipdesc> Display the image being swapped in after it has finished downloading. <tipdesc>View While Loading:</tipdesc> Immediately display the image being swapped in while it is downloading.", {txtOptions:["Load First:load", "View While Loading:view"]}),
			load_sample_first: newOption("checkbox", true, "Load Sample First", "Load sample images first when viewing a post.<tiphead>Note</tiphead>When logged in, the account's \"default image width\" setting will override this option. This behavior can be changed with the \"override sample setting\" option under the preferences tab."),
			manage_cookies: newOption("checkbox", false, "Manage Notice Cookies", "When using the \"hide upgrade notice\", \"hide sign up notice\", and/or \"hide TOS notice\" options, also create cookies to disable these notices at the server level.<tiphead>Tip</tiphead>Use this feature if the notices keep flashing on your screen before being removed."),
			minimize_status_notices: newOption("checkbox", false, "Minimize Status Notices", "Hide the Danbooru deleted, banned, flagged, appealed, and pending notices. When you want to see a hidden notice, you can click the appropriate status link in the information section of the sidebar."),
			move_relation_notices: newOption("dropdown", "disabled", "Move Relation Notices", "Move the Danbooru parent and child post notices. <tipdesc>Below:</tipdesc> Move the notices below the post content. <tipdesc>Minimize:</tipdesc> Hide the notices and create a relations area in the information section of the sidebar that will allow you to view them.", {txtOptions:["Disabled:disabled", "Below:below", "Minimize:minimize"]}),
			override_blacklist: newOption("dropdown", "logged_out", "Override Blacklist", "Allow the \"blacklist\" setting to override the default blacklist for logged out users and/or account blacklist for logged in users. <tipdesc>Logged out:</tipdesc> Override the default blacklist for logged out users. <tipdesc>Always:</tipdesc> Override the default blacklist for logged out users and account blacklist for logged in users.", {txtOptions:["Disabled:disabled", "Logged out:logged_out", "Always:always"]}),
			override_resize: newOption("checkbox", false, "Override Resize Setting", "Allow the \"resize post\" setting to override the account \"fit images to window\" setting when logged in."),
			override_sample: newOption("checkbox", false, "Override Sample Setting", "Allow the \"load sample first\" setting to override the account \"default image width\" setting when logged in. <tiphead>Note</tiphead>When using this option, your Danbooru account settings should have \"default image width\" set to the corresponding value of the \"load sample first\" script setting. Not doing so will cause your browser to always download both the sample and original image. If you often change the \"load sample first\" setting, leaving your account to always load the sample/850px image first is your best option."),
			page_counter: newOption("checkbox", false, "Page Counter", "Add a page counter and \"go to page #\" input field near the top of listing pages. <tiphead>Note</tiphead>The total number of pages will not be displayed if the pages are using the \"previous & next\" paging system or the total number of pages exceeds the maximum amount allowed by your user account level."),
			post_drag_scroll: newOption("checkbox", false, "Post Drag Scrolling", "While holding down left click on a post's content, mouse movement can be used to scroll the whole page and reposition the content.<tiphead>Note</tiphead>This option is automatically disabled when translation mode is active."),
			post_link_new_window: newOption("dropdown", "none", "New Tab/Window", "Force post links in the search, pool, popular, favorites, and favorite group listings to open in a new tab/window. <tipdesc>Endless:</tipdesc> Only use new tabs/windows during endless pages browsing. <tipdesc>Normal:</tipdesc> Only use new tabs/windows during normal browsing. <tipdesc>Always:</tipdesc> Use new tabs/windows during normal and endless pages browsing. <tiphead>Notes</tiphead>When this option is active, holding down the control and shift keys while clicking a post link will open the post in the current tab/window.<br><br>Whether the post opens in a new tab or a new window depends upon your browser configuration. <tiphead>Tip</tiphead>This option can be useful as a safeguard to keep accidental left clicks from disrupting endless pages.", {txtOptions:["Disabled:disabled", "Endless:endless", "Normal:normal", "Always:endless normal"]}),
			post_resize: newOption("checkbox", true, "Resize Post", "Shrink large post content to fit the browser window when initially loading a post.<tiphead>Note</tiphead>When logged in, the account's \"fit images to window\" setting will override this option. This behavior can be changed with the \"override resize setting\" option under the preferences tab."),
			post_resize_mode: newOption("dropdown", "width", "Resize Mode", "Choose how to shrink large post content to fit the browser window when initially loading a post.", {txtOptions:["Width:width", "Height:height", "Width & Height:all"]}),
			post_tag_scrollbars: newOption("dropdown", 0, "Post Tag Scrollbars", "Limit the length of the sidebar tag lists for posts by restricting them to a set height in pixels. For lists that exceed the set height, a scrollbar will be added to allow the rest of the list to be viewed.<tiphead>Note</tiphead>When using \"remove tag headers\", this option will limit the overall length of the combined list.", {txtOptions:["Disabled:0"], numList:[50,100,150,200,250,300,350,400,450,500,550,600,650,700,750,800,850,900,950,1000,1050,1100,1150,1200,1250,1300,1350,1400,1450,1500]}),
			post_tag_titles: newOption("checkbox", false, "Post Tag Titles", "Change the page titles for posts to a full list of the post tags."),
			quick_search: newOption("dropdown", "disabled", "Quick Search", "Add a new search box to the upper right corner of the window viewport that allows searching through the current thumbnails for specific posts. <tipdesc>Fade:</tipdesc> Fade all posts that don't match in the thumbnail listing. <tipdesc>Remove:</tipdesc> Remove all posts that don't match from the thumbnail listing. <tiphead>Directions</tiphead>Please read the \"thumbnail matching rules\" section under the help tab for information about creating searches. <br><br>The search starts minimized in the upper right corner. Left clicking the main icon will open and close the search. Right clicking the main icon will completely reset the search. Holding down shift while left clicking the main icon will toggle an active search's pinned status. Holding down control while left clicking the main icon will toggle an active search's negated status.<br><br>While open, the search can be entered/updated in the search box and the pinned status can be toggled by clicking the pushpin icon. Clicking the negative icon next to the pushpin icon will tell quick search to negate/invert the search being submitted. If no changes are made to an active search, submitting it a second time will reset the quick search. <tiphead>Notes</tiphead>Options labeled with \"pinned\" will make searches default to being pinned. <br><br>A pinned search will persist across other pages in the same browsing session for that tab until it ends or the search is unpinned. <br><br>When not set to disabled, the quick search can be opened by using the \"F\" hotkey. Additionally, an active search can be reset by using \"Shift + F\". Pressing \"Escape\" while the quick search is open will close it.", {txtOptions:["Disabled:disabled", "Fade:fade", "Fade (Pinned):fade pinned", "Remove:remove", "Remove (Pinned):remove pinned"]}),
			remove_tag_headers: newOption("checkbox", false, "Remove Tag Headers", "Remove the \"copyrights\", \"characters\", and \"artist\" headers from the sidebar tag list."),
			resize_link_style: newOption("dropdown", "full", "Resize Link Style", "Set how the resize links in the post sidebar options section will display. <tipdesc>Full:</tipdesc> Show the \"resize to window\", \"resize to window width\", and \"resize to window height\" links on separate lines. <tipdesc>Minimal:</tipdesc> Show the \"resize to window\" (W&H), \"resize to window width\" (W), and \"resize to window height\" (H) links on one line.", {txtOptions:["Full:full", "Minimal:minimal"]}),
			search_add: newOption("dropdown", "disabled", "Search Add", "Modify the sidebar tag list by adding, removing, or replacing links in the sidebar tag list that modify the current search's tags. <tipdesc>Remove:</tipdesc> Remove any preexisting \"+\" and \"&ndash;\" links. <tipdesc>Link:</tipdesc> Add \"+\" and \"&ndash;\" links to modified versions of the current search that include or exclude their respective tags. <tipdesc>Toggle:</tipdesc> Add toggle links that modify the search box with their respective tags. Clicking a toggle link will switch between a tag being included (+), excluded (&ndash;), potentially included among other tags (~), and removed (&raquo;). Right clicking a toggle link will immediately remove its tag. If a tag already exists in the search box or gets entered/removed through alternative means, the toggle link will automatically update to reflect the tag's current status. <tiphead>Note</tiphead>The remove option is intended for users above the basic user level that want to remove the links. For users that can't normally see the links and do not wish to see them, this setting should be set to disabled.", {txtOptions:["Disabled:disabled", "Remove:remove", "Link:link", "Toggle:toggle"]}),
			search_tag_scrollbars: newOption("dropdown", 0, "Search Tag Scrollbars", "Limit the length of the sidebar tag list for the search listing by restricting it to a set height in pixels. When the list exceeds the set height, a scrollbar will be added to allow the rest of the list to be viewed.", {txtOptions:["Disabled:0"], numList:[50,100,150,200,250,300,350,400,450,500,550,600,650,700,750,800,850,900,950,1000,1050,1100,1150,1200,1250,1300,1350,1400,1450,1500]}),
			show_banned: newOption("checkbox", false, "Show Banned Placeholders", "Display all banned posts in the search, pool, popular, favorites, comments, and favorite group listings by using \"hidden\" placeholders.<tiphead>Note</tiphead>This option only affects users below the gold account level."),
			show_deleted: newOption("checkbox", false, "Show Deleted", "Display all deleted posts in the search, pool, popular, favorites, and favorite group listings. <tiphead>Note</tiphead>When using this option, your Danbooru account settings should have \"deleted post filter\" set to no and \"show deleted children\" set to yes in order to function properly and minimize connections to Danbooru."),
			show_loli: newOption("checkbox", false, "Show Loli Placeholders", "Display loli posts in the search, pool, popular, favorites, comments, and favorite group listings by using \"hidden\" placeholders.<tiphead>Note</tiphead>This option only affects users below the gold account level."),
			show_resized_notice: newOption("dropdown", "all", "Show Resized Notice", "Set which image type(s) the purple notice bar about image resizing is allowed to display on. <tiphead>Tip</tiphead>When a sample and original image are available for a post, a new option for swapping between the sample and original image becomes available in the sidebar options menu. Even if you disable the resized notice bar, you will always have access to its main function.", {txtOptions:["None (Disabled):none", "Original:original", "Sample:sample", "Original & Sample:all"]}),
			show_shota: newOption("checkbox", false, "Show Shota Placeholders", "Display shota posts in the search, pool, popular, favorites, comments, and favorite group listings by using \"hidden\" placeholders.<tiphead>Note</tiphead>This option only affects users below the gold account level."),
			show_toddlercon: newOption("checkbox", false, "Show Toddlercon Placeholders", "Display toddlercon posts in the search, pool, popular, favorites, comments, and favorite group listings by using \"hidden\" placeholders.<tiphead>Note</tiphead>This option only affects users below the gold account level."),
			single_color_borders: newOption("checkbox", false, "Single Color Borders", "Only use one color for each thumbnail border."),
			thumb_info: newOption("dropdown", "disabled", "Thumbnail Info", "Display the score (&#x2605;), favorite count (&hearts;), and rating (S, Q, or E) for a post with its thumbnail. <tipdesc>Below:</tipdesc> Display the extra information below thumbnails. <tipdesc>Hover:</tipdesc> Display the extra information upon hovering over a thumbnail's area. <tiphead>Note</tiphead>Extra information will not be added to the thumbnails in the comments listing since the score and rating are already visible there. Instead, the number of favorites will be added next to the existing score display.", {txtOptions:["Disabled:disabled", "Below:below", "Hover:hover"]}),
			thumbnail_count: newOption("dropdown", 0, "Thumbnail Count", "Change the number of thumbnails that display in the search and favorites listings.", {txtOptions:["Disabled:0"], numRange:[1,200]}),
			thumbnail_count_default: newOption("dropdown", 20, "Thumbnail Count Default", "Change the number of thumbnails that BBB should expect Danbooru to return per a page.<tiphead>Note</tiphead>This option only affects users above the basic account level. It should only be changed from 20 by users <b>that have changed their account setting for posts per page</b>.", {txtOptions:["Disabled:0"], numRange:[1,100]}),
			track_new: newOption("checkbox", false, "Track New Posts", "Add a menu option titled \"new\" to the posts section submenu (between \"listing\" and \"upload\") that links to a customized search focused on keeping track of new posts.<tiphead>Note</tiphead>While browsing the new posts, the current page of posts is also tracked. If the new post listing is left, clicking the \"new\" link later on will attempt to pull up the posts where browsing was left off at.<tiphead>Tip</tiphead>If you would like to bookmark the new post listing, drag and drop the link to your bookmarks or right click it and bookmark/copy the location from the context menu."),
			video_autoplay: newOption("dropdown", "on", "Video Autoplay", "Automatically play video posts. <tipdesc>Off:</tipdesc> All videos have to be started manually. <tipdesc>No Sound:</tipdesc> Videos without sound will start automatically and videos with sound have to be started manually. <tipdesc>On:</tipdesc> All videos will start automatically.", {txtOptions:["Off:off", "No Sound:nosound", "On:on"]}),
			video_controls: newOption("checkbox", true, "Video Controls", "Show the controls for video posts."),
			video_loop: newOption("dropdown", "nosound", "Video Looping", "Repeatedly play video posts. <tipdesc>Off:</tipdesc> All videos will only play once. <tipdesc>No Sound:</tipdesc> Videos without sound will repeat and videos with sound will only play once. <tipdesc>On:</tipdesc> All videos will repeat.", {txtOptions:["Off:off", "No Sound:nosound", "On:on"]}),
			video_volume: newOption("dropdown", "disabled", "Video Volume", "Set the default volume of videos or remember your volume settings across videos. <tipdesc>Remember:</tipdesc> Set the video to the last volume level and muted status used. <tipdesc>Muted:</tipdesc> Always set the video volume to muted. <tipdesc>5% - 100%:</tipdesc> Always set the video volume level to the specified percent. <tiphead>Note</tiphead>This option can not control the volume of flash videos.", {txtOptions:["Disabled:disabled", "Remember:remember", "Muted:muted", "5%:0.05", "10%:0.1", "15%:0.15", "20%:0.2", "25%:0.25", "30%:0.30", "35%:0.35", "40%:0.4", "45%:0.45", "50%:0.5", "55%:0.55", "60%:0.6", "65%:0.65", "70%:0.7", "75%:0.75", "80%:0.8", "85%:0.85", "90%:0.9", "95%:0.95", "100%:1"]}),
			collapse_sidebar_data: {post: {}, thumb: {}},
			script_blacklisted_tags: "",
			status_borders: borderSet(["deleted", true, "#000000", "solid", "post-status-deleted"], ["flagged", true, "#FF0000", "solid", "post-status-flagged"], ["pending", true, "#0000FF", "solid", "post-status-pending"], ["child", true, "#CCCC00", "solid", "post-status-has-parent"], ["parent", true, "#00FF00", "solid", "post-status-has-children"]),
			tag_borders: borderSet(["loli", true, "#FFC0CB", "solid"], ["shota", true, "#66CCFF", "solid"], ["toddlercon", true, "#9370DB", "solid"], ["status:banned", true, "#000000", "solid"]),
			tag_groups: groupSet(["hidden", "~loli ~shota ~toddlercon ~status:banned"]),
			track_new_data: {viewed: 0, viewing: 1},
			video_volume_data: {level: 1, muted: false}
		},
		quick_search: {
			negated: false,
			tags: ""
		},
		search_add: {
			active_links: {},
			links: {},
			old: ""
		},
		sections: { // Setting sections and ordering.
			blacklist_options: newSection("general", ["blacklist_session_toggle", "blacklist_post_display", "blacklist_thumb_mark", "blacklist_highlight_color", "blacklist_thumb_controls", "blacklist_smart_view", "blacklist_add_bars", "blacklist_video_playback", "blacklist_ignore_fav"], "Options"),
			border_options: newSection("general", ["custom_tag_borders", "custom_status_borders", "single_color_borders", "border_width", "border_spacing"], "Options"),
			browse: newSection("general", ["show_loli", "show_shota", "show_toddlercon", "show_banned", "show_deleted", "thumbnail_count", "thumb_info", "post_link_new_window"], "Post Browsing"),
			control: newSection("general", ["load_sample_first", "alternate_image_swap", "image_swap_mode", "post_resize", "post_resize_mode", "post_drag_scroll", "autoscroll_post", "disable_embedded_notes", "video_volume", "video_autoplay", "video_loop", "video_controls"], "Post Control"),
			endless: newSection("general", ["endless_default", "endless_session_toggle", "endless_separator", "endless_scroll_limit", "endless_remove_dup", "endless_pause_interval", "endless_fill", "endless_preload"], "Endless Pages"),
			groups: newSection("group", "tag_groups", "Groups", "Tags that are frequently used together or that need to be coordinated between multiple places may be grouped together and saved here for use with the \"group\" metatag."),
			notices: newSection("general", ["show_resized_notice", "minimize_status_notices", "move_relation_notices", "hide_sign_up_notice", "hide_upgrade_notice", "hide_hidden_notice", "hide_tos_notice", "hide_comment_notice", "hide_tag_notice", "hide_upload_notice", "hide_pool_notice", "hide_ban_notice"], "Notices"),
			sidebar: newSection("general", ["remove_tag_headers", "post_tag_scrollbars", "search_tag_scrollbars", "autohide_sidebar", "fixed_sidebar", "collapse_sidebar"], "Tag Sidebar"),
			misc: newSection("general", ["direct_downloads", "track_new", "clean_links", "post_tag_titles", "search_add", "page_counter", "comment_score", "quick_search"], "Misc."),
			misc_layout: newSection("general", ["fixed_paginator", "hide_fav_button", "add_popular_link", "add_random_post_link"], "Misc."),
			script_settings: newSection("general", ["bypass_api", "manage_cookies", "enable_status_message", "enable_menu_autocomplete", "resize_link_style", "override_blacklist", "override_resize", "override_sample", "disable_tagged_filenames", "thumbnail_count_default"], "Script Settings"),
			status_borders: newSection("border", "status_borders", "Custom Status Borders", "When using custom status borders, the borders can be edited here. For easy color selection, use one of the many free tools on the internet like <a target=\"_blank\" href=\"http://www.quackit.com/css/css_color_codes.cfm\">this one</a>."),
			tag_borders: newSection("border", "tag_borders", "Custom Tag Borders", "When using custom tag borders, the borders can be edited here. For easy color selection, use one of the many free tools on the internet like <a target=\"_blank\" href=\"http://www.quackit.com/css/css_color_codes.cfm\">this one</a>.")
		},
		session: new Date().getTime(), // Provide a session ID in order to detect XML requests carrying over from other pages.
		settings: {
			changed: {}
		},
		timers: {},
		user: {} // User settings.
	};

	localStorageCheck();

	loadSettings(); // Load user settings.

	// Location variables.
	var gLoc = danbLoc(); // Current location
	var gLocRegex = new RegExp("\\b" + gLoc + "\\b");

	// Script variables.
	// Global
	var show_loli = (isGoldLevel() ? true : bbb.user.show_loli);
	var show_shota = (isGoldLevel() ? true : bbb.user.show_shota);
	var show_toddlercon = (isGoldLevel() ? true : bbb.user.show_toddlercon);
	var show_banned = (isGoldLevel() ? true : bbb.user.show_banned);
	var deleted_shown = (gLoc === "search" && /^(?:any|deleted)$/i.test(getTagVar("status"))); // Check whether deleted posts are shown by default.
	var show_deleted = deleted_shown || bbb.user.show_deleted;
	var direct_downloads = bbb.user.direct_downloads;
	var post_link_new_window = bbb.user.post_link_new_window;

	var blacklist_session_toggle = bbb.user.blacklist_session_toggle;
	var blacklist_post_display = bbb.user.blacklist_post_display;
	var blacklist_thumb_mark = bbb.user.blacklist_thumb_mark;
	var blacklist_highlight_color = bbb.user.blacklist_highlight_color;
	var blacklist_ignore_fav = bbb.user.blacklist_ignore_fav;
	var blacklist_add_bars = bbb.user.blacklist_add_bars;
	var blacklist_thumb_controls = bbb.user.blacklist_thumb_controls;
	var blacklist_smart_view = bbb.user.blacklist_smart_view;
	var blacklist_video_playback = bbb.user.blacklist_video_playback;

	var custom_tag_borders = bbb.user.custom_tag_borders;
	var custom_status_borders = bbb.user.custom_status_borders;
	var single_color_borders = bbb.user.single_color_borders;
	var border_spacing = bbb.user.border_spacing;
	var border_width = bbb.user.border_width;
	var clean_links = bbb.user.clean_links;
	var comment_score = bbb.user.comment_score;
	var thumb_info = bbb.user.thumb_info;
	var autohide_sidebar = gLocRegex.test(bbb.user.autohide_sidebar);
	var fixed_sidebar = gLocRegex.test(bbb.user.fixed_sidebar);
	var fixed_paginator = bbb.user.fixed_paginator;
	var collapse_sidebar = bbb.user.collapse_sidebar;
	var page_counter = bbb.user.page_counter;
	var quick_search = bbb.user.quick_search;

	var bypass_api = bbb.user.bypass_api;
	var manage_cookies = bbb.user.manage_cookies;
	var enable_menu_autocomplete = bbb.user.enable_menu_autocomplete;
	var enable_status_message = bbb.user.enable_status_message;
	var resize_link_style = bbb.user.resize_link_style;
	var override_blacklist = bbb.user.override_blacklist;
	var override_resize = bbb.user.override_resize;
	var override_sample = bbb.user.override_sample;
	var disable_tagged_filenames = bbb.user.disable_tagged_filenames;
	var track_new = bbb.user.track_new;

	var add_popular_link = bbb.user.add_popular_link;
	var add_random_post_link = bbb.user.add_random_post_link;
	var hide_fav_button = bbb.user.hide_fav_button;
	var show_resized_notice = bbb.user.show_resized_notice;
	var hide_sign_up_notice = bbb.user.hide_sign_up_notice;
	var hide_upgrade_notice = bbb.user.hide_upgrade_notice;
	var minimize_status_notices = bbb.user.minimize_status_notices;
	var move_relation_notices = bbb.user.move_relation_notices;
	var hide_tos_notice = bbb.user.hide_tos_notice;
	var hide_comment_notice = bbb.user.hide_comment_notice;
	var hide_tag_notice = bbb.user.hide_tag_notice;
	var hide_upload_notice = bbb.user.hide_upload_notice;
	var hide_pool_notice = bbb.user.hide_pool_notice;
	var hide_ban_notice = bbb.user.hide_ban_notice;
	var hide_hidden_notice = bbb.user.hide_hidden_notice;

	// Search
	var search_add = bbb.user.search_add;
	var search_tag_scrollbars = bbb.user.search_tag_scrollbars;
	var thumbnail_count = bbb.user.thumbnail_count;
	var thumbnail_count_default = (isGoldLevel() ? bbb.user.thumbnail_count_default : 20);

	// Post
	var alternate_image_swap = bbb.user.alternate_image_swap;
	var post_resize = accountSettingCheck("post_resize");
	var post_resize_mode = bbb.user.post_resize_mode;
	var post_drag_scroll = bbb.user.post_drag_scroll;
	var load_sample_first = accountSettingCheck("load_sample_first");
	var remove_tag_headers = bbb.user.remove_tag_headers;
	var post_tag_scrollbars = bbb.user.post_tag_scrollbars;
	var post_tag_titles = bbb.user.post_tag_titles;
	var autoscroll_post = bbb.user.autoscroll_post;
	var image_swap_mode = bbb.user.image_swap_mode;
	var disable_embedded_notes = bbb.user.disable_embedded_notes;
	var video_autoplay = bbb.user.video_autoplay;
	var video_controls = bbb.user.video_controls;
	var video_loop = bbb.user.video_loop;
	var video_volume = bbb.user.video_volume;

	// Endless
	var endless_default = bbb.user.endless_default;
	var endless_fill = bbb.user.endless_fill;
	var endless_pause_interval = bbb.user.endless_pause_interval;
	var endless_preload = bbb.user.endless_preload;
	var endless_remove_dup = bbb.user.endless_remove_dup;
	var endless_scroll_limit = bbb.user.endless_scroll_limit;
	var endless_separator = bbb.user.endless_separator;
	var endless_session_toggle = bbb.user.endless_session_toggle;

	// Stored data
	var status_borders = bbb.user.status_borders;
	var tag_borders = bbb.user.tag_borders;
	var collapse_sidebar_data = bbb.user.collapse_sidebar_data;
	var tag_groups = bbb.user.tag_groups;
	var track_new_data = bbb.user.track_new_data;
	var video_volume_data = bbb.user.video_volume_data;
	var script_blacklisted_tags = accountSettingCheck("script_blacklisted_tags");

	// Other data
	var bbbHiddenImg = "data:image/png;base64,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";
	var bbbBlacklistImg = "data:image/png;base64,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";
	var bbbBlacklistIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAAkFBMVEUAAAD////////////////////////////////////////////////////////////////p6en////////////////////////////////////////////////////////+/v7///////////////////////////////////////////////////////////97JICZAAAAL3RSTlMACAQBoUSi5QcnMfmnsMW9VQno+vjsxrwstPyzMhOpSxS65vX06czqQf7NvqbzQKZY7GsAAADASURBVHhefZDnDoJAEITn8Kh3FAEFQbH3Mu//doaNLSFxfn7J7hT80cgJlAqc0S8bu55P+p47/rJQ8yUdflhCHq/WpjmZvKjSPPOyBFbZlNRKPFySzTaOANQJ6fZujsf9YUcjNMvpOQACn+kyLmjaObBI6QcAFGkRxYblLAIsqd4Q0ayUDzeBcr4A5q2h6U5Vfy5GeQbIh8l6I0YSKal72k3uhUSS8OQ0WwGPddFQq2/NPLW22rxrDgcZTvd35KGevk8VfmeGhUQAAAAASUVORK5CYII=";

	/* "INIT" */
	modifyDanbScript();

	customCSS(); // Contains the portions related to notices.

	thumbInfo();

	addPopularLink();

	removeTagHeaders();

	searchAdd();

	minimizeStatusNotices();

	postTagTitles();

	trackNew();

	injectSettings();

	accountUpdateWatch();

	modifyPage();

	autohideSidebar();

	pageCounter();

	quickSearch();

	postLinkNewWindow();

	commentScoreInit();

	postLinkQuery();

	postDDL();

	fixLimit();

	bbbHotkeys();

	endlessInit();

	delayMe(formatThumbnails); // Delayed to allow Danbooru to run first.

	delayMe(blacklistInit); // Delayed to allow Danbooru to run first.

	delayMe(fixedSidebar); // Delayed to allow Danbooru layout to finalize.

	delayMe(collapseSidebar); // Delayed to allow Danbooru layout to finalize.

	delayMe(fixedPaginator); // Delayed to allow Danbooru layout to finalize.

	/* Functions */

	/* Functions for XML API info */
	function searchJSON(mode, optArg) {
		// Figure out the desired URL for a JSON API request, trigger any necessary xml flag, and update the status message.
		var url = location.href.split("#", 1)[0];
		var idCache, idList, idSearch, page; // If/else variables.

		if (mode === "search" || mode === "favorites") {
			url = (allowUserLimit() ? updateURLQuery(url, {limit: thumbnail_count}) : url);
			bbb.flags.thumbs_xml = true;

			if (mode === "search")
				fetchJSON(url.replace(/\/?(?:posts)?\/?(?:\?|$)/, "/posts.json?"), "search");
			else if (mode === "favorites")
				fetchJSON(url.replace(/\/favorites\/?(?:\?|$)/, "/favorites.json?"), "favorites");

			bbbStatus("posts", "new");
		}
		else if (mode === "popular" || mode === "popular_view") {
			bbb.flags.thumbs_xml = true;

			fetchJSON(url.replace(/\/(popular_view|popular)\/?/, "/$1.json"), mode);
			bbbStatus("posts", "new");
		}
		else if (mode === "pool" || mode === "favorite_group") {
			idCache = getIdCache();
			bbb.flags.thumbs_xml = true;

			if (idCache)
				searchJSON(mode + "_search", {post_ids: idCache});
			else // Get a new cache.
				fetchJSON(url.replace(/\/(pools|favorite_groups)\/(\d+)/, "/$1/$2.json"), mode + "_cache", mode + "_search");

			bbbStatus("posts", "new");
		}
		else if (mode === "pool_search" || mode === "favorite_group_search") {
			page = Number(getVar("page")) || 1;
			idList = optArg.post_ids.split(" ");
			idSearch = idList.slice((page - 1) * thumbnail_count_default, page * thumbnail_count_default);

			fetchJSON("/posts.json?tags=status:any+id:" + idSearch.join(","), mode, idSearch);
		}
		else if (mode === "endless") {
			bbb.flags.endless_xml = true;

			if (gLoc === "pool" || gLoc === "favorite_group") {
				idCache = getIdCache();

				if (idCache)
					searchJSON("endless_" + gLoc + "_search", {post_ids: idCache});
				else // Get a new cache.
					fetchJSON(url.replace(/\/(pools|favorite_groups)\/(\d+)/, "/$1/$2.json"), gLoc + "_cache", "endless_" + gLoc + "_search");
			}
			else {
				url = endlessNexURL();

				fetchJSON(url.replace(/(\?)|$/, ".json$1"), "endless");
			}

			bbbStatus("posts", "new");
		}
		else if (mode === "endless_pool_search" || mode === "endless_favorite_group_search") {
			idList = optArg.post_ids.split(" ");
			page = Number(getVar("page", endlessNexURL())); // If a pool gets over 1000 pages, I have no idea what happens for regular users. Biggest pool is currently around 400 pages so we won't worry about that for the time being.
			idSearch = idList.slice((page - 1) * thumbnail_count_default, page * thumbnail_count_default);

			fetchJSON("/posts.json?tags=status:any+id:" + idSearch.join(","), "endless", idSearch);
		}
		else if (mode === "comments") {
			fetchJSON(url.replace(/\/comments\/?/, "/comments.json"), "comments");
			bbbStatus("posts", "new");
		}
		else if (mode === "parent" || mode === "child") {
			var parentUrl = "/posts.json?limit=200&tags=status:any+parent:" + optArg;

			fetchJSON(parentUrl, mode, optArg);
			bbbStatus("posts", "new");
		}
	}

	function fetchJSON(url, mode, optArg, session, retries) {
		// Retrieve JSON.
		var xmlhttp = new XMLHttpRequest();
		var xmlRetries = retries || 0;
		var xmlSession = session || bbb.session;

		if (xmlhttp !== null) {
			xmlhttp.onreadystatechange = function() {
				if (xmlSession !== bbb.session) // If we end up receiving an xml response from a different page, reject it.
					xmlhttp.abort();
				else if (xmlhttp.readyState === 4) { // 4 = "loaded"
					if (xmlhttp.status === 200) { // 200 = "OK"
						var xml = parseJson(xmlhttp.responseText, {});

						// Update status message.
						if (mode === "search" || mode === "popular" || mode === "popular_view" || mode === "favorites" || mode === "pool_search" || mode === "favorite_group_search") {
							bbb.flags.thumbs_xml = false;

							parseListing(formatInfoArray(xml), optArg);
						}
						else if (mode === "pool_cache" || mode === "favorite_group_cache") {
							var collId = location.href.match(/\/(?:pools|favorite_groups)\/(\d+)/)[1];

							xml.post_ids = xml.post_ids.join(" ");
							sessionStorage.bbbSetItem("bbb_" + mode + "_" + collId, new Date().getTime() + " " + xml.post_ids);
							searchJSON(optArg, xml);
						}
						else if (mode === "endless") {
							bbb.flags.endless_xml = false;

							endlessXMLJSONHandler(formatInfoArray(xml), optArg);
						}
						else if (mode === "comments")
							parseComments(formatInfoArray(xml));
						else if (mode === "parent" || mode === "child")
							parseRelations(formatInfoArray(xml), mode, optArg);

						if (mode !== "pool_cache" && mode !== "favorite_group_cache")
							bbbStatus("posts", "done");
					}
					else {
						if (xmlhttp.status === 403 || xmlhttp.status === 401) {
							bbbNotice('Error retrieving post information. Access denied. You must be logged in to a Danbooru account to access the API for hidden image information and direct downloads. <br><span style="font-size: smaller;">(<span><a href="#" id="bbb-bypass-api-link">Do not warn me again and automatically bypass API features in the future.</a></span>)</span>', -1);
							document.getElementById("bbb-bypass-api-link").addEventListener("click", function(event) {
								if (event.button !== 0)
									return;

								updateSettings("bypass_api", true);
								this.parentNode.innerHTML = "Settings updated. You may change this setting under the preferences tab in the settings panel.";
								event.preventDefault();
							}, false);
							bbbStatus("posts", "error");
						}
						else if (xmlhttp.status === 421) {
							bbbNotice("Error retrieving post information. Your Danbooru API access is currently throttled. Please try again later.", -1);
							bbbStatus("posts", "error");
						}
						else if (!bbb.flags.unloading) {
							if (xmlhttp.status !== 0 && xmlRetries < 1) {
								xmlRetries++;
								fetchJSON(url, mode, optArg, xmlSession, xmlRetries);
							}
							else {
								var linkId = uniqueIdNum(); // Create a unique ID.
								var noticeMsg = bbbNotice('Error retrieving post information (JSON Code: ' + xmlhttp.status + ' ' + xmlhttp.statusText + '). ' + (xmlhttp.status === 0 ? 'The connection was unexpectedly cancelled or timed out. ' : '') + '(<a id="' + linkId + '" href="#">Retry</a>)', -1);

								bbbStatus("posts", "error");

								document.getElementById(linkId).addEventListener("click", function(event) {
									if (event.button !== 0)
										return;

									closeBbbNoticeMsg(noticeMsg);
									searchJSON(mode, optArg);
									event.preventDefault();
								}, false);
							}
						}
					}
				}
			};
			xmlhttp.open("GET", url, true);
			xmlhttp.timeout = 120000;
			xmlhttp.send(null);
		}
	}

	function parseListing(xml, optArg) {
		// Use JSON results for thumbnail listings.
		var posts = xml;
		var orderedIds = (gLoc === "pool" || gLoc === "favorite_group" ? optArg : undefined);

		if (!posts[0])
			return;

		// Thumb preparation.
		var newThumbs = createThumbListing(posts, orderedIds);

		// Update the existing thumbnails with new ones.
		updateThumbListing(newThumbs);

		// Fix the paginator. The paginator isn't always in the new container, so run this on the whole page after the new container is inserted.
		fixPaginator();

		// Update the URL with the limit value.
		fixURLLimit();
	}

	function parsePost() {
		// Take a post's info and alter its page.
		var postInfo = bbb.post.info = document.bbbInfo();
		var imgContainer = document.getElementById("image-container");

		if (!imgContainer || !postInfo) {
			bbbNotice("Post content could not be located.", -1);
			return;
		}

		if (!postInfo.file_url || safebPostTest(postInfo)) { // Modify everything except the post content if we're on Safebooru and the image isn't safe or if the image is hidden.
			// Enable the "Toggle Notes", "Random Post", and "Find similar" options for logged out users.
			fixOptionsSection();

			// Add the random post link.
			addRandomPostLink();

			// Replace the "resize to window" link with new resize links.
			modifyResizeLink();

			// Auto position the content if desired.
			autoscrollPost();

			// Blacklist.
			blacklistUpdate();

			// Fix the parent/child notice(s).
			checkRelations();
		}
		else {
			// Enable the "Toggle Notes", "Random Post", and "Find similar" options for logged out users.
			fixOptionsSection();

			// Fix the post links in the sidebar.
			fixPostDownloadLinks();

			// Add the random post link.
			addRandomPostLink();

			// Replace the "resize to window" link with new resize links.
			modifyResizeLink();

			// Keep any original video from continuing to play/download after being removed.
			var origVideo = imgContainer.getElementsByTagName("video")[0];

			if (origVideo) {
				origVideo.pause();
				origVideo.src = "about:blank";
				origVideo.load();
			}

			// Create content.
			if (postInfo.file_ext === "swf") // Create flash object.
				imgContainer.innerHTML = '<div id="note-container"></div> <div id="note-preview"></div> <object height="' + postInfo.image_height + '" width="' + postInfo.image_width + '"> <params name="movie" value="' + postInfo.file_img_src + '"> <embed allowscriptaccess="never" src="' + postInfo.file_img_src + '" height="' + postInfo.image_height + '" width="' + postInfo.image_width + '"> </params> </object> <p><a href="' + postInfo.file_img_src + '">Save this flash (right click and save)</a></p>';
			else if (postInfo.file_ext === "webm" || postInfo.file_ext === "mp4") { // Create video
				var playerControls = (video_controls ? ' controls="controls" ' : '');
				var playerLoop = (video_loop === "on" || (!postInfo.has_sound && video_loop === "nosound") ? ' loop="loop" ' : '');
				var playerAutoplay = (video_autoplay === "on" || (!postInfo.has_sound && video_autoplay === "nosound") ? ' autoplay="autoplay" ' : '');

				imgContainer.innerHTML = '<div id="note-container"></div> <div id="note-preview"></div> <video id="image"' + playerAutoplay + playerLoop + playerControls + 'src="' + postInfo.file_img_src + '" height="' + postInfo.image_height + '" width="' + postInfo.image_width + '"></video> <p><a href="' + postInfo.file_img_src + '">Save this video (right click and save)</a></p>';

				videoVolume();
			}
			else if (postInfo.file_ext === "zip" && /(?:^|\s)ugoira(?:$|\s)/.test(postInfo.tag_string)) { // Create ugoira
				var useUgoiraOrig = getVar("original");

				// Get rid of all the old events handlers.
				if (Danbooru.Ugoira && Danbooru.Ugoira.player)
					$(Danbooru.Ugoira.player).unbind();

				if ((load_sample_first && useUgoiraOrig !== "1") || useUgoiraOrig === "0") { // Load sample webm version.
					imgContainer.innerHTML = '<div id="note-container"></div> <div id="note-preview"></div> <video id="image" autoplay="autoplay" loop="loop" controls="controls" src="' + postInfo.large_file_img_src + '" height="' + postInfo.image_height + '" width="' + postInfo.image_width + '" data-fav-count="' + postInfo.fav_count + '" data-flags="' + postInfo.flags + '" data-has-active-children="' + postInfo.has_active_children + '" data-has-children="' + postInfo.has_children + '" data-large-height="' + postInfo.large_height + '" data-large-width="' + postInfo.large_width + '" data-original-height="' + postInfo.image_height + '" data-original-width="' + postInfo.image_width + '" data-rating="' + postInfo.rating + '" data-score="' + postInfo.score + '" data-tags="' + postInfo.tag_string + '" data-pools="' + postInfo.pool_string + '" data-uploader="' + postInfo.uploader_name + '"></video> <p><a href="' + postInfo.large_file_img_src + '">Save this video (right click and save)</a> | <a href="' + updateURLQuery(location.href, {original: "1"}) + '">View original</a> | <a href="#" id="bbb-note-toggle">Toggle notes</a></p>';

					// Prep the "toggle notes" link.
					noteToggleLinkInit();
				}
				else { // Load original ugoira version.
					imgContainer.innerHTML = '<div id="note-container"></div> <div id="note-preview"></div> <canvas data-ugoira-content-type="' + postInfo.pixiv_ugoira_frame_data.content_type.replace(/"/g, "&quot;") + '" data-ugoira-frames="' + JSON.stringify(postInfo.pixiv_ugoira_frame_data.data).replace(/"/g, "&quot;") + '" data-fav-count="' + postInfo.fav_count + '" data-flags="' + postInfo.flags + '" data-has-active-children="' + postInfo.has_active_children + '" data-has-children="' + postInfo.has_children + '" data-large-height="' + postInfo.image_height + '" data-large-width="' + postInfo.image_width + '" data-original-height="' + postInfo.image_height + '" data-original-width="' + postInfo.image_width + '" data-rating="' + postInfo.rating + '" data-score="' + postInfo.score + '" data-tags="' + postInfo.tag_string + '" data-pools="' + postInfo.pool_string + '" data-uploader="' + postInfo.uploader_name + '" height="' + postInfo.image_height + '" width="' + postInfo.image_width + '" id="image"></canvas> <div id="ugoira-controls"> <div id="ugoira-control-panel" style="width: ' + postInfo.image_width + 'px; min-width: 350px;"> <button id="ugoira-play" name="button" style="display: none;" type="submit">Play</button> <button id="ugoira-pause" name="button" type="submit">Pause</button> <div id="seek-slider" style="width: ' + (postInfo.image_width - 81) + 'px; min-width: 269px;"></div> </div> <p id="save-video-link"><a href="' + postInfo.large_file_img_src + '">Save as video (right click and save)</a> | <a href="' + updateURLQuery(location.href, {original: "0"}) + '">View sample</a> | <a href="#" id="bbb-note-toggle">Toggle notes</a></p> </div>';

					// Make notes toggle when clicking the ugoira animation.
					noteToggleInit();

					// Prep the "toggle notes" link. The "toggle notes" link is added here just for consistency's sake.
					noteToggleLinkInit();

					if (postInfo.pixiv_ugoira_frame_data.data && Danbooru.Ugoira && Danbooru.Ugoira.create_player) // Set up the post.
						Danbooru.Ugoira.create_player(postInfo.pixiv_ugoira_frame_data.content_type, postInfo.pixiv_ugoira_frame_data.data, postInfo.file_url);
				}
			}
			else if (!postInfo.image_height) // Create manual download.
				imgContainer.innerHTML = '<div id="note-container"></div> <div id="note-preview"></div><p><a href="' + postInfo.file_img_src + '">Save this file (right click and save)</a></p>';
			else { // Create image
				var newWidth, newHeight, newUrl; // If/else variables.

				if (load_sample_first && postInfo.has_large) {
					newWidth = postInfo.large_width;
					newHeight = postInfo.large_height;
					newUrl = postInfo.large_file_img_src;
				}
				else {
					newWidth = postInfo.image_width;
					newHeight = postInfo.image_height;
					newUrl = postInfo.file_img_src;
				}

				imgContainer.innerHTML = '<div id="note-container"></div> <div id="note-preview"></div> <img alt="' + postInfo.tag_string_desc + '" data-fav-count="' + postInfo.fav_count + '" data-flags="' + postInfo.flags + '" data-has-active-children="' + postInfo.has_active_children + '" data-has-children="' + postInfo.has_children + '" data-large-height="' + postInfo.large_height + '" data-large-width="' + postInfo.large_width + '" data-original-height="' + postInfo.image_height + '" data-original-width="' + postInfo.image_width + '" data-rating="' + postInfo.rating + '" data-score="' + postInfo.score + '" data-tags="' + postInfo.tag_string + '" data-pools="' + postInfo.pool_string + '" data-uploader="' + postInfo.uploader_name + '" height="' + newHeight + '" width="' + newWidth + '" id="image" src="' + newUrl + '" /> <img src="about:blank" height="1" width="1" id="bbb-loader" style="position: absolute; right: 0px; top: 0px; display: none;" />';

				bbb.el.bbbLoader = document.getElementById("bbb-loader");

				// Create/replace the elements related to image swapping and set them up.
				swapImageInit();

				if (alternate_image_swap) // Make sample/original images swap when clicking the image.
					alternateImageSwap();
				else // Make notes toggle when clicking the image.
					noteToggleInit();
			}

			// Enable drag scrolling.
			dragScrollInit();

			// Resize the content if desired.
			if (post_resize)
				resizePost(post_resize_mode);

			// Enable translation mode.
			translationModeInit();

			// Disable embedded notes.
			disableEmbeddedNotes();

			// Load/reload notes.
			Danbooru.Note.load_all("bbb");

			// Auto position the content if desired.
			autoscrollPost();

			// Blacklist.
			blacklistUpdate();

			// Modify the parent/child notice(s) display.
			moveRelationNotices();

			// Fix the parent/child notice(s).
			checkRelations();
		}
	}

	function parseComments(xml) {
		// Fix missing comments by inserting them into their appropriate position.
		var postsInfo = xml;
		var numPosts = postsInfo.length;
		var expectedPosts = numPosts;
		var existingPosts = getPosts();
		var eci = 0;

		for (var i = 0; i < numPosts; i++) {
			var postInfo = postsInfo[i];
			var existingPost = existingPosts[eci];

			if (!existingPost || String(postInfo.id) !== existingPost.bbbInfo("id")) {
				if (!/(?:^|\s)(?:loli|shota|toddlercon)(?:$|\s)/.test(postInfo.tag_string) && !postInfo.is_banned) // API post isn't hidden and doesn't exist on the page. Skip it and try to find where the page's info matches up.
					continue;
				else if ((!show_loli && /(?:^|\s)loli(?:$|\s)/.test(postInfo.tag_string)) || (!show_shota && /(?:^|\s)shota(?:$|\s)/.test(postInfo.tag_string)) || (!show_toddlercon && /(?:^|\s)toddlercon(?:$|\s)/.test(postInfo.tag_string)) || (!show_banned && postInfo.is_banned) || safebPostTest(postInfo)) { // Skip hidden posts if the user has selected to do so.
					expectedPosts--;
					continue;
				}

				// Prepare the post information.
				var tagLinks = postInfo.tag_string.bbbSpacePad();
				var generalTags = postInfo.tag_string_general.split(" ");
				var artistTags = postInfo.tag_string_artist.split(" ");
				var copyrightTags = postInfo.tag_string_copyright.split(" ");
				var characterTags = postInfo.tag_string_character.split(" ");
				var metaTags = postInfo.tag_string_meta.split(" ");
				var limit = (thumbnail_count ? "&limit=" + thumbnail_count : "");
				var j, jl, tag; // Loop variables.

				for (j = 0, jl = generalTags.length; j < jl; j++) {
					tag = generalTags[j];
					tagLinks = tagLinks.replace(tag.bbbSpacePad(), ' <span class="category-0"> <a href="/posts?tags=' + encodeURIComponent(tag) + limit + '">' + tag.replace(/_/g, " ") + '</a> </span> ');
				}

				for (j = 0, jl = artistTags.length; j < jl; j++) {
					tag = artistTags[j];
					tagLinks = tagLinks.replace(tag.bbbSpacePad(), ' <span class="category-1"> <a href="/posts?tags=' + encodeURIComponent(tag) + limit + '">' + tag.replace(/_/g, " ") + '</a> </span> ');
				}

				for (j = 0, jl = copyrightTags.length; j < jl; j++) {
					tag = copyrightTags[j];
					tagLinks = tagLinks.replace(tag.bbbSpacePad(), ' <span class="category-3"> <a href="/posts?tags=' + encodeURIComponent(tag) + limit + '">' + tag.replace(/_/g, " ") + '</a> </span> ');
				}

				for (j = 0, jl = characterTags.length; j < jl; j++) {
					tag = characterTags[j];
					tagLinks = tagLinks.replace(tag.bbbSpacePad(), ' <span class="category-4"> <a href="/posts?tags=' + encodeURIComponent(tag) + limit + '">' + tag.replace(/_/g, " ") + '</a> </span> ');
				}

				for (j = 0, jl = metaTags.length; j < jl; j++) {
					tag = metaTags[j];
					tagLinks = tagLinks.replace(tag.bbbSpacePad(), ' <span class="category-5"> <a href="/posts?tags=' + encodeURIComponent(tag) + limit + '">' + tag.replace(/_/g, " ") + '</a> </span> ');
				}

				// Create the new post.
				var childSpan = document.createElement("span");

				childSpan.innerHTML = '<div id="post_' + postInfo.id + '" class="post post-preview' + postInfo.thumb_class + '" data-tags="' + postInfo.tag_string + '" data-pools="' + postInfo.pool_string + '" data-uploader="' + postInfo.uploader_name + '" data-rating="' + postInfo.rating + '" data-flags="' + postInfo.flags + '" data-score="' + postInfo.score + '" data-parent-id="' + postInfo.parent_id + '" data-has-children="' + postInfo.has_children + '" data-id="' + postInfo.id + '" data-has-sound="' + postInfo.has_sound + '" data-width="' + postInfo.image_width + '" data-height="' + postInfo.image_height + '" data-approver-id="' + postInfo.approver_id + '" data-fav-count="' + postInfo.fav_count + '" data-pixiv-id="' + postInfo.pixiv_id + '" data-md5="' + postInfo.md5 + '" data-file-ext="' + postInfo.file_ext + '" data-file-url="' + postInfo.file_url + '" data-large-file-url="' + postInfo.large_file_url + '" data-preview-file-url="' + postInfo.preview_file_url + '"> <div class="preview"> <a href="/posts/' + postInfo.id + '"> <img src="' + postInfo.preview_img_src + '" /> </a> </div> <div class="comments-for-post" data-post-id="' + postInfo.id + '"> <div class="header"> <div class="row"> <span class="info"> <strong>Date</strong> <time datetime="' + postInfo.created_at + '" title="' + postInfo.created_at.replace(/(.+)T(.+)\..+-(.+)/, "$1 $2 -$3") + '">' + postInfo.created_at.replace(/(.+)T(.+):.+-.+/, "$1 $2") + '</time> </span> <span class="info"> <strong>Rating</strong> ' + postInfo.rating + ' </span> <span class="info"> <strong>Score</strong> <span> <span id="score-for-post-' + postInfo.id + '">' + postInfo.score + '</span> </span> </span> </div> <div class="row list-of-tags"> <strong>Tags</strong>' + tagLinks + '</div> </div> </div> <div class="clearfix"></div> </div>';

				// Prepare thumbnails.
				prepThumbnails(childSpan);

				if (!existingPost) // There isn't a next post so append the new post to the end before the paginator.
					document.getElementById("a-index").insertBefore(childSpan.firstElementChild, getPaginator());
				else // Insert new post before the post that should follow it.
					existingPost.parentNode.insertBefore(childSpan.firstElementChild, existingPost);

				// Get the comments and image info.
				searchPages("post_comments", postInfo.id);
			}

			eci++;
		}

		// If we don't have the expected number of posts, the API info and page are too out of sync. (Message disabled to work around deleted comments until an accurate method is worked out.)
		// if (existingPosts.length !== expectedPosts)
			// bbbNotice("Loading of hidden post(s) failed. Please refresh.", -1);
	}

	function parseRelations(xml, mode, parentId) {
		// Create a new parent/child notice.
		var posts = xml;
		var activePost = bbb.post.info;
		var numPosts = posts.length;
		var relationCookie = getCookie()["show-relationship-previews"];
		var showPreview = (relationCookie === undefined || relationCookie === "1");
		var childSpan = document.createElement("span");
		var query = "?tags=parent:" + parentId + (show_deleted ? "+status:any" : "") + (thumbnail_count ? "&limit=" + thumbnail_count : "");
		var thumbs = "";
		var forceShowDeleted = activePost.is_deleted; // If the parent is deleted or the active post is deleted, all deleted posts are shown.
		var parentDeleted = false;
		var isSafebooru = (location.host.indexOf("safebooru") > -1);
		var target, previewLinkId, previewLinkTxt, previewId, classes, msg, displayStyle; // If/else variables.
		var i, post; // Loop variables.

		// Figure out if the parent is deleted.
		for (i = 0; i < numPosts; i++) {
			post = posts[i];

			if (post.id === parentId) {
				parentDeleted = post.is_deleted;
				forceShowDeleted = forceShowDeleted || parentDeleted;
			}
		}

		// Set up the notice variables.
		if (showPreview) {
			previewLinkTxt = "&laquo; hide";
			displayStyle = "block";
		}
		else {
			previewLinkTxt = "show &raquo;";
			displayStyle = "none";
		}

		if (mode === "child") {
			target = document.getElementsByClassName("notice-child")[0];
			previewLinkId = "has-parent-relationship-preview-link";
			previewId = "has-parent-relationship-preview";
			classes = "notice-child";

			if (!isSafebooru) {
				if (numPosts)
					msg = 'This post belongs to a <a href="/posts' + query + '">parent</a>' + (parentDeleted ? " (deleted)" : "");

				if (numPosts === 3)
					msg += ' and has <a href="/posts' + query + '">a sibling</a>';
				else if (numPosts > 3)
					msg += ' and has <a href="/posts' + query + '">' + (numPosts - 2) + ' siblings</a>';
			}
			else {
				var parentNotSafe = true;

				for (i = 0; i < numPosts; i++) {
					if (posts[i].id === parentId)
						parentNotSafe = false;
				}

				var siblingLimit = (parentNotSafe ? 2 : 3);

				if (numPosts)
					msg = 'This post belongs to a <a href="/posts' + query + '">parent</a>' + (parentNotSafe ? " (not safe)" : (parentDeleted ? " (deleted)" : ""));

				if (numPosts === siblingLimit)
					msg += ' and has <a href="/posts' + query + '">a sibling</a>';
				else if (numPosts > siblingLimit)
					msg += ' and has <a href="/posts' + query + '">' + (numPosts - 2) + ' siblings</a>';
			}
		}
		else if (mode === "parent") {
			target = document.getElementsByClassName("notice-parent")[0];
			previewLinkId = "has-children-relationship-preview-link";
			previewId = "has-children-relationship-preview";
			classes = "notice-parent";

			if (!isSafebooru) {
				if (numPosts === 2)
					msg = 'This post has <a href="/posts' + query + '">a child</a>';
				else if (numPosts > 2)
					msg = 'This post has <a href="/posts' + query + '">' + (numPosts - 1) + ' children</a>';
			}
			else {
				if (numPosts === 1)
					msg = 'This post has no safe <a href="/posts' + query + '">children</a>';
				else if (numPosts === 2)
					msg = 'This post has <a href="/posts' + query + '">a child</a>';
				else if (numPosts > 2)
					msg = 'This post has <a href="/posts' + query + '">' + (numPosts - 1) + ' children</a>';
			}
		}

		// Create the main notice element.
		childSpan.innerHTML = '<div class="ui-corner-all ui-state-highlight notice ' + classes + '"> ' + msg + ' (<a href="/wiki_pages?title=help%3Apost_relationships">learn more</a>) <a href="#" id="' + previewLinkId + '">' + previewLinkTxt + '</a> <div id="' + previewId + '" style="display: ' + displayStyle + ';"> </div> </div>';

		var newNotice = childSpan.firstElementChild;
		var thumbDiv = getId(previewId, newNotice);
		var previewLink = getId(previewLinkId, newNotice);

		// Create the thumbnails.
		for (i = numPosts - 1; i >= 0; i--) {
			post = posts[i];

			if ((!show_loli && /(?:^|\s)loli(?:$|\s)/.test(post.tag_string)) || (!show_shota && /(?:^|\s)shota(?:$|\s)/.test(post.tag_string)) || (!show_toddlercon && /(?:^|\s)toddlercon(?:$|\s)/.test(post.tag_string)) || (!show_deleted && post.is_deleted && !forceShowDeleted) || (!show_banned && post.is_banned) || safebPostTest(post))
				continue;

			var thumb = createThumbHTML(post, (clean_links ? "" : query)) + " ";

			if (post.id === parentId)
				thumbs = thumb + thumbs;
			else
				thumbs += thumb;
		}

		thumbDiv.innerHTML = thumbs;

		// Highlight the post we're on.
		var activeThumb = getId("post_" + activePost.id, thumbDiv);

		if (activeThumb)
			activeThumb.bbbAddClass("current-post");

		// Make the show/hide links work.
		previewLink.bbbOverrideClick(function(event) {
			if (thumbDiv.style.display === "block") {
				thumbDiv.style.display = "none";
				previewLink.innerHTML = "show &raquo;";
				createCookie("show-relationship-previews", 0, 365);
			}
			else {
				thumbDiv.style.display = "block";
				previewLink.innerHTML = "&laquo; hide";
				createCookie("show-relationship-previews", 1, 365);
			}

			event.preventDefault();
		});

		// Prepare thumbnails.
		prepThumbnails(newNotice);

		// Replace/add the notice.
		if (target)
			target.parentNode.replaceChild(newNotice, target);
		else if (mode === "child") {
			target = document.getElementsByClassName("notice-parent")[0] || bbb.el.resizeNotice || document.getElementById("image-container");
			target.parentNode.insertBefore(newNotice, target);
		}
		else if (mode === "parent") {
			target = bbb.el.resizeNotice || document.getElementById("image-container");
			target.parentNode.insertBefore(newNotice, target);
		}

		moveRelationNotices();
	}

	function endlessXMLJSONHandler(xml, optArg) {
		// Create a thumbnail listing from JSON results and pass it to the queue.
		var orderedIds = optArg;
		var posts = createThumbListing(xml, orderedIds);
		var newPage = document.createElement("div");
		newPage.className = "bbb-endless-page";

		newPage.appendChild(posts);
		endlessQueuePage(newPage);
	}

	/* Functions for XML page info */
	function searchPages(mode, optArg) {
		// Let other functions that don't require the API run (alternative to searchJSON) and retrieve various pages for info.
		var url; // If/else variable.

		if (mode === "search" || mode === "favorites" || mode === "thumbnails") {
			url = updateURLQuery(location.href, {limit: thumbnail_count});
			bbb.flags.thumbs_xml = true;

			fetchPages(url, "thumbnails");
			bbbStatus("posts", "new");
		}
		else if (mode === "endless") {
			url = endlessNexURL();
			bbb.flags.endless_xml = true;

			fetchPages(url, "endless");
			bbbStatus("posts", "new");
		}
		else if (mode === "paginator") {
			url = (allowUserLimit() ? updateURLQuery(location.href, {limit: thumbnail_count}) : location.href);
			bbb.flags.paginator_xml = true;

			fetchPages(url, "paginator");
		}
		else if (mode === "post_comments") {
			url = "/posts/" + optArg;

			fetchPages(url, "post_comments", optArg);
			bbbStatus("post_comments", "new");
		}
		else if (mode === "account_check") {
			url = "/users/" + optArg + "/edit";

			fetchPages(url, "account_check");
		}
	}

	function fetchPages(url, mode, optArg, session, retries) {
		// Retrieve an actual page for certain pieces of information.
		var xmlhttp = new XMLHttpRequest();
		var xmlRetries = retries || 0;
		var xmlSession = session || bbb.session;

		if (xmlhttp !== null) {
			xmlhttp.onreadystatechange = function() {
				if (xmlSession !== bbb.session) // If we end up receiving an xml response form a different page, reject it.
					xmlhttp.abort();
				else if (xmlhttp.readyState === 4) { // 4 = "loaded"
					if (xmlhttp.status === 200) { // 200 = "OK"
						var docEl = document.createElement("html");

						docEl.innerHTML = xmlhttp.responseText;

						if (mode === "paginator") {
							bbb.flags.paginator_xml = false;

							replacePaginator(docEl);
						}
						else if (mode === "post_comments") {
							replaceComments(docEl, optArg);
							bbbStatus("post_comments", "done");
						}
						else if (mode === "thumbnails") {
							bbb.flags.thumbs_xml = false;

							replaceThumbnails(docEl);
							bbbStatus("posts", "done");
						}
						else if (mode === "endless") {
							bbb.flags.endless_xml = false;

							endlessXMLPageHandler(docEl);
							bbbStatus("posts", "done");
						}
						else if (mode === "account_check")
							accountUpdateHandler(docEl);
					}
					else if (!bbb.flags.unloading) {
						if (xmlhttp.status !== 0 && xmlRetries < 1) {
							xmlRetries++;
							fetchPages(url, mode, optArg, xmlSession, xmlRetries);
						}
						else {
							var linkId = uniqueIdNum(); // Create a unique ID.
							var msg; // If/else variable.

							if (mode === "thumbnails" || mode === "endless") {
								msg = "Error retrieving post information";
								bbbStatus("posts", "error");
							}
							else if (mode === "post_comments") {
								msg = "Error retrieving comment information";
								bbbStatus("post_comments", "error");
							}
							else if (mode === "paginator")
								msg = "Error updating paginator";
							else if (mode === "account_check")
								msg = "Error checking account settings";

							var noticeMsg = bbbNotice(msg + ' (HTML Code: ' + xmlhttp.status + ' ' + xmlhttp.statusText + '). ' + (xmlhttp.status === 0 ? 'The connection was unexpectedly cancelled or timed out. ' : '') + '(<a id="' + linkId + '" href="#">Retry</a>)', -1);

							document.getElementById(linkId).addEventListener("click", function(event) {
								if (event.button !== 0)
									return;

								closeBbbNoticeMsg(noticeMsg);
								searchPages(mode, optArg);
								event.preventDefault();
							}, false);
						}
					}
				}
			};
			xmlhttp.open("GET", url, true);
			xmlhttp.timeout = 120000;
			xmlhttp.send(null);
		}
	}

	function replacePaginator(el) {
		// Replace the contents inside the paginator div so as to preserve the original div and any event listeners attached to it.
		var oldPag = getPaginator();
		var newPag = getPaginator(el);

		if (oldPag && newPag)
			oldPag.innerHTML = newPag.innerHTML;
	}

	function replaceComments(docEl, postId) {
		// Fix hidden comments with information from a post.
		var divId = "post_" + postId;
		var commentDiv = document.getElementById(divId);
		var commentSection = docEl.getElementsByClassName("comments-for-post")[0];
		var comments = commentSection.getElementsByClassName("comment");
		var numComments = comments.length;
		var toShow = 6; // Number of comments to display.
		var target = commentDiv.getElementsByClassName("comments-for-post")[0];
		var newContent = document.createDocumentFragment();

		// Fix the comments.
		if (numComments > toShow) {
			for (var i = 0, toHide = numComments - toShow; i < toHide; i++)
				comments[i].style.display = "none";

			commentSection.getElementsByClassName("row notices")[0].innerHTML = '<span class="info" id="threshold-comments-notice-for-' + postId + '"> <a href="/comments?include_below_threshold=true&amp;post_id=' + postId + '" data-remote="true">Show all comments</a> </span>';
		}

		// Add it all in and get it ready.
		while (commentSection.firstElementChild)
			newContent.appendChild(commentSection.firstElementChild);

		target.appendChild(newContent);

		Danbooru.Comment.initialize_all();
		$("#" + divId + " .simple_form .dtext-preview").hide();
		$("#" + divId + " .simple_form input[value=Preview]").click(Danbooru.Dtext.click_button);
	}

	function replaceThumbnails(docEl) {
		// Replace the thumbnails and paginator with new ones.
		// Thumb preparation.
		var newThumbs = document.createDocumentFragment();
		var newPosts = getPosts(docEl);

		for (var i = 0, il = newPosts.length; i < il; i++)
			newThumbs.appendChild(newPosts[i]);

		// Update the existing thumbnails with new ones.
		updateThumbListing(newThumbs);

		// Replace paginator with new paginator.
		replacePaginator(docEl);

		// Update the URL with the limit value.
		fixURLLimit();
	}

	function endlessXMLPageHandler(docEl) {
		// Take thumbnails from a page and pass them to the queue or retrieve hidden posts as necessary.
		bbb.endless.new_paginator = getPaginator(docEl);

		if (useAPI() && potentialHiddenPosts(gLoc, docEl))
			searchJSON("endless");
		else {
			var posts = getPosts(docEl);
			var newPage = document.createElement("div");
			newPage.className = "bbb-endless-page";

			for (var i = 0, il = posts.length; i < il; i++)
				newPage.appendChild(posts[i]);

			endlessQueuePage(newPage);
		}
	}

	function accountUpdateHandler(docEl) {
		// Check the user's settings page for changes and update BBB settings as needed.
		var perPageInput = docEl.querySelector("#user_per_page option[selected]");
		var perPage = Number((perPageInput ? perPageInput.value : 20));

		if (thumbnail_count_default !== perPage) {
			updateSettings("thumbnail_count_default", perPage);
			bbbNotice("Your \"thumbnail count default\" BBB setting has been automatically changed to \"" + perPage + "\" to match your Danbooru account settings.", 0);
		}

		createCookie("bbb_acc_check", 0, -1);
	}

	/* Functions for retrieving page info */
	function scrapePost(docEl) {
		// Retrieve info from the current document or a supplied element containing the HTML with it and return it as API styled info.
		var target = docEl || document;
		var postContent = getPostContent(target);
		var imgContainer = postContent.container;

		if (!imgContainer)
			return {};

		var postEl = postContent.el;
		var postTag = (postEl ? postEl.tagName : undefined);
		var flags = imgContainer.getAttribute("data-flags") || "";

		var imgInfo = {
			md5: imgContainer.getAttribute("data-md5") || "",
			file_ext: imgContainer.getAttribute("data-file-ext") || "",
			file_url: imgContainer.getAttribute("data-file-url") || "",
			large_file_url: imgContainer.getAttribute("data-large-file-url") || "",
			preview_file_url: imgContainer.getAttribute("data-preview-file-url") || "",
			has_large: undefined,
			id: Number(imgContainer.getAttribute("data-id")) || 0,
			pixiv_id: Number(imgContainer.getAttribute("data-pixiv-id")) || null,
			fav_count: Number(imgContainer.getAttribute("data-fav-count")) || 0,
			has_children: (imgContainer.getAttribute("data-has-children") === "true"),
			has_active_children: (postTag === "IMG" || postTag === "CANVAS" ? postEl.getAttribute("data-has-active-children") === "true" : !!target.getElementsByClassName("notice-parent")[0]),
			is_favorited: (imgContainer.getAttribute("data-is-favorited") === "true"),
			normalized_source: imgContainer.getAttribute("data-normalized-source") || "",
			parent_id: (imgContainer.getAttribute("data-parent-id") ? Number(imgContainer.getAttribute("data-parent-id")) : null),
			rating: imgContainer.getAttribute("data-rating") || "",
			score: Number(imgContainer.getAttribute("data-score")) || 0,
			source: imgContainer.getAttribute("data-source") || "",
			tag_string: imgContainer.getAttribute("data-tags") || "",
			tag_string_artist: scrapePostTags("artist", target),
			tag_string_character: scrapePostTags("character", target),
			tag_string_copyright: scrapePostTags("copyright", target),
			tag_string_general: scrapePostTags("general", target),
			tag_string_meta: scrapePostTags("meta", target),
			pool_string: imgContainer.getAttribute("data-pools") || "",
			uploader_name: imgContainer.getAttribute("data-uploader") || "",
			uploader_id: Number(imgContainer.getAttribute("data-uploader-id")) || 0,
			approver_id: imgContainer.getAttribute("data-approver-id") || null,
			is_deleted: (flags.indexOf("deleted") > -1),
			is_flagged: (flags.indexOf("flagged") > -1),
			is_pending: (flags.indexOf("pending") > -1),
			is_banned: (flags.indexOf("banned") > -1),
			image_height: Number(imgContainer.getAttribute("data-height")) || null,
			image_width: Number(imgContainer.getAttribute("data-width")) || null
		};

		imgInfo.keeper_data = {uid: Number(imgContainer.getAttribute("data-top-tagger")) || imgInfo.uploader_id || 0};
		imgInfo.has_large = (imgInfo.large_file_url !== imgInfo.file_url);

		// Grab any available Ugoira data.
		if (postTag === "CANVAS" || (imgInfo.file_ext === "zip" && /(?:^|\s)ugoira(?:$|\s)/.test(imgInfo.tag_string))) {
			imgInfo.pixiv_ugoira_frame_data = {
				id: undefined, // Don't have this value.
				post_id: imgInfo.id,
				data: (postTag === "CANVAS" ? parseJson(postEl.getAttribute("data-ugoira-frames"), []) : ""),
				content_type: (postTag === "CANVAS" ? postEl.getAttribute("data-ugoira-content-type").replace(/"/gi, "") : "")
			};
		}

		return formatInfo(imgInfo);
	}

	function scrapePostTags(category, docEl) {
		// Retrieve tag info by type from the current document or a supplied element containing the HTML with it.
		var target = docEl || document;
		var tagList = getId("tag-list", target);
		var categoryClass; // If/else variable.

		if (!tagList)
			return "";

		if (category === "copyright")
			categoryClass = "category-3";
		else if (category === "character")
			categoryClass = "category-4";
		else if (category === "artist")
			categoryClass = "category-1";
		else if (category === "general")
			categoryClass = "category-0";
		else if (category === "meta")
			categoryClass = "category-5";

		var categoryTags = tagList.getElementsByClassName(categoryClass);
		var categoryString = "";

		for (var i = 0, il = categoryTags.length; i < il; i++) {
			var tagItem = categoryTags[i];
			var tag = tagItem.getElementsByClassName("search-tag")[0];

			if (tag)
				categoryString += " " + tag.textContent.replace(/(\S)\s+(\S)/g, "$1_$2");
		}

		return categoryString.bbbSpaceClean();
	}

	function scrapeThumb(post) {
		// Retrieve info from a thumbnail and return it as API styled info. Mainly for remaking thumbnails.
		var flags = post.getAttribute("data-flags") || "";
		var imgInfo = {
			md5: post.getAttribute("data-md5") || "",
			file_ext: post.getAttribute("data-file-ext") || "",
			file_url: post.getAttribute("data-file-url") || "",
			large_file_url: post.getAttribute("data-large-file-url") || "",
			preview_file_url: post.getAttribute("data-preview-file-url") || "",
			file_url_desc: post.getAttribute("data-file-url-desc") || undefined,
			has_large: undefined,
			id: Number(post.getAttribute("data-id")) || 0,
			pixiv_id: Number(post.getAttribute("data-pixiv-id")) || null,
			fav_count: Number(post.getAttribute("data-fav-count")) || 0,
			has_children: (post.getAttribute("data-has-children") === "true"),
			has_active_children: post.bbbHasClass("post-status-has-children"), // Assumption. Basically a flag for the children class.
			is_favorited: (post.getAttribute("data-is-favorited") === "true"),
			normalized_source: post.getAttribute("data-normalized-source") || "",
			parent_id: (post.getAttribute("data-parent-id") ? Number(post.getAttribute("data-parent-id")) : null),
			rating: post.getAttribute("data-rating") || "",
			score: Number(post.getAttribute("data-score")) || 0,
			source: post.getAttribute("data-source") || "",
			tag_string: post.getAttribute("data-tags") || "",
			pool_string: post.getAttribute("data-pools") || "",
			uploader_name: post.getAttribute("data-uploader") || "",
			uploader_id: Number(post.getAttribute("data-uploader-id")) || 0,
			approver_id: post.getAttribute("data-approver-id") || null,
			is_deleted: (flags.indexOf("deleted") > -1),
			is_flagged: (flags.indexOf("flagged") > -1),
			is_pending: (flags.indexOf("pending") > -1),
			is_banned: (flags.indexOf("banned") > -1),
			image_height: Number(post.getAttribute("data-height")) || null,
			image_width: Number(post.getAttribute("data-width")) || null
		};

		imgInfo.keeper_data = {uid: Number(post.getAttribute("data-top-tagger")) || imgInfo.uploader_id || 0};

		if (imgInfo.file_url)
			imgInfo.has_large = (imgInfo.file_url !== imgInfo.large_file_url);
		else {
			var isUgoira = /(?:^|\s)ugoira(?:$|\s)/.test(imgInfo.tag_string);
			var isAnimatedImg = /(?:^|\s)animated_(?:gif|png)(?:$|\s)/.test(imgInfo.tag_string);
			var isVideo = /(?:^|\s)(?:webm|mp4)(?:$|\s)/.test(imgInfo.tag_string);
			var isFlash = /(?:^|\s)flash(?:$|\s)/.test(imgInfo.tag_string);
			var isBigImg = (imgInfo.image_width > 850 && !isFlash && !isVideo);

			imgInfo.has_large = (!isAnimatedImg && (isBigImg || isUgoira));
		}

		return formatInfo(imgInfo);
	}

	function getId(elId, target) {
		// Retrieve an element by ID from either the current document or an element containing it.
		if (!target || target === document)
			return document.getElementById(elId);
		else if (target.id === elId)
			return target;
		else
			return target.querySelector("#" + elId);

		return null;
	}

	function getPostContent(docEl) {
		// Retrieve the post content related elements.
		var target = docEl || document;
		var imgContainer = getId("image-container", target);

		if (!imgContainer)
			return {};

		var img = getId("image", target);
		var swfObj = imgContainer.getElementsByTagName("object")[0];
		var swfEmb = (swfObj ? swfObj.getElementsByTagName("embed")[0] : undefined);
		var video = imgContainer.getElementsByTagName("video")[0];
		var ugoira = imgContainer.getElementsByTagName("canvas")[0];
		var other = imgContainer.querySelector("a[href^='/data/']");
		var el = swfEmb || video || ugoira || img || other;
		var secondaryEl = swfObj; // Other elements related to the main element. Only applies to flash for now.

		return {container: imgContainer, el: el, secEl: secondaryEl};
	}

	function getInfoList(item) {
		// Retrieve the info list or a specific item from the info list.
		var infoSection = document.getElementById("post-information");
		var infoItems = (infoSection ? infoSection.getElementsByTagName("li") : []);
		var textRegex;
		var i, il; // Loop variables.

		if (!infoItems.length)
			return null;

		if (!item)
			return infoSection.getElementsByTagName("ul")[0];
		else if (item === "size")
			textRegex = /^\s*Size:/i;
		else if (item === "status")
			textRegex = /^\s*Status:/i;
		else if (item === "relations")
			textRegex = /^\s*Relations:/i;

		for (i = 0, il = infoItems.length; i < il; i++) {
			var infoItem = infoItems[i];

			if (textRegex.test(infoItem.textContent))
				return infoItem;
		}

		return null;
	}

	function getPosts(target) {
		// Return a list of posts depending from the document or a specific element.
		if (!target || target === document) // All posts in the document.
			return document.querySelectorAll(".post-preview");
		else if (target instanceof DocumentFragment || !target.bbbHasClass("post-preview")) // All posts in a specific element.
			return target.querySelectorAll(".post-preview");
		else // Single specific post.
			return [target];
	}

	function getPaginator(target) {
		// Return the paginator of the document or a specific element.
		if (!target || target === document) // Paginator in the document.
			return document.getElementsByClassName("paginator")[0];
		else if (!target.bbbHasClass("paginator")) // Paginator in a specific element.
			return target.getElementsByClassName("paginator")[0];
		else // Single specific paginator.
			return target;
	}

	function getThumbContainer(mode, docEl) {
		// Retrieve the element that contains the thumbnails.
		var target = docEl || document;
		var container; // If/else variable.

		if (mode === "search")
			container = getId("posts-container", target);
		else if (mode === "popular" || mode === "popular_view")
			container = getId("a-popular", target);
		else if (mode === "pool" || mode === "favorite_group") {
			container = getId("a-show", target);
			container = (container ? container.getElementsByTagName("section")[1] : undefined);
		}
		else if (mode === "favorites")
			container = getId("posts", target);

		// Can't always depend on the first post so it's used as a fallback.
		if (!container) {
			var firstPost = getPosts(target)[0];

			if (firstPost)
				container = firstPost.parentNode;
		}

		return container;
	}

	function getThumbSibling(mode, docEl) {
		// If it exists, retrieve the element that thumbnails should be added before.
		var target = docEl || document;
		var sibling; // If/else variable.

		var posts = getPosts(target);
		var numPosts = posts.length;
		var lastPost = (numPosts ? posts[numPosts - 1] : undefined);
		var lastPostParent = (lastPost ? lastPost.parentNode : undefined);
		var thumbContainer = getThumbContainer(mode, target);
		var lastPostEl = (lastPostParent && lastPostParent !== thumbContainer && lastPostParent.parentNode === thumbContainer ? lastPostParent : lastPost);

		if (lastPostEl) {
			var contChildren = thumbContainer.children;

			for (var i = contChildren.length - 1; i >= 0; i--) {
				if (contChildren[i] === lastPostEl) {
					sibling = contChildren[i + 1];
					break;
				}
			}
		}
		else if (mode === "pool" || mode === "favorites" || mode === "favorite_group") {
			var paginator = getPaginator(target);
			var endlessDiv = getId("bbb-endless-button-div", target);

			sibling = endlessDiv || paginator;
		}

		return sibling;
	}

	function getPaginatorNextURL(target) {
		// Retrieve the next page's URL from the paginator.
		var paginator = getPaginator(target);

		if (paginator) {
			var nextLink = paginator.querySelector("a[rel='next'][href]");

			if (nextLink)
				return nextLink.href;
		}

		return undefined;
	}

	function getMeta(meta, docEl) {
		// Get a value from an HTML meta tag.
		var target = docEl || document;
		var metaTag = target.querySelector("meta[name='" + meta + "'][content], meta[property='" + meta + "'][content]");

		if (metaTag)
			return metaTag.content;
		else
			return undefined;
	}

	function getUserData(name) {
		// Get user account data from the body data attributes.
		var value = document.body.getAttribute("data-user-" + name);

		if (bbbIsNum(value))
			value = Number(value);

		return value;
	}

	function getVar(urlVar, targetUrl) {
		// Retrieve a value from a specified/current URL's query string.
		// Undefined refers to a param that isn't even declared. Null refers to a declared param that hasn't been defined with a value (&test&). An empty string ("") refers to a param that has been defined with nothing (&test=&).
		var url = targetUrl;

		if (!url)
			url = location.search;

		var result = url.split(new RegExp("[&\?]" + urlVar))[1];

		if (result === undefined)
			return undefined;

		result = result.split(/[#&]/, 1)[0].split("=", 2)[1];

		if (result === undefined)
			return null;
		else
			return result;
	}

	function getTagVar(urlVar, url) {
		// Retrieve a metatag's value from the tag portion of a specified/current URL's query string.
		if (!url)
			url = location.search;

		var tags = getVar("tags", url);

		// If the tags parameter isn't provided or has no value, the metatag is undefined.
		if (tags === null || tags === undefined)
			return undefined;

		tags = tags.split(/\+|%20/g);

		for (var i = 0, il = tags.length; i < il; i++) {
			var tag = decodeURIComponent(tags[i]);

			if (tag.indexOf(urlVar + ":") === 0)
				return encodeURIComponent(tag.split(":")[1]); // Let the calling function decide whether it wants the decoded tag or not.
		}

		return undefined;
	}

	function getThumbQuery() {
		// Return the thumbnail URL query value.
		var query = "";

		if (gLoc === "search" || gLoc === "favorites") {
			query = getCurTags();
			query = (query ? "?tags=" + query : "");
		}
		else if (gLoc === "pool")
			query = "?pool_id=" + location.pathname.match(/\/pools\/(\d+)/)[1];
		else if (gLoc === "favorite_group")
			query = "?favgroup_id=" + location.pathname.match(/\/favorite_groups\/(\d+)/)[1];

		return query;
	}

	function getCurTags() {
		// Retrieve the current search tags for URL use.
		var tags; // If/else variable.

		if (gLoc === "search")
			tags = getVar("tags") || "";
		else if (gLoc === "favorites") {
			tags = document.getElementById("tags");
			tags = (tags ? tags.getAttribute("value").replace("fav:", "ordfav:").bbbSpaceClean() : ""); // Use getAttribute to avoid potential user changes to the input.
		}

		return tags;
	}

	function getLimit(url) {
		// Retrieve the current specified limit value. The query limit overrides the search limit.
		var loc = danbLoc(url);
		var limit; // If/else variable.

		if (loc === "pool" || loc === "popular" || loc === "favorite_group")
			limit = thumbnail_count_default;
		else if (loc === "comments")
			limit = 5;
		else if (loc === "popular_view")
			limit = 101;
		else {
			var queryLimit = getQueryLimit(url);
			var searchLimit = getSearchLimit(url);

			limit = (queryLimit !== undefined ? queryLimit : searchLimit);
		}

		return limit;
	}

	function getQueryLimit(url) {
		// Retrieve the limit from a URL's query portion. Always use the default for certain areas where the limit is not allowed.
		var queryLimit = getVar("limit", url);

		if (queryLimit !== null && queryLimit !== undefined) { // Treat the limit as undefined when the limit parameter is declared with no value.
			queryLimit = decodeURIComponent(queryLimit);

			if (queryLimit === "" || !/^\s*\d+/.test(queryLimit)) // No thumbnails show up when the limit is declared with a blank value or has no number directly after any potential white space.
				return 0;
			else // The query limit finds its value in a manner similar to parseInt. Dump leading spaces and grab numbers until a non-numerical character is hit.
				return parseInt(queryLimit, 10);
		}

		return undefined;
	}

	function getSearchLimit(url) {
		// Retrieve the limit from the search/limit tag used in a search.
		var searchLimit = getTagVar("limit", url);

		if (searchLimit !== undefined) {
			searchLimit = decodeURIComponent(searchLimit);

			if (searchLimit === "") // No thumbnails show up when the limit is declared but left blank.
				return 0;
			else if (!bbbIsNum(searchLimit.replace(/\s/g, "")) || searchLimit.indexOf(".") > -1 || Number(searchLimit) < 0) // Non-numerical, negative, and decimal values are ignored. Treat the limit as undefined.
				return undefined;
			else
				return Number(searchLimit);
		}

		return undefined;
	}

	/* Functions for the settings panel */
	function injectSettings() {
		var menu = document.getElementById("top");
		menu = (menu ? menu.getElementsByTagName("menu")[0] : undefined);

		if (!menu)
			return;

		var menuItems = menu.getElementsByTagName("li");
		var numMenuItems = menu.getElementsByTagName("li").length;
		var moreItem = menuItems[numMenuItems - 1];

		for (var i = numMenuItems - 1; i >= 0; i--) {
			var menuLink = menuItems[i];

			if (menuLink.textContent.indexOf("More") > -1) {
				moreItem = menuLink;
				break;
			}
		}

		var link = document.createElement("a");
		link.href = "#";
		link.innerHTML = "BBB Settings";
		link.addEventListener("click", function(event) {
			if (event.button !== 0)
				return;

			openMenu();
			event.preventDefault();
		}, false);

		var item = document.createElement("li");
		item.appendChild(link);

		if (moreItem)
			menu.insertBefore(item, moreItem);
		else
			menu.appendChild(item);

		window.addEventListener("resize", adjustMenuTimer, false);
	}

	function openMenu() {
		if (bbb.el.menu.window)
			return;

		loadSettings();
		createMenu();
	}

	function reloadMenu() {
		removeMenu();
		createMenu();
	}

	function createMenu() {
		var menu = bbb.el.menu.window = document.createElement("div");
		menu.id = "bbb-menu";
		menu.style.visibility = "hidden";

		var tip = bbb.el.menu.tip = document.createElement("div");
		tip.id = "bbb-expl";
		menu.appendChild(tip);

		var header = document.createElement("h1");
		header.innerHTML = "Better Better Booru Settings";
		header.style.textAlign = "center";
		menu.appendChild(header);

		var tabBar = document.createElement("div");
		tabBar.style.padding = "0px 15px";
		tabBar.addEventListener("click", function(event) {
			if (event.button !== 0)
				return;

			var target = event.target;

			if (target.href)
				changeTab(target);

			event.preventDefault();
		}, false);
		menu.appendChild(tabBar);

		var generalTab = bbb.el.menu.generalTab = document.createElement("a");
		generalTab.name = "general";
		generalTab.href = "#";
		generalTab.innerHTML = "General";
		generalTab.className = "bbb-tab bbb-active-tab";
		tabBar.appendChild(generalTab);

		var blacklistTab = bbb.el.menu.blacklistTab = document.createElement("a");
		blacklistTab.name = "blacklist";
		blacklistTab.href = "#";
		blacklistTab.innerHTML = "Blacklist";
		blacklistTab.className = "bbb-tab";
		tabBar.appendChild(blacklistTab);

		var borderTab = bbb.el.menu.borderTab = document.createElement("a");
		borderTab.name = "borders";
		borderTab.href = "#";
		borderTab.innerHTML = "Borders";
		borderTab.className = "bbb-tab";
		tabBar.appendChild(borderTab);

		var groupTab = bbb.el.menu.groupTab = document.createElement("a");
		groupTab.name = "groups";
		groupTab.href = "#";
		groupTab.innerHTML = "Groups";
		groupTab.className = "bbb-tab";
		tabBar.appendChild(groupTab);

		var layoutTab = bbb.el.menu.layoutTab = document.createElement("a");
		layoutTab.name = "layout";
		layoutTab.href = "#";
		layoutTab.innerHTML = "Layout";
		layoutTab.className = "bbb-tab";
		tabBar.appendChild(layoutTab);

		var prefTab = bbb.el.menu.prefTab = document.createElement("a");
		prefTab.name = "pref";
		prefTab.href = "#";
		prefTab.innerHTML = "Preferences";
		prefTab.className = "bbb-tab";
		tabBar.appendChild(prefTab);

		var helpTab = bbb.el.menu.helpTab = document.createElement("a");
		helpTab.name = "help";
		helpTab.href = "#";
		helpTab.innerHTML = "Help";
		helpTab.className = "bbb-tab";
		tabBar.appendChild(helpTab);

		var scrollDiv = bbb.el.menu.scrollDiv = document.createElement("div");
		scrollDiv.className = "bbb-scroll-div";
		menu.appendChild(scrollDiv);
		scrollDiv.scrollTop = 0;

		var generalPage = bbb.el.menu.generalPage = document.createElement("div");
		generalPage.className = "bbb-page";
		generalPage.style.display = "block";
		scrollDiv.appendChild(generalPage);

		generalPage.bbbSection(bbb.sections.browse);
		generalPage.bbbSection(bbb.sections.control);
		generalPage.bbbSection(bbb.sections.endless);
		generalPage.bbbSection(bbb.sections.misc);

		var blacklistPage = bbb.el.menu.blacklistPage = document.createElement("div");
		blacklistPage.className = "bbb-page";
		scrollDiv.appendChild(blacklistPage);

		blacklistPage.bbbSection(bbb.sections.blacklist_options);
		blacklistPage.bbbBlacklistSection();

		var layoutPage = bbb.el.menu.layoutPage = document.createElement("div");
		layoutPage.className = "bbb-page";
		scrollDiv.appendChild(layoutPage);

		layoutPage.bbbSection(bbb.sections.sidebar);
		layoutPage.bbbSection(bbb.sections.notices);
		layoutPage.bbbSection(bbb.sections.misc_layout);

		var bordersPage = bbb.el.menu.bordersPage = document.createElement("div");
		bordersPage.className = "bbb-page";
		scrollDiv.appendChild(bordersPage);

		bordersPage.bbbSection(bbb.sections.border_options);
		bordersPage.bbbSection(bbb.sections.status_borders);
		bordersPage.bbbSection(bbb.sections.tag_borders);

		var groupsPage = bbb.el.menu.groupsPage = document.createElement("div");
		groupsPage.className = "bbb-page";
		scrollDiv.appendChild(groupsPage);

		groupsPage.bbbSection(bbb.sections.groups);

		var prefPage = bbb.el.menu.prefPage = document.createElement("div");
		prefPage.className = "bbb-page";
		scrollDiv.appendChild(prefPage);

		prefPage.bbbSection(bbb.sections.script_settings);
		prefPage.bbbBackupSection();
		prefPage.bbbEraseSection();

		var helpPage = bbb.el.menu.helpPage = document.createElement("div");
		helpPage.className = "bbb-page";
		scrollDiv.appendChild(helpPage);

		helpPage.bbbTextSection('Thumbnail Matching Rules', 'For creating thumbnail matching rules, please consult the following examples:<ul><li><b>tag1</b> - Match posts with tag1.</li><li><b>tag1 tag2</b> - Match posts with tag1 AND tag2.</li><li><b>-tag1</b> - Match posts without tag1.</li><li><b>tag1 -tag2</b> - Match posts with tag1 AND without tag2.</li><li><b>~tag1 ~tag2</b> - Match posts with tag1 OR tag2.</li><li><b>~tag1 ~-tag2</b> - Match posts with tag1 OR without tag2.</li><li><b>tag1 ~tag2 ~tag3</b> - Match posts with tag1 AND either tag2 OR tag3.</li></ul><br>Wildcards can be used with any of the above methods:<ul><li><b>~tag1* ~-*tag2</b> - Match posts with tags starting with tag1 or posts without tags ending with tag2.</li></ul><br>Multiple match rules can be specified by using commas or separate lines when possible:<ul><li><b>tag1 tag2, tag3 tag4</b> - Match posts with tag1 AND tag2 or posts with tag3 AND tag4.</li><li><b>tag1 ~tag2 ~tag3, tag4</b> - Match posts with tag1 AND either tag2 OR tag3 or posts with tag4.</li></ul><br>Tags can be nested/grouped together by using parentheses that only have spaces or commas next to them:<ul><li><b>( ~tag1 ~tag2 ) ( ~tag3 ~tag3 )</b> - Match posts with either tag1 OR tag2 AND either tag3 OR tag4.</li><li><b>tag1 ( tag2, tag3 tag4 )</b> - Match posts with tag1 AND tag2 or posts with tag1 AND tag3 AND tag4.</li><li><b>tag1 -( tag2 tag3 )</b> - Match posts with tag1 AND without tag2 AND tag3.</li><li><b>tag1 ~tag2 ~( tag3 tag4 )</b> - Match posts with tag1 and either tag2 OR tag3 AND tag4.</li></ul><br>The following metatags are supported:<ul><li><b>rating:safe</b> - Match posts rated safe. Accepted values include safe, explicit, and questionable.</li><li><b>status:pending</b> - Match pending posts. Accepted values include active, pending, flagged, banned, and deleted. Note that flagged posts also count as active posts.</li><li><b>user:albert</b> - Match posts made by the user Albert. Note that this tag will only work if you have a <b>moderator</b> level account or higher.</li><li><b>userid:1</b> - Match posts made by the user with an ID number of 1.</li><li><b>taggerid:1</b> - Match posts mostly tagged by the user with an ID number of 1.</li><li><b>approverid:1</b> - Match posts approved by the user with an ID number of 1. Accepted values include numbers, "any" for all posts with an approver, and "none" for posts without an approver.</li><li><b>source:http://www.4chan.org/</b> - Match posts with a source starting with http://www.4chan.org/. Accepted values include "any" for all posts with sources, "none" for all posts without sources, wildcard searches such as "*pixiv.net*" for posts with sources that contain pixiv.net, and non-wildcard searches that start matching at the beginning of a source.</li><li><b>isfav:true</b> - Match posts favorited under your current account. Accepted values include true and false.</li><li><b>filetype:jpg</b> - Match posts that are in the jpg format. Accepted values include jpg, png, gif, swf, zip, webm, and mp4.</li><li><b>group:hidden</b> or <b>g:hidden</b> - Match posts that match the tags in your group named \"hidden\".</li><li><b>pool:1</b> - Match posts that are in the pool with an ID number of 1. Accepted values include pool ID numbers, "series" for posts in series category pools, "collection" for posts in collection category pools, "any" for posts in any pool, "none" for posts not in a pool, "active" for posts in an active (not deleted) pool, and "inactive" for posts only in an inactive (deleted) pool.</li><li><b>parent:1</b> - Match posts that have the post with an ID number of 1 as a parent. Accepted values include post ID numbers, "any" for any posts with a parent, and "none" for posts without a parent.</li><li><b>child:any</b> - Match any posts that have children. Accepted values include "any" for any posts with children and "none" for posts without children.</li><li><b>id:1</b> - Match posts with an ID number of 1.</li><li><b>score:1</b> - Match posts with a score of 1.</li><li><b>favcount:1</b> - Match posts with a favorite count of 1.</li><li><b>height:1</b> - Match posts with a height of 1.</li><li><b>width:1</b> - Match posts with a width of 1.</li></ul><br>The id, score, favcount, width, and height metatags can also use number ranges for matching:<ul><li><b>score:&lt;5</b> - Match posts with a score less than 5.</li><li><b>score:&gt;5</b> - Match posts with a score greater than 5.</li><li><b>score:&lt;=5</b> or <b>score:..5</b> - Match posts with a score equal to OR less than 5.</li><li><b>score:&gt;=5</b> or <b>score:5..</b> - Match posts with a score equal to OR greater than 5.</li><li><b>score:1..5</b> - Match posts with a score equal to OR greater than 1 AND equal to OR less than 5.</li></ul>');
		helpPage.bbbTextSection('Hotkeys', '<b>Posts</b><ul><li><b>B</b> - Open BBB menu.</li><li><b>1</b> - Resize to window.</li><li><b>2</b> - Resize to window width.</li><li><b>3</b> - Resize to window height.</li><li><b>4</b> - Reset/remove resizing.</li></ul><div style="font-size: smaller;">Note: Numbers refer to the main typing keypad and not the numeric keypad.</div><br><b>General</b><ul><li><b>B</b> - Open BBB menu.</li><li><b>E</b> - Toggle endless pages.</li><li><b>Shift + E</b> - Continue loading more pages after pausing during endless pages.</li><li><b>F</b> - Open quick search.</li><li><b>Shift + F</b> - Reset quick search.</li></ul>');
		helpPage.bbbTextSection('Questions, Suggestions, or Bugs?', 'If you have any questions, please use the Greasy Fork feedback forums located <a target="_blank" href="https://greasyfork.org/scripts/3575-better-better-booru/feedback">here</a>. If you\'d like to report a bug or make a suggestion, please create an issue on GitHub <a target="_blank" href="https://github.com/pseudonymous/better-better-booru/issues">here</a>.');
		helpPage.bbbTocSection();

		var close = document.createElement("a");
		close.innerHTML = "Save & Close";
		close.href = "#";
		close.className = "bbb-button";
		close.style.marginRight = "15px";
		close.addEventListener("click", function(event) {
			if (event.button !== 0)
				return;

			removeMenu();
			saveSettings();
			event.preventDefault();
		}, false);

		var cancel = document.createElement("a");
		cancel.innerHTML = "Cancel";
		cancel.href = "#";
		cancel.className = "bbb-button";
		cancel.addEventListener("click", function(event) {
			if (event.button !== 0)
				return;

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
			if (event.button !== 0)
				return;

			loadDefaults();
			reloadMenu();
			event.preventDefault();
		}, false);

		menu.appendChild(close);
		menu.appendChild(cancel);
		menu.appendChild(reset);

		// Add menu to the DOM and manipulate the dimensions.
		document.body.appendChild(menu);

		var viewHeight = document.documentElement.clientHeight;
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
		var i, il; // Loop variables.

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

			for (i = 0; i < sll; i++) {
				var settingName = settingList[i];

				if (halfway && i >= halfway)
						optionTarget = rightSide;

				var newOption = createOption(settingName);
				optionTarget.appendChild(newOption);
			}
		}
		else if (section.type === "border" || section.type === "group") {
			var listSettings = bbb.user[section.settings];

			for (i = 0, il = listSettings.length; i < il; i++) {
				var newListOption = (section.type === "border" ? createBorderOption(listSettings, i) : createGroupOption(listSettings, i));
				sectionDiv.appendChild(newListOption);
			}

			var indexWrapper = document.createElement("div");
			indexWrapper.bbbInfo("bbb-index", i);
			sectionDiv.appendChild(indexWrapper);

			var listDivider = document.createElement("div");
			listDivider.className = "bbb-list-divider";
			indexWrapper.appendChild(listDivider);
		}

		return sectionFrag;
	}

	Element.prototype.bbbSection = function(section) {
		this.appendChild(createSection(section));
	};

	function createOption(settingName) {
		var optionObject = bbb.options[settingName];
		var userSetting = bbb.user[settingName];
		var i, il; // Loop variables.

		var label = document.createElement("label");
		label.className = "bbb-general-label";

		var textSpan = document.createElement("span");
		textSpan.className = "bbb-general-text";
		textSpan.innerHTML = optionObject.label;
		label.appendChild(textSpan);

		var inputSpan = document.createElement("span");
		inputSpan.className = "bbb-general-input";
		label.appendChild(inputSpan);

		var item; // Switch variable.
		var itemFrag = document.createDocumentFragment();

		switch (optionObject.type) {
			case "dropdown":
				var txtOptions = optionObject.txtOptions;
				var numRange = optionObject.numRange;
				var numList = optionObject.numList;
				var selectOption; // If/else variable.

				item = document.createElement("select");
				item.name = settingName;

				if (txtOptions) {
					for (i = 0, il = txtOptions.length; i < il; i++) {
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
					for (i = 0, il = numList.length; i < il; i++) {
						selectOption = document.createElement("option");
						selectOption.innerHTML = numList[i];
						selectOption.value = numList[i];

						if (selectOption.value === String(userSetting))
							selectOption.selected = true;

						item.appendChild(selectOption);
					}
				}

				if (numRange) {
					var end = numRange[1];

					for (i = numRange[0]; i <= end; i++) {
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
					bbb.settings.changed[settingName] = true;
				}, false);
				itemFrag.appendChild(item);
				break;
			case "checkbox":
				item = document.createElement("input");
				item.name = settingName;
				item.type = "checkbox";
				item.checked = userSetting;
				item.addEventListener("click", function(event) {
					if (event.button !== 0)
						return;

					bbb.user[settingName] = this.checked;
					bbb.settings.changed[settingName] = true;
				}, false);
				itemFrag.appendChild(item);
				break;
			case "text":
				item = document.createElement("input");
				item.name = settingName;
				item.type = "text";
				item.value = userSetting;
				item.addEventListener("change", function() {
					bbb.user[settingName] = (optionObject.isTagInput ? this.value.bbbTagClean() : this.value.bbbSpaceClean());
					bbb.settings.changed[settingName] = true;
				}, false);
				itemFrag.appendChild(item);

				if (optionObject.isTagInput) {
					var tagExpand = document.createElement("a");
					tagExpand.href = "#";
					tagExpand.className = "bbb-edit-link";
					tagExpand.innerHTML = "&raquo;";
					tagExpand.addEventListener("click", function(event) {
						if (event.button !== 0)
							return;

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
				item.addEventListener("change", function() {
					bbb.user[settingName] = Number(this.value);
					bbb.settings.changed[settingName] = true;
				}, false);
				itemFrag.appendChild(item);
				break;
			default:
				bbbNotice('Unexpected menu object type for "' + optionObject.label + '". (Type: ' + optionObject.type + ')', -1);
				return label;
		}
		inputSpan.appendChild(itemFrag);

		var explLink = document.createElement("a");
		explLink.innerHTML = "?";
		explLink.href = "#";
		explLink.className = "bbb-expl-link";
		explLink.bbbSetTip(bbb.options[settingName].expl);
		inputSpan.appendChild(explLink);

		return label;
	}

	function createBorderOption(borderSettings, index) {
		var borderItem = borderSettings[index];
		var isStatus = (borderItem.class_name ? true : false);

		var borderSpacer = document.createElement("span");
		borderSpacer.className = "bbb-list-spacer";

		var indexWrapper = document.createElement("div");
		indexWrapper.bbbInfo("bbb-index", index);

		var borderDivider = document.createElement("div");
		borderDivider.className = "bbb-list-divider";
		indexWrapper.appendChild(borderDivider);

		var borderDiv = document.createElement("div");
		borderDiv.className = "bbb-list-div";
		indexWrapper.appendChild(borderDiv);

		var borderBarDiv = document.createElement("div");
		borderBarDiv.className = "bbb-list-bar";
		borderDiv.appendChild(borderBarDiv);

		var enableLabel = document.createElement("label");
		enableLabel.innerHTML = "Enabled:";
		borderBarDiv.appendChild(enableLabel);

		var enableBox = document.createElement("input");
		enableBox.type = "checkbox";
		enableBox.checked = borderItem.is_enabled;
		enableBox.addEventListener("click", function(event) {
			if (event.button === 0)
				borderItem.is_enabled = this.checked;
		}, false);
		enableLabel.appendChild(enableBox);

		var editSpan = document.createElement("span");
		editSpan.style.cssFloat = "right";
		borderBarDiv.appendChild(editSpan);

		var moveButton = document.createElement("a");
		moveButton.href = "#";
		moveButton.innerHTML = "Move";
		moveButton.className = "bbb-list-button";
		moveButton.addEventListener("click", function(event) {
			if (event.button !== 0)
				return;

			moveListOption(borderSettings, indexWrapper);
			event.preventDefault();
		}, false);
		moveButton.bbbSetTip("Click the blue highlighted area that indicates where you would like to move this border.");
		editSpan.appendChild(moveButton);

		var previewButton = document.createElement("a");
		previewButton.href = "#";
		previewButton.innerHTML = "Preview";
		previewButton.className = "bbb-list-button";
		previewButton.bbbBorderPreview(borderItem);
		editSpan.appendChild(previewButton);

		if (!isStatus) {
			var deleteButton = document.createElement("a");
			deleteButton.href = "#";
			deleteButton.innerHTML = "Delete";
			deleteButton.className = "bbb-list-button";
			deleteButton.addEventListener("click", function(event) {
				if (event.button !== 0)
					return;

				deleteListOption(borderSettings, indexWrapper, "border");
				event.preventDefault();
			}, false);
			editSpan.appendChild(deleteButton);

			var newButton = document.createElement("a");
			newButton.href = "#";
			newButton.innerHTML = "New";
			newButton.className = "bbb-list-button";
			newButton.addEventListener("click", function(event) {
				if (event.button !== 0)
					return;

				createListOption(borderSettings, indexWrapper, "border");
				event.preventDefault();
			}, false);
			newButton.bbbSetTip("Click the blue highlighted area that indicates where you would like to create a border.");
			editSpan.appendChild(newButton);
		}

		editSpan.appendChild(borderSpacer.cloneNode(false));

		var helpButton = document.createElement("a");
		helpButton.href = "#";
		helpButton.innerHTML = "Help";
		helpButton.className = "bbb-list-button";
		helpButton.bbbSetTip("<b>Enabled:</b> When checked, the border will be applied. When unchecked, it won't be applied.<tipdesc>Status/Tags:</tipdesc> Describes the posts that the border should be applied to. For custom tag borders, you may specify the rules the post must match for the border to be applied. Please read the \"thumbnail matching rules\" section under the help tab for information about creating rules.<tipdesc>Color:</tipdesc> Set the color of the border. Hex RGB color codes (#000000, #FFFFFF, etc.) are the recommended values.<tipdesc>Style:</tipdesc> Set how the border looks. Please note that double only works with a border width of 3 or higher.<tipdesc>Move:</tipdesc> Move the border to a new position. Higher borders have higher priority. In the event of a post matching more than 4 borders, the first 4 borders get applied and the rest are ignored. If single color borders are enabled, only the first matching border is applied.<tipdesc>Preview:</tipdesc> Display a preview of the border's current settings.<tipdesc>Delete:</tipdesc> Remove the border and its settings.<tipdesc>New:</tipdesc> Create a new border.");
		editSpan.appendChild(helpButton);

		var borderSettingsDiv = document.createElement("div");
		borderSettingsDiv.className = "bbb-list-settings";
		borderDiv.appendChild(borderSettingsDiv);

		var nameLabel = document.createElement("label");
		nameLabel.className = "bbb-list-border-name";
		borderSettingsDiv.appendChild(nameLabel);

		if (isStatus)
			nameLabel.innerHTML = "Status:" + borderItem.tags;
		else {
			nameLabel.innerHTML = "Tags:";

			var nameInput = document.createElement("input");
			nameInput.type = "text";
			nameInput.value = borderItem.tags + " ";
			nameInput.addEventListener("change", function() { borderItem.tags = this.value.bbbTagClean(); }, false);
			nameLabel.appendChild(nameInput);
			menuAutocomplete(nameInput);

			var nameExpand = document.createElement("a");
			nameExpand.href = "#";
			nameExpand.className = "bbb-edit-link";
			nameExpand.innerHTML = "&raquo;";
			nameExpand.addEventListener("click", function(event) {
				if (event.button !== 0)
					return;

				tagEditWindow(nameInput, borderItem, "tags");
				event.preventDefault();
			}, false);
			nameLabel.appendChild(nameExpand);
		}

		var colorLabel = document.createElement("label");
		colorLabel.innerHTML = "Color:";
		colorLabel.className = "bbb-list-border-color";
		borderSettingsDiv.appendChild(colorLabel);

		var colorInput = document.createElement("input");
		colorInput.type = "text";
		colorInput.value = borderItem.border_color;
		colorInput.addEventListener("change", function() { borderItem.border_color = this.value.bbbSpaceClean(); }, false);
		colorLabel.appendChild(colorInput);

		var styleLabel = document.createElement("label");
		styleLabel.innerHTML = "Style:";
		styleLabel.className = "bbb-list-border-style";
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

	function createGroupOption(groupSettings, index) {
		var groupItem = groupSettings[index];

		var groupSpacer = document.createElement("span");
		groupSpacer.className = "bbb-list-spacer";

		var indexWrapper = document.createElement("div");
		indexWrapper.bbbInfo("bbb-index", index);

		var groupDivider = document.createElement("div");
		groupDivider.className = "bbb-list-divider";
		indexWrapper.appendChild(groupDivider);

		var groupDiv = document.createElement("div");
		groupDiv.className = "bbb-list-div";
		indexWrapper.appendChild(groupDiv);

		var groupBarDiv = document.createElement("div");
		groupBarDiv.className = "bbb-list-bar";
		groupDiv.appendChild(groupBarDiv);

		var nameLabel = document.createElement("label");
		nameLabel.className = "bbb-list-group-name";
		nameLabel.innerHTML = "Name:";
		groupBarDiv.appendChild(nameLabel);

		var nameInput = document.createElement("input");
		nameInput.type = "text";
		nameInput.value = groupItem.name;
		nameInput.addEventListener("input", function() { this.value = this.value.replace(/[\s,]/gi, ""); }, false);
		nameInput.addEventListener("change", function() {
			var cleanName = this.value.bbbSpaceClean();

			if (cleanName === "")
				this.value = cleanName = "New_" + timestamp("y-m-d_hh:mm:ss:ms");
			else {
				for (var i = 0, il = groupSettings.length; i < il; i++) {
					if (cleanName === groupSettings[i].name) {
						var newName = cleanName + "_" + timestamp("y-m-d_hh:mm:ss:ms");

						this.value = cleanName = newName;
						bbbDialog("The group name you tried to use is already in use by another group and has been changed to the following:<br>" + newName);
						break;
					}
				}
			}

			groupItem.name = cleanName;
		}, false);
		nameLabel.appendChild(nameInput);

		var editSpan = document.createElement("span");
		editSpan.style.cssFloat = "right";
		groupBarDiv.appendChild(editSpan);

		var moveButton = document.createElement("a");
		moveButton.href = "#";
		moveButton.innerHTML = "Move";
		moveButton.className = "bbb-list-button";
		moveButton.addEventListener("click", function(event) {
			if (event.button !== 0)
				return;

			moveListOption(groupSettings, indexWrapper);
			event.preventDefault();
		}, false);
		moveButton.bbbSetTip("Click the blue highlighted area that indicates where you would like to move this group.");
		editSpan.appendChild(moveButton);

		var deleteButton = document.createElement("a");
		deleteButton.href = "#";
		deleteButton.innerHTML = "Delete";
		deleteButton.className = "bbb-list-button";
		deleteButton.addEventListener("click", function(event) {
			if (event.button !== 0)
				return;

			deleteListOption(groupSettings, indexWrapper, "group");
			event.preventDefault();
		}, false);
		editSpan.appendChild(deleteButton);

		var newButton = document.createElement("a");
		newButton.href = "#";
		newButton.innerHTML = "New";
		newButton.className = "bbb-list-button";
		newButton.addEventListener("click", function(event) {
			if (event.button !== 0)
				return;

			createListOption(groupSettings, indexWrapper, "group");
			event.preventDefault();
		}, false);
		newButton.bbbSetTip("Click the blue highlighted area that indicates where you would like to create a group.");
		editSpan.appendChild(newButton);

		editSpan.appendChild(groupSpacer.cloneNode(false));

		var helpButton = document.createElement("a");
		helpButton.href = "#";
		helpButton.innerHTML = "Help";
		helpButton.className = "bbb-list-button";
		helpButton.bbbSetTip("<b>Name:</b> The name you want to refer to this group of tags by when using the group metatag. Names may not contain spaces or commas. <tipdesc>Tags:</tipdesc> Describes the posts that the group should match. Please read the \"thumbnail matching rules\" section under the help tab for information about creating rules. When used, all tags in a group are treated as if they're grouped/nested together (enclosed in parentheses). <tipdesc>Move:</tipdesc> Move the group to a new position. The order of groups affects the order they display in for tag autocomplete. <tipdesc>Delete:</tipdesc> Remove the group and its settings.<tipdesc>New:</tipdesc> Create a new group. <tiphead>Example</tiphead>If given a group named \"hidden\" that contains \"~loli ~shota ~toddlercon ~status:banned\" for its tags, a search for \"rating:questionable -group:hidden\" would behave like \"rating:questionable -( ~loli ~shota ~toddlercon ~status:banned )\".<tiphead>Tips</tiphead>The \"group\" metatag can be shortened to \"g\". <br><br>Groups used by themselves with the quick search option can provide a saved search functionality.<br><br>A blacklist or border entry (especially a complex one) that you want to work exclusively from other entries can be assigned to a group and excluded from other entries by using \"-group:entryname\". Updating that group will then update all entries linked to it. Similarly, tags you want shared across multiple entries can just use \"group:entryname\".");
		editSpan.appendChild(helpButton);

		var groupSettingsDiv = document.createElement("div");
		groupSettingsDiv.className = "bbb-list-settings";
		groupDiv.appendChild(groupSettingsDiv);

		var tagsLabel = document.createElement("label");
		tagsLabel.className = "bbb-list-group-tags";
		tagsLabel.innerHTML = "Tags:";
		groupSettingsDiv.appendChild(tagsLabel);

		var tagsInput = document.createElement("input");
		tagsInput.type = "text";
		tagsInput.value = groupItem.tags + " ";
		tagsInput.addEventListener("change", function() { groupItem.tags = this.value.bbbTagClean(); }, false);
		tagsLabel.appendChild(tagsInput);
		menuAutocomplete(tagsInput);

		var tagsExpand = document.createElement("a");
		tagsExpand.href = "#";
		tagsExpand.className = "bbb-edit-link";
		tagsExpand.innerHTML = "&raquo;";
		tagsExpand.addEventListener("click", function(event) {
			if (event.button !== 0)
				return;

			tagEditWindow(tagsInput, groupItem, "tags");
			event.preventDefault();
		}, false);
		tagsLabel.appendChild(tagsExpand);

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

		var sectionDiv = document.createElement("div");
		sectionDiv.className = "bbb-section-options";
		sectionFrag.appendChild(sectionDiv);

		var backupTextarea = bbb.el.menu.backupTextarea = document.createElement("textarea");
		backupTextarea.className = "bbb-backup-area";
		sectionDiv.appendChild(backupTextarea);

		var buttonDiv = document.createElement("div");
		buttonDiv.className = "bbb-section-options";
		sectionFrag.appendChild(buttonDiv);

		var textBackup = document.createElement("a");
		textBackup.innerHTML = "Create Backup Text";
		textBackup.href = "#";
		textBackup.className = "bbb-button";
		textBackup.style.marginRight = "15px";
		textBackup.addEventListener("click", function(event) {
			if (event.button !== 0)
				return;

			createBackupText();
			event.preventDefault();
		}, false);
		buttonDiv.appendChild(textBackup);

		var pageBackup = document.createElement("a");
		pageBackup.innerHTML = "Create Backup Text File";
		pageBackup.download = "Better Better Booru v" + bbb.user.bbb_version + " Backup (" + timestamp() + ").txt";
		pageBackup.target = "_blank";
		pageBackup.href = ('data:,Better Better Booru v' + bbb.user.bbb_version + ' Backup (' + timestamp() + '):%0D%0D' + JSON.stringify(bbb.user)).replace(/#/g, encodeURIComponent("#"));
		pageBackup.className = "bbb-button";
		pageBackup.style.marginRight = "15px";
		buttonDiv.appendChild(pageBackup);

		var rightButtons = document.createElement("span");
		rightButtons.style.cssFloat = "right";
		buttonDiv.appendChild(rightButtons);

		var restoreBackup = document.createElement("a");
		restoreBackup.innerHTML = "Restore Backup";
		restoreBackup.style.marginRight = "15px";
		restoreBackup.href = "#";
		restoreBackup.className = "bbb-button";
		restoreBackup.addEventListener("click", function(event) {
			if (event.button !== 0)
				return;

			restoreBackupText();
			event.preventDefault();
		}, false);
		rightButtons.appendChild(restoreBackup);

		var helpButton = document.createElement("a");
		helpButton.innerHTML = "Help";
		helpButton.href = "#";
		helpButton.className = "bbb-button";
		helpButton.bbbSetTip("Create copies of your settings that can be used for recovering lost/corrupted settings or transferring settings.<tiphead>Directions</tiphead>There are two options for creating a backup. Creating backup text will provide a plain text format backup in the area provided that can be copied and saved where desired. Creating a backup text file will attempt to download a plain text copy of your settings or open a new tab containing the plain text copy. <br><br>To restore a backup, copy and paste the desired backup into the provided area and click \"restore backup\".");
		rightButtons.appendChild(helpButton);

		return sectionFrag;
	}

	Element.prototype.bbbBackupSection = function() {
		this.appendChild(createBackupSection());
	};

	function createEraseSection() {
		var sectionFrag = document.createDocumentFragment();

		var sectionHeader = document.createElement("h2");
		sectionHeader.innerHTML = "Erase Settings";
		sectionHeader.className = "bbb-header";
		sectionFrag.appendChild(sectionHeader);

		var sectionDiv = document.createElement("div");
		sectionDiv.innerHTML = "By clicking the button below, you can choose to erase various BBB information from your browser. Please remember to create a backup if you intend to reinstall.";
		sectionDiv.className = "bbb-section-options";
		sectionFrag.appendChild(sectionDiv);

		var buttonDiv = document.createElement("div");
		buttonDiv.className = "bbb-section-options";
		buttonDiv.style.padding = "5px 0px";
		sectionFrag.appendChild(buttonDiv);

		var eraseButton = document.createElement("a");
		eraseButton.innerHTML = "Erase Options";
		eraseButton.href = "#";
		eraseButton.className = "bbb-button";
		eraseButton.addEventListener("click", function(event) {
			if (event.button !== 0)
				return;

			eraseSettingDialog();
			event.preventDefault();
		}, false);
		buttonDiv.appendChild(eraseButton);

		return sectionFrag;
	}

	Element.prototype.bbbEraseSection = function() {
		this.appendChild(createEraseSection());
	};

	function createBlacklistSection() {
		var sectionFrag = document.createDocumentFragment();

		var sectionHeader = document.createElement("h2");
		sectionHeader.innerHTML = "Blacklist";
		sectionHeader.className = "bbb-header";
		sectionFrag.appendChild(sectionHeader);

		var sectionDiv = document.createElement("div");
		sectionDiv.className = "bbb-section-options";
		sectionFrag.appendChild(sectionDiv);

		var blacklistTextarea = bbb.el.menu.blacklistTextarea = document.createElement("textarea");
		blacklistTextarea.className = "bbb-blacklist-area";
		blacklistTextarea.value = searchSingleToMulti(bbb.user.script_blacklisted_tags) + " \r\n\r\n";
		blacklistTextarea.addEventListener("change", function() { bbb.user.script_blacklisted_tags = searchMultiToSingle(blacklistTextarea.value); }, false);
		sectionDiv.appendChild(blacklistTextarea);
		menuAutocomplete(blacklistTextarea);

		var buttonDiv = document.createElement("div");
		buttonDiv.className = "bbb-section-options";
		sectionFrag.appendChild(buttonDiv);

		var formatButton = document.createElement("a");
		formatButton.innerHTML = "Format";
		formatButton.href = "#";
		formatButton.className = "bbb-button";
		formatButton.addEventListener("click", function(event) {
			if (event.button !== 0)
				return;

			var textareaString = searchMultiToSingle(blacklistTextarea.value);

			blacklistTextarea.value = searchSingleToMulti(textareaString);
			event.preventDefault();
		}, false);
		buttonDiv.appendChild(formatButton);

		var helpButton = document.createElement("a");
		helpButton.innerHTML = "Help";
		helpButton.href = "#";
		helpButton.className = "bbb-button";
		helpButton.style.cssFloat = "right";
		helpButton.bbbSetTip("Hide posts that match the specified tag(s).<tiphead>Directions</tiphead>Please read the \"thumbnail matching rules\" section under the help tab for information about creating matching rules for posts you wish to blacklist. Blank lines will be ignored and are only used for improved readability.<br><br> All commas outside of tag groups will be converted to new lines and all extra spaces and extra blank lines will be removed the next time the settings are opened. By using the \"format\" button, you can manually perform this action on the blacklist rules. <tiphead>Note</tiphead>When logged in, the account's \"blacklisted tags\" list will override this option. This behavior can be changed with the \"override blacklist\" option under the preferences tab.");
		buttonDiv.appendChild(helpButton);

		return sectionFrag;
	}

	Element.prototype.bbbBlacklistSection = function() {
		this.appendChild(createBlacklistSection());
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

		var tocList = document.createElement("ol");
		tocList.className = "bbb-toc";
		sectionText.appendChild(tocList);

		for (var i = 0, il = pageSections.length; i < il;) {
			var listItem = document.createElement("li");
			tocList.appendChild(listItem);

			var linkItem = document.createElement("a");
			linkItem.textContent = pageSections[i].textContent;
			linkItem.href = "#" + (++i);
			listItem.appendChild(linkItem);
		}

		tocList.addEventListener("click", function (event) {
			var targetValue = event.target.href;

			if (event.button !== 0 || !targetValue)
				return;

			var sectionTop = pageSections[targetValue.split("#")[1]].offsetTop;

			bbb.el.menu.scrollDiv.scrollTop = sectionTop;
			event.preventDefault();
		}, false);

		return sectionFrag;
	}

	Element.prototype.bbbTocSection = function() {
		var page = this;
		page.insertBefore(createTocSection(page), page.firstElementChild);
	};

	function newOption(type, def, lbl, expl, optPropObject) {
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

		var option = {
			type: type,
			def: def, // Default.
			label: lbl,
			expl: expl // Explanation.
		};

		if (optPropObject) { // Additional properties provided in the form of an object.
			for (var i in optPropObject) {
				if (optPropObject.hasOwnProperty(i))
					option[i] = optPropObject[i];
			}
		}

		return option;
	}

	function newSection(type, settingList, header, text) {
		/*
		 * Section type notes
		 * ==================
		 * Current section types are general and border.
		 *
		 * The setting list for general sections are provided in the form of an array containing the setting names as strings.
		 * The setting list for border sections is the setting name containing the borders as a string.
		 */
		return {
			type: type,
			settings: settingList,
			header: header,
			text: text
		};
	}

	function newBorder(tags, isEnabled, color, style, className) {
		return {
			tags: tags,
			is_enabled: isEnabled,
			border_color: color,
			border_style: style,
			class_name: className
		};
	}

	function borderSet() {
		var formatted = [];

		for (var i = 0, il = arguments.length; i < il; i++) {
			var border = arguments[i];

			formatted.push(newBorder(border[0], border[1], border[2], border[3], border[4]));
		}

		return formatted;
	}

	function newGroup(name, tags) {
		return {
			name: name,
			tags: tags
		};
	}

	function groupSet() {
		var formatted = [];

		for (var i = 0, il = arguments.length; i < il; i++) {
			var group = arguments[i];

			formatted.push(newGroup(group[0], group[1]));
		}

		return formatted;
	}

	function resetListElements(section) {
		// Reset the list of items after moving or creating a new item.
		var optionElements = section.children;

		for (var i = 0, il = optionElements.length; i < il; i++) {
			var optionElement = optionElements[i];

			optionElement.bbbRemoveClass("bbb-no-highlight");
			optionElement.bbbInfo("bbb-index", i);
		}
	}

	function deleteListOption(listSettings, optionElement, type) {
		// Remove an item and if it's the last one, create a blank one.
		var section = optionElement.parentNode;
		var index = Number(optionElement.bbbInfo("bbb-index"));

		section.removeChild(optionElement);
		listSettings.splice(index,1);

		if (!listSettings[0]) {
			// If no borders are left, add a new blank border.
			var newListItem = (type === "border" ? newBorder("", false, "#000000", "solid") : newGroup("New_" + timestamp("y-m-d_hh:mm:ss:ms"), "", false));
			listSettings.push(newListItem);

			var newOptionElement = (type === "border" ? createBorderOption(listSettings, 0) : createGroupOption(listSettings, 0));
			section.insertBefore(newOptionElement, section.firstElementChild);
		}

		resetListElements(section);
	}

	function moveListOption(listSettings, optionElement) {
		// Prepare to move an item and wait for the user to click where it'll go.
		var section = optionElement.parentNode;
		var index = Number(optionElement.bbbInfo("bbb-index"));

		optionElement.bbbAddClass("bbb-no-highlight");
		optionElement.nextSibling.bbbAddClass("bbb-no-highlight");
		section.bbbAddClass("bbb-insert-highlight");
		bbb.el.menu.window.addEventListener("click", function insertListOption(event) {
			var target = event.target;

			if (target.className === "bbb-list-divider" && event.button === 0) {
				var newIndex = Number(target.parentNode.bbbInfo("bbb-index"));

				if (newIndex !== index) {
					var listItem = listSettings.splice(index, 1)[0];

					if (newIndex < index)
						listSettings.splice(newIndex, 0, listItem);
					else if (newIndex > index)
						listSettings.splice(newIndex - 1, 0, listItem);

					section.insertBefore(optionElement, section.children[newIndex]);
				}
			}

			resetListElements(section);
			section.bbbRemoveClass("bbb-insert-highlight");
			bbb.el.menu.window.removeEventListener("click", insertListOption, true);
		}, true);
	}

	function createListOption(listSettings, optionElement, type) {
		// Prepare to create an item and wait for the user to click where it'll go.
		var section = optionElement.parentNode;

		section.bbbAddClass("bbb-insert-highlight");
		bbb.el.menu.window.addEventListener("click", function insertListOption(event) {
			var target = event.target;

			if (target.className === "bbb-list-divider" && event.button === 0) {
				var newIndex = Number(target.parentNode.bbbInfo("bbb-index"));
				var newListItem = (type === "border" ? newBorder("", false, "#000000", "solid") : newGroup("New_" + timestamp("y-m-d_hh:mm:ss:ms"), "", false));

				listSettings.splice(newIndex, 0, newListItem);

				var newOptionElement = (type === "border" ? createBorderOption(listSettings, newIndex) : createGroupOption(listSettings, newIndex));

				section.insertBefore(newOptionElement, section.children[newIndex]);
			}

			resetListElements(section);
			section.bbbRemoveClass("bbb-insert-highlight");
			bbb.el.menu.window.removeEventListener("click", insertListOption, true);
		}, true);
	}

	function showTip(event, content, styleString) {
		var x = event.clientX;
		var y = event.clientY;
		var tip = bbb.el.menu.tip;

		if (styleString)
			tip.setAttribute("style", styleString);

		formatTip(event, tip, content, x, y);
	}

	function hideTip() {
		bbb.el.menu.tip.removeAttribute("style");
	}

	Element.prototype.bbbBorderPreview = function(borderItem) {
		this.addEventListener("click", function(event) {
			if (event.button !== 0)
				return;

			showTip(event, "<img src=\"http://danbooru.donmai.us/data/preview/d34e4cf0a437a5d65f8e82b7bcd02606.jpg\" alt=\"IMAGE\" style=\"width: 105px; height: 150px; border-color: " + borderItem.border_color + "; border-style: " + borderItem.border_style + "; border-width: " + bbb.user.border_width + "px; padding:" + bbb.user.border_spacing + "px; line-height: 150px; text-align: center; vertical-align: middle;\">", "background-color: #FFFFFF;");
			event.preventDefault();
		}, false);
		this.addEventListener("mouseout", hideTip, false);
	};

	Element.prototype.bbbSetTip = function(text) {
		var tip = bbb.el.menu.tip;

		this.addEventListener("click", function(event) {
			if (event.button !== 0)
				return;

			showTip(event, text, false);
			event.preventDefault();
		}, false);
		this.addEventListener("mouseout", function() { bbb.timers.hideTip = window.setTimeout(hideTip, 100); }, false);
		tip.addEventListener("mouseover", function() { window.clearTimeout(bbb.timers.hideTip); }, false);
		tip.addEventListener("mouseleave", hideTip, false);
	};

	function changeTab(tab) {
		var activeTab = document.getElementsByClassName("bbb-active-tab")[0];

		if (tab === activeTab)
			return;

		activeTab.bbbRemoveClass("bbb-active-tab");
		bbb.el.menu[activeTab.name + "Page"].style.display = "none";
		bbb.el.menu.scrollDiv.scrollTop = 0;
		tab.bbbAddClass("bbb-active-tab");
		bbb.el.menu[tab.name + "Page"].style.display = "block";
	}

	function tagEditWindow(input, object, prop) {
		var tagEditBlocker = document.createDocumentFragment();

		var tagEditHeader = document.createElement("h2");
		tagEditHeader.innerHTML = "Tag Editor";
		tagEditHeader.className = "bbb-header";
		tagEditBlocker.appendChild(tagEditHeader);

		var tagEditArea = bbb.el.menu.tagEditArea = document.createElement("textarea");
		tagEditArea.value = searchSingleToMulti(input.value) + " \r\n\r\n";
		tagEditArea.className = "bbb-edit-area";
		tagEditBlocker.appendChild(tagEditArea);

		var tagEditOk = function() {
			var tags = searchMultiToSingle(tagEditArea.value);

			input.value = tags + " ";
			input.focus();
			input.setSelectionRange(0, 0);
			object[prop] = tags;
		};

		bbbDialog(tagEditBlocker, {ok: tagEditOk, cancel: true});
		tagEditArea.focus();
		tagEditArea.setSelectionRange(0, 0);

		menuAutocomplete(tagEditArea);
	}

	function adjustMenuHeight() {
		var menu = bbb.el.menu.window;
		var scrollDiv = bbb.el.menu.scrollDiv;
		var viewHeight = document.documentElement.clientHeight;
		var scrollDivDiff = menu.offsetHeight - scrollDiv.clientHeight;

		scrollDiv.style.maxHeight = viewHeight - scrollDiv.bbbGetPadding().height - scrollDivDiff - 50 + "px"; // Subtract 50 for margins (25 each).
		bbb.timers.adjustMenu = 0;
	}

	function adjustMenuTimer() {
		if (!bbb.timers.adjustMenu && bbb.el.menu.window)
			bbb.timers.adjustMenu = window.setTimeout(adjustMenuHeight, 50);
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
		var settings = loadData("bbb_settings");

		if (settings === null) {
			// Settings not found in the expected place.
			var domain = location.protocol + "//" + location.hostname;
			var localSettings = localStorage.getItem("bbb_settings");

			if (localSettings !== null) {
				// Load up the localStorage settings if they exist.
				bbb.user = parseJson(localSettings, jsonSettingsErrorHandler);
				checkUser(bbb.user, bbb.options);

				if (bbb.user.bbb_version !== bbb.options.bbb_version)
					convertSettings("load");

				if (!bbb.flags.new_storage_notice) {
					// Alert the user when there are no GM storage settings but there are localStorage settings.
					bbb.flags.new_storage_notice = true;

					var newStorageNotice = function() {
						bbbDialog('As of version 7.3, BBB has changed the way it saves information. You currently don\'t have any settings saved with the new method, but do have settings saved with the old method. Before clicking anything, please read the following:<ul><li>Please check the BBB settings menu and confirm that everything is correct. If it is, click "save & close" to transfer your settings over. If your settings are not correct, you may restore from a backup and then save.</li><li>Alternatively, if ' + domain + ' (' + (/^https/.test(domain) ? '' : 'not ') + 'secure/https) is not the Danbooru domain you usually use, you should change to your usual domain and retry checking your settings there.</li><li>Finally, if neither of those steps work, you should <a href="https://sleazyfork.org/scripts/3575-better-better-booru/code/better_better_booru.user.js?version=123120&d=.user.js">revert to version 7.2.5</a>, refresh/reload Danbooru, create a backup, and then update back to version 7.3.</li></ul>');
						openMenu();

						document.removeEventListener("mousemove", newStorageNotice, false);
					};

					document.addEventListener("mousemove", newStorageNotice, false);
				}
			}
			else {
				// Load defaults.
				if (!getCookie().bbb_no_settings && !bbb.flags.local_storage_full) {
					// Alert the user so that new users know what to do and other users are know their usual settings aren't in effect.
					var noSettingsNotice = function() {
						if (!getCookie().bbb_no_settings) { // Trigger the notice if it hasn't been displayed in another tab/window.
							bbbNotice("No settings could be detected for " + domain + ". Please take a moment to set/restore your options by using the \"BBB settings\" link in the Danbooru navigation bar.", 15);
							createCookie("bbb_no_settings", 1);
						}

						document.removeEventListener("mousemove", noSettingsNotice, false);
					};

					document.addEventListener("mousemove", noSettingsNotice, false);
				}

				loadDefaults();
			}
		}
		else if (typeof(settings) === "string") {
			bbb.user = parseJson(settings, jsonSettingsErrorHandler);
			checkUser(bbb.user, bbb.options);

			if (bbb.user.bbb_version !== bbb.options.bbb_version) {
				convertSettings("load");
				saveSettings();
			}
		}
	}

	function loadDefaults() {
		// Load the default settings.
		bbb.user = defaultSettings();
	}

	function defaultSettings() {
		// Create a copy of the default settings.
		var defaults = {};

		for (var i in bbb.options) {
			if (bbb.options.hasOwnProperty(i)) {
				if (typeof(bbb.options[i].def) !== "undefined")
					defaults[i] = bbb.options[i].def;
				else
					defaults[i] = bbb.options[i];
			}
		}

		return defaults;
	}

	function checkUser(user, options) {
		// Verify the user has all the base settings and add them with their default values if they don't.
		for (var i in options) {
			if (options.hasOwnProperty(i)) {
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
	}

	function saveSettings() {
		// Save the user settings to localStorage after making any necessary checks/adjustments.
		if (bbb.settings.changed.track_new && !bbb.user.track_new && bbb.user.track_new_data.viewed) // Reset new post tracking if it has been disabled.
			bbb.user.track_new_data = bbb.options.track_new_data.def;

		if (bbb.settings.changed.thumbnail_count) // Update the link limit values if the user has changed the value.
			fixLimit(bbb.user.thumbnail_count);

		if (bbb.settings.changed.blacklist_highlight_color && bbb.user.blacklist_highlight_color === "") // Use the default highlight color if the field is left blank.
			bbb.user.blacklist_highlight_color = "#CCCCCC";

		bbb.settings.changed = {};

		// Remove the no settings cookie so that it can display again and signal an account settings check for brand new settings.
		if (getCookie().bbb_no_settings) {
			createCookie("bbb_no_settings", 0, -1);
			createCookie("bbb_acc_check", 1);
		}

		saveData("bbb_settings", JSON.stringify(bbb.user));
	}

	function updateSettings() {
		// Change & save the settings without the panel. Accepts a comma delimited list of alternating settings and values: setting1, value1, setting2, value2
		loadSettings();

		for (var i = 0, il = arguments.length; i < il; i += 2) {
			var setting = arguments[i].split(".");
			var value = arguments[i + 1];
			var settingPath = bbb.user;

			for (var j = 0, jl = setting.length - 1; j < jl; j++)
				settingPath = settingPath[setting[j]];

			settingPath[setting[j]] = value;
			bbb.settings.changed[setting[j]] = true;
		}

		saveSettings();
	}

	function convertSettings(reason) {
		// If the user settings are from an old version, attempt to convert some settings and update the version number. Settings will start conversion at the appropriate case and be allowed to run through every case after it until the end.
		var userVer = bbb.user.bbb_version;
		var scriptVer = bbb.options.bbb_version;

		if (isOldVersion(userVer)) {
			switch (userVer) {
				case "6.0.2":
					if (bbb.user.tag_scrollbars === "false")
						bbb.user.tag_scrollbars = 0;

				case "6.1":
				case "6.2":
				case "6.2.1":
				case "6.2.2":
					// Convert the old hide_original_notice setting to the new show_resized_notice setting that replaces it.
					if (bbb.user.hide_original_notice)
						bbb.user.show_resized_notice = "sample";

					// Set the new show_banned setting to true if show_deleted is true.
					if (bbb.user.show_deleted)
						bbb.user.show_banned = true;

					// Add a custom border for banned posts to match the other hidden post borders.
					if (!/(?:^|\s)status:banned(?:$|\s)/i.test(JSON.stringify(bbb.user.tag_borders)))
						bbb.user.tag_borders.push(newBorder("status:banned", false, "#000000", "solid"));

					// Warn about uninstalling old version from Userscripts.org
					if (reason !== "backup")
						bbbNotice("You have just been updated from a version of this script that was hosted on Userscripts.org. Before continuing any further, please open your userscript manager and remove any versions of this script older than version 6.3 that may be there.", 0);

				case "6.3":
				case "6.3.1":
				case "6.3.2":
				case "6.4":
				case "6.5":
				case "6.5.1":
				case "6.5.2":
				case "6.5.3":
				case "6.5.4":
					// Copy over settings to their new names.
					if (bbb.user.image_drag_scroll)
						bbb.user.post_drag_scroll = bbb.user.image_drag_scroll;

					if (bbb.user.image_resize)
						bbb.user.post_resize = bbb.user.image_resize;

					if (bbb.user.image_resize_mode)
						bbb.user.post_resize_mode = bbb.user.image_resize_mode;

					if (bbb.user.tag_scrollbars)
						bbb.user.post_tag_scrollbars = bbb.user.tag_scrollbars;

					// Convert old settings.
					if (bbb.user.autoscroll_image)
						bbb.user.autoscroll_post = "post";

					if (bbb.user.search_add)
						bbb.user.search_add = "link";

					if (bbb.user.override_account) {
						bbb.user.override_blacklist = "always";
						bbb.user.override_resize = true;
						bbb.user.override_sample = true;
					}

				case "7.0":
				case "7.1":
				case "7.2":
				case "7.2.1":
				case "7.2.2":
				case "7.2.3":
				case "7.2.4":
				case "7.2.5":
				case "7.3":
				case "7.4":
				case "7.4.1":
					if (reason !== "backup")
						bbbNotice("As of version 7.4.1, the options related to hidden/censored posts have been changed to placeholder options due to Danbooru finally fixing their loopholes.", 0);

					deleteData("bbb_thumb_cache");
				case "8.0":
				case "8.0.1":
				case "8.0.2":
				case "8.1":
				case "8.2":
				case "8.2.1":
				case "8.2.2":
					break;
			}

			cleanUser();
			bbb.user.bbb_version = scriptVer;
		}
		else if (userVer !== scriptVer) // Revert the version number for downgrades so that conversion can properly work on the settings again for a future upgrade.
			bbb.user.bbb_version = scriptVer;
	}

	function cleanUser() {
		// Verify the user doesn't have any settings that aren't in the base settings and delete them if they do.
		var user = bbb.user;

		for (var i in user) {
			if (user.hasOwnProperty(i) && typeof(bbb.options[i]) === "undefined")
				delete user[i];
		}
	}

	function eraseSettings() {
		// Try to erase everything.
		var gmList = listData();
		var cookies = getCookie();
		var i, il, keyName; // Loop variables.

		for (i = 0, il = gmList.length; i < il; i++)
			deleteData(gmList[i]);

		for (i = localStorage.length - 1; i >= 0; i--) {
			keyName = localStorage.key(i);

			if (keyName.indexOf("bbb_") === 0)
				localStorage.removeItem(keyName);
		}

		for (i = sessionStorage.length - 1; i >= 0; i--) {
			keyName = sessionStorage.key(i);

			if (keyName.indexOf("bbb_") === 0)
				sessionStorage.removeItem(keyName);
		}

		for (i in cookies) {
			if (cookies.hasOwnProperty(i) && i.indexOf("bbb_") === 0)
				createCookie(i, 0, -1);
		}
	}

	function createBackupText() {
		// Create a plain text version of the settings.
		var textarea = bbb.el.menu.backupTextarea;
		textarea.value = "Better Better Booru v" + bbb.user.bbb_version + " Backup (" + timestamp() + "):\r\n\r\n" + JSON.stringify(bbb.user) + "\r\n";
		textarea.focus();
		textarea.setSelectionRange(0,0);
	}

	function restoreBackupText() {
		// Load the backup text provided into the script.
		var textarea = bbb.el.menu.backupTextarea;
		var backupString = textarea.value.replace(/\r?\n/g, "").match(/\{.+\}/);

		if (backupString) {
			try {
				bbb.user = parseJson(backupString); // This is where we expect an error.
				checkUser(bbb.user, bbb.options);
				convertSettings("backup");
				reloadMenu();
				bbbDialog("Backup settings loaded successfully. After reviewing the settings to ensure they are correct, please click \"save & close\" to finalize the restore.");
			}
			catch (error) {
				if (error instanceof SyntaxError)
					bbbDialog("The backup does not appear to be formatted correctly. Please make sure everything was pasted correctly/completely and that only one backup is provided.");
				else
					bbbDialog("Unexpected error: " + error.message);
			}
		}
		else
			bbbDialog("A backup could not be detected in the text provided. Please make sure everything was pasted correctly/completely.");
	}

	/* Post functions */
	function swapImageInit() {
		// Create the custom elements for swapping between the sample and original images and set them up.
		createSwapElements();

		if (image_swap_mode === "load")
			swapImageLoad();
		else if (image_swap_mode === "view")
			swapImageView();
	}

	function createSwapElements() {
		// Create the elements for swapping between the original and sample image.
		var postInfo = bbb.post.info;

		if (!postInfo.has_large)
			return;

		// Remove the original notice (it's not always there) and replace it with our own.
		var img = document.getElementById("image");
		var imgContainer = document.getElementById("image-container");
		var resizeNotice = document.getElementById("image-resize-notice");

		if (resizeNotice)
			resizeNotice.parentNode.removeChild(resizeNotice);

		var bbbResizeNotice = bbb.el.resizeNotice = document.createElement("div");
		bbbResizeNotice.id = "image-resize-notice";
		bbbResizeNotice.className = "ui-corner-all ui-state-highlight notice notice-resized";
		bbbResizeNotice.style.position = "relative";
		bbbResizeNotice.style.display = "none";
		bbbResizeNotice.innerHTML = '<span id="bbb-resize-status"></span> (<a href="" id="bbb-resize-link"></a>)<span style="display: block;" class="close-button ui-icon ui-icon-closethick" id="close-resize-notice"></span>';

		var resizeStatus = bbb.el.resizeStatus = getId("bbb-resize-status", bbbResizeNotice);
		var resizeLink = bbb.el.resizeLink = getId("bbb-resize-link", bbbResizeNotice);
		var closeResizeNotice = bbb.el.closeResizeNotice = getId("close-resize-notice", bbbResizeNotice);

		closeResizeNotice.addEventListener("click", function(event) {
			if (event.button !== 0)
				return;

			var showResNot = bbb.user.show_resized_notice;

			bbbResizeNotice.style.display = "none";

			if (img.src.indexOf("/sample/") < 0) { // Original image.
				if (showResNot === "original")
					showResNot = "none";
				else if (showResNot === "all")
					showResNot = "sample";

				bbbNotice("Settings updated. The resized notice will now be hidden when viewing original images. You may change this setting under \"notices\" in the settings panel.", 10);
			}
			else { // Sample image.
				if (showResNot === "sample")
					showResNot = "none";
				else if (showResNot === "all")
					showResNot = "original";

				bbbNotice("Settings updated. The resized notice will now be hidden when viewing sample images. You may change this setting under \"notices\" in the settings panel.", 10);
			}

			updateSettings("show_resized_notice", showResNot);
		}, false);

		// Create a swap image link in the sidebar options section.
		var firstOption = document.querySelector("#post-options ul li");

		if (firstOption) {
			var swapListItem = document.createElement("li");

			var swapLink = bbb.el.swapLink = document.createElement("a");
			swapListItem.appendChild(swapLink);

			swapLink.addEventListener("click", function(event) {
				if (event.button !== 0)
					return;

				swapPost();
				event.preventDefault();
			}, false);

			// Prepare the element text, etc.
			swapImageUpdate((load_sample_first ? "sample" : "original"));

			// Add the elements to the document.
			imgContainer.parentNode.insertBefore(bbbResizeNotice, imgContainer);

			firstOption.parentNode.insertBefore(swapListItem, firstOption);
		}
	}

	function swapImageLoad() {
		// Set up the post to load the content before displaying it.
		var postInfo = bbb.post.info;

		if (!postInfo.has_large)
			return;

		var img = document.getElementById("image");
		var bbbLoader = bbb.el.bbbLoader;
		var resizeStatus = bbb.el.resizeStatus;
		var resizeLink = bbb.el.resizeLink;
		var swapLink = bbb.el.swapLink;

		resizeLink.addEventListener("click", function(event) {
			if (event.button !== 0)
				return;

			swapPost();
			event.preventDefault();
		}, false);
		bbbLoader.addEventListener("load", function() { // Change the image to the successfully loaded sample/original image.
			if (!bbb.post.swapped)
				bbb.post.swapped = true;

			if (bbbLoader.src !== "about:blank") {
				img.src = bbbLoader.src;
				bbbLoader.src = "about:blank";
			}
		}, false);
		bbbLoader.addEventListener("error", function(event) { // State the image has failed loading and provide a retry link.
			if (bbbLoader.src !== "about:blank") {
				var currentImg = (bbbLoader.src.indexOf("/sample/") < 0 ? "Original" : "Sample");

				resizeStatus.innerHTML = currentImg + " image loading failed!";
				resizeLink.innerHTML = "retry";
				swapLink.innerHTML = "View " + currentImg.toLowerCase();
				bbbLoader.src = "about:blank";
			}

			event.preventDefault();
		}, false);
		img.addEventListener("load", function() { // Update the swap image elements.
			if (bbbLoader.src === "about:blank") {
				if (img.src.indexOf("/sample/") < 0) // Original image loaded.
					swapImageUpdate("original");
				else // Sample image loaded.
					swapImageUpdate("sample");
			}

			if (bbb.post.swapped)
				resizePost("swap");
		}, false);
	}

	function swapImageView() {
		// Set up the post to display the content as it loads.
		var postInfo = bbb.post.info;

		if (!postInfo.has_large)
			return;

		var img = document.getElementById("image");
		var resizeStatus = bbb.el.resizeStatus;
		var resizeLink = bbb.el.resizeLink;
		var swapLink = bbb.el.swapLink;

		resizeLink.addEventListener("click", function(event) {
			if (event.button !== 0)
				return;

			swapPost();
			event.preventDefault();
		}, false);
		img.addEventListener("error", function(event) { // State the image has failed loading and provide a link to the other image.
			if (img.src !== "about:blank") {
				var currentImg = (img.src.indexOf("/sample/") < 0 ? "Original" : "Sample");
				var otherImg = (currentImg === "Original" ? "sample" : "original");

				resizeStatus.innerHTML = currentImg + " image loading failed!";
				resizeLink.innerHTML = "view " + otherImg;
				swapLink.innerHTML = "View " + otherImg;
			}

			event.preventDefault();
		}, false);
	}

	function noteToggleInit() {
		// Override Danbooru's image click handler for toggling notes with a custom one.
		var image = document.getElementById("image");

		if (!image)
			return;

		image.bbbOverrideClick(function() {
			if (!Danbooru.Note.TranslationMode.active && !bbb.drag_scroll.moved)
				Danbooru.Note.Box.toggle_all();
		});
	}

	function noteToggleLinkInit() {
		// Make a "toggle notes" link in the sidebar options or prepare an existing link.
		var toggleLink = document.getElementById("bbb-note-toggle");

		if (!toggleLink) {
			var before = document.getElementById((isLoggedIn() ? "add-notes-list" : "random-post"));

			if (before) {
				var listNoteToggle = document.createElement("li");
				listNoteToggle.innerHTML = '<a href="#" id="bbb-note-toggle">Toggle notes</a>';
				before.parentNode.insertBefore(listNoteToggle, before);
				toggleLink = document.getElementById("bbb-note-toggle");
			}
		}

		if (toggleLink) {
			document.getElementById("bbb-note-toggle").addEventListener("click", function(event) {
				if (event.button !== 0)
					return;

				Danbooru.Note.Box.toggle_all();
				event.preventDefault();
			}, false);
		}
	}

	function translationModeInit() {
		// Set up translation mode.
		var postInfo = bbb.post.info;
		var postContent = getPostContent();
		var postEl = postContent.el;
		var postTag = (postEl ? postEl.tagName : undefined);
		var translateLink = document.getElementById("translate");
		var toggleFunction; // If/else variable.

		if (postInfo.file_ext !== "webm" && postInfo.file_ext !== "mp4" && postInfo.file_ext !== "swf") { // Don't allow translation functions on videos or flash.
			if (postTag !== "VIDEO") { // Make translation mode work on non-video content.
				// Set up/override the translate link and hotkey if notes aren't locked.
				if (!document.getElementById("note-locked-notice") && translateLink) {
					translateLink.bbbOverrideClick(Danbooru.Note.TranslationMode.toggle);
					createHotkey("78", Danbooru.Note.TranslationMode.toggle);
				}
			}
			else { // Allow note viewing on ugoira webm video samples, but don't allow editing.
				toggleFunction = function(event) {
					bbbNotice('Note editing is not allowed while using the ugoira video sample. Please use the <a href="' + updateURLQuery(location.href, {original: "1"}) + '">original</a> ugoira version for note editing.', -1);
					event.preventDefault();
				};

				Danbooru.Note.TranslationMode.start = toggleFunction;
				Danbooru.Note.Edit.show = toggleFunction;

				if (translateLink)
					translateLink.bbbOverrideClick(toggleFunction);

				createHotkey("78", toggleFunction); // Override the hotkey for "N".
			}
		}
		else { // Provide a warning for unsupported content.
			toggleFunction = function(event) {
				bbbNotice('Note editing is not allowed on flash/video content.', -1);
				event.preventDefault();
			};

			Danbooru.Note.TranslationMode.start = toggleFunction;
			Danbooru.Note.Edit.show = toggleFunction;

			if (translateLink)
				translateLink.bbbOverrideClick(toggleFunction);

			createHotkey("78", toggleFunction); // Override the hotkey for "N".
		}
	}

	function disableEmbeddedNotes() {
		// Disable embedded notes for viewing and re-enable them for note editing.
		var useEmbedded = (getMeta("post-has-embedded-notes") === "true");
		var noteContainer = document.getElementById("note-container");
		var notesSection = document.getElementById("notes");
		var notes = (notesSection ? notesSection.getElementsByTagName("article") : undefined);

		if (!disable_embedded_notes || !useEmbedded || !notes[0])
			return;

		Danbooru.Note.embed = false;

		var postInfo = bbb.post.info;
		var postContent = getPostContent();
		var postEl = postContent.el;
		var postTag = (postEl ? postEl.tagName : undefined);
		var notLocked = !document.getElementById("note-locked-notice");

		// Stop here for content that doesn't allow note editing.
		if (postInfo.file_ext === "webm" || postInfo.file_ext === "mp4" || postInfo.file_ext === "swf" || postTag === "VIDEO")
			return;

		// Save the original note functions.
		var origEditFunction = Danbooru.Note.Edit.show;

		// Create override functions.
		var toggleFunction = function(event) {
			var translateLink = document.getElementById("translate");

			if (event.type === "click" && (event.target !== translateLink || event.button !== 0))
				return;

			resetFunction();

			if (notLocked)
				Danbooru.Note.TranslationMode.toggle(event);

			event.preventDefault();
			event.stopPropagation();
		};

		var editFunction = function(editTarget) { // This function is actually assigned under an anonymous function in Danbooru. The first argument is an element from the div.
			resetFunction();
			origEditFunction(editTarget);
		};

		var resetFunction = function() {
			// Remove all overrides/overwrites.
			Danbooru.Note.Edit.show = origEditFunction;
			document.removeEventListener("click", toggleFunction, true);

			if (notLocked)
				createHotkey("78", Danbooru.Note.TranslationMode.toggle);
			else
				removeHotkey("78");

			// Reset notes with embedded notes enabled.
			Danbooru.Note.embed = true;
			noteContainer.innerHTML = "";
			Danbooru.Note.load_all("bbb");
		};

		document.addEventListener("click", toggleFunction, true); // Override all other click events for the translate link.
		createHotkey("78", toggleFunction); // Override the hotkey for "N".
		Danbooru.Note.Edit.show = editFunction; // Overwrite the note edit function.
	}

	function alternateImageSwap() {
		// Override Danbooru's image click handler for toggling notes with a custom one that swaps the image.
		var postInfo = bbb.post.info;
		var image = document.getElementById("image");

		if (postInfo.has_large && image) {
			image.bbbOverrideClick(function() {
				if (!Danbooru.Note.TranslationMode.active && !bbb.drag_scroll.moved)
						swapPost();
			});
		}

		// Set up the "toggle notes" link since the image won't be used for toggling.
		noteToggleLinkInit();
	}

	function fixOptionsSection() {
		// Fix the sidebar options section for logged out users.
		if (isLoggedIn())
			return;

		var postInfo = bbb.post.info;
		var optionsSection = document.getElementById("post-options");

		optionsSection.innerHTML = '<h1>Options</h1><ul><li><a href="#" id="image-resize-to-window-link">Resize to window</a></li><li>Download</li><li><a id="random-post" href="http://danbooru.donmai.us/posts/random">Random post</a></li>' + (postInfo.preview_file_url ? '<li><a href="http://danbooru.iqdb.org/db-search.php?url=http://danbooru.donmai.us' + postInfo.preview_file_url + '">Find similar</a></li>' : '') + '</ul>';
	}

	function addRandomPostLink() {
		// Add the random post link and hotkey back to posts.
		var optionListItem = document.getElementById("add-to-pool-list") || document.getElementById("add-notes-list") || document.getElementById("add-artist-commentary-list");

		if (!optionListItem || !add_random_post_link || gLoc !== "post")
			return;

		// Create the link.
		var searchTags = getVar("tags");

		var randomListItem = document.createElement("li");
		randomListItem.id = "random-post-list";

		var randomLink = document.createElement("a");
		randomLink.id = "random-post";
		randomLink.href = "/posts/random" + (searchTags ? "?tags=" + searchTags : "");
		randomLink.innerHTML = "Random post";
		randomListItem.appendChild(randomLink);

		optionListItem.parentNode.insertBefore(randomListItem, optionListItem);

		// Create the hotkey.
		function randomHotkey() {
			location.href = randomLink.href;
		}

		createHotkey("82", randomHotkey); // R
	}

	function fixPostDownloadLinks() {
		// Fix the "size" and "download" links in the sidebar by creating the download link for logged out users (when able) and handling tagged filenames as necessary for all users.
		var postInfo = bbb.post.info;
		var i, il; // Loop variables.

		// Fix the "size" link.
		var sizeItem = getInfoList("size");

		if (sizeItem) {
			var sizeText = sizeItem.textContent.match(/^(\s*Size:\s+)([\d\.]+\s+\S+)(\s+[\s\S]+)$/i);

			if (sizeText)
				sizeItem.innerHTML = sizeText[1] + '<a href="' + postInfo.file_img_src + '">' + sizeText[2] + '</a>' + sizeText[3];
		}

		// Fix the "download" link.
		var optionsSection = document.getElementById("post-options");

		if (optionsSection) {
			var optionItems = optionsSection.getElementsByTagName("li");
			var downloadRegex = /^\s*Download\s*$/i;

			for (i = 0, il = optionItems.length; i < il; i++) {
				var optionItem = optionItems[i];

				if (downloadRegex.test(optionItem.textContent)) {
					optionItem.innerHTML = '<a download="' + postInfo.tag_string_desc + " - " + postInfo.md5 + '.' + postInfo.file_ext + '" href="' + postInfo.file_img_src + '?download=1">Download</a>';
					break;
				}
			}
		}
	}

	function modifyResizeLink() {
		// Replace the single resize link with three custom resize links.
		var resizeListLink = document.getElementById("image-resize-to-window-link");

		if (!resizeListLink)
			return;

		var resizeListItem = resizeListLink.parentNode;
		var resizeListParent = resizeListItem.parentNode;
		var optionsFrag = document.createDocumentFragment();

		var resizeLinkAll = bbb.el.resizeLinkAll = document.createElement("a");
		resizeLinkAll.href = "#";
		resizeLinkAll.addEventListener("click", function(event) {
			if (event.button !== 0)
				return;

			resizePost("all");
			event.preventDefault();
		}, false);

		var resizeLinkWidth = bbb.el.resizeLinkWidth = document.createElement("a");
		resizeLinkWidth.href = "#";
		resizeLinkWidth.addEventListener("click", function(event) {
			if (event.button !== 0)
				return;

			resizePost("width");
			event.preventDefault();
		}, false);

		var resizeLinkHeight = bbb.el.resizeLinkHeight = document.createElement("a");
		resizeLinkHeight.href = "#";
		resizeLinkHeight.addEventListener("click", function(event) {
			if (event.button !== 0)
				return;

			resizePost("height");
			event.preventDefault();
		}, false);

		if (resize_link_style === "full") {
			var resizeListAll = document.createElement("li");
			optionsFrag.appendChild(resizeListAll);

			resizeLinkAll.innerHTML = "Resize to window";
			resizeListAll.appendChild(resizeLinkAll);

			var resizeListWidth = document.createElement("li");
			optionsFrag.appendChild(resizeListWidth);

			resizeLinkWidth.innerHTML = "Resize to window width";
			resizeListWidth.appendChild(resizeLinkWidth);

			var resizeListHeight = document.createElement("li");
			optionsFrag.appendChild(resizeListHeight);

			resizeLinkHeight.innerHTML = "Resize to window height";
			resizeListHeight.appendChild(resizeLinkHeight);

			resizeListParent.replaceChild(optionsFrag, resizeListItem);
		}
		else if (resize_link_style === "minimal") {
			var resizeList = document.createElement("li");
			optionsFrag.appendChild(resizeList);

			var resizeLabelLink = document.createElement("a");
			resizeLabelLink.href = "#";
			resizeLabelLink.innerHTML = "Resize:";
			resizeLabelLink.style.marginRight = "2px";
			resizeLabelLink.addEventListener("click", function(event) {
				if (event.button !== 0)
					return;

				if (bbb.post.resize.mode === "none")
					resizePost("all");
				else
					resizePost("none");

				event.preventDefault();
			}, false);
			resizeList.appendChild(resizeLabelLink);

			resizeLinkAll.innerHTML = "(W&H)";
			resizeLinkAll.className = "bbb-resize-link";
			resizeLinkAll.title = "Resize to Window Width & Height";
			resizeList.appendChild(resizeLinkAll);

			resizeLinkWidth.innerHTML = "(W)";
			resizeLinkWidth.className = "bbb-resize-link";
			resizeLinkWidth.title = "Resize to Window Width";
			resizeList.appendChild(resizeLinkWidth);

			resizeLinkHeight.innerHTML = "(H)";
			resizeLinkHeight.className = "bbb-resize-link";
			resizeLinkHeight.title = "Resize to Window Height";
			resizeList.appendChild(resizeLinkHeight);

			resizeList.style.height = "0px";
			resizeList.style.visibility = "hidden";
			resizeList.style.fontWeight = "bold";
			resizeList.style.position = "relative";

			resizeListParent.insertBefore(resizeList, resizeListItem);

			var allWidth = resizeLinkAll.clientWidth;
			var widthWidth = resizeLinkWidth.clientWidth;
			var heightWidth = resizeLinkHeight.clientWidth;

			resizeLinkAll.style.width = allWidth + "px";
			resizeLinkWidth.style.width = widthWidth + "px";
			resizeLinkHeight.style.width = heightWidth + "px";

			resizeList.style.height = "auto";
			resizeList.style.visibility = "visible";
			resizeList.style.fontWeight = "normal";

			resizeListParent.removeChild(resizeListItem);
		}
	}

	function resizePost(mode) {
		// Custom resize post script.
		var postContent = getPostContent();
		var imgContainer = postContent.container;
		var contentDiv = document.getElementById("content");
		var ugoiraPanel = document.getElementById("ugoira-control-panel");
		var ugoiraSlider = document.getElementById("seek-slider");
		var target = postContent.el;
		var targetTag = (target ? target.tagName : undefined);

		if (!target || !imgContainer || !contentDiv || targetTag === "A")
			return;

		var currentMode = bbb.post.resize.mode;
		var currentRatio = bbb.post.resize.ratio;
		var resizeLinkAll = bbb.el.resizeLinkAll;
		var resizeLinkWidth = bbb.el.resizeLinkWidth;
		var resizeLinkHeight = bbb.el.resizeLinkHeight;
		var availableWidth = imgContainer.clientWidth || contentDiv.clientWidth - contentDiv.bbbGetPadding().width;
		var availableHeight = document.documentElement.clientHeight - 10;
		var targetCurrentWidth = target.clientWidth || parseFloat(target.style.width) || target.getAttribute("width");
		var targetCurrentHeight = target.clientHeight || parseFloat(target.style.height) || target.getAttribute("height");
		var useDataDim = targetTag === "EMBED" || targetTag === "VIDEO";
		var targetWidth = (useDataDim ? imgContainer.bbbInfo("width") : target.getAttribute("width")); // Was NOT expecting target.width to return the current width (css style width) and not the width attribute's value here...
		var targetHeight = (useDataDim ? imgContainer.bbbInfo("height") : target.getAttribute("height"));
		var tooWide = targetCurrentWidth > availableWidth;
		var tooTall = targetCurrentHeight > availableHeight;
		var widthRatio = availableWidth / targetWidth;
		var heightRatio = availableHeight / targetHeight;
		var imgMode = mode;
		var switchMode = false;
		var ratio = 1;
		var linkWeight = {all: "normal", width: "normal", height: "normal"};

		if (mode === "swap") { // The image is being swapped between the original and sample image so everything needs to be reset. Ignore the current mode.
			switchMode = true;
			imgMode = "none";
		}
		else if (mode === currentMode || mode === "none" || (mode === "width" && widthRatio >= 1) || (mode === "height" && heightRatio >= 1) || (mode === "all" && widthRatio >= 1 && heightRatio >= 1)) { // Cases where resizing is being toggled off or isn't needed.
			if (currentMode !== "none") { // No need to do anything if the content is already at the original dimensions.
				switchMode = true;
				imgMode = "none";
			}
		}
		else if (mode === "height" && (tooTall || currentMode !== "none")) {
			switchMode = true;
			ratio = heightRatio;
			linkWeight.height = "bold";
		}
		else if (mode === "width" && (tooWide || currentMode !== "none")) {
			switchMode = true;
			ratio = widthRatio;
			linkWeight.width = "bold";
		}
		else if (mode === "all" && (tooWide || tooTall || currentMode !== "none")) {
			switchMode = true;
			ratio = (widthRatio < heightRatio ? widthRatio : heightRatio);
			linkWeight.all = "bold";
		}

		if (switchMode) {
			if (currentRatio !== ratio || mode === "swap") {
				if (targetTag === "IMG" || targetTag === "CANVAS") {
					target.style.width = targetWidth * ratio + "px";
					target.style.height = targetHeight * ratio + "px";

					if (ugoiraPanel && ugoiraSlider) {
						ugoiraPanel.style.width = targetWidth * ratio + "px";
						ugoiraSlider.style.width = targetWidth * ratio - 81 + "px";
					}

					Danbooru.Note.Box.scale_all();
				}
				else if (targetTag === "EMBED") {
					var secondaryTarget = postContent.secEl;

					secondaryTarget.height = target.height = targetHeight * ratio;
					secondaryTarget.width = target.width = targetWidth * ratio;
				}
				else if (targetTag === "VIDEO") {
					target.height = targetHeight * ratio;
					target.width = targetWidth * ratio;
				}
			}

			bbb.post.resize.mode = imgMode;
			bbb.post.resize.ratio = ratio;
			resizeLinkAll.style.fontWeight = linkWeight.all;
			resizeLinkWidth.style.fontWeight = linkWeight.width;
			resizeLinkHeight.style.fontWeight = linkWeight.height;
		}
	}

	function swapPost() {
		// Initiate the swap between the sample and original post content.
		var postInfo = bbb.post.info;
		var target = getPostContent().el;
		var targetTag = (target ? target.tagName : undefined);
		var bbbLoader = bbb.el.bbbLoader;
		var resizeStatus = bbb.el.resizeStatus;
		var resizeLink = bbb.el.resizeLink;
		var swapLink = bbb.el.swapLink;

		if (!postInfo.has_large)
			return;

		if (postInfo.file_ext === "zip" && /(?:^|\s)ugoira(?:$|\s)/.test(postInfo.tag_string)) {
			if (targetTag === "CANVAS")
				location.href = updateURLQuery(location.href, {original: "0"});
			else if (targetTag === "VIDEO")
				location.href = updateURLQuery(location.href, {original: "1"});
		}
		else if (targetTag === "IMG") {
			if (image_swap_mode === "load") { // Load image and then view mode.
				if (bbbLoader.src !== "about:blank") { // Messages after cancelling.
					if (target.src.indexOf("/sample/") < 0)
						swapImageUpdate("original");
					else
						swapImageUpdate("sample");

					bbbLoader.src = "about:blank";
				}
				else { // Messages during loading.
					if (target.src.indexOf("/sample/") < 0) {
						resizeStatus.innerHTML = "Loading sample image...";
						resizeLink.innerHTML = "cancel";
						swapLink.innerHTML = "View sample (cancel)";
						bbbLoader.src = postInfo.large_file_img_src;
					}
					else {
						resizeStatus.innerHTML = "Loading original image...";
						resizeLink.innerHTML = "cancel";
						swapLink.innerHTML = "View original (cancel)";
						bbbLoader.src = postInfo.file_img_src;
					}
				}
			}
			else if (image_swap_mode === "view") { // View image while loading mode.
				if (target.src.indexOf("/sample/") < 0) { // Load the sample image.
					swapImageUpdate("sample");
					target.src = "about:blank";
					target.removeAttribute("src");
					delayMe(function() { target.src = postInfo.large_file_img_src; });
				}
				else { // Load the original image.
					swapImageUpdate("original");
					target.src = "about:blank";
					target.removeAttribute("src");
					delayMe(function() { target.src = postInfo.file_img_src; });
				}

				if (!bbb.post.swapped)
					delayMe(function() { resizePost("swap"); });
				else
					bbb.post.swapped = true;
			}
		}
	}

	function swapImageUpdate(mode) {
		// Update all the elements related to swapping images when the image URL is changed.
		var postInfo = bbb.post.info;
		var img = document.getElementById("image");
		var bbbResizeNotice = bbb.el.resizeNotice;
		var resizeStatus = bbb.el.resizeStatus;
		var resizeLink = bbb.el.resizeLink;
		var swapLink = bbb.el.swapLink;
		var showResNot = bbb.user.show_resized_notice;

		if (mode === "original") { // When the image is changed to the original image.
			resizeStatus.innerHTML = "Viewing original";
			resizeLink.innerHTML = "view sample";
			resizeLink.href = postInfo.large_file_img_src;
			swapLink.innerHTML = "View sample";
			swapLink.href = postInfo.large_file_img_src;
			img.setAttribute("height", postInfo.image_height);
			img.setAttribute("width", postInfo.image_width);
			bbbResizeNotice.style.display = (showResNot === "original" || showResNot === "all" ? "block" : "none");
		}
		else if (mode === "sample") { // When the image is changed to the sample image.
			resizeStatus.innerHTML = "Resized to " + Math.floor(postInfo.large_ratio * 100) + "% of original";
			resizeLink.innerHTML = "view original";
			resizeLink.href = postInfo.file_img_src;
			swapLink.innerHTML = "View original";
			swapLink.href = postInfo.file_img_src;
			img.setAttribute("height", postInfo.large_height);
			img.setAttribute("width", postInfo.large_width);
			bbbResizeNotice.style.display = (showResNot === "sample" || showResNot === "all" ? "block" : "none");
		}
	}

	function checkRelations() {
		// Test whether the parent/child notice could have hidden posts.
		var postInfo = bbb.post.info;
		var loggedIn = isLoggedIn();
		var fixParent = false;
		var fixChild = false;
		var relationCookie = getCookie()["show-relationship-previews"];
		var showPreview = (relationCookie === undefined || relationCookie === "1");
		var parentLink = document.getElementById("has-children-relationship-preview-link");
		var childLink = document.getElementById("has-parent-relationship-preview-link");
		var thumbCount, deletedCount; // If/else variable.

		if (postInfo.has_children) {
			var parentNotice = document.getElementsByClassName("notice-parent")[0];

			if (parentNotice) {
				var parentText = parentNotice.textContent.match(/has (\d+|a) child/);
				var parentCount = (parentText ? Number(parentText[1]) || 1 : 0);
				thumbCount = getPosts(parentNotice).length;
				deletedCount = parentNotice.getElementsByClassName("post-status-deleted").length;

				if ((!loggedIn && show_deleted && !deletedCount) || (parentCount && parentCount + 1 !== thumbCount))
					fixParent = true;
			}
			else if (show_deleted)
				fixParent = true;
		}

		if (fixParent) {
			if (showPreview || !parentLink)
				searchJSON("parent", postInfo.id);
			else
				parentLink.addEventListener("click", requestRelations, false);
		}

		if (postInfo.parent_id) {
			var childNotice = document.getElementsByClassName("notice-child")[0];

			if (childNotice) {
				var childText = childNotice.textContent.match(/has (\d+|a) sibling/);
				var childCount = (childText ? Number(childText[1]) || 1 : 0) + 1;
				thumbCount = getPosts(childNotice).length;
				deletedCount = childNotice.getElementsByClassName("post-status-deleted").length;

				if ((!loggedIn && show_deleted && !deletedCount) || (childCount && childCount + 1 !== thumbCount))
					fixChild = true;
			}
		}

		if (fixChild) {
			if (showPreview || !childLink)
				searchJSON("child", postInfo.parent_id);
			else
				childLink.addEventListener("click", requestRelations, false);
		}
	}

	function requestRelations(event) {
		// Start the parent/child notice JSON request when the user chooses to display the thumbs in a notice.
		if (event.button !== 0)
			return;

		var postInfo = bbb.post.info;
		var target = event.target;

		if (target.id === "has-children-relationship-preview-link")
			searchJSON("parent", postInfo.id);
		else if (target.id === "has-parent-relationship-preview-link")
			searchJSON("child", postInfo.parent_id);

		target.removeEventListener("click", requestRelations, false);
		event.preventDefault();
	}

	function removeTagHeaders() {
		// Remove the "copyright", "characters", and "artist" headers in the post sidebar.
		var tagList = document.getElementById("tag-list");

		if (!tagList || !remove_tag_headers || gLoc !== "post")
			return;

		var tagHolder = document.createDocumentFragment();
		var childIndex = 0;
		var mainList; // If/else variable.

		while (tagList.children[childIndex]) {
			var header = tagList.children[childIndex];
			var list = tagList.children[childIndex + 1];

			if (header.tagName === "H2" && list && list.tagName === "UL") {
				tagList.removeChild(header);
				tagList.removeChild(list);

				while (list.firstElementChild)
					tagHolder.appendChild(list.firstElementChild);
			}
			else if (header.tagName === "H1" && list && list.tagName === "UL") {
				mainList = list;
				childIndex += 2;
			}
			else
				childIndex++;
		}

		if (mainList)
			mainList.insertBefore(tagHolder, mainList.firstElementChild);
		else {
			var newHeader = document.createElement("h1");
			newHeader.innerHTML = "Tags";
			tagList.appendChild(newHeader);

			var newList = document.createElement("ul");
			newList.appendChild(tagHolder);
			tagList.appendChild(newList);
		}
	}

	function postTagTitles() {
		// Replace the post title with the full set of tags.
		if (post_tag_titles && gLoc === "post")
			document.title = document.bbbInfo("tags").replace(/\s/g, ", ").replace(/_/g, " ") + " - Danbooru";
	}

	function minimizeStatusNotices() {
		// Show status notices only when their respective status link is clicked in the sidebar.
		if (!minimize_status_notices || gLoc !== "post")
			return;

		var statusListItem = getInfoList("status");
		var flaggedNotice = document.getElementsByClassName("notice-flagged")[0];
		var appealedNotice = document.getElementsByClassName("notice-appealed")[0];
		var pendingNotice = document.getElementsByClassName("notice-pending")[0];
		var deletedNotices = document.getElementsByClassName("notice-deleted");
		var i, il, newStatusContent, deletedNotice, bannedNotice; // Loop variables.

		// Create the appropriate status links.
		if (statusListItem) {
			newStatusContent = statusListItem.textContent;

			if (flaggedNotice)
				newStatusContent = newStatusContent.replace("Flagged", '<a href="#" id="bbb-flagged-link">Flagged</a>');

			if (pendingNotice)
				newStatusContent = newStatusContent.replace("Pending", '<a href="#" id="bbb-pending-link">Pending</a>');

			for (i = 0, il = deletedNotices.length; i < il; i++) {
				if (deletedNotices[i].textContent.indexOf("This post was deleted") > -1) {
					deletedNotice = deletedNotices[i];
					newStatusContent = newStatusContent.replace("Deleted", '<a href="#" id="bbb-deleted-link">Deleted</a>');
				}
				else {
					bannedNotice = deletedNotices[i];
					newStatusContent = newStatusContent.replace("Banned", '<a href="#" id="bbb-banned-link">Banned</a>');
				}
			}

			if (appealedNotice)
				newStatusContent = newStatusContent + ' <a href="#" id="bbb-appealed-link">Appealed</a>';

			statusListItem.innerHTML = newStatusContent;
		}

		// Prepare the links and notices.
		var flaggedLink = document.getElementById("bbb-flagged-link");
		var appealedLink = document.getElementById("bbb-appealed-link");
		var pendingLink = document.getElementById("bbb-pending-link");
		var deletedLink = document.getElementById("bbb-deleted-link");
		var bannedLink = document.getElementById("bbb-banned-link");

		if (flaggedLink)
			infoLinkNotice(flaggedLink, flaggedNotice);
		if (appealedLink)
			infoLinkNotice(appealedLink, appealedNotice);
		if (pendingLink)
			infoLinkNotice(pendingLink, pendingNotice);
		if (deletedLink)
			infoLinkNotice(deletedLink, deletedNotice);
		if (bannedLink)
			infoLinkNotice(bannedLink, bannedNotice);
	}

	function moveRelationNotices() {
		// Move/minimize the parent and/or child notices as desired.
		var childNotice = document.getElementsByClassName("notice-child")[0];
		var parentNotice = document.getElementsByClassName("notice-parent")[0];

		if (move_relation_notices === "disabled" || gLoc !== "post" || (!childNotice && !parentNotice))
			return;

		if (move_relation_notices === "below") {
			var imgContainer = document.getElementById("image-container");
			var containerSibling = imgContainer.nextSibling;
			var containerParent = imgContainer.parentNode;

			if (parentNotice)
				containerParent.insertBefore(parentNotice, containerSibling);
			if (childNotice)
				containerParent.insertBefore(childNotice, parentNotice || containerSibling);

			imgContainer.style.marginBottom = "0.5em";
		}
		else if (move_relation_notices === "minimize") {
			var infoList = getInfoList();
			var relationItem = getInfoList("relations") || document.createElement("li");
			var relationHTML = "Relations: ";

			if (childNotice)
				relationHTML += '<a href="#" id="bbb-child-link">Parent</a> ';
			if (parentNotice)
				relationHTML += '<a href="#" id="bbb-parent-link">Children</a>';

			relationItem.innerHTML = relationHTML;
			infoList.appendChild(relationItem);

			var childLink = document.getElementById("bbb-child-link");
			var parentLink = document.getElementById("bbb-parent-link");

			if (childLink)
				infoLinkNotice(childLink, childNotice);
			if (parentLink)
				infoLinkNotice(parentLink, parentNotice);
		}
	}

	function infoLinkNotice(link, notice) {
		// Attach events to the info links to enable a tooltip style notice.
		var hideNotice = function() {
			bbb.timers.minNotice = window.setTimeout(function() {
				notice.style.display = "none";
			}, 200);
		};

		link.addEventListener("click", function(event) {
			if (event.button === 0)
				showStatusNotice(event, notice);
		}, false);
		link.addEventListener("mouseout", hideNotice, false);
		notice.addEventListener("mouseover", function() { window.clearTimeout(bbb.timers.minNotice); }, false);
		notice.addEventListener("mouseleave", hideNotice, false);
	}

	function showStatusNotice(event, noticeEl) {
		// Display a minimized status notice upon a click event.
		var x = event.pageX;
		var y = event.pageY;
		var notice = noticeEl;
		var topOffset = 0;

		notice.style.maxWidth = document.documentElement.clientWidth * 0.66 + "px";
		notice.style.visibility = "hidden";
		notice.style.display = "block";

		// Don't allow the notice to go above the top of the window.
		if (event.clientY - notice.offsetHeight - 2 < 5)
			topOffset = event.clientY - notice.offsetHeight - 7;

		notice.style.left = x + 2 + "px";
		notice.style.top = y - notice.offsetHeight - 2 - topOffset + "px";
		notice.style.visibility = "visible";

		event.preventDefault();
	}

	function dragScrollInit() {
		// Start up drag scroll.
		if (!post_drag_scroll)
			return;

		var target = getPostContent().el;
		var targetTag = (target ? target.tagName : undefined);

		if (targetTag === "IMG" || targetTag === "VIDEO" || targetTag === "CANVAS") {
			bbb.drag_scroll.target = target;

			if (!Danbooru.Note.TranslationMode.active)
				dragScrollEnable();

			var startFunction = Danbooru.Note.TranslationMode.start;
			var stopFunction = Danbooru.Note.TranslationMode.stop;

			Danbooru.Note.TranslationMode.start = function(event) {
				startFunction(event);
				dragScrollToggle();
			};

			Danbooru.Note.TranslationMode.stop = function(event) {
				stopFunction(event);
				dragScrollToggle();
			};

			// Disable click behavior when dragging the video around.
			if (targetTag === "VIDEO") {
				target.parentNode.addEventListener("click", function(event) {
					if (event.button === 0 && event.target.id === "image" && bbb.drag_scroll.moved)
						event.preventDefault();
				}, true);
			}
		}
	}

	function dragScrollToggle() {
		// Enable drag scroll with translation mode is off and disable it when translation mode is on.
		if (!post_drag_scroll || !bbb.drag_scroll.target)
			return;

		if (Danbooru.Note.TranslationMode.active)
			dragScrollDisable();
		else
			dragScrollEnable();
	}

	function dragScrollEnable() {
		// Add the drag scroll event listeners.
		var target = bbb.drag_scroll.target;

		target.addEventListener("mousedown", dragScrollOn, false);
		target.addEventListener("dragstart", disableEvent, false);
		target.addEventListener("selectstart", disableEvent, false);
	}

	function dragScrollDisable() {
		// Remove the drag scroll event listeners.
		var target = bbb.drag_scroll.target;

		target.removeEventListener("mousedown", dragScrollOn, false);
		target.removeEventListener("dragstart", disableEvent, false);
		target.removeEventListener("selectstart", disableEvent, false);
	}

	function dragScrollOn(event) {
		// Start monitoring mouse movement.
		if (event.button === 0) {
			bbb.drag_scroll.lastX = event.clientX;
			bbb.drag_scroll.lastY = event.clientY;
			bbb.drag_scroll.moved = false;

			document.addEventListener("mousemove", dragScrollMove, false);
			document.addEventListener("mouseup", dragScrollOff, false);
		}
	}

	function dragScrollMove(event) {
		// Move the page based on mouse movement.
		var newX = event.clientX;
		var newY = event.clientY;
		var xDistance = bbb.drag_scroll.lastX - newX;
		var yDistance = bbb.drag_scroll.lastY - newY;

		window.scrollBy(xDistance, yDistance);

		bbb.drag_scroll.lastX = newX;
		bbb.drag_scroll.lastY = newY;
		bbb.drag_scroll.moved = xDistance !== 0 || yDistance !== 0 || bbb.drag_scroll.moved; // Doing this since I'm not sure what Chrome's mousemove event is doing. It apparently fires even when the moved distance is equal to zero.
	}

	function dragScrollOff() {
		// Stop monitoring mouse movement.
		document.removeEventListener("mousemove", dragScrollMove, false);
		document.removeEventListener("mouseup", dragScrollOff, false);
	}

	function disableEvent(event) {
		// removeEventListener friendly function for stopping an event.
		event.preventDefault();
	}

	function autoscrollPost() {
		// Automatically scroll a post to the desired position.
		var scrolled = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

		if (autoscroll_post === "none" || scrolled !== 0) // Don't scroll if the page is already srolled.
			return;

		if (autoscroll_post === "post") {
			var target = getPostContent().el;

			if (target)
				target.scrollIntoView();
		}
		else if (autoscroll_post === "header") {
			var page = document.getElementById("page");

			if (!page)
				return;

			var pageTop = page.offsetTop;

			window.scroll(0, pageTop);
		}
	}

	function videoVolume() {
		// Set the volume of video posts to a specified level.
		var vid = document.getElementById("image");

		if (video_volume === "disabled" || !vid || vid.tagName !== "VIDEO")
			return;

		if (video_volume === "muted")
			vid.muted = true;
		else if (video_volume === "remember") {
			vid.volume = video_volume_data.level;
			vid.muted = video_volume_data.muted;

			vid.addEventListener("volumechange", function() {
				// Save volume changes half a second after changes stop.
				if (bbb.timers.saveVideoVolume)
					window.clearTimeout(bbb.timers.saveVideoVolume);

				bbb.timers.saveVideoVolume = window.setTimeout( function() {
					loadSettings();
					bbb.user.video_volume_data.level = vid.volume;
					bbb.user.video_volume_data.muted = vid.muted;
					bbb.timers.saveVideoVolume = 0;
					saveSettings();
				}, 500);
			}, false);
		}
		else // Percent values.
			vid.volume = video_volume;
	}

	/* Thumbnail functions */
	function formatThumbnails(target) {
		// Create thumbnail titles and borders.
		var posts = getPosts(target);
		var i, il; // Loop variables.

		if (!posts[0])
			return;

		var searches = bbb.custom_tag.searches;

		// Create and cache border search objects.
		if (custom_tag_borders && !searches[0]) {
			for (i = 0, il = tag_borders.length; i < il; i++)
				searches.push(createSearch(tag_borders[i].tags));
		}

		// Cycle through each post and apply titles and borders.
		for (i = 0, il = posts.length; i < il; i++) {
			var post = posts[i];
			var postSibling = post.nextSibling;
			var img = post.getElementsByTagName("img")[0];

			// Clean out text nodes between thumbnail articles.
			if (postSibling && postSibling.nodeType === 3)
				postSibling.parentNode.removeChild(postSibling);

			if (!img)
				continue;

			var postInfo = post.bbbInfo();
			var link = img.bbbParent("A", 3);
			var tagsStr = postInfo.tag_string || "";
			var userStr = (postInfo.uploader_name ? " user:" + postInfo.uploader_name : "");
			var ratingStr = (postInfo.rating ? " rating:" + postInfo.rating : "");
			var scoreStr = (typeof(postInfo.score) === "number" ? " score:" + postInfo.score : "");
			var titleStr = tagsStr + userStr + ratingStr + scoreStr;
			var titleAttr = (getMeta("disable-post-tooltips") === "false" ? "oldtitle" : "title");
			var secondary = [];
			var secondaryLength = 0;
			var styleList = bbb.custom_tag.style_list;
			var borderStyle; // If/else variable.

			// Skip thumbnails that have already been done.
			if (link.bbbHasClass("bbb-thumb-link"))
				continue;

			// Create title information.
			img.setAttribute(titleAttr, titleStr);

			// Add custom data attributes.
			post.bbbInfo("file-url-desc", postInfo.file_url_desc);

			// Give the thumbnail link an identifying class.
			link.bbbAddClass("bbb-thumb-link");

			// Give the post container an ID class for resolving cases where the same post shows up on the page multiple times.
			post.bbbAddClass("post_" + postInfo.id);

			// Correct parent status borders on "no active children" posts for logged out users.
			if (postInfo.has_children && show_deleted)
				post.bbbAddClass("post-status-has-children");

			// Secondary custom tag borders.
			if (custom_tag_borders) {
				if (typeof(styleList[postInfo.id]) === "undefined") {
					for (var j = 0, jl = tag_borders.length; j < jl; j++) {
						var tagBorderItem = tag_borders[j];

						if (tagBorderItem.is_enabled && thumbSearchMatch(post, searches[j])) {
							secondary.push([tagBorderItem.border_color, tagBorderItem.border_style]);

							if (secondary.length === 4)
								break;
						}
					}

					secondaryLength = secondary.length;

					if (secondaryLength) {
						link.bbbAddClass("bbb-custom-tag");

						if (secondaryLength === 1 || (single_color_borders && secondaryLength > 1))
							borderStyle = "border-color: " + secondary[0][0] + " !important; border-style: " + secondary[0][1] + " !important;";
						else if (secondaryLength === 2)
							borderStyle = "border-color: " + secondary[0][0] + " " + secondary[1][0] + " " + secondary[1][0] + " " + secondary[0][0] + " !important; border-style: " + secondary[0][1] + " " + secondary[1][1] + " " + secondary[1][1] + " " + secondary[0][1] + " !important;";
						else if (secondaryLength === 3)
							borderStyle = "border-color: " + secondary[0][0] + " " + secondary[1][0] + " " + secondary[2][0] + " " + secondary[0][0] + " !important; border-style: " + secondary[0][1] + " " + secondary[1][1] + " " + secondary[2][1] + " " + secondary[0][1] + " !important;";
						else if (secondaryLength === 4)
							borderStyle = "border-color: " + secondary[0][0] + " " + secondary[2][0] + " " + secondary[3][0] + " " + secondary[1][0] + " !important; border-style: " + secondary[0][1] + " " + secondary[2][1] + " " + secondary[3][1] + " " + secondary[1][1] + " !important;";

						link.setAttribute("style", borderStyle);
						styleList[postInfo.id] = borderStyle;
					}
					else
						styleList[postInfo.id] = false;
				}
				else if (styleList[postInfo.id] !== false && !post.bbbHasClass("bbb-custom-tag")) { // Post is already tested, but needs to be set up again.
					link.bbbAddClass("bbb-custom-tag");
					link.setAttribute("style", styleList[postInfo.id]);
				}
			}
		}
	}

	function prepThumbnails(target) {
		// Take new thumbnails and apply the necessary functions for preparing them.
		// Thumbnail classes and titles.
		formatThumbnails(target);

		// Thumbnail info.
		thumbInfo(target);

		// Fix post link queries.
		postLinkQuery(target);

		// Blacklist.
		blacklistUpdate(target);

		// Direct downloads.
		postDDL(target);

		// Quick search.
		quickSearchTest(target);

		// Fix the mode menu.
		danbModeMenu(target);
	}

	function createThumbHTML(postInfo, query) {
		// Create a thumbnail HTML string.
		return '<article class="post-preview' + postInfo.thumb_class + '" id="post_' + postInfo.id + '" data-id="' + postInfo.id + '" data-has-sound="' + postInfo.has_sound + '" data-tags="' + postInfo.tag_string + '" data-pools="' + postInfo.pool_string + '" data-uploader="' + postInfo.uploader_name + '" data-rating="' + postInfo.rating + '" data-width="' + postInfo.image_width + '" data-height="' + postInfo.image_height + '" data-flags="' + postInfo.flags + '" data-parent-id="' + postInfo.parent_id + '" data-has-children="' + postInfo.has_children + '" data-score="' + postInfo.score + '" data-fav-count="' + postInfo.fav_count + '" data-approver-id="' + postInfo.approver_id + '" data-pixiv-id="' + postInfo.pixiv_id + '" data-md5="' + postInfo.md5 + '" data-file-ext="' + postInfo.file_ext + '" data-file-url="' + postInfo.file_url + '" data-large-file-url="' + postInfo.large_file_url + '" data-preview-file-url="' + postInfo.preview_file_url + '" data-source="' + postInfo.source + '" data-top-tagger="' + postInfo.keeper_data.uid + '" data-uploader-id="' + postInfo.uploader_id + '" data-normalized-source="' + postInfo.normalized_source + '" data-is-favorited="' + postInfo.is_favorited + '" data-file-url-desc="' + postInfo.file_url_desc + '"><a href="/posts/' + postInfo.id + query + '"><picture><source media="(max-width: 660px)" srcset="' + postInfo.crop_img_src + '"><source media="(min-width: 660px)" srcset="' + postInfo.preview_img_src + '"><img src="' + postInfo.preview_img_src + '" alt="' + postInfo.tag_string + '"></picture></a></article>';
	}

	function createThumb(postInfo, query) {
		// Create a thumbnail element. (lazy method <_<)
		var childSpan = document.createElement("span");
		childSpan.innerHTML = createThumbHTML(postInfo, query);

		return childSpan.firstElementChild;
	}

	function createThumbListing(postsInfo, orderedIds) {
		// Create a listing of thumbnails.
		var thumbs = document.createDocumentFragment();
		var postHolder = {};
		var query = getThumbQuery();
		var i, il, thumb; // Loop variables;

		// Generate thumbnails.
		for (i = 0, il = postsInfo.length; i < il; i++) {
			var postInfo = postsInfo[i];

			// Don't display loli/shota/toddlercon/deleted/banned if the user has opted so and skip to the next image.
			if ((!show_loli && /(?:^|\s)loli(?:$|\s)/.test(postInfo.tag_string)) || (!show_shota && /(?:^|\s)shota(?:$|\s)/.test(postInfo.tag_string)) || (!show_toddlercon && /(?:^|\s)toddlercon(?:$|\s)/.test(postInfo.tag_string)) || (!show_deleted && postInfo.is_deleted) || (!show_banned && postInfo.is_banned) || safebPostTest(postInfo))
				continue;

			// eek, not so huge line.
			thumb = createThumb(postInfo, query);

			// Generate output.
			if (!orderedIds)
				thumbs.appendChild(thumb);
			else
				postHolder[postInfo.id] = thumb;
		}

		// Place thumbnails in the correct order for pools.
		if (orderedIds) {
			for (i = 0, il = orderedIds.length; i < il; i++) {
				thumb = postHolder[orderedIds[i]];

					if (thumb)
						thumbs.appendChild(thumb);
			}
		}

		return thumbs;
	}

	function updateThumbListing(thumbs) {
		// Take a collection of thumbnails and use them to update the original thumbnail listing as appropriate.
		var thumbContainer = getThumbContainer(gLoc);
		var before = getThumbSibling(gLoc);
		var newContainer; // If/else variable.

		if (!thumbContainer) {
			bbbNotice("Thumbnail section could not be located.", -1);
			return;
		}

		if ((history.state && history.state.bbb_posts_cache) || !isRandomSearch()) {
			// New thumbnail container replacement preparation.
			var childIndex = 0;

			newContainer = thumbContainer.cloneNode(false);

			while (thumbContainer.children[childIndex]) {
				var child = thumbContainer.children[childIndex];

				if (child.tagName !== "ARTICLE")
					newContainer.appendChild(child);
				else
					childIndex++;
			}

			if (!before)
				newContainer.appendChild(thumbs);
			else
				newContainer.insertBefore(thumbs, before);

			// Prepare thumbnails.
			prepThumbnails(newContainer);

			// Replace results with new results.
			thumbContainer.parentNode.replaceChild(newContainer, thumbContainer);
		}
		else {
			// Fill out a random search by appending thumbnails.
			var origThumbs = getPosts(thumbs);
			var i, il, curThumb; // Loop variables.

			newContainer = document.createDocumentFragment();

			// Remove existing posts.
			for (i = 0, il = origThumbs.length; i < il; i++) {
				curThumb = origThumbs[i];

				if (getId(curThumb.id))
					thumbs.removeChild(curThumb);
			}

			// Favor hidden posts since they're the most likely reason for the API request.
			var noDupThumbs = getPosts(thumbs);
			var hiddenSearch = createSearch("~loli ~shota ~toddlercon ~status:deleted ~status:banned");
			var limit = getLimit() || (allowUserLimit() ? thumbnail_count : thumbnail_count_default);
			var numMissing = limit - getPosts().length;

			for (i = 0, il = noDupThumbs.length; i < il; i++) {
				curThumb = noDupThumbs[i];

				if (numMissing === 0)
					break;
				else if (thumbSearchMatch(curThumb, hiddenSearch)) {
					newContainer.appendChild(curThumb);
					numMissing--;
				}
			}

			// Try to fix any shortage of thumbnails.
			var leftoverThumbs = getPosts(thumbs);

			for (i = 0, il = leftoverThumbs.length; i < il; i++) {
				if (numMissing === 0)
					break;
				else {
					newContainer.appendChild(leftoverThumbs[i]);
					numMissing--;
				}
			}

			// Prepare thumbnails.
			prepThumbnails(newContainer);

			// Append listing with new thumbnails.
			if (!before)
				thumbContainer.appendChild(newContainer);
			else
				thumbContainer.insertBefore(newContainer, before);
		}
	}

	function getIdCache() {
		// Retrieve the cached list of post IDs used for the pool/favorite group thumbnails.
		var collId = location.href.match(/\/(?:pools|favorite_groups)\/(\d+)/)[1];
		var idCache = sessionStorage.getItem("bbb_" + gLoc + "_cache_" + collId);
		var curTime = new Date().getTime();
		var cacheTime, timeDiff; // If/else variables.

		if (idCache) {
			idCache = idCache.split(" ");
			cacheTime = idCache.shift();
			timeDiff = (curTime - cacheTime) / 1000; // Cache age in seconds.
		}

		if (!idCache || (timeDiff && timeDiff > 600))
			return undefined;
		else
			return idCache.join(" ");
	}

	function thumbInfo(target) {
		// Add score, favorite count, and rating info to thumbnails.
		var posts = getPosts(target);

		if (thumb_info === "disabled")
			return;

		for (var i = 0, il = posts.length; i < il; i++) {
			var post = posts[i];

			// Skip thumbnails that already have the info added.
			if (post.getElementsByClassName("bbb-thumb-info")[0])
				continue;

			var postInfo = post.bbbInfo();
			var tooShort = (150 / postInfo.image_width * postInfo.image_height < 30); // Short thumbnails will need the info div position adjusted.

			if (gLoc === "comments") { // Add favorites info to the existing info in the comments listing.
				var firstInfo = post.getElementsByClassName("info")[0];
				var infoParent = (firstInfo ? firstInfo.parentNode : undefined);

				if (infoParent) {
					var favSpan = document.createElement("span");
					favSpan.className = "info bbb-thumb-info";
					favSpan.innerHTML = '<strong>Favorites</strong> ' + postInfo.fav_count;
					infoParent.appendChild(favSpan);
				}
			}
			else { // Add extra information inside of the thumbnail's parent element.
				var thumbImg = post.getElementsByTagName("img")[0];

				// Don't add the info if there isn't a thumbnail.
				if (!thumbImg)
					continue;

				var thumbEl = post.getElementsByClassName("preview")[0] || post;
				thumbEl.bbbAddClass("bbb-thumb-info-parent");

				var postLink = thumbEl.getElementsByTagName("a")[0];
				var before = (postLink ? postLink.nextElementSibling : undefined);
				var scoreStr = (postInfo.score < 0 ? '<span style="color: #CC0000;">' + postInfo.score + '</span>' : postInfo.score);

				var infoDiv = document.createElement("div");
				infoDiv.className = "bbb-thumb-info" + (tooShort ? " bbb-thumb-info-short" : "");
				infoDiv.innerHTML = "&#x2605;" + scoreStr + "&nbsp;&nbsp;&nbsp;&hearts;" + postInfo.fav_count + (location.host.indexOf("safebooru") < 0 ? "&nbsp;&nbsp;&nbsp;&nbsp;" + postInfo.rating.toUpperCase() : "");

				if (before)
					thumbEl.insertBefore(infoDiv, before);
				else
					thumbEl.appendChild(infoDiv);
			}
		}
	}

	function postDDL(target) {
		// Add direct downloads to thumbnails.
		if (!direct_downloads || (gLoc !== "search" && gLoc !== "pool" && gLoc !== "popular" && gLoc !== "popular_view" && gLoc !== "favorites" && gLoc !== "favorite_group"))
			return;

		var posts = getPosts(target);

		for (var i = 0, il = posts.length; i < il; i++) {
			var post = posts[i];
			var postInfo = post.bbbInfo();
			var postUrl = (postInfo.large_file_img_src.indexOf(".webm") > -1 ? postInfo.large_file_img_src : postInfo.file_img_src);
			var ddlLink = post.getElementsByClassName("bbb-ddl")[0];

			// If the direct download doesn't already exist, create it.
			if (!ddlLink) {
				ddlLink = document.createElement("a");
				ddlLink.innerHTML = "Direct Download";
				ddlLink.className = "bbb-ddl";
				post.appendChild(ddlLink);
			}

			ddlLink.href = postUrl || "/data/DDL unavailable for post " + postInfo.id + ".jpg";

			// Disable filtered posts.
			if (post.bbbHasClass("blacklisted-active", "bbb-quick-search-filtered"))
				unsetDDL(ddlLink);
		}
	}

	function enablePostDDL(post) {
		// Enable a post's DDL.
		var ddlLink = post.getElementsByClassName("bbb-ddl")[0];

		if (!direct_downloads || !ddlLink || post.bbbHasClass("blacklisted-active", "bbb-quick-search-filtered"))
			return;

		ddlLink.href = ddlLink.href.replace("donmai.us/#data", "donmai.us/data");
	}

	function disablePostDDL(post) {
		// Disable a post's DDL.
		var ddlLink = post.getElementsByClassName("bbb-ddl")[0];

		if (!direct_downloads || !ddlLink)
			return;

		unsetDDL(ddlLink);
	}

	function unsetDDL(ddlLink) {
		// Disable a DDL URL with an anchor.
		ddlLink.href = ddlLink.href.replace("donmai.us/data", "donmai.us/#data");
	}

	function postLinkQuery(target) {
		// Remove or add the query portion of links to posts.
		var addQuery = !isLoggedIn();
		var removeQuery = clean_links;

		if (!removeQuery && !addQuery)
			return;

		var targetContainer; // If/else variable.

		if (target)
			targetContainer = target;
		else if (gLoc === "post")
			targetContainer = document.getElementById("content");
		else if (gLoc === "pool" || gLoc === "favorite_group") {
			targetContainer = document.getElementById("a-show");
			targetContainer = (targetContainer ? targetContainer.getElementsByTagName("section")[0] : undefined);
		}
		else if (gLoc === "search" || gLoc === "favorites")
			targetContainer = document.getElementById("posts");
		else if (gLoc === "intro")
			targetContainer = document.getElementById("a-intro");

		if (targetContainer) {
			var links = targetContainer.getElementsByTagName("a");
			var i, il; // Loop variables.

			if (removeQuery) {
				// Remove the query portion of links to posts.
				for (i = 0, il = links.length; i < il; i++) {
					var remLink = links[i];
					var remLinkParent = remLink.parentNode;

					if (remLinkParent.tagName === "ARTICLE" || remLinkParent.id.indexOf("nav-link-for-pool-") === 0)
						remLink.href = remLink.href.split("?", 1)[0];
				}
			}
			else if (addQuery) {
				// Add the query portion of links to posts for logged out users.
				var tagQuery = getVar("tags");

				if (tagQuery) {
					for (i = 0, il = links.length; i < il; i++) {
						var addLink = links[i];
						var addLinkParent = addLink.parentNode;
						var addLinkHref = addLink.href;

						if (addLinkParent.tagName === "ARTICLE" && !getVar("tags", addLinkHref))
							addLink.href = updateURLQuery(addLinkHref, {tags: tagQuery});
					}
				}
			}
		}
	}

	function danbModeMenu(target) {
		// Add mode menu functionality to newly created thumbnails.
		var modeSection = document.getElementById("mode-box");

		if (!modeSection)
			return;

		var links = (target || document).getElementsByClassName("bbb-thumb-link");
		var menuHandler = function(event) {
			if (event.button === 0)
				Danbooru.PostModeMenu.click(event);
		};

		for (var i = 0, il = links.length; i < il; i++)
			links[i].addEventListener("click", menuHandler, false);
	}

	function potentialHiddenPosts(mode, target) {
		// Check a normal thumbnail listing for possible hidden posts.
		var numPosts = getPosts(target).length;
		var noResults = noResultsPage(target);
		var limit = getLimit();

		if (mode === "search" || mode === "favorites") {
			var numExpected = (limit !== undefined ? limit : thumbnail_count_default);
			var numDesired = (allowUserLimit() ? thumbnail_count : numExpected);

			if (!noResults && (numPosts !== numDesired || numPosts < numExpected))
				return true;
		}
		else if (mode === "popular" || mode === "pool" || mode === "favorite_group" || mode === "popular_view") {
			if (!noResults && numPosts !== limit)
				return true;
		}
		else if (mode === "comments") {
			if (numPosts !== limit)
				return true;
		}

		return false;
	}

	/* Endless Page functions */
	function endlessToggle(event) {
		// Toggle endless pages on and off.
		if (endless_default === "disabled" || (gLoc !== "search" && gLoc !== "pool" && gLoc !== "favorites" && gLoc !== "favorite_group"))
			return;

		// Change the default for the duration of the session if necessary.
		if (endless_session_toggle) {
			var onValue = (bbb.user.endless_default !== "off" ? bbb.user.endless_default : "on");
			var newDefault = (bbb.endless.enabled ? "off" : onValue);

			endless_default = newDefault;
			sessionStorage.bbbSetItem("bbb_endless_default", newDefault);
		}

		if (bbb.endless.enabled) {
			endlessDisable();

			if (event && event.type !== "click")
				bbbNotice("Endless pages disabled.", 2);
		}
		else {
			endlessEnable();

			if (event && event.type !== "click")
				bbbNotice("Endless pages enabled.", 2);
		}
	}

	function endlessEnable() {
		// Turn on endless pages.
		if (endless_default === "disabled" || noXML())
			return;

		bbb.endless.enabled = true;
		bbb.el.endlessEnableDiv.style.display = "none";
		bbb.el.endlessLoadDiv.style.display = "inline-block";
		bbb.el.endlessLink.style.fontWeight = "bold";

		// Check on the next page status.
		endlessCheck();

		// Add the listeners for detecting the amount of scroll left.
		window.addEventListener("scroll", endlessCheck, false);
		window.addEventListener("resize", endlessCheck, false);
		document.addEventListener("keyup", endlessCheck, false);
		document.addEventListener("click", endlessCheck, false);
	}

	function endlessDisable() {
		// Turn off endless pages.
		bbb.endless.enabled = false;
		bbb.endless.append_page = false;
		bbb.el.endlessEnableDiv.style.display = "inline-block";
		bbb.el.endlessLoadDiv.style.display = "none";
		bbb.el.endlessLink.style.fontWeight = "normal";

		// Remove the listeners for detecting the amount of scroll left.
		window.removeEventListener("scroll", endlessCheck, false);
		window.removeEventListener("resize", endlessCheck, false);
		document.removeEventListener("keyup", endlessCheck, false);
		document.removeEventListener("click", endlessCheck, false);
	}

	function endlessInit() {
		// Set up and start endless pages.
		removeInheritedStorage("bbb_endless_default");

		var paginator = getPaginator();

		if (endless_default === "disabled" || !paginator || (gLoc !== "search" && gLoc !== "pool" && gLoc !== "favorites" && gLoc !== "favorite_group"))
			return;

		// Add the endless link to the menu.
		var listingItem = document.getElementById("subnav-listing") || document.getElementById("subnav-view-posts");

		if (listingItem) {
			var menu = listingItem.parentNode;
			var listingItemSibling = listingItem.nextElementSibling;

			var link = bbb.el.endlessLink = document.createElement("a");
			link.href = "#";
			link.innerHTML = "Endless";
			link.addEventListener("click", function(event) {
				if (event.button !== 0)
					return;

				endlessToggle();
				event.preventDefault();
			}, false);

			var item = document.createElement("li");
			item.style.textAlign = "center";
			item.style.display = "inline-block";
			item.appendChild(link);

			if (listingItemSibling)
				menu.insertBefore(item, listingItemSibling);
			else
				menu.appendChild(item);

			link.style.fontWeight = "bold";
			item.style.width = item.clientWidth + "px";
			link.style.fontWeight = "normal";
		}

		var paginatorParent = paginator.parentNode;

		// Set up the load more button.
		var buttonDiv = document.createElement("div");
		buttonDiv.id = "bbb-endless-button-div";

		var loadButtonDiv = bbb.el.endlessLoadDiv = document.createElement("div");
		loadButtonDiv.id = "bbb-endless-load-div";
		buttonDiv.appendChild(loadButtonDiv);

		var loadToggle = function() {
			// Continue page loading after hitting the pause interval.
			if (bbb.endless.paused !== true)
				return;

			bbb.el.endlessLoadButton.style.display = "none";
			bbb.el.endlessLoadButton.blur();
			bbb.endless.paused = false;
			bbb.endless.append_page = true;
			endlessCheck();
		};

		var loadButton = bbb.el.endlessLoadButton = document.createElement("a");
		loadButton.innerHTML = "Load More";
		loadButton.href = "#";
		loadButton.id = "bbb-endless-load-button";
		loadButton.style.display = "none";
		loadButton.addEventListener("click", function(event) {
			if (event.button !== 0)
				return;

			loadToggle();
			event.preventDefault();
		}, false);
		loadButtonDiv.appendChild(loadButton);

		// Set up the enable button.
		var enableButtonDiv = bbb.el.endlessEnableDiv = document.createElement("div");
		enableButtonDiv.id = "bbb-endless-enable-div";
		buttonDiv.appendChild(enableButtonDiv);

		var enableButton = document.createElement("a");
		enableButton.innerHTML = "Endless";
		enableButton.href = "#";
		enableButton.id = "bbb-endless-enable-button";
		enableButton.addEventListener("click", function(event) {
			if (event.button !== 0)
				return;

			enableButton.blur();
			endlessToggle();
			event.preventDefault();
		}, false);
		enableButtonDiv.appendChild(enableButton);

		paginatorParent.insertBefore(buttonDiv, paginator);

		// Create the hotkeys.
		createHotkey("69", endlessToggle); // E
		createHotkey("s69", loadToggle); // Shift + E

		// Check the session default or original default value to see if endless pages should be enabled.
		var sessionDefault = sessionStorage.getItem("bbb_endless_default");

		if (endless_session_toggle && sessionDefault)
			endless_default = sessionDefault;

		if (endless_default !== "off")
			endlessEnable();
		else
			endlessDisable();
	}

	function endlessObjectInit() {
		// Initialize the values for the first XML request. Runs separately from endlessInit since it requires the initial page being finalized.
		var posts = getPosts();
		var numPosts = posts.length;

		// Prep the first paginator.
		bbb.endless.last_paginator = getPaginator();

		// If we're already on the last page, don't continue.
		if (endlessLastPage())
			return;

		// Note the posts that already exist.
		if (endless_remove_dup) {
			for (var i = 0; i < numPosts; i++) {
				var post = posts[i];

				bbb.endless.posts[post.id] = post;
			}
		}

		// Create a special "page" for filling out the first page.
		if (endless_fill) {
			var limit = getLimit() || thumbnail_count_default;

			if (numPosts < limit) {
				var newPageObject = {
					page: document.createDocumentFragment(),
					page_num: [(getVar("page") || "1")],
					paginator: bbb.endless.last_paginator,
					ready: false
				};

				bbb.endless.fill_first_page = true;
				bbb.endless.pages.push(newPageObject);
			}
		}
	}

	function endlessCheck() {
		// Check whether the current document is ready for a page to be appended.
		if (!bbb.endless.enabled)
			return;

		// Check whether endless pages needs to be paused.
		endlessPauseCheck();

		// Stop if the check is delayed.
		if (bbb.timers.endlessDelay)
			return;

		// Check whether a user is looking at the "posts tab" and not the "wiki tab" in the main search listing.
		var postsDiv = (gLoc === "search" ? document.getElementById("posts") : undefined);
		var postsVisible = (!postsDiv || postsDiv.style.display !== "none");

		if (bbb.flags.thumbs_xml || bbb.flags.paginator_xml || !postsVisible) // Delay the check until the page is completely ready.
			endlessDelay(100);
		else {
			if (!bbb.endless.last_paginator)
				endlessObjectInit();

			if (bbb.endless.append_page)
				endlessQueueCheck();
			else { // Check the amount of space left to scroll and attempt to add a page if we're far enough down.
				var scrolled = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
				var viewHeight = document.documentElement.clientHeight;
				var docHeight = document.documentElement.offsetHeight;

				if (docHeight <= viewHeight + scrolled + endless_scroll_limit)
					bbb.endless.append_page = true;

				endlessQueueCheck();
			}
		}
	}

	function endlessQueueCheck() {
		// Check the page queue and append or request a page.
		if (!bbb.endless.enabled || bbb.endless.paused)
			return;

		if (bbb.endless.append_page || bbb.endless.fill_first_page) {
			if (endlessPageReady())
				endlessAppendPage();
			else
				endlessRequestPage();
		}
		else if (endless_preload && !endlessPageReady())
			endlessRequestPage();
	}

	function endlessRequestPage() {
		// Start an XML request for a new page.
		if (bbb.flags.endless_xml || endlessLastPage()) // Retrieve pages one at a time for as long as they exist.
			return;

		searchPages("endless");
	}

	function endlessQueuePage(newPage) {
		// Take some thumbnails from a page and work them into the queue.
		var limit = getLimit() || thumbnail_count_default;
		var pageNum = getVar("page", endlessNexURL());
		var paginator = bbb.endless.last_paginator = bbb.endless.new_paginator;
		var badPaginator = (paginator.textContent.indexOf("Go back") > -1); // Sometimes the paginator sends us to a page with no results.
		var lastPage = endlessLastPage() || badPaginator;
		var origPosts = getPosts(newPage);
		var i, il; // Loop variables.

		bbb.endless.new_paginator = undefined;

		// Remove duplicates.
		if (endless_remove_dup) {
			for (i = 0; i < origPosts.length; i++) {
				var post = origPosts[i];
				var postId = post.id;

				if (bbb.endless.posts[postId])
					newPage.removeChild(post);
				else
					bbb.endless.posts[postId] = post;
			}
		}

		// Fill up existing page objects with thumbnails.
		var fillPosts = getPosts(newPage);
		var leftoverPosts = fillPosts;
		var lastPageObject = bbb.endless.pages[bbb.endless.pages.length - 1];

		if (endless_fill && lastPageObject && !lastPageObject.ready) {
			if (badPaginator) // Paginator isn't accurate. Ignore this page's number and paginator.
				lastPageObject.ready = true;
			else {
				var lastQueuePage = lastPageObject.page;
				var lastQueuePosts = getPosts(lastQueuePage);
				var fillLimit = (bbb.endless.fill_first_page ? limit - getPosts().length : limit - lastQueuePosts.length);

				for (i = 0, il = fillPosts.length; i < il; i++) {
					lastQueuePage.appendChild(fillPosts[i]);
					fillLimit--;

					if (fillLimit === 0) {
						lastPageObject.ready = true;
						break;
					}
				}

				// If there are no more posts and pages, mark the last page as ready.
				leftoverPosts = getPosts(newPage);

				if (!lastPageObject.ready && !leftoverPosts[0] && lastPage)
					lastPageObject.ready = true;

				// Make sure the displayed paginator is always the one from the last retrieved page to have all of its thumbnails used so the user doesn't click to the next page and skip queued thumbnails that haven't been displayed yet.
				if (!leftoverPosts[0])
					lastPageObject.paginator = paginator;

				lastPageObject.page_num.push(pageNum);
			}
		}

		// Queue up a new page object.
		var numNewPosts = leftoverPosts.length;

		if (numNewPosts > 0 || (!endless_fill && !badPaginator) || (endless_fill && !bbb.endless.pages[0] && !lastPage)) { // Queue the page if: 1) There are thumbnails. 2) It's normal mode and not a "no results" page. 3) It's fill mode and there is no object to work with for future pages.
			var newPageObject = {
				page: newPage,
				page_num: [pageNum],
				paginator: paginator,
				ready: (!endless_fill || numNewPosts === limit || lastPage)
			};

			bbb.endless.pages.push(newPageObject);

			if (bbb.endless.no_thumb_count < 10)
				bbb.endless.no_thumb_count = 0;
		}
		else if (!badPaginator)
			bbb.endless.no_thumb_count++;

		// Get rid of the load more button for special circumstances where the paginator isn't accurate.
		if (lastPage && !bbb.endless.pages[0])
			bbb.el.endlessLoadButton.style.display = "none";

		// Warn the user if this is a listing full of hidden posts.
		if (bbb.endless.no_thumb_count === 10) {
			bbbNotice("There have been no or very few thumbnails detected in the last 10 retrieved pages. Using endless pages with fill mode on this search could potentially be very slow or stall out completely. If you would like to continue, you may click the \"load more\" button near the bottom of the page.", -1);
			endlessPause();
		}
		else
			endlessQueueCheck();
	}

	function endlessAppendPage() {
		// Prep the first queued page object and add it to the document.
		var firstPageObject = bbb.endless.pages.shift();
		var page = firstPageObject.page;
		var thumbContainer = getThumbContainer(gLoc);
		var before = getThumbSibling(gLoc);

		// Prepare thumbnails.
		prepThumbnails(page);

		// Page separators.
		var pageNum = firstPageObject.page_num;
		var numPageNum = pageNum.length;
		var firstNum = pageNum[0];
		var lastNum = (numPageNum > 1 ? pageNum[numPageNum - 1] : undefined);

		if (endless_separator === "divider") {
			var divider = document.createElement("div");
			divider.className = "bbb-endless-divider";

			var dividerLink = document.createElement("div");
			dividerLink.className = "bbb-endless-divider-link";
			divider.appendChild(dividerLink);

			dividerLink.innerHTML = '<a href="' + updateURLQuery(location.href, {page: firstNum}) + '">Page ' + firstNum + '</a>' + (lastNum ? ' ~ <a href="' + updateURLQuery(location.href, {page: lastNum}) + '">Page ' + lastNum + '</a>' : '');

			if (!bbb.endless.fill_first_page)
				page.insertBefore(divider, page.firstElementChild);
			else if (lastNum) // Only add the divider for filling the first page when there are actual posts added.
				thumbContainer.insertBefore(divider, (getPosts()[0] || before));
		}
		else if (endless_separator === "marker") {
			var markerContainer = document.createElement("article");
			markerContainer.className = "bbb-endless-marker-article";

			var marker = document.createElement("div");
			marker.className = "bbb-endless-marker";
			markerContainer.appendChild(marker);

			var markerLink = document.createElement("div");
			markerLink.className = "bbb-endless-marker-link";
			marker.appendChild(markerLink);

			markerLink.innerHTML = '<a href="' + updateURLQuery(location.href, {page: firstNum}) + '">Page ' + firstNum + '</a>' + (lastNum ? '<br/>~<br/><a href="' + updateURLQuery(location.href, {page: lastNum}) + '">Page ' + lastNum + '</a>' : '');

			if (!bbb.endless.fill_first_page)
				page.insertBefore(markerContainer, page.firstElementChild);
			else if (lastNum) // Only add the marker for filling the first page when there are actual posts added.
				thumbContainer.insertBefore(markerContainer, (getPosts()[0] || before));
		}

		// Add the new page.
		if (!before)
			thumbContainer.appendChild(page);
		else
			thumbContainer.insertBefore(page, before);

		// Replace the paginator.
		replacePaginator(firstPageObject.paginator);

		if (!bbb.endless.fill_first_page)
			bbb.endless.append_page = false;
		else {
			bbb.endless.fill_first_page = false;
			endlessQueueCheck();
		}

		if (quick_search.indexOf("remove") > -1 && bbb.quick_search.tags !== "")
			endlessDelay(1100);

		endlessCheck();
	}

	function endlessNexURL() {
		// Get the URL of the next new page.
		return getPaginatorNextURL(bbb.endless.last_paginator);
	}

	function endlessPageReady() {
		// Check if the first queued page object is ready to be appended.
		var firstPageObject = bbb.endless.pages[0];

		return (firstPageObject && firstPageObject.ready);
	}

	function endlessLastPage() {
		// Check if there isn't a next page.
		return (!endlessNexURL() || noResultsPage());
	}

	function endlessPauseCheck() {
		// Check if loading needs to be paused due to the interval or default.
		if (bbb.endless.append_page)
			return;

		var numPages = document.getElementsByClassName("bbb-endless-page").length + 1;

		if (numPages % endless_pause_interval === 0 || (endless_default === "paused" && numPages === 1))
			endlessPause();
	}

	function endlessPause() {
		// Pause endless pages so that it can't add any more pages.
		if (bbb.endless.paused || (endlessLastPage() && !bbb.endless.pages[0]))
			return;

		bbb.endless.paused = true;
		bbb.endless.append_page = false;
		bbb.el.endlessLoadButton.style.display = "inline-block";
	}

	function endlessDelay(ms) {
		// Delay endless pages for the provided number of milliseconds.
		bbb.timers.endlessDelay = window.setTimeout( function() {
			bbb.timers.endlessDelay = 0;

			endlessCheck();
		}, ms);
	}

	/* Blacklist Functions */
	function blacklistInit() {
		// Reset the blacklist with the account settings when logged in or script settings when logged out/using the override.
		var blacklistTags = script_blacklisted_tags;
		var blacklistBox = document.getElementById("blacklist-box");
		var blacklistList = document.getElementById("blacklist-list");
		var enableLink = document.getElementById("re-enable-all-blacklists");
		var disableLink = document.getElementById("disable-all-blacklists");
		var blacklistedPosts = document.getElementsByClassName("blacklisted");
		var i, il; // Loop variables.

		// Reset the list or create it as needed.
		if (blacklistBox && blacklistList) {
			blacklistBox.style.display = "none";

			var childIndex = 0;

			while (blacklistList.children[childIndex]) {
				var child = blacklistList.children[childIndex];

				if (child.getElementsByTagName("a")[0] && child !== enableLink && child !== disableLink)
					blacklistList.removeChild(child);
				else
					childIndex++;
			}
		}
		else if (blacklist_add_bars) {
			var target, before; // If/else variables.

			if (gLoc === "comment_search") {
				target = document.getElementById("a-index");

				if (target)
					before = target.getElementsByClassName("comments-for-post")[0];
			}
			else if (gLoc === "comment") {
				target = document.getElementById("a-show");

				if (target)
					before = target.getElementsByClassName("comments-for-post")[0];
			}

			if (target && before && before.parentNode === target) {
				blacklistBox = document.createElement("div");
				blacklistBox.id = "blacklist-box";
				blacklistBox.className = "bbb-blacklist-box";
				blacklistBox.style.display = "none";
				blacklistBox.innerHTML = '<strong>Blacklisted: </strong> <ul id="blacklist-list"> <li id="disable-all-blacklists" style="display: inline;"><span class="link">Disable all</span></li> <li id="re-enable-all-blacklists" style="display: none;"><span class="link">Re-enable all</span></li> </ul>';

				blacklistList = getId("blacklist-list", blacklistBox);
				enableLink = getId("re-enable-all-blacklists", blacklistBox);
				disableLink = getId("disable-all-blacklists", blacklistBox);

				target.insertBefore(blacklistBox, before);
			}
		}

		// Reset any blacklist info.
		if (bbb.blacklist.entries[0]) {
			delete bbb.blacklist;
			bbb.blacklist = {entries: [], match_list: {}, smart_view_target: undefined};
		}

		// Reset any blacklisted thumbnails.
		var blacklistedPost = blacklistedPosts[0];

		while (blacklistedPost) {
			blacklistedPost.bbbRemoveClass("blacklisted blacklisted-active");
			enablePostDDL(blacklistedPost);
			blacklistedPost = blacklistedPosts[0];
		}

		// Check if there actually are any tags.
		if (!blacklistTags || !/[^\s,]/.test(blacklistTags))
			return;

		// Preserve commas within nested/grouped tags.
		var groupsObject = replaceSearchGroups(blacklistTags);
		var groups = groupsObject.groups;

		blacklistTags = groupsObject.search.replace(/,/g, "BBBCOMMASUB");
		blacklistTags = restoreSearchGroups(blacklistTags, groups);
		blacklistTags = blacklistTags.split("BBBCOMMASUB");

		// Create the blacklist section.
		var cookies = getCookie();
		var blacklistDisabled = (cookies.dab === "1" && blacklistBox);

		for (i = 0, il = blacklistTags.length; i < il; i++) {
			var blacklistTag = blacklistTags[i].bbbSpaceClean();
			var blacklistSearch = createSearch(blacklistTag);

			if (blacklistSearch[0]) {
				var entryHash = blacklistTag.bbbHash();
				var entryDisabled = (blacklistDisabled || (blacklist_session_toggle && cookies["b" + entryHash] === "1"));
				var newEntry = {active: !entryDisabled, tags:blacklistTag, search:blacklistSearch, matches: [], index: i, hash: entryHash};

				bbb.blacklist.entries.push(newEntry);

				if (blacklistList) {
					var blacklistItem = document.createElement("li");
					blacklistItem.title = blacklistTag;
					blacklistItem.className = "bbb-blacklist-item-" + i;
					blacklistItem.style.display = "none";

					var blacklistLink = document.createElement("a");
					blacklistLink.href = "#";
					blacklistLink.innerHTML = (blacklistTag.length < 19 ? blacklistTag + " " : blacklistTag.substring(0, 18).bbbSpaceClean() + "... ");
					blacklistLink.className = "bbb-blacklist-entry-" + i + (entryDisabled ? " blacklisted-active" : "");
					blacklistLink.bbbInfo("bbb-blacklist-entry", i);
					blacklistLink.addEventListener("click", blacklistEntryLinkToggle, false);
					blacklistItem.appendChild(blacklistLink);

					var blacklistCount = document.createElement("span");
					blacklistCount.className = "count";
					blacklistCount.innerHTML = "0";
					blacklistItem.appendChild(blacklistCount);

					blacklistList.appendChild(blacklistItem);
				}
			}
		}

		// Replace the disable/enable all blacklist links with our own.
		if (enableLink && disableLink) {
			var newEnableLink = bbb.el.blacklistEnableLink = enableLink.cloneNode(true);
			var newDisableLink = bbb.el.blacklistDisableLink = disableLink.cloneNode(true);

			newEnableLink.addEventListener("click", blacklistLinkToggle, false);
			newDisableLink.addEventListener("click", blacklistLinkToggle, false);

			if (blacklistDisabled) {
				newEnableLink.style.display = "inline";
				newDisableLink.style.display = "none";
			}
			else {
				newEnableLink.style.display = "none";
				newDisableLink.style.display = "inline";
			}

			enableLink.parentNode.replaceChild(newEnableLink, enableLink);
			disableLink.parentNode.replaceChild(newDisableLink, disableLink);
		}

		// Test all posts on the page for a match and set up the initial blacklist.
		blacklistUpdate();
	}

	function blacklistLinkToggle(event) {
		// Event listener function for permanently toggling the entire blacklist.
		if (event.button !== 0)
			return;

		var blacklistDisabled = (getCookie().dab === "1");
		var entries = bbb.blacklist.entries;

		if (blacklistDisabled) {
			bbb.el.blacklistEnableLink.style.display = "none";
			bbb.el.blacklistDisableLink.style.display = "inline";
			createCookie("dab", 0, 365);
		}
		else {
			bbb.el.blacklistEnableLink.style.display = "inline";
			bbb.el.blacklistDisableLink.style.display = "none";
			createCookie("dab", 1, 365);
		}

		for (var i = 0, il = entries.length; i < il; i++) {
			var entry = entries[i];

			if (blacklistDisabled) {
				if (!entry.active)
					blacklistEntryToggle(i);
			}
			else {
				if (entry.active)
					blacklistEntryToggle(i);

				if (blacklist_session_toggle)
					createCookie("b" + entry.hash, 0, -1);
			}
		}

		event.preventDefault();
	}

	function blacklistEntryLinkToggle(event) {
		// Event listener function for blacklist entry toggle links.
		if (event.button !== 0)
			return;

		var entryNumber = Number(event.target.bbbInfo("bbb-blacklist-entry"));

		blacklistEntryToggle(entryNumber);

		event.preventDefault();
	}

	function blacklistEntryToggle(entryIndex) {
		// Toggle a blacklist entry and adjust all of its related elements.
		var entry = bbb.blacklist.entries[entryIndex];
		var matches = entry.matches;
		var links = document.getElementsByClassName("bbb-blacklist-entry-" + entryIndex);
		var blacklistDisabled = (getCookie().dab === "1");
		var i, il, j, jl, id, els, matchList; // Loop variables.

		if (entry.active) {
			entry.active = false;

			if (blacklist_session_toggle && !blacklistDisabled)
				createCookie("b" + entry.hash, 1);

			for (i = 0, il = links.length; i < il; i++)
				links[i].bbbAddClass("blacklisted-active");

			for (i = 0, il = matches.length; i < il; i++) {
				id = matches[i];
				matchList = bbb.blacklist.match_list[id];

				matchList.count--;

				if (!matchList.count && matchList.override !== false) {
					if (id === "image-container")
						blacklistShowPost(document.getElementById("image-container"));
					else {
						els = document.getElementsByClassName(id);

						for (j = 0, jl = els.length; j < jl; j++)
							blacklistShowPost(els[j]);
					}
				}
			}
		}
		else {
			entry.active = true;

			if (blacklist_session_toggle)
				createCookie("b" + entry.hash, 0, -1);

			for (i = 0, il = links.length; i < il; i++)
				links[i].bbbRemoveClass("blacklisted-active");

			for (i = 0, il = matches.length; i < il; i++) {
				id = matches[i];
				matchList = bbb.blacklist.match_list[id];

				matchList.count++;

				if (matchList.override !== true) {
					if (id === "image-container")
						blacklistHidePost(document.getElementById("image-container"));
					else {
						els = document.getElementsByClassName(id);

						for (j = 0, jl = els.length; j < jl; j++)
							blacklistHidePost(els[j]);
					}
				}
			}
		}
	}

	function blacklistUpdate(target) {
		// Update the blacklists without resetting everything.
		if (!bbb.blacklist.entries[0])
			return;

		// Retrieve the necessary elements from the target element or current document.
		var blacklistBox = getId("blacklist-box", target) || document.getElementById("blacklist-box");
		var blacklistList = getId("blacklist-list", target) || document.getElementById("blacklist-list");
		var imgContainer = getId("image-container", target);
		var posts = getPosts(target);

		var i, il; // Loop variables.

		// Test the image for a match when viewing a post.
		if (imgContainer) {
			var imgId = imgContainer.bbbInfo("id");

			if (!blacklistSmartViewCheck(imgId))
				blacklistTest(imgContainer);
		}

		// Search the posts for matches.
		for (i = 0, il = posts.length; i < il; i++)
			blacklistTest(posts[i]);

		// Update the blacklist sidebar section match counts and display any blacklist items that have a match.
		if (blacklistBox && blacklistList) {
			for (i = 0, il = bbb.blacklist.entries.length; i < il; i++) {
				var entryLength = bbb.blacklist.entries[i].matches.length;
				var item = blacklistList.getElementsByClassName("bbb-blacklist-item-" + i)[0];

				if (entryLength) {
					blacklistBox.style.display = "block";
					item.style.display = "";
					item.getElementsByClassName("count")[0].innerHTML = entryLength;
				}
			}
		}
	}

	function blacklistTest(el) {
		// Test a post/image for a blacklist match and use its ID to store its info.
		var id = el.id;
		var matchList = bbb.blacklist.match_list[id];

		// Test posts that haven't been tested yet.
		if (typeof(matchList) === "undefined") {
			matchList = bbb.blacklist.match_list[id] = {count: undefined, matches: [], override: undefined};

			if (!blacklist_ignore_fav || el.bbbInfo("is-favorited") !== "true") {
				for (var i = 0, il = bbb.blacklist.entries.length; i < il; i++) {
					var entry = bbb.blacklist.entries[i];

					if (thumbSearchMatch(el, entry.search)) {
						if (entry.active)
							matchList.count = ++matchList.count || 1;
						else
							matchList.count = matchList.count || 0;

						matchList.matches.push(entry);
						entry.matches.push(id);
					}
				}
			}

			if (matchList.count === undefined) // No match.
				matchList.count = false;
		}

		// Check the saved blacklist info for the post and change the thumbnail as needed.
		if (matchList.count !== false && !el.bbbHasClass("blacklisted")) {
			el.bbbAddClass("blacklisted");

			if (matchList.count > 0 && matchList.override !== true)
				blacklistHidePost(el);

			if (el.id !== "image-container") {
				if (blacklist_thumb_controls)
					blacklistPostControl(el, matchList);

				if (blacklist_smart_view)
					blacklistSmartView(el);
			}
		}
	}

	function blacklistPostControl(el, matchList) {
		// Add the blacklist post controls to a thumbnail.
		var target = el.getElementsByClassName("preview")[0] || el;
		var id = el.id;
		var tip = bbb.el.blacklistTip;

		if (!tip) { // Create the tip if it doesn't exist.
			tip = bbb.el.blacklistTip = document.createElement("div");
			tip.id = "bbb-blacklist-tip";
			document.body.appendChild(tip);
		}

		if (target) {
			// Set up the tip events listeners for hiding and displaying it.
			target.addEventListener("click", function(event) {
				if (event.button !== 0 || event.ctrlKey || event.shiftKey || event.altKey)
					return;

				var target = event.target;
				var blacklistTip = bbb.el.blacklistTip;
				var i, il; // Loop variables.

				if (!el.bbbHasClass("blacklisted-active") || (target.tagName === "A" && !target.bbbHasClass("bbb-thumb-link"))) // If the thumb isn't currently hidden or a link that isn't the thumb link is clicked, allow the link click.
					return;

				if (blacklistTip.style.display !== "block") {
					var matchEntries = matchList.matches;
					var tipContent = document.createDocumentFragment();

					var header = document.createElement("b");
					header.innerHTML = "Blacklist Matches";
					tipContent.appendChild(header);

					var list = document.createElement("ul");
					tipContent.appendChild(list);

					for (i = 0, il = matchEntries.length; i < il; i++) {
						var matchEntry = matchEntries[i];
						var entryIndex = matchEntry.index;
						var blacklistTag = matchEntry.tags;

						var blacklistItem = document.createElement("li");
						blacklistItem.title = blacklistTag;

						var blacklistLink = document.createElement("a");
						blacklistLink.href = "#";
						blacklistLink.className = "bbb-blacklist-entry-" + entryIndex + (matchEntry.active ? "" : " blacklisted-active");
						blacklistLink.bbbInfo("bbb-blacklist-entry", entryIndex);
						blacklistLink.innerHTML = (blacklistTag.length < 51 ? blacklistTag + " " : blacklistTag.substring(0, 50).bbbSpaceClean() + "...");
						blacklistLink.addEventListener("click", blacklistEntryLinkToggle, false);
						blacklistItem.appendChild(blacklistLink);

						list.appendChild(blacklistItem);
					}

					var viewLinkDiv = document.createElement("div");
					viewLinkDiv.style.marginTop = "1em";
					viewLinkDiv.style.textAlign = "center";
					viewLinkDiv.innerHTML = '<a class="bbb-post-link" id="bbb-blacklist-view-link" href="/posts/' + id.match(/\d+/)[0] + '">View post</a>';
					tipContent.appendChild(viewLinkDiv);

					if (blacklist_smart_view) {
						var viewLink = getId("bbb-blacklist-view-link", viewLinkDiv);

						if (viewLink) {
							viewLink.addEventListener("click", function(event) {
								if (event.button === 0)
									blacklistSmartViewUpdate(el);
							}, false);
						}
					}

					blacklistShowTip(event, tipContent);
				}
				else {
					var els = document.getElementsByClassName(id);

					for (i = 0, il = els.length; i < il; i++)
						blacklistShowPost(els[i]);

					blacklistHideTip();
					bbb.blacklist.match_list[id].override = true;
				}

				event.preventDefault();
				event.stopPropagation();
			}, true);
			target.addEventListener("mouseleave", function() { bbb.timers.blacklistTip = window.setTimeout(blacklistHideTip, 100); }, false);
			tip.addEventListener("mouseover", function() { window.clearTimeout(bbb.timers.blacklistTip); }, false);
			tip.addEventListener("mouseleave", blacklistHideTip, false);

			// Add the hide button.
			var hide = document.createElement("span");
			hide.className = "bbb-close-circle";
			hide.addEventListener("click", function(event) {
				if (event.button !== 0)
					return;

				var els = document.getElementsByClassName(id);

				for (var i = 0, il = els.length; i < il; i++)
					blacklistHidePost(els[i]);

				bbb.blacklist.match_list[id].override = false;
			}, false);
			target.appendChild(hide);
		}
	}

	function blacklistShowTip(event, content) {
		// Display the blacklist control tip.
		var x = event.pageX;
		var y = event.pageY;
		var tip = bbb.el.blacklistTip;

		formatTip(event, tip, content, x, y);
	}

	function blacklistHideTip() {
		// Reset the blacklist control tip to hidden.
		var tip = bbb.el.blacklistTip;

		if (tip)
			tip.removeAttribute("style");
	}

	function blacklistSmartView(el) {
		// Set up the smart view event listeners.
		var img = el.getElementsByTagName("img")[0];
		var link = (img ? img.bbbParent("A", 3) : undefined);

		if (!link)
			return;

		// Normal left click support.
		link.addEventListener("click", function(event) {
			if (event.button === 0)
				blacklistSmartViewUpdate(el);
		}, false);

		// Right and middle button click support.
		link.addEventListener("mousedown", function(event) {
			if (event.button === 1)
				bbb.blacklist.smart_view_target = link;
		}, false);
		link.addEventListener("mouseup", function(event) {
			if (event.button === 1 && bbb.blacklist.smart_view_target === link)
				blacklistSmartViewUpdate(el);
			else if (event.button === 2)
				blacklistSmartViewUpdate(el);
		}, false);
	}

	function blacklistSmartViewUpdate(el) {
		// Update the blacklisted thumbnail info in the smart view object.
		var time = new Date().getTime();
		var id = el.bbbInfo("id");
		var smartView = localStorage.getItem("bbb_smart_view");

		if (smartView === null) // Initialize the object if it doesn't exist.
			smartView = {last: time};
		else {
			smartView = parseJson(smartView, {last: time});

			if (time - smartView.last > 60000) // Reset the object if it hasn't been changed within a minute.
				smartView = {last: time};
			else
				smartView.last = time; // Adjust the object.
		}

		if (!el.bbbHasClass("blacklisted-active"))
			smartView[id] = time;
		else
			delete smartView[id];

		localStorage.bbbSetItem("bbb_smart_view", JSON.stringify(smartView));
	}

	function blacklistSmartViewCheck(id) {
		// Check whether to display the post during the blacklist init.
		var smartView = localStorage.getItem("bbb_smart_view");

		if (!blacklist_smart_view || smartView === null)
			return false;
		else {
			var time = new Date().getTime();

			smartView = parseJson(smartView, {last: time});

			if (time - smartView.last > 60000) { // Delete the ids if the object hasn't been changed within a minute.
				localStorage.removeItem("bbb_smart_view");
				return false;
			}
			else if (!smartView[id]) // Return false if the id isn't found.
				return false;
			else if (time - smartView[id] > 60000) // Return false if the click is over a minute ago.
				return false;
		}

		return true;
	}

	function blacklistHidePost(post) {
		// Hide blacklisted post content and adjust related content.
		if (blacklist_video_playback.indexOf("pause") > -1 && gLoc === "post") {
			var postEl = getPostContent(post).el;

			if (postEl && postEl.tagName === "VIDEO")
				postEl.pause();
		}

		post.bbbAddClass("blacklisted-active");
		disablePostDDL(post);
	}

	function blacklistShowPost(post) {
		// Reveal blacklisted post content and adjust related content.
		if (blacklist_video_playback.indexOf("resume") > -1 && gLoc === "post") {
			var postEl = getPostContent(post).el;

			if (postEl && postEl.tagName === "VIDEO" && ((video_autoplay === "on" || (!bbb.post.info.has_sound && video_autoplay === "nosound")) || postEl.played.length))
				postEl.play();
		}

		post.bbbRemoveClass("blacklisted-active");
		enablePostDDL(post);
	}

	/* Other functions */
	function modifyDanbScript() {
		// Modify some Danbooru functions so that they don't run unnecessarily.
		var loadNotes = Danbooru.Note.load_all;

		Danbooru.Note.load_all = function(allow) {
			if (allow === "bbb")
				loadNotes();
		};

		Danbooru.Blacklist.initialize_all = function() {
			return;
		};
	}

	function modifyPage() {
		// Determine what function may be needed to fix/update original content.
		checkStateCache();

		if (noXML())
			return;

		var allowAPI = useAPI();
		var stateCache = (history.state || {}).bbb_posts_cache;

		if (gLoc === "post")
			delayMe(parsePost); // Delay is needed to force the script to pause and allow Danbooru to do whatever. It essentially mimics the async nature of the API call.
		else if (gLoc === "comment_search" || gLoc === "comment")
			delayMe(fixCommentSearch);
		else if (stateCache) // Use a cached set of thumbnails.
			delayMe(function() { parseListing(formatInfoArray(stateCache.posts)); });
		else if (allowAPI && potentialHiddenPosts(gLoc)) // API only features.
			searchJSON(gLoc);
		else if (!allowAPI && allowUserLimit()) // Alternate mode for features.
			searchPages(gLoc);

		// Cache any necessary info before leaving the page.
		window.addEventListener("beforeunload", saveStateCache);

		// Flag if the page is being unloaded in order to differentiate it from other potential XML interruptions.
		window.addEventListener("beforeunload", function(){ bbb.flags.unloading = true; });
	}

	function formatInfo(postInfo) {
		// Add information to/alter information in the post object.
		if (!postInfo)
			return undefined;

		// Hidden post fixes.
		postInfo.md5 = postInfo.md5 || "";
		postInfo.file_ext = postInfo.file_ext || "";
		postInfo.preview_file_url = postInfo.preview_file_url || "";
		postInfo.large_file_url = postInfo.large_file_url || "";
		postInfo.file_url = postInfo.file_url || "";

		// Potential null value fixes.
		postInfo.approver_id = postInfo.approver_id || "";
		postInfo.parent_id = postInfo.parent_id || "";
		postInfo.pixiv_id = postInfo.pixiv_id || "";

		// Figure out sample image dimensions and ratio.
		postInfo.large_ratio = (postInfo.image_width > 850 ? 850 / postInfo.image_width : 1);
		postInfo.large_height = Math.round(postInfo.image_height * postInfo.large_ratio);
		postInfo.large_width = Math.round(postInfo.image_width * postInfo.large_ratio);

		// Missing API/data fixes.
		postInfo.has_sound = /(?:^|\s)(?:video|flash)_with_sound(?:$|\s)/.test(postInfo.tag_string);
		postInfo.flags = postFlags(postInfo);
		postInfo.normalized_source = postInfo.normalized_source || normalizedSource(postInfo);
		postInfo.keeper_data = postInfo.keeper_data || {uid: postInfo.uploader_id};
		postInfo.uploader_name = (isModLevel() ? postInfo.uploader_name : "");

		// Custom BBB properties.
		postInfo.tag_string_desc = tagStringDesc(postInfo);
		postInfo.file_url_desc = postFileUrlDesc(postInfo);
		postInfo.thumb_class = postClasses(postInfo);
		postFileSrcs(postInfo);

		return postInfo;
	}

	function formatInfoArray(array) {
		// Add information to/alter information to post objects in an array.
		var newArray = [];

		for (var i = 0, il = array.length; i < il; i++)
			newArray.push(formatInfo(array[i]));

		return newArray;
	}

	function unformatInfo(postInfo) {
		// Remove extra BBB properties from post info.
		delete postInfo.large_ratio;
		delete postInfo.large_height;
		delete postInfo.large_width;
		delete postInfo.has_sound;
		delete postInfo.flags;
		delete postInfo.thumb_class;
		delete postInfo.crop_img_src;
		delete postInfo.preview_img_src;
		delete postInfo.file_img_src;
		delete postInfo.large_file_img_src;
		delete postInfo.tag_string_desc;
		delete postInfo.normalized_source;

		return postInfo;
	}

	function postFlags(postInfo) {
		// Figure out the flags for a post using its post information.
		var flags = "";

		if (postInfo.is_deleted)
			flags += " deleted";
		if (postInfo.is_pending)
			flags += " pending";
		if (postInfo.is_banned)
			flags += " banned";
		if (postInfo.is_flagged)
			flags += " flagged";

		return flags.bbbSpaceClean();
	}

	function postClasses(postInfo) {
		// Figure out the thumbnail classes for a post using its post information.
		var thumbClass = postInfo.thumb_class || "";

		// Skip if the classes already exist.
		if (thumbClass.indexOf("post-status-") > -1)
			return thumbClass;

		if (postInfo.is_deleted)
			thumbClass += " post-status-deleted";
		if (postInfo.is_pending)
			thumbClass += " post-status-pending";
		if (postInfo.is_flagged)
			thumbClass += " post-status-flagged";
		if (postInfo.has_children && (postInfo.has_active_children || show_deleted))
			thumbClass += " post-status-has-children";
		if (postInfo.parent_id)
			thumbClass += " post-status-has-parent";

		return thumbClass;
	}

	function tagStringList(string) {
		// Create a Danbooru style tag string list out of the first 5 tags for a category.
		var array = string.bbbSpaceClean().split(" ");
		var length = array.length;
		var result;

		if (length > 2) {
			if (length > 5) {
				array = array.slice(0,5);
				array.push("and others");
			}
			else
				array[length - 1] = "and " + array[length - 1];

			result = array.join(", ");
		}
		else if (length === 2)
			result = array.join(" and ");
		else
			result = array[0];

		return result;
	}

	function tagStringDesc(postInfo) {
		// Create a Danbooru style post description.
		var downloadName = (getMeta("og:title") || "").replace(" - Danbooru", "");
		var desc;

		if (gLoc === "post" && downloadName)
			desc = downloadName;
		else if (typeof(postInfo.tag_string_artist) === "string") {
			var artists = tagStringList(postInfo.tag_string_artist.replace(/(?:^|\s)banned_artist(?:$|\s)/, " "));
			var characters = tagStringList(postInfo.tag_string_character.replace(/_\([^)]+\)($|\s)/g, "$1"));
			var copyrights = tagStringList(postInfo.tag_string_copyright);

			if (characters !== "" && copyrights !== "")
				copyrights = " (" + copyrights + ")";

			if (artists !== "")
				artists = " drawn by " + artists;

			desc = (characters + copyrights + artists).bbbSpaceClean() || "#" + postInfo.id;
		}
		else
			desc = "";

		return desc;
	}

	function tagStringFileUrlDesc(postInfo) {
		// Create a Danbooru style post file/download description.
		var fileDesc = (postInfo.tag_string_desc ? "__" + postInfo.tag_string_desc.replace(/[^0-9a-z]+/g, "_").replace(/^_+|_+$/g, "") + "__" : "");

		return fileDesc;
	}

	function postFileUrlDesc(postInfo) {
		// Create/return the file URL desc property.
		if (gLoc !== "post") // Danbooru doesn't provide this information for thumbnail listings.
			return "";
		else if (typeof(postInfo.file_url_desc) === "string")
			return postInfo.file_url_desc;
		else if (postInfo.file_url.indexOf("__") > -1)
			return "__" + postInfo.file_url.split("__")[1] + "__";
		else
			return tagStringFileUrlDesc(postInfo);
	}

	function postFileSrcs(postInfo) {
		// Add the BBB file URL properties to post info.
		postInfo.preview_img_src = postInfo.preview_file_url || bbbHiddenImg;

		if (postInfo.md5) {
			var pathChars = postInfo.md5.match(/^(..)(..)/);

			postInfo.crop_img_src = "https://raikou3.donmai.us/crop/" + pathChars[1] + "/" + pathChars[2] + "/" + postInfo.md5 + ".jpg";
		}
		else
			postInfo.crop_img_src = bbbHiddenImg;

		if (disable_tagged_filenames && postInfo.file_url.indexOf("__") > -1) {
			postInfo.file_img_src = postInfo.file_url.replace(postInfo.file_url_desc, "");
			postInfo.large_file_img_src = postInfo.large_file_url.replace(postInfo.file_url_desc, "");
		}
		else if (!disable_tagged_filenames && postInfo.file_url.indexOf("__") < 0) {
			postInfo.file_img_src = postInfo.file_url.replace(/\/(?=[\w\-]+\.\w+$)/, "/" + postInfo.file_url_desc);
			postInfo.large_file_img_src = postInfo.large_file_url.replace(/\/(?=[\w\-]+\.\w+$)/, "/" + postInfo.file_url_desc);
		}
		else {
			postInfo.file_img_src = postInfo.file_url;
			postInfo.large_file_img_src = postInfo.large_file_url;
		}
	}

	function normalizedSource(postInfo) {
		// Produce a normalized source from a post's source information.
		var source = postInfo.source;
		var urlReg, url, id, artist, title; // If/else variables.

		if (!!(urlReg = source.match(/^https?:\/\/img\d+\.pixiv\.net\/img\/[^\/]+\/(\d+)/i) || source.match(/^https?:\/\/i\d\.pixiv\.net\/img\d+\/img\/[^\/]+\/(\d+)/i)))
			url = "https://www.pixiv.net/member_illust.php?mode=medium&illust_id=" + urlReg[1];
		else if (!!(urlReg = source.match(/^https?:\/\/(?:i\d+\.pixiv\.net|i\.pximg\.net)\/img-(?:master|original)\/img\/(?:\d+\/)+(\d+)_p/i) || source.match(/^https?:\/\/(?:i\d+\.pixiv\.net|i\.pximg\.net)\/c\/\d+x\d+\/img-master\/img\/(?:\d+\/)+(\d+)_p/i) || source.match(/^https?:\/\/(?:i\d+\.pixiv\.net|i\.pximg\.net)\/img-zip-ugoira\/img\/(?:\d+\/)+(\d+)_ugoira\d+x\d+\.zip/i)))
			url = "https://www.pixiv.net/member_illust.php?mode=medium&illust_id=" + urlReg[1];
		else if (!!(urlReg = source.match(/^https?:\/\/lohas\.nicoseiga\.jp\/priv\/(\d+)\?e=\d+&h=[a-f0-9]+/i) || source.match(/^https?:\/\/lohas\.nicoseiga\.jp\/priv\/[a-f0-9]+\/\d+\/(\d+)/i)))
			url = "https://seiga.nicovideo.jp/seiga/im" + urlReg[1];
		else if (!!(urlReg = source.match(/^https?:\/\/(?:d3j5vwomefv46c|dn3pm25xmtlyu)\.cloudfront\.net\/photos\/large\/(\d+)\./i))) {
			id = parseInt(urlReg[1]).toString(36);
			url = "https://twitpic.com/" + id;
		}
		else if (!!(urlReg = source.match(/^https?:\/\/(?:(?:fc|th|pre|orig|img|prnt)\d{2}|origin-orig)\.deviantart\.net\/.+\/([a-z0-9_]+)_by_([a-z0-9_]+)-d([a-z0-9]+)\./i))) {
			title = urlReg[1].replace(/[^A-Za-z0-9]/g, " ").bbbSpaceClean().replace(/[ ]/g, "-");
			artist = urlReg[2].replace(/_/g, "-");
			id = parseInt(urlReg[3], 36);
			url = "https://www.deviantart.com/" + artist + "/art/" + title + "-" + id;
		}
		else if (!!(urlReg = source.match(/^https?:\/\/(?:fc|th|pre|orig|img|prnt)\d{2}\.deviantart\.net\/.+\/[a-f0-9]{32}-d([a-z0-9]+)\./i))) {
			id = parseInt(urlReg[1], 36);
			url = "https://deviantart.com/deviation/" + id;
		}
		else if (!!(urlReg = source.match(/^http:\/\/www\.karabako\.net\/images(?:ub)?\/karabako_(\d+)(?:_\d+)?\./i)))
			url = "http://www.karabako.net/post/view/" + urlReg[1];
		else if (!!(urlReg = source.match(/^http:\/\/p\.twpl\.jp\/show\/(?:large|orig)\/([a-z0-9]+)/i)))
			url = "http://p.twipple.jp/" + urlReg[1];
		else if (!!(urlReg = source.match(/^https?:\/\/pictures\.hentai-foundry\.com\/\/?[^\/]\/([^\/]+)\/(\d+)/i)))
			url = "https://www.hentai-foundry.com/pictures/user/" + urlReg[1] + "/" + urlReg[2];
		else if (!!(urlReg = source.match(/^http:\/\/blog(?:(?:-imgs-)?\d*(?:-origin)?)?\.fc2\.com\/(?:(?:[^\/]\/){3}|(?:[^\/]\/))([^\/]+)\/(?:file\/)?([^\.]+\.[^\?]+)/i)))
			url = "http://" + urlReg[1] + ".blog.fc2.com/img/" + urlReg[2] + "/";
		else if (!!(urlReg = source.match(/^http:\/\/diary(\d?)\.fc2\.com\/user\/([^\/]+)\/img\/(\d+)_(\d+)\/(\d+)\./i)))
			url = "http://diary" + urlReg[1] + ".fc2.com/cgi-sys/ed.cgi/" + urlReg[2] + "?Y=" + urlReg[3] + "&M=" + urlReg[4] + "&D=" + urlReg[5];
		else if (!!(urlReg = source.match(/^https?:\/\/(?:fbcdn-)?s(?:content|photos)-[^\/]+\.(?:fbcdn|akamaihd)\.net\/hphotos-.+\/\d+_(\d+)_(?:\d+_){1,3}[no]\./i)))
			url = "https://www.facebook.com/photo.php?fbid=" + urlReg[1];
		else if (!!(urlReg = source.match(/^https?:\/\/c(?:s|han|[1-4])\.sankakucomplex\.com\/data(?:\/sample)?\/(?:[a-f0-9]{2}\/){2}(?:sample-|preview)?([a-f0-9]{32})/i)))
			url = "https://chan.sankakucomplex.com/en/post/show?md5=" + urlReg[1];
		else if (!!(urlReg = source.match(/^http:\/\/s(?:tatic|[1-4])\.zerochan\.net\/.+(?:\.|\/)(\d+)\.(?:jpe?g?)$/i)))
			url = "https://www.zerochan.net/" + urlReg[1] + "#full";
		else if (!!(urlReg = source.match(/^http:\/\/static[1-6]?\.minitokyo\.net\/(?:downloads|view)\/(?:\d{2}\/){2}(\d+)/i)))
			url = "http://gallery.minitokyo.net/download/" + urlReg[1];
		else if (postInfo.md5 && !!(urlReg = source.match(/^https?:\/\/(?:\w+\.)?gelbooru\.com\/\/?(?:images|samples)\/(?:\d+|[a-f0-9]{2}\/[a-f0-9]{2})\/(?:sample_)?(?:[a-f0-9]{32}|[a-f0-9]{40})\./i)))
			url = "https://gelbooru.com/index.php?page=post&s=list&md5=" + postInfo.md5;
		else if (!!(urlReg = source.match(/^https?:\/\/(?:slot\d*\.)?im(?:g|ages)\d*\.wikia\.(?:nocookie\.net|com)\/(?:_{2}cb\d{14}\/)?([^\/]+)(?:\/[a-z]{2})?\/images\/(?:(?:thumb|archive)?\/)?[a-f0-9]\/[a-f0-9]{2}\/(?:\d{14}(?:!|%21))?([^\/]+)/i)))
			url = "http://" + urlReg[1] + ".wikia.com/wiki/File:" + urlReg[2];
		else if (!!(urlReg = source.match(/^https?:\/\/vignette(?:\d*)\.wikia\.nocookie\.net\/([^\/]+)\/images\/[a-f0-9]\/[a-f0-9]{2}\/([^\/]+)/i)))
			url = "http://" + urlReg[1] + ".wikia.com/wiki/File:" + urlReg[2];
		else if (!!(urlReg = source.match(/^http:\/\/(?:(?:\d{1,3}\.){3}\d{1,3}):(?:\d{1,5})\/h\/([a-f0-9]{40})-(?:\d+-){3}(?:png|gif|(?:jpe?g?))\/keystamp=\d+-[a-f0-9]{10}\/([^\/]+)/i)))
			url = "http://g.e-hentai.org/?f_shash=" + urlReg[1] + "&fs_from=" + urlReg[2];
		else if (!!(urlReg = source.match(/^http:\/\/e-shuushuu.net\/images\/\d{4}-(?:\d{2}-){2}(\d+)/i)))
			url = "http://e-shuushuu.net/image/" + urlReg[1];
		else if (!!(urlReg = source.match(/^http:\/\/jpg\.nijigen-daiaru\.com\/(\d+)/i)))
			url = "http://nijigen-daiaru.com/book.php?idb=" + urlReg[1];
		else if (!!(urlReg = source.match(/^https?:\/\/sozai\.doujinantena\.com\/contents_jpg\/([a-f0-9]{32})\//i)))
			url = "http://doujinantena.com/page.php?id=" + urlReg[1];
		else if (!!(urlReg = source.match(/^http:\/\/rule34-(?:data-\d{3}|images)\.paheal\.net\/(?:_images\/)?([a-f0-9]{32})/i)))
			url = "https://rule34.paheal.net/post/list/md5:" + urlReg[1] + "/1";
		else if (!!(urlReg = source.match(/^http:\/\/shimmie\.katawa-shoujo\.com\/image\/(\d+)/i)))
			url = "https://shimmie.katawa-shoujo.com/post/view/" + urlReg[1];
		else if (postInfo.md5 && !!(urlReg = source.match(/^http:\/\/(?:(?:(?:img\d?|cdn)\.)?rule34\.xxx|img\.booru\.org\/(?:rule34|r34))(?:\/(?:img\/rule34|r34))?\/{1,2}images\/\d+\/(?:[a-f0-9]{32}|[a-f0-9]{40})\./i)))
			url = "https://rule34.xxx/index.php?page=post&s=list&md5=" + postInfo.md5;
		else if (!!(urlReg = source.match(/^https?:\/\/(?:s3\.amazonaws\.com\/imgly_production|img\.ly\/system\/uploads)\/((?:\d{3}\/){3}|\d+\/)/i))) {
			id = parseInt((urlReg[1].replace(/[^0-9]/g, '')) || 0).bbbEncode62();
			url = "https://img.ly/" + id;
		}
		else if (!!(urlReg = source.match(/^(http:\/\/.+)\/diarypro\/d(?:ata\/upfile\/|iary\.cgi\?mode=image&upfile=)(\d+)/i)))
			url = urlReg[1] + "/diarypro/diary.cgi?no=" + urlReg[2];
		else if (!!(urlReg = source.match(/^http:\/\/i(?:\d)?\.minus\.com\/(?:i|j)([^\.]{12,})/i)))
			url = "http://minus.com/i/" + urlReg[1];
		else if (!!(urlReg = source.match(/^https?:\/\/pic0[1-4]\.nijie\.info\/nijie_picture\/(?:diff\/main\/)?\d+_(\d+)_(?:\d{10}|\d+_\d{14})/i)))
			url = "https://nijie.info/view.php?id=" + urlReg[1];
		else if (!!(urlReg = source.match(/^https?:\/\/(?:[^.]+\.)?yande\.re\/(?:image|jpeg|sample)\/[a-f0-9]{32}\/yande\.re%20(\d+)/i)))
			url = "https://yande.re/post/show/" + urlReg[1];
		else if (!!(urlReg = source.match(/^https?:\/\/(?:[^.]+\.)?yande\.re\/(?:image|jpeg|sample)\/([a-f0-9]{32})(?:\/yande\.re.*|\/?\.(?:jpg|png))$/i)))
			url = "https://yande.re/post?tags=md5:" + urlReg[1];
		else if (!!(urlReg = source.match(/^https?:\/\/(?:[^.]+\.)?konachan\.com\/(?:image|jpeg|sample)\/[a-f0-9]{32}\/Konachan\.com%20-%20(\d+)/i)))
			url = "https://konachan.com/post/show/" + urlReg[1];
		else if (!!(urlReg = source.match(/^https?:\/\/(?:[^.]+\.)?konachan\.com\/(?:image|jpeg|sample)\/([a-f0-9]{32})(?:\/Konachan\.com%20-%20.*|\/?\.(?:jpg|png))$/i)))
			url = "https://konachan.com/post?tags=md5:" + urlReg[1];
		else if (!!(urlReg = source.match(/^https?:\/\/\w+\.artstation.com\/(?:artwork|projects)\/([a-z0-9-]+)$/i)))
			url = "https://www.artstation.com/artwork/" + urlReg[1];
		else if (!!(urlReg = source.match(/^https?:\/\/(?:o|image-proxy-origin)\.twimg\.com\/\d\/proxy\.jpg\?t=(\w+)&/i))) {
			url = window.atob(urlReg[1]).match(/https?:\/\/[\x20-\x7e]+/i);

			if (url[0]) {
				url = url[0];

				if (url.match(/^https?:\/\/twitpic.com\/show\/large\/[a-z0-9]+/i))
					url = url.substring(0, url.lastIndexOf('.')).replace("show/large/", "");
			}
			else
				url = source;
		}
		else if (!!(urlReg = source.match(/^https?:\/\/\w+\.photozou\.jp\/pub\/\d+\/(\d+)\/photo\/(\d+)_.*$/i)))
			url = "https://photozou.jp/photo/show/" + urlReg[1] + "/" + urlReg[2];
		else if (!!(urlReg = source.match(/^https?:\/\/\w+\.?toranoana\.jp\/(?:popup_(?:bl)?img\d*|ec\/img)\/\d{2}\/\d{4}\/\d{2}\/\d{2}\/(\d+)/i)))
			url = "https://ec.toranoana.jp/tora_r/ec/item/" + urlReg[1] + "/";
		else if (!!(urlReg = source.match(/^https?:\/\/\w+\.hitomi\.la\/galleries\/(\d+)\/(?:page)?(\d+)\w*\.[a-z]+$/i)))
			url = "https://hitomi.la/reader/" + urlReg[1] + ".html#" + parseInt(urlReg[2], 10);
		else if (!!(urlReg = source.match(/^https?:\/\/\w+\.hitomi\.la\/galleries\/(\d+)\/\w*\.[a-z]+$/i)))
			url = "https://hitomi.la/galleries/" + urlReg[1] + ".html";
		else
			url = source;

		return url;
	}

	function fixPaginator(target) {
		// Determine whether the paginator needs to be updated and request one as needed.
		var paginator = getPaginator(target);

		if (!paginator || gLoc === "pool" || gLoc === "favorite_group" || !allowUserLimit())
			return;

		if (/\d/.test(paginator.textContent)) { // Fix numbered paginators.
			// Fix existing paginator with user's custom limit.
			var pageLinks = paginator.getElementsByTagName("a");

			for (var i = 0, il = pageLinks.length; i < il; i++) {
				var pageLink = pageLinks[i];
				pageLink.href = updateURLQuery(pageLink.href, {limit: thumbnail_count});
			}

			searchPages("paginator");
		}
		else { // Fix next/previous paginators.
			paginator.innerHTML = "<p>Loading...</p>"; // Disable the paginator while fixing it.

			searchPages("paginator");
		}
	}

	function fixCommentSearch() {
		// Fix the thumbnails for hidden posts in the comment search.
		var posts = getPosts();

		for (var i = 0, il = posts.length; i < il; i++) {
			var post = posts[i];
			var postInfo = post.bbbInfo();
			var hasImg = post.getElementsByTagName("img")[0];
			var tags = postInfo.tag_string;

			// Skip posts with content the user doesn't want or that already have images.
			if (hasImg || (!show_loli && /(?:^|\s)loli(?:$|\s)/.test(tags)) || (!show_shota && /(?:^|\s)shota(?:$|\s)/.test(tags)) || (!show_toddlercon && /(?:^|\s)toddlercon(?:$|\s)/.test(tags)) || (!show_banned && /(?:^|\s)banned(?:$|\s)/.test(postInfo.flags)) || safebPostTest(post))
				continue;

			var preview = post.getElementsByClassName("preview")[0];
			var before = preview.firstElementChild;

			var thumb = document.createElement("a");
			thumb.href = "/posts/" + postInfo.id;
			thumb.innerHTML = '<img src="' + postInfo.preview_img_src + '">';

			if (before)
				preview.insertBefore(thumb, before);
			else
				preview.appendChild(thumb);

			prepThumbnails(post);
		}
	}

	function parseJson(jsonString, fallback) {
		// Try to parse a JSON string and catch any error that pops up.
		try {
			return JSON.parse(jsonString);
		}
		catch (error) {
			if (fallback && typeof(jsonString) === "string") {
				if (typeof(fallback) === "function")
					fallback(error, jsonString);
				else
					return fallback;
			}
			else
				throw error;
		}
	}

	function jsonSettingsErrorHandler(error, jsonString) {
		// Default function for "bbb_settings" in parseJson that alerts the user of a problem and returns the default settings instead.
		function corruptSettingsDialog() {
			var textarea = document.createElement("textarea");
			textarea.style.width = "900px";
			textarea.style.height = "300px";
			textarea.value = "Corrupt Better Better Booru Settings (" + timestamp() + ") (Error: " + error.message + "):\r\n\r\n" + jsonString + "\r\n";
			bbbDialog(textarea);
		}

		var linkId = uniqueIdNum();
		var noticeMsg = bbbNotice('BBB was unable to load your settings due to an unexpected error potentially caused by corrupted information. If you would like a copy of your corrupt settings, please click <a id="' + linkId + '" href="#">here</a>. (Error: ' + error.message + ')', -1);

		document.getElementById(linkId).addEventListener("click", function(event) {
			if (event.button !== 0)
				return;

			closeBbbNoticeMsg(noticeMsg);
			corruptSettingsDialog();
			event.preventDefault();
		}, false);

		return defaultSettings();
	}

	function bbbNotice(txt, noticeType) {
		// Display the notice or add information to it if it already exists.
		// A secondary number argument can be provided: -1 = error, 0 = permanent, >0 = temporary (disappears after X seconds where X equals the number provided), "no number" = temporary for 6 seconds
		var notice = bbb.el.notice;
		var noticeMsg = bbb.el.noticeMsg;
		var type = (typeof(noticeType) !== "undefined" ? noticeType : 6);

		var msg = document.createElement("div");
		msg.className = "bbb-notice-msg-entry";
		msg.innerHTML = txt;
		msg.style.color = (type === -1 ? "#FF0000" : "#000000");

		if (!notice) {
			var noticeContainer = document.createElement("span"); // Will contain the Danbooru notice and BBB notice so that they can "stack" and reposition as the other disappears.
			noticeContainer.id = "bbb-notice-container";

			var danbNotice = document.getElementById("notice");

			// Override Danbooru notice styling to make it get along with the notice container.
			if (danbNotice) {
				danbNotice.style.marginBottom = "10px";
				danbNotice.style.width = "100%";
				danbNotice.style.position = "relative";
				danbNotice.style.top = "0px";
				danbNotice.style.left = "0px";
				noticeContainer.appendChild(danbNotice);
			}

			notice = bbb.el.notice = document.createElement("div");
			notice.id = "bbb-notice";
			notice.innerHTML = '<div style="position:absolute; left: 3px; font-weight: bold;">BBB:</div><div id="bbb-notice-msg"></div><div style="position: absolute; top: 3px; right: 3px; cursor: pointer;" class="close-button ui-icon ui-icon-closethick" id="bbb-notice-close"></div>';
			noticeContainer.appendChild(notice);

			noticeMsg = bbb.el.noticeMsg = getId("bbb-notice-msg", notice);

			getId("bbb-notice-close", notice).addEventListener("click", function(event) {
				if (event.button !== 0)
					return;

				closeBbbNotice();
				event.preventDefault();
			}, false);

			document.body.appendChild(noticeContainer);
		}

		if (bbb.timers.keepBbbNotice)
			window.clearTimeout(bbb.timers.keepBbbNotice);

		if (notice.style.display === "block" && /\S/.test(noticeMsg.textContent)) { // Insert new text at the top if the notice is already open and has an actual message.
			noticeMsg.insertBefore(msg, noticeMsg.firstElementChild);

			// Don't allow the notice to be closed via clicking for half a second. Prevents accidental message closing.
			bbb.timers.keepBbbNotice = window.setTimeout(function() {
				bbb.timers.keepBbbNotice = 0;
			}, 500);
		}
		else { // Make sure the notice is clear and put in the first message.
			noticeMsg.innerHTML = "";
			noticeMsg.appendChild(msg);
		}

		// Hide the notice after a certain number of seconds.
		if (type > 0) {
			window.setTimeout(function() {
				closeBbbNoticeMsg(msg);
			}, type * 1000);
		}

		notice.style.display = "block";

		return msg;
	}

	function closeBbbNotice() {
		// Click handler for closing the notice.
		if (bbb.timers.keepBbbNotice)
			return;

		bbb.el.notice.style.display = "none";
	}

	function closeBbbNoticeMsg(el) {
		// Closes the provided notice message or the whole notice if there is only one message.
		var notice = bbb.el.notice;
		var target = el;
		var targetParent = target.parentNode;

		if (notice.getElementsByClassName("bbb-notice-msg-entry").length < 2)
			closeBbbNotice();
		else if (targetParent)
			targetParent.removeChild(target);
	}

	function bbbStatus(mode, xmlState) {
		// Updates the BBB status message.
		// xmlState: "new" = opening an XML request, "done" = closing an xml request, "error" = xml request failed.
		if (!enable_status_message)
			return;

		var status = bbb.el.status;

		// Set up the status message if it isn't ready.
		if (!status) {
			bbb.status = { // Status messages.
				msg: {
					post_comments: {txt: "Loading hidden comments... ", count: 0},
					posts: {txt: "Loading post info... ", count: 0} // General message for XML requests for hidden posts.
				},
				count: 0
			};

			var msgList = bbb.status.msg;

			status = bbb.el.status = document.createElement("div");
			status.id = "bbb-status";

			for (var i in msgList) {
				if (msgList.hasOwnProperty(i)) {
					var curMsg = msgList[i];

					var msgDiv = curMsg.el = document.createElement("div");
					msgDiv.style.display = "none";
					msgDiv.innerHTML = curMsg.txt;
					status.appendChild(msgDiv);

					curMsg.info = document.createElement("span");
					msgDiv.appendChild(curMsg.info);
				}
			}

			document.body.appendChild(status);
		}

		var msg = bbb.status.msg[mode];
		var newCount = 0;

		if (msg.queue) { // If the xml requests are queued, use the queue length as the current remaining value.
			newCount = (xmlState === "error" ? 0 : msg.queue.length);
			bbb.status.count += newCount - msg.count;
			msg.count = newCount;
			msg.info.innerHTML = newCount; // Update the displayed number of requests remaining.
		}
		else { // For simultaneous xml requests, just increment/decrement.
			if (xmlState === "new")
				newCount = 1;
			else if (xmlState === "done" || xmlState === "error")
				newCount = -1;

			bbb.status.count += newCount;
			msg.count += newCount;
		}

		if (msg.count)
			msg.el.style.display = "block";
		else
			msg.el.style.display = "none";

		if (bbb.status.count) // If requests are pending, display the notice.
			status.style.display = "block";
		else // If requests are done, hide the notice.
			status.style.display = "none";
	}

	function bbbDialog(content, properties) {
		// Open a dialog window that can have a predefined ok button (default) and/or cancel button. The properties object specifies dialog behavior and has the following values:
		// ok/cancel: true to display the button, false to hide the button, function to display the button and specify a custom function for it
		// condition: string to name a basic flag that will be checked/set by a dialog before displaying it, function to check custom conditions for a dialog before displaying it
		// important: true to prioritize a dialog if it goes in the queue, false to allow a dialog to go to the end of the queue as normal

		var prop = properties || {};
		var okButton = (prop.ok === undefined ? true : prop.ok);
		var cancelButton = (prop.cancel === undefined ? false : prop.cancel);
		var condition = (prop.condition === undefined ? false : prop.condition);
		var important = (prop.important === undefined ? false : prop.important);

		// Queue the dialog window if one is already open.
		if (document.getElementById("bbb-dialog-blocker")) {
			if (important)
				bbb.dialog.queue.unshift({content: content, properties: properties});
			else
				bbb.dialog.queue.push({content: content, properties: properties});

			return;
		}

		// Test whether the dialog window should be allowed to display.
		if (condition) {
			var conditionType = typeof(condition);

			if ((conditionType === "string" && bbb.flags[condition]) || (conditionType === "function" && condition())) {
				nextBbbDialog();
				return;
			}
			else if (conditionType === "string")
				bbb.flags[condition] = true;
		}

		// Create the dialog window.
		var blockDiv = document.createElement("div");
		blockDiv.id = "bbb-dialog-blocker";

		var windowDiv = document.createElement("div");
		windowDiv.id = "bbb-dialog-window";
		windowDiv.tabIndex = "-1";
		blockDiv.appendChild(windowDiv);

		var contentDiv = windowDiv;

		if (okButton) {
			var ok = document.createElement("a");
			ok.innerHTML = "OK";
			ok.href = "#";
			ok.className = "bbb-dialog-button";

			if (typeof(okButton) === "function")
				ok.addEventListener("click", okButton, false);

			ok.addEventListener("click", closeBbbDialog, false);

			okButton = ok;
		}

		if (cancelButton) {
			var cancel = document.createElement("a");
			cancel.innerHTML = "Cancel";
			cancel.href = "#";
			cancel.className = "bbb-dialog-button";
			cancel.style.cssFloat = "right";

			if (typeof(cancelButton) === "function")
				cancel.addEventListener("click", cancelButton, false);

			cancel.addEventListener("click", closeBbbDialog, false);

			cancelButton = cancel;
		}

		if (okButton || cancelButton) {
			contentDiv = document.createElement("div");
			contentDiv.className = "bbb-dialog-content-div";
			windowDiv.appendChild(contentDiv);

			var buttonDiv = document.createElement("div");
			buttonDiv.className = "bbb-dialog-button-div";
			windowDiv.appendChild(buttonDiv);

			if (okButton)
				buttonDiv.appendChild(okButton);

			if (cancelButton)
				buttonDiv.appendChild(cancelButton);

			// Only allow left clicks to trigger the prompt buttons.
			buttonDiv.addEventListener("click", function(event) {
				if (event.button !== 0)
					event.stopPropagation();
			}, true);
		}

		if (typeof(content) === "string")
			contentDiv.innerHTML = content;
		else
			contentDiv.appendChild(content);

		document.body.appendChild(blockDiv);

		(okButton || cancelButton || windowDiv).focus();
	}

	function closeBbbDialog(event) {
		// Close the current dialog window.
		var dialogBlocker = document.getElementById("bbb-dialog-blocker");

		if (dialogBlocker)
			document.body.removeChild(dialogBlocker);

		nextBbbDialog();

		event.preventDefault();
	}

	function nextBbbDialog() {
		// Open the next queued dialog window.
		var nextDialog = bbb.dialog.queue.shift();

		if (nextDialog)
			bbbDialog(nextDialog.content, nextDialog.properties);
	}

	function thumbSearchMatch(post, searchArray) {
		// Take search objects and test them against a thumbnail's info.
		if (!searchArray[0])
			return false;

		var postSearchInfo; // If/else variable.

		if (post instanceof Element) {
			var postInfo = post.bbbInfo();
			var flags = postInfo.flags || "active";
			var rating = " rating:" + postInfo.rating;
			var status = " status:" + (flags === "flagged" ? flags + " active" : flags).replace(/\s/g, " status:");
			var user = (postInfo.uploader_name ? " user:" + postInfo.uploader_name.replace(/\s/g, "_").toLowerCase() : "");
			var userId = " userid:" + postInfo.uploader_id;
			var taggerId = " taggerid:" + postInfo.keeper_data.uid;
			var approverId = (postInfo.approver_id ? " approverid:" + postInfo.approver_id : "");
			var source = (postInfo.source ? " source:" + postInfo.source + " source:" + postInfo.normalized_source : "");
			var pools = " " + (/pool:\d+/.test(postInfo.pool_string) && !/pool:(collection|series)/.test(postInfo.pool_string) ? postInfo.pool_string + " pool:inactive" : postInfo.pool_string);
			var parent = (postInfo.parent_id ? " parent:" + postInfo.parent_id : "");
			var child = (postInfo.has_children === true ? " child:true" : "");
			var isFav = " isfav:" + postInfo.is_favorited;
			var filetype = " filetype:" + postInfo.file_ext;

			postSearchInfo = {
				tags: postInfo.tag_string.bbbSpacePad(),
				metatags:(rating + status + user + pools + parent + child + isFav + userId + taggerId + source + approverId + filetype).bbbSpacePad(),
				score: postInfo.score,
				favcount: postInfo.fav_count,
				id: postInfo.id,
				width: postInfo.image_width,
				height: postInfo.image_height
			};
		}
		else
			postSearchInfo = post;

		var j, jl, searchTerm; // Loop variables.

		for (var i = 0, il = searchArray.length; i < il; i++) {
			var searchObject = searchArray[i];
			var all = searchObject.all;
			var any = searchObject.any;

			// Continue to the next matching rule if there are no tags to test.
			if (!any.total && !all.total)
				continue;

			if (any.total) {
				var anyResult = false;

				// Loop until one positive match is found.
				for (j = 0, jl = any.includes.length; j < jl; j++) {
					searchTerm = any.includes[j];

					if (thumbTagMatch(postSearchInfo, searchTerm)) {
						anyResult = true;
						break;
					}
				}

				// If we don't have a positive match yet, loop through the excludes.
				if (!anyResult) {
					for (j = 0, jl = any.excludes.length; j < jl; j++) {
						searchTerm = any.excludes[j];

						if (!thumbTagMatch(postSearchInfo, searchTerm)) {
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
				var allResult = true;

				// Loop until a negative match is found.
				for (j = 0, jl = all.includes.length; j < jl; j++) {
					searchTerm = all.includes[j];

					if (!thumbTagMatch(postSearchInfo, searchTerm)) {
						allResult = false;
						break;
					}
				}

				// If we still have a positive match, loop through the excludes.
				if (allResult) {
					for (j = 0, jl = all.excludes.length; j < jl; j++) {
						searchTerm = all.excludes[j];

						if (thumbTagMatch(postSearchInfo, searchTerm)) {
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

	function thumbTagMatch(postSearchInfo, tag) {
		// Test thumbnail info for a tag match.
		var targetTags; // If/else variable.

		if (typeof(tag) === "string") { // Check regular tags and metatags with string values.
			targetTags = (isMetatag(tag) ? postSearchInfo.metatags : postSearchInfo.tags);

			if (targetTags.indexOf(tag) > -1)
				return true;
			else
				return false;
		}
		else if (tag instanceof RegExp) { // Check wildcard tags.
			targetTags = (isMetatag(tag.source) ? postSearchInfo.metatags : postSearchInfo.tags);

			return tag.test(targetTags);
		}
		else if (typeof(tag) === "object") {
			if (tag instanceof Array) // Check grouped tags.
				return thumbSearchMatch(postSearchInfo, tag);
			else { // Check numeric metatags.
				var tagsMetaValue = postSearchInfo[tag.tagName];

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
	}

	function createSearch(string) {
		// Take search strings, turn them into search objects, and pass back the objects in an array.
		if (!/[^\s,]/.test(string))
			return [];

		var searchString = string;
		var i, il; // Loop variables.

		// Group handling.
		searchString = replaceSearchGroupMetatag(searchString);

		var groupsObject = replaceSearchGroups(searchString);
		var groups = groupsObject.groups;
		var searchStrings = groupsObject.search.toLowerCase().replace(/\b(rating:[qes])\w+/g, "$1").split(",");
		var searches = [];

		// Sort through each matching rule.
		for (i = 0, il = searchStrings.length; i < il; i++) {
			var searchTerms = searchStrings[i].split(" ");
			var searchObject = {
				all: {includes: [], excludes: [], total: 0},
				any: {includes: [], excludes: [], total: 0}
			};

			// Divide the tags into any and all sets with excluded and included tags.
			for (var j = 0, jl = searchTerms.length; j < jl; j++) {
				var searchTerm = searchTerms[j];
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

				if (!searchTerm.length) // Stop if there is no actual tag.
					continue;

				var mode = searchObject[primaryMode][secondaryMode];

				if (isNumMetatag(searchTerm)) { // Parse numeric metatags and turn them into objects.
					var tagArray = searchTerm.split(":");
					var metaObject = {
						tagName: tagArray[0],
						equals: undefined,
						greater: undefined,
						less: undefined
					};
					var numSearch = tagArray[1];
					var numArray, equals, greater, less; // If/else variables.

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
					else if (numSearch.indexOf("..") > -1) { // Greater than or equal to and less than or equal to range. (tag:#..#)
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
					mode.push(new RegExp(escapeRegEx(searchTerm).replace(/\*/g, "\S*").bbbSpacePad())); // Don't use "\\S*" here since escapeRegEx replaces * with \*. That escape carries over to the next replacement and makes us end up with "\\S*".
				else if (/%\d+%/.test(searchTerm)) { // Prepare grouped tags as a search object.
					var groupIndex = Number(searchTerm.match(/\d+/)[0]);

					mode.push(createSearch(groups[groupIndex]));
				}
				else if (typeof(searchTerm) === "string") { // Add regular tags.
					if (isMetatag(searchTerm)) {
						var tagObject = searchTerm.split(/:(.+)/, 2);
						var tagName = tagObject[0];
						var tagValue = tagObject[1];

						// Drop metatags with no value.
						if (!tagValue)
							continue;

						if (tagValue === "any" && (tagName === "pool" || tagName === "parent" || tagName === "child" || tagName === "source" || tagName === "approverid"))
							mode.push(new RegExp((tagName + ":\\S*").bbbSpacePad()));
						else if (tagValue === "none" && (tagName === "pool" || tagName === "parent" || tagName === "child" || tagName === "source" || tagName === "approverid")) {
							secondaryMode = (secondaryMode === "includes" ? "excludes" : "includes"); // Flip the include/exclude mode.
							mode = searchObject[primaryMode][secondaryMode];

							mode.push(new RegExp((tagName + ":\\S*").bbbSpacePad()));
						}
						else if (tagValue === "active" && tagName === "pool")
							mode.push(new RegExp((tagName + ":(collection|series)").bbbSpacePad()));
						else if (tagName === "source") // Append a wildcard to the end of "sources starting with the given value" searches.
							mode.push(new RegExp((escapeRegEx(searchTerm) + "\\S*").bbbSpacePad()));
						else // Allow all other values through (ex: parent:# & pool:series).
							mode.push(searchTerm.bbbSpacePad());
					}
					else
						mode.push(searchTerm.bbbSpacePad());
				}
			}

			searchObject.all.total = searchObject.all.includes.length + searchObject.all.excludes.length;
			searchObject.any.total = searchObject.any.includes.length + searchObject.any.excludes.length;

			if (searchObject.all.total || searchObject.any.total)
				searches.push(searchObject);
		}

		return searches;
	}

	function replaceSearchGroupMetatag(string) {
		// Replace group metatags in a search string with their respective tags.
		var searchString = string;

		if (string.indexOf("g:") > -1 || string.indexOf("group:") > -1) {
			loadMetaGroups();

			var groupMetaRegEx = /((?:^|\s)[-~]*)g(?:roup)?:([^\s,]+)/;
			var groupMetaRecursion = 1;
			var groupMetaMatches;

			while (groupMetaRecursion <= 99 && (groupMetaMatches = searchString.match(groupMetaRegEx))) {
				searchString = searchString.replace(groupMetaMatches[0], groupMetaMatches[1] + "( " + (bbb.groups[groupMetaMatches[2]] || "") + " )");
				groupMetaRecursion++;
			}

			if (groupMetaRecursion > 99 && groupMetaRegEx.test(searchString)) {
				var recursiveGroupName = searchString.match(groupMetaRegEx)[0].split(":")[1];

				bbbNotice("While searching thumbnails, BBB encountered what appears to be an infinite loop in your groups. Please check you group titled \"" + recursiveGroupName + "\" to see if it references itself or other groups that eventually end up referencing back to it.", -1);
				bbb.groups[recursiveGroupName] = ""; // Disable the group.
			}
		}

		return searchString;
	}

	function replaceSearchGroups(string) {
		// Collect all the nested/grouped tags in a search string and replace them with placeholders.
		var searchString = string;

		if (string.indexOf("BBBPARENS") < 0) {
			// Replace parentheses that are not part of a tag with placeholders.
			var parensRegex = /(?:^|([\s,]))([-~]*)\(%?(?=$|[\s,])|(?:^|([\s,]))%?\)(?=$|[\s,])/;

			if (!parensRegex.test(string))
				return {search: string, groups: []};

			var parensMatches;

			while ((parensMatches = searchString.match(parensRegex))) {
				var parensMatch = parensMatches[0];
				var parensOperators = parensMatches[2] || "";
				var parensPreceding = parensMatches[1] || parensMatches[3] || "";

				searchString = searchString.replace(parensMatch, parensPreceding + (parensMatch.indexOf("(") > -1 ? parensOperators + "BBBPARENSOPEN" : "BBBPARENSCLOSE"));
			}
		}

		var parens = searchString.match(/BBBPARENSOPEN|BBBPARENSCLOSE/g);

		// Remove unpaired opening parentheses near the end of the search.
		while (parens[parens.length - 1] === "BBBPARENSOPEN") {
			searchString = searchString.replace(/^(.*\s)?[~-]*BBBPARENSOPEN/, "$1");
			parens.pop();
		}

		// Take the remaining parentheses and figure out how to pair them up.
		var startCount = 0;
		var endCount = 0;
		var groupStartIndex = 0;
		var groups = [];

		for (var i = 0, il = parens.length; i < il; i++) {
			var paren = parens[i];
			var nextParen = parens[i + 1];

			if (paren === "BBBPARENSOPEN")
				startCount++;
			else
				endCount++;

			if (endCount > startCount) { // Remove unpaired closing parentheses near the start of the string.
				searchString = searchString.replace(/^(.*?)BBBPARENSCLOSE/, "$1");
				endCount = 0;
				groupStartIndex++;
			}
			else if (startCount === endCount || (!nextParen && endCount > 0 && startCount > endCount)) { // Replace evenly paired parentheses with a placeholder.
				var groupRegex = new RegExp(parens.slice(groupStartIndex, i + 1).join(".*?"));
				var groupMatch = searchString.match(groupRegex)[0];

				searchString = searchString.replace(groupMatch, "%" + groups.length + "%");
				startCount = 0;
				endCount = 0;
				groupStartIndex = i + 1;
				groups.push(groupMatch.substring(13, groupMatch.length - 14));
			}
			else if (!nextParen && startCount > 0 && endCount === 0 ) // Remove leftover unpaired opening parentheses.
				searchString = searchString.replace(/^(.*\s)?[~-]*BBBPARENSOPEN/, "$1");
		}

		return {search: searchString, groups: groups};
	}

	function restoreSearchGroups(string, groups) {
		// Replace all group placeholders with their corresponding group and restore leftover parenthesis placeholders.
		var searchString = string;

		for (var i = 0, il = groups.length; i < il; i++) {
			var groupPlaceholder = new RegExp("%" + i + "%");

			searchString = searchString.replace(groupPlaceholder, "( " + groups[i].bbbSpaceClean() + " )");
		}

		return searchString.replace(/BBBPARENSOPEN/g, "(").replace(/BBBPARENSCLOSE/g, ")");
	}

	function cleanSearchGroups(string) {
		// Take a search string and clean up extra spaces, commas, and any parentheses that are missing their opening/closing parenthesis.
		var groupObject = replaceSearchGroups(string);
		var groups = groupObject.groups;
		var searchString = groupObject.search;

		for (var i = 0, il = groups.length; i < il; i++)
			groups[i] = cleanSearchGroups(groups[i]);

		searchString = restoreSearchGroups(searchString, groups).bbbTagClean();

		return searchString;
	}

	function searchSingleToMulti(single) {
		// Take a single line search and format it into multiple lines for a textarea.
		var groupsObject = replaceSearchGroups(cleanSearchGroups(single));
		var searchString = groupsObject.search;
		var groups = groupsObject.groups;
		var multi = searchString.replace(/,\s*/g, " \r\n\r\n");

		multi = restoreSearchGroups(multi, groups);

		return multi;
	}

	function searchMultiToSingle(multi) {
		// Take a multiple line search from a textarea and format it into a single line.
		var searchStrings = multi.split(/[\r\n]+/g);

		for (var i = 0, il = searchStrings.length; i < il; i++)
			searchStrings[i] = cleanSearchGroups(searchStrings[i]);

		var single = searchStrings.join(", ").bbbTagClean();

		return single;
	}

	function trackNew() {
		// Set up the track new option and manage the search.
		var header = document.getElementById("top");

		if (!track_new || !header)
			return;

		var activeMenu = header.getElementsByClassName("current")[0];
		var listingItem = document.getElementById("subnav-listing");

		// Insert new posts link.
		if (activeMenu && activeMenu.id === "nav-posts" && listingItem) {
			var secondMenu = listingItem.parentNode;
			var listingItemSibling = listingItem.nextElementSibling;

			var link = document.createElement("a");
			link.href = "/posts?new_posts=redirect&page=b1";
			link.innerHTML = "New";
			link.addEventListener("click", function(event) {
				if (event.button !== 0)
					return;

				trackNewLoad();
				event.preventDefault();
			}, false);

			var item = document.createElement("li");
			item.appendChild(link);

			if (listingItemSibling)
				secondMenu.insertBefore(item, listingItemSibling);
			else
				secondMenu.appendChild(item);
		}

		if (gLoc === "search") {
			var info = track_new_data;
			var mode = getVar("new_posts");
			var postsDiv = document.getElementById("posts");
			var postSections = document.getElementById("post-sections");
			var firstPost = getPosts()[0];

			if (mode === "init" && !info.viewed && !getVar("tags") && !getVar("page")) { // Initialize.
				if (firstPost) {
					info.viewed = Number(firstPost.bbbInfo("id"));
					info.viewing = 1;
					saveSettings();
					bbbNotice("New post tracking initialized. Tracking will start with new posts after the current last image.", 8);
				}
			}
			else if (mode === "redirect") { // Bookmarkable redirect link. (http://danbooru.donmai.us/posts?new_posts=redirect&page=b1)
				if (postsDiv)
					postsDiv.innerHTML = "<b>Redirecting...</b>";

				trackNewLoad();
			}
			else if (mode === "list") {
				var limitNum = getLimit() || thumbnail_count || thumbnail_count_default;
				var currentPage = Number(getVar("page")) || 1;
				var savedPage = Math.ceil((info.viewing - limitNum) / limitNum) + 1;
				var currentViewed = Number(decodeURIComponent(location.search).match(/id:>(\d+)/)[1]);
				var paginator = getPaginator();

				// Replace the chickens message on the first page with a more specific message.
				if (!firstPost && currentPage < 2) {
					if (postsDiv && postsDiv.firstElementChild)
						postsDiv.firstElementChild.innerHTML = "No new posts.";
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
						if (event.button !== 0)
							return;

						trackNewMark();
						event.preventDefault();
					}, false);

					var resetSection = document.createElement("li");
					resetSection.style.cssFloat = "right";

					var resetLink = document.createElement("a");
					resetLink.innerHTML = "Reset (Mark all viewed)";
					resetLink.href = "#";
					resetLink.style.color = "#FF1100";
					resetSection.appendChild(resetLink);
					postSections.appendChild(resetSection);

					resetLink.addEventListener("click", function(event) {
						if (event.button !== 0)
							return;

						trackNewReset();
						event.preventDefault();
					}, false);

					// Update the mark link if the paginator updates.
					if (paginator) {
						paginator.bbbWatchNodes(function() {
							var activePage = paginator.getElementsByClassName("current-page")[0];
							var pageNumber = (activePage ? activePage.textContent.bbbSpaceClean() : "1") || "1";

							if (pageNumber && pageNumber !== "1")
								markLink.innerHTML = "Mark pages 1-" + pageNumber + " viewed";
						});
					}
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

		bbbNotice("Reinitializing new post tracking. Please wait.", 0);
		location.href = "/posts?new_posts=init&limit=" + limitNum;
	}

	function trackNewMark() {
		// Mark the current images and older as viewed.
		loadSettings();

		var info = bbb.user.track_new_data;
		var limitNum = getLimit() || bbb.user.thumbnail_count || thumbnail_count_default;
		var posts = getPosts();
		var lastPost = posts[posts.length - 1];
		var lastId = (lastPost ? Number(lastPost.bbbInfo("id")) : null);

		if (!lastPost)
			bbbNotice("Unable to mark as viewed. No posts detected.", -1);
		else if (info.viewed >= lastId)
			bbbNotice("Unable to mark as viewed. Posts have already been marked.", -1);
		else {
			info.viewed = Number(lastPost.bbbInfo("id"));
			info.viewing = 1;
			saveSettings();

			bbbNotice("Posts marked as viewed. Please wait while the pages are updated.", 0);
			location.href = "/posts?new_posts=list&tags=order:id_asc+id:>" + info.viewed + "&page=1&limit=" + limitNum;
		}
	}

	function customCSS() {
		var i; // Loop variable.
		var customStyles = document.createElement("style");
		customStyles.type = "text/css";

		var styles = '#bbb-menu {background-color: #FFFFFF; border: 1px solid #CCCCCC; box-shadow: 0 2px 2px rgba(0, 0, 0, 0.5); padding: 15px; position: fixed; top: 25px; left: 50%; z-index: 9001;}' +
		'#bbb-menu *, #bbb-dialog-window * {font-size: 14px; line-height: 16px; outline: 0px none; border: 0px none; margin: 0px; padding: 0px;}' + // Reset some base settings.
		'#bbb-menu h1, #bbb-dialog-window h1 {font-size: 24px; line-height: 42px;}' +
		'#bbb-menu h2, #bbb-dialog-window h2 {font-size: 16px; line-height: 25px;}' +
		'#bbb-menu input, #bbb-menu select, #bbb-menu textarea, #bbb-dialog-window input, #bbb-dialog-window select, #bbb-dialog-window textarea {border: #CCCCCC 1px solid;}' +
		'#bbb-menu input {height: 18px; padding: 1px 0px; margin-top: 4px; vertical-align: top;}' +
		'#bbb-menu input[type="checkbox"] {margin: 0px; vertical-align: middle; position: relative; bottom: 2px;}' +
		'#bbb-menu .bbb-general-input input[type="text"], #bbb-menu .bbb-general-input select {width: 175px;}' +
		'#bbb-menu select {height: 21px; margin-top: 4px; vertical-align: top;}' +
		'#bbb-menu option {padding: 0px 3px;}' +
		'#bbb-menu textarea, #bbb-dialog-window textarea {padding: 2px; resize: none;}' +
		'#bbb-menu ul, #bbb-menu ol, #bbb-dialog-window ul, #bbb-dialog-window ol {list-style: outside disc none; margin-top: 0px; margin-bottom: 0px; margin-left: 20px; display: block;}' +
		'#bbb-menu .bbb-scroll-div {border: 1px solid #CCCCCC; margin: -1px 0px 5px 0px; padding: 5px 0px; overflow-y: auto;}' +
		'#bbb-menu .bbb-page {position: relative; display: none;}' +
		'#bbb-menu .bbb-button {border: 1px solid #CCCCCC; border-radius: 5px; display: inline-block; padding: 5px;}' +
		'#bbb-menu .bbb-tab {border-top-left-radius: 5px; border-top-right-radius: 5px; display: inline-block; padding: 5px; border: 1px solid #CCCCCC; margin-right: -1px;}' +
		'#bbb-menu .bbb-active-tab {background-color: #FFFFFF; border-bottom-width: 0px; padding-bottom: 6px;}' +
		'#bbb-menu .bbb-header {border-bottom: 2px solid #CCCCCC; margin-bottom: 5px; width: 700px;}' +
		'#bbb-menu .bbb-toc {list-style-type: upper-roman; margin-left: 30px;}' +
		'#bbb-menu .bbb-section-options, #bbb-menu .bbb-section-text {margin-bottom: 5px; max-width: 902px;}' +
		'#bbb-menu .bbb-section-options-left, #bbb-menu .bbb-section-options-right {display: inline-block; vertical-align: top; width: 435px;}' +
		'#bbb-menu .bbb-section-options-left {border-right: 1px solid #CCCCCC; margin-right: 15px; padding-right: 15px;}' +
		'#bbb-menu .bbb-general-label {display: block; height: 30px; padding: 0px 5px;}' +
		'#bbb-menu .bbb-general-label:hover {background-color: #EEEEEE;}' +
		'#bbb-menu .bbb-general-text {line-height: 30px;}' +
		'#bbb-menu .bbb-general-input {float: right; line-height: 30px;}' +
		'#bbb-menu .bbb-expl-link {font-size: 12px; font-weight: bold; margin-left: 5px; padding: 2px;}' +
		'#bbb-menu .bbb-list-div {background-color: #EEEEEE; padding: 2px; margin: 0px 5px 0px 0px;}' +
		'#bbb-menu .bbb-list-bar, #bbb-menu .bbb-list-settings {height: 30px; padding: 0px 2px; overflow: hidden;}' +
		'#bbb-menu .bbb-list-settings {background-color: #FFFFFF;}' +
		'#bbb-menu .bbb-list-div label, #bbb-menu .bbb-list-div span {display: inline-block; line-height: 30px;}' +
		'#bbb-menu .bbb-list-border-name {text-align: left; width: 540px;}' +
		'#bbb-menu .bbb-list-border-name input {width:460px;}' +
		'#bbb-menu .bbb-list-border-color {text-align: center; width: 210px;}' +
		'#bbb-menu .bbb-list-border-color input {width: 148px;}' +
		'#bbb-menu .bbb-list-border-style {float: right; text-align: right; width: 130px;}' +
		'#bbb-menu .bbb-list-group-name {text-align: left; width: 300px;}' +
		'#bbb-menu .bbb-list-group-name input {width:240px;}' +
		'#bbb-menu .bbb-list-group-tags {float: right; text-align: center; width: 100%;}' +
		'#bbb-menu .bbb-list-group-tags input {width:825px;}' +
		'#bbb-menu .bbb-list-divider {height: 4px;}' +
		'#bbb-menu .bbb-insert-highlight .bbb-list-divider {background-color: blue; cursor: pointer;}' +
		'#bbb-menu .bbb-no-highlight .bbb-list-divider {background-color: transparent; cursor: auto;}' +
		'#bbb-menu .bbb-list-button {border: 1px solid #CCCCCC; border-radius: 5px; display: inline-block; padding: 2px; margin: 0px 2px;}' +
		'#bbb-menu .bbb-list-spacer {display: inline-block; height: 12px; width: 0px; border-right: 1px solid #CCCCCC; margin: 0px 5px;}' +
		'#bbb-menu .bbb-backup-area {height: 300px; width: 896px; margin-top: 2px;}' +
		'#bbb-menu .bbb-blacklist-area {height: 300px; width: 896px; margin-top: 2px;}' +
		'#bbb-menu .bbb-edit-link {background-color: #FFFFFF; border: 1px solid #CCCCCC; display: inline-block; height: 20px; line-height: 20px; margin-left: -1px; padding: 0px 2px; margin-top: 4px; text-align: center; vertical-align: top;}' +
		'#bbb-expl {background-color: #CCCCCC; border: 1px solid #000000; display: none; font-size: 12px; padding: 5px; position: fixed; max-width: 488px; width: 488px; overflow: hidden; z-index: 9002; box-shadow: 0 2px 2px rgba(0, 0, 0, 0.5);}' +
		'#bbb-expl * {font-size: 12px;}' +
		'#bbb-expl tiphead {display: block; font-weight: bold; text-decoration: underline; font-size: 13px; margin-top: 12px;}' +
		'#bbb-expl tipdesc {display: inline; font-weight: bold;}' +
		'#bbb-expl tipdesc:before {content: "\\A0"; display: block; height: 12px; clear: both;}' + // Simulate a double line break.
		'#bbb-status {background-color: rgba(255, 255, 255, 0.75); border: 1px solid rgba(204, 204, 204, 0.75); font-size: 12px; font-weight: bold; text-align: right; display: none; padding: 3px; position: fixed; bottom: 0px; right: 0px; z-index: 9002;}' +
		'#bbb-notice-container {position: fixed; top: 0.5em; left: 25%; width: 50%; z-index: 9002;}' +
		'#bbb-notice {padding: 3px; width: 100%; display: none; position: relative; border-radius: 2px; border: 1px solid #000000; background-color: #CCCCCC;}' +
		'#bbb-notice-msg {margin: 0px 25px 0px 55px; max-height: 200px; overflow: auto;}' +
		'#bbb-notice-msg .bbb-notice-msg-entry {border-bottom: solid 1px #000000; margin-bottom: 5px; padding-bottom: 5px;}' +
		'#bbb-notice-msg .bbb-notice-msg-entry:last-child {border-bottom: none 0px; margin-bottom: 0px; padding-bottom: 0px;}' +
		'#bbb-dialog-blocker {display: block; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.33); z-index: 9003; text-align: center;}' +
		'#bbb-dialog-blocker:before {content: ""; display: inline-block; height: 100%; vertical-align: middle;}' + // Helps vertically center an element with unknown dimensions: https://css-tricks.com/centering-in-the-unknown/
		'#bbb-dialog-window {display: inline-block; display: inline-flex; flex-flow: column; position: relative; background-color: #FFFFFF; border: 10px solid #FFFFFF; outline: 1px solid #CCC; box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.5); color: #000000; max-width: 940px; max-height: 90%; overflow-x: hidden; overflow-y: auto; text-align: left; vertical-align: middle; line-height: initial;}' +
		'#bbb-dialog-window .bbb-header {border-bottom: 2px solid #CCCCCC; margin-bottom: 5px; margin-right: 100px; padding-right: 50px; white-space: nowrap;}' +
		'#bbb-dialog-window .bbb-dialog-button {border: 1px solid #CCCCCC; border-radius: 5px; display: inline-block; padding: 5px; margin: 0px 5px;}' +
		'#bbb-dialog-window .bbb-dialog-content-div {padding: 5px; overflow-x: hidden; overflow-y: auto;}' +
		'#bbb-dialog-window .bbb-dialog-button-div {padding-top: 10px; flex-grow: 0; flex-shrink: 0; overflow: hidden;}' +
		'#bbb-dialog-window .bbb-edit-area {height: 300px; width: 800px;}' +
		'.ui-autocomplete {z-index: 9004 !important;}';

		// Provide a little extra space for listings that allow thumbnail_count.
		if (thumbnail_count && (gLoc === "search" || gLoc === "favorites")) {
			styles += 'div#page {margin: 0px 10px 0px 20px !important;}' +
			'section#content {padding: 0px !important;}';
		}

		// Calculate some dimensions.
		var totalBorderWidth = (custom_tag_borders ? border_width * 2 + (border_spacing * 2 || 1) : border_width + border_spacing);
		var thumbMaxWidth = 150 + totalBorderWidth * 2;
		var thumbMaxHeight = thumbMaxWidth;
		var listingExtraSpace = (14 - totalBorderWidth * 2 > 2 ? 14 - totalBorderWidth * 2 : 2);
		var commentExtraSpace = 34 - totalBorderWidth * 2;
		var customBorderSpacing = (border_spacing || 1);

		if (thumb_info === "below")
			thumbMaxHeight += 18; // Add some extra height for the info.

		// Border setup.
		var sbsl = status_borders.length;
		var statusBorderItem; // Loop variable.

		styles += 'article.post-preview a.bbb-thumb-link, .post-preview div.preview a.bbb-thumb-link {display: inline-block !important;}' +
		'article.post-preview {height: ' + thumbMaxHeight + 'px !important; width: ' + thumbMaxWidth + 'px !important; margin: 0px ' + listingExtraSpace + 'px ' + listingExtraSpace + 'px 0px !important;}' +
		'article.post-preview.captioned {height: auto !important;}' + // Pool gallery view thumb height adjustment.
		'#has-parent-relationship-preview article.post-preview, #has-children-relationship-preview article.post-preview {padding: 5px 5px 10px !important; width: auto !important; max-width: ' + thumbMaxWidth + 'px !important; margin: 0px !important;}' +
		'article.post-preview a.bbb-thumb-link {line-height: 0px !important;}' +
		'.post-preview div.preview {height: ' + thumbMaxHeight + 'px !important; width: ' + thumbMaxWidth + 'px !important; margin-right: ' + commentExtraSpace + 'px !important;}' +
		'.post-preview div.preview a.bbb-thumb-link {line-height: 0px !important;}' +
		'.post-preview a.bbb-thumb-link img {border-width: ' + border_width + 'px !important; padding: ' + border_spacing + 'px !important;}' +
		'a.bbb-thumb-link.bbb-custom-tag {border-width: ' + border_width + 'px !important;}';

		if (custom_status_borders) {
			var activeStatusStyles = "";
			var statusBorderInfo = {};

			for (i = 0; i < sbsl; i++) {
				statusBorderItem = status_borders[i];
				statusBorderInfo[statusBorderItem.tags] = statusBorderItem;
			}

			for (i = 0; i < sbsl; i++) {
				statusBorderItem = status_borders[i];

				if (single_color_borders) {
					if (statusBorderItem.is_enabled)
						activeStatusStyles = '.post-preview.' + statusBorderItem.class_name + ' a.bbb-thumb-link img {border-color: ' + statusBorderItem.border_color + ' !important; border-style: ' + statusBorderItem.border_style + ' !important;}' + activeStatusStyles;
					else
						styles += '.post-preview.' + statusBorderItem.class_name + ' a.bbb-thumb-link img {border-color: transparent !important;}'; // Disable status border by resetting it to transparent.
				}
				else {
					if (statusBorderItem.is_enabled) {
						if (statusBorderItem.tags === "parent") {
							styles += '.post-preview.post-status-has-children a.bbb-thumb-link img {border-color: ' + statusBorderItem.border_color + ' !important; border-style: ' + statusBorderItem.border_style + ' !important;}'; // Parent only status border.

							if (statusBorderInfo.child.is_enabled)
								styles += '.post-preview.post-status-has-children.post-status-has-parent a.bbb-thumb-link img {border-color: ' + statusBorderItem.border_color + ' ' + statusBorderInfo.child.border_color + ' ' + statusBorderInfo.child.border_color + ' ' + statusBorderItem.border_color + ' !important; border-style: ' + statusBorderItem.border_style + ' ' + statusBorderInfo.child.border_style + ' ' + statusBorderInfo.child.border_style + ' ' + statusBorderItem.border_style + ' !important;}'; // Parent and child status border.
						}
						else if (statusBorderItem.tags === "child")
							styles += '.post-preview.post-status-has-parent a.bbb-thumb-link img {border-color: ' + statusBorderItem.border_color + ' !important; border-style: ' + statusBorderItem.border_style + ' !important;}'; // Child only status border.
						else {
							activeStatusStyles = '.post-preview.' + statusBorderItem.class_name + ' a.bbb-thumb-link img {border-color: ' + statusBorderItem.border_color + ' !important; border-style: ' + statusBorderItem.border_style + ' !important;}' + activeStatusStyles; // Deleted/pending/flagged only status border.

							if (statusBorderInfo.parent.is_enabled)
								activeStatusStyles = '.post-preview.post-status-has-children.' + statusBorderItem.class_name + ' a.bbb-thumb-link img {border-color: ' + statusBorderInfo.parent.border_color + ' ' + statusBorderItem.border_color + ' ' + statusBorderItem.border_color + ' ' + statusBorderInfo.parent.border_color + ' !important; border-style: ' + statusBorderInfo.parent.border_style + ' ' + statusBorderItem.border_style + ' ' + statusBorderItem.border_style + ' ' + statusBorderInfo.parent.border_style + ' !important;}' + activeStatusStyles; // Deleted/pending/flagged and parent status border.

							if (statusBorderInfo.child.is_enabled)
								activeStatusStyles = '.post-preview.post-status-has-parent.' + statusBorderItem.class_name + ' a.bbb-thumb-link img {border-color: ' + statusBorderInfo.child.border_color + ' ' + statusBorderItem.border_color + ' ' + statusBorderItem.border_color + ' ' + statusBorderInfo.child.border_color + ' !important; border-style: ' + statusBorderInfo.child.border_style + ' ' + statusBorderItem.border_style + ' ' + statusBorderItem.border_style + ' ' + statusBorderInfo.child.border_style + ' !important;}' + activeStatusStyles; // Deleted/pending/flagged and child status border.

							if (statusBorderInfo.child.is_enabled && statusBorderInfo.parent.is_enabled)
								activeStatusStyles = '.post-preview.post-status-has-children.post-status-has-parent.' + statusBorderItem.class_name + ' a.bbb-thumb-link img {border-color: ' + statusBorderInfo.parent.border_color + ' ' + statusBorderItem.border_color + ' ' + statusBorderItem.border_color + ' ' + statusBorderInfo.child.border_color + ' !important; border-style: ' + statusBorderInfo.parent.border_style + ' ' + statusBorderItem.border_style + ' ' + statusBorderItem.border_style + ' ' + statusBorderInfo.child.border_style + ' !important;}' + activeStatusStyles; // Deleted/pending/flagged, parent, and child status border.
						}
					}
					else
						styles += '.post-preview.' + statusBorderItem.class_name + ' a.bbb-thumb-link img {border-color: transparent !important;}'; // Disable status border by resetting it to transparent.
				}
			}

			styles += activeStatusStyles;
		}
		else if (single_color_borders) { // Allow single color borders when not using custom status borders. Works off of the old border hierarchy: Deleted > Flagged > Pending > Child > Parent
			var defaultStatusBorders = bbb.options.status_borders;

			for (i = defaultStatusBorders.length - 1; i >= 0; i--) {
				statusBorderItem = defaultStatusBorders[i];

				styles += '.post-preview.' + statusBorderItem.class_name + ' a.bbb-thumb-link img {border-color: ' + statusBorderItem.border_color + ' !important; border-style: ' + statusBorderItem.border_style + ' !important;}';
			}
		}

		if (custom_tag_borders) {
			styles += '.post-preview a.bbb-thumb-link.bbb-custom-tag img {border-width: 0px !important;}' + // Remove the transparent border for images that get custom tag borders.
			'article.post-preview a.bbb-thumb-link, .post-preview div.preview a.bbb-thumb-link {margin-top: ' + (border_width + customBorderSpacing) + 'px !important;}'; // Align one border images with two border images.

			for (i = 0; i < sbsl; i++) {
				statusBorderItem = status_borders[i];

				if (statusBorderItem.is_enabled)
					styles += '.post-preview.' + statusBorderItem.class_name + ' a.bbb-thumb-link.bbb-custom-tag {margin: 0px !important; padding: ' + customBorderSpacing + 'px !important;}' + // Remove margin alignment and add border padding for images that have status and custom tag borders.
					'.post-preview.' + statusBorderItem.class_name + ' a.bbb-thumb-link.bbb-custom-tag img {border-width: ' + border_width + 'px !important;}'; // Override the removal of the transparent border for images that have status borders and custom tag borders.
			}
		}

		// Overlay setup.
		styles += 'article.post-preview:before, div.post.post-preview div.preview:before {content: none !important;}' + // Disable original Danbooru animated overlay.
		'article.post-preview[data-tags~="animated"] a.bbb-thumb-link:before, article.post-preview[data-file-ext="swf"] a.bbb-thumb-link:before, article.post-preview[data-file-ext="webm"] a.bbb-thumb-link:before, article.post-preview[data-file-ext="mp4"] a.bbb-thumb-link:before, div.post.post-preview[data-tags~="animated"] div.preview a.bbb-thumb-link:before, div.post.post-preview[data-file-ext="swf"] div.preview a.bbb-thumb-link:before, div.post.post-preview[data-file-ext="webm"] div.preview a.bbb-thumb-link:before, div.post.post-preview[data-file-ext="mp4"] div.preview a.bbb-thumb-link:before {content: "\\25BA"; position: absolute; width: 20px; height: 20px; color: #FFFFFF; background-color: rgba(0, 0, 0, 0.5); line-height: 20px; top: 0px; left: 0px;}' + // Recreate Danbooru animated overlay.
		'article.post-preview[data-has-sound="true"] a.bbb-thumb-link:before, div.post.post-preview[data-has-sound="true"] div.preview a.bbb-thumb-link:before {content: "\\266A"; position: absolute; width: 20px; height: 20px; color: #FFFFFF; background-color: rgba(0, 0, 0, 0.5); line-height: 20px; top: 0px; left: 0px;}' + // Recreate Danbooru audio overlay.
		'article.post-preview.blacklisted a.bbb-thumb-link:after, article.post-preview a.bbb-thumb-link:before, div.post.post-preview.blacklisted div.preview a.bbb-thumb-link:after, div.post.post-preview div.preview a.bbb-thumb-link:before {margin: ' + (border_width + border_spacing) + 'px;}' + // Margin applies to posts with no borders or only a status border.
		'article.post-preview.blacklisted a.bbb-thumb-link.bbb-custom-tag:after, article.post-preview a.bbb-thumb-link.bbb-custom-tag:before, div.post.post-preview.blacklisted div.preview a.bbb-thumb-link.bbb-custom-tag:after, div.post.post-preview div.preview a.bbb-thumb-link.bbb-custom-tag:before {margin: ' + border_spacing + 'px;}' + // Margin applies to posts with only a custom border.
		'article.post-preview.blacklisted.blacklisted-active a.bbb-thumb-link:after, article.post-preview.blacklisted.blacklisted-active a.bbb-thumb-link:before, div.post.post-preview.blacklisted.blacklisted-active div.preview a.bbb-thumb-link:after, div.post.post-preview.blacklisted.blacklisted-active div.preview a.bbb-thumb-link:before {content: none;}' + // Don't display when actively blacklisted.
		'article.post-preview a.bbb-thumb-link, div.post.post-preview div.preview a.bbb-thumb-link {position: relative;}'; // Allow the overlays to position relative to the link.

		for (i = 0; i < sbsl; i++) {
			statusBorderItem = status_borders[i];

			if (statusBorderItem.is_enabled)
				styles += 'article.post-preview.' + statusBorderItem.class_name + ' a.bbb-thumb-link.bbb-custom-tag:after, article.post-preview.' + statusBorderItem.class_name + ' a.bbb-thumb-link.bbb-custom-tag:before, div.post.post-preview.' + statusBorderItem.class_name + ' div.preview a.bbb-thumb-link.bbb-custom-tag:after, div.post.post-preview.' + statusBorderItem.class_name + ' div.preview a.bbb-thumb-link.bbb-custom-tag:before {margin: ' + (border_width + border_spacing + customBorderSpacing) + 'px !important}'; // Margin applies to posts with a status and custom border.
		}

		// Thumbnail info.
		var thumbInfoStyle = "height: 18px; font-size: 14px; line-height: 18px; text-align: center;";

		if (thumb_info !== "disabled")
			styles += '.bbb-thumb-info-parent.blacklisted.blacklisted-active .bbb-thumb-info {display: none;}';

		if (thumb_info === "below")
			styles += '.bbb-thumb-info-parent .bbb-thumb-info {display: block;' + thumbInfoStyle + '}';
		else if (thumb_info === "hover") {
			styles += '.bbb-thumb-info-parent .bbb-thumb-info {display: none; position: relative; bottom: 18px; background-color: rgba(255, 255, 255, 0.9);' + thumbInfoStyle + '}' +
			'.bbb-thumb-info-parent:hover .bbb-thumb-info {display: block;}' +
			'#has-children-relationship-preview article.post-preview.bbb-thumb-info-parent, #has-parent-relationship-preview article.post-preview.bbb-thumb-info-parent {min-width: 130px !important;}' + // Give parent/child notice thumbs a minimum width to prevent element shifting upon hover.
			'.bbb-thumb-info-parent:hover .bbb-thumb-info.bbb-thumb-info-short {bottom: 0px;}'; // Short thumbnails get no overlapping.
		}

		// Endless
		if (endless_default !== "disabled") {
			styles += 'div.paginator {padding: 3em 0px 0px;}' +
			'#bbb-endless-button-div {width: 100%; height: 0px; overflow: visible; clear: both; text-align: center;}' +
			'#bbb-endless-load-div, #bbb-endless-enable-div {display: none; position: absolute;}' +
			'#bbb-endless-load-button, #bbb-endless-enable-button {position: relative; left: -50%; border: 1px solid #EAEAEA; border-radius: 5px; display: inline-block; padding: 5px; margin-top: 3px;}';

			if (endless_separator === "divider") {
				styles += '.bbb-endless-page {display: block; clear: both;}' +
				'.bbb-endless-divider {display: block; border: 1px solid #CCCCCC; height: 0px; margin: 15px 0px; width: 100%; float: left;}' +
				'.bbb-endless-divider-link {position: relative; top: -16px; display: inline-block; height: 32px; margin-left: 5%; padding: 0px 5px; font-size: 14px; font-weight: bold; line-height: 32px; background-color: #FFFFFF; color: #CCCCCC;}';
			}
			else if (endless_separator === "marker") {
				styles += '.bbb-endless-page {display: inline;}' +
				'article.bbb-endless-marker-article {height: ' + thumbMaxHeight + 'px !important; width: ' + thumbMaxWidth + 'px !important; margin: 0px ' + listingExtraSpace + 'px ' + listingExtraSpace + 'px 0px !important; float: left; overflow: hidden; text-align: center; vertical-align: baseline; position: relative;}' +
				'.bbb-endless-marker {display: inline-block; border: 1px solid #CCCCCC; height: 148px; width: 148px; line-height: 148px; text-align: center; margin-top: ' + totalBorderWidth + 'px;}' +
				'.bbb-endless-marker-link {display: inline-block; font-size: 14px; font-weight: bold; line-height: 14px; vertical-align: middle; color: #CCCCCC;}';
			}
			else if (endless_separator === "none")
				styles += '.bbb-endless-page {display: inline;}';
		}

		// Hide sidebar.
		if (autohide_sidebar) {
			styles += 'div#page {margin: 0px 10px 0px 20px !important;}' +
			'aside#sidebar {background-color: transparent !important; border-width: 0px !important; height: 100% !important; width: 250px !important; position: fixed !important; left: -285px !important; opacity: 0 !important; overflow: hidden !important; padding: 0px 25px !important; top: 0px !important; z-index: 2001 !important; word-wrap: break-word !important;}' +
			'aside#sidebar.bbb-sidebar-show, aside#sidebar:hover {background-color: #FFFFFF !important; border-right: 1px solid #CCCCCC !important; left: 0px !important; opacity: 1 !important; overflow-y: auto !important; padding: 0px 15px !important;}' +
			'section#content {margin-left: 0px !important;}';
		}

		// Tweak the "+" buttom and tags input so they work with the autohide and fixed sidebar options.
		if (autohide_sidebar || fixed_sidebar) {
			styles += '#search-dropdown {position: absolute !important; top: auto !important; bottom: auto !important; left: auto !important; right: auto !important;}' +
			'aside#sidebar input#tags {max-width: ' + (autohide_sidebar ? "240" : document.getElementById("search-box").clientWidth - 10) + 'px;}';
		}

		// Collapse sidebar sections.
		if (collapse_sidebar) {
			styles += '#sidebar ul.bbb-collapsed-sidebar, #sidebar form.bbb-collapsed-sidebar {display: block !important; height: 0px !important; margin: 0px !important; padding: 0px !important; overflow: hidden !important;}' + // Hide the element without changing the display to "none" since that interferes with some of Danbooru's JS.
			'#sidebar h1, #sidebar h2 {display: inline-block !important;}'; // Inline-block is possible here due to not using display in the previous rule.
		}

		// Additional blacklist bars.
		if (blacklist_add_bars) {
			styles += '#blacklist-box.bbb-blacklist-box {margin-bottom: 1em;}' +
			'#blacklist-box.bbb-blacklist-box ul {display: inline;}' +
			'#blacklist-box.bbb-blacklist-box li {display: inline; margin-right: 1em;}' +
			'#blacklist-box.bbb-blacklist-box li a, #blacklist-box.bbb-blacklist-box li span.link {color: #0073FF; cursor: pointer;}' +
			'#blacklist-box.bbb-blacklist-box li span {color: #AAAAAA;}';
		}

		// Blacklist thumbnail display.
		if (blacklist_post_display === "removed") {
			styles += 'article.post-preview.blacklisted {display: inline-block !important;}' +
			'article.post-preview.blacklisted.blacklisted-active {display: none !important;}' +
			'div.post.post-preview.blacklisted {display: block !important;}' + // Comment listing override.
			'div.post.post-preview.blacklisted.blacklisted-active {display: none !important;}';
		}
		else if (blacklist_post_display === "hidden") {
			styles += 'article.post-preview.blacklisted.blacklisted-active {display: inline-block !important;}' +
			'div.post.post-preview.blacklisted {display: block !important;}' + // Comments.
			'article.post-preview.blacklisted.blacklisted-active a.bbb-thumb-link, div.post.post-preview.blacklisted.blacklisted-active div.preview a.bbb-thumb-link {visibility: hidden !important;}';
		}
		else if (blacklist_post_display === "replaced") {
			styles += 'article.post-preview.blacklisted.blacklisted-active, div.post.post-preview.blacklisted.blacklisted-active {display: inline-block !important; background-position: ' + totalBorderWidth + 'px ' + totalBorderWidth + 'px !important; background-repeat: no-repeat !important; background-image: url(' + bbbBlacklistImg + ') !important;}' +
			'#has-parent-relationship-preview article.post-preview.blacklisted.blacklisted-active, #has-children-relationship-preview article.post-preview.blacklisted.blacklisted-active {background-position: ' + (totalBorderWidth + 5) + 'px ' + (totalBorderWidth + 5) + 'px !important;}' + // Account for relation notice padding.
			'article.post-preview.blacklisted.blacklisted-active a.bbb-thumb-link img, div.post.post-preview.blacklisted.blacklisted-active div.preview a.bbb-thumb-link img {opacity: 0.0 !important; height: 150px !important; width: 150px !important; border-width: 0px !important; padding: 0px !important;}' + // Remove all status border space.
			'article.post-preview.blacklisted.blacklisted-active a.bbb-thumb-link, div.post.post-preview.blacklisted.blacklisted-active div.preview a.bbb-thumb-link {padding: 0px !important; margin: ' + totalBorderWidth + 'px !important; margin-bottom: 0px !important;}' + // Align no border thumbs with custom/single border thumbs.
			'article.post-preview.blacklisted.blacklisted-active a.bbb-thumb-link.bbb-custom-tag, div.post.post-preview.blacklisted.blacklisted-active div.preview a.bbb-thumb-link.bbb-custom-tag {padding: ' + border_spacing + 'px !important; margin: ' + (border_width + customBorderSpacing) + 'px !important; margin-bottom: 0px !important;}' +
			'div.post.post-preview.blacklisted {display: block !important;}' +
			'div.post.post-preview.blacklisted.blacklisted-active {display: block !important;}';
		}

		// Blacklist marking.
		if (blacklist_thumb_mark === "icon") {
			styles += 'article.post-preview.blacklisted a.bbb-thumb-link:after, div.post.post-preview.blacklisted div.preview a.bbb-thumb-link:after {content: "\\A0"; position: absolute; bottom: 0px; right: 0px; height: 20px; width: 20px; line-height: 20px; font-weight: bold; color: #FFFFFF; background: rgba(0, 0, 0, 0.5) url(\'' + bbbBlacklistIcon + '\');}'; // Create blacklist overlay.
		}
		else if (blacklist_thumb_mark === "highlight") {
			styles += 'article.post-preview.blacklisted, div.post.post-preview.blacklisted div.preview {background-color: ' + blacklist_highlight_color + ' !important;}' +
			'article.post-preview.blacklisted.blacklisted-active, div.post.post-preview.blacklisted.blacklisted-active div.preview {background-color: transparent !important;}' +
			'article.post-preview.blacklisted.blacklisted-active.current-post {background-color: rgba(0, 0, 0, 0.1) !important}';
		}

		// Blacklist post controls.
		if (blacklist_thumb_controls) {
			styles += '#bbb-blacklist-tip {background-color: #FFFFFF; border: 1px solid #000000; box-shadow: 0 2px 2px rgba(0, 0, 0, 0.5); display: none; font-size: 12px; line-height: 14px; padding: 5px; position: absolute; max-width: 420px; width: 420px; overflow: hidden; z-index: 9002;}' +
			'#bbb-blacklist-tip * {font-size: 12px; line-height: 14px;}' +
			'#bbb-blacklist-tip .blacklisted-active {text-decoration: line-through; font-weight: normal;}' +
			'#bbb-blacklist-tip ul {list-style: outside disc none; margin-top: 0px; margin-bottom: 0px; margin-left: 15px;}' +
			'article.post-preview.blacklisted.blacklisted-active, div.post.post-preview.blacklisted.blacklisted-active div.preview, article.post-preview.blacklisted.blacklisted-active a.bbb-thumb-link, div.post.post-preview.blacklisted.blacklisted-active div.preview a.bbb-thumb-link {cursor: help !important;}' +
			'article.post-preview.blacklisted.blacklisted-active a, div.post.post-preview.blacklisted.blacklisted-active div.preview a {cursor: pointer !important;}' +
			'article.post-preview.blacklisted, div.post.post-preview.blacklisted div.preview {position: relative !important;}' +
			'article.post-preview.blacklisted:hover .bbb-close-circle, div.post.post-preview.blacklisted:hover div.preview .bbb-close-circle {display: block; position: absolute; top: 0px; right: 0px; z-index: 9002 ; cursor: pointer; background-image: url(\'/images/ui-icons_222222_256x240.png\'); background-repeat: no-repeat; background-color: #FFFFFF; background-position: -32px -192px; width: 16px; height: 16px; border-radius: 8px; overflow: hidden;}' +
			'article.post-preview.blacklisted.blacklisted-active:hover .bbb-close-circle, div.post.post-preview.blacklisted.blacklisted-active:hover div.preview .bbb-close-circle {display: none;}' +
			'article.post-preview.blacklisted .bbb-close-circle, div.post.post-preview.blacklisted div.preview .bbb-close-circle {display: none;}';
		}

		// Quick search styles.
		if (quick_search !== "disabled") {
			styles += '#bbb-quick-search {position: fixed; top: 0px; right: 0px; z-index: 2001; overflow: auto; padding: 2px; background-color: #FFFFFF; border-bottom: 1px solid #CCCCCC; border-left: 1px solid #CCCCCC; border-bottom-left-radius: 10px;}' +
			'#bbb-quick-search-form {display: none;}' +
			'.bbb-quick-search-show #bbb-quick-search-form {display: inline;}' +
			'#bbb-quick-search-status, #bbb-quick-search-pin, #bbb-quick-search-negate {border: none; width: 17px; height: 17px; background-color: transparent; background-repeat: no-repeat; background-color: transparent; background-image: url(\'/images/ui-icons_222222_256x240.png\');}' +
			'#bbb-quick-search-status {background-position: -160px -112px;}' + // Magnifying glass.
			'.bbb-quick-search-active #bbb-quick-search-status, .bbb-quick-search-show.bbb-quick-search-active.bbb-quick-search-pinned #bbb-quick-search-status {background-position: -128px -112px;}' + // Plus magnifying glass.
			'#bbb-quick-search-pin {background-position: -128px -144px;}' + // Horizontal pin.
			'.bbb-quick-search-pinned #bbb-quick-search-pin, .bbb-quick-search-active.bbb-quick-search-pinned #bbb-quick-search-status {background-position: -144px -144px;}' + // Vertical pin.
			'#bbb-quick-search-negate {background-position: -48px -129px;}' + // Negative sign.
			'.bbb-quick-search-negated #bbb-quick-search-negate {background-position: -15px -192px;}' + // Negative sign in a dark circle.
			'#bbb-quick-search.bbb-quick-search-negated {filter: invert(0.75);}' +
			'#bbb-quick-search.bbb-quick-search-negated.bbb-quick-search-show {filter: invert(0);}' +
			'#bbb-quick-search.bbb-quick-search-active {background-color: #DDDDDD;}' +
			'#bbb-quick-search.bbb-quick-search-active.bbb-quick-search-show {background-color: #FFFFFF;}' +
			'#bbb-quick-search-pin:focus, #bbb-quick-search-pin:hover, #bbb-quick-search-negate:focus, #bbb-quick-search-negate:hover {background-color: #CCCCCC;}' +
			'#news-updates {padding-right: 25px !important;}';

			if (quick_search.indexOf("remove") > -1)
				styles += 'article.post-preview.bbb-quick-search-filtered, article.post.post-preview.blacklisted.bbb-quick-search-filtered, article.post-preview.blacklisted.blacklisted-active.bbb-quick-search-filtered {display: none !important;}';
			else if (quick_search.indexOf("fade") > -1)
				styles += 'article.post-preview.bbb-quick-search-filtered {opacity: 0.1;}';
		}

		if (resize_link_style === "minimal")
			styles += '.bbb-resize-link {display: inline-block; text-align: center; margin-right: 2px; font-size: 87.5%;}';

		if (search_add === "remove")
			styles += '.search-inc-tag, .search-exl-tag {display: none !important;}';

		if (direct_downloads)
			styles += '.bbb-ddl {display: none !important;}';

		if (post_tag_scrollbars)
			styles += '#tag-list ul {max-height: ' + post_tag_scrollbars + 'px !important; overflow-y: auto !important; font-size: 87.5% !important; word-wrap: break-word !important;}';

		if (search_tag_scrollbars)
			styles += '#tag-box ul {max-height: ' + search_tag_scrollbars + 'px !important; overflow-y: auto !important; font-size: 87.5% !important; margin-right: 2px !important; word-wrap: break-word !important;}';

		if (minimize_status_notices)
			styles += '.notice-flagged, .notice-appealed, .notice-deleted, .notice-pending {display: none; position: absolute; z-index: 2003;}';

		if (move_relation_notices === "minimize")
			styles += '.notice-child, .notice-parent {display: none; position: absolute; z-index: 2003;}';

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

		if (hide_comment_notice) {
			var commentGuide, commentGuideParent; // If/else variables.

			if (gLoc === "post") {
				commentGuide = document.querySelector("#comments h2 a[href*='howto']");
				commentGuideParent = (commentGuide ? commentGuide.parentNode : undefined);

				if (commentGuideParent && commentGuideParent.textContent === "Before commenting, read the how to comment guide.")
					commentGuideParent.style.display = "none";
			}
			else if (gLoc === "comments") {
				commentGuide = document.querySelector("#a-index div h2 a[href*='howto']");
				commentGuideParent = (commentGuide ? commentGuide.parentNode : undefined);

				if (commentGuideParent && commentGuideParent.textContent === "Before commenting, read the how to comment guide.")
					commentGuideParent.style.display = "none";
			}
		}

		if (hide_tag_notice && gLoc === "post") {
			var tagGuide = document.querySelector("#edit div p a[href*='howto']");
			var tagGuideParent = (tagGuide ? tagGuide.parentNode : undefined);

				if (tagGuideParent && tagGuideParent.textContent === "Before editing, read the how to tag guide.")
					tagGuideParent.style.display = "none";
		}

		if (hide_upload_notice && gLoc === "upload")
			styles += '#upload-guide-notice {display: none !important;}';

		if (hide_pool_notice && gLoc === "new_pool") {
			var poolGuide = document.querySelector("#c-new p a[href*='howto']");
			var poolGuideParent = (poolGuide ? poolGuide.parentNode : undefined);

				if (poolGuideParent && poolGuideParent.textContent === "Before creating a pool, read the pool guidelines.")
					poolGuideParent.style.display = "none";
		}

		if (hide_hidden_notice)
			styles += '.hidden-posts-notice {display: none !important;}';

		if (hide_fav_button)
			styles += '.fav-buttons {display: none !important;}';

		customStyles.innerHTML = styles;
		document.getElementsByTagName("head")[0].appendChild(customStyles);
	}

	function pageCounter() {
		// Set up the page counter.
		var pageDiv = document.getElementById("page");
		var paginator = getPaginator();

		if (!page_counter || !paginator || !pageDiv)
			return;

		var numString = "";
		var lastNumString; // If/else variable.

		// Provide page number info if available.
		if (/\d/.test(paginator.textContent)) {
			var activePage = paginator.getElementsByClassName("current-page")[0];
			var pageItems = paginator.getElementsByTagName("li");
			var numPageItems = pageItems.length;
			var lastPageItem = pageItems[numPageItems - 1];
			var activeNum = activePage.textContent.bbbSpaceClean();
			var lastNum; // If/else variable.

			if (activePage.parentNode === lastPageItem) // Last/only page case.
				lastNum = activeNum;
			else { // In all other cases, there should always be a next page button and at least two other page items (1-X).
				lastNum = lastPageItem.previousElementSibling.textContent.bbbSpaceClean();

				if (!bbbIsNum(lastNum)) // Too many pages for the current user to view.
					lastNum = "";
			}

			lastNumString = (lastNum ? " of " + lastNum : "");
			numString = 'Page ' + activeNum + '<span id="bbb-page-counter-last">' + lastNumString + '</span> | ';
		}

		var pageNav = bbb.el.pageCounter;
		var pageInput = bbb.el.pageCounterInput;

		if (!pageNav) { // Create the page nav.
			var pageNavString = '<div id="bbb-page-counter" style="float: right; font-size: 87.5%;">' + numString + '<form id="bbb-page-counter-form" style="display: inline;"><input id="bbb-page-counter-input" size="4" placeholder="Page#" type="text"> <input type="submit" value="Go"></form></div>';

			pageNav = bbb.el.pageCounter = document.createElement("div");
			pageNav.innerHTML = pageNavString;

			pageInput = bbb.el.pageCounterInput = getId("bbb-page-counter-input", pageNav);

			getId("bbb-page-counter-form", pageNav).addEventListener("submit", function(event) {
				var value = pageInput.value.bbbSpaceClean();

				if (value !== "")
					location.href = updateURLQuery(location.href, {page:value});

				event.preventDefault();
			}, false);

			if (numString)
				paginator.bbbWatchNodes(pageCounter);

			pageDiv.insertBefore(pageNav, pageDiv.firstElementChild);
		}
		else // Update the last page in the page nav.
			document.getElementById("bbb-page-counter-last").innerHTML = lastNumString;
	}

	function quickSearch() {
		// Set up quick search.
		removeInheritedStorage("bbb_quick_search");

		if (quick_search === "disabled" || (gLoc !== "search" && gLoc !== "favorites" && gLoc !== "pool" && gLoc !== "popular" && gLoc !== "popular_view" && gLoc !== "favorite_group"))
			return;

		var allowAutocomplete = (getMeta("enable-auto-complete") === "true");

		// Create the quick search.
		var searchDiv = bbb.el.quickSearchDiv = document.createElement("div");
		searchDiv.id = "bbb-quick-search";
		searchDiv.innerHTML = '<input id="bbb-quick-search-status" type="button" value=""><form id="bbb-quick-search-form"><input id="bbb-quick-search-input" size="75" placeholder="Tags" autocomplete="' + (allowAutocomplete ? "off" : "on") + '" type="text"> <input id="bbb-quick-search-pin" type="button" value=""> <input id="bbb-quick-search-negate" type="button" value=""> <input id="bbb-quick-search-submit" type="submit" value="Go"></form>';

		var searchForm = bbb.el.quickSearchForm = getId("bbb-quick-search-form", searchDiv);
		var searchInput = bbb.el.quickSearchInput = getId("bbb-quick-search-input", searchDiv);
		var searchPin = bbb.el.quickSearchPin = getId("bbb-quick-search-pin", searchDiv);
		var searchNegate = bbb.el.quickSearchNegate = getId("bbb-quick-search-negate", searchDiv);
		var searchSubmit = bbb.el.quickSearchSubmit = getId("bbb-quick-search-submit", searchDiv);
		var searchStatus = bbb.el.quickSearchStatus = getId("bbb-quick-search-status", searchDiv);

		// Make the submit event search posts or reset the search.
		searchForm.addEventListener("submit", function(event) {
			quickSearchToggle();

			// Make autocomplete close without getting too tricky.
			searchSubmit.focus();
			delayMe(function() { searchInput.focus(); }); // Delay this so the blur event has time to register properly.

			event.preventDefault();
		}, false);

		// Hide the search div if the new focus isn't one of the inputs.
		searchDiv.addEventListener("blur", function(event) {
			var target = event.target;

			delayMe(function() {
				var active = document.activeElement;

				if (active === target || (active !== searchInput && active !== searchSubmit && active !== searchStatus && active !== searchPin && active !== searchNegate))
					searchDiv.bbbRemoveClass("bbb-quick-search-show");
			});
		}, true);

		// If a mouse click misses an input within the quick search div, cancel it so the quick search doesn't minimize.
		searchDiv.addEventListener("mousedown", function(event) {
			var target = event.target;

			if (target === searchDiv || target === searchForm)
				event.preventDefault();
		}, false);

		// Hide the search div if the escape key is pressed while using it and autocomplete isn't open.
		searchDiv.addEventListener("keydown", function(event) {
			if (event.keyCode === 27) {
				var jQueryMenu = (searchInput.bbbHasClass("ui-autocomplete-input") ? $("#bbb-quick-search-input").autocomplete("widget")[0] : undefined);

				if (jQueryMenu && jQueryMenu.style.display !== "none")
					return;

				document.activeElement.blur();
				event.preventDefault();
			}
		}, true);

		// Show/hide the search div via a left click on the main status icon. If the shift key is held down, toggle the pinned status.
		searchStatus.addEventListener("click", function(event) {
			if (event.button === 0) {
				if (event.shiftKey)
					quickSearchPinToggle();
				else if (event.ctrlKey) {
					quickSearchNegateToggle();
					quickSearchToggle();
				}
				else if (!searchDiv.bbbHasClass("bbb-quick-search-show"))
					quickSearchOpen();
				else
					searchDiv.bbbRemoveClass("bbb-quick-search-show");
			}

			event.preventDefault();
		}, false);

		// Reset via a right click on the main status icon.
		searchStatus.addEventListener("mouseup", function(event) {
			if (event.button === 2 && searchDiv.bbbHasClass("bbb-quick-search-active"))
				quickSearchReset();

			event.preventDefault();
		}, false);

		// Stop the context menu on the status icon.
		searchStatus.addEventListener("contextmenu", disableEvent, false);

		// Make the pin input toggle the pinned status.
		searchPin.addEventListener("click", function(event) {
			if (event.button === 0)
				quickSearchPinToggle();
		}, false);

		// Make the negate input toggle the negated status.
		searchNegate.addEventListener("click", function(event) {
			if (event.button === 0)
				quickSearchNegateToggle();
		}, false);

		// Watch the input value and adjust the quick search as needed.
		searchInput.addEventListener("input", quickSearchCheck, false);
		searchInput.addEventListener("keyup", quickSearchCheck, false);
		searchInput.addEventListener("cut", quickSearchCheck, false);
		searchInput.addEventListener("paste", quickSearchCheck, false);
		searchInput.addEventListener("change", quickSearchCheck, false);

		document.body.insertBefore(searchDiv, document.body.firstElementChild);

		// Force the submit button to retain its width.
		searchDiv.bbbAddClass("bbb-quick-search-show");
		searchSubmit.style.width = searchSubmit.offsetWidth + "px";
		searchDiv.bbbRemoveClass("bbb-quick-search-show");

		// Set up autocomplete.
		otherAutocomplete(searchInput);

		// Check if the quick search has been pinned for this session.
		var pinnedSearch = parseJson(sessionStorage.getItem("bbb_quick_search"), undefined);

		if (pinnedSearch) {
			bbb.quick_search = pinnedSearch;
			searchInput.value = pinnedSearch.tags;
			searchDiv.bbbAddClass("bbb-quick-search-pinned" + (pinnedSearch.negated ? " bbb-quick-search-negated" : ""));
			quickSearchTest();
		}

		// Create the hotkeys.
		createHotkey("70", quickSearchOpen); // F
		createHotkey("s70", quickSearchReset); // SHIFT + F
	}

	function quickSearchToggle() {
		// Submit the quick search or reset it if the current search is active.
		var searchInput = bbb.el.quickSearchInput;
		var searchDiv = bbb.el.quickSearchDiv;
		var oldValue = bbb.quick_search.tags.bbbSpaceClean();
		var oldNegate = bbb.quick_search.negated;
		var curValue = searchInput.value.bbbSpaceClean();
		var curNegate = searchDiv.bbbHasClass("bbb-quick-search-negated");

		if (curValue === "" || (curValue === oldValue && curNegate === oldNegate))
			quickSearchReset();
		else {
			bbb.quick_search.tags = searchInput.value;
			bbb.quick_search.negated = searchDiv.bbbHasClass("bbb-quick-search-negated");

			if (searchDiv.bbbHasClass("bbb-quick-search-pinned"))
				sessionStorage.bbbSetItem("bbb_quick_search", JSON.stringify(bbb.quick_search));
			else if (quick_search.indexOf("pinned") > -1)
				quickSearchPinEnable();

			quickSearchTest();
		}
	}

	function quickSearchCheck() {
		// Check the input value and adjust the submit button appearance accordingly.
		var input = bbb.el.quickSearchInput;
		var submit = bbb.el.quickSearchSubmit;
		var oldValue = bbb.quick_search.tags.bbbSpaceClean();
		var oldNegate = bbb.quick_search.negated;
		var curValue = input.value.bbbSpaceClean();
		var curNegate = bbb.el.quickSearchDiv.bbbHasClass("bbb-quick-search-negated");

		if (oldValue === curValue && curValue !== "" && oldNegate === curNegate)
			submit.value = "X";
		else
			submit.value = "Go";
	}

	function quickSearchReset() {
		// Completely reset the quick search.
		var filteredPosts = document.getElementsByClassName("bbb-quick-search-filtered");
		var filteredPost = filteredPosts[0];

		bbb.quick_search = {negated: false, tags: ""};
		bbb.el.quickSearchInput.value = "";
		bbb.el.quickSearchSubmit.value = "Go";
		bbb.el.quickSearchStatus.title = "";
		sessionStorage.removeItem("bbb_quick_search");
		bbb.el.quickSearchDiv.bbbRemoveClass("bbb-quick-search-active bbb-quick-search-pinned bbb-quick-search-negated");

		while (filteredPost) {
			filteredPost.bbbRemoveClass("bbb-quick-search-filtered");
			enablePostDDL(filteredPost);
			filteredPost = filteredPosts[0];
		}
	}

	function quickSearchTest(target) {
		// Test posts to see if they match the search.
		var value = bbb.quick_search.tags.bbbSpaceClean();

		if (value === "")
			return;
		else if (bbb.quick_search.negated)
			value = "-( " + value + " )";

		var posts = getPosts(target);
		var search = createSearch(value);

		bbb.el.quickSearchSubmit.value = "X";
		bbb.el.quickSearchStatus.title = value;
		bbb.el.quickSearchDiv.bbbAddClass("bbb-quick-search-active");

		for (var i = 0, il = posts.length; i < il; i++) {
			var post = posts[i];

			if (!thumbSearchMatch(post, search)) {
				post.bbbAddClass("bbb-quick-search-filtered");
				disablePostDDL(post);
			}
			else {
				post.bbbRemoveClass("bbb-quick-search-filtered");
				enablePostDDL(post);
			}
		}
	}

	function quickSearchOpen() {
		// Open the quick search div and place focus on the input.
		var searchDiv = bbb.el.quickSearchDiv;
		var searchInput = bbb.el.quickSearchInput;

		searchInput.value = bbb.quick_search.tags;

		if (bbb.quick_search.negated === true)
			searchDiv.bbbAddClass("bbb-quick-search-negated");
		else
			searchDiv.bbbRemoveClass("bbb-quick-search-negated");

		quickSearchCheck();
		searchDiv.bbbAddClass("bbb-quick-search-show");
		searchInput.focus();
	}

	function quickSearchPinToggle() {
		// Toggle the quick search between pinned and not pinned for the session.
		var searchDiv = bbb.el.quickSearchDiv;

		if (searchDiv.bbbHasClass("bbb-quick-search-show", "bbb-quick-search-active")) {
			if (!searchDiv.bbbHasClass("bbb-quick-search-pinned"))
				quickSearchPinEnable();
			else
				quickSearchPinDisable();
		}
	}

	function quickSearchPinEnable() {
		// Enable the quick search pin.
		bbb.el.quickSearchDiv.bbbAddClass("bbb-quick-search-pinned");

		if (bbb.quick_search.tags)
			sessionStorage.bbbSetItem("bbb_quick_search", JSON.stringify(bbb.quick_search));
	}

	function quickSearchPinDisable() {
		// Disable the quick search pin.
		bbb.el.quickSearchDiv.bbbRemoveClass("bbb-quick-search-pinned");
		sessionStorage.removeItem("bbb_quick_search");
	}

	function quickSearchNegateToggle() {
		// Toggle the quick search between negated and not negated.
		var searchDiv = bbb.el.quickSearchDiv;

		if (searchDiv.bbbHasClass("bbb-quick-search-show", "bbb-quick-search-active")) {
			if (!searchDiv.bbbHasClass("bbb-quick-search-negated"))
				quickSearchNegateEnable();
			else
				quickSearchNegateDisable();
		}
	}

	function quickSearchNegateEnable() {
		// Enable the quick search negation.
		bbb.el.quickSearchDiv.bbbAddClass("bbb-quick-search-negated");
		quickSearchCheck();
	}

	function quickSearchNegateDisable() {
		// Disable the quick search negation.
		bbb.el.quickSearchDiv.bbbRemoveClass("bbb-quick-search-negated");
		quickSearchCheck();
	}

	function commentScoreInit() {
		// Set up the initial comment scores and get ready to handle new comments.
		if (!comment_score || (gLoc !== "comments" && gLoc !== "comment_search" && gLoc !== "comment" && gLoc !== "post"))
			return;

		var paginator = getPaginator();
		var watchedNode = (paginator ? paginator.parentNode : document.body);

		commentScore();
		watchedNode.bbbWatchNodes(commentScore);
	}

	function commentScore() {
		// Add score links to comments that link directly to that comment.
		var comments = document.getElementsByClassName("comment");
		var scoredComments = document.getElementsByClassName("bbb-comment-score");

		// If all the comments are scored, just stop.
		if (comments.length === scoredComments.length)
			return;

		for (var i = 0, il = comments.length; i < il; i++) {
			var comment = comments[i];

			// Skip if the comment is already scored.
			if (comment.getElementsByClassName("bbb-comment-score")[0])
				continue;

			var score = comment.bbbInfo("score");
			var commentId = comment.bbbInfo("comment-id");
			var content = comment.getElementsByClassName("content")[0];
			var menu = (content ? content.getElementsByTagName("menu")[0] : undefined);

			if (content && !menu) {
				menu = document.createElement("menu");
				content.appendChild(menu);
			}

			var menuItems = menu.getElementsByTagName("li");
			var listingItemSibling = menuItems[1];

			for (var j = 0, jl = menuItems.length; j < jl; j++) {
				var menuItem = menuItems[j];
				var nextItem = menuItems[j + 1];

				if (menuItem.textContent.indexOf("Reply") > -1) {
					if (nextItem)
						listingItemSibling = nextItem;
					else
						listingItemSibling = undefined;
				}
			}

			var scoreItem = document.createElement("li");
			scoreItem.className = "bbb-comment-score";

			var scoreLink = document.createElement("a");
			scoreLink.innerHTML = "Score: " + score;
			scoreLink.href = "/comments/" + commentId;
			scoreItem.appendChild(scoreLink);

			if (listingItemSibling)
				menu.insertBefore(scoreItem, listingItemSibling);
			else
				menu.appendChild(scoreItem);
		}
	}

	function postLinkNewWindow() {
		// Make thumbnail clicks open in a new tab/window.
		if (post_link_new_window === "disabled" || (gLoc !== "search" && gLoc !== "pool" && gLoc !== "favorites" && gLoc !== "popular" && gLoc !== "popular_view" && gLoc !== "favorite_group"))
			return;

		document.addEventListener("click", function(event) {
			var bypass = (event.shiftKey && event.ctrlKey);
			var modeSection = document.getElementById("mode-box");
			var danbMode = getCookie().mode || "view";

			if (event.button !== 0 || event.altKey || !bypass && (event.shiftKey || event.ctrlKey) || (modeSection && danbMode !== "view"))
				return;

			var runEndless = (post_link_new_window.indexOf("endless") > -1);
			var runNormal = (post_link_new_window.indexOf("normal") > -1);

			if ((bbb.endless.enabled && !runEndless) || (!bbb.endless.enabled && !runNormal))
				return;

			var target = event.target;
			var targetTag = target.tagName;
			var url; // If/else variable.

			if (targetTag === "IMG" && target.bbbParent("A", 3))
				url = target.bbbParent("A", 3).href;
			else if (targetTag === "A" && target.bbbHasClass("bbb-post-link", "bbb-thumb-link"))
				url = target.href;

			if (url && /\/posts\/\d+/.test(url)) {
				if (bypass)
					location.href = url;
				else
					window.open(url);

				event.preventDefault();
			}
		}, false);
	}

	function formatTip(event, el, content, x, y) {
		// Position + resize the tip and display it.
		var tip = el;
		var windowX = event.clientX;
		var windowY = event.clientY;
		var topOffset = 0;
		var leftOffset = 0;

		if (typeof(content) === "string")
			tip.innerHTML = content;
		else {
			tip.innerHTML = "";
			tip.appendChild(content);
		}

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
		if (windowY - tip.offsetHeight < 5)
			topOffset = windowY - tip.offsetHeight - 5;

		// Don't allow the tip to go beyond the left edge of the window.
		if (windowX - tip.offsetWidth < 5)
			leftOffset = tip.offsetWidth + 1;

		tip.style.left = x - tip.offsetWidth + leftOffset + "px";
		tip.style.top = y - tip.offsetHeight - topOffset + "px";
		tip.style.visibility = "visible";
	}

	function bbbHotkeys() {
		// Handle keydown events not taking place in text inputs and check if they're a hotkey.
		document.addEventListener("keydown", function(event) {
			var active = document.activeElement;
			var activeTag = active.tagName;
			var activeType = active.type;

			if (activeTag === "SELECT" || activeTag === "TEXTAREA" || (activeTag === "INPUT" && !/^(?:button|checkbox|file|hidden|image|radio|reset|submit)$/.test(activeType))) // Input types: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes
				return;

			var loc = (gLoc === "post" ? "post" : "other");
			var hotkeyCode = createHotkeyCode(event);
			var hotkey = bbb.hotkeys[loc][hotkeyCode];

			if (hotkey) {
				var customHandler = hotkey.custom_handler;
				customHandler = (typeof(customHandler) !== "boolean" || customHandler !== true ? false : true);

				hotkey.func(event); // The event object will always be the first argument passed to the provided function (previously declared or anonymous).

				if (!customHandler) {
					event.preventDefault();
					event.stopPropagation();
				}
			}
		}, true);
	}

	function createHotkeyCode(event) {
		// Take a keyboard event and create a code for its key combination.
		// Examples: s49 = Shift + "1", a50 = Alt + "2", cs51 = Control + Shift + "3"
		// Alt, control, meta, and shift abbreviations should be alphabetical. Keycode numbers: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
		var hotkeycode = "";

		if (event.altKey)
			hotkeycode += "a";

		if (event.ctrlKey)
			hotkeycode += "c";

		if (event.metaKey)
			hotkeycode += "m";

		if (event.shiftKey)
			hotkeycode += "s";

		if (event.keyCode)
			hotkeycode += event.keyCode;

		return (hotkeycode || undefined);
	}

	function createHotkey(hotkeyCode, func, propObject) {
		// Create hotkeys or override Danbooru's existing ones. Creating a hotkey for a hotkey that already exists will replace it.
		var loc = (gLoc === "post" ? "post" : "other");
		var hotkeyObject = {func: func};

		if (propObject) {
			for (var i in propObject) {
				if (propObject.hasOwnProperty(i))
					hotkeyObject[i] = propObject[i];
			}
		}

		bbb.hotkeys[loc][hotkeyCode] = hotkeyObject;
	}

	function removeHotkey(hotkeyCode) {
		// Remove a hotkey.
		var loc = (gLoc === "post" ? "post" : "other");

		delete bbb.hotkeys[loc][hotkeyCode];
	}

	function resizeHotkey(event) {
		// Handle the resize post hotkeys and make sure they don't interfere with the favorite group dialog box hotkeys.
		var favGroup = document.querySelector("div[aria-describedby='add-to-favgroup-dialog']");

		if (favGroup && favGroup.style.display !== "none")
			return;

		var keyCode = event.keyCode;
		var mode; // Switch variable.

		switch (keyCode) {
			case 49:
				mode = "all";
				break;
			case 50:
				mode = "width";
				break;
			case 51:
				mode = "height";
				break;
			case 52:
			default:
				mode = "none";
				break;
		}

		resizePost(mode);
		event.preventDefault();
		event.stopPropagation();
	}

	function fixLimit(limit) {
		// Add the limit variable to link URLs that are not thumbnails.
		if (!thumbnail_count && limit === undefined)
			return;

		var newLimit = (limit === undefined ? thumbnail_count : limit) || undefined;
		var page = document.getElementById("page");
		var header = document.getElementById("top");
		var searchParent = document.getElementById("search-box") || document.getElementById("a-intro");
		var i, il, links, link, linkHref; // Loop variables.

		if (page) {
			var linkRegEx = /^\/(?:posts(?:\/\d+)?|favorites)\?/i;
			links = page.getElementsByTagName("a");

			for (i = 0, il = links.length; i < il; i++) {
				link = links[i];
				linkHref = link.getAttribute("href"); // Use getAttribute so that we get the exact value. "link.href" adds in the domain.

				if (linkHref && linkHref.indexOf("page=") < 0 && linkRegEx.test(linkHref))
					link.href = updateURLQuery(linkHref, {limit: newLimit});
			}
		}

		if (header) {
			links = header.getElementsByTagName("a");

			for (i = 0, il = links.length; i < il; i++) {
				link = links[i];
				linkHref = link.getAttribute("href");

				if (linkHref && (linkHref.indexOf("limit=") > -1 || linkHref.indexOf("/posts") === 0 || linkHref === "/" || linkHref === "/notes?group_by=post" || linkHref === "/favorites"))
					link.href = updateURLQuery(linkHref, {limit: newLimit});
			}
		}

		// Fix the search.
		if (searchParent && (gLoc === "search" || gLoc === "post" || gLoc === "intro" || gLoc === "favorites")) {
			var search = searchParent.getElementsByTagName("form")[0];

			if (search) {
				var limitInput = bbb.el.limitInput;

				if (!limitInput) {
					limitInput = bbb.el.limitInput = document.createElement("input");
					limitInput.name = "limit";
					limitInput.value = newLimit;
					limitInput.type = "hidden";
					search.appendChild(limitInput);

					// Change the form action if on the favorites page. It uses "/favorites", but that just goes to the normal "/posts" search while stripping out the limit.
					search.action = "/posts";

					// Remove the user's default limit if the user tries to specify a limit value in the tags.
					var tagsInput = document.getElementById("tags");

					if (tagsInput) {
						search.addEventListener("submit", function() {
							if (/(?:^|\s)limit:/.test(tagsInput.value))
								search.removeChild(limitInput);
							else if (limitInput.parentNode !== search)
								search.appendChild(limitInput);
						}, false);
					}
				}
				else
					limitInput.value = newLimit || thumbnail_count_default;
			}
		}
	}

	function fixURLLimit() {
		// Update the URL limit value with the user's limit.
		if (allowUserLimit()) {
			var state = history.state;
			var url = updateURLQuery(location.search, {limit: thumbnail_count});

			history.replaceState(state, "", url);
			location.replace(location.href.split("#", 1)[0] + "#"); // Force browser caching to cooperate.
			history.replaceState(state, "", url);
		}
	}

	function saveStateCache() {
		// Cache a search's thumbnails to history state to prevent replaceState/browser caching issues.
		var state = history.state || {};

		if (isRandomSearch()) {
			var posts = getPosts();
			var postsObject = [];

			for (var i = 0, il = posts.length; i < il; i++)
				postsObject.push(unformatInfo(posts[i].bbbInfo()));

			var postsHash = String(JSON.stringify(postsObject).bbbHash());

			state.bbb_posts_cache = {hash: postsHash, posts: postsObject};
			sessionStorage.bbbSetItem("bbb_posts_cache", postsHash); // Key used to detect if the page is reloaded/re-entered.
			history.replaceState(state, "");
		}
	}

	function checkStateCache() {
		// Check for the history state cache and erase it if the page is reloaded or re-entered.
		removeInheritedStorage("bbb_posts_cache");

		var historyHash = sessionStorage.getItem("bbb_posts_cache");
		var state = history.state || {};

		if (state.bbb_posts_cache) {
			var stateHash = state.bbb_posts_cache.hash;

			if (historyHash === stateHash) { // Reloaded. Remove everything since we're on the same page.
				delete state.bbb_posts_cache;
				history.replaceState(state, "");
				sessionStorage.removeItem("bbb_posts_cache");
			}
			else // Returned. Set the hash again since we're back.
				sessionStorage.bbbSetItem("bbb_posts_cache", stateHash);
		}
		else if (historyHash) // Back/forward. Remove the hash since we're on a new page.
			sessionStorage.removeItem("bbb_posts_cache");
	}

	function autohideSidebar() {
		// Show the sidebar when it gets focus, hide it when it loses focus, and only allow select elements to retain focus.
		var sidebar = document.getElementById("sidebar");

		if (!autohide_sidebar || !sidebar)
			return;

		sidebar.addEventListener("click", function(event) {
			var target = event.target;

			if (event.button === 0 && target.id !== "tags")
				target.blur();
		}, false);
		sidebar.addEventListener("mouseup", function(event) {
			var target = event.target;

			if (event.button !== 0 && target.id !== "tags")
				target.blur();
		}, false);
		sidebar.addEventListener("focus", function() {
			sidebar.bbbAddClass("bbb-sidebar-show");
		}, true);
		sidebar.addEventListener("blur", function() {
			sidebar.bbbRemoveClass("bbb-sidebar-show");
		}, true);
	}

	function fixedSidebar() {
		// Fix the scrollbar to the top/bottom of the window when it would normally scroll out of view.
		var sidebar = bbb.fixed_sidebar.sidebar = document.getElementById("sidebar");
		var content = bbb.fixed_sidebar.content = document.getElementById("content");
		var comments = document.getElementById("comments");

		if (!fixed_sidebar || autohide_sidebar || !sidebar || !content || (gLoc === "post" && !comments))
			return;

		var docRect = document.documentElement.getBoundingClientRect();
		var sidebarRect = sidebar.getBoundingClientRect();
		var sidebarTop = bbb.fixed_sidebar.top = sidebarRect.top - docRect.top;
		var sidebarLeft = bbb.fixed_sidebar.left = sidebarRect.left - docRect.left;
		var sidebarHeight = sidebarRect.height;

		content.style.minHeight = sidebarHeight - 1 + "px";

		// There are some cases where text overflows.
		sidebar.style.overflow = "hidden";
		sidebar.style.wordWrap = "break-word";

		if (comments)
			comments.style.overflow = "auto"; // Force the contained float elements to affect the dimensions.

		fixedSidebarCheck();
		document.body.bbbWatchNodes(fixedSidebarCheck);
		document.addEventListener("keyup", fixedSidebarCheck, false);
		document.addEventListener("click", fixedSidebarCheck, false);
		window.addEventListener("scroll", fixedSidebarCheck, false);
		window.addEventListener("resize", fixedSidebarCheck, false);
	}

	function fixedSidebarCheck() {
		// Event handler for adjusting the sidebar position.
		var sidebar = bbb.fixed_sidebar.sidebar;
		var content = bbb.fixed_sidebar.content;
		var sidebarTop = bbb.fixed_sidebar.top;
		var sidebarLeft = bbb.fixed_sidebar.left;
		var verScrolled = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
		var horScrolled = window.payeXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
		var sidebarHeight = sidebar.clientHeight; // Height can potentially change (blacklist update, etc.) so always recalculate it.
		var contentHeight = content.clientHeight;
		var viewHeight = document.documentElement.clientHeight;
		var sidebarBottom = sidebarTop + sidebarHeight;
		var contentBottom = sidebarTop + contentHeight;
		var viewportBottom = verScrolled + viewHeight;

		if (sidebarHeight > contentHeight) // Don't fix to window if there's no space for it to scroll.
			sidebar.style.position = "static";
		else if (sidebarHeight < viewHeight) { // Fix to the top of the window if not too tall and far enough down.
			if (contentBottom < verScrolled + sidebarHeight) {
				sidebar.style.position = "absolute";
				sidebar.style.bottom = viewHeight - contentBottom + "px";
				sidebar.style.top = "auto";
			}
			else if (sidebarTop < verScrolled ) {
				sidebar.style.position = "fixed";
				sidebar.style.bottom = "auto";
				sidebar.style.top = "0px";
			}
			else
				sidebar.style.position = "static";
		}
		else { // If too tall, fix the sidebar bottom to the viewport bottom to avoid putting part of the sidebar permanently beyond reach.
			if (viewportBottom > contentBottom) {
				sidebar.style.position = "absolute";
				sidebar.style.bottom = viewHeight - contentBottom + "px";
				sidebar.style.top = "auto";
			}
			else if (sidebarTop > verScrolled || sidebarTop > viewportBottom - sidebarHeight)
				sidebar.style.position = "static";
			else if (sidebarBottom < viewportBottom) {
				sidebar.style.position = "fixed";
				sidebar.style.bottom = "0px";
				sidebar.style.top = "auto";
			}
		}

		// Maintain horizontal position in the document.
		if (horScrolled && sidebar.style.position !== "absolute")
			sidebar.style.left = (sidebarLeft - horScrolled) + "px";
		else
			sidebar.style.left = sidebarLeft + "px";
	}

	function fixedPaginator() {
		// Set up the fixed paginator.
		if (fixed_paginator === "disabled" || (gLoc !== "search" && gLoc !== "pool" && gLoc !== "favorites" && gLoc !== "favorite_group"))
			return;

		var paginator = getPaginator();
		var paginatorMenu = (paginator ? paginator.getElementsByTagName("menu")[0] : undefined);
		var paginatorLink = (paginatorMenu ? (paginatorMenu.getElementsByTagName("a")[0] || paginatorMenu.getElementsByTagName("span")[0]) : undefined);

		if (!paginatorLink)
			return;

		// Get all our measurements.
		var docRect = document.documentElement.getBoundingClientRect();
		var docWidth = docRect.width;
		var docBottom = docRect.bottom;

		var paginatorRect = paginator.getBoundingClientRect();
		var paginatorBottom = paginatorRect.bottom;
		var paginatorLeft = paginatorRect.left;
		var paginatorRight = docWidth - paginatorRect.right;
		var paginatorHeight = paginatorRect.height;

		var menuRect = paginatorMenu.getBoundingClientRect();
		var menuBottom = menuRect.bottom;

		var linkRect = paginatorLink.getBoundingClientRect();
		var linkBottom = linkRect.bottom;

		var paginatorMargAdjust = (paginatorLeft - paginatorRight) / 2;
		var menuBottomAdjust = linkBottom - menuBottom;

		var paginatorSpacer = document.createElement("div"); // Prevents the document height form changing when the paginator is fixed to the bottom of the window.
		paginatorSpacer.id = "bbb-fixed-paginator-spacer";

		var paginatorSibling = paginator.nextElementSibling;

		if (paginatorSibling)
			paginator.parentNode.insertBefore(paginatorSpacer, paginatorSibling);
		else
			paginator.parentNode.appendChild(paginatorSpacer);

		// Create the CSS for the fixed paginator separately from the main one since it needs to know what the page's final layout will be with the main CSS applied.
		var style = document.createElement("style");
		style.type = "text/css";
		style.innerHTML = '.bbb-fixed-paginator div.paginator {position: fixed; padding: 0px; margin: 0px; bottom: 0px; left: 50%; margin-left: ' + paginatorMargAdjust + 'px;}' +
		'.bbb-fixed-paginator div.paginator menu {position: relative; left: -50%; padding: ' + menuBottomAdjust + 'px 0px; background-color: #FFFFFF;}' +
		'.bbb-fixed-paginator div.paginator menu li:first-child {padding-left: 0px;}' +
		'.bbb-fixed-paginator div.paginator menu li:first-child > * {margin-left: 0px;}' +
		'.bbb-fixed-paginator div.paginator menu li:last-child {padding-right: 0px;}' +
		'.bbb-fixed-paginator div.paginator menu li:last-child > * {margin-right: 0px;}' +
		'#bbb-fixed-paginator-spacer {display: none; height: ' + paginatorHeight + 'px; clear: both; width: 100%;}' +
		'.bbb-fixed-paginator #bbb-fixed-paginator-spacer {display: block;}';

		if (fixed_paginator.indexOf("minimal") > -1) {
			style.innerHTML += '.bbb-fixed-paginator div.paginator menu {padding: 3px 0px;}' +
			'.bbb-fixed-paginator div.paginator menu li a, .bbb-fixed-paginator div.paginator menu li span {padding: 2px; margin: 0px 2px 0px 0px;}' +
			'.bbb-fixed-paginator div.paginator menu li {padding: 0px;}' +
			'.bbb-fixed-paginator div.paginator menu li a {border-color: #CCCCCC;}';
		}

		document.getElementsByTagName("head")[0].appendChild(style);

		bbb.fixed_paginator_space = docBottom - paginatorBottom - menuBottomAdjust; // Store the amount of space between the bottom of the page and the paginator.

		document.body.bbbWatchNodes(fixedPaginatorCheck);
		document.addEventListener("keyup", fixedPaginatorCheck, false);
		document.addEventListener("click", fixedPaginatorCheck, false);
		window.addEventListener("scroll", fixedPaginatorCheck, false);
		window.addEventListener("resize", fixedPaginatorCheck, false);

		fixedPaginatorCheck();
	}

	function fixedPaginatorCheck() {
		// Check if the paginator needs to be in its default position or fixed to the window.
		if (!bbb.fixed_paginator_space)
			return;

		var runEndless = (fixed_paginator.indexOf("endless") > -1);
		var runNormal = (fixed_paginator.indexOf("normal") > -1);
		var docHeight = document.documentElement.scrollHeight;
		var scrolled = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
		var viewHeight = document.documentElement.clientHeight;

		if (viewHeight + scrolled < docHeight - bbb.fixed_paginator_space && ((runEndless && bbb.endless.enabled) || (runNormal && !bbb.endless.enabled)))
			document.body.bbbAddClass("bbb-fixed-paginator");
		else
			document.body.bbbRemoveClass("bbb-fixed-paginator");
	}

	function collapseSidebar() {
		// Allow clicking on headers to collapse and expand their respective sections.
		var sidebar = document.getElementById("sidebar");

		if (!collapse_sidebar || !sidebar)
			return;

		var dataLoc = (gLoc === "post" ? "post" : "thumb");
		var data = collapse_sidebar_data[dataLoc];
		var headers = sidebar.querySelectorAll("h1, h2");
		var nameList = " ";
		var removedOld = false;
		var i, il; // Loop variables.

		// Grab the desired tags and turn them into toggle elements for their section.
		for (i = 0, il = headers.length; i < il; i++) {
			var header = headers[i];
			var name = header.textContent.bbbSpaceClean().replace(" ", "_");
			var collapse = data[name];
			var sibling = header.nextElementSibling;
			nameList += name + " ";

			header.addEventListener("click", collapseSidebarToggle, false);
			header.addEventListener("mouseup", collapseSidebarDefaultToggle.bind(null, name), false);
			header.addEventListener("contextmenu", disableEvent, false);

			if (collapse && sibling)
				sibling.bbbAddClass("bbb-collapsed-sidebar");
		}

		// Clean up potential old section names.
		for (i in data) {
			if (data.hasOwnProperty(i) && nameList.indexOf(i.bbbSpacePad()) < 0) {
				removedOld = true;
				delete data[i];
			}
		}

		if (removedOld) {
			loadSettings();
			bbb.user.collapse_sidebar_data[dataLoc] = data;
			saveSettings();
		}
	}

	function collapseSidebarToggle(event) {
		// Collapse/expand a sidebar section.
		var target = event.target;
		var sibling = target.nextElementSibling;

		if (event.button !== 0 || !sibling)
			return;

		if (sibling.bbbHasClass("bbb-collapsed-sidebar"))
			sibling.bbbRemoveClass("bbb-collapsed-sidebar");
		else
			sibling.bbbAddClass("bbb-collapsed-sidebar");

		event.preventDefault();
	}

	function collapseSidebarDefaultToggle(name, event) {
		// Make a sidebar section expand/collapse by default.
		if (event.button !== 2)
			return;

		var dataLoc = (gLoc === "post" ? "post" : "thumb");
		var data = collapse_sidebar_data[dataLoc];
		var collapse = data[name];

		loadSettings();

		if (collapse) {
			delete bbb.user.collapse_sidebar_data[dataLoc][name];
			delete data[name];
		}
		else
			bbb.user.collapse_sidebar_data[dataLoc][name] = data[name] = true;

		saveSettings();

		bbbNotice("The \"" + name + "\" section will now " + (!collapse ? "collapse" : "expand") + " by default.", 3);

		event.preventDefault();
	}

	function allowUserLimit() {
		// Allow use of the user thumbnail limit on the first page if there isn't a search limit and the current limit doesn't equal the user limit.
		var page = Number(getVar("page")) || 1; // When set to 0 or undefined, the first page is shown.
		var queryLimit = getQueryLimit();
		var searchLimit = getSearchLimit();
		var limit = (queryLimit !== undefined ? queryLimit : searchLimit) || thumbnail_count_default;
		var allowedLoc = (gLoc === "search" || gLoc === "favorites");

		if (allowedLoc && thumbnail_count && thumbnail_count !== limit && page === 1 && (searchLimit === undefined || queryLimit !== undefined))
			return true;
		else
			return false;
	}

	function noResultsPage(docEl) {
		// Check whether a page has zero results on it.
		var target = docEl || document.body;
		var numPosts = getPosts(target).length;
		var thumbContainer = getThumbContainer(gLoc, target) || target;
		var thumbContainerText = (thumbContainer ? thumbContainer.textContent : "");

		if (!numPosts && thumbContainerText.indexOf("Nobody here but us chickens") > -1)
			return true;
		else
			return false;
	}

	function danbLoc(url) {
		// Test a URL to find which section of Danbooru the script is running on.
		var target; // If/else variable.

		if (url)
			target = new URL(url);
		else
			target = location;

		var path = target.pathname;
		var query = target.search;

		if (/\/posts\/\d+/.test(path))
			return "post";
		else if (/^\/(?:posts|$)/.test(path))
			return "search";
		else if (/^\/notes\/?$/.test(path) && query.indexOf("group_by=note") < 0)
			return "notes";
		else if (/\/comments\/\d+/.test(path))
			return "comment";
		else if (/^\/comments\/?$/.test(path)) {
			if (query.indexOf("group_by=comment") < 0)
				return "comments";
			else // This may need to be more specific in the future.
				return "comment_search";
		}
		else if (/\/explore\/posts\/popular(?:\/?$|\?)/.test(path))
			return "popular";
		// else if (/\/explore\/posts\/popular_view(?:\/?$|\?)/.test(path))
			// return "popular_view";
		else if (/\/pools\/\d+(?:\/?$|\?)/.test(path))
			return "pool";
		else if (/\/favorite_groups\/\d+(?:\/?$|\?)/.test(path))
			return "favorite_group";
		else if (/\/pools\/gallery/.test(path))
			return "pool_gallery";
		else if (path.indexOf("/favorites") === 0)
			return "favorites";
		else if (path.indexOf("/uploads/new") === 0)
			return "upload";
		else if (path.indexOf("/pools/new") === 0)
			return "new_pool";
		else if (/\/forum_topics\/\d+/.test(path))
			return "topic";
		else if (path.indexOf("/explore/posts/intro") === 0)
			return "intro";
		else if (path.indexOf("/session/new") === 0)
			return "signin";
		else if (/\/users\/\d+\/edit/.test(path))
			return "settings";
		else
			return undefined;
	}

	function isLoggedIn() {
		// Use Danbooru's meta tags to determine if a use is logged in.
		if (getMeta("current-user-id") !== "")
			return true;
		else
			return false;
	}

	function noXML() {
		// Don't use XML requests on certain pages where it won't do any good.
		var limit = getLimit();
		var pageNum = getVar("page");
		var paginator = getPaginator();
		var thumbContainer = getThumbContainer(gLoc);
		var imgContainer = getPostContent().container;

		if (!paginator && !thumbContainer && !imgContainer)
			return true;
		else if (gLoc === "search" || gLoc === "favorites") {
			if (limit === 0 || pageNum === "b1" || noResultsPage() || safebSearchTest())
				return true;
		}
		else if (gLoc === "comments") {
			if (pageNum === "b1" || noResultsPage())
				return true;
		}
		else if (gLoc === "pool" || gLoc === "favorite_group" || gLoc === "popular" || gLoc === "popular_view") {
			if (noResultsPage())
				return true;
		}

		return false;
	}

	function useAPI() {
		// Determine whether the API will be needed for any options.
		if (((!isGoldLevel() && (show_loli || show_shota || show_toddlercon || show_banned)) || (show_deleted && !deleted_shown)) && (isLoggedIn() || !bypass_api))
			return true;
		else
			return false;
	}

	function isRandomSearch() {
		// Check whether the search uses "order:random" in it.
		return ((getTagVar("order") || "").toLowerCase() === "random");
	}

	function removeInheritedStorage(key) {
		// Remove an inherited sessionStorage key for a new tab/window.
		if (window.opener && history.length === 1) {
			var state = history.state || {};
			var stateProperty = key + "_reset";

			if (!state[stateProperty]) {
				sessionStorage.removeItem(key);
				state[stateProperty] = true;
				history.replaceState(state, "");
			}
		}
	}

	function isGoldLevel() {
		// Determine whether the user is at the gold account level or higher.
		return (getUserData("level") >= 30);
	}

	function isModLevel() {
		// Determine whether the user is at the moderator account level or higher.
		return (getUserData("level") >= 40);
	}

	function accountSettingCheck(scriptSetting) {
		// Determine whether the script setting or account/anonymous setting should be used.
		var loggedIn = isLoggedIn();
		var setting; // If/else variable.

		if (scriptSetting === "script_blacklisted_tags") {
			if ((loggedIn && override_blacklist === "always") || (!loggedIn && override_blacklist !== "disabled"))
				setting = bbb.user.script_blacklisted_tags;
			else
				setting = getMeta("blacklisted-tags") || "";
		}
		else if (scriptSetting === "post_resize") {
			if (loggedIn && !override_resize)
				setting = (getMeta("always-resize-images") === "true");
			else
				setting = bbb.user.post_resize;
		}
		else if (scriptSetting === "load_sample_first") {
			if (loggedIn && !override_sample)
				setting = (getMeta("default-image-size") === "large");
			else
				setting = bbb.user.load_sample_first;
		}

		return setting;
	}

	function accountUpdateWatch() {
		// Signal a Danbooru account setting check upon signing in or submitting settings. Check the settings upon the next page loading.
		if (gLoc === "signin" || gLoc === "settings") {
			var submit = document.querySelector("input[type=submit][name=commit]");

			submit.addEventListener("click", function() {
				createCookie("bbb_acc_check", 1);
			}, false);
		}
		else if (getCookie().bbb_acc_check) {
			var userId = getMeta("current-user-id");

			if (userId !== "")
				searchPages("account_check", userId);
			else
				createCookie("bbb_acc_check", 0, -1);
		}
	}

	function safebPostTest(postObject) {
		// Test Safebooru's posts to see if they're censored or not.
		if (location.host.indexOf("safebooru") < 0)
			return false;

		var postInfo; // If/else variable.

		if (postObject instanceof HTMLElement) {
			// If dealing with an element, turn it into a simple post info object.
			if (postObject.tagName === "ARTICLE" || postObject.id === "image-container")
				postInfo = {rating: postObject.bbbInfo("rating"), tag_string: postObject.bbbInfo("tags")};
		}
		else
			postInfo = postObject;

		// Posts with an explicit/questionable rating or censored tags are bad.
		if (postInfo.rating !== "s" || safebCensorTagTest(postInfo.tag_string))
			return true;
		else
			return false;
	}

	function safebSearchTest() {
		// Test Safebooru's current search tags to see if there will be no results.
		if (location.host.indexOf("safebooru") < 0)
			return false;

		var tags = getVar("tags");
		var i, il, tag; // Loop variables.

		if (!tags)
			return false;

		tags = decodeURIComponent(tags.replace(/(\+|%20)/g, " ")).split(" ");

		// Split up the "any" (~) tags and "all" tags for testing.
		var allTags = "";
		var anyTags = [];

		for (i = 0, il = tags.length; i < il; i++) {
			tag = tags[i];

			if (tag.charAt(0) === "~")
				anyTags.push(tag.slice(1));
			else
				allTags += " " + tag;
		}

		// If any one "all" tag is censored, all posts will be bad.
		if (safebCensorTagTest(allTags))
			return true;

		// If any one "any" tag isn't censored, not all posts will be bad.
		var anyMatch = !!anyTags[0];

		for (i = 0, il = anyTags.length; i < il; i++) {
			tag = anyTags[i];

			if (!safebCensorTagTest(tag)) {
				anyMatch = false;
				break;
			}
		}

		return anyMatch;
	}

	function safebCensorTagTest(string) {
		// Test a tag string or search string on Safebooru to see if it contains any bad tags.
		if (typeof(string) !== "string")
			return false;
		else
			return /(?:^|\s)(?:toddlercon|toddler|diaper|tentacle|rape|bestiality|beastiality|lolita|loli|nude|shota|pussy|penis|-rating:s\S+|rating:(?:e|q)\S+)(?:$|\s)/i.test(string);
	}

	function searchAdd() {
		// Choose the appropriate search link option to run.
		if (search_add === "disabled" || (gLoc !== "search" && gLoc !== "post" && gLoc !== "favorites"))
			return;

		searchAddRemove();

		if (search_add === "link")
			searchAddLink();
		else if (search_add === "toggle")
			searchAddToggleLink();
	}

	function searchAddRemove() {
		// Completely remove existing + and - tag links along with the whitespace after them.
		var tagList = document.getElementById("tag-box") || document.getElementById("tag-list");

		if (!tagList)
			return;

		var addLinks = tagList.getElementsByClassName("search-inc-tag");
		var subLinks = tagList.getElementsByClassName("search-exl-tag");
		var blankRegEx = /^\s*$/;

		while (addLinks[0]) {
			var addLink = addLinks[0];
			var addSibling = addLink.nextSibling;
			var addParent = addSibling.parentNode;

			if (addSibling && addSibling.nodeType === 3 && blankRegEx.test(addSibling.nodeValue))
				addParent.removeChild(addSibling);

			addParent.removeChild(addLink);
		}

		while (subLinks[0]) {
			var subLink = subLinks[0];
			var subSibling = subLink.nextSibling;
			var subParent = subSibling.parentNode;

			if (subSibling && subSibling.nodeType === 3 && blankRegEx.test(subSibling.nodeValue))
				subParent.removeChild(subSibling);

			subParent.removeChild(subLink);
		}
	}

	function searchAddLink() {
		// Add + and - links to the sidebar tag list for modifying searches.
		var tagList = document.getElementById("tag-box") || document.getElementById("tag-list");

		if (!tagList)
			return;

		var tagItems = tagList.getElementsByTagName("li");
		var curTag = getCurTags();
		var curTagString = (curTag ? "+" + curTag : "");

		for (var i = 0, il = tagItems.length; i < il; i++) {
			var tagItem = tagItems[i];
			var tagLink = tagItem.getElementsByClassName("search-tag")[0];
			var tagString = getVar("tags", tagLink.href);
			var tagFrag = document.createDocumentFragment();

			var addTag = document.createElement("a");
			addTag.href = "/posts?tags=" + tagString + curTagString;
			addTag.innerHTML = "+";
			addTag.className = "search-inc-tag";
			tagFrag.appendChild(addTag);

			var addSpace = document.createTextNode(" ");
			tagFrag.appendChild(addSpace);

			var subTag = document.createElement("a");
			subTag.href = "/posts?tags=-" + tagString + curTagString;
			subTag.innerHTML = "&ndash;";
			subTag.className = "search-exl-tag";
			tagFrag.appendChild(subTag);

			var subSpace = document.createTextNode(" ");
			tagFrag.appendChild(subSpace);

			tagItem.insertBefore(tagFrag, tagLink);
		}
	}

	function searchAddToggleLink() {
		// Add toggle links to the sidebar tag list for modifying the search box value.
		var tagList = document.getElementById("tag-box") || document.getElementById("tag-list");

		if (!tagList)
			return;

		var tagItems = tagList.getElementsByTagName("li");
		var firstItem = tagItems[0];
		var toggleWidth; // If/else variable.

		// Find a set width for the toggle link.
		if (firstItem) {
			var testItem = document.createElement("li");
			testItem.className = "category-0";
			testItem.style.height = "0px";
			testItem.style.visibility = "hidden";

			var testLink = document.createElement("a");
			testLink.href = "#";
			testLink.style.display = "inline-block";
			testItem.appendChild(testLink);

			firstItem.parentNode.appendChild(testItem);

			testLink.innerHTML = "-";
			var subWidth = testLink.clientWidth;

			testLink.innerHTML = "+";
			var addWidth = testLink.clientWidth;

			testLink.innerHTML = "~";
			var orWidth = testLink.clientWidth;

			toggleWidth = Math.max(subWidth, addWidth, orWidth);

			firstItem.parentNode.removeChild(testItem);
		}

		// Create and insert the toggle links.
		for (var i = 0, il = tagItems.length; i < il; i++) {
			var tagItem = tagItems[i];
			var tagLink = tagItem.getElementsByClassName("search-tag")[0];
			var tagString = decodeURIComponent(getVar("tags", tagLink.href));
			var tagFrag = document.createDocumentFragment();
			var tagFunc = searchAddToggle.bind(null, tagString);

			var toggleTag = document.createElement("a");
			toggleTag.href = "/posts?tags=" + tagString;
			toggleTag.innerHTML = "&raquo;";
			toggleTag.style.display = "inline-block";
			toggleTag.style.textAlign = "center";
			toggleTag.style.width = toggleWidth + "px";
			toggleTag.addEventListener("click", tagFunc, false);
			toggleTag.addEventListener("mouseup", tagFunc, false);
			toggleTag.addEventListener("contextmenu", disableEvent, false);
			tagFrag.appendChild(toggleTag);

			var toggleSpace = document.createTextNode(" ");
			tagFrag.appendChild(toggleSpace);

			tagItem.insertBefore(tagFrag, tagLink);
			bbb.search_add.links[tagString] = toggleTag;
		}

		// Watch various actions on the search box.
		var tagsInput = document.getElementById("tags");

		if (tagsInput && (gLoc === "search" || gLoc === "post" || gLoc === "intro" || gLoc === "favorites")) {
			searchAddToggleCheck();
			tagsInput.addEventListener("input", searchAddToggleCheck, false);
			tagsInput.addEventListener("keyup", searchAddToggleCheck, false);
			tagsInput.addEventListener("cut", searchAddToggleCheck, false);
			tagsInput.addEventListener("paste", searchAddToggleCheck, false);
			tagsInput.addEventListener("change", searchAddToggleCheck, false);
			$(tagsInput).on("autocompleteselect", function(event) { delayMe(function(event) { searchAddToggleCheck(event); }); }); // Delayed to allow autocomplete to change the input.
		}
	}

	function searchAddToggleCheck(event) {
		// Watch the search box value, test it upon changes, and update the tag links accordingly.
		var input = (event ? event.target : document.getElementById("tags"));
		var value = input.value;
		var oldValue = bbb.search_add.old;
		var i, il; // Loop variables.

		if (oldValue !== value) {
			var tags = value.toLowerCase().bbbSpaceClean().split(/\s+/);
			var activeLinks = bbb.search_add.active_links;

			for (i in activeLinks) {
				if (activeLinks.hasOwnProperty(i)) {
					var activeRegEx = new RegExp("(?:^|\\s)[-~]*" + escapeRegEx(i) + "(?:$|\\s)", "gi");

					if (!activeRegEx.test(value))
						activeLinks[i].innerHTML = "&raquo;";
				}
			}

			for (i = 0, il = tags.length; i < il; i++) {
				var tag = tags[i];
				var tagChar = tag.charAt(0);
				var tagType = "+";

				if (tagChar === "-" || tagChar === "~") {
					tagType = (tagChar === "-" ? "&ndash;" : tagChar);
					tag = tag.slice(1);
				}

				var tagLink = bbb.search_add.links[tag];

				if (tagLink) {
					bbb.search_add.links[tag].innerHTML = tagType;
					bbb.search_add.active_links[tag] = tagLink;
				}
			}

			bbb.search_add.old = value;
		}
	}

	function searchAddToggle(tag, event) {
		// Modify the search box value based upon the tag link clicked and the tag's current state.
		var link = event.target;
		var button = event.button;
		var type = event.type;
		var linkType = link.innerHTML;
		var input = document.getElementById("tags");
		var inputValue = input.value;
		var tagRegEx = new RegExp("(^|\\s)[-~]*" + escapeRegEx(tag) + "(?=$|\\s)", "gi");
		var angleQuotes = String.fromCharCode(187);
		var enDash = String.fromCharCode(8211);

		if ((type === "mouseup" && button !== 2) || (type === "click" && button !== 0)) // Don't respond to middle click and filter out duplicate user actions.
			return;

		if (button === 2) // Immediately remove the tag upon a right click.
			linkType = "~";

		// Each case changes the tag's toggle link display and updates the search box.
		switch (linkType) {
			case angleQuotes: // Tag currently not present.
				link.innerHTML = "+";

				if (tagRegEx.test(inputValue))
					input.value = inputValue.replace(tagRegEx, tag).bbbSpaceClean();
				else
					input.value = (inputValue + " " + tag).bbbSpaceClean();
				break;
			case "+": // Tag currently included.
				link.innerHTML = "&ndash;";

				if (tagRegEx.test(inputValue))
					input.value = inputValue.replace(tagRegEx, "$1-" + tag).bbbSpaceClean();
				else
					input.value = (inputValue + " -" + tag).bbbSpaceClean();
				break;
			case enDash: // Tag currently excluded.
				link.innerHTML = "~";

				if (tagRegEx.test(inputValue))
					input.value = inputValue.replace(tagRegEx, "$1~" + tag).bbbSpaceClean();
				else
					input.value = (inputValue + " ~" + tag).bbbSpaceClean();
				break;
			case "~": // Tag currently included with other tags.
				link.innerHTML = angleQuotes;

				if (tagRegEx.test(inputValue))
					input.value = inputValue.replace(tagRegEx, "$1").bbbSpaceClean();
				break;
		}

		// Trigger the tag input width adjustment.
		try {
			$("#tags").keypress();
		}
		catch (error) {
			// Do nothing.
		}

		event.preventDefault();
	}

	function addPopularLink() {
		// Add the popular link back to the posts submenu.
		var subListItem = document.getElementById("subnav-hot") || document.getElementById("subnav-favorites");

		if (!subListItem || !add_popular_link)
			return;

		var popularListItem = document.createElement("li");
		popularListItem.id = "secondary-links-posts-popular";

		var popularLink = document.createElement("a");
		popularLink.href = "/explore/posts/popular";
		popularLink.innerHTML = "Popular";
		popularListItem.appendChild(popularLink);

		subListItem.parentNode.insertBefore(popularListItem, subListItem);
	}

	function eraseSettingDialog() {
		// Open a dialog box for erasing various BBB information.
		var options = [
			{text: "Settings", func: function() { deleteData("bbb_settings"); removeMenu(); }},
			{text: "All Information", func: function() { eraseSettings(); removeMenu(); location.reload(); }}
		];

		var content = document.createDocumentFragment();

		var header = document.createElement("h2");
		header.innerHTML = "Erase BBB Information";
		header.className = "bbb-header";
		content.appendChild(header);

		var introText = document.createElement("div");
		introText.innerHTML = "Please select which information you would like to erase from below:";
		content.appendChild(introText);

		var optionDiv = document.createElement("div");
		optionDiv.style.lineHeight = "1.5em";
		content.appendChild(optionDiv);

		var cbFunc = function(checkbox, label, event) {
			if (event.button !== 0)
				return;

			label.style.textDecoration = (checkbox.checked ? "none" : "line-through");
		};

		for (var i = 0, il = options.length; i < il; i++) {
			var option = options[i];

			var listLabel = document.createElement("label");
			listLabel.style.textDecoration = "line-through";
			optionDiv.appendChild(listLabel);

			var listCheckbox = document.createElement("input");
			listCheckbox.type = "checkbox";
			listCheckbox.style.marginRight = "5px";
			listLabel.appendChild(listCheckbox);

			var listText = document.createTextNode(option.text);
			listLabel.appendChild(listText);

			var br = document.createElement("br");
			optionDiv.appendChild(br);

			listLabel.addEventListener("click", cbFunc.bind(null, listCheckbox, listLabel), false);
		}

		var okFunc = function() {
			var inputs = optionDiv.getElementsByTagName("input");

			for (var i = 0, il = inputs.length; i < il; i++) {
				if (inputs[i].checked)
					options[i].func();
			}
		};

		bbbDialog(content, {ok: okFunc, cancel: true});
	}

	function localStorageDialog() {
		// Open a dialog box for cleaning out local storage for donmai.us.
		if (getCookie().bbb_ignore_storage)
			return;

		var domains = [
			{url: "http://danbooru.donmai.us/", untrusted: false},
			{url: "https://danbooru.donmai.us/", untrusted: false},
			{url: "http://donmai.us/", untrusted: false},
			{url: "https://donmai.us/", untrusted: true},
			{url: "http://sonohara.donmai.us/", untrusted: false},
			{url: "https://sonohara.donmai.us/", untrusted: true},
			{url: "http://hijiribe.donmai.us/", untrusted: false},
			{url: "https://hijiribe.donmai.us/", untrusted: true},
			{url: "http://safebooru.donmai.us/", untrusted: false},
			{url: "https://safebooru.donmai.us/", untrusted: false},
			{url: "http://testbooru.donmai.us/", untrusted: false}
		];

		var content = document.createDocumentFragment();

		var header = document.createElement("h2");
		header.innerHTML = "Local Storage Error";
		header.className = "bbb-header";
		content.appendChild(header);

		var introText = document.createElement("div");
		introText.innerHTML = "While trying to save some settings, BBB has detected that your browser's local storage is full for the donmai.us domain and was unable to automatically fix the problem. In order for BBB to function properly, the storage needs to be cleaned out.<br><br> BBB can cycle through the various donmai locations and clear out Danbooru's autocomplete cache for each. Please select the domains/subdomains you'd like to clean from below and click OK to continue. If you click cancel, BBB will ignore the storage problems for the rest of this browsing session, but features may not work as expected.<br><br> <b>Notes:</b><ul><li>Three options in the domain list are not selected by default (marked as untrusted) since they require special permission from the user to accept invalid security certificates. However, if BBB detects you're already on one of these untrusted domains, then it will be automatically selected.</li><li>If you encounter this warning again right after storage has been cleaned, you may have to check domains you didn't check before or use the \"delete everything\" option to clear items in local storage besides autocomplete " + (window.bbbGMFunc ? "" : "and thumbnail ") + "info.</li></ul><br> <b>Donmai.us domains/subdomains:</b><br>";
		content.appendChild(introText);

		var domainDiv = document.createElement("div");
		domainDiv.style.lineHeight = "1.5em";
		content.appendChild(domainDiv);

		var cbFunc = function(event) {
			if (event.button !== 0)
				return;

			var target = event.target;

			target.nextSibling.style.textDecoration = (target.checked ? "none" : "line-through");
		};

		for (var i = 0, il = domains.length; i < il; i++) {
			var domain = domains[i];
			var isChecked = (!domain.untrusted || location.href.indexOf(domain.url) > -1);

			var listCheckbox = document.createElement("input");
			listCheckbox.name = domain.url;
			listCheckbox.type = "checkbox";
			listCheckbox.checked = isChecked;
			listCheckbox.style.marginRight = "5px";
			listCheckbox.addEventListener("click", cbFunc, false);
			domainDiv.appendChild(listCheckbox);

			var listLink = document.createElement("a");
			listLink.innerHTML = domain.url + (domain.untrusted ? " (untrusted)" : "");
			listLink.href = domain.url;
			listLink.target = "_blank";
			listLink.style.textDecoration = (isChecked ? "none" : "line-through");
			domainDiv.appendChild(listLink);

			var br = document.createElement("br");
			domainDiv.appendChild(br);
		}

		var optionsText = document.createElement("div");
		optionsText.innerHTML = "<b>Options:</b><br>";
		optionsText.style.marginTop = "1em";
		content.appendChild(optionsText);

		var optionsDiv = document.createElement("div");
		optionsDiv.style.lineHeight = "1.5em";
		content.appendChild(optionsDiv);

		var compCheckbox = document.createElement("input");
		compCheckbox.name = "complete-delete";
		compCheckbox.type = "checkbox";
		compCheckbox.style.marginRight = "5px";
		optionsDiv.appendChild(compCheckbox);

		var compText = document.createTextNode("Delete everything in local storage for each selection except for my BBB settings.");
		optionsDiv.appendChild(compText);

		var okFunc = function() {
			var options = domainDiv.getElementsByTagName("input");
			var mode = (compCheckbox.checked ? "complete" : "normal");
			var selectedURLs = [];
			var origURL = location.href;
			var cleanCur = false;
			var session = new Date().getTime();
			var nextURL; // Loop variable.

			for (var i = 0, il = options.length; i < il; i++) {
				var option = options[i];

				if (option.checked) {
					if (origURL.indexOf(option.name) === 0)
						cleanCur = true;
					else if (!nextURL)
						nextURL = option.name;
					else
						selectedURLs.push(encodeURIComponent(option.name));
				}
			}

			// Clean the current domain if it was selected.
			if (cleanCur)
				cleanLocalStorage(mode);

			if (!nextURL) {
				// Retry saving if only the current domain was selected and do nothing if no domains were selected.
				if (cleanCur)
					retryLocalStorage();
			}
			else {
				// Start cycling through domains.
				bbbDialog("Currently cleaning local storage and loading the next domain. Please wait...", {ok: false, important: true});
				sessionStorage.bbbSetItem("bbb_local_storage_queue", JSON.stringify(bbb.local_storage_queue));
				location.href = updateURLQuery(nextURL + "posts/1/", {clean_storage: mode, clean_urls: selectedURLs.join(","), clean_origurl: encodeURIComponent(origURL), clean_session: session});
			}
		};

		var cancelFunc = function() {
			createCookie("bbb_ignore_storage", 1);
		};

		bbbDialog(content, {ok: okFunc, cancel: cancelFunc});
	}

	function cleanLocalStorage(mode) {
		// Clean out various values in local storage.
		var i, keyName; // Loop variables.

		if (mode === "autocomplete") {
			for (i = localStorage.length - 1; i >= 0; i--) {
				keyName = localStorage.key(i);

				if (keyName.indexOf("ac-") === 0)
					localStorage.removeItem(keyName);
			}
		}
		else if (mode === "normal") {
			for (i = localStorage.length - 1; i >= 0; i--) {
				keyName = localStorage.key(i);

				if (keyName.indexOf("ac-") === 0 || keyName === "bbb_thumb_cache")
					localStorage.removeItem(keyName);
			}
		}
		else if (mode === "complete") {
			for (i = localStorage.length - 1; i >= 0; i--) {
				keyName = localStorage.key(i);

				if (keyName !== "bbb_settings")
					localStorage.removeItem(keyName);
			}
		}
	}

	function retryLocalStorage() {
		// Try to save items to local storage that failed to get saved before.
		var sessLocal; // If/else variable.

		if (sessionStorage.getItem("bbb_local_storage_queue")) {
			// Retrieve the local storage values from session storage after cycling through other domains.
			sessLocal = parseJson(sessionStorage.getItem("bbb_local_storage_queue"), {});
			sessionStorage.removeItem("bbb_local_storage_queue");
		}
		else if (bbb.local_storage_queue) {
			// If only the BBB storage object exists, assume the user selected to only clean the current domain and reset things.
			sessLocal = bbb.local_storage_queue;
			delete bbb.local_storage_queue;
			delete bbb.flags.local_storage_full;
		}
		else
			return;

		for (var i in sessLocal) {
			if (sessLocal.hasOwnProperty(i))
				localStorage.bbbSetItem(i, sessLocal[i]);
		}

		bbbNotice("Local storage cleaning has completed.", 6);
	}

	function localStorageCheck() {
		// Check if the script is currently trying to manage local storage.
		var cleanMode = getVar("clean_storage");
		var cleanSession = Number(getVar("clean_session")) || 0;
		var session = new Date().getTime();

		// Stop if the script is not currently cleaning storage or if an old URL is detected.
		if (!cleanMode || Math.abs(session - cleanSession) > 60000)
			return;

		if (cleanMode !== "save") {
			// Cycle through the domains.
			var urls = getVar("clean_urls").split(",");
			var nextURL = urls.shift();
			var origURL = getVar("clean_origurl");

			bbb.flags.local_storage_full = true; // Keep the cycled domains from triggering storage problems
			bbbDialog("Currently cleaning local storage and loading the next domain. Please wait...", {ok: false, important: true});
			history.replaceState(history.state, "", updateURLQuery(location.href, {clean_storage: undefined, clean_urls: undefined, clean_origurl: undefined, clean_session: undefined}));
			cleanLocalStorage(cleanMode);

			if (nextURL)
				window.setTimeout(function() { location.href = updateURLQuery(decodeURIComponent(nextURL) + "posts/1/", {clean_storage: cleanMode, clean_urls: urls.join(), clean_origurl: origURL, clean_session: session}); }, 2000);
			else
				window.setTimeout(function() { location.href = updateURLQuery(decodeURIComponent(origURL), {clean_storage: "save", clean_session: session}); }, 2000);
		}
		else if (cleanMode === "save") {
			history.replaceState(history.state, "", updateURLQuery(location.href, {clean_storage: undefined, clean_session: undefined}));
			retryLocalStorage();
		}
	}

	function loadData(key) {
		// Request info from GM_getValue and return it.
		var settings;

		try {
			// If GM functions aren't available, throw an error.
			if (window.bbbGMFunc === false)
				throw false;

			sendCustomEvent("bbbRequestLoad", {key: key, bbb: bbb});
			settings = bbb.gm_data;
			bbb.gm_data = undefined;
		}
		catch (error) {
			settings = localStorage.getItem(key);
		}

		return settings || null;
	}

	function saveData(key, value) {
		// Request saving info with GM_setValue.
		try {
			// If GM functions aren't available, throw an error.
			if (window.bbbGMFunc === false)
				throw false;

			sendCustomEvent("bbbRequestSave", {key: key, value: value});
		}
		catch (error) {
			localStorage.bbbSetItem(key, value);
		}
	}

	function deleteData(key) {
		// Request deleting info with GM_deleteValue.
		try {
			// If GM functions aren't available, throw an error.
			if (window.bbbGMFunc === false)
				throw false;

			sendCustomEvent("bbbRequestDelete", {key: key});
		}
		catch (error) {
			localStorage.removeItem(key);
		}
	}

	function listData() {
		// Request an info list array with GM_listValues.
		try {
			// If GM functions aren't available, throw an error.
			if (window.bbbGMFunc === false)
				throw false;

			sendCustomEvent("bbbRequestList", {bbb: bbb});

			var list = bbb.gm_data.split(",");
			bbb.gm_data = undefined;

			return list;
		}
		catch (error) {
			return [];
		}
	}

	function sendCustomEvent(type, detail) {
		// Try to send a custom event with the newest method and then the older method.
		try {
			window.dispatchEvent(new CustomEvent(type, {detail: detail, bubbles: false, cancelable: false}));
		}
		catch (error) {
			var customEvent = document.createEvent("CustomEvent");
			customEvent.initCustomEvent(type, false, false, detail);
			window.dispatchEvent(customEvent);
		}
	}

	function getCookie() {
		// Return an associative array with cookie values.
		var data = document.cookie;

		if(!data)
			return false;

		data = data.split("; ");
		var out = {};

		for (var i = 0, il = data.length; i < il; i++) {
			var temp = data[i].split("=");
			out[temp[0]] = temp[1];
		}

		return out;
	}

	function createCookie(cName, cValue, expDays) {
		// Generate a cookie with a expiration time in days.
		var data = cName + "=" + cValue + "; path=/";

		if (expDays !== undefined) {
			var expDate = new Date();
			expDate.setTime(expDate.getTime() + expDays * 86400000);
			expDate.toUTCString();
			data += "; expires=" + expDate;
		}

		document.cookie = data;
	}

	function scrollbarWidth() {
		// Retrieve the scrollbar width by creating an element with scrollbars and finding the difference.
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

	function bbbIsNum(value) {
		// Strictly test for a specific style of number.
		return /^-?\d+(\.\d+)?$/.test(value);
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

	function isMetatag(tag) {
		// Check if the tag from a search string is a metatag.
		if (tag.indexOf(":") < 0)
			return false;
		else {
			var tagName = tag.split(":", 1)[0].bbbSpaceClean();

			if (tagName === "pool" || tagName === "user" || tagName === "status" || tagName === "rating" || tagName === "parent" || tagName === "child" || tagName === "isfav" || tagName === "userid" || tagName === "taggerid" || tagName === "source" || tagName === "approverid" || tagName === "filetype")
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
		// Replace special characters with escaped versions to make them safe for RegEx.
		return regEx.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}

	function updateURLQuery(url, newQueries) {
		// Update the query portion of a URL. If a param isn't declared, it will be added. If it is, it will be updated.
		// Assigning undefined to a param that exists will remove it. Assigning null to a param that exists will completely remove its value. Assigning null to a new param will leave it with no assigned value.
		var urlParts = url.split("#", 1)[0].split("?", 2);
		var urlQuery = urlParts[1] || "";
		var queries = urlQuery.split("&");
		var queryObj = {};
		var i, il, query, queryName, queryValue; // Loop variables.

		for (i = 0, il = queries.length; i < il; i++) {
			query = queries[i].split("=");
			queryName = query[0];
			queryValue = query[1];

			if (queryName)
				queryObj[queryName] = queryValue;
		}

		for (i in newQueries) {
			if (newQueries.hasOwnProperty(i))
				queryObj[i] = newQueries[i];
		}

		queries.length = 0;

		for (i in queryObj) {
			if (queryObj.hasOwnProperty(i)) {
				queryValue = queryObj[i];

				if (queryValue === null) // Declared param with no assigned value.
					query = i;
				else if (queryValue === undefined) // Undeclared.
					query = undefined;
				else // Declared param with an assigned value (including empty srings).
					query = i + "=" + queryValue;

				if (query !== undefined) // Omit undefined params.
					queries.push(query);
			}
		}

		urlQuery = queries.join("&");

		return (urlParts[0] + (urlQuery ? "?" + urlQuery : ""));
	}

	function timestamp(format) {
		// Returns a simple timestamp based on the format string provided. String placeholders: y = year, m = month, d = day, hh = hours, mm = minutes, ss = seconds, ms = milliseconds
		function padDate(number) {
			// Adds a leading "0" to single digit values.
			var numString = String(number);

			if (numString.length === 1)
				numString = "0" + numString;

			return numString;
		}

		var stamp = format || "y-m-d hh:mm:ss";
		var time = new Date();
		var year = time.getFullYear();
		var month = padDate(time.getMonth() + 1);
		var day = padDate(time.getDate());
		var hours = padDate(time.getHours());
		var minutes = padDate(time.getMinutes());
		var seconds = padDate(time.getSeconds());
		var milliseconds = padDate(time.getMilliseconds());

		stamp = stamp.replace("hh", hours).replace("mm", minutes).replace("ss", seconds).replace("y", year).replace("m", month).replace("d", day).replace("ms", milliseconds);

		return stamp;
	}

	function isOldVersion(ver) {
		// Takes the provided version and compares it to the script version. Returns true if the provided version is older than the script version.
		var userVer = ver || bbb.user.bbb_version;
		var scriptVer = bbb.options.bbb_version;
		var userNums = userVer.split(".");
		var userLength = userNums.length;
		var scriptNums = scriptVer.split(".");
		var scriptLength = scriptNums.length;
		var loopLength = (userLength > scriptLength ? userLength : scriptLength);

		for (var i = 0; i < loopLength; i++) {
			var userNum = (userNums[i] ? Number(userNums[i]) : 0);
			var scriptNum = (scriptNums[i] ? Number(scriptNums[i]) : 0);

			if (userNum < scriptNum)
				return true;
			else if (scriptNum < userNum)
				return false;
		}

		return false;
	}

	function uniqueIdNum() {
		// Return a unique ID number for an element.
		if (!bbb.uId)
			bbb.uId = 1;
		else
			bbb.uId++;

		return "bbbuid" + bbb.uId;
	}

	function loadMetaGroups() {
		// Load a user's group metatags.
		if (bbb.groups === undefined) {
			bbb.groups = {};

			for (var i = 0, il = tag_groups.length; i < il; i++) {
				var userGroup = tag_groups[i];

				bbb.groups[userGroup.name] = userGroup.tags;
			}
		}
	}

	function bbbAutocompleteInit() {
		// Set up a modified version of Danbooru's autocomplete.
		try {
			var Autocomplete = bbb.autocomplete;

			Autocomplete.AUTOCOMPLETE_VERSION = 1;
			Autocomplete.PREFIXES = /^([-~]*)(.*)$/i;
			Autocomplete.METATAGS = /^(status|rating|parent|child|user|pool|group|g|isfav|userid|taggerid|approverid|source|id|score|favcount|height|width|filetype):(.*)$/i;

			Autocomplete.initialize_all = function() {
				if (Danbooru.Utility.meta("enable-auto-complete") === "true") {
					$.widget("ui.autocomplete", $.ui.autocomplete, {
						options: {delay: 0, minLength: 1, autoFocus: false, focus: function() { return false; }},
						_create: function() {
							this.element.on("keydown.Autocomplete.tab", null, "tab", Autocomplete.on_tab);
							this._super();
						},
						_renderItem: Autocomplete.render_item,
					});
				}
			};

			Autocomplete.normal_source = function(term, resp) {
				$.ajax({
					url: "/tags/autocomplete.json",
					data: {"search[name_matches]": term, "expiry": 7},
					method: "get",
					success: function(data) {
						var d = $.map(data, function(tag) {
							return {type: "tag", label: tag.name.replace(/_/g, " "), antecedent: tag.antecedent_name, value: tag.name, category: tag.category, post_count: tag.post_count};
						});

						resp(d);
					}
				});
			};

			Autocomplete.parse_query = function(text, caret) {
				var metatag = "";
				var term = "";
				var before_caret_text = text.substring(0, caret);
				var match = before_caret_text.match(/\S+$/g);

				if (match)
					term = match[0];
				else
					return {};

				if (!!(match = term.match(Autocomplete.PREFIXES))) {
					metatag = match[1].toLowerCase();
					term = match[2];
				}

				if (!!(match = term.match(Autocomplete.METATAGS))) {
					metatag = match[1].toLowerCase();
					term = match[2];
				}

				return {metatag: metatag, term: term};
			};

			Autocomplete.insert_completion = function(input, completion) {
				var before_caret_text = input.value.substring(0, input.selectionStart);
				var after_caret_text = input.value.substring(input.selectionStart);

				var prefixes = "-~";
				var regexp = new RegExp("([" + prefixes + "]*)\\S+$", "g");
				before_caret_text = before_caret_text.replace(regexp, "$1") + completion + " ";

				input.value = before_caret_text + after_caret_text;
				input.selectionStart = input.selectionEnd = before_caret_text.length;
			};

			Autocomplete.on_tab = function(event) {
				var input = this;
				var autocomplete = $(input).autocomplete("instance");
				var $autocomplete_menu = autocomplete.menu.element;

				if (!$autocomplete_menu.is(":visible"))
					return;

				if ($autocomplete_menu.has(".ui-state-active").length === 0) {
					var $first_item = $autocomplete_menu.find(".ui-menu-item").first();
					var completion = $first_item.data().uiAutocompleteItem.value;

					Autocomplete.insert_completion(input, completion);
					autocomplete.close();
				}

				event.preventDefault();
			};

			Autocomplete.render_item = function(list, item) {
				var $link = $("<a/>");
				$link.text(item.label);
				$link.attr("href", "/posts?tags=" + encodeURIComponent(item.value));
				$link.click(function(e) {e.preventDefault();});

				if (item.antecedent) {
					var antecedent = item.antecedent.replace(/_/g, " ");
					var arrow = $("<span/>").html(" &rarr; ").addClass("autocomplete-arrow");
					var antecedent_element = $("<span/>").text(antecedent).addClass("autocomplete-antecedent");

					$link.prepend([antecedent_element, arrow]);
				}

				if (item.post_count !== undefined) {
					var count = item.post_count;

					if (count >= 1000)
						count = Math.floor(count / 1000) + "k";

					var $post_count = $("<span/>").addClass("post-count").css("float", "right").text(count);

					$link.append($post_count);
				}

				if (item.type === "tag" || item.type === "metatag")
					$link.addClass("tag-type-" + item.category);
				else if (item.type === "user") {
					var level_class = "user-" + item.level.toLowerCase();

					$link.addClass(level_class);

					if (Danbooru.Utility.meta("style-usernames") === "true")
						$link.addClass("with-style");
				}

				var $menu_item = $("<div/>").append($link);

				return $("<li/>").data("item.autocomplete", item).append($menu_item).appendTo(list);
			};

			var groups = [];

			for (var i = 0, il = tag_groups.length; i < il; i++)
				groups.push(tag_groups[i].name);

			Autocomplete.static_metatags = {
				status: ["any", "deleted", "active", "pending", "flagged", "banned"],
				rating: ["safe", "questionable", "explicit"],
				child: ["any", "none"],
				parent: ["any", "none"],
				filetype: ["jpg", "png", "gif", "swf", "zip", "webm", "mp4"],
				isfav: ["true", "false"],
				pool: ["series", "collection", "any", "none", "active", "inactive"],
				source: ["any", "none"],
				approverid: ["any", "none"],
				group: groups,
				g: groups
			};

			Autocomplete.static_metatag_source = function(term, resp, metatag) {
				var sub_metatags = this.static_metatags[metatag];

				var regexp = new RegExp("^" + $.ui.autocomplete.escapeRegex(term), "i");
				var matches = $.grep(sub_metatags, function (sub_metatag) {
					return regexp.test(sub_metatag);
				});

				var d = $.map(matches, function(sub_metatag) {
					return {type: "metatag", category: 5, label: sub_metatag, value: metatag + ":" + sub_metatag};
				});

				if (d.length > 10)
					d = d.slice(0, 10);

				resp(d);
			};

			Autocomplete.user_source = function(term, resp, metatag) {
				$.ajax({
					url: "/users.json",
					data: {"search[order]": "post_upload_count", "search[current_user_first]": "true", "search[name_matches]": term + "*", "limit": 10},
					method: "get",
					success: function(data) {
						var display_name = function(name) {return name.replace(/_/g, " ");};

						resp($.map(data, function(user) {
							return {type: "user", label: display_name(user.name), value: metatag + ":" + user.name, level: user.level_string};
						}));
					}
				});
			};

			Autocomplete.initialize_all();
		}
		catch (error) {
			bbbNotice("Unexpected error while trying to initialize autocomplete. (Error: " + error.message + ")", -1);
		}

	}

	function bbbAutocomplete(searchInputs) {
		// Apply a modified copy of Danbooru's autocomplete to inputs after Danbooru has finished.
		delayMe(function() {
			if (!bbb.autocomplete.AUTOCOMPLETE_VERSION)
				bbbAutocompleteInit();

			try {
				var Autocomplete = bbb.autocomplete;
				var $fields_multiple = $(searchInputs);

				$fields_multiple.autocomplete({
					search: function() {
						if ($(this).data("ui-autocomplete"))
							$(this).data("ui-autocomplete").menu.bindings = $();
					},
					select: function(event, ui) {
						if (event.key === "Enter")
							event.stopImmediatePropagation();

						Autocomplete.insert_completion(this, ui.item.value);
						return false;
					},
					source: function(req, resp) {
						var query = Autocomplete.parse_query(req.term, this.element.get(0).selectionStart);
						var metatag = query.metatag;
						var term = query.term;

						if (!metatag && !term) {
							this.close();
							return;
						}

						switch (metatag) {
							case "userid":
							case "taggerid":
							case "id":
							case "score":
							case "favcount":
							case "height":
							case "width":
								resp([]);
								return;
							case "status":
							case "rating":
							case "parent":
							case "child":
							case "group":
							case "g":
							case "isfav":
							case "pool":
							case "source":
							case "filetype":
							case "approverid":
								Autocomplete.static_metatag_source(term, resp, metatag);
								return;
							case "user":
								Autocomplete.user_source(term, resp, metatag);
								break;
							default:
								Autocomplete.normal_source(term, resp);
								break;
						}
					}
				});

				// Make autocomplete fixed like the quick search and menu and allow it to be on top of inputs if there is more space there.
				$(searchInputs).autocomplete("widget").css("position", "fixed");
				$(searchInputs).autocomplete("option", "position", {my: "left top", at: "left bottom", collision: "flip"});
			}
			catch (error) {
				bbbNotice("Unexpected error while trying to initialize autocomplete. (Error: " + error.message + ")", -1);
			}
		});
	}

	function menuAutocomplete(searchInputs) {
		// Use autocomplete on a BBB menu input if allowed by the option.
		if (enable_menu_autocomplete)
			bbbAutocomplete(searchInputs);
	}

	function otherAutocomplete(searchInputs) {
		// Use autocomplete on an input outside of the BBB menu if allowed for Danbooru.
		var allowAutocomplete = (getMeta("enable-auto-complete") === "true");

		if (allowAutocomplete)
			bbbAutocomplete(searchInputs);
	}

} // End of bbbScript.

function runBBBScript() {
	// Run the script or prep it to run when Danbooru's JS is ready.
	if (document.readyState === "interactive" && typeof(Danbooru) === "undefined") {
		var danbScript = document.querySelector("script[src^='/assets/application-']");

		if (danbScript)
			danbScript.addEventListener("load", bbbScript, true);
	}
	else
		bbbScript();
}

function bbbInit() {
	var bbbGMFunc; // If/else variable;

	// Set up the data storage.
	if (typeof(GM_getValue) === "undefined" || typeof(GM_getValue("bbbdoesntexist", "default")) === "undefined")
		bbbGMFunc = false;
	else {
		bbbGMFunc = true;

		if (typeof(GM_deleteValue) === "undefined") {
			GM_deleteValue = function(key) {
				GM_setValue(key, "");
			};
		}

		if (typeof(GM_listValues) === "undefined") {
			GM_listValues = function() {
				return ["bbb_settings"];
			};
		}

		window.addEventListener("bbbRequestLoad", function(event) {
			var key = event.detail.key;
			var bbbObj = event.detail.bbb;

			if (typeof(key) === "string" && key === "bbb_settings" && typeof(bbbObj) === "object") {
				var value = GM_getValue(key);

				if (typeof(value) === "string")
					bbbObj.gm_data = value;
			}
		}, false);

		window.addEventListener("bbbRequestSave", function(event) {
			var key = event.detail.key;
			var value = event.detail.value;

			if (typeof(key) === "string" && key === "bbb_settings" && typeof(value) === "string" && value.length <= 2500000)
				GM_setValue(key, value);
		}, false);

		window.addEventListener("bbbRequestDelete", function(event) {
			var key = event.detail.key;

			if (typeof(key) === "string")
				GM_deleteValue(key);
		}, false);

		window.addEventListener("bbbRequestList", function(event) {
			var bbbObj = event.detail.bbb;

			if (typeof(bbbObj) === "object")
				bbbObj.gm_data = GM_listValues().join(","); // Can't pass an array/object back to the page scope, so change it into a string for now.
		}, false);
	}

	// Inject the script.
	var script = document.createElement('script');
	script.type = "text/javascript";
	script.appendChild(document.createTextNode('window.bbbGMFunc = ' + bbbGMFunc + '; ' + bbbScript + '(' + runBBBScript + ')();'));
	document.body.appendChild(script);
	window.setTimeout(function() { document.body.removeChild(script); }, 0);
}

bbbInit();