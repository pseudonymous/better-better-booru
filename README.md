Better Better Booru
===================
Various tweaks to make Danbooru better.
 
---
Links
-----
* [Homepage](https://github.com/pseudonymous/better-better-booru)
* [Greasy Fork](https://greasyfork.org/scripts/#To-Be-Determined)
* [Changelog](#changelog) ([Full Log](https://github.com/pseudonymous/better-better-booru/blob/master/changelog.md))
* [Installation Help](#getting-started)
 
---
Features<a name="features"></a>
--------
* Allows the viewing of hidden/censored tags and automatic control of the number of thumbnails per a page with a basic account or no account.
* Improved image resizing that works on flash and webm content and also allows resizing by width, height, or both.
* Improved blacklist functionality that includes support of wildcards (*), the "or/any" operator (~), and additional metatags (ex: score:&lt;0, etc.).
* The ability to easily modify status borders to your liking and create your own secondary custom borders that match images based on your criteria.
* Multiple options for altering post viewing:
 * Alternate image swap - Swap between the sample and original image by clicking the image.
 * Resize image mode - Set the initial automatic resizing of an image to be by width, height, or both.
 * Image drag scrolling - Use click and drag on a post image or webm video to reposition it.
 * Auto-scroll image - Automatically scroll the post content into view upon browsing a post.
* Multiple options for altering the sidebar:
 * Search add - Add links to the sidebar tags that allow the easy inclusion or exclusion of additional search tags.
 * Remove tag headers - Remove the headers from the post sidebar tag lists and combine them into a single list sorted by type.
 * Tag list scrollbars - Limit the length of the post sidebar tag list(s) and use scrollbars when the list(s) exceed that limit.
 * Auto-hide sidebar - Hide the sidebar on the window's left side and display it when it gains focus or the mouse gets near it.
* Several other miscellaneous options:
 * Direct downloads - Let download managers download all the images currently displayed as thumbnails.
 * Track new posts - Create a specialized link focused on tracking and browsing new images.
 * Clean links - Remove extra information from post links in order to reduce history clutter/problems.
 * Arrow navigation - Allow the use of the arrow keys to navigate pages.
 * Post tag titles - Give posts a page title consisting of all of their tags.
* Improved accessibility for logged out users via several features and options:
 * Options menu - Adds back the missing sidebar section with all the options accessible to logged out users.
 * Resize image - Automatically resize the image to your window.
 * Load sample first - Automatically load the sample or original image first.
 * Blacklist tags - Create a blacklist for hiding unwanted posts.
* Various options for customizing the majority of notices by either altering or hiding them.
 
---
Getting Started<a name="getting-started"></a>
---------------
1. Installing a userscript manager is strongly recommended and sometimes required. Suggestions:
 * [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Firefox)
 * [Tampermonkey](http://tampermonkey.net/) (Chrome, Opera)
 * [Violentmonkey](https://addons.opera.com/extensions/details/violent-monkey/) (Opera)
2. Open/install the script from a site or local computer file**. Please be sure you're using a trustworthy source. Recommendations:
 * [GitHub](https://github.com/pseudonymous/better-better-booru/raw/master/better-better-booru.user.js)
 * [Greasy Fork](https://greasyfork.org/scripts/#To-Be-Determined)
3. A prompt about allowing the installation should display.
4. Choose to allow/install after reviewing your options.
5. The script should now be installed and ready for use on Danbooru.
6. To access script features, use the "BBB Settings" link in the Danbooru navigation bar.
 
** Note: If installing from a local file on your computer, your browser may require additional steps.
 
---
Changelog<a name="changelog"></a>
----------
* Version 6.3:
 * Added a "resized notice display" option for allowing more control over the resized notice bar.
 * Added a "border spacing" option for controlling the amount of blank space between a border and image and between status borders and custom tag borders.
 * Added a "hide status notices" option for freeing up all the space used by status notices while still allowing access to them.
 * Added a "show banned" option to support banned posts' separation from deleted posts as a new post status.
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
 * Fixed a potential issue where "show toddlercon" wouldn't work.
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
