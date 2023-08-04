export function excelDateToJSDate(serial) {
  if (!serial || serial === '') {
    return 'Not Scheduled';
  }
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  const dateInfo = new Date(utcValue * 1000);

  const fractionalDay = serial - Math.floor(serial) + 0.0000001;

  let totalSeconds = Math.floor(86400 * fractionalDay);

  const seconds = totalSeconds % 60;

  totalSeconds -= seconds;

  const hours = Math.floor(totalSeconds / (60 * 60));
  const minutes = Math.floor(totalSeconds / 60) % 60;

  return new Date(
    dateInfo.getFullYear(),
    dateInfo.getMonth(),
    dateInfo.getDate(),
    hours,
    minutes,
    seconds,
  ).toLocaleDateString('en-us', {
    weekday: 'long', year: 'numeric', month: 'short', day: 'numeric',
  });
}

export async function fetchUser() {
  const resp = await fetch('https://admin.hlx.page/login/sselvara/gdc-ui-tech-talk');
  const userData = await resp.json();
  console.log(userData,"...userData")
  if (userData.status === 200) {
    return userData.data;
  }
  return false;
}