document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.querySelector('#data-table tbody');
    const dateInput = document.getElementById('date');
    const printBtn = document.getElementById('print-btn');
    const clearBtn = document.getElementById('clear-btn');
    const totalRows = 25;

    // Function to create and append rows
    function createInitialRows() {
        for (let i = 0; i < totalRows; i++) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="text" class="input-cell" data-row="${i}" data-col="0"></td>
                <td><input type="text" class="input-cell" data-row="${i}" data-col="1"></td>
                <td><input type="text" class="input-cell" data-row="${i}" data-col="2"></td>
            `;
            tableBody.appendChild(row);
        }
    }

    // Function to save data to localStorage
    function saveData() {
        const data = {
            date: dateInput.value,
            table: []
        };
        const inputs = document.querySelectorAll('.input-cell');
        inputs.forEach(input => {
            if (!data.table[input.dataset.row]) {
                data.table[input.dataset.row] = [];
            }
            data.table[input.dataset.row][input.dataset.col] = input.value;
        });
        localStorage.setItem('sheetData', JSON.stringify(data));
    }

    // Function to load data from localStorage
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
             // Set current date if no saved data
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            dateInput.value = `${yyyy}-${mm}-${dd}`;
        }
    }

    // Event Listeners
    printBtn.addEventListener('click', () => {
        window.print();
    });

    clearBtn.addEventListener('click', () => {
        if (confirm('کیا آپ واقعی تمام ڈیٹا صاف کرنا چاہتے ہیں؟')) {
            localStorage.removeItem('sheetData');
            document.querySelectorAll('.input-cell').forEach(input => input.value = '');
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            dateInput.value = `${yyyy}-${mm}-${dd}`;
        }
    });

    // Autosave on input
    tableBody.addEventListener('input', saveData);
    dateInput.addEventListener('change', saveData);

    // Initial setup
    createInitialRows();
    loadData();
});
