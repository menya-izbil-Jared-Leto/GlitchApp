const upload = document.getElementById('upload');
const stratificationUpload = document.getElementById('stratification-upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let img = new Image();
let stratificationImg = new Image();

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

blurSlider.addEventListener('input', applyEffects);
grainSlider.addEventListener('input', applyEffects);
sizeSlider.addEventListener('input', applyEffects);
distortionThreshold.addEventListener('input', applyEffects);
xDistortionStrength.addEventListener('input', applyEffects);
yDistortionStrength.addEventListener('input', applyEffects);
stratificationThreshold.addEventListener('input', applyEffects);
xStratificationStrength.addEventListener('input', applyEffects);
yStratificationStrength.addEventListener('input', applyEffects);

function applyEffects() {
  const scale = sizeSlider.value / 100;
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  ctx.filter = `blur(${blurSlider.value}px)`;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  if (grainSlider.value > 0) {
    addGrain(grainSlider.value);
  }
  if (stratificationImg.src) {
    applyStratification();
  }
  applyDistortion();
}

function addGrain(amount) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const rand = (Math.random() - 0.5) * amount * 255;
    data[i] += rand;     // Red
    data[i + 1] += rand; // Green
    data[i + 2] += rand; // Blue
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyDistortion() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
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
    ctx.putImageData(imageData, 0, 0);
  }

function applyStratification() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const stratificationData = ctx.getImageData(0, 0, stratificationImg.width, stratificationImg.height).data;
  const threshold = stratificationThreshold.value;
  const xStrength = xStratificationStrength.value;
  const yStrength = yStratificationStrength.value;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const index = (y * canvas.width + x) * 4;
      const stratificationIndex = ((y % stratificationImg.height) * stratificationImg.width + (x % stratificationImg.width)) * 4;
      const stratificationValue = (stratificationData[stratificationIndex] + stratificationData[stratificationIndex + 1] + stratificationData[stratificationIndex + 2]) / 3;
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
  ctx.putImageData(imageData, 0, 0);
}

document.getElementById('save').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'edited-image.png';
  link.href = canvas.toDataURL();
  link.click();
});
