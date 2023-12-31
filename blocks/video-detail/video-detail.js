import { decorateIcons } from '../../scripts/lib-franklin.js';
import { excelDateToJSDate } from '../../scripts/helper.js';

const getVideo = (videoUrl, title) => {
  if (videoUrl) {
    return `<iframe src="${videoUrl}" width="100%" height="500" frameborder="0" scrolling="no" allowfullscreen title="${title}"></iframe>`;
  }
  return '<div class="video-not-available"><div class="typewriter"><h3>Video will be available once the session is complete.</h3></div></div>';
};

const findSelectedVideo = (data) => {
  const urlParams = new URLSearchParams(window.location.search);
  const selectedVideo = urlParams.get('selectedVideo');
  return data.find((obj) => Number(obj['S. no']) === Number(selectedVideo));
};

export default async function decorate(block) {
  const resp = await fetch('/tech-talk-tracker.json?sheet=incoming');
  const json = await resp.json();
  const selectedVideo = findSelectedVideo(json.data);
  const divWrap = document.createElement('div');
  const divContent = document.createElement('div');
  divContent.className = 'video-details-content';

  const h6 = document.createElement('h6');
  h6.innerHTML = selectedVideo.Topic;
  const date = document.createElement('p');
  date.innerHTML = `<span class="icon icon-calendar"></span> ${excelDateToJSDate(selectedVideo['Talk Date'])}`;

  const author = document.createElement('p');
  author.innerHTML = `<span class="icon icon-presenter"></span> ${selectedVideo.Presenter}`;

  const videoTags = document.createElement('span');
  let tagsHtml = '';
  selectedVideo.Tags?.split(',').forEach((tag) => {
    tagsHtml += `<span class="video-tags tag">${tag}</span>`;
  });
  videoTags.innerHTML = tagsHtml;

  const videoDescription = document.createElement('p');
  videoDescription.className = 'video-description';
  videoDescription.innerHTML = selectedVideo.Description;

  divContent.append(h6);
  divContent.append(date);
  divContent.append(author);
  divContent.append(videoTags);
  divContent.append(videoDescription);

  divWrap.className = 'video-details';
  divWrap.innerHTML = getVideo(selectedVideo.video, selectedVideo.Topic);
  divWrap.append(divContent);

  block.textContent = '';
  decorateIcons(divWrap);
  block.append(divWrap);
}
