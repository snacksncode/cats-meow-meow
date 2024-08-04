import "./style.css";

const container = document.querySelector("#container")!;
const pageWidth = window.innerWidth;
const pageHeight = window.innerHeight;
let loadedImagesCount = 0;

if (container == null) throw Error("element with id container is missing. Please add it.");

function getRandomIntInclusive(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

async function getImages() {
  const raw = await fetch(`https://api.thecatapi.com/v1/images/search?limit=10`);
  const data = (await raw.json()) as { url: string }[];
  const urls = data.map((i) => i.url);
  return urls;
}

function spawnCat(x: number, y: number, images: string[], size = 90) {
  const randomIndex = getRandomIntInclusive(0, images.length - 1);
  const randomCatImage = images[randomIndex];

  const cat = document.createElement("div");
  cat.style.backgroundImage = "url('" + randomCatImage + "')";
  cat.classList.add("img");

  container.appendChild(cat);

  cat.style.width = size + "px";
  cat.style.height = size + "px";
  cat.style.left = x - size / 2 + "px";
  cat.style.top = y - size / 2 + "px";

  setTimeout(() => cat.classList.add("show"), 0);
}

async function main() {
  container.innerHTML =
    "<span style='color: lightcoral; margin-bottom: 1rem; font-size: 2rem;'>Loading images...</span>";

  const info = document.createElement("div");
  info.style.color = "#eeeeee";

  const FETCH_CALLS = 10;

  const text = document.createTextNode(`collecting cat images (0 / ${FETCH_CALLS})...`);
  info.appendChild(text);
  container.appendChild(info);

  let successfulCallCount = 0;
  const catImages = await Promise.all(
    Array.from({ length: FETCH_CALLS }).map(async () => {
      const images = await getImages();
      successfulCallCount++;
      info.innerHTML = `collecting cat images (${successfulCallCount} / ${FETCH_CALLS})...`;
      return images;
    })
  ).then((values) => {
    return values.flat();
  });

  catImages.map((url) => {
    const image = new Image();
    image.src = url;
    image.onload = () => {
      loadedImagesCount++;
      if (loadedImagesCount === catImages.length) {
        container.innerHTML = "<span style='color: lightgreen'>Loaded! Now click!</span>";
      } else {
        info.innerHTML = `preloading cat images (${loadedImagesCount} / ${catImages.length})...`;
      }
    };
  });

  let initialClick = true;

  const processClick = (e: MouseEvent | TouchEvent) => {
    if (initialClick) {
      container.innerHTML = "";
      initialClick = false;
    }

    const clickedX = e instanceof MouseEvent ? e.pageX : e.touches[0].pageX;
    const clickedY = e instanceof MouseEvent ? e.pageY : e.touches[0].pageY;

    spawnCat(clickedX, clickedY, catImages);

    for (let i = 0; i < 5; i++) {
      const randomX = getRandomIntInclusive(0, e.view?.innerWidth ?? pageWidth);
      const randomY = getRandomIntInclusive(0, e.view?.innerHeight ?? pageHeight);
      spawnCat(randomX, randomY, catImages);
    }
  };

  //listeners
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("click", processClick);
  document.addEventListener("touchstart", processClick);
}

main();
