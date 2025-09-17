
import { adminStats } from '../../../data/AdminData/AdminCardData';
import {
    BuildingStorefrontIcon,
    UserGroupIcon,
    RectangleGroupIcon,
    ShieldCheckIcon
} from "@heroicons/react/24/solid";
import CalculateRegisteredClinics from '../../../hooks/AdminStatsHooks/CalculateRegisterdClinics';
import CalculateRegisteredPatientsAccount from "../../../hooks/AdminStatsHooks/CalculateRegisteredPatientsAccounts";
import CalculateAdminAccounts from "../../../hooks/AdminStatsHooks/CalculateAdminAccounts";

const AdminStatsCards = () => {
    const totalNumberOfRegisteredClinics = CalculateRegisteredClinics();
    const totalNumberOfRegisteredPatientsAccounts = CalculateRegisteredPatientsAccount();
    const totalNumberOfAdminAccounts = CalculateAdminAccounts();

    const stats = [
        {
            title: "Registered Clinics",
            Icon: BuildingStorefrontIcon,
            value: totalNumberOfRegisteredClinics,
            bgColor: "bg-blue-500"
        },
        {
            title: "Registered Patients Accounts",
            Icon: UserGroupIcon,
            value: totalNumberOfRegisteredPatientsAccounts,
            bgColor: "bg-green-500"
        },
        {
            title: "Clinic Types",
            Icon: RectangleGroupIcon,
            value: adminStats.clinicTypes,
            bgColor: "bg-yellow-500"
        },
        {
            title: "Admin Accounts",
            Icon: ShieldCheckIcon,
            value: totalNumberOfAdminAccounts,
            bgColor: "bg-red-500"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {stats.map(({ title, Icon, value, bgColor }, index) => (
                <div
                    key={index}
                    className={`p-6 rounded-xl shadow-xl ${bgColor} text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                >
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="flex items-center justify-center w-full mb-4">
                            <div className="p-4 bg-white/10 rounded-full">
                                <Icon className="h-8 w-8" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold mb-2">{value}</div>
                        <div className="text-sm font-medium uppercase tracking-wider opacity-90 text-center">
                            {title}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminStatsCards;
