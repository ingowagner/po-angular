import { ElementRef, SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { PoControlPositionService } from '../../services/po-control-position/po-control-position.service';
import { PoIconModule } from '../po-icon';
import { PoListBoxModule } from '../po-listbox';
import { PoSearchFilterMode } from './enums/po-search-filter-mode.enum';
import { PoSearchFilterSelect } from './interfaces/po-search-filter-select.interface';
import { PoSearchOption } from './interfaces/po-search-option.interface';
import { PoSearchComponent } from './po-search.component';

describe('PoSearchComponent', () => {
  let component: PoSearchComponent;
  let fixture: ComponentFixture<PoSearchComponent>;
  let controlPositionMock: jasmine.SpyObj<PoControlPositionService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoIconModule, PoListBoxModule],
      declarations: [PoSearchComponent],
      providers: [PoControlPositionService]
    }).compileComponents();
  });

  beforeEach(() => {
    controlPositionMock = jasmine.createSpyObj('PoControlPositionService', ['adjustPosition', 'setElements']);

    fixture = TestBed.createComponent(PoSearchComponent);

    component = fixture.componentInstance;

    component['controlPosition'] = controlPositionMock;
    fixture.detectChanges();

    component.poSearchInput = new ElementRef({ value: 'some search value' });
    component.items = [{ text: 'Text 1' }, { text: 'Text 2' }, { text: 'Other Text' }];
    component.filterKeys = ['text'];

    spyOn(component.filteredItemsChange, 'emit');
    spyOn(component.listboxOnClick, 'emit');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('clearSearch: should clear the search', () => {
    const inputElement = document.createElement('input');
    document.body.appendChild(inputElement);

    component.poSearchInput = { nativeElement: inputElement };

    component.clearSearch();

    expect(inputElement.value).toBe('');

    document.body.removeChild(inputElement);
  });

  it('onSearchChange: should filter items based on search text and emit filtered items', () => {
    component.onSearchChange('text', true);

    expect(component.filteredItems).toEqual([{ text: 'Text 1' }, { text: 'Text 2' }]);
    expect(component.filteredItemsChange.emit).toHaveBeenCalledWith([{ text: 'Text 1' }, { text: 'Text 2' }]);
  });

  it('onSearchChange: should filter items based on search text using startsWith', () => {
    component.filterType = PoSearchFilterMode.startsWith;

    component.onSearchChange('Text', true);

    expect(component.filteredItems).toEqual([{ text: 'Text 1' }, { text: 'Text 2' }]);
    expect(component.filteredItemsChange.emit).toHaveBeenCalledWith([{ text: 'Text 1' }, { text: 'Text 2' }]);
  });

  it('onSearchChange: should filter items based on search text using endsWith', () => {
    component.filterType = PoSearchFilterMode.endsWith;

    component.onSearchChange('2', true);

    expect(component.filteredItems).toEqual([{ text: 'Text 2' }]);
    expect(component.filteredItemsChange.emit).toHaveBeenCalledWith([{ text: 'Text 2' }]);
  });

  it('onSearchChange: should not filter items if search text is empty', () => {
    component.onSearchChange('', true);

    expect(component.filteredItems).toEqual([{ text: 'Text 1' }, { text: 'Text 2' }, { text: 'Other Text' }]);
    expect(component.filteredItemsChange.emit).toHaveBeenCalledWith(component.items);
  });

  it('onSearchChange: should not add value if it is null or undefined', () => {
    component.items = [{ text: '' }, { text: null }, { text: undefined }, { text: 'Text' }];

    component.onSearchChange('Text', true);
    expect(component.filteredItems).toEqual([{ text: 'Text' }]);
    expect(component.filteredItemsChange.emit).toHaveBeenCalledWith([{ text: 'Text' }]);
  });

  it('onSearchChange: should return false if filter mode is not recognized', () => {
    component.filterType = 'invalidMode' as unknown as PoSearchFilterMode;

    const result = component.onSearchChange('text', true);

    expect(result).toBeFalsy();
    expect(component.filteredItems).toEqual([]);
    expect(component.filteredItemsChange.emit).toHaveBeenCalledWith([]);
  });

  it('onSearchChange: should convert non-string values to string', () => {
    const item = { value: 42 };
    component.items = [item];
    component.filterKeys = ['value'];

    component.onSearchChange('42', true);

    expect(component.filteredItems).toEqual([item]);
    expect(component.filteredItemsChange.emit).toHaveBeenCalledWith([item]);
  });

  it('onSearchChange: should filter items based on search text using contains', () => {
    component.filterType = PoSearchFilterMode.contains;

    component.onSearchChange('ext', true);

    expect(component.filteredItems).toEqual([{ text: 'Text 1' }, { text: 'Text 2' }, { text: 'Other Text' }]);

    expect(component.filteredItemsChange.emit).toHaveBeenCalledWith([
      { text: 'Text 1' },
      { text: 'Text 2' },
      { text: 'Other Text' }
    ]);
  });

  it('onSearchChange: should handle null value', () => {
    const searchText = 'example';
    component.filterKeys = ['name'];
    component.filterType = PoSearchFilterMode.contains;
    component.items = [{ name: null }];

    component.onSearchChange(searchText, true);

    expect(component.filteredItems.length).toBe(0);
  });

  it('onSearchChange: should reset filteredItems and emit empty array', () => {
    component.items = [];
    component.filterKeys = ['name'];
    component.onSearchChange('item', true);

    expect(component.filteredItems).toEqual([]);
    expect(component.filteredItemsChange.emit).toHaveBeenCalledWith([]);
  });

  describe('showListbox: when searching with listbox', () => {
    const eventClick = document.createEvent('MouseEvents');
    eventClick.initEvent('click', false, true);

    beforeEach(() => {
      component.showListbox = true;

      component.poSearchInput = {
        nativeElement: {
          focus: () => {},
          contains: () => {},
          dispatchEvent: () => {}
        }
      };
    });

    afterEach(() => {
      component['removeListeners']();
    });

    it('should return the filtered list', () => {
      component.filterType = PoSearchFilterMode.startsWith;
      component.poSearchInput.nativeElement.value = 'text';
      component.onSearchChange('text', true);

      expect(component.listboxFilteredItems).toEqual([
        { label: 'Text 1', value: 'Text 1' },
        { label: 'Text 2', value: 'Text 2' }
      ]);
    });

    it('should return the filtered list if filterType is contains', () => {
      component.filterType = PoSearchFilterMode.contains;
      component.poSearchInput.nativeElement.value = 'ther';
      component.onSearchChange('ther', true);

      expect(component.listboxFilteredItems).toEqual([{ label: 'Other Text', value: 'Other Text' }]);
    });

    it('should return the filtered list if filterType is endsWith', () => {
      component.filterType = PoSearchFilterMode.endsWith;
      component.poSearchInput.nativeElement.value = '1';
      component.onSearchChange('1', true);

      expect(component.listboxFilteredItems).toEqual([{ label: 'Text 1', value: 'Text 1' }]);
    });

    it("should return false list if filterType doesn't exist ", () => {
      component.filterType = null;
      component.onSearchChange('1', true);

      expect(component.listboxFilteredItems).toEqual([]);
    });

    it('should set the value on click the list item', () => {
      const option: PoSearchOption = { value: 'Text 1', label: 'Text 1' };
      component.onListboxClick(option, new Event('click'));

      expect(component.poSearchInput.nativeElement.value).toBe('Text 1');
    });

    it('should set the value on keypress enter into list item and if the `p-search-type` is trigger, should not search', () => {
      const option: PoSearchOption = { value: 'Text 1', label: 'Text 1' };
      component.type = 'trigger';
      component['listboxItemclicked'] = true;
      component.onListboxClick(
        option,
        new KeyboardEvent('keydown', {
          code: 'Enter',
          key: 'Enter',
          charCode: 13,
          keyCode: 13,
          view: window
        })
      );

      expect(component.poSearchInput.nativeElement.value).toBe('Text 1');
      expect(component.listboxOnClick.emit).toHaveBeenCalledWith('Text 1');

      component.onSearchChange('Text 1', true);
      expect(component.filteredItems).toEqual([]);
      expect(component.filteredItemsChange.emit).not.toHaveBeenCalled();
    });

    it('should set the value on keypress enter into list item and if the `p-search-type` is action, should search', () => {
      const option: PoSearchOption = { value: 'Text 1', label: 'Text 1' };
      component.type = 'action';
      component.onListboxClick(
        option,
        new KeyboardEvent('keydown', {
          code: 'Enter',
          key: 'Enter',
          charCode: 13,
          keyCode: 13,
          view: window
        })
      );

      expect(component.poSearchInput.nativeElement.value).toBe('Text 1');
      expect(component.filteredItems).toEqual([{ text: 'Text 1' }]);
      expect(component.filteredItemsChange.emit).toHaveBeenCalledWith([{ text: 'Text 1' }]);
    });

    it('should set listboxFilteredItems to all items if the input value is empty', () => {
      component.listboxFilteredItems = [
        { label: 'Text 1', value: 'Text 1' },
        { label: 'Text 2', value: 'Text 2' }
      ];
      component.poSearchInput.nativeElement.value = '';
      component.poSearchInput.nativeElement.dispatchEvent(new Event('input'));

      expect(component.listboxFilteredItems).toEqual([
        { label: 'Text 1', value: 'Text 1' },
        { label: 'Text 2', value: 'Text 2' }
      ]);
    });

    it('should return the listboxFilteredItems with converting the boolean and number to string ', () => {
      component.items = [{ text: true }, { text: 5 }, { text: 'Text' }];

      component['ngOnInit']();

      expect(component.listboxFilteredItems).toEqual([
        { label: 'true', value: 'true' },
        { label: '5', value: '5' },
        { label: 'Text', value: 'Text' }
      ]);
    });

    it('initializeListeners: should call removeListeners and initialize click, resize and scroll listeners', () => {
      component['clickoutListener'] = undefined;
      component['eventResizeListener'] = undefined;
      const spyRemoveListeners = spyOn(component, <any>'removeListeners');

      component['initializeListeners']();

      document.dispatchEvent(eventClick);
      window.dispatchEvent(new Event('resize'));

      expect(spyRemoveListeners).toHaveBeenCalled();
      expect(component['clickoutListener']).toBeDefined();
      expect(component['eventResizeListener']).toBeDefined();
    });

    it('should hide the listbox when was click out of the input', () => {
      component.listboxOpen = true;

      spyOn(component, 'controlListboxVisibility');
      component.clickedOutsideInput(eventClick);
      expect(component.controlListboxVisibility).toHaveBeenCalled();
    });

    it('should not hide listbox when was click in input', () => {
      component.poSearchInput.nativeElement.dispatchEvent(eventClick);

      spyOn(component, 'controlListboxVisibility');
      component.clickedOutsideInput(eventClick);
      expect(component.controlListboxVisibility).not.toHaveBeenCalled();
    });

    it('should initialize all Listeners correctly', fakeAsync(() => {
      spyOn(component, <any>'removeListeners').and.callThrough();
      spyOn(component, <any>'adjustContainerPosition');

      component['initializeListeners']();

      expect(component['removeListeners']).toHaveBeenCalled();
      expect(component['clickoutListener']).toBeDefined();
      expect(component['eventResizeListener']).toBeDefined();

      window.dispatchEvent(new Event('resize'));

      tick(251);

      expect(component['adjustContainerPosition']).toHaveBeenCalled();
    }));

    it('should adjustContainerPosition if the screen is resizing', () => {
      spyOn(component, <any>'adjustContainerPosition');

      component['initializeListeners']();

      window.dispatchEvent(new Event('scroll'));

      expect(component['adjustContainerPosition']).toHaveBeenCalled();
    });

    it('should focus the listbox if the input have a arrowdown keypress', () => {
      component.poListbox.listboxItemList = {
        nativeElement: { offsetHeight: 100, scrollTop: 100, scrollHeight: 200 }
      };
      component.type = 'trigger';
      component.listboxOpen = true;

      const event = new KeyboardEvent('keydown', { keyCode: 40, code: 'ArrowDown' });

      spyOn(component, <any>'focusItem');

      component.onKeyDown(event);

      expect(component.listboxOpen).toBeTrue();
      expect(component['focusItem']).toHaveBeenCalled();
    });

    it('should not focus the listbox if the input have a arrowdown keypress and listboxOpen is false', () => {
      component.listboxOpen = false;
      component.type = 'trigger';

      const event = new KeyboardEvent('keydown', { keyCode: 40, code: 'ArrowDown' });
      component.onKeyDown(event);

      expect(component.listboxOpen).toBeFalse();
    });

    it('should hide the listbox if the input has a shift+tab keypress', () => {
      spyOn(component, 'controlListboxVisibility');
      component.type = 'trigger';

      const event = new KeyboardEvent('keydown', { keyCode: 9, code: 'Tab', shiftKey: true });

      component.onKeyDown(event);

      expect(component.controlListboxVisibility).toHaveBeenCalledWith(false);
    });

    it('should hide the listbox if the input has a tab keypress', () => {
      spyOn(component, 'controlListboxVisibility');
      component.type = 'trigger';

      const event = new KeyboardEvent('keydown', { keyCode: 9, code: 'Tab' });

      component.onKeyDown(event);

      expect(component.controlListboxVisibility).toHaveBeenCalledWith(false);
    });

    it('should close the listbox if the input has a esc keypress', () => {
      spyOn(component, 'controlListboxVisibility');
      component.type = 'trigger';
      component.listboxOpen = true;

      const event = new KeyboardEvent('keydown', { keyCode: 9, code: 'Tab', shiftKey: true });

      component.onKeyDown(event);

      expect(component.controlListboxVisibility).toHaveBeenCalledWith(false);
    });

    it('should close the listbox and focus the search input if the input has a keydown event with the Escape key', () => {
      spyOn(component, 'controlListboxVisibility');
      const focusSpy = spyOn(component.poSearchInput.nativeElement, 'focus');

      component.listboxOpen = true;

      const event = new KeyboardEvent('keydown', { keyCode: 27, code: 'Escape' });
      component.onKeyDown(event);

      expect(component.controlListboxVisibility).toHaveBeenCalledWith(false);
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should close the listbox if the input has a keydown event with the Enter key and the listbox is open', () => {
      spyOn(component, 'controlListboxVisibility');
      component.listboxOpen = true;

      const event = new KeyboardEvent('keydown', { keyCode: 13, code: 'Enter' });
      component.onKeyDown(event);

      expect(component.controlListboxVisibility).toHaveBeenCalledWith(false);
    });

    it('should call controlListboxVisibility(false) when the input loses focus and the listbox is open and poListbox.items is empty', () => {
      spyOn(component, 'controlListboxVisibility');
      component.listboxOpen = true;
      component.poListbox.items = [];

      component.onBlur();
      expect(component.controlListboxVisibility).toHaveBeenCalledWith(false);
    });

    it('should call focusItem() when the input loses focus and the listbox is open and poListbox.items is not empty', () => {
      component.listboxOpen = true;
      component.poListbox.items = [{ label: 'Item 1' }];
      spyOn(component, <any>'focusItem');

      component.onBlur();
      expect(component['focusItem']).toHaveBeenCalled();
    });

    it('should focus the first option in the listbox and set its class to cdk-option-active', fakeAsync(() => {
      const mockListboxItem = document.createElement('div');
      mockListboxItem.classList.add('po-listbox-item');
      document.body.appendChild(mockListboxItem);

      const mockListboxItem2 = document.createElement('div');
      mockListboxItem2.classList.add('po-listbox-item');
      document.body.appendChild(mockListboxItem2);

      spyOn(mockListboxItem, 'focus');

      component['focusItem']();

      tick(100);

      expect(mockListboxItem.focus).toHaveBeenCalled();
      expect(mockListboxItem2.classList.contains('cdk-option-active')).toBeFalse();

      document.body.removeChild(mockListboxItem);
      document.body.removeChild(mockListboxItem2);
    }));
  });

  describe('filterSelect', () => {
    let filterSelect: Array<PoSearchFilterSelect>;

    beforeEach(() => {
      filterSelect = [
        { label: 'personal', value: ['name', 'gender'] },
        { label: 'address', value: ['planet'] },
        { label: 'family', value: ['father'] }
      ];
      component.poSearchInput = {
        nativeElement: {
          focus: () => {},
          contains: () => {},
          dispatchEvent: () => {}
        }
      };
      component.poSearchInput.nativeElement.value = 'Anakin';
      component['language'] = 'en';
    });

    it('should create dropdown filter select options, and an `all` option then update filterKeys', () => {
      component.items = [
        { name: 'Luke Skywalker', gender: 'male', planet: 'Tatooine', father: 'Anakin Skywalker' },
        { name: 'Leia Organa', gender: 'female', planet: 'Alderaan', father: 'Anakin Skywalker' },
        { name: 'Han Solo', gender: 'male', planet: 'Corellia', father: 'Ovan' }
      ];
      component.filterKeys = ['name'];
      component.filterSelect = filterSelect;

      component['ngOnInit']();

      const expectedFilterKeys = ['name', 'gender', 'planet', 'father'];
      expect(component.filterKeys).toEqual(expectedFilterKeys);
      expect(component.searchFilterSelectActions.some(action => action.label === component.literals.all)).toBeTrue();
    });

    it('should change `filterKeys` when clicking `personal`', () => {
      component.filterSelect = filterSelect;
      component['ngOnInit']();

      component.searchFilterSelectActions.find(action => action.label === 'personal').action();

      const expectedFilterKeys = ['name', 'gender'];
      expect(component.filterKeys).toEqual(expectedFilterKeys);
    });

    it('should not create dropdown filter select actions if filterSelect is undefined', () => {
      component.filterSelect = undefined;
      component.createDropdownFilterSelect();
      expect(component.searchFilterSelectActions.length).toBe(0);
    });

    it('should not create dropdown filter select actions if filterSelect is null', () => {
      component.filterSelect = null;
      component.createDropdownFilterSelect();
      expect(component.searchFilterSelectActions.length).toBe(0);
    });

    it('should set filterKeys to an array if filterOption.value is an array', () => {
      const filterOption = { label: 'name', value: ['name1', 'name2'] };
      component.changeFilterSelect(filterOption);

      expect(component.filterKeys).toEqual(['name1', 'name2']);
    });

    it('should set filterKeys to an array if filterOption.value is not an array', () => {
      const filterOption = { label: 'name', value: 'name' };
      component.changeFilterSelect(filterOption);

      expect(component.filterKeys).toEqual(['name']);
    });

    it('should focus and search input, if an option on dropdown filter is selected and the search-type is `action`', () => {
      const _filterSelect = [{ label: 'personal', value: ['name', 'gender'] }];
      component.filterSelect = _filterSelect;
      component.type = 'action';

      component['ngOnInit']();

      const expectedFilterKeys = ['name', 'gender'];
      expect(component.filterKeys).toEqual(expectedFilterKeys);
      expect(component.filteredItemsChange.emit).toHaveBeenCalled();
    });

    it('should call createDropdownFilterSelect when filterSelect changes', () => {
      component.filterSelect = [
        { label: 'name', value: 'name' },
        { label: 'gender', value: 'gender' }
      ];
      component['ngOnInit']();

      expect(component.filterKeys).toEqual(['name', 'gender']);

      spyOn(component as any, 'createDropdownFilterSelect').and.callThrough();

      const changes: SimpleChanges = {
        filterSelect: new SimpleChange(null, [{ label: 'planet', value: 'planet' }], false)
      };

      component['ngOnChanges'](changes);

      expect(component['createDropdownFilterSelect']).toHaveBeenCalled();
    });

    it('should populate searchFilterSelectActions correctly in createDropdownFilterSelect', () => {
      component.filterSelect = [
        { label: 'name', value: 'name' },
        { label: 'gender', value: 'gender' }
      ];

      component['createDropdownFilterSelect']();

      const expectedActions = [
        { label: 'All', action: jasmine.any(Function), selected: true },
        { label: 'name', action: jasmine.any(Function), selected: false },
        { label: 'gender', action: jasmine.any(Function), selected: false }
      ];

      expect(component.searchFilterSelectActions).toEqual(expectedActions);
    });

    it('should call changeFilterSelect in createDropdownFilterSelect', () => {
      component.filterSelect = [
        { label: 'name', value: 'name' },
        { label: 'gender', value: 'gender' }
      ];

      const changeFilterSelectSpy = spyOn(component as any, 'changeFilterSelect').and.callThrough();

      component['createDropdownFilterSelect']();

      expect(changeFilterSelectSpy).toHaveBeenCalledWith({ label: 'All', value: ['name', 'gender'] });
    });

    it('should set `filterSelect` to undefined when values is not provided or empty', () => {
      component.filterSelect = undefined;
      expect(component['_filterSelect']).toBeUndefined();

      component.filterSelect = [];
      expect(component['_filterSelect']).toBeUndefined();
    });

    it('should change `filterKeys` even if the value is not an array', () => {
      const _filterSelect = [{ label: 'personal', value: 'name' }];
      component.filterSelect = _filterSelect;
      component['ngOnInit']();

      const expectedFilterKeys = ['name'];
      expect(component.filterKeys).toEqual(expectedFilterKeys);
    });

    describe('ensureFilterSelectOption', () => {
      it('should wrap a single string value into an array of objects with label and value', () => {
        const value = 'name';
        const result = component.ensureFilterSelectOption(value);
        expect(result).toEqual([{ label: 'name', value: 'name' }]);
      });

      it('should convert an array of strings into an array of objects with label and value', () => {
        const values = ['name', 'gender'];
        const result = component.ensureFilterSelectOption(values);
        expect(result).toEqual([
          { label: 'name', value: 'name' },
          { label: 'gender', value: 'gender' }
        ]);
      });

      it('should return the same array of objects if passed in', () => {
        const values: Array<PoSearchFilterSelect> = [
          { label: 'name', value: 'name' },
          { label: 'gender', value: 'gender' }
        ];
        const result = component.ensureFilterSelectOption(values);
        expect(result).toEqual(values);
      });

      it('should convert a single object into an array of that object', () => {
        const value: PoSearchFilterSelect = { label: 'name', value: 'name' };
        const result = component.ensureFilterSelectOption(value);
        expect(result).toEqual([value]);
      });
    });
  });
});
