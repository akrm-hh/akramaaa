document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('mainContent');
    const addInvoiceBtn = document.getElementById('addInvoiceBtn');
    const addReceiptBtn = document.getElementById('addReceiptBtn');
    const reportsBtn = document.getElementById('reportsBtn');

    addInvoiceBtn.addEventListener('click', () => {
        mainContent.innerHTML = getInvoiceForm();
    });

    addReceiptBtn.addEventListener('click', () => {
        mainContent.innerHTML = getReceiptForm();
    });

    reportsBtn.addEventListener('click', () => {
        mainContent.innerHTML = getReports();
    });
});

let operations = [];

function getInvoiceForm() {
    return `
        <h2>إضافة فاتورة</h2>
        <form id="invoiceForm">
            <div class="form-group">
                <label for="stationName">اسم المحطة:</label>
                <input type="text" id="stationName" name="stationName" required>
            </div>
            <div class="form-group">
                <label for="invoiceDate">التاريخ:</label>
                <input type="date" id="invoiceDate" name="invoiceDate" required>
            </div>
            <div class="form-group">
                <label for="invoiceNumber">رقم الفاتورة:</label>
                <input type="text" id="invoiceNumber" name="invoiceNumber" required>
            </div>
            <div class="form-group">
                <label for="trailerNumber">رقم المقطورة:</label>
                <input type="text" id="trailerNumber" name="trailerNumber">
            </div>
            <div class="form-group">
                <label for="pumpMeterNumber">رقم عداد الطرمبة:</label>
                <input type="text" id="pumpMeterNumber" name="pumpMeterNumber">
            </div>
            <div class="form-group">
                <label for="beforeUnloadMeter">رقم عداد الببتيل قبل التفريغ:</label>
                <input type="text" id="beforeUnloadMeter" name="beforeUnloadMeter">
            </div>
            <div class="form-group">
                <label for="afterUnloadMeter">رقم عداد الببتيل بعد التفريغ:</label>
                <input type="text" id="afterUnloadMeter" name="afterUnloadMeter">
            </div>
            <div class="form-group">
                <label for="unloadedQuantity">الكمية المفرغة:</label>
                <input type="text" id="unloadedQuantity" name="unloadedQuantity" readonly>
            </div>
            <div class="form-group">
                <label for="amount">المبلغ (مدين):</label>
                <input type="text" id="amount" name="amount" readonly>
            </div>
            <div class="form-group">
                <label for="description">البيان:</label>
                <input type="text" id="description" name="description">
            </div>
            <button type="button" onclick="saveInvoice()">حفظ</button>
            <button type="button" onclick="goBack()">رجوع</button>
        </form>
    `;
}

function getReceiptForm() {
    return `
        <h2>إضافة سند قبض</h2>
        <form id="receiptForm">
            <div class="form-group">
                <label for="stationName">اسم المحطة:</label>
                <input type="text" id="stationName" name="stationName" required>
            </div>
            <div class="form-group">
                <label for="receiptDate">التاريخ:</label>
                <input type="date" id="receiptDate" name="receiptDate" required>
            </div>
            <div class="form-group">
                <label for="amount">المبلغ (دائن):</label>
                <input type="text" id="amount" name="amount" required>
            </div>
            <div class="form-group">
                <label for="description">البيان:</label>
                <input type="text" id="description" name="description">
            </div>
            <button type="button" onclick="saveReceipt()">حفظ</button>
            <button type="button" onclick="goBack()">رجوع</button>
        </form>
    `;
}

function getReports() {
    return `
        <h2>التقارير</h2>
        <button onclick="showSalesReport()">تقرير إجمالي المبيعات</button>
        <button onclick="showOperationsLog()">سجل العمليات</button>
        <button onclick="showTrailersReport()">تقرير المقطورات</button>
        <div id="reportContent"></div>
    `;
}

function saveInvoice() {
    const form = document.getElementById('invoiceForm');
    const invoice = {
        "مبلغ الفاتورة": (form.afterUnloadMeter.value - form.beforeUnloadMeter.value) * 315,
        "مبلغ سند القبض": 0,
        "الرصيد": 0,
        "التاريخ": form.invoiceDate.value,
        "البيان": form.description.value,
        "اسم المحطة": form.stationName.value,
        "رقم عداد الطرمبة": form.pumpMeterNumber.value,
        "رقم المقطورة": form.trailerNumber.value,
        "رقم عداد الطرمبة قبل التفريغ": form.beforeUnloadMeter.value,
        "رقم عداد الطرمبة بعد التفريغ": form.afterUnloadMeter.value,
        "الكمية المفرغة": form.afterUnloadMeter.value - form.beforeUnloadMeter.value,
    };
    operations.push(invoice);
    updateBalance();
    alert('تم الحفظ');
}

function saveReceipt() {
    const form = document.getElementById('receiptForm');
    const receipt = {
        "مبلغ الفاتورة": 0,
        "مبلغ سند القبض": parseFloat(form.amount.value),
        "الرصيد": 0,
        "التاريخ": form.receiptDate.value,
        "البيان": form.description.value,
        "اسم المحطة": form.stationName.value,
        "رقم عداد الطرمبة": '',
        "رقم المقطورة": '',
        "رقم عداد الطرمبة قبل التفريغ": '',
        "رقم عداد الطرمبة بعد التفريغ": '',
        "الكمية المفرغة": '',
    };
    operations.push(receipt);
    updateBalance();
    alert('تم الحفظ');
}

function updateBalance() {
    let balance = 0;
    operations.forEach(op => {
        balance += op["مبلغ الفاتورة"] - op["مبلغ سند القبض"];
        op["الرصيد"] = balance;
    });
}

function showOperationsLog() {
    let tableContent = `
        <div>
            <input type="text" id="searchStation" placeholder="بحث باسم المحطة">
            <input type="date" id="searchFromDate">
            <input type="date" id="searchToDate">
            <button onclick="searchOperations()">بحث</button>
            <button onclick="clearSearch()">إلغاء البحث</button>
            <button onclick="printTable()">طباعة</button>
            <button onclick="exportToExcel()">تصدير إلى Excel</button>
            <input type="file" id="importFile" accept=".xlsx" onchange="importFromExcel(event)">
        </div>
        <table>
            <thead>
                <tr>
                    <th>مبلغ الفاتورة</th>
                    <th>مبلغ سند القبض</th>
                    <th>الرصيد</th>
                    <th>التاريخ</th>
                    <th>البيان</th>
                    <th>اسم المحطة</th>
                    <th>رقم عداد الطرمبة</th>
                    <th>رقم المقطورة</th>
                    <th>رقم عداد الطرمبة قبل التفريغ</th>
                    <th>رقم عداد الطرمبة بعد التفريغ</th>
                    <th>الكمية المفرغة</th>
                    <th>تعديل</th>
                </tr>
            </thead>
            <tbody>
    `;

    let totalInvoices = 0;
    let totalReceipts = 0;
    let totalQuantity = 0;
    let balance = 0;

    operations.forEach((op, index) => {
        const invoiceAmount = op["مبلغ الفاتورة"];
        const receiptAmount = op["مبلغ سند القبض"];
        totalInvoices += invoiceAmount;
        totalReceipts += receiptAmount;
        totalQuantity += op["الكمية المفرغة"] || 0;
        balance += invoiceAmount - receiptAmount;
        op["الرصيد"] = balance;

        tableContent += `
            <tr>
                <td>${invoiceAmount}</td>
                <td>${receiptAmount}</td>
                <td>${op["الرصيد"]}</td>
                <td>${new Date(op["التاريخ"]).toLocaleDateString('en-GB')}</td>
                <td>${op["البيان"]}</td>
                <td>${op["اسم المحطة"]}</td>
                <td>${op["رقم عداد الطرمبة"] || ''}</td>
                <td>${op["رقم المقطورة"] || ''}</td>
                <td>${op["رقم عداد الطرمبة قبل التفريغ"] || ''}</td>
                <td>${op["رقم عداد الطرمبة بعد التفريغ"] || ''}</td>
                <td>${op["الكمية المفرغة"] || ''}</td>
                <td><button onclick="editRecord(${index})">تعديل</button></td>
            </tr>
        `;
    });

    const balanceText = balance >= 0 ? 'إجمالي الرصيد عليكم' : 'إجمالي الرصيد لكم';

    tableContent += `
            </tbody>
            <tfoot>
                <tr>
                    <td>${totalInvoices}</td>
                    <td>${totalReceipts}</td>
                    <td>${balance}</td>
                    <td colspan="6">${balanceText}</td>
                    <td>${totalQuantity}</td>
                </tr>
            </tfoot>
        </table>
    `;

    document.getElementById('reportContent').innerHTML = tableContent;
}

function searchOperations() {
    const searchStation = document.getElementById('searchStation').value.toLowerCase();
    const searchFromDate = document.getElementById('searchFromDate').value;
    const searchToDate = document.getElementById('searchToDate').value;

    const filteredOperations = operations.filter(op => {
        const stationMatch = op["اسم المحطة"].toLowerCase().includes(searchStation);
        const dateMatch = (!searchFromDate || new Date(op["التاريخ"]) >= new Date(searchFromDate)) &&
                          (!searchToDate || new Date(op["التاريخ"]) <= new Date(searchToDate));
        return stationMatch && dateMatch;
    });

    let tableContent = `
        <div>
            <input type="text" id="searchStation" placeholder="بحث باسم المحطة">
            <input type="date" id="searchFromDate">
            <input type="date" id="searchToDate">
            <button onclick="searchOperations()">بحث</button>
            <button onclick="clearSearch()">إلغاء البحث</button>
            <button onclick="printTable()">طباعة</button>
            <button onclick="exportToExcel()">تصدير إلى Excel</button>
            <input type="file" id="importFile" accept=".xlsx" onchange="importFromExcel(event)">
        </div>
        <table>
            <thead>
                <tr>
                    <th>مبلغ الفاتورة</th>
                    <th>مبلغ سند القبض</th>
                    <th>الرصيد</th>
                    <th>التاريخ</th>
                    <th>البيان</th>
                    <th>اسم المحطة</th>
                    <th>رقم عداد الطرمبة</th>
                    <th>رقم عداد الطرمبة قبل التفريغ</th>
                    <th>رقم عداد الطرمبة بعد التفريغ</th>
                    <th>الكمية المفرغة</th>
                </tr>
            </thead>
            <tbody>
    `;

    let totalInvoices = 0;
    let totalReceipts = 0;
    let totalQuantity = 0;
    let balance = 0;

    filteredOperations.forEach(op => {
        const invoiceAmount = op["مبلغ الفاتورة"];
        const receiptAmount = op["مبلغ سند القبض"];
        totalInvoices += invoiceAmount;
        totalReceipts += receiptAmount;
        totalQuantity += op["الكمية المفرغة"] || 0;
        balance += invoiceAmount - receiptAmount;
        op["الرصيد"] = balance;

        tableContent += `
            <tr>
                <td>${invoiceAmount}</td>
                <td>${receiptAmount}</td>
                <td>${op["الرصيد"]}</td>
                <td>${new Date(op["التاريخ"]).toLocaleDateString('en-GB')}</td>
                <td>${op["البيان"]}</td>
                <td>${op["اسم المحطة"]}</td>
                <td>${op["رقم عداد الطرمبة"] || ''}</td>
                <td>${op["رقم عداد الطرمبة قبل التفريغ"] || ''}</td>
                <td>${op["رقم عداد الطرمبة بعد التفريغ"] || ''}</td>
                <td>${op["الكمية المفرغة"] || ''}</td>
            </tr>
        `;
    });

    const balanceText = balance >= 0 ? 'إجمالي الرصيد عليكم' : 'إجمالي الرصيد لكم';

    tableContent += `
            </tbody>
            <tfoot>
                <tr>
                    <td>${totalInvoices}</td>
                    <td>${totalReceipts}</td>
                    <td>${balance}</td>
                    <td colspan="6">${balanceText}</td>
                    <td>${totalQuantity}</td>
                </tr>
            </tfoot>
        </table>
    `;

    document.getElementById('reportContent').innerHTML = tableContent;
}

function clearSearch() {
    document.getElementById('searchStation').value = '';
    document.getElementById('searchFromDate').value = '';
    document.getElementById('searchToDate').value = '';
    showOperationsLog();
}

function printTable() {
    const printContent = document.getElementById('reportContent').innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = `<table>${printContent}</table>`;
    window.print();
    document.body.innerHTML = originalContent;
}

function exportToExcel() {
    const ws = XLSX.utils.json_to_sheet(operations, {header: [
        "مبلغ الفاتورة",
        "مبلغ سند القبض",
        "الرصيد",
        "التاريخ",
        "البيان",
        "اسم المحطة",
        "رقم عداد الطرمبة",
        "رقم المقطورة",
        "رقم عداد الطرمبة قبل التفريغ",
        "رقم عداد الطرمبة بعد التفريغ",
        "الكمية المفرغة"
    ]});
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Operations");
    XLSX.writeFile(wb, "operations.xlsx");
}

function fixExcelDate(excelDate) {
    let date = new Date((excelDate - 25569) * 86400 * 1000); // تحويل الرقم إلى تاريخ
    return date.toISOString().split('T')[0]; // إرجاع التاريخ بصيغة yyyy-mm-dd
}

function handleFile(event) {
    let file = event.target.files[0];
    let reader = new FileReader();

    reader.onload = function(e) {
        let data = new Uint8Array(e.target.result);
        let workbook = XLSX.read(data, { type: 'array' });
        let sheetName = workbook.SheetNames[0];
        let sheet = workbook.Sheets[sheetName];

        let jsonData = XLSX.utils.sheet_to_json(sheet, {
            raw: true, // معالجة القيم كـ نصوص مفهومة
            defval: '' // تعيين القيم الافتراضية للخلايا الفارغة
        });

        // تصحيح التواريخ يدويًا إذا لزم الأمر
        jsonData.forEach(row => {
            if (row["التاريخ"] && !isNaN(row["التاريخ"])) { // استبدل "التاريخ" باسم العمود الفعلي لديك
                row["التاريخ"] = fixExcelDate(row["التاريخ"]);
            }
        });

        operations = operations.concat(jsonData);
        updateBalance();
        showOperationsLog();
    };

    reader.readAsArrayBuffer(file);
}

function importFromExcel(event) {
    handleFile(event);
}

function showSalesReport() {
    const salesReport = operations.reduce((acc, op) => {
        if (!acc[op["اسم المحطة"]]) {
            acc[op["اسم المحطة"]] = { quantity: 0, balance: 0 };
        }
        acc[op["اسم المحطة"]].quantity += op["الكمية المفرغة"] || 0;
        acc[op["اسم المحطة"]].balance += op["مبلغ الفاتورة"] - op["مبلغ سند القبض"];
        return acc;
    }, {});

    let tableContent = `
        <div>
            <button onclick="printTable()">طباعة</button>
        </div>
        <table>
            <thead>
                <tr>
                    <th>اسم المحطة</th>
                    <th>الكمية</th>
                    <th>الرصيد</th>
                </tr>
            </thead>
            <tbody>
    `;

    let totalQuantity = 0;
    let totalBalance = 0;

    for (const station in salesReport) {
        totalQuantity += salesReport[station].quantity;
        totalBalance += salesReport[station].balance;

        tableContent += `
            <tr>
                <td>${station}</td>
                <td>${salesReport[station].quantity}</td>
                <td>${salesReport[station].balance}</td>
            </tr>
        `;
    }

    tableContent += `
            </tbody>
            <tfoot>
                <tr>
                    <td>إجمالي</td>
                    <td>${totalQuantity}</td>
                    <td>${totalBalance}</td>
                </tr>
            </tfoot>
        </table>
    `;

    document.getElementById('reportContent').innerHTML = tableContent;
}

function showTrailersReport() {
    let tableContent = `
        <div>
            <input type="text" id="searchTrailerNumber" placeholder="بحث برقم المقطورة">
            <button onclick="searchTrailers()">بحث</button>
            <button onclick="clearTrailerSearch()">إلغاء البحث</button>
        </div>
        <table id="trailersTable">
            <thead>
                <tr>
                    <th>رقم المقطورة</th>
                    <th>اسم المحطة</th>
                    <th>التاريخ</th>
                    <th>الكمية المفرغة</th>
                </tr>
            </thead>
            <tbody>
    `;

    let totalQuantity = 0;

    operations.forEach(op => {
        if (op["رقم المقطورة"] && op["الكمية المفرغة"]) {
            tableContent += `
                <tr>
                    <td>${op["رقم المقطورة"]}</td>
                    <td>${op["اسم المحطة"]}</td>
                    <td>${new Date(op["التاريخ"]).toLocaleDateString('en-GB')}</td>
                    <td>${op["الكمية المفرغة"]}</td>
                </tr>
            `;
            totalQuantity += op["الكمية المفرغة"];
        }
    });

    tableContent += `
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3">إجمالي الكمية المفرغة</td>
                    <td>${totalQuantity}</td>
                </tr>
            </tfoot>
        </table>
    `;

    document.getElementById('reportContent').innerHTML = tableContent;
}

function searchTrailers() {
    const searchTrailerNumber = document.getElementById('searchTrailerNumber').value.toLowerCase();

    const filteredOperations = operations.filter(op => {
        return op["رقم المقطورة"].toLowerCase().includes(searchTrailerNumber);
    });

    let tableContent = `
        <div>
            <input type="text" id="searchTrailerNumber" placeholder="بحث برقم المقطورة">
            <button onclick="searchTrailers()">بحث</button>
            <button onclick="clearTrailerSearch()">إلغاء البحث</button>
        </div>
        <table id="trailersTable">
            <thead>
                <tr>
                    <th>رقم المقطورة</th>
                    <th>اسم المحطة</th>
                    <th>التاريخ</th>
                    <th>الكمية المفرغة</th>
                </tr>
            </thead>
            <tbody>
    `;

    let totalQuantity = 0;

    filteredOperations.forEach(op => {
        if (op["رقم المقطورة"] && op["الكمية المفرغة"]) {
            tableContent += `
                <tr>
                    <td>${op["رقم المقطورة"]}</td>
                    <td>${op["اسم المحطة"]}</td>
                    <td>${new Date(op["التاريخ"]).toLocaleDateString('en-GB')}</td>
                    <td>${op["الكمية المفرغة"]}</td>
                </tr>
            `;
            totalQuantity += op["الكمية المفرغة"];
        }
    });

    tableContent += `
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3">إجمالي الكمية المفرغة</td>
                    <td>${totalQuantity}</td>
                </tr>
            </tfoot>
        </table>
    `;

    document.getElementById('reportContent').innerHTML = tableContent;
}

function clearTrailerSearch() {
    document.getElementById('searchTrailerNumber').value = '';
    showTrailersReport();
}

function goBack() {
    document.getElementById('mainContent').innerHTML = '';
}

function editRecord(index) {
    const record = operations[index];
    const editForm = `
        <div class="modal">
            <div class="modal-content">
                <span class="close" onclick="closeModal()">&times;</span>
                <h2>تعديل السجل</h2>
                <form id="editForm">
                    <div class="form-group">
                        <label for="editStationName">اسم المحطة:</label>
                        <input type="text" id="editStationName" name="editStationName" value="${record["اسم المحطة"]}" required>
                    </div>
                    <div class="form-group">
                        <label for="editDate">التاريخ:</label>
                        <input type="date" id="editDate" name="editDate" value="${record["التاريخ"]}" required>
                    </div>
                    <div class="form-group">
                        <label for="editInvoiceAmount">مبلغ الفاتورة:</label>
                        <input type="text" id="editInvoiceAmount" name="editInvoiceAmount" value="${record["مبلغ الفاتورة"]}" required>
                    </div>
                    <div class="form-group">
                        <label for="editReceiptAmount">مبلغ سند القبض:</label>
                        <input type="text" id="editReceiptAmount" name="editReceiptAmount" value="${record["مبلغ سند القبض"]}" required>
                    </div>
                    <div class="form-group">
                        <label for="editDescription">البيان:</label>
                        <input type="text" id="editDescription" name="editDescription" value="${record["البيان"]}">
                    </div>
                    <div class="form-group">
                        <label for="editPumpMeterNumber">رقم عداد الطرمبة:</label>
                        <input type="text" id="editPumpMeterNumber" name="editPumpMeterNumber" value="${record["رقم عداد الطرمبة"]}">
                    </div>
                    <div class="form-group">
                        <label for="editTrailerNumber">رقم المقطورة:</label>
                        <input type="text" id="editTrailerNumber" name="editTrailerNumber" value="${record["رقم المقطورة"]}">
                    </div>
                    <div class="form-group">
                        <label for="editBeforeUnloadMeter">رقم عداد الطرمبة قبل التفريغ:</label>
                        <input type="text" id="editBeforeUnloadMeter" name="editBeforeUnloadMeter" value="${record["رقم عداد الطرمبة قبل التفريغ"]}">
                    </div>
                    <div class="form-group">
                        <label for="editAfterUnloadMeter">رقم عداد الطرمبة بعد التفريغ:</label>
                        <input type="text" id="editAfterUnloadMeter" name="editAfterUnloadMeter" value="${record["رقم عداد الطرمبة بعد التفريغ"]}">
                    </div>
                    <div class="form-group">
                        <label for="editUnloadedQuantity">الكمية المفرغة:</label>
                        <input type="text" id="editUnloadedQuantity" name="editUnloadedQuantity" value="${record["الكمية المفرغة"]}" readonly>
                    </div>
                    <button type="button" onclick="saveEdit(${index})">حفظ التعديل</button>
                    <button type="button" onclick="deleteRecord(${index})">حذف</button>
                    <button type="button" onclick="closeModal()">إغلاق</button>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', editForm);
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

function saveEdit(index) {
    const form = document.getElementById('editForm');
    operations[index] = {
        "مبلغ الفاتورة": parseFloat(form.editInvoiceAmount.value),
        "مبلغ سند القبض": parseFloat(form.editReceiptAmount.value),
        "الرصيد": 0,
        "التاريخ": form.editDate.value,
        "البيان": form.editDescription.value,
        "اسم المحطة": form.editStationName.value,
        "رقم عداد الطرمبة": form.editPumpMeterNumber.value,
        "رقم المقطورة": form.editTrailerNumber.value,
        "رقم عداد الطرمبة قبل التفريغ": form.editBeforeUnloadMeter.value,
        "رقم عداد الطرمبة بعد التفريغ": form.editAfterUnloadMeter.value,
        "الكمية المفرغة": parseFloat(form.editUnloadedQuantity.value)
    };
    updateBalance();
    closeModal();
    showOperationsLog();
}

function deleteRecord(index) {
    operations.splice(index, 1);
    updateBalance();
    closeModal();
    showOperationsLog();
}
