import * as tus from 'tus-js-client';
import {useState} from "react";

function App() {
    let [upload, setUpload] = useState(null)
    let [totalByte, setTotalByte] = useState(0)
    let [currentByte, setCurrentByte] = useState(0)
    let [currentPercent, setCurrentPercent] = useState(0)

    const fileChangedHandler = (e) => {
        const file = e.target.files[0]
        setUpload(new tus.Upload(file, {
            // Endpoint is the upload creation URL from your tus server
            endpoint: "http://localhost:3000/videos/resume",
            // endpoint: "http://localhost:3000/tus/s3-store",
            // Retry delays will enable tus-js-client to automatically retry on errors
            retryDelays: [0, 3000, 5000, 10000, 20000],
            // Attach additional meta data about the file for the server
            metadata: {
                filename: 'post/original/4bf51160-d053-4a96-a82e-151a64568ccf.mp4',
                filetype: file.type
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
                console.log("Download %s from %s", upload.file.name, upload.url)
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
        }
    }

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
