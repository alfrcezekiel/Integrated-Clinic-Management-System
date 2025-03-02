export const CMS =  (req, res) => {
    res.status(200).json({
        title: "Dental Clinic Management System",
        description: "CMS streamlines the operational workflow of a dental clinic that automates the medical health records (EHR), appointment scheduling, payment integration and inventory of clinical products.",
        ehrText: "Electronic Health Records",
        paymentIntegrationText: "Payment Integration", 
        appointmentSchedulingText: "Appointment Scheduling",
        featuresTitle: "Features",
        inventoryText: "Inventory of Clinical Products",
        whatWeServeTitle: "What We Serve",
        teethQuotes: "A smile is a curve that sets everything straight"
    })
}