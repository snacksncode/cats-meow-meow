import "./style.css";

const container = document.querySelector("#container")!;
const pageWidth = window.innerWidth;
const pageHeight = window.innerHeight;

if (container == null) throw Error("element with id container is missing. Please add it.");

function getRandomIntInclusive(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

async function getImages() {
  const info = document.createElement("div");
  info.style.color = "gray";

  const text = document.createTextNode(`collecting cat images...`);
  info.appendChild(text);
  container.appendChild(info);

  const raw = await fetch("https://api.thecatapi.com/v1/images/search");

  info.style.color = "lightgreen";

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
    "<span style='color: lightcoral; margin-bottom: 2rem; font-size: 2rem;'>Loading images...</span>";

  const catImages = await Promise.all(
    Array.from({ length: 5 }).map(async () => {
      return await getImages();
    })
  ).then((values) => {
    return values.flat();
  });

  container.innerHTML = "<span style='color: lightgreen'>Loaded! Now click!</span>";

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
