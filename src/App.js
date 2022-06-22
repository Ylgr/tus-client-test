import * as tus from 'tus-js-client';

function App() {
    const fileChangedHandler = (e) => {
        const file = e.target.files[0]
        // Create a new tus upload
        const upload = new tus.Upload(file, {
            // Endpoint is the upload creation URL from your tus server
            endpoint: "http://localhost:3000/videos/resume",
            // Retry delays will enable tus-js-client to automatically retry on errors
            retryDelays: [0, 3000, 5000, 10000, 20000],
            // Attach additional meta data about the file for the server
            metadata: {
                filename: 'post/original/4ef51160-d053-4a96-a82e-151a64568ccf.mp4',
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
            },
            // Callback for once the upload is completed
            onSuccess: function () {
                console.log("Download %s from %s", upload.file.name, upload.url)
            }
        })

        // Check if there are any previous uploads to continue.
        upload.findPreviousUploads().then(function (previousUploads) {
            // Found previous uploads so we select the first one.
            if (previousUploads.length) {
                upload.resumeFromPreviousUpload(previousUploads[0])
            }

            // Start the upload
            upload.start()
        })
    }

    return (
        <div className="App">
            <input type="file" onChange={fileChangedHandler}/>
            <button>Pause upload</button>
        </div>
    );
}

export default App;
