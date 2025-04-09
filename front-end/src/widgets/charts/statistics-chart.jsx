
import PropTypes from 'prop-types';
import Chart from "react-apexcharts";
import { Card, CardContent, CardHeader, Typography, Divider } from "@mui/material";

function StatisticsChart({ color, chart, title, description, footer }) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader
        title={<Chart {...chart} />}
        className={`bg-${color}-500 text-white p-4`}
      />
      <CardContent className="px-6 pt-0">
        <Typography variant="h6" color="textPrimary">
          {title}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {description}
        </Typography>
      </CardContent>
      {footer && (
        <>
          <Divider />
          <CardContent className="px-6 py-4">{footer}</CardContent>
        </>
      )}
    </Card>
  );
}

StatisticsChart.defaultProps = {
  color: "blue",
  footer: null,
};

StatisticsChart.propTypes = {
  color: PropTypes.string.isRequired,
  chart: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.node.isRequired,
  footer: PropTypes.node,
};

export default StatisticsChart;