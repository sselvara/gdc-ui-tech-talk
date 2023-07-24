import { decorateIcons } from '../../scripts/lib-franklin.js';
import { excelDateToJSDate } from '../../scripts/helper.js';

const createVideoCard = (data, videoDataEle = null, ul = null) => {
  data.forEach((video) => {
    const li = document.createElement('li');
    const imgTag = document.createElement('img');
    imgTag.src = 'https://iltpp.org/wp-content/uploads/2019/09/Adobe-Banner-1.png';
    const wrapper = document.createElement('a');
    wrapper.href = `/topic-details?selectedVideo=${video['S. no']}`;
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

const loadVideoUi = (data) => {
  const videoDataEle = document.getElementById('video-list-data');
  videoDataEle.innerHTML = '';
  createVideoCard(data, videoDataEle);
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
  const { defaultImage, listType = '' } = getListType(block);
  const resp = await fetch('/ui-tech-talk-tracker.json');
  const json = await resp.json();
  let listData = json?.data;
  console.log(defaultImage, listType);
  if (listType !== 'ALL') {
    listData = listData.filter((obj) => obj?.Status?.trim().toLowerCase() !== listType.trim().toLowerCase());
  }

  const ul = document.createElement('ul');
  ul.id = 'video-list-data';
  ul.setAttribute('data-video-list', JSON.stringify(listData));

  decorateIcons(createVideoCard(listData, null, ul));
  block.textContent = '';
  block.append(ul);

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

  setTimeout(() => {
    const selectedTags = [];
    const applyFilterCheckbox = document.getElementsByClassName('apply-filter-checkbox');
    console.log(applyFilterCheckbox, '..applyFilterCheckbox');
    for (let i = 0; i < applyFilterCheckbox.length; i++) {
      applyFilterCheckbox[i].addEventListener('change', () => {
        console.log('applyFilterCheckbox', applyFilterCheckbox[i].checked ? 'true' : 'false', applyFilterCheckbox[i].value);
        if (applyFilterCheckbox[i].checked) {
          selectedTags.push(applyFilterCheckbox[i].value);
        } else {
          selectedTags.splice(selectedTags.indexOf('B'), 1);
        }

        const videoDataEle = document.getElementById('video-list-data');
        let searchData = videoDataEle.dataset.videoList;
        searchData = JSON.parse(searchData);
        const filterData = searchData
          .filter(({ Tags }) => {
            if (selectedTags.find((val) => Tags.toLowerCase().indexOf(val.toLowerCase()) > -1) || selectedTags.length === 0) {
              return true;
            }
            return false;
          });

        loadVideoUi(filterData);
      });
    }
  }, 500);
}
