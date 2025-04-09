import {
    AttachMoney as MoneyIcon,
    People as UsersIcon,
    PersonAdd as UserPlusIcon,
    BarChart as ChartBarIcon,
} from "@mui/icons-material";
import "../../../assets/css/main.css";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CardContent from "@mui/material/CardContent";
import MoreVert from "@mui/icons-material/MoreVert";
import { useState } from "react";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import projectsTableData from "../../../data/projects-table-data";
import ToolTip from "@mui/material/Tooltip";
import LinearProgress from "@mui/material/LinearProgress";
import StatisticsCard from "../../cards/statistics-card";
import usePatientsCount from "../../../hooks/usePatientsCount";

const DoctorsDashboardHome = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const handleMenuClick = (e) => {
        setAnchorEl(e.currentTarget);
    }
    const open = Boolean(anchorEl);
    const handleClose = () => {
        setAnchorEl(null);
    }
    const dataColumns = ["Companies", "Members", "Budget", "Completion"];
    const patientCount = usePatientsCount();

    const statisticsCardsData = [
        {
            color: "gray",
            icon: MoneyIcon,
            title: "Today's Money",
            value: "$53k",
            footer: {
                color: "text-green-500",
                value: "+55%",
                label: "than last week",
            },
        },
        {
            color: "gray",
            icon: UsersIcon,
            title: "Patients Registered",
            value: patientCount,
            footer: {
                color: "text-green-500",
                value: "+3%",
                label: "than last month",
            },
        },
        {
            color: "gray",
            icon: UserPlusIcon,
            title: "New Clients",
            value: "3,462",
            footer: {
                color: "text-red-500",
                value: "-2%",
                label: "than yesterday",
            },
        },
        {
            color: "gray",
            icon: ChartBarIcon,
            title: "Sales",
            value: "$103,430",
            footer: {
                color: "text-green-500",
                value: "+5%",
                label: "than yesterday",
            },
        },
    ];

    return (
        <div className="mt-12">
            <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
                {statisticsCardsData.map(({ icon: Icon, title, footer, ...rest }) => (
                    <StatisticsCard
                        key={title}
                        {...rest}
                        title={title}
                        icon={<Icon />}
                        footer={
                            <Typography className="font-normal text-blue-gray-600">
                                <strong className={footer.color}>{footer.value}</strong>
                                &nbsp;{footer.label}
                            </Typography>
                        }
                    />
                ))}
            </div>
            <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-2">
                <Card className="border border-blue-gray-100 shadow-sm col-span-full">
                    <CardHeader
                        title="Total Consultations"
                        subheader="30 done this month"
                        actions={
                            <>
                                <IconButton onClick={handleMenuClick}>
                                    <MoreVert />
                                </IconButton>
                                <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                                    <MenuItem onClick={handleClose}>Action</MenuItem>
                                    <MenuItem onClick={handleClose}>Another Action</MenuItem>
                                    <MenuItem onClick={handleClose}>Something else here</MenuItem>
                                </Menu>
                            </>
                        }
                    />
                    <CardContent className="overflow-x-auto">
                        <table className="w-full min-w-[640px] table-auto">
                            <thead>
                                <tr>
                                    {dataColumns.map((el, i) => (
                                        <th key={i} className="border-b py-3 px-6 text-center">
                                            <Typography variant="caption" className="text-blue-gray-500 font-medium-uppercase">
                                                {el}
                                            </Typography>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {projectsTableData.map(({ img, name, members, budget, completion }, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="py-3 px-5 flex items-center gap-4">
                                            <Avatar src={img} alt={name} />
                                            <Typography variant="body2" className="font-bold text-blue-gray-800">
                                                {name}
                                            </Typography>
                                        </td>
                                        <td className="py-3 px-5">
                                            <div className="flex items-center gap-2">
                                                {members.map(({ img, name }, i) => (
                                                    <ToolTip key={i} title={name}>
                                                        <Avatar src={img} alt={name} className={`border-2 border-white ${i !== 0 ? "-ml-2.5" : ""}`} />
                                                    </ToolTip>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-3 px-5">
                                            <Typography variant="body2" className="text-blue-gray-600">
                                                {budget}
                                            </Typography>
                                        </td>
                                        <td className="py-3 px-5 w-10/12">
                                            <Typography variant="body2" className="text-blue-gray-600 mb-1">
                                                {completion}%
                                            </Typography>
                                            <LinearProgress variant="determinate" value={completion} color={completion === 100 ? "success" : "primary"} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default DoctorsDashboardHome;