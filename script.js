document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.querySelector('#data-table tbody');
    const dateInput = document.getElementById('date');
    const printBtn = document.getElementById('print-btn');
    const clearBtn = document.getElementById('clear-btn');

    // Scanner Elements
    const scannerModal = document.getElementById('scanner-modal');
    const videoElement = document.getElementById('video');
    const closeScannerBtn = document.getElementById('close-scanner-btn');
    const codeReader = new ZXing.BrowserMultiFormatReader();
    let selectedInput = null;

    function createRow(rowIndex) {
        const row = document.createElement('tr');
        row.dataset.rowIndex = rowIndex; // Add index to row
        row.innerHTML = `
            <td><div class="input-container"><input type="text" class="input-cell" data-col="0"></div></td>
            <td><div class="input-container"><input type="text" class="input-cell" data-col="1"></div></td>
            <td>
                <div class="input-container">
                    <input type="text" class="input-cell barcode-input" data-col="2">
                    <button class="scan-btn">Scan</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    }

    function checkAndAddRow(event) {
        const currentRow = event.target.closest('tr');
        const allRows = Array.from(tableBody.querySelectorAll('tr'));
        const isLastRow = currentRow === allRows[allRows.length - 1];

        // If typing in any cell of the last row, add a new one
        if (isLastRow) {
            createRow(allRows.length);
        }
    }

    function updateEmptyRowClasses() {
        tableBody.querySelectorAll('tr').forEach(row => {
            const inputs = row.querySelectorAll('input');
            const isEmpty = ![...inputs].some(input => input.value.trim() !== '');
            row.classList.toggle('is-empty', isEmpty);
        });
    }

    function saveData() {
        const data = { date: dateInput.value, table: [] };
        tableBody.querySelectorAll('tr').forEach((row, rowIndex) => {
            const rowData = [];
            row.querySelectorAll('.input-cell').forEach((input, colIndex) => {
                rowData[colIndex] = input.value;
            });
            // Only save non-empty rows
            if (rowData.some(cell => cell.trim() !== '')) {
                data.table[rowIndex] = rowData;
            }
        });
        localStorage.setItem('sheetData', JSON.stringify(data));
        updateEmptyRowClasses();
    }

    function loadData() {
        // Clear existing rows before loading
        tableBody.innerHTML = '';
        const savedData = localStorage.getItem('sheetData');
        const data = savedData ? JSON.parse(savedData) : { table: [] };
        
        dateInput.value = data.date || new Date().toISOString().split('T')[0];

        if (data.table && data.table.length > 0) {
            data.table.forEach((rowData, rowIndex) => {
                createRow(rowIndex);
                const newRow = tableBody.querySelector(`tr[data-row-index="${rowIndex}"]`);
                newRow.querySelectorAll('.input-cell').forEach((input, colIndex) => {
                    input.value = rowData[colIndex] || '';
                });
            });
        }
        
        // Always ensure there is at least one empty row at the end
        createRow(data.table.length || 0);
        updateEmptyRowClasses();
    }

    function startScanner(event) {
        if (!event.target.classList.contains('scan-btn')) return;
        selectedInput = event.target.previousElementSibling;
        scannerModal.classList.add('is-visible');

        codeReader.decodeFromVideoDevice(undefined, 'video', (result, err) => {
            if (result) {
                selectedInput.value = result.text;
                checkAndAddRow({ target: selectedInput }); // Check if a new row is needed
                stopScanner();
                saveData();
            }
            if (err && !(err instanceof ZXing.NotFoundException)) stopScanner();
        }).catch(err => {
            alert('Could not start camera. Please grant camera permission.');
            stopScanner();
        });
    }

    function stopScanner() {
        codeReader.reset();
        scannerModal.classList.remove('is-visible');
    }

    // --- Event Listeners ---
    printBtn.addEventListener('click', () => window.print());
    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to erase all data?')) {
            localStorage.removeItem('sheetData');
            loadData();
        }
    });

    closeScannerBtn.addEventListener('click', stopScanner);
    tableBody.addEventListener('click', startScanner);
    tableBody.addEventListener('input', (event) => {
        checkAndAddRow(event);
        saveData();
    });
    dateInput.addEventListener('change', saveData);

    // --- Initial Setup ---
    loadData();
});
