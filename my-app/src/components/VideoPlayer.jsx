import React, { useRef } from 'react'
import ReactPlayer from 'react-player'
import { Button } from 'flowbite-react'

function VideoPlayer({ url , playerRef}) {

    // more customisation will be added
    return (
        <ReactPlayer ref={playerRef} src={url} controls width="100%" height="100%" />
    )
}

export default VideoPlayer 