Better Better Booru
===================
Various tweaks to make Danbooru better.

---
Links
-----
* [Homepage](https://github.com/pseudonymous/better-better-booru)
* [Greasy Fork](https://greasyfork.org/scripts/3575-better-better-booru)
* [Changelog](https://github.com/pseudonymous/better-better-booru/blob/master/changelog.md)

---
Features
--------
* Allows the automatic control of the number of thumbnails per a page with a basic account or no account.
* Endless pages support for various thumbnail listings with several customization options.
* Multiple options and features for improved blacklist functionality:
  * Session toggle - Make individually disabled blacklist entries persist from page to page.
  * Post display - Change how blacklisted posts are hidden.
  * Thumbnail marking - Mark blacklisted thumbnails that have been unhidden so that they are easier to distinguish from other thumbnails.
  * Thumbnail controls - Allow control over the blacklist from a blacklisted thumbnail and allow for individual control of each blacklisted thumbnail.
  * Smart view - When viewing a blacklisted post, automatically display it if its thumbnail was already unhidden.
  * Additional bars - Add a blacklist bar to thumbnail sections without it so that blacklist entries can be toggled as needed.
  * Video playback - When viewing a blacklisted video post, control whether it pauses and plays based on its hidden status.
  * Ignore favorites - Exclude your favorited posts from being hidden.
  * Added support for wildcards (*), the "or/any" operator (~), nesting/grouping, and additional metatags.
* Multiple options and features for altering post viewing:
  * Alternate image swap - Swap between the sample and original image by clicking the image.
  * Resize image mode - Set the initial automatic resizing of an image to be by width, height, or both.
  * Image drag scrolling - Use click and drag on post content to reposition it.
  * Auto-scroll image - Automatically scroll the post content into view upon browsing a post.
  * Disable embedded notes - Force notes to display with the original style when viewing a post.
  * Video volume - Set the default volume of videos or remember your volume settings across videos.
  * Video autoplay - Choose whether videos automatically play.
  * Video looping - Choose whether videos automatically repeat by default.
  * Video controls - Choose whether video controls display by default.
  * Improved image resizing that works on flash content and also allows resizing by width, height, or both.
  * Improved ugoira functionality that includes note viewing on sample video versions, an additional "view sample" link for swapping from the original version, and support for swapping between the sample and original with Danbooru's hotkey.
* Multiple options for altering the layout:
  * Remove tag headers - Remove the headers from the post sidebar tag lists and combine them into a single list sorted by type.
  * Tag scrollbars - Limit the length of the sidebar tag list(s) and use scrollbars when the list(s) exceed that limit.
  * Auto-hide sidebar - Hide the sidebar on the window's left side and display it when it gains focus or the mouse gets near it.
  * Fixed sidebar - Fix/stick the sidebar to the left side of the page and prevent it from vertically scrolling out of view.
  * Collapsible sidebar - Allow sections of the sidebar to be minimized and expanded.
  * Fixed paginator - Fix/stick the paginator to the bottom of the window and prevent it from scrolling out of view.
  * Move save search - Move the "save this search" button into the sidebar.
  * Various options for easily modifying status borders to your liking and creating your own secondary custom borders that match images based on your criteria.
  * Various options for customizing the majority of notices by either altering or hiding them.
* Several other miscellaneous options:
  * Direct downloads - Let download managers download all the images currently displayed as thumbnails.
  * Track new posts - Create a specialized link focused on tracking and browsing new images.
  * Clean links - Remove extra information from post links in order to reduce history clutter/problems.
  * Post tag titles - Give posts a page title consisting of all of their tags.
  * Search add - Add/remove links to/from the sidebar tags that allow the easy inclusion or exclusion of additional search tags.
  * Page counter - Add an indicator near the top of listings that displays the page number information and allows for easy jumping to specific pages.
  * Comment scores - Make the score rating for comments visible.
  * Quick search - Filter the current thumbnails for specific posts that match your search.
* Improved accessibility for logged out users via several options and features:
  * Control over the blacklist, post sample setting, post resizing setting, and tagged filenames setting.
  * Adds back missing options to the sidebar options section.
  * Re-enables post to post hotkey navigation for searches.

---
Installation
------------
1. Installing a userscript manager is strongly recommended and sometimes required. Suggestions:
  * [Tampermonkey](http://tampermonkey.net/) (Chrome, Opera)
  * [Violentmonkey](https://addons.opera.com/extensions/details/violent-monkey/) (Opera)
  * [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Firefox) (Note: Setting/data storage is not fully supported.)
2. Open/install the script from a site or local computer file**. Please be sure you're using a trustworthy source. Recommendations:
  * [Greasy Fork](https://greasyfork.org/scripts/3575-better-better-booru)
  * [GitHub](https://github.com/pseudonymous/better-better-booru)
3. A prompt about allowing the installation should display.
4. Choose to allow/install after reviewing your options.
5. The script should now be installed and ready for use on Danbooru.
6. To access script features, use the "BBB Settings" link in the Danbooru navigation bar.

** Note: If installing from a local file on your computer, your browser may require additional steps.
