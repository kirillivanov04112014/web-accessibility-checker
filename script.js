const form = document.querySelector('#check-form');
const htmlInput = document.querySelector('#html-input');
const statusMessage = document.querySelector('#status');
const results = document.querySelector('#results');
const issueCount = document.querySelector('#issue-count');
const issueList = document.querySelector('#issue-list');

function inspectHTML(source) {
  const parser = new DOMParser();
  const documentHTML = parser.parseFromString(source, 'text/html');

  const issues = [];

  // Check images for alternative text
  documentHTML.querySelectorAll('img').forEach((image, index) => {
    if (!image.hasAttribute('alt')) {
      issues.push({
        title: `Image ${index + 1} is missing alt text`,
        description:
          'Add an alt attribute to describe the image or use alt="" if it is decorative.'
      });
    }
  });

  // Check form controls for accessible labels
  documentHTML.querySelectorAll('input, select, textarea').forEach((field, index) => {
    const id = field.id;
    const hasLabel = id && documentHTML.querySelector(
      `label[for="${CSS.escape(id)}"]`
    );

    const hasAriaLabel = field.hasAttribute('aria-label') ||
      field.hasAttribute('aria-labelledby');

    const isHidden = field.type === 'hidden';

    if (!isHidden && !hasLabel && !hasAriaLabel) {
      issues.push({
        title: `Form field ${index + 1} has no accessible label`,
        description:
          'Add a connected label, aria-label or aria-labelledby attribute.'
      });
    }
  });

  // Check document language
  if (!documentHTML.documentElement.hasAttribute('lang')) {
    issues.push({
      title: 'Document language is missing',
      description:
        'Add a lang attribute to the HTML element, for example lang="en".'
    });
  }

  // Check for a main landmark
  if (!documentHTML.querySelector('main')) {
    issues.push({
      title: 'Main landmark is missing',
      description:
        'Add a main element around the primary page content.'
    });
  }

  // Check heading structure
  if (!documentHTML.querySelector('h1')) {
    issues.push({
      title: 'Main heading (h1) is missing',
      description:
        'Add an h1 heading describing the main purpose of the page.'
    });
  }

  // Check empty links
  documentHTML.querySelectorAll('a').forEach((link, index) => {
    const hasText = link.textContent.trim().length > 0;
    const hasLabel = link.hasAttribute('aria-label');

    if (!hasText && !hasLabel) {
      issues.push({
        title: `Link ${index + 1} has no accessible name`,
        description:
          'Add descriptive text or an aria-label to the link.'
      });
    }
  });

  return issues;
}

function showResults(issues) {
  issueCount.textContent = issues.length;
  issueList.replaceChildren();

  if (issues.length === 0) {
    const message = document.createElement('article');
    message.className = 'issue-item';

    const title = document.createElement('h3');
    title.textContent = 'No issues found in these checks!';

    const description = document.createElement('p');
    description.textContent =
      'This is a basic automated check, not a complete accessibility audit.';

    message.append(title, description);
    issueList.append(message);
  } else {
    issues.forEach((issue) => {
      const card = document.createElement('article');
      card.className = 'issue-item';

      const title = document.createElement('h3');
      title.textContent = issue.title;

      const description = document.createElement('p');
      description.textContent = issue.description;

      card.append(title, description);
      issueList.append(card);
    });
  }

  results.hidden = false;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const source = htmlInput.value.trim();

  if (!source) {
    statusMessage.textContent = 'Please paste some HTML code first.';
    return;
  }

  try {
    statusMessage.textContent = 'Checking HTML...';

    const issues = inspectHTML(source);
    showResults(issues);

    statusMessage.textContent = 'Accessibility check completed!';
  } catch (error) {
    results.hidden = true;
    statusMessage.textContent = 'Something went wrong. Please try again.';
    console.error(error);
  }
});