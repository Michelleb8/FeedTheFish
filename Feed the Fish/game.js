document.addEventListener("DOMContentLoaded", () => {
  const fish1 = document.querySelector("#row-1 .fish.left");
  const fishImage = fish1.querySelector("img");
  const fish2 = document.querySelector("#row-1 .fish.right");
  const container = document.getElementById("fish-container");

  // 🎧 Sounds
  const failSound = document.getElementById("fail-sound");
  const nomnomSound = document.getElementById("nomnom-sound");
  const winSound = document.getElementById("win-sound");
  const bgMusic = document.getElementById("bg-music");
  bgMusic.volume = 0.4;
  document.addEventListener("click", () => {
    bgMusic.play().catch(() => {});
  }, { once: true });

  const maxPoints = 5;
  const points = Array(14).fill(0);
  const pointDisplay = createPointDisplay();
  container.appendChild(pointDisplay);

  const countdown = document.createElement("div");
  countdown.id = "countdown";
  countdown.className = "countdown-hidden";
  container.appendChild(countdown);

  const food = document.createElement("div");
  food.style.width = "18px";
  food.style.height = "12px";
  food.style.borderRadius = "50% / 40%";
  food.style.backgroundColor = "brown";
  food.style.position = "absolute";
  food.style.zIndex = "5";
  container.appendChild(food);

  let foodVX = 12;
  let foodVY = 6;
  let foodInterval = null;
  let foodX = Math.random() * (container.offsetWidth - 18);
  let foodY = Math.random() * (container.offsetHeight - 100);
  food.style.left = foodX + "px";
  food.style.top = foodY + "px";

  function moveFood() {
    foodX = Math.random() * (container.offsetWidth - 18);
    foodY = Math.random() * (container.offsetHeight - 100);
    food.style.left = foodX + "px";
    food.style.top = foodY + "px";
    foodVX = 10 + Math.random() * 5;
    foodVY = 4 + Math.random() * 4;
  }

  function animateFood() {
    let x = foodX;
    let y = foodY;
    foodInterval = setInterval(() => {
      const maxX = container.offsetWidth - food.offsetWidth;
      const maxY = container.offsetHeight - food.offsetHeight;

      foodVX += (Math.random() - 0.5) * 2;
      foodVY += (Math.random() - 0.5) * 2;
      foodVX = Math.max(Math.min(foodVX, 12), -12);
      foodVY = Math.max(Math.min(foodVY, 8), -8);

      if (x <= 0) foodVX = Math.abs(foodVX);
      if (x >= maxX) foodVX = -Math.abs(foodVX);
      if (y <= 0) foodVY = Math.abs(foodVY);
      if (y >= maxY) foodVY = -Math.abs(foodVY);

      x += foodVX;
      y += foodVY;
      x = Math.max(0, Math.min(maxX, x));
      y = Math.max(0, Math.min(maxY, y));
      food.style.left = x + "px";
      food.style.top = y + "px";

      if (checkCollision(fishImage, food)) {
        nomnomSound.currentTime = 0;
        nomnomSound.play();
        points[0]++;
        updatePoints(0);
        clearInterval(foodInterval);
        showFeedMessageAndRestart();
      }
    }, 16);
  }

  function showFeedMessageAndRestart() {
    countdown.classList.remove("countdown-hidden");
    countdown.textContent = "Feed the Fish!";
    setTimeout(() => {
      countdown.classList.add("countdown-hidden");
      moveFood();
      animateFood();
    }, 1500);
  }

  function updatePoints(index) {
    const display = pointDisplay.children[index];
    const circles = display.querySelectorAll("div:nth-child(2) > div");
    circles.forEach(circle => circle.style.backgroundColor = "transparent");
    for (let i = 0; i < points[index]; i++) {
      circles[i].style.backgroundColor = "brown";
    }
    if (points[index] === maxPoints) {
      winSound.currentTime = 0;
      winSound.play();
    }
  }

  function createPointDisplay() {
    const wrapper = document.createElement("div");
    wrapper.className = "point-display";
    for (let i = 1; i <= 14; i++) {
      const cell = document.createElement("div");
      const label = document.createElement("div");
      label.textContent = i;
      label.style.color = "white";
      label.style.marginBottom = "2px";
      cell.appendChild(label);
      const row = document.createElement("div");
      row.style.display = "flex";
      for (let j = 0; j < maxPoints; j++) {
        const circle = document.createElement("div");
        circle.style.width = "10px";
        circle.style.height = "10px";
        circle.style.borderRadius = "50%";
        circle.style.border = "1px solid brown";
        circle.style.margin = "1px";
        circle.style.backgroundColor = "transparent";
        row.appendChild(circle);
      }
      cell.appendChild(row);
      wrapper.appendChild(cell);
    }
    return wrapper;
  }

  function createBubble() {
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.style.left = Math.random() * window.innerWidth + "px";
    bubble.style.width = 5 + Math.random() * 10 + "px";
    bubble.style.height = bubble.style.width;
    bubble.style.bottom = "-20px";
    document.body.appendChild(bubble);
    let y = 0;
    const speed = 0.5 + Math.random();
    const interval = setInterval(() => {
      y += speed;
      bubble.style.bottom = y + "px";
      if (y > window.innerHeight + 20) {
        clearInterval(interval);
        bubble.remove();
      }
    }, 30);
  }

  setInterval(() => {
    if (document.visibilityState === "visible") createBubble();
  }, 500);

  let position = 0;
  const step = 50;
  let targetPosition = 0;
  let animationFrameId;

  function moveFish(direction) {
    const fishWidth = fish1.offsetWidth;
    const containerWidth = container.offsetWidth;
    targetPosition += direction * step;
    targetPosition = Math.max(0, Math.min(containerWidth - fishWidth, targetPosition));
    if (!animationFrameId) smoothMove();
  }

  function smoothMove() {
    animationFrameId = requestAnimationFrame(() => {
      const currentLeft = parseInt(fish1.style.left || 0, 10);
      const distance = targetPosition - currentLeft;
      const delta = Math.sign(distance) * Math.min(Math.abs(distance), 5);
      if (delta !== 0) {
        fish1.style.left = (currentLeft + delta) + "px";
        if (checkCollision(fish1, fish2)) {
          failSound.currentTime = 0;
          failSound.play();

          if (points[0] > 0) points[0]--;
          if (points[1] > 0) points[1]--;
          updatePoints(0);
          updatePoints(1);

          fish1.style.left = "0px";
          targetPosition = 0;
          animationFrameId = null;
          return;
        }
        smoothMove();
      } else {
        animationFrameId = null;
      }
    });
  }

  function checkCollision(el1, el2) {
    const r1 = el1.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();
    return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
  }

  document.addEventListener("click", e => {
    if (e.clientX < window.innerWidth / 2) moveFish(-1);
    else moveFish(1);
  });

  document.addEventListener("touchstart", e => {
    const touch = e.touches[0];
    if (touch.clientX < window.innerWidth / 2) moveFish(-1);
    else moveFish(1);
  });

  animateFood();
});
