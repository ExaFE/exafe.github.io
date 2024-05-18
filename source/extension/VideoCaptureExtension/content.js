if (!window.blaqrecord) {
  window.blaqrecord = {};
}

if (!window.blaqrecord.extension) {
  window.blaqrecord.extension = {
    initialized: false,
    enableLogging: true,
    functions: {},
    backups: {}
  };
}

if (!window.blaqrecord.extension.initialized) {
  window.blaqrecord.extension.initialized = true;

  const log = (message, data) => {
    if (window.blaqrecord.extension.enableLogging) {
      console.log(message, data || '');
    }
  };

  const captureVideoImage = () => {
    const videoElement = document.querySelector("video");
    if (!videoElement) return null;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const currentTime = Math.floor(videoElement.currentTime * 10) / 10;
    try {
      ctx.drawImage(videoElement, 0, 0);
    } catch (err) {
      console.error("영상 캡처 실패:", err);
      return null;
    }
    return {
      imageUrl: canvas.toDataURL("image/png"),
      width: canvas.width,
      height: canvas.height,
      currentTime: currentTime
    };
  };

  const downloadImageToFile = (imageInfo) => {
    const filename = generateFilename(imageInfo.currentTime);
    const downloadLink = document.createElement("a");
    downloadLink.href = imageInfo.imageUrl;
    downloadLink.download = filename;
    downloadLink.click();
  };

  const generateFilename = (currentTime) => {
    const totalSeconds = Math.floor(currentTime);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    const milliseconds = Math.floor((currentTime % 1) * 100).toString().padStart(2, "0");
    const currentURL = window.location.href.split("/").pop();
    return `youtube_${currentURL}_${hours}_${minutes}_${seconds}_${milliseconds}.jpg`;
  };

  window.blaqrecord.extension.functions.captureAndSendImage = (sendResponse) => {
    const imageInfo = captureVideoImage();
    if (imageInfo) {
      const videoElement = document.querySelector("video");
      const duration = videoElement ? videoElement.duration : 0;
      sendResponse({ imageUrl: imageInfo.imageUrl, currentTime: imageInfo.currentTime, duration: duration });
    } else {
      sendResponse({});
    }
  };

  window.blaqrecord.extension.functions.popupImage = (sendResponse) => {
    const imageInfo = captureVideoImage();
    if (!imageInfo) {
      sendResponse({});
      return;
    }
    const popupWidth = imageInfo.width;
    const popupHeight = imageInfo.height;
    const popup = window.open("", "", `width=${popupWidth},height=${popupHeight}`);
    popup.document.body.innerHTML = `
      <img src="${imageInfo.imageUrl}" alt="영상 이미지" style="width: 100%; height: auto;">
      <p>크기: ${imageInfo.width} x ${imageInfo.height}</p>
      <p>캡처 시간: ${imageInfo.currentTime}</p>
    `;
    sendResponse({});
  };

  window.blaqrecord.extension.functions.downloadImage = (sendResponse) => {
    const imageInfo = captureVideoImage();
    if (!imageInfo) {
      sendResponse({});
      return;
    }
    downloadImageToFile(imageInfo);
    sendResponse({});
  };

  window.blaqrecord.extension.functions.togglePlayPause = (sendResponse) => {
    const videoElement = document.querySelector("video");
    if (videoElement.paused) {
      videoElement.play();
      sendResponse({ isPlaying: true });
    } else {
      videoElement.pause();
      sendResponse({ isPlaying: false });
    }
  };

  window.blaqrecord.extension.functions.checkVideoState = (sendResponse) => {
    const videoElement = document.querySelector("video");
    const isPlaying = !videoElement.paused;
    sendResponse({ isPlaying });
  };

  window.blaqrecord.extension.functions.restartVideo = (sendResponse) => {
    const videoElement = document.querySelector("video");
    videoElement.currentTime = 0;
    sendResponse({});
  };

  window.blaqrecord.extension.functions.prevFrame = (sendResponse) => {
    const videoElement = document.querySelector("video");
    videoElement.currentTime = Math.max(videoElement.currentTime - 0.5, 0);
    sendResponse({});
  };

  window.blaqrecord.extension.functions.nextFrame = (sendResponse) => {
    const videoElement = document.querySelector("video");
    videoElement.currentTime = Math.min(videoElement.currentTime + 0.5, videoElement.duration);
    sendResponse({});
  };

  window.blaqrecord.extension.functions.startAutoBackup = async (sendResponse) => {
    const videoElement = document.querySelector("video");
    if (!videoElement) return;
    videoElement.currentTime = 0;
    const duration = videoElement.duration;
    window.blaqrecord.extension.backups = {};
    let count = 0;
    while (videoElement.currentTime < duration) {
      await new Promise(resolve => setTimeout(resolve, 500));
      videoElement.currentTime += 0.5;
      const imageInfo = captureVideoImage();
      if (imageInfo) {
        const currentTime = Math.floor(imageInfo.currentTime * 10) / 10;
        const currentTimeStr = currentTime.toFixed(1);
        window.blaqrecord.extension.backups[currentTimeStr] = imageInfo;
        count++;
        log(`캡처 정보 백업 완료: ${currentTimeStr}`);
        chrome.runtime.sendMessage({ 
          action: "updateProgress", 
          status: 'progress', 
          task: 'backup',
          progress: count, 
          total: Math.ceil(duration * 2),
          percentage: Math.round((count / Math.ceil(duration * 2)) * 100)
        });
      }
    }
    chrome.runtime.sendMessage({ 
      action: "updateProgress", 
      status: 'complete', 
      task: 'backup',
      progress: count, 
      total: Math.ceil(duration * 2),
      percentage: 100
    });
    sendResponse({});
  };

  window.blaqrecord.extension.functions.downloadAllBackups = async (sendResponse) => {
    const backups = window.blaqrecord.extension.backups || {};
    if (Object.keys(backups).length === 0) {
      log("!! 백업 정보가 없습니다");
      chrome.runtime.sendMessage({ 
        action: "updateProgress", 
        status: 'error', 
        message: 'No backup information available' 
      });
      sendResponse({});
      return;
    }
    let count = 0;
    const total = Object.keys(backups).length;
    for (const [currentTime, imageInfo] of Object.entries(backups)) {
      downloadImageToFile(imageInfo);
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms 딜레이 추가
      delete backups[currentTime];
      count++;
      log(`다운로드 진행 중: ${count}/${total} (${generateFilename(currentTime)})`);
      chrome.runtime.sendMessage({ 
        action: "updateProgress", 
        status: 'progress', 
        task: 'download',
        progress: count, 
        total: total,
        filename: generateFilename(currentTime),
        percentage: Math.round((count / total) * 100)
      });
    }
    const remainingCount = Object.keys(backups).length;
    log(`모든 백업 정보 다운로드 완료 (남은 정보: ${remainingCount})`);
    chrome.runtime.sendMessage({ 
      action: "updateProgress", 
      status: 'complete', 
      task: 'download',
      progress: count, 
      total: total,
      percentage: 100
    });
    sendResponse({});
  };

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
      case "popupImage":
        window.blaqrecord.extension.functions.popupImage(sendResponse);
        break;
      case "downloadImage":
        window.blaqrecord.extension.functions.downloadImage(sendResponse);
        break;
      case "startAutoBackup":
        window.blaqrecord.extension.functions.startAutoBackup(sendResponse);
        break;
      case "downloadAllBackups":
        window.blaqrecord.extension.functions.downloadAllBackups(sendResponse);
        break;
      case "captureAndSendImage":
        window.blaqrecord.extension.functions.captureAndSendImage(sendResponse);
        break;
      case "togglePlayPause":
        window.blaqrecord.extension.functions.togglePlayPause(sendResponse);
        break;
      case "checkVideoState":
        window.blaqrecord.extension.functions.checkVideoState(sendResponse);
        break;
      case "restartVideo":
        window.blaqrecord.extension.functions.restartVideo(sendResponse);
        break;
      case "prevFrame":
        window.blaqrecord.extension.functions.prevFrame(sendResponse);
        break;
      case "nextFrame":
        window.blaqrecord.extension.functions.nextFrame(sendResponse);
        break;
    }
    return true; // Async response
  });
}
