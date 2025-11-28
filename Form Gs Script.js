function doPost(e) {
    try {
        // 1. Open the Spreadsheet
        // REPLACED: Ensure this ID is correct for your specific sheet
        var ss = SpreadsheetApp.openById('1lAgWuhQpBJE-NyrdnNiRxkbS5NdaB6zwOwb2agJAwRc');
        var sheet = ss.getSheetByName('File-Received');

        // 2. Parse the JSON data sent from the HTML form
        // The HTML sends a JSON body, so we use e.postData.contents
        var requestData = JSON.parse(e.postData.contents);

        // 3. Prepare the data row
        var rowData = [];
        
        // Timestamp (English Date as requested)
        var currentDateTime = Utilities.formatDate(new Date(), 'Asia/Dhaka', 'dd/MM/yyyy, hh:mm:ss a');
        rowData.push(currentDateTime);

        // Extract Form Fields matching form copy.html
        rowData.push(requestData.name || '');
        rowData.push(requestData.mobile || '');
        rowData.push(requestData.email || '');
        rowData.push(requestData.bloodGroup || '');
        rowData.push(requestData.designation || '');
        rowData.push(requestData.division || '');
        rowData.push(requestData.district || '');
        rowData.push(requestData.upazila || '');
        rowData.push(requestData.institute || '');
        rowData.push(requestData.comment || '');

        // 4. Handle File Uploads
        var folderId = '1EyX5Hyz-s-I-C3XuJSfJF9mo4nvFrln2';
        var folder = DriveApp.getFolderById(folderId);
        var fileUrls = [];

        if (requestData.files && requestData.files.length > 0) {
            for (var i = 0; i < requestData.files.length; i++) {
                var fileData = requestData.files[i];
                // Convert base64 string back to a blob
                var decodedBlob = Utilities.newBlob(Utilities.base64Decode(fileData.data), fileData.type, fileData.name);
                var driveFile = folder.createFile(decodedBlob);
                fileUrls.push(driveFile.getUrl());
            }
        } else {
            fileUrls.push("No files attached");
        }

        // Add file URLs to the end of the row
        rowData.push(fileUrls.join(", "));

        // 5. Save to Sheet
        sheet.appendRow(rowData);

        // 6. Send Email Notification (Optional: Only if email exists)
        if (requestData.email) {
            try {
                const subject = 'Submission Received - Health Professional Data';
                const body = `
                    <p>Dear ${requestData.name},</p>
                    <p>Thank you for submitting your information.</p>
                    <ul>
                        <li><strong>Name:</strong> ${requestData.name}</li>
                        <li><strong>Mobile:</strong> ${requestData.mobile}</li>
                        <li><strong>Designation:</strong> ${requestData.designation}</li>
                    </ul>
                    <p>Best regards,<br>10th Grade Implementation Council</p>
                `;
                MailApp.sendEmail({
                    to: requestData.email,
                    subject: subject,
                    htmlBody: body
                });
            } catch (emailError) {
                // Continue even if email fails
                console.log("Email failed: " + emailError);
            }
        }

        return ContentService.createTextOutput(JSON.stringify({ result: 'success', message: 'Data saved successfully' }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ result: 'error', error: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}