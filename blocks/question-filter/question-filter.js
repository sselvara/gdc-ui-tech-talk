import { decorateIcons } from '../../scripts/lib-franklin.js';

const createCheckboxFilter = (data) => {
  const span = document.createElement('span');
  const h6 = document.createElement('p');
  const ul = document.createElement('ul');
  data.forEach((label) => {
    const li = document.createElement('li');
    li.innerHTML = `<label class="container"><input type="checkbox" class="apply-filter-checkbox" value="${label}"/> ${label} <span class="checkmark"></span></label>`;
    ul.append(li);
  });
  h6.innerHTML = 'CATEGORIES';
  span.append(h6);
  span.append(ul);
  return span;
};

const bindFilterClose = () => {
  const [filterButtonEle] = document.getElementsByClassName('filter-close-button');
  filterButtonEle.addEventListener('click', () => {
    const [selectEle] = document.getElementsByClassName('question-filter-wrapper');
    selectEle.classList.remove('filter-mobile-view');
    const [filterButtonEleUi] = document.getElementsByClassName('filter-button');
    filterButtonEleUi.setAttribute('value', 'NO');
  });
};

const createSelectFilter = (data) => {
  const span = document.createElement('span');
  span.className = 'custom-select';
  const h6 = document.createElement('p');
  const select = document.createElement('select');
  select.id = 'select-filter';
  data.forEach((label) => {
    const option = document.createElement('option');
    const key = Object.keys(label)[0];
    option.value = label[key];
    option.text = key;
    select.append(option);
  });
  h6.innerHTML = 'SORT BY';
  span.append(h6);
  span.append(select);
  return span;
};

export default async function decorate(block) {
  const resp = await fetch('/ask-a-question.json?sheet=incoming');
  const json = await resp.json();
  const listData = json?.data;
  document.body.setAttribute('pageLoadData', JSON.stringify(listData));
  let filterDta = [];
  listData.forEach((tag) => {
    if (tag.Tags) {
      filterDta.push(...tag.Tags.toUpperCase().split(','));
    }
  });
  filterDta = [...new Set(filterDta)].sort();
  const mainWrap = document.createElement('div');
  mainWrap.className = 'question-filter-content';
  mainWrap.appendChild(createSelectFilter([{ 'Sort by : NEW': 'NEW' }, { 'Sort by : Recommended': 'RECOMMEND' }, { 'Sort by : OLD': 'OLD' }]));
  mainWrap.appendChild(createCheckboxFilter(filterDta));

  // Mobile filter
  const filterButton = document.createElement('button');
  filterButton.className = 'filter-close-button';
  filterButton['aria-label'] = 'Hide filter';
  filterButton.setAttribute('aria-label', 'Hide filter');
  const filterIcon = document.createElement('span');
  filterIcon.className = 'icon icon-close';
  filterButton.append(filterIcon);
  decorateIcons(filterButton);

  mainWrap.appendChild(filterButton);

  block.textContent = '';
  decorateIcons(mainWrap);

  block.append(mainWrap);

  bindFilterClose();
}
