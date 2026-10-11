import React, { useEffect } from 'react'
import Chart from 'react-apexcharts';

function EmotionBarChart({ data }) {

    const emotionColors = {
        Happiness: '#FFD700',
        Sadness: '#1E90FF',
        Anger: '#FF4500',
        Fear: '#8A2BE2',
        Surprise: '#FF69B4',
        Disgust: '#228B22',
        Neutral: '#A9A9A9'
    }

    const colors = data.map(item => emotionColors[item.category] || '#888888');


    const groupByData = data.reduce((group, emotionData) => {
        // Group by emotion Data based on the count
        if (!group[emotionData.category]){
            group[emotionData.category] = 0
        }
        group[emotionData.category] += 1
        return group;
    },{});

    const series = [
    {
      name: "Emotion Count",
      color: "#1A56DB",
      data: Object.keys(groupByData).map(key => {
        const newData = {x :key.toUpperCase(), y: groupByData[key], fillColor: emotionColors[key] || '#888888'};
        return newData
      })
    },
   ]

   const options = {
     colors: ["#1A56DB", "#FDBA8C"],
     chart: {
        type: "bar",
        height: "320px",
        fontFamily: "Inter, sans-serif",
        toolbar: {
        show: false,
        },
    },
    plotOptions: {
        bar: {
        horizontal: false,
        columnWidth: "70%",
        borderRadiusApplication: "end",
        borderRadius: 8,
        },
    },
    tooltip: {
        shared: true,
        intersect: false,
        style: {
        fontFamily: "Inter, sans-serif",
        },
    },
    states: {
        hover: {
        filter: {
            type: "darken",
            value: 1,
        },
        },
    },
    stroke: {
        show: true,
        width: 0,
        colors: ["transparent"],
    },
    grid: {
        show: false,
        strokeDashArray: 4,
        padding: {
        left: 2,
        right: 2,
        top: -14
        },
    },
    dataLabels: {
        enabled: false,
    },
    legend: {
        show: false,
    },
    xaxis: {
        floating: false,
        labels: {
        show: true,
        style: {
            fontFamily: "Inter, sans-serif",
            cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
        }
        },
        axisBorder: {
        show: false,
        },
        axisTicks: {
        show: false,
        },
    },
    yaxis: {
        show: false,
    },
    fill: {
        opacity: 1,
    },
   }


   const config = {
      series: series,
      options: options
    };

   

  return (
    <Chart options={config.options} series={config.series} type="bar" height={320} />
  )
}

export default EmotionBarChart;