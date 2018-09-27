const tabsFolderTitle = "Tabs";
const bookmarkBarId = "1";

function saveAndCloseTabs(currentTab, tabsFolderNode) {
  chrome.tabs.query({ currentWindow: true },
    tabs => {
      const tabsFolderUrl = "chrome://bookmarks/?id=" + tabsFolderNode.id;
      if (tabs.length == 1 && currentTab.url == tabsFolderUrl) {
        return;
      }

      let closeTabIds = [];
      let saveTabs = [];
      let urls = [];

      for (const tab of tabs) {
        if (!tab.url.startsWith("chrome://")
         && !urls.includes(tab.url)) {
          urls.push(tab.url);
          saveTabs.unshift(tab);
        }

        if (tab.id != currentTab.id) {
          closeTabIds.push(tab.id);
        }
      }

      if (saveTabs.length) {
        createBookmarks(saveTabs, tabsFolderNode.id)
      }

      closeTabs(closeTabIds);
      showTabsFolder(currentTab, tabsFolderUrl)
    }
  );
}

async function createBookmarks(saveTabs, tabsFolderNodeId) {
  await new Promise((resolve, reject) => {
    chrome.bookmarks.create(
      { parentId: tabsFolderNodeId, index: 0, title: getFormattedDate() },
      node => {
        for (const tab of saveTabs) {
          chrome.bookmarks.create(
            { parentId: node.id, index: 0, title: tab.title, url: tab.url }
          );
        }

        resolve();
      }
    );
  });
}

async function closeTabs(closeTabIds) {
  await new Promise((resolve, reject) =>
    chrome.tabs.remove(closeTabIds, resolve)
  );
}

function showTabsFolder(currentTab, tabsFolderUrl) {
  if (currentTab.url != tabsFolderUrl) {
    chrome.tabs.update(currentTab.id, { url: tabsFolderUrl });
  }
}

function getTabsFolderNode(callback) {
  chrome.bookmarks.getSubTree(bookmarkBarId, bookmarkBarNode => {
    let tabsFolderNode = bookmarkBarNode[0].children.find(node => node.title == tabsFolderTitle);
    if (tabsFolderNode != undefined) {
      callback(tabsFolderNode);
    } else {
      chrome.bookmarks.create(
        { parentId: bookmarkBarId, index: 0, title: tabsFolderTitle },
        node => { callback(node); }
      );
    }
  })
}

function getFormattedDate() {
  return new Date().toISOString().slice(0, -5).replace('T', ' ');
}

chrome.browserAction.onClicked.addListener(currentTab =>
  getTabsFolderNode(tabsFolderNode =>
    saveAndCloseTabs(currentTab, tabsFolderNode)
  )
);
