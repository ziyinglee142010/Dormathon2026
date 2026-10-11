import React, { useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableRow , Button, TableHeadCell } from 'flowbite-react';
import EmotionPieChart from './EmotionPieChart';
import AddEmotionModal from '../Modals/AddEmotionModal';

function EmotionInfo({ emotions , seekTo }) {

    // TODO: Allow user the change source for the emotions
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const colors = {
        "Happiness": "text-yellow-500",
        "Sadness": "text-blue-500",
        "Anger": "text-red-500",
        "Fear": "text-purple-500",
        "Disgust": "text-green-500",
        "Surprise": "text-pink-500",
        "Neutral": "text-gray-500"
    }

    const [emotionsData, setEmotionsData] = React.useState([]);
    const [currentEmotion, setCurrentEmotion] = React.useState("All");

    const convertTimetoSeconds = (timeString) => {
        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        return (hours * 3600) + (minutes * 60) + seconds;
    }

    const reset = () => {
        setEmotionsData(emotions);
        setCurrentEmotion("All");
    }

    useEffect(() => {
        setEmotionsData(emotions);
    }, [emotions]);

  return (
    <div className = "grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 place-items-center">
            <div className="text-center">
                <h2 className="text-lg font-semibold">Emotion Overview</h2>
            </div>
            <EmotionPieChart emotions={emotions} setEmotionsData={setEmotionsData} setCurrentEmotion={setCurrentEmotion} />
            <h3 className="text-lg font-semibold">Current Emotion: {currentEmotion}</h3>
            <div className="flex justify-center mt-2 space-x-4">
                <Button className="mt-4" onClick={reset}>Reset Filter</Button>
                <Button className="mt-4" onClick={() => setIsModalOpen(true)}>Add Emotion</Button>
            </div>
        </div>
        {/* Display emotion information here */}
        <div className="lg:col-span-2 h-96 overflow-x-auto">
            {emotions && (
            <Table className="mt-4">
                <TableHead className = "sticky top-0 z-50">
                    <TableRow>
                        <TableHeadCell>Emotion</TableHeadCell>
                        <TableHeadCell>Source</TableHeadCell> 
                        <TableHeadCell>Start Time</TableHeadCell>
                        <TableHeadCell>End Time</TableHeadCell>
                        <TableHeadCell>Delete</TableHeadCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {emotionsData.map((emotion, index) => (
                        <TableRow key={index}>
                            <TableCell className={colors[emotion.category]}>{emotion.category}</TableCell>
                            <TableCell>{emotion.source}</TableCell>
                            <TableCell><Button onClick={() => seekTo(convertTimetoSeconds(emotion.start_time))}>{emotion.start_time}</Button></TableCell>
                            <TableCell><Button onClick={() => seekTo(convertTimetoSeconds(emotion.end_time))}>{emotion.end_time}</Button></TableCell>
                            <TableCell><Button color="red" onClick={() => setEmotionsData(emotionsData.filter((_, i) => i !== index))}>Delete</Button></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            )}
            
        </div>
     
    

        <AddEmotionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={(newEmotion) => setEmotionsData([...emotionsData, newEmotion])} />

        
    </div>
  )
}

export default EmotionInfo