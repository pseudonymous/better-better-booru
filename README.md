better-better-booru
===================
Various tweaks to make Danbooru better.

---

Changelog
----------
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
