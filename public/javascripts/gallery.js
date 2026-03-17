import templates from "./templates.js";

class Gallery {
  constructor() {
    // state
    this.host = "http://localhost:3000/";
    this.photos = null;
    this.activePhotoId = null;
    this.photosLength = null;
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

  renderPhotoInformation() {
    let information = document.querySelector("#information");
    let photo = this.photos.find(item => item.id === this.activePhotoId);
    let photoInformation = templates.photoInformation(photo);
    information.innerHTML = photoInformation;
  }

  async fetchPhotoComments() {
    try {
      let path = `comments?photo_id=${this.activePhotoId}`;
      let response = await fetch(this.host + path);
      let comments = await response.json();
      if (!Array.isArray(comments)) throw new Error("Couldn't fetch comments");

      return comments;
    } catch (err) {
      console.error(err);
    }
  }

  async renderPhotoComments() {
    let commentSection = document.querySelector("#comments > ul");
    let comments = await this.fetchPhotoComments(this.activePhotoId);
    let renderedComments = templates.comments(comments);
    commentSection.innerHTML = renderedComments;
  }

  displayActivePhoto() {
    let slides = Array.from(document.querySelector("#slides").children);

    slides.forEach(photo => {
      if (Number(photo.dataset.id) === this.activePhotoId) {
        if (!photo.classList.contains("active")) {
          photo.classList.add("active");
        }
      } else {
        if (photo.classList.contains("active")) {
          photo.classList.remove("active");
        }
      }
    });
  }

  decrementId(min = 0) {
    this.activePhotoId -= 1;
    if (this.activePhotoId <= min) {
      this.activePhotoId = 3;
    }
  }

  incrementId(max) {
    this.activePhotoId += 1;
    if (this.activePhotoId > max) {
      this.activePhotoId = 1;
    }
  }

  setupNavigation() {
    let prev = document.querySelector(".prev");
    let navigationContainer = prev.parentElement.parentElement;

    navigationContainer.addEventListener("click", e => {
      e.preventDefault();
      if (e.target === prev) {
        this.decrementId(0);
      } else {
        this.incrementId(this.photosLength);
      }

      this.rerender();
    });
  }

  rerender() {
    this.renderPhotoInformation();
    this.renderPhotoComments();
    this.displayActivePhoto();
  }

  async init() {
    this.photos = await this.fetchPhotos();
    this.activePhotoId = this.photos[0].id;
    this.photosLength = this.photos.length;
    this.renderPhotos();
    this.renderPhotoInformation();
    this.renderPhotoComments();
    this.displayActivePhoto();
    this.setupNavigation();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  let gallery = new Gallery();
  await gallery.init();
});