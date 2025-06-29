document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('table-body');
    const dateInput = document.getElementById('date');
    const printBtn = document.getElementById('print-btn');
    const clearBtn = document.getElementById('clear-btn');
    const scannerModal = document.getElementById('scanner-modal');
    const videoElement = document.getElementById('video');
    const closeScannerBtn = document.getElementById('close-scanner-btn');
    const codeReader = new ZXing.BrowserMultiFormatReader();
    let selectedInput = null;

    function createRow(rowData = ['', '', '']) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" class="input-cell" value="${rowData[0]}"></td>
            <td><input type="text" class="input-cell" value="${rowData[1]}"></td>
            <td>
                <div class="input-container">
                    <input type="text" class="input-cell barcode-input" value="${rowData[2]}">
                    <button class="scan-btn">Scan</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    }

    function checkAndAddRow() {
        const lastRow = tableBody.querySelector('tr:last-child');
        if (!lastRow) return; // a guard in case table is empty

        const inputs = lastRow.querySelectorAll('input');
        const isLastRowFilled = [...inputs].some(input => input.value.trim() !== '');

        if (isLastRowFilled) {
            createRow();
        }
    }

    function saveData() {
        const data = { date: dateInput.value, table: [] };
        tableBody.querySelectorAll('tr').forEach(row => {
            const rowData = [...row.querySelectorAll('.input-cell')].map(input => input.value);
            // Only save the row if it's not completely empty
            if (rowData.some(cell => cell.trim() !== '')) {
                data.table.push(rowData);
            }
        });
        localStorage.setItem('sheetData', JSON.stringify(data));
        updateEmptyRowClasses();
    }

    function loadData() {
        tableBody.innerHTML = ''; // Clear table before loading
        const savedData = JSON.parse(localStorage.getItem('sheetData'));
        
        dateInput.value = savedData?.date || new Date().toISOString().split('T')[0];

        if (savedData && savedData.table && savedData.table.length > 0) {
            savedData.table.forEach(rowData => createRow(rowData));
        }

        // Ensure there are at least 2 rows initially, and always one empty row at the end
        while (tableBody.rows.length < 2) {
            createRow();
        }
        checkAndAddRow();
        updateEmptyRowClasses();
    }
    
    function updateEmptyRowClasses() {
        tableBody.querySelectorAll('tr').forEach(row => {
            const isEmpty = ![...row.querySelectorAll('input')].some(input => input.value.trim() !== '');
            row.classList.toggle('is-empty', isEmpty);
        });
    }

    function startScanner(event) {
        if (!event.target.classList.contains('scan-btn')) return;
        selectedInput = event.target.closest('.input-container').querySelector('input');
        scannerModal.classList.add('is-visible');

        codeReader.decodeFromVideoDevice(undefined, 'video', (result, err) => {
            if (result) {
                selectedInput.value = result.text;
                stopScanner();
                tableBody.dispatchEvent(new Event('input', { bubbles: true })); // Trigger save and add row check
            }
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
    tableBody.addEventListener('input', () => {
        saveData();
        checkAndAddRow();
    });
    dateInput.addEventListener('change', saveData);

    // --- Initial Setup ---
    loadData();
});
