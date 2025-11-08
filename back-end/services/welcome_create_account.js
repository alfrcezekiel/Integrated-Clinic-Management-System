import logger from "../config/winston.js";

/**
 * @function sends a welcome email notification to newly registered patient account
 */
export const sendWelcomeEmailNotification = async (patient) => {
    try {
        const {
            firstName,
            lastName
        } = patient;

        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Welcome to Clinc Management</title>
                    <script src="./tailwindcss/service_tailwind.js"></script>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
                    <style>
                        body { font-family: 'Inter', sans-serif; }
                        .gradient-bg { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
                        .btn-primary { 
                            background-color: #3b82f6;
                            transition: all 0.3s ease;
                        }
                        .btn-primary:hover { 
                            background-color: #2563eb;
                            transform: translateY(-1px);
                        }
                    </style>
                </head>
                <body>
                    <div class="max-2xl mx-auto my-8 bg-white rounded-lg shadow-lg overflow-hidden">
                        <!--Header-->
                        <div class="px-6 py-8 text-white text-center">
                            <h1 class="text-2xl font-bold mb-2">Welcome to Clinc Management</h1>
                            <p class="text-blue-100 mt-2">We're looking forward to seeing you!</p>
                        </div>

                        <!-- Content -->
                        <div class="p-6">
                            <p class="text-gray-600 mb-4">
                                Hello ${firstName} ${lastName},
                            </p>

                            <p class="text-gray-600 mb-4">
                                Thank you for creating an account with Clinc Management. We're excited to have you on board!
                            </p>

                            <div class="bg-blue-50 p-4 border-1-4 border-blue-500 mb-6 rounded-lg">
                                <p class="text-blue-700 font-medium">Your account is pending approval.</p>
                                <p class="text-blue-600 font-medium">Please check your email for more details.</p>
                                <p class="text-blue-600 font-medium">You'll receive another email once your account has been approved by our team.</p>
                            </div>

                            <div class="mb-6">
                                <h2 class="text-lg font-semibold text-gray-800 mb-2">What's next?</h2>
                                <p class="text-gray-600 mb-2">Our team will review your regisration account and get back to you as soon as possible.</p>
                                <p class="text-gray-600 mb-2">Once your account is approved, you'll be able to:</p>
                                <ul class="list-disc list-inside text-gray-600 mb-2">
                                    <li>View and manage your appointments</li>
                                    <li>Update your profile information</li>
                                    <li>Book new appointments</li>
                                </ul>
                            </div>

                            <div class="bg-yellow-50 border-1-4 border-yellow-400 p-4 mb-6 rounded-lg">
                                <p class="text-yellow-600">Please keep your login credentials safe and secure and do not share them with anyone.</p>
                            </div>

                            <!--Footer-->
                            <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                <p class="text-center text-gray-500 text-sm">
                                    &copy; ${new Date().getFullYear()} Clinc Management. All rights reserved.
                                </p>
                                <p class="text-center text-gray-400 text-xs mt-1"> 
                                    This is an automated message, please do not reply directly to this email.
                                </p>
                            </div>
                        </div>
                    </div>
                </body>
            </html>
        `
    } catch (error) {
        logger.log(`error`, `Failed to send welcome email to ${patient.email}: ${error}`)
    }
}