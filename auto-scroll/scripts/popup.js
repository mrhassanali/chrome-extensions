document
  .getElementById("scrollForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const speed = parseInt(document.getElementById("speed").value);
    const delay = parseInt(document.getElementById("delay").value);

    chrome.runtime.sendMessage(
      { action: "startScroll", speed: speed, delay: delay },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Runtime Error:", chrome.runtime.lastError);
        } else {
          console.log("Scroll toggled");
        }
      }
    );
  });
