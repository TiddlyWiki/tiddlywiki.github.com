# tiddlywiki.com GitHub Pages repo

This repository contains the files that will be published as <a href="http://tiddlywiki.com/">tiddlywiki.com</a> via GitHub Pages custom domain feature.

## Issues

Before going live, the following  issues need to be addressed:

* Understand all the files and folders, and decide which need to be kept and removed
* Ensure that we know about any processes that depend on files affected by the migration
* The current server uses an `.htaccess` file to allow Apache to generate an index listing the content of the `/archive` folder
 * *instead we could have an `index.html` file that does a JS redirect to the listing of the folder on github.com*
* Use of PHP to force a download of `empty.html` in the `empty.download` file
 * *instead we can use a download link directly to the tiddlywiki repo*
* We need to formally tie each of the various release folders (`/`, `/beta/`, `/alpha`, `/upgrade` etc) to specified Git labels

It may also be desirable for all the download links to migrate to `https://github.com/*` URLs so that users could be confident that the TiddlyWiki source files they download haven't been tampered with in transit. 

## Notes on existing content

Here we attempt to reconstruct the purpose of each file and folder on the existing server. Please shout if you have any corrections or additions.

### http://tiddlywiki.com/ - **keep**

Root content of site

* Current TiddlyWiki release files
 * `TiddlySaver.jar`, `brixhamharbour.jpg`, `empty.download`, `empty.html`, `empty.zip`, `favicon.ico`, `field.jpg`, `firstversion.html`, `forest.jpg`, `fractalveg.jpg`, `index.html`, `index.xml`, `secondversion.html`
* This file
 * `readme.md`
* Unknown purpose
 * `coreplugins.html`

### http://tiddlywiki.com/alpha - **keep**

This folder contains the latest trunk build of TiddlyWiki. It is believed to be dynamically referenced by TiddlySpace (and TiddlyWeb?).

* `empty.html`, `jQuery.twStylesheet.js`, `jquery.js`, `tiddlywiki.html`, `tiddlywiki_compressed.html`, `tiddlywiki_externaljs.html`, `tiddlywiki_externaljs_tiddlyspace.html`, `twcore.js`, 

### http://tiddlywiki.com/archive - **keep**

This folder contains an archive of earlier releases of TiddlyWiki. In the existing arrangement a `.htaccess` file is used to  instruct Apache to generate an index file listing all of the files in the folder.

### http://tiddlywiki.com/beta - **keep**

This folder currently contains an identical copy of the `/alpha` folder apart from containing a different version of the `TiddlySaver.jar` file.

It is unknown if any other systems depend on the content of this folder.



### http://tiddlywiki.com/dev - **remove**

This folder contains HTML and RSS files redirecting visitors to http://tiddlywiki.org/

* `index.html`, `index.xml`

### http://tiddlywiki.com/images - **keep**

This folder contains 34 screenshot images in JPEG format, used by the tutorial tiddlers.

### http://tiddlywiki.com/monit - **remove**

This folder contains a single file called `token` containing the text `Hello world`. Presumably this folder has been used to identify the server to a monitoring service, and then the creator found they didn't have the rights to delete the folder or file, and so substituted placeholder content instead.

### http://tiddlywiki.com/nightly - **remove**

This folder contains a minimal release of TiddlyWiki version 2.2.0 (just the files `TiddlySaver.jar`, `empty.html`, `index.html`, `index.xml`).

### http://tiddlywiki.com/tiddlywiki5 - **keep**

This folder contains an HTML file redirecting visitors to the correct URI for the TiddlyWiki5 pre-release version.

### http://tiddlywiki.com/tiddlywiki5.old - **move into /achive**

This folder contains an archive of an older, abandoned version of TiddlyWiki5.

### http://tiddlywiko.com/upgrade - **keep**

This folder contains a single `index.html` containing a copy of the current release of TiddlyWiki. It is used by TiddlyWiki's client-side self-upgrade process.

