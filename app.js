let deferredInstallPrompt;
const installButton = document.querySelector('#install-button');
const subjectEntry = document.querySelector('#subject-entry');
const addSubjectButton = document.querySelector('#add-subject');
const subjectList = document.querySelector('#subject-list');
const subjectEntryLabel = document.querySelector('#subject-entry-label');

function addChapter(chapterEntry, chapterList, subjectName) {
  const chapterName = chapterEntry.value.trim();
  if (!chapterName) {
    chapterEntry.focus();
    return;
  }

  const chapter = document.createElement('label');
  chapter.className = 'chapter-item';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = `chapters[${subjectName}][]`;
  checkbox.value = chapterName;

  const chapterText = document.createElement('span');
  chapterText.textContent = chapterName;

  chapter.append(checkbox, chapterText);
  chapterList.append(chapter);
  chapterEntry.value = '';
  chapterEntry.focus();
}

function addSubject() {
  const subjectName = subjectEntry.value.trim();
  if (!subjectName) {
    subjectEntry.focus();
    return;
  }

  const subjectCard = document.createElement('section');
  subjectCard.className = 'subject-card';

  const subjectTitle = document.createElement('h2');
  subjectTitle.textContent = subjectName;

  const chapterLabel = document.createElement('label');
  chapterLabel.textContent = `Chapters for ${subjectName}`;

  const chapterRow = document.createElement('div');
  chapterRow.className = 'chapter-entry-row';

  const chapterEntry = document.createElement('input');
  chapterEntry.type = 'text';
  chapterEntry.placeholder = 'Example: Kinematics';
  chapterEntry.autocomplete = 'off';
  chapterEntry.setAttribute('aria-label', `Add a chapter for ${subjectName}`);

  const addChapterButton = document.createElement('button');
  addChapterButton.type = 'button';
  addChapterButton.textContent = 'Add';

  const chapterList = document.createElement('div');
  chapterList.className = 'chapter-list';
  chapterList.setAttribute('aria-live', 'polite');

  addChapterButton.addEventListener('click', () => addChapter(chapterEntry, chapterList, subjectName));
  chapterEntry.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addChapter(chapterEntry, chapterList, subjectName);
    }
  });

  chapterRow.append(chapterEntry, addChapterButton);
  subjectCard.append(subjectTitle, chapterLabel, chapterRow, chapterList);
  subjectList.append(subjectCard);
  subjectEntry.value = '';
  subjectEntryLabel.textContent = 'Add another subject';
  chapterEntry.focus();
}

addSubjectButton.addEventListener('click', addSubject);
subjectEntry.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    addSubject();
  }
});

function isNudgeInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// Install-button logic: Chrome supplies this prompt only when Nudge is installable.
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;

  if (installButton && !isNudgeInstalled()) {
    installButton.classList.add('is-visible');
  }
});

if (installButton) {
  installButton.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;

    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installButton.classList.remove('is-visible');
  });
}

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  installButton?.classList.remove('is-visible');
});

// Service worker registration keeps the app shell available after the first visit.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Nudge service worker registration failed:', error);
    });
  });
}
