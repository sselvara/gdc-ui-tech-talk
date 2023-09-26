function decorateAccordion(el) {
  if (1) {
    const titles = el.querySelectorAll(':scope > div:nth-child(odd)');
    titles.forEach((title) => {
      // title.classList.add('item-title-normal');
      // title.innerHTML = title.querySelector(':scope > div:last-of-type').innerHTML;
      title.nextElementSibling.innerHTML = title.querySelector(':scope > div:last-of-type').innerHTML + title.nextElementSibling.querySelector(':scope > div:last-of-type').innerHTML;
      title.nextElementSibling.classList.add('item-content-normal');
      title.querySelector(':scope > div:last-of-type').remove();
    });
  } else {
    const titles = el.querySelectorAll(':scope > div:nth-child(odd)');
    titles.forEach((title) => {
      title.classList.add('item-title');
      title.innerHTML = title.querySelector(':scope > div:last-of-type').innerHTML;
      title.nextElementSibling.classList.add('item-content');

      // Add a click handler to open the content
      title.addEventListener('click', () => {
        title.classList.toggle('open');
      });
    });
  }
}

const els = document.querySelectorAll('.accordion');
els.forEach((el) => {
  decorateAccordion(el);
});
