import { decorateIcons } from '../../scripts/lib-franklin.js';
import { excelDateToJSDate } from '../../scripts/helper.js';

const perPageRecord = 5;
let loadedRecord = perPageRecord;

const createVideoCard = (data, videoDataEle = null, ul = null) => {
  data.forEach((video) => {
    const li = document.createElement('li');
    const imgTag = document.createElement('img');
    imgTag.src = 'https://main--gdc-ui-tech-talk--sselvara.hlx.live/images/video-screen.jpg';
    imgTag.width = '640';
    imgTag.height = '360';
    const wrapper = document.createElement('a');
    if (video.video) {
      wrapper.href = `/topic-details?selectedVideo=${video['S. no']}`;
    } else {
      wrapper.href = '#';
      wrapper.className = 'no-cursor';
    }
    const imageDiv = document.createElement('div');
    const bodyDiv = document.createElement('div');
    const videoTitle = document.createElement('h6');
    const videoAuthor = document.createElement('p');
    videoAuthor.innerHTML = `<span class="icon icon-presenter"></span> ${video.Presenter}`;
    videoTitle.innerHTML = video.Topic;
    const videoDate = document.createElement('p');
    videoDate.innerHTML = `<span class="icon icon-calendar"></span> ${excelDateToJSDate(video['Talk Date'])}`;
    const videoTags = document.createElement('span');
    let tagsHtml = '';
    video.Tags?.split(',').forEach((tag) => {
      tagsHtml += `<span class="video-tags tag">${tag}</span>`;
    });
    videoTags.innerHTML = tagsHtml;
    imageDiv.className = 'video-list-card-image';
    bodyDiv.className = 'video-list-card-body';
    imageDiv.append(imgTag);
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
  console.log(data, '...data');
  if (isAppend) {
    const videoDataEle = document.getElementById('video-list-data');
    createVideoCard(data, videoDataEle);
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

  decorateIcons(createVideoCard(listData.splice(0, perPageRecord), null, ul));
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
      loadVideoUi(filterData);
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

    loadVideoUi(filterData.slice(0, 5));
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
      const listDataLimit = listData.slice(loadedRecord, perPageRecord + loadedRecord);
      loadedRecord = perPageRecord + loadedRecord;
      throttle(loadVideoUi, 1000)(listDataLimit, true);
    }
  };
}
