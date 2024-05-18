const enableLogging = true;

document.addEventListener('DOMContentLoaded', () => {
  log('Popup opened');
  initialize();
  checkCSS();
  setInterval(captureImagePeriodically, 500); // 0.5초 간격으로 이미지와 시간을 업데이트
});

function initialize() {
  document.getElementById('playPauseButton').addEventListener('mouseup', togglePlayPause);
  document.getElementById('restartButton').addEventListener('mouseup', restartVideo);
  document.getElementById('prevButton').addEventListener('mouseup', prevFrame);
  document.getElementById('nextButton').addEventListener('mouseup', nextFrame);
  document.getElementById("popupImage").addEventListener("mouseup", () => sendMessage({ action: "popupImage" }));
  document.getElementById("downloadImage").addEventListener("mouseup", () => sendMessage({ action: "downloadImage" }));
  document.getElementById("startBackup").addEventListener("mouseup", startBackupProcess);
  document.getElementById("downloadAll").addEventListener("mouseup", downloadAllBackups);

  captureImageOnce();
  checkVideoState();

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "updateProgress") {
      updateProgress(message.status, message.progress, message.total, message.percentage, message.filename);
      if (message.status === "complete") {
        if (message.task === "backup") {
          document.getElementById("downloadAll").disabled = false;
        } else if (message.task === "download") {
          document.getElementById("downloadAll").disabled = true;
        }
      }
    }
  });
}

function captureImagePeriodically() {
  sendMessage({ action: "captureAndSendImage" });
}

function startBackupProcess() {
  resetProgress();
  updateProgress("백업중", 0, 0, 0);
  sendMessage({ action: "startAutoBackup" });
}

function downloadAllBackups() {
  resetProgress();
  updateProgress("다운로드 중", 0, 0, 0);
  sendMessage({ action: "downloadAllBackups" });
}

function captureImageOnce() {
  sendMessage({ action: "captureAndSendImage" });
}

function checkVideoState() {
  log('checkVideoState called');
  sendMessage({ action: "checkVideoState" }, false, (response) => {
    if (response && typeof response.isPlaying !== 'undefined') {
      updatePlayPauseButton(response.isPlaying);
    } else {
      log('checkVideoState response is undefined');
    }
  });
}

function togglePlayPause() {
  log('togglePlayPause called');
  sendMessage({ action: "togglePlayPause" }, false, (response) => {
    if (response && typeof response.isPlaying !== 'undefined') {
      updatePlayPauseButton(response.isPlaying);
    } else {
      log('togglePlayPause response is undefined');
    }
  });
}

function updatePlayPauseButton(isPlaying) {
  const playPauseButton = document.getElementById('playPauseButton');
  playPauseButton.textContent = isPlaying ? 'Pause' : 'Play';
}

function restartVideo() {
  log('restartVideo called');
  sendMessage({ action: "restartVideo" });
}

function prevFrame() {
  log('prevFrame called');
  sendMessage({ action: "prevFrame" });
}

function nextFrame() {
  log('nextFrame called');
  sendMessage({ action: "nextFrame" });
}

function sendMessage(message, waitForResponse = false, callback) {
  log(`sendMessage called with action: ${message.action}`);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, files: ['content.js'] }, () => {
      chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
        }
        if (response && response.imageUrl) {
          displayCapturedImage(response.imageUrl);
          updateVideoTime(response.currentTime, response.duration);
        }
        if (callback) {
          callback(response);
        }
      });
    });
  });
}

function displayCapturedImage(imageUrl) {
  const imageElement = document.getElementById("capturedImage");
  const placeholder = document.getElementById("placeholder");
  if (imageElement) {
    imageElement.src = imageUrl;
    placeholder.style.display = 'none';
  } else {
    console.error("capturedImage 요소를 찾을 수 없습니다.");
  }
}

function updateVideoTime(currentTime, duration) {
  document.getElementById('currentTime').textContent = formatTime(currentTime);
  document.getElementById('duration').textContent = formatTime(duration);
}

function updateProgress(status, current, total, percentage, filename) {
  const progressContainer = document.getElementById('progressPlaceholder');
  progressContainer.textContent = `${status} ${current} / ${total} (${percentage}%) ${filename ? filename : ''}`;
}

function resetProgress() {
  const progressContainer = document.getElementById('progressPlaceholder');
  progressContainer.textContent = '';
}

function formatTime(seconds) {
  const date = new Date(seconds * 1000);
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');
  const ms = String(date.getUTCMilliseconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}.${ms}`;
}

function log(message) {
  if (enableLogging) {
    console.log(message);
  }
}

function checkCSS() {
  const testElement = document.createElement('div');
  testElement.id = 'css-check';
  document.body.appendChild(testElement);
  const style = window.getComputedStyle(testElement);
  if (style.display === 'none') {
    console.log('CSS loaded successfully.');
  } else {
    console.error('CSS failed to load.');
    alert('CSS failed to load.');
  }
  document.body.removeChild(testElement);
}
