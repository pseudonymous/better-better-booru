// ==UserScript==
// @name           better_better_booru
// @author         otani, modified by Jawertae, A Pseudonymous Coder & Moebius Strip.
// @description    Several changes to make Danbooru much better. Including the viewing of loli/shota images on non-upgraded accounts. Modified to support arrow navigation on pools, improved loli/shota display controls, and more.
// @version        5.3
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
	var settings = {}; // Container for settings.
	var bbbImage = {}; // Container for image info.

	function Option(type, def, lbl, expl, optPropObject) {
		this.type = type;
		this.def = def; // Default.
		this.label = lbl;
		this.expl = expl; // Explanation.

		if (optPropObject) { // Additional properties provided in the form of an object.
			for (var i in optPropObject)
				this[i] = optPropObject[i];
		}
	}

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

	settings.options = {
		alternate_image_swap: new Option("checkbox", false, "Alternate Image Swap", "Switch between the sample and original image by clicking the image. Notes can be toggled by using the link in the sidebar options section."),
		arrow_nav: new Option("checkbox", false, "Arrow Navigation", "Allow the use of the left and right arrow keys to navigate pages. Has no effect on individual posts."),
		autohide_sidebar: new Option("dropdown", "none", "Auto-hide Sidebar", "Hide the sidebar for individual posts and/or searches until the mouse comes close to the left side of the window or the sidebar gains focus.<br><br>Tips:<br>By using Danbooru's keyboard shortcut for the letter \"Q\" to place focus on the search box, you can unhide the sidebar.<br><br>Use the thumbnail count option to get the most out of this feature on search listings.", {txtOptions:["Disabled:none", "Searches:search", "Posts:post", "Searches & Posts:post search"]}),
		child_border: new Option("text", "#CCCC00", "Child Border Color", "Set the thumbnail border color for child images."),
		clean_links: new Option("checkbox", false, "Clean Links", "Remove the extra information after the post ID in thumbnail links.<br><br>Note:</br>Enabling this option will disable Danbooru's search navigation and active pool detection for individual posts."),
		custom_status_borders: new Option("checkbox", false, "Custom Status Borders", "Override Danbooru's thumbnail colors for deleted, flagged, pending, parent, and child images."),
		deleted_border: new Option("text", "#000000", "Deleted Border Color", "Set the thumbnail border color for deleted images."),
		direct_downloads: new Option("checkbox", false, "Direct Downloads", "Allow download managers to download the images displayed in the search, pool, and popular listings."),
		flagged_border: new Option("text", "#FF0000", "Flagged Border Color", "Set the thumbnail border color for flagged images."),
		hide_advertisements: new Option("checkbox", false, "Hide Advertisements", "Hide the advertisements and free up some of the space set aside for them by adjusting the layout."),
		hide_ban_notice: new Option("checkbox", false, "Hide Ban Notice", "Hide the Danbooru ban notice."),
		hide_original_notice: new Option("checkbox", false, "Hide Original Notice", "Hide the Better Better Booru \"view original\" notice."),
		hide_sign_up_notice: new Option("checkbox", false, "Hide Sign Up Notice", "Hide the Danbooru account sign up notice."),
		hide_tos_notice: new Option("checkbox", false, "Hide TOS Notice", "Hide the Terms of Service agreement notice."),
		hide_upgrade_notice: new Option("checkbox", false, "Hide Upgrade Notice", "Hide the Danbooru upgrade account notice."),
		image_resize: new Option("checkbox", true, "Resize Images", "Shrink large images to fit the browser window when initially loading an individual post."),
		load_sample_first: new Option("checkbox", true, "Load Sample First", "Load sample images first when viewing an individual post."),
		loli_border: new Option("text", "#FFC0CB", "Loli Border Color", "Set the thumbnail border color for loli images."),
		loli_shota_borders: new Option("checkbox", true, "Loli & Shota Borders", "Add thumbnail borders to loli and shota images."),
		parent_border: new Option("text", "#00FF00", "Parent Border Color", "Set the thumbnail border color for parent images."),
		pending_border: new Option("text", "#0000FF", "Pending Border Color", "Set the thumbnail border color for pending images."),
		post_tag_titles: new Option("checkbox", false, "Post Tag Titles", "Change the page titles for individual posts to a full list of the post tags."),
		remove_tag_headers: new Option("checkbox", false, "Remove Tag Headers", "Remove the \"copyrights\", \"characters\", and \"artist\" headers from the sidebar tag list."),
		script_blacklisted_tags: new Option("text", "", "Blacklisted Tags", "Hide images and posts that match the specified tag(s).<br><br>Guidelines:<br>Matches can consist of a single tag or multiple tags. Each match must be separated by a comma and each tag in a match must be separated by a space.<br><br>Example:<br>To filter posts tagged with spoilers and posts tagged with blood AND death, the blacklist would normally look like the following case:<br>spoilers, blood death"),
		search_add: new Option("checkbox", true, "Search Add", "Add + and - links to the sidebar tag list that modify the current search by adding or excluding additional search terms."),
		shota_border: new Option("text", "#66CCFF", "Shota Border Color", "Set the thumbnail border color for shota images."),
		show_deleted: new Option("checkbox", false, "Show Deleted", "Display all deleted images in the search, pool, popular, and notes listings."),
		show_loli: new Option("checkbox", false, "Show Loli", "Display loli images in the search, pool, popular, comments, and notes listings."),
		show_shota: new Option("checkbox", false, "Show Shota", "Display shota images in the search, pool, popular, comments, and notes listings."),
		thumbnail_count: new Option("dropdown", 0, "Thumbnail Count", "Change the number of thumbnails that display in a search listing.", {txtOptions:["Disabled:0"], numRange:[1,200]})
	};
	settings.user = {};
	settings.inputs = {};
	settings.el = {}; // Menu elements.

	// Setting sections and ordering.
	settings.sections = {
		image: ["show_loli", "show_shota", "show_deleted", "direct_downloads", "thumbnail_count", "alternate_image_swap"],
		layout: ["hide_sign_up_notice", "hide_upgrade_notice", "hide_tos_notice", "hide_original_notice", "hide_advertisements", "hide_ban_notice"],
		sidebar: ["search_add", "remove_tag_headers", "autohide_sidebar"],
		borderTypes: ["loli_shota_borders", "custom_status_borders"],
		borderStyles: ["loli_border", "shota_border", "deleted_border", "flagged_border", "pending_border", "parent_border", "child_border"],
		loggedOut: ["image_resize", "load_sample_first", "script_blacklisted_tags"],
		misc: ["clean_links", "arrow_nav", "post_tag_titles"]
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

		var menuItems = menu.getElementsByTagName("li");
		menu.insertBefore(item, menuItems[menuItems.length - 1]);
	}

	function showSettings() {
		var menu_exists = settings.el.bbbMenu;

		if (menu_exists) {
			menu_exists.style.display = "block";
			return;
		}

		var menu = document.createElement("div");
		menu.id = "bbb_menu";
		menu.style.visibility = "hidden";
		settings.el.bbbMenu = menu;

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
		generalTab.onclick = function() {
			changeTab(this);
			return false;
		};
		tabBar.appendChild(generalTab);

		var borderTab = document.createElement("a");
		borderTab.name = "borders";
		borderTab.href = "#";
		borderTab.innerHTML = "Borders";
		borderTab.className = "bbb-tab";
		borderTab.onclick = function() {
			changeTab(this);
			return false;
		};
		tabBar.appendChild(borderTab);

		var scrollDiv = document.createElement("div");
		scrollDiv.className = "bbb-scroll-div";
		menu.appendChild(scrollDiv);

		var generalPage = document.createElement("div");
		scrollDiv.appendChild(generalPage);
		settings.el.generalPage = generalPage;

		createSection(settings.sections.image, generalPage, "Images & Thumbnails");
		createSection(settings.sections.sidebar, generalPage, "Tag Sidebar");
		createSection(settings.sections.misc, generalPage, "Misc.");
		createSection(settings.sections.layout, generalPage, "Layout");
		createSection(settings.sections.loggedOut, generalPage, "Logged Out Settings");

		var bordersPage = document.createElement("div");
		bordersPage.style.display = "none";
		scrollDiv.appendChild(bordersPage);
		settings.el.bordersPage = bordersPage;

		createSection(settings.sections.borderTypes, bordersPage, "Border Types");
		createSection(settings.sections.borderStyles, bordersPage, "Border Styles");

		var close = document.createElement("a");
		close.innerHTML = "Save & Close";
		close.href = "#";
		close.className = "bbb-button";
		close.style.marginRight = "15px";
		close.onclick = function() {
			settings.el.bbbMenu.style.display = "none";
			saveSettings();
			return false;
		};

		var cancel = document.createElement("a");
		cancel.innerHTML = "Cancel";
		cancel.href = "#";
		cancel.className = "bbb-button";
		cancel.onclick = function() {
			loadSettings();
			removeMenu();
			return false;
		};

		var reset = document.createElement("a");
		reset.innerHTML = "Reset to Defaults";
		reset.href = "#";
		reset.className = "bbb-button";
		reset.style.cssFloat = "right";
		reset.style.color = "#ff1100";
		reset.onclick = function() {
			loadDefaults();
			removeMenu();
			showSettings();
			return false;
		};

		menu.appendChild(close);
		menu.appendChild(cancel);
		menu.appendChild(reset);

		// Add menu to the DOM and manipulate the dimensions.
		document.body.appendChild(menu);

		var viewHeight = window.innerHeight;
		var scrollDivDiff = menu.clientHeight - scrollDiv.clientHeight;

		scrollDiv.style.maxHeight = viewHeight - getPadding(menu).height - scrollDivDiff - 25 + "px"; // Subtract 25 for the bottom "margin".
		scrollDiv.style.minWidth = 900 + scrollbarWidth() + 2 + "px"; // Should keep the potential scrollbar from intruding on the original drawn layout if I'm thinking about this correctly. Seems to work in practice anyway.

		var viewWidth = window.innerWidth;
		var menuWidth = menu.clientWidth;

		menu.style.left = (viewWidth - menuWidth) / 2 + "px";
		menu.style.visibility = "visible";
	}

	function createSection(settingList, target, title) {
		if (title) {
			var header = document.createElement("h3");
			header.innerHTML = title;
			header.className = "bbb-section-header";
			target.appendChild(header);
		}

		var sectionDiv = document.createElement("div");
		sectionDiv.className = "bbb-section-options";

		var sl = settingList.length;
		var halfway = (sl > 1 ? Math.ceil(sl / 2) : 0);

		var leftSide = document.createElement("div");
		leftSide.className = "bbb-section-options-left";
		sectionDiv.appendChild(leftSide);

		var rightSide = document.createElement("div");
		rightSide.className = "bbb-section-options-right";
		sectionDiv.appendChild(rightSide);

		var optionTarget = leftSide;

		for (var i = 0; i < sl; i++) {
			var settingName = settingList[i];

			if (halfway && i >= halfway)
					optionTarget = rightSide;

			createOption(settingName, optionTarget);
		}

		target.appendChild(sectionDiv);
	}

	function createOption(settingName, target) {
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

				item.onchange = function() {
					var selected = this.value;
					settings.user[settingName] = (/^-?\d+(\.\d+)?$/.test(selected) ? Number(selected) : selected);
				};
				break;
			case "checkbox":
				item = document.createElement("input");
				item.name = settingName;
				item.type = "checkbox";
				item.checked = userSetting;
				item.onclick = function() { settings.user[settingName] = this.checked; };
				break;
			case "text":
				item = document.createElement("input");
				item.name = settingName;
				item.type = "text";
				item.value = userSetting;
				item.onchange = function() { settings.user[settingName] = this.value; };
				break;
			case "number":
				item = document.createElement("input");
				item.name = settingName;
				item.type = "text";
				item.value = userSetting;
				item.onchange = function() { settings.user[settingName] = Number(this.value); };
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
		explLink.onclick = function(event) {
			showTip(event, settingName);
			return false;
		};
		explLink.onmouseout = function() {
			hideTip(settingName);
		};
		inputSpan.appendChild(explLink);

		var explTip = document.createElement("div");
		explTip.innerHTML = optionObject.expl;
		explTip.className = "bbb-expl";
		settings.el[settingName + "Expl"] = explTip;

		target.appendChild(label);
		target.appendChild(explTip);
	}

	function showTip(event, settingName) {
		var x = event.clientX;
		var y = event.clientY;
		var explTip = settings.el[settingName + "Expl"];

		explTip.style.visibility = "hidden";
		explTip.style.display = "block";

		var origHeight = explTip.clientHeight;
		var padding = getPadding(explTip).width;

		while (origHeight >= explTip.clientHeight && explTip.clientWidth > 15)
			explTip.style.width = explTip.clientWidth - padding - 2 + "px";

		explTip.style.width = explTip.clientWidth - padding + 2 + "px";

		explTip.style.left =  x - explTip.offsetWidth - 2 + "px";
		explTip.style.top =  y - explTip.offsetHeight - 2 + "px";
		explTip.style.visibility = "visible";
	}

	function hideTip(settingName) {
		settings.el[settingName + "Expl"].style.display = "none";
	}

	function changeTab(tab) {
		var activeTab = document.getElementsByClassName("bbb-active-tab")[0];

		if (tab == activeTab)
			return;

		activeTab.className = activeTab.className.replace(/bbb-active-tab/g, "");
		settings.el[activeTab.name + "Page"].style.display = "none";
		tab.className += " bbb-active-tab";
		settings.el[tab.name + "Page"].style.display = "block";
	}

	function removeMenu() {
		// Destroy the menu so that it gets rebuilt.
		var menu = settings.el.bbbMenu;

		menu.parentNode.removeChild(menu);
		settings.el = {};
		settings.inputs = {};
	}

	function loadSettings() {
		// Load stored settings.
		if (typeof(localStorage["bbb_settings"]) === "undefined") {
			if (typeof(localStorage["bbb_add_border"]) !== "undefined") {
				convertSettings("51");
				checkUser(settings.user, settings.options);
			}
			else
				loadDefaults();
		}
		else {
			settings.user = JSON.parse(localStorage["bbb_settings"]);
			checkUser(settings.user, settings.options);
		}
	}

	function loadDefaults() {
		settings.user = {};

		for (var i in settings.options) {
			settings.user[i] = settings.options[i].def;
		}
	}

	function checkUser(user, options) {
		// Verify the user has all the base settings and add them with their default values if they don't.
		for (var i in options) {
			if (typeof(user[i]) === "undefined")
				user[i] = options[i].def;
			else if (typeof(user[i]) === "object")
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

							for (var i = 0, sol = selectOptions.length; i < sol; i++) {
								var selectOption = selectOptions[i];

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
			case "51":
				old = {
					add_border: "loli_shota_borders",
					alternate_image_swap: "alternate_image_swap",
					child_border: "child_border",
					clean_links: "clean_links",
					deleted_border: "deleted_border",
					enable_arrow_nav: "arrow_nav",
					enable_custom_borders: "custom_status_borders",
					flagged_border: "flagged_border",
					hide_advertisements: "hide_advertisements",
					hide_original_notice: "hide_original_notice",
					hide_sign_up_notice: "hide_sign_up_notice",
					hide_tos_notice: "hide_tos_notice",
					hide_upgrade_notice: "hide_upgrade_notice",
					image_resize: "image_resize",
					load_sample_first: "load_sample_first",
					loli_border: "loli_border",
					parent_border: "parent_border",
					pending_border: "pending_border",
					post_tag_titles: "post_tag_titles",
					remove_tag_headers: "remove_tag_headers",
					script_blacklisted_tags: "script_blacklisted_tags",
					search_add: "search_add",
					shota_border: "shota_border",
					show_deleted: "show_deleted",
					show_loli: "show_loli",
					show_shota: "show_shota",
					thumbnail_count: "thumbnail_count"
				};

				function formatSetting(settingName) {
					var setting = localStorage["bbb_" + settingName];

					if (setting === "true")
						return true;
					else if (setting === "false")
						return false;
					else if (settingName === "thumbnail_count")
						return Number(setting);
					else
						return setting;
				}

				for (var i in old) {
					settings.user[old[i]] = formatSetting(i);
				}
				break;
		}
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
	var custom_status_borders = settings.user["custom_status_borders"]; // Change the border colors of flagged, parent, child, and pending posts. You may set the colors under "Set Border Colors".
	var clean_links = settings.user["clean_links"]; // Remove everything after the post ID in the thumbnail URLs. Enabling this disables search navigation for posts and active pool detection for posts.
	var autohide_sidebar = settings.user["autohide_sidebar"]; // Hide the sidebar for individual posts and searches until the mouse comes close to the left side of the window or the sidebar gains focus (ex: By pressing "Q" to focus on the search box).

	var hide_sign_up_notice = settings.user["hide_sign_up_notice"];
	var hide_upgrade_notice = settings.user["hide_upgrade_notice"];
	var hide_tos_notice = settings.user["hide_tos_notice"];
	var hide_original_notice = settings.user["hide_original_notice"]; // If you don't need the notice for switching back to the sample image, you can choose to hide it by default. You can also click the "X" on the notice to hide it by default via cookies.
	var hide_advertisements = settings.user["hide_advertisements"];
	var hide_ban_notice = settings.user["hide_ban_notice"];

	// Search
	var arrow_nav = settings.user["arrow_nav"]; // Allow the use of the left and right keys to navigate index pages. Doesn't work when input has focus.
	var search_add = settings.user["search_add"]; // Add the + and - shortcuts to the tag list for including or excluding search terms.
	var direct_downloads = settings.user["direct_downloads"]; // Allow download managers for all search listings.
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
	customCSS(); // Contains the portions related to ads and notices.

	if (autohide_sidebar.indexOf(gLoc) > -1)
		autohideSidebar();

	if (!isLoggedIn()) // Immediately apply script blacklist for logged out users.
		delayMe(blacklistInit);

	if (show_loli || show_shota || show_deleted || direct_downloads) // API only features.
		searchJSON(gLoc);
	else // Alternate mode for features.
		modifyPage(gLoc);

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

			if (numThumbs != numDesired || numThumbs < numExpected || direct_downloads)
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
						danbNotice("Better Better Booru: Error retrieving information. Access denied. You must be logged in to a Danbooru account to access the API for hidden image information and direct downloads.", true);
					else if (xmlhttp.status == 421)
						danbNotice("Better Better Booru: Error retrieving information. Your Danbooru API access is currently throttled. Please try again later.", true);
					else if (xmlhttp.status == 401)
						danbNotice("Better Better Booru: Error retrieving information. You must be logged in to a Danbooru account to access the API for hidden image information and direct downloads.", true);
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

			imgHeight = Number(object.height);
			imgWidth = Number(object.width);
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
			has_large: hasLarge
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
										var match = new RegExp('(<span class="category-)0("> <[^>]+>' + escapeRegEx(tag) + '<\/a> <\/span>)');

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

							childSpan.innerHTML = /<div id="posts">([\S\s]+?class="paginator"[\S\s]+?<\/div>[\S\s]+?)<\/div>/i.exec(xmlhttp.responseText)[1];

							document.getElementById("posts").innerHTML = childSpan.innerHTML;

							// Thumbnail classes and titles
							Danbooru.Post.initialize_titles();

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
			var thumbClass = "post-preview";

			// Don't display loli/shota if the user has opted so and skip to the next image.
			if ((!show_loli && /\bloli\b/.test(tags)) || (!show_shota && /\bshota\b/.test(tags)) || (!show_deleted && post.is_deleted)) {
				if (gLoc == "pool") {
					outId = new RegExp("\f,;" + imgId + "(?=<|\f|$)");
					out = out.replace(outId, "");
				}

				continue;
			}

			// Apply appropriate thumbnail borders.
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
			if (parent)
				thumbClass += " post-status-has-parent";

			// eek, huge line.
			thumb = '<article class="' + thumbClass + '" id="post_' + imgId + '" data-id="' + imgId + '" data-tags="' + tags + '" data-user="' + uploader + '" data-rating="' + rating + '" data-width="' + post.image_width + '" data-height="' + post.image_height + '" data-flags="' + flags + '" data-parent-id="' + parent + '" data-has-children="' + post.has_children + '" data-score="' + score + '"><a href="/posts/' + imgId + search + '"><img src="' + thumbnailUrl + '" alt="' + tags + '"></a></article>';

			if (direct_downloads)
				thumb += '<a style="display: none;" href="' + fileUrl + '">Direct Download</a></span>';

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
		bbbImage = xml; // Create a global copy. Doesn't serve any purpose at the moment.

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
			var ratio = (width > 850 ? 850 / width : 1);
			var sampUrl = "/data/sample/sample-" + md5 + ".jpg";
			var sampHeight = Math.round(height * ratio);
			var sampWidth = Math.round(width * ratio);
			var newWidth = 0;
			var newHeight = 0;
			var newUrl = "";
			var altTxt = "";
			var favCount = post.fav_count;
			var flags = "";
			var hasChildren = post.has_children;
			var parent = (post.parent_id !== null ? post.parent_id : "");
			var rating = post.rating;
			var score = post.score;
			var tags = post.tag_string;
			var uploader = post.uploader_name;

			if (post.is_deleted)
				flags = "deleted";
			else if (post.is_flagged)
				flags = "flagged";
			else if (post.is_pending)
				flags = "pending";

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

				container.innerHTML = '<div id="note-container"></div> <img alt="' + altTxt + '" data-fav-count="' + favCount + '" data-flags="' + flags + '" data-has-children="' + hasChildren + '" data-parent-id="' + parent + '" data-large-height="' + sampHeight + '" data-large-width="' + sampWidth + '" data-original-height="' + height + '" data-original-width="' + width + '" data-rating="' + rating + '" data-score="' + score + '" data-tags="' + tags + '" data-uploader="' + uploader + '" height="' + newHeight + '" width="' + newWidth + '" id="image" src="' + newUrl + '" /> <img src="about:blank" height="1" width="1" id="bbb-loader" style="position: absolute; right: 0px; top: 0px; display: none;"/>';
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
								bbbImage.resized = false;
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
								bbbImage.resized = false;
								img.style.height = sampHeight + "px";
								img.style.width = sampWidth + "px";
							}
						}

						swapInit = false;
						Danbooru.Note.Box.scale_all();
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

					options.innerHTML = '<h1>Options</h1><ul><li><a href="#" id="image-resize-to-window-link">Resize to window</a></li>' + (alternate_image_swap ? '<li><a href="#" id="listnotetoggle">Toggle notes</a></li>' : '') + '<li><a href="http://danbooru.iqdb.org/db-search.php?url=http://danbooru.donmai.us/ssd/data/preview/' + md5 + '.jpg">Find similar</a></li></ul>';
					history.parentNode.insertBefore(options, history);
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

				// Resize image setup
				var resizeLink = document.getElementById("image-resize-to-window-link");
				var resizeLinkClone = resizeLink.cloneNode(true);
				resizeLinkClone.addEventListener("click", function(event) {resizeImage(); event.preventDefault();}, false);
				resizeLink.parentNode.appendChild(resizeLinkClone);
				resizeLink.parentNode.removeChild(resizeLink);

				if (checkSetting("always-resize-images", "true", image_resize))
					resizeImage();
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
				var thumbClass = "post post-preview";

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
				if (parent)
					thumbClass += " post-status-has-parent";

				for (var j = 0, tll = tagLinks.length; j < tll; j++)
					tagLinks[j] = '<span class="category-0"> <a href="/posts?tags=' + encodeURIComponent(tagLinks[j]) + '">' + tagLinks[j].replace(/_/g, " ") + '</a> </span> ';

				tagsLinks = tagLinks.join(" ");

				// Create the new post.
				var childSpan = document.createElement("span");

				childSpan.innerHTML = '<div class="' + thumbClass + '" data-tags="' + post.tag_string + '" data-uploader="' + post.uploader_name + '" data-rating="' + post.rating + '" data-flags="' + flags + '" data-score="' + post.score + '" data-parent-id="' + parent + '" data-has-children="' + post.has_children + '" data-id="' + post.id + '" data-width="' + post.image_width + '" data-height="' + post.image_height + '"> <div class="preview"> <a href="/posts/' + post.id + '"> <img alt="' + post.md5 + '" src="/ssd/data/preview/' + post.md5 + '.jpg" /> </a> </div> <div class="comments-for-post" data-post-id="' + post.id + '"> <div class="header"> <div class="row"> <span class="info"> <strong>Date</strong> <time datetime="' + post.created_at + '" title="' + post.created_at.replace(/(.+)T(.+)-(.+)/, "$1 $2 -$3") + '">' + post.created_at.replace(/(.+)T(.+):\d+-.+/, "$1 $2") + '</time> </span> <span class="info"> <strong>User</strong> <a href="/users/' + post.uploader_id + '">' + post.uploader_name + '</a> </span> <span class="info"> <strong>Rating</strong> ' + post.rating + ' </span> <span class="info"> <strong>Score</strong> <span> <span id="score-for-post-' + post.id + '">' + post.score + '</span> </span> </span> </div> <div class="row list-of-tags"> <strong>Tags</strong>' + tagsLinks + '</div> </div> </div> <div class="clearfix"></div> </div>';

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

		if (!isLoggedIn() && /\S/.test(script_blacklisted_tags)) { // Load the script blacklist if not logged in.
			var blacklistTags = script_blacklisted_tags.replace(/\s+/g, " ").replace(/(rating:[qes])\w+/, "$1").toLowerCase().split(",");

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
		var image = document.getElementById("image");
		var imageContainer = document.getElementById("image-container");
		var availableWidth = imageContainer.clientWidth;
		var imgWidth = image.clientWidth;
		var imgHeight = image.clientHeight;
		var ratio = availableWidth / imgWidth;

		if (!bbbImage.resized && imgWidth > availableWidth) {
			image.style.width = imgWidth * ratio + "px";
			image.style.height = imgHeight * ratio + "px";
			bbbImage.resized = true;
		}
		else {
			image.style.width = image.getAttribute("width") + "px"; // Was NOT expecting image.width to return the current width (css style width) and not the width attribute's value here...
			image.style.height = image.getAttribute("height") + "px";
			bbbImage.resized = false;
		}

		Danbooru.Note.Box.scale_all();
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

	function autohideSidebar() {
		var sidebar = document.getElementById("sidebar");

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

	function customCSS() {
		var customStyles = document.createElement("style");
		customStyles.type = "text/css";

		var styles = "#bbb_menu {background-color: #FFFFFF; border: 1px solid #CCCCCC; box-shadow: 0 2px 2px rgba(0, 0, 0, 0.5); font-size: 14px; padding: 15px; position: fixed; top: 25px; z-index: 9001;}" +
		"#bbb_menu a:focus {outline: none;}" +
		".bbb-scroll-div {border: 1px solid #CCCCCC; margin: -1px 0px 15px 0px; padding: 5px; overflow-y: auto;}" +
		".bbb-section-options {margin: 5px 0px;}" +
		".bbb-section-options-left, .bbb-section-options-right {display: inline-block; vertical-align: top; width: 435px;}" +
		".bbb-section-options-left {border-right: 1px solid #CCCCCC; margin-right: 15px; padding-right: 15px;}" +
		".bbb-section-header {border-bottom: 2px solid #CCCCCC; padding-top: 10px; width: 750px;}" +
		".bbb-label {display: block; height: 34px; padding: 0px 5px; overflow: hidden;}" + // Overflow is used here to correct bbb-label-input float problems.
		".bbb-label:hover {background-color: #EEEEEE;}" +
		".bbb-label * {vertical-align: middle;}" +
		".bbb-label > span {display: inline-block; line-height: 34px;}" +
		// ".bbb-label-text {}" +
		".bbb-label-input {float: right;}" +
		".bbb-expl {background-color: #CCCCCC; border: 1px solid #000000; display: none; padding: 5px; position: fixed; width: 400px;}" +
		".bbb-expl-link {font-size: 12px; font-weight: bold; margin-left: 5px; padding: 2px;}" +
		".bbb-button {border: 1px solid #CCCCCC; display: inline-block; padding: 5px;}" +
		".bbb-tab {display: inline-block; padding: 5px; border: 1px solid #CCCCCC; margin-right: -1px;}" +
		".bbb-active-tab {background-color: #FFFFFF; border-bottom-width: 0px; padding-bottom: 6px;}";

		// Hide sidebar.
		if (autohide_sidebar.indexOf(gLoc) > -1)
			styles += 'div#page {margin: 0px 15px !important;}' +
			'aside#sidebar {background-color: transparent !important; border-width: 0px !important; height: 100% !important; width: 250px !important; position: fixed !important; left: -280px !important; overflow-y: hidden !important; padding: 0px 20px !important; top: 0px !important; z-index: 2001 !important;}' +
			'aside#sidebar.bbb-sidebar-show, aside#sidebar:hover {background-color: #FFFFFF !important; border-right: 1px solid #CCCCCC !important; left: 0px !important; overflow-y: auto !important; padding: 0px 15px !important;}' +
			'section#content {margin-left: 0px !important;}' +
			'.bbb-unhide {height: 100%; width: 15px; position: fixed; left: 0px; top: 0px; z-index: 2000;}';

		// Borders override each other in this order: Loli > Shota > Deleted > Flagged > Pending > Child > Parent
		if (custom_status_borders)
			styles += ".post-preview.post-status-has-children img{border-color:" + parent_border + " !important;}" +
			".post-preview.post-status-has-parent img{border-color:" + child_border + " !important;}" +
			".post-preview.post-status-pending img{border-color:" + pending_border + " !important;}" +
			".post-preview.post-status-flagged img{border-color:" + flagged_border + " !important;}" +
			".post-preview.post-status-deleted img{border-color:" + deleted_border + " !important;}";

		if (loli_shota_borders)
			styles += '.post-preview[data-tags~="shota"] img{border: 2px solid ' + shota_border + ' !important;}' +
			'.post-preview[data-tags~="loli"] img{border: 2px solid ' + loli_border + ' !important;}';

		if (hide_advertisements)
			styles += '#content.with-ads {margin-right: 0em !important;}' +
			'img[alt="Advertisement"] {display: none !important;}' +
			'img[alt="Your Ad Here"] {display: none !important;}' +
			'iframe {display: none !important;}';

		if (hide_tos_notice)
			styles += '#tos-notice {display: none !important;}';

		if (hide_sign_up_notice)
			styles += '#sign-up-notice {display: none !important;}';

		if (hide_upgrade_notice)
			styles += '#upgrade-account-notice {display: none !important;}';

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

	function getPadding(el) {
		var clone = el.cloneNode(false);
		clone.style.width = "0px";
		clone.style.height = "0px";
		clone.style.visibility = "hidden";
		clone.style.position = "absolute";
		clone.style.top = "0px";
		clone.style.left = "0px";
		document.body.appendChild(clone);
		var paddingWidth = clone.clientWidth;
		var paddingHeight = clone.clientHeight;
		document.body.removeChild(clone);
		return {width: paddingWidth, height: paddingHeight};
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
