import { useState } from "react";
import { AgoraRTCProvider, useJoin, useLocalCameraTrack, useLocalMicrophoneTrack, usePublish, useRTCClient, useRemoteAudioTracks, useRemoteUsers, RemoteUser, LocalVideoTrack } from "agora-rtc-react";
import AgoraRTC from "agora-rtc-sdk-ng";
import VideoForm from "./VideoForm";
import VideoCall from "../components/VideoCall.jsx";
import * as styles from "../../utility.js";

const VideoCallPage = () => {

    const client = useRTCClient(AgoraRTC.createClient({ codec: "vp8", mode: "rtc" }));
    const [channelName, setChannelName] = useState("test");
    const [AppID, setAppID] = useState("9129f9ae63c64b92a9661def69c83638");
    const [token, setToken] = useState("007eJxTYPjo77Ev4Iz0v4nuW7umpvFe4LXlKj3BGriVqbXu0c2jnx4qMFgaGlmmWSammhknm5kkWRolWpqZGaakpplZJlsYmxlb/LlXk9EQyMjAdcyYhZEBAkF8FoaS1OISBgYAgaggUQ=="); // if using token-based authentication
    const [inCall, setInCall] = useState(false);

    return (
        <AgoraRTCProvider client={client}>
            <div style={styles.styles.container}>
                {!inCall ? (
                    <VideoForm
                    AppID={AppID}
                    setAppID={setAppID}
                    channelName={channelName}
                    setChannelName={setChannelName}
                    token={token}
                    setToken={setToken}
                    setInCall={setInCall}
                    />
                    ) : (
                        // Videocall here
                        
                        <VideoCall
                            AppID={AppID}
                            channelName={channelName}
                            token={token}
                        />

                    
                        
                    )}
                    </div>
        </AgoraRTCProvider>
    );

}

export default VideoCallPage;



