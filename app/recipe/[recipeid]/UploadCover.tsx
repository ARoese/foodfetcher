import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
function UploadCover({ text, className = "" }) {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className="text-center">
                <FontAwesomeIcon size={"4x"} icon={faUpload} className="mb-2" />
                <p>{text}</p>
            </div>
        </div>
    );
}

export default UploadCover;