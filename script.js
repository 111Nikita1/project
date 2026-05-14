const ALPHABETS = {
    ruLower: 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя',
    ruUpper: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ',
    enLower: 'abcdefghijklmnopqrstuvwxyz',
    enUpper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
};

function showMessage(text, isError = false) {
    const msgBox = document.getElementById('messageBox');
    msgBox.textContent = text;
    msgBox.className = 'message ' + (isError ? 'error' : 'success');
    setTimeout(() => msgBox.className = 'message', 3000);
}

function caesarCipher(text, shift) {
    shift = parseInt(shift, 10);
    if (isNaN(shift)) shift = 0;
    
    return text.split('').map(char => {
        let idx = ALPHABETS.ruLower.indexOf(char);
        if (idx !== -1) {
            const newIdx = (idx + shift) % ALPHABETS.ruLower.length;
            return ALPHABETS.ruLower[newIdx < 0 ? newIdx + ALPHABETS.ruLower.length : newIdx];
        }
        idx = ALPHABETS.ruUpper.indexOf(char);
        if (idx !== -1) {
            const newIdx = (idx + shift) % ALPHABETS.ruUpper.length;
            return ALPHABETS.ruUpper[newIdx < 0 ? newIdx + ALPHABETS.ruUpper.length : newIdx];
        }
        idx = ALPHABETS.enLower.indexOf(char);
        if (idx !== -1) {
            const newIdx = (idx + shift) % ALPHABETS.enLower.length;
            return ALPHABETS.enLower[newIdx < 0 ? newIdx + ALPHABETS.enLower.length : newIdx];
        }
        idx = ALPHABETS.enUpper.indexOf(char);
        if (idx !== -1) {
            const newIdx = (idx + shift) % ALPHABETS.enUpper.length;
            return ALPHABETS.enUpper[newIdx < 0 ? newIdx + ALPHABETS.enUpper.length : newIdx];
        }
        return char;
    }).join('');
}

function caesarDecipher(text, shift) {
    return caesarCipher(text, -parseInt(shift, 10));
}

function atbashTransform(text) {
    return text.split('').map(char => {
        let idx = ALPHABETS.ruLower.indexOf(char);
        if (idx !== -1) return ALPHABETS.ruLower[ALPHABETS.ruLower.length - 1 - idx];
        idx = ALPHABETS.ruUpper.indexOf(char);
        if (idx !== -1) return ALPHABETS.ruUpper[ALPHABETS.ruUpper.length - 1 - idx];
        idx = ALPHABETS.enLower.indexOf(char);
        if (idx !== -1) return ALPHABETS.enLower[ALPHABETS.enLower.length - 1 - idx];
        idx = ALPHABETS.enUpper.indexOf(char);
        if (idx !== -1) return ALPHABETS.enUpper[ALPHABETS.enUpper.length - 1 - idx];
        return char;
    }).join('');
}

const atbashCipher = atbashTransform;
const atbashDecipher = atbashTransform;

function saveToFile(content) {
    if (!content.trim()) {
        showMessage('Нет данных для сохранения', true);
        return;
    }
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'encrypted_message.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showMessage('Файл сохранён');
}

function loadFromFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('inputText').value = e.target.result;
        showMessage('Файл загружен');
    };
    reader.onerror = () => {
        showMessage('Ошибка чтения файла', true);
    };
    reader.readAsText(file, 'UTF-8');
}

document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const cipherSelect = document.getElementById('cipherSelect');
    const shiftContainer = document.getElementById('shiftContainer');
    const shiftInput = document.getElementById('shiftInput');
    const encryptBtn = document.getElementById('encryptBtn');
    const decryptBtn = document.getElementById('decryptBtn');
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    const fileInput = document.getElementById('fileInput');
    const outputArea = document.getElementById('outputArea');

    function toggleShiftVisibility() {
        shiftContainer.style.display = cipherSelect.value === 'caesar' ? 'block' : 'none';
    }
    cipherSelect.addEventListener('change', toggleShiftVisibility);
    toggleShiftVisibility(); 

    function validateInput() {
        const text = inputText.value.trim();
        if (!text) {
            showMessage('Введите текст для обработки', true);
            return false;
        }
        if (cipherSelect.value === 'caesar') {
            const shift = parseInt(shiftInput.value, 10);
            if (isNaN(shift)) {
                showMessage('Сдвиг должен быть числом', true);
                return false;
            }
        }
        return true;
    }

    function process(encryptMode = true) {
        if (!validateInput()) return;
        
        const text = inputText.value;
        const algorithm = cipherSelect.value;
        let result = '';
        
        try {
            if (algorithm === 'caesar') {
                const shift = parseInt(shiftInput.value, 10);
                result = encryptMode ? caesarCipher(text, shift) : caesarDecipher(text, shift);
            } else { 
                result = encryptMode ? atbashCipher(text) : atbashDecipher(text);
            }
            outputArea.textContent = result;
            showMessage(encryptMode ? 'Текст зашифрован' : 'Текст расшифрован');
        } catch (e) {
            showMessage('Ошибка обработки: ' + e.message, true);
        }
    }

    encryptBtn.addEventListener('click', () => process(true));
    decryptBtn.addEventListener('click', () => process(false));

    saveBtn.addEventListener('click', () => {
        saveToFile(outputArea.textContent);
    });

    loadBtn.addEventListener('click', () => {
        fileInput.click();
    });
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) loadFromFile(file);
        fileInput.value = ''; 
    });
});
