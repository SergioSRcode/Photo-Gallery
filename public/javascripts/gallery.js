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

  async likePhoto() {

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

  setupNavigation(e, prev) {
    e.preventDefault();
    if (e.target === prev) {
      this.decrementId(0);
    } else {
      this.incrementId(this.photosLength);
    }
    this.rerender();
  }

  async incrementAction(e) {
    try {
      e.preventDefault();
      let element = e.target;
      let type = element.dataset.property;
      if (!type) return;

      let dataId = Number(element.dataset.id);
      let url = element.href;
      let text = element.textContent;

      let response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        },
        body: "photo_id=" + dataId,
      });

      let data = await response.json();
      let newTotal = data.total;
      element.textContent = text.replace(/\d+/, newTotal);
      
      let updatedPhoto = this.photos.find(photo => photo.id === dataId);
      updatedPhoto[type] = newTotal;
    } catch (err) {
      console.error(err);
    }
  }

  getURLParams(name, email, comment) {
    let params = new URLSearchParams();
    params.set("photo_id", this.activePhotoId);
    params.set("name", name);
    params.set("email", email);
    params.set("body", comment);

    return params.toString();
  }

  renderNewComment(comment) {
    let commentsList = document.querySelector("#comments ul");
    commentsList.insertAdjacentHTML("beforeend", templates.comment(comment));
  }

  async submitComment(e) {
    try {
      e.preventDefault();
      let form = e.target;
      let path = "comments/new";
      let name = document.querySelector("#name").value;
      let email = document.querySelector("#email").value;
      let comment = document.querySelector("#body").value;
      let query = this.getURLParams(name, email, comment);

      let response = await fetch(this.host + path, {
        method: "POST",
        headers: {
          "Content-Type": 'application/x-www-form-urlencoded; charset=utf-8', 
        },
        body: query,
      });

      let data = await response.json();
      this.renderNewComment(data);
      form.reset();
    } catch (err) {
      console.error(err);
    }
  }

  bind() {
    let prev = document.querySelector(".prev");
    let navigationContainer = prev.parentElement.parentElement;
    let information = document.querySelector("#information");
    let comments = document.querySelector("#comments");
    information.addEventListener("click", (e) => this.incrementAction(e));
    comments.addEventListener("submit", e => this.submitComment(e));
    navigationContainer.addEventListener("click", e => this.setupNavigation(e, prev));
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
    this.bind();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  let gallery = new Gallery();
  await gallery.init();
});