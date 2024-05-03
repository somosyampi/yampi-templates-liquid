class SliderComponent extends HTMLElement {
  constructor() {
    super();
    this.carousel = this.querySelector('.carousel');
    this.sliderItems = this.carousel.querySelectorAll('.carousel-item');
    this.nextButton = this.querySelector('.next-button');
    this.prevButton = this.querySelector('.prev-button');

    this.carousel.addEventListener('scroll', this.updateSlide.bind(this));
    this.nextButton.addEventListener('click', this.handleButtonClick.bind(this));
    this.prevButton.addEventListener('click', this.handleButtonClick.bind(this));

    this.navItems = document.querySelectorAll('.carousel-thumbs .thumb-item');
    this.navItems.forEach((item) => item.addEventListener('click', this.handleNavClick.bind(this)));

    const dots = this.querySelectorAll('.dots .dot');

    dots.forEach((dot) => dot.addEventListener('click', this.handleDotClick.bind(this)));

    this.init();

    const resizeObserver = new ResizeObserver((entries) => {
      this.init();
    });

    resizeObserver.observe(this.carousel);
  }

  init() {
    if (this.sliderItems.length === 1) {
      this.offset = this.sliderItems[0].offsetWidth;
    } else {
      this.offset = this.sliderItems[1].offsetLeft - this.sliderItems[0].offsetLeft;
    }

    this.actualSlide = 0;
    this.updateSlide();
  }

  handleButtonClick(event) {
    const position = event.currentTarget.name === 'next'
      ? this.carousel.scrollLeft + this.offset
      : this.carousel.scrollLeft - this.offset;

    this.showSlide(position);
  }

  handleNavClick(event) {
    const position = event.currentTarget.dataset.index * this.offset;
    this.showSlide(position);
  }

  showSlide(position) {
    this.carousel.scrollTo({
      left: position,
    });
  }

  updateSlide() {
    this.actualSlide = Math.round(this.carousel.scrollLeft / this.offset);

    const dots = this.querySelectorAll('.dots .dot');
    dots.forEach(dot => dot.classList.remove('is-active'));
    dots[this.actualSlide].classList.add('is-active');

    this.sliderItems.forEach(item => item.classList.remove('is-active'));
    this.sliderItems[this.actualSlide].classList.add('is-active');
    this.blockNavigationButtons();

    this.querySelector('.total-images-indicator .active').textContent = this.actualSlide + 1;
  }

  blockNavigationButtons() {
    if (this.actualSlide === 0) {
      this.prevButton.setAttribute('disabled', 'disabled');
    } else {
      this.prevButton.removeAttribute('disabled');
    }

    if (this.actualSlide === this.sliderItems.length - 1) {
      this.nextButton.setAttribute('disabled', 'disabled');
    } else {
      this.nextButton.removeAttribute('disabled');
    }
  }

  handleDotClick(event) {
    const index = parseInt(event.target.dataset.index);
    const position = this.offset * index;

    this.showSlide(position);
  }
}

customElements.define('slider-component', SliderComponent);

class CarouselComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.element = this;
    this.totalWidth = this.scrollWidth;
    this.elementsPerPage = this.dataset.items;
    this.margin = this.dataset.margin;

    this.items = this.querySelectorAll('.box-product-wrapper');
    this.carousel = this.querySelector('.carousel-track');
    this.nextButton = this.querySelector('.next-button');
    this.prevButton = this.querySelector('.prev-button');

    this.carousel.addEventListener('scroll', this.scrollTrack.bind(this));
    this.nextButton.addEventListener('click', this.handleButtonClick.bind(this));
    this.prevButton.addEventListener('click', this.handleButtonClick.bind(this));

    this.setItemsSize();
    window.addEventListener('resize', debounce(this.setItemsSize.bind(this), 500));

    this.counter = 0;
  }

  setItemsSize() {
    if (window.innerWidth <= 700) {
      this.elementsPerPage = 2;
      this.margin = '12px';
    }

    const marginOffset = parseInt(this.margin) * (this.elementsPerPage - 1);

    this.items.forEach(item => {
      const width = parseInt(this.element.parentElement.clientWidth - marginOffset) / this.elementsPerPage;
      item.style.width = `${width}px`;
      item.style.marginRight = this.margin;
    });
  }

  handleButtonClick(event) {
    const direction = event.currentTarget.name === 'next'
      ? 'RIGHT'
      : 'LEFT';
    this.scrollTrack(direction);
  }

  getTranslateAmount(direction) {
    const carousel = document.querySelector("carousel-component");
    const carouselItems = carousel.querySelectorAll(".carousel-track .box-product-wrapper");
    const carouselWidth = carousel.offsetWidth;
    let firstHiddenElement = null;

    if (direction === 'RIGHT') {
      if (this.counter >= Math.floor(carouselItems.length / 4)) {
        return;
      }
      this.counter++;
    } else {
      if (this.counter <= 0) {
        return
      }
      this.counter--;
    }

    for (const item of Array.from(carouselItems)) {
      const width = item.offsetWidth;
      const offset = item.offsetLeft;

      if (offset + width > carouselWidth) {
        firstHiddenElement = item;
        break;
      }
    }

    const translateAmount = firstHiddenElement.offsetLeft * this.counter;

    return translateAmount;
  }

  scrollTrack(direction) {
    const translateAmount = this.getTranslateAmount(direction);
    this.carousel.style.transform = `translateX(-${translateAmount}px)`;
  }
}

customElements.define('carousel-component', CarouselComponent);