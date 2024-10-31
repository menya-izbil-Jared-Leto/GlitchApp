const upload = document.getElementById('upload');
const stratificationUpload = document.getElementById('stratification-upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let img = new Image();
let stratificationImg = new Image();
let blackPoint = 0;
let whitePoint = 255;
let gamma = 1;

upload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    img.src = event.target.result;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
  };
  reader.readAsDataURL(file);
});

stratificationUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    stratificationImg.src = event.target.result;
    stratificationImg.onload = () => {
      applyEffects();
    };
  };
  reader.readAsDataURL(file);
});

const blurSlider = document.getElementById('blur-slider');
const grainSlider = document.getElementById('grain-slider');
const sizeSlider = document.getElementById('size-slider');
const distortionThreshold = document.getElementById('distortion-threshold');
const xDistortionStrength = document.getElementById('x-distortion-strength');
const yDistortionStrength = document.getElementById('y-distortion-strength');
const stratificationThreshold = document.getElementById('stratification-threshold');
const xStratificationStrength = document.getElementById('x-stratification-strength');
const yStratificationStrength = document.getElementById('y-stratification-strength');
const ditheringSlider = document.getElementById('dithering-slider');
const blackPointSlider = document.getElementById('blackPointSlider');
const whitePointSlider = document.getElementById('whitePointSlider');
const gammaSlider = document.getElementById('gammaSlider');

const sliders = [
  blurSlider,
  grainSlider,
  sizeSlider,
  distortionThreshold,
  xDistortionStrength,
  yDistortionStrength,
  stratificationThreshold,
  xStratificationStrength,
  yStratificationStrength,
  ditheringSlider,
  blackPointSlider,
  whitePointSlider,
  gammaSlider
];

sliders.forEach(slider => slider.addEventListener('input', applyEffects));


// Effects
function applyEffects() {
  const scale = sizeSlider.value / 100;
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  ctx.filter = `blur(${blurSlider.value}px)`;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  if (grainSlider.value > 0) {
    addGrain(data, grainSlider.value);
  }
  if (stratificationImg.src) {
    applyStratification(data);
  }
  if (distortionThreshold.value > 0) {
    applyDistortion(data);
  }
  if (ditheringSlider.value > 0) {
    applyDithering(data, ditheringSlider.value);
  }

  applyBlackAndWhitePoint(data, blackPoint, whitePoint);
  applyGammaCorrection(data, gamma);

  ctx.putImageData(imageData, 0, 0);
}

// Black And White Point
function applyBlackAndWhitePoint(data, blackPoint, whitePoint) {
  const scale = 255 / (whitePoint - blackPoint);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, (data[i] - blackPoint) * scale)); // Red
    data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - blackPoint) * scale)); // Green
    data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - blackPoint) * scale)); // Blue
  }
}

// Gamma
function applyGammaCorrection(data, gamma) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 * Math.pow(data[i] / 255, gamma); // Red
    data[i + 1] = 255 * Math.pow(data[i + 1] / 255, gamma); // Green
    data[i + 2] = 255 * Math.pow(data[i + 2] / 255, gamma); // Blue
  }
}

// Обработчики для обновления черных и белых точек и гамма-коррекции
function updateBlackPoint() {
  blackPoint = document.getElementById("blackPointSlider").value;
  applyEffects();
}

function updateWhitePoint() {
  whitePoint = document.getElementById("whitePointSlider").value;
  applyEffects();
}

function updateGamma() {
  gamma = document.getElementById("gammaSlider").value;
  applyEffects();
}

// Grain
function addGrain(data, amount) {
  for (let i = 0; i < data.length; i += 4) {
    const rand = (Math.random() - 0.5) * amount * 255;
    data[i] += rand;     // Red
    data[i + 1] += rand; // Green
    data[i + 2] += rand; // Blue
  }
}

// Distortion
function applyDistortion(data) {
  const threshold = distortionThreshold.value;
  const xStrength = xDistortionStrength.value;
  const yStrength = yDistortionStrength.value;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const index = (y * canvas.width + x) * 4;
      const offsetX = Math.sin(y / threshold) * xStrength;
      const offsetY = Math.cos(x / threshold) * yStrength;
      const newX = Math.min(canvas.width - 1, Math.max(0, x + offsetX));
      const newY = Math.min(canvas.height - 1, Math.max(0, y + offsetY));
      const newIndex = (Math.floor(newY) * canvas.width + Math.floor(newX)) * 4;

      data[index] = data[newIndex];
      data[index + 1] = data[newIndex + 1];
      data[index + 2] = data[newIndex + 2];
    }
  }
}

// Stratification
function applyStratification(data) {
  const stratificationCanvas = document.createElement('canvas');
  const stratificationCtx = stratificationCanvas.getContext('2d');
  stratificationCanvas.width = stratificationImg.width;
  stratificationCanvas.height = stratificationImg.height;
  stratificationCtx.drawImage(stratificationImg, 0, 0);
  const stratificationData = stratificationCtx.getImageData(0, 0, stratificationImg.width, stratificationImg.height).data;
  const threshold = stratificationThreshold.value;
  const xStrength = xStratificationStrength.value;
  const yStrength = yStratificationStrength.value;
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const index = (y * canvas.width + x) * 4;
      const stratificationIndex = ((y % stratificationImg.height) * stratificationImg.width + (x % stratificationImg.width)) * 4;
      const stratificationValue = (stratificationData[stratificationIndex] + stratificationData[stratificationIndex + 1] + stratificationData[stratificationIndex + 2]) / 3;

      if (stratificationValue > threshold) {
        const offsetX = (stratificationValue / 255 - 0.5) * xStrength;
        const offsetY = (stratificationValue / 255 - 0.5) * yStrength;
        const newX = Math.min(canvas.width - 1, Math.max(0, x + offsetX));
        const newY = Math.min(canvas.height - 1, Math.max(0, y + offsetY));
        const newIndex = (Math.floor(newY) * canvas.width + Math.floor(newX)) * 4;
        data[index] = data[newIndex];
        data[index + 1] = data[newIndex + 1];
        data[index + 2] = data[newIndex + 2];
      }
    }
  }
}

// Dithering
function applyDithering(data, amount) {
  const width = canvas.width;
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      let oldR = data[i];
      let oldG = data[i + 1];
      let oldB = data[i + 2];
      let newR = Math.round(oldR / amount) * amount;
      let newG = Math.round(oldG / amount) * amount;
      let newB = Math.round(oldB / amount) * amount;
      data[i] = newR;
      data[i + 1] = newG;
      data[i + 2] = newB;
      let errR = oldR - newR;
      let errG = oldG - newG;
      let errB = oldB - newB;
      if (x + 1 < width) {
        data[i + 4] += errR * 7 / 16;
        data[i + 5] += errG * 7 / 16;
        data[i + 6] += errB * 7 / 16;
      }
      if (y + 1 < canvas.height) {
        if (x > 0) {
          data[i + (width - 1) * 4] += errR * 3 / 16;
          data[i + (width - 1) * 4 + 1] += errG * 3 / 16;
          data[i + (width - 1) * 4 + 2] += errB * 3 / 16;
        }
        data[i + width * 4] += errR * 5 / 16;
        data[i + width * 4 + 1] += errG * 5 / 16;
        data[i + width * 4 + 2] += errB * 5 / 16;
        if (x + 1 < width) {
          data[i + (width + 1) * 4] += errR * 1 / 16;
          data[i + (width + 1) * 4 + 1] += errG * 1 / 16;
          data[i + (width + 1) * 4 + 2] += errB * 1 / 16;
        }
      }
    }
  }
}

// Save
document.getElementById('save').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'edited-image.png';
  link.href = canvas.toDataURL();
  link.click();
});
