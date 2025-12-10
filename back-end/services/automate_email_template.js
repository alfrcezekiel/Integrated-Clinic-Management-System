/** 
 * @function to generate an automated email notification template
 */
export const automatedEmailNotificationTemplate = (appointment) => {
    const { firstName, appointmentDate, preferredTime, status, clinicName, purposeOfAppointment, clinicAddress } = appointment;

    const formatAppointmentTimeTOAMPMFormat = (appointmentTime) => {
        const [hours, minutes] = appointmentTime.split(":").map(Number);
        const period = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${String(minutes).padStart(2, "0")} ${period}`;
    }

    const formattedDate = new Date(appointmentDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    })

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Appointment Confirmation</title>
            <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                body { font-family: 'Inter', sans-serif; }
                .header-bg { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
            </style>
        </head>
        <body class="bg-gray-50">
            <div class="max-2xl mx-auto my-8 bg-white rounded-lg shadow-lg overflow-hidden">
                <!-- Header -->
                <div clas="header-bg p-8 text-white text-center">
                    <h1 class="text-2xl font-bold mb-2">Appointment Confirmed!</h1>
                    <p class="text-blue-200">We're looking forward to seeing you!</p>
                </div>
                <!-- Appointment Details -->
                <div class="p-8">
                    <div class="mb-8">
                        <p class="text-xl font-semibold text-gray-800 mb-4">Hello ${firstName},</p>
                        <p class="text-gray-600 mb-6">
                            Your appointment has been successfully scheduled. Here are the details:
                        </p>

                        <div class="bg-blue-50 p-6 rounded-lg">
                            <div class="flex items-start mb-4">
                                <div class="bg-blue-100 p-3 rounded-full mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 class="font-medium text-gray-900">Appointment Details</h3>
                                    <p class="text-gray-600">Appointment Date: ${formattedDate}</p>
                                    <p class="text-gray-600">Appointment Time: ${formatAppointmentTimeTOAMPMFormat(preferredTime)}</p>
                                    <p class="text-gray-600">Appointment Status: ${status}</p>
                                    <p class="text-gray-600">Purpose of Appointment: ${purposeOfAppointment}</p>
                                </div>
                            </div>

                            <div class="flex items-start">
                                <div class="bg-blue-100 p-3 rounded-full mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 class="font-medium text-gray-900">Location</h3>
                                    <p class="text-gray-600">Clinic: ${clinicName}</p>
                                    <p class="text-gray-600">Clinic Address: ${clinicAddress}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Reminders Section -->
                    <div class="bg-yellow-50 border-1-4 border-yellow-400 p-4 mb-8">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm text-yellow-700">
                                    Please arrive 15 minutes before your scheduled time. Bring any necessary documents for identification.
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- CTA buttons -->
                    <div class="text-center">
                        <a href="${process.env.FRONTEND_ENDPOINT}/patients-dashboard/ViewAppointment" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg shadow-md transition duration-300 ease-in-out">
                            View Appointment
                        </a>
                        <p class="mt-4 text-sm text-gray-500">
                            Need to reschedule? Please contact us at least 24 hours in advance.
                        </p>
                    </div>
                </div>

                <!-- Footer -->
                <div class="bg-gray-50 px-8 py-6 border-t border-gray-200">
                    <div class="text-center">
                        <p class="text-sm text-gray-500">
                            &copy; ${new Date().getFullYear()} ${clinicName}. All rights reserved.
                        </p>
                    </div>
                    <div class="mt-2 flex justify-center space-x-6">
                        <a href="#" class="text-gray-400 hover:text-gray-500">
                            <span class="sr-only">Facebook</span>
                            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />
                            </svg>
                        </a>
                        <a href="#" class="text-gray-400 hover:text-gray-500">
                            <span class="sr-only">Twitter</span>
                            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />
                            </svg>
                        </a>
                        <a href="#" class="text-gray-400 hover:text-gray-500">
                            <span class="sr-only">Instagram</span>
                            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />
                            </svg>
                        </a>
                        <a href="#" class="text-gray-400 hover:text-gray-500">
                            <span class="sr-only">LinkedIn</span>
                            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
            </div>
        </body>
        </html>
    `
} 