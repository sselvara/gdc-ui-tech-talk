import { decorateIcons } from '../../scripts/lib-franklin.js';

const getSearchUi = () => '<input type="text" placeholder="Search Topics..." id="search-video-input" name="search"/><span class="icon icon-search icon-search-class"></span>';

export default async function decorate(block) {
  const searchWrap = document.createElement('div');
  searchWrap.className = 'video-search-content';
  searchWrap.innerHTML = getSearchUi();
  block.textContent = '';
  decorateIcons(searchWrap);

  block.append(searchWrap);
}
