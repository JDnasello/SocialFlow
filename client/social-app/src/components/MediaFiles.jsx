import ImageGallery from 'react-image-gallery'
import 'react-image-gallery/styles/css/image-gallery.css'

const MediaFiles = ({ galleryItems }) => {
    return (
        <div className="post-files">
            {
                galleryItems && (
                    <ImageGallery
                        items={galleryItems}
                        showPlayButton={false}
                        showFullscreenButton={false}
                        showThumbnails={false}
                        autoPlay={false}
                        lazyLoad={true} />
                )
            }
        </div>
    )
}

export default MediaFiles
