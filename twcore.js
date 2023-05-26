//
// Please note:
//
// * This code is designed to be readable but for compactness it only includes brief comments. You can see fuller comments
//   in the project repository at https://github.com/TiddlyWiki/tiddlywiki
//
// * You should never need to modify this source code directly. TiddlyWiki is carefully designed to allow deep customisation
//   without changing the core code. Please consult the development group at http://groups.google.com/group/TiddlyWikiDev
//
// JSLint directives
/*global jQuery:false, version:false */
/*jslint bitwise:true, browser:true, confusion:true, eqeq:true, evil:true, forin:true, maxerr:100, plusplus:true, regexp:true, sloppy:true, sub:true, undef:true, unparam:true, vars:true, white:true */

//--
//-- Global tw object (window.tw) exposing available methods and structures for developers
//--

window.tw = {
	io: {},
	textUtils: {}
};

//--
//-- Configuration repository
//--

// Miscellaneous options
var config = {
	numRssItems: 20, // Number of items in the RSS feed
	animDuration: 400, // Duration of UI animations in milliseconds
	cascadeFast: 20, // Speed for cascade animations (higher == slower)
	cascadeSlow: 60, // Speed for EasterEgg cascade animations
	cascadeDepth: 5, // Depth of cascade animation
	locale: "en" // W3C language tag
};

// Hashmap of alternative parsers for the wikifier
config.parsers = {};

config.adaptors = {};
config.defaultAdaptor = null;

// defines the order of the backstage tasks
config.backstageTasks = ["save", "importTask", "tweak", "upgrade", "plugins"];
// map by names from config.backstageTasks, defines their content (see Lingo.js and Backstage.js)
config.tasks = {};

config.annotations = {};

// Custom fields to be automatically added to new tiddlers
config.defaultCustomFields = {};

config.messages = {
	messageClose: {},
	dates: {},
	tiddlerPopup: {}
};

// Options that can be set in the options panel and/or cookies
config.options = {
	chkAnimate: true,
	chkAutoSave: false,
	chkCaseSensitiveSearch: false,
	chkConfirmDelete: true,
	chkDisplayInstrumentation: false,
	chkForceMinorUpdate: false,
	chkGenerateAnRssFeed: false,
	chkHttpReadOnly: true,
	chkIncrementalSearch: true,
	chkInsertTabs: false,
	chkOpenInNewWindow: true,
	chkPreventAsyncSaving: true,
	chkRegExpSearch: false,
	chkRemoveExtraMarkers: false, // #162
	chkSaveBackups: true,
	chkSaveEmptyTemplate: false,
	chkToggleLinks: false,
	chkUsePreForStorage: true, // Whether to use <pre> format for storage
	txtBackupFolder: "",
	txtEditorFocus: "text",
	txtFileSystemCharSet: "UTF-8",
	txtMainTab: "tabTimeline",
	txtMaxEditRows: "30",
	txtMoreTab: "moreTabAll",
	txtTheme: ""
};
config.optionsDesc = {};

config.optionsSource = {};

// Default tiddler templates
var DEFAULT_VIEW_TEMPLATE = 1;
var DEFAULT_EDIT_TEMPLATE = 2;
config.tiddlerTemplates = {
	1: "ViewTemplate",
	2: "EditTemplate"
};

// More messages (rather a legacy layout that should not really be like this)
config.views = {
	wikified: {
		tag: {}
	},
	editor: {
		tagChooser: {}
	}
};

config.extensions = {};

// Macros; each has a 'handler' member that is inserted later
config.macros = {
	today: {},
	version: {},
	search: { sizeTextbox: 15 },
	tiddler: {},
	tag: {},
	tags: {},
	tagging: {},
	timeline: {},
	allTags: {},
	list: {
		all: {},
		missing: {},
		orphans: {},
		shadowed: {},
		touched: {},
		filter: {}
	},
	closeAll: {},
	permaview: {},
	saveChanges: {},
	slider: {},
	option: {},
	options: {},
	newTiddler: {},
	newJournal: {},
	tabs: {},
	gradient: {},
	message: {},
	view: { defaultView: "text" },
	edit: {},
	tagChooser: {},
	toolbar: {},
	plugins: {},
	refreshDisplay: {},
	importTiddlers: {},
	upgrade: {
		source: "https://classic.tiddlywiki.com/upgrade/",
		backupExtension: "pre.core.upgrade"
	},
	sync: {},
	annotations: {}
};

// Commands supported by the toolbar macro
config.commands = {
	closeTiddler: {},
	closeOthers: {},
	editTiddler: {},
	saveTiddler: { hideReadOnly: true },
	cancelTiddler: {},
	deleteTiddler: { hideReadOnly: true },
	permalink: {},
	references: { type: "popup" },
	jump: { type: "popup" },
	syncing: { type: "popup" },
	fields: { type: "popup" }
};

// Control of macro parameter evaluation
config.evaluateMacroParameters = "all";

// Basic regular expressions
var isBadSafari = !((new RegExp("[\u0150\u0170]", "g")).test("\u0150")); //# see 52678d4 and #22  ..remove at all?
config.textPrimitives = {
	upperLetter: "[A-Z\u00c0-\u00de\u0150\u0170]",
	lowerLetter: "[a-z0-9_\\-\u00df-\u00ff\u0151\u0171]",
	anyLetter:   "[A-Za-z0-9_\\-\u00c0-\u00de\u00df-\u00ff\u0150\u0170\u0151\u0171]",
	anyLetterStrict: "[A-Za-z0-9\u00c0-\u00de\u00df-\u00ff\u0150\u0170\u0151\u0171]"
};
// Moved navigator dependent code out of Config.js into a separate module. Helps with https://github.com/TiddlyWiki/tiddlywiki/issues/22
if(isBadSafari) {
	config.textPrimitives = {
		upperLetter: "[A-Z\u00c0-\u00de]",
		lowerLetter: "[a-z0-9_\\-\u00df-\u00ff]",
		anyLetter:   "[A-Za-z0-9_\\-\u00c0-\u00de\u00df-\u00ff]",
		anyLetterStrict: "[A-Za-z0-9\u00c0-\u00de\u00df-\u00ff]"
	};
}
config.textPrimitives.sliceSeparator = "::";
config.textPrimitives.sectionSeparator = "##";
config.textPrimitives.urlPattern =
	"(?:file|http|https|mailto|ftp|irc|news|data):[^\\s'\"]+(?:/|\\b|\\[|\\])"; // #132
config.textPrimitives.unWikiLink = "~";
config.textPrimitives.wikiLink = "(?:(?:" + config.textPrimitives.upperLetter + "+" +
	config.textPrimitives.lowerLetter + "+" +
	config.textPrimitives.upperLetter +
	config.textPrimitives.anyLetter + "*)|(?:" +
	config.textPrimitives.upperLetter + "{2,}" +
	config.textPrimitives.lowerLetter + "+))";

config.textPrimitives.cssLookahead = "(?:(" + config.textPrimitives.anyLetter +
	"+)\\(([^\\)\\|\\n]+)(?:\\):))|(?:(" + config.textPrimitives.anyLetter + "+):([^;\\|\\n]+);)";
config.textPrimitives.cssLookaheadRegExp = new RegExp(config.textPrimitives.cssLookahead, "mg");

config.textPrimitives.brackettedLink = "\\[\\[([^\\]]+)\\]\\]";
config.textPrimitives.titledBrackettedLink = "\\[\\[([^\\[\\]\\|]+)\\|([^\\[\\]\\|]+)\\]\\]";
config.textPrimitives.tiddlerForcedLinkRegExp =
	new RegExp("(?:" + config.textPrimitives.titledBrackettedLink + ")|(?:" +
	config.textPrimitives.brackettedLink + ")|(?:" +
	config.textPrimitives.urlPattern + ")", "mg");
config.textPrimitives.tiddlerAnyLinkRegExp =
	new RegExp("(" + config.textPrimitives.wikiLink + ")|(?:" +
	config.textPrimitives.titledBrackettedLink + ")|(?:" +
	config.textPrimitives.brackettedLink + ")|(?:" +
	config.textPrimitives.urlPattern + ")", "mg");

config.glyphs = {
	currBrowser: null,
	browsers: [],
	codes: {}
};

//--
//-- Shadow tiddlers
//--

config.shadowTiddlers = {
	StyleSheet: "",
	MarkupPreHead: "",
	MarkupPostHead: "",
	MarkupPreBody: "",
	MarkupPostBody: "",
	TabTimeline: '<<timeline>>',
	TabAll: '<<list all>>',
	TabTags: '<<allTags excludeLists>>',
	TabMoreMissing: '<<list missing>>',
	TabMoreOrphans: '<<list orphans>>',
	TabMoreShadowed: '<<list shadowed>>',
	AdvancedOptions: '<<options>>',
	PluginManager: '<<plugins>>',
	SystemSettings: '',
	ToolbarCommands: '|~ViewToolbar|closeTiddler closeOthers +editTiddler > fields permalink references jump|\n' +
		'|~EditToolbar|+saveTiddler -cancelTiddler deleteTiddler|', // #160
	WindowTitle: '<<tiddler SiteTitle>> - <<tiddler SiteSubtitle>>'
};

// Browser detection... In a very few places, there's nothing else for it but to know what browser we're using.
config.userAgent = navigator.userAgent.toLowerCase();
config.browser = {
	isIE: config.userAgent.indexOf("msie") != -1 && config.userAgent.indexOf("opera") == -1,
	isGecko: navigator.product == "Gecko" && config.userAgent.indexOf("WebKit") == -1,
	// config.browser.ieVersion[1], if it exists, will be the IE version string, eg "6.0"
	ieVersion: /MSIE (\d{1,2}.\d)/i.exec(config.userAgent),
	isSafari: config.userAgent.indexOf("applewebkit") != -1,
	isBadSafari: !((new RegExp("[\u0150\u0170]", "g")).test("\u0150")),
	// config.browser.firefoxDate[1], if it exists, will be Firefox release date as "YYYYMMDD"
	firefoxDate: /gecko\/(\d{8})/i.exec(config.userAgent),
	isOpera: config.userAgent.indexOf("opera") != -1,
	isChrome: config.userAgent.indexOf('chrome') > -1,
	isLinux: config.userAgent.indexOf("linux") != -1,
	isUnix: config.userAgent.indexOf("x11") != -1,
	isMac: config.userAgent.indexOf("mac") != -1,
	isWindows: config.userAgent.indexOf("win") != -1
};

merge(config.glyphs, {
	browsers: [
		function() { return config.browser.isIE },
		function() { return true }
	],
	codes: {
		downTriangle: ["\u25BC", "\u25BE"],
		downArrow: ["\u2193", "\u2193"],
		bentArrowLeft: ["\u2190", "\u21A9"],
		bentArrowRight: ["\u2192", "\u21AA"]
	}
});

//--
//-- Translateable strings
//--

// Strings in "double quotes" should be translated; strings in 'single quotes' should be left alone

merge(config.options, {
	txtUserName: "YourName"
});

merge(config.tasks, {
	save: { text: "save", tooltip: "Save your changes to this TiddlyWiki" },
	importTask: { text: "import", tooltip: "Import tiddlers and plugins " +
		"from other TiddlyWiki files and servers", content: '<<importTiddlers>>' },
	tweak: { text: "tweak", tooltip: "Tweak the appearance and behaviour of TiddlyWiki", content: '<<options>>' },
	upgrade: { text: "upgrade", tooltip: "Upgrade TiddlyWiki core code", content: '<<upgrade>>' },
	plugins: { text: "plugins", tooltip: "Manage installed plugins", content: '<<plugins>>' }
});

// Options that can be set in the options panel and/or cookies
merge(config.optionsDesc, {
	chkAnimate: "Enable animations",
	chkAutoSave: "Automatically save changes",
	chkCaseSensitiveSearch: "Case-sensitive searching",
	chkConfirmDelete: "Require confirmation before deleting tiddlers",
	chkIncrementalSearch: "Incremental key-by-key searching",
	chkInsertTabs: "Use the tab key to insert tab characters instead of moving between fields",
	chkForceMinorUpdate: "Don't update modifier username and date when editing tiddlers",
	chkGenerateAnRssFeed: "Generate an RSS feed when saving changes",
	chkHttpReadOnly: "Hide editing features when viewed over HTTP",
	chkOpenInNewWindow: "Open external links in a new window",
	chkPreventAsyncSaving: "Disable attempting async saving (may be needed by old plugins)",
	chkRegExpSearch: "Enable regular expressions for searches",
	chkSaveBackups: "Keep backup file when saving changes",
	chkSaveEmptyTemplate: "Generate an empty template when saving changes",
	chkToggleLinks: "Clicking on links to open tiddlers causes them to close",
	txtBackupFolder: "Name of folder to use for backups",
	txtFileSystemCharSet: "Default character set for saving changes (Firefox/Mozilla only)",
	txtMaxEditRows: "Maximum number of rows in edit boxes",
	chkRemoveExtraMarkers: "Replace unused transclusion markers with blanks", // #162
	txtTheme: "Name of the theme to use",
	txtUpgradeCoreURI: "Custom URI to download TiddlyWiki core from (when upgrading)",
	txtUserName: "Username for signing your edits"
});

merge(config.messages, {
	customConfigError: "Problems were encountered loading plugins. See PluginManager for details",
	pluginError: "Error: %0",
	pluginDisabled: "Not executed because disabled via 'systemConfigDisable' tag",
	pluginForced: "Executed because forced via 'systemConfigForce' tag",
	pluginVersionError: "Not executed because this plugin needs a newer version of TiddlyWiki",
	nothingSelected: "Nothing is selected. You must select one or more items first",
	savedSnapshotError: "It appears that this TiddlyWiki has been incorrectly saved. Please see https://classic.tiddlywiki.com/#SaveUnpredictabilities for details",
	subtitleUnknown: "(unknown)",
	undefinedTiddlerToolTip: "The tiddler '%0' doesn't yet exist",
	shadowedTiddlerToolTip: "The tiddler '%0' doesn't yet exist, but has a pre-defined shadow value",
	tiddlerLinkTooltip: "%0 - %1, %2",
	externalLinkTooltip: "External link to %0",
	noTags: "There are no tagged tiddlers",
	notFileUrlError: "You need to save this TiddlyWiki to a file before you can save changes",
	cantSaveError: "It's not possible to save changes. Possible reasons include:\n- your browser doesn't support saving (Firefox, Internet Explorer, Safari and Opera all work if properly configured)\n- the pathname to your TiddlyWiki file contains illegal characters\n- the TiddlyWiki HTML file has been moved or renamed",
	invalidFileError: "The original file '%0' does not appear to be a valid TiddlyWiki",
	backupSaved: "Backup saved",
	backupFailed: "Failed to save backup file",
	rssSaved: "RSS feed saved",
	rssFailed: "Failed to save RSS feed file",
	emptySaved: "Empty template saved",
	emptyFailed: "Failed to save empty template file",
	mainSaved: "TiddlyWiki saved",
	mainDownload: "Downloading/saving main TiddlyWiki file",
	mainDownloadManual: "RIGHT CLICK HERE to download/save main TiddlyWiki file",
	mainFailed: "Failed to save main TiddlyWiki file. Your changes have not been saved",
	macroError: "Error in macro <<%0>>",
	macroErrorDetails: "Error while executing macro <<%0>>:\n%1",
	missingMacro: "No such macro",
	overwriteWarning: "A tiddler named '%0' already exists. Choose OK to overwrite it",
	unsavedChangesWarning: "WARNING! There are unsaved changes in TiddlyWiki\n\nChoose OK to save\nChoose CANCEL to discard",
	confirmExit: "--------------------------------\n\nThere are unsaved changes in TiddlyWiki. If you continue you will lose those changes\n\n--------------------------------",
	saveInstructions: "SaveChanges",
	unsupportedTWFormat: "Unsupported TiddlyWiki format '%0'",
	tiddlerSaveError: "Error when saving tiddler '%0'",
	tiddlerLoadError: "Error when loading tiddler '%0'",
	wrongSaveFormat: "Cannot save with storage format '%0'. Using standard format for save.",
	invalidFieldName: "Invalid field name %0",
	fieldCannotBeChanged: "Field '%0' cannot be changed",
	loadingMissingTiddler: "Attempting to retrieve the tiddler '%0' from the '%1' server at:\n\n'%2' in the workspace '%3'",
	upgradeDone: "The upgrade to version %0 is now complete\n\nClick 'OK' to reload the newly upgraded TiddlyWiki",
	invalidCookie: "Invalid cookie '%0'"
});

merge(config.messages.messageClose, {
	text: "close",
	tooltip: "close this message area"
});

config.messages.backstage = {
	open: { text: "backstage", tooltip: "Open the backstage area to perform authoring and editing tasks" },
	close: { text: "close", tooltip: "Close the backstage area" },
	prompt: "backstage: ",
	decal: {
		edit: { text: "edit", tooltip: "Edit the tiddler '%0'" }
	}
};

config.messages.listView = {
	tiddlerTooltip: "Click for the full text of this tiddler",
	previewUnavailable: "(preview not available)"
};

config.messages.dates.months = ["January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"];
config.messages.dates.days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
config.messages.dates.shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
config.messages.dates.shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// suffixes for dates, eg "1st","2nd","3rd"..."30th","31st"
config.messages.dates.daySuffixes = [
	"st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th",
	"th", "th", "th", "th", "th", "th", "th", "th", "th", "th",
	"st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th",
	"st"
];
config.messages.dates.am = "am";
config.messages.dates.pm = "pm";

merge(config.messages.tiddlerPopup, {});

merge(config.views.wikified.tag, {
	labelNoTags: "no tags",
	labelTags: "tags: ",
	openTag: "Open tag '%0'",
	tooltip: "Show tiddlers tagged with '%0'",
	openAllText: "Open all",
	openAllTooltip: "Open all of these tiddlers",
	popupNone: "No other tiddlers tagged with '%0'"
});

merge(config.views.wikified, {
	defaultText: "The tiddler '%0' doesn't yet exist. Double-click to create it",
	defaultModifier: "(missing)",
	shadowModifier: "(built-in shadow tiddler)",
	dateFormat: "DD MMM YYYY",
	createdPrompt: "created"
});

merge(config.views.editor, {
	tagPrompt: "Type tags separated with spaces, [[use double square brackets]] if necessary, or add existing",
	defaultText: "Type the text for '%0'"
});

merge(config.views.editor.tagChooser, {
	text: "tags",
	tooltip: "Choose existing tags to add to this tiddler",
	popupNone: "There are no tags defined",
	tagTooltip: "Add the tag '%0'"
});

merge(config.messages, {
	sizeTemplates: [
		{ unit: 1024 * 1024 * 1024, template: "%0\u00a0GB" },
		{ unit: 1024 * 1024, template: "%0\u00a0MB" },
		{ unit: 1024, template: "%0\u00a0KB" },
		{ unit: 1, template: "%0\u00a0B" }
	]
});

merge(config.macros.search, {
	label: "search",
	prompt: "Search this TiddlyWiki",
	placeholder: "",
	accessKey: "F",
	successMsg: "%0 tiddlers found matching %1",
	failureMsg: "No tiddlers found matching %0"
});

merge(config.macros.tagging, {
	label: "tagging: ",
	labelNotTag: "not tagging",
	tooltip: "List of tiddlers tagged with '%0'"
});

merge(config.macros.timeline, {
	dateFormat: "DD MMM YYYY"
});

merge(config.macros.allTags, {
	tooltip: "Show tiddlers tagged with '%0'",
	noTags: "There are no tagged tiddlers"
});

config.macros.list.all.prompt = "All tiddlers in alphabetical order";
config.macros.list.missing.prompt = "Tiddlers that have links to them but are not defined";
config.macros.list.orphans.prompt = "Tiddlers that are not linked to from any other tiddlers";
config.macros.list.shadowed.prompt = "Tiddlers shadowed with default contents";
config.macros.list.touched.prompt = "Tiddlers that have been modified locally";

merge(config.macros.closeAll, {
	label: "close all",
	prompt: "Close all displayed tiddlers (except any that are being edited)"
});

merge(config.macros.permaview, {
	label: "permaview",
	prompt: "Link to an URL that retrieves all the currently displayed tiddlers"
});

merge(config.macros.saveChanges, {
	label: "save changes",
	prompt: "Save all tiddlers to create a new TiddlyWiki",
	accessKey: "S"
});

merge(config.macros.newTiddler, {
	label: "new tiddler",
	prompt: "Create a new tiddler",
	title: "New Tiddler",
	accessKey: "N"
});

merge(config.macros.newJournal, {
	label: "new journal",
	prompt: "Create a new tiddler from the current date and time",
	accessKey: "J"
});

merge(config.macros.options, {
	wizardTitle: "Tweak advanced options",
	step1Title: "These options are saved in cookies in your browser",
	step1Html: "<input type='hidden' name='markList'></input><br>" +
		"<label><input type='checkbox' checked='false' name='chkUnknown'>Show unknown options</label>",
	unknownDescription: "//(unknown)//",
	listViewTemplate: {
		columns: [
			{ name: 'Option', field: 'option', title: "Option", type: 'String' },
			{ name: 'Description', field: 'description', title: "Description", type: 'WikiText' },
			{ name: 'Name', field: 'name', title: "Name", type: 'String' }
		],
		rowClasses: [
			{ className: 'lowlight', field: 'lowlight' }
		]
	}
});

merge(config.macros.plugins, {
	wizardTitle: "Manage plugins",
	step1Title: "Currently loaded plugins",
	step1Html: "<input type='hidden' name='markList'></input>", // DO NOT TRANSLATE
	skippedText: "(This plugin has not been executed because it was added since startup)",
	noPluginText: "There are no plugins installed",
	confirmDeleteText: "Are you sure you want to delete these plugins:\n\n%0",
	removeLabel: "remove systemConfig tag",
	removePrompt: "Remove systemConfig tag",
	deleteLabel: "delete",
	deletePrompt: "Delete these tiddlers forever",
	listViewTemplate: {
		columns: [
			{ name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector' },
			{ name: 'Tiddler', field: 'tiddler', title: "Tiddler", type: 'Tiddler' },
			{ name: 'Description', field: 'Description', title: "Description", type: 'String' },
			{ name: 'Version', field: 'Version', title: "Version", type: 'String' },
			{ name: 'Size', field: 'size', tiddlerLink: 'size', title: "Size", type: 'Size' },
			{ name: 'Forced', field: 'forced', title: "Forced", tag: 'systemConfigForce', type: 'TagCheckbox' },
			{ name: 'Disabled', field: 'disabled', title: "Disabled", tag: 'systemConfigDisable', type: 'TagCheckbox' },
			{ name: 'Executed', field: 'executed', title: "Loaded", type: 'Boolean', trueText: "Yes", falseText: "No" },
			{ name: 'Startup Time', field: 'startupTime', title: "Startup Time", type: 'String' },
			{ name: 'Error', field: 'error', title: "Status", type: 'Boolean', trueText: "Error", falseText: "OK" },
			{ name: 'Log', field: 'log', title: "Log", type: 'StringList' }
		],
		rowClasses: [
			{ className: 'error', field: 'error' },
			{ className: 'warning', field: 'warning' }
		]
	},
	listViewTemplateReadOnly: {
		columns: [
			{ name: 'Tiddler', field: 'tiddler', title: "Tiddler", type: 'Tiddler' },
			{ name: 'Description', field: 'Description', title: "Description", type: 'String' },
			{ name: 'Version', field: 'Version', title: "Version", type: 'String' },
			{ name: 'Size', field: 'size', tiddlerLink: 'size', title: "Size", type: 'Size' },
			{ name: 'Executed', field: 'executed', title: "Loaded", type: 'Boolean', trueText: "Yes", falseText: "No" },
			{ name: 'Startup Time', field: 'startupTime', title: "Startup Time", type: 'String' },
			{ name: 'Error', field: 'error', title: "Status", type: 'Boolean', trueText: "Error", falseText: "OK" },
			{ name: 'Log', field: 'log', title: "Log", type: 'StringList' }
		],
		rowClasses: [
			{ className: 'error', field: 'error' },
			{ className: 'warning', field: 'warning' }
		]
	}
});

merge(config.macros.toolbar, {
	moreLabel: "more",
	morePrompt: "Show additional commands",
	lessLabel: "less",
	lessPrompt: "Hide additional commands",
	separator: "|"
});

merge(config.macros.refreshDisplay, {
	label: "refresh",
	prompt: "Redraw the entire TiddlyWiki display"
});

merge(config.macros.importTiddlers, {
	readOnlyWarning: "You cannot import into a read-only TiddlyWiki file. Try opening it from a file:// URL",
	wizardTitle: "Import tiddlers from another file or server",
	step1Title: "Step 1: Locate the server or TiddlyWiki file",
	step1Html: "Specify the type of the server: <select name='selTypes'><option value=''>Choose...</option></select><br>" +
		"Enter the URL or pathname here: <input type='text' size=50 name='txtPath'><br>" +
		"...or browse for a file: <input type='file' size=50 name='txtBrowse'><br><hr>" +
		"...or select a pre-defined feed: <select name='selFeeds'><option value=''>Choose...</option></select>",
	openLabel: "open",
	openPrompt: "Open the connection to this file or server",
	statusOpenHost: "Opening the host",
	statusGetWorkspaceList: "Getting the list of available workspaces",
	step2Title: "Step 2: Choose the workspace",
	step2Html: "Enter a workspace name: <input type='text' size=50 name='txtWorkspace'><br>...or select a workspace: " +
		"<select name='selWorkspace'><option value=''>Choose...</option></select>",
	cancelLabel: "cancel",
	cancelPrompt: "Cancel this import",
	statusOpenWorkspace: "Opening the workspace",
	statusGetTiddlerList: "Getting the list of available tiddlers",
	errorGettingTiddlerList: "Error getting list of tiddlers, click Cancel to try again",
	errorGettingTiddlerListHttp404: "Error retrieving tiddlers from url, please ensure the url exists. Click Cancel to try again.",
	errorGettingTiddlerListHttp: "Error retrieving tiddlers from url, please " +
		"ensure this url exists and is <a href='http://enable-cors.org/'>CORS</a> enabled",
	errorGettingTiddlerListFile: "Error retrieving tiddlers from local file, " +
		"please make sure the file is in the same directory as your TiddlyWiki. Click Cancel to try again.",
	step3Title: "Step 3: Choose the tiddlers to import",
	step3Html: "<input type='hidden' name='markList'></input><br><input type='checkbox' checked='true' name='chkSync'>" +
		"Keep these tiddlers linked to this server so that you can synchronise subsequent changes</input><br>" +
		"<input type='checkbox' name='chkSave'>Save the details of this server in a 'systemServer' tiddler called:</input> <input type='text' size=25 name='txtSaveTiddler'>",
	importLabel: "import",
	importPrompt: "Import these tiddlers",
	confirmOverwriteText: "Are you sure you want to overwrite these tiddlers:\n\n%0",
	step4Title: "Step 4: Importing %0 tiddler(s)",
	step4Html: "<input type='hidden' name='markReport'></input>", // DO NOT TRANSLATE
	doneLabel: "done",
	donePrompt: "Close this wizard",
	statusDoingImport: "Importing tiddlers",
	statusDoneImport: "All tiddlers imported",
	systemServerNamePattern: "%2 on %1",
	systemServerNamePatternNoWorkspace: "%1",
	confirmOverwriteSaveTiddler: "The tiddler '%0' already exists. Click 'OK' " +
		"to overwrite it with the details of this server, or 'Cancel' to leave it unchanged",
	serverSaveTemplate: "|''Type:''|%0|\n|''URL:''|%1|\n|''Workspace:''|%2|\n\n" +
		"This tiddler was automatically created to record the details of this server",
	serverSaveModifier: "(System)",
	listViewTemplate: {
		columns: [
			{ name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector' },
			{ name: 'Tiddler', field: 'tiddler', title: "Tiddler", type: 'Tiddler' },
			{ name: 'Size', field: 'size', tiddlerLink: 'size', title: "Size", type: 'Size' },
			{ name: 'Tags', field: 'tags', title: "Tags", type: 'Tags' }
		],
		rowClasses: []
	}
});

merge(config.macros.upgrade, {
	wizardTitle: "Upgrade TiddlyWiki core code",
	step1Title: "Update or repair this TiddlyWiki to the latest release",
	step1Html: "You are about to upgrade to the latest release of the TiddlyWiki core code " +
		"(from <a href='%0' class='externalLink' target='_blank'>%1</a>). Your content will be preserved across the upgrade.<br><br>" +
		"Note that core upgrades have been known to interfere with older plugins. If you run into problems with upgrading, " +
		"see <a href='http://www.tiddlywiki.org/wiki/CoreUpgrades' class='externalLink' target='_blank'>http://www.tiddlywiki.org/wiki/CoreUpgrades</a>",
	errorCantUpgrade: "Unable to upgrade this TiddlyWiki. You can only perform upgrades on TiddlyWiki files stored locally",
	errorNotSaved: "You must save changes before you can perform an upgrade",
	step2Title: "Confirm the upgrade details",
	step2Html_downgrade: "You are about to downgrade to TiddlyWiki version %0 from %1.<br><br>Downgrading to an earlier version of the core code is not recommended",
	step2Html_restore: "This TiddlyWiki appears to be already using the latest version of the core code (%0).<br><br>" +
		"You can continue to upgrade anyway to ensure that the core code hasn't been corrupted or damaged",
	step2Html_upgrade: "You are about to upgrade to TiddlyWiki version %0 from %1",
	upgradeLabel: "upgrade",
	upgradePrompt: "Prepare for the upgrade process",
	statusPreparingBackup: "Preparing backup",
	statusSavingBackup: "Saving backup file",
	errorSavingBackup: "There was a problem saving the backup file",
	statusLoadingCore: "Loading core code",
	errorLoadingCore: "Error loading the core code",
	errorCoreFormat: "Error with the new core code",
	statusSavingCore: "Saving the new core code",
	statusReloadingCore: "Reloading the new core code",
	startLabel: "start",
	startPrompt: "Start the upgrade process",
	cancelLabel: "cancel",
	cancelPrompt: "Cancel the upgrade process",
	step3Title: "Upgrade cancelled",
	step3Html: "You have cancelled the upgrade process"
});

merge(config.macros.annotations, {});

merge(config.commands.closeTiddler, {
	text: "close",
	tooltip: "Close this tiddler"
});

merge(config.commands.closeOthers, {
	text: "close others",
	tooltip: "Close all other tiddlers"
});

merge(config.commands.editTiddler, {
	text: "edit",
	tooltip: "Edit this tiddler",
	readOnlyText: "view",
	readOnlyTooltip: "View the source of this tiddler"
});

merge(config.commands.saveTiddler, {
	text: "done",
	tooltip: "Save changes to this tiddler"
});

merge(config.commands.cancelTiddler, {
	text: "cancel",
	tooltip: "Undo changes to this tiddler",
	warning: "Are you sure you want to abandon your changes to '%0'?",
	readOnlyText: "done",
	readOnlyTooltip: "View this tiddler normally"
});

merge(config.commands.deleteTiddler, {
	text: "delete",
	tooltip: "Delete this tiddler",
	warning: "Are you sure you want to delete '%0'?"
});

merge(config.commands.permalink, {
	text: "permalink",
	tooltip: "Permalink for this tiddler"
});

merge(config.commands.references, {
	text: "references",
	tooltip: "Show tiddlers that link to this one",
	popupNone: "No references"
});

merge(config.commands.jump, {
	text: "jump",
	tooltip: "Jump to another open tiddler"
});

merge(config.commands.fields, {
	text: "fields",
	tooltip: "Show the extended fields of this tiddler",
	emptyText: "There are no extended fields for this tiddler",
	listViewTemplate: {
		columns: [
			{ name: 'Field', field: 'field', title: "Field", type: 'String' },
			{ name: 'Value', field: 'value', title: "Value", type: 'String' }
		],
		rowClasses: [],
		buttons: []
	}
});

merge(config.shadowTiddlers, {
	DefaultTiddlers: "[[GettingStarted]]",
	MainMenu: "[[GettingStarted]]",
	SiteTitle: "My TiddlyWiki",
	SiteSubtitle: "a reusable non-linear personal web notebook",
	SiteUrl: "",
	SideBarOptions: '<<search>><<closeAll>><<permaview>><<newTiddler>><<newJournal "DD MMM YYYY" "journal">>' +
		'<<saveChanges>><<slider chkSliderOptionsPanel OptionsPanel "options \u00bb" "Change TiddlyWiki advanced options">>',
	SideBarTabs: '<<tabs txtMainTab "Timeline" "Timeline" TabTimeline "All" "All tiddlers" TabAll "Tags" "All tags" TabTags "More" "More lists" TabMore>>',
	TabMore: '<<tabs txtMoreTab "Missing" "Missing tiddlers" TabMoreMissing "Orphans" "Orphaned tiddlers" TabMoreOrphans "Shadowed" "Shadowed tiddlers" TabMoreShadowed>>'
});

merge(config.annotations, {
	AdvancedOptions: "This shadow tiddler provides access to several advanced options",
	ColorPalette: "These values in this shadow tiddler determine the colour scheme of the ~TiddlyWiki user interface",
	DefaultTiddlers: "The tiddlers listed in this shadow tiddler will be automatically displayed when ~TiddlyWiki starts up",
	EditTemplate: "The HTML template in this shadow tiddler determines how tiddlers look while they are being edited",
	GettingStarted: "This shadow tiddler provides basic usage instructions",
	ImportTiddlers: "This shadow tiddler provides access to importing tiddlers",
	MainMenu: "This shadow tiddler is used as the contents of the main menu in the left-hand column of the screen",
	MarkupPreHead: "This tiddler is inserted at the top of the <head> section of the TiddlyWiki HTML file",
	MarkupPostHead: "This tiddler is inserted at the bottom of the <head> section of the TiddlyWiki HTML file",
	MarkupPreBody: "This tiddler is inserted at the top of the <body> section of the TiddlyWiki HTML file",
	MarkupPostBody: "This tiddler is inserted at the end of the <body> section of the TiddlyWiki HTML file immediately after the script block",
	OptionsPanel: "This shadow tiddler is used as the contents of the options panel slider in the right-hand sidebar",
	PageTemplate: "The HTML template in this shadow tiddler determines the overall ~TiddlyWiki layout",
	PluginManager: "This shadow tiddler provides access to the plugin manager",
	SideBarOptions: "This shadow tiddler is used as the contents of the option panel in the right-hand sidebar",
	SideBarTabs: "This shadow tiddler is used as the contents of the tabs panel in the right-hand sidebar",
	SiteSubtitle: "This shadow tiddler is used as the second part of the page title",
	SiteTitle: "This shadow tiddler is used as the first part of the page title",
	SiteUrl: "This shadow tiddler should be set to the full target URL for publication",
	StyleSheetColors: "This shadow tiddler contains CSS definitions related to the color of page elements. " +
		"''DO NOT EDIT THIS TIDDLER'', instead make your changes in the StyleSheet shadow tiddler",
	StyleSheet: "This tiddler can contain custom CSS definitions",
	StyleSheetLayout: "This shadow tiddler contains CSS definitions related to the layout of page elements. " +
	"''DO NOT EDIT THIS TIDDLER'', instead make your changes in the StyleSheet shadow tiddler",
	StyleSheetLocale: "This shadow tiddler contains CSS definitions related to the translation locale",
	StyleSheetPrint: "This shadow tiddler contains CSS definitions for printing",
	SystemSettings: "Options may be stored here using the slice notation (like {{{chkAutoSave: true}}} or {{{|txtUserName|The great inventor|}}})",
	TabAll: "This shadow tiddler contains the contents of the 'All' tab in the right-hand sidebar",
	TabMore: "This shadow tiddler contains the contents of the 'More' tab in the right-hand sidebar",
	TabMoreMissing: "This shadow tiddler contains the contents of the 'Missing' tab in the right-hand sidebar",
	TabMoreOrphans: "This shadow tiddler contains the contents of the 'Orphans' tab in the right-hand sidebar",
	TabMoreShadowed: "This shadow tiddler contains the contents of the 'Shadowed' tab in the right-hand sidebar",
	TabTags: "This shadow tiddler contains the contents of the 'Tags' tab in the right-hand sidebar",
	TabTimeline: "This shadow tiddler contains the contents of the 'Timeline' tab in the right-hand sidebar",
	ToolbarCommands: "This shadow tiddler determines which commands are shown in tiddler toolbars",
	ViewTemplate: "The HTML template in this shadow tiddler determines how tiddlers look"
});
//--
//-- Main
//--

var params = null; // Command line parameters
var store = null; // TiddlyWiki storage
var story = null; // Main story
var formatter = null; // Default formatters for the wikifier
var anim = typeof Animator == "function" ? new Animator() : null; // Animation engine
var readOnly = false; // Whether we're in readonly mode
var highlightHack = null; // Embarrassing hack department...
var hadConfirmExit = false; // Don't warn more than once
var safeMode = false; // Disable all plugins and cookies
var showBackstage; // Whether to include the backstage area
var installedPlugins = []; // Information filled in when plugins are executed
var startingUp = false; // Whether we're in the process of starting up
var pluginInfo, tiddler; // Used to pass information to plugins in loadPlugins()

// Whether this file can be saved back to the same location [Preemption]
window.allowSave = window.allowSave || function(l)
{
	return true;
};

// Whether this file is being viewed locally
window.isLocal = function()
{
	return (document.location.protocol == "file:");
};

// Whether to use the JavaSaver applet
var useJavaSaver = window.isLocal() && (config.browser.isSafari || config.browser.isOpera);

// Allow preemption code a chance to tweak config and useJavaSaver [Preemption]
if (window.tweakConfig) window.tweakConfig();

if(!window || !window.console) {
	console = { tiddlywiki: true, log: function(message) { displayMessage(message) } };
}

// Starting up
function main()
{
	window.originalHTML = recreateOriginal();

	var t10, t9, t8, t7, t6, t5, t4, t3, t2, t1, t0 = new Date();
	startingUp = true;
	var doc = jQuery(document);
	jQuery.noConflict();
	window.onbeforeunload = function(e) { if(window.confirmExit) return confirmExit(); };
	params = getParameters();
	if(params) params = params.parseParams("open", null, false);
	store = new TiddlyWiki({ config: config });
	invokeParamifier(params, "oninit");
	story = new Story("tiddlerDisplay", "tiddler");
	addEvent(document, "click", Popup.onDocumentClick);
	saveTest();
	for(var i = 0; i < config.notifyTiddlers.length; i++)
		store.addNotification(config.notifyTiddlers[i].name, config.notifyTiddlers[i].notify);
	t1 = new Date();
	loadShadowTiddlers();
	doc.trigger("loadShadows");
	t2 = new Date();
	store.loadFromDiv("storeArea", "store", true);
	doc.trigger("loadTiddlers");
	loadOptions();
	t3 = new Date();
	invokeParamifier(params, "onload");
	t4 = new Date();
	readOnly = window.isLocal() ? false : config.options.chkHttpReadOnly;
	var pluginProblem = loadPlugins("systemConfig");
	doc.trigger("loadPlugins");
	t5 = new Date();
	formatter = new Formatter(config.formatters);
	invokeParamifier(params, "onconfig");
	story.switchTheme(config.options.txtTheme);
	showBackstage = showBackstage !== undefined ? showBackstage : !readOnly;
	t6 = new Date();
	for(var name in config.macros) {
		if(config.macros[name].init)
			config.macros[name].init();
	}
	t7 = new Date();
	store.notifyAll();
	t8 = new Date();
	restart();
	refreshDisplay();
	t9 = new Date();
	if(pluginProblem) {
		story.displayTiddler(null, "PluginManager");
		displayMessage(config.messages.customConfigError);
	}
	if(showBackstage)
		backstage.init();
	t10 = new Date();
	if(config.options.chkDisplayInstrumentation) {
		displayMessage("LoadShadows " + (t2 - t1) + " ms");
		displayMessage("LoadFromDiv " + (t3 - t2) + " ms");
		displayMessage("LoadPlugins " + (t5 - t4) + " ms");
		displayMessage("Macro init " + (t7 - t6) + " ms");
		displayMessage("Notify " + (t8 - t7) + " ms");
		displayMessage("Restart " + (t9 - t8) + " ms");
		displayMessage("Total: " + (t10 - t0) + " ms");
	}
	startingUp = false;
	doc.trigger("startup");
}

// Called on unload. Functions may get unloaded too, so they are called conditionally.
function unload()
{
	if(window.checkUnsavedChanges) checkUnsavedChanges();
	if(window.scrubNodes) scrubNodes(document.body);
}

// Restarting
function restart()
{
	invokeParamifier(params, "onstart");
	if(story.isEmpty()) {
		story.displayDefaultTiddlers();
	}
	window.scrollTo(0, 0);
}

function saveTest()
{
	var s = document.getElementById("saveTest");
	if(s.hasChildNodes())
		alert(config.messages.savedSnapshotError);
	s.appendChild(document.createTextNode("savetest"));
}

function loadShadowTiddlers()
{
	var shadows = new TiddlyWiki();
	shadows.loadFromDiv("shadowArea", "shadows", true);
	shadows.forEachTiddler(function(title, tiddler) { config.shadowTiddlers[title] = tiddler.text });
}

function loadPlugins(tag)
{
	if(safeMode)
		return false;
	var tiddlers = store.getTaggedTiddlers(tag);
	tiddlers.sort(function(a, b) { return a.title < b.title ? -1 : (a.title == b.title ? 0 : 1) });
	var toLoad = [];
	var nLoaded = 0;
	var map = {};
	var nPlugins = tiddlers.length;
	installedPlugins = [];
	for(var i = 0; i < nPlugins; i++) {
		var p = getPluginInfo(tiddlers[i]);
		installedPlugins[i] = p;
		var n = p.Name || p.title;
		if(n) map[n] = p;
		n = p.Source;
		if(n) map[n] = p;
	}
	var visit = function(p) {
		if(!p || p.done) return;
		p.done = 1;
		var reqs = p.Requires;
		if(reqs) {
			reqs = reqs.readBracketedList();
			for(var i = 0; i < reqs.length; i++)
				visit(map[reqs[i]]);
		}
		toLoad.push(p);
	};
	for(i = 0; i < nPlugins; i++)
		visit(installedPlugins[i]);
	for(i = 0; i < toLoad.length; i++) {
		p = toLoad[i];
		pluginInfo = p;
		tiddler = p.tiddler;
		if(isPluginExecutable(p)) {
			if(isPluginEnabled(p)) {
				p.executed = true;
				var startTime = new Date();
				try {
					if(tiddler.text)
						window.eval(tiddler.text);
					nLoaded++;
				} catch(ex) {
					p.log.push(config.messages.pluginError.format([exceptionText(ex)]));
					p.error = true;
					if(!console.tiddlywiki) {
						console.log("error evaluating " + tiddler.title, ex);
					}
				}
				pluginInfo.startupTime = String((new Date()) - startTime) + "ms";
			} else {
				nPlugins--;
			}
		} else {
			p.warning = true;
		}
	}
	return nLoaded != nPlugins;
}

function getPluginInfo(tiddler)
{
	var p = store.getTiddlerSlices(tiddler.title, ["Name", "Description", "Version",
		"Requires", "CoreVersion", "Date", "Source", "Author", "License", "Browsers"]);
	p.tiddler = tiddler;
	p.title = tiddler.title;
	p.log = [];
	return p;
}

// Check that a particular plugin is valid for execution
function isPluginExecutable(plugin)
{
	if(plugin.tiddler.isTagged("systemConfigForce")) {
		plugin.log.push(config.messages.pluginForced);
		return true;
	}
	if(plugin["CoreVersion"]) {
		var coreVersion = plugin["CoreVersion"].split(".");
		var w = parseInt(coreVersion[0], 10) - version.major;
		if(w == 0 && coreVersion[1])
			w = parseInt(coreVersion[1], 10) - version.minor;
		if(w == 0 && coreVersion[2])
			w = parseInt(coreVersion[2], 10) - version.revision;
		if(w > 0) {
			plugin.log.push(config.messages.pluginVersionError);
			return false;
		}
	}
	return true;
}

function isPluginEnabled(plugin)
{
	if(plugin.tiddler.isTagged("systemConfigDisable")) {
		plugin.log.push(config.messages.pluginDisabled);
		return false;
	}
	return true;
}

//--
//-- Paramifiers
//--

function getParameters()
{
	return window.location.hash ? decodeURIComponent(window.location.hash.substr(1)) : null;
}

function invokeParamifier(params, handler)
{
	if(!params || params.length == undefined || params.length <= 1)
		return;

	for(var i = 1; i < params.length; i++) {
		var name = params[i].name,
		    value = params[i].value;
		var p = config.paramifiers[name];
		if(p && p[handler] instanceof Function)
			p[handler](value);
		else {
			var h = config.optionHandlers[name.substr(0, 3)];
			if(h && h.set instanceof Function)
				h.set(name, value);
		}
	}
}

config.paramifiers = {};

config.paramifiers.start = {
	oninit: function(v) {
		safeMode = v.toLowerCase() == "safe";
	}
};

config.paramifiers.open = {
	onstart: function(title) {
		if(!readOnly || store.tiddlerExists(title) || store.isShadowTiddler(title))
			story.displayTiddler("bottom", title, null, false, null);
	}
};

config.paramifiers.story = {
	onstart: function(title) {
		var list = store.getTiddlerText(title, "").parseParams("open", null, false);
		invokeParamifier(list, "onstart");
	}
};

config.paramifiers.search = {
	onstart: function(query) {
		story.search(query, false, false);
	}
};

config.paramifiers.searchRegExp = {
	onstart: function(v) {
		story.prototype.search(v, false, true);
	}
};

config.paramifiers.tag = {
	onstart: function(tag) {
		story.displayTiddlers(null, store.filterTiddlers("[tag[" + tag + "]]"), null, false, null);
	}
};

config.paramifiers.newTiddler = {
	onstart: function(v) {
		if(readOnly) return;
		var args = v.parseParams("anon", null, null)[0];
		var title = args.title ? args.title[0] : v;
		var customFields = args.fields ? args.fields[0] : null;

		story.displayTiddler(null, title, DEFAULT_EDIT_TEMPLATE, false, null, customFields);
		story.focusTiddler(title, "text");
		var i, tags = args.tag || [];
		for(i = 0; i < tags.length; i++) {
			story.setTiddlerTag(title, tags[i], +1);
		}
	}
};

config.paramifiers.newJournal = {
	onstart: function(titleTemplate) {
		if(readOnly) return;
		var now = new Date();
		var title = now.formatString(titleTemplate.trim());
		story.displayTiddler(null, title, DEFAULT_EDIT_TEMPLATE);
		story.focusTiddler(title, "text");
	}
};

config.paramifiers.readOnly = {
	onconfig: function(v) {
		var p = v.toLowerCase();
		readOnly = p == "yes" ? true : (p == "no" ? false : readOnly);
	}
};

config.paramifiers.theme = {
	onconfig: function(themeTitle) {
		story.switchTheme(themeTitle);
	}
};

config.paramifiers.upgrade = {
	onstart: function(v) {
		upgradeFrom(v);
	}
};

config.paramifiers.recent = {
	onstart: function(limit) {
		var titles = [];
		var i, tiddlers = store.getTiddlers("modified", "excludeLists").reverse();
		for(i = 0; i < limit && i < tiddlers.length; i++)
			titles.push(tiddlers[i].title);
		story.displayTiddlers(null, titles);
	}
};

config.paramifiers.filter = {
	onstart: function(filterExpression) {
		story.displayTiddlers(null, store.filterTiddlers(filterExpression), null, false);
	}
};

//--
//-- Formatter helpers
//--

function Formatter(formatters)
{
	this.formatters = [];
	var pattern = [];
	for(var n = 0; n < formatters.length; n++) {
		pattern.push("(" + formatters[n].match + ")");
		this.formatters.push(formatters[n]);
	}
	this.formatterRegExp = new RegExp(pattern.join("|"), "mg");
}

config.formatterHelpers = {

	createElementAndWikify: function(w)
	{
		w.subWikifyTerm(createTiddlyElement(w.output, this.element), this.termRegExp);
	},

	inlineCssHelper: function(w)
	{
		// Convert CSS property name to a JavaScript style name ("background-color" -> "backgroundColor")
		var unDash = function(name) {
			return name
				.split("-")
				.map(function(word, i) {
					return i == 0 ? word :
						word.charAt(0).toUpperCase() + word.slice(1);
				})
				.join("");
		};
		var styles = [];
		config.textPrimitives.cssLookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = config.textPrimitives.cssLookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch) {
			var s, v;
			if(lookaheadMatch[1]) {
				s = unDash(lookaheadMatch[1]);
				v = lookaheadMatch[2];
			} else {
				s = unDash(lookaheadMatch[3]);
				v = lookaheadMatch[4];
			}
			if(s == "bgcolor") s = "backgroundColor";
			if(s == "float") s = "cssFloat";
			styles.push({ style: s, value: v });
			w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
			config.textPrimitives.cssLookaheadRegExp.lastIndex = w.nextMatch;
			lookaheadMatch = config.textPrimitives.cssLookaheadRegExp.exec(w.source);
		}
		return styles;
	},

	applyCssHelper: function(e, styles)
	{
		for(var i = 0; i < styles.length; i++) {
			try {
				e.style[styles[i].style] = styles[i].value;
			} catch (ex) {}
		}
	},

	enclosedTextHelper: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var text = lookaheadMatch[1];
			if(config.browser.isIE && (config.browser.ieVersion[1] < 10))
				text = text.replace(/\n/g, "\r");
			createTiddlyElement(w.output, this.element, null, null, text);
			w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
		}
	},

	isExternalLink: function(link)
	{
		if(store.tiddlerExists(link) || store.isShadowTiddler(link)) {
			return false;
		}
		var urlRegExp = new RegExp(config.textPrimitives.urlPattern, "mg");
		if(urlRegExp.exec(link)) {
			return true;
		}
		if(link.indexOf(".") != -1 ||
		   link.indexOf("\\") != -1 ||
		   link.indexOf("/") != -1 ||
		   link.indexOf("#") != -1
		) {
			return true;
		}
		return false;
	}
};

//--
//-- Standard formatters
//--

config.formatters = [
	{
		name: "table",
		match: "^\\|(?:[^\\n]*)\\|(?:[fhck]?)$",
		lookaheadRegExp: /^\|([^\n]*)\|([fhck]?)$/mg,
		rowTermRegExp: /(\|(?:[fhck]?)$\n?)/mg,
		cellRegExp: /(?:\|([^\n\|]*)\|)|(\|[fhck]?$\n?)/mg,
		cellTermRegExp: /((?:\x20*)\|)/mg,
		rowTypes: { "c": "caption", "h": "thead", "": "tbody", "f": "tfoot" },
		handler: function(w)
		{
			var table = createTiddlyElement(w.output, "table", null, "twtable");
			var prevColumns = [];
			var currRowType = null;
			var rowContainer;
			var rowCount = 0;
			var onmouseover = function() { jQuery(this).addClass("hoverRow") };
			var onmouseout = function() { jQuery(this).removeClass("hoverRow") };
			w.nextMatch = w.matchStart;
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			while(lookaheadMatch && lookaheadMatch.index == w.nextMatch) {
				var nextRowType = lookaheadMatch[2];
				if(nextRowType == "k") {
					table.className = lookaheadMatch[1];
					w.nextMatch += lookaheadMatch[0].length + 1;
				} else {
					if(nextRowType != currRowType) {
						rowContainer = createTiddlyElement(table, this.rowTypes[nextRowType]);
						currRowType = nextRowType;
					}
					if(currRowType == "c") {
						// Caption
						w.nextMatch++;
						if(rowContainer != table.firstChild)
							table.insertBefore(rowContainer, table.firstChild);
						rowContainer.setAttribute("align", rowCount == 0 ? "top" : "bottom");
						w.subWikifyTerm(rowContainer, this.rowTermRegExp);
					} else {
						var theRow = createTiddlyElement(rowContainer, "tr", null, rowCount % 2 ? "oddRow" : "evenRow");
						theRow.onmouseover = onmouseover;
						theRow.onmouseout = onmouseout;
						this.rowHandler(w, theRow, prevColumns);
						rowCount++;
					}
				}
				this.lookaheadRegExp.lastIndex = w.nextMatch;
				lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			}
		},
		rowHandler: function(w, e, prevColumns)
		{
			var col = 0;
			var colSpanCount = 1;
			var prevCell = null;
			this.cellRegExp.lastIndex = w.nextMatch;
			var cellMatch = this.cellRegExp.exec(w.source);
			while(cellMatch && cellMatch.index == w.nextMatch) {
				if(cellMatch[1] == "~") {
					// Rowspan
					var last = prevColumns[col];
					if(last) {
						last.rowSpanCount++;
						last.element.setAttribute("rowspan", last.rowSpanCount);
						last.element.setAttribute("rowSpan", last.rowSpanCount); // Needed for IE
						last.element.valign = "center";
						if(colSpanCount > 1) {
							last.element.setAttribute("colspan", colSpanCount);
							last.element.setAttribute("colSpan", colSpanCount); // Needed for IE
							colSpanCount = 1;
						}
					}
					w.nextMatch = this.cellRegExp.lastIndex - 1;
				} else if(cellMatch[1] == ">") {
					// Colspan
					colSpanCount++;
					w.nextMatch = this.cellRegExp.lastIndex - 1;
				} else if(cellMatch[2]) {
					// End of row
					if(prevCell && colSpanCount > 1) {
						prevCell.setAttribute("colspan", colSpanCount);
						prevCell.setAttribute("colSpan", colSpanCount); // Needed for IE
					}
					w.nextMatch = this.cellRegExp.lastIndex;
					break;
				} else {
					// Cell
					w.nextMatch++;
					var styles = config.formatterHelpers.inlineCssHelper(w);
					var spaceLeft = false;
					var chr = w.source.substr(w.nextMatch, 1);
					while(chr == " ") {
						spaceLeft = true;
						w.nextMatch++;
						chr = w.source.substr(w.nextMatch, 1);
					}
					var cell;
					if(chr == "!") {
						cell = createTiddlyElement(e, "th");
						w.nextMatch++;
					} else {
						var isInsideHeader = e.parentElement.tagName.toLocaleLowerCase() === 'thead';
						cell = createTiddlyElement(e, isInsideHeader ? "th" : "td");
					}
					prevCell = cell;
					prevColumns[col] = { rowSpanCount: 1, element: cell };
					if(colSpanCount > 1) {
						cell.setAttribute("colspan", colSpanCount);
						cell.setAttribute("colSpan", colSpanCount); // Needed for IE
						colSpanCount = 1;
					}
					config.formatterHelpers.applyCssHelper(cell, styles);
					w.subWikifyTerm(cell, this.cellTermRegExp);
					if(w.matchText.substr(w.matchText.length - 2, 1) == " ") // spaceRight
						cell.align = spaceLeft ? "center" : "left";
					else if(spaceLeft)
						cell.align = "right";
					w.nextMatch--;
				}
				col++;
				this.cellRegExp.lastIndex = w.nextMatch;
				cellMatch = this.cellRegExp.exec(w.source);
			}
		}
	},

	{
		name: "heading",
		match: "^!{1,6}",
		termRegExp: /(\n)/mg,
		handler: function(w)
		{
			w.subWikifyTerm(createTiddlyElement(w.output, "h" + w.matchLength), this.termRegExp);
		}
	},

	{
		name: "list",
		match: "^(?:[\\*#;:]+)",
		lookaheadRegExp: /^(?:(?:(\*)|(#)|(;)|(:))+)/mg,
		termRegExp: /(\n)/mg,
		handler: function(w)
		{
			// stack holds nested elements to which (nested) lists are appended
			var stack = [w.output];
			var currLevel = 0, currType = null;
			var listLevel, listType, itemType, baseType;
			w.nextMatch = w.matchStart;
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			while(lookaheadMatch && lookaheadMatch.index == w.nextMatch) {
				if(lookaheadMatch[1]) {
					listType = "ul";
					itemType = "li";
				} else if(lookaheadMatch[2]) {
					listType = "ol";
					itemType = "li";
				} else if(lookaheadMatch[3]) {
					listType = "dl";
					itemType = "dt";
				} else if(lookaheadMatch[4]) {
					listType = "dl";
					itemType = "dd";
				}
				if(!baseType)
					baseType = listType;
				listLevel = lookaheadMatch[0].length;
				w.nextMatch += lookaheadMatch[0].length;
				var l;
				if(listLevel > currLevel) {
					for(l = currLevel; l < listLevel; l++) {
						var target = (currLevel == 0) ? stack[stack.length - 1] : stack[stack.length - 1].lastChild;
						stack.push(createTiddlyElement(target, listType));
					}
				} else if(listType != baseType && listLevel == 1) {
					w.nextMatch -= lookaheadMatch[0].length;
					return;
				} else if(listLevel < currLevel) {
					for(l = currLevel; l > listLevel; l--)
						stack.pop();
				} else if(listLevel == currLevel && listType != currType) {
					stack.pop();
					stack.push(createTiddlyElement(stack[stack.length - 1].lastChild, listType));
				}
				currLevel = listLevel;
				currType = listType;
				var itemElement = createTiddlyElement(stack[stack.length - 1], itemType);
				w.subWikifyTerm(itemElement, this.termRegExp);
				this.lookaheadRegExp.lastIndex = w.nextMatch;
				lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			}
		}
	},

	{
		name: "quoteByBlock",
		match: "^<<<\\n",
		termRegExp: /(^<<<(\n|$))/mg,
		element: "blockquote",
		handler: config.formatterHelpers.createElementAndWikify
	},

	{
		name: "quoteByLine",
		match: "^>+",
		lookaheadRegExp: /^>+/mg,
		termRegExp: /(\n)/mg,
		element: "blockquote",
		handler: function(w)
		{
			var stack = [w.output];
			var currLevel = 0;
			var newLevel = w.matchLength;
			var l, matched;
			do {
				if(newLevel > currLevel) {
					for(l = currLevel; l < newLevel; l++)
						stack.push(createTiddlyElement(stack[stack.length - 1], this.element));
				} else if(newLevel < currLevel) {
					for(l = currLevel; l > newLevel; l--)
						stack.pop();
				}
				currLevel = newLevel;
				w.subWikifyTerm(stack[stack.length - 1], this.termRegExp);
				createTiddlyElement(stack[stack.length - 1], "br");
				this.lookaheadRegExp.lastIndex = w.nextMatch;
				var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
				matched = lookaheadMatch && lookaheadMatch.index == w.nextMatch;
				if(matched) {
					newLevel = lookaheadMatch[0].length;
					w.nextMatch += lookaheadMatch[0].length;
				}
			} while(matched);
		}
	},

	{
		name: "rule",
		match: "^----+$\\n?|<hr ?/?>\\n?",
		handler: function(w)
		{
			createTiddlyElement(w.output, "hr");
		}
	},

	{
		name: "monospacedByLine",
		match: "^(?:/\\*\\{\\{\\{\\*/|\\{\\{\\{|//\\{\\{\\{|<!--\\{\\{\\{-->)\\n",
		element: "pre",
		handler: function(w)
		{
			switch(w.matchText) {
				case "/*{{{*/\n": // CSS
					this.lookaheadRegExp = /\/\*\{\{\{\*\/\n*((?:^[^\n]*\n)+?)(\n*^\f*\/\*\}\}\}\*\/$\n?)/mg;
					break;
				case "{{{\n": // monospaced block
					this.lookaheadRegExp = /^\{\{\{\n((?:^[^\n]*\n)+?)(^\f*\}\}\}$\n?)/mg;
					break;
				case "//{{{\n": // plugin
					this.lookaheadRegExp = /^\/\/\{\{\{\n\n*((?:^[^\n]*\n)+?)(\n*^\f*\/\/\}\}\}$\n?)/mg;
					break;
				case "<!--{{{-->\n": //template
					this.lookaheadRegExp = /<!--\{\{\{-->\n*((?:^[^\n]*\n)+?)(\n*^\f*<!--\}\}\}-->$\n?)/mg;
					break;
				default:
					break;
			}
			config.formatterHelpers.enclosedTextHelper.call(this, w);
		}
	},

	{
		name: "wikifyComment",
		match: "^(?:/\\*\\*\\*|<!---)\\n",
		handler: function(w)
		{
			var termRegExp = (w.matchText == "/***\n") ? (/(^\*\*\*\/\n)/mg) : (/(^--->\n)/mg);
			w.subWikifyTerm(w.output, termRegExp);
		}
	},

	{
		name: "macro",
		match: "<<",
		lookaheadRegExp: /<<([^>\s]+)(?:\s*)((?:[^>]|(?:>(?!>)))*)>>/mg,
		handler: function(w)
		{
			this.lookaheadRegExp.lastIndex = w.matchStart;
			var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			if(lookaheadMatch && lookaheadMatch.index == w.matchStart && lookaheadMatch[1]) {
				w.nextMatch = this.lookaheadRegExp.lastIndex;
				invokeMacro(w.output, lookaheadMatch[1], lookaheadMatch[2], w, w.tiddler);
			}
		}
	},

	{
		name: "prettyLink",
		match: "\\[\\[",
		lookaheadRegExp: /\[\[(.*?)(?:\|(~)?(.*?))?\]\]/mg,
		handler: function(w)
		{
			this.lookaheadRegExp.lastIndex = w.matchStart;
			var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
				var e;
				var text = lookaheadMatch[1];
				if(lookaheadMatch[3]) {
					// Pretty bracketted link
					var link = lookaheadMatch[3];
					e = (!lookaheadMatch[2] && config.formatterHelpers.isExternalLink(link))
						? createExternalLink(w.output, link)
						: createTiddlyLink(w.output, link, false, null, w.isStatic, w.tiddler);
				} else {
					// Simple bracketted link
					e = createTiddlyLink(w.output, text, false, null, w.isStatic, w.tiddler);
				}
				createTiddlyText(e, text);
				w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
		}
	},

	{
		name: "wikiLink",
		match: config.textPrimitives.unWikiLink + "?" + config.textPrimitives.wikiLink,
		handler: function(w)
		{
			if(w.matchText.substr(0, 1) == config.textPrimitives.unWikiLink) {
				w.outputText(w.output, w.matchStart + 1, w.nextMatch);
				return;
			}
			if(w.matchStart > 0) {
				var preRegExp = new RegExp(config.textPrimitives.anyLetterStrict, "mg");
				preRegExp.lastIndex = w.matchStart - 1;
				var preMatch = preRegExp.exec(w.source);
				if(preMatch.index == w.matchStart - 1) {
					w.outputText(w.output, w.matchStart, w.nextMatch);
					return;
				}
			}
			if(w.autoLinkWikiWords || store.isShadowTiddler(w.matchText)) {
				var link = createTiddlyLink(w.output, w.matchText, false, null, w.isStatic, w.tiddler);
				w.outputText(link, w.matchStart, w.nextMatch);
			} else {
				w.outputText(w.output, w.matchStart, w.nextMatch);
			}
		}
	},

	{
		name: "urlLink",
		match: config.textPrimitives.urlPattern,
		handler: function(w)
		{
			w.outputText(createExternalLink(w.output, w.matchText), w.matchStart, w.nextMatch);
		}
	},

	{
		name: "image",
		match: "\\[[<>]?[Ii][Mm][Gg]\\[",
		lookaheadRegExp: /\[([<]?)(>?)[Ii][Mm][Gg]\[(?:([^\|\]]+)\|)?([^\[\]\|]+)\](?:\[([^\]]*)\])?\]/mg,
		handler: function(w)
		{
			this.lookaheadRegExp.lastIndex = w.matchStart;
			var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
				var container = w.output;
				var link = lookaheadMatch[5];
				if(link) {
					container = config.formatterHelpers.isExternalLink(link)
						? createExternalLink(w.output, link)
						: createTiddlyLink(w.output, link, false, null, w.isStatic, w.tiddler);
					jQuery(container).addClass("imageLink");
				}
				var img = createTiddlyElement(container, "img");
				if(lookaheadMatch[1])
					img.align = "left";
				else if(lookaheadMatch[2])
					img.align = "right";
				if(lookaheadMatch[3]) {
					img.title = lookaheadMatch[3];
					img.setAttribute("alt", lookaheadMatch[3]);
				}
				img.src = lookaheadMatch[4];
				w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
		}
	},

	{
		name: "html",
		match: "<[Hh][Tt][Mm][Ll]>",
		lookaheadRegExp: /<[Hh][Tt][Mm][Ll]>((?:.|\n)*?)<\/[Hh][Tt][Mm][Ll]>/mg,
		handler: function(w)
		{
			this.lookaheadRegExp.lastIndex = w.matchStart;
			var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
				createTiddlyElement(w.output, "span").innerHTML = lookaheadMatch[1];
				w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
		}
	},

	{
		name: "commentByBlock",
		match: "/%",
		lookaheadRegExp: /\/%((?:.|\n)*?)%\//mg,
		handler: function(w)
		{
			this.lookaheadRegExp.lastIndex = w.matchStart;
			var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
				w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	},

	{
		name: "characterFormat",
		match: "''|//|__|\\^\\^|~~|--(?!\\s|$)|\\{\\{\\{",
		handler: function(w)
		{
			switch(w.matchText) {
				case "''":
					w.subWikifyTerm(w.output.appendChild(document.createElement("strong")), /('')/mg);
					break;
				case "//":
					w.subWikifyTerm(createTiddlyElement(w.output, "em"), /(\/\/)/mg);
					break;
				case "__":
					w.subWikifyTerm(createTiddlyElement(w.output, "u"), /(__)/mg);
					break;
				case "^^":
					w.subWikifyTerm(createTiddlyElement(w.output, "sup"), /(\^\^)/mg);
					break;
				case "~~":
					w.subWikifyTerm(createTiddlyElement(w.output, "sub"), /(~~)/mg);
					break;
				case "--":
					w.subWikifyTerm(createTiddlyElement(w.output, "strike"), /(--)/mg);
					break;
				case "{{{":
					var lookaheadRegExp = /\{\{\{((?:.|\n)*?)\}\}\}/mg;
					lookaheadRegExp.lastIndex = w.matchStart;
					var lookaheadMatch = lookaheadRegExp.exec(w.source);
					if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
						createTiddlyElement(w.output, "code", null, null, lookaheadMatch[1]);
						w.nextMatch = lookaheadRegExp.lastIndex;
					}
					break;
			}
		}
	},

	{
		name: "customFormat",
		match: "@@|\\{\\{",
		handler: function(w)
		{
			switch(w.matchText) {
				case "@@":
					var e = createTiddlyElement(w.output, "span");
					var styles = config.formatterHelpers.inlineCssHelper(w);
					if(styles.length == 0)
						e.className = "marked";
					else
						config.formatterHelpers.applyCssHelper(e, styles);
					w.subWikifyTerm(e, /(@@)/mg);
					break;
				case "{{":
					var lookaheadRegExp = /\{\{[\s]*([\w]+[\s\w]*)[\s]*\{(\n?)/mg;
					lookaheadRegExp.lastIndex = w.matchStart;
					var lookaheadMatch = lookaheadRegExp.exec(w.source);
					if(lookaheadMatch) {
						w.nextMatch = lookaheadRegExp.lastIndex;
						e = createTiddlyElement(w.output, lookaheadMatch[2] == "\n" ? "div" : "span", null, lookaheadMatch[1]);
						w.subWikifyTerm(e, /(\}\}\})/mg);
					}
					break;
			}
		}
	},

	{
		name: "mdash",
		match: "--",
		handler: function(w)
		{
			createTiddlyElement(w.output, "span").innerHTML = "&mdash;";
		}
	},

	{
		name: "lineBreak",
		match: "\\n|<br ?/?>",
		handler: function(w)
		{
			createTiddlyElement(w.output, "br");
		}
	},

	{
		name: "rawText",
		match: "\"{3}|<nowiki>",
		lookaheadRegExp: /(?:\"{3}|<nowiki>)((?:.|\n)*?)(?:\"{3}|<\/nowiki>)/mg,
		handler: function(w)
		{
			this.lookaheadRegExp.lastIndex = w.matchStart;
			var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
				createTiddlyElement(w.output, "span", null, null, lookaheadMatch[1]);
				w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
		}
	},

	{
		name: "htmlEntitiesEncoding",
		match: "(?:(?:&#?[a-zA-Z0-9]{2,8};|.)" +
			"(?:&#?(?:x0*(?:3[0-6][0-9a-fA-F]|1D[c-fC-F][0-9a-fA-F]|20[d-fD-F][0-9a-fA-F]|FE2[0-9a-fA-F])|0*" +
			"(?:76[89]|7[7-9][0-9]|8[0-7][0-9]|761[6-9]|76[2-7][0-9]|84[0-3][0-9]|844[0-7]|6505[6-9]|6506[0-9]|6507[0-1]));)+" +
			"|&#?[a-zA-Z0-9]{2,8};)",
		handler: function(w)
		{
			createTiddlyElement(w.output, "span").innerHTML = w.matchText;
		}
	}
];

//--
//-- Wikifier
//--

function getParser(tiddler, format)
{
	if(tiddler) {
		if(!format) format = tiddler.fields["wikiformat"];
		var i;
		if(format) {
			for(i in config.parsers)
				if(format == config.parsers[i].format)
					return config.parsers[i];
		} else {
			for(i in config.parsers)
				if(tiddler.isTagged(config.parsers[i].formatTag))
					return config.parsers[i];
		}
	}
	return formatter;
}

function Wikifier(source, formatter, highlightRegExp, tiddler)
{
	this.source = source;
	this.output = null;
	this.formatter = formatter;
	this.nextMatch = 0;
	this.autoLinkWikiWords = tiddler && tiddler.autoLinkWikiWords() == false ? false : true;
	this.highlightRegExp = highlightRegExp;
	this.highlightMatch = null;
	this.isStatic = false;
	if(highlightRegExp) {
		highlightRegExp.lastIndex = 0;
		this.highlightMatch = highlightRegExp.exec(source);
	}
	this.tiddler = tiddler;
}

Wikifier.prototype.wikifyPlain = function()
{
	var e = createTiddlyElement(document.body, "div");
	e.style.display = "none";
	this.subWikify(e);
	var text = jQuery(e).text();
	jQuery(e).remove();
	return text;
};

Wikifier.prototype.subWikify = function(output, terminator)
{
	try {
		if(terminator)
			this.subWikifyTerm(output, new RegExp("(" + terminator + ")", "mg"));
		else
			this.subWikifyUnterm(output);
	} catch(ex) {
		showException(ex);
	}
};

Wikifier.prototype.subWikifyUnterm = function(output)
{
	var oldOutput = this.output;
	this.output = output;
	this.formatter.formatterRegExp.lastIndex = this.nextMatch;
	var formatterMatch;
	while(formatterMatch = this.formatter.formatterRegExp.exec(this.source)) {
		// Output any text before the match
		if(formatterMatch.index > this.nextMatch)
			this.outputText(this.output, this.nextMatch, formatterMatch.index);
		// Set the match parameters for the handler
		this.matchStart = formatterMatch.index;
		this.matchLength = formatterMatch[0].length;
		this.matchText = formatterMatch[0];
		this.nextMatch = this.formatter.formatterRegExp.lastIndex;
		for(var i = 1; i < formatterMatch.length; i++) {
			if(formatterMatch[i]) {
				this.formatter.formatters[i - 1].handler(this);
				this.formatter.formatterRegExp.lastIndex = this.nextMatch;
				break;
			}
		}
	}
	if(this.nextMatch < this.source.length) {
		this.outputText(this.output, this.nextMatch, this.source.length);
		this.nextMatch = this.source.length;
	}
	this.output = oldOutput;
};

Wikifier.prototype.subWikifyTerm = function(output, terminatorRegExp)
{
	var oldOutput = this.output;
	this.output = output;
	terminatorRegExp.lastIndex = this.nextMatch;
	var terminatorMatch = terminatorRegExp.exec(this.source);
	this.formatter.formatterRegExp.lastIndex = this.nextMatch;
	var formatterMatch = this.formatter.formatterRegExp.exec(terminatorMatch ?
		this.source.substr(0, terminatorMatch.index) : this.source);
	while(terminatorMatch || formatterMatch) {
		if(terminatorMatch && (!formatterMatch || terminatorMatch.index <= formatterMatch.index)) {
			if(terminatorMatch.index > this.nextMatch)
				this.outputText(this.output, this.nextMatch, terminatorMatch.index);
			this.matchText = terminatorMatch[1];
			this.matchLength = terminatorMatch[1].length;
			this.matchStart = terminatorMatch.index;
			this.nextMatch = this.matchStart + this.matchLength;
			this.output = oldOutput;
			return;
		}
		if(formatterMatch.index > this.nextMatch)
			this.outputText(this.output, this.nextMatch, formatterMatch.index);
		this.matchStart = formatterMatch.index;
		this.matchLength = formatterMatch[0].length;
		this.matchText = formatterMatch[0];
		this.nextMatch = this.formatter.formatterRegExp.lastIndex;
		for(var i = 1; i < formatterMatch.length; i++) {
			if(formatterMatch[i]) {
				this.formatter.formatters[i - 1].handler(this);
				this.formatter.formatterRegExp.lastIndex = this.nextMatch;
				break;
			}
		}
		terminatorRegExp.lastIndex = this.nextMatch;
		terminatorMatch = terminatorRegExp.exec(this.source);
		formatterMatch = this.formatter.formatterRegExp.exec(terminatorMatch ?
			this.source.substr(0, terminatorMatch.index) : this.source);
	}
	if(this.nextMatch < this.source.length) {
		this.outputText(this.output, this.nextMatch, this.source.length);
		this.nextMatch = this.source.length;
	}
	this.output = oldOutput;
};

Wikifier.prototype.outputText = function(place, startPos, endPos)
{
	while(this.highlightMatch && (this.highlightRegExp.lastIndex > startPos) &&
		  (this.highlightMatch.index < endPos) && (startPos < endPos)) {
		if(this.highlightMatch.index > startPos) {
			createTiddlyText(place, this.source.substring(startPos, this.highlightMatch.index));
			startPos = this.highlightMatch.index;
		}
		var highlightEnd = Math.min(this.highlightRegExp.lastIndex, endPos);
		createTiddlyElement(place, "span", null, "highlight", this.source.substring(startPos, highlightEnd));
		startPos = highlightEnd;
		if(startPos >= this.highlightRegExp.lastIndex)
			this.highlightMatch = this.highlightRegExp.exec(this.source);
	}
	if(startPos < endPos) {
		createTiddlyText(place, this.source.substring(startPos, endPos));
	}
};

function wikify(source, output, highlightRegExp, tiddler)
{
	if(!source) return;
	var wikifier = new Wikifier(source, getParser(tiddler), highlightRegExp, tiddler);
	var t0 = new Date();
	wikifier.subWikify(output);
	if(tiddler && config.options.chkDisplayInstrumentation)
		displayMessage("wikify:" + tiddler.title + " in " + (new Date() - t0) + " ms");
}

function wikifyStatic(source, highlightRegExp, tiddler, format)
{
	if(!source) return "";
	if(!tiddler) tiddler = new Tiddler("temp");
	var wikifier = new Wikifier(source, getParser(tiddler, format), highlightRegExp, tiddler);
	wikifier.isStatic = true;

	var e = createTiddlyElement(document.body, "pre");
	e.style.display = "none";
	wikifier.subWikify(e);
	var html = e.innerHTML;
	jQuery(e).remove();
	return html;
}

function wikifyPlainText(text, limit, tiddler)
{
	if(limit > 0)
		text = text.substr(0, limit);
	var wikifier = new Wikifier(text, formatter, null, tiddler);
	return wikifier.wikifyPlain();
}

function highlightify(source, output, highlightRegExp, tiddler)
{
	if(!source) return;
	var wikifier = new Wikifier(source, formatter, highlightRegExp, tiddler);
	wikifier.outputText(output, 0, source.length);
}

//--
//-- Macro definitions
//--

function invokeMacro(place, macro, params, wikifier, tiddler)
{
	try {
		var m = config.macros[macro];
		if(m && m.handler) {
			var tiddlerElem = story.findContainingTiddler(place);

			window.tiddler = tiddlerElem ? store.getTiddler(tiddlerElem.getAttribute("tiddler")) : null;
			window.place = place;

			var allowEval = true;
			if(config.evaluateMacroParameters == "system") {
				if(!tiddler || tiddler.tags.indexOf("systemAllowEval") == -1) {
					allowEval = false;
				}
			}
			m.handler(place, macro, m.noPreParse ? null : params.readMacroParams(!allowEval), wikifier, params, tiddler);
		} else {
			createTiddlyError(place, config.messages.macroError.format([macro]),
				config.messages.macroErrorDetails.format([macro, config.messages.missingMacro]));
		}
	} catch(ex) {
		createTiddlyError(place, config.messages.macroError.format([macro]),
			config.messages.macroErrorDetails.format([macro, ex.toString()]));
	}
}

config.macros.version.handler = function(place)
{
	jQuery("<span/>").text(formatVersion()).appendTo(place);
};

config.macros.today.handler = function(place, macroName, params)
{
	var now = new Date();
	var text = params[0] ? now.formatString(params[0].trim()) : now.toLocaleString();
	jQuery("<span/>").text(text).appendTo(place);
};

config.macros.list.template = "<<view title link>>";
config.macros.list.handler = function(place, macroName, params, wikifier, paramString)
{
	var list = document.createElement("ul");
	jQuery(list).attr({ refresh: "macro", macroName: macroName }).data("params", paramString);
	place.appendChild(list);
	this.refresh(list);
};

config.macros.list.refresh = function(list)
{
	var paramString = jQuery(list).data("params");
	var params = paramString.readMacroParams();
	var args = paramString.parseParams("anon", null, null)[0];
	var type = args.anon ? args.anon[0] : "all";
	var template = args.template ? store.getTiddlerText(args.template[0]) : false;
	if(!template) {
		template = config.macros.list.template;
	}
	var results;
	if(this[type].handler)
		results = this[type].handler(params);

	jQuery(list).empty().addClass("list list-" + type);
	if(this[type].prompt)
		createTiddlyElement(list, "li", null, "listTitle", this[type].prompt);

	for(var i = 0; i < results.length; i++) {
		var li = createTiddlyElement(list, "li");
		var tiddler = results[i];
		if(typeof(tiddler) == 'string') { // deal with missing etc..
			tiddler = store.getTiddler(tiddler) || new Tiddler(tiddler);
		}
		wikify(template, li, null, tiddler);
	}
	if(results.length === 0 && args.emptyMessage) {
		jQuery(list).addClass("emptyList");
		jQuery("<li />").text(args.emptyMessage[0]).appendTo(list);
	}
};

config.macros.list.all.handler = function(params)
{
	return store.reverseLookup("tags", "excludeLists", false, "title");
};

config.macros.list.missing.handler = function(params)
{
	return store.getMissingLinks();
};

config.macros.list.orphans.handler = function(params)
{
	return store.getOrphans();
};

config.macros.list.shadowed.handler = function(params)
{
	return store.getShadowed();
};

config.macros.list.touched.handler = function(params)
{
	return store.getTouched();
};

config.macros.list.filter.handler = function(params)
{
	var filter = params[1];
	if(!filter) return [];
	return store.filterTiddlers(filter).map(function(tiddler) {
		return tiddler.title;
	});
};

config.macros.allTags.handler = function(place, macroName, params)
{
	var tags = store.getTags(params[0]);
	var ul = createTiddlyElement(place, "ul");
	if(tags.length == 0) createTiddlyElement(ul, "li", null, "listTitle", this.noTags);

	for(var i = 0; i < tags.length; i++) {
		var title = tags[i][0];
		var info = getTiddlyLinkInfo(title);
		var li = createTiddlyElement(ul, "li");
		var btn = createTiddlyButton(li, title + " (" + tags[i][1] + ")",
			this.tooltip.format([title]), onClickTag, info.classes);
		btn.setAttribute("tag", title);
		btn.setAttribute("refresh", "link");
		btn.setAttribute("tiddlyLink", title);
		if(params[1]) btn.setAttribute("sortby", params[1]);
	}
};

var macro = config.macros.timeline;
merge(macro, {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		var container = jQuery("<div />").attr("params", paramString).
			attr("macroName", macroName).appendTo(place)[0];
		macro.refresh(container);
	},
	refresh: function(container) {
		jQuery(container).attr("refresh", "macro").empty();
		var paramString = jQuery(container).attr("params");
		var args = paramString.parseParams("anon", null, null)[0];
		var params = args.anon || [];

		var field = params[0] || "modified";
		var prefix = field.charAt(0);
		var no_prefix_field = prefix === "-" || prefix === "+" ? field.substr(1, field.length) : field;
		var dateFormat = params[2] || this.dateFormat;

		var groupTemplate = (args.groupTemplate ? store.getTiddlerText(args.groupTemplate[0]) : null)
			|| macro.groupTemplate.format(no_prefix_field, dateFormat);
		var itemTemplate = (args.template ? store.getTiddlerText(args.template[0]) : null)
			|| macro.itemTemplate;

		var tiddlers = args.filter ? store.sortTiddlers(store.filterTiddlers(args.filter[0]), field) :
			store.reverseLookup("tags", "excludeLists", false, field);
		var last = params[1] ? tiddlers.length - Math.min(tiddlers.length, parseInt(params[1], 10)) : 0;
		var lastGroup = "", ul;

		for(var i = tiddlers.length - 1; i >= last; i--) {
			var theGroup = wikifyPlainText(groupTemplate, 0, tiddlers[i]);
			if(ul === undefined || theGroup != lastGroup) {
				ul = createTiddlyElement(container, "ul", null, "timeline");
				createTiddlyElement(ul, "li", null, "listTitle", theGroup);
				lastGroup = theGroup;
			}
			var item = createTiddlyElement(ul, "li", null, "listLink");
			wikify(itemTemplate, item, null, tiddlers[i]);
		}
	},
	groupTemplate: "<<view %0 date '%1'>>",
	itemTemplate: "<<view title link>>"
});

config.macros.tiddler.handler = function(place, macroName, params, wikifier, paramString, tiddler)
{
	var allowEval = true;
	var stack = config.macros.tiddler.tiddlerStack;
	if(stack.length > 0 && config.evaluateMacroParameters == "system") {
		// included tiddler and "system" evaluation required, so check tiddler tagged appropriately
		var title = stack[stack.length - 1];
		var pos = title.indexOf(config.textPrimitives.sectionSeparator);
		if(pos != -1) {
			title = title.substr(0, pos); // get the base tiddler title
		}
		var t = store.getTiddler(title);
		if(!t || t.tags.indexOf("systemAllowEval") == -1) {
			allowEval = false;
		}
	}
	params = paramString.parseParams("name", null, allowEval, false, true);
	var names = params[0]["name"];
	var tiddlerName = names[0];
	var className = names[1] || null;
	var args = params[0]["with"];

	var wrapper = createTiddlyElement(place, "span", null, className, null, {
		refresh: "content", tiddler: tiddlerName
	});
	if(args !== undefined)
		wrapper.macroArgs = args; // #154
	this.transclude(wrapper, tiddlerName, args);
};

config.macros.tiddler.transclude = function(wrapper, tiddlerName, args)
{
	var text = store.getTiddlerText(tiddlerName);
	if(!text) return;

	var stack = config.macros.tiddler.tiddlerStack;
	if(stack.indexOf(tiddlerName) !== -1) return;

	stack.push(tiddlerName);
	try {
		// substitute $1, $2, .. placeholders (markers)
		if(typeof args == "string")
			args = args.readBracketedList();
		var maxSupportedPlaceholders = 9; // $1 - $9
		var n = args ? args.length : 0;
		for(var i = 0; i < maxSupportedPlaceholders; i++) {
			var placeholderRE = new RegExp("\\$" + (i + 1), "mg");
			if(i < n) {
				text = text.replace(placeholderRE, args[i]);
			}
			// #162
			else if(n && config.options.chkRemoveExtraMarkers) {
				text = text.replace(placeholderRE, "");
			}
		}

		config.macros.tiddler.renderText(wrapper, text, tiddlerName);
	} finally {
		stack.pop();
	}
};

config.macros.tiddler.renderText = function(place, text, tiddlerName)
{
	wikify(text, place, null, store.getTiddler(tiddlerName));
};

config.macros.tiddler.tiddlerStack = [];

config.macros.tag.handler = function(place, macroName, params)
{
	var btn = createTagButton(place, params[0], null, params[1], params[2]);
	if(params[3]) btn.setAttribute('sortby', params[3]);
};

config.macros.tags.handler = function(place, macroName, params, wikifier, paramString, tiddler)
{
	params = paramString.parseParams("anon", null, true, false, false);
	var title = getParam(params, "anon", "");
	if(title && store.tiddlerExists(title))
		tiddler = store.getTiddler(title);
	var sep = getParam(params, "sep", " ");
	var lingo = config.views.wikified.tag;

	var ul = createTiddlyElement(place, "ul");
	createTiddlyElement(ul, "li", null, "listTitle",
		(tiddler.tags.length ? lingo.labelTags : lingo.labelNoTags).format([tiddler.title])
	);
	for(var i = 0; i < tiddler.tags.length; i++) {
		var tag = store.getTiddler(tiddler.tags[i]);
		if(tag && tag.tags.indexOf("excludeLists") != -1) continue;
		createTagButton(createTiddlyElement(ul, "li"), tiddler.tags[i], tiddler.title);
		if(i < tiddler.tags.length - 1)
			createTiddlyText(ul, sep);
	}
};

config.macros.tagging.handler = function(place, macroName, params, wikifier, paramString, tiddler)
{
	params = paramString.parseParams("anon", null, true, false, false);
	var title = getParam(params, "anon", "");
	if(title == "" && tiddler instanceof Tiddler)
		title = tiddler.title;
	var sep = getParam(params, "sep", " ");
	var sortby = getParam(params, "sortBy", false);
	var tagged = store.getTaggedTiddlers(title, sortby);
	var prompt = tagged.length == 0 ? this.labelNotTag : this.label;

	var ul = createTiddlyElement(place, "ul");
	ul.setAttribute("title", this.tooltip.format([title]));
	createTiddlyElement(ul, "li", null, "listTitle", prompt.format([title, tagged.length]));

	for(var i = 0; i < tagged.length; i++) {
		createTiddlyLink(createTiddlyElement(ul, "li"), tagged[i].title, true);
		if(i < tagged.length - 1)
			createTiddlyText(ul, sep);
	}
};

config.macros.closeAll.handler = function(place)
{
	createTiddlyButton(place, this.label, this.prompt, this.onClick);
};

config.macros.closeAll.onClick = function(e)
{
	story.closeAllTiddlers();
	return false;
};

config.macros.permaview.handler = function(place)
{
	createTiddlyButton(place, this.label, this.prompt, this.onClick);
};

config.macros.permaview.onClick = function(e)
{
	story.permaView();
	return false;
};

config.macros.saveChanges.handler = function(place, macroName, params)
{
	if(!readOnly)
		createTiddlyButton(place, params[0] || this.label, params[1] || this.prompt, this.onClick, null, null, this.accessKey);
};

config.macros.saveChanges.onClick = function(e)
{
	saveChanges();
	return false;
};

config.macros.slider.onClickSlider = function(ev)
{
	var n = this.nextSibling;
	var cookie = n.getAttribute("cookie");
	var isOpen = n.style.display != "none";
	if(config.options.chkAnimate && anim && typeof Slider == "function")
		anim.startAnimating(new Slider(n, !isOpen, null, "none"));
	else
		n.style.display = isOpen ? "none" : "block";
	config.options[cookie] = !isOpen;
	saveOption(cookie);
	return false;
};

config.macros.slider.createSlider = function(place, cookie, title, tooltip)
{
	var c = cookie || "";
	createTiddlyButton(place, title, tooltip, this.onClickSlider);
	var panel = createTiddlyElement(null, "div", null, "sliderPanel");
	panel.setAttribute("cookie", c);
	panel.style.display = config.options[c] ? "block" : "none";
	place.appendChild(panel);
	return panel;
};

config.macros.slider.handler = function(place, macroName, params)
{
	var panel = this.createSlider(place, params[0], params[2], params[3]);
	var text = store.getTiddlerText(params[1]);
	panel.setAttribute("refresh", "content");
	panel.setAttribute("tiddler", params[1]);
	if(text)
		wikify(text, panel, null, store.getTiddler(params[1]));
};

// <<gradient [[tiddler name]] vert|horiz rgb rgb rgb rgb... >>
config.macros.gradient.handler = function(place, macroName, params, wikifier, paramString, tiddler)
{
	var panel = wikifier ? createTiddlyElement(place, "div", null, "gradient") : place;
	panel.style.position = "relative";
	panel.style.overflow = "hidden";
	panel.style.zIndex = "0";
	if(wikifier) {
		var styles = config.formatterHelpers.inlineCssHelper(wikifier);
		config.formatterHelpers.applyCssHelper(panel, styles);
	}
	params = paramString.parseParams("color");
	var loColors = [], hiColors = [];

	for(var i = 2; i < params.length; i++) {
		var c = params[i].value;
		if(params[i].name == "snap") {
			hiColors[hiColors.length - 1] = c;
		} else {
			loColors.push(c);
			hiColors.push(c);
		}
	}
	drawGradient(panel, params[1].value != "vert", loColors, hiColors);
	if(wikifier)
		wikifier.subWikify(panel, ">>");
	if(document.all) {
		panel.style.height = "100%";
		panel.style.width = "100%";
	}
};

config.macros.message.handler = function(place, macroName, params)
{
	if(!params[0]) return;

	var names = params[0].split(".");
	var lookupMessage = function(root, nameIndex) {
		if(root[names[nameIndex]]) {
			if(nameIndex < names.length - 1)
				return (lookupMessage(root[names[nameIndex]], nameIndex + 1));
			else
				return root[names[nameIndex]];
		} else
			return null;
	};
	var m = lookupMessage(config, 0);
	if(m == null)
		m = lookupMessage(window, 0);
	createTiddlyText(place, m.toString().format(params.splice(1)));
};

config.macros.view.depth = 0;
config.macros.view.values = [];
config.macros.view.views = {
	text: function(value, place, params, wikifier, paramString, tiddler) {
		highlightify(value, place, highlightHack, tiddler);
	},
	link: function(value, place, params, wikifier, paramString, tiddler) {
		createTiddlyLink(place, value, true);
	},
	wikified: function(value, place, params, wikifier, paramString, tiddler) {
		if(config.macros.view.depth > 50)
			return;
		if(config.macros.view.depth > 0) {
			if (value == config.macros.view.values[config.macros.view.depth - 1]) {
				return;
			}
		}
		config.macros.view.values[config.macros.view.depth] = value;
		config.macros.view.depth++;
		if(params[2])
			value = params[2].unescapeLineBreaks().format([value]);
		wikify(value, place, highlightHack, tiddler);
		config.macros.view.depth--;
		config.macros.view.values[config.macros.view.depth] = null;
	},
	date: function(value, place, params, wikifier, paramString, tiddler) {
		value = Date.convertFromYYYYMMDDHHMM(value);
		createTiddlyText(place, value.formatString(params[2] || config.views.wikified.dateFormat));
	}
};

config.macros.view.handler = function(place, macroName, params, wikifier, paramString, tiddler)
{
	if(!(tiddler instanceof Tiddler) || !params[0]) return;
	var value = store.getValue(tiddler, params[0]);
	if(!value) return;

	var type = params[1] || config.macros.view.defaultView;
	var handler = config.macros.view.views[type];
	if(handler)
		handler(value, place, params, wikifier, paramString, tiddler);
};

config.macros.edit.handler = function(place, macroName, params, wikifier, paramString, tiddler)
{
	var field = params[0];
	var rows = params[1] || 0;
	var defaultValue = params[2] || '';
	if(!(tiddler instanceof Tiddler) || !field) return;

	story.setDirty(tiddler.title, true);
	var e, value = store.getValue(tiddler, field) || defaultValue;
	if(field != "text" && !rows) {
		e = createTiddlyElement(place, "input", null, null, null, {
			type: "text", edit: field, size: "40", autocomplete: "off"
		});
		e.value = value;
	} else {
		rows = rows || 10;
		var lines = value.match(/\n/mg);
		var maxLines = Math.max(parseInt(config.options.txtMaxEditRows), 5);
		if(lines != null && lines.length > rows)
			rows = lines.length + 5;
		rows = Math.min(rows, maxLines);

		var wrapper1 = createTiddlyElement(null, "fieldset", null, "fieldsetFix");
		var wrapper2 = createTiddlyElement(wrapper1, "div");
		e = createTiddlyElement(wrapper2, "textarea");
		e.value = value;
		e.setAttribute("rows", rows);
		e.setAttribute("edit", field);
		place.appendChild(wrapper1);
	}
	if(tiddler.isReadOnly()) {
		e.setAttribute("readOnly", "readOnly");
		jQuery(e).addClass("readOnly");
	}
	return e;
};

config.macros.tagChooser.onClick = function(ev)
{
	var e = ev || window.event;
	var lingo = config.views.editor.tagChooser;
	var popup = Popup.create(this);
	var tags = store.getTags(this.getAttribute("tags"));

	for(var i = 0; i < tags.length; i++) {
		var tag = createTiddlyButton(createTiddlyElement(popup, "li"), tags[i][0],
			lingo.tagTooltip.format([tags[i][0]]), config.macros.tagChooser.onTagClick);
		tag.setAttribute("tag", tags[i][0]);
		tag.setAttribute("tiddler", this.getAttribute("tiddler"));
	}
	if(tags.length == 0) jQuery("<li/>").addClass('disabled').text(lingo.popupNone).appendTo(popup);

	Popup.show();
	e.cancelBubble = true;
	if(e.stopPropagation) e.stopPropagation();
	return false;
};

config.macros.tagChooser.onTagClick = function(ev)
{
	var e = ev || window.event;
	if(e.metaKey || e.ctrlKey) stopEvent(e); //# keep popup open on CTRL-click
	var tag = this.getAttribute("tag");
	var title = this.getAttribute("tiddler");
	if(!readOnly)
		story.setTiddlerTag(title, tag, 0);
	return false;
};

config.macros.tagChooser.handler = function(place, macroName, params, wikifier, paramString, tiddler)
{
	if(!(tiddler instanceof Tiddler)) return;
	var lingo = config.views.editor.tagChooser;
	createTiddlyButton(place, lingo.text, lingo.tooltip, this.onClick, null, null, null, {
		tiddler: tiddler.title,
		tags: params[0]
	});
};

config.macros.refreshDisplay.handler = function(place)
{
	createTiddlyButton(place, this.label, this.prompt, this.onClick);
};

config.macros.refreshDisplay.onClick = function(e)
{
	refreshAll();
	return false;
};

config.macros.annotations.handler = function(place, macroName, params, wikifier, paramString, tiddler)
{
	var title = tiddler ? tiddler.title : null;
	var annotation = title ? config.annotations[title] : null;
	if(!tiddler || !title || !annotation) return;
	var text = annotation.format([title]);
	wikify(text, createTiddlyElement(place, "div", null, "annotation"), null, tiddler);
};

//--
//-- NewTiddler and NewJournal macros
//--

config.macros.newTiddler.createNewTiddlerButton = function(place,
	title, params, label, prompt, accessKey, newFocus, isJournal)
{
	label = getParam(params, "label", label);
	prompt = getParam(params, "prompt", prompt);
	accessKey = getParam(params, "accessKey", accessKey);
	var customFields = getParam(params, "fields", "");
	if(!customFields && !store.isShadowTiddler(title))
		customFields = String.encodeHashMap(config.defaultCustomFields);
	var tags = [];
	for(var i = 1; i < params.length; i++) {
		if((params[i].name == "anon" && i != 1) || (params[i].name == "tag"))
			tags.push(params[i].value);
	}
	var text = getParam(params, "text");

	var btn = createTiddlyButton(place, label, prompt, this.onClickNewTiddler, null, null, accessKey, {
		newTitle: title,
		isJournal: isJournal ? "true" : "false",
		newFocus: getParam(params, "focus", newFocus),
		newTemplate: getParam(params, "template", DEFAULT_EDIT_TEMPLATE)
	});
	if(tags.length > 0)
		btn.setAttribute("params", tags.join("|"));
	if(customFields !== "")
		btn.setAttribute("customFields", customFields);
	if(text !== undefined)
		btn.setAttribute("newText", text);
	return btn;
};

config.macros.newTiddler.onClickNewTiddler = function()
{
	var title = this.getAttribute("newTitle");
	if(this.getAttribute("isJournal") == "true") {
		title = new Date().formatString(title.trim());
	}
	var params = this.getAttribute("params");
	var tags = params ? params.split("|") : [];
	var focus = this.getAttribute("newFocus");
	var template = this.getAttribute("newTemplate");
	var customFields = this.getAttribute("customFields");
	if(!customFields && !store.isShadowTiddler(title))
		customFields = String.encodeHashMap(config.defaultCustomFields);

	story.displayTiddler(this, title, template, false, null, null); // #161
	var tiddlerElem = story.getTiddler(title);
	if(customFields)
		story.addCustomFields(tiddlerElem, customFields);
	var text = this.getAttribute("newText");
	if(typeof text == "string" && story.getTiddlerField(title, "text"))
		story.getTiddlerField(title, "text").value = text.format([title]);
	for(var i = 0; i < tags.length; i++)
		story.setTiddlerTag(title, tags[i], +1);
	story.focusTiddler(title, focus);
	return false;
};

config.macros.newTiddler.handler = function(place, macroName, params, wikifier, paramString)
{
	if(readOnly) return;
	params = paramString.parseParams("anon", null, true, false, false);
	var title = params[1] && params[1].name == "anon" ? params[1].value : this.title;
	title = getParam(params, "title", title);
	this.createNewTiddlerButton(place, title, params, this.label, this.prompt, this.accessKey, "title", false);
};

config.macros.newJournal.handler = function(place, macroName, params, wikifier, paramString)
{
	if(readOnly) return;
	params = paramString.parseParams("anon", null, true, false, false);
	var title = params[1] && params[1].name == "anon" ? params[1].value : config.macros.timeline.dateFormat;
	title = getParam(params, "title", title);
	config.macros.newTiddler.createNewTiddlerButton(place, title,
		params, this.label, this.prompt, this.accessKey, "text", true);
};

//--
//-- Search macro
//--

config.macros.search.handler = function(place, macroName, params, wikifier, paramString, tiddler)
{
	params = paramString.parseParams("anon", null, false, false, false);
	createTiddlyButton(place, this.label, this.prompt, this.onClick, "searchButton");
	var attributes = {
		size: this.sizeTextbox,
		accessKey: getParam(params, "accesskey", this.accessKey),
		autocomplete: "off",
		lastSearchText: "",
		placeholder: getParam(params, "placeholder", this.placeholder)
	};
	if(config.browser.isSafari) {
		attributes.type = "search";
		attributes.results = "5";
	} else {
		attributes.type = "text";
	}
	var input = createTiddlyElement(place, "input", null, "txtOptionInput searchField", null, attributes);
	input.value = getParam(params, "anon", "");
	input.onkeyup = this.onKeyPress;
	input.onfocus = this.onFocus;
};

// Global because there's only ever one outstanding incremental search timer
config.macros.search.timeout = null;

config.macros.search.doSearch = function(input)
{
	if(input.value.length == 0) return;
	story.search(input.value, config.options.chkCaseSensitiveSearch, config.options.chkRegExpSearch);
	input.setAttribute("lastSearchText", input.value);
};

config.macros.search.onClick = function(e)
{
	config.macros.search.doSearch(this.nextSibling);
	return false;
};

config.macros.search.onKeyPress = function(ev)
{
	var me = config.macros.search;
	var e = ev || window.event;
	switch(e.keyCode) {
		case 9: // Tab
			return;
		case 13: // Ctrl-Enter
		case 10: // Ctrl-Enter on IE PC
			me.doSearch(this);
			break;
		case 27: // Escape
			this.value = "";
			clearMessage();
			break;
	}
	if(config.options.chkIncrementalSearch) {
		if(this.value.length > 2) {
			if(this.value != this.getAttribute("lastSearchText")) {
				if(me.timeout) clearTimeout(me.timeout);
				var input = this;
				me.timeout = setTimeout(function() { me.doSearch(input) }, 500);
			}
		} else {
			if(me.timeout) clearTimeout(me.timeout);
		}
	}
};

config.macros.search.onFocus = function(e)
{
	this.select();
};

//--
//-- Tabs macro
//--

config.macros.tabs.handler = function(place, macroName, params)
{
	var cookie = params[0];
	var numTabs = (params.length - 1) / 3;
	var wrapper = createTiddlyElement(null, "div", null, "tabsetWrapper " + cookie);
	var tabset = createTiddlyElement(wrapper, "div", null, "tabset");
	tabset.setAttribute("cookie", cookie);
	var validTab = false;
	for(var i = 0; i < numTabs; i++) {
		var label = params[i * 3 + 1];
		var prompt = params[i * 3 + 2];
		var content = params[i * 3 + 3];
		var tab = createTiddlyButton(tabset, label, prompt, this.onClickTab, "tab tabUnselected");
		createTiddlyElement(tab, "span", null, null, " ", { style: "font-size:0pt;line-height:0px" });
		tab.setAttribute("tab", label);
		tab.setAttribute("content", content);
		tab.title = prompt;
		if(config.options[cookie] == label)
			validTab = true;
	}
	if(!validTab)
		config.options[cookie] = params[1];
	place.appendChild(wrapper);
	this.switchTab(tabset, config.options[cookie]);
};

config.macros.tabs.onClickTab = function(e)
{
	config.macros.tabs.switchTab(this.parentNode, this.getAttribute("tab"));
	return false;
};

config.macros.tabs.switchTab = function(tabset, tab)
{
	var cookie = tabset.getAttribute("cookie");
	var theTab = null;
	var nodes = tabset.childNodes;
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i].getAttribute && nodes[i].getAttribute("tab") == tab) {
			theTab = nodes[i];
			theTab.className = "tab tabSelected";
		} else {
			nodes[i].className = "tab tabUnselected";
		}
	}
	if(!theTab) return;

	if(tabset.nextSibling && tabset.nextSibling.className == "tabContents")
		jQuery(tabset.nextSibling).remove();
	var tabContent = createTiddlyElement(null, "div", null, "tabContents");
	tabset.parentNode.insertBefore(tabContent, tabset.nextSibling);
	var contentTitle = theTab.getAttribute("content");
	wikify(store.getTiddlerText(contentTitle), tabContent, null, store.getTiddler(contentTitle));
	if(cookie) {
		config.options[cookie] = tab;
		saveOption(cookie);
	}
};

//--
//-- Tiddler toolbar
//--

// Create a toolbar command button
config.macros.toolbar.createCommand = function(place, commandName, tiddler, className)
{
	if(!(tiddler instanceof Tiddler)) return;
	if(typeof commandName != "string") {
		for(var name in config.commands) {
			if(config.commands[name] == commandName)
				commandName = name;
		}
	}
	if(typeof commandName != "string") return;
	var command = config.commands[commandName];
	if(command.isEnabled ? !command.isEnabled(tiddler) : !this.isCommandEnabled(command, tiddler))
		return;

	var text = command.getText ? command.getText(tiddler) : this.getCommandText(command, tiddler);
	var tooltip = command.getTooltip ? command.getTooltip(tiddler) : this.getCommandTooltip(command, tiddler);
	var cmd = command.type == "popup" ? this.onClickPopup : this.onClickCommand;
	var btn = createTiddlyButton(place, text, tooltip, cmd, "button command_" + commandName, null, null, {
		commandName: commandName,
		tiddler: tiddler.title
	});
	if(className) jQuery(btn).addClass(className);
};

config.macros.toolbar.isCommandEnabled = function(command, tiddler)
{
	var title = tiddler.title;
	var shadow = store.isShadowTiddler(title) && !store.tiddlerExists(title);
	if(shadow && command.hideShadow) return false;
	var ro = tiddler.isReadOnly();
	return !ro || (ro && !command.hideReadOnly);
};

config.macros.toolbar.getCommandText = function(command, tiddler)
{
	return (tiddler.isReadOnly() && command.readOnlyText) || command.text;
};

config.macros.toolbar.getCommandTooltip = function(command, tiddler)
{
	return (tiddler.isReadOnly() && command.readOnlyTooltip) || command.tooltip;
};

config.macros.toolbar.onClickCommand = function(ev)
{
	var e = ev || window.event;
	e.cancelBubble = true;
	if(e.stopPropagation) e.stopPropagation();
	var command = config.commands[this.getAttribute("commandName")];
	return command.handler(e, this, this.getAttribute("tiddler"));
};

config.macros.toolbar.onClickPopup = function(ev)
{
	var e = ev || window.event;
	e.cancelBubble = true;
	if(e.stopPropagation) e.stopPropagation();
	var popup = Popup.create(this);
	var title = this.getAttribute("tiddler");
	popup.setAttribute("tiddler", title);
	var command = config.commands[this.getAttribute("commandName")];
	command.handlePopup(popup, title);
	Popup.show();
	return false;
};

// Invoke the first command encountered from a given place that is tagged with a specified class
config.macros.toolbar.invokeCommand = function(place, className, event)
{
	var children = place.getElementsByTagName("a");
	for(var i = 0; i < children.length; i++) {
		var c = children[i];
		if(jQuery(c).hasClass(className) && c.getAttribute && c.getAttribute("commandName")) {
			if(c.onclick instanceof Function)
				c.onclick.call(c, event);
			break;
		}
	}
};

config.macros.toolbar.onClickMore = function(ev)
{
	var e = this.nextSibling;
	e.style.display = "inline";
	this.style.display = "none";
	return false;
};

config.macros.toolbar.onClickLess = function(ev)
{
	var e = this.parentNode;
	var m = e.previousSibling;
	e.style.display = "none";
	m.style.display = "inline";
	return false;
};

config.macros.toolbar.handler = function(place, macroName, params, wikifier, paramString, tiddler)
{
	for(var i = 0; i < params.length; i++) {
		var commandName = params[i];
		switch(commandName) {
			case "!":
				createTiddlyText(place, this.separator);
				break;
			case "*":
				createTiddlyElement(place, "br");
				break;
			case "<":
				createTiddlyButton(place, this.lessLabel, this.lessPrompt,
					config.macros.toolbar.onClickLess, "button lessCommand");
				break;
			case ">":
				createTiddlyButton(place, this.moreLabel, this.morePrompt,
					config.macros.toolbar.onClickMore, "button moreCommand");
				place = createTiddlyElement(place, "span", null, "moreCommand");
				place.style.display = "none";
				break;
			default:
				var className = "";
				switch(commandName.substring(0, 1)) {
					case "+":
						className = "defaultCommand";
						commandName = commandName.substring(1);
						break;
					case "-":
						className = "cancelCommand";
						commandName = commandName.substring(1);
						break;
				}
				if(config.commands[commandName]) {
					this.createCommand(place, commandName, tiddler, className);
				} else {
					this.customCommand(place, commandName, wikifier, tiddler);
				}
				break;
		}
	}
};

// Overrideable function to extend toolbar handler
config.macros.toolbar.customCommand = function(place, command, wikifier, tiddler)
{
};

//--
//-- Menu and toolbar commands
//--

config.commands.closeTiddler.handler = function(event, src, title)
{
	if(story.isDirty(title) && !readOnly) {
		if(!confirm(config.commands.cancelTiddler.warning.format([title])))
			return false;
	}
	story.setDirty(title, false);
	story.closeTiddler(title, true);
	return false;
};

config.commands.closeOthers.handler = function(event, src, title)
{
	story.closeAllTiddlers(title);
	return false;
};

config.commands.editTiddler.handler = function(event, src, title)
{
	clearMessage();
	var tiddlerElem = story.getTiddler(title);
	var fields = tiddlerElem.getAttribute("tiddlyFields");
	story.displayTiddler(null, title, DEFAULT_EDIT_TEMPLATE, false, null, fields);

	var editorElement = story.getTiddlerField(title, config.options.txtEditorFocus || "text");
	if(editorElement) setCaretPosition(editorElement, 0);
	return false;
};

config.commands.saveTiddler.handler = function(event, src, title)
{
	var newTitle = story.saveTiddler(title, event.shiftKey);
	if(newTitle) story.displayTiddler(null, newTitle);
	return false;
};

config.commands.cancelTiddler.handler = function(event, src, title)
{
	if(story.hasChanges(title) && !readOnly) {
		if(!confirm(this.warning.format([title])))
			return false;
	}
	story.setDirty(title, false);
	story.displayTiddler(null, title);
	return false;
};

config.commands.deleteTiddler.handler = function(event, src, title)
{
	var deleteIt = true;
	if(config.options.chkConfirmDelete) deleteIt = confirm(this.warning.format([title]));
	if(!deleteIt) return false;

	store.removeTiddler(title);
	story.closeTiddler(title, true);
	autoSaveChanges();
	return false;
};

config.commands.permalink.handler = function(event, src, title)
{
	var hash = story.getPermaViewHash([title]);
	if(window.location.hash != hash) window.location.hash = hash;
	return false;
};

config.commands.references.handlePopup = function(popup, title)
{
	var references = store.getReferringTiddlers(title);
	var hasRefs = false;
	for(var i = 0; i < references.length; i++) {
		if(references[i].title != title && !references[i].isTagged("excludeLists")) {
			createTiddlyLink(createTiddlyElement(popup, "li"), references[i].title, true);
			hasRefs = true;
		}
	}
	if(!hasRefs) createTiddlyElement(popup, "li", null, "disabled", this.popupNone);
};

config.commands.jump.handlePopup = function(popup, title)
{
	story.forEachTiddler(function(title, element) {
		createTiddlyLink(createTiddlyElement(popup, "li"), title, true, null, false, null, true);
	});
};

config.commands.fields.handlePopup = function(popup, title)
{
	var tiddler = store.fetchTiddler(title);
	if(!tiddler) return;
	var items = [];
	store.forEachField(tiddler, function(tiddler, fieldName, value) {
		items.push({ field: fieldName, value: value }); }, true);
	items.sort(function(a, b) { return a.field < b.field ? -1 : (a.field == b.field ? 0 : +1) });

	if(items.length > 0) {
		ListView.create(popup, items, this.listViewTemplate);
	} else {
		createTiddlyElement(popup, "li", null, "disabled", this.emptyText);
	}
};

//--
//-- Tiddler() object
//--

function Tiddler(title)
{
	this.title = title;
	this.text = "";
	this.creator = null;
	this.modifier = null;
	this.created = new Date();
	this.modified = this.created;
	this.links = [];
	this.linksUpdated = false;
	this.tags = [];
	this.fields = {};
	return this;
}

Tiddler.prototype.getLinks = function()
{
	if(this.linksUpdated == false) this.changed();
	return this.links;
};

// Returns the fields that are inherited in string field:"value" field2:"value2" format
Tiddler.prototype.getInheritedFields = function()
{
	var f = {};
	for(var i in this.fields) {
		if(i == "server.host" || i == "server.workspace" || i == "wikiformat" || i == "server.type") {
			f[i] = this.fields[i];
		}
	}
	return String.encodeHashMap(f);
};

// Increment the changeCount of a tiddler
Tiddler.prototype.incChangeCount = function()
{
	var c = this.fields['changecount'];
	c = c ? parseInt(c, 10) : 0;
	this.fields['changecount'] = String(c + 1);
};

Tiddler.prototype.clearChangeCount = function()
{
	if(this.fields['changecount']) {
		delete this.fields['changecount'];
	}
};

Tiddler.prototype.doNotSave = function()
{
	return this.fields['doNotSave'];
};

// Returns true if the tiddler has been updated since the tiddler was created or downloaded
Tiddler.prototype.isTouched = function()
{
	var changecount = this.fields.changecount || 0;
	return changecount > 0;
};

// Change the text and other attributes of a tiddler
Tiddler.prototype.set = function(title, text, modifier, modified, tags, created, fields, creator)
{
	this.assign(title, text, modifier, modified, tags, created, fields, creator);
	this.changed();
	return this;
};

// Change the text and other attributes of a tiddler without triggered a tiddler.changed() call
Tiddler.prototype.assign = function(title, text, modifier, modified, tags, created, fields, creator)
{
	if(title != undefined) this.title = title;
	if(text != undefined) this.text = text;
	if(modifier != undefined) this.modifier = modifier;
	if(modified != undefined) this.modified = modified;
	if(creator != undefined) this.creator = creator;
	if(created != undefined) this.created = created;
	if(fields != undefined) this.fields = fields;
	if(tags != undefined) this.tags = (typeof tags == "string") ? tags.readBracketedList() : tags;
	else if(this.tags == undefined) this.tags = [];
	return this;
};

// Get the tags for a tiddler as a string (space delimited, using [[brackets]] for tags containing spaces)
Tiddler.prototype.getTags = function()
{
	return String.encodeTiddlyLinkList(this.tags);
};

// Test if a tiddler carries a tag
Tiddler.prototype.isTagged = function(tag)
{
	return this.tags.indexOf(tag) != -1;
};

// Static method to convert "\n" to newlines, "\s" to "\"
Tiddler.unescapeLineBreaks = function(text)
{
	return text ? text.unescapeLineBreaks() : "";
};

// Convert newlines to "\n", "\" to "\s"
Tiddler.prototype.escapeLineBreaks = function()
{
	return this.text.escapeLineBreaks();
};

// Updates the secondary information (like .links array) after a change to a tiddler
Tiddler.prototype.changed = function()
{
	this.links = [];
	var text = this.text;
	// remove 'quoted' text before scanning tiddler source
	text = text.replace(/\/%((?:.|\n)*?)%\//g, "")
		.replace(/\{{3}((?:.|\n)*?)\}{3}/g, "")
		.replace(/"""((?:.|\n)*?)"""/g, "")
		.replace(/<nowiki\>((?:.|\n)*?)<\/nowiki\>/g, "")
		.replace(/<html\>((?:.|\n)*?)<\/html\>/g, "")
		.replace(/<script((?:.|\n)*?)<\/script\>/g, "");
	var t = this.autoLinkWikiWords() ? 0 : 1;
	var tiddlerLinkRegExp = t == 0 ?
		config.textPrimitives.tiddlerAnyLinkRegExp :
		config.textPrimitives.tiddlerForcedLinkRegExp;
	tiddlerLinkRegExp.lastIndex = 0;
	var formatMatch = tiddlerLinkRegExp.exec(text);
	while(formatMatch) {
		var lastIndex = tiddlerLinkRegExp.lastIndex;
		if(t == 0 && formatMatch[1] && formatMatch[1] != this.title) {
			// wikiWordLink
			if(formatMatch.index > 0) {
				var preRegExp = new RegExp(config.textPrimitives.unWikiLink + "|" +
					config.textPrimitives.anyLetter, "mg");
				preRegExp.lastIndex = formatMatch.index - 1;
				var preMatch = preRegExp.exec(text);
				if(preMatch.index != formatMatch.index - 1)
					this.links.pushUnique(formatMatch[1]);
			} else {
				this.links.pushUnique(formatMatch[1]);
			}
		}
		else if(formatMatch[2 - t] && !config.formatterHelpers.isExternalLink(formatMatch[3 - t]))
			// titledBrackettedLink
			this.links.pushUnique(formatMatch[3 - t]);
		else if(formatMatch[4 - t] && formatMatch[4 - t] != this.title) // brackettedLink
			this.links.pushUnique(formatMatch[4 - t]);
		tiddlerLinkRegExp.lastIndex = lastIndex;
		formatMatch = tiddlerLinkRegExp.exec(text);
	}
	this.linksUpdated = true;
};

Tiddler.prototype.getSubtitle = function()
{
	var modifier = this.modifier || config.messages.subtitleUnknown || "";
	var modified = this.modified ?
		this.modified.toLocaleString() :
		config.messages.subtitleUnknown || "";
	var f = config.messages.tiddlerLinkTooltip || "%0 - %1, %2";
	return f.format([this.title, modifier, modified]);
};

Tiddler.prototype.isReadOnly = function()
{
	return readOnly;
};

Tiddler.prototype.autoLinkWikiWords = function()
{
	return !(this.isTagged("systemConfig") || this.isTagged("excludeMissing"));
};

Tiddler.prototype.getServerType = function()
{
	var serverType = this.fields['server.type'] || this.fields['wikiformat'];
	if(serverType && !config.adaptors[serverType]) return null;
	return serverType;
};

Tiddler.prototype.getAdaptor = function()
{
	var serverType = this.getServerType();
	return serverType ? new config.adaptors[serverType]() : null;
};

//--
//-- TiddlyWiki instance contains TiddlerS
//--

function TiddlyWiki(params)
{
	var tiddlers = {}; // Hashmap by name of tiddlers
	if(params && params.config) {
		this.config = config;
	}
	this.tiddlersUpdated = false;
	this.namedNotifications = []; // Array of {name:,notify:} of notification functions
	this.notificationLevel = 0;
	this.slices = {}; // map tiddlerName->(map sliceName->sliceValue). Lazy.
	this.clear = function() {
		tiddlers = {};
		this.setDirty(false);
	};
	this.fetchTiddler = function(title) {
		var t = tiddlers[title];
		return t instanceof Tiddler ? t : null;
	};
	this.deleteTiddler = function(title) {
		delete this.slices[title];
		delete tiddlers[title];
	};
	this.addTiddler = function(tiddler) {
		delete this.slices[tiddler.title];
		tiddlers[tiddler.title] = tiddler;
	};
	this.forEachTiddler = function(callback) {
		for(var title in tiddlers) {
			var tiddler = tiddlers[title];
			if(tiddler instanceof Tiddler)
				callback.call(this, title, tiddler);
		}
	};
}

TiddlyWiki.prototype.setDirty = function(dirty)
{
	this.dirty = dirty;
};

TiddlyWiki.prototype.isDirty = function()
{
	return this.dirty;
};

TiddlyWiki.prototype.tiddlerExists = function(title)
{
	return this.fetchTiddler(title) != undefined;
};

TiddlyWiki.prototype.isShadowTiddler = function(title)
{
	return config.shadowTiddlers[title] === undefined ? false : true;
};

TiddlyWiki.prototype.isAvailable = function(title) {
	if(!title) return false;
	var i = title.indexOf(config.textPrimitives.sectionSeparator);
	if(i != -1) title = title.substring(0, i);
	return this.tiddlerExists(title) || this.isShadowTiddler(title);
};

TiddlyWiki.prototype.createTiddler = function(title)
{
	var tiddler = this.fetchTiddler(title);
	if(!tiddler) {
		tiddler = new Tiddler(title);
		this.addTiddler(tiddler);
		this.setDirty(true);
	}
	return tiddler;
};

TiddlyWiki.prototype.getTiddler = function(title)
{
	return this.fetchTiddler(title) || null;
};

TiddlyWiki.prototype.getShadowTiddlerText = function(title)
{
	return (typeof config.shadowTiddlers[title] == "string")
		? config.shadowTiddlers[title]
		: "";
};

// Retrieve tiddler contents
TiddlyWiki.prototype.getTiddlerText = function(title, defaultText)
{
	if(!title) return defaultText;

	var pos = title.indexOf(config.textPrimitives.sectionSeparator);
	var section = null;
	if(pos != -1) {
		section = title.substr(pos + config.textPrimitives.sectionSeparator.length);
		title = title.substr(0, pos);
	}
	pos = title.indexOf(config.textPrimitives.sliceSeparator);
	if(pos != -1) {
		var sliceNameStart = pos + config.textPrimitives.sliceSeparator.length;
		var slice = this.getTiddlerSlice(title.substr(0, pos), title.substr(sliceNameStart));
		if(slice) return slice;
	}

	var tiddler = this.fetchTiddler(title);
	var text = tiddler ? tiddler.text : null;
	if(!tiddler && this.isShadowTiddler(title)) {
		text = this.getShadowTiddlerText(title);
	}
	if(!text) return defaultText != undefined ? defaultText : null;
	if(!section) return text;

	var headerRE = new RegExp("(^!{1,6}[ \t]*" + section.escapeRegExp() + "[ \t]*\n)", "mg");
	headerRE.lastIndex = 0;
	var match = headerRE.exec(text);
	if(!match) return defaultText;

	var t = text.substr(match.index + match[1].length);
	var nextHeaderRE = /^!/mg;
	nextHeaderRE.lastIndex = 0;
	match = nextHeaderRE.exec(t);
	return !match ? t :
		// don't include final \n
		t.substr(0, match.index - 1);
};

TiddlyWiki.prototype.getRecursiveTiddlerText = function(title, defaultText, depth)
{
	var text = this.getTiddlerText(title, null);
	if(text == null) return defaultText;

	var bracketRegExp = new RegExp("(?:\\[\\[([^\\]]+)\\]\\])", "mg");
	var textOut = [], match, lastPos = 0;
	do {
		if(match = bracketRegExp.exec(text)) {
			textOut.push(text.substr(lastPos, match.index - lastPos));
			if(match[1]) {
				if(depth <= 0)
					textOut.push(match[1]);
				else
					textOut.push(this.getRecursiveTiddlerText(match[1], "", depth - 1));
			}
			lastPos = match.index + match[0].length;
		} else {
			textOut.push(text.substr(lastPos));
		}
	} while(match);
	return textOut.join("");
};

//TiddlyWiki.prototype.slicesRE = /(?:^([\'\/]{0,2})~?([\.\w]+)\:\1[\t\x20]*([^\n]+)[\t\x20]*$)|(?:^\|([\'\/]{0,2})~?([\.\w]+)\:?\4\|[\t\x20]*([^\n]+)[\t\x20]*\|$)/gm;
TiddlyWiki.prototype.slicesRE = /(?:^([\'\/]{0,2})~?([\.\w]+)\:\1[\t\x20]*([^\n]+)[\t\x20]*$)|(?:^\|\x20?([\'\/]{0,2})~?([^\|\s\:\~\'\/]|(?:[^\|\s~\'\/][^\|\n\f\r]*[^\|\s\:\'\/]))\:?\4[\x20\t]*\|[\t\x20]*([^\n\t\x20](?:[^\n]*[^\n\t\x20])?)[\t\x20]*\|$)/gm; // #112
// @internal
TiddlyWiki.prototype.calcAllSlices = function(title)
{
	var text = this.getTiddlerText(title, "");
	this.slicesRE.lastIndex = 0;
	var slices = {}, m;
	while(m = this.slicesRE.exec(text)) {
		if(m[2])
			slices[m[2]] = m[3];
		else
			slices[m[5]] = m[6];
	}
	return slices;
};

// Returns the slice of text of the given name
TiddlyWiki.prototype.getTiddlerSlice = function(title, sliceName)
{
	var slices = this.slices[title];
	if(!slices) {
		slices = this.calcAllSlices(title);
		this.slices[title] = slices;
	}
	return slices[sliceName];
};

// Build an hashmap of the specified named slices of a tiddler
TiddlyWiki.prototype.getTiddlerSlices = function(title, sliceNames)
{
	var i, r = {};
	for(i = 0; i < sliceNames.length; i++) {
		var slice = this.getTiddlerSlice(title, sliceNames[i]);
		if(slice) r[sliceNames[i]] = slice;
	}
	return r;
};

TiddlyWiki.prototype.suspendNotifications = function()
{
	this.notificationLevel--;
};

TiddlyWiki.prototype.resumeNotifications = function()
{
	this.notificationLevel++;
};

// Invoke the notification handlers for a particular tiddler
TiddlyWiki.prototype.notify = function(title, doBlanket)
{
	if(this.notificationLevel) return;
	for(var i = 0; i < this.namedNotifications.length; i++) {
		var n = this.namedNotifications[i];
		if((n.name == null && doBlanket) || (n.name == title))
			n.notify(title);
	}
};

// Invoke the notification handlers for all tiddlers
TiddlyWiki.prototype.notifyAll = function()
{
	if(this.notificationLevel) return;
	for(var i = 0; i < this.namedNotifications.length; i++) {
		var n = this.namedNotifications[i];
		if(n.name)
			n.notify(n.name);
	}
};

// Add a notification handler to a tiddler unless it's already set
TiddlyWiki.prototype.addNotification = function(title, fn)
{
	for(var i = 0; i < this.namedNotifications.length; i++) {
		if((this.namedNotifications[i].name == title) && (this.namedNotifications[i].notify == fn))
			return this;
	}
	this.namedNotifications.push({ name: title, notify: fn });
	return this;
};

TiddlyWiki.prototype.removeTiddler = function(title)
{
	var tiddler = this.fetchTiddler(title);
	if(tiddler) {
		this.deleteTiddler(title);
		this.notify(title, true);
		this.setDirty(true);
	}
};

// Reset the sync status of a freshly synced tiddler
TiddlyWiki.prototype.resetTiddler = function(title)
{
	var tiddler = this.fetchTiddler(title);
	if(tiddler) {
		tiddler.clearChangeCount();
		this.notify(title, true);
		this.setDirty(true);
	}
};

TiddlyWiki.prototype.setTiddlerTag = function(title, status, tag)
{
	var tiddler = this.fetchTiddler(title);
	if(!tiddler) return;

	var t = tiddler.tags.indexOf(tag);
	if(t != -1)
		tiddler.tags.splice(t, 1);
	if(status)
		tiddler.tags.push(tag);

	tiddler.changed();
	tiddler.incChangeCount();
	this.notify(title, true);
	this.setDirty(true);
};

TiddlyWiki.prototype.addTiddlerFields = function(title, fields)
{
	var tiddler = this.fetchTiddler(title);
	if(!tiddler) return;

	merge(tiddler.fields, fields);
	tiddler.changed();
	tiddler.incChangeCount();
	this.notify(title, true);
	this.setDirty(true);
};

// Store tiddler in TiddlyWiki instance
TiddlyWiki.prototype.saveTiddler = function(titleOrTiddler, newTitle, newBody,
	modifier, modified, tags, fields, clearChangeCount, created, creator)
{
	var wasTiddlerProvided = titleOrTiddler instanceof Tiddler;
	var tiddler = this.resolveTiddler(titleOrTiddler);
	var title = tiddler ? tiddler.title : titleOrTiddler;
	newTitle = newTitle || title;

	if(tiddler) {
		this.deleteTiddler(title); //# clean up slices for title, make sure the tiddler is not copied when renamed
		created = created || tiddler.created; // Preserve created date
		creator = creator || tiddler.creator;
	} else {
		tiddler = new Tiddler();
		created = created || modified;
	}

	if(wasTiddlerProvided) {
		tiddler.fields = merge(merge({}, tiddler.fields), config.defaultCustomFields, true);
	} else {
		fields = merge(merge({}, fields), config.defaultCustomFields, true);
		tiddler.set(newTitle, newBody, modifier, modified, tags, created, fields, creator);
	}
	if(clearChangeCount)
		tiddler.clearChangeCount();
	else
		tiddler.incChangeCount();

	this.addTiddler(tiddler); //# clean up slices for newTitle, add/return the tiddler
	if(title != newTitle) this.notify(title, true);
	this.notify(newTitle, true);
	this.setDirty(true);

	return tiddler;
};

TiddlyWiki.prototype.incChangeCount = function(title)
{
	var tiddler = this.fetchTiddler(title);
	if(tiddler)
		tiddler.incChangeCount();
};

TiddlyWiki.prototype.getLoader = function()
{
	if(!this.loader)
		this.loader = new TW21Loader();
	return this.loader;
};

TiddlyWiki.prototype.getSaver = function()
{
	if(!this.saver)
		this.saver = new TW21Saver();
	return this.saver;
};

// Return all tiddlers formatted as an HTML string
TiddlyWiki.prototype.allTiddlersAsHtml = function()
{
	return this.getSaver().externalize(store);
};

// Load contents of a TiddlyWiki from an HTML DIV
TiddlyWiki.prototype.loadFromDiv = function(src, idPrefix, noUpdate)
{
	var storeElem = (typeof src == "string") ? document.getElementById(src) : src;
	if(!storeElem) return;

	this.idPrefix = idPrefix;
	var tiddlers = this.getLoader().loadTiddlers(this, storeElem.childNodes);
	this.setDirty(false);
	if(!noUpdate) {
		for(var i = 0; i < tiddlers.length; i++)
			tiddlers[i].changed();
	}
	jQuery(document).trigger("loadTiddlers");
};

// Load contents of a TiddlyWiki from a string
// Returns null if there's an error
TiddlyWiki.prototype.importTiddlyWiki = function(text)
{
	var posDiv = locateStoreArea(text);
	if(!posDiv) return null;
	var content = "<" + "html><" + "body>" + text.substring(posDiv[0], posDiv[1] + endSaveArea.length) + "<" + "/body><" + "/html>";

	// Create an iframe
	var iframe = document.createElement("iframe");
	iframe.style.display = "none";
	document.body.appendChild(iframe);
	var doc = iframe.document;
	if(iframe.contentDocument)
		doc = iframe.contentDocument; // For NS6
	else if(iframe.contentWindow)
		doc = iframe.contentWindow.document; // For IE5.5 and IE6

	// Put the content in the iframe
	doc.open();
	doc.writeln(content);
	doc.close();

	// Load the content into a TiddlyWiki() object
	var storeArea = doc.getElementById("storeArea");
	this.loadFromDiv(storeArea, "store");

	iframe.parentNode.removeChild(iframe);
	return this;
};

TiddlyWiki.prototype.updateTiddlers = function()
{
	this.tiddlersUpdated = true;
	this.forEachTiddler(function(title, tiddler) {
		tiddler.changed();
	});
};

// Return an array of tiddlers matching a search regular expression
TiddlyWiki.prototype.search = function(searchRegExp, sortField, excludeTag, match)
{
	var candidates = this.reverseLookup("tags", excludeTag, !!match);
	var i, results = [];
	for(i = 0; i < candidates.length; i++) {
		if((candidates[i].title.search(searchRegExp) != -1) || (candidates[i].text.search(searchRegExp) != -1))
			results.push(candidates[i]);
	}
	if(!sortField) sortField = "title";
	results.sort(function(a, b) { return a[sortField] < b[sortField] ? -1 : (a[sortField] == b[sortField] ? 0 : +1) });
	return results;
};

// Returns a list of all tags in use (in the form of an array of [tagName, numberOfOccurances] "tuples")
//   excludeTag - if present, excludes tags that are themselves tagged with excludeTag
TiddlyWiki.prototype.getTags = function(excludeTag)
{
	var results = [];
	this.forEachTiddler(function(title, tiddler) {
	    var i, j;
		for(i = 0; i < tiddler.tags.length; i++) {
			var tag = tiddler.tags[i];
			var isTagToAdd = true;
			for(j = 0; j < results.length; j++) {
				if(results[j][0] == tag) {
					isTagToAdd = false;
					results[j][1]++;
				}
			}
			if(isTagToAdd && excludeTag) {
				var t = this.fetchTiddler(tag);
				if(t && t.isTagged(excludeTag))
					isTagToAdd = false;
			}
			if(isTagToAdd) results.push([tag, 1]);
		}
	});
	results.sort(function(a, b) {
		var tag1 = a[0].toLowerCase(), tag2 = b[0].toLowerCase();
		return tag1 < tag2 ? -1 : (tag1 == tag2 ? 0 : +1);
	});
	return results;
};

// Return an array of the tiddlers that are tagged with a given tag
TiddlyWiki.prototype.getTaggedTiddlers = function(tag, sortField)
{
	return this.reverseLookup("tags", tag, true, sortField);
};

TiddlyWiki.prototype.getValueTiddlers = function(field, value, sortField)
{
	return this.reverseLookup(field, value, true, sortField);
};

// Return an array of the tiddlers that link to a given tiddler
TiddlyWiki.prototype.getReferringTiddlers = function(title, unusedParameter, sortField)
{
	if(!this.tiddlersUpdated)
		this.updateTiddlers();
	return this.reverseLookup("links", title, true, sortField);
};

// Return an array of the tiddlers that have a specified entry (lookupValue) in the specified field (lookupField, like "links" or "tags")
// if shouldMatch == true, or don't have such entry (if shouldMatch == false)
TiddlyWiki.prototype.reverseLookup = function(lookupField, lookupValue, shouldMatch, sortField)
{
	var results = [];
	this.forEachTiddler(function(title, tiddler) {
		var values;
		if(["links", "tags"].contains(lookupField)) {
			values = tiddler[lookupField];
		} else {
			var accessor = TiddlyWiki.standardFieldAccess[lookupField];
			values = accessor ? [ accessor.get(tiddler) ] :
				( tiddler.fields[lookupField] ? [tiddler.fields[lookupField]] : [] );
		}

		var hasMatch = false;
		for(var i = 0; i < values.length; i++) {
			if(values[i] == lookupValue)
				hasMatch = true;
		}
		if(hasMatch == !!shouldMatch) results.push(tiddler);
	});
	return this.sortTiddlers(results, sortField || "title");
};

// Return the tiddlers as a sorted array
TiddlyWiki.prototype.getTiddlers = function(field, excludeTag)
{
	var results = [];
	this.forEachTiddler(function(title, tiddler) {
		if(excludeTag == undefined || !tiddler.isTagged(excludeTag))
			results.push(tiddler);
	});
	if(field) results.sort(function(a, b) { return a[field] < b[field] ? -1 : (a[field] == b[field] ? 0 : +1) });
	return results;
};

// Return array of names of tiddlers that are referred to but not defined
TiddlyWiki.prototype.getMissingLinks = function()
{
	if(!this.tiddlersUpdated) this.updateTiddlers();

	var results = [];
	this.forEachTiddler(function (title, tiddler) {
		if(tiddler.isTagged("excludeMissing") || tiddler.isTagged("systemConfig"))
			return;

		for(var i = 0; i < tiddler.links.length; i++) {
			var link = tiddler.links[i];
			if(this.getTiddlerText(link, null) == null && !this.isShadowTiddler(link) && !config.macros[link])
				results.pushUnique(link);
		}
	});
	results.sort();
	return results;
};

// Return an array of names of tiddlers that are defined but not referred to
TiddlyWiki.prototype.getOrphans = function()
{
	var results = [];
	this.forEachTiddler(function (title, tiddler) {
		if(this.getReferringTiddlers(title).length == 0 && !tiddler.isTagged("excludeLists"))
			results.push(title);
	});
	results.sort();
	return results;
};

// Return an array of names of all the shadow tiddlers
TiddlyWiki.prototype.getShadowed = function()
{
	var t, results = [];
	for(t in config.shadowTiddlers) {
		if(this.isShadowTiddler(t))
			results.push(t);
	}
	results.sort();
	return results;
};

// Return an array of tiddlers that have been touched since they were downloaded or created
TiddlyWiki.prototype.getTouched = function()
{
	var results = [];
	this.forEachTiddler(function(title, tiddler) {
		if(tiddler.isTouched())
			results.push(tiddler);
	});
	results.sort();
	return results;
};

// Resolves a Tiddler reference or tiddler title into a Tiddler object, or null if it doesn't exist
TiddlyWiki.prototype.resolveTiddler = function(tiddler)
{
	var t = (typeof tiddler == "string") ? this.getTiddler(tiddler) : tiddler;
	return t instanceof Tiddler ? t : null;
};

// Sort a list of tiddlers
TiddlyWiki.prototype.sortTiddlers = function(tiddlers, field)
{
	var asc = +1;
	switch(field.substr(0, 1)) {
		case "-":
			asc = -1;
			field = field.substr(1);
			break;
		case "+":
			field = field.substr(1);
			break;
	}
	if(TiddlyWiki.standardFieldAccess[field]) {
		if(field == "title") {
			tiddlers.sort(function(a, b) {
				var t1 = a[field].toLowerCase(), t2 = b[field].toLowerCase();
				return t1 < t2 ? -asc : (t1 == t2 ? 0 : asc);
			});
		} else {
			tiddlers.sort(function(a, b) {
				return a[field] < b[field] ? -asc : (a[field] == b[field] ? 0 : asc);
			});
		}
	} else {
		tiddlers.sort(function(a, b) {
			return a.fields[field] < b.fields[field] ? -asc : (a.fields[field] == b.fields[field] ? 0 : +asc);
		});
	}
	return tiddlers;
};

//--
//-- Filter a list of tiddlers
//--

config.filters = {
	tiddler: function(results, match) {
		var title = match[1] || match[4];
		var tiddler = this.fetchTiddler(title);
		if(tiddler) {
			results.pushUnique(tiddler);
		} else if(this.isShadowTiddler(title)) {
			tiddler = new Tiddler();
			tiddler.set(title, this.getTiddlerText(title));
			results.pushUnique(tiddler);
		} else {
			results.pushUnique(new Tiddler(title));
		}
		return results;
	},
	tag: function(results, match) {
		var i, matched = this.getTaggedTiddlers(match[3]);
		for(i = 0; i < matched.length; i++) {
			results.pushUnique(matched[i]);
		}
		return results;
	},
	sort: function(results, match) {
		return this.sortTiddlers(results, match[3]);
	},
	limit: function(results, match) {
		return results.slice(0, parseInt(match[3], 10));
	},
	field: function(results, match) {
		var i, matched = this.getValueTiddlers(match[2], match[3]);
		for (i = 0; i < matched.length; i++) {
			results.pushUnique(matched[i]);
		}
		return results;
	}
};

// Filter a list of tiddlers
TiddlyWiki.prototype.filterTiddlers = function(filter, results)
{
	var re = /([^\s\[\]]+)|(?:\[([ \w\.\-]+)\[([^\]]+)\]\])|(?:\[\[([^\]]+)\]\])/mg;

	results = results || [];
	if(filter) {
		var match;
		while(match = re.exec(filter)) {
			var handler = (match[1] || match[4]) ? 'tiddler' :
				config.filters[match[2]] ? match[2] : 'field';
			results = config.filters[handler].call(this, results, match);
		}
	}
	return results;
};

// Returns true if path is a valid field name (path),
// i.e. a sequence of identifiers, separated by "."
TiddlyWiki.isValidFieldName = function(name)
{
	var match = /[a-zA-Z_]\w*(\.[a-zA-Z_]\w*)*/.exec(name);
	return match && (match[0] == name);
};

// Throws an exception when name is not a valid field name.
TiddlyWiki.checkFieldName = function(name)
{
	if(!TiddlyWiki.isValidFieldName(name))
		throw config.messages.invalidFieldName.format([name]);
};

function StringFieldAccess(fName, readOnly)
{
	this.set = readOnly ?
		function(tiddler, newValue) {
			if(newValue != tiddler[fName]) throw config.messages.fieldCannotBeChanged.format([fName]);
		} :
		function(tiddler, newValue) {
			if(newValue == tiddler[fName]) return;
			tiddler[fName] = newValue;
			return true;
		};
	this.get = function(tiddler) { return tiddler[fName] };
}

function DateFieldAccess(fName)
{
	this.set = function(tiddler, newValue) {
		var d = newValue instanceof Date ? newValue : Date.convertFromYYYYMMDDHHMM(newValue);
		if(d == tiddler[fName]) return;
		tiddler[fName] = d;
		return true;
	};
	this.get = function(tiddler) { return tiddler[fName].convertToYYYYMMDDHHMM() };
}

function LinksFieldAccess(fName)
{
	this.set = function(tiddler, newValue) {
		var items = (typeof newValue == "string") ? newValue.readBracketedList() : newValue;
		if(items.toString() == tiddler[fName].toString()) return;
		tiddler[fName] = items;
		return true;
	};
	this.get = function(tiddler) { return String.encodeTiddlyLinkList(tiddler[fName]) };
}

TiddlyWiki.standardFieldAccess = {
	// The set functions return true when setting the data has changed the value.
	"title":    new StringFieldAccess("title", true),
	// Handle the "tiddler" field name as the title
	"tiddler":  new StringFieldAccess("title", true),
	"text":     new StringFieldAccess("text"),
	"modifier": new StringFieldAccess("modifier"),
	"modified": new DateFieldAccess("modified"),
	"creator":  new StringFieldAccess("creator"),
	"created":  new DateFieldAccess("created"),
	"tags":     new LinksFieldAccess("tags")
};

TiddlyWiki.isStandardField = function(name)
{
	return TiddlyWiki.standardFieldAccess[name] != undefined;
};

// Sets the value of the given field of the tiddler to the value.
// Setting an ExtendedField's value to null or undefined removes the field.
// Setting a namespace to undefined removes all fields of that namespace.
// The fieldName is case-insensitive.
// All values will be converted to a string value.
TiddlyWiki.prototype.setValue = function(tiddlerOrTitle, fieldName, value)
{
	TiddlyWiki.checkFieldName(fieldName);
	var t = this.resolveTiddler(tiddlerOrTitle);
	if(!t) return;

	fieldName = fieldName.toLowerCase();
	var isRemove = (value === undefined) || (value === null);
	var accessor = TiddlyWiki.standardFieldAccess[fieldName];
	if(accessor) {
		// don't remove StandardFields
		if(isRemove) return;
		if(!accessor.set(t, value)) return;
	} else {
		var oldValue = t.fields[fieldName];
		if(isRemove) {
			if(oldValue !== undefined) {
				// deletes a single field
				delete t.fields[fieldName];
			} else {
				// no concrete value is defined for the fieldName
				// so we guess this is a namespace path.
				// delete all fields in a namespace
				var re = new RegExp("^" + fieldName + "\\.");
				var dirty = false;
				for(var n in t.fields) {
					if(n.match(re)) {
						delete t.fields[n];
						dirty = true;
					}
				}
				if(!dirty) return;
			}
		} else {
			// the "normal" set case. value is defined (not null/undefined)
			// For convenience convert Date -> String
			value = value instanceof Date ? value.convertToYYYYMMDDHHMMSSMMM() : String(value);
			if(oldValue == value) return;
			t.fields[fieldName] = value;
		}
	}

	// When we are here the tiddler/store really was changed.
	this.notify(t.title, true);
	if(!fieldName.match(/^temp\./))
		this.setDirty(true);
};

// Returns the value of the given field of the tiddler.
// The fieldName is case-insensitive.
// Will only return String values (or undefined).
TiddlyWiki.prototype.getValue = function(tiddlerOrTitle, fieldName)
{
	var t = this.resolveTiddler(tiddlerOrTitle);
	if(!t) return undefined;

	if(fieldName.indexOf(config.textPrimitives.sectionSeparator) === 0 ||
	   fieldName.indexOf(config.textPrimitives.sliceSeparator) === 0
	) {
		var separator = fieldName.substr(0, 2);
		var partName = fieldName.substring(2);
		return store.getTiddlerText(t.title + separator + partName);
	} else {
		fieldName = fieldName.toLowerCase();
		var accessor = TiddlyWiki.standardFieldAccess[fieldName];
		if(accessor) return accessor.get(t);
	}
	return t.fields[fieldName];
};

// Calls the callback function for every field in the tiddler.
// When callback function returns a non-false value the iteration stops
// and that value is returned.
// The order of the fields is not defined.
// @param callback a function(tiddler, fieldName, value).
TiddlyWiki.prototype.forEachField = function(tiddlerOrTitle, callback, onlyExtendedFields)
{
	var t = this.resolveTiddler(tiddlerOrTitle);
	if(!t) return undefined;

	var name, result;
	for(name in t.fields) {
		result = callback(t, name, t.fields[name]);
		if(result) return result;
	}

	if(onlyExtendedFields) return undefined;
	for(name in TiddlyWiki.standardFieldAccess) {
		// even though the "title" field can also be referenced through the name "tiddler"
		// we only visit this field once.
		if(name == "tiddler") continue;

		result = callback(t, name, TiddlyWiki.standardFieldAccess[name].get(t));
		if(result) return result;
	}
	return undefined;
};

//--
//-- Story functions
//--

// A story is a HTML div containing a sequence of tiddlers that can be manipulated
//  container - id of containing element
//  idPrefix - string prefix prepended to title to make ids for tiddlers in this story
function Story(containerId, idPrefix)
{
	this.container = containerId;
	this.idPrefix = idPrefix;
	this.highlightRegExp = null;
	this.tiddlerId = function(title) {
		var validId = title.replace(/_/g, "__").replace(/ /g, "_");
		var id = this.idPrefix + validId;
		return id == this.container ? this.idPrefix + "_" + validId : id;
	};
	this.containerId = function() {
		return this.container;
	};
}

Story.prototype.getTiddler = function(title)
{
	return document.getElementById(this.tiddlerId(title));
};

Story.prototype.getContainer = function()
{
	return document.getElementById(this.containerId());
};

Story.prototype.forEachTiddler = function(handleTiddler)
{
	var place = this.getContainer();
	if(!place) return;
	var el = place.firstChild;
	while(el) {
		var next = el.nextSibling;
		var title = el.getAttribute("tiddler");
		if(title) {
			handleTiddler.call(this, title, el);
		}
		el = next;
	}
};

Story.prototype.displayTiddler = function(srcElement, tiddler,
	template, animate, unused, customFields, toggle, animationSrc)
{
	var title = (tiddler instanceof Tiddler) ? tiddler.title : tiddler;
	var tiddlerElem = this.getTiddler(title);
	if(tiddlerElem) {
		if(toggle) {
			if(tiddlerElem.getAttribute("dirty") != "true")
				this.closeTiddler(title, true);
		} else {
			this.refreshTiddler(title, template, false, customFields);
		}
	} else {
		var place = this.getContainer();
		var before = this.positionTiddler(srcElement);
		tiddlerElem = this.createTiddler(place, before, title, template, customFields);
	}

	if(animationSrc && typeof animationSrc !== "string") {
		srcElement = animationSrc;
	}
	if(srcElement && typeof srcElement !== "string") {
		if(config.options.chkAnimate && (animate == undefined || animate == true) && anim &&
		   typeof Zoomer == "function" && typeof Scroller == "function")
			anim.startAnimating(new Zoomer(title, srcElement, tiddlerElem), new Scroller(tiddlerElem));
		else
			window.scrollTo(0, ensureVisible(tiddlerElem));
	}
	return tiddlerElem;
};

Story.prototype.displayTiddlers = function(srcElement, titles, template, animate, unused, customFields, toggle)
{
	for(var i = titles.length - 1; i >= 0; i--)
		this.displayTiddler(srcElement, titles[i], template, animate, unused, customFields);
};

Story.prototype.displayDefaultTiddlers = function()
{
	this.displayTiddlers(null, store.filterTiddlers(store.getTiddlerText("DefaultTiddlers")));
};

Story.prototype.positionTiddler = function(srcElement)
{
	var place = this.getContainer();
	var before = null;
	if(typeof srcElement == "string") {
		switch(srcElement) {
			case "top":
				before = place.firstChild;
				break;
			case "bottom":
				before = null;
				break;
		}
	} else {
		var after = this.findContainingTiddler(srcElement);
		if(after == null) {
			before = place.firstChild;
		} else if(after.nextSibling) {
			before = after.nextSibling;
			if(before.nodeType != 1)
				before = null;
		}
	}
	return before;
};

Story.prototype.createTiddler = function(place, before, title, template, customFields)
{
	var tiddlerElem = createTiddlyElement(null, "div", this.tiddlerId(title), "tiddler");
	tiddlerElem.setAttribute("refresh", "tiddler");
	if(customFields)
		tiddlerElem.setAttribute("tiddlyFields", customFields);
	place.insertBefore(tiddlerElem, before);
	var defaultText = null;
	if(!store.tiddlerExists(title) && !store.isShadowTiddler(title))
		defaultText = this.loadMissingTiddler(title, customFields);
	this.refreshTiddler(title, template, false, customFields, defaultText);
	return tiddlerElem;
};

Story.prototype.loadMissingTiddler = function(title, fields, callback)
{
	var tiddler = new Tiddler(title);
	tiddler.fields = typeof fields == "string" ? fields.decodeHashMap() : fields || {};
	var context = { serverType: tiddler.getServerType() };
	if(!context.serverType) return "";
	context.host = tiddler.fields['server.host'];
	context.workspace = tiddler.fields['server.workspace'];
	var adaptor = new config.adaptors[context.serverType]();

	var onLoadTiddlerResponse = function(context)
	{
		if(context.status) {
			var t = context.tiddler;
			t.created  = t.created  || new Date();
			t.modified = t.modified || t.created;
			var dirty = store.isDirty();
			context.tiddler = store.saveTiddler(t.title, t.title, t.text, t.modifier, t.modified,
				t.tags, t.fields, true, t.created, t.creator);
			if(!window.allowSave())
				store.setDirty(dirty);
			autoSaveChanges();
		} else {
			story.refreshTiddler(context.title, null, true);
		}
		context.adaptor.close();
		if(callback) callback(context);
	};
	adaptor.getTiddler(title, context, null, onLoadTiddlerResponse);
	return config.messages.loadingMissingTiddler.format([title, context.serverType, context.host, context.workspace]);
};

Story.prototype.chooseTemplateForTiddler = function(title, template)
{
	if(!template)
		template = DEFAULT_VIEW_TEMPLATE;
	if(template == DEFAULT_VIEW_TEMPLATE || template == DEFAULT_EDIT_TEMPLATE)
		template = config.tiddlerTemplates[template];
	return template;
};

Story.prototype.getTemplateForTiddler = function(title, template, tiddler)
{
	return store.getRecursiveTiddlerText(template, null, 10);
};

Story.prototype.refreshTiddler = function(title, template, force, customFields, defaultText)
{
	var tiddlerElem = this.getTiddler(title);
	if(!tiddlerElem) return null;

	if(tiddlerElem.getAttribute("dirty") == "true" && !force)
		return tiddlerElem;
	template = this.chooseTemplateForTiddler(title, template);
	var currTemplate = tiddlerElem.getAttribute("template");
	if((template == currTemplate) && !force)
		return tiddlerElem;

	var tiddler = store.getTiddler(title);
	if(!tiddler) {
		tiddler = new Tiddler();
		if(store.isShadowTiddler(title)) {
			var tags = [];
			tiddler.set(title, store.getTiddlerText(title),
				config.views.wikified.shadowModifier, version.date, tags, version.date);
		} else {
			var text = template == config.tiddlerTemplates[DEFAULT_EDIT_TEMPLATE] // #166
				? config.views.editor.defaultText.format([title])
				: config.views.wikified.defaultText.format([title]);
			text = defaultText || text;
			var fields = customFields ? customFields.decodeHashMap() : null;
			tiddler.set(title, text, config.views.wikified.defaultModifier, version.date, [], version.date, fields);
		}
	}

	tiddlerElem.setAttribute("tags", tiddler.tags.join(" "));
	tiddlerElem.setAttribute("tiddler", title);
	tiddlerElem.setAttribute("template", template);
	tiddlerElem.onmouseover = this.onTiddlerMouseOver;
	tiddlerElem.onmouseout = this.onTiddlerMouseOut;
	tiddlerElem.ondblclick = this.onTiddlerDblClick;
	tiddlerElem[window.event ? "onkeydown" : "onkeypress"] = this.onTiddlerKeyPress;
	tiddlerElem.innerHTML = this.getTemplateForTiddler(title, template, tiddler);
	applyHtmlMacros(tiddlerElem, tiddler);
	if(store.getTaggedTiddlers(title).length > 0)
		jQuery(tiddlerElem).addClass("isTag");
	else
		jQuery(tiddlerElem).removeClass("isTag");
	if(store.tiddlerExists(title)) {
		jQuery(tiddlerElem).removeClass("shadow");
		jQuery(tiddlerElem).removeClass("missing");
	} else {
		jQuery(tiddlerElem).addClass(store.isShadowTiddler(title) ? "shadow" : "missing");
	}
	if(customFields)
		this.addCustomFields(tiddlerElem, customFields);

	return tiddlerElem;
};

Story.prototype.addCustomFields = function(place, customFields)
{
	var fields = customFields.decodeHashMap();
	var container = createTiddlyElement(place, "div", null, "customFields");
	container.style.display = "none";
	for(var fieldName in fields) {
		var input = document.createElement("input");
		input.setAttribute("type", "text");
		input.setAttribute("value", fields[fieldName]);
		container.appendChild(input);
		input.setAttribute("edit", fieldName);
	}
};

Story.prototype.refreshAllTiddlers = function(force)
{
	this.forEachTiddler(function(title, element) {
		var template = element.getAttribute("template");
		if(template && element.getAttribute("dirty") != "true") {
			this.refreshTiddler(title, force ? null : template, true);
		}
	});
};

Story.prototype.onTiddlerMouseOver = function()
{
	jQuery(this).addClass("selected");
};

Story.prototype.onTiddlerMouseOut = function()
{
	jQuery(this).removeClass("selected");
};

Story.prototype.onTiddlerDblClick = function(ev)
{
	var e = ev || window.event;
	var target = resolveTarget(e);
	if(!target || target.nodeName.toLowerCase() == "input" || target.nodeName.toLowerCase() == "textarea")
		return false;
	if(document.selection && document.selection.empty)
		document.selection.empty();
	config.macros.toolbar.invokeCommand(this, "defaultCommand", e);
	e.cancelBubble = true;
	if(e.stopPropagation) e.stopPropagation();
	return true;
};

Story.prototype.onTiddlerKeyPress = function(ev)
{
	var e = ev || window.event;
	clearMessage();
	var consume = false;
	var title = this.getAttribute("tiddler");
	var target = resolveTarget(e);
	switch(e.keyCode) {
		case 9: // Tab
			var editor = story.getTiddlerField(title, "text");
			if(target.tagName.toLowerCase() == "input"
			   && editor.value == config.views.editor.defaultText.format([title])) {
				// moving from input field and editor still contains default text, so select it
				editor.focus();
				editor.select();
				consume = true;
			}
			if(config.options.chkInsertTabs && !e.ctrlKey && target.tagName.toLowerCase() == "textarea") {
				replaceSelection(target, String.fromCharCode(9));
				consume = true;
			}
			if(config.isOpera) {
				target.onblur = function() {
					this.focus();
					this.onblur = null;
				};
			}
			break;
		case 13: // Ctrl-Enter
		case 10: // Ctrl-Enter on IE PC
		case 77: // Ctrl-Enter is "M" on some platforms
			if(e.ctrlKey) {
				blurElement(this);
				config.macros.toolbar.invokeCommand(this, "defaultCommand", e);
				consume = true;
			}
			break;
		case 27: // Escape
			blurElement(this);
			config.macros.toolbar.invokeCommand(this, "cancelCommand", e);
			consume = true;
			break;
	}
	e.cancelBubble = consume;
	if(consume) {
		if(e.stopPropagation) e.stopPropagation(); // Stop Propagation
		e.returnValue = true; // Cancel The Event in IE
		if(e.preventDefault) e.preventDefault(); // Cancel The Event in Moz
	}
	return !consume;
};

Story.prototype.getTiddlerField = function(title, field)
{
	var tiddlerElem = this.getTiddler(title);
	if(!tiddlerElem) return null;

	var $editors = jQuery(tiddlerElem).find('input, textarea');
	return $editors.filter('[edit="' + field + '"]')[0] || $editors[0] || null;
};

Story.prototype.focusTiddler = function(title, field)
{
	var e = this.getTiddlerField(title, field);
	if(e) {
		e.focus();
		e.select();
	}
};

Story.prototype.blurTiddler = function(title)
{
	var tiddlerElem = this.getTiddler(title);
	if(tiddlerElem && tiddlerElem.focus && tiddlerElem.blur) {
		tiddlerElem.focus();
		tiddlerElem.blur();
	}
};

Story.prototype.setTiddlerField = function(title, tag, mode, field)
{
	var editor = this.getTiddlerField(title, field);
	var tags = editor.value.readBracketedList();
	tags.setItem(tag, mode);
	editor.value = String.encodeTiddlyLinkList(tags);
};

Story.prototype.setTiddlerTag = function(title, tag, mode)
{
	this.setTiddlerField(title, tag, mode, "tags");
};

Story.prototype.closeTiddler = function(title, shouldAnimate, unused)
{
	var tiddlerElem = this.getTiddler(title);
	if(!tiddlerElem) return;

	clearMessage();
	this.scrubTiddler(tiddlerElem);
	if(config.options.chkAnimate && shouldAnimate && anim && typeof Slider == "function") {
		anim.startAnimating(new Slider(tiddlerElem, false, null, "all"));
	} else {
		jQuery(tiddlerElem).remove();
	}
};

Story.prototype.scrubTiddler = function(tiddlerElement)
{
	tiddlerElement.id = null;
};

// 'dirty' flag attribute is used on tiddlers to mark those having unsaved changes

Story.prototype.setDirty = function(title, dirty)
{
	var tiddlerElem = this.getTiddler(title);
	if(tiddlerElem)
		tiddlerElem.setAttribute("dirty", dirty ? "true" : "false");
};

Story.prototype.isDirty = function(title)
{
	var tiddlerElem = this.getTiddler(title);
	if(!tiddlerElem) return null;
	return tiddlerElem.getAttribute("dirty") == "true";
};

Story.prototype.areAnyDirty = function()
{
	var r = false;
	this.forEachTiddler(function(title, element) {
		if(this.isDirty(title))
			r = true;
	});
	return r;
};

Story.prototype.closeAllTiddlers = function(exclude)
{
	clearMessage();
	this.forEachTiddler(function(title, element) {
		if((title != exclude) && element.getAttribute("dirty") != "true")
			this.closeTiddler(title);
	});
	window.scrollTo(0, ensureVisible(this.container));
};

Story.prototype.isEmpty = function()
{
	var place = this.getContainer();
	return place && place.firstChild == null;
};

Story.prototype.search = function(text, useCaseSensitive, useRegExp)
{
	this.closeAllTiddlers();
	highlightHack = new RegExp(useRegExp ? text : text.escapeRegExp(), useCaseSensitive ? "mg" : "img");
	var matches = store.search(highlightHack, "title", "excludeSearch");
	this.displayTiddlers(null, matches);
	highlightHack = null;
	var q = useRegExp ? "/" : "'";
	if(matches.length > 0)
		displayMessage(config.macros.search.successMsg.format([matches.length.toString(), q + text + q]));
	else
		displayMessage(config.macros.search.failureMsg.format([q + text + q]));
};

Story.prototype.findContainingTiddler = function(el)
{
	while(el && !jQuery(el).hasClass("tiddler")) {
		el = jQuery(el).hasClass("popup") && Popup.stack[0] ? Popup.stack[0].root
			: el.parentNode;
	}
	return el;
};

Story.prototype.gatherSaveFields = function(el, fields)
{
	if(!el || !el.getAttribute) return;
	var fieldName = el.getAttribute("edit");
	if(fieldName)
		fields[fieldName] = el.value.replace(/\r/mg, "");
	if(el.hasChildNodes()) {
		for(var i = 0; i < el.childNodes.length; i++)
			this.gatherSaveFields(el.childNodes[i], fields);
	}
};

Story.prototype.hasChanges = function(title)
{
	var tiddlerElement = this.getTiddler(title);
	if(!tiddlerElement) return false;

	var fields = {};
	this.gatherSaveFields(tiddlerElement, fields);
	if(store.fetchTiddler(title)) {
		for(var fieldName in fields) {
			if(store.getValue(title, fieldName) != fields[fieldName])
				return true;
		}
		return false;
	}
	if(store.isShadowTiddler(title)) {
		// not checking for title or tags
		return store.getShadowTiddlerText(title) != fields.text;
	}
	// new tiddler
	return true;
};

Story.prototype.saveTiddler = function(title, minorUpdate)
{
	var tiddlerElem = this.getTiddler(title);
	if(!tiddlerElem) return null;

	var fields = {};
	this.gatherSaveFields(tiddlerElem, fields);
	var newTitle = fields.title || title;
	if(!store.tiddlerExists(newTitle)) {
		newTitle = newTitle.trim();
		var creator = config.options.txtUserName;
	}
	if(store.tiddlerExists(newTitle) && newTitle != title) {
		if(!confirm(config.messages.overwriteWarning.format([newTitle.toString()])))
			return null;
	}
	if(newTitle != title)
		this.closeTiddler(newTitle, false);
	tiddlerElem.id = this.tiddlerId(newTitle);
	tiddlerElem.setAttribute("tiddler", newTitle);
	tiddlerElem.setAttribute("template", DEFAULT_VIEW_TEMPLATE);
	tiddlerElem.setAttribute("dirty", "false");
	if(config.options.chkForceMinorUpdate)
		minorUpdate = !minorUpdate;
	if(!store.tiddlerExists(newTitle))
		minorUpdate = false;
	if(store.tiddlerExists(title)) {
		var t = store.fetchTiddler(title);
		var extendedFields = t.fields;
		creator = t.creator;
	} else {
		extendedFields = merge({}, config.defaultCustomFields);
	}
	for(var n in fields) {
		if(!TiddlyWiki.isStandardField(n))
			extendedFields[n] = fields[n];
	}
	var tiddler = store.saveTiddler(title, newTitle, fields.text, minorUpdate ? undefined : config.options.txtUserName,
		minorUpdate ? undefined : new Date(), fields.tags, extendedFields, null, null, creator);
	autoSaveChanges(null, [tiddler]);
	return newTitle;
};

Story.prototype.getPermaViewHash = function(titles)
{
	return '#' + encodeURIComponent(String.encodeTiddlyLinkList(titles));
};

Story.prototype.permaView = function()
{
	var titles = [];
	this.forEachTiddler(function(title, element) {
		titles.push(title);
	});
	var hash = this.getPermaViewHash(titles);
	if(window.location.hash != hash)
		window.location.hash = hash;
};

Story.prototype.switchTheme = function(theme)
{
	if(safeMode) return;

	var getSlice = function(theme, slice) {
		var r;
		if(readOnly)
			r = store.getTiddlerSlice(theme, slice + "ReadOnly") || store.getTiddlerSlice(theme, "Web" + slice);
		r = r || store.getTiddlerSlice(theme, slice);
		if(r && r.indexOf(config.textPrimitives.sectionSeparator) == 0)
			r = theme + r;
		return store.isAvailable(r) ? r : slice;
	};

	var replaceNotification = function(i, name, theme, slice) {
		var newName = getSlice(theme, slice);
		if(name != newName && store.namedNotifications[i].name == name) {
			store.namedNotifications[i].name = newName;
			return newName;
		}
		return name;
	};

	var pt = config.refresherData.pageTemplate;
	var vi = DEFAULT_VIEW_TEMPLATE;
	var vt = config.tiddlerTemplates[vi];
	var ei = DEFAULT_EDIT_TEMPLATE;
	var et = config.tiddlerTemplates[ei];

	for(var i = 0; i < config.notifyTiddlers.length; i++) {
		var name = config.notifyTiddlers[i].name;
		switch(name) {
			case "PageTemplate":
				config.refresherData.pageTemplate = replaceNotification(i, config.refresherData.pageTemplate, theme, name);
				break;
			case "StyleSheet":
				removeStyleSheet(config.refresherData.styleSheet);
				config.refresherData.styleSheet = replaceNotification(i, config.refresherData.styleSheet, theme, name);
				break;
			case "ColorPalette":
				config.refresherData.colorPalette = replaceNotification(i, config.refresherData.colorPalette, theme, name);
				break;
			default:
				break;
		}
	}
	config.tiddlerTemplates[vi] = getSlice(theme, "ViewTemplate");
	config.tiddlerTemplates[ei] = getSlice(theme, "EditTemplate");
	if(!startingUp) {
		if(config.refresherData.pageTemplate != pt || config.tiddlerTemplates[vi] != vt
		   || config.tiddlerTemplates[ei] != et) {
			refreshAll();
			this.refreshAllTiddlers(true);
		} else {
			setStylesheet(store.getRecursiveTiddlerText(config.refresherData.styleSheet, "", 10),
				config.refreshers.styleSheet);
		}
		config.options.txtTheme = theme;
		saveOption("txtTheme");
	}
};

//--
//-- Backstage
//--
// Backstage tasks
config.tasks.save.action = saveChanges;

var backstage = {
	area: null,
	toolbar: null,
	button: null,
	showButton: null,
	hideButton: null,
	cloak: null,
	panel: null,
	panelBody: null,
	panelFooter: null,
	currTabName: null,
	currTabElem: null,
	content: null,

	init: function() {
		var cmb = config.messages.backstage;
		this.area = document.getElementById("backstageArea");
		this.toolbar = jQuery("#backstageToolbar").empty()[0];
		this.button = jQuery("#backstageButton").empty()[0];
		this.button.style.display = "block";
		var text = cmb.open.text + " " + glyph("bentArrowLeft");
		this.showButton = createTiddlyButton(this.button, text, cmb.open.tooltip,
			function(e) { backstage.show(); return false }, null, "backstageShow");
		text = glyph("bentArrowRight") + " " + cmb.close.text;
		this.hideButton = createTiddlyButton(this.button, text, cmb.close.tooltip,
			function(e) { backstage.hide(); return false }, null, "backstageHide");
		this.cloak = document.getElementById("backstageCloak");
		this.panel = document.getElementById("backstagePanel");
		this.panelFooter = createTiddlyElement(this.panel, "div", null, "backstagePanelFooter");
		this.panelBody = createTiddlyElement(this.panel, "div", null, "backstagePanelBody");
		this.cloak.onmousedown = function(e) { backstage.switchTab(null) };
		createTiddlyText(this.toolbar, cmb.prompt);
		for(var i = 0; i < config.backstageTasks.length; i++)
		{
			var taskName = config.backstageTasks[i];
			var task = config.tasks[taskName];
			var handler = task.action ? this.onClickCommand : this.onClickTab;
			var text = task.text + (task.action ? "" : glyph("downTriangle"));
			var btn = createTiddlyButton(this.toolbar, text, task.tooltip, handler, "backstageTab");
			jQuery(btn).addClass(task.action ? "backstageAction" : "backstageTask");
			btn.setAttribute("task", taskName);
		}
		this.content = document.getElementById("contentWrapper");
		if(config.options.chkBackstage)
			this.show();
		else
			this.hide();
	},

	isVisible: function() {
		return this.area ? this.area.style.display == "block" : false;
	},

	show: function() {
		this.area.style.display = "block";
		if(anim && config.options.chkAnimate) {
			backstage.toolbar.style.left = findWindowWidth() + "px";
			anim.startAnimating(new Morpher(backstage.toolbar, config.animDuration, [
				{ style: "left", start: findWindowWidth(), end: 0, template: "%0px" }
			]));
		} else {
			backstage.area.style.left = "0px";
		}
		jQuery(this.showButton).hide();
		jQuery(this.hideButton).show();
		config.options.chkBackstage = true;
		saveOption("chkBackstage");
		jQuery(this.content).addClass("backstageVisible");
	},

	hide: function() {
		if(this.currTabElem) {
			// close current tab, not backstage
			this.switchTab(null);
			return;
		}

		backstage.toolbar.style.left = "0px";
		var hide = function() { backstage.area.style.display = "none" };
		if(anim && config.options.chkAnimate) {
			anim.startAnimating(new Morpher(backstage.toolbar, config.animDuration, [
				{ style: "left", start: 0, end: findWindowWidth(), template: "%0px" }
			], hide));
		} else {
			hide();
		}
		this.showButton.style.display = "block";
		this.hideButton.style.display = "none";
		config.options.chkBackstage = false;
		saveOption("chkBackstage");
		jQuery(this.content).removeClass("backstageVisible");
	},

	onClickCommand: function(e) {
		var task = config.tasks[this.getAttribute("task")];
		if(task.action) {
			backstage.switchTab(null);
			task.action();
		}
		return false;
	},

	onClickTab: function(e) {
		backstage.switchTab(this.getAttribute("task"));
		return false;
	},

	// Switch to a given tab, or none if null is passed
	switchTab: function(tabName) {
		var tabElem = null;
		var e = this.toolbar.firstChild;
		while(e) {
			if(e.getAttribute && e.getAttribute("task") == tabName)
				tabElem = e;
			e = e.nextSibling;
		}
		if(tabName == this.currTabName) {
			this.hidePanel();
			return;
		}
		if(this.currTabElem) {
			jQuery(this.currTabElem).removeClass("backstageSelTab");
		}
		if(tabElem && tabName) {
			this.preparePanel();
			jQuery(tabElem).addClass("backstageSelTab");
			var task = config.tasks[tabName];
			wikify(task.content, this.panelBody, null, null);
			this.showPanel();
		} else if(this.currTabElem) {
			this.hidePanel();
		}
		this.currTabName = tabName;
		this.currTabElem = tabElem;
	},

	isPanelVisible: function() {
		return backstage.panel ? backstage.panel.style.display == "block" : false;
	},

	preparePanel: function() {
		backstage.cloak.style.height = findDocHeight() + "px";
		backstage.cloak.style.display = "block";
		jQuery(backstage.panelBody).empty();
		return backstage.panelBody;
	},

	showPanel: function() {
		backstage.panel.style.display = "block";
		if(anim && config.options.chkAnimate) {
			backstage.panel.style.top = (-backstage.panel.offsetHeight) + "px";
			anim.startAnimating(new Morpher(backstage.panel, config.animDuration, [
				{ style: "top", start: -backstage.panel.offsetHeight, end: 0, template: "%0px" }
			]), new Scroller(backstage.panel, false));
		} else {
			backstage.panel.style.top = "0px";
		}
		return backstage.panelBody;
	},

	hidePanel: function() {
		if(backstage.currTabElem)
			jQuery(backstage.currTabElem).removeClass("backstageSelTab");
		backstage.currTabElem = null;
		backstage.currTabName = null;
		if(anim && config.options.chkAnimate) {
			var callback = function() { backstage.cloak.style.display = "none" };
			anim.startAnimating(new Morpher(backstage.panel, config.animDuration, [
				{ style: "top", start: 0, end: -(backstage.panel.offsetHeight), template: "%0px" },
				{ style: "display", atEnd: "none" }
			], callback));
		} else {
			jQuery([backstage.panel, backstage.cloak]).hide();
		}
	}
};

config.macros.backstage = {};

config.macros.backstage.handler = function(place, macroName, params)
{
	var backstageTask = config.tasks[params[0]];
	if(!backstageTask) return;
	createTiddlyButton(place, backstageTask.text, backstageTask.tooltip, function(e) {
		backstage.switchTab(params[0]);
		return false;
	});
};

//--
//-- ImportTiddlers macro
//--

config.macros.importTiddlers.handler = function(place, macroName, params, wikifier, paramString, tiddler)
{
	if(readOnly) {
		createTiddlyElement(place, "div", null, "marked", this.readOnlyWarning);
		return;
	}
	var w = new Wizard();
	w.createWizard(place, this.wizardTitle);
	this.restart(w);
};

config.macros.importTiddlers.onCancel = function(e)
{
	var wizard = new Wizard(this);
	wizard.clear();
	config.macros.importTiddlers.restart(wizard);
	return false;
};

config.macros.importTiddlers.onClose = function(e)
{
	backstage.hidePanel();
	return false;
};

config.macros.importTiddlers.restart = function(wizard)
{
	var me = config.macros.importTiddlers;
	wizard.addStep(this.step1Title, this.step1Html);
	var name, s = wizard.getElement("selTypes");
	for(name in config.adaptors) {
		var e = createTiddlyElement(s, "option", null, null, config.adaptors[name].serverLabel || name);
		e.value = name;
	}
	if(config.defaultAdaptor) s.value = config.defaultAdaptor;
	s = wizard.getElement("selFeeds");
	var feeds = this.getFeeds();
	for(name in feeds) {
		e = createTiddlyElement(s, "option", null, null, name);
		e.value = name;
	}
	wizard.setValue("feeds", feeds);
	s.onchange = me.onFeedChange;
	var fileInput = wizard.getElement("txtBrowse");
	fileInput.onchange = me.onBrowseChange;
	fileInput.onkeyup = me.onBrowseChange;
	wizard.setButtons([{ caption: this.openLabel, tooltip: this.openPrompt, onClick: me.onOpen }]);
	wizard.formElem.action = "javascript:;";
	wizard.formElem.onsubmit = function() {
		if(!this.txtPath || this.txtPath.value.length) //# check for manually entered path in first step
			this.lastChild.firstChild.onclick();
	};
};

config.macros.importTiddlers.getFeeds = function()
{
	var feeds = {};
	var i, tagged = store.getTaggedTiddlers("systemServer", "title");
	for(i = 0; i < tagged.length; i++) {
		var title = tagged[i].title;
		feeds[title] = {
			title: title,
			url: store.getTiddlerSlice(title, "URL"),
			workspace: store.getTiddlerSlice(title, "Workspace"),
			workspaceList: store.getTiddlerSlice(title, "WorkspaceList"),
			tiddlerFilter: store.getTiddlerSlice(title, "TiddlerFilter"),
			serverType: store.getTiddlerSlice(title, "Type") || "file",
			description: store.getTiddlerSlice(title, "Description")
		};
	}
	return feeds;
};

config.macros.importTiddlers.onFeedChange = function(e)
{
	var wizard = new Wizard(this);
	var selTypes = wizard.getElement("selTypes");
	var fileInput = wizard.getElement("txtPath");
	var feeds = wizard.getValue("feeds");
	var f = feeds[this.value];
	if(f) {
		selTypes.value = f.serverType;
		fileInput.value = f.url;
		wizard.setValue("feedName", f.serverType);
		wizard.setValue("feedHost", f.url);
		wizard.setValue("feedWorkspace", f.workspace);
		wizard.setValue("feedWorkspaceList", f.workspaceList);
		wizard.setValue("feedTiddlerFilter", f.tiddlerFilter);
	}
	return false;
};

config.macros.importTiddlers.onBrowseChange = function(e)
{
	var wizard = new Wizard(this);
	var file = this.value;
	file = file.replace(/^C:\\fakepath\\/i, ''); // remove fakepath (chrome/opera/safari)
	if(this.files && this.files[0]) {
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalFileRead");
			file = this.files[0].fileName; // REQUIRES PRIVILEGES.. NULL otherwise
		} catch (ex) {
			// non-priv fallback: combine filename with path to current document
			var path = getLocalPath(document.location.href);
			var slashpos = path.lastIndexOf('/');
			if (slashpos == -1) slashpos = path.lastIndexOf('\\');
			if (slashpos != -1) path = path.substr(0, slashpos + 1); // remove filename, leave trailing slash
			file = path + file;
		}
	}
	var fileInput = wizard.getElement("txtPath");
	fileInput.value = config.macros.importTiddlers.getURLFromLocalPath(file);
	var serverType = wizard.getElement("selTypes");
	serverType.value = "file";
	return true;
};

config.macros.importTiddlers.getURLFromLocalPath = function(path)
{
	if(!path) return path;
	// use "/" for cross-platform consistency
	path = path.replace(/\\/g, "/");

	var t = path.split(":");
	if(t[1] && (t[0] == "http" || t[0] == "https" || t[0] == "file")) {
		// input is already a URL
		return path;
	}

	var p = t[1] || t[0]; // remove drive letter (if any)
	if(p.substr(0, 1) == "/") {
		// path is absolute, add protocol + domain + extra slash (if drive letter)
		return document.location.protocol + "//" + document.location.hostname + (t[1] ? "/" : "") + path;
	}

	// path is relative, add current document protocol + domain + path
	var c = document.location.href.replace(/\\/g, "/");
	var pos = c.lastIndexOf("/");
	if(pos != -1)
		c = c.substring(0, pos); // remove filename
	return c + "/" + p;
};

config.macros.importTiddlers.onOpen = function(e)
{
	var me = config.macros.importTiddlers;
	var wizard = new Wizard(this);
	var fileInput = wizard.getElement("txtPath");
	var url = fileInput.value;
	var serverType = wizard.getElement("selTypes").value || config.defaultAdaptor;
	var adaptor = new config.adaptors[serverType]();
	wizard.setValue("adaptor", adaptor);
	wizard.setValue("serverType", serverType);
	wizard.setValue("host", url);
	adaptor.openHost(url, null, wizard, me.onOpenHost);
	wizard.setButtons([{ caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel }], me.statusOpenHost);
	return false;
};

config.macros.importTiddlers.onOpenHost = function(context, wizard)
{
	var me = config.macros.importTiddlers;
	var adaptor = wizard.getValue("adaptor");
	if(context.status !== true)
		displayMessage("Error in importTiddlers.onOpenHost: " + context.statusText);
	adaptor.getWorkspaceList(context, wizard, me.onGetWorkspaceList);
	wizard.setButtons([{ caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel }], me.statusGetWorkspaceList);
};

config.macros.importTiddlers.onGetWorkspaceList = function(context, wizard)
{
	var me = config.macros.importTiddlers;
	if(context.status !== true)
		displayMessage("Error in importTiddlers.onGetWorkspaceList: " + context.statusText);
	wizard.setValue("context", context);
	var workspace = wizard.getValue("feedWorkspace");
	if(!workspace && context.workspaces.length == 1)
		workspace = context.workspaces[0].title;
	if(workspace) {
		context.adaptor.openWorkspace(workspace, context, wizard, me.onOpenWorkspace);
		wizard.setValue("workspace", workspace);
		wizard.setButtons([{ caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel }], me.statusOpenWorkspace);
		return;
	}
	wizard.addStep(me.step2Title, me.step2Html);
	var i, s = wizard.getElement("selWorkspace");
	s.onchange = me.onWorkspaceChange;
	for(i = 0; i < context.workspaces.length; i++) {
		var e = createTiddlyElement(s, "option", null, null, context.workspaces[i].title);
		e.value = context.workspaces[i].title;
	}
	var workspaceList = wizard.getValue("feedWorkspaceList");
	if(workspaceList) {
		var list = workspaceList.parseParams("workspace", null, false, true);
		for(i = 1; i < list.length; i++) {
			if(context.workspaces.findByField("title", list[i].value) == null) {
				e = createTiddlyElement(s, "option", null, null, list[i].value);
				e.value = list[i].value;
			}
		}
	}
	if(workspace) {
		wizard.getElement("txtWorkspace").value = workspace;
	}
	wizard.setButtons([{ caption: me.openLabel, tooltip: me.openPrompt, onClick: me.onChooseWorkspace }]);
};

config.macros.importTiddlers.onWorkspaceChange = function(e)
{
	var wizard = new Wizard(this);
	wizard.getElement("txtWorkspace").value = this.value;
	this.selectedIndex = 0;
	return false;
};

config.macros.importTiddlers.onChooseWorkspace = function(e)
{
	var me = config.macros.importTiddlers;
	var wizard = new Wizard(this);
	var adaptor = wizard.getValue("adaptor");
	var workspace = wizard.getElement("txtWorkspace").value;
	wizard.setValue("workspace", workspace);
	var context = wizard.getValue("context");
	adaptor.openWorkspace(workspace, context, wizard, me.onOpenWorkspace);
	wizard.setButtons([{ caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel }], me.statusOpenWorkspace);
	return false;
};

config.macros.importTiddlers.onOpenWorkspace = function(context, wizard)
{
	var me = config.macros.importTiddlers;
	if(context.status !== true)
		displayMessage("Error in importTiddlers.onOpenWorkspace: " + context.statusText);
	var adaptor = wizard.getValue("adaptor");
	var browse = wizard.getElement("txtBrowse");
	if (browse.files) context.file = browse.files[0]; // for HTML5 FileReader
	adaptor.getTiddlerList(context, wizard, me.onGetTiddlerList, wizard.getValue("feedTiddlerFilter"));
	wizard.setButtons([{ caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel }], me.statusGetTiddlerList);
};

config.macros.importTiddlers.onGetTiddlerList = function(context, wizard)
{
	var me = config.macros.importTiddlers;
	if(context.status !== true) {
		var error = context.statusText || me.errorGettingTiddlerList;
		if(context.host.indexOf("file://") === 0) {
			error = me.errorGettingTiddlerListFile;
		} else {
			error = context.xhr && context.xhr.status == 404 ? me.errorGettingTiddlerListHttp404 :
				me.errorGettingTiddlerListHttp;
		}
		wizard.setButtons([{ caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel }], "");
		jQuery("span.status", wizard.footerEl).html(error); // so error message can be html
		return;
	}

	// Extract data for the listview
	var listedTiddlers = [];
	if(context.tiddlers) {
		for(var i = 0; i < context.tiddlers.length; i++) {
			var tiddler = context.tiddlers[i];
			listedTiddlers.push({
				title: tiddler.title,
				modified: tiddler.modified,
				modifier: tiddler.modifier,
				text: tiddler.text ? wikifyPlainText(tiddler.text, 100) : "",
				tags: tiddler.tags,
				size: tiddler.text ? tiddler.text.length : 0,
				tiddler: tiddler
			});
		}
	}
	listedTiddlers.sort(function(a, b) { return a.title < b.title ? -1 : (a.title == b.title ? 0 : +1) });

	// Display the listview
	wizard.addStep(me.step3Title, me.step3Html);
	var markList = wizard.getElement("markList");
	var listWrapper = document.createElement("div");
	markList.parentNode.insertBefore(listWrapper, markList);
	var listView = ListView.create(listWrapper, listedTiddlers, me.listViewTemplate);
	wizard.setValue("listView", listView);
	wizard.setValue("context", context);
	var txtSaveTiddler = wizard.getElement("txtSaveTiddler");
	txtSaveTiddler.value = me.generateSystemServerName(wizard);
	wizard.setButtons([
		{ caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel },
		{ caption: me.importLabel, tooltip: me.importPrompt, onClick: me.doImport }
	]);
};

config.macros.importTiddlers.generateSystemServerName = function(wizard)
{
	var serverType = wizard.getValue("serverType");
	var host = wizard.getValue("host");
	var workspace = wizard.getValue("workspace");
	var pattern = config.macros.importTiddlers[workspace ? "systemServerNamePattern" : "systemServerNamePatternNoWorkspace"];
	return pattern.format([serverType, host, workspace]);
};

config.macros.importTiddlers.saveServerTiddler = function(wizard)
{
	var me = config.macros.importTiddlers;
	var txtSaveTiddler = wizard.getElement("txtSaveTiddler").value;
	if(store.tiddlerExists(txtSaveTiddler)) {
		if(!confirm(me.confirmOverwriteSaveTiddler.format([txtSaveTiddler])))
			return;
		store.suspendNotifications();
		store.removeTiddler(txtSaveTiddler);
		store.resumeNotifications();
	}
	var serverType = wizard.getValue("serverType");
	var host = wizard.getValue("host");
	var workspace = wizard.getValue("workspace");
	var text = me.serverSaveTemplate.format([serverType, host, workspace]);
	store.saveTiddler(txtSaveTiddler, txtSaveTiddler, text, me.serverSaveModifier, new Date(), ["systemServer"]);
};

config.macros.importTiddlers.doImport = function(e)
{
	var me = config.macros.importTiddlers;
	var wizard = new Wizard(this);
	if(wizard.getElement("chkSave").checked)
		me.saveServerTiddler(wizard);
	var chkSync = wizard.getElement("chkSync").checked;
	wizard.setValue("sync", chkSync);

	var listView = wizard.getValue("listView");
	var rowNames = ListView.getSelectedRows(listView);
	var adaptor = wizard.getValue("adaptor");
	var overwrite = [];
	for(var i = 0; i < rowNames.length; i++) {
		if(store.tiddlerExists(rowNames[i]))
			overwrite.push(rowNames[i]);
	}
	if(overwrite.length > 0) {
		if(!confirm(me.confirmOverwriteText.format([overwrite.join(", ")])))
			return false;
	}

	wizard.addStep(me.step4Title.format([rowNames.length]), me.step4Html);
	for(i = 0; i < rowNames.length; i++) {
		var linkHolder = document.createElement("div");
		createTiddlyLink(linkHolder, rowNames[i], true);
		var place = wizard.getElement("markReport");
		place.parentNode.insertBefore(linkHolder, place);
	}
	wizard.setValue("remainingImports", rowNames.length);
	wizard.setButtons([
		{ caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel }
	], me.statusDoingImport);
	var wizardContext = wizard.getValue("context");
	var tiddlers = wizardContext ? wizardContext.tiddlers : [];
	for(i = 0; i < rowNames.length; i++) {
		var context = {
			allowSynchronous: true,
			tiddler: tiddlers[tiddlers.findByField("title", rowNames[i])]
		};
		adaptor.getTiddler(rowNames[i], context, wizard, me.onGetTiddler);
	}
	return false;
};

config.macros.importTiddlers.onGetTiddler = function(context, wizard)
{
	if(!context.status)
		displayMessage("Error in importTiddlers.onGetTiddler: " + context.statusText);
	var tiddler = context.tiddler;
	store.suspendNotifications();
	store.saveTiddler(tiddler.title, tiddler.title, tiddler.text, tiddler.modifier,
		tiddler.modified, tiddler.tags, tiddler.fields, true, tiddler.created);
	if(!wizard.getValue("sync")) {
		store.setValue(tiddler.title, 'server', null);
	}
	store.resumeNotifications();
	if(!context.isSynchronous) store.notify(tiddler.title, true);

	var remainingImports = wizard.getValue("remainingImports") - 1;
	wizard.setValue("remainingImports", remainingImports);

	if(remainingImports != 0) return;
	if(context.isSynchronous) {
		store.notifyAll();
		refreshDisplay();
	}
	var me = config.macros.importTiddlers;
	wizard.setButtons([
		{ caption: me.doneLabel, tooltip: me.donePrompt, onClick: me.onClose }
	], me.statusDoneImport);
	autoSaveChanges();
};

//--
//-- Upgrade macro
//--

config.macros.upgrade.getSourceURL = function()
{
	return config.options.txtUpgradeCoreURI || config.macros.upgrade.source;
};

config.macros.upgrade.loadLatestCore = function(onSuccess, onError)
{
	ajaxReq({
		type: "GET",
		url: this.getSourceURL(),
		processData: false,
		success: onSuccess,
		error: onError
	});
};

config.macros.upgrade.handler = function(place)
{
	var w = new Wizard();
	w.createWizard(place, this.wizardTitle);
	w.addStep(this.step1Title, this.step1Html.format([this.getSourceURL(), this.getSourceURL()]));
	w.setButtons([{
		caption: this.upgradeLabel,
		tooltip: this.upgradePrompt,
		onClick: this.onClickUpgrade
	}]);
};

config.macros.upgrade.onClickUpgrade = function(e)
{
	var me = config.macros.upgrade;
	var w = new Wizard(this);
	if(!window.allowSave()) {
		alert(me.errorCantUpgrade);
		return false;
	}
	if(story.areAnyDirty() || store.isDirty()) {
		alert(me.errorNotSaved);
		return false;
	}

	w.setButtons([], me.statusPreparingBackup);
	var localPath = getLocalPath(document.location.toString());
	var backupPath = getBackupPath(localPath, me.backupExtension);
	var original = loadOriginal(localPath);

	w.setButtons([], me.statusSavingBackup);
	var backupSuccess = copyFile(backupPath, localPath) || saveFile(backupPath, original);
	if(!backupSuccess) {
		w.setButtons([], me.errorSavingBackup);
		alert(me.errorSavingBackup);
		return false;
	}
	w.setValue("backupPath", backupPath);

	w.setButtons([], me.statusLoadingCore);
	var sourceURL = me.getSourceURL();
	me.loadLatestCore(function(data, textStatus, jqXHR) {
		me.onLoadCore(true, w, jqXHR.responseText, sourceURL, jqXHR);
	}, function(jqXHR, textStatus, errorThrown) {
		me.onLoadCore(false, w, null, sourceURL, jqXHR);
	});
	return false;
};

config.macros.upgrade.onLoadCore = function(status, w, responseText, url, xhr)
{
	var me = config.macros.upgrade;
	var errMsg;
	if(!status) errMsg = me.errorLoadingCore;
	var newVer = me.extractVersion(responseText);
	if(!newVer) errMsg = me.errorCoreFormat;
	if(errMsg) {
		w.setButtons([], errMsg);
		alert(errMsg);
		return;
	}

	var step2 = [me.step2Html_downgrade, me.step2Html_restore, me.step2Html_upgrade][compareVersions(version, newVer) + 1];
	w.addStep(me.step2Title, step2.format([formatVersion(newVer), formatVersion(version)]));
	w.setButtons([
		{ caption: me.startLabel,  tooltip: me.startPrompt,  onClick: function() {
			config.macros.upgrade.onStartUpgrade(w, responseText);
		} },
		{ caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel }
	]);
};

config.macros.upgrade.onStartUpgrade = function(wizard, newCoreHtml)
{
	wizard.setButtons([], config.macros.upgrade.statusSavingCore);
	var localPath = getLocalPath(document.location.toString());
	saveFile(localPath, newCoreHtml);

	wizard.setButtons([], config.macros.upgrade.statusReloadingCore);
	var backupPath = wizard.getValue("backupPath");
	var newLocation = addUpgradePartsToURI(document.location.toString(), backupPath);
	window.setTimeout(function () { window.location = newLocation }, 10);
};

config.macros.upgrade.onCancel = function(e)
{
	var me = config.macros.upgrade;
	var w = new Wizard(this);
	w.addStep(me.step3Title, me.step3Html);
	w.setButtons([]);
	return false;
};

config.macros.upgrade.extractVersion = function(upgradeFile)
{
	var re = /version = \{\s*title: "([^"]+)", major: (\d+), minor: (\d+), revision: (\d+)(, beta: (\d+)){0,1}, date: new Date\("([^"]+)"\)/mg;
	var m = re.exec(upgradeFile);
	return !m ? null : {
		title: m[1], major: m[2], minor: m[3], revision: m[4], beta: m[6], date: new Date(m[7])
	};
};

// a helper, splits uri into parts, passes the map of parts to modify and glues parts back
function changeUri(uri, modify)
{
	var uriPartsRE = /^(?:([\w:]+)\/\/)?([^\/\?#]+)?([^\?#]+)?(?:\?([^#]*))?(?:#(.*))?$/;
	var match = uriPartsRE.exec(uri) || [null, '', '', '', '', ''];
	var parts = {
		scheme:	match[1],
		host:	match[2],
		path:	match[3],
		query:	match[4],
		hash:	match[5]
	};
	modify(parts);
	var newScheme = parts.scheme === undefined ? '' : (parts.scheme + '//'),
	    newHost   = parts.host || '',
	    newPath   = parts.path || '',
	    newQuery  = parts.query ? ('?' + parts.query) : '',
	    newHash   = parts.hash   === undefined ? '' : ('#' + parts.hash);
	return newScheme + newHost + newPath + newQuery + newHash;
}

function addUpgradePartsToURI(uri, backupPath)
{
	return changeUri(uri, function(uriParts)
	{
		var newParamifier = 'upgrade:[[' + encodeURI(backupPath) + ']]';
		uriParts.hash = (uriParts.hash ? uriParts.hash + '%20' : '') + newParamifier;

		var newQuery = "time=" + new Date().convertToYYYYMMDDHHMM();
		uriParts.query = (uriParts.query ? uriParts.query + '&' : '') + newQuery;
	});
}

function stripUpgradePartsFromURI(uri)
{
	return changeUri(uri, function(uriParts)
	{
		var queryParts = uriParts.query.split('&'),
		    hashParts = uriParts.hash.split('%20'); // splits paramifiers with a space in argument

		for(var i = 0; i < queryParts.length; i++)
			if(queryParts[i].indexOf('time=') == 0)
				queryParts.splice(i--, 1);

		// relies on the upgrade paramifier being added to the end of hash
		for(i = 0; i < hashParts.length; i++)
			if(hashParts[i].indexOf('upgrade:') == 0)
				hashParts = hashParts.slice(0, i);

		uriParts.query = queryParts.join('&');
		uriParts.hash = hashParts.join('%20') || undefined;
	});
}

function upgradeFrom(path)
{
	tw.io.loadFile(path, function(oldTw) {
		var importStore = new TiddlyWiki();
		importStore.importTiddlyWiki(oldTw);
		importStore.forEachTiddler(function(title, tiddler) {
			if(!store.getTiddler(title)) {
				store.addTiddler(tiddler);
			}
		});

		refreshDisplay();
		saveChanges();
		alert(config.messages.upgradeDone.format([formatVersion()]));
		window.location = stripUpgradePartsFromURI(window.location.toString());
	});
}

//--
//-- Manager UI for groups of tiddlers
//--

config.macros.plugins.handler = function(place, macroName, params, wikifier, paramString)
{
	var wizard = new Wizard();
	wizard.createWizard(place, this.wizardTitle);
	wizard.addStep(this.step1Title, this.step1Html);
	var markList = wizard.getElement("markList");
	var listWrapper = document.createElement("div");
	markList.parentNode.insertBefore(listWrapper, markList);
	listWrapper.setAttribute("refresh", "macro");
	listWrapper.setAttribute("macroName", "plugins");
	listWrapper.setAttribute("params", paramString);
	this.refresh(listWrapper, paramString);
};

config.macros.plugins.refresh = function(listWrapper, paramString)
{
	var wizard = new Wizard(listWrapper);
	var selectedRows = [];
	ListView.forEachSelector(listWrapper, function(e, rowName) {
		if(e.checked) selectedRows.push(e.getAttribute("rowName"));
	});
	jQuery(listWrapper).empty();
	var plugins = installedPlugins.slice(0);
	var i, tiddler, p;
	var configTiddlers = store.getTaggedTiddlers("systemConfig");
	for(i = 0; i < configTiddlers.length; i++) {
		tiddler = configTiddlers[i];
		if(plugins.findByField("title", tiddler.title) != null) continue;

		p = getPluginInfo(tiddler);
		p.executed = false;
		p.log.splice(0, 0, this.skippedText);
		p.size = p.tiddler.text ? p.tiddler.text.length : 0;
		p.forced = p.tiddler.isTagged("systemConfigForce");
		p.disabled = p.tiddler.isTagged("systemConfigDisable");
		p.Selected = selectedRows.indexOf(p.title) != -1;
		plugins.push(p);
	}

	if(plugins.length == 0) {
		createTiddlyElement(listWrapper, "em", null, null, this.noPluginText);
		wizard.setButtons([]);
	} else {
		var template = readOnly ? this.listViewTemplateReadOnly : this.listViewTemplate;
		var listView = ListView.create(listWrapper, plugins, template, this.onSelectCommand);
		wizard.setValue("listView", listView);
		if(!readOnly) {
			var me = config.macros.plugins;
			wizard.setButtons([
				{ caption: me.removeLabel, tooltip: me.removePrompt, onClick: me.doRemoveTag },
				{ caption: me.deleteLabel, tooltip: me.deletePrompt, onClick: me.doDelete }
			]);
		}
	}
};

config.macros.plugins.doRemoveTag = function(e)
{
	var wizard = new Wizard(this);
	var listView = wizard.getValue("listView");
	var rowNames = ListView.getSelectedRows(listView);
	if(rowNames.length == 0) {
		alert(config.messages.nothingSelected);
	} else {
		for(var i = 0; i < rowNames.length; i++) {
			store.setTiddlerTag(rowNames[i], false, "systemConfig");
		}
		autoSaveChanges();
	}
};

config.macros.plugins.doDelete = function(e)
{
	var wizard = new Wizard(this);
	var listView = wizard.getValue("listView");
	var rowNames = ListView.getSelectedRows(listView);
	if(rowNames.length == 0) {
		alert(config.messages.nothingSelected);
	} else {
		if(confirm(config.macros.plugins.confirmDeleteText.format([rowNames.join(", ")]))) {
			for(var i = 0; i < rowNames.length; i++) {
				store.removeTiddler(rowNames[i]);
				story.closeTiddler(rowNames[i], true);
			}
		}
		autoSaveChanges();
	}
};

//--
//-- Message area
//--

function getMessageDiv()
{
	var msgArea = document.getElementById("messageArea");
	if(!msgArea) return null;

	if(!msgArea.hasChildNodes()) {
		var toolbar = createTiddlyElement(msgArea, "div", null, "messageArea__toolbar messageToolbar");
		var btn = createTiddlyButton(toolbar, '', config.messages.messageClose.tooltip, clearMessage,
			"button messageToolbar__button");

		btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" class="messageToolbar__icon">' +
		'	<rect width="1" height="13.1" x="4.5" y="-1.6" transform="rotate(-45 5 5)"/>' +
		'	<rect width="1" height="13.1" x="4.5" y="-1.6" transform="rotate(+45 5 5)"/>' +
		'</svg>';
		// inline SVG is unsupported in old FireFox
		if(window.HTMLUnknownElement && btn.firstChild instanceof window.HTMLUnknownElement) {
			btn.innerHTML = config.messages.messageClose.text;
		} else {
			btn.classList.add('messageToolbar__button_withIcon');
		}
	}
	msgArea.style.display = "block";
	return createTiddlyElement(msgArea, "div", null, "messageArea__text");
}

function displayMessage(text, link)
{
	var e = getMessageDiv();
	if(!e) {
		alert(text);
		return;
	}
	if(!link) {
		createTiddlyText(e, text);
	} else {
		createTiddlyElement(e, "a", null, null, text, { href: link, target: "_blank" });
	}
}

function clearMessage()
{
	var msgArea = document.getElementById("messageArea");
	if(msgArea) {
		jQuery(msgArea).empty();
		msgArea.style.display = "none";
	}
	return false;
}

//--
//-- Refresh mechanism
//--

config.notifyTiddlers = [
	{ name: "SystemSettings", notify: onSystemSettingsChange },
	{ name: "StyleSheetLayout", notify: refreshStyles },
	{ name: "StyleSheetColors", notify: refreshStyles },
	{ name: "StyleSheet", notify: refreshStyles },
	{ name: "StyleSheetPrint", notify: refreshStyles },
	{ name: "PageTemplate", notify: refreshPageTemplate },
	{ name: "SiteTitle", notify: refreshPageTitle },
	{ name: "SiteSubtitle", notify: refreshPageTitle },
	{ name: "WindowTitle", notify: refreshPageTitle },
	{ name: "ColorPalette", notify: refreshColorPalette },
	{ name: null, notify: refreshDisplay }
];

config.refreshers = {
	link: function(e, changeList)
	{
		var title = e.getAttribute("tiddlyLink");
		refreshTiddlyLink(e, title);
		return true;
	},

	tiddler: function(e, changeList)
	{
		if (startingUp) return true; // #147
		var title = e.getAttribute("tiddler");
		var template = e.getAttribute("template");
		if(changeList && (changeList.indexOf && changeList.indexOf(title) != -1) && !story.isDirty(title))
			story.refreshTiddler(title, template, true);
		else
			refreshElements(e, changeList);
		return true;
	},

	content: function(e, changeList)
	{
		var title = e.getAttribute("tiddler");
		var force = e.getAttribute("force");
		var args = e.macroArgs; // #154
		if(force != null || changeList == null || (changeList.indexOf && changeList.indexOf(title) != -1)) {
			jQuery(e).empty();
			config.macros.tiddler.transclude(e, title, args);
			return true;
		} else
			return false;
	},

	macro: function(e, changeList)
	{
		var macro = e.getAttribute("macroName");
		var params = e.getAttribute("params");
		if(macro)
			macro = config.macros[macro];
		if(macro && macro.refresh)
			macro.refresh(e, params);
		return true;
	}
};

config.refresherData = {
	styleSheet: "StyleSheet",
	defaultStyleSheet: "StyleSheet",
	pageTemplate: "PageTemplate",
	defaultPageTemplate: "PageTemplate",
	colorPalette: "ColorPalette",
	defaultColorPalette: "ColorPalette"
};

function refreshElements(root, changeList)
{
	var i, nodes = root.childNodes;
	for(i = 0; i < nodes.length; i++) {
		var e = nodes[i], type = null;
		if(e.getAttribute && (e.tagName ? e.tagName != "IFRAME" : true))
			type = e.getAttribute("refresh");
		var refresher = config.refreshers[type];
		var refreshed = false;
		if(refresher != undefined)
			refreshed = refresher(e, changeList);
		if(e.hasChildNodes() && !refreshed)
			refreshElements(e, changeList);
	}
}

function applyHtmlMacros(root, tiddler)
{
	var e = root.firstChild;
	while(e) {
		var nextChild = e.nextSibling;
		if(e.getAttribute) {
			var macro = e.getAttribute("macro");
			if(macro) {
				e.removeAttribute("macro");
				var params = "";
				var p = macro.indexOf(" ");
				if(p != -1) {
					params = macro.substr(p + 1);
					macro = macro.substr(0, p);
				}
				invokeMacro(e, macro, params, null, tiddler);
			}
		}
		if(e.hasChildNodes())
			applyHtmlMacros(e, tiddler);
		e = nextChild;
	}
}

function refreshPageTemplate(title)
{
	var stash = jQuery("<div/>").appendTo("body").hide()[0];
	var display = story.getContainer();
	var nodes, i;
	if(display) {
		nodes = display.childNodes;
		for(i = nodes.length - 1; i >= 0; i--)
			stash.appendChild(nodes[i]);
	}
	var wrapper = document.getElementById("contentWrapper");

	if(!title || !store.isAvailable(title))
		title = config.refresherData.pageTemplate;
	if(!store.isAvailable(title))
		title = config.refresherData.defaultPageTemplate; //# this one is always avaialable

	wrapper.innerHTML = store.getRecursiveTiddlerText(title, null, 10);
	applyHtmlMacros(wrapper);
	refreshElements(wrapper);
	display = story.getContainer();
	jQuery(display).empty();
	if(!display)
		display = createTiddlyElement(wrapper, "div", story.containerId());
	nodes = stash.childNodes;
	for(i = nodes.length - 1; i >= 0; i--)
		display.appendChild(nodes[i]);
	jQuery(stash).remove();
}

function refreshDisplay(hint)
{
	if(typeof hint == "string")
		hint = [hint];
	var e = document.getElementById("contentWrapper");
	refreshElements(e, hint);
	if(backstage.isPanelVisible()) {
		e = document.getElementById("backstage");
		refreshElements(e, hint);
	}
}

function refreshPageTitle()
{
	document.title = getPageTitle();
}

function getPageTitle()
{
	return wikifyPlainText(store.getTiddlerText("WindowTitle", ""), null, tiddler);
}

function refreshStyles(title, doc)
{
	setStylesheet(title == null ? "" : store.getRecursiveTiddlerText(title, "", 10), title, doc || document);
}

function refreshColorPalette(title)
{
	if(!startingUp)
		refreshAll();
}

function refreshAll()
{
	refreshPageTemplate();
	refreshDisplay();
	refreshStyles("StyleSheetLayout");
	refreshStyles("StyleSheetColors");
	refreshStyles(config.refresherData.styleSheet);
	refreshStyles("StyleSheetPrint");
}

//--
//-- Option handling
//--

config.optionHandlers = {
	'txt': {
		get: function(name) { return encodeCookie(config.options[name].toString()) },
		set: function(name, value) { config.options[name] = decodeCookie(value) }
	},
	'chk': {
		get: function(name) { return config.options[name] ? 'true' : 'false' },
		set: function(name, value) { config.options[name] = value == 'true' }
	}
};

function setOption(name, value)
{
	var optType = name.substr(0, 3);
	if(config.optionHandlers[optType] && config.optionHandlers[optType].set)
		config.optionHandlers[optType].set(name, value);
}

// Gets the value of an option as a string. Most code should just read from config.options.* directly
function getOption(name)
{
	var optType = name.substring(0, 3);
	return config.optionHandlers[optType] && config.optionHandlers[optType].get ?
		config.optionHandlers[optType].get(name) : null;
}

function loadOptions()
{
	if(safeMode) return;
	loadCookies();
	loadSystemSettings();
}
// @Deprecated; retained for backwards compatibility
var loadOptionsCookie = loadOptions;

function getCookies()
{
	var cookieList = document.cookie.split(';');
	var i, cookies = {};
	for(i = 0; i < cookieList.length; i++) {
		var p = cookieList[i].indexOf('=');
		if(p != -1) {
			var name = jQuery.trim(cookieList[i].substring(0, p));
			var value = jQuery.trim(cookieList[i].substring(p + 1));
			cookies[name] = value;
		}
	}
	return cookies;
}

function loadCookies()
{
	var i, cookies = getCookies();
	if(cookies['TiddlyWikiClassicOptions']) // TW291 and later //#159
		cookies = cookies['TiddlyWikiClassicOptions'].replace(/%22/g, '"').replace(/%25/g, '%').decodeHashMap(); // #159
	else if(cookies['TiddlyWikiOptions']) // TW290 beta //#159
		cookies = cookies['TiddlyWikiOptions'].replace(/%25/g, '%').decodeHashMap(); // #159
	else if(cookies['TiddlyWiki']) // TW281 and earlier
		cookies = cookies['TiddlyWiki'].decodeHashMap();

	for(i in cookies) {
		if(config.optionsSource[i] != 'setting') {
			setOption(i, cookies[i]);
		}
	}
}

function loadSystemSettings()
{
	var key, settings = store.calcAllSlices('SystemSettings');
	config.optionsSource = {};
	for(key in settings) {
		setOption(key, settings[key]);
		config.optionsSource[key] = 'setting';
	}
}

function onSystemSettingsChange()
{
	if(!startingUp) {
		loadSystemSettings();
	}
}

function saveOption(name)
{
	if(safeMode) return;
	if(name.match(/[()\s]/g, '_')) {
		alert(config.messages.invalidCookie.format([name]));
		return;
	}

	saveCookie(name);
	if(config.optionsSource[name] == 'setting') {
		saveSystemSetting(name, true);
	}
}
// @Deprecated; retained for backwards compatibility
var saveOptionCookie = saveOption;

function removeCookie(name)
{
	document.cookie = name + '=; expires=Thu, 01-Jan-1970 00:00:01 UTC; path=/;';
}

function saveCookie(name)
{
	var key, cookies = {};
	for(key in config.options) {
		var value = getOption(key);
		value = value == null ? 'false' : value;
		cookies[key] = value;
	}
	document.cookie = 'TiddlyWikiClassicOptions='
		+ String.encodeHashMap(cookies).replace(/%/g, '%25').replace(/"/g, '%22')
		+ '; expires=Fri, 1 Jan 2038 12:00:00 UTC; path=/';

	// clean up cookies saved in an earlier format, before TW291 (#159)
	cookies = getCookies();
	for(var c in cookies) {
		var optType = c.substring(0, 3);
		if(config.optionHandlers[optType])
			removeCookie(c);
	}
}

var systemSettingSave;
function commitSystemSettings(storeWasDirty)
{
	if(systemSettingSave) {
		window.clearTimeout(systemSettingSave);
	}
	systemSettingSave = window.setTimeout(function() {
		var tiddler = store.getTiddler('SystemSettings');
		autoSaveChanges(null, [tiddler]);
	}, 1000);
}

function saveSystemSetting(name, saveFile)
{
	var title = 'SystemSettings';
	var slice = store.getTiddlerSlice(title, name);
	var isUnchanged = slice === getOption(name);
	if(readOnly || isUnchanged) return;

	var slices = store.calcAllSlices(title);
	for(var key in config.optionsSource) {
		var value = getOption(key) || '';
		if(slices[key] !== value) {
			slices[key] = value;
		}
	}

	var text = [];
	for(key in slices) {
		text.push('%0: %1'.format([key, slices[key]]));
	}
	text = text.sort().join('\n');

	var storeWasDirty = store.isDirty();
	var tiddler = store.getTiddler(title);
	if(tiddler) {
		tiddler.text = text;
		tiddler = store.saveTiddler(tiddler);
	} else {
		tiddler = store.saveTiddler(title, title, text, 'System',
			new Date(), ['excludeLists'], config.defaultCustomFields);
	}
	if(saveFile) {
		commitSystemSettings(storeWasDirty);
	}
}

function encodeCookie(s)
{
	return escape(convertUnicodeToHtmlEntities(s));
}

function decodeCookie(s)
{
	s = unescape(s);
	var re = /&#[0-9]{1,5};/g;
	return s.replace(re, function($0) { return String.fromCharCode(eval($0.replace(/[&#;]/g, ''))) });
}

config.macros.option.genericCreate = function(place, type, opt, className, desc)
{
	var typeInfo = config.macros.option.types[type];
	var text = desc != 'no' ? (config.optionsDesc[opt] || opt) : null;
	var attributes = { option: opt };
	if(typeInfo.typeValue) attributes.type = typeInfo.typeValue;
	if(config.optionsDesc[opt]) attributes.title = config.optionsDesc[opt];
	var c = createTiddlyElement(place, typeInfo.elementType, null, className || typeInfo.className, text, attributes);
	c[typeInfo.eventName] = typeInfo.onChange;
	c[typeInfo.valueField] = config.options[opt];
	return c;
};

config.macros.option.genericOnChange = function(e)
{
	var opt = this.getAttribute('option');
	if(opt) {
		var optType = opt.substring(0, 3);
		var handler = config.macros.option.types[optType];
		if(handler.elementType && handler.valueField)
			config.macros.option.propagateOption(opt, handler.valueField,
				this[handler.valueField], handler.elementType, this);
	}
	return true;
};

config.macros.option.types = {
	'txt': {
		elementType: 'input',
		valueField: 'value',
		eventName: 'onchange',
		className: 'txtOptionInput',
		create: config.macros.option.genericCreate,
		onChange: config.macros.option.genericOnChange
	},
	'chk': {
		elementType: 'input',
		valueField: 'checked',
		eventName: 'onclick',
		className: 'chkOptionInput',
		typeValue: 'checkbox',
		create: config.macros.option.genericCreate,
		onChange: config.macros.option.genericOnChange
	}
};

config.macros.option.propagateOption = function(opt, valueField, value, elementType, sourceEditor)
{
	config.options[opt] = value;
	saveOption(opt);

	jQuery(elementType + '[option=' + opt + ']').each(function(i, editor) {
		if(editor != sourceEditor) editor[valueField] = value;
	});
};

config.macros.option.handler = function(place, macroName, params, wikifier, paramString)
{
	params = paramString.parseParams('anon', null, true, false, false);
	var opt = (params[1] && params[1].name == 'anon') ? params[1].value : getParam(params, 'name', null);
	var className = (params[2] && params[2].name == 'anon') ? params[2].value : getParam(params, 'class', null);
	var desc = getParam(params, 'desc', 'no');
	var type = opt.substring(0, 3);
	var h = config.macros.option.types[type];
	if(h && h.create)
		h.create(place, type, opt, className, desc);
};

config.macros.options.handler = function(place, macroName, params, wikifier, paramString)
{
	params = paramString.parseParams('anon', null, true, false, false);
	var showUnknown = getParam(params, 'showUnknown', 'no');
	var wizard = new Wizard();
	wizard.createWizard(place, this.wizardTitle);
	wizard.addStep(this.step1Title, this.step1Html);
	var markList = wizard.getElement('markList');
	var chkUnknown = wizard.getElement('chkUnknown');
	chkUnknown.checked = showUnknown == 'yes';
	chkUnknown.onchange = this.onChangeUnknown;
	var listWrapper = document.createElement('div');
	markList.parentNode.insertBefore(listWrapper, markList);
	wizard.setValue('listWrapper', listWrapper);
	this.refreshOptions(listWrapper, showUnknown == 'yes');
};

config.macros.options.refreshOptions = function(listWrapper, showUnknown)
{
	var n, opts = [];
	for(n in config.options) {
		var isUnknown = !config.optionsDesc[n];
		if(!isUnknown || showUnknown) opts.push({
			option: '',
			name: n,
			lowlight: isUnknown,
			description: config.optionsDesc[n] || this.unknownDescription
		});
	}
	opts.sort(function(a, b) {
		var nameA = a.name.substring(3);
		var nameB = b.name.substring(3);
		return nameA < nameB ? -1 : (nameA == nameB ? 0 : +1);
	});

	ListView.create(listWrapper, opts, this.listViewTemplate);
	for(var i = 0; i < opts.length; i++) {
		var type = opts[i].name.substring(0, 3);
		var h = config.macros.option.types[type];
		if(h && h.create) {
			h.create(opts[i].colElements['option'], type, opts[i].name, null, 'no');
		}
	}
};

config.macros.options.onChangeUnknown = function(e)
{
	var wizard = new Wizard(this);
	var listWrapper = wizard.getValue('listWrapper');
	jQuery(listWrapper).empty();
	config.macros.options.refreshOptions(listWrapper, this.checked);
	return false;
};

//--
//-- Saving
//--

var startSaveArea = '<div id="' + 'storeArea">'; // Split up into two so that indexOf() of this source doesn't find it
var startSaveAreaRE = /<((div)|(DIV)) ((id)|(ID))=["']?storeArea['"]?>/; // Used for IE6
var endSaveArea = '</d' + 'iv>';
var endSaveAreaCaps = '</D' + 'IV>';

// If there are unsaved changes, force the user to confirm before exitting
function confirmExit()
{
	hadConfirmExit = true;
	var hasDirtyStore = store && store.isDirty && store.isDirty();
	var hasDirtyStory = story && story.areAnyDirty && story.areAnyDirty();
	if(hasDirtyStore || hasDirtyStory) return config.messages.confirmExit;
}

// Give the user a chance to save changes before exitting
function checkUnsavedChanges()
{
	if(store && store.isDirty && store.isDirty() && window.hadConfirmExit === false) {
		if(confirm(config.messages.unsavedChangesWarning))
			saveChanges();
	}
}

function updateLanguageAttribute(s)
{
	if(!config.locale) return s;
	var m = /(<html(?:.*?)?)(?: xml:lang\="([a-z]+)")?(?: lang\="([a-z]+)")?>/.exec(s);
	if(!m) return s;

	var htmlTag = m[1];
	if(m[2]) htmlTag += ' xml:lang="' + config.locale + '"';
	if(m[3]) htmlTag += ' lang="' + config.locale + '"';
	htmlTag += ">";

	return s.substr(0, m.index) + htmlTag + s.substr(m.index + m[0].length);
}

function updateMarkupBlock(s, blockName, tiddlerName)
{
	return tw.textUtils.replaceChunk(s,
		"<!--%0-START-->".format([blockName]),
		"<!--%0-END-->".format([blockName]),
		"\n" + store.getRecursiveTiddlerText(tiddlerName, "") + "\n");
}

function updateOriginal(original, posDiv, localPath)
{
	if(!posDiv) posDiv = locateStoreArea(original);
	if(!posDiv) {
		alert(config.messages.invalidFileError.format([localPath]));
		return null;
	}
	var revised = original.substr(0, posDiv[0] + startSaveArea.length) + "\n" +
		store.allTiddlersAsHtml() + "\n" +
		original.substr(posDiv[1]);
	var newSiteTitle = getPageTitle().htmlEncode();
	revised = tw.textUtils.replaceChunk(revised, "<title" + ">", "</title" + ">", " " + newSiteTitle + " ");
	revised = updateLanguageAttribute(revised);
	revised = updateMarkupBlock(revised, "PRE-HEAD", "MarkupPreHead");
	revised = updateMarkupBlock(revised, "POST-HEAD", "MarkupPostHead");
	revised = updateMarkupBlock(revised, "PRE-BODY", "MarkupPreBody");
	revised = updateMarkupBlock(revised, "POST-SCRIPT", "MarkupPostBody");
	return revised;
}

function locateStoreArea(original)
{
	// Locate the storeArea divs
	if(!original) return null;
	var posOpeningDiv = original.search(startSaveAreaRE);
	var limitClosingDiv = original.indexOf("<" + "!--POST-STOREAREA--" + ">");
	if(limitClosingDiv == -1)
		limitClosingDiv = original.indexOf("<" + "!--POST-BODY-START--" + ">");
	var start = limitClosingDiv == -1 ? original.length : limitClosingDiv;
	var posClosingDiv = original.lastIndexOf(endSaveArea, start);
	if(posClosingDiv == -1)
		posClosingDiv = original.lastIndexOf(endSaveAreaCaps, start);
	return (posOpeningDiv != -1 && posClosingDiv != -1) ? [posOpeningDiv, posClosingDiv] : null;
}

function autoSaveChanges(onlyIfDirty, tiddlers)
{
	if(config.options.chkAutoSave)
		saveChanges(onlyIfDirty, tiddlers);
}

// get the full HTML of the original file
function loadOriginal(localPath, callback)
{
	if(!callback) return loadFile(localPath) || window.originalHTML || recreateOriginal();

	tw.io.loadFile(localPath, function(result, details) {
		if(typeof result == 'string') {
			callback(result, details);
		} else {
			var original = window.originalHTML || recreateOriginal();
			callback(original);
		}
	});
}

// reconstruct original HTML file content from current document memory
function recreateOriginal()
{
	// construct doctype
	var content = "<!DOCTYPE ";
	var t = document.doctype;
	if (!t)
		content += "html";
	else {
		content += t.name;
		if(t.publicId)
			content += ' PUBLIC "' + t.publicId + '"';
		else if(t.systemId)
			content += ' SYSTEM "' + t.systemId + '"';
	}
	content += ' "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"';
	content += '>\n';

	// append current document content
	content += document.documentElement.outerHTML;

	// clear 'savetest' marker
	content = content.replace(/<div id="saveTest">savetest<\/div>/, '<div id="saveTest"></div>');
	content = content.replace(/script><applet [^\>]*><\/applet>/g, 'script>');
	// newline before head tag
	content = content.replace(/><head>/, '>\n<head>');
	// newlines before/after end of body/html tags
	content = content.replace(/\n\n<\/body><\/html>$/, '</' + 'body>\n</' + 'html>\n'); // #170
	// meta tag terminators
	content = content.replace(/(<(meta) [^\>]*[^\/])>/g, '$1 />');
	// decode LT/GT entities in noscript
	content = content.replace(/<noscript>[^\<]*<\/noscript>/,
		function(m) { return m.replace(/&lt;/g, '<').replace(/&gt;/g, '>') });
	// encode copyright symbols (UTF-8 to HTML entity)
	content = content.replace(/<div id="copyright">[^\<]*<\/div>/,
		function(m) { return m.replace(/\xA9/g, '&copy;') });

	return content;
}

// Save this tiddlywiki with the pending changes
function saveChanges(onlyIfDirty, tiddlers)
{
	if(onlyIfDirty && !store.isDirty()) return;

	clearMessage();
	var t0 = new Date();
	var msg = config.messages;
	if(!window.allowSave()) {
		alert(msg.notFileUrlError);
		if(store.tiddlerExists(msg.saveInstructions))
			story.displayTiddler(null, msg.saveInstructions);
		return;
	}

	var originalPath = document.location.toString();
	var localPath = getLocalPath(originalPath);
	var onLoadOriginal = function(original) {
		if(original == null) {
			alert(msg.cantSaveError);
			if(store.tiddlerExists(msg.saveInstructions))
				story.displayTiddler(null, msg.saveInstructions);
			return;
		}

		var posDiv = locateStoreArea(original);
		if(!posDiv) {
			alert(msg.invalidFileError.format([localPath]));
			return;
		}

		config.saveByDownload = false;
		config.saveByManualDownload = false;
		saveMain(localPath, original, posDiv);

		var co = config.options;
		if (!config.saveByDownload && !config.saveByManualDownload) {
			if(co.chkSaveBackups) saveBackup(localPath, original);
			if(co.chkSaveEmptyTemplate) saveEmpty(localPath, original, posDiv);
			if(co.chkGenerateAnRssFeed) saveRss(localPath);
		}

		if(co.chkDisplayInstrumentation)
			displayMessage("saveChanges " + (new Date() - t0) + " ms");
	};

	if(!config.options.chkPreventAsyncSaving) {
		loadOriginal(localPath, onLoadOriginal);
	} else {
		// useful when loadOriginal is overwritten without support of callback
		// or when an extension relies saveChanges being a sync function
		var original = loadOriginal(localPath);
		onLoadOriginal(original);
	}
}

function saveMain(localPath, original, posDiv)
{
	try {
		var revised = updateOriginal(original, posDiv, localPath);
		var saved = saveFile(localPath, revised);
		if(!saved) {
			tw.io.onSaveMainFail();
		} else {
			tw.io.onSaveMainSuccess(config.saveByDownload ? getDataURI(revised) : "file://" + localPath, revised, original);
		}
	} catch (ex) {
		tw.io.onSaveMainFail(ex);
	}
}

tw.io.onSaveMainSuccess = function(urlSaved, savedHtml, original) {
	if (!config.saveByManualDownload) {
		displayMessage(
			// set by HTML5DownloadSaveFile()
			config.saveByDownload ?
				config.messages.mainDownload :
				config.messages.mainSaved,
			urlSaved);
	}

	store.setDirty(false);
};

tw.io.onSaveMainFail = function(catchedExeption) {
	alert(config.messages.mainFailed);
	if(catchedExeption) showException(catchedExeption);
};

function saveBackup(localPath, original)
{
	var backupPath = getBackupPath(localPath);
	var backupSuccess = copyFile(backupPath, localPath) || saveFile(backupPath, original);
	if(backupSuccess)
		displayMessage(config.messages.backupSaved, "file://" + backupPath);
	else
		alert(config.messages.backupFailed);
}

function saveEmpty(localPath, original, posDiv)
{
	var emptyPath, slashPosition;
	if((slashPosition = localPath.lastIndexOf("/")) != -1)
		emptyPath = localPath.substr(0, slashPosition) + "/";
	else if((slashPosition = localPath.lastIndexOf("\\")) != -1)
		emptyPath = localPath.substr(0, slashPosition) + "\\";
	else
		emptyPath = localPath + ".";
	emptyPath += "empty.html";

	var empty = original.substr(0, posDiv[0] + startSaveArea.length) + original.substr(posDiv[1]);
	var emptySave = saveFile(emptyPath, empty);
	if(emptySave)
		displayMessage(config.messages.emptySaved, "file://" + emptyPath);
	else
		alert(config.messages.emptyFailed);
}

// Translate URL to local path [Preemption]
window.getLocalPath = window.getLocalPath || function(origPath)
{
	var originalPath = convertUriToUTF8(origPath, config.options.txtFileSystemCharSet);
	// Remove any location or query part of the URL
	var argPos = originalPath.indexOf("?");
	if(argPos != -1)
		originalPath = originalPath.substr(0, argPos);
	var hashPos = originalPath.indexOf("#");
	if(hashPos != -1)
		originalPath = originalPath.substr(0, hashPos);
	// Convert file://localhost/ to file:///
	if(originalPath.indexOf("file://localhost/") == 0)
		originalPath = "file://" + originalPath.substr(16);
	// Convert to a native file format
	// "file:///x:/path/path/path..." - pc local file --> "x:\path\path\path..."
	// "file://///server/share/path/path/path..." - FireFox pc network file --> "\\server\share\path\path\path..."
	// "file:///path/path/path..." - mac/unix local file --> "/path/path/path..."
	// "file://server/share/path/path/path..." - pc network file --> "\\server\share\path\path\path..."
	var localPath;
	if(originalPath.charAt(9) == ":") // pc local file
		localPath = unescape(originalPath.substr(8)).replace(new RegExp("/", "g"), "\\");
	else if(originalPath.indexOf("file://///") == 0) // FireFox pc network file
		localPath = "\\\\" + unescape(originalPath.substr(10)).replace(new RegExp("/", "g"), "\\");
	else if(originalPath.indexOf("file:///") == 0) // mac/unix local file
		localPath = unescape(originalPath.substr(7));
	else if(originalPath.indexOf("file:/") == 0) // mac/unix local file
		localPath = unescape(originalPath.substr(5));
	else // pc network file
		localPath = "\\\\" + unescape(originalPath.substr(7)).replace(new RegExp("/", "g"), "\\");
	return localPath;
};

function getBackupPath(localPath, filenameSuffix, extension)
{
	var slash = "\\";
	var dirPathPos = localPath.lastIndexOf("\\");
	if(dirPathPos == -1) {
		dirPathPos = localPath.lastIndexOf("/");
		slash = "/";
	}
	var backupFolder = config.options.txtBackupFolder || ".";
	var backupPath = localPath.substring(0, dirPathPos) + slash + backupFolder + localPath.substring(dirPathPos);
	backupPath = backupPath.substring(0, backupPath.lastIndexOf(".")) + ".";
	if(filenameSuffix) {
		var illegalFilenameCharacterOrSpaceRE = /[\\\/\*\?\":<> ]/g;
		backupPath += filenameSuffix.replace(illegalFilenameCharacterOrSpaceRE, "_") + ".";
	}
	backupPath += (new Date()).convertToYYYYMMDDHHMMSSMMM() + "." + (extension || "html");
	return backupPath;
}

//--
//-- RSS Saving
//--

function saveRss(localPath)
{
	var rssPath = localPath.substr(0, localPath.lastIndexOf(".")) + ".xml";
	if(saveFile(rssPath, generateRss()))
		displayMessage(config.messages.rssSaved, "file://" + rssPath);
	else
		alert(config.messages.rssFailed);
}

tiddlerToRssItem = function(tiddler, uri)
{
	var s = "<title" + ">" + tiddler.title.htmlEncode() + "</title" + ">\n";
	s += "<description>" + wikifyStatic(tiddler.text, null, tiddler).htmlEncode() + "</description>\n";
	for(var i = 0; i < tiddler.tags.length; i++)
		s += "<category>" + tiddler.tags[i] + "</category>\n";
	s += "<link>" + uri + "#" + encodeURIComponent(String.encodeTiddlyLink(tiddler.title)) + "</link>\n";
	s += "<pubDate>" + tiddler.modified.toGMTString() + "</pubDate>\n";
	return s;
};

function generateRss()
{
	var s = [];
	var d = new Date();
	var u = store.getTiddlerText("SiteUrl");
	// Assemble the header
	s.push("<" + "?xml version=\"1.0\"?" + ">");
	s.push("<rss version=\"2.0\">");
	s.push("<channel>");
	s.push("<title" + ">" + wikifyPlainText(store.getTiddlerText("SiteTitle", ""),
		null, tiddler).htmlEncode() + "</title" + ">");
	if(u) s.push("<link>" + u.htmlEncode() + "</link>");
	s.push("<description>" + wikifyPlainText(store.getTiddlerText("SiteSubtitle", ""),
		null, tiddler).htmlEncode() + "</description>");
	s.push("<language>" + config.locale + "</language>");
	s.push("<copyright>Copyright " + d.getFullYear() + " " + config.options.txtUserName.htmlEncode() + "</copyright>");
	s.push("<pubDate>" + d.toGMTString() + "</pubDate>");
	s.push("<lastBuildDate>" + d.toGMTString() + "</lastBuildDate>");
	s.push("<docs>http://blogs.law.harvard.edu/tech/rss</docs>");
	s.push("<generator>TiddlyWiki " + formatVersion() + "</generator>");
	// The body
	var tiddlers = store.getTiddlers("modified", "excludeLists");
	var i, n = config.numRssItems > tiddlers.length ? 0 : tiddlers.length - config.numRssItems;
	for(i = tiddlers.length - 1; i >= n; i--) {
		s.push("<item>\n" + tiddlerToRssItem(tiddlers[i], u) + "\n</item>");
	}
	// And footer
	s.push("</channel>");
	s.push("</rss>");
	// Save it all
	return s.join("\n");
}

//--
//-- Filesystem code
//--

// Copy a file in filesystem [Preemption]
window.copyFile = window.copyFile || function(dest, source)
{
	return config.browser.isIE ? ieCopyFile(dest, source) : false;
};

// Save a file in filesystem [Preemption]
window.saveFile = window.saveFile || function(fileUrl, content)
{
	var r = mozillaSaveFile(fileUrl, content);
	if(!r)
		r = ieSaveFile(fileUrl, content);
	if(!r)
		r = javaSaveFile(fileUrl, content);
	if(!r)
		r = HTML5DownloadSaveFile(fileUrl, content);
	if(!r)
		r = manualSaveFile(fileUrl, content);
	return r;
};

// Load a file from filesystem [Preemption]
window.loadFile = window.loadFile || function(fileUrl)
{
	var r = mozillaLoadFile(fileUrl);
	if((r === null) || (r === false))
		r = ieLoadFile(fileUrl);
	if((r === null) || (r === false))
		r = javaLoadFile(fileUrl);
	if((r === null) || (r === false))
		r = tw.io.xhrLoadFile(fileUrl);
	return r;
};

tw.io.xhrLoadFile = function(filePath, callback)
{
	try {
		var isAsync = !!callback;
		var url = 'file://' + (filePath[0] != '/' ? '/' : '') + encodeURIComponent(filePath);
		if(isAsync) {
			httpReq('GET', url, function(status, params, responseText, url, xhr) {
				callback(responseText, { xhr: xhr });
			});
		} else {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, isAsync);
			xhr.send(null);
			return xhr.responseText;
		}
	} catch(ex) {
		return callback ? callback(null) : null;
	}
};

// if callback is set, tries to load in an async fashion and do callback(result, details)
tw.io.loadFile = function(fileUrl, callback)
{
	if(!callback) return loadFile(fileUrl);

	tw.io.xhrLoadFile(fileUrl, function(result, details) {
		if(typeof result == 'string') {
			callback(result, details);
		} else {
			result = loadFile(fileUrl);
			callback(result);
		}
	});
};


function ieCreatePath(path)
{
	try {
		var fso = new ActiveXObject("Scripting.FileSystemObject");
	} catch(ex) {
		return null;
	}

	// Remove the filename, if present. Use trailing slash (i.e. "foo\bar\") if no filename.
	var pos = path.lastIndexOf("\\");
	if(pos == -1)
		pos = path.lastIndexOf("/");
	if(pos != -1)
		path = path.substring(0, pos + 1);

	// Walk up the path until we find a folder that exists
	var scan = [path];
	var parent = fso.GetParentFolderName(path);
	while(parent && !fso.FolderExists(parent)) {
		scan.push(parent);
		parent = fso.GetParentFolderName(parent);
	}

	// Walk back down the path, creating folders
	for(var i = scan.length - 1; i >= 0; i--) {
		if(!fso.FolderExists(scan[i])) {
			fso.CreateFolder(scan[i]);
		}
	}
	return true;
}

// Returns null if it can't do it, false if there's an error, true if it saved OK
function ieSaveFile(filePath, content)
{
	ieCreatePath(filePath);
	try {
		var fso = new ActiveXObject("Scripting.FileSystemObject");
	} catch(ex) {
		return null;
	}
	var file = fso.OpenTextFile(filePath, 2, -1, 0);
	file.Write(convertUnicodeToHtmlEntities(content));
	file.Close();
	return true;
}

// Returns null if it can't do it, false if there's an error, or a string of the content if successful
function ieLoadFile(filePath)
{
	try {
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		var file = fso.OpenTextFile(filePath, 1);
		var content = file.ReadAll();
		file.Close();
	} catch(ex) {
		return null;
	}
	return content;
}

function ieCopyFile(dest, source)
{
	ieCreatePath(dest);
	try {
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		fso.GetFile(source).Copy(dest);
	} catch(ex) {
		return false;
	}
	return true;
}

// Returns null if it can't do it, false if there's an error, true if it saved OK
function mozillaSaveFile(filePath, content)
{
	if(!window.Components) return null;

	content = mozConvertUnicodeToUTF8(content);
	try {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		var file = Components.classes["@mozilla.org/file/local;1"]
			.createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath(filePath);
		if(!file.exists())
			file.create(0, 0x01B4);// 0x01B4 = 0664
		var out = Components.classes["@mozilla.org/network/file-output-stream;1"]
			.createInstance(Components.interfaces.nsIFileOutputStream);
		out.init(file, 0x22, 0x04, null);
		out.write(content, content.length);
		out.flush();
		out.close();
		return true;
	} catch(ex) {
		return false;
	}
}

// Returns null if it can't do it, false if there's an error, or a string of the content if successful
function mozillaLoadFile(filePath)
{
	if(!window.Components) return null;

	try {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath(filePath);
		if(!file.exists())
			return null;
		var inputStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
			.createInstance(Components.interfaces.nsIFileInputStream);
		inputStream.init(file, 0x01, 0x04, null);
		var sInputStream = Components.classes["@mozilla.org/scriptableinputstream;1"]
			.createInstance(Components.interfaces.nsIScriptableInputStream);
		sInputStream.init(inputStream);
		var contents = sInputStream.read(sInputStream.available());
		sInputStream.close();
		inputStream.close();
		return mozConvertUTF8ToUnicode(contents);
	} catch(ex) {
		return false;
	}
}

function javaUrlToFilename(url)
{
	var f = "//localhost";
	if(url.indexOf(f) == 0)
		return url.substring(f.length);
	var i = url.indexOf(":");
	return i > 0 ? url.substring(i - 1) : url;
}

/*
 * in between when the applet has been started
 * and the user has given permission to run the applet
 * we get an applet object, but it doesn't have the methods
 * we expect yet.
 */
var LOG_TIDDLYSAVER = true;
function logTiddlySaverException(msg, ex)
{
	var applet = document.applets['TiddlySaver'];
	console.log(msg + ": " + ex);
	if (LOG_TIDDLYSAVER && applet) {
		try {
			console.log(msg + ": " + applet.getLastErrorMsg());
			console.log(msg + ": " + applet.getLastErrorStackTrace());
		} catch (ex) {}
	}
}

function javaDebugInformation()
{
	var applet = document.applets['TiddlySaver'];
	var what = [
		["Java Version", applet.getJavaVersion],
		["Last Exception", applet.getLastErrorMsg], // #156
		["Last Exception Stack Trace", applet.getLastErrorStackTrace],
		["System Properties", applet.getSystemProperties] ];

	function formatItem (description, method) {
		try {
			 result = String(method.call(applet));
		} catch (ex) {
			 result = String(ex);
		}
		return description + ": " + result;
	}

	return jQuery.map(what, function (item) { return formatItem.apply(this, item) })
		.join('\n\n');
}

function javaSaveFile(filePath, content)
{
	if(!filePath) return null;
	var applet = document.applets['TiddlySaver'];
	if(applet) {
		try {
			return applet.saveFile(javaUrlToFilename(filePath), "UTF-8", content);
		} catch(ex) {
			logTiddlySaverException("javaSaveFile", ex);
		}
	}
	try {
		var s = new java.io.PrintStream(new java.io.FileOutputStream(javaUrlToFilename(filePath)));
		s.print(content);
		s.close();
	} catch(ex2) {
		return null;
	}
	return true;
}

function javaLoadFile(filePath)
{
	if(!filePath) return null;
	var applet = document.applets['TiddlySaver'];
	if(applet) {
		try {
			var value = applet.loadFile(javaUrlToFilename(filePath), "UTF-8");
			return !value ? null : String(value);
		} catch(ex) {
			logTiddlySaverException("javaLoadFile", ex);
		}
	}
	var content = [];
	try {
		var r = new java.io.BufferedReader(new java.io.FileReader(javaUrlToFilename(filePath)));
		var line;
		while((line = r.readLine()) != null)
			content.push(String(line));
		r.close();
	} catch(ex2) {
		return null;
	}
	return content.join("\n");
}

function HTML5DownloadSaveFile(filePath, content)
{
	var link = document.createElement("a");
	if(link.download === undefined)
		return null;

	config.saveByDownload = true;
	var slashpos = filePath.lastIndexOf("/");
	if (slashpos == -1) slashpos = filePath.lastIndexOf("\\");
	var filename = filePath.substr(slashpos + 1);
	var uri = getDataURI(content);
	link.setAttribute("target", "_blank");
	link.setAttribute("href", uri);
	link.setAttribute("download", filename);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	return true;
}

// Returns null if it can't do it, false if there's an error, true if it saved OK
function manualSaveFile(filePath, content)
{
	// FALLBACK for showing a link to data: URI
	config.saveByManualDownload = true;
	var slashpos = filePath.lastIndexOf("/");
	if (slashpos == -1) slashpos = filePath.lastIndexOf("\\");
	var filename = filePath.substr(slashpos + 1);
	var uri = getDataURI(content);
	displayMessage(config.messages.mainDownloadManual, uri);
	return true;
}

// construct data URI (using base64 encoding to preserve multi-byte encodings)
function getDataURI(data)
{
	if (config.browser.isIE)
		return "data:text/html," + encodeURIComponent(data);
	else
		// manualConvertUnicodeToUTF8 was moved here from convertUnicodeToFileFormat
		// in 2.9.1 it was used only for FireFox but happened to fix download saving non-ASCII in Chrome & Safari as well
		return "data:text/html;base64," + encodeBase64(manualConvertUnicodeToUTF8(data));
}

function encodeBase64(data)
{
	if (!data) return "";
	var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var out = "";
	var chr1, chr2, chr3 = "";
	var enc1, enc2, enc3, enc4 = "";
	for (var i = 0; i < data.length; )
	{
		chr1 = data.charCodeAt(i++);
		chr2 = data.charCodeAt(i++);
		chr3 = data.charCodeAt(i++);
		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;
		if (isNaN(chr2)) enc3 = enc4 = 64;
		else if (isNaN(chr3)) enc4 = 64;
		out += keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
		chr1 = chr2 = chr3 = enc1 = enc2 = enc3 = enc4 = "";
	}
	return out;
}

//--
//-- Filesystem utilities
//--

function convertUTF8ToUnicode(u)
{
	return config.browser.isOpera || !window.netscape ? manualConvertUTF8ToUnicode(u) : mozConvertUTF8ToUnicode(u);
}


function manualConvertUTF8ToUnicode(utf)
{
	var uni = utf;
	var src = 0;
	var dst = 0;
	var b1, b2, b3;
	var c;
	while(src < utf.length) {
		b1 = utf.charCodeAt(src++);
		if(b1 < 0x80) {
			dst++;
		} else if(b1 < 0xE0) {
			b2 = utf.charCodeAt(src++);
			c = String.fromCharCode(((b1 & 0x1F) << 6) | (b2 & 0x3F));
			uni = uni.substring(0, dst++).concat(c, utf.substr(src));
		} else {
			b2 = utf.charCodeAt(src++);
			b3 = utf.charCodeAt(src++);
			c = String.fromCharCode(((b1 & 0xF) << 12) | ((b2 & 0x3F) << 6) | (b3 & 0x3F));
			uni = uni.substring(0, dst++).concat(c, utf.substr(src));
		}
	}
	return uni;
}

function mozConvertUTF8ToUnicode(u)
{
	try {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
			.createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
		converter.charset = "UTF-8";
	} catch(ex) {
		return manualConvertUTF8ToUnicode(u);
	} // fallback
	var s = converter.ConvertToUnicode(u);
	var fin = converter.Finish();
	return fin.length > 0 ? s + fin : s;
}

function manualConvertUnicodeToUTF8(s)
{
	return unescape(encodeURIComponent(s));
}

function mozConvertUnicodeToUTF8(s)
{
	try {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
			.createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
		converter.charset = "UTF-8";
	} catch(ex) {
		return manualConvertUnicodeToUTF8(s);
	} // fallback
	var u = converter.ConvertFromUnicode(s);
	var fin = converter.Finish();
	return fin.length > 0 ? u + fin : u;
}

function convertUnicodeToHtmlEntities(s)
{
	var re = /[^\u0000-\u007F]/g;
	return s.replace(re, function($0) { return "&#" + $0.charCodeAt(0).toString() + ";" });
}

function convertUriToUTF8(uri, charSet)
{
	if(window.netscape == undefined || charSet == undefined || charSet == "")
		return uri;
	try {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		var converter = Components.classes["@mozilla.org/intl/utf8converterservice;1"]
			.getService(Components.interfaces.nsIUTF8ConverterService);
	} catch(ex) {
		return uri;
	}
	return converter.convertURISpecToUTF8(uri, charSet);
}

// deprecated helper for backward-compatibility with elder extensions
// (browser/saving method-specific convertion is only needed in browser-specific savers)
function convertUnicodeToFileFormat(s)
{
	return s;
}

// deprecated helper for backward-compatibility with elder extensions
function convertUnicodeToUTF8(s)
{
	return s;
}

//--
//-- Server adaptor base class
//--

function AdaptorBase()
{
	this.host = null;
	this.store = null;
	return this;
}

AdaptorBase.prototype.close = function()
{
	return true;
};

AdaptorBase.prototype.fullHostName = function(host)
{
	if(!host) return '';
	host = jQuery.trim(host);
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if(host.substr(host.length - 1) == '/')
		host = host.substr(0, host.length - 1);
	return host;
};

AdaptorBase.minHostName = function(host)
{
	return host;
};

AdaptorBase.prototype.setContext = function(context, userParams, callback)
{
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	if(!context.host)
		context.host = this.host;
	context.host = this.fullHostName(context.host);
	if(!context.workspace)
		context.workspace = this.workspace;
	return context;
};

// Open the specified host
//   host - uri of host (eg, "http://www.tiddlywiki.com/" or "www.tiddlywiki.com")
//   context is itself passed on as a parameter to the callback function
//   userParams - user settable object object that is passed on unchanged to the callback function
//   callback - optional function to be called on completion
// Return value is true if the request was successfully issued, false if this connector doesn't support openHost(),
//   or an error description string if there was a problem
// The callback parameters are callback(context)
//   context.status - true if OK, string if error
//   context.adaptor - reference to this adaptor object
//   userParams - parameters as originally passed into the openHost function
AdaptorBase.prototype.openHost = function(host, context, userParams, callback)
{
	this.host = host;
	context = this.setContext(context, userParams, callback);
	context.status = true;
	if(callback)
		window.setTimeout(function() { context.callback(context, userParams) }, 10);
	return true;
};

// Open the specified workspace
//   workspace - name of workspace to open
//   context - passed on as a parameter to the callback function
//   userParams - user settable object object that is passed on unchanged to the callback function
//   callback - function to be called on completion
// Return value is true if the request was successfully issued
//   or an error description string if there was a problem
// The callback parameters are callback(context, userParams)
//   context.status - true if OK, false if error
//   context.statusText - error message if there was an error
//   context.adaptor - reference to this adaptor object
//   userParams - parameters as originally passed into the openWorkspace function
AdaptorBase.prototype.openWorkspace = function(workspace, context, userParams, callback)
{
	this.workspace = workspace;
	context = this.setContext(context, userParams, callback);
	context.status = true;
	if(callback)
		window.setTimeout(function() { callback(context, userParams) }, 10);
	return true;
};

//--
//-- Server adaptor for talking to static TiddlyWiki files
//--

function FileAdaptor()
{
}

FileAdaptor.prototype = new AdaptorBase();

FileAdaptor.serverType = 'file';
FileAdaptor.serverLabel = 'TiddlyWiki';

FileAdaptor.loadTiddlyWikiSuccess = function(context, jqXHR)
{
	context.status = true;
	context.adaptor.store = new TiddlyWiki();
	if(!context.adaptor.store.importTiddlyWiki(jqXHR.responseText)) {
		context.statusText = config.messages.invalidFileError.format([context.host]);
		context.status = false;
	}
	context.complete(context, context.userParams);
};

FileAdaptor.loadTiddlyWikiError = function(context, jqXHR)
{
	context.status = false;
	context.statusText = jqXHR.message;
	context.complete(context, context.userParams);
};

// Get the list of workspaces on a given server
//   context - passed on as a parameter to the callback function
//   userParams - user settable object object that is passed on unchanged to the callback function
//   callback - function to be called on completion
// Return value is true if the request was successfully issued,
//   false if this connector doesn't support getWorkspaceList(),
//   or an error description string if there was a problem
// The callback parameters are callback(context, userParams)
//   context.status - true if OK, false if error
//   context.statusText - error message if there was an error
//   context.adaptor - reference to this adaptor object
//   userParams - parameters as originally passed into the getWorkspaceList function
FileAdaptor.prototype.getWorkspaceList = function(context, userParams, callback)
{
	context = this.setContext(context, userParams, callback);
	context.workspaces = [{ title: "(default)" }];
	context.status = true;
	if(callback)
		window.setTimeout(function() { callback(context, userParams) }, 10);
	return true;
};

// Gets the list of tiddlers within a given workspace
//   context - passed on as a parameter to the callback function
//   userParams - user settable object object that is passed on unchanged to the callback function
//   callback - function to be called on completion
//   filter - filter expression
// Return value is true if the request was successfully issued,
//   or an error description string if there was a problem
// The callback parameters are callback(context, userParams)
//   context.status - true if OK, false if error
//   context.statusText - error message if there was an error
//   context.adaptor - reference to this adaptor object
//   context.tiddlers - array of tiddler objects
//   userParams - parameters as originally passed into the getTiddlerList function
FileAdaptor.prototype.getTiddlerList = function(context, userParams, callback, filter)
{
	context = this.setContext(context, userParams, callback);
	if(!context.filter)
		context.filter = filter;
	context.complete = FileAdaptor.getTiddlerListComplete;
	if(this.store) {
		return context.complete(context, context.userParams);
	}
	var options = {
		type: "GET",
		url: context.host,
		file: context.file, // for HTML5 FileReader
		processData: false,
		success: function(data, textStatus, jqXHR) {
			FileAdaptor.loadTiddlyWikiSuccess(context, jqXHR);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			context.xhr = jqXHR;
			FileAdaptor.loadTiddlyWikiError(context, jqXHR);
		}
	};
	return ajaxReq(options);
};

FileAdaptor.getTiddlerListComplete = function(context, userParams)
{
	if(context.status) {
		if(context.filter) {
			context.tiddlers = context.adaptor.store.filterTiddlers(context.filter);
		} else {
			context.tiddlers = [];
			context.adaptor.store.forEachTiddler(function(title, tiddler) { context.tiddlers.push(tiddler) });
		}
		for(var i = 0; i < context.tiddlers.length; i++) {
			context.tiddlers[i].fields['server.type'] = FileAdaptor.serverType;
			context.tiddlers[i].fields['server.host'] = AdaptorBase.minHostName(context.host);
			context.tiddlers[i].fields['server.page.revision'] = context.tiddlers[i].modified.convertToYYYYMMDDHHMM();
		}
		context.status = true;
	}
	if(context.callback) {
		window.setTimeout(function() { context.callback(context, userParams) }, 10);
	}
	return true;
};

FileAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	return {
		uri: tiddler.fields['server.host'] + "#" + tiddler.title
	};
};

// Retrieve a tiddler from a given workspace on a given server
//   title - title of the tiddler to get
//   context - passed on as a parameter to the callback function
//   userParams - user settable object object that is passed on unchanged to the callback function
//   callback - function to be called on completion
// Return value is true if the request was successfully issued,
//   or an error description string if there was a problem
// The callback parameters are callback(context, userParams)
//   context.status - true if OK, false if error
//   context.statusText - error message if there was an error
//   context.adaptor - reference to this adaptor object
//   context.tiddler - the retrieved tiddler, or null if it cannot be found
//   userParams - parameters as originally passed into the getTiddler function
FileAdaptor.prototype.getTiddler = function(title, context, userParams, callback)
{
	context = this.setContext(context, userParams, callback);
	context.title = title;
	context.complete = FileAdaptor.getTiddlerComplete;
	if(context.adaptor.store) {
		return context.complete(context, context.userParams);
	}
	var options = {
		type: "GET",
		url: context.host,
		processData: false,
		success: function(data, textStatus, jqXHR) {
			FileAdaptor.loadTiddlyWikiSuccess(context, jqXHR);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			FileAdaptor.loadTiddlyWikiError(context, jqXHR);
		}
	};
	return ajaxReq(options);
};

FileAdaptor.getTiddlerComplete = function(context, userParams)
{
	var t = context.adaptor.store.fetchTiddler(context.title);
	if(t) {
		t.fields['server.type'] = FileAdaptor.serverType;
		t.fields['server.host'] = AdaptorBase.minHostName(context.host);
		t.fields['server.page.revision'] = t.modified.convertToYYYYMMDDHHMM();
		context.tiddler = t;
		context.status = true;
	} else { //# tiddler does not exist in document
		context.status = false;
	}
	if(context.allowSynchronous) {
		context.isSynchronous = true;
		context.callback(context, userParams);
	} else {
		window.setTimeout(function() { context.callback(context, userParams) }, 10);
	}
	return true;
};

FileAdaptor.prototype.close = function()
{
	this.store = null;
};

config.adaptors[FileAdaptor.serverType] = FileAdaptor;

config.defaultAdaptor = FileAdaptor.serverType;

//--
//-- HTTP request code
//--

// Perform an http request using the jQuery ajax function
// fallback to privileged file I/O or HTML5 FileReader
function ajaxReq(args)
{
	if (args.file || args.url.startsWith("file"))  // LOCAL FILE
		return localAjax(args);
	return jQuery.ajax(args);
}

// perform local I/O and FAKE a minimal XHR response object
function localAjax(args)
{
	var success = function(data) {
		args.success(data, "success", { responseText: data });
	};
	var failure = function(who) {
		args.error({ message: who + ": cannot read local file" }, "error", 0);
	};

	if (args.file) try { // HTML5 FileReader (Chrome, FF20+, Safari, etc.)
		var reader = new FileReader();
		reader.onload = function(e)  { success(e.target.result) };
		reader.onerror = function(e) { failure("FileReader") };
		reader.readAsText(args.file);
		return true;
	} catch (ex) { ; }

	try { // local file I/O (IE, FF with TiddlyFox, Chrome/Safari with TiddlySaver, etc.)
		var data = loadFile(getLocalPath(args.url));
		if (data) success(data);
		else failure("loadFile");
		return true;
	} catch (ex) { ; }

	return true;
}

// Perform an http request
//   type - GET/POST/PUT/DELETE
//   url - the source url
//   data - optional data for POST and PUT
//   contentType - optionalContent type for the data (defaults to application/x-www-form-urlencoded)
//   username - optional username for basic authentication
//   password - optional password for basic authentication
//   callback - function to call when there is a response
//   params - parameter object that gets passed to the callback for storing it's state
//   headers - optional hashmap of additional headers
//   allowCache - unless true, adds a "nocache=" parameter to the URL
// Return value is the underlying XMLHttpRequest object, or a string if there was an error
// Callback function is called like this:
//   callback(status, params, responseText, url, xhr)
//     status - true if OK, false if error
//     params - the parameter object provided to loadRemoteFile()
//     responseText - the text of the file
//     url - requested URL
//     xhr - the underlying XMLHttpRequest object
function httpReq(type, url, callback, params, headers, data, contentType, username, password, allowCache)
{
	var httpSuccess = function(xhr) {
		try {
			// IE error sometimes returns 1223 when it should be 204 so treat it as success, see #1450
			return (!xhr.status && location.protocol === "file:") ||
				(xhr.status >= 200 && xhr.status < 300) ||
				xhr.status === 304 || xhr.status === 1223;
		} catch(e) {}
		return false;
	};

	var options = {
		type: type,
		url: url,
		processData: false,
		data: data,
		cache: !!allowCache,
		beforeSend: function(xhr) {
			for(var i in headers)
				xhr.setRequestHeader(i, headers[i]);
		}
	};

	if(callback) {
		options.complete = function(xhr, textStatus) {
			if(httpSuccess(xhr))
				callback(true, params, xhr.responseText, url, xhr);
			else
				callback(false, params, null, url, xhr);
		};
	}
	if(contentType)
		options.contentType = contentType;
	if(username)
		options.username = username;
	if(password)
		options.password = password;
	try {
		if(window.Components && window.netscape && window.netscape.security
		   && document.location.protocol.indexOf("http") == -1)
			window.netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
	} catch (ex) {
	}
	return jQuery.ajax(options);
}
//--
//-- TiddlyWiki-specific utility functions
//--

// Return TiddlyWiki version string
function formatVersion(v)
{
	v = v || version;
	return v.major + "." + v.minor + "." + v.revision +
		(v.alpha ? " (alpha " + v.alpha + ")" : "") +
		(v.beta ? " (beta " + v.beta + ")" : "");
}

function compareVersions(v1, v2)
{
	var x1, x2, i, a = ["major", "minor", "revision"];
	for(i = 0; i < a.length; i++)
	{
		x1 = v1[a[i]] || 0;
		x2 = v2[a[i]] || 0;
		if(x1 < x2) return +1;
		if(x1 > x2) return -1;
	}
	x1 = v1.beta || Infinity;
	x2 = v2.beta || Infinity;
	return x1 < x2 ? +1 :
	       x1 > x2 ? -1 : 0;
}

function merge(dst, src, preserveExisting)
{
	for(var key in src)
		if(!preserveExisting || dst[key] === undefined)
			dst[key] = src[key];

	return dst;
}

// Get the target of an event
function resolveTarget(event)
{
	var obj = event.target || event.srcElement;
	// defeat Safari bug
	if(obj.nodeType == 3)
		obj = obj.parentNode;
	return obj;
}

// Return the description of an exception (string)
function exceptionText(ex, prependedMessage)
{
	var s = ex.description || ex.toString();
	return prependedMessage ? (prependedMessage + ":\n" + s) : s;
}

// Display an alert of an exception description with optional message
function showException(e, prependedMessage)
{
	alert(exceptionText(e, prependedMessage));
}

function alertAndThrow(m)
{
	alert(m);
	throw(m);
}

function glyph(name)
{
	var g = config.glyphs;
	if(!g.codes[name]) return "";
	if(g.currBrowser == null) {
		var i = 0;
		while(i < g.browsers.length - 1 && !g.browsers[i]())
			i++;
		g.currBrowser = i;
	}
	return g.codes[name][g.currBrowser];
}

function createTiddlyText(parent, text)
{
	return parent.appendChild(document.createTextNode(text));
}

function createTiddlyCheckbox(parent, caption, checked, onChange)
{
	var cb = document.createElement("input");
	cb.setAttribute("type", "checkbox");
	cb.onclick = onChange;
	parent.appendChild(cb);
	cb.checked = checked;
	cb.className = "chkOptionInput";
	if(caption)
		wikify(caption, parent);
	return cb;
}

function createTiddlyElement(parent, element, id, className, text, attribs)
{
	var n, e = document.createElement(element);
	if(className != null) e.className = className;
	if(       id != null) e.setAttribute('id', id);
	if(     text != null) createTiddlyText(e, text);
	if(attribs) {
		for(n in attribs) e.setAttribute(n, attribs[n]);
	}
	if(parent != null) parent.appendChild(e);
	return e;
}

function createTiddlyButton(parent, text, tooltip, action, className, id, accessKey, customAttributes)
{
	var attributes = { href: 'javascript:;' };
	if(tooltip)   attributes.title = tooltip;
	if(accessKey) attributes.accessKey = accessKey;
	merge(attributes, customAttributes || {});

	var btn = createTiddlyElement(parent, 'a', id || null, className || 'button', text, attributes);
	if(action) btn.onclick = action;
	return btn;
}

function createExternalLink(place, url, label)
{
	var tooltip = config.messages.externalLinkTooltip;
	var link = createTiddlyElement(place, 'a', null, 'externalLink', label, {
		href: url,
		title: tooltip ? tooltip.format([url]) : url
	});
	if(config.options.chkOpenInNewWindow)
		link.target = "_blank";
	return link;
}

function getTiddlyLinkInfo(title, currClasses)
{
	var classes = currClasses ? currClasses.split(" ") : [];
	classes.pushUnique("tiddlyLink");
	var tiddler = store.fetchTiddler(title);
	var subTitle;
	if(tiddler) {
		subTitle = tiddler.getSubtitle();
		classes.pushUnique("tiddlyLinkExisting");
		classes.remove("tiddlyLinkNonExisting");
		classes.remove("shadow");
	} else {
	    var f;
		classes.remove("tiddlyLinkExisting");
		classes.pushUnique("tiddlyLinkNonExisting");
		if(store.isShadowTiddler(title)) {
			f = config.messages.shadowedTiddlerToolTip;
			classes.pushUnique("shadow");
		} else {
			f = config.messages.undefinedTiddlerToolTip;
			classes.remove("shadow");
		}
		subTitle = f ? f.format([title]) : "";
	}
	if(typeof config.annotations[title] == "string")
		subTitle = config.annotations[title];
	return { classes: classes.join(" "), subTitle: subTitle };
}

// Event handler for clicking on a tiddly link
function onClickTiddlerLink(ev)
{
	var e = ev || window.event;
	var target = resolveTarget(e);
	var link = target;
	var title = null;
	var fields = null;
	var noToggle = null;
	do {
		title = link.getAttribute("tiddlyLink");
		fields = link.getAttribute("tiddlyFields");
		noToggle = link.getAttribute("noToggle");
		link = link.parentNode;
	} while(title == null && link != null);
	if(!store.isShadowTiddler(title)) {
		var f = fields ? fields.decodeHashMap() : {};
		fields = String.encodeHashMap(merge(f, config.defaultCustomFields, true));
	}
	if(title) {
		var toggling = e.metaKey || e.ctrlKey;
		if(config.options.chkToggleLinks)
			toggling = !toggling;
		if(noToggle)
			toggling = false;
		if(store.getTiddler(title))
			fields = null;
		story.displayTiddler(target, title, null, true, null, fields, toggling);
	}
	clearMessage();
	return false;
}

function getTiddlerLinkHref(title)
{
	return window.location.toString().replace(/#.*$/, '') + story.getPermaViewHash([title]);
}

function createTiddlyLink(place, title, includeText, className, isStatic, linkedFromTiddler, noToggle)
{
	var title = jQuery.trim(title);
	var text = includeText ? title : null;
	var info = getTiddlyLinkInfo(title, className);
	var btn = isStatic ?
		createExternalLink(place, store.getTiddlerText("SiteUrl", null) + story.getPermaViewHash([title])) :
		createTiddlyButton(place, text, info.subTitle, onClickTiddlerLink, info.classes, '', '', {
			href: getTiddlerLinkHref(title)
		});
	if(isStatic)
		btn.className += ' ' + className;
	btn.setAttribute("refresh", "link");
	btn.setAttribute("tiddlyLink", title);
	if(noToggle)
		btn.setAttribute("noToggle", "true");
	if(linkedFromTiddler)
	{
		var fields = linkedFromTiddler.getInheritedFields();
		if(fields)
			btn.setAttribute("tiddlyFields", fields);
	}
	return btn;
}

function refreshTiddlyLink(e, title)
{
	var info = getTiddlyLinkInfo(title, e.className);
	e.className = info.classes;
	e.title = info.subTitle;
}

function createTiddlyDropDown(place, onchange, options, defaultValue)
{
	var sel = createTiddlyElement(place, "select");
	sel.onchange = onchange;

	for(var i = 0; i < options.length; i++)
	{
		var e = createTiddlyElement(sel, "option", null, null, options[i].caption);
		e.value = options[i].name;
		if(e.value == defaultValue)
			e.selected = true;
	}
	return sel;
}

//--
//-- TiddlyWiki-specific popup utility functions
//--

// Event handler for 'open all' on a tiddler popup
function onClickTagOpenAll(ev)
{
	var tiddlers = store.getTaggedTiddlers(this.getAttribute("tag"));
	var sortby = this.getAttribute("sortby");
	if(sortby && sortby.length) {
		store.sortTiddlers(tiddlers, sortby);
	}
	story.displayTiddlers(this, tiddlers);
	return false;
}

// Event handler for clicking on a tiddler tag
function onClickTag(ev)
{
	var e = ev || window.event;
	var popup = Popup.create(this);
	jQuery(popup).addClass("taggedTiddlerList");
	var tag = this.getAttribute("tag");
	var title = this.getAttribute("tiddler");
	if(popup && tag) {
		var tagged = tag.indexOf("[") == -1 ? store.getTaggedTiddlers(tag) : store.filterTiddlers(tag);
		var sortby = this.getAttribute("sortby");
		if(sortby && sortby.length) {
			store.sortTiddlers(tagged, sortby);
		}
		var titles = [];
		for(var i = 0; i < tagged.length; i++) {
			if(tagged[i].title != title)
				titles.push(tagged[i].title);
		}
		var lingo = config.views.wikified.tag;
		if(titles.length > 0) {
			var openAll = createTiddlyButton(createTiddlyElement(popup, "li"),
				lingo.openAllText.format([tag]), lingo.openAllTooltip, onClickTagOpenAll);
			openAll.setAttribute("tag", tag);
			openAll.setAttribute("sortby", sortby);
			createTiddlyElement(createTiddlyElement(popup, "li", null, "listBreak"), "div");
			for(i = 0; i < titles.length; i++) {
				createTiddlyLink(createTiddlyElement(popup, "li"), titles[i], true);
			}
		} else {
			createTiddlyElement(popup, "li", null, "disabled", lingo.popupNone.format([tag]));
		}
		createTiddlyElement(createTiddlyElement(popup, "li", null, "listBreak"), "div");
		var link = createTiddlyLink(createTiddlyElement(popup, "li"), tag, false);
		createTiddlyText(link, lingo.openTag.format([tag]));
	}
	Popup.show();
	e.cancelBubble = true;
	if(e.stopPropagation) e.stopPropagation();
	return false;
}

// Create a button for a tag with a popup listing all the tiddlers that it tags
function createTagButton(place, tag, excludeTiddler, title, tooltip)
{
	var btn = createTiddlyButton(place, title || tag,
		(tooltip || config.views.wikified.tag.tooltip).format([tag]), onClickTag);
	btn.setAttribute("tag", tag);
	if(excludeTiddler)
		btn.setAttribute("tiddler", excludeTiddler);
	return btn;
}

function onClickTiddlyPopup(ev)
{
	var e = ev || window.event;
	var tiddler = this.tiddler;
	if(tiddler.text) {
		var popup = Popup.create(this, "div", "popupTiddler");
		wikify(tiddler.text, popup, null, tiddler);
		Popup.show();
	}
	if(e) e.cancelBubble = true;
	if(e && e.stopPropagation) e.stopPropagation();
	return false;
}

function createTiddlyPopup(place, caption, tooltip, tiddler)
{
	if(tiddler.text) {
		createTiddlyLink(place, caption, true);
		var btn = createTiddlyButton(place, glyph("downArrow"), tooltip, onClickTiddlyPopup, "tiddlerPopupButton");
		btn.tiddler = tiddler;
	} else {
		createTiddlyText(place, caption);
	}
}

function onClickError(ev)
{
	var e = ev || window.event;
	var popup = Popup.create(this);
	var lines = this.getAttribute("errorText").split("\n");
	for(var i = 0; i < lines.length; i++) {
		createTiddlyElement(popup, "li", null, "popupMessage", lines[i]);
	}
	Popup.show();
	e.cancelBubble = true;
	if(e.stopPropagation) e.stopPropagation();
	return false;
}

function createTiddlyError(place, title, text)
{
	var btn = createTiddlyButton(place, title, null, onClickError, "errorButton");
	if(text) btn.setAttribute("errorText", text);
}
//-
//- Animation engine
//-

function Animator()
{
	// Incremented at start of each animation, decremented afterwards. If zero, the interval timer is disabled
	this.running = 0;
	// ID of the timer used for animating
	this.timerID = 0;
	// List of animations in progress
	this.animations = [];
	return this;
}

// Start animation engine
Animator.prototype.startAnimating = function() //# Variable number of arguments
{
	for(var i = 0; i < arguments.length; i++)
		this.animations.push(arguments[i]);
	if(this.running == 0) {
		var me = this;
		this.timerID = window.setInterval(function() { me.doAnimate(me) }, 10);
	}
	this.running += arguments.length;
};

// Perform an animation engine tick, calling each of the known animation modules
Animator.prototype.doAnimate = function(me)
{
	var i = 0;
	while(i < me.animations.length) {
		if(me.animations[i].tick()) {
			i++;
		} else {
			me.animations.splice(i, 1);
			if(--me.running == 0)
				window.clearInterval(me.timerID);
		}
	}
};

Animator.slowInSlowOut = function(progress)
{
	return 1 - ((Math.cos(progress * Math.PI) + 1) / 2);
};

//--
//-- Morpher animation
//--

// Animate a set of properties of an element
function Morpher(element, duration, properties, callback)
{
	this.element = element;
	this.duration = duration;
	this.properties = properties;
	this.startTime = new Date();
	this.endTime = Number(this.startTime) + duration;
	this.callback = callback;
	this.tick();
	return this;
}

Morpher.prototype.assignStyle = function(element, style, value)
{
	switch(style) {
		case "-tw-vertScroll":
			window.scrollTo(findScrollX(), value);
			break;
		case "-tw-horizScroll":
			window.scrollTo(value, findScrollY());
			break;
		default:
			element.style[style] = value;
			break;
	}
};

Morpher.prototype.stop = function()
{
	for(var i = 0; i < this.properties.length; i++) {
		var p = this.properties[i];
		if(p.atEnd !== undefined) {
			this.assignStyle(this.element, p.style, p.atEnd);
		}
	}
	if(this.callback)
		this.callback(this.element, this.properties);
};

Morpher.prototype.tick = function()
{
	var currTime = Number(new Date());
	var i, progress = Animator.slowInSlowOut(Math.min(1, (currTime - this.startTime) / this.duration));
	for(i = 0; i < this.properties.length; i++) {
		var p = this.properties[i];
		if(p.start !== undefined && p.end !== undefined) {
			var template = p.template || "%0";
			switch(p.format) {
				case undefined:
				case "style":
					var value = p.start + (p.end - p.start) * progress;
					this.assignStyle(this.element, p.style, template.format([value]));
					break;
				case "color":
					break;
			}
		}
	}
	if(currTime >= this.endTime) {
		this.stop();
		return false;
	}
	return true;
};

//--
//-- Zoomer animation
//--

function Zoomer(text, startElement, targetElement, unused)
{
	var e = createTiddlyElement(document.body, "div", null, "zoomer");
	createTiddlyElement(e, "div", null, null, text);
	var winWidth = findWindowWidth();
	var winHeight = findWindowHeight();
	var p = [
		{ style: 'left', start: findPosX(startElement), end: findPosX(targetElement), template: '%0px' },
		{ style: 'top', start: findPosY(startElement), end: findPosY(targetElement), template: '%0px' },
		{ style: 'width', start: Math.min(startElement.scrollWidth, winWidth),
		  end: Math.min(targetElement.scrollWidth, winWidth), template: '%0px', atEnd: 'auto' },
		{ style: 'height', start: Math.min(startElement.scrollHeight, winHeight),
		  end: Math.min(targetElement.scrollHeight, winHeight), template: '%0px', atEnd: 'auto' },
		{ style: 'fontSize', start: 8, end: 24, template: '%0pt' }
	];
	var c = function(element) { jQuery(element).remove() };
	return new Morpher(e, config.animDuration, p, c);
}

//--
//-- Scroller animation
//--

function Scroller(targetElement)
{
	return new Morpher(targetElement, config.animDuration, [{
		style: '-tw-vertScroll', start: findScrollY(), end: ensureVisible(targetElement)
	}]);
}

//--
//-- Slider animation
//--

// deleteMode - "none", "all" [delete target element and it's children], [only] "children" [but not the target element]
function Slider(element, opening, unused, deleteMode)
{
	element.style.overflow = 'hidden';
	// Workaround a Firefox flashing bug
	if(opening) element.style.height = '0px';
	element.style.display = 'block';
	var height = element.scrollHeight;
	var props = [];
	var callback = null;
	if(opening) {
		props.push({ style: 'height', start: 0, end: height, template: '%0px', atEnd: 'auto' });
		props.push({ style: 'opacity', start: 0, end: 1, template: '%0' });
		props.push({ style: 'filter', start: 0, end: 100, template: 'alpha(opacity:%0)' });
	} else {
		props.push({ style: 'height', start: height, end: 0, template: '%0px' });
		props.push({ style: 'display', atEnd: 'none' });
		props.push({ style: 'opacity', start: 1, end: 0, template: '%0' });
		props.push({ style: 'filter', start: 100, end: 0, template: 'alpha(opacity:%0)' });
		switch(deleteMode) {
			case "all":
				callback = function(element, properties) { jQuery(element).remove() };
				break;
			case "children":
				callback = function(element, properties) { jQuery(element).empty() };
				break;
		}
	}
	return new Morpher(element, config.animDuration, props, callback);
}

//--
//-- Popup menu
//--

var Popup = {
	stack: [] // Array of objects with members root: and popup:
};

Popup.create = function(root, elem, className)
{
	var stackPosition = this.find(root, "popup");
	Popup.remove(stackPosition + 1);
	var popup = createTiddlyElement(document.body, elem || "ol", "popup", className || "popup");
	popup.stackPosition = stackPosition;
	Popup.stack.push({ root: root, popup: popup });
	return popup;
};

Popup.onDocumentClick = function(ev)
{
	var e = ev || window.event;
	if(e.eventPhase == undefined)
		Popup.remove();
	else if(e.eventPhase == Event.BUBBLING_PHASE || e.eventPhase == Event.AT_TARGET)
		Popup.remove();
	return true;
};

Popup.show = function(valign, halign, offset)
{
	var curr = Popup.stack[Popup.stack.length - 1];
	this.place(curr.root, curr.popup, valign, halign, offset);
	jQuery(curr.root).addClass("highlight");
	if(config.options.chkAnimate && anim && typeof Scroller == "function")
		anim.startAnimating(new Scroller(curr.popup));
	else
		window.scrollTo(0, ensureVisible(curr.popup));
};

Popup.place = function(root, popup, valign, halign, offset)
{
	if(!offset)
		offset = { x: 0, y: 0 };
	if(popup.stackPosition >= 0 && !valign && !halign) {
		offset.x = offset.x + root.offsetWidth;
	} else {
		offset.x = (halign == "right") ? offset.x + root.offsetWidth : offset.x;
		offset.y = (valign == "top") ? offset.y : offset.y + root.offsetHeight;
	}
	var rootLeft = findPosX(root);
	var rootTop = findPosY(root);
	var popupLeft = rootLeft + offset.x;
	var popupTop = rootTop + offset.y;
	var winWidth = findWindowWidth();
	if(popup.offsetWidth > winWidth * 0.75)
		popup.style.width = winWidth * 0.75 + "px";
	var popupWidth = popup.offsetWidth;
	var scrollWidth = winWidth - document.body.offsetWidth;
	if(popupLeft + popupWidth > winWidth - scrollWidth - 1) {
		if(halign == "right")
			popupLeft = popupLeft - root.offsetWidth - popupWidth;
		else
			popupLeft = winWidth - popupWidth - scrollWidth - 1;
	}
	popup.style.left = popupLeft + "px";
	popup.style.top = popupTop + "px";
	popup.style.display = "block";
};

Popup.find = function(e)
{
	var i, pos = -1;
	for(i = this.stack.length - 1; i >= 0; i--) {
		if(isDescendant(e, this.stack[i].popup))
			pos = i;
	}
	return pos;
};

Popup.remove = function(pos)
{
	if(!pos) pos = 0;
	if(Popup.stack.length > pos) {
		Popup.removeFrom(pos);
	}
};

Popup.removeFrom = function(from)
{
	for(var i = Popup.stack.length - 1; i >= from; i--) {
		var p = Popup.stack[i];
		jQuery(p.root).removeClass("highlight");
		jQuery(p.popup).remove();
	}
	Popup.stack = Popup.stack.slice(0, from);
};

//--
//-- Wizard support
//--

function Wizard(place)
{
	if(place) {
		this.formElem = findRelated(place, "wizard", "className");
		this.bodyElem = findRelated(this.formElem.firstChild, "wizardBody", "className", "nextSibling");
		this.footElem = findRelated(this.formElem.firstChild, "wizardFooter", "className", "nextSibling");
	} else {
		this.formElem = null;
		this.bodyElem = null;
		this.footElem = null;
	}
}

Wizard.prototype.setValue = function(name, value)
{
	jQuery(this.formElem).data(name, value);
};

Wizard.prototype.getValue = function(name)
{
	return this.formElem ? jQuery(this.formElem).data(name) : null;
};

Wizard.prototype.createWizard = function(place, title)
{
	this.formElem = createTiddlyElement(place, "form", null, "wizard");
	createTiddlyElement(this.formElem, "h1", null, "wizard__title", title);
	this.bodyElem = createTiddlyElement(this.formElem, "div", null, "wizardBody");
	this.footElem = createTiddlyElement(this.formElem, "div", null, "wizardFooter");
	return this.formElem;
};

Wizard.prototype.clear = function()
{
	jQuery(this.bodyElem).empty();
};

Wizard.prototype.setButtons = function(buttonInfo, status)
{
	jQuery(this.footElem).empty();
	for(var i = 0; i < buttonInfo.length; i++) {
		createTiddlyButton(this.footElem, buttonInfo[i].caption, buttonInfo[i].tooltip, buttonInfo[i].onClick);
		insertSpacer(this.footElem);
	}
	if(typeof status == "string") {
		createTiddlyElement(this.footElem, "span", null, "status", status);
	}
};

Wizard.prototype.addStep = function(stepTitle, htmlString)
{
	jQuery(this.bodyElem).empty();
	var wrapper = createTiddlyElement(this.bodyElem, "div");
	createTiddlyElement(wrapper, "h2", null, "wizard__subtitle", stepTitle);
	var step = createTiddlyElement(wrapper, "div", null, "wizardStep");
	step.innerHTML = htmlString;
	applyHtmlMacros(step, tiddler);
};

Wizard.prototype.getElement = function(name)
{
	return this.formElem.elements[name];
};

//--
//-- ListView gadget
//--

var ListView = {};

// Create a listview
ListView.create = function(place, listObject, listTemplate, callback, className)
{
	var table = createTiddlyElement(place, "table", null, className || "listView twtable");

	var thead = createTiddlyElement(table, "thead");
	var i, row = createTiddlyElement(thead, "tr");
	for(i = 0; i < listTemplate.columns.length; i++) {
		var columnTemplate = listTemplate.columns[i];
		var cell = createTiddlyElement(row, "th");
		var colType = ListView.columnTypes[columnTemplate.type];
		if(colType && colType.createHeader) {
			colType.createHeader(cell, columnTemplate, i);
			if(columnTemplate.className)
				jQuery(cell).addClass(columnTemplate.className);
		}
	}

	var rc, tbody = createTiddlyElement(table, "tbody");
	for(rc = 0; rc < listObject.length; rc++) {
		var rowObject = listObject[rc];
		row = createTiddlyElement(tbody, "tr");
		for(i = 0; i < listTemplate.rowClasses.length; i++) {
			if(rowObject[listTemplate.rowClasses[i].field])
				jQuery(row).addClass(listTemplate.rowClasses[i].className);
		}
		rowObject.rowElement = row;
		rowObject.colElements = {};
		for(i = 0; i < listTemplate.columns.length; i++) {
			cell = createTiddlyElement(row, "td");
			columnTemplate = listTemplate.columns[i];
			var field = columnTemplate.field;
			colType = ListView.columnTypes[columnTemplate.type];
			if(colType && colType.createItem) {
				colType.createItem(cell, rowObject, field, columnTemplate, i, rc);
				if(columnTemplate.className)
					jQuery(cell).addClass(columnTemplate.className);
			}
			rowObject.colElements[field] = cell;
		}
	}

	if(callback && listTemplate.actions)
		createTiddlyDropDown(place, ListView.getCommandHandler(callback), listTemplate.actions);

	if(callback && listTemplate.buttons) {
		for(i = 0; i < listTemplate.buttons.length; i++) {
			var b = listTemplate.buttons[i];
			if(b && b.name != "") createTiddlyButton(place, b.caption, null,
				ListView.getCommandHandler(callback, b.name, b.allowEmptySelection));
		}
	}
	return table;
};

ListView.getCommandHandler = function(callback, name, allowEmptySelection)
{
	return function(e) {
		var view = findRelated(this, "TABLE", null, "previousSibling");
		var tiddlers = ListView.getSelectedRows(view);
		if(tiddlers.length == 0 && !allowEmptySelection) {
			alert(config.messages.nothingSelected);
		} else {
			if(this.nodeName.toLowerCase() == "select") {
				callback(view, this.value, tiddlers);
				this.selectedIndex = 0;
			} else {
				callback(view, name, tiddlers);
			}
		}
	};
};

// Invoke a callback for each selector checkbox in the listview
ListView.forEachSelector = function(view, callback)
{
	var checkboxes = view.getElementsByTagName("input");
	var i, hadOne = false;
	for(i = 0; i < checkboxes.length; i++) {
		var cb = checkboxes[i];
		var rowName = cb.getAttribute("rowName");
		if(cb.getAttribute("type") != "checkbox" || !rowName) continue;
		callback(cb, rowName);
		hadOne = true;
	}
	return hadOne;
};

ListView.getSelectedRows = function(view)
{
	var rowNames = [];
	ListView.forEachSelector(view, function(e, rowName) {
		if(e.checked) rowNames.push(rowName);
	});
	return rowNames;
};

// describes filling cells of a column of each type, a map of typeName => { createHeader, createItem }
ListView.columnTypes = {};

ListView.columnTypes.String = {
	createHeader: function(place, columnTemplate, col)
	{
		createTiddlyText(place, columnTemplate.title);
	},
	createItem: function(place, listObject, field, columnTemplate, col, row)
	{
		var v = listObject[field];
		if(v != undefined)
			createTiddlyText(place, v);
	}
};

ListView.columnTypes.WikiText = {
	createHeader: ListView.columnTypes.String.createHeader,
	createItem: function(place, listObject, field, columnTemplate, col, row)
	{
		var v = listObject[field];
		if(v != undefined)
			wikify(v, place, null, null);
	}
};

ListView.columnTypes.Tiddler = {
	createHeader: ListView.columnTypes.String.createHeader,
	createItem: function(place, listObject, field, columnTemplate, col, row)
	{
		var v = listObject[field];
		if(v != undefined && v.title)
			createTiddlyPopup(place, v.title, config.messages.listView.tiddlerTooltip, v);
	}
};

ListView.columnTypes.Size = {
	createHeader: ListView.columnTypes.String.createHeader,
	createItem: function(place, listObject, field, columnTemplate, col, row)
	{
		var v = listObject[field];
		if(v == undefined) return;
		var i = 0, msg = config.messages.sizeTemplates;
		while(i < msg.length - 1 && v < msg[i].unit)
			i++;
		createTiddlyText(place, msg[i].template.format([Math.round(v / msg[i].unit)]));
	}
};

ListView.columnTypes.Link = {
	createHeader: ListView.columnTypes.String.createHeader,
	createItem: function(place, listObject, field, columnTemplate, col, row)
	{
		var v = listObject[field];
		var c = columnTemplate.text;
		if(v != undefined)
			createExternalLink(place, v, c || v);
	}
};

ListView.columnTypes.Date = {
	createHeader: ListView.columnTypes.String.createHeader,
	createItem: function(place, listObject, field, columnTemplate, col, row)
	{
		var v = listObject[field];
		if(v != undefined)
			createTiddlyText(place, v.formatString(columnTemplate.dateFormat));
	}
};

ListView.columnTypes.StringList = {
	createHeader: ListView.columnTypes.String.createHeader,
	createItem: function(place, listObject, field, columnTemplate, col, row)
	{
		var v = listObject[field];
		if(v == undefined) return;
		for(var i = 0; i < v.length; i++) {
			createTiddlyText(place, v[i]);
			createTiddlyElement(place, "br");
		}
	}
};

ListView.columnTypes.Selector = {
	createHeader: function(place, columnTemplate, col)
	{
		createTiddlyCheckbox(place, null, false, this.onHeaderChange);
	},
	createItem: function(place, listObject, field, columnTemplate, col, row)
	{
		var e = createTiddlyCheckbox(place, null, listObject[field], null);
		e.setAttribute("rowName", listObject[columnTemplate.rowName]);
	},
	onHeaderChange: function(e)
	{
		var state = this.checked;
		var view = findRelated(this, "TABLE");
		if(!view) return;
		ListView.forEachSelector(view, function(e, rowName) {
			e.checked = state;
		});
	}
};

ListView.columnTypes.Tags = {
	createHeader: ListView.columnTypes.String.createHeader,
	createItem: function(place, listObject, field, columnTemplate, col, row)
	{
		var tags = listObject[field];
		createTiddlyText(place, String.encodeTiddlyLinkList(tags));
	}
};

ListView.columnTypes.Boolean = {
	createHeader: ListView.columnTypes.String.createHeader,
	createItem: function(place, listObject, field, columnTemplate, col, row)
	{
		if(listObject[field] == true)
			createTiddlyText(place, columnTemplate.trueText);
		if(listObject[field] == false)
			createTiddlyText(place, columnTemplate.falseText);
	}
};

ListView.columnTypes.TagCheckbox = {
	createHeader: ListView.columnTypes.String.createHeader,
	createItem: function(place, listObject, field, columnTemplate, col, row)
	{
		var e = createTiddlyCheckbox(place, null, listObject[field], this.onChange);
		e.setAttribute("tiddler", listObject.title);
		e.setAttribute("tag", columnTemplate.tag);
	},
	onChange: function(e)
	{
		var tag = this.getAttribute("tag");
		var tiddler = this.getAttribute("tiddler");
		store.setTiddlerTag(tiddler, this.checked, tag);
	}
};

ListView.columnTypes.TiddlerLink = {
	createHeader: ListView.columnTypes.String.createHeader,
	createItem: function(place, listObject, field, columnTemplate, col, row)
	{
		var v = listObject[field];
		if(v == undefined) return;
		var link = createTiddlyLink(place, listObject[columnTemplate.tiddlerLink], false, null);
		createTiddlyText(link, listObject[field]);
	}
};

//--
//-- Augmented methods for the JavaScript Array() object
//--

// For IE up to 8 (https://caniuse.com/?search=indexOf)
if(!Array.indexOf) {
	Array.prototype.indexOf = function(item, from)
	{
		if(!from) from = 0;
		for(var i = from; i < this.length; i++) {
			if(this[i] === item) return i;
		}
		return -1;
	};
}

// Find an entry in a given field of the members of an array
Array.prototype.findByField = function(field, value)
{
	for(var i = 0; i < this.length; i++) {
		if(this[i][field] === value) return i;
	}
	return null;
};

// Return whether an entry exists in an array
Array.prototype.contains = function(item)
{
	return this.indexOf(item) != -1;
};

// Adds, removes or toggles a particular value within an array
//  value - value to add
//  mode - +1 to add value, -1 to remove value, 0 to toggle it
Array.prototype.setItem = function(value, mode)
{
	var p = this.indexOf(value);
	if(mode == 0)
		mode = (p == -1) ? +1 : -1;
	if(mode == +1) {
		if(p == -1) this.push(value);
	} else if(mode == -1) {
		if(p != -1) this.splice(p, 1);
	}
};

// Return whether one of a list of values exists in an array
Array.prototype.containsAny = function(items)
{
	for(var i = 0; i < items.length; i++) {
		if(this.indexOf(items[i]) != -1)
			return true;
	}
	return false;
};

// Return whether all of a list of values exists in an array
Array.prototype.containsAll = function(items)
{
	for(var i = 0; i < items.length; i++) {
		if(this.indexOf(items[i]) == -1)
			return false;
	}
	return true;
};

// Push a new value into an array only if it is not already present in the array.
// If the optional unique parameter is false, it reverts to a normal push
Array.prototype.pushUnique = function(item, unique)
{
	if(unique === false || this.indexOf(item) == -1) {
		this.push(item);
	}
};

Array.prototype.remove = function(item)
{
	var p = this.indexOf(item);
	if(p != -1) this.splice(p, 1);
};

// For IE up to 8 (https://caniuse.com/?search=indexOf)
if(!Array.prototype.map) {
	Array.prototype.map = function(fn, thisObj)
	{
		var scope = thisObj || window;
		var i, j, a = [];
		for(i = 0, j = this.length; i < j; ++i) {
			a.push(fn.call(scope, this[i], i, this));
		}
		return a;
	};
}

//--
//-- Augmented methods for the JavaScript String() object
//--

// todo: create functions substituting String augmenting methods, use in the core; deprecate all String augmenting methods

// Trim whitespace from both ends of a string
String.prototype.trim = function()
{
	return this.replace(/^\s*|\s*$/g, "");
};

// Substitute substrings from an array into a format string that includes '%1'-type specifiers
String.prototype.format = function(s)
{
	var substrings = s && s.constructor == Array ? s : arguments;
	var subRegExp = /(?:%(\d+))/mg;
	var currPos = 0;
	var match, r = [];
	while(match = subRegExp.exec(this)) {
		if(!match[1]) continue;
		if(match.index > currPos)
			r.push(this.substring(currPos, match.index));
		r.push(substrings[parseInt(match[1], 10)]);
		currPos = subRegExp.lastIndex;
	}
	if(currPos < this.length)
		r.push(this.substring(currPos, this.length));
	return r.join("");
};

// Escape any special RegExp characters with that character preceded by a backslash
String.prototype.escapeRegExp = function()
{
	return this.replace(/[\-\/\\\^\$\*\+\?\.\(\)\|\[\]\{\}]/g, '\\$&'); // #157
};

// Convert "\" to "\s", newlines to "\n" (and remove carriage returns)
String.prototype.escapeLineBreaks = function()
{
	return this.replace(/\\/mg, "\\s").replace(/\n/mg, "\\n").replace(/\r/mg, "");
};

// Convert "\n" to newlines, "\b" to " ", "\s" to "\" (and remove carriage returns)
String.prototype.unescapeLineBreaks = function()
{
	return this.replace(/\\n/mg, "\n").replace(/\\b/mg, " ").replace(/\\s/mg, "\\").replace(/\r/mg, "");
};

// Convert & to "&amp;", < to "&lt;", > to "&gt;" and " to "&quot;"
String.prototype.htmlEncode = function()
{
	return this.replace(/&/mg, "&amp;").replace(/</mg, "&lt;").replace(/>/mg, "&gt;").replace(/\"/mg, "&quot;");
};

// Convert "&amp;" to &, "&lt;" to <, "&gt;" to > and "&quot;" to "
String.prototype.htmlDecode = function()
{
	return this.replace(/&lt;/mg, "<").replace(/&gt;/mg, ">").replace(/&quot;/mg, "\"").replace(/&amp;/mg, "&");
};

// Parse a space-separated string of name:value parameters
// The result is an array of objects:
//   result[0] = object with a member for each parameter name, value of that member being an array of values
//   result[1..n] = one object for each parameter, with 'name' and 'value' members
String.prototype.parseParams = function(defaultName, defaultValue, allowEval, noNames, cascadeDefaults)
{
	var dblQuote = "(?:\"((?:(?:\\\\\")|[^\"])+)\")";
	var sngQuote = "(?:'((?:(?:\\\\\')|[^'])+)')";
	var dblSquare = "(?:\\[\\[((?:\\s|\\S)*?)\\]\\])";
	var dblBrace = "(?:\\{\\{((?:\\s|\\S)*?)\\}\\})";
	var unQuoted = noNames ? "([^\"'\\s]\\S*)" : "([^\"':\\s][^\\s:]*)";
	var emptyQuote = "((?:\"\")|(?:''))";
	var skipSpace = "(?:\\s*)";
	var token = "(?:" + dblQuote + "|" + sngQuote + "|" + dblSquare + "|" +
		dblBrace + "|" + unQuoted + "|" + emptyQuote + ")";
	var re = noNames ? new RegExp(token, "mg") :
		new RegExp(skipSpace + token + skipSpace + "(?:(\\:)" + skipSpace + token + ")?", "mg");

	var parseToken = function(match, p) {
		// Double quoted
		if(match[p])     return match[p].replace(/\\"/g, '"');
		// Single quoted
		if(match[p + 1]) return match[p + 1].replace(/\\'/g, "'");
		// Double-square-bracket quoted
		if(match[p + 2]) return match[p + 2];
		// Double-brace quoted
		if(match[p + 3]) {
			var value = match[p + 3];
			if(allowEval && config.evaluateMacroParameters != "none") {
				try {
					if(config.evaluateMacroParameters == "restricted") {
						if(window.restrictedEval) value = window.restrictedEval(value);
					} else {
						value = window.eval(value);
					}
				} catch(ex) {
					throw "Unable to evaluate {{" + value + "}}: " + exceptionText(ex);
				}
			}
			return value;
		}
		// Unquoted
		if(match[p + 4]) return match[p + 4];
		// Empty quote
		if(match[p + 5]) return "";
	};

	var summary = {};
	var results = [summary], match;
	while(match = re.exec(this)) {
		// matched bit is like  firstToken  or  firstToken:tokenAfterColon  (like "param":{{evaluated expression}})
		var firstToken = parseToken(match, 1);
		if(noNames) {
			results.push({ name: "", value: firstToken });
			continue;
		}

		var tokenAfterColon = parseToken(match, 8);
		var newItem = {
			name: firstToken,
			value: tokenAfterColon
		};
		if(newItem.value == null) {
			if(defaultName) {
				newItem.value = firstToken;
				newItem.name = defaultName;
			}
			else if(defaultValue) newItem.value = defaultValue;
		}

		results.push(newItem);
		if(cascadeDefaults) {
			defaultName = newItem.name;
			defaultValue = newItem.value;
		}
	}

	for(var i = 1; i < results.length; i++) {
		var name = results[i].name;
		var value = results[i].value;
		if(!summary[name])
			summary[name] = [value];
		else
			summary[name].push(value);
	}
	return results;
};

// Process a string list of macro parameters into an array. Parameters can be quoted with "", '',
// [[]], {{ }} or left unquoted (and therefore space-separated). Double-braces {{}} results in
// an *evaluated* parameter: e.g. {{config.options.txtUserName}} results in the current user's name.
String.prototype.readMacroParams = function(notAllowEval)
{
	var p = this.parseParams("list", null, !notAllowEval, true);
	return p.slice(1).map(function(param) { return param.value });
};

// Process a string list of unique tiddler names into an array. Tiddler names that have spaces in them must be [[bracketed]]
String.prototype.readBracketedList = function(unique)
{
	var p = this.parseParams("list", null, false, true);
	var i, n = [];
	for(i = 1; i < p.length; i++) {
		if(p[i].value)
			n.pushUnique(p[i].value, unique);
	}
	return n;
};

// Get [startIndex, endIndex] of chunk between given startMarker and endMarker inside text, or undefined.
tw.textUtils.getChunkRange = function(text, startMarker, endMarker)
{
	var s = text.indexOf(startMarker);
	if(s == -1) return;
	s += startMarker.length;
	var e = text.indexOf(endMarker, s);
	if(e != -1) return [s, e];
};

// Replace a chunk of a string given start and end markers
tw.textUtils.replaceChunk = function(text, startMarker, endMarker, newValue)
{
	var r = this.getChunkRange(text, startMarker, endMarker);
	return r ? text.substring(0, r[0]) + newValue + text.substring(r[1]) : text;
};


// Static method to bracket a string with double square brackets if it contains a space
String.encodeTiddlyLink = function(title)
{
	return title.indexOf(" ") == -1 ? title : "[[" + title + "]]";
};

// Static method to encodeTiddlyLink for every item in an array and join them with spaces
String.encodeTiddlyLinkList = function(list)
{
	if(!list) return "";
	return list.map(function(item) { return String.encodeTiddlyLink(item) }).join(" ");
};

// Convert a string as a sequence of name:"value" pairs into a hashmap
String.prototype.decodeHashMap = function()
{
	var fields = this.parseParams("anon", "", false);
	var i, hashmap = {};
	for(i = 1; i < fields.length; i++)
		hashmap[fields[i].name] = fields[i].value;
	return hashmap;
};

// Static method to encode a hashmap into a name:"value"... string
String.encodeHashMap = function(hashmap)
{
	var name, r = [];
	for(name in hashmap)
		r.push(name + ':"' + hashmap[name] + '"');
	return r.join(" ");
};

// Static method to left-pad a string with 0s to a certain width
String.zeroPad = function(n, width)
{
	var s = n.toString();
	if(s.length >= width) return s;
	return "000000000000000000000000000".substring(0, width - s.length) + s;
};

String.prototype.startsWith = function(prefix)
{
	return !prefix || this.substring(0, prefix.length) == prefix;
};

// Returns the first value of the given named parameter.
function getParam(params, name, defaultValue)
{
	if(!params) return defaultValue;
	var p = params[0][name];
	return p ? p[0] : defaultValue;
}

// Returns the first value of the given boolean named parameter.
function getFlag(params, name, defaultValue)
{
	return !!getParam(params, name, defaultValue);
}

//--
//-- Augmented methods for the JavaScript Date() object
//--

// Substitute date components into a string
Date.prototype.formatString = function(template)
{
	var tz = this.getTimezoneOffset();
	var atz = Math.abs(tz);
	var t = template
		.replace(/0hh12/g, String.zeroPad(this.getHours12(), 2))
		.replace(/hh12/g, this.getHours12())
		.replace(/0hh/g, String.zeroPad(this.getHours(), 2))
		.replace(/hh/g, this.getHours())
		.replace(/mmm/g, config.messages.dates.shortMonths[this.getMonth()])
		.replace(/0mm/g, String.zeroPad(this.getMinutes(), 2))
		.replace(/mm/g, this.getMinutes())
		.replace(/0ss/g, String.zeroPad(this.getSeconds(), 2))
		.replace(/ss/g, this.getSeconds())
		.replace(/[ap]m/g, this.getAmPm().toLowerCase())
		.replace(/[AP]M/g, this.getAmPm().toUpperCase())
		.replace(/wYYYY/g, this.getYearForWeekNo())
		.replace(/wYY/g, String.zeroPad(this.getYearForWeekNo() - 2000, 2))
		.replace(/YYYY/g, this.getFullYear())
		.replace(/YY/g, String.zeroPad(this.getFullYear() - 2000, 2))
		.replace(/MMM/g, config.messages.dates.months[this.getMonth()])
		.replace(/0MM/g, String.zeroPad(this.getMonth() + 1, 2))
		.replace(/MM/g, this.getMonth() + 1)
		.replace(/0WW/g, String.zeroPad(this.getWeek(), 2))
		.replace(/WW/g, this.getWeek())
		.replace(/DDD/g, config.messages.dates.days[this.getDay()])
		.replace(/ddd/g, config.messages.dates.shortDays[this.getDay()])
		.replace(/0DD/g, String.zeroPad(this.getDate(), 2))
		.replace(/DDth/g, this.getDate() + this.daySuffix())
		.replace(/DD/g, this.getDate())
		.replace(/TZD/g, (tz < 0 ? '+' : '-') + String.zeroPad(Math.floor(atz / 60), 2) +
			':' + String.zeroPad(atz % 60, 2))
		.replace(/\\/g, "");
	return t;
};

Date.prototype.getWeek = function()
{
	var dt = new Date(this.getTime());
	var d = dt.getDay();
	// JavaScript Sun=0, ISO Sun=7
	if(d == 0) d = 7;
	// shift day to Thurs of same week to calculate weekNo
	dt.setTime(dt.getTime() + (4 - d) * 86400000);
	var n = Math.floor((dt.getTime() - new Date(dt.getFullYear(), 0, 1) + 3600000) / 86400000);
	return Math.floor(n / 7) + 1;
};

Date.prototype.getYearForWeekNo = function()
{
	var dt = new Date(this.getTime());
	var d = dt.getDay();
	// JavaScript Sun=0, ISO Sun=7
	if(d == 0) d = 7;
	// shift day to Thurs of same week
	dt.setTime(dt.getTime() + (4 - d) * 86400000);
	return dt.getFullYear();
};

Date.prototype.getHours12 = function()
{
	var h = this.getHours();
	return h > 12 ? h - 12 : ( h > 0 ? h : 12 );
};

Date.prototype.getAmPm = function()
{
	return this.getHours() >= 12 ? config.messages.dates.pm : config.messages.dates.am;
};

Date.prototype.daySuffix = function()
{
	return config.messages.dates.daySuffixes[this.getDate() - 1];
};

// Convert to local YYYYMMDDHHMM format string
Date.prototype.convertToLocalYYYYMMDDHHMM = function()
{
	return this.getFullYear() + String.zeroPad(this.getMonth() + 1, 2) + String.zeroPad(this.getDate(), 2) +
		String.zeroPad(this.getHours(), 2) + String.zeroPad(this.getMinutes(), 2);
};

// Convert to UTC YYYYMMDDHHMM format string
Date.prototype.convertToYYYYMMDDHHMM = function()
{
	return this.getUTCFullYear() + String.zeroPad(this.getUTCMonth() + 1, 2) + String.zeroPad(this.getUTCDate(), 2) +
		String.zeroPad(this.getUTCHours(), 2) + String.zeroPad(this.getUTCMinutes(), 2);
};

// Convert to UTC YYYYMMDD.HHMMSSMMM format string
Date.prototype.convertToYYYYMMDDHHMMSSMMM = function()
{
	return this.getUTCFullYear() + String.zeroPad(this.getUTCMonth() + 1, 2) +
		String.zeroPad(this.getUTCDate(), 2) + "." + String.zeroPad(this.getUTCHours(), 2) +
		String.zeroPad(this.getUTCMinutes(), 2) + String.zeroPad(this.getUTCSeconds(), 2) +
		String.zeroPad(this.getUTCMilliseconds(), 3) + "0";
};

// Static. Create a date from a UTC YYYYMMDDHHMM format string
Date.convertFromYYYYMMDDHHMM = function(d)
{
	d = d ? d.replace(/[^0-9]/g, "") : "";
	return Date.convertFromYYYYMMDDHHMMSSMMM(d.substr(0, 12));
};

// Static. Create a date from a UTC YYYYMMDDHHMMSS format string
Date.convertFromYYYYMMDDHHMMSS = function(d)
{
	d = d ? d.replace(/[^0-9]/g, "") : "";
	return Date.convertFromYYYYMMDDHHMMSSMMM(d.substr(0, 14));
};

// Static. Create a date from a UTC YYYYMMDDHHMMSSMMM format string
Date.convertFromYYYYMMDDHHMMSSMMM = function(d)
{
	d = d ? d.replace(/[^0-9]/g, "") : "";
	return new Date(Date.UTC(parseInt(d.substr(0, 4), 10),
		parseInt(d.substr(4, 2), 10) - 1,
		parseInt(d.substr(6, 2), 10),
		parseInt(d.substr(8, 2) || "00", 10),
		parseInt(d.substr(10, 2) || "00", 10),
		parseInt(d.substr(12, 2) || "00", 10),
		parseInt(d.substr(14, 3) || "000", 10)));
};

//--
//-- RGB colour object
//--

// Construct an RGB colour object from a '#rrggbb', '#rgb' or 'rgb(n,n,n)' string or from separate r,g,b values
function RGB(r, g, b)
{
	this.r = 0;
	this.g = 0;
	this.b = 0;
	if(typeof r == "string") {
		if(r.substr(0, 1) == "#") {
			if(r.length == 7) {
				this.r = parseInt(r.substr(1, 2), 16) / 255;
				this.g = parseInt(r.substr(3, 2), 16) / 255;
				this.b = parseInt(r.substr(5, 2), 16) / 255;
			} else {
				this.r = parseInt(r.substr(1, 1), 16) / 15;
				this.g = parseInt(r.substr(2, 1), 16) / 15;
				this.b = parseInt(r.substr(3, 1), 16) / 15;
			}
		} else {
			var rgbPattern = /rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/;
			var c = r.match(rgbPattern);
			if(c) {
				this.r = parseInt(c[1], 10) / 255;
				this.g = parseInt(c[2], 10) / 255;
				this.b = parseInt(c[3], 10) / 255;
			}
		}
	} else {
		this.r = r;
		this.g = g;
		this.b = b;
	}
	return this;
}

// Mixes this colour with another in a specified proportion
// c = other colour to mix
// f = 0..1 where 0 is this colour and 1 is the new colour
// Returns an RGB object
RGB.prototype.mix = function(c, f)
{
	return new RGB(this.r + (c.r - this.r) * f, this.g + (c.g - this.g) * f, this.b + (c.b - this.b) * f);
};

// Return an rgb colour as a #rrggbb format hex string
RGB.prototype.toString = function()
{
	var to255Range = function(value) {
		var clamped = value < 0 ? 0 : value > 1 ? 1 : value;
		return clamped * 255;
	};

	var to2DigitString = function(value) {
		var s = Math.floor(value).toString(16);
		return ("0" + s).slice(-2);
	};

	return "#" +
		to2DigitString(to255Range(this.r)) +
		to2DigitString(to255Range(this.g)) +
		to2DigitString(to255Range(this.b));
};

//--
//-- DOM utilities - many derived from www.quirksmode.org
//--

function drawGradient(place, horiz, loColors, hiColors)
{
	if(!hiColors) hiColors = loColors;

	for(var i = 0; i <= 100; i += 2)
	{
		var bar = document.createElement("div");
		place.appendChild(bar);
		bar.style.position = "absolute";
		bar.style.left = horiz ? i + "%" : 0;
		bar.style.top = horiz ? 0 : i + "%";
		bar.style.width = horiz ? (101 - i) + "%" : "100%";
		bar.style.height = horiz ? "100%" : (101 - i) + "%";
		bar.style.zIndex = -1;
		var p = i / 100 * (loColors.length - 1);
		var hc = hiColors[Math.floor(p)];
		if(typeof hc == "string")
			hc = new RGB(hc);
		var lc = loColors[Math.ceil(p)];
		if(typeof lc == "string")
			lc = new RGB(lc);
		bar.style.backgroundColor = hc.mix(lc, p - Math.floor(p)).toString();
	}
}

function addEvent(obj, type, fn)
{
	if(obj.attachEvent) {
		obj["e" + type + fn] = fn;
		obj[type + fn] = function() { obj["e" + type + fn](window.event) };
		obj.attachEvent("on" + type, obj[type + fn]);
	} else {
		obj.addEventListener(type, fn, false);
	}
}

function removeEvent(obj, type, fn)
{
	if(obj.detachEvent) {
		obj.detachEvent("on" + type, obj[type + fn]);
		obj[type + fn] = null;
	} else {
		obj.removeEventListener(type, fn, false);
	}
}

// Find the closest relative with a given property value (property defaults to tagName, relative defaults to parentNode)
function findRelated(e, value, name, relative)
{
	name = name || "tagName";
	relative = relative || "parentNode";
	if(name == "className") {
		while(e && !jQuery(e).hasClass(value)) {
			e = e[relative];
		}
	} else {
		while(e && e[name] != value) {
			e = e[relative];
		}
	}
	return e;
}

// Get the scroll position for window.scrollTo necessary to scroll a given element into view
function ensureVisible(e)
{
	var posTop = findPosY(e);
	var posBot = posTop + e.offsetHeight;
	var winTop = findScrollY();
	var winHeight = findWindowHeight();
	var winBot = winTop + winHeight;
	if(posTop < winTop) {
		return posTop;
	} else if(posBot > winBot) {
		if(e.offsetHeight < winHeight)
			return posTop - (winHeight - e.offsetHeight);
		else
			return posTop;
	} else {
		return winTop;
	}
}

// Get the current width of the display window
function findWindowWidth()
{
	return window.innerWidth || document.documentElement.clientWidth;
}

// Get the current height of the display window
function findWindowHeight()
{
	return window.innerHeight || document.documentElement.clientHeight;
}

// Get the current height of the document
function findDocHeight() {
	var d = document;
	return Math.max(
		Math.max(d.body.scrollHeight, d.documentElement.scrollHeight),
		Math.max(d.body.offsetHeight, d.documentElement.offsetHeight),
		Math.max(d.body.clientHeight, d.documentElement.clientHeight)
	);
}

// Get the current horizontal page scroll position
function findScrollX()
{
	return window.scrollX || document.documentElement.scrollLeft;
}

// Get the current vertical page scroll position
function findScrollY()
{
	return window.scrollY || document.documentElement.scrollTop;
}

function findPosX(obj)
{
	var curleft = 0;
	while(obj.offsetParent) {
		curleft += obj.offsetLeft;
		obj = obj.offsetParent;
	}
	return curleft;
}

function findPosY(obj)
{
	var curtop = 0;
	while(obj.offsetParent) {
		curtop += obj.offsetTop;
		obj = obj.offsetParent;
	}
	return curtop;
}

function blurElement(e)
{
	if(e && e.focus && e.blur) {
		e.focus();
		e.blur();
	}
}

// Create a non-breaking space
function insertSpacer(place)
{
	var e = document.createTextNode(String.fromCharCode(160));
	if(place) place.appendChild(e);
	return e;
}

// Replace the current selection of a textarea or text input and scroll it into view
function replaceSelection(e, text)
{
	if(e.setSelectionRange) {
		var oldpos = e.selectionStart;
		var isRange = e.selectionEnd > e.selectionStart;
		e.value = e.value.substr(0, e.selectionStart) + text + e.value.substr(e.selectionEnd);
		e.setSelectionRange(isRange ? oldpos : oldpos + text.length, oldpos + text.length);
		// scroll into view
		var linecount = e.value.split("\n").length;
		var thisline = e.value.substr(0, e.selectionStart).split("\n").length - 1;
		e.scrollTop = Math.floor((thisline - e.rows / 2) * e.scrollHeight / linecount);
	} else if(document.selection) { // support IE
		var range = document.selection.createRange();
		if(range.parentElement() == e) {
			var isCollapsed = range.text == "";
			range.text = text;
			if(!isCollapsed) {
				range.moveStart("character", -text.length);
				range.select();
			}
		}
	}
}

// Set the caret position in a text area
function setCaretPosition(e, pos)
{
	if(e.selectionStart || e.selectionStart == '0') {
		e.selectionStart = pos;
		e.selectionEnd = pos;
		e.focus();
	} else if(document.selection) { // support IE
		e.focus();
		var sel = document.selection.createRange();
		sel.moveStart('character', -e.value.length);
		sel.moveStart('character', pos);
		sel.moveEnd('character', 0);
		sel.select();
	}
}

// Returns the text of the given (text) node, possibly merging subsequent text nodes
function getNodeText(e)
{
	var text = "";
	while(e && e.nodeName == "#text") {
		text += e.nodeValue;
		e = e.nextSibling;
	}
	return text;
}

// Returns true if the element e has a given ancestor element
function isDescendant(e, ancestor)
{
	while(e) {
		if(e === ancestor)
			return true;
		e = e.parentNode;
	}
	return false;
}


// deprecate the following...

// Prevent an event from bubbling
function stopEvent(e)
{
	var ev = e || window.event;
	ev.cancelBubble = true;
	if(ev.stopPropagation) ev.stopPropagation();
	return false;
}

// Remove any event handlers or non-primitve custom attributes
function scrubNode(e)
{
	if(!config.browser.isIE) return;
	var att = e.attributes;
	if(att) {
		for(var i = 0; i < att.length; i++) {
			var n = att[i].name;
			if(n !== "style" && (typeof e[n] === "function" || (typeof e[n] === "object" && e[n] != null))) {
				try {
					e[n] = null;
				} catch(ex) {
				}
			}
		}
	}
	var c = e.firstChild;
	while(c) {
		scrubNode(c);
		c = c.nextSibling;
	}
}

function setStylesheet(s, id, doc)
{
	jQuery.twStylesheet(s, { id: id, doc: doc });
}

function removeStyleSheet(id)
{
	jQuery.twStylesheet.remove({ id: id });
}

//--
//-- LoaderBase and SaverBase
//--

function LoaderBase() {}

LoaderBase.prototype.loadTiddler = function(store, node, tiddlers)
{
	var title = this.getTitle(store, node);
	if(!title) return;
	if(safeMode && store.isShadowTiddler(title)) return;

	var tiddler = store.createTiddler(title);
	this.internalizeTiddler(store, tiddler, title, node);
	tiddlers.push(tiddler);
};

LoaderBase.prototype.loadTiddlers = function(store, nodes)
{
	var i, tiddlers = [];
	for(i = 0; i < nodes.length; i++) {
		try {
			this.loadTiddler(store, nodes[i], tiddlers);
		} catch(ex) {
			showException(ex, config.messages.tiddlerLoadError.format([this.getTitle(store, nodes[i])]));
		}
	}
	return tiddlers;
};

function SaverBase() {}

SaverBase.prototype.externalize = function(store)
{
	var results = [];
	var i, tiddlers = store.getTiddlers("title");
	for(i = 0; i < tiddlers.length; i++) {
		if(!tiddlers[i].doNotSave())
			results.push(this.externalizeTiddler(store, tiddlers[i]));
	}
	return results.join("\n");
};

//--
//-- TW21Loader (inherits from LoaderBase)
//--

function TW21Loader() {}

TW21Loader.prototype = new LoaderBase();

TW21Loader.prototype.getTitle = function(store, node)
{
	var title = null;
	if(node.getAttribute) {
		title = node.getAttribute("title") || node.getAttribute("tiddler");
	}
	if(!title && node.id) {
		var prefixLen = store.idPrefix.length;
		if(node.id.substr(0, prefixLen) == store.idPrefix)
			title = node.id.substr(prefixLen);
	}
	return title;
};

TW21Loader.prototype.internalizeTiddler = function(store, tiddler, title, node)
{
	var e = node.firstChild;
	var text = null;
	if(node.getAttribute && node.getAttribute("tiddler")) {
		text = getNodeText(e).unescapeLineBreaks();
	} else {
		while(e.nodeName != "PRE" && e.nodeName != "pre") {
			e = e.nextSibling;
		}
		text = e.innerHTML.replace(/\r/mg, "").htmlDecode();
	}
	var creator = node.getAttribute("creator");
	var modifier = node.getAttribute("modifier");
	var c = node.getAttribute("created");
	var m = node.getAttribute("modified");
	var created = c ? Date.convertFromYYYYMMDDHHMMSS(c) : version.date;
	var modified = m ? Date.convertFromYYYYMMDDHHMMSS(m) : created;
	var tags = node.getAttribute("tags");
	var fields = {};
	var i, attrs = node.attributes;
	for(i = attrs.length - 1; i >= 0; i--) {
		var name = attrs[i].name;
		if(attrs[i].specified && !TiddlyWiki.isStandardField(name)) {
			fields[name] = attrs[i].value.unescapeLineBreaks();
		}
	}
	tiddler.assign(title, text, modifier, modified, tags, created, fields, creator);
	return tiddler;
};

//--
//-- TW21Saver (inherits from SaverBase)
//--

function TW21Saver() {}

TW21Saver.prototype = new SaverBase();

TW21Saver.prototype.externalizeTiddler = function(store, tiddler)
{
	try {
		var usePre = config.options.chkUsePreForStorage;
		var created = tiddler.created;
		var modified = tiddler.modified;
		var tags = tiddler.getTags();
		var attributes =
			(tiddler.creator ? ' creator="' + tiddler.creator.htmlEncode() + '"' : "") +
			(tiddler.modifier ? ' modifier="' + tiddler.modifier.htmlEncode() + '"' : "") +
			((usePre && created == version.date) ? "" : ' created="' + created.convertToYYYYMMDDHHMM() + '"') +
			((usePre && modified == created) ? "" : ' modified="' + modified.convertToYYYYMMDDHHMM() + '"') +
			((!usePre || tags) ? ' tags="' + tags.htmlEncode() + '"' : "");
		var extendedAttributes = "";
		store.forEachField(tiddler, function(tiddler, fieldName, value) {
			if(typeof value != "string")
				value = "";
			// don't store fields from the temp namespace
			if(!fieldName.match(/^temp\./))
				extendedAttributes += ' %0="%1"'.format([fieldName, value.escapeLineBreaks().htmlEncode()]);
		}, true);
		return ('<div %0="%1"%2%3>%4</' + 'div>').format([
			usePre ? "title" : "tiddler",
			tiddler.title.htmlEncode(),
			attributes,
			extendedAttributes,
			usePre ? "\n<pre>" + tiddler.text.htmlEncode() + "</pre>\n" : tiddler.text.escapeLineBreaks().htmlEncode()
		]);
	} catch (ex) {
		throw exceptionText(ex, config.messages.tiddlerSaveError.format([tiddler.title]));
	}
};

