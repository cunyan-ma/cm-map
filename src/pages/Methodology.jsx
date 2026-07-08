import './Methodology.css'

// Stub page — content to be filled in later. Styling lives in Methodology.css.
function Methodology() {
    return (
        <div className="method-container">
            <h1>Methodology</h1>

            <p>Locating three levels of data: mining; refining; and sales. 
                The three levels track critical mineral's material flow behind 
                AI development.
            </p>
            <br />
            <p>There is public documentation on rough country breakdown for 
                critical mineral mining and refining. For mining, mainly used 
                USGS (US Geological Survey) report. for refining, mainly used 
                report from International Energy Agency's Critical Minerals Data 
                Explorer and EU's Raw Material Information System.
            </p>
            <br />
            <p>There is no authoritative list of critical minerals that are 
                used in making a GPU. The author will compile such original 
                dataset via cross referencing literature. More TBC.
            </p>
            <br />
            <p>There is also no authoritative documentation on GPU sales, 
                though we are all familiar with the big names (Amazon, Google, 
                Microsoft, Meta, etc). More work to come too.
            </p>
        </div>
    )
}

export default Methodology
