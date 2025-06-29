document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.querySelector('#data-table tbody');
    const dateInput = document.getElementById('date');
    const printBtn = document.getElementById('print-btn');
    const clearBtn = document.getElementById('clear-btn');
    const totalRows = 25;

    const scannerModal = document.getElementById('scanner-modal');
    const videoElement = document.getElementById('video');
    const closeScannerBtn = document.getElementById('close-scanner-btn');
    const codeReader = new ZXing.BrowserMultiFormatReader();
    let selectedInput = null;

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
            if (isEmpty) {
                row.classList.add('is-empty');
            } else {
                row.classList.remove('is-empty');
            }
        });
    }

    function saveData() {
        const data = { date: dateInput.value, table: [] };
        const inputs = document.querySelectorAll('.input-cell');
        inputs.forEach(input => {
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
            const inputs = document.querySelectorAll('.input-cell');
            inputs.forEach(input => {
                if (data.table && data.table[input.dataset.row] && data.table[input.dataset.row][input.dataset.col]) {
                    input.value = data.table[input.dataset.row][input.dataset.col];
                }
            });
        } else {
            const today = new Date();
            dateInput.value = today.toISOString().split('T')[0];
        }
        updateEmptyRowClasses();
    }

    function startScanner(event) {
        if (event.target.classList.contains('scan-btn')) {
            selectedInput = event.target.previousElementSibling;
            scannerModal.style.display = 'flex';
            codeReader.decodeFromVideoDevice(undefined, 'video', (result, err) => {
                if (result) {
                    selectedInput.value = result.text;
                    stopScanner();
                    saveData(); // Save after successful scan
                }
                if (err && !(err instanceof ZXing.NotFoundException)) {
                    console.error(err);
                    stopScanner();
                }
            }).catch(err => console.error(err));
        }
    }

    function stopScanner() {
        codeReader.reset();
        scannerModal.style.display = 'none';
        selectedInput = null;
    }

    // Event Listeners
    printBtn.addEventListener('click', () => window.print());
    clearBtn.addEventListener('click', () => {
        if (confirm('کیا آپ واقعی تمام ڈیٹا صاف کرنا چاہتے ہیں؟')) {
            localStorage.removeItem('sheetData');
            document.querySelectorAll('.input-cell').forEach(input => input.value = '');
            loadData();
        }
    });

    closeScannerBtn.addEventListener('click', stopScanner);
    tableBody.addEventListener('click', startScanner);
    tableBody.addEventListener('input', saveData);
    dateInput.addEventListener('change', saveData);

    // Initial setup
    for (let i = 0; i < totalRows; i++) createRow(i);
    loadData();
});
