import { decorateIcons } from '../../scripts/lib-franklin.js';
import { timeSince, loadFromScript } from '../../scripts/helper.js';

const findSelectedVideo = (data) => {
  const urlParams = new URLSearchParams(window.location.search);
  const selectedVideo = urlParams.get('selectedVideo');
  return data.find((obj) => Number(obj['S. no']) === Number(selectedVideo));
};

const loadComments = async () => {
  const resp = await fetch('/discussions.json?sheet=incoming');
  const json = await resp.json();
  const urlParams = new URLSearchParams(window.location.search);
  const selectedVideo = urlParams.get('selectedVideo');
  const comments = json.data.filter(({ QuestionId }) => QuestionId === selectedVideo);
  let ui = `<div class="hr-theme-slash-2">
            <div class="hr-line"></div>
            <div class="hr-icon"><span class="icon icon-comment"></span></div>
            <div class="hr-line"></div>
            </div>
            <div class="comments-head">
              <span>${comments.length} Comment${comments.length > 1 ? 's' : ''}</span>
              <button class="button button-comment" id="button-comment">Submit your comment</button>
            </div>
            <ul class="comments-main">`;
  let classSlug = 1;
  comments.forEach((data) => {
    classSlug = classSlug > 5 ? 1 : classSlug;
    ui += `<li class="comments-details-li">
          <div class="comments-details">
          <span class="user-name-logo user-circle-${classSlug}">${data.Name.substring(0, 1).toUpperCase()}</span>
          <div class="comments-details-info">
          <p class="comments-name">${data.Name} <span class="ago">${timeSince(new Date(data.Date))}</span></p>
          <p class="comments-response">${data.Response}</p>
          </div>
          </div>
          </li>`;
    classSlug += 1;
  });
  ui += '</ul>';
  return ui;
};

export default async function decorate(block) {
  const resp = await fetch('/ask-a-question.json?sheet=incoming');
  const json = await resp.json();
  const selectedVideo = findSelectedVideo(json.data);
  const divWrap = document.createElement('div');
  const divContent = document.createElement('div');
  divContent.className = 'question-details-content';

  const divComments = document.createElement('div');
  divComments.className = 'comments-container';
  divComments.innerHTML = await loadComments();

  const divComments2 = document.createElement('div');
  // divComments2.className = 'comments-container';
  divComments2.id = 'disqus_thread';
  divComments.innerHTML = '';

  const h6 = document.createElement('h6');
  h6.innerHTML = selectedVideo.Question;

  const divDetails = document.createElement('div');
  divDetails.className = 'rich-text-editor-read-only';
  divDetails.innerHTML = selectedVideo.Details;

  const date = document.createElement('p');
  date.innerHTML = `<span class="icon icon-ago"></span> ${timeSince(new Date(selectedVideo.Date))}`;

  const author = document.createElement('p');
  author.innerHTML = `<span class="icon icon-user-speak"></span> ${selectedVideo.Name}`;

  const divAuthor = document.createElement('div');
  divAuthor.className = 'div-author';
  divAuthor.append(date);
  divAuthor.append(author);

  const videoTags = document.createElement('span');
  let tagsHtml = '';
  selectedVideo.Tags?.split(',').forEach((tag) => {
    tagsHtml += `<span class="question-tags tag">${tag}</span>`;
  });
  videoTags.innerHTML = tagsHtml;

  const videoDescription = document.createElement('p');
  videoDescription.className = 'question-description';
  videoDescription.innerHTML = selectedVideo.Description;

  divContent.append(h6);
  divContent.append(divDetails);
  divContent.append(divAuthor);
  divContent.append(videoTags);
  // divContent.append(divComments);
  // divContent.append(divComments2);

  divWrap.className = 'question-details';
  divWrap.append(divContent);

  block.textContent = '';
  decorateIcons(divWrap);
  block.append(divWrap);
  loadFromScript();
  // document.getElementById('button-comment').addEventListener('click', () => {
  //   document.getElementsByClassName('form block')[0].scrollIntoView({
  //     behavior: 'smooth',
  //   });
  // });

  // (function () { // DON'T EDIT BELOW THIS LINE
  //   const d = document; const
  //     s = d.createElement('script');
  //   s.src = 'https://tech-talk-4.disqus.com/embed.js';
  //   s.setAttribute('data-timestamp', +new Date());
  //   (d.head || d.body).appendChild(s);
  // }());
}
