import * as tus from 'tus-js-client';
import {useState} from "react";

const VideoUploadType = {
    postVideo: 'post_video',
}

function App() {
    let [upload, setUpload] = useState(null)
    let [totalByte, setTotalByte] = useState(0)
    let [currentByte, setCurrentByte] = useState(0)
    let [currentPercent, setCurrentPercent] = useState('0')

    const fileChangedHandler = (e) => {
        const file = e.target.files[0]
        setUpload(new tus.Upload(file, {
            // Endpoint is the upload creation URL from your tus server
            endpoint: "http://localhost:3000/videos/resume",
            // @ts-ignore
            uploadLengthDeferred: false,
            retryDelays: [0, 1000, 3000, 5000],
            metadata: {
                filename: file.name,
                filetype: file.type,
                upload_type: VideoUploadType.postVideo,
                user_id: '15',
                id: '1f361443-95bb-46e9-9c41-aa654719c0b9'
            },
            headers: {
                authorization: ''
            },
            // Callback for errors which cannot be fixed using retries
            onError: function (error) {
                console.log("Failed because: " + error)
            },
            // Callback for reporting upload progress
            onProgress: function (bytesUploaded, bytesTotal) {
                const percentage = (bytesUploaded / bytesTotal * 100).toFixed(2)
                console.log(bytesUploaded, bytesTotal, percentage + "%")
                setCurrentByte(bytesUploaded)
                setTotalByte(bytesTotal)
                setCurrentPercent(percentage)
            },
            // Callback for once the upload is completed
            onSuccess: function () {
                console.log("Upload success")

            }
        }))
    }

    const pauseUpload = () => {
        if(upload) {
            console.log('pause now')
            upload.abort()
        }
    }

    const startOrResumeUpload = () => {
        if(upload) {
            upload.findPreviousUploads().then(function (previousUploads) {
                console.log('previousUploads: ', previousUploads)
                // Found previous uploads so we select the first one.
                if (previousUploads.length) {
                    upload.resumeFromPreviousUpload(previousUploads[0])
                }
                // Start the upload
                upload.start()
            })
        }    }

    return (
        <div className="App">
            <input type="file" onChange={fileChangedHandler}/>
            <button onClick={() => startOrResumeUpload()}>Start/Resume</button>
            <button onClick={() => pauseUpload()}>Pause</button>
            <br/>
            <h3>Upload status: {currentPercent}%</h3>
            <br/>
            <h3>{currentByte} of {totalByte} bytes.</h3>
        </div>
    );
}

export default App;
