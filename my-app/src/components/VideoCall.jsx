import * as styles from "../../utility.js";
import { useJoin, useLocalCameraTrack, useLocalMicrophoneTrack, usePublish, useRTCClient, useRemoteAudioTracks, useRemoteUsers, RemoteUser, LocalVideoTrack,LocalUser} from "agora-rtc-react";
import {  } from "agora-rtc-sdk-ng";


const VideoCall = ({ AppID, channelName, token }) => {
  const remoteUsers = useRemoteUsers();
  console.log("Remote users:", remoteUsers); // Log remote users for debugging

  const { localCameraTrack, isLoading: isLoadingCam } = useLocalCameraTrack();
  const { localMicrophoneTrack, isLoading: isLoadingMic } = useLocalMicrophoneTrack();

  // debug
  console.log("micTrack", localMicrophoneTrack, "isLoadingMic", isLoadingMic);

  usePublish([localCameraTrack, localMicrophoneTrack]);
  useJoin({
    appid: AppID,
    channel: channelName,
    token: token,
  });

  const { audioTracks } = useRemoteAudioTracks(remoteUsers);
  audioTracks.map((track) => {
    track.play();
  });

  const deviceLoading = isLoadingMic || isLoadingCam;

  console.log("cameraTrack", localCameraTrack);

  if (deviceLoading) return <div style={styles.styles.grid}>Loading devices...</div>;

  return (
    <div>
      
      <h1>Agora Video Call</h1>
      <LocalUser videoTrack={localCameraTrack} audioTrack={localMicrophoneTrack} cameraOn={true} micOn={true} playVideo={true} playAudio={true} />
      {/* <LocalVideoTrack track={localCameraTrack} play={true}  /> */}
      

      {/* {remoteUsers.map((user) => {
        console.log("Rendering remote user:", user);
        return <RemoteUser user={user} key={user.uid} />;
      })} */}


     
      
    </div>
    
  );
};

export default VideoCall;
