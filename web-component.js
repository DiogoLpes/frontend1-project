class sharedFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <span id="item-count" class="text-muted small">0 items</span>
            <button id="clear-completed" class="btn btn-sm btn-outline-danger">Clear Completed</button>
        </div>
        `;
    }
}
customElements.define('shared-component', sharedFooter);
        
   
    