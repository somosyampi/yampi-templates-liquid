class CategoryDropdown extends HTMLLIElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // Por algum motivo precisa desse delay para conseguir selecionar os elmentos dentro desse componente
    setTimeout(() => {
      if (this.classList.contains('has-subcategory')) {
        this.querySelector('* > a, * > span').addEventListener('click', this.openDropdown.bind(this));
        this.querySelector('.close-dropdown').addEventListener('click', this.closeDropdown.bind(this));
      }
    });
  }

  openDropdown(event) {
    event.preventDefault();
    const dropdown = this.querySelector('.dropdown');
    dropdown.classList.add('is-active');  
  }

  closeDropdown(event) {
    event.stopPropagation();
    const dropdown = this.querySelector('.dropdown');
    dropdown.classList.remove('is-active');
  }
}

customElements.define('category-dropdown', CategoryDropdown, { extends: "li" });