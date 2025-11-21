// 1. Open your Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Delete any code there and paste this code
// 4. Click "Deploy" > "New deployment"
// 5. Select type: "Web app"
// 6. Description: "OCR Scanner API"
// 7. Execute as: "Me"
// 8. Who has access: "Anyone" (Important for the app to work without login)
// 9. Click "Deploy"
// 10. Copy the "Web app URL" and paste it into your .env file as VITE_GOOGLE_SCRIPT_URL

function doPost(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

        // Parse the incoming JSON data
        const data = JSON.parse(e.postData.contents);

        // Add headers if the sheet is empty
        if (sheet.getLastRow() === 0) {
            sheet.appendRow([
                'Timestamp',
                'Name',
                'Job Title',
                'Company',
                'Email',
                'Phone',
                'Website',
                'Address',
                'Image 1 URL',
                'Image 2 URL'
            ]);
        }

        // Append the new row
        sheet.appendRow([
            new Date(),
            data.name || '',
            data.jobTitle || '',
            data.company || '',
            data.email || '',
            data.phone || '',
            data.website || '',
            data.address || '',
            data.imageUrl1 || '',
            data.imageUrl2 || ''
        ]);

        return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (e) {
        return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

function setup() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([
        'Timestamp',
        'Name',
        'Job Title',
        'Company',
        'Email',
        'Phone',
        'Website',
        'Address',
        'Image 1 URL',
        'Image 2 URL'
    ]);
}
