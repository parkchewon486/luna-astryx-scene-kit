const PREVIEW_ROOT_ID = 'prompt-switch-root';

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function enhancePromptSwitch(root: HTMLElement) {
  if (root.dataset.uploadPreviewBound === '1') return;
  root.dataset.uploadPreviewBound = '1';

  const modeInputs = Array.from(root.querySelectorAll<HTMLInputElement>('input[name="switch-mode"]'));
  const controls = root.querySelector<HTMLElement>('.promptSwitchControls');
  if (!controls || modeInputs.length === 0) return;

  modeInputs.forEach((input) => {
    const label = input.closest('label');
    const text = label?.querySelector('span');
    if (!text) return;
    text.textContent = input.value === 'edit' ? '이미지 편집' : '이미지 생성';
  });

  const uploadSection = document.createElement('section');
  uploadSection.className = 'promptSwitchUploadPreview';
  uploadSection.dataset.switchUploadPreview = '';
  uploadSection.hidden = true;
  uploadSection.innerHTML = `
    <div class="promptSwitchUploadHeading">
      <div>
        <small>REFERENCE IMAGE</small>
        <strong>참고 이미지 업로드</strong>
      </div>
      <span>PNG · JPG · WEBP</span>
    </div>
    <input type="file" accept="image/png,image/jpeg,image/webp" data-switch-upload-input hidden>
    <div class="promptSwitchDropzone" data-switch-dropzone tabindex="0" role="button" aria-label="참고 이미지 선택">
      <div class="promptSwitchUploadEmpty" data-switch-upload-empty>
        <b>＋</b>
        <strong>이미지를 끌어놓거나 눌러서 선택</strong>
        <p>업로드한 파일은 이 화면에서 미리보기만 돼요.</p>
      </div>
      <div class="promptSwitchUploadFilled" data-switch-upload-filled hidden>
        <img data-switch-upload-image alt="업로드한 참고 이미지 미리보기">
        <div>
          <strong data-switch-upload-name></strong>
          <span data-switch-upload-size></span>
          <p>프롬프트를 복사할 때 이 이미지를 AI에 함께 첨부하면 돼요.</p>
        </div>
      </div>
    </div>
    <div class="promptSwitchUploadActions">
      <button type="button" data-switch-upload-choose>파일 선택</button>
      <button type="button" data-switch-upload-remove disabled>삭제</button>
    </div>
  `;

  controls.insertAdjacentElement('afterend', uploadSection);

  const fileInput = uploadSection.querySelector<HTMLInputElement>('[data-switch-upload-input]');
  const dropzone = uploadSection.querySelector<HTMLElement>('[data-switch-dropzone]');
  const emptyState = uploadSection.querySelector<HTMLElement>('[data-switch-upload-empty]');
  const filledState = uploadSection.querySelector<HTMLElement>('[data-switch-upload-filled]');
  const previewImage = uploadSection.querySelector<HTMLImageElement>('[data-switch-upload-image]');
  const fileName = uploadSection.querySelector<HTMLElement>('[data-switch-upload-name]');
  const fileSize = uploadSection.querySelector<HTMLElement>('[data-switch-upload-size]');
  const chooseButton = uploadSection.querySelector<HTMLButtonElement>('[data-switch-upload-choose]');
  const removeButton = uploadSection.querySelector<HTMLButtonElement>('[data-switch-upload-remove]');
  let previewUrl = '';

  const resetFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = '';
    if (fileInput) fileInput.value = '';
    if (previewImage) previewImage.removeAttribute('src');
    if (emptyState) emptyState.hidden = false;
    if (filledState) filledState.hidden = true;
    if (removeButton) removeButton.disabled = true;
    root.removeAttribute('data-switch-upload-name');
  };

  const applyFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(file);
    if (previewImage) previewImage.src = previewUrl;
    if (fileName) fileName.textContent = file.name;
    if (fileSize) fileSize.textContent = formatFileSize(file.size);
    if (emptyState) emptyState.hidden = true;
    if (filledState) filledState.hidden = false;
    if (removeButton) removeButton.disabled = false;
    root.dataset.switchUploadName = file.name;
  };

  const syncMode = () => {
    const editMode = modeInputs.some((input) => input.checked && input.value === 'edit');
    uploadSection.hidden = !editMode;
  };

  modeInputs.forEach((input) => input.addEventListener('change', syncMode));
  chooseButton?.addEventListener('click', () => fileInput?.click());
  dropzone?.addEventListener('click', () => fileInput?.click());
  dropzone?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    fileInput?.click();
  });
  fileInput?.addEventListener('change', () => applyFile(fileInput.files?.[0]));
  removeButton?.addEventListener('click', resetFile);

  ['dragenter', 'dragover'].forEach((eventName) => {
    dropzone?.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.add('isDragging');
    });
  });
  ['dragleave', 'drop'].forEach((eventName) => {
    dropzone?.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.remove('isDragging');
    });
  });
  dropzone?.addEventListener('drop', (event) => applyFile(event.dataTransfer?.files?.[0]));

  root.querySelector<HTMLElement>('[data-switch-run]')?.addEventListener('click', () => {
    if (!root.dataset.switchUploadName) return;
    window.setTimeout(() => {
      const note = root.querySelector<HTMLElement>('.promptSwitchOutput.active .promptSwitchNote');
      if (!note || note.dataset.uploadNoteAdded === '1') return;
      note.dataset.uploadNoteAdded = '1';
      note.insertAdjacentHTML('beforeend', '<br>업로드한 참고 이미지를 해당 AI에 함께 첨부해 주세요.');
    }, 0);
  });

  syncMode();
}

function mountPromptSwitchPreview() {
  const root = document.getElementById(PREVIEW_ROOT_ID) as HTMLElement | null;
  if (!root) return false;
  enhancePromptSwitch(root);
  return true;
}

function startPromptSwitchPreview() {
  if (mountPromptSwitchPreview()) return;
  const observer = new MutationObserver(() => {
    if (!mountPromptSwitchPreview()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startPromptSwitchPreview, { once: true });
} else {
  startPromptSwitchPreview();
}
