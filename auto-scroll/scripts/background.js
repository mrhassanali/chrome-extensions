let scrolling = false;
let scrollFrameId;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startScroll") {
    startScrolling(
      message.speed,
      message.delay,
      sender.tab ? sender.tab.id : null
    );
  }
  return true; // Keep the message channel open for sendResponse
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "stop_scroll") {
    stopScrolling();
  }
});

function startScrolling(speed, delay, tabId) {
  if (!scrolling) {
    scrolling = true;

    if (tabId !== null) {
      executeScroll(tabId, speed, delay);
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id !== undefined) {
          executeScroll(tabs[0].id, speed, delay);
        } else {
          console.error("No active tab found");
        }
      });
    }
  } else {
    stopScrolling();
  }
}

function executeScroll(tabId, speed, delay) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      function: autoScroll,
      args: [speed, delay],
    },
    (result) => {
      if (chrome.runtime.lastError) {
        console.error("Scripting Error:", chrome.runtime.lastError);
      } else {
        console.log("Scrolling script executed");
      }
    }
  );
}

function autoScroll(speed, delay) {
  let scrollHeight = document.body.scrollHeight;
  let scrollPosition = 0;

  function scrollStep() {
    if (scrollPosition < scrollHeight && window.continueScrolling) {
      scrollPosition += speed;
      window.scrollTo(0, scrollPosition);
      window.scrollFrameId = requestAnimationFrame(scrollStep);
    }
  }

  // Add a global variable to control scrolling
  window.continueScrolling = true;
  window.scrollFrameId = requestAnimationFrame(() =>
    setTimeout(scrollStep, delay || 1)
  );
}

// Function to stop scrolling
function stopScrolling() {
  if (scrolling) {
    scrolling = false;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id !== undefined) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            function: function () {
              window.continueScrolling = false;
              cancelAnimationFrame(window.scrollFrameId);
            },
          },
          (result) => {
            if (chrome.runtime.lastError) {
              console.error("Scripting Error:", chrome.runtime.lastError);
            } else {
              console.log("Scrolling stopped");
            }
          }
        );
      } else {
        console.error("No active tab found to stop scrolling");
      }
    });
  }
}
