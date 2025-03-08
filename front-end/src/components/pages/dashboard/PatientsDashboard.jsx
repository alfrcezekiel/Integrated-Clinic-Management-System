import "../../../assets/css/main.css";
import PropTypes from 'prop-types';
import statisticsCardsData from "../../../data/statistics-cards-data";
import projectsTableData from "../../../data/projects-table-data";
import StatisticsCard from "../../../widgets/cards/statistics-card";
import ordersOverviewData from "../../../data/orders-overview-data";
import Typography from "@mui/material/Typography";
import ArrowUpward  from "@mui/icons-material/ArrowUpward";
import MoreVert  from "@mui/icons-material/MoreVert";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Menu from "@mui/material/Menu";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import LinearProgress from "@mui/material/LinearProgress";

function PatientsDashboard() {
    return (
        <div className="mt-12">
            <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
                {statisticsCardsData.map(({ icon: Icon, title, footer, ...rest }) => (
                    <StatisticsCard
                        key={title}
                        {...rest}
                        title={title}
                        icon={<Icon className="w-6 h-6 text-white" />}
                        footer={
                            <Typography className="font-normal text-blue-gray-600">
                                <strong className={footer.color}>{footer.value}</strong>
                                &nbsp;{footer.label}
                            </Typography>
                        }
                    />
                ))}
            </div>
            {/* <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
                {statisticsChartsData.map((props) => (
                    <StatisticsChart
                        key={props.title}
                        {...props}
                        footer={
                            <Typography variant="h6" className="flex items-center text-blue-gray-600">
                                <ArrowUpward className="h-4 w-4 text-blue-gray-400" />
                                &nbsp;{props.footer}
                            </Typography>
                        }
                    />
                ))}

            </div> */}
            <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
                <Card className="border border-blue-gray-100 shadow-sm">
                    <CardHeader title="Projects" subheader="30 done this month"
                        action={
                            <Menu>
                                <IconButton>
                                    <MoreVert />
                                </IconButton>
                                <MenuItem>Action</MenuItem>
                                <MenuItem>Another Action</MenuItem>
                                <MenuItem>Something else here</MenuItem>
                            </Menu>
                        }
                    />
                    <CardContent className="overflow-x-auto">
                        <table className="w-full min-w-[640px] table-auto">
                            <thead>
                                <tr>
                                    {['Companies', 'Members', 'Budget', 'Complete'].map((el, i) => (
                                        <th key={i} className="border-b py-3 px-6 text-left">
                                            <Typography variant="caption" className="text-blue-gray-400 font-medium uppercase">
                                                {el}
                                            </Typography>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {projectsTableData.map(({img, name, members, budget, completion}, key) => (
                                    <tr key={key} className="border-b"> 
                                        <td className="py-3 px-5 flex items-center gap-4">
                                            <Avatar src={img} alt={name}/>
                                            <Typography variant="body2" className="font-bold text-blue-gray-800">
                                                {name}
                                            </Typography>  
                                        </td>
                                        <td className="py-3 px-5">
                                            {members.map(({img, name}, key) => (
                                                <Tooltip key={key} title={name}>
                                                    <Avatar src={img} alt={name} className={`border-2 border-white ${key !== 0 ? '-ml-2.5' : ''}`}/>
                                                </Tooltip>
                                            ))}
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
                                            <LinearProgress variant="determinate" value={completion} color={completion === 100 ? "success" : "primary"}/>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
                <Card className="border borde-blue-gray-100 shadow-sm">
                    <CardHeader
                        title="Overview"
                        subheader="24% done this month"
                        action={
                            <ArrowUpward className="h-3.5 w-3.5 text-green-500"/>
                        }
                    />
                    <CardContent>
                        {ordersOverviewData.map(({icon: Icon, color, title, description}, key) => (
                            <div key={key} className="flex items-center gap-4 py-3">
                                <Icon className={`!w-5 !h-5 ${color}`}/>
                                <div>
                                    <Typography variant="body2" className="font-medium text-blue-gray-800">
                                        {title}
                                    </Typography>
                                    <Typography variant="caption" className="text-blue-gray-800">
                                        {description}
                                    </Typography>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

PatientsDashboard.propTypes = {
    title: PropTypes.string.isRequired,
    footer: PropTypes.string.isRequired,
}

export default PatientsDashboard;