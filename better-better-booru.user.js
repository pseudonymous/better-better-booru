// ==UserScript==
// @name           better_better_booru
// @namespace      https://greasyfork.org/scripts/3575-better-better-booru
// @author         otani, modified by Jawertae, A Pseudonymous Coder & Moebius Strip.
// @description    Several changes to make Danbooru much better. Including the viewing of hidden/censored images on non-upgraded accounts and more.
// @version        6.5.4
// @updateURL      https://greasyfork.org/scripts/3575-better-better-booru/code/better_better_booru.meta.js
// @downloadURL    https://greasyfork.org/scripts/3575-better-better-booru/code/better_better_booru.user.js
// @match          http://*.donmai.us/*
// @match          https://*.donmai.us/*
// @match          http://donmai.us/*
// @run-at         document-end
// @grant          none
// @icon           data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAAAAABWESUoAAAA9klEQVQ4y2NgGBgQu/Dau1/Pt/rhVPAfCkpwKXhUZ8Al2vT//yu89vDjV8AkP/P//zY0K//+eHVmoi5YyB7I/VDGiKYADP60wRT8P6aKTcH//0lgQcHS//+PYFdwFu7Ib8gKGBgYOQ22glhfGO7mqbEpzv///xyqAiAQAbGewIz8aoehQArEWsyQsu7O549XJiowoCpg4rM9CGS8V8UZ9GBwy5wBr4K/teL4Ffz//8mHgIL/v82wKgA6kkXE+zKIuRaHAhDQATFf4lHABmL+xKPAFhKUOBQwSyU+AzFXEvDFf3sCCnrxh8O3Ujwh+fXZvjoZ+udTAERqR5IgKEBRAAAAAElFTkSuQmCC
// ==/UserScript==

// Have a nice day. - A Pseudonymous Coder

function bbbScript() { // This is needed to make this script work in Chrome.
	/*
	 * NOTE: You no longer need to edit this script to change settings!
	 * Use the "BBB Settings" button in the menu instead.
	 */

	// If Danbooru's JS isn't available, assume we're somewhere this script isn't needed and stop.
	if (typeof(Danbooru) === "undefined")
		return;

	/* Global Variables */
	var bbb = { // Container for script info.
		blacklist: {
			entries: [],
			match_list: {},
			smart_view: {
				middle_target: undefined,
				override: {}
			}
		},
		cache: { // Thumbnail info cache.
			current: {
				history: [],
				names: {}
			},
			save_enabled: false,
			stored: {}
		},
		custom_tag: {
			searches: [],
			style_list: {}
		},
		drag_scroll: {
			moved: false
		},
		el: { // Script elements.
			menu: {} // Menu elements.
		},
		post: { // Post content info and status.
			info: {}, // Post information object.
			resize: {
				mode: "none",
				ratio: 1
			},
			swapped: false, // Whether the post content has been changed between the original and sample versions.
			translation_mode: false
		},
		options: { // Setting options and data.
			bbb_version: "6.5.4",
			alternate_image_swap: newOption("checkbox", false, "Alternate Image Swap", "Switch between the sample and original image by clicking the image. Notes can be toggled by using the link in the sidebar options section."),
			arrow_nav: newOption("checkbox", false, "Arrow Navigation", "Allow the use of the left and right arrow keys to navigate pages. Has no effect on individual posts."),
			autohide_sidebar: newOption("dropdown", "none", "Auto-hide Sidebar", "Hide the sidebar for posts, favorites listings, and/or searches until the mouse comes close to the left side of the window or the sidebar gains focus.<tiphead>Tips</tiphead>By using Danbooru's keyboard shortcut for the letter \"Q\" to place focus on the search box, you can unhide the sidebar.<br><br>Use the thumbnail count option to get the most out of this feature on search listings.", {txtOptions:["Disabled:none", "Favorites:favorites", "Posts:post", "Searches:search", "Favorites & Posts:favorites post", "Favorites & Searches:favorites search", "Posts & Searches:post search", "All:favorites post search"]}),
			autoscroll_post: newOption("dropdown", "none", "Auto-scroll Post", "Automatically scroll a post to a particular point. <br><br><b>Below Header:</b> Scroll the window down until the header is no longer visible or scrolling is no longer possible. <br><br><b>Post Content:</b> Position the post content as close as possible to the left and top edges of the window viewport when initially loading a post. Using this option will also scroll past any notices above the content.", {txtOptions:["Disabled:none", "Below Header:header", "Post Content:post"]}),
			blacklist_add_bars: newOption("dropdown", "none", "Additional Bars", "Add blacklist bars to the comments, notes, and/or pool listings so that blacklist entries can be toggled as needed.", {txtOptions:["Disabled:none", "Comments:comments", "Notes:notes", "Pools:pool pool_gallery", "Comments & Notes:comments notes", "Comments & Pools:comments pool pool_gallery", "Notes & Pools:notes pool pool_gallery", "All:comments notes pool pool_gallery"]}),
			blacklist_highlight_color: newOption("text", "#CCCCCC", "Highlight Color", "When using highlighting for \"thumbnail marking\", you may set the color here. <tiphead>Notes</tiphead>Leaving this field blank will result in the default color being used. <br><br>For easy color selection, use one of the many free tools on the internet like <a target=\"_blank\" href=\"http://www.quackit.com/css/css_color_codes.cfm\">this one</a>. Hex RGB color codes (#000000, #FFFFFF, etc.) are the recommended values."),
			blacklist_thumb_controls: newOption("checkbox", false, "Thumbnail Controls", "Allow control over individual blacklisted post thumbnails. <tiphead>Directions</tiphead>For blacklisted thumbnails that have been revealed, hovering over them will reveal a clickable \"x\" icon that can hide them again. <br><br>If using the \"hidden\" or \"replaced\" post display options, clicking on the area of a blacklisted thumbnail will display what blacklist entries it matches. Clicking a second time while that display is open will reveal the thumbnail. <tiphead>Note</tiphead>Toggling blacklist entries from the blacklist bar/list will have no effect on posts that have been changed via their individual controls."),
			blacklist_post_display: newOption("dropdown", "removed", "Post Display", "Set how the display of blacklisted posts in thumbnail listings and the comments section is handled. <br><br><b>Removed:</b> The default Danbooru behavior where the posts and the space they take up are completely removed. <br><br><b>Hidden:</b> Post space is preserved, but thumbnails are hidden. <br><br><b>Replaced:</b> Thumbnails are replaced by \"Blacklisted\" thumbnail placeholders.", {txtOptions:["Removed (Default):removed", "Hidden:hidden", "Replaced:replaced"]}),
			blacklist_smart_view: newOption("checkbox", false, "Smart View", "When navigating to a blacklisted post by using its thumbnail, if the thumbnail has already been revealed, the post content will temporarily be exempt from any blacklist checks for 1 minute and be immediately visible. <tiphead>Note</tiphead>Thumbnails in the parent/child notices of posts with exempt content will still be affected by the blacklist."),
			blacklist_thumb_mark: newOption("dropdown", "none", "Thumbnail Marking", "Mark the thumbnails of blacklisted posts that have been revealed to make them easier to distinguish from other thumbnails. <br><br><b>Highlight:</b> Change the background color of blacklisted thumbnails. <br><br><b>Icon Overlay:</b> Add an icon to the lower right corner of blacklisted thumbnails.", {txtOptions:["Disabled:none", "Highlight:highlight", "Icon Overlay:icon"]}),
			border_spacing: newOption("dropdown", 0, "Border Spacing", "Set the amount of blank space between a border and thumbnail and between a custom tag border and status border. <tiphead>Note</tiphead>Even when set to 0, status borders and custom tag borders will always have a minimum value of 1 between them. <tiphead>Tip</tiphead>Use this option if you often have trouble distinguishing a border from the thumbnail image.", {txtOptions:["0 (Default):0", "1:1", "2:2", "3:3"]}),
			border_width: newOption("dropdown", 2, "Border Width", "Set the width of thumbnail borders.", {txtOptions:["1:1", "2 (Default):2", "3:3", "4:4", "5:5"]}),
			bypass_api: newOption("checkbox", false, "Automatic API Bypass", "When logged out and API only features are enabled, do not warn about needing to be logged in. Instead, automatically bypass those features."),
			clean_links: newOption("checkbox", false, "Clean Links", "Remove the extra information after the post ID in thumbnail links.<tiphead>Note</tiphead>Enabling this option will disable Danbooru's search navigation and active pool detection for posts."),
			custom_status_borders: newOption("checkbox", false, "Custom Status Borders", "Override Danbooru's thumbnail borders for deleted, flagged, pending, parent, and child images."),
			custom_tag_borders: newOption("checkbox", true, "Custom Tag Borders", "Add thumbnail borders to posts with specific tags."),
			direct_downloads: newOption("checkbox", false, "Direct Downloads", "Allow download managers to download the posts displayed in the favorites, search, pool, and popular listings."),
			enable_status_message: newOption("checkbox", true, "Enable Status Message", "When requesting information from Danbooru, display the request status in the lower right corner."),
			fixed_sidebar: newOption("dropdown", "none", "Fixed Sidebar", "Make the sidebar always visible for favorites and/or search listings by fixing it to the side of the window when it would normally scroll out of view. <tiphead>Note</tiphead>The \"auto-hide sidebar\" option will override this option if both try to modify the same page. <tiphead>Tip</tiphead>Depending on the available height in the browser window, the \"search tag scrollbars\" option may be needed to make all sidebar content viewable.", {txtOptions:["Disabled:none", "Favorites:favorites", "Searches:search", "Favorites & Searches:favorites search"]}),
			hide_ban_notice: newOption("checkbox", false, "Hide Ban Notice", "Hide the Danbooru ban notice."),
			hide_comment_notice: newOption("checkbox", false, "Hide Comment Guide Notice", "Hide the Danbooru comment guide notice."),
			hide_pool_notice: newOption("checkbox", false, "Hide Pool Guide Notice", "Hide the Danbooru pool guide notice."),
			hide_sign_up_notice: newOption("checkbox", false, "Hide Sign Up Notice", "Hide the Danbooru account sign up notice."),
			hide_tag_notice: newOption("checkbox", false, "Hide Tag Guide Notice", "Hide the Danbooru tag guide notice."),
			hide_tos_notice: newOption("checkbox", false, "Hide TOS Notice", "Hide the Danbooru terms of service agreement notice."),
			hide_upgrade_notice: newOption("checkbox", false, "Hide Upgrade Notice", "Hide the Danbooru upgrade account notice."),
			hide_upload_notice: newOption("checkbox", false, "Hide Upload Guide Notice", "Hide the Danbooru upload guide notice."),
			image_swap_mode: newOption("dropdown", "load", "Image Swap Mode", "Set how swapping between the sample and original image is done.<br><br><b>Load First:</b> Display the image being swapped in after it has finished downloading. <br><br><b>View While Loading:</b> Immediately display the image being swapped in while it is downloading.", {txtOptions:["Load First (Default):load", "View While Loading:view"]}),
			search_tag_scrollbars: newOption("dropdown", 0, "Search Tag Scrollbars", "Limit the length of the sidebar tag list for the search listing by restricting it to a set height in pixels. When the list exceeds the set height, a scrollbar will be added to allow the rest of the list to be viewed.", {txtOptions:["Disabled:0"], numList:[50,100,150,200,250,300,350,400,450,500,550,600,650,700,750,800,850,900,950,1000,1050,1100,1150,1200,1250,1300,1350,1400,1450,1500]}),
			load_sample_first: newOption("checkbox", true, "Load Sample First", "Load sample images first when viewing a post.<tiphead>Note</tiphead>When logged in, the account's \"Default image width\" setting will override this option."),
			manage_cookies: newOption("checkbox", false, "Manage Notice Cookies", "When using the options to hide the upgrade, sign up, and/or TOS notice, also create cookies to disable these notices at the server level.<tiphead>Tip</tiphead>Use this feature if the notices keep flashing on your screen before being removed."),
			minimize_status_notices: newOption("checkbox", false, "Minimize Status Notices", "Hide the Danbooru deleted, banned, flagged, appealed, and pending notices. When you want to see a hidden notice, you can click the appropriate status link in the information section of the sidebar."),
			override_account: newOption("checkbox", false, "Override Account Settings", "Allow the \"resize post\", \"load sample first\", and \"blacklisted tags\" settings to override their corresponding account settings when logged in. <tiphead>Note</tiphead>When using this option, your Danbooru account settings should have \"default image width\" set to the corresponding value of the \"load sample first\" script setting. Not doing so will cause your browser to always download both the sample and original image. If you often change the \"load sample first\" setting, leaving your account to always load the sample/850px image first is your best option."),
			post_drag_scroll: newOption("checkbox", false, "Post Drag Scrolling", "While holding down left click on a post's content, mouse movement can be used to scroll the whole page and reposition the content.<tiphead>Note</tiphead>This option is automatically disabled when translation mode is active."),
			post_resize: newOption("checkbox", true, "Resize Post", "Shrink large post content to fit the browser window when initially loading a post.<tiphead>Note</tiphead>When logged in, the account's \"Fit images to window\" setting will override this option."),
			post_resize_mode: newOption("dropdown", "width", "Resize Mode", "Choose how to shrink large post content to fit the browser window when initially loading a post.", {txtOptions:["Width (Default):width", "Height:height", "Width & Height:all"]}),
			post_tag_scrollbars: newOption("dropdown", 0, "Post Tag Scrollbars", "Limit the length of the sidebar tag lists for posts by restricting them to a set height in pixels. For lists that exceed the set height, a scrollbar will be added to allow the rest of the list to be viewed.<tiphead>Note</tiphead>When using \"Remove Tag Headers\", this option will limit the overall length of the combined list.", {txtOptions:["Disabled:0"], numList:[50,100,150,200,250,300,350,400,450,500,550,600,650,700,750,800,850,900,950,1000,1050,1100,1150,1200,1250,1300,1350,1400,1450,1500]}),
			post_tag_titles: newOption("checkbox", false, "Post Tag Titles", "Change the page titles for posts to a full list of the post tags."),
			remove_tag_headers: newOption("checkbox", false, "Remove Tag Headers", "Remove the \"copyrights\", \"characters\", and \"artist\" headers from the sidebar tag list."),
			script_blacklisted_tags: "",
			search_add: newOption("checkbox", true, "Search Add", "Add + and - links to the sidebar tag list that modify the current search by adding or excluding additional search terms."),
			show_banned: newOption("checkbox", false, "Show Banned", "Display all banned posts in the search, pool, popular, favorites, comments, and notes listings."),
			show_deleted: newOption("checkbox", false, "Show Deleted", "Display all deleted posts in the search, pool, popular, favorites, and notes listings. <tiphead>Note</tiphead>When using this option, your Danbooru account settings should have \"deleted post filter\" set to no and \"show deleted children\" set to yes in order to function properly and minimize connections to Danbooru."),
			show_loli: newOption("checkbox", false, "Show Loli", "Display loli posts in the search, pool, popular, favorites, comments, and notes listings."),
			show_resized_notice: newOption("dropdown", "all", "Show Resized Notice", "Set which image type(s) the purple notice bar about image resizing is allowed to display on. <tiphead>Tip</tiphead>When a sample and original image are available for a post, a new option for swapping between the sample and original image becomes available in the sidebar options menu. Even if you disable the resized notice bar, you will always have access to its main function.", {txtOptions:["None (Disabled):none", "Original:original", "Sample:sample", "Original & Sample:all"]}),
			show_shota: newOption("checkbox", false, "Show Shota", "Display shota posts in the search, pool, popular, favorites, comments, and notes listings."),
			show_toddlercon: newOption("checkbox", false, "Show Toddlercon", "Display toddlercon posts in the search, pool, popular, favorites, comments, and notes listings."),
			single_color_borders: newOption("checkbox", false, "Single Color Borders", "Only use one color for each thumbnail border."),
			thumbnail_count: newOption("dropdown", 0, "Thumbnail Count", "Change the number of thumbnails that display in the search, favorites, and notes listings.", {txtOptions:["Disabled:0"], numRange:[1,200]}),
			track_new: newOption("checkbox", false, "Track New Posts", "Add a menu option titled \"New\" to the posts section submenu (between \"Listing\" and \"Upload\") that links to a customized search focused on keeping track of new posts.<tiphead>Note</tiphead>While browsing the new posts, the current page of posts is also tracked. If the new post listing is left, clicking the \"New\" link later on will attempt to pull up the posts where browsing was left off at.<tiphead>Tip</tiphead>If you would like to bookmark the new post listing, drag and drop the link to your bookmarks or right click it and bookmark/copy the location from the context menu."),
			status_borders: borderSet(["deleted", true, "#000000", "solid", "post-status-deleted"], ["flagged", true, "#FF0000", "solid", "post-status-flagged"], ["pending", true, "#0000FF", "solid", "post-status-pending"], ["child", true, "#CCCC00", "solid", "post-status-has-parent"], ["parent", true, "#00FF00", "solid", "post-status-has-children"]),
			tag_borders: borderSet(["loli", true, "#FFC0CB", "solid"], ["shota", true, "#66CCFF", "solid"], ["toddlercon", true, "#9370DB", "solid"], ["status:banned", true, "#000000", "solid"]),
			thumb_cache_limit: newOption("dropdown", 5000, "Thumbnail Info Cache Limit", "Limit the number of thumbnail information entries cached in the browser.<tiphead>Note</tiphead>No actual thumbnails are cached. Only filename information used to speed up the display of hidden thumbnails is stored. Every 1000 entries is approximately equal to 0.1 megabytes of space.", {txtOptions:["Disabled:0"], numList:[1000,2000,3000,4000,5000,6000,7000,8000,9000,10000,11000,12000,13000,14000,15000,16000,17000,18000,19000,20000,21000,22000,23000,24000,25000,26000,27000,28000,29000,30000]}),
			track_new_data: {viewed:0, viewing:1}
		},
		sections: { // Setting sections and ordering.
			blacklist_options: newSection("general", ["blacklist_post_display", "blacklist_thumb_mark", "blacklist_highlight_color", "blacklist_thumb_controls", "blacklist_smart_view", "blacklist_add_bars"], "Options"),
			browse: newSection("general", ["show_loli", "show_shota", "show_toddlercon", "show_banned", "show_deleted", "thumbnail_count"], "Post Browsing"),
			notices: newSection("general", ["show_resized_notice", "minimize_status_notices", "hide_sign_up_notice", "hide_upgrade_notice", "hide_tos_notice", "hide_comment_notice", "hide_tag_notice", "hide_upload_notice", "hide_pool_notice", "hide_ban_notice"], "Notices"),
			sidebar: newSection("general", ["remove_tag_headers", "post_tag_scrollbars", "search_tag_scrollbars", "autohide_sidebar", "fixed_sidebar"], "Tag Sidebar"),
			control: newSection("general", ["alternate_image_swap", "image_swap_mode", "post_resize_mode", "post_drag_scroll", "autoscroll_post"], "Post Control"),
			logged_out: newSection("general", ["post_resize", "load_sample_first"], "Logged Out Settings"),
			misc: newSection("general", ["direct_downloads", "track_new", "clean_links", "arrow_nav", "post_tag_titles", "search_add"], "Misc."),
			script_settings: newSection("general", ["bypass_api", "manage_cookies", "enable_status_message", "override_account", "thumb_cache_limit"], "Script Settings"),
			border_options: newSection("general", ["custom_tag_borders", "custom_status_borders", "single_color_borders", "border_width", "border_spacing"], "Options"),
			status_borders: newSection("border", "status_borders", "Custom Status Borders", "When using custom status borders, the borders can be edited here. For easy color selection, use one of the many free tools on the internet like <a target=\"_blank\" href=\"http://www.quackit.com/css/css_color_codes.cfm\">this one</a>."),
			tag_borders: newSection("border", "tag_borders", "Custom Tag Borders", "When using custom tag borders, the borders can be edited here. For easy color selection, use one of the many free tools on the internet like <a target=\"_blank\" href=\"http://www.quackit.com/css/css_color_codes.cfm\">this one</a>.")
		},
		timers: {},
		user: {}, // User settings.
		xml: {
			hidden_ready: true,
			paginator_ready: true,
			thumbs_ready: true
		}
	};

	loadSettings(); // Load user settings.

	// Location variables.
	var gUrl = location.href.split("#", 1)[0]; // URL without the anchor
	var gUrlPath = location.pathname; // URL path only
	var gUrlQuery = location.search; // URL query string only
	var gLoc = currentLoc(); // Current location
	var gLocRegex = new RegExp("\\b" + gLoc + "\\b");

	// Script variables.
	// Global
	var show_loli = bbb.user.show_loli;
	var show_shota = bbb.user.show_shota;
	var show_toddlercon = bbb.user.show_toddlercon;
	var show_banned = bbb.user.show_banned;
	var show_deleted = bbb.user.show_deleted;
	var direct_downloads = bbb.user.direct_downloads;

	var blacklist_post_display = bbb.user.blacklist_post_display;
	var blacklist_thumb_mark = bbb.user.blacklist_thumb_mark;
	var blacklist_highlight_color = bbb.user.blacklist_highlight_color || "#CCCCCC";
	var blacklist_add_bars = gLocRegex.test(bbb.user.blacklist_add_bars);
	var blacklist_thumb_controls = bbb.user.blacklist_thumb_controls;
	var blacklist_smart_view = bbb.user.blacklist_smart_view;

	var custom_tag_borders = bbb.user.custom_tag_borders;
	var custom_status_borders = bbb.user.custom_status_borders;
	var single_color_borders = bbb.user.single_color_borders;
	var border_spacing = bbb.user.border_spacing;
	var border_width = bbb.user.border_width;
	var clean_links = bbb.user.clean_links;
	var autohide_sidebar = gLocRegex.test(bbb.user.autohide_sidebar);
	var fixed_sidebar = gLocRegex.test(bbb.user.fixed_sidebar);

	var bypass_api = bbb.user.bypass_api;
	var manage_cookies = bbb.user.manage_cookies;
	var enable_status_message = bbb.user.enable_status_message;
	var override_account = bbb.user.override_account;
	var track_new = bbb.user.track_new;

	var show_resized_notice = bbb.user.show_resized_notice;
	var hide_sign_up_notice = bbb.user.hide_sign_up_notice;
	var hide_upgrade_notice = bbb.user.hide_upgrade_notice;
	var minimize_status_notices = bbb.user.minimize_status_notices;
	var hide_tos_notice = bbb.user.hide_tos_notice;
	var hide_comment_notice = bbb.user.hide_comment_notice;
	var hide_tag_notice = bbb.user.hide_tag_notice;
	var hide_upload_notice = bbb.user.hide_upload_notice;
	var hide_pool_notice = bbb.user.hide_pool_notice;
	var hide_ban_notice = bbb.user.hide_ban_notice;

	// Search
	var arrow_nav = bbb.user.arrow_nav;
	var search_add = bbb.user.search_add;
	var search_tag_scrollbars = bbb.user.search_tag_scrollbars;
	var thumbnail_count = bbb.user.thumbnail_count;
	var thumbnail_count_default = 20; // Number of thumbnails BBB should expect Danbooru to return by default.
	var thumb_cache_limit = bbb.user.thumb_cache_limit;

	// Post
	var alternate_image_swap = bbb.user.alternate_image_swap;
	var post_resize = checkSetting("always-resize-images", "true", bbb.user.post_resize);
	var post_resize_mode = bbb.user.post_resize_mode;
	var post_drag_scroll = bbb.user.post_drag_scroll;
	var load_sample_first = checkSetting("default-image-size", "large", bbb.user.load_sample_first);
	var remove_tag_headers = bbb.user.remove_tag_headers;
	var post_tag_scrollbars = bbb.user.post_tag_scrollbars;
	var post_tag_titles = bbb.user.post_tag_titles;
	var autoscroll_post = bbb.user.autoscroll_post;
	var image_swap_mode = bbb.user.image_swap_mode;

	// Stored data
	var status_borders = bbb.user.status_borders;
	var tag_borders = bbb.user.tag_borders;
	var track_new_data = bbb.user.track_new_data;
	var script_blacklisted_tags = bbb.user.script_blacklisted_tags;

	// Other data
	var bbbHiddenImg = "data:image/png;base64,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";
	var bbbBlacklistImg = "data:image/png;base64,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";
	var bbbBlacklistIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAAkFBMVEUAAAD////////////////////////////////////////////////////////////////p6en////////////////////////////////////////////////////////+/v7///////////////////////////////////////////////////////////97JICZAAAAL3RSTlMACAQBoUSi5QcnMfmnsMW9VQno+vjsxrwstPyzMhOpSxS65vX06czqQf7NvqbzQKZY7GsAAADASURBVHhefZDnDoJAEITn8Kh3FAEFQbH3Mu//doaNLSFxfn7J7hT80cgJlAqc0S8bu55P+p47/rJQ8yUdflhCHq/WpjmZvKjSPPOyBFbZlNRKPFySzTaOANQJ6fZujsf9YUcjNMvpOQACn+kyLmjaObBI6QcAFGkRxYblLAIsqd4Q0ayUDzeBcr4A5q2h6U5Vfy5GeQbIh8l6I0YSKal72k3uhUSS8OQ0WwGPddFQq2/NPLW22rxrDgcZTvd35KGevk8VfmeGhUQAAAAASUVORK5CYII=";

	/* "INIT" */
	customCSS(); // Contains the portions related to notices.

	delayMe(formatThumbnails);

	if (autohide_sidebar)
		autohideSidebar();
	else if (fixed_sidebar)
		fixedSidebar();

	delayMe(blacklistInit);

	searchAdd();

	removeTagHeaders();

	minimizeStatusNotices();

	postTagTitles();

	trackNew();

	injectSettings();

	modifyPage();

	cleanLinks();

	postDDL();

	arrowNav();

	fixLimit();

	bbbHotkeys();

	/* Functions */

	/* Functions for XML API info */
	function searchJSON(mode, optArg) {
		if (mode === "search" || mode === "notes" || mode === "favorites") {
			if (potentialHiddenPosts(mode)) {
				var url = (allowUserLimit() ? updateUrlQuery(gUrl, {limit: thumbnail_count}) : gUrl);

				if (mode === "search")
					fetchJSON(url.replace(/\/?(?:posts)?\/?(?:\?|$)/, "/posts.json?"), "search");
				else if (mode === "notes")
					fetchJSON(url.replace(/\/notes\/?(?:\?|$)/, "/notes.json?"), "notes");
				else if (mode === "favorites")
					fetchJSON(url.replace(/\/favorites\/?(?:\?|$)/, "/favorites.json?"), "favorites");

				bbbStatus("posts", "new");
			}
		}
		else if (mode === "popular") {
			if (potentialHiddenPosts(mode)) {
				fetchJSON(gUrl.replace(/\/popular\/?/, "/popular.json"), "popular");
				bbbStatus("posts", "new");
			}
		}
		else if (mode === "pool") {
			if (potentialHiddenPosts(mode)) {
				var poolId = /\/pools\/(\d+)/.exec(gUrl)[1];
				var poolCache = sessionStorage["pool" + poolId];
				var curTime = new Date().getTime();
				var cacheTime;
				var timeDiff;

				if (poolCache) {
					poolCache = poolCache.split(" ");
					cacheTime = poolCache.shift();
					timeDiff = (curTime - cacheTime) / 1000; // Cache age in seconds.
				}

				if (timeDiff && timeDiff < 900) // If the cache is less than 15 minutes old, use it.
					searchJSON("pool_search", {post_ids: poolCache.join(" ")});
				else // Get a new cache.
					fetchJSON(gUrl.replace(/\/pools\/(\d+)/, "/pools/$1.json"), "pool");

				bbbStatus("posts", "new");
			}
		}
		else if (mode === "pool_search") {
			var poolIds = optArg.post_ids.split(" ");
			var page = Number(getVar("page")) || 1;
			var postIds = poolIds.slice((page - 1) * thumbnail_count_default, page * thumbnail_count_default);

			fetchJSON("/posts.json?tags=status:any+id:" + postIds.join(","), "pool_search", postIds);
		}
		else if (mode === "comments") {
			if (potentialHiddenPosts(mode)) {
				fetchJSON(gUrl.replace(/\/comments\/?/, "/comments.json"), "comments");
				bbbStatus("posts", "new");
			}
		}
		else if (mode === "parent" || mode === "child") {
			var parentUrl = "/posts.json?limit=200&tags=status:any+parent:" + optArg;

			fetchJSON(parentUrl, mode, optArg);
			bbbStatus("posts", "new");
		}
		else if (mode === "ugoira") {
			fetchJSON(gUrl.replace(/\/posts\/(\d+)/, "/posts/$1.json"), "ugoira");
			bbbStatus("posts", "new");
		}
	}

	function fetchJSON(url, mode, optArg, retries) {
		// Retrieve JSON.
		var xmlhttp = new XMLHttpRequest();
		var xmlRetries = retries || 0;

		if (xmlhttp !== null) {
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState === 4) { // 4 = "loaded"
					if (xmlhttp.status === 200) { // 200 = "OK"
						var xml = JSON.parse(xmlhttp.responseText);

						if (mode === "search" || mode === "popular" || mode === "notes" || mode === "favorites") {
							if (allowUserLimit())
								history.replaceState({}, "", updateUrlQuery(gUrlQuery, {limit: thumbnail_count})); // Update the URL with the limit value.

							parseListing(xml);
						}
						else if (mode === "post")
							parsePost(xml);
						else if (mode === "pool") {
							var poolId = /\/pools\/(\d+)/.exec(gUrl)[1];

							sessionStorage["pool" + poolId] = new Date().getTime() + " " + xml.post_ids;
							searchJSON("pool_search", xml);
						}
						else if (mode === "pool_search")
							parseListing(xml, optArg);
						else if (mode === "comments")
							parseComments(xml);
						else if (mode === "parent" || mode === "child")
							parseRelations(xml, mode, optArg);
						else if (mode === "ugoira")
							fixHiddenUgoira(xml);

						// Update status message.
						if (mode !== "pool")
							bbbStatus("posts", "done");
					}
					else {
						if (xmlhttp.status === 403 || xmlhttp.status === 401) {
							bbbNotice('Error retrieving post information. Access denied. You must be logged in to a Danbooru account to access the API for hidden image information and direct downloads. <br><span style="font-size: smaller;">(<span><a href="#" id="bbb-bypass-api-link">Do not warn me again and automatically bypass API features in the future.</a></span>)</span>', -1);
							document.getElementById("bbb-bypass-api-link").addEventListener("click", function(event) {
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
						else if (xmlhttp.status !== 0) {
							if (xmlRetries < 2) {
								xmlRetries++;
								fetchJSON(url, mode, optArg, xmlRetries);
							}
							else {
								var linkId = uniqueIdNum(); // Create a unique ID.

								bbbNotice('Error retrieving post information (Code: ' + xmlhttp.status + ' ' + xmlhttp.statusText + '). <a id="' + linkId + '" href="#">Retry</a>', -1);
								bbbStatus("posts", "error");

								document.getElementById(linkId).addEventListener("click", function(event) {
									this.style.display = "none";
									fetchJSON(url, mode, optArg);
									event.preventDefault();
								}, false);
							}
						}
					}
				}
			};
			xmlhttp.open("GET", url, true);
			xmlhttp.send(null);
		}
	}

	function parseListing(xml, optArg) {
		// Use JSON results for thumbnail listings.
		var posts = xml;
		var query = "";
		var target;
		var before;
		var orderedIds;
		var paginator = document.getElementsByClassName("paginator")[0];

		// If no posts, do nothing.
		if (!posts.length)
			return;

		// Determine where the thumbnails are.
		if (gLoc === "search") {
			target = document.getElementById("posts");
			target = (target ? target.getElementsByTagName("div")[0] : undefined);
			query = getVar("tags");
			query = (query !== null && query !== undefined && !clean_links ? "?tags=" + query : "");
		}
		else if (gLoc === "popular")
			target = document.getElementById("a-index");
		else if (gLoc === "pool") {
			target = document.getElementById("a-show");
			target = (target ? target.getElementsByTagName("section")[0] : undefined);
			query = (!clean_links ? "?pool_id=" + /\/pools\/(\d+)/.exec(gUrlPath)[1] : "");
			before = paginator;
			orderedIds = optArg;
		}
		else if (gLoc === "notes") {
			target = document.getElementById("a-index");
			before = paginator;
		}
		else if (gLoc === "favorites") {
			target = document.getElementById("posts");
			query = document.getElementById("tags");
			query = (query && !clean_links ? "?tags=" + query.value : "");
			before = paginator;
		}

		if (!target) {
			bbbNotice("Thumbnail section could not be located.", -1);
			return;
		}

		// Thumb preparation.
		var newThumbs = createThumbListing(posts, query, orderedIds);

		// New thumbnail container preparation.
		var replacement = target.cloneNode(false);
		var childIndex = 0;

		while (target.children[childIndex]) {
			var child = target.children[childIndex];

			if (child.tagName !== "ARTICLE")
				replacement.appendChild(child);
			else
				childIndex++;
		}

		if (!before)
			replacement.appendChild(newThumbs);
		else
			replacement.insertBefore(newThumbs, before);

		// Thumbnail classes and titles.
		formatThumbnails(replacement);

		// Blacklist.
		blacklistUpdate(replacement);

		// Direct downloads.
		postDDL(replacement);

		// Replace results with new results.
		target.parentNode.replaceChild(replacement, target);

		// Fix the paginator. The paginator isn't always in the replacement, so run this on the whole page after the replacement is inserted.
		fixPaginator();

		// Fix hidden thumbnails.
		fixHiddenThumbs();
	}

	function parsePost(postInfo) {
		var post = bbb.post.info = formatInfo(postInfo || scrapePost());
		var imgContainer = document.getElementById("image-container");

		if (!imgContainer) {
			bbbNotice("Post content could not be located.", -1);
			return;
		}

		if (!post || !post.file_url) {
			bbbNotice("Due to a lack of provided information, this post cannot be viewed.", -1);
			return;
		}

		// Enable the "Resize to window", "Toggle Notes", "Random Post", and "Find similar" options for logged out users.
		createOptionsSection(post);

		// Replace the "resize to window" link with new resize links.
		modifyResizeLink();

		// Create content.
		if (post.file_ext === "swf") // Create flash object.
			imgContainer.innerHTML = '<div id="note-container"></div> <div id="note-preview"></div> <object height="' + post.image_height + '" width="' + post.image_width + '"> <params name="movie" value="' + post.file_url + '"> <embed allowscriptaccess="never" src="' + post.file_url + '" height="' + post.image_height + '" width="' + post.image_width + '"> </params> </object> <p><a href="' + post.file_url + '">Save this flash (right click and save)</a></p>';
		else if (post.file_ext === "webm") // Create webm video
			imgContainer.innerHTML = '<div id="note-container"></div> <div id="note-preview"></div> <video id="image" autoplay="autoplay" loop="loop" controls="controls" src="' + post.file_url + '" height="' + post.image_height + '" width="' + post.image_width + '"></video> <p><a href="' + post.file_url + '">Save this video (right click and save)</a></p>';
		else if (post.file_ext === "zip" && /\bugoira\b/.test(post.tag_string)) { // Create ugoira
			var useUgoiraOrig = getVar("original");

			// Get rid of all the old events handlers.
			if (Danbooru.Ugoira && Danbooru.Ugoira.player)
				$(Danbooru.Ugoira.player).unbind();

			if ((load_sample_first && useUgoiraOrig !== "1") || useUgoiraOrig === "0") { // Load sample webm version.
				imgContainer.innerHTML = '<div id="note-container"></div> <div id="note-preview"></div> <video id="image" autoplay="autoplay" loop="loop" controls="controls" src="' + post.large_file_url + '" height="' + post.image_height + '" width="' + post.image_width + '" data-fav-count="' + post.fav_count + '" data-flags="' + post.flags + '" data-has-active-children="' + post.has_active_children + '" data-has-children="' + post.has_children + '" data-large-height="' + post.sample_height + '" data-large-width="' + post.sample_width + '" data-original-height="' + post.image_height + '" data-original-width="' + post.image_width + '" data-rating="' + post.rating + '" data-score="' + post.score + '" data-tags="' + post.tag_string + '" data-pools="' + post.pool_string + '" data-uploader="' + post.uploader_name + '"></video> <p><a href="' + post.large_file_url + '">Save this video (right click and save)</a> | <a href="' + updateUrlQuery(gUrl, {original: "1"}) + '">View original</a> | <a href="#" id="bbb-note-toggle">Toggle notes</a></p>';

				// Prep the "toggle notes" link.
				noteToggleLinkInit();
			}
			else { // Load original ugoira version.
				imgContainer.innerHTML = '<div id="note-container"></div> <div id="note-preview"></div> <canvas data-ugoira-content-type="' + post.pixiv_ugoira_frame_data.content_type.replace(/"/g, "&quot;") + '" data-ugoira-frames="' + JSON.stringify(post.pixiv_ugoira_frame_data.data).replace(/"/g, "&quot;") + '" data-fav-count="' + post.fav_count + '" data-flags="' + post.flags + '" data-has-active-children="' + post.has_active_children + '" data-has-children="' + post.has_children + '" data-large-height="' + post.image_height + '" data-large-width="' + post.image_width + '" data-original-height="' + post.image_height + '" data-original-width="' + post.image_width + '" data-rating="' + post.rating + '" data-score="' + post.score + '" data-tags="' + post.tag_string + '" data-pools="' + post.pool_string + '" data-uploader="' + post.uploader_name + '" height="' + post.image_height + '" width="' + post.image_width + '" id="image"></canvas> <div id="ugoira-controls"> <div id="ugoira-control-panel" style="width: ' + post.image_width + 'px; min-width: 350px;"> <button id="ugoira-play" name="button" style="display: none;" type="submit">Play</button> <button id="ugoira-pause" name="button" type="submit">Pause</button> <p id="ugoira-load-progress">Loaded <span id="ugoira-load-percentage">0</span>%</p> <div id="seek-slider" style="display: none; width: ' + (post.image_width - 81) + 'px; min-width: 269px;"></div> </div> <p id="save-video-link"><a href="' + post.large_file_url + '">Save as video (right click and save)</a> | <a href="' + updateUrlQuery(gUrl, {original: "0"}) + '">View sample</a> | <a href="#" id="bbb-note-toggle">Toggle notes</a></p> </div>';

				// Make notes toggle when clicking the ugoira animation.
				noteToggleInit();

				// Prep the "toggle notes" link. The "toggle notes" link is added here just for consistency's sake.
				noteToggleLinkInit();

				if (post.pixiv_ugoira_frame_data.data) // Set up the post.
					ugoiraInit();
				else // Fix hidden posts.
					searchJSON("ugoira");
			}
		}
		else if (!post.image_height) // Create manual download.
			imgContainer.innerHTML = '<div id="note-container"></div> <div id="note-preview"></div><p><a href="' + post.file_url + '">Save this file (right click and save)</a></p>';
		else { // Create image
			var newWidth = 0;
			var newHeight = 0;
			var newUrl = "";
			var altTxt = "";

			if (load_sample_first && post.has_large) {
				newWidth = post.sample_width;
				newHeight = post.sample_height;
				newUrl = post.large_file_url;
				altTxt = "Sample";
			}
			else {
				newWidth = post.image_width;
				newHeight = post.image_height;
				newUrl = post.file_url;
				altTxt = post.md5;
			}

			imgContainer.innerHTML = '<div id="note-container"></div> <div id="note-preview"></div> <img alt="' + altTxt + '" data-fav-count="' + post.fav_count + '" data-flags="' + post.flags + '" data-has-active-children="' + post.has_active_children + '" data-has-children="' + post.has_children + '" data-large-height="' + post.sample_height + '" data-large-width="' + post.sample_width + '" data-original-height="' + post.image_height + '" data-original-width="' + post.image_width + '" data-rating="' + post.rating + '" data-score="' + post.score + '" data-tags="' + post.tag_string + '" data-pools="' + post.pool_string + '" data-uploader="' + post.uploader_name + '" height="' + newHeight + '" width="' + newWidth + '" id="image" src="' + newUrl + '" /> <img src="about:blank" height="1" width="1" id="bbb-loader" style="position: absolute; right: 0px; top: 0px; display: none;"/>';

			bbb.el.bbbLoader = document.getElementById("bbb-loader");

			// Create/replace the elements related to image swapping and set them up.
			swapImageInit(post);

			if (alternate_image_swap) // Make sample/original images swap when clicking the image.
				alternateImageSwap(post);
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

		// Load/reload notes.
		Danbooru.Note.load_all();

		// Auto position the content if desired.
		autoscrollPost();

		// Blacklist.
		blacklistUpdate();

		// Fix the parent/child notice(s).
		checkRelations();
	}

	function parseComments(xml) {
		var posts = xml;
		var numPosts = posts.length;
		var expectedPosts = numPosts;
		var existingPosts = getPosts(); // Live node list so adding/removing a "post-preview" class item immediately changes this.
		var eci = 0;

		for (var i = 0; i < numPosts; i++) {
			var post = formatInfo(posts[i]);
			var existingPost = existingPosts[eci];

			if (!existingPost || String(post.id) !== existingPost.getAttribute("data-id")) {
				if (!/\b(?:loli|shota|toddlercon)\b/.test(post.tag_string) && !post.is_banned) // API post isn't hidden and doesn't exist on the page so the API has different information. Skip it and try to find where the page's info matches up.
					continue;
				else if ((!show_loli && /\bloli\b/.test(post.tag_string)) || (!show_shota && /\bshota\b/.test(post.tag_string)) || (!show_toddlercon && /\btoddlercon\b/.test(post.tag_string)) || (!show_banned && post.is_banned)) { // Skip hidden posts if the user has selected to do so.
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
				var j, jl; // Loop variables.

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

				// Create the new post.
				var childSpan = document.createElement("span");

				childSpan.innerHTML = '<div id="post_' + post.id + '" class="post post-preview' + post.thumb_class + '" data-tags="' + post.tag_string + '" data-pools="' + post.pool_string + '" data-uploader="' + post.uploader_name + '" data-rating="' + post.rating + '" data-flags="' + post.flags + '" data-score="' + post.score + '" data-parent-id="' + post.parent_id + '" data-has-children="' + post.has_children + '" data-id="' + post.id + '" data-width="' + post.image_width + '" data-height="' + post.image_height + '" data-approver-id="' + post.approver_id + '" data-fav-count="' + post.fav_count + '" data-pixiv-id="' + post.pixiv_id + '" data-md5="' + post.md5 + '" data-file-ext="' + post.file_ext + '" data-file-url="' + post.file_url + '" data-large-file-url="' + post.large_file_url + '" data-preview-file-url="' + post.preview_file_url + '"> <div class="preview"> <a href="/posts/' + post.id + '"> <img alt="' + post.md5 + '" src="' + post.preview_file_url + '" /> </a> </div> <div class="comments-for-post" data-post-id="' + post.id + '"> <div class="header"> <div class="row"> <span class="info"> <strong>Date</strong> <time datetime="' + post.created_at + '" title="' + post.created_at.replace(/(.+)T(.+)-(.+)/, "$1 $2 -$3") + '">' + post.created_at.replace(/(.+)T(.+):\d+-.+/, "$1 $2") + '</time> </span> <span class="info"> <strong>User</strong> <a href="/users/' + post.uploader_id + '">' + post.uploader_name + '</a> </span> <span class="info"> <strong>Rating</strong> ' + post.rating + ' </span> <span class="info"> <strong>Score</strong> <span> <span id="score-for-post-' + post.id + '">' + post.score + '</span> </span> </span> </div> <div class="row list-of-tags"> <strong>Tags</strong>' + tagLinks + '</div> </div> </div> <div class="clearfix"></div> </div>';

				if (!existingPost) // There isn't a next post so append the new post to the end before the paginator.
					document.getElementById("a-index").insertBefore(childSpan.firstChild, document.getElementsByClassName("paginator")[0]);
				else // Insert new post before the post that should follow it.
					existingPost.parentNode.insertBefore(childSpan.firstChild, existingPost);

				// Get the comments and image info.
				searchPages("post_comments", post.id);
			}

			eci++;
		}

		// If we don't have the expected number of posts, the API info and page are too out of sync.
		if (existingPosts.length !== expectedPosts)
			bbbNotice("Loading of hidden post(s) failed. Please refresh.", -1);

		// Thumbnail classes and titles.
		formatThumbnails();

		// Blacklist.
		blacklistUpdate();
	}

	function parseRelations(xml, mode, parentId) {
		// Create a new parent/child notice.
		var posts = xml;
		var post;
		var activePost = bbb.post.info;
		var numPosts = posts.length;
		var relationCookie = getCookie()["show-relationship-previews"];
		var showPreview = (relationCookie === undefined || relationCookie === "1" ? true : false);
		var childSpan = document.createElement("span");
		var target;
		var previewLinkId;
		var previewLinkTxt;
		var previewId;
		var classes;
		var msg;
		var query = "?tags=parent:" + parentId + (show_deleted ? "+status:any" : "") + (thumbnail_count ? "&limit=" + thumbnail_count : "");
		var thumbs = "";
		var displayStyle;
		var forceShowDeleted = activePost.is_deleted; // If the parent is deleted or the active post is deleted, all deleted posts are shown.
		var parentDeleted = false;
		var i; // Loop variable.

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

			if (numPosts)
				msg = 'This post belongs to a <a href="/posts' + query + '">parent</a>' + (parentDeleted ? " (deleted)" : "" );

			if (numPosts === 3)
				msg += ' and has <a href="/posts' + query + '">a sibling</a>';
			else if (numPosts > 3)
				msg += ' and has <a href="/posts' + query + '">' + (numPosts - 2) + ' siblings</a>';
		}
		else if (mode === "parent") {
			target = document.getElementsByClassName("notice-parent")[0];
			previewLinkId = "has-children-relationship-preview-link";
			previewId = "has-children-relationship-preview";
			classes = "notice-parent";

			if (numPosts === 2)
				msg = 'This post has <a href="/posts' + query + '">a child</a>';
			else if (numPosts > 2)
				msg = 'This post has <a href="/posts' + query + '">' + (numPosts - 1) + ' children</a>';
		}

		// Create the main notice element.
		childSpan.innerHTML = '<div class="ui-corner-all ui-state-highlight notice ' + classes + '"> ' + msg + ' (<a href="/wiki_pages?title=help%3Apost_relationships">learn more</a>) <a href="#" id="' + previewLinkId + '">' + previewLinkTxt + '</a> <div id="' + previewId + '" style="display: ' + displayStyle + ';"> </div> </div>';

		var newNotice = childSpan.firstChild;
		var thumbDiv = getId(previewId, newNotice, "div");
		var previewLink = getId(previewLinkId, newNotice, "a");

		// Create the thumbnails.
		for (i = numPosts - 1; i >= 0; i--) {
			post = formatInfo(posts[i]);

			if ((!show_loli && /\bloli\b/.test(post.tag_string)) || (!show_shota && /\bshota\b/.test(post.tag_string)) || (!show_toddlercon && /\btoddlercon\b/.test(post.tag_string)) || (!show_deleted && post.is_deleted && !forceShowDeleted) || (!show_banned && post.is_banned))
				continue;

			checkHiddenThumbs(post);

			var thumb = createThumbHTML(post, (clean_links ? "" : query)) + " ";

			if (post.id === parentId)
				thumbs = thumb + thumbs;
			else
				thumbs += thumb;
		}

		thumbDiv.innerHTML = thumbs;

		// Highlight the post we're one.
		getId("post_" + activePost.id, thumbDiv, "article").className += " current-post";

		// Make the show/hide links work.
		previewLink.addEventListener("click", function(event) {
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
		}, false);

		// Thumbnail classes and titles.
		formatThumbnails(newNotice);

		// Blacklist.
		blacklistUpdate(newNotice);

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

		// Fix hidden thumbnails.
		fixHiddenThumbs();
	}

	/* Functions for XML page info */
	function searchPages(mode, optArg) {
		// Let other functions that don't require the API run (alternative to searchJSON) and retrieve various pages for info.
		var url;

		if (mode === "search" || mode === "notes" || mode === "favorites") {
			if (allowUserLimit()) {
				url = updateUrlQuery(gUrl, {limit: thumbnail_count});

				fetchPages(url, "thumbnails");
				bbbStatus("posts", "new");
			}
		}
		else if (mode === "paginator") {
			url = gUrl;

			if (allowUserLimit())
				url = updateUrlQuery(url, {limit: thumbnail_count});

			fetchPages(url, "paginator");
		}
		else if (mode === "post_comments") {
			url = "/posts/" + optArg;

			fetchPages(url, "post_comments", optArg);
			bbbStatus("post_comments", "new");
		}
		else if (mode === "hidden") {
			url = "/posts/" + optArg;

			fetchPages(url, "hidden");
			bbbStatus("hidden", "new");
		}
	}

	function fetchPages(url, mode, optArg, retries) {
		// Retrieve an actual page for certain pieces of information.
		var xmlhttp = new XMLHttpRequest();
		var xmlRetries = retries || 0;

		if (xmlhttp !== null) {
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState === 4) { // 4 = "loaded"
					if (xmlhttp.status === 200) { // 200 = "OK"
						var docEl = document.createElement("html");

						docEl.innerHTML = xmlhttp.responseText;

						if (mode === "paginator")
							replacePaginator(docEl);
						else if (mode === "post_comments") {
							replaceComments(docEl, optArg);
							bbbStatus("post_comments", "done");
						}
						else if (mode === "thumbnails") {
							history.replaceState({}, "", updateUrlQuery(gUrlQuery, {limit: thumbnail_count})); // Update the URL with the limit value.
							replaceThumbnails(docEl);
							bbbStatus("posts", "done");
						}
						else if (mode === "hidden") {
							replaceHidden(docEl);
							bbbStatus("hidden", "done");
						}
					}
					else if (xmlhttp.status !== 0) {
						if (xmlRetries < 2) {
							xmlRetries++;
							fetchPages(url, mode, optArg, xmlRetries);
						}
						else {
							var linkId = uniqueIdNum(); // Create a unique ID.
							var msg;

							if (mode === "hidden") {
								bbbStatus("hidden", "error");
								msg = "Error retrieving hidden thumbnails";
							}
							else if (mode === "thumbnails") {
								bbbStatus("posts", "error");
								msg = "Error retrieving post information";
							}
							else if (mode === "post_comments") {
								bbbStatus("post_comments", "error");
								msg = "Error retrieving comment information";
							}
							else if (mode === "paginator")
								msg = "Error updating paginator";

							bbbNotice(msg + ' (Code: ' + xmlhttp.status + ' ' + xmlhttp.statusText + '). <a id="' + linkId + '" href="#">Retry</a>', -1);

							document.getElementById(linkId).addEventListener("click", function(event) {
								this.style.display = "none";
								fetchPages(url, mode, optArg);

								event.preventDefault();
							}, false);
						}
					}
				}
			};
			xmlhttp.open("GET", url, true);
			xmlhttp.send(null);
		}
	}

	function replacePaginator(docEl) {
		// Replace the paginator with a new one.
		var target = document.getElementsByClassName("paginator")[0];
		var newContent = docEl.getElementsByClassName("paginator")[0];

		if (target && newContent)
			target.parentNode.replaceChild(newContent, target);
	}

	function replaceComments(docEl, postId) {
		// Fix hidden comments with information from a post.
		var commentDiv = document.getElementById("post_" + postId);
		var commentSection = docEl.getElementsByClassName("comments-for-post")[0];
		var comments = commentSection.getElementsByClassName("comment");
		var numComments = comments.length;
		var toShow = 6; // Number of comments to display.
		var post = scrapePost(docEl);
		var previewImg = commentDiv.getElementsByTagName("img")[0];
		var target = commentDiv.getElementsByClassName("comments-for-post")[0];
		var newContent = document.createDocumentFragment();

		// Fix the image.
		if (post.preview_file_url) {
			if (post.file_url) {
				commentDiv.setAttribute("data-md5", post.md5);
				commentDiv.setAttribute("data-file-ext", post.file_ext);
				commentDiv.setAttribute("data-file-url", post.file_url);
				commentDiv.setAttribute("data-large-file-url", post.large_file_url);
			}

			previewImg.src = post.preview_file_url;
			previewImg.alt = /([^\/]+)\.\w+$/.exec(post.preview_file_url)[1];
			commentDiv.setAttribute("data-preview-file-url", post.preview_file_url);
		}

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
	}

	function replaceThumbnails(docEl) {
		// Replace the thumbnails and paginator with new ones.
		var divId = (gLoc !== "notes" ? "posts" : "a-index");
		var paginator = docEl.getElementsByClassName("paginator")[0];
		var target = document.getElementById(divId);
		var newContent = (paginator ? paginator.parentNode : null);

		if (newContent) {
			// Thumbnail classes and titles.
			formatThumbnails(newContent);

			// Blacklist.
			blacklistUpdate(newContent);

			// Clean links.
			cleanLinks(newContent);

			// Direct downloads.
			postDDL(newContent);

			// Replace the current thumbnails.
			target.parentNode.replaceChild(newContent, target);
		}
	}

	function replaceHidden(docEl) {
		// Fix the hidden image placeholders with information from a post.
		var hiddenImgs = document.getElementsByClassName("bbb-hidden-thumb");
		var article = hiddenImgs[0];

		// Hidden thumbnails no longer exist in the page so stop.
		if (!article)
			return;

		var previewImg = article.getElementsByTagName("img")[0];
		var hiddenId = article.getAttribute("data-id");
		var bcc = bbb.cache.current;
		var post = scrapePost(docEl);

		if (String(post.id) !== hiddenId) // Out of sync. Reset.
			fetchPages("/posts/" + hiddenId, "hidden");
		else if (post.preview_file_url) { // Update the thumbnail with the correct information.
			if (post.file_url) {
				article.setAttribute("data-md5", post.md5);
				article.setAttribute("data-file-ext", post.file_ext);
				article.setAttribute("data-file-url", post.file_url);
				article.setAttribute("data-large-file-url", post.large_file_url);

				// Fix ddl.
				postDDL(article);
			}

			previewImg.src = post.preview_file_url;
			article.setAttribute("data-preview-file-url", post.preview_file_url);

			bcc.history.push(hiddenId);
			bcc.names[hiddenId] = /[^\/]+$/.exec(post.file_url || post.preview_file_url)[0];

			article.className = article.className.replace(/\s?bbb-hidden-thumb/gi, "");

			// Continue to the next image or finish by updating the cache.
			if (hiddenImgs.length) {
				hiddenId = hiddenImgs[0].getAttribute("data-id");
				fetchPages("/posts/" + hiddenId, "hidden");
			}
			else {
				updateThumbCache();
				bbb.xml.hidden_ready = true;
			}
		}
		else { // The image information couldn't be found.
			updateThumbCache();
			bbb.xml.hidden_ready = true;
			bbbNotice("Error retrieving thumbnail information.", -1);
			bbbStatus("hidden", "error");
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

	/* Functions for retrieving page info */
	function scrapePost(pageEl) {
		// Retrieve info from the current document or a supplied element containing the html with it.
		var target = pageEl || document;
		var postContent = getPostContent(target);
		var imgContainer = postContent.container;

		if (!imgContainer)
			return {};

		var postEl = postContent.el;
		var postTag = (postEl ? postEl.tagName : undefined);
		var dataInfo = [imgContainer.getAttribute("data-file-url"), imgContainer.getAttribute("data-md5"), imgContainer.getAttribute("data-file-ext")];
		var directLink = getId("image-resize-link", target, "a") || document.evaluate('.//section[@id="post-information"]/ul/li/a[starts-with(@href, "/data/")]', target, null, 9, null).singleNodeValue;
		var twitterInfo = getMeta("twitter:image:src", target);
		var previewInfo = getMeta("og:image", target);
		var imgHeight = Number(imgContainer.getAttribute("data-height"));
		var imgWidth = Number(imgContainer.getAttribute("data-width"));
		var md5 = "";
		var ext = "";
		var infoValues;
		var imgInfo = {
			md5: "",
			file_ext: "",
			file_url: "",
			large_file_url: "",
			preview_file_url: "",
			has_large: undefined,
			id: Number(imgContainer.getAttribute("data-id")),
			fav_count: Number(imgContainer.getAttribute("data-fav-count")),
			has_children: (imgContainer.getAttribute("data-has-children") === "true" ? true : false),
			has_active_children: (postTag === "IMG" || postTag === "CANVAS" ? postEl.getAttribute("data-has-active-children") === "true" : !!target.getElementsByClassName("notice-parent").length),
			parent_id: (imgContainer.getAttribute("data-parent-id") ? Number(imgContainer.getAttribute("data-parent-id")) : null),
			rating: imgContainer.getAttribute("data-rating"),
			score: Number(imgContainer.getAttribute("data-score")),
			tag_string: imgContainer.getAttribute("data-tags"),
			pool_string: imgContainer.getAttribute("data-pools"),
			uploader_name: imgContainer.getAttribute("data-uploader"),
			is_deleted: (getMeta("post-is-deleted", target) === "false" ? false : true),
			is_flagged: (getMeta("post-is-flagged", target) === "false" ? false : true),
			is_pending: (getId("pending-approval-notice", target, "div") ? true : false),
			is_banned: (imgContainer.getAttribute("data-flags").indexOf("banned") < 0 ? false : true),
			image_height: imgHeight || null,
			image_width: imgWidth || null,
			is_hidden: !postEl
		};

		// Try to extract the file's name and extension.
		if (dataInfo[1])
			infoValues = dataInfo;
		else if (directLink)
			infoValues = /data\/(\w+)\.(\w+)/.exec(directLink.href);
		else if (twitterInfo)
			infoValues = (twitterInfo.indexOf("sample") > -1 ? /data\/sample\/sample-(\w+)\.\w/.exec(twitterInfo) : /data\/(\w+)\.(\w+)/.exec(twitterInfo));
		else if (previewInfo)
			infoValues = /data\/preview\/(\w+?)\.\w/.exec(previewInfo);

		if (infoValues) {
			md5 = infoValues[1];
			ext = infoValues[2];

			// Test for the original image file extension if it is unknown.
			if (!ext && imgWidth) {
				var testExt = ["jpg", "png", "gif", "jpeg", "webm"];

				for (var i = 0, il = testExt.length; i < il; i++) {
					if (isThere("/data/" + md5 + "." + testExt[i])) {
						ext = testExt[i];
						break;
					}
				}
			}

			var isUgoira = postTag === "CANVAS" || (ext === "zip" && /\bugoira\b/.test(imgInfo.tag_string));

			if (isUgoira) {
				if (postTag === "CANVAS") {
					imgInfo.pixiv_ugoira_frame_data = {
						id: undefined, // Don't have this value.
						post_id: imgInfo.id,
						data: JSON.parse(postEl.getAttribute("data-ugoira-frames")),
						content_type: postEl.getAttribute("data-ugoira-content-type").replace(/"/gi, "")
					};
				}
				else {
					imgInfo.pixiv_ugoira_frame_data = {
						id: "", // Don't have this value.
						post_id: imgInfo.id,
						data: "",
						content_type: ""
					};
				}
			}

			imgInfo.has_large = ((imgWidth > 850 && ext !== "swf" && ext !== "webm") || isUgoira ? true : false);
			imgInfo.md5 = md5;
			imgInfo.file_ext = ext;
			imgInfo.file_url = "/data/" + md5 + "." + ext;
			imgInfo.preview_file_url = (!imgHeight || ext === "swf" ? "/images/download-preview.png" : "/data/preview/" + md5 + ".jpg");

			if (isUgoira)
				imgInfo.large_file_url = "/data/sample/sample-" + md5 + ".webm";
			else if (imgInfo.has_large)
				imgInfo.large_file_url = "/data/sample/sample-" + md5 + ".jpg";
			else
				imgInfo.large_file_url = "/data/" + md5 + "." + ext;
		}
		else if (previewInfo === "/images/download-preview.png")
			imgInfo.preview_file_url = "/images/download-preview.png";

		return imgInfo;
	}

	function getId(elId, target, elType) {
		// Retrieve an element by ID from either the current document or an element containing it.
		if (!target || target === document)
			return document.getElementById(elId);
		else if (target.id === elId)
			return target;
		else {
			var els = target.getElementsByTagName((elType ? elType : "*"));

			for (var i = 0, il = els.length; i < il; i++) {
				var el = els[i];

				if (el.id === elId)
					return el;
			}
		}

		return null;
	}

	function getPostContent(pageEl) {
		// Retrieve the post content related elements.
		var target = pageEl || document;
		var imgContainer = getId("image-container", target, "section");

		if (!imgContainer)
			return {};

		var img = getId("image", target, "img");
		var swfObj = imgContainer.getElementsByTagName("object")[0];
		var swfEmb = (swfObj ? swfObj.getElementsByTagName("embed")[0] : undefined);
		var webmVid = imgContainer.getElementsByTagName("video")[0];
		var ugoira = imgContainer.getElementsByTagName("canvas")[0];
		var other = document.evaluate('.//a[starts-with(@href, "/data/")]', imgContainer, null, 9, null).singleNodeValue;
		var element = swfEmb || webmVid || ugoira || img || other;
		var secondaryEl = swfObj; // Other elements related to the main element. Only applies to flash for now.

		return {container: imgContainer, el: element, secEl: secondaryEl};
	}

	function getPosts(target) {
		// Return a list of posts depending on the target supplied.
		var posts;

		if (!target || target === document) // All posts in the document.
			posts = document.getElementsByClassName("post-preview");
		else if (target instanceof Element) { // All posts in a specific element.
			if (target.className.indexOf("post-preview") < 0)
				posts = target.getElementsByClassName("post-preview");
			else // Single specific post.
				posts = [target];
		}

		return posts || [];
	}

	function getMeta(meta, pageEl) {
		// Get a value from an HTML meta tag.
		var target = pageEl || document;
		var metaTags = target.getElementsByTagName("meta");

		for (var i = 1, il = metaTags.length; i < il; i++) {
			var tag = metaTags[i];

			if (tag.name === meta || tag.property === meta) {
				if (tag.hasAttribute("content"))
					return tag.content;
				else
					return undefined;
			}
		}

		return undefined;
	}

	function getVar(urlVar, url) {
		// Retrieve a value from a specified/current URL's query string.
		// Undefined refers to a param that isn't even declared. Null refers to a declared param that hasn't been defined with a value (&test&). An empty string ("") refers to a param that has been defined with nothing (&test=&).
		if (!url)
			url = gUrlQuery;

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
			url = gUrlQuery;

		var tags = getVar("tags", url);
		var tag;
		var result;

		if (tags === null || tags === undefined)
			return undefined;

		tags = tags.split(/\+|%20/g);

		for (var i = 0, tl = tags.length; i < tl; i++) {
			tag = decodeURIComponent(tags[i]);

			if (tag.indexOf(urlVar + ":") === 0)
				result = encodeURIComponent(tag.split(":")[1]); // Let the calling function decide whether it wants the decoded tag or not.
		}

		return result;
	}

	/* Functions for the settings panel */
	function injectSettings() {
		var menu = document.getElementById("top");
		menu = (menu ? menu.getElementsByTagName("menu")[0] : undefined);

		if (!menu) {
			bbbNotice("The settings panel link could not be created.", -1);
			return;
		}

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
		var menu = bbb.el.menu.window = document.createElement("div");
		menu.id = "bbb_menu";
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
		generalPage.bbbSection(bbb.sections.misc);
		generalPage.bbbSection(bbb.sections.logged_out);

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

		var bordersPage = bbb.el.menu.bordersPage = document.createElement("div");
		bordersPage.className = "bbb-page";
		scrollDiv.appendChild(bordersPage);

		bordersPage.bbbSection(bbb.sections.border_options);
		bordersPage.bbbSection(bbb.sections.status_borders);
		bordersPage.bbbSection(bbb.sections.tag_borders);

		var prefPage = bbb.el.menu.prefPage = document.createElement("div");
		prefPage.className = "bbb-page";
		scrollDiv.appendChild(prefPage);

		prefPage.bbbSection(bbb.sections.script_settings);
		prefPage.bbbBackupSection();

		var helpPage = bbb.el.menu.helpPage = document.createElement("div");
		helpPage.className = "bbb-page";
		scrollDiv.appendChild(helpPage);

		helpPage.bbbTextSection('Thumbnail Matching Rules', 'For creating thumbnail matching rules, please consult the following examples:<ul><li><b>tag1</b> - Match posts with tag1.</li><li><b>tag1 tag2</b> - Match posts with tag1 AND tag2.</li><li><b>-tag1</b> - Match posts without tag1.</li><li><b>tag1 -tag2</b> - Match posts with tag1 AND without tag2.</li><li><b>~tag1 ~tag2</b> - Match posts with tag1 OR tag2.</li><li><b>~tag1 ~-tag2</b> - Match posts with tag1 OR without tag2.</li><li><b>tag1 ~tag2 ~tag3</b> - Match posts with tag1 AND either tag2 OR tag3.</li></ul><br>Wildcards can be used with any of the above methods:<ul><li><b>~tag1* ~-*tag2</b> - Match posts with tags starting with tag1 OR posts without tags ending with tag2.</li></ul><br>Multiple match rules can be applied by using commas or separate lines when possible:<ul><li><b>tag1 tag2, tag3 tag4</b> - Match posts with tag1 AND tag2 or posts with tag3 AND tag4.</li><li><b>tag1 ~tag2 ~tag3, tag4</b> - Match posts with tag1 AND either tag2 OR tag3 or posts with tag4.</li></ul><br>The following metatags are supported:<ul><li><b>rating:safe</b> - Match posts rated safe. Accepted values include safe, explicit, and questionable.</li><li><b>status:pending</b> - Match pending posts. Accepted values include active, pending, flagged, banned, and deleted. Note that flagged posts also count as active posts.</li><li><b>user:albert</b> - Match posts made by the user Albert.</li><li><b>pool:1</b> - Match posts that are in the pool with an ID number of 1.</li><li><b>id:1</b> - Match posts with an ID number of 1.</li><li><b>score:1</b> - Match posts with a score of 1.</li><li><b>favcount:1</b> - Match posts with a favorite count of 1.</li><li><b>height:1</b> - Match posts with a height of 1.</li><li><b>width:1</b> - Match posts with a width of 1.</li></ul><br>The id, score, favcount, width, and height metatags can also use number ranges for matching:<ul><li><b>score:&lt;5</b> - Match posts with a score less than 5.</li><li><b>score:&gt;5</b> - Match posts with a score greater than 5.</li><li><b>score:&lt;=5</b> or <b>score:..5</b> - Match posts with a score equal to OR less than 5.</li><li><b>score:&gt;=5</b> or <b>score:5..</b> - Match posts with a score equal to OR greater than 5.</li><li><b>score:1..5</b> - Match posts with a score equal to OR greater than 1 AND equal to OR less than 5.</li></ul>');
		helpPage.bbbTextSection('Questions, Suggestions, or Bugs?', 'If you have any questions, please use the Greasy Fork feedback forums located <a target="_blank" href="https://greasyfork.org/scripts/3575-better-better-booru/feedback">here</a>. If you\'d like to report a bug or make a suggestion, please create an issue on GitHub <a target="_blank" href="https://github.com/pseudonymous/better-better-booru/issues">here</a>.');
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

		var tagEditBlocker = bbb.el.menu.tagEditBlocker = document.createElement("div");
		tagEditBlocker.className = "bbb-edit-blocker";
		menu.appendChild(tagEditBlocker);

		var tagEditBox = document.createElement("div");
		tagEditBox.className = "bbb-edit-box";
		tagEditBlocker.appendChild(tagEditBox);

		var tagEditHeader = document.createElement("h2");
		tagEditHeader.innerHTML = "Tag Editor";
		tagEditHeader.className = "bbb-header";
		tagEditBox.appendChild(tagEditHeader);

		var tagEditArea = bbb.el.menu.tagEditArea = document.createElement("textarea");
		tagEditArea.className = "bbb-edit-area";
		tagEditBox.appendChild(tagEditArea);

		var tagEditOk = document.createElement("a");
		tagEditOk.innerHTML = "OK";
		tagEditOk.href = "#";
		tagEditOk.className = "bbb-button";
		tagEditOk.addEventListener("click", function(event) {
			var tags = tagEditArea.value.replace(/[\r\n]+/g, ",").bbbTagClean();
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
		else if (section.type === "border") {
			var borderSettings = bbb.user[section.settings];

			for (i = 0, il = borderSettings.length; i < il; i++) {
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
				item.addEventListener("change", function() { bbb.user[settingName] = (optionObject.isTagInput ? this.value.bbbTagClean() : this.value.bbbSpaceClean()); }, false);
				itemFrag.appendChild(item);

				if (optionObject.isTagInput) {
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
		borderSpacer.className = "bbb-border-spacer";

		var indexWrapper = document.createElement("div");
		indexWrapper.setAttribute("data-bbb-index", index);

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
				createBorder(borderSettings, indexWrapper);
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
		helpButton.bbbSetTip("<b>Enabled:</b> When checked, the border will be applied. When unchecked, it won't be applied.<br><br><b>Status/Tags:</b> Describes the posts that the border should be applied to. For custom tag borders, you may specify the rules the post must match for the border to be applied. Please read the \"Thumbnail Matching Rules\" section under the help tab for information about creating rules.<br><br><b>Color:</b> Set the color of the border. Hex RGB color codes (#000000, #FFFFFF, etc.) are the recommended values.<br><br><b>Style:</b> Set how the border looks. Please note that double only works with a border width of 3 or higher.<br><br><b>Move:</b> Move the border to a new position. Higher borders have higher priority. In the event of a post matching more than 4 borders, the first 4 borders get applied and the rest are ignored. If single color borders are enabled, only the first matching border is applied.<br><br><b>Preview:</b> Display a preview of the border's current settings.<br><br><b>Delete:</b> Remove the border and its settings.<br><br><b>New:</b> Create a new border.");
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
			nameInput.addEventListener("change", function() { borderItem.tags = this.value.bbbTagClean(); }, false);
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

		var rightButtons = document.createElement("span");
		rightButtons.style.cssFloat = "right";
		buttonDiv.appendChild(rightButtons);

		var restoreBackup = document.createElement("a");
		restoreBackup.innerHTML = "Restore Backup";
		restoreBackup.style.marginRight = "15px";
		restoreBackup.href = "#";
		restoreBackup.className = "bbb-button";
		restoreBackup.addEventListener("click", function(event) {
			restoreBackupText();
			event.preventDefault();
		}, false);
		rightButtons.appendChild(restoreBackup);

		var helpButton = document.createElement("a");
		helpButton.innerHTML = "Help";
		helpButton.href = "#";
		helpButton.className = "bbb-button";
		helpButton.bbbSetTip("Create copies of your settings that can be used for recovering lost/corrupted settings or transferring settings.<tiphead>Directions</tiphead>There are two options for creating a backup. Creating a text backup will provide a plain text format backup in the area provided that can be copied and saved where desired. Creating a backup page will open a new page that can be saved with the browser's \"save page\" or bookmark options. <br><br>To restore a backup, copy and paste the desired backup into the provided area and click \"Restore Backup\".");
		rightButtons.appendChild(helpButton);

		return sectionFrag;
	}

	Element.prototype.bbbBackupSection = function() {
		this.appendChild(createBackupSection());
	};

	function createBlacklistSection() {
		var sectionFrag = document.createDocumentFragment();

		var sectionHeader = document.createElement("h2");
		sectionHeader.innerHTML = "Blacklist";
		sectionHeader.className = "bbb-header";
		sectionFrag.appendChild(sectionHeader);

		var sectionText = document.createElement("div");
		sectionText.innerHTML = "Hide posts that match the specified tag(s).";
		sectionText.className = "bbb-section-text";
		//sectionFrag.appendChild(sectionText);

		var sectionDiv = document.createElement("div");
		sectionDiv.className = "bbb-section-options";
		sectionFrag.appendChild(sectionDiv);

		var blacklistTextarea = bbb.el.menu.blacklistTextarea = document.createElement("textarea");
		blacklistTextarea.className = "bbb-blacklist-area";
		blacklistTextarea.value = bbb.user.script_blacklisted_tags.bbbTagClean().replace(/,\s*/g, "\r\n\r\n");
		blacklistTextarea.addEventListener("change", function() { bbb.user.script_blacklisted_tags = blacklistTextarea.value.replace(/[\r\n]+/g, ",").bbbTagClean(); }, false);
		sectionDiv.appendChild(blacklistTextarea);

		var buttonDiv = document.createElement("div");
		buttonDiv.className = "bbb-section-options";
		sectionFrag.appendChild(buttonDiv);

		var formatButton = document.createElement("a");
		formatButton.innerHTML = "Format";
		formatButton.href = "#";
		formatButton.className = "bbb-button";
		formatButton.addEventListener("click", function(event) {
			blacklistTextarea.value = blacklistTextarea.value.replace(/[\r\n]+/g, ",").bbbTagClean().replace(/,\s*/g, "\r\n\r\n");
			event.preventDefault();
		}, false);
		buttonDiv.appendChild(formatButton);

		var helpButton = document.createElement("a");
		helpButton.innerHTML = "Help";
		helpButton.href = "#";
		helpButton.className = "bbb-button";
		helpButton.style.cssFloat = "right";
		helpButton.bbbSetTip("Hide posts that match the specified tag(s).<tiphead>Directions</tiphead>Please read the \"Thumbnail Matching Rules\" section under the help tab for information about creating matching rules/tag combinations for posts you wish to blacklist. Blank lines will be ignored and are only used for improved readability.<br><br> All commas will be converted to new lines and all extra spaces and extra blank lines will be removed the next time the settings are opened. By using the \"Format\" button, you can manually perform this action on the blacklist rules. <tiphead>Note</tiphead>When logged in, the account's \"Blacklisted tags\" list will override this option.");
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

	function resetBorderElements(section) {
		// Reset the list of border items after moving or creating a new border.
		var borderElements = section.children;

		for (var i = 0, il = borderElements.length; i < il; i++) {
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
			var newBorderItem = newBorder("", false, "#000000", "solid");
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

	function createBorder(borderSettings, borderElement) {
		// Prepare to create a border and wait for the user to click where it'll go.
		var section = borderElement.parentNode;

		bbb.borderEdit = {mode: "new", settings: borderSettings, section: section};
		section.className += " bbb-insert-highlight";
		bbb.el.menu.window.addEventListener("click", insertBorder, true);
	}

	function insertBorder(event) {
		// Place either a new or moved border where indicated.
		var target = event.target;
		var section = bbb.borderEdit.section;

		if (target.className === "bbb-border-divider") {
			var newIndex = Number(target.parentNode.getAttribute("data-bbb-index"));
			var borderSettings = bbb.borderEdit.settings;

			if (bbb.borderEdit.mode === "new") { // Make a new border.
				var newBorderItem = newBorder("", false, "#000000", "solid");
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

		if (styleString)
			tip.setAttribute("style", styleString);

		formatTip(event, tip, text, x, y);
	}

	function hideTip() {
		bbb.el.menu.tip.removeAttribute("style");
	}

	Element.prototype.bbbBorderPreview = function(borderItem) {
		this.addEventListener("click", function(event) { showTip(event, "<img src=\"http://danbooru.donmai.us/data/preview/d34e4cf0a437a5d65f8e82b7bcd02606.jpg\" alt=\"IMAGE\" style=\"width: 105px; height: 150px; border-color: " + borderItem.border_color + "; border-style: " + borderItem.border_style + "; border-width: " + bbb.user.border_width + "px; padding:" + bbb.user.border_spacing + "px; line-height: 150px; text-align: center; vertical-align: middle;\">", "background-color: #FFFFFF;"); }, false);
		this.addEventListener("mouseout", hideTip, false);
	};

	Element.prototype.bbbSetTip = function(text) {
		var tip = bbb.el.menu.tip;

		this.addEventListener("click", function(event) {
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

		activeTab.className = activeTab.className.replace(/\s?bbb-active-tab/g, "");
		bbb.el.menu[activeTab.name + "Page"].style.display = "none";
		bbb.el.menu.scrollDiv.scrollTop = 0;
		tab.className += " bbb-active-tab";
		bbb.el.menu[tab.name + "Page"].style.display = "block";
	}

	function tagEditWindow(input, object, prop) {
		bbb.el.menu.tagEditBlocker.style.display = "block";
		bbb.el.menu.tagEditArea.value = input.value.bbbTagClean().replace(/,\s*/g, "\r\n\r\n");
		bbb.el.menu.tagEditArea.focus();
		bbb.tagEdit = {input: input, object: object, prop: prop};
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
		if (typeof(localStorage.bbb_settings) === "undefined")
			loadDefaults();
		else {
			bbb.user = JSON.parse(localStorage.bbb_settings);
			checkUser(bbb.user, bbb.options);

			if (bbb.user.bbb_version !== bbb.options.bbb_version) {
				convertSettings("load");
				saveSettings();
			}
		}
	}

	function loadDefaults() {
		bbb.user = {};

		for (var i in bbb.options) {
			if (bbb.options.hasOwnProperty(i)) {
				if (typeof(bbb.options[i].def) !== "undefined")
					bbb.user[i] = bbb.options[i].def;
				else
					bbb.user[i] = bbb.options[i];
			}
		}
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
		if (!bbb.user.track_new && bbb.user.track_new_data.viewed) // Reset new post tracking if it's disabled.
			bbb.user.track_new_data = bbb.options.track_new_data.def;

		if (thumb_cache_limit !== bbb.user.thumb_cache_limit) // Trim down the thumb cache as necessary if the limit has changed.
			adjustThumbCache();

		localStorage.bbb_settings = JSON.stringify(bbb.user);
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
					// Temporary special tests for users that used the test version.
					if (/500$/.test(bbb.user.thumb_cache_limit))
						bbb.user.thumb_cache_limit = bbb.options.thumb_cache_limit.def;

					if (!/\.(jpg|gif|png)/.test(localStorage.bbb_thumb_cache)) {
						localStorage.removeItem("bbb_thumb_cache");
						loadThumbCache();
					}

					if (bbb.user.tag_scrollbars === "false")
						bbb.user.tag_scrollbars = 0;

				case "6.1":
				case "6.2":
				case "6.2.1":
				case "6.2.2":
					// Reset the thumb cache to deal with "download-preview" and incorrect extension entries.
					if (localStorage.bbb_thumb_cache) {
						localStorage.removeItem("bbb_thumb_cache");
						loadThumbCache();
					}

					// Convert the old hide_original_notice setting to the new show_resized_notice setting that replaces it.
					if (bbb.user.hide_original_notice)
						bbb.user.show_resized_notice = "sample";

					// Set the new show_banned setting to true if show_deleted is true.
					if (bbb.user.show_deleted)
						bbb.user.show_banned = true;

					// Add a custom border for banned posts to match the other hidden post borders.
					if (!/\bstatus:banned\b/i.test(JSON.stringify(bbb.user.tag_borders)))
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
					bbb.user.post_drag_scroll = bbb.user.image_drag_scroll;
					bbb.user.post_resize = bbb.user.image_resize;
					bbb.user.post_resize_mode = bbb.user.image_resize_mode;
					bbb.user.post_tag_scrollbars = bbb.user.tag_scrollbars;

					// Convert old settings.
					if (bbb.user.autoscroll_image)
						bbb.user.autoscroll_post = "post";

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
			if (user.hasOwnProperty(i)) {
				if (typeof(bbb.options[i]) === "undefined")
					delete user[i];
			}
		}
	}

	function createBackupText() {
		// Create a plain text version of the settings.
		var textarea = bbb.el.menu.backupTextarea;
		textarea.value = "Better Better Booru v" + bbb.user.bbb_version + " Backup (" + timestamp("y-m-d hh:mm:ss") + "):\r\n\r\n" + JSON.stringify(bbb.user) + "\r\n";
		textarea.focus();
		textarea.setSelectionRange(0,0);
	}

	function createBackupPage() {
		// Open a new tab/window and place the setting text in it.
		window.open(('data:text/html,<!doctype html><html style="background-color: #FFFFFF;"><head><meta charset="UTF-8" /><title>Better Better Booru v' + bbb.user.bbb_version + ' Backup (' + timestamp("y-m-d hh:mm:ss") + ')</title></head><body style="background-color: #FFFFFF; color: #000000; padding: 20px; word-wrap: break-word;">' + JSON.stringify(bbb.user) + '</body></html>').replace(/#/g, encodeURIComponent("#")));
	}

	function restoreBackupText() {
		// Load the backup text provided into the script.
		var textarea = bbb.el.menu.backupTextarea;
		var backupString = textarea.value.replace(/\r?\n/g, "").match(/\{.+\}/);

		if (backupString) {
			try {
				bbb.user = JSON.parse(backupString); // This is where we expect an error.
				removeMenu();
				checkUser(bbb.user, bbb.options);
				convertSettings("backup");
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

	/* Post functions */
	function swapImageInit(post) {
		// Create the custom elements for swapping between the sample and original images and set them up.
		createSwapElements(post);

		if (image_swap_mode === "load")
			swapImageLoad(post);
		else if (image_swap_mode === "view")
			swapImageView(post);
	}

	function createSwapElements(post) {
		// Create the elements for swapping between the original and sample image.
		if (!post.has_large)
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

		var resizeStatus = bbb.el.resizeStatus = getId("bbb-resize-status", bbbResizeNotice, "span");
		var resizeLink = bbb.el.resizeLink = getId("bbb-resize-link", bbbResizeNotice, "a");
		var closeResizeNotice = bbb.el.closeResizeNotice = getId("close-resize-notice", bbbResizeNotice, "span");

		closeResizeNotice.addEventListener("click", function() {
			var showResNot = bbb.user.show_resized_notice;

			bbbResizeNotice.style.display = "none";

			if (img.src.indexOf("/sample/") < 0) { // Original image.
				if (showResNot === "original")
					showResNot = "none";
				else if (showResNot === "all")
					showResNot = "sample";

				bbbNotice("Settings updated. The resized notice will now be hidden when viewing original images. You may change this setting under \"Notices\" in the settings panel.", 10);
			}
			else { // Sample image.
				if (showResNot === "sample")
					showResNot = "none";
				else if (showResNot === "all")
					showResNot = "original";

				bbbNotice("Settings updated. The resized notice will now be hidden when viewing sample images. You may change this setting under \"Notices\" in the settings panel.", 10);
			}

			updateSettings("show_resized_notice", showResNot);
		}, false);

		// Create a swap image link in the sidebar options section.
		var optionsSectionList = document.getElementById("post-options");
		optionsSectionList = (optionsSectionList ? optionsSectionList.getElementsByTagName("ul")[0] : undefined);

		var firstOption = (optionsSectionList ? optionsSectionList.getElementsByTagName("li")[0] : undefined);

		var swapListItem = document.createElement("li");

		var swapLink = bbb.el.swapLink = document.createElement("a");
		swapListItem.appendChild(swapLink);

		swapLink.addEventListener("click", function(event) {
			swapPost();
			event.preventDefault();
		}, false);

		// Prepare the element text, etc.
		swapImageUpdate(post, (load_sample_first ? "sample" : "original"));

		// Add the elements to the document.
		imgContainer.parentNode.insertBefore(bbbResizeNotice, imgContainer);

		if (optionsSectionList && firstOption)
			optionsSectionList.insertBefore(swapListItem, firstOption);
	}

	function swapImageLoad(post) {
		if (!post.has_large)
			return;

		var img = document.getElementById("image");
		var bbbLoader = bbb.el.bbbLoader;
		var resizeStatus = bbb.el.resizeStatus;
		var resizeLink = bbb.el.resizeLink;
		var swapLink = bbb.el.swapLink;

		resizeLink.addEventListener("click", function(event) {
			if (event.button === 0) {
				swapPost();
				event.preventDefault();
			}
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
					swapImageUpdate(post, "original");
				else // Sample image loaded.
					swapImageUpdate(post, "sample");
			}

			if (bbb.post.swapped)
				resizePost("swap");
		}, false);
	}

	function swapImageView(post) {
		if (!post.has_large)
			return;

		var img = document.getElementById("image");
		var resizeStatus = bbb.el.resizeStatus;
		var resizeLink = bbb.el.resizeLink;
		var swapLink = bbb.el.swapLink;

		resizeLink.addEventListener("click", function(event) {
			if (event.button === 0) {
				swapPost();
				event.preventDefault();
			}
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
		document.addEventListener("click", function(event) {
			if (event.target.id === "image" && event.button === 0 && !bbb.post.translation_mode) {
				if (!bbb.drag_scroll.moved)
					Danbooru.Note.Box.toggle_all();

				event.stopPropagation();
			}
		}, true);
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
				Danbooru.Note.Box.toggle_all();
				event.preventDefault();
			}, false);
		}
	}

	function translationModeInit() {
		// Set up translation mode.
		var post = bbb.post.info;
		var postContent = getPostContent();
		var postEl = postContent.el;
		var postTag = (postEl ? postEl.tagName : undefined);
		var translateLink = document.getElementById("translate");

		if (post.file_ext !== "webm" && post.file_ext !== "swf") { // Don't allow translation functions on webm videos or flash.
			if (postTag !== "VIDEO") { // Make translation mode work on non-video content.
				// Allow the translation note functions if the user is logged in and notes aren't locked.
				if (!isLoggedIn() || document.getElementById("note-locked-notice"))
					return;

				// Make the normal toggling work for hidden posts.
				if (post.is_hidden) {
					if (translateLink)
						translateLink.addEventListener("click", Danbooru.Note.TranslationMode.toggle, false);

					document.addEventListener("keydown", function(event) {
						if (event.keyCode === 78 && document.activeElement.type !== "text" && document.activeElement.type !== "textarea")
							Danbooru.Note.TranslationMode.toggle(event);
					}, false);
				}

				// Script translation mode events and tracking used to resolve timing issues.
				bbb.post.translation_mode = Danbooru.Note.TranslationMode.active;

				if (translateLink)
					translateLink.addEventListener("click", translationModeToggle, false);

				document.addEventListener("keydown", function(event) {
					if (event.keyCode === 78 && document.activeElement.type !== "text" && document.activeElement.type !== "textarea")
						translationModeToggle();
				}, false);
			}
			else { // Allow note viewing on ugoira webm video samples, but don't allow editing.
				Danbooru.Note.TranslationMode.toggle = function(event) {
					bbbNotice('Note editing is not allowed while using the ugoira video sample. Please use the <a href="' + updateUrlQuery(gUrl, {original: "1"}) + '">original</a> ugoira version for note editing.', -1);
					event.preventDefault();
				};
				Danbooru.Note.Edit.show = Danbooru.Note.TranslationMode.toggle;

				if (translateLink) {
					removeDanbHotkey("n");
					$(translateLink).unbind();
					translateLink.addEventListener("click", Danbooru.Note.TranslationMode.toggle, false);
				}
			}
		}
		else if (translateLink) { // If the translate link exists on webm videos or flash, provide a warning.
			Danbooru.Note.TranslationMode.toggle = function(event) {
				bbbNotice('Note editing is not allowed on flash/video content.', -1);
				event.preventDefault();
			};
			Danbooru.Note.Edit.show = Danbooru.Note.TranslationMode.toggle;
			removeDanbHotkey("n");
			$(translateLink).unbind();
			translateLink.addEventListener("click", Danbooru.Note.TranslationMode.toggle, false);
		}
	}

	function alternateImageSwap(post) {
		// Override Danbooru's image click handler for toggling notes with a custom one that swaps the image.
		if (post.has_large) {
			document.addEventListener("click", function(event) {
				if (event.target.id === "image" && event.button === 0 && !bbb.post.translation_mode) {
					if (!bbb.drag_scroll.moved)
						swapPost();

					event.stopPropagation();
				}
			}, true);
		}

		// Set up the "toggle notes" link since the image won't be used for toggling.
		noteToggleLinkInit();
	}

	function createOptionsSection(post) {
		// Create the sidebar options section for logged out users.
		if (isLoggedIn())
			return;

		var infoSection = document.getElementById("post-information");
		var options = document.createElement("section");
		options.id = "post-options";
		options.innerHTML = '<h1>Options</h1><ul><li><a href="#" id="image-resize-to-window-link">Resize to window</a></li><li><a id="random-post" href="http://danbooru.donmai.us/posts/random">Random post</a></li><li><a href="http://danbooru.iqdb.org/db-search.php?url=http://danbooru.donmai.us' + post.preview_file_url + '">Find similar</a></li></ul>';
		infoSection.parentNode.insertBefore(options, infoSection.nextElementSibling);
	}

	function modifyResizeLink() {
		// Replace the single resize link with three custom resize links.
		var resizeListItem = document.getElementById("image-resize-to-window-link").parentNode;
		var optionsFrag = document.createDocumentFragment();

		var resizeListAll = document.createElement("li");
		optionsFrag.appendChild(resizeListAll);

		var resizeLinkAll = bbb.el.resizeLinkAll = document.createElement("a");
		resizeLinkAll.href = "#";
		resizeLinkAll.innerHTML = "Resize to window";
		resizeLinkAll.addEventListener("click", function(event) {
			resizePost("all");
			event.preventDefault();
		}, false);
		resizeListAll.appendChild(resizeLinkAll);

		var resizeListWidth = document.createElement("li");
		optionsFrag.appendChild(resizeListWidth);

		var resizeLinkWidth = bbb.el.resizeLinkWidth = document.createElement("a");
		resizeLinkWidth.href = "#";
		resizeLinkWidth.innerHTML = "Resize to window width";
		resizeLinkWidth.addEventListener("click", function(event) {
			resizePost("width");
			event.preventDefault();
		}, false);
		resizeListWidth.appendChild(resizeLinkWidth);

		var resizeListHeight = document.createElement("li");
		optionsFrag.appendChild(resizeListHeight);

		var resizeLinkHeight = bbb.el.resizeLinkHeight = document.createElement("a");
		resizeLinkHeight.href = "#";
		resizeLinkHeight.innerHTML = "Resize to window height";
		resizeLinkHeight.addEventListener("click", function(event) {
			resizePost("height");
			event.preventDefault();
		}, false);
		resizeListHeight.appendChild(resizeLinkHeight);

		resizeListItem.parentNode.replaceChild(optionsFrag, resizeListItem);
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
		var availableHeight = document.documentElement.clientHeight - 40;
		var targetCurrentWidth = target.clientWidth || parseFloat(target.style.width) || target.getAttribute("width");
		var targetCurrentHeight = target.clientHeight || parseFloat(target.style.height) || target.getAttribute("height");
		var useDataDim = targetTag === "EMBED" || targetTag === "VIDEO";
		var targetWidth = (useDataDim ? imgContainer.getAttribute("data-width") : target.getAttribute("width")); // Was NOT expecting target.width to return the current width (css style width) and not the width attribute's value here...
		var targetHeight = (useDataDim ? imgContainer.getAttribute("data-height") : target.getAttribute("height"));
		var tooWide = targetCurrentWidth > availableWidth;
		var tooTall = targetCurrentHeight > availableHeight;
		var widthRatio = availableWidth / targetWidth;
		var heightRatio = availableHeight / targetHeight;
		var imgMode = mode;
		var switchMode = false;
		var ratio = 1;
		var linkWeight = {all: "normal", width: "normal", height: "normal"};

		if (mode === "swap") { // The image is being swapped between the original and sample image so everything needs to be reset.
			switchMode = true;
			imgMode = "none";
		}
		else if (mode === currentMode || (mode === "width" && widthRatio >= 1) || (mode === "height" && heightRatio >= 1) || (mode === "all" && widthRatio >= 1 && heightRatio >= 1)) { // Cases where resizing is being toggled off or isn't needed.
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
		var post = bbb.post.info;
		var target = getPostContent().el;
		var targetTag = (target ? target.tagName : undefined);
		var bbbLoader = bbb.el.bbbLoader;
		var resizeStatus = bbb.el.resizeStatus;
		var resizeLink = bbb.el.resizeLink;
		var swapLink = bbb.el.swapLink;

		if (!post.has_large)
			return;

		if (post.file_ext === "zip" && /\bugoira\b/.test(post.tag_string)) {
			if (targetTag === "CANVAS")
				location.href = updateUrlQuery(gUrl, {original: "0"});
			else if (targetTag === "VIDEO")
				location.href = updateUrlQuery(gUrl, {original: "1"});
		}
		else if (targetTag === "IMG") {
			if (image_swap_mode === "load") { // Load image and then view mode.
				if (bbbLoader.src !== "about:blank") { // Messages after cancelling.
					if (target.src.indexOf("/sample/") < 0)
						swapImageUpdate(post, "original");
					else
						swapImageUpdate(post, "sample");

					bbbLoader.src = "about:blank";
				}
				else { // Messages during loading.
					if (target.src.indexOf("/sample/") < 0) {
						resizeStatus.innerHTML = "Loading sample image...";
						resizeLink.innerHTML = "cancel";
						swapLink.innerHTML = "View sample (cancel)";
						bbbLoader.src = post.large_file_url;
					}
					else {
						resizeStatus.innerHTML = "Loading original image...";
						resizeLink.innerHTML = "cancel";
						swapLink.innerHTML = "View original (cancel)";
						bbbLoader.src = post.file_url;
					}
				}
			}
			else if (image_swap_mode === "view") { // View image while loading mode.
				if (target.src.indexOf("/sample/") < 0) { // Load the sample image.
					swapImageUpdate(post, "sample");
					target.src = "about:blank";
					target.removeAttribute("src");
					delayMe(function(){ target.src = post.large_file_url; });
				}
				else { // Load the original image.
					swapImageUpdate(post, "original");
					target.src = "about:blank";
					target.removeAttribute("src");
					delayMe(function(){ target.src = post.file_url; });
				}

				if (!bbb.post.swapped)
					delayMe(function(){ resizePost("swap"); });
				else
					bbb.post.swapped = true;
			}
		}
	}

	function swapImageUpdate(post, mode) {
		// Update all the elements related to swapping images when the image URL is changed.
		var img = document.getElementById("image");
		var bbbResizeNotice = bbb.el.resizeNotice;
		var resizeStatus = bbb.el.resizeStatus;
		var resizeLink = bbb.el.resizeLink;
		var swapLink = bbb.el.swapLink;
		var showResNot = bbb.user.show_resized_notice;

		if (mode === "original") { // When the image is changed to the original image.
			resizeStatus.innerHTML = "Viewing original";
			resizeLink.innerHTML = "view sample";
			resizeLink.href = post.large_file_url;
			swapLink.innerHTML = "View sample";
			swapLink.href = post.large_file_url;
			img.alt = post.md5;
			img.setAttribute("height", post.image_height);
			img.setAttribute("width", post.image_width);
			bbbResizeNotice.style.display = (showResNot === "original" || showResNot === "all" ? "block" : "none");
		}
		else if (mode === "sample") { // When the image is changed to the sample image.
			resizeStatus.innerHTML = "Resized to " + Math.floor(post.sample_ratio * 100) + "% of original";
			resizeLink.innerHTML = "view original";
			resizeLink.href = post.file_url;
			swapLink.innerHTML = "View original";
			swapLink.href = post.file_url;
			img.alt = "Sample";
			img.setAttribute("height", post.sample_height);
			img.setAttribute("width", post.sample_width);
			bbbResizeNotice.style.display = (showResNot === "sample" || showResNot === "all" ? "block" : "none");
		}
	}

	function checkRelations() {
		// Test whether the parent/child notice could have hidden posts.
		var post = bbb.post.info;
		var thumbCount;
		var deletedCount;
		var loggedIn = isLoggedIn();
		var fixParent = false;
		var fixChild = false;
		var relationCookie = getCookie()["show-relationship-previews"];
		var showPreview = (relationCookie === undefined || relationCookie === "1" ? true : false);
		var parentLink = document.getElementById("has-children-relationship-preview-link");
		var childLink = document.getElementById("has-parent-relationship-preview-link");

		if (post.has_children) {
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
				searchJSON("parent", post.id);
			else
				parentLink.addEventListener("click", requestRelations, false);
		}

		if (post.parent_id) {
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
				searchJSON("child", post.parent_id);
			else
				childLink.addEventListener("click", requestRelations, false);
		}
	}

	function requestRelations(event) {
		// Start the parent/child notice JSON request when the user chooses to display the thumbs in a notice.
		var post = bbb.post.info;
		var target = event.target;

		if (target.id === "has-children-relationship-preview-link")
			searchJSON("parent", post.id);
		else if (target.id === "has-parent-relationship-preview-link")
			searchJSON("child", post.parent_id);

		target.removeEventListener("click", requestRelations, false);
		event.preventDefault();
	}

	function removeTagHeaders() {
		// Remove the "copyright", "characters", and "artist" headers in the post sidebar.
		if (!remove_tag_headers || gLoc !== "post")
			return;

		var tagList = document.getElementById("tag-list");

		if (tagList)
			tagList.innerHTML = tagList.innerHTML.replace(/<\/ul>.+?<ul>/g, "").replace(/<h2>.+?<\/h2>/, "<h1>Tags</h1>");
	}

	function postTagTitles() {
		// Replace the post title with the full set of tags.
		if (post_tag_titles && gLoc === "post")
			document.title = getMeta("tags").replace(/\s/g, ", ").replace(/_/g, " ") + " - Danbooru";
	}

	function minimizeStatusNotices() {
		if (!minimize_status_notices || gLoc !== "post")
			return;

		var infoSection = document.getElementById("post-information");
		var infoListItems = (infoSection ? infoSection.getElementsByTagName("li") : null);
		var statusListItem;
		var newStatusContent;
		var flaggedNotice = document.getElementsByClassName("notice-flagged")[0];
		var appealedNotice = document.getElementsByClassName("notice-appealed")[0];
		var pendingNotice = document.getElementsByClassName("notice-pending")[0];
		var deletedNotices = document.getElementsByClassName("notice-deleted");
		var deletedNotice;
		var bannedNotice;
		var i, il; // Loop variables.

		if (infoListItems) {
			// Locate the status portion of the information section.
			for (i = infoListItems.length - 1; i >= 0; i--) {
				var infoListItem = infoListItems[i];

				if (infoListItem.textContent.indexOf("Status:") > -1) {
					statusListItem = infoListItem;
					newStatusContent = statusListItem.textContent;
					break;
				}
			}

			// Hide and alter the notices and create the appropriate status links.
			if (statusListItem) {
				if (flaggedNotice) {
					flaggedNotice.style.display = "none";
					flaggedNotice.style.position = "absolute";
					flaggedNotice.style.zIndex = "2003";
					newStatusContent = newStatusContent.replace("Flagged", '<a href="#" id="bbb-flagged-link">Flagged</a>');
				}

				if (pendingNotice) {
					pendingNotice.style.display = "none";
					pendingNotice.style.position = "absolute";
					pendingNotice.style.zIndex = "2003";
					newStatusContent = newStatusContent.replace("Pending", '<a href="#" id="bbb-pending-link">Pending</a>');
				}

				for (i = 0, il = deletedNotices.length; i < il; i++) {
					deletedNotices[i].style.display = "none";
					deletedNotices[i].style.position = "absolute";
					deletedNotices[i].style.zIndex = "2003";

					if (deletedNotices[i].getElementsByTagName("li").length) {
						deletedNotice = deletedNotices[i];
						newStatusContent = newStatusContent.replace("Deleted", '<a href="#" id="bbb-deleted-link">Deleted</a>');
					}
					else {
						bannedNotice = deletedNotices[i];
						newStatusContent = newStatusContent.replace("Banned", '<a href="#" id="bbb-banned-link">Banned</a>');
					}
				}

				if (appealedNotice) {
					appealedNotice.style.display = "none";
					appealedNotice.style.position = "absolute";
					appealedNotice.style.zIndex = "2003";
					newStatusContent = newStatusContent + ' <a href="#" id="bbb-appealed-link">Appealed</a>';
				}

				statusListItem.innerHTML = newStatusContent;
			}

			// Prepare the links.
			var flaggedLink = document.getElementById("bbb-flagged-link");
			var appealedLink = document.getElementById("bbb-appealed-link");
			var pendingLink = document.getElementById("bbb-pending-link");
			var deletedLink = document.getElementById("bbb-deleted-link");
			var bannedLink = document.getElementById("bbb-banned-link");

			if (flaggedLink)
				statusLinkEvents(flaggedLink, flaggedNotice);
			if (appealedLink)
				statusLinkEvents(appealedLink, appealedNotice);
			if (pendingLink)
				statusLinkEvents(pendingLink, pendingNotice);
			if (deletedLink)
				statusLinkEvents(deletedLink, deletedNotice);
			if (bannedLink)
				statusLinkEvents(bannedLink, bannedNotice);
		}
	}

	function statusLinkEvents(link, notice) {
		// Attach events to the status links to enable a tooltip style notice.
		link.addEventListener("click", function(event) { showStatusNotice(event, notice); }, false);
		link.addEventListener("mouseout", function() { bbb.timers.minNotice = window.setTimeout(function() { notice.style.display = "none"; }, 200); }, false);
		notice.addEventListener("mouseover", function() { window.clearTimeout(bbb.timers.minNotice); }, false);
		notice.addEventListener("mouseleave", function() { notice.style.display = "none"; }, false);
	}

	function showStatusNotice(event, noticeEl) {
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
		if (!post_drag_scroll)
			return;

		var target = getPostContent().el;
		var targetTag = (target ? target.tagName : undefined);

		if (targetTag === "IMG" || targetTag === "VIDEO" || targetTag === "CANVAS") {
			bbb.drag_scroll.target = target;

			if (!bbb.post.translation_mode)
				dragScrollEnable();
		}
	}

	function dragScrollToggle() {
		if (bbb.post.translation_mode)
			dragScrollDisable();
		else
			dragScrollEnable();
	}

	function dragScrollEnable() {
		var target = bbb.drag_scroll.target;

		target.addEventListener("mousedown", dragScrollOn, false);
		target.addEventListener("dragstart", disableEvent, false);
		target.addEventListener("selectstart", disableEvent, false);
	}

	function dragScrollDisable() {
		var target = bbb.drag_scroll.target;

		target.removeEventListener("mousedown", dragScrollOn, false);
		target.removeEventListener("dragstart", disableEvent, false);
		target.removeEventListener("selectstart", disableEvent, false);
	}

	function dragScrollOn(event) {
		if (event.button === 0) {
			bbb.drag_scroll.lastX = event.clientX;
			bbb.drag_scroll.lastY = event.clientY;
			bbb.drag_scroll.moved = false;

			document.addEventListener("mousemove", dragScrollMove, false);
			document.addEventListener("mouseup", dragScrollOff, false);
		}
	}

	function dragScrollMove(event) {
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
		document.removeEventListener("mousemove", dragScrollMove, false);
		document.removeEventListener("mouseup", dragScrollOff, false);
	}

	function disableEvent(event) {
		event.preventDefault();
		event.stopPropagation();
	}

	function translationModeToggle() {
		bbb.post.translation_mode = !bbb.post.translation_mode;

		if (post_drag_scroll && bbb.drag_scroll.target)
			dragScrollToggle();
	}

	function autoscrollPost() {
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

	function fixHiddenUgoira(xml) {
		// Use xml info to fix the missing info for hidden ugoira posts.
		var post = bbb.post.info;
		post.pixiv_ugoira_frame_data = xml.pixiv_ugoira_frame_data;

		var imgContainer = document.getElementById("image-container");
		var ugoira = (imgContainer ? imgContainer.getElementsByTagName("canvas")[0] : undefined);

		if (ugoira) {
			// Fix the missing data attributes.
			ugoira.setAttribute("data-ugoira-content-type", post.pixiv_ugoira_frame_data.content_type);
			ugoira.setAttribute("data-ugoira-frames", JSON.stringify(post.pixiv_ugoira_frame_data.data));

			// Append the necessary script.
			var mainScript = document.createElement("script");
			mainScript.src = "/assets/ugoira_player.js";
			mainScript.addEventListener("load", ugoiraInit, true); // Wait for this script to load before running the JavaScript that requires it.
			document.head.appendChild(mainScript);
		}
	}

	function ugoiraInit() {
		// Execute a static copy of Danbooru's embedded JavaScript for setting up the post.
		var post = bbb.post.info;

		try {
			Danbooru.Ugoira = {};

			Danbooru.Ugoira.create_player = function() {
				var meta_data = {
					mime_type: post.pixiv_ugoira_frame_data.content_type,
					frames: post.pixiv_ugoira_frame_data.data
				};
				var options = {
					canvas: document.getElementById("image"),
					source: post.file_url,
					metadata: meta_data,
					chunkSize: 300000,
					loop: true,
					autoStart: true,
					debug: false
				};

				this.player = new ZipImagePlayer(options);
			};

			Danbooru.Ugoira.player = null;

			$(function() {
				Danbooru.Ugoira.create_player();
				$(Danbooru.Ugoira.player).on("loadProgress", function(event, progress) {
					$("#ugoira-load-percentage").text(Math.floor(progress * 100));
				});
				$(Danbooru.Ugoira.player).on("loadingStateChanged", function(event, state) {
					if (state === 2) {
						$("#ugoira-load-progress").remove();
						$("#seek-slider").show();
					}
				});

				var player_manually_paused = false;

				$("#ugoira-play").click(function(event) {
					Danbooru.Ugoira.player.play();
					$(this).hide();
					$("#ugoira-pause").show();
					player_manually_paused = false;
					event.preventDefault();
				});
				$("#ugoira-pause").click(function(event) {
					Danbooru.Ugoira.player.pause();
					$(this).hide();
					$("#ugoira-play").show();
					player_manually_paused = true;
					event.preventDefault();
				});

				$("#seek-slider").slider({
					min: 0,
					max: Danbooru.Ugoira.player._frameCount-1,
					start: function() {
						// Need to pause while slider is being dragged or playback speed will bug out
						Danbooru.Ugoira.player.pause();
					},
					slide: function(event, ui) {
						Danbooru.Ugoira.player._frame = ui.value;
						Danbooru.Ugoira.player._displayFrame();
					},
					stop: function() {
						// Resume playback when dragging stops, but only if player was not paused by the user earlier
						if (!(player_manually_paused)) {
							Danbooru.Ugoira.player.play();
						}
					}
				});
				$(Danbooru.Ugoira.player).on("frame", function(frame, frame_number) {
					$("#seek-slider").slider("option", "value", frame_number);
				});
			});
		}
		catch (error) {
			bbbNotice("Unexpected error creating the ugoira post. (Error: " + error.message + ")", -1);
		}
	}

	/* Thumbnail functions */
	function formatThumbnails(target) {
		// Create thumbnail titles and borders.
		var posts = getPosts(target);
		var i, il; // Loop variables.

		if (!posts.length)
			return;

		var searches = bbb.custom_tag.searches;

		// Create and cache border search objects.
		if (custom_tag_borders && !searches.length) {
			for (i = 0, il = tag_borders.length; i < il; i++)
				searches.push(createSearch(tag_borders[i].tags));
		}

		// Cycle through each post and apply titles and borders.
		for (i = 0, il = posts.length; i < il; i++) {
			var post = posts[i];
			var img = post.getElementsByTagName("img")[0];

			if (!img)
				continue;

			var link = img.parentNode;
			var tags = post.getAttribute("data-tags");
			var user = " user:" + post.getAttribute("data-uploader");
			var rating = " rating:" + post.getAttribute("data-rating");
			var score = " score:" + post.getAttribute("data-score");
			var title = tags + user + rating + score;
			var id = post.getAttribute("data-id");
			var hasChildren = (post.getAttribute("data-has-children") === "true" ? true : false);
			var secondary = [];
			var secondaryLength = 0;
			var borderStyle;
			var styleList = bbb.custom_tag.style_list;

			// Skip thumbnails that have already been done.
			if (link.className.indexOf("bbb-thumb-link") > -1)
				continue;

			// Create title.
			img.title = title;

			// Give the thumbnail link an identifying class.
			link.className += " bbb-thumb-link";

			// Correct parent status borders on "no active children" posts for logged out users.
			if (hasChildren && show_deleted && post.className.indexOf("post-status-has-children") < 0)
				post.className += " post-status-has-children";

			// Secondary custom tag borders.
			if (custom_tag_borders) {
				if (typeof(styleList[id]) === "undefined") {
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
						link.className += " bbb-custom-tag";

						if (secondaryLength === 1 || (single_color_borders && secondaryLength > 1))
							borderStyle = "border: " + border_width + "px " + secondary[0][0] + " " + secondary[0][1] + " !important;";
						else if (secondaryLength === 2)
							borderStyle = "border-color: " + secondary[0][0] + " " + secondary[1][0] + " " + secondary[1][0] + " " + secondary[0][0] + " !important; border-style: " + secondary[0][1] + " " + secondary[1][1] + " " + secondary[1][1] + " " + secondary[0][1] + " !important;";
						else if (secondaryLength === 3)
							borderStyle = "border-color: " + secondary[0][0] + " " + secondary[1][0] + " " + secondary[2][0] + " " + secondary[0][0] + " !important; border-style: " + secondary[0][1] + " " + secondary[1][1] + " " + secondary[2][1] + " " + secondary[0][1] + " !important;";
						else if (secondaryLength === 4)
							borderStyle = "border-color: " + secondary[0][0] + " " + secondary[2][0] + " " + secondary[3][0] + " " + secondary[1][0] + " !important; border-style: " + secondary[0][1] + " " + secondary[2][1] + " " + secondary[3][1] + " " + secondary[1][1] + " !important;";

						link.setAttribute("style", borderStyle);
						styleList[id] = borderStyle;
					}
					else
						styleList[id] = false;
				}
				else if (styleList[id] !== false && post.className.indexOf("bbb-custom-tag") < 0) {
					link.className += " bbb-custom-tag";
					link.setAttribute("style", styleList[id]);
				}
			}
		}
	}

	function checkHiddenThumbs(post) {
		// Alter a hidden thumbnails with cache info or queue it for the cache.
		if (!post.md5) {
			if (!bbb.cache.stored.history)
				loadThumbCache();

			var cacheName = bbb.cache.stored.names[post.id];

			if (cacheName) { // Load the thumbnail info from the cache.
				if (cacheName === "download-preview.png")
					post.preview_file_url = "/images/download-preview.png";
				else {
					var cacheValues = cacheName.split(".");
					var cacheMd5 = cacheValues[0];
					var cacheExt = cacheValues[1];

					post.md5 = cacheMd5;
					post.file_ext = cacheExt;
					post.preview_file_url = (!post.image_height || cacheExt === "swf" ? "/images/download-preview.png" : "/data/preview/" + cacheMd5 + ".jpg");
					post.large_file_url = (post.has_large ? "/data/sample/sample-" + cacheMd5 + ".jpg" : "/data/" + cacheName);
					post.file_url = "/data/" + cacheName;
				}
			}
			else // Mark hidden img for fixing.
				post.thumb_class += " bbb-hidden-thumb";
		}
	}

	function fixHiddenThumbs() {
		// Fix hidden thumbnails by fetching the info from a page.
		if (!bbb.xml.hidden_ready)
			return;

		var hiddenImgs = document.getElementsByClassName("bbb-hidden-thumb");

		if (hiddenImgs.length) {
			if (!bbb.cache.save_enabled) {
				window.addEventListener("beforeunload", updateThumbCache);
				bbb.cache.save_enabled = true;
			}

			bbb.xml.hidden_ready = false;
			searchPages("hidden", hiddenImgs[0].getAttribute("data-id"));
		}
	}

	function createThumbHTML(post, query) {
		// Create a thumbnail HTML string.
		return '<article class="post-preview' + post.thumb_class + '" id="post_' + post.id + '" data-id="' + post.id + '" data-tags="' + post.tag_string + '" data-pools="' + post.pool_string + '" data-uploader="' + post.uploader_name + '" data-rating="' + post.rating + '" data-width="' + post.image_width + '" data-height="' + post.image_height + '" data-flags="' + post.flags + '" data-parent-id="' + post.parent_id + '" data-has-children="' + post.has_children + '" data-score="' + post.score + '" data-fav-count="' + post.fav_count + '" data-approver-id="' + post.approver_id + '" data-pixiv-id="' + post.pixiv_id + '" data-md5="' + post.md5 + '" data-file-ext="' + post.file_ext + '" data-file-url="' + post.file_url + '" data-large-file-url="' + post.large_file_url + '" data-preview-file-url="' + post.preview_file_url + '"><a href="/posts/' + post.id + query + '"><img src="' + post.preview_file_url + '" alt="' + post.tag_string + '"></a></article>';
	}

	function createThumb(post, query) {
		// Create a thumbnail element. (lazy method <_<)
		var childSpan = document.createElement("span");
		childSpan.innerHTML = createThumbHTML(post, query);

		return childSpan.firstChild;
	}

	function createThumbListing(posts, query, orderedIds) {
		// Create a listing of thumbnails.
		var thumb;
		var thumbs = document.createDocumentFragment();
		var postHolder = {};
		var i, il; // Loop variables;

		// Generate thumbnails.
		for (i = 0, il = posts.length; i < il; i++) {
			var post = formatInfo(posts[i]);

			// Don't display loli/shota/toddlercon/deleted/banned if the user has opted so and skip to the next image.
			if ((!show_loli && /\bloli\b/.test(post.tag_string)) || (!show_shota && /\bshota\b/.test(post.tag_string)) || (!show_toddlercon && /\btoddlercon\b/.test(post.tag_string)) || (!show_deleted && post.is_deleted) || (!show_banned && post.is_banned))
				continue;

			// Check if the post is hidden.
			checkHiddenThumbs(post);

			// eek, not so huge line.
			thumb = createThumb(post, query);

			// Generate output.
			if (!orderedIds)
				thumbs.appendChild(thumb);
			else
				postHolder[post.id] = thumb;
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

	function loadThumbCache() {
		// Initialize or load up the thumbnail cache.
		if (typeof(localStorage.bbb_thumb_cache) !== "undefined")
			bbb.cache.stored = JSON.parse(localStorage.bbb_thumb_cache);
		else {
			bbb.cache.stored = {history: [], names: {}};
			localStorage.bbb_thumb_cache = JSON.stringify(bbb.cache.stored);
		}
	}

	function updateThumbCache() {
		// Add the current new thumbnail info to the saved thumbnail information.
		if (!bbb.cache.current.history.length || !thumb_cache_limit)
			return;

		loadThumbCache();

		var bcc = bbb.cache.current;
		var bcs = bbb.cache.stored;
		var i, il; // Loop variables.

		// Make sure we don't have duplicates in the new info.
		for (i = 0, il = bcc.history.length; i < il; i++) {
			if (bcs.names[bcc.history[i]]) {
				delete bcc.names[bcc.history[i]];
				bcc.history.splice(i, 1);
				il--;
				i--;
			}
		}

		// Add the new thumbnail info in.
		for (i in bcc.names) {
			if (bcc.names.hasOwnProperty(i)) {
				bcs.names[i] = bcc.names[i];
			}
		}

		bcs.history = bcs.history.concat(bcc.history);

		// Prune the cache if it's larger than the user limit.
		if (bcs.history.length > thumb_cache_limit) {
			var removedIds = bcs.history.splice(0, bcs.history.length - thumb_cache_limit);

			for (i = 0, il = removedIds.length; i < il; i++)
				delete bcs.names[removedIds[i]];
		}

		localStorage.bbb_thumb_cache = JSON.stringify(bcs);
		bbb.cache.current = {history: [], names: {}};
	}

	function adjustThumbCache() {
		// Prune the cache if it's larger than the user limit.
		loadThumbCache();

		thumb_cache_limit = bbb.user.thumb_cache_limit;

		var bcs = bbb.cache.stored;

		if (bcs.history.length > thumb_cache_limit) {
			var removedIds = bcs.history.splice(0, bcs.history.length - thumb_cache_limit);

			for (var i = 0, il = removedIds.length; i < il; i++)
				delete bcs.names[removedIds[i]];
		}

		localStorage.bbb_thumb_cache = JSON.stringify(bcs);
	}

	function postDDL(target) {
		// Add direct downloads to thumbnails.
		if (!direct_downloads || (gLoc !== "search" && gLoc !== "pool" && gLoc !== "popular" && gLoc !== "favorites"))
			return;

		var posts = getPosts(target);

		for (var i = 0, il = posts.length; i < il; i++) {
			var post = posts[i];
			var postOrigUrl = post.getAttribute("data-file-url") || "";
			var postSampUrl = post.getAttribute("data-large-file-url") || "";
			var postUrl = (postSampUrl.indexOf(".webm") > -1 ? postSampUrl : postOrigUrl);
			var postId = post.getAttribute("data-id");
			var ddlLink = post.getElementsByClassName("bbb-ddl")[0];

			if (!ddlLink) { // If the direct download doesn't already exist, create it.
				ddlLink = document.createElement("a");
				ddlLink.innerHTML = "Direct Download";
				ddlLink.href = postUrl || "DDL unavailable for post " + postId + ".jpg";
				ddlLink.id = "bbb-ddl-" + postId;
				ddlLink.className = "bbb-ddl";
				post.appendChild(ddlLink);
			}
			else if (ddlLink.href.indexOf("/data/") < 0) // Fix existing links for hidden thumbs.
				ddlLink.href = postUrl || "DDL unavailable for post " + postId + ".jpg";
		}
	}

	function cleanLinks(target) {
		// Remove the query portion of thumbnail links.
		if (!clean_links)
			return;

		var targetContainer;
		var links;
		var link;
		var linkParent;

		if (target)
			targetContainer = target;
		else if (gLoc === "post")
			targetContainer = document.getElementById("content");
		else if (gLoc === "pool") {
			targetContainer = document.getElementById("a-show");
			targetContainer = (targetContainer ? targetContainer.getElementsByTagName("section")[0] : undefined);
		}
		else if (gLoc === "search" || gLoc === "favorites")
			targetContainer = document.getElementById("posts");
		else if (gLoc === "intro")
			targetContainer = document.getElementById("a-intro");

		if (targetContainer) {
			links = targetContainer.getElementsByTagName("a");

			for (var i = 0, il = links.length; i < il; i++) {
				link = links[i];
				linkParent = link.parentNode;

				if (linkParent.tagName === "ARTICLE" || linkParent.id.indexOf("nav-link-for-pool-") === 0)
					link.href = link.href.split("?", 1)[0];
			}
		}
	}

	function potentialHiddenPosts(mode, target) {
		// Check a normal thumbnail listing for possible hidden posts.
		var numPosts = getPosts(target).length;
		var hasPotential = false;

		if (mode === "search" || mode === "notes" || mode === "favorites") {
			var limit = getLimit();
			var numDesired;
			var numExpected;

			numExpected = (limit !== undefined ? limit : thumbnail_count_default);
			numDesired = (allowUserLimit() ? thumbnail_count : numExpected);

			if (numPosts !== numDesired || numPosts < numExpected)
				hasPotential = true;
		}
		else if (mode === "popular" || mode === "pool") {
			if (numPosts !== thumbnail_count_default)
				hasPotential = true;
		}
		else if (mode === "comments") {
			if (numPosts !== 5)
				hasPotential = true;
		}

		return hasPotential;
	}

	/* Other functions */
	function modifyPage() {
		if (noXML())
			return;

		if (gLoc === "post")
			delayMe(parsePost); // Delay is needed to force the script to pause and allow Danbooru to do whatever. It essentially mimics the async nature of the API call.
		else if (useAPI()) // API only features.
			searchJSON(gLoc);
		else // Alternate mode for features.
			searchPages(gLoc);
	}

	function formatInfo(post) {
		// Add information to/alter information in the post object.
		if (!post)
			return undefined;

		// Figure out the thumbnail classes.
		var flags = "";
		var thumbClass = "";

		if (post.is_deleted) {
			flags += " deleted";
			thumbClass += " post-status-deleted";
		}
		if (post.is_pending) {
			flags += " pending";
			thumbClass += " post-status-pending";
		}
		if (post.is_banned)
			flags += " banned";
		if (post.is_flagged) {
			flags += " flagged";
			thumbClass += " post-status-flagged";
		}
		if (post.has_children && (post.has_active_children || show_deleted))
			thumbClass += " post-status-has-children";
		if (post.parent_id)
			thumbClass += " post-status-has-parent";

		// Figure out sample image dimensions and ratio.
		post.sample_ratio = (post.image_width > 850 ? 850 / post.image_width : 1);
		post.sample_height = Math.round(post.image_height * post.sample_ratio);
		post.sample_width = Math.round(post.image_width * post.sample_ratio);

		// Hidden post fixes.
		post.md5 = post.md5 || "";
		post.file_ext = post.file_ext || "";
		post.preview_file_url = post.preview_file_url || bbbHiddenImg;
		post.large_file_url = post.large_file_url || "";
		post.file_url = post.file_url || "";

		// Potential null value fixes.
		post.approver_id = post.approver_id || "";
		post.parent_id = post.parent_id || "";
		post.pixiv_id = post.pixiv_id || "";

		post.flags = flags.bbbSpaceClean();
		post.thumb_class = thumbClass;

		return post;
	}

	function fixPaginator(target) {
		var paginator = (target || document).getElementsByClassName("paginator")[0];

		if (!paginator)
			return;

		var noPages = paginator.textContent.indexOf("Go back") > -1;

		if (gLoc === "search" || gLoc === "notes") {
			if (allowUserLimit()) {
				// Fix existing paginator with user's custom limit.
				var pageLinks = paginator.getElementsByTagName("a");
				var pageLink;

				for (var i = 0, il = pageLinks.length; i < il; i++) {
					pageLink = pageLinks[i];
					pageLink.href = updateUrlQuery(pageLink.href, {limit: thumbnail_count});
				}

				searchPages("paginator");
			}
			else if (noPages)
				searchPages("paginator");
		}
		else if (gLoc === "favorites") {
			if (allowUserLimit() || noPages) {
				paginator.innerHTML = "Loading..."; // Disable the paginator while fixing it.

				searchPages("paginator");
			}
		}
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

			noticeMsg = bbb.el.noticeMsg = getId("bbb-notice-msg", notice, "div");

			getId("bbb-notice-close", notice, "div").addEventListener("click", function() {
				notice.style.display = "none";
			}, false);

			document.body.appendChild(noticeContainer);
		}

		if (notice.style.display === "block" && /\S/.test(noticeMsg.textContent)) { // Insert new text at the top if the notice is already open.
			type = (type > 0 ? 0 : type); // Change the type to permanent if it was supposed to be temporary.
			noticeMsg.insertBefore(msg, noticeMsg.children[0]);
			window.clearTimeout(bbb.timers.bbbNotice);
		}
		else {
			noticeMsg.innerHTML = "";
			noticeMsg.appendChild(msg);
		}

		if (type > 0) {
			bbb.timers.bbbNotice = window.setTimeout(function() {
				notice.style.display = "none";
				bbb.timers.bbbNotice = 0;
			}, type * 1000);
		}

		notice.style.display = "block";
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
					post_comments: {txt: "Fixing hidden comments... ", count: 0},
					hidden: {txt: "Fixing hidden thumbnails... ", count: 0, queue: document.getElementsByClassName("bbb-hidden-thumb")}, // Hidden thumbnail message.
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

		if (msg.queue) { // If the xml requests are queued, use the xmlState as the current remaining value.
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

	function blacklistInit() {
		// Reset the blacklist with the account settings when logged in or script settings when logged out/using the override.
		var blacklistTags = (useAccount() ? getMeta("blacklisted-tags") : script_blacklisted_tags);
		var blacklistBox = document.getElementById("blacklist-box");
		var blacklistList = document.getElementById("blacklist-list");
		var blacklistedPosts = document.getElementsByClassName("blacklisted");

		// Reset sidebar blacklist.
		if (blacklistBox && blacklistList) {
			blacklistBox.style.display = "none";
			blacklistList.innerHTML = "";
		}
		else if (blacklist_add_bars) {
			var target;
			var before;

			if (gLoc === "pool") {
				target = document.getElementById("a-show");
				before = (target ? target.getElementsByTagName("section")[0] : undefined);
			}
			else if (gLoc === "pool_gallery") {
				target = document.getElementById("a-gallery");
				before = (target ? target.getElementsByTagName("section")[0] : undefined);
			}
			else if (gLoc === "notes" || gLoc === "comments") {
				target = document.getElementById("a-index");

				if (target)
					before = getPosts(target)[0] || target.getElementsByClassName("paginator")[0];
			}

			if (target && before && before.parentNode === target) {
				blacklistBox = document.createElement("div");
				blacklistBox.id = "blacklist-box";
				blacklistBox.className = "bbb-blacklist-box";
				blacklistBox.style.display = "none";
				blacklistBox.innerHTML = '<strong>Blacklisted: </strong> <ul id="blacklist-list"> </ul>';

				blacklistList = getId("blacklist-list", blacklistBox, "ul");

				target.insertBefore(blacklistBox, before);
			}
		}

		// Reset any blacklist info.
		if (bbb.blacklist.entries.length) {
			delete bbb.blacklist;
			bbb.blacklist = {entries: [], match_list: {}};
		}

		// Reset any blacklisted thumbnails.
		while (blacklistedPosts[0]) {
			var blacklistedPost = blacklistedPosts[0];
			blacklistedPost.className = blacklistedPost.className.replace(/\s?blacklisted(-active)?/ig, "");
		}

		// Check if there actually are any tags.
		if (!blacklistTags || !/[^\s,]/.test(blacklistTags))
			return;

		blacklistTags = blacklistTags.split(",");

		// Create the blacklist section.
		for (var i = 0, il = blacklistTags.length; i < il; i++) {
			var blacklistTag = blacklistTags[i].bbbSpaceClean();
			var blacklistSearch = createSearch(blacklistTag);

			if (blacklistSearch.length) {
				var newEntry = {active: true, tags:blacklistTag, search:blacklistSearch, matches: []};

				bbb.blacklist.entries.push(newEntry);

				if (blacklistList) {
					var blacklistItem = document.createElement("li");
					blacklistItem.title = blacklistTag;
					blacklistItem.style.display = "none";

					var blacklistLink = document.createElement("a");
					blacklistLink.innerHTML = (blacklistTag.length < 21 ? blacklistTag + " " : blacklistTag.substring(0, 20).bbbSpaceClean() + "... ");
					blacklistLink.addEventListener("click", function(entry) {
						return function(event) {
							if (event.button === 0) {
								var matches = entry.matches;
								var link = this;
								var post;
								var el;
								var i, il; // Loop variables.

								if (entry.active) {
									entry.active = false;
									link.className = "blacklisted-active";

									for (i = 0, il = matches.length; i < il; i++) {
										post = matches[i];
										el = document.getElementById(post.elId);
										bbb.blacklist.match_list[post.id].count--;

										if (!bbb.blacklist.match_list[post.id].count && bbb.blacklist.smart_view.override[post.id] !== false)
											el.className = el.className.replace(/\s?blacklisted-active/ig, "");
									}
								}
								else {
									entry.active = true;
									link.className = "";

									for (i = 0, il = matches.length; i < il; i++) {
										post = matches[i];
										el = document.getElementById(post.elId);
										bbb.blacklist.match_list[post.id].count++;

										if (bbb.blacklist.smart_view.override[post.id] !== true)
											el.className += " blacklisted-active";
									}
								}
							}
						};
					}(newEntry), false);
					blacklistItem.appendChild(blacklistLink);

					var blacklistCount = document.createElement("span");
					blacklistCount.innerHTML = "0";
					blacklistItem.appendChild(blacklistCount);

					blacklistList.appendChild(blacklistItem);
				}
			}
		}

		// Test all posts on the page for a match and set up the initial blacklist.
		blacklistUpdate();
	}

	function blacklistUpdate(target) {
		// Update the blacklists without resetting everything.
		if (!bbb.blacklist.entries.length)
			return;

		// Retrieve the necessary elements from the target element or current document.
		var blacklistBox = getId("blacklist-box", target) || document.getElementById("blacklist-box");
		var blacklistList = getId("blacklist-list", target) || document.getElementById("blacklist-list");
		var imgContainer = getId("image-container", target, "section");
		var posts = getPosts(target);

		var i, il; // Loop variables.

		// Test the image for a match when viewing a post.
		if (imgContainer) {
			var imgId = imgContainer.getAttribute("data-id");

			if (!blacklistSmartViewCheck(imgId))
				blacklistTest("imgContainer", imgContainer);
		}

		// Search the posts for matches.
		for (i = 0, il = posts.length; i < il; i++) {
			var post = posts[i];
			var postId = post.getAttribute("data-id");

			blacklistTest(postId, post);
		}

		// Update the blacklist sidebar section match counts and display any blacklist items that have a match.
		if (blacklistBox && blacklistList) {
			for (i = 0, il = bbb.blacklist.entries.length; i < il; i++) {
				var entryLength = bbb.blacklist.entries[i].matches.length;
				var item = blacklistList.getElementsByTagName("li")[i];

				if (entryLength) {
					blacklistBox.style.display = "block";
					item.style.display = "";
					item.getElementsByTagName("span")[0].innerHTML = entryLength;
				}
			}
		}
	}

	function blacklistTest(matchId, element) {
		// Test a post/image for a blacklist match and use the provided ID to store its info.
		var matchList = bbb.blacklist.match_list[matchId];

		if (typeof(matchList) === "undefined") { // Post hasn't been tested yet.
			matchList = bbb.blacklist.match_list[matchId] = {count: undefined, matches: []};

			for (var i = 0, il = bbb.blacklist.entries.length; i < il; i++) {
				var entry = bbb.blacklist.entries[i];

				if (thumbSearchMatch(element, entry.search)) {
					if (element.className.indexOf("blacklisted") < 0)
						element.className += " blacklisted";

					if (entry.active) {
						if (element.className.indexOf("blacklisted-active") < 0)
							element.className += " blacklisted-active";

						matchList.count = ++matchList.count || 1;
					}
					else
						matchList.count = matchList.count || 0;

					matchList.matches.push(entry.tags);
					entry.matches.push({id:matchId, elId:element.id});
				}
			}

			if (matchList.count === undefined) // No match.
				matchList.count = false;
			else if (element.id !== "image-container") { // Match found so prepare the thumbnail.
				if (blacklist_thumb_controls)
					blacklistPostControl(element, matchList);

				if (blacklist_smart_view)
					blacklistSmartView(element);
			}

		}
		else if (matchList.count !== false && element.className.indexOf("blacklisted") < 0) { // Post is already tested, but needs to be set up again.
			element.className += (matchList.count > 0 && bbb.blacklist.smart_view.override[matchId] !== true ? " blacklisted blacklisted-active" : " blacklisted");

			if (element.id !== "image-container") {
				if (blacklist_thumb_controls)
					blacklistPostControl(element, matchList);

				if (blacklist_smart_view)
					blacklistSmartView(element);
			}
		}
	}

	function blacklistPostControl(element, matchList) {
		var target = (gLoc === "comments" ? element.getElementsByClassName("preview")[0] : element );
		var id = element.getAttribute("data-id");
		var tip = bbb.el.blacklistTip;

		if (!tip) { // Create the tip if it doesn't exist.
			tip = bbb.el.blacklistTip = document.createElement("div");
			tip.id = "bbb-blacklist-tip";
			document.body.appendChild(tip);
		}

		if (target) {
			// Set up the tip events listeners for hiding and displaying it.
			target.addEventListener("click", function(event) {
				if (event.button !== 0 || event.ctrlKey || event.shiftKey)
					return;

				var target = event.target;
				var postContainer = element;
				var blacklistTip = bbb.el.blacklistTip;

				if (postContainer.className.indexOf("blacklisted-active") < 0 || (target.tagName === "A" && target.className.indexOf("bbb-thumb-link") < 0)) // If the thumb isn't currently hidden or a link that isn't the thumb link is clicked, allow the link click.
					return;

				if (blacklistTip.style.display !== "block")
					blacklistShowTip(event, '<b>Blacklist Matches:</b><ul><li>' + matchList.matches.join('</li><li>') + '</li></ul><div style="margin-top: 1em; text-align: center;"><a href="/posts/' + id + '">View post</a></div>', element);
				else {
					blacklistHideTip();
					postContainer.className = postContainer.className.replace(/\s?blacklisted-active/ig, "");
					bbb.blacklist.smart_view.override[id] = true;
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
				if (event.button === 0) {
					element.className += " blacklisted-active";
					bbb.blacklist.smart_view.override[id] = false;
				}
			}, false);
			target.appendChild(hide);
		}
	}

	function blacklistShowTip(event, text, element) {
		// Display the blacklist control tip.
		var x = event.pageX;
		var y = event.pageY;
		var tip = bbb.el.blacklistTip;

		formatTip(event, tip, text, x, y);

		if (blacklist_smart_view) {
			var viewLink = tip.getElementsByTagName("a")[0];

			if (viewLink) {
				viewLink.addEventListener("click", function(event) {
					if (event.button === 0)
						blacklistSmartViewUpdate(element);
				}, false);
			}
		}
	}

	function blacklistHideTip() {
		var tip = bbb.el.blacklistTip;

		if (tip)
			tip.removeAttribute("style");
	}

	function blacklistSmartView(element) {
		// Set up the smart view event listeners.
		var img = element.getElementsByTagName("img")[0];
		var link = (img ? img.parentNode : undefined);

		if (!link)
			return;

		// Normal left click support.
		link.addEventListener("click", function(event) {
			if (event.button === 0)
				blacklistSmartViewUpdate(element);
		}, false);

		// Right and middle button click support.
		link.addEventListener("mousedown", function(event) {
			if (event.button === 1)
				bbb.blacklist.smart_view.middle_target = link;
		}, false);
		link.addEventListener("mouseup", function(event) {
			if (event.button === 1 && bbb.blacklist.smart_view.middle_target === link)
				blacklistSmartViewUpdate(element);
			else if (event.button === 2)
				blacklistSmartViewUpdate(element);
		}, false);
	}

	function blacklistSmartViewUpdate(element) {
		// Update the blacklisted thumbnail info in the smart view object.
		var time = new Date().getTime();
		var id = element.getAttribute("data-id");
		var smartView;

		if (typeof(localStorage.bbb_smart_view) === "undefined") // Initialize the object if it doesn't exist.
			smartView = {last: time};
		else {
			smartView = JSON.parse(localStorage.bbb_smart_view);

			if (time - smartView.last > 60000) // Reset the object if it hasn't been changed within a minute.
				smartView = {last: time};
			else
				smartView.last = time; // Adjust the object.
		}

		if (element.className.indexOf("blacklisted-active") < 0)
			smartView[id] = time;
		else
			delete smartView[id];

		localStorage.bbb_smart_view = JSON.stringify(smartView);
	}

	function blacklistSmartViewCheck(id) {
		// Check whether to display the post during the blacklist init.
		var match = true;

		if (!blacklist_smart_view || typeof(localStorage.bbb_smart_view) === "undefined")
			match = false;
		else {
			var smartView = JSON.parse(localStorage.bbb_smart_view);
			var time = new Date().getTime();

			if (time - smartView.last > 60000) { // Delete the ids if the object hasn't been changed within a minute.
				localStorage.removeItem("bbb_smart_view");
				match = false;
			}
			else if (!smartView[id]) // Return false if the id isn't found.
				match = false;
			else if (time - smartView[id] > 60000) // Return false if the click is over a minute ago.
				match = false;
		}

		return match;
	}

	function thumbSearchMatch(post, searchArray) {
		// Take search objects and test them against a thumbnail's info.
		if (!searchArray.length)
			return false;

		var tags = post.getAttribute("data-tags");
		var flags = post.getAttribute("data-flags") || "active";
		var rating = " rating:" + post.getAttribute("data-rating");
		var status = " status:" + (flags === "flagged" ? flags + " active" : flags).replace(/\s/g, " status:");
		var user = " user:" + post.getAttribute("data-uploader").replace(/\s/g, "_").toLowerCase();
		var pools = " " + post.getAttribute("data-pools");
		var score = post.getAttribute("data-score");
		var favcount = post.getAttribute("data-fav-count");
		var id = post.getAttribute("data-id");
		var width = post.getAttribute("data-width");
		var height = post.getAttribute("data-height");
		var postInfo = {
			tags: tags.bbbSpacePad(),
			metatags:(rating + status + user + pools).bbbSpacePad(),
			score: Number(score),
			favcount: Number(favcount),
			id: Number(id),
			width: Number(width),
			height: Number(height)
		};
		var anyResult;
		var allResult;
		var searchTerm = "";
		var j, jl; // Loop variables.

		for (var i = 0, il = searchArray.length; i < il; i++) {
			var searchObject = searchArray[i];
			var all = searchObject.all;
			var any = searchObject.any;

			// Continue to the next matching rule if there are no tags to test.
			if (!any.total && !all.total)
				continue;

			if (any.total) {
				anyResult = false;

				// Loop until one positive match is found.
				for (j = 0, jl = any.includes.length; j < jl; j++) {
					searchTerm = any.includes[j];

					if (thumbTagMatch(postInfo, searchTerm)) {
						anyResult = true;
						break;
					}
				}

				// If we don't have a positive match yet, loop through the excludes.
				if (!anyResult) {
					for (j = 0, jl = any.excludes.length; j < jl; j++) {
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
				for (j = 0, jl = all.includes.length; j < jl; j++) {
					searchTerm = all.includes[j];

					if (!thumbTagMatch(postInfo, searchTerm)) {
						allResult = false;
						break;
					}
				}

				// If we still have a positive match, loop through the excludes.
				if (allResult) {
					for (j = 0, jl = all.excludes.length; j < jl; j++) {
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
		var targetTags;

		if (typeof(tag) === "string") { // Check regular tags and metatags with string values.
			targetTags = (isMetatag(tag) ? postInfo.metatags : postInfo.tags);

			if (targetTags.indexOf(tag) > -1)
				return true;
			else
				return false;
		}
		else if (tag instanceof RegExp) { // Check wildcard tags.
			var stringTag = String(tag); // Convert regex to a string and...
			stringTag = stringTag.substring(2, stringTag.length - 2); // ...remove the leading "/ " and trailing " /" before passing it for testing.
			targetTags = (isMetatag(stringTag) ? postInfo.metatags : postInfo.tags);

			return tag.test(targetTags);
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
		if (!/[^\s,]/.test(search))
			return [];

		var searchStrings = search.toLowerCase().replace(/\b(rating:[qes])\w+/g, "$1").split(",");
		var searches = [];

		// Sort through each matching rule.
		for (var i = 0, il = searchStrings.length; i < il; i++) {
			var searchString = searchStrings[i].split(" ");
			var searchObject = {
				all: {includes: [], excludes: [], total: 0},
				any: {includes: [], excludes: [], total: 0}
			};

			// Divide the tags into any and all sets with excluded and included tags.
			for (var j = 0, jl = searchString.length; j < jl; j++) {
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

				if (searchTerm.length < 1) // Stop if there is no actual tag.
					continue;

				mode = searchObject[primaryMode][secondaryMode];

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
				else if (typeof(searchTerm) === "string") // Add regular tags.
					mode.push(searchTerm.bbbSpacePad());
			}

			searchObject.all.total = searchObject.all.includes.length + searchObject.all.excludes.length;
			searchObject.any.total = searchObject.any.includes.length + searchObject.any.excludes.length;

			if (searchObject.all.total || searchObject.any.total)
				searches.push(searchObject);
		}

		return searches;
	}

	function trackNew() {
		var header = document.getElementById("top");

		if (!track_new || !header)
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
			var posts = getPosts();
			var firstPost = posts[0];

			if (mode === "init" && !info.viewed && !getVar("tags") && !getVar("page")) { // Initialize.
				if (firstPost) {
					info.viewed = Number(firstPost.getAttribute("data-id"));
					info.viewing = 1;
					saveSettings();
					bbbNotice("New post tracking initialized. Tracking will start with new posts after the current last image.", 10);
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
		var lastId = (lastPost ? Number(lastPost.getAttribute("data-id")) : null );

		if (!lastPost)
			bbbNotice("Unable to mark as viewed. No posts detected.", -1);
		else if (info.viewed >= lastId)
			bbbNotice("Unable to mark as viewed. Posts have already been marked.", -1);
		else {
			info.viewed = Number(lastPost.getAttribute("data-id"));
			info.viewing = 1;
			saveSettings();

			bbbNotice("Posts marked as viewed. Please wait while the pages are updated.", 0);
			location.href = "/posts?new_posts=list&tags=order:id_asc+id:>" + bbb.user.track_new_data.viewed + "&page=1&limit=" + limitNum;
		}
	}

	function customCSS() {
		var i; // Loop variable.
		var customStyles = document.createElement("style");
		customStyles.type = "text/css";

		var styles = '#bbb_menu {background-color: #FFFFFF; border: 1px solid #CCCCCC; box-shadow: 0 2px 2px rgba(0, 0, 0, 0.5); padding: 15px; position: fixed; top: 25px; left: 50%; z-index: 9001;}' +
		'#bbb_menu * {font-size: 14px; line-height: 16px; outline: 0px none; border: 0px none; margin: 0px; padding: 0px;}' + // Reset some base settings.
		'#bbb_menu h1 {font-size: 24px; line-height: 42px;}' +
		'#bbb_menu h2 {font-size: 16px; line-height: 25px;}' +
		'#bbb_menu input, #bbb_menu select, #bbb_menu textarea {border: #CCCCCC 1px solid;}' +
		'#bbb_menu input {height: 17px; padding: 1px 0px; margin-top: 4px; vertical-align: top;}' +
		'#bbb_menu input[type="checkbox"] {margin: 0px; vertical-align: middle; position: relative; bottom: 2px;}' +
		'#bbb_menu .bbb-general-input input[type="text"], #bbb_menu .bbb-general-input select {width: 175px;}' +
		'#bbb_menu select {height: 21px; margin-top: 4px; vertical-align: top;}' +
		'#bbb_menu option {padding: 0px 3px;}' +
		'#bbb_menu textarea {padding: 2px; resize: none;}' +
		'#bbb_menu ul, #bbb_menu ol {list-style: outside disc none; margin-top: 0px; margin-bottom: 0px; margin-left: 20px; display: block;}' +
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
		'#bbb_menu .bbb-backup-area {height: 300px; width: 896px; margin-top: 2px;}' +
		'#bbb_menu .bbb-blacklist-area {height: 300px; width: 896px; margin-top: 2px;}' +
		'#bbb_menu .bbb-edit-blocker {display: none; height: 100%; width: 100%; background-color: rgba(0, 0, 0, 0.33); position: fixed; top: 0px; left: 0px;}' +
		'#bbb_menu .bbb-edit-box {height: 500px; width: 800px; margin-left: -412px; margin-top: -262px; position: fixed; left: 50%; top: 50%; background-color: #FFFFFF; border: 2px solid #CCCCCC; padding: 10px; box-shadow: 0 2px 2px rgba(0, 0, 0, 0.5);}' +
		'#bbb_menu .bbb-edit-text {margin-bottom: 5px;}' +
		'#bbb_menu .bbb-edit-area {height: 429px; width: 794px; margin-bottom: 5px;}' +
		'#bbb_menu .bbb-edit-link {background-color: #FFFFFF; border: 1px solid #CCCCCC; display: inline-block; height: 19px; line-height: 19px; margin-left: -1px; padding: 0px 2px; margin-top: 4px; text-align: center; vertical-align: top;}' +
		'#bbb-expl {background-color: #CCCCCC; border: 1px solid #000000; display: none; font-size: 12px; padding: 5px; position: fixed; max-width: 420px; width: 420px; overflow: hidden; z-index: 9002; box-shadow: 0 2px 2px rgba(0, 0, 0, 0.5);}' +
		'#bbb-expl * {font-size: 12px;}' +
		'#bbb-expl tiphead {display: block; font-weight: bold; text-decoration: underline; font-size: 13px; margin-top: 12px;}' +
		'#bbb-status {background-color: rgba(255, 255, 255, 0.75); border: 1px solid rgba(204, 204, 204, 0.75); font-size: 12px; font-weight: bold; text-align: right; display: none; padding: 3px; position: fixed; bottom: 0px; right: 0px; z-index: 9002;}' +
		'#bbb-notice-container {position: fixed; top: 0.5em; left: 25%; width: 50%;}' +
		'#bbb-notice {padding: 3px; width: 100%; display: none; position: relative; z-index: 9002; border-radius: 2px; border: 1px solid #000000; background-color: #CCCCCC;}' +
		'#bbb-notice-msg {margin: 0px 25px 0px 55px; max-height: 200px; overflow: auto;}' +
		'#bbb-notice-msg .bbb-notice-msg-entry {border-bottom: solid 1px #000000; margin-bottom: 5px; padding-bottom: 5px;}' +
		'#bbb-notice-msg .bbb-notice-msg-entry:last-child {border-bottom: none 0px; margin-bottom: 0px; padding-bottom: 0px;}';

		// Provide a little extra space for listings that allow thumbnail_count.
		if (thumbnail_count && (gLoc === "search" || gLoc === "notes" || gLoc === "favorites")) {
			styles += 'div#page {margin: 0px 10px 0px 20px !important;}' +
			'section#content {padding: 0px !important;}';
		}

		// Border setup.
		var totalBorderWidth = (custom_tag_borders ? border_width * 2 + (border_spacing * 2 || 1) : border_width + border_spacing);
		var thumbMaxDim = 150 + totalBorderWidth * 2;
		var listingExtraSpace = (14 - totalBorderWidth * 2 > 2 ? 14 - totalBorderWidth * 2 : 2);
		var commentExtraSpace = 34 - totalBorderWidth * 2;
		var customBorderSpacing = (border_spacing || 1);
		var sbsl = status_borders.length;
		var statusBorderItem;

		styles += 'article.post-preview a.bbb-thumb-link, .post-preview div.preview a.bbb-thumb-link {display: inline-block}' +
		'article.post-preview {height: ' + thumbMaxDim + 'px !important; width: ' + thumbMaxDim + 'px !important; margin: 0px ' + listingExtraSpace + 'px ' + listingExtraSpace + 'px 0px !important;}' +
		'article.post-preview.pooled {height: ' + (thumbMaxDim + 60) + 'px !important;}' + // Pool gallery view thumb height adjustment.
		'#has-parent-relationship-preview article.post-preview, #has-children-relationship-preview article.post-preview {padding: 5px 5px 10px !important; width: auto !important; max-width: ' + thumbMaxDim + 'px !important; margin: 0px !important;}' +
		'article.post-preview a.bbb-thumb-link {line-height: 0px !important;}' +
		'.post-preview div.preview {height: ' + thumbMaxDim + 'px !important; width: ' + thumbMaxDim + 'px !important; margin-right: ' + commentExtraSpace + 'px !important;}' +
		'.post-preview div.preview a.bbb-thumb-link {line-height: 0px !important;}' +
		'.post-preview a.bbb-thumb-link img {border-width: ' + border_width + 'px !important; padding: ' + border_spacing + 'px !important;}' +
		'a.bbb-thumb-link.bbb-custom-tag {border-width: ' + border_width + 'px !important;}' +
		'article.post-preview:before, .post-preview div.preview:before {margin: ' + totalBorderWidth + 'px !important;}'; // Thumbnail icon overlay position adjustment.

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
			'article.post-preview a.bbb-thumb-link, .post-preview div.preview a.bbb-thumb-link {margin: ' + (border_width + customBorderSpacing) + 'px !important;}'; // Align one border images with two border images.

			for (i = 0; i < sbsl; i++) {
				statusBorderItem = status_borders[i];

				if (statusBorderItem.is_enabled)
					styles += '.post-preview.' + statusBorderItem.class_name + ' a.bbb-thumb-link.bbb-custom-tag {margin: 0px !important; padding: ' + customBorderSpacing + 'px !important;}' + // Remove margin alignment and add border padding for images that have status and custom tag borders.
					'.post-preview.' + statusBorderItem.class_name + ' a.bbb-thumb-link.bbb-custom-tag img {border-width: ' + border_width + 'px !important;}'; // Override the removal of the transparent border for images that have status borders and custom tag borders.
			}
		}

		// Hide sidebar.
		if (autohide_sidebar) {
			styles += 'div#page {margin: 0px 10px 0px 20px !important;}' +
			'aside#sidebar {background-color: transparent !important; border-width: 0px !important; height: 100% !important; width: 250px !important; position: fixed !important; left: -280px !important; overflow-y: hidden !important; padding: 0px 20px !important; top: 0px !important; z-index: 2001 !important;}' +
			'aside#sidebar.bbb-sidebar-show, aside#sidebar:hover {background-color: #FFFFFF !important; border-right: 1px solid #CCCCCC !important; left: 0px !important; overflow-y: auto !important; padding: 0px 15px !important;}' +
			'section#content {margin-left: 0px !important;}' +
			'.ui-autocomplete {z-index: 2002 !important;}';
		}

		// Additional blacklist bars.
		if (blacklist_add_bars)
			styles += '#blacklist-box.bbb-blacklist-box {margin-bottom: 1em;}' +
			'#blacklist-box.bbb-blacklist-box ul {display: inline;}' +
			'#blacklist-box.bbb-blacklist-box li {display: inline; margin-right: 1em;}' +
			'#blacklist-box.bbb-blacklist-box li a {color: #0073FF; cursor: pointer;}' +
			'#blacklist-box.bbb-blacklist-box li span {color: #AAAAAA;}';

		// Blacklist thumbnail display;
		if (blacklist_post_display === "removed")
			styles += 'div.post.post-preview.blacklisted {display: block !important;}' + // Comment listing override.
			'div.post.post-preview.blacklisted.blacklisted-active {display: none !important;}';
		else if (blacklist_post_display === "hidden")
			styles += 'article.post-preview.blacklisted.blacklisted-active {display: inline-block !important;}' +
			'div.post.post-preview.blacklisted {display: block !important;}' + // Comments.
			'article.post-preview.blacklisted.blacklisted-active a.bbb-thumb-link, div.post.post-preview.blacklisted.blacklisted-active div.preview {visibility: hidden !important;}';
		else if (blacklist_post_display === "replaced")
			styles += 'article.post-preview.blacklisted.blacklisted-active, div.post.post-preview.blacklisted.blacklisted-active {display: inline-block !important; background-position: ' + totalBorderWidth + 'px ' + totalBorderWidth + 'px !important; background-repeat: no-repeat !important; background-image: url(' + bbbBlacklistImg + ') !important;}' +
			'#has-parent-relationship-preview article.post-preview.blacklisted.blacklisted-active, #has-children-relationship-preview article.post-preview.blacklisted.blacklisted-active {background-position: ' + (totalBorderWidth + 5) + 'px ' + (totalBorderWidth + 5) + 'px !important;}' + // Account for relation notice padding.
			'article.post-preview.blacklisted.blacklisted-active a.bbb-thumb-link img, div.post.post-preview.blacklisted.blacklisted-active div.preview a.bbb-thumb-link img {opacity: 0.0 !important; height: 150px !important; width: 150px !important; border-width: 0px !important; padding: 0px !important;}' + // Remove all status border space.
			'article.post-preview.blacklisted.blacklisted-active a.bbb-thumb-link, div.post.post-preview.blacklisted.blacklisted-active div.preview a.bbb-thumb-link {padding: 0px !important; margin: ' + totalBorderWidth + 'px !important;}' + // Align no border thumbs with custom/single border thumbs.
			'article.post-preview.blacklisted.blacklisted-active a.bbb-thumb-link.bbb-custom-tag, div.post.post-preview.blacklisted.blacklisted-active div.preview a.bbb-thumb-link.bbb-custom-tag {padding: ' + border_spacing + 'px !important; margin: ' + (border_width + customBorderSpacing) + 'px !important;}' +
			'div.post.post-preview.blacklisted {display: block !important;}' +
			'div.post.post-preview.blacklisted.blacklisted-active {display: block !important;}';

		// Blacklist marking.
		if (blacklist_thumb_mark === "icon") {
			styles += 'article.post-preview:before, div.post.post-preview div.preview:before {content: none !important;}' + // Disable original Danbooru animated overlay.
			'article.post-preview.blacklisted a.bbb-thumb-link:after, div.post.post-preview.blacklisted div.preview a.bbb-thumb-link:after {content: " "; position: absolute; bottom: 0px; right: 0px; height: 20px; width: 20px; line-height: 20px; font-weight: bold; color: #FFFFFF; background: rgba(0, 0, 0, 0.5) url(\'' + bbbBlacklistIcon + '\');}' + // Create blacklist overlay.
			'article.post-preview[data-tags~="animated"] a.bbb-thumb-link:before, article.post-preview[data-file-ext="swf"] a.bbb-thumb-link:before, article.post-preview[data-file-ext="webm"] a.bbb-thumb-link:before, div.post.post-preview[data-tags~="animated"] div.preview a.bbb-thumb-link:before, div.post.post-preview[data-file-ext="swf"] div.preview a.bbb-thumb-link:before, div.post.post-preview[data-file-ext="webm"] div.preview a.bbb-thumb-link:before {content: "►"; position: absolute; width: 20px; height: 20px; color: #FFFFFF; background-color: rgba(0, 0, 0, 0.5); line-height: 20px; top: 0px; left: 0px;}' + // Recreate Danbooru animated overlay.
			'article.post-preview.blacklisted a.bbb-thumb-link:after, article.post-preview a.bbb-thumb-link:before, div.post.post-preview.blacklisted div.preview a.bbb-thumb-link:after, div.post.post-preview div.preview a.bbb-thumb-link:before {margin: ' + (border_width + border_spacing) + 'px;}' + // Margin applies to posts with no borders or only a status border.
			'article.post-preview.blacklisted a.bbb-thumb-link.bbb-custom-tag:after, article.post-preview a.bbb-thumb-link.bbb-custom-tag:before, div.post.post-preview.blacklisted div.preview a.bbb-thumb-link.bbb-custom-tag:after, div.post.post-preview div.preview a.bbb-thumb-link.bbb-custom-tag:before {margin: ' + border_spacing + 'px;}' + // Margin applies to posts with only a custom border.
			'article.post-preview.blacklisted.blacklisted-active a.bbb-thumb-link:after, article.post-preview.blacklisted.blacklisted-active a.bbb-thumb-link:before, div.post.post-preview.blacklisted.blacklisted-active div.preview a.bbb-thumb-link:after, div.post.post-preview.blacklisted.blacklisted-active div.preview a.bbb-thumb-link:before {content: none;}' + // Don't display when actively blacklisted.
			'article.post-preview a.bbb-thumb-link, div.post.post-preview div.preview a.bbb-thumb-link {position: relative;}'; // Allow the overlays to position relative to the link.


			for (i = 0; i < sbsl; i++) {
				statusBorderItem = status_borders[i];

				if (statusBorderItem.is_enabled)
					styles += 'article.post-preview.' + statusBorderItem.class_name + ' a.bbb-thumb-link.bbb-custom-tag:after, article.post-preview.' + statusBorderItem.class_name + ' a.bbb-thumb-link.bbb-custom-tag:before, div.post.post-preview.' + statusBorderItem.class_name + ' div.preview a.bbb-thumb-link.bbb-custom-tag:after, div.post.post-preview.' + statusBorderItem.class_name + ' div.preview a.bbb-thumb-link.bbb-custom-tag:before {margin: ' + (border_width + border_spacing + customBorderSpacing) + 'px !important}'; // Margin applies to posts with a status and custom border.
			}
		}
		else if (blacklist_thumb_mark === "highlight")
			styles += 'article.post-preview.blacklisted, div.post.post-preview.blacklisted div.preview {background-color: ' + blacklist_highlight_color + ' !important;}' +
			'article.post-preview.blacklisted.blacklisted-active, div.post.post-preview.blacklisted.blacklisted-active div.preview {background-color: transparent !important;}' +
			'article.post-preview.blacklisted.blacklisted-active.current-post {background-color: rgba(0, 0, 0, 0.1) !important}';

		// Blacklist post controls.
		if (blacklist_thumb_controls) {
			styles += '#bbb-blacklist-tip {background-color: #FFFFFF; border: 1px solid #000000; box-shadow: 0 2px 2px rgba(0, 0, 0, 0.5); display: none; font-size: 12px; line-height: 14px; padding: 5px; position: absolute; max-width: 420px; width: 420px; overflow: hidden; z-index: 9002;}' +
			'#bbb-blacklist-tip * {font-size: 12px; line-height: 14px;}' +
			'#bbb-blacklist-tip ul {list-style: outside disc none; margin-top: 0px; margin-bottom: 0px; margin-left: 15px;}' +
			'article.post-preview.blacklisted.blacklisted-active, div.post.post-preview.blacklisted.blacklisted-active div.preview, article.post-preview.blacklisted.blacklisted-active a.bbb-thumb-link, div.post.post-preview.blacklisted.blacklisted-active div.preview a.bbb-thumb-link {cursor: help !important;}' +
			'article.post-preview.blacklisted.blacklisted-active a, div.post.post-preview.blacklisted.blacklisted-active div.preview a {cursor: pointer !important;}' +
			'article.post-preview.blacklisted, div.post.post-preview.blacklisted div.preview {position: relative !important;}' +
			'article.post-preview.blacklisted:hover .bbb-close-circle, div.post.post-preview.blacklisted:hover div.preview .bbb-close-circle {display: block; position: absolute; top: 0px; right: 0px; z-index: 9002 ; cursor: pointer; background-image: url(\'/images/ui-icons_222222_256x240.png\'); background-repeat: no-repeat; background-color: #FFFFFF; background-position: -32px -192px; width: 16px; height: 16px; overflow: hidden;}' +
			'article.post-preview.blacklisted.blacklisted-active:hover .bbb-close-circle, div.post.post-preview.blacklisted.blacklisted-active:hover div.preview .bbb-close-circle {display: none;}' +
			'article.post-preview.blacklisted .bbb-close-circle, div.post.post-preview.blacklisted div.preview .bbb-close-circle {display: none;}';
		}

		if (direct_downloads)
			styles += ".bbb-ddl {display: none !important;}";

		if (post_tag_scrollbars)
			styles += "#tag-list ul {max-height: " + post_tag_scrollbars + "px !important; overflow-y: auto !important; font-size: 87.5% !important;}";

		if (search_tag_scrollbars)
			styles += "#tag-box ul {max-height: " + search_tag_scrollbars + "px !important; overflow-y: auto !important; font-size: 87.5% !important; margin-right: 2px !important;}";

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
			var commentGuide;

			if (gLoc === "post") {
				commentGuide = document.evaluate('//section[@id="comments"]/h2/a[contains(@href,"/wiki_pages")]/..', document, null, 9, null).singleNodeValue;

				if (commentGuide && commentGuide.textContent === "Before commenting, read the how to comment guide.")
					commentGuide.style.display = "none";
			}
			else if (gLoc === "comments") {
				commentGuide = document.evaluate('//div[@id="a-index"]/div/h2/a[contains(@href,"/wiki_pages")]/..', document, null, 9, null).singleNodeValue;

				if (commentGuide && commentGuide.textContent === "Before commenting, read the how to comment guide.")
					commentGuide.style.display = "none";
			}
		}

		if (hide_tag_notice && gLoc === "post") {
			var tagGuide = document.evaluate('//section[@id="edit"]/div/p/a[contains(@href,"/howto:tag")]/..', document, null, 9, null).singleNodeValue;

				if (tagGuide && tagGuide.textContent === "Before editing, read the how to tag guide.")
					tagGuide.style.display = "none";
		}

		if (hide_upload_notice && gLoc === "upload")
			styles += '#upload-guide-notice {display: none !important;}';

		if (hide_pool_notice && gLoc === "new_pool") {
			var poolGuide = document.evaluate('//div[@id="c-new"]/p/a[contains(@href,"/howto:pools")]/..', document, null, 9, null).singleNodeValue;

				if (poolGuide && poolGuide.textContent === "Before creating a pool, read the pool guidelines.")
					poolGuide.style.display = "none";
		}

		customStyles.innerHTML = styles;
		document.getElementsByTagName("head")[0].appendChild(customStyles);
	}

	function formatTip(event, element, text, x, y) {
		// Position + resize the tip and display it.
		var tip = element;
		var windowX = event.clientX;
		var windowY = event.clientY;
		var topOffset = 0;
		var leftOffset = 0;

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
		// Create hotkeys or override Danbooru's existing ones.
		document.addEventListener("keydown", function(event) {
			if (document.activeElement.type === "text" || document.activeElement.type === "textarea" || event.ctrlKey || event.shiftKey)
				return;

			var match = false;

			switch (event.keyCode) {
				case 86: // "v"
					if (gLoc === "post") {
						match = true;
						swapPost();
					}
					break;
			}

			if (match) {
				event.stopPropagation();
				event.preventDefault();
			}
		}, true);
	}

	function removeDanbHotkey(key) {
		// Remove a jQuery hotkey without a namespace from Danbooru.
		try {
			var jkp = $._data(document, "events").keypress;

			for (var i = 0, il = jkp.length; i < il; i++) {
				if (jkp[i].data.keys === key) {
					jkp[i].namespace = "bbbdiekey";
					$(document).unbind("keypress.bbbdiekey");
					i--;
					il--;
				}
			}
		}
		catch (error) {
			return;
		}
	}

	function fixLimit() {
		// Add the limit variable to link URLs that are not thumbnails.
		if (!thumbnail_count)
			return;

		var page = document.getElementById("page");
		var header = document.getElementById("top");
		var searchParent = document.getElementById("search-box") || document.getElementById("a-intro");
		var links;
		var link;
		var linkHref;
		var search;
		var tagsInput;
		var i, il; // Loop variables.

		if (page) {
			links = page.getElementsByTagName("a");

			for (i = 0, il = links.length; i < il; i++) {
				link = links[i];
				linkHref = link.getAttribute("href"); // Use getAttribute so that we get the exact value. "link.href" adds in the domain.

				if (linkHref && !/(?:page|limit)=/.test(linkHref) && (linkHref.indexOf("/posts?") === 0 || linkHref.indexOf("/favorites?") === 0))
					link.href = linkHref + "&limit=" + thumbnail_count;
			}
		}

		if (header) {
			links = header.getElementsByTagName("a");

			for (i = 0, il = links.length; i < il; i++) {
				link = links[i];
				linkHref = link.getAttribute("href");

				if (linkHref && (linkHref.indexOf("/posts") === 0 || linkHref === "/" || linkHref === "/notes?group_by=post" || linkHref === "/favorites"))
						link.href = updateUrlQuery(linkHref, {limit: thumbnail_count});
			}
		}

		// Fix the search.
		if (searchParent && (gLoc === "search" || gLoc === "post" || gLoc === "intro" || gLoc === "favorites")) {
			search = searchParent.getElementsByTagName("form")[0];

			if (search) {
				var limitInput = document.createElement("input");
				limitInput.name = "limit";
				limitInput.value = thumbnail_count;
				limitInput.type = "hidden";
				search.appendChild(limitInput);

				// Change the form action if on the favorites page. It uses "/favorites", but that just goes to the normal "/posts" search while stripping out the limit.
				search.action = "/posts";

				// Remove the user's default limit if the user tries to specify a limit value in the tags.
				tagsInput = document.getElementById("tags");

				if (tagsInput) {
					search.addEventListener("submit", function() {
						if (/\blimit:/.test(tagsInput.value))
							search.removeChild(limitInput);
						else if (limitInput.parentNode !== search)
							search.appendChild(limitInput);
					}, false);
				}
			}
		}
	}

	function getLimit(url) {
		// Retrieve the current limit value.
		var queryLimit = getVar("limit", url);
		var searchLimit = getTagVar("limit", url);
		var limit;

		if (queryLimit !== null && queryLimit !== undefined) {
			queryLimit = decodeURIComponent(queryLimit);

			if (queryLimit === "" || !/^\s*\d+/.test(queryLimit)) // No thumbnails show up when the limit is declared but left blank or has no number directly after any potential white space.
				limit = 0;
			else // The query limit finds its value in a manner similar to parseInt. Dump leading spaces and grab numbers until a non-numerical character is hit.
				limit = parseInt(queryLimit, 10);
		}
		else if (searchLimit !== null && searchLimit !== undefined) {
			searchLimit = decodeURIComponent(searchLimit);

			if (searchLimit === "") // No thumbnails show up when the limit is declared but left blank.
				limit = 0;
			else if (!bbbIsNum(searchLimit.replace(/\s/g, "")) || searchLimit.indexOf(".") > -1 || Number(searchLimit) < 0) // Non-numerical, negative, and decimal values are ignored.
				limit = thumbnail_count_default;
			else
				limit = Number(searchLimit);
		}

		return limit;
	}

	function arrowNav() {
		// Bind the arrow keys to Danbooru's page navigation.
		var paginator = document.getElementsByClassName("paginator")[0];

		if (!arrow_nav || (!paginator && gLoc !== "popular")) // If the paginator exists, arrow navigation should be applicable.
			return;

		document.addEventListener("keydown", function(event) {
			if (document.activeElement.type === "text" || document.activeElement.type === "textarea")
				return;

			var match = true;

			if (event.keyCode === 37) // Left arrow
				danbooruNav("prev");
			else if (event.keyCode === 39) // Right arrow
				danbooruNav("next");
			else
				match = false;

			if (match) {
				event.stopPropagation();
				event.preventDefault();
			}
		}, false);
	}

	function danbooruNav(dir) {
		// Determine the correct Danbooru page function and use it.
		if (gLoc === "popular") {
			if (dir === "prev")
				Danbooru.PostPopular.nav_prev();
			else if (dir === "next")
				Danbooru.PostPopular.nav_next();
		}
		else {
			if (dir === "prev")
				Danbooru.Paginator.prev_page();
			else if (dir === "next")
				Danbooru.Paginator.next_page();
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

	function fixedSidebar() {
		// Fix the scrollbar to the side of the window when it would normally scroll out of view.
		var sidebar = document.getElementById("sidebar");

		if (!sidebar)
			return;

		var docRect = document.documentElement.getBoundingClientRect();
		var sidebarRect = sidebar.getBoundingClientRect();
		var sidebarTop = sidebarRect.top - docRect.top;
		var sidebarLeft = sidebarRect.left - docRect.left;

		sidebar.style.top = "0px";
		sidebar.style.left = sidebarLeft + "px";

		window.addEventListener("scroll", function() {
			var scrolled = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

			if (scrolled > sidebarTop)
				sidebar.style.position = "fixed";
			else
				sidebar.style.position = "static";
		}, false);
	}

	function allowUserLimit() {
		// Allow use of the limit variable if it isn't currently set and we're on the first page.
		var page = Number(getVar("page")) || 1; // When set to 0 or undefined, the first page is shown.
		var limit = getLimit();

		if (thumbnail_count && page === 1 && limit === undefined)
			return true;
		else
			return false;
	}

	function currentLoc() {
		// Test the page URL to find which section of Danbooru the script is running on.
		if (/\/posts\/\d+/.test(gUrlPath))
			return "post";
		else if (/^\/(?:posts|$)/.test(gUrlPath))
			return "search";
		else if (/^\/notes\/?$/.test(gUrlPath) && gUrlQuery.indexOf("group_by=note") < 0)
			return "notes";
		else if (/^\/comments\/?$/.test(gUrlPath) && gUrlQuery.indexOf("group_by=comment") < 0)
			return "comments";
		else if (gUrlPath.indexOf("/explore/posts/popular") === 0)
			return "popular";
		else if (/\/pools\/\d+/.test(gUrlPath))
			return "pool";
		else if (/\/pools\/gallery/.test(gUrlPath))
			return "pool_gallery";
		else if (gUrlPath.indexOf("/favorites") === 0)
			return "favorites";
		else if (gUrlPath.indexOf("/uploads/new") === 0)
			return "upload";
		else if (gUrlPath.indexOf("/pools/new") === 0)
			return "new_pool";
		else if (/\/forum_topics\/\d+/.test(gUrlPath))
			return "topic";
		else if (gUrlPath.indexOf("/explore/posts/intro") === 0)
			return "intro";
		else
			return undefined;
	}

	function isLoggedIn() {
		if (getMeta("current-user-id") !== "")
			return true;
		else
			return false;
	}

	function noXML() {
		// Don't use XML requests on certain pages where it won't do any good.
		var limit = getLimit();
		var page = getVar("page");
		var result = false;

		if (gLoc === "search" || gLoc === "favorites") {
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
		// Determine whether any options that require the API are enabled.
		if ((show_loli || show_shota || show_toddlercon || show_deleted || show_banned) && (isLoggedIn() || !bypass_api))
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
		if (useAccount())
			return getMeta(metaName) === metaData;
		else
			return scriptSetting;
	}

	function searchAdd() {
		// Add + and - links to the sidebar tag list for modifying searches.
		var where = document.getElementById("tag-box") || document.getElementById("tag-list");

		if (!search_add || (gLoc !== "search" && gLoc !== "post") || !where)
			return;

		where = where.getElementsByTagName("li");

		var tag = getVar("tags");
		tag = (tag ? "+" + tag : "");

		for (var i = 0, il = where.length; i < il; i++) {
			var listItem = where[i];
			var newTag = getVar("tags", listItem.getElementsByClassName("search-tag")[0].href);

			listItem.innerHTML = '<a href="/posts?tags=-' + newTag + tag + '">-</a> <a href="/posts?tags=' + newTag + tag + '">+</a> ' + listItem.innerHTML;
		}
	}

	function getCookie() {
		// Return associative array with cookie values.
		var data = document.cookie;

		if(!data)
			return false;

		data = data.split("; ");
		var out = [];

		for (var i = 0, il = data.length; i < il; i++) {
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

	String.prototype.bbbTagClean = function() {
		// Remove extra commas along with leading, trailing, and multiple spaces.
		return this.replace(/[\s,]*,[\s,]*/g, ", ").replace(/[\s,]+$|^[\s,]+/g, "").replace(/\s+/g, " ");
	};

	function bbbIsNum(value) {
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

			if (tagName === "pool" || tagName === "user" || tagName === "status" || tagName === "rating")
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

	function updateUrlQuery(url, newQueries) {
		// Update the query portion of a URL. If a param isn't declared, it will be added. If it is, it will be updated.
		// Assigning undefined to a param that exists will remove it. Assigning null to a param that exists will completely remove its value. Assigning null to a new param will leave it with no assigned value.
		var urlParts = url.split(/[?#]/g, 2);
		var urlQuery = urlParts[1] || "";
		var queries = urlQuery.split("&");
		var query;
		var queryName;
		var queryValue;
		var queryObj = {};
		var i, il; // Loop variables.

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

		return urlParts[0] + "?" + urlQuery;
	}

	Number.prototype.bbbPadDate = function() {
		// Adds a leading "0" to single digit date/time values.
		var numString = String(this);

		if (numString.length === 1)
			numString = "0" + numString;

		return numString;
	};

	function timestamp(format) {
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


} // End of bbbScript.

if (document.body) {
	if (typeof(Danbooru) === "undefined") { // Load script into the page so it can access Danbooru's JavaScript in Chrome. Thanks to everyone else that has ever had this problem before... and Google which found the answers to their questions for me.
		var script = document.createElement('script');
		script.type = "text/javascript";
		script.appendChild(document.createTextNode('(' + bbbScript + ')();'));
		document.body.appendChild(script);
	}
	else // Operate normally.
		bbbScript();
}
