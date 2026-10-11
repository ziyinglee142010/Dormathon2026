import React, {useEffect} from 'react'
import EmotionPieChart from './EmotionPieChart'
import { Dropdown, DropdownItem } from 'flowbite-react';
import { useState } from 'react';

function EmotionComparativeAnalysis({emotions, allSessions = [], currentDate}) {

  const [currentLabel, setCurrentLabel] = useState('');
  const [previousSession, setPreviousSession] = useState(null);

  useEffect(() => {
    if (allSessions.length > 0) {
      setPreviousSession(allSessions[0]);
      setCurrentLabel(allSessions[0].date);
    }
  }, [allSessions]);

  return (
    <div className = "grid lg:grid-flow-col lg:grid-cols-3 justify-items-center">
      <div>
        <h3 className = "text-lg text-center font-semibold mb-2">Current Session</h3>
        <h4 className = "text-md text-center mb-4 text-gray-400">{currentDate}</h4>
        <EmotionPieChart emotions={emotions} />
      </div>
      <div className = "flex flex-col items-center justify-center sm: my-20">
        <h3> Compare with </h3>
        <Dropdown label={currentLabel} dismissOnClick={true}>
          {allSessions.map((session , index) => (
              <DropdownItem key={index} onClick={() => {
                setCurrentLabel(session.date);
                setPreviousSession(session);
              }}>{session.date}
              </DropdownItem>
          ))}
        </Dropdown>
      </div>
      <div>
        <h3 className = "text-lg text-center font-semibold mb-2">Previous Session</h3>
        <h4 className = "text-md text-center mb-4 text-gray-400">{currentLabel}</h4>
        <EmotionPieChart emotions={previousSession?.video?.emotions} />
      </div>
    </div>
  )
}

export default EmotionComparativeAnalysis