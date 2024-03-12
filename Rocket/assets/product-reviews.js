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