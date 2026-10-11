
import ClipLoader from "react-spinners/ClipLoader";

const Spinner = ( {loading} ) => {
    return (
        <ClipLoader
            color="#36d7b7"
            size={50}
            loading={loading}
        />
    );
}

export default Spinner;