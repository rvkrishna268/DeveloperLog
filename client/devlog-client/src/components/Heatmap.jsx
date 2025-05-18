
// src/components/Heatmap.jsx
import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

const Heatmap = ({ logs }) => {
  const values = logs.map(log => ({ date: log.date.split('T')[0], count: log.timeSpent }));

  return (
    <div className="my-6 ">
      <h3 className="text-xl font-semibold mb-2">Productivity Heatmap</h3>
      <CalendarHeatmap
        startDate={new Date(new Date().setMonth(new Date().getMonth() - 1))}
        endDate={new Date()}
        values={values}
        classForValue={(value) => {
          if (!value) return 'color-empty';
          if (value.count >= 6) return 'color-github-4';
          if (value.count >= 4) return 'color-github-3';
          if (value.count >= 2) return 'color-github-2';
          return 'color-github-1';
        }}
        tooltipDataAttrs={value => ({
          'data-tip': `${value.date}: ${value.count || 0}h`
        })}
        showWeekdayLabels
      />
    </div>
  );
};

export default Heatmap;
