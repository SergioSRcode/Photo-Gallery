import templates from "./templates.js";

class Gallery {
  constructor() {
    // state
    this.host = "http://localhost:3000/";
    this.photos = null;
  }

  async fetchPhotos() {
    try {
      let response = await fetch(this.host + "photos");
      let photos = await response.json();
      if (!Array.isArray(photos) || photos.length === 0) throw new Error("No photos found");
      return photos;
    } catch (err) {
      console.error(err);
    }
  }

  renderPhotos() {
    let slides = document.querySelector("#slides");
    let renderedPhotos = templates.photos(this.photos);
    slides.innerHTML = renderedPhotos;
  }

  renderPhotoInformation(idx) {
    let information = document.querySelector("#information");
    let photo = this.photos.find(item => item.id === idx);
    let photoInformation = templates.photoInformation(photo);
    information.innerHTML = photoInformation;
  }

  async init() {
    this.photos = await this.fetchPhotos();
    let activePhotoId = this.photos[0].id;
    this.renderPhotos();
    this.renderPhotoInformation(activePhotoId);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  let gallery = new Gallery();
  await gallery.init();
});