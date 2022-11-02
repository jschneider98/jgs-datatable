class JgsDataTable {
  constructor(container, options, data = []) {
    this.container = container;
    this.options = options;
    this.data = data;
    this.table = {};
    this.currentCell = {};
    this.currentRange = {};
    this.editing = false;

    this.editor = undefined;
    this.dropdown = undefined;

    this.dropdownItems = [];
    this.currentDropdownItems = [];
    this.highlightedItem = undefined;

    this.numRows = data.length;
    this.numCols = this.options.columns.length;

    if (this.options.tableStyle === undefined) {
      this.options.tableStyle = {
        'border-left': '1px solid #ccc',
        'border-top': '1px solid #ccc',
        'border-collapse': 'separate',
        'border-spacing': '0',
        'margin': '0',
        'width': '0',
        'outline-width': '0',
        'cursor': 'default',
        'max-width': 'none',
        'max-height': 'none'
      }
    }

    if (this.options.headerCellStyle === undefined) {
      this.options.headerCellStyle = {
        'background-color': '#f0f0f0',
        'border-right': '1px solid #ccc',
        'border-bottom': '1px solid #ccc',
        'white-space': 'nowrap',
        'text-align': 'center',
        'font-weight': '400',
        'font-size': '13px',
        'color': '#222',
        'padding': '2px 4px',
        'line-height': '21px',
        'font-size': '13px',
        'font-family': '-apple-system, "system-ui", "Segoe UI", Roboto, Oxygen, Ubuntu, "Helvetica Neue", Arial, sans-serif'
      }
    }

    if (this.options.rowHeaderCellStyle === undefined) {
      this.options.rowHeaderCellStyle = {
        'background-color': '#f0f0f0',
        'border-right': '1px solid #ccc',
        'border-bottom': '1px solid #ccc',
        'min-width': '50px',
        'text-align': 'center',
        'font-weight': '400',
        'font-size': '13px',
        'line-height': '21px',
        'font-family': '-apple-system, "system-ui", "Segoe UI", Roboto, Oxygen, Ubuntu, "Helvetica Neue", Arial, sans-serif'
      }
    }

    if (this.options.rowCellStyle === undefined) {
      this.options.rowCellStyle = {
        'background-color': '#fff',
        'border-top': '1px solid transparent',
        'border-left': '1px solid transparent',
        'border-right': '1px solid #ccc',
        'border-bottom': '1px solid #ccc',
        'white-space': 'nowrap',
        'empty-cells': 'show',
        'text-align': 'left',
        'height': '22px',
        'line-height': '21px',
        'font-size': '13px',
        'font-family': '-apple-system, "system-ui", "Segoe UI", Roboto, Oxygen, Ubuntu, "Helvetica Neue", Arial, sans-serif',
        'overflow': 'hidden',
        'padding': '0 4px'
      }
    }

    if (this.options.rowCellHighlightStyle === undefined) {
      this.options.rowCellHighlightStyle = {
        'background-color': 'rgba(75, 137, 255, 0.1)',
        'border': '1px solid #4b89ff'
      }
    }

    if (this.options.editorStyle === undefined) {
      this.options.editorStyle = {
        'border': 'none',
        'height': '22px',
        'line-height': '21px',
        'font-size': '13px',
        'font-family': '-apple-system, "system-ui", "Segoe UI", Roboto, Oxygen, Ubuntu, "Helvetica Neue", Arial, sans-serif',
        'resize': 'none',
        'width': '1000px',
        'overflow-y': 'hidden',
        'border': 'none',
        'overflow': 'auto',
        'outline': 'none',
        '-webkit-box-shadow': 'none',
        '-moz-box-shadow': 'none',
        'box-shadow': 'none',
        'background-color': 'transparent'
      }
    }

    if (this.options.dropdownStyle === undefined) {
      this.options.dropdownStyle = {
        'background-color': '#fff',
        'border': '1px solid #ccc',
        'white-space': 'nowrap',
        'overflow': 'hidden',
        'line-height': '21px',
        'font-size': '13px',
        'font-family': '-apple-system, "system-ui", "Segoe UI", Roboto, Oxygen, Ubuntu, "Helvetica Neue", Arial, sans-serif',
        'z-index': '200'
      }
    }

    if (this.options.dropdownItemStyle === undefined) {
      this.options.dropdownItemStyle = {
        'cursor': 'default',
        'background-color': '#fff',
        // 'border-bottom': '1px solid #ccc',
        'white-space': 'nowrap',
        'overflow': 'hidden',
        'line-height': '21px',
        'font-size': '13px',
        'font-family': '-apple-system, "system-ui", "Segoe UI", Roboto, Oxygen, Ubuntu, "Helvetica Neue", Arial, sans-serif',
        'z-index': '200',
        'padding': '0 4px'
      }
    }

    this.toHtml();
  }

  //
  checkClickOutside(event) {
    let target = event.target;

    do {
      if (target == this.container) {
        return;
      }

      target = target.parentNode;
    } while (target);

    // clicked outside
    this.deactivateCurrentCell();
  }

  //
  doKeyLogic(event) {
    let forceSelect = false;
    let key = event.key;

    if (this.currentCell.dataset === undefined) {
      return;
    }

    if (key === 'Escape') {
      if (this.editing === true) {
        this.selectCell(this.currentCell);
        return;
      }
    }

    if (key === 'Enter') {
      if (this.editing === false) {
        this.editCell(this.currentCell);
        return;
      }

      if (this.dropdown !== undefined && this.highlightedItem !== undefined) {
        this.editor.value = this.highlightedItem.innerHTML;
      }

      forceSelect = true;
      key = 'ArrowDown';
    }

    if (key === 'Tab') {
      event.preventDefault();

      forceSelect = true;
      key = 'ArrowRight';

      if (this.dropdown !== undefined && this.highlightedItem !== undefined) {
        this.editor.value = this.highlightedItem.innerHTML;
      }

      if (event.shiftKey) {
        key = 'ArrowLeft';
      }
    }

    if (this.editing === true && forceSelect === false) {

      if (this.dropdown === undefined) {
        return;
      }

      if (key === 'ArrowDown') {

        if (this.highlightedItem === undefined) {
          this.highlightItemByIndex(0);
        }

        this.highlightItemByIndex(this.highlightedItem.dataset.index*1 + 1);
      }

      if (key === 'ArrowUp') {

        if (this.highlightedItem === undefined) {
          return;
        }

        this.highlightItemByIndex(this.highlightedItem.dataset.index*1 - 1);
      }

      return;
    }

    const rowIndex = this.currentCell.dataset.rowIndex*1;
    const colIndex = this.currentCell.dataset.colIndex*1;

    let newRowIndex = undefined;
    let newColIndex = undefined;

    switch (key) {
      case 'ArrowUp':
        if (rowIndex - 1 >= 0) {
          newRowIndex = rowIndex - 1;
          newColIndex = colIndex;
        }
        break;
      case 'ArrowDown':
        if (rowIndex + 1 < this.numRows) {
          newRowIndex = rowIndex + 1;
          newColIndex = colIndex;
        }
        break;
      case 'ArrowLeft':
        if (colIndex - 1 >= 0) {
          newColIndex = colIndex - 1;
          newRowIndex = rowIndex;
        }
        break;
      case 'ArrowRight':
        if (colIndex + 1 < this.numCols) {
          newColIndex = colIndex + 1;
          newRowIndex = rowIndex;
        }
        break;
    }

    if ((newRowIndex === undefined || newColIndex === undefined) && forceSelect === false) {
      return;
    }

    if (newRowIndex === undefined) {
      newRowIndex = rowIndex;
    }

    if (newColIndex === undefined) {
      newColIndex = colIndex;
    }

    const cell = this.getCell(newRowIndex, newColIndex);

    if (cell === undefined || cell === null) {
      return;
    }

    this.selectCell(cell);
  }

  //
  toHtml() {
    this.table = document.createElement('table');
    this.table.id = this.container.id + '-table';
    this.setElementStyle(this.table, this.options.tableStyle);

    this.editor = document.createElement('input');
    this.setElementStyle(this.editor, this.options.editorStyle);

    document.addEventListener('keydown', (event) => { this.doKeyLogic(event); });
    document.addEventListener('click', (event) => { this.checkClickOutside(event); });

    let tr = this.table.insertRow();

    if (this.options.rowHeaders === true) {
      tr.appendChild(this.createHeaderCell(''));
    }

    for (let value of this.options.colHeaders) {
      tr.appendChild(this.createHeaderCell(value));
    }

    for (let rowIndex = 0; rowIndex < this.data.length; rowIndex++) {
      const tr = this.table.insertRow();

      tr.dataset.rowIndex = rowIndex;

      if (this.options.rowHeaders === true) {
        const rowNum = rowIndex + 1;

        this.insertRowHeaderCell(tr, rowNum);
      }

      for (let colIndex = 0; colIndex < this.data[rowIndex].length; colIndex++) {
        this.insertRowCell(tr, rowIndex, colIndex, this.data[rowIndex][colIndex]);
      }
    }

    this.container.appendChild(this.table);
    this.container.style['position'] = 'relative';
  }

  //
  createHeaderCell(value = '') {
    const th = document.createElement('th');
    this.setElementStyle(th, this.options.headerCellStyle);

    th.innerHTML = value;

    return th;
  }

  //
  insertRowHeaderCell(tr, value = '') {
    const td = tr.insertCell();

    this.setElementStyle(td, this.options.rowHeaderCellStyle);
    td.innerHTML = value;

    return td;
  }

  //
  insertRowCell(tr, rowIndex = 0, colIndex = 0, value = '') {
    const td = tr.insertCell();

    td.dataset.rowIndex = rowIndex;
    td.dataset.colIndex = colIndex;

    this.setElementStyle(td, this.options.rowCellStyle);
    this.addCustomCellStyle(td, colIndex);

    td.innerHTML = value;

    td.addEventListener('click', () => { this.cellOnClick(td); });
    td.addEventListener('dblclick', () => { this.cellOnDblClick(td); });

    return td;
  }

  //
  cellOnClick(cell) {
    if (cell === this.currentCell && this.editing === true) {
      return;
    }

    this.selectCell(cell);
  }

  //
  cellOnDblClick(cell) {
    if (cell === this.currentCell && this.editing === true) {
      return;
    }

    this.editCell(cell);
  }

  //
  selectCell(cell) {
    // console.log(cell.dataset.rowIndex, cell.dataset.colIndex);

    this.deactivateCurrentCell();

    this.currentCell = cell;
    this.addElementStyle(this.currentCell, this.options.rowCellHighlightStyle);
  }

  //
  editCell(cell) {
    if (cell === undefined) {
      return;
    }

    this.editing = true;

    if (cell !== this.currentCell) {
      this.selectCell(cell);
    }

    this.editor.value = cell.innerHTML;
    this.editor.dataset.prevValue = this.editor.value;
    cell.innerHTML = '';

    cell.appendChild(this.editor);
    this.editor.focus();

    this.initDropdown(cell);
  }

  //
  deactivateCurrentCell() {
    if (this.dropdown !== undefined) {
      this.dropdown.remove();
      this.dropdown = undefined;
    }

    if (this.currentCell.dataset === undefined) {
      return;
    }

    if (this.editing) {
      // Timeout used because Chrome does some weird render caching.
      this.currentCell.innerHTML = '';

      const cell = this.currentCell;
      const tmpVal = this.editor.value;

      this.data[cell.dataset.rowIndex][cell.dataset.colIndex] = tmpVal;

      setTimeout(() => {
        cell.innerHTML = tmpVal;
      }, "10");

    }

    this.setElementStyle(this.currentCell, this.options.rowCellStyle);
    this.addCustomCellStyle(this.currentCell, this.currentCell.dataset.colIndex);

    this.editing = false;
    this.currentCell = {}
  }

  //
  initDropdown(cell) {

    if (cell === undefined) {
      return;
    }

    const index = cell.dataset.colIndex*1;

    this.dropdownItems = [];

    if (
      this.options.columns[index].type !== undefined
      && this.options.columns[index].type === 'autocomplete'
      && this.options.columns[index].source !== undefined
      ) {

      this.dropdown = document.createElement('div');

      const cellBox = cell.getBoundingClientRect();
      const containerBox = this.container.getBoundingClientRect();
      const top = cellBox.bottom - containerBox.top ;
      const left = cellBox.left - containerBox.left;

      this.setElementStyle(this.dropdown, this.options.dropdownStyle);

      this.dropdown.style['position'] = 'absolute';
      this.dropdown.style['top'] = top + 'px';
      this.dropdown.style['left'] = left + 'px';
      this.dropdown.style['width'] = cellBox.right - cellBox.left + 'px';

      for (let value of this.options.columns[index].source) {
        this.dropdownItems.push(value);
      }

      this.editor.addEventListener('keyup', () => {
        if (this.editor.value !== this.editor.dataset.prevValue) {
          this.editor.dataset.prevValue = this.editor.value;
          this.filterDropdown();
        }
      });

      this.filterDropdown();
    }
  }

  //
  filterDropdown() {

    if (this.dropdown === undefined) {
      return;
    }

    const searchValue = this.editor.value.toLowerCase();
    this.currentDropdownItems = [];
    this.highlightedItem = undefined;

    this.dropdown.innerHTML = '';

    for (let value of this.dropdownItems) {
      const lowerValue = value.toLowerCase();

      if (lowerValue.includes(searchValue)) {
        this.currentDropdownItems.push(value);

        const item = document.createElement('div');

        item.innerHTML = value;
        item.dataset.index = this.currentDropdownItems.length - 1;

        this.setElementStyle(item, this.options.dropdownItemStyle);

        item.addEventListener('click', () => {
          this.editor.value = item.innerHTML;
          const currentCell = this.currentCell;

          setTimeout(() => {
            this.selectCell(currentCell);
          }, "10");
        });

        item.addEventListener('mouseover', () => {
          this.highlightItem(item);
        });

        item.addEventListener('mouseout', () => {
          this.unhighlightItem(item);
        });

        this.dropdown.appendChild(item);
      }
    }

    if (this.currentDropdownItems.length === 1) {
      this.highlightItemByIndex(0);
    }

    this.container.appendChild(this.dropdown);
  }

  //
  highlightItemByIndex(index) {

    if (this.dropdown === undefined || index === undefined) {
      return;
    }

    if (index < 0 || index >= this.currentDropdownItems.length) {
      return;
    }

    const newItem = this.dropdown.querySelector(`div[data-index="${index}"]`);

    if (newItem === null) {
      return;
    }

    const items = this.dropdown.querySelectorAll('div');

    for (let item of items) {
      this.unhighlightItem(item);
    }

    this.highlightItem(newItem);
  }

  //
  highlightItem(item) {
    if (item === undefined || item === null) {
      return;
    }

    // highlight item
    let color = '#f0f0f0';

    if (this.options.headerCellStyle['background-color'] !== undefined) {
      color = this.options.headerCellStyle['background-color'];
    }

    item.style['background-color'] = color;

    this.highlightedItem = item;
  }

  //
  unhighlightItem(item) {
    if (item === undefined || item === null) {
      return;
    }

    let color = '#fff';

    if (this.options.dropdownItemStyle['background-color'] !== undefined) {
      color = this.options.dropdownItemStyle['background-color'];
    }

    item.style['background-color'] = color;
  }

  //
  setElementStyle(element, style) {
    element.style = [];

    for (const property in style) {
      element.style[property] = style[property];
    }
  }

  //
  addElementStyle(element, style) {
    for (const property in style) {
      element.style[property] = style[property];
    }
  }

  //
  addCustomCellStyle(element, colIndex) {
    if (this.options.columns !== undefined && this.options.columns[colIndex] !== undefined && this.options.columns[colIndex].style !== undefined) {
      this.addElementStyle(element, this.options.columns[colIndex].style);
    }
  }

  //
  getCell(rowIndex = 0, colIndex = 0) {
    return this.table.querySelector(`td[data-row-index="${rowIndex}"][data-col-index="${colIndex}"]`);
  }
}
