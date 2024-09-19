document.getElementById('loginButton').addEventListener('click', () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const loginErrorMessage = document.getElementById('loginErrorMessage');

    // Reset error message
    loginErrorMessage.style.display = 'none';

    // Check for valid user credentials
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Successful login
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('uploadContainer').style.display = 'block';
    } else {
        // Login failed
        loginErrorMessage.textContent = "Invalid username or password.";
        loginErrorMessage.style.display = 'block';
    }
});

document.getElementById('uploadButton').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const errorMessage = document.getElementById('errorMessage');

    errorMessage.style.display = 'none'; // Reset error message

    if (!file) {
        showError("Please upload an Excel file.");
        return;
    }

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        showError("Invalid file format. Please upload an .xlsx or .xls file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        if (!jsonData || jsonData.length === 0) {
            showError("Uploaded file is empty or not formatted correctly.");
            return;
        }

        processExcelData(jsonData);
    };
    reader.readAsArrayBuffer(file);
});

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function processExcelData(data) {
    let textFileContent = '';
    let excelData = [];
    const header = [
        "IP Number (10 Digits)",
        "IP Name (Only alphabets and space)",
        "No of Days for which wages paid/payable during the month",
        "Total Monthly Wages",
        "Reason Code for Zero workings days(numeric only; provide 0 for all other reasons- Click on the link for reference)",
        "Last Working Day (Format DD/MM/YYYY or DD-MM-YYYY)"
    ];
    
    const monthDays = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

    for (let i = 1; i < data.length; i++) {
        const row = data[i];

        // Assign values from the row, allowing blank fields for doe
        const [ip_no, uan, name, epf_wage, eps_wage, edli_wage, gross_wage, ncp, doe] = row;

        const epfRounded = Math.round(epf_wage * 12 / 100);
        const epsRounded = Math.round(eps_wage * 8.33 / 100);
        const difference = epfRounded - epsRounded;

        textFileContent += `${uan || ''}#~#${name || ''}#~#${gross_wage || ''}#~#${epf_wage || ''}#~#${eps_wage || ''}#~#${epfRounded}#~#${epsRounded}#~#${difference}#~#${ncp || ''}#~#0\n`;

        const daysPaid = monthDays - (ncp || 0);
        
        // Standardize date format to dd/mm/yyyy or leave blank
        const formattedDoe = doe ? formatDate(doe) : '';
        excelData.push([
            ip_no || '',
            name || '',
            daysPaid,
            gross_wage || '',
            0,
            formattedDoe
        ]);
    }

    // Create text file and trigger download
    const textBlob = new Blob([textFileContent.trim()], { type: 'text/plain' });
    const textUrl = URL.createObjectURL(textBlob);
    const textLink = document.createElement('a');
    textLink.href = textUrl;
    textLink.download = 'output.txt';
    textLink.style.display = 'none';
    document.body.appendChild(textLink);
    textLink.click();
    document.body.removeChild(textLink);

    // Create Excel file and trigger download
    const ws = XLSX.utils.aoa_to_sheet([header, ...excelData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    // Use FileSaver.js to save the Excel file
    XLSX.writeFile(wb, 'output.xlsx');
}

function formatDate(date) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
        return ''; // Return blank if the date is invalid
    }
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = parsedDate.getFullYear();
    return `${day}/${month}/${year}`;
}
