var winHistory = [-1, -1];

chrome.windows.onFocusChanged.addListener(function(newWinId){
    if (newWinId == chrome.windows.WINDOW_ID_NONE) return;

    winHistory.shift();
    winHistory.push(newWinId);
});

chrome.windows.onRemoved.addListener(function(removedWinId){
    winHistory = winHistory.map(function(id){
        return (id == removedWinId) ? -1 : id;
    });
});

chrome.browserAction.onClicked.addListener(function(){
    chrome.tabs.query({highlighted: true, currentWindow: true}, function(tabs){
        tabs.length == 1 ? combine() : split(tabs);
    });
});

function combine() {
    if (winHistory.some(function(id){return id == -1;})) return;
    var tabIds = []
    chrome.tabs.query({highlighted: true, windowId: winHistory[0]}, function(tabs){
        tabIds = tabs.map(tab => { return tab.id;});
    });
    
    chrome.windows.get(winHistory[1], {populate: true}, function(lastWin){
        chrome.tabs.move(tabIds, {windowId: lastWin.id, index: -1});
    });
}

function split(tabs){
    var tabIds = tabs.map(function(tab){return tab.id;});
    var firstTabId = tabIds.shift();
    chrome.windows.create({tabId: firstTabId}, function(win){
        chrome.tabs.move(tabIds, {windowId: win.id, index: -1});
    });
}
