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
  return span.outerHTML;
};

export default async function decorate(block) {
  const resp = await fetch('/ui-tech-talk-tracker.json');
  const json = await resp.json();
  const listData = json?.data;
  let filterDta = [];
  listData.forEach((tag) => {
    if (tag.Tags) {
      filterDta.push(...tag.Tags.toUpperCase().split(','));
    }
  });
  filterDta = [...new Set(filterDta)].sort();
  const mainWrap = document.createElement('div');
  mainWrap.className = 'video-filter-content';
  mainWrap.innerHTML = createCheckboxFilter(filterDta);
  block.textContent = '';
  decorateIcons(mainWrap);

  block.append(mainWrap);
}
