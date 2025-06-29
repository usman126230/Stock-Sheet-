document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.querySelector('#data-table tbody');
    const dateInput = document.getElementById('date');
    const printBtn = document.getElementById('print-btn');
    const clearBtn = document.getElementById('clear-btn');
    const totalRows = 25;

    // Scanner Elements
    const scannerModal = document.getElementById('scanner-modal');
    const videoElement = document.getElementById('video');
    const closeScannerBtn = document.getElementById('close-scanner-btn');
    const codeReader = new ZXing.BrowserMultiFormatReader();
    let selectedInput = null;

    // Change button text to English to avoid confusion
    printBtn.textContent = 'Print / Save as PDF';
    clearBtn.textContent = 'Erase All Data';
    closeScannerBtn.textContent = 'Close';
    document.querySelector('.modal-content p').textContent = 'Point camera at the barcode';

    function createRow(rowIndex) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><div class="input-container"><input type="text" class="input-cell" data-row="${rowIndex}" data-col="0"></div></td>
            <td><div class="input-container"><input type="text" class="input-cell" data-row="${rowIndex}" data-col="1"></div></td>
            <td>
                <div class="input-container">
                    <input type="text" class="input-cell barcode-input" data-row="${rowIndex}" data-col="2">
                    <button class="scan-btn">Scan</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    }

    function updateEmptyRowClasses() {
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            let isEmpty = true;
            inputs.forEach(input => {
                if (input.value.trim() !== '') {
                    isEmpty = false;
                }
            });
            row.classList.toggle('is-empty', isEmpty);
        });
    }

    function saveData() {
        const data = { date: dateInput.value, table: [] };
        document.querySelectorAll('.input-cell').forEach(input => {
            if (!data.table[input.dataset.row]) data.table[input.dataset.row] = [];
            data.table[input.dataset.row][input.dataset.col] = input.value;
        });
        localStorage.setItem('sheetData', JSON.stringify(data));
        updateEmptyRowClasses();
    }

    function loadData() {
        const savedData = localStorage.getItem('sheetData');
        if (savedData) {
            const data = JSON.parse(savedData);
            dateInput.value = data.date || '';
            document.querySelectorAll('.input-cell').forEach(input => {
                if (data.table?.[input.dataset.row]?.[input.dataset.col]) {
                    input.value = data.table[input.dataset.row][input.dataset.col];
                }
            });
        } else {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
        updateEmptyRowClasses();
    }

    function startScanner(event) {
        if (!event.target.classList.contains('scan-btn')) return;

        selectedInput = event.target.previousElementSibling;
        scannerModal.style.display = 'flex';

        codeReader.decodeFromVideoDevice(undefined, 'video', (result, err) => {
            if (result) {
                selectedInput.value = result.text;
                stopScanner();
                saveData();
            }
            if (err && !(err instanceof ZXing.NotFoundException)) {
                console.error(err);
                alert('An error occurred during scanning.');
                stopScanner();
            }
        }).catch(err => {
            console.error(err);
            alert('Could not start camera. Please make sure you grant camera permission. This feature works best in Chrome on Android.');
            stopScanner();
        });
    }

    function stopScanner() {
        codeReader.reset();
        scannerModal.style.display = 'none';
        selectedInput = null;
    }

    // --- Event Listeners ---
    printBtn.addEventListener('click', () => window.print());

    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to erase all data?')) {
            localStorage.removeItem('sheetData');
            document.querySelectorAll('.input-cell').forEach(input => input.value = '');
            loadData();
        }
    });

    closeScannerBtn.addEventListener('click', stopScanner);
    tableBody.addEventListener('click', startScanner);
    tableBody.addEventListener('input', saveData);
    dateInput.addEventListener('change', saveData);

    // --- Initial Setup ---
    for (let i = 0; i < totalRows; i++) createRow(i);
    loadData();
});
