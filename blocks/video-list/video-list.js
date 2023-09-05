import { decorateIcons } from '../../scripts/lib-franklin.js';
import { excelDateToJSDate, isMobile } from '../../scripts/helper.js';

const perPageRecord = isMobile() ? 4 : 10;
let loadedRecord = perPageRecord;

const getSvgText = ([mainTag = '']) => {
  let svgText = '';
  if (mainTag.length > 11) {
    const wrapText = mainTag.split(' ');
    svgText = wrapText.map((text, index) => `<text x="50%" y="${50 * index}%" dy="${(0.35 * index) + 0.40}em" text-anchor="middle">
    ${text}
    </text>`);
    svgText = svgText.join();
  } else {
    svgText = `<text x="50%" y="50%" dy=".35em" text-anchor="middle">
    ${mainTag}
    </text>`;
  }
  return `<svg viewBox="0 0 1320 300" height="100%">
  ${svgText}
</svg> `;
};

const createVideoCard = (data, videoDataEle = null, ul = null) => {
  let classCounter = 1;
  data.forEach((video) => {
    const li = document.createElement('li');
    const wrapper = document.createElement('a');
    wrapper.href = `/topic-details?selectedVideo=${video['S. no']}`;
    const imageDiv = document.createElement('div');
    const bodyDiv = document.createElement('div');
    const videoTitle = document.createElement('p');
    const videoAuthor = document.createElement('p');
    videoAuthor.className = 'size15';
    videoAuthor.innerHTML = `<span class="icon icon-presenter"></span> ${video.Presenter}`;
    videoTitle.className = 'size18';
    videoTitle.innerHTML = video.Topic;
    const videoDate = document.createElement('p');
    videoDate.className = 'size14';
    videoDate.innerHTML = `<span class="icon icon-calendar"></span> ${excelDateToJSDate(video['Talk Date'])}`;
    const videoTags = document.createElement('span');
    let tagsHtml = '';
    video.Tags?.split(',').forEach((tag) => {
      tagsHtml += `<span class="video-tags tag">${tag}</span>`;
    });
    videoTags.innerHTML = tagsHtml;
    if (classCounter === 10) {
      classCounter = 1;
    }
    imageDiv.className = `video-list-card-image video-list-card${classCounter}`;
    classCounter += 1;
    bodyDiv.className = 'video-list-card-body';
    const span2 = document.createElement('div');
    span2.innerHTML = getSvgText(video.Tags?.split(','));
    span2.className = 'svg-video-list';
    imageDiv.append(span2);
    bodyDiv.append(videoTitle);
    bodyDiv.append(videoAuthor);
    bodyDiv.append(videoDate);
    bodyDiv.append(videoTags);
    wrapper.append(imageDiv);
    wrapper.append(bodyDiv);
    li.append(wrapper);
    if (videoDataEle) {
      decorateIcons(li);
      videoDataEle.appendChild(li);
    } else {
      ul.append(li);
    }
  });
  return ul;
};

const loadVideoUi = (data, isAppend = false) => {
  if (isAppend) {
    const listDataLimit = data.slice(loadedRecord, perPageRecord + loadedRecord);
    loadedRecord = perPageRecord + loadedRecord;
    const videoDataEle = document.getElementById('video-list-data');
    createVideoCard(listDataLimit, videoDataEle);
  } else {
    const videoDataEle = document.getElementById('video-list-data');
    videoDataEle.innerHTML = '';
    createVideoCard(data, videoDataEle);
  }
};

function throttle(cb, delay) {
  let wait = false;
  return (...args) => {
    if (wait) {
      return;
    }

    cb(...args);
    wait = true;
    setTimeout(() => {
      wait = false;
    }, delay);
  };
}

const getListType = (block) => {
  if (block?.children[0] && block?.children[0].innerHTML) {
    return {
      defaultImage: block?.children[0].querySelector('a').href,
      listType: block?.children[0].querySelector('a').innerHTML,
    };
  }
  return {};
};

export default async function decorate(block) {
  const { listType = '' } = getListType(block);
  // const resp = await fetch('/tech-talk-tracker.json?sheet=incoming&limit=10');
  // const json = await resp.json();
  // let listData = json?.data;
  let listData = JSON.parse(document.body.getAttribute('pageLoadData'));
  if (listType !== 'ALL') {
    listData = listData
      .filter((obj) => obj?.Status?.trim().toLowerCase() !== listType.trim().toLowerCase());
  } else {
    listData = listData
      .filter((obj) => obj?.Status?.trim().toLowerCase() === 'completed');
  }
  const ul = document.createElement('ul');
  ul.id = 'video-list-data';
  ul.setAttribute('data-video-list', JSON.stringify(listData));

  // Mobile filter
  const filterButton = document.createElement('button');
  filterButton.className = 'filter-button';
  filterButton['aria-label'] = 'Show filter';
  filterButton.setAttribute('value', 'NO');
  const filterIcon = document.createElement('span');
  filterIcon.className = 'icon icon-filter';
  filterButton.append(filterIcon);
  decorateIcons(filterButton);

  const withoutDate = listData.filter((data) => data['Talk Date']);
  const withDate = listData.filter((data) => !data['Talk Date']);
  withoutDate.sort((a, b) => {
    const dateA = new Date(excelDateToJSDate(a['Talk Date']));
    const dateB = new Date(excelDateToJSDate(b['Talk Date']));
    if (window.location.pathname === '/upcoming-sessions') {
      return dateA - dateB;
    }
    return dateB - dateA;
  });

  listData = [...withoutDate, ...withDate];

  decorateIcons(createVideoCard(listData.slice(0, perPageRecord), null, ul));
  block.textContent = '';
  block.append(ul);
  block.appendChild(filterButton);

  const [filterButtonEle] = document.getElementsByClassName('filter-button');
  let isOpen = false;
  filterButtonEle.addEventListener('click', (event) => {
    const [selectEle] = document.getElementsByClassName('video-filter-wrapper');
    isOpen = event.currentTarget.getAttribute('value');
    if (isOpen === 'NO') {
      selectEle.classList.add('filter-mobile-view');
      event.currentTarget.setAttribute('value', 'YES');
    } else {
      selectEle.classList.remove('filter-mobile-view');
      event.currentTarget.setAttribute('value', 'NO');
    }
  });

  const searchInput = document.getElementById('search-video-input');
  searchInput.addEventListener('keyup', () => {
    throttle(() => {
      const videoDataEle = document.getElementById('video-list-data');
      let searchData = videoDataEle.dataset.videoList;
      searchData = JSON.parse(searchData);
      const filterData = searchData
        .filter(({ Topic }) => Topic.toLowerCase().indexOf(searchInput.value.toLowerCase()) > -1);
      if (filterData.length === 0) {
        videoDataEle.innerHTML = '<h4>Tech Talk Session Not Found.</h4>';
      } else {
        loadVideoUi(filterData);
      }
    }, 1000)();
  });

  const applyFilter = (selectedTags, selectedFilter) => {
    const videoDataEle = document.getElementById('video-list-data');
    let searchData = videoDataEle.dataset.videoList;
    searchData = JSON.parse(searchData);
    if (window.location.pathname !== '/upcoming-sessions') {
      searchData = searchData.filter(({ Status }) => Status.toLowerCase() === 'completed');
    }

    const filterData = searchData
      .filter(({ Tags }) => {
        if (selectedTags.find((val) => Tags.toLowerCase()
          .indexOf(val.toLowerCase()) > -1) || selectedTags.length === 0) {
          return true;
        }
        return false;
      });

    if (selectedFilter && selectedFilter !== 'RECOMMEND') {
      filterData.sort((a, b) => {
        const dateA = new Date(excelDateToJSDate(a['Talk Date']));
        const dateB = new Date(excelDateToJSDate(b['Talk Date']));
        if (selectedFilter === 'NEW') {
          return dateB - dateA;
        }

        return dateA - dateB;
      });
    }

    loadVideoUi(filterData.slice(0, perPageRecord));
  };

  setTimeout(() => {
    const selectedTags = [];
    let selectedFilter = null;

    const applyFilterCheckbox = document.getElementsByClassName('apply-filter-checkbox');
    const applyFilterSelect = document.getElementById('select-filter');

    applyFilterSelect.addEventListener('change', () => {
      selectedFilter = applyFilterSelect.value;
      applyFilter(selectedTags, selectedFilter);
    });

    for (let i = 0; i < applyFilterCheckbox.length; i += 1) {
      // eslint-disable-next-line no-loop-func
      applyFilterCheckbox[i].addEventListener('change', () => {
        if (applyFilterCheckbox[i].checked) {
          selectedTags.push(applyFilterCheckbox[i].value);
        } else {
          selectedTags.splice(selectedTags.indexOf('B'), 1);
        }
        applyFilter(selectedTags, selectedFilter);
      });
    }
  }, 500);

  window.onscroll = function () {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      throttle(loadVideoUi, 1000)(listData, true);
    }
  };
}
