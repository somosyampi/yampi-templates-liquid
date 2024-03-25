class TabComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.tabs = this.querySelectorAll('.tab');
    this.tabsContent = this.querySelectorAll('.tab-content');
    this.tabs.forEach(tab => tab.addEventListener('click', this.handleClick.bind(this)));
  }

  handleClick(event) {
    const index = event.target.closest('.tab').dataset.index;
    const tab = this.tabs[index];
    this.changeTab(index);
    this.changeSliderStyle(index);
  }

  changeTab(index) {
    this.tabs.forEach(tab => tab.classList.remove('active'));
    this.tabsContent.forEach(tab => tab.classList.remove('active'));
    this.tabs[index].classList.add('active');
    this.tabsContent[index].classList.add('active');
  }

  changeSliderStyle(index) {
    const slider = this.querySelector('.active-slider');
    const style = index == 0 
      ? `--active-left: 5px;` 
      : `--active-left: 50%;`;

    slider.style = style;
  }
}

customElements.define('tab-component', TabComponent);

class StarRating extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.rating = 5;
    this.stars = this.querySelectorAll('.star');

    this.stars.forEach(star => star.addEventListener('click', this.handleClick.bind(this)));
  }

  handleClick(event) {
    const goldFill = "#FFC01E";
    const greyFill = "rgba(153, 153, 153, .3)";
    const star = event.target.closest('.star');
    this.rating = star.dataset.index;

    this.stars.forEach((star, index) => {
      if (index + 1 > this.rating) {
        star.querySelector('svg').setAttribute('fill', greyFill);
      } else {
        star.querySelector('svg').setAttribute('fill', goldFill);
      }
    });
  }
}

customElements.define('star-rating', StarRating);

class ModalReview extends ModalDialog {
  constructor() {
    super();
  }

  connectedCallback() {
    this.form = this.querySelector('form');
    this.form.addEventListener('submit', this.onFormSubmit.bind(this));
  }

  onFormSubmit(event) {
    event.preventDefault();
    const button = this.form.querySelector('button[type="submit"]');
    const rating = this.querySelector('star-rating').rating;
    const productId = this.dataset.productId;

    const formData = new FormData(this.form);
    formData.append('rating', rating);
    formData.append('product_id', productId);

    const url = `${window.Yampi.api_domain}/catalog/reviews`;

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: formData
    }).then(response => {
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return response.json();
    }).then(response => {
      button.classList.remove('sending');
    }).catch(error => {
      console.error(error);
    });
  }
}

customElements.define('modal-review', ModalReview);

class MasonryContainer extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const items = this.querySelectorAll('.holder-review');
    items.forEach(item => this.resizeGridItem(item));
  }

  resizeGridItem = (item) => {
    const grid = item.parentElement;
    const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'), 10);
    const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'), 10);
    const rowSpan = Math.ceil((item.querySelector('.review-content').getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
    item.style.gridRowEnd = `span ${rowSpan}`;
  }
}

customElements.define('masonry-container', MasonryContainer);

class ModalQuestion extends ModalDialog {
  constructor() {
    super();
  }

  connectedCallback() {
    this.form = this.querySelector('form');
    this.form.addEventListener('submit', this.onFormSubmit.bind(this));
  }

  onFormSubmit(event) {
    event.preventDefault();
    const button = this.form.querySelector('button[type="submit"]');
    button.classList.add('sending');
    const productId = this.dataset.productId;

    const formData = new FormData(this.form);

    const url = `${window.Yampi.api_domain}/catalog/comments`;

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: formData
    }).then(response => {
      return response.json();
    }).then(response => {
      button.classList.remove('sending');
    });
  }
}

customElements.define('modal-question', ModalQuestion);