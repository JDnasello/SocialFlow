import { dotSpinner } from 'ldrs'

dotSpinner.register()

const Loader = () => {
    return (
        <div style={{
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <l-dot-spinner
                size="35"
                speed="0.9" 
                color="#c5c5c5d3"
            ></l-dot-spinner>
        </div>
    )
}

export default Loader
