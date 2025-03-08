import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent, CardActions, Typography } from "@mui/material";

const StatisticsCard = ({ color, icon, title, value, footer }) => {
  return (
    <Card className="border border-blue-gray-100 shadow-sm">
      <CardHeader
        avatar={<div className={`h-12 w-12 grid place-items-center rounded-full bg-${color}-500`}>{icon}</div>}
        className="relative p-4"
      >
        <CardContent className="p-4 text-right">
          <Typography
            variant="h5"
            className="text-blue-gray-600"
          >
            {title}
          </Typography>
          <Typography
            variant="h3"
            className="text.primary"
          >
            {value}
          </Typography>
        </CardContent>
        {footer && (
          <CardActions className="border-t border-blue-gray-50 p-4">
            {footer}
          </CardActions>
        )}
      </CardHeader>
    </Card>
  )
}

StatisticsCard.defaultProps = {
  color: "blue",
  footer: null
}

StatisticsCard.propTypes = {
  color: PropTypes.oneOf([
    "white", "blue-gray", "gray", "brown", "deep-orange", "orange", "amber", "yellow",
    "lime", "light-green", "green", "teal", "cyan", "light-blue", "blue", "indigo",
    "deep-purple", "purple", "pink", "red",
  ]),
  icon: PropTypes.node.isRequired,
  title: PropTypes.node.isRequired,
  value: PropTypes.node.isRequired,
  footer: PropTypes.node,
}

StatisticsCard.displayName = "/src/widgets/cards/statistics-card.jsx";

export default StatisticsCard;