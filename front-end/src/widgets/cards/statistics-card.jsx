import PropTypes from "prop-types";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
} from "@mui/material";

const StatisticsCard = ({ color, icon, title, value, footer }) => {
  return (
    <Card className="shadow-lg bg-white">
      <CardHeader
        avatar={
          <div
            className={`h-12 w-12 grid place-items-center rounded-full bg-${color}-500`}
          >
            {icon}
          </div>
        }
        className="pt-4 flex items-center justify-between"
      />
      <CardContent className="pt-1">
        <Typography variant="h5" className="text-blue-gray-600">
          {title}
        </Typography>
        <Typography variant="h6" color="primary">
          {value}
        </Typography>
      </CardContent>
      {footer && (
        <CardActions className="border-t border-blue-gray-50 p-4">
          {footer}
        </CardActions>
      )}
    </Card>
  );
};

StatisticsCard.defaultProps = {
  color: "blue",
  footer: null,
};

StatisticsCard.propTypes = {
  color: PropTypes.oneOf([
    "white",
    "blue-gray",
    "gray",
    "brown",
    "deep-orange",
    "orange",
    "amber",
    "yellow",
    "lime",
    "light-green",
    "green",
    "teal",
    "cyan",
    "light-blue",
    "blue",
    "indigo",
    "deep-purple",
    "purple",
    "pink",
    "red",
  ]),
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  footer: PropTypes.node,
};

export default StatisticsCard;
