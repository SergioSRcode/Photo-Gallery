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

  renderPhotoInformation(photo_id) {
    let information = document.querySelector("#information");
    let photo = this.photos.find(item => item.id === photo_id);
    let photoInformation = templates.photoInformation(photo);
    information.innerHTML = photoInformation;
  }

  async fetchPhotoComments(photo_id) {
    try {
      let path = `comments?photo_id=${photo_id}`;
      let response = await fetch(this.host + path);
      let comments = await response.json();
      if (!Array.isArray(comments)) throw new Error("Couldn't fetch comments");

      return comments;
    } catch (err) {
      console.error(err);
    }
  }

  async renderPhotoComments(photo_id) {
    let commentSection = document.querySelector("#comments > ul");
    let comments = await this.fetchPhotoComments(photo_id);
    let renderedComments = templates.comments(comments);
    commentSection.innerHTML = renderedComments;
  }

  async init() {
    this.photos = await this.fetchPhotos();
    let activePhotoId = this.photos[0].id;
    this.renderPhotos();
    this.renderPhotoInformation(activePhotoId);
    this.renderPhotoComments(activePhotoId)
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  let gallery = new Gallery();
  await gallery.init();
});