function ContentManager() {
    // Method called back once all elements
    // have been downloaded
    var ondownloadcompleted;

    // Number of elements to download
    var NUM_ELEMENTS_TO_DOWNLOAD = 7;

    // setting the callback method
    this.SetDownloadCompleted = function (callbackMethod) {
        ondownloadcompleted = callbackMethod;
    };

    // We have 4 type of enemies, 1 hero & 2 type of tile
    this.imgMonsterA = new Image();
    this.imgTile = new Image();
    this.imgPlayer = new Image();
    this.imgTree = new Image();
    this.imgRock = new Image();
    this.imgWall = new Image();
    this.imgFireRoad = new Image();
    this.imgRoad = new Image();
    this.globalMusic = new Audio();
    this.shotSound = new Audio();
    this.hitSound = new Audio();

    // the background can be created with 3 different layers
    // those 3 layers exist in 3 versions
    this.imgBackgroundLayers = new Array();
    var numImagesLoaded = 0;

    // public method to launch the download process
    this.StartDownload = function () {
        SetDownloadParameters(this.imgPlayer, "assets/char2.png", handleImageLoad, handleImageError);
        SetDownloadParameters(this.imgTree, "assets/tree.png", handleImageLoad, handleImageError);
        SetDownloadParameters(this.imgMonsterA, "assets/dragon.png", handleImageLoad, handleImageError);
        SetDownloadParameters(this.imgRock, "assets/rock.png", handleImageLoad, handleImageError);
        SetDownloadParameters(this.imgWall, "assets/wall.png", handleImageLoad, handleImageError);
        SetDownloadParameters(this.imgFireRoad, "assets/fireRoad.png", handleImageLoad, handleImageError);
        SetDownloadParameters(this.imgRoad, "assets/road.png", handleImageLoad, handleImageError);
        //	SetDownloadParameters(this.globalMusic, "assets/Music.mp3", handleImageLoad, handleImageError);
        SetDownloadParameters(this.shotSound, "assets/shot.mp3", handleImageLoad, handleImageError);
        SetDownloadParameters(this.hitSound, "assets/hit.mp3", handleImageLoad, handleImageError);

        // download the 3 layers * 3 versions
    }

    function SetDownloadParameters(imgElement, url, loadedHandler, errorHandler) {
        imgElement.src = url;
        imgElement.onload = loadedHandler;
        imgElement.onerror = errorHandler;
    }

    // our global handler 
    function handleImageLoad(e) {
        numImagesLoaded++

        // If all elements have been downloaded
        if (numImagesLoaded == NUM_ELEMENTS_TO_DOWNLOAD) {
            numImagesLoaded = 0;
            // we're calling back the method set by SetDownloadCompleted
            ondownloadcompleted();
        }
    }

    //called if there is an error loading the image (usually due to a 404)
    function handleImageError(e) {
        console.log("Error Loading Image : " + e.target.src);
    }
}