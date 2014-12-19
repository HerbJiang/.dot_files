var DEBUG = true;

if (DEBUG) S.log("[SLATE] -------------- Start Loading Config --------------");

// Configs
S.cfga({
  "defaultToCurrentScreen" : true,
  "secondsBetweenRepeat" : 0.1,
  "checkDefaultsOnLoad" : true,
  "focusCheckWidthMax" : 3000,
  "orderScreensLeftToRight" : true
});

// Monitors
var monAtLeft = S.screenForRef("0");
var monAtCenter = S.screenForRef("1");
var monAtRight = S.screenForRef("2");

var calRect = function(winRect, oScrVRect, tScrVRect) {
    var oTopLeftX = oScrVRect.x;
    var oTopLeftY = oScrVRect.y;
    var oWidth = oScrVRect.width;
    var oHeight = oScrVRect.height;

    var tTopLeftX = tScrVRect.x;
    var tTopLeftY = tScrVRect.y;
    var tWidth = tScrVRect.width;
    var tHeight = tScrVRect.height;

    var wTopLeftX = winRect.x;
    var wTopLeftY = winRect.y;
    var wWidth = winRect.width;
    var wHeight = winRect.height;

    // 這幾個比例需要動腦思考一下，目的是希望等比例（基於左上角）把視窗投射到另一個螢幕上
    var xRatio = (wTopLeftX-oTopLeftX) / oWidth;
    var yRatio = (wTopLeftY-oTopLeftY) / oHeight;
    var wRatio = wWidth / oWidth;
    var hRatio = wHeight / oHeight;

    if (DEBUG)
        S.log("Win Rect:::" + winRect.x + "/" + winRect.y + "/" + winRect.width + "/" + winRect.height);

    var newRect = {
        x: Math.ceil(tTopLeftX + (tWidth * xRatio)),
        y: Math.ceil(tTopLeftY + (tHeight * yRatio)),
        width: Math.ceil(tWidth * wRatio),
        height: Math.ceil(tHeight * hRatio)
    };

    return newRect;
}

var getScreenXYAdjustArray = function() {
    var arr = [];
    var mainOffset = -1;
    for (var i=0; i < S.screenCount(); i++) {
        arr.push(0);
        var scr = S.screenForRef("" + i);
        if (scr.isMain()) {
            mainOffset = i;
        }
    }

    var acc = 0;
    for (var i=mainOffset; i < S.screenCount(); i++) {
        var scr = S.screenForRef("" + i);
        var width = scr.vrect().width;
        arr[i] = acc;
        acc -= width;
    }
    acc = 0;
    for (var i=mainOffset-1; i >= 0; i--) {
        var scr = S.screenForRef("" + i);
        var width = scr.vrect().width;
        acc += width;
        arr[i] = acc;
    }

    return arr;
}

var adjustXY = function(rect, incX, incY) {
    if (typeof(rect) == 'undefined')
        return {x:0, y:0, width: 400, height: 400};
    rect.x += incX; 
    rect.y += incY;
    return rect;
}

// Operations
//
var throwWinToScr = function(win, toScr) {
    if (typeof(win) == 'undefined' || typeof(win.rect()) == 'undefined')
        return;
    var arr = getScreenXYAdjustArray();
    var fromId = win.screen().id(); 
    var toId = toScr.id();

    var incWidthOfOriginScreen = arr[fromId];
    var incWidthOfTargetScreen = arr[toId];

    var newRect = calRect(
            adjustXY(win.rect(), incWidthOfOriginScreen, 0), 
            adjustXY(win.screen().vrect(), incWidthOfOriginScreen, 0), 
            adjustXY(toScr.vrect(), incWidthOfTargetScreen, 0));

    newRect = adjustXY( newRect, -1 * incWidthOfTargetScreen, 0 );
    
    // if (DEBUG)    S.log(newRect.x + "/" + newRect.y + "/" + newRect.width + "/" + newRect.height);
    win.doOperation("throw", {screen: toId, "x": newRect.x, "y": newRect.y, "width": newRect.width, "height": newRect.height});
}

// throw to left screen, circle to most right if already at most left screen
var throwLCircle = function(win) { 
    var cid = win.screen().id(); 

    if (cid == 0) cid = S.screenCount() - 1; 
    else cid--; 

    var toScr = S.screenForRef("" + cid);
    throwWinToScr(win, toScr);
};

// throw to right screen, circle to most left if already at most right screen
var throwRCircle = function(win) { 
    var cid = win.screen().id(); 

    if (cid == S.screenCount() - 1) cid = 0; 
    else cid++; 
    
    var toScr = S.screenForRef("" + cid);
    throwWinToScr(win, toScr);
};

var mv2L_Full = S.op("throw", {
  "screen" : monAtLeft,
  "x" : "screenOriginX",
  "y" : "screenOriginY",
  "width" : "screenSizeX",
  "height" : "screenSizeY"
});
var mv2R_Full = S.op("throw", {
  "screen" : monAtRight,
  "x" : "screenOriginX",
  "y" : "screenOriginY",
  "width" : "screenSizeX",
  "height" : "screenSizeY"
});

var resizeFull = S.op("move", {
  "x" : "screenOriginX",
  "y" : "screenOriginY",
  "width" : "screenSizeX",
  "height" : "screenSizeY"
});

// 縮放到螢幕中間，約佔 50% 
var resizeCenter50 = function(win) {
    win.doOperation("move", {
            "x" : "screenOriginX",
            "y" : "screenOriginY",
            "width" : "screenSizeX",
            "height" : "screenSizeY"
        });
    win.doOperation("resize", { "anchor": "top-left", "width": "-12.5%", "height": "-12.5%" });
    win.doOperation("resize", { "anchor": "bottom-right", "width": "-12.5%", "height": "-12.5%" });
};

var throwAllWindowToMainMonitor = function() {
    var mainScr;

    S.eachScreen(function(scrObj) {
        if (scrObj.isMain()) {
            mainScr = scrObj;
        }
    });

    S.eachApp(function(appObj) {
        appObj.eachWindow(function(winObj) {
            if (!winObj.screen().isMain()) {
                throwWinToScr(winObj, mainScr);
            }
        });
    });
}

var printAllWindow = function() {
    S.eachApp(function(appObj) {
        appObj.eachWindow(function(winObj) {
            S.log("app:" + appObj.name() + "/ win:" + winObj.title());
        });
    });
}

var t2center = function(winObj) { throwWinToScr(winObj, monAtCenter); }
var t2left = function(winObj) { throwWinToScr(winObj, monAtLeft); }
var t2right = function(winObj) { throwWinToScr(winObj, monAtRight); }

var genEclipseHash = function() {
  return {
    "operations" : [function(windowObject) {
      var title = windowObject.title();
      if (title !== undefined && title != '') {
        t2right(windowObject);
      } else {
        t2left(windowObject);
      }
    }],
    "ignore-fail" : true,
    "repeat" : true
  };
} 

// 3 monitor layout
var threeMonitorLayout = S.lay("threeMonitor", {
  "Eclipse" : genEclipseHash(),
  "Google Chrome": { "operations": [t2left], "ignore-fail": true, "repeat": true },
  "iTerm": { "operations": [t2right], "ignore-fail": true, "repeat": true },
  "Aurora": { "operations": [t2center], "ignore-fail": true, "repeat": true },
});

// 1 monitor layout
var oneMonitorLayout = S.lay("oneMonitor", {
});

var twoMonitorLayout = oneMonitorLayout;

// Defaults
S.def(3, threeMonitorLayout);
S.def(2, twoMonitorLayout);
S.def(1, oneMonitorLayout);

// Layout Operations
var threeMonitor = S.op("layout", { "name" : threeMonitorLayout });
var twoMonitor = S.op("layout", { "name" : twoMonitorLayout });
var oneMonitor = S.op("layout", { "name" : oneMonitorLayout });

var universalLayout = function() {
  // Should probably make sure the resolutions match but w/e
  S.log("SCREEN COUNT: "+S.screenCount());
  if (S.screenCount() === 3) {
//      S.log("Left:" + monAtLeft.id() + ":" + monAtLeft.isMain());
//      S.log("Center:" + monAtCenter.id() + ":" + monAtLeft.isMain());
//      S.log("Right:" + monAtRight.id() + ":" + monAtLeft.isMain());
    threeMonitor.run();
  } else if (S.screenCount() === 2) {
    twoMonitor.run();
  } else if (S.screenCount() === 1) {
    oneMonitor.run();
  }
};

// Batch bind everything. Less typing.
S.bnda({
  // Layout Bindings
  //"padEnter:ctrl" : universalLayout,
  //"space:ctrl" : universalLayout,

  // Basic Location Bindings
  "r:ctrl;alt;cmd" : S.op("relaunch"),

  "h:ctrl;alt;cmd" : function() { throwLCircle(S.window()); },
  "l:ctrl;alt;cmd" : function() { throwRCircle(S.window()); },
  "j:ctrl;alt;cmd" : resizeFull,
  "k:ctrl;alt;cmd" : function() { resizeCenter50(S.window()); },

  "x:ctrl;alt;cmd" : resizeFull,
  "c:ctrl;alt;cmd" : function() { resizeCenter50(S.window()); },
  "left:ctrl;alt" : function() { throwLCircle(S.window()); },
  "right:ctrl;alt" : function() { throwRCircle(S.window()); },
  ".:ctrl;alt;cmd" : throwAllWindowToMainMonitor,
  ".:ctrl;shift;cmd" : universalLayout,

  // Resize Bindings
  // NOTE: some of these may *not* work if you have not removed the expose/spaces/mission control bindings
  /*
  "right:ctrl" : S.op("resize", { "width" : "+10%", "height" : "+0" }),
  "left:ctrl" : S.op("resize", { "width" : "-10%", "height" : "+0" }),
  "up:ctrl" : S.op("resize", { "width" : "+0", "height" : "-10%" }),
  "down:ctrl" : S.op("resize", { "width" : "+0", "height" : "+10%" }),
  "right:alt" : S.op("resize", { "width" : "-10%", "height" : "+0", "anchor" : "bottom-right" }),
  "left:alt" : S.op("resize", { "width" : "+10%", "height" : "+0", "anchor" : "bottom-right" }),
  "up:alt" : S.op("resize", { "width" : "+0", "height" : "+10%", "anchor" : "bottom-right" }),
  "down:alt" : S.op("resize", { "width" : "+0", "height" : "-10%", "anchor" : "bottom-right" }),
  */

  // Push Bindings
  // NOTE: some of these may *not* work if you have not removed the expose/spaces/mission control bindings
  /*
  "right:ctrl;shift" : S.op("push", { "direction" : "right", "style" : "bar-resize:screenSizeX/2" }),
  "left:ctrl;shift" : S.op("push", { "direction" : "left", "style" : "bar-resize:screenSizeX/2" }),
  "up:ctrl;shift" : S.op("push", { "direction" : "up", "style" : "bar-resize:screenSizeY/2" }),
  "down:ctrl;shift" : S.op("push", { "direction" : "down", "style" : "bar-resize:screenSizeY/2" }),
  */

  // Nudge Bindings
  // NOTE: some of these may *not* work if you have not removed the expose/spaces/mission control bindings
  /*
  "right:ctrl;alt" : S.op("nudge", { "x" : "+10%", "y" : "+0" }),
  "left:ctrl;alt" : S.op("nudge", { "x" : "-10%", "y" : "+0" }),
  "up:ctrl;alt" : S.op("nudge", { "x" : "+0", "y" : "-10%" }),
  "down:ctrl;alt" : S.op("nudge", { "x" : "+0", "y" : "+10%" }),
  */

  // Throw Bindings
  // NOTE: some of these may *not* work if you have not removed the expose/spaces/mission control bindings
  /*
  "pad1:ctrl;alt" : S.op("throw", { "screen" : "2", "width" : "screenSizeX", "height" : "screenSizeY" }),
  "pad2:ctrl;alt" : S.op("throw", { "screen" : "1", "width" : "screenSizeX", "height" : "screenSizeY" }),
  "pad3:ctrl;alt" : S.op("throw", { "screen" : "0", "width" : "screenSizeX", "height" : "screenSizeY" }),
  "right:ctrl;alt;cmd" : S.op("throw", { "screen" : "right", "width" : "screenSizeX", "height" : "screenSizeY" }),
  "left:ctrl;alt;cmd" : S.op("throw", { "screen" : "left", "width" : "screenSizeX", "height" : "screenSizeY" }),
  "up:ctrl;alt;cmd" : S.op("throw", { "screen" : "up", "width" : "screenSizeX", "height" : "screenSizeY" }),
  "down:ctrl;alt;cmd" : S.op("throw", { "screen" : "down", "width" : "screenSizeX", "height" : "screenSizeY" }),
  */

  // Focus Bindings
  // NOTE: some of these may *not* work if you have not removed the expose/spaces/mission control bindings
  "l:ctrl;cmd" : S.op("focus", { "direction" : "right" }),
  "h:ctrl;cmd" : S.op("focus", { "direction" : "left" }),
  "k:ctrl;cmd" : S.op("focus", { "direction" : "up" }),
  "j:ctrl;cmd" : S.op("focus", { "direction" : "down" }),
  "f:ctrl;cmd" : S.op("focus", { "direction" : "behind" }),

  // Window Hints
  "tab:ctrl;cmd" : S.op("hint"),

  // Switch currently doesn't work well so I'm commenting it out until I fix it.
  //"tab:cmd" : S.op("switch"),

  // Grid
  "esc:ctrl" : S.op("grid")
});

// Test Cases
// S.src(".slate.test", true);
// S.src(".slate.test.js", true);
//
universalLayout();

// Log that we're done configuring
if (DEBUG) S.log("[SLATE] -------------- Finished Loading Config --------------");

