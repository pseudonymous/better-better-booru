Changelog
----------
* Version 7.3:
  * Added a "video volume" option for adjusting the starting volume of video posts.
  * Added a "disable tagged filenames" option to allow filename control for logged out users and manual (as needed) correction for logged in users.
  * Added a "video playback" blacklist option to allow control over the play/pause state of video posts.
  * Added a "hide hidden posts notice" option for hiding the Danbooru notice about hidden posts and gold accounts.
  * Added an "erase settings" section to the preferences tab for easily deleting BBB information.
  * Removed the "move save search" option since the save search button has been replaced by a link in the "+" search button.
  * Updated to support Danbooru's changes to the "Notes" section of the site.
  * Updated the "quick search" option to support Danbooru's autocomplete changes.
  * Updated the "auto-hide sidebar" and "fixed sidebar" options to make them compatible with the "+" search button.
  * Updated to add back support for Danbooru's post to post hotkey navigation for searches while logged out.
  * Updated the methods for saving information so that settings can persist across all Danbooru domains and during private browsing.
  * Fixed various random search issues related to hidden posts.
* Version 7.2.5:
  * Updated to support Danbooru displaying the image description below images.
  * Fixed the "show deleted" option's compatibility with the "status:" metatag.
  * Fixed various problems when using the "order:random" metatag.
  * Fixed various browser caching problems.
* Version 7.2.4:
  * Fixed the "direct downloads" option not excluding posts filtered out by the blacklist/quick search.
  * Fixed the "post drag scrolling" option being broken by the translation mode notice link for turning translation mode off.
  * Fixed the translation mode hotkey breaking while using the "disable embedded notes" option.
  * Fixed the translation mode hotkey being available when it shouldn't be.
  * Fixed various problems where middle and right click were causing unexpected and/or undesirable effects.
* Version 7.2.3:
  * Fixed the retry link for retrieving hidden thumbnails.
* Version 7.2.2:
  * Updated to support Danbooru's JavaScript changing to asynchronous.
  * Updated to support Danbooru's blacklist style reset.
* Version 7.2.1:
  * Updated to support Danbooru's blacklist style changes.
* Version 7.2:
  * Added a "session toggle" blacklist option for controlling whether individual blacklist entries remain toggled off across pages.
  * Updated the "post display" blacklist option with a "disabled" setting to allow the use of Danbooru's default blacklist style and changed "removed" to a standalone setting.
  * Updated the "thumbnail info" option so that it is hidden on blacklisted posts.
  * Updated to support Danbooru's blacklist style changes.
  * Updated to support Danbooru's slider changes for ugoira posts.
  * Updated to support Danbooru not looping posts with sound.
  * Updated to prevent notes and blacklists from being unnecessarily loaded by Danbooru.
  * Fixed loading problems caused by full browser storage.
  * Fixed audio issues on video posts with sound.
  * Fixed the icon overlay position for animated/video posts.
  * Fixed the "search add" option's "toggle" setting not responding to autocomplete selections made by mouse.
  * Fixed the "thumbnail controls" blacklist option not working in the comments section when using the "post display" blacklist option's "hidden" setting.
  * Fixed instances of tab/window specific settings carrying over to new tabs/windows (endless pages session toggle, quick search pinned status).
  * Fixed the timestamp not using leading zeros properly.
* Version 7.1:
  * Added an "additional bars" blacklist option for adding a blacklist bar to thumbnail sections without it.
  * Updated to support MP4 posts.
  * Updated the "fixed paginator", "new tab/window", and "pool" metatag help notes.
  * Updated the "thumbnail info cache limit" with a reduced maximum limit.
* Version 7.0:
  * Added a "move save search" layout option for moving the "save this search" button to the sidebar's related section.
  * Added a "page counter" option for including a page counter and "go to page" input near the top of listing pages.
  * Added a "disable embedded notes" option for forcing notes to display with the original style.
  * Added a "quick search" option for sieving through thumbnails.
  * Added a "collapsible sidebar" layout option for minimizing sidebar sections.
  * Added a "thumbnail info" option for displaying the score, favorite count, and rating for a post with its thumbnail.
  * Added a "comment score" option for displaying scores on comments.
  * Added a "new tab/window" option for forcing post links in thumbnail listings to open in a new window/tab.
  * Added a "fixed sidebar" layout option for fixing the sidebar to the side of the window viewport.
  * Added a "fixed paginator" layout option for fixing the paginator to the bottom of the window viewport.
  * Added a "search tag scrollbar" layout option for the tag section in searches.
  * Added an "image swap mode" option for setting how images are changed between the original and sample versions.
  * Added "endless pages" support for various thumbnail listings along with multiple tweaking options.
  * Added a layout tab and moved the notice and sidebar options to it.
  * Added a blacklist tab with several new customization options and moved the blacklist to it.
  * Added some hotkeys and a hotkey section to the help tab.
  * Added thumbnail matching rule support for the "parent" and "child" metatags and expanded support for the "pool" metatag.
  * Added thumbnail matching rule support for tag grouping/nesting.
  * Updated the "auto-scroll" option with a new option for only scrolling past the header and made it not scroll on return visits to pages that are already scrolled.
  * Updated the "search add" option to make it resemble Danbooru's links and provide options for removing the links or adding a link for modifying the search box.
  * Updated the resize post links with a new minimal preferences option that places all the resize links on one line.
  * Updated to support fixing the direct post links (size, download) on hidden posts.
  * Updated to support showing hidden thumbnails in the comment search and on individually linked comments.
  * Updated for better Safebooru compatibility.
  * Updated to support favorite groups.
  * Updated to support the popular view section (Currently disabled since view counts were removed).
  * Updated to support the Danbooru mode menu.
  * Updated to always display animated GIFs and PNGs with their full/original versions and not use sample images.
  * Updated to support Danbooru's blacklist changes.
  * Replaced the "override account" option with separate options for overriding Danbooru's resize, sample, and blacklist settings.
  * Fixed the pausing of video content when dragging it with the "drag scroll" option.
  * Fixed a problem where previous page content would end up displaying on the current page.
  * Fixed an overflow issue with the sidebar layout options.
  * Fixed the insertion of links for the options menu and new post tracking by making it more accurate.
  * Fixed a problem with revealing hidden thumbnails on posts with parent and child notices.
  * Fixed the preview and edit buttons for hidden posts in Danbooru's comments section.
  * Script reorganization and overhaul.
* Version 6.5.4:
  * Updated to support the hotkey for swapping between the original and sample on "ugoira" posts.
  * Fixed the auto-scroll, blacklist, and parent/child notice's hidden thumbnail support on flash posts.
  * Fixed the "view sample" link on "ugoira" posts for users viewing the original by default.
  * Fixed the ignoring of a logged in user's account setting for viewing the sample or original by default on "ugoira" posts.
  * Fixed a blacklist error for logged in users with blank blacklists.
* Version 6.5.3:
  * Fixed the blacklist section so that it properly updates for hidden images.
* Version 6.5.2:
  * Fixed a conflict between the "alternate image swap" option and translation mode.
* Version 6.5.1:
  * Fixed the "alternate image swap" option.
* Version 6.5:
  * Added support for the favorites listing.
  * Updated to support Danbooru's ugoira changes with added support for note viewing on the sample webm versions and an additional "view sample" link for switching from the original ugoira versions.
  * Fixed a potential problem with thumbnails where the "tags" query value would end up set as "undefined".
  * Fixed the random post hotkey for logged out users.
  * Fixed an issue with wildcards and metatags for thumbnail matching rules.
  * Fixed the detection of the notes search as a notes listing.
  * Fixed post resizing for hidden blacklisted posts.
* Version 6.4:
  * Updated to support "ugoira" animation posts in their native format.
* Version 6.3.2:
  * Updated to support "ugoira" animation posts with a temporary workaround.
* Version 6.3.1:
  * Updated to support showing banned posts in the comments section.
* Version 6.3:
  * Added a "show resized notice" option for allowing more control over the resized notice bar.
  * Added a "border spacing" option for controlling the amount of blank space between status borders and images and between custom tag borders and status borders.
  * Added a "minimize status notices" option for freeing up all the space used by status notices while still allowing access to them.
  * Added a "show banned" option to support the separation of banned posts from deleted posts as a new post status.
  * Added a "view original/sample" link to the options section on individual posts with a sample and original image.
  * Added the "random post" link to the options section on individual posts for logged out users.
  * Updated to support webm video posts.
  * Updated to support hidden posts in parent/child notices.
  * Updated to support and use additional data added to Danbooru's images.
  * Updated to support Danbooru's new hotkey for swapping between original and sample images.
  * Updated to support the "limit:" tag in searches.
  * Updated to allow the options section on flash and download posts for logged out users.
  * Updated the image resizing to allow for resizing by height.
  * Updated the blacklist to allow the use of the "thumbnail matching rules" under the help tab and provide flexibility for customization in the future.
  * Updated the resize to window links so that they can work on flash and webm videos.
  * Updated the image swapping to allow the cancelling of a swap between an original and sample image by sending the swap request a second time while still loading.
  * Updated the "direct downloads" option so that it no longer requires requesting information from Danbooru's API.
  * Updated the "single color borders" option so that it can be used on status borders without having to use "custom status borders".
  * Updated the "create backup page" option to a simpler and more compatible method.
  * Fixed the loading message for images that repeatedly fail to load.
  * Fixed the image resizing for initial images when switching to the sample/original image before the initial image has finished loading.
  * Fixed the notice "close" link overlapping with the notice text when displaying long messages.
  * Fixed a potential issue where "show toddlercon" wouldn't work.
  * Fixed a potential issue with downgrading to older versions.
  * Replaced all Userscripts.org information with Greasy Fork information.
  * Moved the "thumbnail info cache limit" option to the preferences tab.
  * Removed the "hide original notice" option that's been replaced by the "resized notice display" option.
  * Removed the "hide advertisements" option due to the removal of ads and prevalence of ad blockers.
* Version 6.2.2:
  * Updated to support the new thumbnail paths on Danbooru.
* Version 6.2.1:
  * Fixed a compatibility problem when detecting Danbooru's JavaScript.
* Version 6.2:
  * Added a "hide comment guide notice" option for hiding the "how to comment guide" notice.
  * Added a "hide tag guide notice" option for hiding the "how to tag guide" notice.
  * Added a "hide upload guide notice" option for hiding the how to "how to upload guide" notice.
  * Added a "hide pool guide notice" option for hiding the "pool guidelines"  notice.
  * Added a namespace to the script to better manage updates.
  * Fixed the "alternate image swap" option for posts with locked notes.
  * Fixed several other potential problems related to the saved settings and cache.
* Version 6.1:
  * Added a "tag list scrollbars" option to limit the length of a post's tag list(s).
  * Added a "thumbnail info cache limit" option to limit the size of the hidden post cache.
  * Added an icon to the script for the browser's script handling add-on/extension (Greasemonkey, Tampermonkey, etc).
  * Updated "custom tag borders" to support banned as a status match (status:banned).
  * Updated/fixed hidden post display to support Danbooru's API changes.
* Version 6.0.2:
  * Updated custom tag borders to support Danbooru's status border changes.
* Version 6.0.1:
  * Updated to support Danbooru's translation mode changes.
  * Updated to support Danbooru's status border changes.
  * Updated the Danbooru notices to better handle multiple messages and support Danbooru's notice changes.
  * Fixed backup error handling so that the window does not get removed upon an unsuccessful restoration.
  * Fixed image drag scrolling for Chrome.
  * Fixed the use of the "n" key inside of textareas and text inputs for hidden posts.
  * Fixed mouse click detection on the image and sample/original links.
* Version 6.0:
  * Added a preferences tab for options directly related to how the script works.
  * Added a help tab for information not well suited to other tabs or tooltips.
  * Added a "manage cookies" option to allow the improved hiding of various notices.
  * Added a "bypass api" option to allow automatic handling of the API features for users for that log out regularly.
  * Added an "image drag scrolling" option to allow for finer control over the position/scrolling of an image via click and drag control.
  * Added an "auto-scroll image" option to allow for automatic positioning of images/flash upon opening a page.
  * Added an "override account settings" option to allow logged out settings to override account settings when logged in.
  * Added a "track new posts" option for providing an easy method of keeping track of new posts.
  * Added a backup/restore section for importing and exporting a user's settings.
  * Added a status message for indicating when information is being requested from Danbooru.
  * Added a tag editor window for easier tag editing.
  * Upgraded the menu display with various improvements.
  * Upgraded the border options to support adding/deleting tag borders, arranging borders by priority, changing outline styles, individual enabling/disabling, and previewing.
  * Upgraded image resizing to allow for resizing by window width and height in addition to Danbooru's current resizing by width only. There are now two links for resizing images in the post sidebar's options section and a "resize image mode" option added to the settings to allow a choice in how the automatic image resizing works.
  * Updated to support Danbooru's intro page.
  * Updated to support toddlercon being added to the censored/hidden tag list.
  * Updated "thumbnail count" to support the notes post listing.
  * Updated "direct downloads" to support the popular and pool post listings as was originally intended.
  * Fixed "autohide sidebar" and "thumbnail count" support for Danbooru's tag autocompletion.
  * Fixed the displaying of censored/hidden posts from banned artists.
  * Removed the favorites listing link since the username list is no longer a requestable feature.
* Version 5.4.1:
  * Fixed secondary border blank space on loading images with no primary status border.
* Version 5.4:
  * Added a "single color borders" option to allow reverting thumbnail borders to single colors.
  * Added a "border width" option to allow changing the thumbnail border size without using more space on the page.
  * Updated loli, shota, and custom status borders to support multicolor borders and moved loli/shota borders to a secondary border to allow simultaneous status borders.
  * Fixed the resize notice for users viewing original images first.
* Version 5.3.2:
  * Updated to support changes on Danbooru (v2.9.0).
* Version 5.3.1:
  * Userscripts update fix.
* Version 5.3:
  * Added an "auto-hide sidebar" option for hiding the sidebar on search listings and/or individual posts.
  * Updated to support changes on Danbooru.
* Version 5.2:
  * Added a "hide ban notice" option.
  * Updated the settings panel layout.
  * Updated to support blacklists on individual posts.
  * Fixed direct download support.
  * Fixed clean link support when not using the API.
* Version 5.1:
  * Added a "post tag titles" option to allow reverting post page titles to the full list of tags.
  * Added a link to Danbooru's favorites listing for regular members.
  * Updated hiding advertisements to free up the blank space where ads usually are.
  * Updated the error messages to not overwrite existing messages.
  * Moved the "BBB Settings" menu link to the upper menu due to the secondary menu missing on some pages and breaking the script.
  * Fixed the non-API "thumbnail count" method so that pages with no thumbnails don't break the script.
* Version 5.0:
  * Added settings panel so that people no longer need to edit the script to change settings. This also happens to fix automatic updating.
  * Removed the "show_all" option since editing settings is much simpler now.
* Version 4.1:
  * Added a "show all" option to allow the display of all hidden posts with one setting.
  * Added a "show deleted" option to allow a choice in the display of deleted posts.
  * Updated to reduce unnecessary API calls in order to avoid the API limit and improve overall speed. All options (excluding hidden post/show_xxxx options) can now function without the API, meaning they can be used without being logged in.
  * Updated the options to allow all of them to function independently of each other.
  * Updated comment handling to reduce errors caused by out of sync information.
  * Updated blacklist support in response to changes on Danbooru.
* Version 4.0:
  * Added in support for displaying loli/shota posts in the comments pages.
  * Updated loli/shota borders to work as a standalone feature.
  * Updated blacklist and pool support in response to changes on Danbooru.
* Version 3.3:
  * Updated to work with Danbooru's new popular page layout.
  * Updated keyboard navigation in response to Danbooru's change to the "wasd" format and added an option to allow arrow navigation for pages.
  * Updated custom border colors to support deleted posts and work as a standalone feature.
  * Added an option for an alternate mode that allows switching between the original and sample images by clicking on the image.
  * Added an option to hide the TOS notice.
  * Removed the option for number of favorites since Danbooru has this feature built in now.
* Version 3.2:
  * Added an option to allow the "Viewing original" notice to be hidden.
  * Added an option to remove the search info appended to post links.
  * Added an option to disable arrow navigation for posts.
* Version 3.1:
  * Fixed the paginator on the first page of results not displaying the correct number of pages when the limit changed the number of images per a page.
  * Fixed the broken thumbnails for nonstandard image files (bmps, archives, flash).
  * Added in the run-at meta tag to help prevent potential problems in other browsers.
* Version 3.0:
  * Added in support for pools.
  * Added in the update meta tags to allow automatic updates.
* Version 2.4:
  * Fixed the "undefined" error showing up in older browsers.
  * Added in the "Resize to window" and "Find similar" options for logged out users.
* Version 2.3:
  * Fixed the blacklist not recognizing matches.
  * Added the "Nobody here but us chickens!" message for blank pages.
  * Added a help section about editing script settings.
* Version 2.2:
  * Fixed the blacklist matches not getting separated correctly.
* Version 2.1:
  * Updated to work with Danbooru's new arrow navigation.
* Version 2.0:
  * Updated for compatibility with Chrome.
  * Added an option to switch between original and sample images.
* Version 1.0:
  * Script overhaul and removal of broken features.
  * Added an option to display the number of favorites for a post.
  * Added an option to remove the headers from the tag listing for a post.
