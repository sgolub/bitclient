export async function preloadImage(src): Promise<string> {
  return new Promise((resolve) => {
    const image = document.createElement('img');

    image.onload = () => resolve(src);
    image.onerror = () => resolve(src);

    image.referrerPolicy = 'no-referrer';
    image.src = src;
  });
}