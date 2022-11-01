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
        'border-top-width': '0',
        'border-left-width': '0',
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
        // 'background-color': 'rgba(75, 137, 255, 0.25)',
        'border': '2px solid #4b89ff'
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

    this.toHtml();
  }

  //
  checkClickOutside(self, event) {
    let target = event.target;

    do {
      if (target == self.table) {
        return;
      }

      target = target.parentNode;
    } while (target);

    // clicked outside
    self.deactivateCurrentCell();
  }

  //
  doKeyup(self, event) {
    let forceSelect = false;
    let key = event.key;

    if (self.currentCell.dataset === undefined) {
      return;
    }

    if (key === 'Escape') {
      if (self.editing === true) {
        this.selectCell(self.currentCell);
        return;
      }
    }

    if (key === 'Enter') {
      if (self.editing === false) {
        self.editCell(self.currentCell);
        return;
      }

      forceSelect = true;
      key = 'ArrowDown';
    }

    if (key === 'Tab') {
      event.preventDefault();
      forceSelect = true;
      key = 'ArrowRight';

      if (event.shiftKey) {
        key = 'ArrowLeft';
      }
    }

    if (self.editing === true && forceSelect === false) {
      return;
    }

    const rowIndex = self.currentCell.dataset.rowIndex*1;
    const colIndex = self.currentCell.dataset.colIndex*1;

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

    const cell = self.getCell(newRowIndex, newColIndex);

    if (cell === undefined || cell === null) {
      return;
    }

    self.selectCell(cell);
  }

  //
  toHtml() {
    this.table = document.createElement('table');
    this.table.id = this.container.id + '-table';
    this.setElementStyle(this.table, this.options.tableStyle);

    this.editor = document.createElement('input');
    this.setElementStyle(this.editor, this.options.editorStyle);

    document.addEventListener('keydown', (event) => { this.doKeyup(this, event); });
    document.addEventListener('click', (event) => { this.checkClickOutside(this, event); });

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
    cell.innerHTML = '';

    cell.appendChild(this.editor);

    const index = cell.dataset.colIndex*1;

    if (this.options.columns[index].type !== undefined && this.options.columns[index].type === 'autocomplete') {
      this.dropdown = document.createElement('div');

      const rect = cell.getBoundingClientRect();
      console.log(rect);

      this.dropdown.innerHTML = '<div>test 1</div><div>test 2</div>';
      this.dropdown.style['position'] = 'fixed';
      this.dropdown.style['top'] = rect.bottom + 'px';
      this.dropdown.style['left'] = rect.left + 'px';
      this.dropdown.style['background-color'] = '#fff';
      this.dropdown.style['border'] = '1px solid #ccc';
      this.dropdown.style['white-space'] = 'nowrap';
      this.dropdown.style['overflow'] = 'hidden';
      this.dropdown.style['width'] = rect.right - rect.left + 'px';

      document.body.appendChild(this.dropdown);
    }

    this.editor.focus();
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
