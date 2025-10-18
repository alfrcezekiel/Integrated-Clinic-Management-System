import useClinicStatsData from "../../../data/ClinicData/ClinicDataCard";

const ClinicStatsCards = () => {
    const clinicStatsData = useClinicStatsData();
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 min-w-[81svw] md:min-w-[95svw] lg:min-w-[96svw] xl:min-w-[80svw]">
            {clinicStatsData.map(({label, value, Icon, bgColor, color}, index) => (
                <div
                    key={index}
                    className={`flex items-center p-4 rounded-xl shadow-md ${bgColor}`}
                >
                    <div className="p-2 rounded-full bg-white shadow mr-4">
                        <Icon className={`h-6 w-6 ${color}`} />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-gray-700 font-semibold">{label}</p>
                        <p className="text-xl font-bold text-gray-900">{value}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ClinicStatsCards;