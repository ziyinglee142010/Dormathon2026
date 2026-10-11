import React, { useEffect } from 'react'
import Chart from 'react-apexcharts';


function EmotionPieChart({ emotions = [], setEmotionsData = () => {} , setCurrentEmotion = () => {} }) {
    const emotionDuration = {
        "Happiness": 0,
        "Sadness": 0,
        "Anger": 0,
        "Fear": 0,
        "Disgust": 0,
        "Surprise": 0,
        "Neutral": 0
    }

    emotions.forEach(emotion => {
        const startParts = emotion.start_time.split(':').map(Number);
        const endParts = emotion.end_time.split(':').map(Number);
        const startInSeconds = (startParts[0] * 3600) + (startParts[1] * 60) + startParts[2];
        const endInSeconds = (endParts[0] * 3600) + (endParts[1] * 60) + endParts[2];
        const duration = endInSeconds - startInSeconds;

        if (emotion.category in emotionDuration) {
            emotionDuration[emotion.category] += duration;
        }
    });

    const series = [{
            name: "Duration (Seconds)", data: [
                emotionDuration["Happiness"],
                emotionDuration["Sadness"],
                emotionDuration["Anger"],
                emotionDuration["Fear"],
                emotionDuration["Disgust"],
                emotionDuration["Surprise"],
                emotionDuration["Neutral"]
            ]
        }
    ];

    const options = {
        series : series,
        colors: ['#1A56DB'],
        labels: ["Happiness", "Sadness", "Anger", "Fear", "Disgust", "Surprise","Neutral"],
        markers: {
            colors: ['#eab308', '#3b82f6', '#ef4444', '#a855f7', '#10b981', '#ec4899', '#6b7280'],
            hover: { size: 7 },
            shape: "circle",
            radius: 2,
        },
        chart :{
            type: "radar",
            height: "100%",
            fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
            toolbar: {
                show: false
            },
            events : {
                click: (event, chartContext, config) => {

                    const dataPointIndex = config.dataPointIndex;
                    const label = options.labels[dataPointIndex];
                    // Handle the click event here
                    // For example, you can log the label of the clicked segment
                    emotions.filter(emotion => emotion.category.toLowerCase() === label.toLowerCase());
                    setCurrentEmotion(label);
                    const filteredEmotions = emotions.filter(emotion => emotion.category.toLowerCase() === label.toLowerCase());
                    setEmotionsData(filteredEmotions);
                }
            }
        },
        tooltip: {
            style: {
                fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
                colors : ["#1A56DB"]
                
            },
        },
        yaxis: {
            show: false,
            labels: {
                show: false,
            }
        }
    }

  return (
    <Chart options={options} series={series} type="radar" height={320}></Chart>
  )
}

export default EmotionPieChart