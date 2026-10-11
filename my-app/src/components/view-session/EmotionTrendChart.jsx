import React from 'react'
import Chart from 'react-apexcharts';
import { data } from 'react-router-dom';

function EmotionTrendChart({allSessions = []}) {

    // x axis being the date
    // y axis being the duration of each emotion in seconds
    // 1. I will need to create the x axis based on the dates of all sessions
    
    // we will only consider sessions that has video
    const categories = [...new Set(allSessions.filter(session => session.video).map(session => session.date))].sort(); // data returned is already sorted, but we do it again

    // 2. Define emotions and colors
    const emotions = [
      { name: "Happiness", color: "#eab308" },
      { name: "Sadness", color: "#3b82f6" },
      { name: "Anger", color: "#ef4444" },
      { name: "Fear", color: "#a855f7" },
      { name: "Disgust", color: "#10b981" },
      { name: "Surprise", color: "#ec4899" },
      { name: "Neutral", color: "#6b7280" }
    ];

    // 3. Aggregate all the emotions for each date

    const dateEmotionDuration = {};
    categories.forEach((date) => {
      dateEmotionDuration[date] = {}
      emotions.forEach(emotion => dateEmotionDuration[date][emotion.name] = 0)
    })

    console.log("Date Emotion Duration: ", dateEmotionDuration);

    // // Group everything together
    allSessions.forEach((session) => {
      // first check if video exist within the session
      if (session.video && session.video.emotions){
        const session_emotions = session.video.emotions;
        session_emotions.forEach((emotions) => {
          const startParts = emotions.start_time.split(':').map(Number);
          const endParts = emotions.end_time.split(':').map(Number);
          const startInSeconds = (startParts[0] * 3600) + (startParts[1] * 60) + startParts[2];
          const endInSeconds = (endParts[0] * 3600) + (endParts[1] * 60) + endParts[2];
          const duration = endInSeconds - startInSeconds;
          const date = session.date;
          const category = emotions.category;
          if (dateEmotionDuration[date] && category in dateEmotionDuration[date]) {
            dateEmotionDuration[date][category] += duration;
          }
        });
      }
    })

    const seriesData = emotions.map((emotion) => {
      return {
        name: emotion.name,
        // list down the x axis
        data: categories.map((date) => dateEmotionDuration[date][emotion.name] || 0),
        color: emotion.color
      }
    })




    const options = {
      chart: {
        height: "100%",
        maxWidth: "100%",
        type: "line",
        fontFamily: "Inter, sans-serif",
        dropShadow: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      tooltip: {
        enabled: true,
        x: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 6,
        curve: 'smooth',
      },
      grid: {
        show: true,
        strokeDashArray: 4,
        padding: {
          left: 2,
          right: 2,
          top: -26
        },
      },
      series: seriesData,
      legend: {
        show: true
      },
      xaxis: {
        categories: categories,
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
  }


  return (
    <Chart options={options} series={options.series} type="line" height={350} />
  )
}

export default EmotionTrendChart