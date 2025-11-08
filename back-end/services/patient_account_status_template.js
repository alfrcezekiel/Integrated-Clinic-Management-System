import dotenv from "dotenv";
dotenv.config();

/**
 * @function generates an email template for patient account status notifications
 * @param {Object} patient - patient details
 * @returns {string} - HTML email template
 */
export const patientAccountStatusTemplate = (patient) => {
    const { firstName, lastName, status } = patient;

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-500';
            case 'declined':
                return 'bg-red-100 text-red-800 border-red-500';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-500';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-500';
        }
    };

    const getStatusMessage = (status) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'Congratulations! Your account has been approved and you can now access all features of our clinic management system.';
            case 'declined':
                return 'Unfortunately, your account application has been declined. Please contact our support team for more information.';
            case 'pending':
                return 'Your account is currently under review. You will be notified once a decision has been made.';
            default:
                return 'Your account status has been updated.';
        }
    };

    const statusColor =  getStatusColor(status);
    const statusMessage = getStatusMessage(status);

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Account Status Update</title>
            <script src="./tailwindcss/service_tailwind.js"></script>
        </head>
        <body class="bg-gray-50 p-4">
            <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                <!-- Header -->
                <div class="bg-blue-600 p-6 text-white">
                    <h2 class="text-2xl font-bold">Account Status Update</h2>
                </div>

                <!-- Main Content -->
                <div class="p-6">
                    <p class="mb-4 text-gray-700">
                        Dear <span class="font-semibold">${firstName} ${lastName}</span>,
                    </p>

                    <div class="bg-blue-50 border-l-4 ${statusColor} p-4 mb-6">
                        <h3 class="font-bold text-lg mb-2">Account Status: ${status}</h3>
                        <p class="text-gray-700 mb-3">
                            ${statusMessage}
                        </p>
                        <div class="mt-3">
                            <span class="inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColor}">
                                Status: ${status}
                            </span>
                        </div>
                    </div>

                    ${status.toLowerCase() === 'approved' ? `
                    <div class="bg-green-50 border border-green-200 p-4 mb-4">
                        <h4 class="font-semibold text-green-800 mb-2">What happens next?</h4>
                        <ul class="list-disc list-inside text-sm text-green-700 space-y-1">
                            <li>You can now log in to your account</li>
                            <li>Access to booking appointments</li>
                            <li>Manage your profile information</li>
                        </ul>
                    </div>
                    ` : ''}

                    ${status.toLowerCase() === 'declined' ? `
                    <div class="bg-red-50 border border-red-200 p-4 mb-4">
                        <h4 class="font-semibold text-red-800 mb-2">Need Help?</h4>
                        <p class="text-sm text-red-700">
                            If you believe this decision was made in error, please contact our support team at
                            <a href="mailto:${process.env.SMTP_EMAIL_USER}" class="font-medium underline">${process.env.SMTP_EMAIL_USER}</a>
                        </p>
                    </div>
                    ` : ''}

                    <p class="mb-4 text-gray-700">
                        If you have any questions about your account status, please don't hesitate to contact our support team.
                    </p>

                    <p class="text-gray-700">
                        Thank you for choosing our Clinic Management System.
                    </p>
                </div>

                <!-- Footer -->
                <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <p class="text-gray-500 text-sm">
                        Best regards,
                        <br>
                        <span class="font-medium">Clinic Management System Team</span>
                    </p>
                    <p>&copy; ${new Date().getFullYear()} Clinic Management System. All rights reserved.</p>
                    <p class="mt-2 text-xs text-gray-400">
                        This is an automated message. Please do not reply to this email.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;
};
